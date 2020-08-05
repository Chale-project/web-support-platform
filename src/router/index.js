import Vue from 'vue'
import Router from 'vue-router'
import Layout from '../components/layout/LayoutView'
import LayoutBase from '../components/layout/LayoutBaseView'
import RouteView from '../components/layout/RouteView'

Vue.use(Router)
/**
 * 路由配置说明：
 * 建议：sider menu 请不要超过三级菜单，若超过三级菜单，则应该设计为顶部主菜单 配合左侧次级菜单
 *
 * hidden: true                   if `hidden:true` will not show in the sidebar(default is false)
 * alwaysShow: true               if set true, will always show the root menu, whatever its child routes length
 *                                if not set alwaysShow, only more than one route under the children
 *                                it will becomes nested mode, otherwise not show the root menu
 * redirect: noredirect           if `redirect:noredirect` will no redirct in the breadcrumb
 * name:'router-name'             the name is used by <keep-alive> (must set!!!)
 * meta : {
    title: 'title'               the name show in submenu and breadcrumb (recommend set)
    icon: 'svg-name'             the icon show in the sidebar,
    keepAlive: true              keep alive component
    hiddenPageHeader: true       if `hiddenPageHeader: true` will not show page-header(details)
  }
 **/
export const constantRouterMap = [
  {
    path: '/',
    component: Layout,
    redirect: '/login',
    name: '首页',
    hidden: true
  },
  {
    path: '/login',
    component: () => import('../views/Login')
  },
  {
    path: '/exception',
    name: 'exception',
    component: RouteView,
    redirect: '/exception/403',
    meta: { title: '异常页', icon: 'warning', permission: ['exception'] },
    children: [
      {
        path: '/exception/403',
        name: 'Exception403',
        component: () => import(/* webpackChunkName: "fail" */ '@/views/exception/403'),
        meta: { title: '403', permission: ['exception'] }
      },
      {
        path: '/exception/404',
        name: 'Exception404',
        component: () => import(/* webpackChunkName: "fail" */ '@/views/exception/404'),
        meta: { title: '404', permission: ['exception'] }
      },
      {
        path: '/exception/500',
        name: 'Exception500',
        component: () => import(/* webpackChunkName: "fail" */ '@/views/exception/500'),
        meta: { title: '500', permission: ['exception'] }
      }
    ]
  },
  {
    path: '/profile',
    name: 'profile',
    component: LayoutBase,
    redirect: '/profile/profileInfo',
    meta: { title: '个人中心', icon: 'global', permission: ['profile'] },
    children: [{
      path: '/profile/profileInfo',
      name: 'profileInfo',
      redirect: '/profile/profileBase',
      meta: { title: '用户资料', icon: 'global', permission: ['profileInfo'] },
      component: () => import(/* webpackChunkName: "fail" */ '../views/profile/profileInfo'),
      children: [{
        path: '/profile/profileBase',
        name: 'profileBase',
        component: () => import(/* webpackChunkName: "fail" */ '../views/profile/profileBase'),
        meta: { title: '基本信息', icon: 'global', permission: ['profileInfo'] },
      }, {
        path: '/profile/modifyPassword',
        name: 'modifyPassword',
        component: () => import(/* webpackChunkName: "fail" */ '../views/profile/modifyPassword'),
        meta: { title: '安全设置', icon: 'global', permission: ['profileInfo'] },
      }]
    }],
  }
]

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  scrollBehavior: () => ({
    y: 0
  }),
  routes: constantRouterMap
})

export const asyncRouterMap = []