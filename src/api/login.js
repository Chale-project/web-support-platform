import {
  axios
} from '@/utils/request'

/**
 * login func
 * parameter: {
 *     username: '',
 *     password: '',
 *     remember_me: true,
 *     captcha: '12345'
 * }
 * @param parameter
 * @returns {*}
 */
export function login(parameter) { //登陆
  return axios({
    url: '/api/token',
    method: 'post',
    data: parameter
  })
}

export function getUserInfo() {
  return axios({
    url: '/basic/user/app/info',
    method: 'get',
    headers: {
      'Content-Type': 'application/json;charset=UTF-8',
    }
  })
}


export function getUserMenuPermissionsList() {
  return axios({
    url: '/basic/menu/list',
    method: 'get',
    headers: {
      'Content-Type': 'application/json;charset=UTF-8',
    }
  })
}

export function getUserMenuList() {
  return axios({
    url: '/basic/menu/nav',
    method: 'get',
    headers: {
      'Content-Type': 'application/json;charset=UTF-8',
    }
  })
}

export function CustomerTestData() { //客户检测数据
  return axios({
    url: '/customer/list',
    method: 'post',
    data: {
      currentPage: 1,
      pageSize: 10
    },
    headers: {
      'Content-Type': 'application/json;charset=UTF-8',
    }
  })
}

export function logout() {
  return axios({
    url: '/api/auth/logout',
    method: 'post',
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  })
}