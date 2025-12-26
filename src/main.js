import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import './assets/styles/index.css'
import request from './utils/request'
import ripple from './directives/ripple'

// 配置Vue应用
Vue.config.productionTip = false

// 使用Element UI
Vue.use(ElementUI)

// 全局指令：点击波纹效果
Vue.directive('ripple', ripple)

// 将HTTP请求工具挂载到Vue实例上
Vue.prototype.$http = request

// 创建Vue实例
new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
