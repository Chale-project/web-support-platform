<template>
  <div style="background:#fff ;padding:25px;position: relative">
    <!-- <div class="table-page-search-wrapper">
      <a-form layout="inline">
        <a-row :gutter="48">
          <a-col :md="8" :sm="24">
            <a-form-item label="原文件名">
              <a-input v-model="queryParam.fileSourceName" placeholder="请填写原文件名" />
            </a-form-item>
          </a-col>
          <a-col :md="8" :sm="24">
            <a-form-item label="文件地址">
              <a-input v-model="queryParam.fileUrl" placeholder="请填写文件地址" />
            </a-form-item>
          </a-col>
          <a-col :md="8" :sm="24">
            <a-form-item label="文件状态">
              <a-select placeholder="请选择" v-model="queryParam.fileStatus">
                <a-select-option value="">全部</a-select-option>
                <a-select-option value="enabled">启用</a-select-option>
                <a-select-option value="disabled">禁用</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>

          <a-col :md="24" :sm="24">
            <span class="table-page-search-submitButtons" style="float:right">
              <a-button type="primary" @click="queryFile">查询</a-button>
              <a-button style="margin-left: 8px" @click="resetQueryParam">重置</a-button>
            </span>
          </a-col>
        </a-row>
      </a-form>
    </div> -->

    <!--功能按钮-->
    <div class="table-operator">
      <a-button type="primary" icon="cloud-upload" @click="modifyFile('add')">上传文件</a-button>
      <a-button type="primary" icon="delete" @click="modifyFile('delete')">删除</a-button>
    </div>

    <!--表格-->
    <a-table size="middle" :columns="columns" :dataSource="loadDatas" :loading="loading" :pagination="pagination" :rowSelection="{type:'checkbox', selectedRowKeys: selectedRowKeys, onChange: updateSelect }">

      <span slot="fileStatus" slot-scope="record">
        <a-tag v-if="record=='enabled'" color="#87d068">启用</a-tag>
        <a-tag v-else-if="record=='disabled'" color="#ff0000">禁用</a-tag>
      </span>
      <template slot="fileSize" slot-scope="record">
        <span>{{parseFloat(record/1024).toFixed(2)}}</span>
      </template>

    </a-table>
    <!--分页-->
    <Pagination :current="currentPage" :pageSizeOptions="pageSizeOptions" :pageSize="pageSize" :total="totalCount" :totalPage="totalPage" @change="changePage"></Pagination>

    <!-- 新建编辑模态框 -->
    <a-modal :width="editType=='add'?'800px':'400px'" :title="modalTitle" :visible="visible" @ok="handleOk" :confirmLoading="confirmLoading" @cancel="handleCancel">
      <p v-if="editType=='delete'">确认删除此任务？</p>
      <div class="modal-container" v-else>
        <div class="clearfix">
          <a-upload :action="action" :headers="headers" listType="picture-card" :fileList="fileList" @preview="handlePreview" @change="handleChange">
            <div v-if="fileList.length < 6">
              <a-icon type="plus" />
              <div class="ant-upload-text">上传</div>
            </div>
          </a-upload>

        </div>
      </div>
    </a-modal>

    <!-- 查看图片模态框 -->
    <a-modal :visible="previewVisible" :footer="null" @cancel="previewCancel">
      <img alt="example" style="width: 100%" :src="previewImage" />
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
    title: "原文件名",
    width: "15%",
    dataIndex: "fileSourceName",
    align: "center"
  },
  {
    title: "文件地址",
    width: "25%",
    dataIndex: "fileUrl",
    align: "center"
  },
  {
    title: "文件大小(kb)",
    width: "10%",
    dataIndex: "fileSize",
    align: "center",
    scopedSlots: { customRender: "fileSize" }
  },
  {
    title: "文件云",
    width: "10%",
    dataIndex: "fileCloud",
    align: "center"
  },
  {
    title: "备注",
    width: "10%",
    dataIndex: "fileRemark",
    align: "center"
  },
  {
    title: "状态",
    width: "10%",
    dataIndex: "fileStatus",
    align: "center",
    scopedSlots: { customRender: "fileStatus" }
  },
  {
    title: "上传时间",
    width: "20%",
    dataIndex: "addDataTime",
    align: "center"
  }
];

export default {
  name: "fileManagement",
  components: {
    Pagination
  },
  data() {
    return {
      advanced: false, // 高级搜索 展开/关闭
      queryParam: {
        fileSourceName: null,
        fileUrl: null,
        fileStatus: ""
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
      modalTitle: "上传文件",
      visible: !1,
      confirmLoading: !1,

      action: BASEURL + "/basic/file/upload",
      headers: { token: this.$ls.get("Access_Token") },
      previewVisible: !1,
      fileList: [],
      previewImage: ""
    };
  },

  methods: {
    initSelectedRows() {
      this.selectedRowKeys = [];
      this.selectedRows = [];
    },

    //查询
    queryFile() {
      this.getFileList();
    },

    //重置
    resetQueryParam() {
      this.queryParam.fileSourceName = null;
      this.queryParam.fileUrl = null;
      this.queryParam.fileStatus = "";
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
        this.deleteFile();
      } else {
        this.visible = !1;
        this.getFileList();
      }
    },

    //操作文件
    modifyFile(e, o) {
      this.editType = e;
      if (this.editType == "add") {
        this.modalTitle = "上传文件";
        this.visible = !0;
      } else if (this.editType == "delete") {
        this.modalTitle = "删除";
        this.visible = !0;
      }
    },

    //数据校验
    checkData() {
      let flag = !0;

      return flag;
    },

    previewCancel() {
      this.previewVisible = !1;
    },

    handlePreview(file) {
      this.previewImage = file.url || file.thumbUrl;
      this.previewVisible = !0;
    },

    handleChange({ fileList }) {
      this.fileList = fileList;
    },

    //删除文件
    deleteFile() {
      let _id = this.selectedRows[0].id;
      let _idsArr = this.selectedRows.map(item => {
        return item.id;
      });
      this.axios({
        url: "basic/file/remove/" + _idsArr,
        method: METHOD_DELETE
      })
        .then(res => {
          if (res.code == 0) {
            this.visible = !1;
            this.$message.success("删除成功！");
            this.getFileList();
          } else {
            this.$message.error(res.msg);
          }
        })
        .catch(err => {
          console.log(err);
        });
    },

    // 获取文件数据列表
    getFileList() {
      this.initSelectedRows();
      let _data = {
        pageSize: this.pageSize,
        currentPage: this.currentPage,
        where: this.queryParam
      };
      this.axios({
        url: "basic/file/pageList",
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
      this.getFileList();
    }
  },
  created() {
    //列表数据请求
    this.getFileList();
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
.ant-upload-select-picture-card i {
  font-size: 32px;
  color: #999;
}

.ant-upload-select-picture-card .ant-upload-text {
  margin-top: 8px;
  color: #666;
}
</style>
