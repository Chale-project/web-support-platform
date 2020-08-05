<template>
  <div style="background:#fff ;padding:25px;position: relative">
    <div class="table-page-search-wrapper">
      <a-form layout="inline">
        <a-row :gutter="48">

          <a-col :md="8" :sm="24">
            <a-form-item label="应用名称">
              <a-input v-model="queryParam.appName" placeholder="请填写应用名称" />
            </a-form-item>
          </a-col>
          <a-col :md="8" :sm="24">
            <a-form-item label="应用代码">
              <a-input v-model="queryParam.appCode" placeholder="请填写应用代码" />
            </a-form-item>
          </a-col>
          <a-col :md="8" :sm="24">
            <a-form-item label="应用状态">
              <a-select placeholder="请选择" v-model="queryParam.appStatus">
                <a-select-option value="">全部</a-select-option>
                <a-select-option value="enabled">启用</a-select-option>
                <a-select-option value="disabled">禁用</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>

          <a-col :md="24" :sm="24">
            <span class="table-page-search-submitButtons" style="float:right">
              <a-button type="primary" @click="queryOperator">查询</a-button>
              <a-button style="margin-left: 8px" @click="resetQueryParam">重置</a-button>
            </span>
          </a-col>
        </a-row>
      </a-form>
    </div>

    <!--功能按钮-->
    <div class="table-operator">
      <a-button type="primary" icon="plus" @click="modifyApp('add')">新建</a-button>
      <a-button type="primary" icon="edit" @click="modifyApp('edit')">编辑</a-button>
      <a-button type="primary" icon="delete" @click="modifyApp('delete')">删除</a-button>
    </div>

    <!--表格-->
    <a-table size="middle" :columns="columns" :dataSource="loadDatas" :loading="loading" :pagination="pagination" :rowSelection="{type:'radio', selectedRowKeys: selectedRowKeys, onChange: updateSelect }">
      <span slot="belongStatus" slot-scope="record">
        <a-tag v-if="record=='enabled'" color="#87d068">启用</a-tag>
        <a-tag v-else-if="record=='disabled'" color="#ff0000">禁用</a-tag>
      </span>
      <span slot="appStatus" slot-scope="record">
        <a-tag v-if="record=='enabled'" color="#87d068">启用</a-tag>
        <a-tag v-else-if="record=='disabled'" color="#ff0000">禁用</a-tag>
      </span>

    </a-table>
    <!--分页-->
    <Pagination :current="currentPage" :pageSizeOptions="pageSizeOptions" :pageSize="pageSize" :total="totalCount" :totalPage="totalPage" @change="changePage"></Pagination>

    <!-- 新建编辑模态框 -->
    <a-modal :width="editType=='delete'?'400px':'800px'" :title="modalTitle" :visible="visible" @ok="handleOk" :confirmLoading="confirmLoading" @cancel="handleCancel">
      <p v-if="editType=='delete'">确认删除此用户码？</p>
      <p v-else-if="editType=='reset'">确认重置此用户登录密码？</p>
      <div class="modal-container" v-else>
        <a-form>
          <a-row :gutter="24">

            <a-col :md="12" :sm="24">
              <a-form-item label="应用名称">
                <a-input v-model="froms.appName" placeholder="请填写应用名称" />
              </a-form-item>
            </a-col>

            <a-col :md="12" :sm="24">
              <a-form-item label="应用代码">
                <a-input v-model="froms.appCode" placeholder="请填写应用代码（字母加‘-’或‘_’）" />
              </a-form-item>
            </a-col>

            <a-col :md="12" :sm="24">
              <a-form-item label="应用Url">
                <a-input v-model="froms.appUrl" placeholder="请填写应用Url" />
              </a-form-item>
            </a-col>
            <a-col :md="12" :sm="24">
              <a-form-item label="应用说明">
                <a-input v-model="froms.appIntroduce" placeholder="请填写应用说明" />
              </a-form-item>
            </a-col>
            <a-col :md="12" :sm="24">
              <a-form-item label="应用归属">
                <a-select placeholder="请选择" v-model="froms.belongStatus">
                  <a-select-option value="enabled">启用</a-select-option>
                  <a-select-option value="disabled">禁用</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>

            <a-col :md="12" :sm="24">
              <a-form-item label="排序">
                <a-input v-model="froms.sortNo" type="number" placeholder="请填写排序" />
              </a-form-item>
            </a-col>

            <!-- <a-col :md="12" :sm="24" v-show="editType=='edit'">
              <a-form-item label="应用状态">
                <a-select placeholder="请选择" v-model="froms.appStatus">
                  <a-select-option value="enabled">启用</a-select-option>
                  <a-select-option value="disabled">禁用</a-select-option>
                </a-select>
              </a-form-item>
            </a-col> -->

            <a-col :md="12" :sm="24">
              <a-form-item label="备注">
                <a-input v-model="froms.appRemark" placeholder="请填写备注" />
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
import { toTree } from "@/utils/util";

const columns = [
  {
    title: "应用名称",
    width: "20%",
    dataIndex: "appName",
    align: "center"
  },
  {
    title: "应用代码",
    width: "20%",
    dataIndex: "appCode",
    align: "center"
  },
  {
    title: "URL",
    width: "10%",
    dataIndex: "appUrl",
    align: "center"
  },

  {
    title: "排序",
    width: "10%",
    dataIndex: "sortNo",
    align: "center"
  },

  {
    title: "应用归属",
    width: "15%",
    dataIndex: "belongStatus",
    align: "center",
    scopedSlots: { customRender: "belongStatus" }
  },
  {
    title: "状态",
    width: "15%",
    dataIndex: "appStatus",
    align: "center",
    scopedSlots: { customRender: "appStatus" }
  },
  {
    title: "创建时间",
    width: "20%",
    dataIndex: "addDataTime",
    align: "center"
  }
];

export default {
  name: "appManagement",
  components: {
    Pagination
  },
  data() {
    return {
      queryParam: {
        appName: null,
        appCode: null,
        appStatus: ""
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

      appList: [], //应用列表

      selectedRowKeys: [], //选中行键
      selectedRows: [], //选中行键值,

      treeData: [], //菜单按钮权限树结构
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
    queryOperator() {
      this.getAppList();
    },

    //重置
    resetQueryParam() {
      this.queryParam.appName = null;
      this.queryParam.appCode = null;
      this.queryParam.appStatus = "";
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
        this.deleteApp();
      } else {
        const flag = this.checkData();
        flag && this.addOrEditApp();
      }
    },

    //新建Or编辑菜单
    modifyApp(e) {
      this.editType = e;
      if (this.editType == "add") {
        this.modalTitle = "新建";
        this.visible = !0;
        this.froms = {
          appName: null,
          appCode: null,
          appUrl: null,
          appIntroduce: null,
          appRemark: null,
          belongStatus: "enabled",
          appStatus: "enabled"
        };
      } else if (this.editType == "edit") {
        if (this.selectedRows.length < 1) {
          this.$message.warning("请选择编辑项！");
          return false;
        } else {
          this.modalTitle = "编辑";
          this.getAppInfo();
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
      if (!this.froms.appName) {
        flag = !1;
        this.$message.warning("请填写应用名称！");
        return false;
      } else if (!this.froms.appCode) {
        flag = !1;
        this.$message.warning("请填写应用代码！");
        return false;
      } else {
        return flag;
      }
    },

    //新增编辑app
    addOrEditApp() {
      let _type = this.editType;
      let data = this.froms;
      console.log(data);
      this.axios({
        url: _type == "add" ? "basic/app/add" : "basic/app/modify",
        method: _type == "add" ? METHOD_POST : METHOD_PUT,
        data: data
      })
        .then(res => {
          if (res.code == 0) {
            this.visible = !1;
            this.$message.success("操作成功！");
            this.getAppList();
          } else {
            this.$message.error(res.msg);
          }
        })
        .catch(err => {
          console.log(err);
        });
    },

    //删除菜单
    deleteApp() {
      let _id = this.selectedRows[0].id;
      this.axios({
        url: "basic/app/remove/" + _id,
        method: METHOD_DELETE
      })
        .then(res => {
          if (res.code == 0) {
            this.visible = !1;
            this.$message.success("删除成功！");
            this.getAppList();
          } else {
            this.$message.error(res.msg);
          }
        })
        .catch(err => {
          console.log(err);
        });
    },

    // 获取应用列表
    getAppList() {
      this.initSelectedRows();
      let _data = {
        pageSize: this.pageSize,
        currentPage: this.currentPage,
        where: this.queryParam
      };
      this.axios({
        url: "basic/app/pageList",
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

    //获取应用信息
    getAppInfo() {
      let _id = this.selectedRows[0].id;
      this.axios({
        url: "basic/app/info/" + _id,
        method: METHOD_GET
      })
        .then(res => {
          if (res.code == 0) {
            this.visible = !0;
            this.froms = res.app;
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
      this.getAppList();
    }
  },
  created() {
    //列表数据请求
    this.getAppList();
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
