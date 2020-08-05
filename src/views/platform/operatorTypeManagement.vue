<template>
  <div style="background:#fff ;padding:25px;position: relative">
    <div class="table-page-search-wrapper">
      <a-form layout="inline">
        <a-row :gutter="48">
          <a-col :md="8" :sm="24">
            <a-form-item label="应用平台">
              <a-select placeholder="请选择" v-model="queryParam.appId" @change="choiceAppId">
                <a-select-option :value="v.id" v-for="(v,i) of appList" :key="i">{{v.appName}}</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :md="8" :sm="24">
            <a-form-item label="类型名称">
              <a-input v-model="queryParam.typeName" placeholder="请填写类型名称" />
            </a-form-item>
          </a-col>
          <template v-if="advanced">
            <a-col :md="8" :sm="24">
              <a-form-item label="类型代码">
                <a-input v-model="queryParam.typeCode" placeholder="请填写类型代码" />
              </a-form-item>
            </a-col>
            <a-col :md="8" :sm="24">
              <a-form-item label="分组编号">
                <a-input v-model="queryParam.groupNumber" placeholder="请填写分组编号" />
              </a-form-item>
            </a-col>
            <a-col :md="8" :sm="24">
              <a-form-item label="类型状态">
                <a-select placeholder="请选择" v-model="queryParam.typeStatus">
                  <a-select-option value="">全部</a-select-option>
                  <a-select-option value="enabled">启用</a-select-option>
                  <a-select-option value="disabled">禁用</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
          </template>
          <a-col :md="!advanced && 8 || 24" :sm="24">
            <span class="table-page-search-submitButtons" :style="advanced && { float: 'right', overflow: 'hidden' } || {} ">
              <a-button type="primary" @click="queryOperator">查询</a-button>
              <a-button style="margin-left: 8px" @click="resetQueryParam">重置</a-button>
              <a @click="toggleAdvanced" style="margin-left: 8px">
                {{ advanced ? '收起' : '展开' }}
                <a-icon :type="advanced ? 'up' : 'down'" />
              </a>
            </span>
          </a-col>
        </a-row>
      </a-form>
    </div>

    <!--功能按钮-->
    <div class="table-operator">
      <a-button type="primary" icon="plus" @click="addOrEditOrRemovOperator('add')">新建</a-button>
      <a-button type="primary" icon="edit" @click="addOrEditOrRemovOperator('edit')">编辑</a-button>
      <a-button type="primary" icon="delete" @click="addOrEditOrRemovOperator('delete')">删除</a-button>
    </div>

    <!--表格-->
    <a-table size="middle" :columns="columns" :dataSource="loadDatas" :loading="loading" :pagination="pagination" :rowSelection="{type:'radio', selectedRowKeys: selectedRowKeys, onChange: updateSelect }">

      <span slot="typeStatus" slot-scope="record">
        <a-tag v-if="record=='enabled'" color="#87d068">启用</a-tag>
        <a-tag v-else-if="record=='disabled'" color="#ff0000">禁用</a-tag>
      </span>

    </a-table>
    <!--分页-->
    <Pagination :current="currentPage" :pageSizeOptions="pageSizeOptions" :pageSize="pageSize" :total="totalCount" :totalPage="totalPage" @change="changePage"></Pagination>

    <!-- 新建编辑模态框 -->
    <a-modal :width="editType=='delete'?'400px':'800px'" :title="modalTitle" :visible="visible" @ok="handleOk" :confirmLoading="confirmLoading" @cancel="handleCancel">
      <p v-if="editType=='delete'">确认删除此项码？</p>
      <div class="modal-container" v-else>
        <a-form>
          <a-row :gutter="24">
            <a-col :md="12" :sm="24">
              <a-form-item label="应用平台" :required="true">
                <a-select placeholder="请选择" v-model="froms.appId" disabled>
                  <a-select-option :value="v.id" v-for="(v,i) of appList" :key="i">{{v.appName}}</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>

            <a-col :md="12" :sm="24">
              <a-form-item label="类型名称" :required="true">
                <a-input v-model="froms.typeName" placeholder="请填写类型名称" />
              </a-form-item>
            </a-col>

            <a-col :md="12" :sm="24">
              <a-form-item label="类型代码" :required="true">
                <a-input v-model="froms.typeCode" placeholder="请填写唯一的类型代码" />
              </a-form-item>
            </a-col>
            <a-col :md="12" :sm="24">
              <a-form-item label="分组编号" :required="true">
                <a-input v-model="froms.groupNumber" placeholder="请填写分组编号" />
              </a-form-item>
            </a-col>
            <a-col :md="12" :sm="24">
              <a-form-item label="默认角色编码">
                <a-input v-model="froms.defaultRoleCode" placeholder="请填写默认角色编码" />
              </a-form-item>
            </a-col>

            <a-col :md="12" :sm="24">
              <a-form-item label="备注">
                <a-input v-model="froms.typeRemark" placeholder="请填写备注" />
              </a-form-item>
            </a-col>
            <a-col :md="12" :sm="24" v-show="editType=='edit'">
              <a-form-item label="是否启用">
                <a-select placeholder="请选择" v-model="froms.typeStatus">
                  <a-select-option value="enabled">启用</a-select-option>
                  <a-select-option value="disabled">禁用</a-select-option>
                </a-select>
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
    title: "类型名称",
    dataIndex: "typeName",
    align: "center"
  },
  {
    title: "类型代码",
    dataIndex: "typeCode",
    align: "center"
  },
  {
    title: "分组编号",
    dataIndex: "groupNumber",
    align: "center"
  },
  {
    title: "默认角色编码",
    dataIndex: "defaultRoleCode",
    align: "center"
  },
  {
    title: "备注",
    dataIndex: "typeRemark",
    align: "center"
  },
  {
    title: "类型状态",
    dataIndex: "typeStatus",
    align: "center",
    scopedSlots: { customRender: "typeStatus" }
  }
];

export default {
  name: "operatorTypeManagement",
  components: {
    Pagination
  },
  data() {
    return {
      advanced: false, // 高级搜索 展开/关闭
      queryParam: {
        appId: null,
        typeName: null,
        typeCode: null,
        groupNumber: null,
        typeStatus: ""
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
    queryOperator() {
      this.getOperatorTypeList();
    },

    //重置
    resetQueryParam() {
      this.queryParam.typeName = null;
      this.queryParam.typeCode = null;
      this.queryParam.groupNumber = null;
      this.queryParam.typeStatus = "";
    },

    //选择appid
    choiceAppId(id) {
      this.queryParam.appId = id;
      this.getOperatorTypeList();
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
        this.deleteOperator();
      } else {
        const flag = this.checkData();
        flag && this.addOrEditOperator();
      }
    },

    //新建Or编辑菜单
    addOrEditOrRemovOperator(e) {
      this.editType = e;
      if (this.editType == "add") {
        this.modalTitle = "新建";
        this.visible = !0;
        this.froms = {
          appId: this.queryParam.appId,
          typeName: null,
          typeCode: null,
          groupNumber: null,
          defaultRoleCode: null,
          typeRemark: null,
          typeStatus: "enabled"
        };
      } else if (this.editType == "edit") {
        if (this.selectedRows.length < 1) {
          this.$message.warning("请选择编辑项！");
          return false;
        } else {
          this.modalTitle = "编辑";
          this.getOperatorTypeInfo();
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
      if (!this.froms.typeName) {
        flag = !1;
        this.$message.warning("请填写类型名称！");
        return false;
      } else if (!this.froms.typeCode) {
        flag = !1;
        this.$message.warning("请填写类型代码！");
        return false;
      } else if (!this.froms.groupNumber) {
        flag = !1;
        this.$message.warning("请填写分组编号！");
        return false;
      } else {
        return flag;
      }
    },

    //添加操作员类型
    addOrEditOperator() {
      let _type = this.editType;
      let data = this.froms;
      this.axios({
        url:
          _type == "add"
            ? "basic/operatorType/add"
            : "basic/operatorType/modify",
        method: _type == "add" ? METHOD_POST : METHOD_PUT,
        data: data
      })
        .then(res => {
          if (res.code == 0) {
            this.visible = !1;
            this.$message.success("操作成功！");
            this.getOperatorTypeList();
          } else {
            this.$message.error(res.msg);
          }
        })
        .catch(err => {
          console.log(err);
        });
    },

    //删除菜单
    deleteOperator() {
      let _id = this.selectedRows[0].id;
      this.axios({
        url: "basic/operatorType/remove/" + _id,
        method: METHOD_DELETE
      })
        .then(res => {
          if (res.code == 0) {
            this.visible = !1;
            this.$message.success("删除成功！");
            this.getOperatorTypeList();
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
      return new Promise((resolve, reject) => {
        this.axios({
          url: "basic/app/select",
          method: METHOD_GET
        })
          .then(res => {
            if (res.code == 0) {
              if (res.appList.length > 0) {
                this.queryParam.appId = res.appList[0].id;
                this.appList = res.appList;
              }
              resolve(res);
            } else {
              this.$message.error(res.msg);
            }
          })
          .catch(err => {
            reject(err);
          });
      });
    },

    // 获取角色数据列表
    getOperatorTypeList() {
      this.initSelectedRows();
      let _data = {
        pageSize: this.pageSize,
        currentPage: this.currentPage,
        where: this.queryParam
      };
      this.axios({
        url: "basic/operatorType/pageList",
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
    getOperatorTypeInfo() {
      const _id = this.selectedRows[0].id;
      this.axios({
        url: "basic/operatorType/info/" + _id,
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
      this.getOperatorTypeList();
    }
  },
  created() {
    //列表数据请求
    this.getAppList().then(res => {
      this.getOperatorTypeList();
    });
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
