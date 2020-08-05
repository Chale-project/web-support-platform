<template>
  <div style="background:#fff ;padding:25px;position: relative">
    <div class="table-page-search-wrapper">
      <a-form layout="inline">
        <a-row :gutter="48">
          <a-col :md="8" :sm="24">
            <a-form-item label="应用平台">
              <a-select placeholder="请选择" v-model="curAppId" @change="choiceAppId">
                <a-select-option :value="v.id" v-for="(v,i) of appList" :key="i">{{v.appName}}</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </div>

    <!--功能按钮-->
    <div class="table-operator">
      <a-button type="primary" icon="plus" @click="addOrEditOrRemoveMenu('add')">新建</a-button>
      <a-button type="primary" icon="edit" @click="addOrEditOrRemoveMenu('edit')">编辑</a-button>
      <a-button type="primary" icon="delete" @click="addOrEditOrRemoveMenu('delete')">删除</a-button>
    </div>

    <!--表格-->
    <a-table size="middle" :columns="columns" :dataSource="loadDatas" :loading="loading" :pagination="pagination" :rowSelection="{type:'radio', selectedRowKeys: selectedRowKeys, onChange: updateSelect }">
      <span slot="menuType" slot-scope="record">
        <a-tag v-if="record=='catalog'" color="#108ee9">栏目</a-tag>
        <a-tag v-else-if="record=='menu'" color="#2db7f5">菜单</a-tag>
        <a-tag v-else-if="record=='button'" color="#f0ad4e">按钮</a-tag>
      </span>

      <span slot="menuStatus" slot-scope="record">
        <a-tag v-if="record=='enabled'" color="#87d068">启用</a-tag>
        <a-tag v-else-if="record=='disabled'" color="#ff0000">禁用</a-tag>
      </span>

      <span slot="menuShowType" slot-scope="record">
        <a-tag v-if="record=='display'" color="#87d068">显示</a-tag>
        <a-tag v-else-if="record=='hide'" color="#ff0000">隐藏</a-tag>
      </span>
    </a-table>

    <!-- 新建编辑模态框 -->
    <a-modal :width="editType=='delete'?'400px':'800px'" :title="modalTitle" :visible="visible" @ok="handleOk" :confirmLoading="confirmLoading" @cancel="handleCancel">
      <p v-if="editType=='delete'">确认删除此项码？</p>
      <a-form v-else>
        <a-row :gutter="24">
          <a-col :md="12" :sm="24">
            <a-form-item label="应用平台" :required="true">
              <a-select placeholder="请选择" v-model="froms.appId" disabled>
                <a-select-option :value="v.id" v-for="(v,i) of appList" :key="i">{{v.appName}}</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :md="12" :sm="24">
            <a-form-item label="菜单类型" :required="true">
              <a-radio-group v-model="froms.menuType">
                <a-radio value="catalog">栏目</a-radio>
                <a-radio value="menu">菜单</a-radio>
                <a-radio value="button">按钮</a-radio>
                <a-radio value="url">URL</a-radio>
              </a-radio-group>
            </a-form-item>
          </a-col>
          <a-col :md="12" :sm="24">
            <a-form-item :label="froms.menuType=='catalog'?'栏目名称':froms.menuType=='menu'?'菜单名称':froms.menuType=='button'?'按钮名称':'URL名称'" :required="true">
              <a-input v-model="froms.menuName" placeholder="请填写栏目、菜单、按钮或URL名称" />
            </a-form-item>
          </a-col>
          <a-col :md="12" :sm="24">
            <a-form-item label="上级菜单" :required="true">
              <a-tree-select :dropdownStyle="{ maxHeight: '400px', overflow: 'auto' }" :treeData="menuTreeData" placeholder='请选择所属上级菜单' v-model="froms.parentMenuId" @change="onChangeParentMenu">
              </a-tree-select>
            </a-form-item>
          </a-col>
          <a-col :md="12" :sm="24">
            <a-form-item :label="froms.menuType=='button'?'按钮代码':'菜单代码'" :required="froms.menuType=='button'?false:true">
              <a-input v-model="froms.menuCode" placeholder="请填写菜单或按钮名称（如：menuCode）" />
            </a-form-item>
          </a-col>

          <a-col :md="12" :sm="24">
            <a-form-item label="菜单路径" :required="froms.menuType=='button'?false:true">
              <a-input v-model="froms.menuPath" placeholder="请填写菜单路径（如：/system）" />
            </a-form-item>
          </a-col>
          <a-col :md="12" :sm="24">
            <a-form-item label="菜单重定向路径">
              <a-input v-model="froms.menuContextPath" placeholder="请填写重定向路径（如：/system/children）" />
            </a-form-item>
          </a-col>
          <a-col :md="12" :sm="24">
            <a-form-item label="菜单ICON">
              <a-input v-model="froms.menuIcon" placeholder="请填写菜单ICON" />
            </a-form-item>
          </a-col>
          <a-col :md="12" :sm="24">
            <a-form-item label="菜单引用组件">
              <a-input v-model="froms.menuRemark" placeholder="请填写菜单引用组件" />
            </a-form-item>
          </a-col>

          <a-col :md="12" :sm="24">
            <a-form-item label="授权标识">
              <a-input v-model="froms.menuPerms" placeholder="请填写授权标识" />
            </a-form-item>
          </a-col>
          <a-col :md="12" :sm="24">
            <a-form-item label="菜单排序">
              <a-input v-model="froms.sortNo" placeholder="请填写菜单排序（如：0，1，2...9999。）" />
            </a-form-item>
          </a-col>

          <a-col :md="12" :sm="24" v-show="editType=='edit'">
            <a-form-item label="是否启用">
              <a-select placeholder="请选择" v-model="froms.menuStatus">
                <a-select-option value="enabled">启用</a-select-option>
                <a-select-option value="disabled">禁用</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :md="12" :sm="24">
            <a-form-item label="是否显示">
              <a-select placeholder="请选择" v-model="froms.menuShowType">
                <a-select-option value="display">显示</a-select-option>
                <a-select-option value="hide">隐藏</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>

        </a-row>
      </a-form>
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
    title: "菜单名称",
    width: "18%",
    dataIndex: "menuName"
  },
  {
    title: "上级菜单",
    width: "10%",
    dataIndex: "parentMenuName",
    align: "center"
  },
  {
    title: "类型",
    width: "8%",
    dataIndex: "menuType",
    align: "center",
    scopedSlots: { customRender: "menuType" }
  },
  {
    title: "菜单代码",
    width: "10%",
    dataIndex: "menuCode",
    align: "center"
  },

  {
    title: "图标",
    width: "10%",
    dataIndex: "menuIcon",
    align: "center"
  },

  {
    title: "排序号",
    width: "8%",
    dataIndex: "sortNo",
    align: "center"
  },
  {
    title: "菜单地址",
    width: "10%",
    dataIndex: "menuPath",
    align: "center"
  },
  // {
  //   title: "重定向路径",
  //   width: "10%",
  //   dataIndex: "menuContextPath",
  //   align: "center"
  // },
  {
    title: "授权标识",
    width: "10%",
    dataIndex: "menuPerms",
    align: "center"
  },
  {
    title: "菜单状态",
    width: "8%",
    dataIndex: "menuStatus",
    align: "center",
    scopedSlots: { customRender: "menuStatus" }
  },
  {
    title: "是否显示",
    width: "8%",
    dataIndex: "menuShowType",
    align: "center",
    scopedSlots: { customRender: "menuShowType" }
  }
];

export default {
  name: "menuManagement",
  components: {
    Pagination
  },
  data() {
    return {
      advanced: false,
      loadDatas: [], //表格请求的数据
      columns: columns, //表头
      pagination: false, //不显示分页

      loading: true,

      curAppId: null,
      appList: [],
      selectedRowKeys: [], //选中行键
      selectedRows: [], //选中行键值,

      editType: "add",
      modalTitle: "新建",
      visible: !1,
      confirmLoading: !1,

      menuTreeData: [],
      froms: {}
    };
  },
  watch: {},
  methods: {
    //选择appid
    choiceAppId(id) {
      this.curAppId = id;
      // this.froms.appId = id;
      this.getMenuButList();
      this.getMenuList();
    },

    //选择跟新table中的某项
    updateSelect(selectedRowKeys, selectedRows) {
      console.log(selectedRows);
      this.selectedRowKeys = selectedRowKeys;
      this.selectedRows = selectedRows;
    },

    //新建Or编辑菜单
    addOrEditOrRemoveMenu(e) {
      this.editType = e;
      if (this.editType == "add") {
        this.modalTitle = "新建";
        this.visible = !0;

        this.froms = {
          appId: this.curAppId,
          menuType: "catalog",
          menuName: null,
          parentMenuId: null,
          parentMenuName: null,
          menuCode: null,
          menuPath: null,
          menuContextPath: null,
          menuIcon: null,
          menuRemark: null,
          menuPerms: null,
          sortNo: null,
          menuStatus: "enabled",
          menuShowType: "display"
        };
      } else if (this.editType == "edit") {
        if (this.selectedRows.length < 1) {
          this.$message.warning("请选择编辑项！");
          return false;
        } else {
          this.modalTitle = "编辑";
          this.getMenuInfo();
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

    //选择父菜单
    onChangeParentMenu(v, l) {
      this.froms.parentMenuId = v;
      this.froms.parentMenuName = l.join(",");
    },

    //取消
    handleCancel() {
      this.visible = !1;
    },

    //确认
    handleOk() {
      let _type = this.editType;
      if (_type == "delete") {
        this.deleteMenu();
      } else {
        const flag = this.checkData();
        flag && this.addOrEditMenu();
      }
    },

    //数据校验
    checkData() {
      let flag = !0;
      if (!this.froms.menuName) {
        flag = !1;
        this.$message.warning("请填写菜单名称！");
        return false;
      } else if (this.froms.menuType != "button" && !this.froms.menuCode) {
        flag = !1;
        this.$message.warning("请填写菜单代码！");
        return false;
      } else if (this.froms.menuType != "button" && !this.froms.menuPath) {
        flag = !1;
        this.$message.warning("请填写菜单路径！");
        return false;
      } else if (
        (this.froms.menuType == "menu" || this.froms.menuType == "button") &&
        !this.froms.parentMenuId
      ) {
        flag = !1;
        this.$message.warning("请选择上级菜单！");
        return false;
      } else {
        return flag;
      }
    },

    //添加菜单
    addOrEditMenu() {
      let _type = this.editType;
      let data = this.froms;
      this.axios({
        url: _type == "add" ? "basic/menu/add" : "basic/menu/modify",
        method: _type == "add" ? METHOD_POST : METHOD_PUT,
        data: data
      })
        .then(res => {
          if (res.code == 0) {
            this.visible = !1;
            this.$message.success("操作成功！");
            this.getMenuButList();
          } else {
            this.$message.error(res.msg);
          }
        })
        .catch(err => {
          console.log(err);
        });
    },

    //删除菜单
    deleteMenu() {
      let _id = this.selectedRows[0].id;
      this.axios({
        url: "basic/menu/remove/" + _id,
        method: METHOD_DELETE
      })
        .then(res => {
          if (res.code == 0) {
            this.visible = !1;
            this.$message.success("删除成功！");
            this.getMenuButList();
          } else {
            this.$message.error(res.msg);
          }
        })
        .catch(err => {
          console.log(err);
        });
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
                this.curAppId = res.appList[0].id;
                // this.froms.appId = res.appList[0].id;
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

    //获取对应App菜单&按钮列表
    getMenuButList() {
      this.axios({
        url: "basic/menu/list/" + this.curAppId,
        method: METHOD_GET
      })
        .then(res => {
          this.loading = !1;
          if (res.length > 0) {
            this.setMenuButList(res);
          } else {
            this.loadDatas = [];
          }
        })
        .catch(err => {
          console.log(err);
        });
    },

    setMenuButList(arr) {
      const _menyList = toTree(arr);
      this.loadDatas = _menyList;
    },

    getMenuInfo() {
      const _id = this.selectedRows[0].id;
      this.axios({
        url: "basic/menu/info/" + _id,
        method: METHOD_GET
      })
        .then(res => {
          this.visible = !0;
          if (res.code == 0) {
            this.visible = !0;
            this.froms = res.menu;
          } else {
            this.$message.error(res.msg);
          }
        })
        .catch(err => {
          console.log(err);
        });
    },

    //获取对应App菜单列表
    getMenuList() {
      this.axios({
        url: "basic/menu/select/" + this.curAppId,
        method: METHOD_GET
      })
        .then(res => {
          if (res.code == 0 && res.menuList.length > 0)
            this.setMenuList(res.menuList);
        })
        .catch(err => {
          console.log(err);
        });
    },

    setMenuList(arr) {
      arr.splice(arr.length - 1, 1);
      const _pmenuList = toTree(arr);
      _pmenuList.forEach(pitem => {
        delete pitem.addDataTime;
        delete pitem.modifyDataTime;
        delete pitem.appId;
        delete pitem.id;
        delete pitem.menuCode;
        delete pitem.menuContextPath;
        delete pitem.menuIcon;
        delete pitem.menuName;
        delete pitem.menuPath;
        delete pitem.menuPerms;
        delete pitem.menuRemark;
        delete pitem.menuShowType;
        delete pitem.menuStatus;
        delete pitem.menuType;
        delete pitem.open;
        delete pitem.parentMenuId;
        delete pitem.parentMenuName;
        delete pitem.sortNo;
        delete pitem.subMenuList;
        let _cmenyList = pitem.children;
        _cmenyList &&
          _cmenyList.forEach(citem => {
            delete citem.addDataTime;
            delete citem.modifyDataTime;
            delete citem.appId;
            delete citem.id;
            delete citem.menuCode;
            delete citem.menuContextPath;
            delete citem.menuIcon;
            delete citem.menuName;
            delete citem.menuPath;
            delete citem.menuPerms;
            delete citem.menuRemark;
            delete citem.menuShowType;
            delete citem.menuStatus;
            delete citem.menuType;
            delete citem.open;
            delete citem.parentMenuId;
            delete citem.parentMenuName;
            delete citem.sortNo;
            delete citem.subMenuList;
          });
      });
      this.menuTreeData = [
        {
          title: "顶级菜单",
          value: null,
          key: null,
          children: _pmenuList
        }
      ];
    }
  },

  created() {
    //列表数据请求
    this.getAppList().then(res => {
      this.getMenuButList();
      this.getMenuList();
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
