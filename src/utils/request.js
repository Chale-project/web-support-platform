import Vue from 'vue'
import axios from 'axios'
import router from '../router/'
import store from '../store'
import {
  VueAxios
} from './axios'
import notification from 'ant-design-vue/es/notification'
import {
  ACCESS_TOKEN
} from "@/store/mutation-types"
import {
  BASEURL
} from '@/api/public'


// 创建 axios 实例
const service = axios.create({
  baseURL: BASEURL + '',
  timeout: 5000 // 请求超时时间
})

const err = (error) => {
  console.log(error)
  if (error.response) {
    if (error.status === 403) {
      notification.error({
        message: '拒绝访问',
        description: '无权限，拒绝访问'
      })
    }
    if (error.status === 401) {
      notification.error({
        message: '未授权',
        description: '授权验证失败'
      })
      setTimeout(() => {
        location.reload()
      })
    }
  }
  return Promise.reject(error)
};

// request 拦截器
service.interceptors.request.use(config => {
  const token = Vue.ls.get(ACCESS_TOKEN)
  if (token) {
    config.headers['token'] = token // 让每个请求携带自定义 token 请根据实际情况自行修改
  }
  config.headers['Content-Type'] = 'application/json;charset=UTF-8'
  return config
}, err)

// response 拦截器
service.interceptors.response.use((response) => {
  if (response.data.code == 401) {
    Vue.ls.remove(ACCESS_TOKEN)
    notification.error({
      message: '登陆超时',
      description: '请重新登录'
    })
    setTimeout(() => {
      location.reload()
    }, 1e3)
  }
  if (response.data.code === 403) {
    notification.error({
      message: '拒绝访问',
      description: '无权限，拒绝访问'
    })
  }
  return response.data
}, err => {
  try {
    if (err.response) {
      switch (err.response.code) {
        case 401:
          var baseUrl = window.location.href;
          router.replace({
            path: '/login',
            query: {
              backUrl: baseUrl
            }
          });
          return;
      }
    }
    return Promise.reject(err.response.data)
  } catch (e) {
    console.log(e)
  }
})

const installer = {
  vm: {},
  install(Vue, router = {}) {
    Vue.use(VueAxios, router, service)
  }
}

export {
  installer as VueAxios,
  service as axios
}