<template>
  <div style="background:#fff ;padding:25px;position: relative">
    <div class="table-page-search-wrapper">
      <a-form layout="inline">
        <a-row :gutter="48">
          <!-- <a-col :md="8" :sm="24">
            <a-form-item label="应用平台">
              <a-select placeholder="请选择" v-model="queryParam.appId" @change="choiceAppId">
                <a-select-option :value="v.id" v-for="(v,i) of appList" :key="i">{{v.appName}}</a-select-option>
              </a-select>
            </a-form-item>
          </a-col> -->
          <a-col :md="8" :sm="24">
            <a-form-item label="用户手机号">
              <a-input v-model="queryParam.userMobilePhone" placeholder="请填写用户手机号" />
            </a-form-item>
          </a-col>
          <a-col :md="8" :sm="24">
            <a-form-item label="用户编号">
              <a-input v-model="queryParam.userNumber" placeholder="请填写用户编号" />
            </a-form-item>
          </a-col>
          <a-col :md="8" :sm="24">
            <a-form-item label="操作员状态">
              <a-select placeholder="请选择" v-model="queryParam.userStatus">
                <a-select-option value="">全部</a-select-option>
                <a-select-option value="enabled">启用</a-select-option>
                <a-select-option value="disabled">禁用</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <template v-if="advanced">
            <!-- <a-col :md="8" :sm="24">
              <a-form-item label="用户昵称">
                <a-input v-model="queryParam.userNickname" placeholder="请填写用户昵称" />
              </a-form-item>
            </a-col>
            <a-col :md="8" :sm="24">
              <a-form-item label="用户真实名">
                <a-input v-model="queryParam.userRealname" placeholder="请填写用户真实名" />
              </a-form-item>
            </a-col> -->

          </template>

          <a-col :md="24" :sm="24">
            <span class="table-page-search-submitButtons" style="float:right">
              <a-button type="primary" @click="queryOperator">查询</a-button>
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
      <a-button type="primary" icon="delete" @click="modifyUser('delete')">删除</a-button>
      <a-button type="primary" icon="key" @click="modifyUser('reset')">重置用户登录密码</a-button>
    </div>

    <!--表格-->
    <a-table size="middle" :columns="columns" :dataSource="loadDatas" :loading="loading" :pagination="pagination" :rowSelection="{type:'radio', selectedRowKeys: selectedRowKeys, onChange: updateSelect }">
      <template slot="userMobilePhone" slot-scope="record">
        <span>{{mobileToStar(record)}}</span>
      </template>

      <span slot="userStatus" slot-scope="record">
        <a-tag v-if="record=='enabled'" color="#87d068">启用</a-tag>
        <a-tag v-else-if="record=='disabled'" color="#ff0000">禁用</a-tag>
      </span>

      <template slot="Action" slot-scope="text,record">
        <span>
          <a href="javascript:;" @click="modifyUser('detail', record)">详情</a>
        </span>
      </template>
    </a-table>
    <!--分页-->
    <Pagination :current="currentPage" :pageSizeOptions="pageSizeOptions" :pageSize="pageSize" :total="totalCount" :totalPage="totalPage" @change="changePage"></Pagination>

    <!-- 新建编辑模态框 -->
    <a-modal :width="editType=='detail'?'800px':'400px'" :title="modalTitle" :visible="visible" @ok="handleOk" :confirmLoading="confirmLoading" @cancel="handleCancel">
      <p v-if="editType=='delete'">确认删除此用户码？</p>
      <p v-else-if="editType=='reset'">确认重置此用户登录密码？</p>
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
              <a-form-item label="用户编号">
                <a-input :value="froms.userNumber" disabled />
              </a-form-item>
            </a-col>

            <a-col :md="12" :sm="24">
              <a-form-item label="用户手机号">
                <a-input :value="froms.userMobilePhone" disabled />
              </a-form-item>
            </a-col>

            <a-col :md="12" :sm="24">
              <a-form-item label="用户昵称">
                <a-input :value="froms.userNickname" disabled />
              </a-form-item>
            </a-col>
            <a-col :md="12" :sm="24">
              <a-form-item label="用户真实名">
                <a-input :value="froms.userRealname" disabled />
              </a-form-item>
            </a-col>
            <a-col :md="12" :sm="24">
              <a-form-item label="用户登录名">
                <a-input :value="froms.userLoginName" disabled />
              </a-form-item>
            </a-col>
            <a-col :md="12" :sm="24">
              <a-form-item label="用户类型">
                <a-input :value="froms.userType" disabled />
              </a-form-item>
            </a-col>
            <a-col :md="12" :sm="24">
              <a-form-item label="用户级别">
                <a-input :value="froms.userLevel" disabled />
              </a-form-item>
            </a-col>
            <a-col :md="12" :sm="24">
              <a-form-item label="用户性别">
                <a-input :value="froms.userSex=='man'?'男':froms.userSex=='male'?'男':froms.userSex=='woman'?'女':'未知'" disabled />
              </a-form-item>
            </a-col>
            <a-col :md="12" :sm="24">
              <a-form-item label="用户年龄">
                <a-input :value="froms.userAge>0?froms.userAge:''" disabled />
              </a-form-item>
            </a-col>
            <a-col :md="12" :sm="24">
              <a-form-item label="用户邮箱">
                <a-input :value="froms.userEmail" disabled />
              </a-form-item>
            </a-col>
            <a-col :md="12" :sm="24">
              <a-form-item label="用户身份证">
                <a-input :value="froms.invitationCode" disabled />
              </a-form-item>
            </a-col>
            <a-col :md="12" :sm="24">
              <a-form-item label="用户状态">
                <a-input :value="froms.userStatus" disabled />
              </a-form-item>
            </a-col>
            <a-col :md="12" :sm="24">
              <a-form-item label="创建时间">
                <a-input :value="froms.addDataTime" disabled />
              </a-form-item>
            </a-col>

            <a-col :md="12" :sm="24">
              <a-form-item label="备注">
                <a-input :value="froms.userRemark" disabled />
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
    width: "10%",
    dataIndex: "userNumber",
    align: "center"
  },
  {
    title: "用户手机号",
    width: "13%",
    dataIndex: "userMobilePhone",
    align: "center",
    scopedSlots: { customRender: "userMobilePhone" }
  },
  {
    title: "用户昵称",
    width: "12%",
    dataIndex: "userNickname",
    align: "center"
  },
  {
    title: "用户真实名",
    width: "12%",
    dataIndex: "userRealname",
    align: "center"
  },
  {
    title: "用户类型",
    width: "12%",
    dataIndex: "userType",
    align: "center"
  },
  {
    title: "用户级别",
    width: "12%",
    dataIndex: "userLevel",
    align: "center",
    scopedSlots: { customRender: "userLevel" }
  },
  {
    title: "状态",
    width: "8%",
    dataIndex: "userStatus",
    align: "center",
    scopedSlots: { customRender: "userStatus" }
  },
  {
    title: "创建时间",
    width: "15%",
    dataIndex: "addDataTime",
    align: "center"
  },
  {
    title: "操作",
    width: "8%",
    dataIndex: "Action",
    align: "center",
    scopedSlots: { customRender: "Action" }
  }
];

export default {
  name: "userManagement",
  components: {
    Pagination
  },
  data() {
    return {
      mobileToStar,
      advanced: false, // 高级搜索 展开/关闭
      queryParam: {
        appId: null,
        userNumber: null,
        userMobilePhone: null,
        userNickname: null,
        userRealname: null,
        userStatus: ""
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
    queryOperator() {
      this.getUserList();
    },

    //重置
    resetQueryParam() {
      this.queryParam.userNumber = null;
      this.queryParam.userMobilePhone = null;
      this.queryParam.userNickname = null;
      this.queryParam.userRealname = null;
      this.queryParam.userStatus = null;
    },

    //选择appid
    choiceAppId(id) {
      this.queryParam.appId = id;
      this.getUserList();
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
      } else if (_type == "reset") {
        this.resetOperatorPwd();
      } else {
        this.handleCancel();
      }
    },

    //新建Or编辑菜单
    modifyUser(e, o) {
      this.editType = e;
      if (this.editType == "detail") {
        this.modalTitle = "详情";
        this.getUserInfo(o.id);
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
      }
    },

    //删除菜单
    deleteOperator() {
      let _id = this.selectedRows[0].id;
      this.axios({
        url: "basic/user/remove/" + _id,
        method: METHOD_DELETE
      })
        .then(res => {
          if (res.code == 0) {
            this.visible = !1;
            this.$message.success("删除成功！");
            this.getUserList();
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
        url: "basic/user/resetLoginPwd/" + _id,
        method: METHOD_PUT
      })
        .then(res => {
          if (res.code == 0) {
            this.visible = !1;
            this.$message.success("重置成功！");
            this.getUserList();
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
    getUserList() {
      this.initSelectedRows();
      let _data = {
        pageSize: this.pageSize,
        currentPage: this.currentPage,
        where: this.queryParam
      };
      this.axios({
        url: "basic/user/pageList",
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

    //获取用户信息
    getUserInfo(id) {
      this.axios({
        url: "basic/user/info/" + id,
        method: METHOD_GET
      })
        .then(res => {
          if (res.code == 0) {
            this.visible = !0;
            this.froms = res.user;
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
      this.getUserList();
    }
  },
  created() {
    //列表数据请求
    this.getAppList().then(res => {
      this.getUserList();
    });
  }
};
</script>

<style lang="less" scoped>
/deep/ .ant-table table {
  table-layout: fixed;
}
/deep/ .ant-table table td {
  white-space: nowrap; /*控制单行显示*/
  overflow: hidden; /*超出隐藏*/
  text-overflow: ellipsis; /*隐藏的字符用省略号表示*/
}
.table-operator {
  margin-bottom: 10px;
}
.ant-pagination {
  margin-top: 20px;
  text-align: center;
}
</style>
