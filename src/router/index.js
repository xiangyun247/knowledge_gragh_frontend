import Vue from 'vue'
import VueRouter from 'vue-router'
import storage from '@/utils/storage'
import { hasRole, ROLES, ELDERLY_ALLOWED_ROUTES } from '@/utils/role'

// 导入页面组件
const Cover = () => import('../components/common/CoverView.vue')
const Home = () => import('../components/common/HomeView.vue')
const Chat = () => import('../components/chat/ChatView.vue')
const GraphView = () => import('../components/graph/GraphView.vue')
const Search = () => import('../components/search/SearchView.vue')
const KnowledgeBase = () => import('../components/knowledge-base/KnowledgeBaseView.vue')
const PatientEducation = () => import('../components/education/PatientEducationView.vue')
const MedicationReminder = () => import('../components/medication/MedicationReminderView.vue')
const CognitiveDashboard = () => import('../components/admin/CognitiveDashboardView.vue')
const FamilyReport = () => import('../components/family/FamilyReportView.vue')
const DataUpload = () => import('../components/upload/DataUploadView.vue')
const History = () => import('../components/history/HistoryView.vue')
const CognitiveLoadAssessment = () => import('../components/assessment/CognitiveLoadAssessmentView.vue')
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
      title: '智护银龄 - 欢迎',
      hideLayout: true
    }
  },
  {
    path: '/home',
    name: 'Home',
    component: Home,
    meta: {
      title: '智护银龄 - 首页'
    }
  },
  {
    path: '/chat',
    name: 'Chat',
    component: Chat,
    meta: {
      title: '智护银龄 - 聊天问答'
      // 未登录也可访问，页面内操作时再校验登录
    }
  },
  {
    path: '/graph',
    name: 'GraphView',
    component: GraphView,
    meta: {
      title: '智护银龄 - 图谱可视化'
      // 未登录也可访问
    }
  },
  // 新增：支持通过file_id参数加载特定文件生成的知识图谱
  {
    path: '/graph/:file_id',
    name: 'GraphViewWithFile',
    component: GraphView,
    meta: {
      title: '智护银龄 - 图谱可视化'
      // 未登录也可访问
    }
  },
  {
    path: '/search',
    name: 'Search',
    component: Search,
    meta: {
      title: '智护银龄 - 实体搜索',
      roles: [ROLES.ADMIN, ROLES.DOCTOR, ROLES.PATIENT]
    }
  },
  {
    path: '/knowledge-base',
    name: 'KnowledgeBase',
    component: KnowledgeBase,
    meta: {
      title: '智护银龄 - 文档知识库'
      // 未登录也可访问
    }
  },
  {
    path: '/patient-education',
    name: 'PatientEducation',
    component: PatientEducation,
    meta: {
      title: '智护银龄 - 患者教育中心'
    }
  },
  {
    path: '/medication',
    name: 'MedicationReminder',
    component: MedicationReminder,
    meta: {
      title: '智护银龄 - 服药提醒'
    }
  },
  {
    path: '/upload',
    name: 'DataUpload',
    component: DataUpload,
    meta: {
      title: '智护银龄 - 数据上传',
      roles: [ROLES.ADMIN, ROLES.DOCTOR] // 仅管理员、医生可访问
    }
  },
  {
    path: '/history',
    name: 'History',
    component: History,
    meta: {
      title: '智护银龄 - 历史记录',
      roles: [ROLES.ADMIN, ROLES.DOCTOR, ROLES.PATIENT]
    }
  },
  {
    path: '/cognitive-load',
    name: 'CognitiveLoadAssessment',
    component: CognitiveLoadAssessment,
    meta: {
      title: '智护银龄 - 认知负荷评估',
      roles: [ROLES.ADMIN, ROLES.DOCTOR, ROLES.PATIENT]
    }
  },
  {
    path: '/admin/dashboard',
    name: 'CognitiveDashboard',
    component: CognitiveDashboard,
    meta: {
      title: '智护银龄 - 机构看板',
      roles: [ROLES.ADMIN, ROLES.DOCTOR]
    }
  },
  {
    path: '/family-report',
    name: 'FamilyReport',
    component: FamilyReport,
    meta: {
      title: '智护银龄 - 家属周报'
    }
  },
  {
    path: '/faq',
    name: 'FAQ',
    component: FAQ,
    meta: {
      title: '智护银龄 - 常见问题'
    }
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: {
      title: '智护银龄 - 登录/注册'
    }
  },
  {
    path: '/forgot-password',
    name: 'ForgotPassword',
    component: ForgotPassword,
    meta: {
      title: '智护银龄 - 找回密码'
    }
  },
  // 个人中心页面
  {
    path: '/profile',
    name: 'UserProfile',
    component: UserProfile,
    meta: {
      title: '智护银龄 - 个人中心',
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
  const authPages = ['/profile', '/upload', '/history', '/cognitive-load']

  const userInfo = storage.get('userInfo') || {}
  const userRole = userInfo.role || 'patient'

  if (authPages.includes(to.path) && !isLoggedIn) {
    next('/login')
  } else if (to.path === '/login' && isLoggedIn) {
    next('/home')
  } else if (userRole === ROLES.ELDERLY && !ELDERLY_ALLOWED_ROUTES.includes(to.path)) {
    next('/home')
  } else if (to.meta.roles && to.meta.roles.length > 0) {
    if (!isLoggedIn) {
      next('/login')
    } else {
      if (hasRole(userRole, to.meta.roles)) {
        next()
      } else {
        next('/home')
      }
    }
  } else {
    next()
  }
})

export default router

