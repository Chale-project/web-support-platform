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
            <a-form-item label="角色代码">
              <a-input v-model="queryParam.roleCode" placeholder="请填写角色代码" />
            </a-form-item>
          </a-col>
          <template v-if="advanced">
            <a-col :md="8" :sm="24">
              <a-form-item label="角色名称">
                <a-input v-model="queryParam.roleName" placeholder="请填写角色名称" />
              </a-form-item>
            </a-col>
            <a-col :md="8" :sm="24">
              <a-form-item label="角色类型">
                <a-select placeholder="请选择" v-model="queryParam.roleType">
                  <a-select-option value="">全部</a-select-option>
                  <a-select-option value="default">系统默认</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :md="8" :sm="24">
              <a-form-item label="角色状态">
                <a-select placeholder="请选择" v-model="queryParam.roleStatus">
                  <a-select-option value="">全部</a-select-option>
                  <a-select-option value="enabled">启用</a-select-option>
                  <a-select-option value="disabled">禁用</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
          </template>
          <a-col :md="!advanced && 8 || 24" :sm="24">
            <span class="table-page-search-submitButtons" :style="advanced && { float: 'right', overflow: 'hidden' } || {} ">
              <a-button type="primary" @click="queryRole">查询</a-button>
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
      <a-button type="primary" icon="plus" @click="addOrEditOrRemovRole('add')">新建</a-button>
      <a-button type="primary" icon="edit" @click="addOrEditOrRemovRole('edit')">编辑</a-button>
      <a-button type="primary" icon="delete" @click="addOrEditOrRemovRole('delete')">删除</a-button>
    </div>

    <!--表格-->
    <a-table size="middle" :columns="columns" :dataSource="loadDatas" :loading="loading" :pagination="pagination" :rowSelection="{type:'radio', selectedRowKeys: selectedRowKeys, onChange: updateSelect }">
      <span slot="roleType" slot-scope="record">
        <a-tag v-if="record=='default'" color="#108ee9">默认</a-tag>
        <a-tag v-else color="#f0ad4e">其他</a-tag>
      </span>

      <span slot="roleStatus" slot-scope="record">
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
              <a-form-item label="角色代码" :required="true">
                <a-input v-model="froms.roleCode" placeholder="请填写角色代码（如：role_code）" />
              </a-form-item>
            </a-col>

            <a-col :md="12" :sm="24">
              <a-form-item label="角色名称" :required="true">
                <a-input v-model="froms.roleName" placeholder="请填写角色名称" />
              </a-form-item>
            </a-col>

            <a-col :md="12" :sm="24">
              <a-form-item label="角色类型">
                <a-select placeholder="请选择" v-model="froms.roleType">
                  <a-select-option value="default">默认</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>

            <a-col :md="12" :sm="24" v-show="editType=='edit'">
              <a-form-item label="是否启用">
                <a-select placeholder="请选择" v-model="froms.roleStatus">
                  <a-select-option value="enabled">启用</a-select-option>
                  <a-select-option value="disabled">禁用</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>

            <a-col :md="12" :sm="24">
              <a-form-item label="备注">
                <a-input v-model="froms.roleRemark" placeholder="请填写备注信息" />
              </a-form-item>
            </a-col>

            <a-col :md="24" :sm="24">
              <a-form-item label="菜单功能权限配置">
                <a-tree checkable @check="onCheckPermission" v-model="froms.menuIdList" :defaultExpandAll="true" :checkStrictly="true" :treeData="treeData" />
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
    title: "角色代码",
    dataIndex: "roleCode",
    align: "center"
  },
  {
    title: "角色名称",
    dataIndex: "roleName",
    align: "center"
  },
  {
    title: "角色类型",
    dataIndex: "roleType",
    align: "center",
    scopedSlots: { customRender: "roleType" }
  },
  {
    title: "角色状态",
    dataIndex: "roleStatus",
    align: "center",
    scopedSlots: { customRender: "roleStatus" }
  },
  {
    title: "备注",
    dataIndex: "roleRemark",
    align: "center"
  },
  {
    title: "创建时间",
    dataIndex: "addDataTime",
    align: "center"
  }
];

//数据
const data = [{}];
const query = [];
export default {
  name: "roleManagement",
  components: {
    Pagination
  },
  data() {
    return {
      advanced: false, // 高级搜索 展开/关闭
      queryParam: {
        appId: null,
        roleCode: null,
        roleName: null,
        roleType: "",
        roleStatus: ""
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

      appList: [],
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
  watch: {
    checkedKeys(val) {
      console.log("onCheck", val);
    }
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
    queryRole() {
      this.getRoleList();
    },

    //重置
    resetQueryParam() {
      this.queryParam.roleCode = null;
      this.queryParam.roleName = null;
      this.queryParam.roleType = null;
      this.queryParam.roleStatus = null;
    },

    //选择appid
    choiceAppId(id) {
      this.queryParam.appId = id;
      this.getRoleList();
      this.getRoleTreeData();
    },

    //选择跟新table中的某项
    updateSelect(selectedRowKeys, selectedRows) {
      this.selectedRowKeys = selectedRowKeys;
      this.selectedRows = selectedRows;
    },

    //菜单功能权限筛选
    onCheckPermission(selectedKeys, e) {
      // let _menuIdList = [...selectedKeys, ...e.halfCheckedKeys];
      //this.froms.menuIdList = _menuIdList;
      this.froms.menuIdList = selectedKeys.checked;
    },

    //取消
    handleCancel() {
      this.visible = !1;
    },

    //确认
    handleOk() {
      let _type = this.editType;
      if (_type == "delete") {
        this.deleteRole();
      } else {
        const flag = this.checkData();
        flag && this.addOrEditRole();
      }
    },

    //新建Or编辑角色
    addOrEditOrRemovRole(e) {
      this.editType = e;
      if (this.editType == "add") {
        this.modalTitle = "新建";
        this.visible = !0;

        this.froms = {
          appId: this.queryParam.appId,
          roleCode: null,
          roleName: null,
          roleBelongId: null,
          roleType: "default",
          menuIdList: [],
          roleStatus: "enabled",
          roleRemark: null
        };
      } else if (this.editType == "edit") {
        if (this.selectedRows.length < 1) {
          this.$message.warning("请选择编辑项！");
          return false;
        } else {
          this.modalTitle = "编辑";
          this.getRoleInfo();
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
      if (!this.froms.roleCode) {
        flag = !1;
        this.$message.warning("请填写角色代码！");
        return false;
      } else if (!this.froms.roleName) {
        flag = !1;
        this.$message.warning("请填写角色名称！");
        return false;
      } else {
        return flag;
      }
    },

    //添加菜单
    addOrEditRole() {
      let _type = this.editType;
      const data = this.froms;
      console.log(data);
      this.axios({
        url: _type == "add" ? "basic/role/add" : "basic/role/modify",
        method: _type == "add" ? METHOD_POST : METHOD_PUT,
        data: data
      })
        .then(res => {
          if (res.code == 0) {
            this.visible = !1;
            this.$message.success("操作成功！");
            this.getRoleList();
          } else {
            this.$message.error(res.msg);
          }
        })
        .catch(err => {
          console.log(err);
        });
    },

    //删除菜单
    deleteRole() {
      let _id = this.selectedRows[0].id;
      this.axios({
        url: "basic/role/remove/" + _id,
        method: METHOD_DELETE
      })
        .then(res => {
          if (res.code == 0) {
            this.visible = !1;
            this.$message.success("删除成功！");
            this.getRoleList();
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
    getRoleList() {
      this.initSelectedRows();

      let _data = {
        pageSize: this.pageSize,
        currentPage: this.currentPage,
        where: this.queryParam
      };
      this.axios({
        url: "basic/role/pageList",
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
    getRoleInfo() {
      const _id = this.selectedRows[0].id;
      this.axios({
        url: "basic/role/info/" + _id,
        method: METHOD_GET
      })
        .then(res => {
          if (res.code == 0) {
            this.visible = !0;
            this.froms = res.role;
          } else {
            this.$message.error(res.msg);
          }
        })
        .catch(err => {
          console.log(err);
        });
    },

    //获取用户权限配置树结构
    getRoleTreeData() {
      this.axios({
        url: "basic/menu/list/" + this.queryParam.appId,
        method: METHOD_GET
      })
        .then(res => {
          if (res.length > 0) this.setRoleTree(res);
        })
        .catch(err => {
          console.log(err);
        });
    },
    //构建树结构
    setRoleTree(arr) {
      const _menyList = toTree(arr);
      this.treeData = _menyList;
    },

    //分页
    changePage(obj) {
      this.currentPage = obj.currentPage;
      this.pageSize = obj.pageSize;
      this.getRoleList();
    }
  },
  created() {
    //列表数据请求
    this.getAppList().then(res => {
      this.getRoleList();
      this.getRoleTreeData();
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
.modal-container {
  max-height: 500px;
  padding: 0 12px;
  overflow-y: auto;
}
</style>
