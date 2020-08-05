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
            <a-form-item label="字典名称">
              <a-input v-model="queryParam.dictName" placeholder="请填写字典名称" />
            </a-form-item>
          </a-col>
          <template v-if="advanced">
            <a-col :md="8" :sm="24">
              <a-form-item label="字典键">
                <a-input v-model="queryParam.dictKey" placeholder="请填写字典键" />
              </a-form-item>
            </a-col>
            <a-col :md="8" :sm="24">
              <a-form-item label="级别">
                <a-select placeholder="请选择" v-model="queryParam.dictLevel">
                  <a-select-option value="">全部</a-select-option>
                  <a-select-option value="whole">全局</a-select-option>
                  <a-select-option value="app">应用</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :md="8" :sm="24">
              <a-form-item label="状态">
                <a-select placeholder="请选择" v-model="queryParam.dictStatus">
                  <a-select-option value="">全部</a-select-option>
                  <a-select-option value="enabled">启用</a-select-option>
                  <a-select-option value="disabled">禁用</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
          </template>
          <a-col :md="!advanced && 8 || 24" :sm="24">
            <span class="table-page-search-submitButtons" :style="advanced && { float: 'right', overflow: 'hidden' } || {} ">
              <a-button type="primary" @click="queryDict">查询</a-button>
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
      <a-button type="primary" icon="plus" @click="addOrEditOrRemovDict('add')">新建</a-button>
      <a-button type="primary" icon="edit" @click="addOrEditOrRemovDict('edit')">编辑</a-button>
      <a-button type="primary" icon="delete" @click="addOrEditOrRemovDict('delete')">删除</a-button>
    </div>

    <!--表格-->
    <a-table size="middle" :columns="columns" :dataSource="loadDatas" :loading="loading" :pagination="pagination" :rowSelection="{type:'radio', selectedRowKeys: selectedRowKeys, onChange: updateSelect }">
      <span slot="dictLevel" slot-scope="record">
        <a-tag v-if="record=='whole'" color="#108ee9">全局</a-tag>
        <a-tag v-else-if="record=='app'" color="#f0ad4e">应用</a-tag>
      </span>

      <span slot="dictStatus" slot-scope="record">
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
              <a-form-item label="字典名称" :required="true">
                <a-input v-model="froms.dictName" placeholder="请填写字典名称" />
              </a-form-item>
            </a-col>

            <a-col :md="12" :sm="24">
              <a-form-item label="字典键" :required="true">
                <a-input v-model="froms.dictKey" placeholder="请填写字典键（以字母及'_'链接）" />
              </a-form-item>
            </a-col>

            <a-col :md="12" :sm="24">
              <a-form-item label="字典名" :required="true">
                <a-input v-model="froms.dictItemName" placeholder="请填写字典名" />
              </a-form-item>
            </a-col>

            <a-col :md="12" :sm="24">
              <a-form-item label="字典值" :required="true">
                <a-input v-model="froms.dictItemValue" placeholder="请填写字典值" />
              </a-form-item>
            </a-col>

            <a-col :md="12" :sm="24">
              <a-form-item label="级别">
                <a-select placeholder="请选择" v-model="froms.dictLevel">
                  <a-select-option value="whole">全局</a-select-option>
                  <a-select-option value="app">应用</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>

            <a-col :md="12" :sm="24" v-show="editType=='edit'">
              <a-form-item label="是否启用">
                <a-select placeholder="请选择" v-model="froms.dictStatus">
                  <a-select-option value="enabled">启用</a-select-option>
                  <a-select-option value="disabled">禁用</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>

            <a-col :md="12" :sm="24">
              <a-form-item label="备注">
                <a-input v-model="froms.dictRemark" placeholder="请填写备注信息" />
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
    title: "字典名称",
    dataIndex: "dictName",
    width: "10%",
    align: "center"
  },
  {
    title: "字典键",
    dataIndex: "dictKey",
    width: "10%",
    align: "center"
  },
  {
    title: "字典名",
    dataIndex: "dictItemName",
    width: "10%",
    align: "center"
  },
  {
    title: "字典值",
    dataIndex: "dictItemValue",
    width: "10%",
    align: "center"
  },
  {
    title: "级别",
    dataIndex: "dictLevel",
    width: "10%",
    align: "center",
    scopedSlots: { customRender: "dictLevel" }
  },
  {
    title: "排序",
    dataIndex: "sortNo",
    width: "10%",
    align: "center"
  },
  {
    title: "状态",
    dataIndex: "dictStatus",
    width: "10%",
    align: "center",
    scopedSlots: { customRender: "dictStatus" }
  },
  {
    title: "备注",
    dataIndex: "dictRemark",
    width: "10%",
    align: "center"
  },
  {
    title: "创建时间",
    dataIndex: "addDataTime",
    width: "20%",
    align: "center"
  }
];

//数据
const data = [{}];
const query = [];
export default {
  name: "dictManagement",
  components: {
    Pagination
  },
  data() {
    return {
      advanced: false, // 高级搜索 展开/关闭
      queryParam: {
        appId: null,
        dictName: null,
        dictKey: null,
        dictLevel: "",
        dictStatus: ""
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
    queryDict() {
      this.getDictList();
    },

    //重置
    resetQueryParam() {
      this.queryParam.dictName = null;
      this.queryParam.dictKey = null;
      this.queryParam.dictLevel = "";
      this.queryParam.dictStatus = "";
    },

    //选择appid
    choiceAppId(id) {
      this.queryParam.appId = id;
      this.getDictList();
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
        this.deleteDict();
      } else {
        const flag = this.checkData();
        flag && this.addOrEditDict();
      }
    },

    //新建Or编辑字典
    addOrEditOrRemovDict(e) {
      this.editType = e;
      if (this.editType == "add") {
        this.modalTitle = "新建";
        this.visible = !0;

        this.froms = {
          appId: this.queryParam.appId,
          dictName: null,
          dictKey: null,
          dictItemName: null,
          dictItemValue: null,
          dictLevel: "whole",
          dictStatus: "enabled",
          dictRemark: null
        };
      } else if (this.editType == "edit") {
        if (this.selectedRows.length < 1) {
          this.$message.warning("请选择编辑项！");
          return false;
        } else {
          this.modalTitle = "编辑";
          this.getDictInfo();
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
      if (!this.froms.dictName) {
        flag = !1;
        this.$message.warning("请填写字典名称！");
        return false;
      } else if (!reg.test(this.froms.dictKey)) {
        flag = !1;
        this.$message.warning("请填写有效的字典键！");
        return false;
      } else if (!this.froms.dictItemName) {
        flag = !1;
        this.$message.warning("请填写字典名！");
        return false;
      } else if (!this.froms.dictItemValue) {
        flag = !1;
        this.$message.warning("请填写字典值！");
        return false;
      } else {
        return flag;
      }
    },

    //添加字典
    addOrEditDict() {
      let _type = this.editType;
      const data = this.froms;
      this.axios({
        url: _type == "add" ? "basic/dict/add" : "basic/dict/modify",
        method: _type == "add" ? METHOD_POST : METHOD_PUT,
        data: data
      })
        .then(res => {
          if (res.code == 0) {
            this.visible = !1;
            this.$message.success("操作成功！");
            this.getDictList();
          } else {
            this.$message.error(res.msg);
          }
        })
        .catch(err => {
          console.log(err);
        });
    },

    //删除字典
    deleteDict() {
      let _id = this.selectedRows[0].id;
      this.axios({
        url: "basic/dict/remove/" + _id,
        method: METHOD_DELETE
      })
        .then(res => {
          if (res.code == 0) {
            this.visible = !1;
            this.$message.success("删除成功！");
            this.getDictList();
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

    // 获取字典数据列表
    getDictList() {
      this.initSelectedRows();

      let _data = {
        pageSize: this.pageSize,
        currentPage: this.currentPage,
        where: this.queryParam
      };
      this.axios({
        url: "basic/dict/pageList",
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

    //获取字典信息
    getDictInfo() {
      const _id = this.selectedRows[0].id;
      this.axios({
        url: "basic/dict/info/" + _id,
        method: METHOD_GET
      })
        .then(res => {
          if (res.code == 0) {
            this.visible = !0;
            this.froms = res.dict;
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
      this.getDictList();
    }
  },
  created() {
    //列表数据请求
    this.getAppList().then(res => {
      this.getDictList();
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
