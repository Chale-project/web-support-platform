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
            <a-form-item label="用户手机号">
              <a-input v-model="queryParam.userMobilePhone" placeholder="请填写手机号" />
            </a-form-item>
          </a-col>
          <template v-if="advanced">
            <a-col :md="8" :sm="24">
              <a-form-item label="用户编号">
                <a-input v-model="queryParam.userNumber" placeholder="请填写用户编号" />
              </a-form-item>
            </a-col>
            <a-col :md="8" :sm="24">
              <a-form-item label="用户登录名">
                <a-input v-model="queryParam.userLoginName" placeholder="请填写用户登录名" />
              </a-form-item>
            </a-col>
            <a-col :md="8" :sm="24">
              <a-form-item label="操作员类型">
                <a-select placeholder="请选择" v-model="queryParam.operatorType">
                  <a-select-option value="">全部</a-select-option>
                  <a-select-option :value="v.typeCode" v-for="(v,i) of operatorTypeList" :key="i">{{v.typeName}}</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :md="8" :sm="24">
              <a-form-item label="操作员级别">
                <a-select placeholder="请选择" v-model="queryParam.operatorLevel">
                  <a-select-option value="">全部</a-select-option>
                  <a-select-option value="super_admin">超级管理员</a-select-option>
                  <a-select-option value="belonging_admin">归属管理员</a-select-option>
                  <a-select-option value="ordinary_operator">普通操作员</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :md="8" :sm="24">
              <a-form-item label="操作员状态">
                <a-select placeholder="请选择" v-model="queryParam.operatorStatus">
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
      <a-button type="primary" icon="plus" @click="modifyOperator('add')">新建</a-button>
      <a-button type="primary" icon="edit" @click="modifyOperator('edit')">编辑</a-button>
      <a-button type="primary" icon="delete" @click="modifyOperator('delete')">删除</a-button>
      <a-button type="primary" icon="key" @click="modifyOperator('reset')">重置登录密码</a-button>
      <a-button type="primary" icon="setting" @click="modifyOperator('init')">初始化账号</a-button>
    </div>

    <!--表格-->
    <a-table size="middle" :columns="columns" :dataSource="loadDatas" :loading="loading" :pagination="pagination" :rowSelection="{type:'radio', selectedRowKeys: selectedRowKeys, onChange: updateSelect }">
      <template slot="userMobilePhone" slot-scope="record">
        <span>{{mobileToStar(record)}}</span>
      </template>

      <template slot="operatorType" slot-scope="record">
        <a-tag v-if="v.typeCode==record" v-for="(v,i) of operatorTypeList" :key="i">{{v.typeName}}</a-tag>
      </template>

      <span slot="operatorLevel" slot-scope="record">
        <a-tag v-if="record=='super_admin'" color="#108ee9">超级管理员</a-tag>
        <a-tag v-if="record=='belonging_admin'" color="#2db7f5">归属管理员</a-tag>
        <a-tag v-if="record=='ordinary_operator'" color="#f0ad4e">普通操作员</a-tag>
        <a-tag v-else color="#f0ad4e">其他</a-tag>
      </span>

      <span slot="operatorStatus" slot-scope="record">
        <a-tag v-if="record=='enabled'" color="#87d068">启用</a-tag>
        <a-tag v-else-if="record=='disabled'" color="#ff0000">禁用</a-tag>
      </span>

      <template slot="Action" slot-scope="text,record">
        <span>
          <a href="javascript:;" @click="modifyOperator('detail', record)">详情</a>
        </span>
      </template>
    </a-table>
    <!--分页-->
    <Pagination :current="currentPage" :pageSizeOptions="pageSizeOptions" :pageSize="pageSize" :total="totalCount" :totalPage="totalPage" @change="changePage"></Pagination>

    <!-- 新建编辑模态框 -->
    <a-modal :width="editType=='delete'?'400px':editType=='reset'?'400px':editType=='init'?'400px':'800px'" :title="modalTitle" :visible="visible" @ok="handleOk" :confirmLoading="confirmLoading" @cancel="handleCancel">
      <p v-if="editType=='delete'">确认删除此项码？</p>
      <p v-else-if="editType=='reset'">确认重置此操作员登录密码？</p>
      <p v-else-if="editType=='init'">确认初始化此操作员用户账号吗？</p>
      <div class="modal-container" v-else>
        <a-form>
          <a-row :gutter="24">
            <a-col :md="12" :sm="24">
              <a-form-item label="应用平台" :required="true">
                <a-select v-model="froms.appId" placeholder="请选择" disabled>
                  <a-select-option :value="v.id" v-for="(v,i) of appList" :key="i">{{v.appName}}</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>

            <a-col :md="12" :sm="24">
              <a-form-item label="操作员类型" :required="true">
                <a-select v-model="froms.operatorType" placeholder="请选择" :disabled="editType=='detail'">
                  <a-select-option :value="v.typeCode" v-for="(v,i) of operatorTypeList" :key="i">{{v.typeName}}</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>

            <a-col :md="12" :sm="24">
              <a-form-item label="操作员级别" :required="true">
                <a-select v-model="froms.operatorLevel" placeholder="请选择" :disabled="editType=='detail'">
                  <a-select-option value="ordinary_operator">普通操作员</a-select-option>
                  <a-select-option value="belonging_admin">归属管理员</a-select-option>
                  <a-select-option value="super_admin">超级管理员</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>

            <a-col :md="12" :sm="24">
              <a-form-item label="用户手机号" :required="true">
                <a-input v-model="froms.userMobilePhone" :placeholder="editType=='detail'?'':'请填写手机号'" :disabled="editType=='detail'" />
              </a-form-item>
            </a-col>

            <a-col :md="12" :sm="24">
              <a-form-item label="用户登录名" :required="true">
                <a-input v-model="froms.userLoginName" :placeholder="editType=='detail'?'':'请填写登录名'" :disabled="editType=='detail'" />
              </a-form-item>
            </a-col>
            <a-col :md="12" :sm="24">
              <a-form-item label="操作员姓名" :required="true">
                <a-input v-model="froms.operatorName" :placeholder="editType=='detail'?'':'请填写操作员姓名'" :disabled="editType=='detail'" />
              </a-form-item>
            </a-col>
            <a-col :md="12" :sm="24">
              <a-form-item label="操作员年龄">
                <a-input v-model="froms.operatorAge" :placeholder="editType=='detail'?'':'请填写操作员年龄'" :disabled="editType=='detail'" />
              </a-form-item>
            </a-col>
            <a-col :md="12" :sm="24">
              <a-form-item label="操作员邮箱">
                <a-input v-model="froms.operatorEmail" :placeholder="editType=='detail'?'':'请填写操作员邮箱'" :disabled="editType=='detail'" />
              </a-form-item>
            </a-col>
            <a-col :md="12" :sm="24">
              <a-form-item label="操作员身份证">
                <a-input v-model="froms.operatorPid" :placeholder="editType=='detail'?'':'请填写操作员身份证'" :disabled="editType=='detail'" />
              </a-form-item>
            </a-col>
            <a-col :md="12" :sm="24">
              <a-form-item label="备注">
                <a-input v-model="froms.operatorRemark" :placeholder="editType=='detail'?'':'请填写备注'" :disabled="editType=='detail'" />
              </a-form-item>
            </a-col>
            <a-col :md="12" :sm="24" v-show="editType=='edit'">
              <a-form-item label="是否启用">
                <a-select v-model="froms.operatorStatus" placeholder="请选择" :disabled="editType=='detail'">
                  <a-select-option value="enabled">启用</a-select-option>
                  <a-select-option value="disabled">禁用</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>

            <a-col :md="24" :sm="24">
              <a-form-item label="选择角色">
                <a-checkbox-group :options="roleList" v-model="froms.roleIdList" :disabled="editType=='detail'" />
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
import { mobileToStar } from "@/utils/util";
import {
  BASEURL,
  METHOD_GET,
  METHOD_POST,
  METHOD_DELETE,
  METHOD_PUT
} from "@/api/public";

const columns = [
  {
    title: "用户编号",
    dataIndex: "userNumber",
    align: "center"
  },
  {
    title: "用户手机号",
    dataIndex: "userMobilePhone",
    align: "center",
    scopedSlots: { customRender: "userMobilePhone" }
  },
  {
    title: "用户登录名",
    dataIndex: "userLoginName",
    align: "center"
  },
  {
    title: "操作员名称",
    dataIndex: "operatorName",
    align: "center"
  },
  {
    title: "操作员类型",
    dataIndex: "operatorType",
    align: "center",
    scopedSlots: { customRender: "operatorType" }
  },
  {
    title: "操作员级别",
    dataIndex: "operatorLevel",
    align: "center",
    scopedSlots: { customRender: "operatorLevel" }
  },
  {
    title: "状态",
    dataIndex: "operatorStatus",
    align: "center",
    scopedSlots: { customRender: "operatorStatus" }
  },
  {
    title: "创建时间",
    dataIndex: "addDataTime",
    align: "center"
  },
  {
    title: "操作",
    dataIndex: "Action",
    align: "center",
    scopedSlots: { customRender: "Action" }
  }
];

export default {
  name: "operatorManagement",
  components: {
    Pagination
  },
  data() {
    return {
      mobileToStar,
      advanced: false, // 高级搜索 展开/关闭
      queryParam: {
        appId: null,
        userMobilePhone: null,
        userNumber: null,
        userLoginName: null,
        operatorType: "",
        operatorLevel: "",
        operatorStatus: ""
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
      operatorTypeList: [], //操作员类型
      roleList: [], //角色配置列表

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

    //高级搜索 展开/收起
    toggleAdvanced() {
      this.advanced = !this.advanced;
    },

    //查询
    queryOperator() {
      this.getOperatorList();
    },

    //重置
    resetQueryParam() {
      this.queryParam.userMobilePhone = null;
      this.queryParam.userLoginName = null;
      this.queryParam.userNumber = null;
      this.queryParam.operatorType = "";
      this.queryParam.operatorLevel = "";
      this.queryParam.operatorStatus = "";
    },

    //选择appid
    choiceAppId(id) {
      this.queryParam.appId = id;
      this.getOperatorList();
      this.getOperatorTypeList();
      this.getRoleList();
    },

    //选择跟新table中的某项
    updateSelect(selectedRowKeys, selectedRows) {
      this.selectedRowKeys = selectedRowKeys;
      this.selectedRows = selectedRows;
    },

    //菜单功能权限筛选
    onCheckPermission(selectedKeys) {},

    //取消
    handleCancel() {
      this.visible = !1;
    },

    //确认
    handleOk() {
      let _type = this.editType;
      if (_type == "delete") {
        this.deleteOperator();
      } else if (_type == "reset") {
        this.resetOperatorPwd();
      } else if (_type == "init") {
        this.initOperatorUser();
      } else if (_type == "detail") {
        this.handleCancel();
      } else {
        const flag = this.checkData();
        flag && this.addOrEditOperator();
      }
    },

    //新建Or编辑菜单
    modifyOperator(e, o) {
      this.editType = e;
      if (this.editType == "add") {
        this.modalTitle = "新建";
        this.visible = !0;
        this.froms = {
          appId: this.queryParam.appId,
          operatorType: undefined,
          operatorLevel: "ordinary_operator",
          userMobilePhone: null,
          userLoginName: null,
          operatorName: null,
          operatorAge: null,
          operatorEmail: null,
          operatorPid: null,
          operatorStatus: "enabled",
          roleRemark: null,
          roleIdList: []
        };
      } else if (this.editType == "edit") {
        if (this.selectedRows.length < 1) {
          this.$message.warning("请选择编辑项！");
          return false;
        } else {
          this.modalTitle = "编辑";
          this.getOperatorInfo();
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
          this.$message.warning("请选择重置密码项！");
          return false;
        } else {
          this.modalTitle = "重置密码";
          this.visible = !0;
        }
      } else if (this.editType == "init") {
        if (this.selectedRows.length < 1) {
          this.$message.warning("请选择初始化项！");
          return false;
        } else {
          this.modalTitle = "初始化账号";
          this.visible = !0;
        }
      } else if (this.editType == "detail") {
        this.modalTitle = "详情";
        this.getOperatorInfo(o.id);
      }
    },

    //数据校验
    checkData() {
      let flag = !0;
      let mobileReg = /^(1)[0-9]{10}$/;
      let emailReg = /\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/;
      let pIdReg = /^(^[1-9]\d{7}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}$)|(^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])((\d{4})|\d{3}[Xx])$)$/;
      if (!this.froms.operatorType) {
        flag = !1;
        this.$message.warning("请选择操作员类型！");
        return false;
      } else if (!this.froms.operatorLevel) {
        flag = !1;
        this.$message.warning("请选择操作员级别！");
        return false;
      } else if (!mobileReg.test(this.froms.userMobilePhone)) {
        flag = !1;
        this.$message.warning("请填写用户有效手机号！");
        return false;
      } else if (!this.froms.userLoginName) {
        flag = !1;
        this.$message.warning("请填写用户登录名！");
        return false;
      } else if (!this.froms.operatorName) {
        flag = !1;
        this.$message.warning("请填写操作员姓名！");
        return false;
      } else if (this.froms.operatorEmail) {
        if (!emailReg.test(this.froms.operatorEmail)) {
          flag = !1;
          this.$message.warning("请填写有效的邮箱！");
          return false;
        } else {
          return flag;
        }
      } else if (this.froms.operatorPid) {
        if (!pIdReg.test(this.froms.operatorEmail)) {
          flag = !1;
          this.$message.warning("请填写有效的身份证号！");
          return false;
        } else {
          return flag;
        }
      } else {
        return flag;
      }
    },

    //添加操作员
    addOrEditOperator() {
      let _type = this.editType;
      let data = this.froms;
      this.axios({
        url: _type == "add" ? "basic/operator/add" : "basic/operator/modify",
        method: _type == "add" ? METHOD_POST : METHOD_PUT,
        data: data
      })
        .then(res => {
          if (res.code == 0) {
            this.visible = !1;
            this.$message.success("操作成功！");
            this.getOperatorList();
          } else {
            this.$message.error(res.msg);
          }
        })
        .catch(err => {
          console.log(err);
        });
    },

    //删除操作员
    deleteOperator() {
      let _id = this.selectedRows[0].id;
      this.axios({
        url: "basic/operator/remove/" + _id,
        method: METHOD_DELETE
      })
        .then(res => {
          if (res.code == 0) {
            this.visible = !1;
            this.$message.success("删除成功！");
            this.getOperatorList();
          } else {
            this.$message.error(res.msg);
          }
        })
        .catch(err => {
          console.log(err);
        });
    },

    //重置操作员密码
    resetOperatorPwd() {
      let _id = this.selectedRows[0].id;
      this.axios({
        url: "basic/operator/resetLoginPwd/" + _id,
        method: METHOD_PUT
      })
        .then(res => {
          if (res.code == 0) {
            this.visible = !1;
            this.$message.success("重置成功！");
            this.getOperatorList();
          } else {
            this.$message.error(res.msg);
          }
        })
        .catch(err => {
          console.log(err);
        });
    },

    //重置操作员账号
    initOperatorUser() {
      let _id = this.selectedRows[0].id;
      this.axios({
        url: "basic/operator/initOperatorUser/" + _id,
        method: METHOD_POST
      })
        .then(res => {
          if (res.code == 0) {
            this.visible = !1;
            this.$message.success("重置成功！");
            this.getOperatorList();
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
    getOperatorList() {
      this.initSelectedRows();
      let _data = {
        pageSize: this.pageSize,
        currentPage: this.currentPage,
        where: this.queryParam
      };
      this.axios({
        url: "basic/operator/pageList",
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
    getOperatorInfo(id) {
      let _id = null;
      if (id) _id = id;
      else _id = this.selectedRows[0].id;

      this.axios({
        url: "basic/operator/info/" + _id,
        method: METHOD_GET
      })
        .then(res => {
          if (res.code == 0) {
            this.visible = !0;
            this.froms = res.operator;
          } else {
            this.$message.error(res.msg);
          }
        })
        .catch(err => {
          console.log(err);
        });
    },

    //获取操作员类型
    getOperatorTypeList() {
      this.axios({
        url: "basic/operatorType/select/" + this.queryParam.appId,
        method: METHOD_GET
      })
        .then(res => {
          if (res.code == 0) {
            let _list = res.typeList;
            if (_list.length > 0) {
              this.operatorTypeList = _list;
            } else {
              this.operatorTypeList = [];
            }
          } else {
            this.$message.error(res.msg);
          }
        })
        .catch(err => {
          console.log(err);
        });
    },

    //获取角色配置
    getRoleList() {
      this.axios({
        url: "basic/role/select/" + this.queryParam.appId,
        method: METHOD_GET
      })
        .then(res => {
          if (res.code == 0) {
            let _list = res.list;
            if (_list.length > 0) {
              this.setRoleList(_list);
            } else {
              this.roleList = [];
            }
          } else {
            this.$message.error(res.msg);
          }
        })
        .catch(err => {
          console.log(err);
        });
    },
    //
    setRoleList(arr) {
      let _roleList = arr.map(item => {
        return { label: item.roleName, value: item.id };
      });
      this.roleList = _roleList;
    },

    //分页
    changePage(obj) {
      this.currentPage = obj.currentPage;
      this.pageSize = obj.pageSize;
      this.getOperatorList();
    }
  },
  created() {
    //列表数据请求
    this.getAppList().then(res => {
      this.getOperatorList();
      this.getOperatorTypeList();
      this.getRoleList();
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
