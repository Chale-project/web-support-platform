<template>
  <div style="background:#fff ;padding:25px;position: relative">
    <div class="table-page-search-wrapper">
      <a-form layout="inline">
        <a-row :gutter="48">

          <a-col :md="8" :sm="24">
            <a-form-item label="渠道名称">
              <a-input v-model="queryParam.upstreamChannelName" placeholder="请填写渠道名称" />
            </a-form-item>
          </a-col>
          <!-- <a-col :md="8" :sm="24">
            <a-form-item label="渠道代码">
              <a-input v-model="queryParam.upstreamChannelCode" placeholder="请填写渠道代码" />
            </a-form-item>
          </a-col>
          <a-col :md="8" :sm="24">
            <a-form-item label="状态">
              <a-select placeholder="请选择" v-model="queryParam.upstreamChannelStatus">
                <a-select-option value="">全部</a-select-option>
                <a-select-option value="enabled">启用</a-select-option>
                <a-select-option value="disabled">禁用</a-select-option>
              </a-select>
            </a-form-item>
          </a-col> -->
          <!-- <template v-if="advanced">
            <a-col :md="8" :sm="24">
              <a-form-item label="签名自定义">
                <a-select placeholder="请选择" v-model="queryParam.supportCustomSign">
                  <a-select-option value="">全部</a-select-option>
                  <a-select-option value="support">支持</a-select-option>
                  <a-select-option value="not_support">不支持</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :md="8" :sm="24">
              <a-form-item label="余量查询">
                <a-select placeholder="请选择" v-model="queryParam.supportQueryBalance">
                  <a-select-option value="">全部</a-select-option>
                  <a-select-option value="support">支持</a-select-option>
                  <a-select-option value="not_support">不支持</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
          </template> -->

          <a-col :md="!advanced && 8 || 24" :sm="24">
            <span class="table-page-search-submitButtons" :style="advanced && { float: 'right', overflow: 'hidden' } || {} ">
              <a-button type="primary" @click="querySmsChannel">查询</a-button>
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
      <a-button type="primary" icon="plus" @click="modifySmsChannel('add')">新建</a-button>
      <a-button type="primary" icon="edit" @click="modifySmsChannel('edit')">编辑</a-button>
      <a-button type="primary" icon="delete" @click="modifySmsChannel('delete')">删除</a-button>
    </div>

    <!--表格-->
    <a-table size="middle" :columns="columns" :dataSource="loadDatas" :loading="loading" :pagination="pagination" :rowSelection="{type:'radio', selectedRowKeys: selectedRowKeys, onChange: updateSelect }">

      <span slot="supportCustomSign" slot-scope="record">
        <a-tag v-if="record=='support'" color="#87d068">支持</a-tag>
        <a-tag v-else-if="record=='not_support'" color="#ff0000">不支持</a-tag>
      </span>
      <span slot="supportQueryBalance" slot-scope="record">
        <a-tag v-if="record=='support'" color="#87d068">支持</a-tag>
        <a-tag v-else-if="record=='not_support'" color="#ff0000">不支持</a-tag>
      </span>
      <span slot="upstreamChannelStatus" slot-scope="record">
        <a-tag v-if="record=='enabled'" color="#87d068">启用</a-tag>
        <a-tag v-else-if="record=='disabled'" color="#ff0000">禁用</a-tag>
      </span>
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
              <a-form-item label="渠道名称" :required="true">
                <a-input v-model="froms.upstreamChannelName" placeholder="请填写渠道名称" />
              </a-form-item>
            </a-col>
            <a-col :md="12" :sm="24">
              <a-form-item label="渠道代码" :required="true">
                <a-input v-model="froms.upstreamChannelCode" placeholder="请填写渠道代码（以字母及'_'链接）" />
              </a-form-item>
            </a-col>
            <a-col :md="12" :sm="24">
              <a-form-item label="签名类型" :required="true">
                <a-input v-model="froms.supportSignType" placeholder="请填写签名类型" />
              </a-form-item>
            </a-col>

            <a-col :md="12" :sm="24" :required="true">
              <a-form-item label="签名自定义">
                <a-select v-model="froms.supportCustomSign" placeholder="请选择">
                  <a-select-option value="support">支持</a-select-option>
                  <a-select-option value="not_support">不支持</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :md="12" :sm="24" :required="true">
              <a-form-item label="余量查询">
                <a-select v-model="froms.supportQueryBalance" placeholder="请选择">
                  <a-select-option value="support">支持</a-select-option>
                  <a-select-option value="not_support">不支持</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>

            <a-col :md="12" :sm="24">
              <a-form-item label="余量最小预警" :required="true">
                <a-input v-model="froms.balanceAlarmMin" type="number" placeholder="请填写余量最小预警数值" />
              </a-form-item>
            </a-col>
            <a-col :md="12" :sm="24">
              <a-form-item label="余量接收预警" :required="true">
                <a-input v-model="froms.balanceAlarmReceiver" type="number" placeholder="请填写余量接收预警数值" />
              </a-form-item>
            </a-col>

            <a-col :md="12" :sm="24">
              <a-form-item label="排序" :required="true">
                <a-input v-model="froms.sortNo" type="number" placeholder="请填写排序数值" />
              </a-form-item>
            </a-col>

            <a-col :md="12" :sm="24" v-show="editType=='edit'">
              <a-form-item label="状态">
                <a-select v-model="froms.upstreamChannelStatus" placeholder="请选择">
                  <a-select-option value="enabled">启用</a-select-option>
                  <a-select-option value="disabled">禁用</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :md="12" :sm="24">
              <a-form-item label="备注">
                <a-input v-model="froms.upstreamChannelRemark" placeholder="请填写备注" />
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
    title: "渠道名称",
    width: "10%",
    dataIndex: "upstreamChannelName",
    align: "center"
  },
  {
    title: "渠道代码",
    width: "10%",
    dataIndex: "upstreamChannelCode",
    align: "center"
  },
  {
    title: "签名类型",
    width: "10%",
    dataIndex: "supportSignType",
    align: "center"
  },
  {
    title: "签名自定义",
    width: "10%",
    dataIndex: "supportCustomSign",
    align: "center",
    scopedSlots: { customRender: "supportCustomSign" }
  },
  {
    title: "余量查询",
    width: "10%",
    dataIndex: "supportQueryBalance",
    align: "center",
    scopedSlots: { customRender: "supportQueryBalance" }
  },
  {
    title: "余量最小预警",
    width: "10%",
    dataIndex: "balanceAlarmMin",
    align: "center"
  },
  {
    title: "余量接收预警",
    width: "10%",
    dataIndex: "balanceAlarmReceiver",
    align: "center"
  },
  {
    title: "排序",
    width: "10%",
    dataIndex: "sortNo",
    align: "center"
  },
  {
    title: "状态",
    width: "10%",
    dataIndex: "upstreamChannelStatus",
    align: "center",
    scopedSlots: { customRender: "upstreamChannelStatus" }
  },
  {
    title: "备注",
    width: "10%",
    dataIndex: "upstreamChannelRemark",
    align: "center"
  }
];

export default {
  name: "smsChannelManagement",
  components: {
    Pagination
  },
  data() {
    return {
      advanced: false, // 高级搜索 展开/关闭
      queryParam: {
        upstreamChannelName: null,
        // upstreamChannelCode: null,
        // upstreamChannelStatus: "",
        // supportCustomSign: "",
        // supportQueryBalance: ""
      }, //搜索查询参数

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
      editType: "add",
      modalTitle: "新建",
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
    querySmsChannel() {
      this.getSmsChannelList();
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
        this.deleteSmsChannel();
      } else {
        const flag = this.checkData();
        flag && this.addOrEditSmsChannel();
      }
    },

    //操作参数
    modifySmsChannel(e) {
      this.editType = e;
      if (this.editType == "add") {
        this.modalTitle = "新建";
        this.visible = !0;
        this.froms = {
          upstreamChannelName: null,
          upstreamChannelCode: null,
          supportSignType: null,
          supportCustomSign: "support",
          supportQueryBalance: "support",
          balanceAlarmMin: null,
          balanceAlarmReceiver: null,
          sortNo: null,
          upstreamChannelStatus: "default",
          upstreamChannelRemark: null
        };
      } else if (this.editType == "edit") {
        if (this.selectedRows.length < 1) {
          this.$message.warning("请选择编辑项！");
          return false;
        } else {
          this.modalTitle = "编辑";
          this.getSmsChannelInfo();
        }
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

    //数据校验
    checkData() {
      let flag = !0;
      let reg = /^\w+$/;

      if (!this.froms.upstreamChannelName) {
        flag = !1;
        this.$message.warning("请填写渠道名称！");
        return false;
      } else if (!reg.test(this.froms.upstreamChannelCode)) {
        flag = !1;
        this.$message.warning("请填写有效的渠道代码！");
        return false;
      } else if (!this.froms.supportSignType) {
        flag = !1;
        this.$message.warning("请填写签名类型！");
        return false;
      } else if (!this.froms.balanceAlarmMin) {
        flag = !1;
        this.$message.warning("请填写余量最小预警值！");
        return false;
      } else if (!this.froms.balanceAlarmReceiver) {
        flag = !1;
        this.$message.warning("请填写余量接收预警值！");
        return false;
      } else {
        return flag;
      }
    },

    //添加参数
    addOrEditSmsChannel() {
      let _type = this.editType;
      let data = this.froms;
      this.axios({
        url:
          _type == "add"
            ? "basic/sms/upstreamChannel/add"
            : "basic/sms/upstreamChannel/modify",
        method: _type == "add" ? METHOD_POST : METHOD_PUT,
        data: data
      })
        .then(res => {
          if (res.code == 0) {
            this.visible = !1;
            this.$message.success("操作成功！");
            this.getSmsChannelList();
          } else {
            this.$message.error(res.msg);
          }
        })
        .catch(err => {
          console.log(err);
        });
    },

    //删除参数
    deleteSmsChannel() {
      let _id = this.selectedRows[0].id;
      this.axios({
        url: "basic/sms/upstreamChannel/remove/" + _id,
        method: METHOD_DELETE
      })
        .then(res => {
          if (res.code == 0) {
            this.visible = !1;
            this.$message.success("删除成功！");
            this.getSmsChannelList();
          } else {
            this.$message.error(res.msg);
          }
        })
        .catch(err => {
          console.log(err);
        });
    },

    // 获取参数数据列表
    getSmsChannelList() {
      this.initSelectedRows();
      let _data = {
        pageSize: this.pageSize,
        currentPage: this.currentPage,
        where: this.queryParam
      };
      this.axios({
        url: "basic/sms/upstreamChannel/pageList",
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
    getSmsChannelInfo(id) {
      let _id = null;
      if (id) _id = id;
      else _id = this.selectedRows[0].id;

      this.axios({
        url: "basic/sms/upstreamChannel/info/" + _id,
        method: METHOD_GET
      })
        .then(res => {
          if (res.code == 0) {
            this.visible = !0;
            this.froms = res.upstreamChannel;
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
      this.getSmsChannelList();
    }
  },
  created() {
    //列表数据请求
    this.getSmsChannelList();
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
