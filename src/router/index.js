import Vue from 'vue'
import VueRouter from 'vue-router'
import storage from '@/utils/storage'
import { hasRole, ROLES } from '@/utils/role'

// 导入页面组件
const Cover = () => import('../components/common/CoverView.vue')
const Home = () => import('../components/common/HomeView.vue')
const Chat = () => import('../components/chat/ChatView.vue')
const GraphView = () => import('../components/graph/GraphView.vue')
const Search = () => import('../components/search/SearchView.vue')
const KnowledgeBase = () => import('../components/knowledge-base/KnowledgeBaseView.vue')
const PatientEducation = () => import('../components/education/PatientEducationView.vue')
const DataUpload = () => import('../components/upload/DataUploadView.vue')
const History = () => import('../components/history/HistoryView.vue')
const FAQ = () => import('../components/common/FAQView.vue')
const Login = () => import('../components/common/LoginView.vue')
const ForgotPassword = () => import('../components/common/ForgotPasswordView.vue')
const UserProfile = () => import('../components/common/UserProfileView.vue')

// 使用路由插件
Vue.use(VueRouter)

// 路由配置
const routes = [
  {
    path: '/',
    name: 'Cover',
    component: Cover,
    meta: {
      title: '医疗知识图谱系统 - 欢迎',
      hideLayout: true
    }
  },
  {
    path: '/home',
    name: 'Home',
    component: Home,
    meta: {
      title: '医疗知识图谱系统 - 首页'
    }
  },
  {
    path: '/chat',
    name: 'Chat',
    component: Chat,
    meta: {
      title: '医疗知识图谱系统 - 聊天问答'
      // 未登录也可访问，页面内操作时再校验登录
    }
  },
  {
    path: '/graph',
    name: 'GraphView',
    component: GraphView,
    meta: {
      title: '医疗知识图谱系统 - 图谱可视化'
      // 未登录也可访问
    }
  },
  // 新增：支持通过file_id参数加载特定文件生成的知识图谱
  {
    path: '/graph/:file_id',
    name: 'GraphViewWithFile',
    component: GraphView,
    meta: {
      title: '医疗知识图谱系统 - 图谱可视化'
      // 未登录也可访问
    }
  },
  {
    path: '/search',
    name: 'Search',
    component: Search,
    meta: {
      title: '医疗知识图谱系统 - 实体搜索',
      roles: [ROLES.ADMIN, ROLES.DOCTOR, ROLES.PATIENT]
    }
  },
  {
    path: '/knowledge-base',
    name: 'KnowledgeBase',
    component: KnowledgeBase,
    meta: {
      title: '医疗知识图谱系统 - 文档知识库'
      // 未登录也可访问
    }
  },
  {
    path: '/patient-education',
    name: 'PatientEducation',
    component: PatientEducation,
    meta: {
      title: '医疗知识图谱系统 - 患者教育中心'
    }
  },
  {
    path: '/upload',
    name: 'DataUpload',
    component: DataUpload,
    meta: {
      title: '医疗知识图谱系统 - 数据上传',
      roles: [ROLES.ADMIN, ROLES.DOCTOR] // 仅管理员、医生可访问
    }
  },
  {
    path: '/history',
    name: 'History',
    component: History,
    meta: {
      title: '医疗知识图谱系统 - 历史记录',
      roles: [ROLES.ADMIN, ROLES.DOCTOR, ROLES.PATIENT]
    }
  },
  {
    path: '/faq',
    name: 'FAQ',
    component: FAQ,
    meta: {
      title: '医疗知识图谱系统 - 常见问题'
    }
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: {
      title: '医疗知识图谱系统 - 登录/注册'
    }
  },
  {
    path: '/forgot-password',
    name: 'ForgotPassword',
    component: ForgotPassword,
    meta: {
      title: '医疗知识图谱系统 - 找回密码'
    }
  },
  // 个人中心页面
  {
    path: '/profile',
    name: 'UserProfile',
    component: UserProfile,
    meta: {
      title: '医疗知识图谱系统 - 个人中心',
      requiresAuth: true
    }
  },
  // 404页面重定向到首页
  {
    path: '*',
    redirect: '/'
  }
]

// 创建路由实例
const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

// 路由守卫，设置页面标题和登录验证
router.beforeEach((to, from, next) => {
  if (to.meta.title) {
    document.title = to.meta.title
  }

  const isLoggedIn = !!(storage.get('access_token') || storage.get('token'))
  const authPages = ['/profile', '/upload', '/history']

  if (authPages.includes(to.path) && !isLoggedIn) {
    next('/login')
  } else if (to.path === '/login' && isLoggedIn) {
    next('/home')
  } else if (to.meta.roles && to.meta.roles.length > 0) {
    // 按角色限制：需登录且角色在 meta.roles 中
    if (!isLoggedIn) {
      next('/login')
    } else {
      const userInfo = storage.get('userInfo') || {}
      const userRole = userInfo.role || 'patient'
      if (hasRole(userRole, to.meta.roles)) {
        next()
      } else {
        next('/home') // 角色不足，跳转首页
      }
    }
  } else {
    next()
  }
})

export default router

