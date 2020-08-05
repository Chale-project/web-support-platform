<template>
  <div style="background:#fff ;padding:25px;position: relative">
    <div class="table-page-search-wrapper">
      <a-form layout="inline">
        <a-row :gutter="48">
          <a-col :md="8" :sm="24">
            <a-form-item label="任务名称">
              <a-input v-model="queryParam.taskName" placeholder="请填写任务名称" />
            </a-form-item>
          </a-col>
          <a-col :md="8" :sm="24">
            <a-form-item label="bean名称">
              <a-input v-model="queryParam.beanName" placeholder="请填写bean名称" />
            </a-form-item>
          </a-col>

          <template v-if="advanced">
            <a-col :md="8" :sm="24">
              <a-form-item label="cron表达式">
                <a-input v-model="queryParam.cronExpression" placeholder="请填写cron表达式" />
              </a-form-item>
            </a-col>
            <a-col :md="8" :sm="24">
              <a-form-item label="任务状态">
                <a-select placeholder="请选择" v-model="queryParam.taskStatus">
                  <a-select-option value="">全部</a-select-option>
                  <a-select-option value="enabled">启用</a-select-option>
                  <a-select-option value="disabled">禁用</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
          </template>
          <a-col :md="!advanced && 8 || 24" :sm="24">
            <span class="table-page-search-submitButtons" :style="advanced && { float: 'right', overflow: 'hidden' } || {} ">
              <a-button type="primary" @click="queryTask">查询</a-button>
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
      <a-button type="primary" icon="plus" @click="modifyTask('add')">新建</a-button>
      <a-button type="primary" icon="edit" @click="modifyTask('edit')">编辑</a-button>
      <a-button type="primary" icon="delete" @click="modifyTask('delete')">删除</a-button>
      <a-button type="primary" icon="setting" @click="modifyTask('run')">立即执行</a-button>
    </div>

    <!--表格-->
    <a-table size="middle" :columns="columns" :dataSource="loadDatas" :loading="loading" :pagination="pagination" :rowSelection="{type:'radio', selectedRowKeys: selectedRowKeys, onChange: updateSelect }">

      <span slot="taskStatus" slot-scope="record">
        <a-tag v-if="record=='enabled'" color="#87d068">启用</a-tag>
        <a-tag v-else-if="record=='disabled'" color="#ff0000">禁用</a-tag>
        <a-tag v-else-if="record=='paused'" color="#ff976a">已暂停</a-tag>
      </span>

      <template slot="Action" slot-scope="text,record,index">
        <span>
          <a href="javascript:;" @click="modifyTask('pause', record, index)">暂停</a>
          <a-divider type="vertical" />
          <a href="javascript:;" @click="modifyTask('resume', record, index)">恢复</a>
        </span>
      </template>
    </a-table>
    <!--分页-->
    <Pagination :current="currentPage" :pageSizeOptions="pageSizeOptions" :pageSize="pageSize" :total="totalCount" :totalPage="totalPage" @change="changePage"></Pagination>

    <!-- 新建编辑模态框 -->
    <a-modal :width="editType=='add'?'800px':editType=='edit'?'800px':'400px'" :title="modalTitle" :visible="visible" @ok="handleOk" :confirmLoading="confirmLoading" @cancel="handleCancel">
      <p v-if="editType=='delete'">确认删除此任务？</p>
      <p v-else-if="editType=='run'">确认立即执行此任务？</p>
      <p v-else-if="editType=='pause'">确认暂停此任务？</p>
      <p v-else-if="editType=='resume'">确认恢复此任务？</p>
      <div class="modal-container" v-else>
        <a-form>
          <a-row :gutter="24">
            <a-col :md="12" :sm="24">
              <a-form-item label="任务名称" :required="true">
                <a-input v-model="froms.taskName" placeholder="请填写任务名称" />
              </a-form-item>
            </a-col>

            <a-col :md="12" :sm="24">
              <a-form-item label="bean名称" :required="true">
                <a-input v-model="froms.beanName" placeholder="请填写登录名" />
              </a-form-item>
            </a-col>
            <a-col :md="12" :sm="24">
              <a-form-item label="cron表达式" :required="true">
                <a-input v-model="froms.cronExpression" placeholder="请填写cron表达式" />
              </a-form-item>
            </a-col>
            <a-col :md="12" :sm="24">
              <a-form-item label="方式名" :required="true">
                <a-input v-model="froms.methodName" placeholder="请填写方式名" />
              </a-form-item>
            </a-col>
            <a-col :md="12" :sm="24">
              <a-form-item label="参数">
                <a-input v-model="froms.methodParams" placeholder="请填写参数" />
              </a-form-item>
            </a-col>
            <a-col :md="12" :sm="24">
              <a-form-item label="备注">
                <a-input v-model="froms.taskRemark" placeholder="请填写备注" />
              </a-form-item>
            </a-col>
            <a-col :md="12" :sm="24" v-show="editType=='edit'">
              <a-form-item label="是否启用">
                <a-select v-model="froms.taskStatus" placeholder="请选择">
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

const columns = [
  {
    title: "任务名称",
    width: "10%",
    dataIndex: "taskName",
    align: "center"
  },
  {
    title: "bean名称",
    width: "15%",
    dataIndex: "beanName",
    align: "center"
  },
  {
    title: "Cron表达式",
    width: "15%",
    dataIndex: "cronExpression",
    align: "center"
  },
  {
    title: "方式名",
    width: "10%",
    dataIndex: "methodName",
    align: "center"
  },
  {
    title: "参数",
    width: "15%",
    dataIndex: "methodParams",
    align: "center"
  },
  {
    title: "状态",
    width: "8%",
    dataIndex: "taskStatus",
    align: "center",
    scopedSlots: { customRender: "taskStatus" }
  },
  {
    title: "创建时间",
    width: "15%",
    dataIndex: "addDataTime",
    align: "center"
  },
  {
    title: "操作",
    width: "12%",
    dataIndex: "Action",
    align: "center",
    scopedSlots: { customRender: "Action" }
  }
];

export default {
  name: "scheduleTask",
  components: {
    Pagination
  },
  data() {
    return {
      advanced: false, // 高级搜索 展开/关闭
      queryParam: {
        taskName: null,
        beanName: null,
        cronExpression: null,
        taskStatus: ""
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
    queryTask() {
      this.getTaskList();
    },

    //重置
    resetQueryParam() {
      this.queryParam.taskName = null;
      this.queryParam.beanName = null;
      this.queryParam.cronExpression = null;
      this.queryParam.taskStatus = "";
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
        this.deleteTask();
      } else if (_type == "run") {
        this.runTask();
      } else if (_type == "pause") {
        this.pauseTask();
      } else if (_type == "resume") {
        this.resumeTask();
      } else {
        const flag = this.checkData();
        flag && this.addOrEditTask();
      }
    },

    //操作任务
    modifyTask(e, o, index) {
      this.editType = e;
      if (this.editType == "add") {
        this.modalTitle = "新建";
        this.visible = !0;
        this.froms = {
          taskName: null,
          beanName: null,
          cronExpression: null,
          methodName: null,
          methodParams: null,
          taskRemark: null,
          taskStatus: 'enabled'
        };
      } else if (this.editType == "edit") {
        if (this.selectedRows.length < 1) {
          this.$message.warning("请选择编辑项！");
          return false;
        } else {
          this.modalTitle = "编辑";
          this.getTaskInfo();
        }
      } else if (this.editType == "delete") {
        if (this.selectedRows.length < 1) {
          this.$message.warning("请选择删除项！");
          return false;
        } else {
          this.modalTitle = "删除";
          this.visible = !0;
        }
      } else if (this.editType == "run") {
        if (this.selectedRows.length < 1) {
          this.$message.warning("请选择立即执行项！");
          return false;
        } else {
          this.modalTitle = "立即执行";
          this.visible = !0;
        }
      } else if (this.editType == "pause") {
        this.modalTitle = "暂停";
        this.visible = !0;
        this.selectedRowKeys[0] = index;
        this.selectedRows[0] = o;
      } else if (this.editType == "resume") {
        this.modalTitle = "恢复";
        this.visible = !0;
        this.selectedRowKeys[0] = index;
        this.selectedRows[0] = o;
      }
    },

    //数据校验
    checkData() {
      let flag = !0;
      if (!this.froms.taskName) {
        flag = !1;
        this.$message.warning("请填写任务名称！");
        return false;
      } else if (!this.froms.beanName) {
        flag = !1;
        this.$message.warning("请填写bean名称！");
        return false;
      } else if (!this.froms.cronExpression) {
        flag = !1;
        this.$message.warning("请填写cron表达式！");
        return false;
      } else if (!this.froms.methodName) {
        flag = !1;
        this.$message.warning("请填写方式名！");
        return false;
      } else {
        return flag;
      }
    },

    //添加任务
    addOrEditTask() {
      let _type = this.editType;
      let data = this.froms;
      this.axios({
        url: _type == "add" ? "task/schedule/add" : "task/schedule/modify",
        method: _type == "add" ? METHOD_POST : METHOD_PUT,
        data: data
      })
        .then(res => {
          if (res.code == 0) {
            this.visible = !1;
            this.$message.success("操作成功！");
            this.getTaskList();
          } else {
            this.$message.error(res.msg);
          }
        })
        .catch(err => {
          console.log(err);
        });
    },

    //删除任务
    deleteTask() {
      let _id = this.selectedRows[0].id;
      this.axios({
        url: "task/schedule/remove/" + _id,
        method: METHOD_DELETE
      })
        .then(res => {
          if (res.code == 0) {
            this.visible = !1;
            this.$message.success("删除成功！");
            this.getTaskList();
          } else {
            this.$message.error(res.msg);
          }
        })
        .catch(err => {
          console.log(err);
        });
    },

    //立即执行任务
    runTask() {
      let _id = this.selectedRows[0].id;
      this.axios({
        url: "task/schedule/run/" + _id,
        method: METHOD_POST
      })
        .then(res => {
          if (res.code == 0) {
            this.visible = !1;
            this.$message.success("任务已执行！");
            this.getTaskList();
          } else {
            this.$message.error(res.msg);
          }
        })
        .catch(err => {
          console.log(err);
        });
    },

    //暂停任务
    pauseTask() {
      let _id = this.selectedRows[0].id;
      this.axios({
        url: "task/schedule/pause/" + _id,
        method: METHOD_PUT
      })
        .then(res => {
          if (res.code == 0) {
            this.visible = !1;
            this.$message.success("任务已暂停！");
            this.getTaskList();
          } else {
            this.$message.error(res.msg);
          }
        })
        .catch(err => {
          console.log(err);
        });
    },

    //恢复任务
    resumeTask() {
      let _id = this.selectedRows[0].id;
      this.axios({
        url: "task/schedule/resume/" + _id,
        method: METHOD_PUT
      })
        .then(res => {
          if (res.code == 0) {
            this.visible = !1;
            this.$message.success("任务已恢复！");
            this.getTaskList();
          } else {
            this.$message.error(res.msg);
          }
        })
        .catch(err => {
          console.log(err);
        });
    },

    // 获取任务数据列表
    getTaskList() {
      this.initSelectedRows();
      let _data = {
        pageSize: this.pageSize,
        currentPage: this.currentPage,
        where: this.queryParam
      };
      this.axios({
        url: "task/schedule/pageList",
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
    getTaskInfo(id) {
      let _id = null;
      if (id) _id = id;
      else _id = this.selectedRows[0].id;

      this.axios({
        url: "task/schedule/info/" + _id,
        method: METHOD_GET
      })
        .then(res => {
          if (res.code == 0) {
            this.visible = !0;
            this.froms = res.schedule;
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
      this.getTaskList();
    }
  },
  created() {
    //列表数据请求
    this.getTaskList();
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
