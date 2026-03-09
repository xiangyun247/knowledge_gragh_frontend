import request from '@/utils/request'

// 用户登录
export function login(data) {
  return request({
    url: '/api/auth/login',
    method: 'post',
    data
  })
}

// 用户注册
export function register(data) {
  return request({
    url: '/api/auth/register',
    method: 'post',
    data
  })
}

// 刷新 Token（使用 refresh_token 换取新的 access_token、refresh_token）
export function refresh(refreshToken) {
  return request({
    url: '/api/auth/refresh',
    method: 'post',
    data: { refresh_token: refreshToken }
  })
}

// 个人中心修改身份（角色）
export function updateRole(role) {
  return request({
    url: '/api/user/role',
    method: 'put',
    data: { role }
  })
}

export default {
  login,
  register,
  refresh,
  updateRole
}

