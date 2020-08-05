import Vue from 'vue'
import {
  login,
  getUserInfo,
  getUserMenuList
} from "@/api/login"
import {
  ACCESS_TOKEN
} from "@/store/mutation-types"
import avatar from '@/assets/logo.png'

const user = {
  state: {
    token: '',
    name: '',
    welcome: '',
    avatar: '',
    roles: [],
    info: {},
  },

  mutations: {
    SET_ACCESSTOKEN: (state, accessToken) => {
      state.accessToken = accessToken
    },
    SET_USER: (state, user) => {
      state.name = user.userRealname
      state.avatar = user.userAvatar || avatar
      state.info = user
    },
  },

  actions: {
    // 登录
    Login({
      commit
    }, userInfo) {
      return new Promise((resolve, reject) => {
        login(userInfo).then(response => {
          if (response.code === 0) {
            const accessToken = response.access_token
            Vue.ls.set(ACCESS_TOKEN, accessToken, 7 * 24 * 60 * 60 * 1000)
            commit('SET_ACCESSTOKEN', accessToken)
            resolve(response)
          } else {
            reject(response)
          }
        })
      })
    },

    GetUserMenuList() {
      return new Promise((resolve, reject) => {
        getUserMenuList().then(response => {
          resolve(response)
        }).catch(error => {
          reject(error)
        })
      })
    },

    GetUserInfo({
      commit
    }) {
      return new Promise((resolve, reject) => {
        getUserInfo().then(response => {
          if (response.code === 0) {
            commit('SET_USER', response.user)
            resolve(response)
          }
        }).catch(error => {
          reject(error)
        })
      })
    },

    // 登出
    Logout({
      commit
    }) {
      return new Promise((resolve) => {
        commit('SET_ACCESSTOKEN', '')
        commit('SET_USER', '')
        Vue.ls.remove(ACCESS_TOKEN)
        resolve()
      })
    },

  }
}

export default user