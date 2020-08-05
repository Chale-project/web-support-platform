import {
  constantRouterMap
} from "@/router"
// import importFile from '@/router/file'
import Layout from '@/components/layout/LayoutView'
import LayoutBase from '@/components/layout/LayoutBaseView'
import RouteView from '@/components/layout/RouteView'
const _import = require('@/router/_import_' + process.env.NODE_ENV) //获取组件的方法
// console.log(importFile)

function filterAsyncRouter(asyncRouterList) {
  const asyncRouterMap = setAsyncRouters(asyncRouterList)
  for (let i in asyncRouterMap) {
    let children = asyncRouterMap[i].children
    if (asyncRouterMap[i].component) {
      if (asyncRouterMap[i].component === 'Layout') { //Layout组件特殊处理
        asyncRouterMap[i].component = Layout
      } else if (asyncRouterMap[i].component === 'LayoutBase') { //Layout组件特殊处理
        asyncRouterMap[i].component = LayoutBase
      } else if (asyncRouterMap[i].component === 'RouteView') { //Layout组件特殊处理
        asyncRouterMap[i].component = RouteView
      } else {
        asyncRouterMap[i].component = _import(asyncRouterMap[i].component)
      }
    }
    for (const j in children) {
      if (children[j].component) {
        if (children[j].component === 'Layout') { //Layout组件特殊处理
          children[j].component = Layout
        } else if (children[j].component === 'LayoutBase') { //Layout组件特殊处理
          children[j].component = LayoutBase
        } else if (children[j].component === 'RouteView') { //Layout组件特殊处理
          children[j].component = RouteView
        } else {
          children[j].component = _import(children[j].component)
        }
      }
    }
  }

  console.log(asyncRouterMap)
  return asyncRouterMap
}

//构建菜单树
function toTree(data) {
  // 删除 所有 children,以防止多次调用
  data.forEach(function (item) {
    delete item.children;
  });

  // 将数据存储为 以 id 为 KEY 的 map 索引数据列
  var map = {};
  data.forEach(function (item) {
    map[item.id] = item;
  });
  //console.log(map);
  var val = [];
  data.forEach(function (item) {
    // 以当前遍历项，的pid,去map对象中找到索引的id
    var parent = map[item.parentMenuId];
    // 好绕啊，如果找到索引，那么说明此项不在顶级当中,那么需要把此项添加到，他对应的父级中
    if (parent) {
      (parent.children || (parent.children = [])).push(item);
    } else {
      //如果没有在map中找到对应的索引ID,那么直接把 当前的item添加到 val结果集中，作为顶级
      val.push(item);
    }
  });
  return val;
}


function setAsyncRouters(asyncRouterList) {
  //const menuMap = toTree(asyncRouterList.res)
  const menuMap = asyncRouterList
  for (let i in menuMap) {
    let category = menuMap[i].children
    menuMap[i].path = `${menuMap[i].menuPath}`
    menuMap[i].name = menuMap[i].menuCode
    if (menuMap[i].menuContextPath) {
      menuMap[i].redirect = menuMap[i].menuContextPath
    }
    if (menuMap[i].menuRemark) {
      menuMap[i].component = menuMap[i].menuRemark
    }
    menuMap[i].meta = {
      title: menuMap[i].menuName,
      icon: menuMap[i].menuIcon,
      permission: [menuMap[i].menuPerms],
    }
    for (let j in category) {
      delete category[j].children
      category[j].path = `${category[j].menuPath}`
      category[j].name = category[j].menuCode
      if (category[j].menuContextPath) {
        category[j].redirect = category[j].menuContextPath
      }
      if (category[j].menuRemark) {
        category[j].component = category[j].menuRemark
      }
      category[j].meta = {
        title: category[j].menuName,
        icon: category[j].menuIcon,
        permission: [category[j].menuPerms],
      }
    }
  }
  for (let i in menuMap) {
    delete menuMap[i].id
    delete menuMap[i].addDataTime
    delete menuMap[i].appId
    delete menuMap[i].menuCode
    delete menuMap[i].menuContextPath
    delete menuMap[i].menuIcon
    delete menuMap[i].menuName
    delete menuMap[i].menuPath
    delete menuMap[i].menuPerms
    delete menuMap[i].menuRemark
    delete menuMap[i].menuShowType
    delete menuMap[i].menuStatus
    delete menuMap[i].menuType
    delete menuMap[i].modifyDataTime
    delete menuMap[i].open
    delete menuMap[i].parentMenuId
    delete menuMap[i].parentMenuName
    delete menuMap[i].sortNo
    delete menuMap[i].subMenuList

    let category = menuMap[i].children
    for (let j in category) {
      delete category[j].id
      delete category[j].addDataTime
      delete category[j].appId
      delete category[j].menuCode
      delete category[j].menuContextPath
      delete category[j].menuIcon
      delete category[j].menuName
      delete category[j].menuPath
      delete category[j].menuPerms
      delete category[j].menuRemark
      delete category[j].menuShowType
      delete category[j].menuStatus
      delete category[j].menuType
      delete category[j].modifyDataTime
      delete category[j].open
      delete category[j].parentMenuId
      delete category[j].parentMenuName
      delete category[j].sortNo
      delete category[j].subMenuList
    }
  }
  return menuMap
}

const permission = {
  state: {
    routers: constantRouterMap,
    addRouters: []
  },
  mutations: {
    SET_ROUTERS: (state, routers) => {
      state.addRouters = routers
      state.routers = constantRouterMap.concat(routers)
    }
  },
  actions: {
    GenerateMenuList({
      commit
    }, res) {
      return new Promise((resolve, reject) => {
        let data = res.res
        console.log(data)
        if (data.code === 0) {
          if (data.menuList.length > 0) {
            const menuList = data.menuList
            let accessedRouters = filterAsyncRouter(menuList)
            commit('SET_ROUTERS', accessedRouters)
            resolve()
          }
        } else {
          this.$message.warning('还未给该用户添加菜单权限相关！');
          reject()
        }

      })

    }
  }
}

export default permission