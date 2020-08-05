<template>
  <div style="background:#fff ;padding:25px;position: relative">
    <QueryCondition
      :queryValue = "queryValue"
      :queryStatus = "queryStatus"
      :appList = "appList"
      @inquire = "inquire"
      @changeAppID = "changeAppID"
    >
    </QueryCondition>

    <!--功能按钮-->
    <div class="table-operator">
      <div style="display: inline"><a-button type="primary" @click="addOrEditButton('add')" icon="plus">新建</a-button></div>
      <div style="display: inline"><a-button type="primary" @click="addOrEditButton('edit')" icon="edit">编辑</a-button></div>
      <AddOrEdit
        :optionType="optionType"
        :showDlg="showDlg"
        :queryDataBefore="query"
        :queryAddOrEditStatus="queryAddOrEditStatus"
        :queryAddOrEditSupport="queryAddOrEditSupport"
        :appList = "appList"
        @handleAddOrEdit="handleAddOrEdit"
        @handleCancel="handleCancel"
      >
      </AddOrEdit>
      <!-- <a-dropdown>
        <a-menu slot="overlay">
          <a-menu-item key="1">启用</a-menu-item>
          <a-menu-item key="2">禁用</a-menu-item>
          <a-menu-item key="3">删除</a-menu-item>
        </a-menu>
        <a-button style="color: rgb(24, 144, 255)">
          批量操作 <a-icon type="down" />
        </a-button>
      </a-dropdown> -->
    </div>
    <p style="height:40px;background:#e6f7ff;lineHeight:40px;padding:0 10px;border:1px solid #bae7ff">已选择&nbsp;<span style="color:#1890ff">{{ choose }}</span>&nbsp;项&nbsp;&nbsp;<span @click="handleDelete" style="color:#1890ff;cursor:pointer;">清空</span></p>
    <!--表格-->
    <a-table
      style="background:#fff"
      :rowSelection="{selectedRowKeys: selectedRowKeys, onChange: onSelectChange}"
      type="radio"
      :columns="columns"
      :dataSource="data"
      :pagination="pagination"
      :loading="loading"
    >
      <span slot="regionGroupCode" slot-scope="regionGroupCode">
        <span v-if="regionGroupCode=='default'">默认</span>
        <span v-else>其他</span>
      </span>
      <span slot="regionStatus" slot-scope="regionStatus">
        <span v-if="regionStatus=='enabled'">启用</span>
        <span v-else>禁用</span>
      </span>
      <span slot="row_handles" slot-scope="regionStatus">
        <span v-if="regionStatus=='enabled'">禁用</span>
        <span v-else>启用</span>
      </span>
    </a-table>
    <!--分页-->
    <Pagination
      :current="current"
      :pageSizeOptions="pageSizeOptions"
      :pageSize="pageSize"
      :total="total"
      :totalPage="totalPage"
      @change="change"
    >
    </Pagination>
  </div>
</template>

<script>
  import STable from '@/components/table/';
  import Pagination from '@/components/pagination/pagination';
  import QueryCondition from '@/components/queryCondition/queryCondition';
  import AddOrEdit from '@/components/addOrEdit/addOrEdit';
  import { BASEURL, METHOD_POST, METHOD_DELETE, METHOD_PUT } from '@/api/public';
  import { queryStatus, querySupport, queryAddOrEditStatus, queryAddOrEditSupport } from '@/components/public';

  const columns = [{
    title: '区域名称',
    dataIndex: 'regionName',
    align:'center'
  }, {
    title: '区域代码',
    dataIndex: 'regionCode',
    align:'center'
  }, {
    title: '上级区域',
    dataIndex: 'parentRegionId',
    align:'center'
  }, {
    title: '排序号',
    dataIndex: 'sortNo',
    align:'center'
  }, {
    title: '分组',
    dataIndex: 'regionGroupCode',
    align:'center',
    scopedSlots: { customRender: 'regionGroupCode' },
  }, {
    title: '状态',
    dataIndex: 'regionStatus',
    align:'center',
    scopedSlots: { customRender: 'regionStatus' },
  }, {
    title: '备注',
    dataIndex: 'regionRemark',
    align:'center'
  }];

  const queryValue = [
    { param: 'regionName', name: '区域名称', value: null },
    { param: 'regionStatus', name: '状态', value: null },
    { param: 'regionCode', name: '区域代码', value: null },
    { param: 'regionGroupCode', name: '分组', value: null }
  ];
  const queryData = [
    { param: 'id', name: '区域ID', required: true, value: null },
    { param: 'parentRegionId', name: '上级区域ID', value: null },
    { param: 'regionCode', name: '区域代码', required: true, value: null },
    { param: 'regionGroupCode', name: '分组', required: true, value: 'default' },
    { param: 'regionName', required: true, name: '区域名称', value: null },
    { param: 'regionRemark', name: '备注', value: null },
    { param: 'regionStatus', required: true, name: '状态', value: 'enabled' },
    { param: 'sortNo', required: true, name: '排序号', value: null }
  ]
  //数据
  const data = [{}];
  const query = [];
  export default {
    name: "TableList",
    components: {
      STable,
      Pagination,
      QueryCondition,
      AddOrEdit
    },
    data(){
      return{
        advanced:false,
        data,//表格请求的数据
        columns,//表头
        pagination:false,//不显示分页
        //分页
        pageSizeOptions: ['10', '20', '50', '100'],
        current: 1,//当前的页数
        pageSize:0,//每页显示的条数
        totalPage:0,//总页数
        total: 0,//总条数
        loading:true,
        choose:0,//已选择多少项
        showQuickJumper:true,//显示跳转页
        optionType: '',
        showDlg: false,
        queryAddOrEditSupport: queryAddOrEditSupport,
        queryAddOrEditStatus: queryAddOrEditStatus,
        queryStatus: queryStatus,
        querySupport: querySupport,
        queryValue,
        query,
        queryData,
        selectedRowKeys: [], // Check here to configure the default column
        queryCondition: {},
        appList: [],
        appId: null
      }
    },
    watch: {
      selectedRowKeys: function(selectedRowKeys) {
        console.log(selectedRowKeys)
        this.choose = selectedRowKeys.length
      }
    },
    methods:{
      onSelectChange (selectedRowKeys) {
        console.log('selectedRowKeys changed: ', selectedRowKeys);
        this.selectedRowKeys = selectedRowKeys
      },
      // 清空
      handleDelete() {
        let that = this
        if(that.selectedRowKeys.length < 1) {
          this.$message.warning('请至少选择一条记录！')
        } else {
          this.$confirm({
            title: '提示',
            content: '请确定是否清空数据?',
            onOk() {
              let idArray = [];
              for(let i = 0; i < that.selectedRowKeys.length; i++) {
               let index = that.selectedRowKeys[i]
                for(let j = 0; j < that.data.length; j++) {
                  if(index==j){
                  idArray.push(that.data[j].id)
                  }
                }
              }
              that.loading = true
              that.axios({
                url:  'basic/region/province/remove/' + idArray,
                method: METHOD_DELETE
              }).then((res) => {
                //请求成功
                that.loading = false
                console.log(res)
                if(res.code == 0) {
                  that.$message.success('清空成功！');
                  that.selectedRowKeys = []
                  let data = { currentPage:that.current, pageSize:that.pageSize, where: that.queryCondition }
                  that.listAPI(data);
                } else {
                  that.$message.success(res.msg);
                }}).catch(() => {
                that.loading = false;
                that.$message.error('请求超时！');
              })
            },
            onCancel() {
              that.loading = false
            },
          });
        }
      },
      // 取消
      handleCancel() {
        this.showDlg = false
        this.query = JSON.parse(JSON.stringify(this.queryData))
        console.log(this.queryData)
        console.log(this.query)
      },
      // 新增 || 编辑 确定
      handleAddOrEdit(data) {
        this.showDlg = false
        this.query = JSON.parse(JSON.stringify(this.queryData))
        console.log(data)
        this.loading = true
        let queryEditCondition = {};
        data.forEach(item => {
          queryEditCondition[item.param] = item.value
        })
        if(this.optionType == 'add') {
          // 新增
          this.addOrEditDatalist('basic/region/province/add', queryEditCondition, METHOD_POST)
        } else if (this.optionType == 'edit') {
          // 编辑
          this.addOrEditDatalist('basic/region/province/modify', queryEditCondition, METHOD_PUT)
        }
      },
      // 新增数据请求
      addOrEditDatalist(url, data , method) {
        this.axios({
          url:  url,
          method: method,
          data: data
        }).then(res=>{
          console.log(res)
          this.loading=false
          console.log(11)
          console.log(res.code)
          if(res.code == 0) {
            this.$message.success("操作成功！");
            this.selectedRowKeys = []
            let data = { currentPage:this.current, pageSize:this.pageSize, where: this.queryCondition }
            this.listAPI(data);
          } else {
            this.$message.error(res.msg);
          }
        }).catch(() => {
          this.loading = false;
          this.$message.error('请求超时！');
        })
      },
      // 编剧数据请求
      // 新增 || 编辑
      addOrEditButton(e) {
        console.log(e)
        this.optionType = e;
        if(this.optionType == 'edit') {
          if(this.selectedRowKeys.length == 1) {
            let index = this.selectedRowKeys[0]
            console.log(index)
            let queryEditData = this.data[index]
            this.query.forEach(item => {
              for(let key in queryEditData) {
                if(item.param == key) {
                  item.value = queryEditData[key]
                }
              }
            })
            this.showDlg = true;
          } else {
            this.$message.warning('请选择一条记录！')
          }
        } else {
          this.showDlg = true;
        }
      },
      // 头部查询
      inquire(data) {
        if(this.appList.length > 0) {
          this.queryCondition["appId"] = this.appId
        }
        data.forEach(item => {
          this.queryCondition[item.param] = item.value
        })
        this.axios({
          url:  'basic/region/province/pageList',
          method: METHOD_POST,
          data: {
            currentPage:1,
            pageSize:10,
            where: this.queryCondition
          }}).then(res=>{
          console.log(res)
          this.loading=false
          if(res.code == 0) {
            this.dealData(res)
          } else {
            this.$message.error(res.msg);
          }
        }).catch(() => {
          this.loading = false;
          this.$message.error('请求超时！');
        })
      },
      // 处理数据
      dealData(res) {
        this.data = res.page.list
        this.current =  res.page.currentPage
        this.totalPage = res.page.totalPage
        this.total = res.page.totalCount
        this.pageSize = res.page.pageSize
      },
      // 列表请求
      listAPI(data) {
        this.axios({
          url:  'basic/region/province/pageList',
          method: METHOD_POST,
          data: data
        }).then(res=>{
          console.log(res)
          this.loading=false
          if(res.code == 0) {
            this.dealData(res)
          } else {
            this.$message.error(res.msg);
          }
        }).catch(() => {
          this.loading = false;
          this.$message.error('请求超时！');
        })
      },
      //分页
      change(data) {
        let requestData = data;
        requestData.where = this.queryCondition
        console.log(requestData)
        this.listAPI(requestData);
      },
      // 获取应用归属id
      changeAppID(data) {
        console.log(data)
        this.appId = data
      }
    },
    created(){//列表数据请求
      this.query = JSON.parse(JSON.stringify(this.queryData))
      let data = { currentPage:1, pageSize:10, where: this.queryCondition }
      this.listAPI(data);
    }
  }
</script>

<style scoped>
  .table-operator{
    margin-bottom: 10px;
  }
  .ant-pagination{
    margin-top: 20px;
    text-align: center
  }
</style>
