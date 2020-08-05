<template>
  <div id="auth">
    <div class="container">
      <div class="top">
        <div class="header">
          <a href="/">
            <img src="~@/assets/logo.png" class="logo" alt="logo" />
            <span class="title">SpeedLight支撑平台</span>
          </a>
        </div>
        <div class="desc">专注，创新，是我们的竞争法则；
          <br>协作，共赢，是我们的生存之道。
        </div>
      </div>
      <div class="main">
        <a-form ref="formLogin" :autoFormCreate="(form)=>{this.form = form}" id="formLogin">
          <a-form-item fieldDecoratorId="username" :fieldDecoratorOptions="{rules: [{ required: true, message: '请输入登录账号' }, { validator: this.handleUsernameOrEmail }], initialValue:formLogin.username, validateTrigger: 'blur'}">
            <a-input size="large" type="text" v-model="formLogin.username" placeholder="请输入登录账号">
              <a-icon slot="prefix" type="user" :style="{ color: 'rgba(0,0,0,.25)' }" />
            </a-input>
          </a-form-item>

          <a-form-item fieldDecoratorId="password" :fieldDecoratorOptions="{rules: [{ required: true, message: '请输入密码' }], initialValue:formLogin.password, validateTrigger: 'blur'}">
            <a-input size="large" type="password" v-model="formLogin.password" placeholder="请输入密码">
              <a-icon slot="prefix" type="lock" :style="{ color: 'rgba(0,0,0,.25)' }" />
            </a-input>
          </a-form-item>

          <a-form-item>
            <a-checkbox v-model="formLogin.rememberMe">记住账号</a-checkbox>
          </a-form-item>

          <a-form-item style="margin-top:24px">
            <a-button size="large" type="primary" htmlType="submit" class="login-button" :loading="loginBtn" @click.stop.prevent="handleSubmit" :disabled="loginBtn">确定</a-button>
          </a-form-item>
        </a-form>
      </div>
      <div class="footer">
        <div class="copyright">Copyright &copy; 2018 SpeedLight</div>
      </div>
    </div>
  </div>
</template>

<script>
import md5 from "md5";
import api from "../api/";
import { mapActions } from "vuex";

import { timeFix } from "../utils/util";

export default {
  data() {
    return {
      customActiveKey: "tab1",
      loginBtn: false,
      // login type: 0 email, 1 username, 2 telephone
      loginType: 0,
      form: null,
      state: {
        time: 60,
        smsSendBtn: false
      },
      formLogin: {
        username: "",
        password: "",
        captcha: "",
        mobile: "",
        rememberMe: true
      }
    };
  },
  methods: {
    ...mapActions(["Login"]),
    // handler
    handleUsernameOrEmail(rule, value, callback) {
      const regex = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+((\.[a-zA-Z0-9_-]{2,3}){1,2})$/;
      if (regex.test(value)) {
        this.loginType = 0;
      } else {
        this.loginType = 1;
      }
      callback();
    },
    onchangeUsername(e) {
      console.log(this.formLogin.username);
    },
    handleTabClick(key) {
      this.customActiveKey = key;
      // this.systems.resetFields()
    },
    handleSubmit() {
      let that = this;
      let flag = false;

      if (that.customActiveKey === "tab1") {
        that.form.validateFields(
          ["username", "password"],
          { force: true },
          err => {
            if (!err) {
              flag = true;
            }
          }
        );
      } else {
        that.form.validateFields(
          ["mobile", "captcha"],
          { force: true },
          err => {
            if (!err) {
              flag = true;
              that.loginType = 2; // 登录类型修改为手机登录
            }
          }
        );
      }

      if (!flag) return;

      that.loginBtn = true;

      let loginParams = {
        userSecret: md5(that.formLogin.password)
        // remember_me: that.formLogin.rememberMe
      };

      switch (that.loginType) {
        case 0:
          loginParams.email = that.formLogin.username;
          break;
        case 1:
          loginParams.userNumber = that.formLogin.username;
          break;
        case 2:
        default:
          loginParams.mobile = that.formLogin.mobile;
          loginParams.captcha = that.formLogin.captcha;
          break;
      }

      that
        .Login(loginParams)
        .then(res => {
          this.rememberMe();
          that.loginBtn = false;
          that.$router.push({ name: "appManagement" });
          that.$message.success(timeFix() + "，欢迎回来", 3);
        })
        .catch(err => {
          that.$notification.error({
            message: "错误",
            description: err.msg,
            duration: 4
          });
          that.loginBtn = false;
        });
    },
    getCaptcha(e) {
      e.preventDefault();
      let that = this;

      this.form.validateFields(["mobile"], { force: true }, err => {
        if (!err) {
          this.state.smsSendBtn = true;

          let interval = window.setInterval(() => {
            if (that.state.time-- <= 0) {
              that.state.time = 60;
              that.state.smsSendBtn = false;
              window.clearInterval(interval);
            }
          }, 1000);

          const hide = this.$message.loading("验证码发送中..", 0);
          this.$http
            .post(api.SendSms, { mobile: that.formLogin.mobile })
            .then(res => {
              setTimeout(hide, 2500);
              this.$notification["success"]({
                message: "提示",
                description:
                  "验证码获取成功，您的验证码为：" + res.result.captcha,
                duration: 8
              });
            })
            .catch(err => {
              setTimeout(hide, 1);
              clearInterval(interval);
              that.state.time = 60;
              that.state.smsSendBtn = false;
              this.requestFailed(err);
            });
        }
      });
    },
    requestFailed(err) {
      this.$notification["error"]({
        message: "错误",
        description:
          ((err.response || {}).data || {}).message ||
          "用户名或密码错误,请重新输入",
        duration: 4
      });
      this.loginBtn = false;
    },

    getUserPass() {
      this.formLogin.username = localStorage.getItem("sl_username") || "";
    },

    //记住账号
    rememberMe() {
      if (this.formLogin.rememberMe) {
        localStorage.setItem("sl_username", this.formLogin.username);
      } else {
        localStorage.setItem("sl_username", "");
      }
    }
  },
  mounted() {
    this.getUserPass();
  }
};
</script>

<style lang="scss" scoped>
#auth {
  height: 100%;

  .container {
    width: 100%;
    min-height: 100%;
    background: #f0f2f5 url(~@/assets/background.svg) no-repeat 50%;
    background-size: 100%;
    padding: 110px 0 144px;
    position: relative;

    a {
      text-decoration: none;
    }

    .top {
      text-align: center;

      .header {
        height: 44px;
        line-height: 44px;

        .badge {
          position: absolute;
          display: inline-block;
          line-height: 1;
          vertical-align: middle;
          margin-left: -12px;
          margin-top: -10px;
          opacity: 0.8;
        }

        .logo {
          height: 44px;
          vertical-align: top;
          margin-right: 16px;
          border-style: none;
        }

        .title {
          font-size: 33px;
          color: rgba(0, 0, 0, 0.85);
          font-family: "Myriad Pro", "Helvetica Neue", Arial, Helvetica,
            sans-serif;
          font-weight: 600;
          position: relative;
          top: 2px;
        }
      }
      .desc {
        font-size: 14px;
        color: rgba(0, 0, 0, 0.45);
        margin-top: 12px;
        margin-bottom: 40px;
      }
    }

    .main {
      width: 368px;
      margin: 0 auto;

      label {
        font-size: 14px;
      }

      .ivu-input-prefix {
        left: 12px;
        font-size: 14px;
        color: rgba(0, 0, 0, 0.25);
      }
      .getCaptcha {
        display: block;
        width: 100%;
        height: 40px;
      }

      .forge-password {
        font-size: 14px;
      }
      button.login-button {
        padding: 0 15px;
        font-size: 16px;
        height: 40px;
        width: 100%;
      }
    }

    .footer {
      position: absolute;
      width: 100%;
      bottom: 0;
      padding: 0 16px;
      margin: 48px 0 24px;
      text-align: center;

      .links {
        margin-bottom: 8px;
        font-size: 14px;
        a {
          color: rgba(0, 0, 0, 0.45);
          transition: all 0.3s;
          &:not(:last-child) {
            margin-right: 40px;
          }
        }
      }
      .copyright {
        color: rgba(0, 0, 0, 0.45);
        font-size: 14px;
      }
    }
  }
}
</style>