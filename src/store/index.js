import Vue from 'vue'
import Vuex from 'vuex'

// 导入模块
import user from './modules/user'
import app from './modules/app'

// 使用Vuex插件
Vue.use(Vuex)

// 创建Vuex实例
const store = new Vuex.Store({
  modules: {
    user, // 用户相关状态
    app   // 应用相关状态
  },
  // 全局getter
  getters: {
    // 获取用户信息
    userInfo: state => state.user.userInfo,
    // 获取登录状态
    isLoggedIn: state => state.user.isLoggedIn,
    // 获取主题设置
    theme: state => state.app.theme,
    // 获取语言设置
    language: state => state.app.language
  }
})

export default store