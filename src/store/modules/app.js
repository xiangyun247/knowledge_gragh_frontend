// 应用模块状态管理
import storage from '@/utils/storage'

export default {
  namespaced: true,
  state: {
    // 主题设置 (light/dark)
    theme: storage.get('theme') || 'light',
    // 语言设置
    language: storage.get('language') || 'zh',
    // 侧边栏展开状态
    sidebarOpen: storage.get('sidebarOpen') !== false,
    // 是否显示全屏
    isFullscreen: false,
    // 加载状态
    loading: false
  },
  mutations: {
    // 设置主题
    SET_THEME(state, theme) {
      state.theme = theme
      storage.set('theme', theme)
      // 使用 data-theme 记录当前主题，方便全局样式（包括医疗主题）使用
      if (typeof document !== 'undefined') {
        document.body.setAttribute('data-theme', theme)
        // 兼容原有基于类名的样式
        document.body.classList.remove('light-theme', 'dark-theme')
        document.body.classList.add(theme === 'dark' ? 'dark-theme' : 'light-theme')
      }
    },
    // 设置语言
    SET_LANGUAGE(state, language) {
      state.language = language
      storage.set('language', language)
    },
    // 切换侧边栏状态
    TOGGLE_SIDEBAR(state) {
      state.sidebarOpen = !state.sidebarOpen
      storage.set('sidebarOpen', state.sidebarOpen)
    },
    // 设置侧边栏状态
    SET_SIDEBAR(state, sidebarOpen) {
      state.sidebarOpen = sidebarOpen
      storage.set('sidebarOpen', sidebarOpen)
    },
    // 切换全屏状态
    TOGGLE_FULLSCREEN(state) {
      state.isFullscreen = !state.isFullscreen
    },
    // 设置加载状态
    SET_LOADING(state, loading) {
      state.loading = loading
    }
  },
  actions: {
    // 切换主题
    toggleTheme({ commit, state }) {
      const newTheme = state.theme === 'light' ? 'dark' : 'light'
      commit('SET_THEME', newTheme)
    },
    // 设置语言
    setLanguage({ commit }, language) {
      commit('SET_LANGUAGE', language)
    },
    // 切换侧边栏
    toggleSidebar({ commit }) {
      commit('TOGGLE_SIDEBAR')
    },
    // 切换全屏
    toggleFullscreen({ commit }) {
      commit('TOGGLE_FULLSCREEN')
      // 这里可以添加实际的全屏切换逻辑
    },
    // 显示加载
    showLoading({ commit }) {
      commit('SET_LOADING', true)
    },
    // 隐藏加载
    hideLoading({ commit }) {
      commit('SET_LOADING', false)
    }
  }
}