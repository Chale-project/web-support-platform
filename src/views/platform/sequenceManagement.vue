<template>
  <div style="background:#fff ;padding:25px;position: relative">
    <div class="table-page-search-wrapper">
      <a-form layout="inline">
        <a-row :gutter="48">
          <a-col :md="8" :sm="24">
            <a-form-item label="序列码">
              <a-input v-model="queryParam.sequenceCode" placeholder="请填写序列码" />
            </a-form-item>
          </a-col>
          <a-col :md="8" :sm="24">
            <a-form-item label="重置类型">
              <a-select placeholder="请选择" v-model="queryParam.resetType">
                <a-select-option value="">全部</a-select-option>
                <a-select-option value="default">默认</a-select-option>
                <a-select-option value="month">月重置</a-select-option>
                <a-select-option value="day">日重置</a-select-option>
                <a-select-option value="hour">时重置</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :md="8" :sm="24">
            <span class="table-page-search-submitButtons" style="float:'right'">
              <a-button type="primary" @click="querySequence">查询</a-button>
              <a-button style="margin-left: 8px" @click="resetQueryParam">重置</a-button>
            </span>
          </a-col>
        </a-row>
      </a-form>
    </div>

    <!--功能按钮-->
    <div class="table-operator">
      <a-button type="primary" icon="plus" @click="modifySequence('add')">新建</a-button>
      <a-button type="primary" icon="edit" @click="modifySequence('edit')">编辑</a-button>
      <a-button type="primary" icon="delete" @click="modifySequence('delete')">删除</a-button>
      <a-button type="primary" icon="setting" @click="modifySequence('reset')">重置值</a-button>
    </div>

    <!--表格-->
    <a-table size="middle" :columns="columns" :dataSource="loadDatas" :loading="loading" :pagination="pagination" :rowSelection="{type:'radio', selectedRowKeys: selectedRowKeys, onChange: updateSelect }">

      <span slot="resetType" slot-scope="record">
        <a-tag v-if="record=='default'" color="#87d068">默认</a-tag>
        <a-tag v-else-if="record=='month'" color="#ff0000">月重置</a-tag>
        <a-tag v-else-if="record=='day'" color="#ff976a">日重置</a-tag>
        <a-tag v-else-if="record=='hour'" color="#ff976a">时重置</a-tag>
      </span>
    </a-table>
    <!--分页-->
    <Pagination :current="currentPage" :pageSizeOptions="pageSizeOptions" :pageSize="pageSize" :total="totalCount" :totalPage="totalPage" @change="changePage"></Pagination>

    <!-- 新建编辑模态框 -->
    <a-modal :width="editType=='delete'?'400px':editType=='reset'?'400px':'800px'" :title="modalTitle" :visible="visible" @ok="handleOk" :confirmLoading="confirmLoading" @cancel="handleCancel">
      <p v-if="editType=='delete'">确认删除此序列？</p>
      <p v-else-if="editType=='reset'">确认重置此序列？</p>
      <div class="modal-container" v-else>
        <a-form>
          <a-row :gutter="24">
            <a-col :md="12" :sm="24">
              <a-form-item label="序列名" :required="true">
                <a-input v-model="froms.sequenceName" placeholder="请填写序列名" />
              </a-form-item>
            </a-col>

            <a-col :md="12" :sm="24">
              <a-form-item label="序列码" :required="true">
                <a-input v-model="froms.sequenceCode" placeholder="请填写序列码（以字母及'_'链接）" />
              </a-form-item>
            </a-col>
            <a-col :md="12" :sm="24">
              <a-form-item label="序列值" :required="true">
                <a-input v-model="froms.sequenceValue" type="number" placeholder="请填写序列值（只能为数字）" />
              </a-form-item>
            </a-col>
            <a-col :md="12" :sm="24">
              <a-form-item label="流水号头" :required="true">
                <a-input v-model="froms.serialNumberHead" placeholder="请填写流水号头（如：A、B、C）" />
              </a-form-item>
            </a-col>
            <a-col :md="12" :sm="24">
              <a-form-item label="流水号长度" :required="true">
                <a-input v-model="froms.serialNumberLength" type="number" placeholder="请填写流水号长度" />
              </a-form-item>
            </a-col>
            <a-col :md="12" :sm="24">
              <a-form-item label="重置类型">
                <a-select v-model="froms.resetType" placeholder="请选择">
                  <a-select-option value="default">默认</a-select-option>
                  <a-select-option value="month">月重置</a-select-option>
                  <a-select-option value="day">日重置</a-select-option>
                  <a-select-option value="hour">时重置</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :md="12" :sm="24">
              <a-form-item label="备注">
                <a-input v-model="froms.sequenceRemark" placeholder="请填写备注" />
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
    title: "序列名",
    width: "15%",
    dataIndex: "sequenceName",
    align: "center"
  },
  {
    title: "序列码",
    width: "15%",
    dataIndex: "sequenceCode",
    align: "center"
  },
  {
    title: "序列值",
    width: "15%",
    dataIndex: "sequenceValue",
    align: "center"
  },
  {
    title: "流水号头",
    width: "10%",
    dataIndex: "serialNumberHead",
    align: "center"
  },
  {
    title: "流水号长度",
    width: "10%",
    dataIndex: "serialNumberLength",
    align: "center"
  },
  {
    title: "重置类型",
    width: "15%",
    dataIndex: "resetType",
    align: "center",
    scopedSlots: { customRender: "resetType" }
  },
  {
    title: "创建时间",
    width: "20%",
    dataIndex: "addDataTime",
    align: "center"
  }
];

export default {
  name: "sequenceManagement",
  components: {
    Pagination
  },
  data() {
    return {
      queryParam: {
        sequenceCode: null,
        resetType: ""
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

    //查询
    querySequence() {
      this.getSequenceList();
    },

    //重置
    resetQueryParam() {
      this.queryParam.sequenceCode = null;
      this.queryParam.resetType = "";
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
        this.deleteSequence();
      } else if (_type == "reset") {
        this.resetSequence();
      } else {
        const flag = this.checkData();
        flag && this.addOrEditSequence();
      }
    },

    //操作序列
    modifySequence(e) {
      this.editType = e;
      if (this.editType == "add") {
        this.modalTitle = "新建";
        this.visible = !0;
        this.froms = {
          sequenceName: null,
          sequenceCode: null,
          sequenceValue: null,
          serialNumberHead: null,
          serialNumberLength: null,
          sequenceRemark: null,
          resetType: "default"
        };
      } else if (this.editType == "edit") {
        if (this.selectedRows.length < 1) {
          this.$message.warning("请选择编辑项！");
          return false;
        } else {
          this.modalTitle = "编辑";
          this.getSequenceInfo();
        }
      } else if (this.editType == "delete") {
        if (this.selectedRows.length < 1) {
          this.$message.warning("请选择删除项！");
          return false;
        } else {
          this.modalTitle = "删除";
          this.visible = !0;
        }
      } else if (this.editType == "reset") {
        if (this.selectedRows.length < 1) {
          this.$message.warning("请选择重置项！");
          return false;
        } else {
          this.modalTitle = "重置";
          this.visible = !0;
        }
      }
    },

    //数据校验
    checkData() {
      let flag = !0;
      let reg = /^[A-Z]+$/;
      let regN = /^\d+$/;

      if (!this.froms.sequenceName) {
        flag = !1;
        this.$message.warning("请填写序列名！");
        return false;
      } else if (!this.froms.sequenceCode) {
        flag = !1;
        this.$message.warning("请填写序列码！");
        return false;
      } else if (!regN.test(this.froms.sequenceValue)) {
        flag = !1;
        this.$message.warning("请填写数字序列值！");
        return false;
      } else if (!reg.test(this.froms.serialNumberHead)) {
        flag = !1;
        this.$message.warning("请填写流水号头需大写字母！");
        return false;
      } else if (!this.froms.serialNumberLength) {
        flag = !1;
        this.$message.warning("请填写流水号长度！");
        return false;
      } else {
        return flag;
      }
    },

    //添加序列
    addOrEditSequence() {
      let _type = this.editType;
      let data = this.froms;
      this.axios({
        url: _type == "add" ? "basic/sequence/add" : "basic/sequence/modify",
        method: _type == "add" ? METHOD_POST : METHOD_PUT,
        data: data
      })
        .then(res => {
          if (res.code == 0) {
            this.visible = !1;
            this.$message.success("操作成功！");
            this.getSequenceList();
          } else {
            this.$message.error(res.msg);
          }
        })
        .catch(err => {
          console.log(err);
        });
    },

    //删除序列
    deleteSequence() {
      let _id = this.selectedRows[0].id;
      this.axios({
        url: "basic/sequence/remove/" + _id,
        method: METHOD_DELETE
      })
        .then(res => {
          if (res.code == 0) {
            this.visible = !1;
            this.$message.success("删除成功！");
            this.getSequenceList();
          } else {
            this.$message.error(res.msg);
          }
        })
        .catch(err => {
          console.log(err);
        });
    },

    //重置序列
    resetSequence() {
      let _id = this.selectedRows[0].id;
      this.axios({
        url: "basic/sequence/reset/" + _id,
        method: METHOD_PUT
      })
        .then(res => {
          if (res.code == 0) {
            this.visible = !1;
            this.$message.success("序列已重置！");
            this.getSequenceList();
          } else {
            this.$message.error(res.msg);
          }
        })
        .catch(err => {
          console.log(err);
        });
    },

    // 获取序列数据列表
    getSequenceList() {
      this.initSelectedRows();
      let _data = {
        pageSize: this.pageSize,
        currentPage: this.currentPage,
        where: this.queryParam
      };
      this.axios({
        url: "basic/sequence/pageList",
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
    getSequenceInfo(id) {
      let _id = null;
      if (id) _id = id;
      else _id = this.selectedRows[0].id;

      this.axios({
        url: "basic/sequence/info/" + _id,
        method: METHOD_GET
      })
        .then(res => {
          if (res.code == 0) {
            this.visible = !0;
            this.froms = res.sequence;
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
      this.getSequenceList();
    }
  },
  created() {
    //列表数据请求
    this.getSequenceList();
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
