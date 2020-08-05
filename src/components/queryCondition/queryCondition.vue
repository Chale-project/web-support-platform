<template>
  <div class="table-page-search-wrapper">
    <a-form layout="inline">
      <a-row :gutter="48">
        <a-col v-if="appList.length > 0" :md="8" :sm="24">
          <a-form-item label="应用归属">
            <a-select placeholder="请选择" @change="changeAppID">
              <a-select-option v-for="(option,key) in appList" :value=option.id :key="key">
                {{ option.appName }}
              </a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
        <template v-if="appList.length > 0">
          <a-col v-for="(item, key) in queryValue" :key="key" :md="8" :sm="24">
            <a-form-item :label=item.name v-if="key < num">
              <a-select v-if="in_array(allSelectStatus, item.param)" v-model="selected" @change="changeStatus(key)">
                <a-select-option v-for="(option,index) in queryStatus" :value=option.selectValue :key="index">
                  {{ option.selectText }}
                </a-select-option>
              </a-select>
              <a-select v-else-if="in_array(allSelectMessageStatus, item.param)" v-model="selectMessageStatus" @change="changeMessageStatus(key)">
                <a-select-option v-for="(option,index) in smsSendStatus" :value=option.selectValue :key="index">
                  {{ option.selectText }}
                </a-select-option>
              </a-select>
              <a-select v-else-if="in_array(supportCustomSign, item.param)" v-model="selectedQuerySupport" @change="changeQuerySupport(key)">
                <a-select-option v-for="(option,index) in querySupport" :value=option.selectValue :key="index">
                  {{ option.selectText }}
                </a-select-option>
              </a-select>
              <a-select v-else-if="in_array(supportQueryBalance, item.param)" v-model="selectedSupport" @change="changeSupport(key)">
                <a-select-option v-for="(option,index) in querySupport" :value=option.selectValue :key="index">
                  {{ option.selectText }}
                </a-select-option>
              </a-select>
              <a-select v-else-if="in_array(allSelectTaskStatus, item.param)" v-model="selectTaskStatus" @change="changeTaskStatus(key)">
                <a-select-option v-for="(option,index) in taskStatus" :value=option.selectValue :key="index">
                  {{ option.selectText }}
                </a-select-option>
              </a-select>
              <a-select v-else-if="in_array(allUserType, item.param)" v-model="selectUserType" @change="changeUserType(key)">
                <a-select-option v-for="(option,index) in userType" :value=option.selectValue :key="index">
                  {{ option.selectText }}
                </a-select-option>
              </a-select>
              <a-select v-else-if="item.param == 'operatorType'" v-model="selectOperatorType" @change="changeOperatorType(key)">
                <a-select-option v-for="(option,index) in operatorType" :value=option.id :key="index">
                  {{ option.typeName}}
                </a-select-option>
              </a-select>
              <a-input v-else v-model="item.value" :placeholder="'请输入' + item.name"/>
            </a-form-item>
          </a-col>
        </template>
        <template v-else>
          <a-col v-for="(item, key) in queryValue" :key="key" :md="8" :sm="24">
            <a-form-item :label=item.name v-if="key < twoNum">
              <a-select v-if="in_array(allSelectStatus, item.param)" v-model="selected" @change="changeStatus(key)">
                <a-select-option v-for="(option,index) in queryStatus" :value=option.selectValue :key="index">
                  {{ option.selectText }}
                </a-select-option>
              </a-select>
              <a-select v-else-if="in_array(allSelectMessageStatus, item.param)" v-model="selectMessageStatus" @change="changeMessageStatus(key)">
                <a-select-option v-for="(option,index) in smsSendStatus" :value=option.selectValue :key="index">
                  {{ option.selectText }}
                </a-select-option>
              </a-select>
              <a-select v-else-if="in_array(supportCustomSign, item.param)" v-model="selectedQuerySupport" @change="changeQuerySupport(key)">
                <a-select-option v-for="(option,index) in querySupport" :value=option.selectValue :key="index">
                  {{ option.selectText }}
                </a-select-option>
              </a-select>
              <a-select v-else-if="in_array(supportQueryBalance, item.param)" v-model="selectedSupport" @change="changeSupport(key)">
                <a-select-option v-for="(option,index) in querySupport" :value=option.selectValue :key="index">
                  {{ option.selectText }}
                </a-select-option>
              </a-select>
              <a-select v-else-if="in_array(allSelectTaskStatus, item.param)" v-model="selectTaskStatus" @change="changeTaskStatus(key)">
                <a-select-option v-for="(option,index) in taskStatus" :value=option.selectValue :key="index">
                  {{ option.selectText }}
                </a-select-option>
              </a-select>
              <a-select v-else-if="in_array(allUserType, item.param)" v-model="selectUserType" @change="changeUserType(key)">
                <a-select-option v-for="(option,index) in userType" :value=option.selectValue :key="index">
                  {{ option.selectText }}
                </a-select-option>
              </a-select>
              <a-select v-else-if="item.param == 'operatorType'" v-model="selectOperatorType" @change="changeOperatorType(key)">
                <a-select-option v-for="(option,index) in operatorType" :value=option.id :key="index">
                  {{ option.typeName}}
                </a-select-option>
              </a-select>
              <a-input v-else v-model="item.value" :placeholder="'请输入' + item.name"/>
            </a-form-item>
          </a-col>
        </template>
        <a-col :md="!(advanced) && 8 || 24" :sm="24">
          <span class="table-page-search-submitButtons" :style="advanced && { float: 'right', overflow: 'hidden' } || {} ">
            <a-button type="primary" @click="inquire">查询</a-button>
            <a-button style="margin-left: 8px" @click="resetting">重置</a-button>
            <a @click="toggleAdvanced" style="margin-left: 8px">
              {{ advanced ? '收起' : '展开' }}
              <a-icon :type="advanced ? 'up' : 'down'"/>
            </a>
          </span>
        </a-col>
      </a-row>
    </a-form>
  </div>
</template>

<script>
  import { 
    allSelectStatus, 
    supportCustomSign,
    supportQueryBalance, 
    allSelectMessageStatus, 
    in_array, 
    smsSendStatus, 
    allSelectTaskStatus, 
    taskStatus,
    querySupport,
    allUserType,
    userType
  } from '@/components/public';
  import { BASEURL, METHOD_POST } from '@/api/public';

  export default {
    name: "QueryCondition",
    props: {
      queryValue: {
        type: Array,
        required: true
      },
      queryStatus: {
        type: Array,
        required: true
      },
      appList: {
        type: Array,
        required: true
      }
    },
    data() {
      return {
        num: 1,
        twoNum: 2,
        selected: '全部',
        selectMessageStatus: '全部',
        selectedSupport: '全部',
        selectedQuerySupport: '全部',
        selectTaskStatus: '全部',
        selectUserType: '全部',
        querySupport: querySupport,
        advanced: false,
        allSelectStatus: allSelectStatus,
        allSelectMessageStatus: allSelectMessageStatus,
        supportCustomSign: supportCustomSign,
        supportQueryBalance: supportQueryBalance,
        in_array: in_array,
        smsSendStatus: smsSendStatus,
        allSelectTaskStatus: allSelectTaskStatus,
        taskStatus: taskStatus,
        allUserType: allUserType,
        userType: userType,
        operatorType: [],
        selectOperatorType: '全部'
      }
    },
    methods: {
      changeAppID(e) {
        console.log(e)
        this.appId = e
        this.$emit("changeAppID", e)
      },
      // 状态选择
      changeMessageStatus(key) {
        this.queryValue[key].value = this.selectMessageStatus
      },
      changeQuerySupport(key) {
        this.queryValue[key].value = this.selectedQuerySupport
      },
      changeSupport(key) {
        this.queryValue[key].value = this.selectedSupport
      },
      changeTaskStatus(key) {
        this.queryValue[key].value = this.selectTaskStatus
      },
      changeUserType(key) {
        this.queryValue[key].value = this.selectUserType
      },
      changeStatus(key) {
        this.queryValue[key].value = this.selected
      },
      changeOperatorType(key) {
        this.queryValue[key].value = this.selectOperatorType
      },

      //收起&展开
      toggleAdvanced(){
        this.advanced = !this.advanced
        if(this.appList.length > 0) {
          if(this.num == 1) {
            this.num = this.queryValue.length
            } else {
            this.num = 1
          }
        } else {
          if(this.twoNum == 2) {
            this.twoNum = this.queryValue.length
            } else {
            this.twoNum = 2
          }
        }
      },

      // 点击查询
      inquire() {
        this.$emit("inquire", this.queryValue)
      },

      // 重置
      resetting() {
        this.queryValue.forEach(item => {
          item.value = null
        });
        this.selected = '全部',
        this.selectMessageStatus = '全部',
        this.selectedSupport = '全部',
        this.selectedQuerySupport = '全部',
        this.selectTaskStatus = '全部',
        this.selectUserType = '全部'
      }
    },
    mounted() {
      let data = { currentPage:1, pageSize:10, where: this.queryCondition }
      for(let i in this.queryValue) {
        if(this.queryValue[i].param === 'operatorType') {
          this.axios({
            url:  'basic/operatorType/pageList',
            method: METHOD_POST,
            data: data
          }).then(res=>{
            if(res.code == 0) {
              this.operatorType = res.page.list
            } else {
              this.$message.error(res.msg);
            }
          }).catch(() => {
            this.loading = false;
            this.$message.error('请求超时！');
          })
          }
      } 
    }

  }
</script>

<style scoped>

</style>