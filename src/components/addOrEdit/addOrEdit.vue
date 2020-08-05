<template>
  <a-modal
    width="800px"
    :title="optionType == 'add' ? '新增' : '编辑'"
    v-model="visible"
    @ok="handleAddOrEdit"
    @cancel="handleCancel"
  >
    <a-form layout="horizontal">
      <a-row :gutter="24">
        <a-col v-for="(item, key) in queryDataBefore" v-if="!(in_array(hiddenAllId, item.param))" :key="key" :md="12" :sm="24">
          <a-form-item :label=item.name :required=item.required >
            <a-select v-if="in_array(allSelectStatus, item.param)" v-model="selectedStatus" @change="changeStatus(key, selectedStatus)">
              <a-select-option v-for="(option, index) in queryAddOrEditStatus" :key="index" :value=option.selectValue>
                {{ option.selectText }}
              </a-select-option>
            </a-select>
            <a-select v-else-if="in_array(supportCustomSign, item.param)" v-model="selectedSupport" @change="changeSupport(key, selectedSupport)">
              <a-select-option v-for="(option, index) in queryAddOrEditSupport" :key="index" :value=option.selectValue>
                {{ option.selectText }}
              </a-select-option>
            </a-select>
            <a-select v-else-if="in_array(supportQueryBalance, item.param)" v-model="selectedQuerySupport" @change="changeQuerySupport(key, selectedQuerySupport)">
              <a-select-option v-for="(option, index) in queryAddOrEditSupport" :key="index" :value=option.selectValue>
                {{ option.selectText }}
              </a-select-option>
            </a-select>
            <a-select v-else-if="in_array(allSelectTaskStatus, item.param)" v-model="selectedSupport" @change="changeSupport(key, selectedSupport)">
              <a-select-option v-for="(option, index) in taskStatus" :key="index" :value=option.selectValue>
                {{ option.selectText }}
              </a-select-option>
            </a-select>
            <a-select v-else-if="in_array(allOperatorSex, item.param)" v-model="selectedGender" @change="changeGender(key, selectedGender)">
              <a-select-option v-for="(option, index) in operatorSex" :key="index" :value=option.selectValue>
                {{ option.selectText }}
              </a-select-option>
            </a-select>
            <a-select v-else-if="in_array(allOperatorLevel, item.param)" v-model="selectedOperatorLevel" @change="changeOperatorLevel(key, selectedOperatorLevel)">
              <a-select-option v-for="(option, index) in operatorLevel" :key="index" :value=option.selectValue>
                {{ option.selectText }}
              </a-select-option>
            </a-select>
            <a-select v-else-if="in_array(allDictLevel, item.param)" v-model="selectedDictLevel" @change="changeDictLevel(key, selectedDictLevel)">
              <a-select-option v-for="(option, index) in dictLevel" :key="index" :value=option.selectValue>
                {{ option.selectText }}
              </a-select-option>
            </a-select>
            <a-select v-else-if="in_array(allResetType, item.param)" v-model="selectedResetType" @change="changeResetType(key, selectedResetType)">
              <a-select-option v-for="(option, index) in resetType" :key="index" :value=option.selectValue>
                {{ option.selectText }}
              </a-select-option>
            </a-select>
            <a-select v-else-if="in_array(allRegionGroupCode, item.param)" v-model="selectedRegionGroupCode" @change="changeRegionGroupCode(key, selectedRegionGroupCode)">
              <a-select-option v-for="(option, index) in regionGroupCode" :key="index" :value=option.selectValue>
                {{ option.selectText }}
              </a-select-option>
            </a-select>
            <a-select v-else-if="item.param == 'appId' || item.param == 'appId'" v-model="selectId" @change="changeId(key, selectId)">
              <a-select-option v-for="(option, index) in appList" :key="index" :value=option.id>
                {{ option.appName }}
              </a-select-option>
            </a-select>
            <a-select v-else-if="item.param == 'menuShowType'" v-model="selectedMenuShowType" @change="changeMenuShowType(key, selectedMenuShowType)">
              <a-select-option v-for="(option, index) in menuShowType" :key="index" :value=option.selectValue>
                {{ option.selectText }}
              </a-select-option>
            </a-select>
            <a-select v-else-if="item.param == 'menuStatus'" v-model="selectedMenuStatus" @change="changeMenuStatus(key, selectedMenuStatus)">
              <a-select-option v-for="(option, index) in menuStatus" :key="index" :value=option.selectValue>
                {{ option.selectText }}
              </a-select-option>
            </a-select>
            <a-select v-else-if="item.param == 'menuType'" v-model="selectedMenuType" @change="changeMenuType(key, selectedMenuType)">
              <a-select-option v-for="(option, index) in menuType" :key="index" :value=option.selectValue>
                {{ option.selectText }}
              </a-select-option>
            </a-select>
            <a-select v-else-if="item.param == 'operatorType'" v-model="selectOperatorType" @change="changeOperatorType(key, selectOperatorType)">
              <a-select-option v-for="(option, index) in operatorType" :value=option.typeCode :key="index">
                {{ option.typeName}}
              </a-select-option>
            </a-select>
            <a-input v-else v-model="item.value" :placeholder="'请输入' + item.name"/>
          </a-form-item>
        </a-col>
      </a-row>
    </a-form>
  </a-modal>
</template>

<script>
  import { BASEURL, METHOD_POST } from '@/api/public';
  import { 
    allSelectStatus, 
    supportCustomSign, 
    supportQueryBalance,
    hiddenAllId, 
    in_array, 
    allSelectTaskStatus, 
    taskStatus,
    operatorSex,
    allOperatorSex,
    allOperatorLevel,
    operatorLevel,
    allDictLevel,
    dictLevel,
    resetType,
    allResetType,
    allRegionGroupCode,
    regionGroupCode,
    menuShowType,
    menuStatus,
    menuType
  } from '@/components/public';
  export default {
    name: "AddOrEdit",
    props: {
      optionType: {
        type: String,
        required: true
      },
      showDlg: {
        type: Boolean,
        required: true
      },
      queryDataBefore: {
        type: Array,
        required: true
      },
      queryAddOrEditStatus: {
        type: Array,
        required: true
      },
      queryAddOrEditSupport: {
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
        currentPage: 1,//当前的页数
        pageSize: 10,//每页显示的条数
        selectedStatus: 'enabled',
        selectedSupport: 'support',
        selectedQuerySupport: 'support',
        selectId: 'c1384aa20d4711e8b3d2fc4dd44915e7',
        selectedGender: 'male',
        selectedOperatorLevel: 'belonging_admin',
        selectedDictLevel: 'whole',
        selectedResetType: 'default',
        selectedRegionGroupCode: 'default',
        allSelectStatus: allSelectStatus,
        supportCustomSign: supportCustomSign,
        supportQueryBalance: supportQueryBalance,
        hiddenAllId: hiddenAllId,
        in_array: in_array,
        visible: false,
        allSelectTaskStatus: allSelectTaskStatus,
        taskStatus: taskStatus,
        allOperatorSex: allOperatorSex,
        operatorSex: operatorSex,
        operatorLevel: operatorLevel,
        allOperatorLevel: allOperatorLevel,
        dictLevel: dictLevel,
        allDictLevel: allDictLevel,
        resetType: resetType,
        allResetType: allResetType,
        regionGroupCode: regionGroupCode,
        allRegionGroupCode: allRegionGroupCode,
        menuShowType: menuShowType,
        menuStatus: menuStatus,
        menuType: menuType,
        selectedMenuShowType: 'display',
        selectedMenuStatus: 'enabled',
        selectedMenuType: 'menu',
        operatorType: [],
        selectOperatorType: 'supplier_supplier'
      }
    },
    watch: {
      'showDlg': function (showDlg) {
        this.visible = showDlg
      }
    },
    methods: {
      // 状态选择
      changeOperatorType(key, selectOperatorType) {
        this.queryDataBefore[key].value = selectOperatorType
      },
      changeMenuType(key, selectedMenuType) {
        this.queryDataBefore[key].value = selectedMenuType
      },
      changeMenuStatus(key, selectedMenuStatus) {
        this.queryDataBefore[key].value = selectedMenuStatus
      },
      changeMenuShowType(key, selectedMenuShowType) {
        this.queryDataBefore[key].value = selectedMenuShowType
      },
      changeQuerySupport(key, selectedQuerySupport) {
        this.queryDataBefore[key].value = selectedQuerySupport
      },
      changeRegionGroupCode(key, selectedRegionGroupCode){
        this.queryDataBefore[key].value = selectedRegionGroupCode
      },
      changeResetType(key, selectedResetType) {
        this.queryDataBefore[key].value = selectedResetType
      },
      changeDictLevel(key, selectedDictLevel) {
        this.queryDataBefore[key].value = selectedDictLevel
      },
      changeOperatorLevel(key, selectedOperatorLevel) {
        this.queryDataBefore[key].value = selectedOperatorLevel
      },
      changeGender(key, selectedGender) {
        this.queryDataBefore[key].value = selectedGender
      },
      changeStatus(key, selectedStatus) {
        this.queryDataBefore[key].value = selectedStatus
      },
      changeSupport(key, selectedSupport) {
        this.queryDataBefore[key].value = selectedSupport
      },
      changeId(key, selectId) {
        this.queryDataBefore[key].value = selectId
      },
      valCheck(data){
        let flag = true
        let phoneReg = /^[1][3,4,5,7,8][0-9]{9}$/; // 手机号
        let cardReg = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/; // 身份证验证
        for(let i in data) {
          if(data[i].param == 'userMobilePhone') {
              if(!phoneReg.test(data[i].value)) {
                this.$message.warning('请输入正确的手机号码！');
                flag = false;
              }
            }
          if(data[i].param == 'operatorPid') {
            if(!cardReg.test(data[i].value)) {
              this.$message.warning('请输入正确的身份证！');
              flag = false;
            }
          }
          if(data[i].param != 'id' && data[i].required && data[i].value == null) {
            flag = false;
            console.log(i)
          }
        }
        return flag;
      },
      handleAddOrEdit() {
        console.log(this.queryDataBefore)
        let flag = this.valCheck(this.queryDataBefore)
        console.log(flag)
        if(!flag) {
          this.$message.warning('请输入必填项！');
          return;
        } else {
          for(let i in his.queryDataBeftore) {
            
          }
          this.$emit('handleAddOrEdit', this.queryDataBefore )
          console.log(111)
          this.$emit('update:showDlg', this.showDlg)
        }
      },
      handleCancel() {
        this.$emit('handleCancel', this.queryDataBefore )
        this.$emit('update:showDlg', this.showDlg)
      },
    },
    mounted() {
      let data = { currentPage:1, pageSize:10, where: {} }
      for(let i in this.queryDataBefore) {
        if(this.queryDataBefore[i].param === 'operatorType') {
          this.queryDataBefore[i].value === this.selectOperatorType
          this.axios({
            url:  'basic/operatorType/pageList',
            method: METHOD_POST,
            data: data
          }).then(res=>{
            console.log(res)
            if(res.code == 0) {
              this.operatorType = res.page.list
              console.log(this.operatorType)
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