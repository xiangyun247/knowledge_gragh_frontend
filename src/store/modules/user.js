// 用户模块状态管理
import storage from '@/utils/storage'
import { Message } from 'element-ui'
import auth from '@/api/auth'

const ACCESS_TOKEN_KEY = 'access_token'
const REFRESH_TOKEN_KEY = 'refresh_token'

export default {
  namespaced: true,
  state: {
    // 用户信息
    userInfo: storage.get('userInfo') || {},
    // 登录状态（优先 access_token，兼容旧 token）
    isLoggedIn: !!(storage.get(ACCESS_TOKEN_KEY) || storage.get('token')),
    // 登录令牌（access_token，兼容旧 token）
    token: storage.get(ACCESS_TOKEN_KEY) || storage.get('token') || ''
  },
  mutations: {
    // 设置用户信息
    SET_USER_INFO(state, userInfo) {
      state.userInfo = userInfo
      storage.set('userInfo', userInfo)
    },
    // 设置登录令牌（旧接口，兼容）
    SET_TOKEN(state, token) {
      state.token = token
      storage.set(ACCESS_TOKEN_KEY, token, 60 * 60) // access_token 1 小时
      state.isLoggedIn = !!token
    },
    // 设置 JWT 双 Token
    SET_TOKENS(state, { access_token: accessToken, refresh_token: refreshToken }) {
      state.token = accessToken
      state.isLoggedIn = !!accessToken
      storage.set(ACCESS_TOKEN_KEY, accessToken, 60 * 60) // 1 小时
      storage.set(REFRESH_TOKEN_KEY, refreshToken, 7 * 24 * 60 * 60) // refresh 7 天
      storage.remove('token') // 清除旧 token，统一使用 access_token
    },
    // 清除用户信息
    CLEAR_USER_INFO(state) {
      state.userInfo = {}
      state.token = ''
      state.isLoggedIn = false
      storage.remove('userInfo')
      storage.remove('token')
      storage.remove(ACCESS_TOKEN_KEY)
      storage.remove(REFRESH_TOKEN_KEY)
    }
  },
  actions: {
    // 登录：调用后端 /api/auth/login，支持 JWT access_token + refresh_token
    async login({ commit }, userData) {
      try {
        const resp = await auth.login({
          username: userData.username,
          password: userData.password
        })
        const data = resp.data || resp
        const user = data.user || (data.data && data.data.user) || {}
        const accessToken = data.access_token || (data.data && data.data.access_token)
        const refreshToken = data.refresh_token || (data.data && data.data.refresh_token)
        const token = data.token || (data.data && data.data.token)

        if (!user.id) {
          throw new Error('登录响应格式不正确')
        }

        const userInfo = {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role || 'patient',
          avatar: user.avatar || ''
        }

        commit('SET_USER_INFO', userInfo)

        if (accessToken && refreshToken) {
          commit('SET_TOKENS', { access_token: accessToken, refresh_token: refreshToken })
        } else if (token) {
          commit('SET_TOKEN', token)
        } else {
          throw new Error('登录响应缺少 token')
        }

        Message.success('登录成功')
        return userInfo
      } catch (error) {
        const raw = error.response?.data?.detail || error.message || '未知错误'
        let mapped = raw
        if (/用户名或密码错误/.test(raw)) {
          mapped = '用户名或密码不正确'
        }
        Message.error('登录失败：' + mapped)
        throw error
      }
    },
    // 注册：调用后端 /api/auth/register
    async register(_, registerData) {
      try {
        await auth.register({
          username: registerData.username,
          email: registerData.email,
          password: registerData.password
        })
        Message.success('注册成功，请登录')
      } catch (error) {
        const raw = error.response?.data?.detail || error.message || '未知错误'
        let mapped = raw
        if (/用户名已存在/.test(raw)) {
          mapped = '该用户名已被使用，请换一个'
        }
        Message.error('注册失败：' + mapped)
        throw error
      }
    },
    // 登出
    logout({ commit }) {
      return new Promise((resolve) => {
        commit('CLEAR_USER_INFO')
        Message.success('登出成功')
        resolve()
      })
    },
    // 更新用户信息（仍为前端本地更新）
    updateUserInfo({ commit, state }, userInfo) {
      return new Promise((resolve, reject) => {
        try {
          const updatedUserInfo = { ...state.userInfo, ...userInfo }
          commit('SET_USER_INFO', updatedUserInfo)
          Message.success('用户信息更新成功')
          resolve(updatedUserInfo)
        } catch (error) {
          Message.error('用户信息更新失败')
          reject(error)
        }
      })
    },
    // 修改身份（角色）：调用后端 API，更新 token 与 userInfo
    async updateRole({ commit, state }, role) {
      const resp = await auth.updateRole(role)
      const data = resp.data || resp
      const user = data.user || (data.data && data.data.user) || {}
      const accessToken = data.access_token || (data.data && data.data.access_token)
      const refreshToken = data.refresh_token || (data.data && data.data.refresh_token)

      if (!user.id) {
        throw new Error('修改角色响应格式不正确')
      }

      const userInfo = {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role || 'patient',
        avatar: (state && state.userInfo && state.userInfo.avatar) || ''
      }

      commit('SET_USER_INFO', userInfo)
      if (accessToken && refreshToken) {
        commit('SET_TOKENS', { access_token: accessToken, refresh_token: refreshToken })
      }

      return userInfo
    }
  }
}