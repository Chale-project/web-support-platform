import Vue from 'vue'
import router from './router'
import store from './store'

import NProgress from 'nprogress' // progress bar
import 'nprogress/nprogress.css' // progress bar style
import {
  ACCESS_TOKEN
} from "@/store/mutation-types"

NProgress.configure({
  showSpinner: false
}) // NProgress Configuration

const whiteList = ['/login', '/exception/403', '/exception/404', '/exception/500'] // no redirect whitelist

router.beforeEach((to, from, next) => {
  NProgress.start()
  if (Vue.ls.get(ACCESS_TOKEN)) {
    /* has token */
    if (to.path === '/login') {
      next({
        name: 'appManagement'
      })
      NProgress.done()
    } else {
      //先判断store中是否存在路由菜单列表
      if (store.getters.addRouters.length === 0) {
        store.dispatch('GetUserInfo').then(data => {
          store.dispatch('GetUserMenuList').then(res => {
            store.dispatch('GenerateMenuList', {
              res
            }).then(() => { // 根据roles权限生成可访问的路由表
              router.addRoutes(store.getters.addRouters) // 动态添加可访问路由表
              next({
                ...to,
                replace: true
              }) // hack方法 确保addRoutes已完成
            })
          })
        }).catch(() => {
          store.dispatch('Logout').then(() => {
            next({
              path: '/login'
            })
          })
        })
      } else {
        next()
      }
    }
  } else {
    if (whiteList.indexOf(to.path) !== -1) { // 在免登录白名单，直接进入
      next()
    } else {
      next('/login')
      NProgress.done()
    }
  }

})

router.afterEach(() => {
  NProgress.done()
})