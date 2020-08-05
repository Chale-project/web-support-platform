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
            <a-form-item label="用户编号">
              <a-input v-model="queryParam.userNumber" placeholder="请填写用户编号" />
            </a-form-item>
          </a-col>
          <a-col :md="8" :sm="24">
            <a-form-item label="登录账号">
              <a-input v-model="queryParam.userLoginName" placeholder="请填写登录账号" />
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

    <!--表格-->
    <a-table size="middle" :columns="columns" :dataSource="loadDatas" :loading="loading" :pagination="pagination"></a-table>

    <!--分页-->
    <Pagination :current="currentPage" :pageSizeOptions="pageSizeOptions" :pageSize="pageSize" :total="totalCount" :totalPage="totalPage" @change="changePage"></Pagination>

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
    title: "用户编号",
    width: "10%",
    dataIndex: "userNumber"
  },
  {
    title: "登录名",
    width: "10%",
    dataIndex: "userLoginName",
    align: "center"
  },
  {
    title: "用户操作",
    width: "10%",
    dataIndex: "operation",
    align: "center"
  },
  {
    title: "请求方式",
    width: "20%",
    dataIndex: "method",
    align: "center"
  },
  {
    title: "请求参数",
    width: "20%",
    dataIndex: "params",
    align: "center"
  },
  {
    title: "执行时长（毫秒）",
    width: "8%",
    dataIndex: "timeConsuming",
    align: "center"
  },
  {
    title: "访问IP",
    width: "10%",
    dataIndex: "visitIp",
    align: "center"
  },
  {
    title: "操作时间",
    width: "12%",
    dataIndex: "addDataTime",
    align: "center"
  }
];

export default {
  name: "systemLog",
  components: {
    Pagination
  },
  data() {
    return {
      queryParam: {
        appId: null,
        userNumber: null,
        userLoginName: null
      }, //搜索查询参数

      loadDatas: [], //表格请求的数据
      columns: columns, //表头
      pagination: false, //不显示分页

      pageSizeOptions: ["10", "20", "50", "100"],
      currentPage: 1, //当前的页数
      pageSize: 10, //每页显示的条数
      totalPage: 0, //总页数
      totalCount: 0, //总条数
      loading: true,

      appList: []
    };
  },
  watch: {},
  methods: {
    //选择appid
    choiceAppId(id) {
      this.queryParam.appId = id;
      this.getLogList();
    },

    //查询
    queryOperator() {
      this.getLogList();
    },

    //重置
    resetQueryParam() {
      this.queryParam.userNumber = null;
      this.queryParam.userLoginName = null;
    },

    // 查询应用列表
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

    //获取对应App菜单列表
    getLogList() {
      let _data = {
        pageSize: this.pageSize,
        currentPage: this.currentPage,
        where: this.queryParam
      };
      this.axios({
        url: "basic/log/pageList",
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

    //分页
    changePage(obj) {
      this.currentPage = obj.currentPage;
      this.pageSize = obj.pageSize;
      this.getLogList();
    }
  },

  created() {
    //列表数据请求
    this.getAppList().then(res => {
      this.getLogList();
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
