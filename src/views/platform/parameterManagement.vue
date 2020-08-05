<template>
  <div style="background:#fff ;padding:25px;position: relative">
    <div class="table-page-search-wrapper">
      <a-form layout="inline">
        <a-row :gutter="48">
          <a-col :md="8" :sm="24">
            <a-form-item label="参数键">
              <a-input v-model="queryParam.configKey" placeholder="请填写参数键" />
            </a-form-item>
          </a-col>
          <a-col :md="8" :sm="24">
            <a-form-item label="状态">
              <a-select placeholder="请选择" v-model="queryParam.resetType">
                <a-select-option value="">全部</a-select-option>
                <a-select-option value="enabled">启用</a-select-option>
                <a-select-option value="disabled">禁用</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :md="8" :sm="24">
            <span class="table-page-search-submitButtons" style="float:'right'">
              <a-button type="primary" @click="queryParameter">查询</a-button>
              <a-button style="margin-left: 8px" @click="resetQueryParam">重置</a-button>
            </span>
          </a-col>
        </a-row>
      </a-form>
    </div>

    <!--功能按钮-->
    <div class="table-operator">
      <a-button type="primary" icon="plus" @click="modifyParameter('add')">新建</a-button>
      <a-button type="primary" icon="edit" @click="modifyParameter('edit')">编辑</a-button>
      <a-button type="primary" icon="delete" @click="modifyParameter('delete')">删除</a-button>
    </div>

    <!--表格-->
    <a-table size="middle" :columns="columns" :dataSource="loadDatas" :loading="loading" :pagination="pagination" :rowSelection="{type:'radio', selectedRowKeys: selectedRowKeys, onChange: updateSelect }">

      <span slot="configStatus" slot-scope="record">
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
              <a-form-item label="参数键" :required="true">
                <a-input v-model="froms.configKey" placeholder="请填写参数键（以字母及'_'链接）" />
              </a-form-item>
            </a-col>

            <a-col :md="12" :sm="24">
              <a-form-item label="参数值" :required="true">
                <a-input v-model="froms.configValue" placeholder="请填写参数值" />
              </a-form-item>
            </a-col>
            <a-col :md="12" :sm="24">
              <a-form-item label="参数格式" :required="true">
                <a-input v-model="froms.configFormat" placeholder="请填写参数格式（如：“string”或“json_object”）" />
              </a-form-item>
            </a-col>

            <a-col :md="12" :sm="24" v-show="editType=='edit'">
              <a-form-item label="状态">
                <a-select v-model="froms.configStatus" placeholder="请选择">
                  <a-select-option value="enabled">启用</a-select-option>
                  <a-select-option value="disabled">禁用</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :md="12" :sm="24">
              <a-form-item label="备注">
                <a-input v-model="froms.configRemark" placeholder="请填写备注" />
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
    title: "参数键",
    width: "20%",
    dataIndex: "configKey",
    align: "center"
  },
  {
    title: "参数值",
    width: "30%",
    dataIndex: "configValue",
    align: "center"
  },
  {
    title: "参数格式",
    width: "15%",
    dataIndex: "configFormat",
    align: "center"
  },
  {
    title: "状态",
    width: "15%",
    dataIndex: "configStatus",
    align: "center",
    scopedSlots: { customRender: "configStatus" }
  },
  {
    title: "备注",
    width: "20%",
    dataIndex: "configRemark",
    align: "center"
  }
];

export default {
  name: "parameterManagement",
  components: {
    Pagination
  },
  data() {
    return {
      queryParam: {
        configKey: null,
        configStatus: ""
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
    queryParameter() {
      this.getParameterList();
    },

    //重置
    resetQueryParam() {
      this.queryParam.configKey = null;
      this.queryParam.configStatus = "";
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
        this.deleteParameter();
      } else {
        const flag = this.checkData();
        flag && this.addOrEditParameter();
      }
    },

    //操作参数
    modifyParameter(e) {
      this.editType = e;
      if (this.editType == "add") {
        this.modalTitle = "新建";
        this.visible = !0;
        this.froms = {
          configKey: null,
          configValue: null,
          configFormat: null,
          configRemark: null,
          configStatus: "enabled"
        };
      } else if (this.editType == "edit") {
        if (this.selectedRows.length < 1) {
          this.$message.warning("请选择编辑项！");
          return false;
        } else {
          this.modalTitle = "编辑";
          this.getParameterInfo();
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

      if (!reg.test(this.froms.configKey)) {
        flag = !1;
        this.$message.warning("请填写有效的参数键！");
        return false;
      } else if (!this.froms.configValue) {
        flag = !1;
        this.$message.warning("请填写参数值！");
        return false;
      } else if (!this.froms.configFormat) {
        flag = !1;
        this.$message.warning("请填写参数格式！");
        return false;
      } else {
        return flag;
      }
    },

    //添加参数
    addOrEditParameter() {
      let _type = this.editType;
      let data = this.froms;
      this.axios({
        url: _type == "add" ? "basic/config/add" : "basic/config/modify",
        method: _type == "add" ? METHOD_POST : METHOD_PUT,
        data: data
      })
        .then(res => {
          if (res.code == 0) {
            this.visible = !1;
            this.$message.success("操作成功！");
            this.getParameterList();
          } else {
            this.$message.error(res.msg);
          }
        })
        .catch(err => {
          console.log(err);
        });
    },

    //删除参数
    deleteParameter() {
      let _id = this.selectedRows[0].id;
      this.axios({
        url: "basic/config/remove/" + _id,
        method: METHOD_DELETE
      })
        .then(res => {
          if (res.code == 0) {
            this.visible = !1;
            this.$message.success("删除成功！");
            this.getParameterList();
          } else {
            this.$message.error(res.msg);
          }
        })
        .catch(err => {
          console.log(err);
        });
    },


    // 获取参数数据列表
    getParameterList() {
      this.initSelectedRows();
      let _data = {
        pageSize: this.pageSize,
        currentPage: this.currentPage,
        where: this.queryParam
      };
      this.axios({
        url: "basic/config/pageList",
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
    getParameterInfo(id) {
      let _id = null;
      if (id) _id = id;
      else _id = this.selectedRows[0].id;

      this.axios({
        url: "basic/config/info/" + _id,
        method: METHOD_GET
      })
        .then(res => {
          if (res.code == 0) {
            this.visible = !0;
            this.froms = res.config;
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
      this.getParameterList();
    }
  },
  created() {
    //列表数据请求
    this.getParameterList();
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
