<template>
  <a-layout-header style="padding: 0px;">
    <div class="header">
      <a-icon class="trigger" v-if="device==='mobile'" :type="collapsed ? 'menu-fold' : 'menu-unfold'" @click.native="toggle"></a-icon>
      <a-icon class="trigger" v-else :type="collapsed ? 'menu-unfold' : 'menu-fold'" @click.native="toggle" />

      <div class="user-wrapper">
        <!-- <span class="action">
          <a-icon type="question-circle-o"></a-icon>
        </span> -->
        <!-- <header-notice class="action"/> -->
        <a-dropdown>
          <span class="action ant-dropdown-link user-dropdown-menu">
            <a-avatar class="avatar" size="small" :src="avatar()" />
            <span>{{ nickname() }}</span>
          </span>
          <a-menu slot="overlay" class="user-dropdown-menu-wrapper">
            <a-menu-item key="0">
              <router-link :to="{ name: 'profile' }">
                <a-icon type="user" />
                <span>个人中心</span>
              </router-link>
            </a-menu-item>
            <!-- <a-menu-item key="1">
              <router-link :to="{ name: 'orderDetail'}">
                <a-icon type="setting" />
                <span>订单详情</span>
              </router-link>
            </a-menu-item> -->
            <!-- <a-menu-item key="2">
              <a href="javascript:;" @click="handlepassword">
                <a-icon  type="edit"/>
                <span>修改密码</span>
              </a>
            </a-menu-item>-->
            <a-menu-divider />
            <a-menu-item key="3">
              <a href="javascript:;" @click="handleLogout">
                <a-icon type="logout" />
                <span>退出登录</span>
              </a>
            </a-menu-item>
          </a-menu>
        </a-dropdown>

      </div>
    </div>
  </a-layout-header>
</template>

<script>
import HeaderNotice from "./HeaderNotice";
import { mapActions, mapGetters } from "vuex";
import md5 from "md5";
export default {
  name: "LayoutHeader",
  components: {
    HeaderNotice
  },
  props: {
    collapsed: {
      type: Boolean,
      required: false,
      default: false
    },
    device: {
      type: String,
      required: false,
      default: "desktop"
    }
  },
  data() {
    return {};
  },
  created() {},
  methods: {
    ...mapActions(["Logout"]),
    ...mapGetters(["nickname", "avatar"]),
    handleLogout() {
      const that = this;

      this.$confirm({
        title: "提示",
        content: "真的要注销登录吗 ?",
        onOk() {
          return that
            .Logout({})
            .then(() => {
              window.location.reload();
            })
            .catch(err => {
              that.$message.error({
                title: "错误",
                description: err.message
              });
            });
        },
        onCancel() {}
      });
    },
    onOk() {
      return this.Logout({})
        .then(() => {
          window.location.reload();
        })
        .catch(err => {
          that.$message.error({
            title: "错误",
            description: err.message
          });
        });
    },
    toggle() {
      this.$emit("toggle");
    }
  }
};
</script>

<style scoped>
</style>