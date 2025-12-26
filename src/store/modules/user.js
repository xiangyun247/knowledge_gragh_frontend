// 用户模块状态管理
import storage from '@/utils/storage'
import { Message } from 'element-ui'

export default {
  namespaced: true,
  state: {
    // 用户信息
    userInfo: storage.get('userInfo') || {},
    // 登录状态
    isLoggedIn: !!storage.get('token'),
    // 登录令牌
    token: storage.get('token') || ''
  },
  mutations: {
    // 设置用户信息
    SET_USER_INFO(state, userInfo) {
      state.userInfo = userInfo
      storage.set('userInfo', userInfo)
    },
    // 设置登录令牌
    SET_TOKEN(state, token) {
      state.token = token
      storage.set('token', token, 7 * 24 * 60 * 60) // 保存7天
      state.isLoggedIn = !!token
    },
    // 清除用户信息
    CLEAR_USER_INFO(state) {
      state.userInfo = {}
      state.token = ''
      state.isLoggedIn = false
      storage.remove('userInfo')
      storage.remove('token')
    }
  },
  actions: {
    // 登录
    login({ commit }, userData) {
      // 这里应该是异步请求后端API的逻辑
      // 为了演示，我们直接模拟登录成功
      return new Promise((resolve, reject) => {
        try {
          // 模拟API请求
          setTimeout(() => {
            // 假设登录成功，返回用户信息和令牌
            const mockUserInfo = {
              id: 1,
              username: userData.username,
              email: `${userData.username}@example.com`,
              role: 'user',
              avatar: ''
            }
            const mockToken = 'mock-jwt-token-' + Date.now()
            
            // 更新状态
            commit('SET_USER_INFO', mockUserInfo)
            commit('SET_TOKEN', mockToken)
            
            Message.success('登录成功')
            resolve(mockUserInfo)
          }, 500)
        } catch (error) {
          Message.error('登录失败')
          reject(error)
        }
      })
    },
    // 注册
    register({ commit }, userData) {
      // 这里应该是异步请求后端API的逻辑
      // 为了演示，我们直接模拟注册成功
      return new Promise((resolve, reject) => {
        try {
          // 模拟API请求
          setTimeout(() => {
            Message.success('注册成功')
            resolve()
          }, 500)
        } catch (error) {
          Message.error('注册失败')
          reject(error)
        }
      })
    },
    // 登出
    logout({ commit }) {
      return new Promise((resolve) => {
        commit('CLEAR_USER_INFO')
        Message.success('登出成功')
        resolve()
      })
    },
    // 更新用户信息
    updateUserInfo({ commit, state }, userInfo) {
      return new Promise((resolve, reject) => {
        try {
          // 模拟API请求
          setTimeout(() => {
            // 合并更新用户信息
            const updatedUserInfo = { ...state.userInfo, ...userInfo }
            commit('SET_USER_INFO', updatedUserInfo)
            Message.success('用户信息更新成功')
            resolve(updatedUserInfo)
          }, 500)
        } catch (error) {
          Message.error('用户信息更新失败')
          reject(error)
        }
      })
    }
  }
}