<template>
  <div style="background:#fff ;padding:25px;position: relative">
    <div class="table-page-search-wrapper">
      <a-form layout="inline">
        <a-row :gutter="48">

          <a-col :md="8" :sm="24">
            <a-form-item label="手机号码">
              <a-input v-model="queryParam.receiverMobilePhone" placeholder="请填写手机号码" />
            </a-form-item>
          </a-col>
          <!-- <a-col :md="8" :sm="24">
            <a-form-item label="短信类型">
              <a-input v-model="queryParam.smsType" placeholder="请填写短信类型" />
            </a-form-item>
          </a-col>
          <a-col :md="8" :sm="24">
            <a-form-item label="签名类型">
              <a-input v-model="queryParam.smsSignType" placeholder="请填写签名类型" />
            </a-form-item>
          </a-col> -->
          <!-- <template v-if="advanced">
            <a-col :md="8" :sm="24">
              <a-form-item label="上游渠道">
                <a-input v-model="queryParam.upstreamChannelName" placeholder="请填写上游渠道" />
              </a-form-item>
            </a-col>
            <a-col :md="8" :sm="24">
              <a-form-item label="发送状态">
                <a-select placeholder="请选择" v-model="queryParam.smsSendStatus">
                  <a-select-option value="">全部</a-select-option>
                  <a-select-option value="OK">成功</a-select-option>
                  <a-select-option value="failed">失败</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
          </template> -->

          <a-col :md="!advanced && 8 || 24" :sm="24">
            <span class="table-page-search-submitButtons" :style="advanced && { float: 'right', overflow: 'hidden' } || {} ">
              <a-button type="primary" @click="querySmsSendRecord">查询</a-button>
              <a-button style="margin-left: 8px" @click="resetQueryParam">重置</a-button>
              <!-- <a @click="toggleAdvanced" style="margin-left: 8px">
                {{ advanced ? '收起' : '展开' }}
                <a-icon :type="advanced ? 'up' : 'down'" />
              </a> -->
            </span>
          </a-col>
        </a-row>
      </a-form>
    </div>

    <!--功能按钮-->
    <div class="table-operator">
      <a-button type="primary" icon="delete" @click="modifySmsSendRecord('delete')">删除</a-button>
    </div>

    <!--表格-->
    <a-table size="middle" :columns="columns" :dataSource="loadDatas" :loading="loading" :pagination="pagination" :rowSelection="{type:'checkbox', selectedRowKeys: selectedRowKeys, onChange: updateSelect }">

      <span slot="smsSendStatus" slot-scope="record">
        <a-tag v-if="record=='OK'" color="#87d068">成功</a-tag>
        <a-tag v-else color="#ff0000">失败</a-tag>
      </span>
      <span slot="upstreamSendStatus" slot-scope="record">
        <a-tag v-if="record=='OK'" color="#87d068">成功</a-tag>
        <a-tag v-else color="#ff0000">失败</a-tag>
      </span>

      <template slot="Action" slot-scope="text,record">
        <span>
          <a href="javascript:;" @click="modifySmsSendRecord('detail', record)">详情</a>
        </span>
      </template>
    </a-table>
    <!--分页-->
    <Pagination :current="currentPage" :pageSizeOptions="pageSizeOptions" :pageSize="pageSize" :total="totalCount" :totalPage="totalPage" @change="changePage"></Pagination>

    <!-- 新建编辑模态框 -->
    <a-modal :width="editType=='delete'?'400px':'800px'" :title="modalTitle" :visible="visible" @ok="handleOk" :confirmLoading="confirmLoading" @cancel="handleCancel">
      <p v-if="editType=='delete'">确认删除此项？</p>
      <div class="modal-container" v-else>
        <a-form>
          <a-row :gutter="24">
            <a-col :md="12" :sm="24">
              <a-form-item label="手机号码">
                <a-input v-model="froms.receiverMobilePhone" disabled />
              </a-form-item>
            </a-col>
            <a-col :md="12" :sm="24">
              <a-form-item label="短信类型">
                <a-input v-model="froms.smsType" disabled />
              </a-form-item>
            </a-col>
            <a-col :md="12" :sm="24">
              <a-form-item label="签名类型">
                <a-input v-model="froms.smsSignType" disabled />
              </a-form-item>
            </a-col>
            <a-col :md="12" :sm="24">
              <a-form-item label="发送状态">
                <a-select v-model="froms.smsSendStatus" disabled>
                  <a-select-option value="OK">成功</a-select-option>
                  <a-select-option value="failed">失败</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :md="12" :sm="24">
              <a-form-item label="上游渠道">
                <a-input v-model="froms.upstreamChannelName" disabled />
              </a-form-item>
            </a-col>
            <a-col :md="12" :sm="24">
              <a-form-item label="上游状态">
                <a-select v-model="froms.upstreamChannelStatus" disabled>
                  <a-select-option value="OK">成功</a-select-option>
                  <a-select-option value="failed">失败</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :md="12" :sm="24">
              <a-form-item label="网关状态">
                <a-input v-model="froms.gatewaySendStatus" disabled />
              </a-form-item>
            </a-col>
            <a-col :md="12" :sm="24">
              <a-form-item label="短信内容">
                <a-textarea v-model="froms.smsContent" disabled />
              </a-form-item>
            </a-col>
            <a-col :md="12" :sm="24">
              <a-form-item label="短信备注">
                <a-input v-model="froms.smsRemark" disabled />
              </a-form-item>
            </a-col>
            <a-col :md="12" :sm="24">
              <a-form-item label="上游备注">
                <a-input v-model="froms.upstreamSendRemark" disabled />
              </a-form-item>
            </a-col>
            <a-col :md="12" :sm="24">
              <a-form-item label="网关备注">
                <a-input v-model="froms.gatewaySendRemark" disabled />
              </a-form-item>
            </a-col>
          </a-row>
        </a-form>
      </div>
    </a-modal>
  </div>
</template>

<script>
import Pagination from "@/components/pagination/pagination";
import {
  BASEURL,
  METHOD_GET,
  METHOD_POST,
  METHOD_DELETE,
  METHOD_PUT
} from "@/api/public";

const columns = [
  {
    title: "手机号码",
    width: "14%",
    dataIndex: "receiverMobilePhone",
    align: "center"
  },
  {
    title: "短信类型",
    width: "14%",
    dataIndex: "smsType",
    align: "center"
  },
  {
    title: "签名类型",
    width: "8%",
    dataIndex: "smsSignType",
    align: "center"
  },
  {
    title: "发送状态",
    width: "8%",
    dataIndex: "smsSendStatus",
    align: "center",
    scopedSlots: { customRender: "smsSendStatus" }
  },
  {
    title: "上游渠道",
    width: "8%",
    dataIndex: "upstreamChannelName",
    align: "center"
  },
  {
    title: "上游状态",
    width: "8%",
    dataIndex: "upstreamSendStatus",
    align: "center",
    scopedSlots: { customRender: "upstreamSendStatus" }
  },
  {
    title: "短信内容",
    width: "15%",
    dataIndex: "smsContent",
    align: "center"
  },
  {
    title: "发送时间",
    width: "15%",
    dataIndex: "addDataTime",
    align: "center"
  },
  {
    title: "操作",
    width: "10%",
    dataIndex: "Action",
    align: "center",
    scopedSlots: { customRender: "Action" }
  }
];

export default {
  name: "smsSendRecordManagement",
  components: {
    Pagination
  },
  data() {
    return {
      advanced: false, // 高级搜索 展开/关闭
      queryParam: {
        receiverMobilePhone: null
        // smsType: null,
        // smsSignType: null,
        // upstreamChannelName: null,
        // smsSendStatus: ""
      }, //搜索查询参数记录

      columns, //表头
      loadDatas: [], //表格请求的数据
      pagination: false, //不显示分页

      //分页
      pageSizeOptions: ["10", "20", "50", "100"],
      currentPage: 1, //当前的页数
      pageSize: 10, //每页显示的条数
      totalPage: 0, //总页数
      totalCount: 0, //总条数
      loading: true,

      selectedRowKeys: [], //选中行键
      selectedRows: [], //选中行键值,

      froms: {},
      editType: "detail",
      modalTitle: "详情",
      visible: !1,
      confirmLoading: !1
    };
  },

  methods: {
    initSelectedRows() {
      this.selectedRowKeys = [];
      this.selectedRows = [];
    },

    //高级搜索 展开/收起
    toggleAdvanced() {
      this.advanced = !this.advanced;
    },

    //查询
    querySmsSendRecord() {
      this.getSmsSendRecordList();
    },

    //重置
    resetQueryParam() {
      this.queryParam.upstreamChannelName = null;
      this.queryParam.upstreamChannelCode = null;
      this.queryParam.supportCustomSign = "";
      this.queryParam.supportQueryBalance = "";
      this.queryParam.upstreamChannelStatus = "";
    },

    //选择跟新table中的某项
    updateSelect(selectedRowKeys, selectedRows) {
      this.selectedRowKeys = selectedRowKeys;
      this.selectedRows = selectedRows;
    },

    //取消
    handleCancel() {
      this.visible = !1;
    },

    //确认
    handleOk() {
      let _type = this.editType;
      if (_type == "delete") {
        this.deleteSmsSendRecord();
      } else {
        this.handleCancel();
      }
    },

    //操作短信记录
    modifySmsSendRecord(e, o) {
      this.editType = e;
      if (this.editType == "detail") {
        this.modalTitle = "详情";
        this.getSmsSendRecordInfo(o.id);
      } else if (this.editType == "delete") {
        if (this.selectedRows.length < 1) {
          this.$message.warning("请选择删除项！");
          return false;
        } else {
          this.modalTitle = "删除";
          this.visible = !0;
        }
      }
    },

    //删除短信记录
    deleteSmsSendRecord() {
      let _id = this.selectedRows[0].id;
      let _idsArr = this.selectedRows.map(item => {
        return item.id;
      });
      this.axios({
        url: "basic/sms/sendLog/remove/" + _idsArr,
        method: METHOD_DELETE
      })
        .then(res => {
          if (res.code == 0) {
            this.visible = !1;
            this.$message.success("删除成功！");
            this.getSmsSendRecordList();
          } else {
            this.$message.error(res.msg);
          }
        })
        .catch(err => {
          console.log(err);
        });
    },

    // 获取短信记录数据列表
    getSmsSendRecordList() {
      this.initSelectedRows();
      let _data = {
        pageSize: this.pageSize,
        currentPage: this.currentPage,
        where: this.queryParam
      };
      this.axios({
        url: "basic/sms/sendLog/pageList",
        method: METHOD_POST,
        data: _data
      })
        .then(res => {
          this.loading = !1;
          if (res.code == 0) {
            this.currentPage = res.page.currentPage;
            this.pageSize = res.page.pageSize;
            this.totalPage = res.page.totalPage;
            this.totalCount = res.page.totalCount;
            if (res.page.list.length > 0) {
              this.loadDatas = res.page.list;
            } else {
              this.loadDatas = [];
            }
          } else {
            this.$message.error(res.msg);
          }
        })
        .catch(err => {
          console.log(err);
        });
    },

    //获取角色信息
    getSmsSendRecordInfo(id) {
      let _id = null;
      if (id) _id = id;
      else _id = this.selectedRows[0].id;

      this.axios({
        url: "basic/sms/sendLog/info/" + _id,
        method: METHOD_GET
      })
        .then(res => {
          if (res.code == 0) {
            this.visible = !0;
            this.froms = res.sendLog;
          } else {
            this.$message.error(res.msg);
          }
        })
        .catch(err => {
          console.log(err);
        });
    },

    //分页
    changePage(obj) {
      this.currentPage = obj.currentPage;
      this.pageSize = obj.pageSize;
      this.getSmsSendRecordList();
    }
  },
  created() {
    //列表数据请求
    this.getSmsSendRecordList();
  }
};
</script>

<style scoped>
.table-operator {
  margin-bottom: 10px;
}
.ant-pagination {
  margin-top: 20px;
  text-align: center;
}
</style>
