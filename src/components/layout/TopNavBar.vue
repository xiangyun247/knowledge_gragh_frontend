<template>
  <header class="top-navbar">
    <div class="container">
      <!-- Logo 和系统名称 -->
      <div class="logo-section">
        <img src="@/assets/images/logo.png" alt="Logo" class="logo" />
        <h1 class="system-name">忆路康</h1>
      </div>
      
      <!-- 移动端菜单按钮 -->
      <div class="mobile-menu-btn" @click="toggleMenu">
        <i :class="{ 'el-icon-menu': !isMenuOpen, 'el-icon-close': isMenuOpen }" class="menu-icon"></i>
      </div>
      
      <!-- 功能按钮导航 -->
      <nav :class="{ 'nav-menu': true, 'nav-menu-open': isMenuOpen, 'nav-elderly': isElderly }">
        <!-- 老人模式：只显示 3 个核心入口 -->
        <template v-if="isElderly">
          <router-link to="/elderly-chat" class="nav-item nav-item-elderly" active-class="active" @click="closeMenu">
            <i class="el-icon-s-home"></i>
            <span>首页</span>
          </router-link>
          <router-link to="/medication" class="nav-item nav-item-elderly" active-class="active" @click="closeMenu">
            <i class="el-icon-first-aid-kit"></i>
            <span>吃药</span>
          </router-link>
          <router-link to="/family-report" class="nav-item nav-item-elderly" active-class="active" @click="closeMenu">
            <i class="el-icon-phone-outline"></i>
            <span>家人</span>
          </router-link>
        </template>

        <!-- 其他身份：分组下拉菜单 -->
        <template v-else>
          <router-link to="/" class="nav-item" active-class="active" @click="closeMenu">
            <i class="el-icon-s-home"></i>
            <span>首页</span>
          </router-link>

          <!-- 智能对话 -->
          <el-dropdown trigger="hover" @command="handleNavCommand" @click.native.capture.stop>
            <span class="nav-item nav-dropdown-trigger" :class="{ active: isGroupActive('/chat', '/patient-education') }">
              <i class="el-icon-chat-dot-round"></i>
              <span>智能对话</span>
              <i class="el-icon-arrow-down nav-arrow"></i>
            </span>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item command="/chat" :class="{ 'is-active': $route.path === '/chat' }">
                <i class="el-icon-chat-dot-round"></i> 新对话
              </el-dropdown-item>
              <el-dropdown-item command="/patient-education" :class="{ 'is-active': $route.path === '/patient-education' }">
                <i class="el-icon-medal"></i> 患者教育中心
              </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>

          <!-- 知识图谱 -->
          <el-dropdown trigger="hover" @command="handleNavCommand" @click.native.capture.stop>
            <span class="nav-item nav-dropdown-trigger" :class="{ active: isGroupActive('/graph', '/knowledge-base', '/search') }">
              <i class="el-icon-data-analysis"></i>
              <span>知识图谱</span>
              <i class="el-icon-arrow-down nav-arrow"></i>
            </span>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item command="/graph" :class="{ 'is-active': $route.path === '/graph' }">
                <i class="el-icon-data-analysis"></i> 图谱可视化
              </el-dropdown-item>
              <el-dropdown-item command="/knowledge-base" :class="{ 'is-active': $route.path === '/knowledge-base' }">
                <i class="el-icon-document"></i> 知识库管理
              </el-dropdown-item>
              <el-dropdown-item v-if="canUseCore" command="/search" :class="{ 'is-active': $route.path === '/search' }">
                <i class="el-icon-search"></i> 实体搜索
              </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>

          <!-- 认知评估 -->
          <el-dropdown trigger="hover" @command="handleNavCommand" @click.native.capture.stop>
            <span class="nav-item nav-dropdown-trigger" :class="{ active: isGroupActive('/cognitive-load', '/family-report') }">
              <i class="el-icon-data-line"></i>
              <span>认知评估</span>
              <i class="el-icon-arrow-down nav-arrow"></i>
            </span>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item v-if="canUseCore" command="/cognitive-load" :class="{ 'is-active': $route.path === '/cognitive-load' }">
                <i class="el-icon-data-line"></i> 认知负荷评估
              </el-dropdown-item>
              <el-dropdown-item command="/family-report" :class="{ 'is-active': $route.path === '/family-report' }">
                <i class="el-icon-notebook-2"></i> 家属周报
              </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>

          <!-- 健康管理 -->
          <el-dropdown trigger="hover" @command="handleNavCommand" @click.native.capture.stop>
            <span class="nav-item nav-dropdown-trigger" :class="{ active: isGroupActive('/medication', '/upload') }">
              <i class="el-icon-first-aid-kit"></i>
              <span>健康管理</span>
              <i class="el-icon-arrow-down nav-arrow"></i>
            </span>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item command="/medication" :class="{ 'is-active': $route.path === '/medication' }">
                <i class="el-icon-first-aid-kit"></i> 服药提醒
              </el-dropdown-item>
              <el-dropdown-item v-if="canUpload" command="/upload" :class="{ 'is-active': $route.path === '/upload' }">
                <i class="el-icon-upload2"></i> 数据上传
              </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>

          <!-- 管理（仅管理员） -->
          <el-dropdown v-if="canUpload" trigger="hover" @command="handleNavCommand" @click.native.capture.stop>
            <span class="nav-item nav-dropdown-trigger" :class="{ active: isGroupActive('/admin/dashboard', '/history') }">
              <i class="el-icon-monitor"></i>
              <span>管理</span>
              <i class="el-icon-arrow-down nav-arrow"></i>
            </span>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item v-if="canUseCore" command="/history" :class="{ 'is-active': $route.path === '/history' }">
                <i class="el-icon-document-copy"></i> 历史记录
              </el-dropdown-item>
              <el-dropdown-item command="/admin/dashboard" :class="{ 'is-active': $route.path === '/admin/dashboard' }">
                <i class="el-icon-monitor"></i> 机构看板
              </el-dropdown-item>
              <el-dropdown-item command="/faq" :class="{ 'is-active': $route.path === '/faq' }">
                <i class="el-icon-question"></i> 常见问题
              </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>

          <!-- 普通用户：常见问题单独入口 -->
          <router-link v-if="!canUpload" to="/faq" class="nav-item" active-class="active" @click="closeMenu">
            <i class="el-icon-question"></i>
            <span>常见问题</span>
          </router-link>
        </template>
      </nav>
      
      <!-- 用户信息和设置 -->
      <div class="user-section">
        <!-- 主题切换按钮 -->
        <ThemeSwitcher />
        <!-- 未登录时显示登录/注册按钮 -->
        <div v-if="!isLoggedIn" class="auth-buttons">
          <el-button type="primary" size="small" plain @click="handleLoginClick">
            <i class="el-icon-key"></i>
            登录
          </el-button>
          <el-button type="success" size="small" @click="handleRegisterClick">
            <i class="el-icon-user-plus"></i>
            注册
          </el-button>
        </div>
        <!-- 登录后显示用户信息下拉菜单 -->
        <el-dropdown v-else trigger="click">
          <span class="user-info">
            <el-avatar :src="userInfo.avatar || ''" :icon="avatarIcon" size="medium"></el-avatar>
            <span class="user-name">{{ userInfo.username || '用户' }}</span>
            <span v-if="userRole" class="role-badge">{{ roleLabel }}</span>
            <i class="el-icon-arrow-down"></i>
          </span>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item disabled>
              <span class="dropdown-role">{{ roleLabel }}</span>
            </el-dropdown-item>
            <el-dropdown-item divided @click.native="handleProfileClick">
              <i class="el-icon-user"></i>
              个人中心
            </el-dropdown-item>
            <el-dropdown-item>
              <i class="el-icon-setting"></i>
              设置
            </el-dropdown-item>
            <el-dropdown-item divided @click.native="handleLogout">
              <i class="el-icon-switch-button"></i>
              退出
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
    </div>
  </header>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import ThemeSwitcher from '../common/ThemeSwitcher.vue'
import { getRoleLabel, hasRole, ROLES, ELDERLY_ALLOWED_ROUTES } from '@/utils/role'

export default {
  components: {
    ThemeSwitcher
  },
  name: 'TopNavBar',
  data() {
    return {
      isMenuOpen: false
    }
  },
  computed: {
    ...mapGetters(['isLoggedIn', 'userInfo', 'userRole']),
    avatarIcon() {
      return this.userInfo.avatar ? '' : 'el-icon-user'
    },
    roleLabel() {
      return getRoleLabel(this.userRole)
    },
    isElderly() {
      return this.userRole === ROLES.ELDERLY
    },
    canUpload() {
      return !this.isElderly && hasRole(this.userRole, [ROLES.ADMIN, ROLES.DOCTOR])
    },
    canUseCore() {
      return this.isLoggedIn && !this.isElderly && hasRole(this.userRole, [ROLES.ADMIN, ROLES.DOCTOR, ROLES.PATIENT])
    },
    elderlyRoutes() {
      return ELDERLY_ALLOWED_ROUTES
    }
  },
  methods: {
    ...mapActions('user', ['logout']),
    toggleMenu() {
      this.isMenuOpen = !this.isMenuOpen
    },
    closeMenu() {
      this.isMenuOpen = false
    },
    isGroupActive(...paths) {
      return paths.some(p => this.$route.path === p || this.$route.path.startsWith(p + '/'))
    },
    handleNavCommand(path) {
      if (this.$route.path !== path) {
        this.$router.push(path)
      }
      this.closeMenu()
    },
    handleLoginClick() {
      // 检查当前路由是否已经是登录页面，避免导航重复错误
      if (this.$route.path !== '/login') {
        this.$router.push('/login')
      } else {
        // 如果已经在登录页面，可以通过事件总线通知登录组件切换到登录标签
        this.$emit('switchToLogin')
      }
    },
    handleRegisterClick() {
      // 跳转到登录页面并默认选中注册标签
      this.$router.push({
        path: '/login',
        query: { activeTab: 'register' }
      })
    },
    handleProfileClick() {
      // 检查当前路由是否已经是个人中心页面，避免导航重复错误
      if (this.$route.path !== '/profile') {
        this.$router.push('/profile')
      }
    },
    handleLogout() {
      this.logout().then(() => {
        this.$router.push('/')
      })
    }
  }
}
</script>

<style>
.top-navbar {
  background-color: rgba(10, 14, 39, 0.85);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(0, 245, 212, 0.2);
  box-shadow: 0 4px 20px rgba(0, 245, 212, 0.1);
  position: relative;
  z-index: 100;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  align-items: center;
  gap: 8px;
  height: 70px;
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #00f5d4, #00bbf9);
  box-shadow: 0 0 20px rgba(0, 245, 212, 0.5);
  animation: rotate 20s linear infinite;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.system-name {
  font-size: 20px;
  font-weight: 700;
  background: linear-gradient(135deg, #00f5d4, #00bbf9);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
}

/* 移动端菜单按钮 */
.mobile-menu-btn {
  display: none;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: rgba(0, 245, 212, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 101;
}

.mobile-menu-btn:hover {
  background-color: rgba(0, 245, 212, 0.2);
  box-shadow: 0 4px 12px rgba(0, 245, 212, 0.3);
}

.menu-icon {
  font-size: 20px;
  color: #00f5d4;
}

.nav-menu {
  display: flex;
  align-items: center;
  gap: 2px;
  flex: 1;
  max-width: 860px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 6px 12px;
  font-size: 14px;
  color: #ffffff;
  text-decoration: none;
  border-radius: 18px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  white-space: nowrap;
  line-height: 1.4;
}

.nav-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(0, 245, 212, 0.2), transparent);
  transition: left 0.5s;
}

.nav-item:hover {
  background-color: rgba(0, 245, 212, 0.1);
  box-shadow: 0 4px 12px rgba(0, 245, 212, 0.3);
  transform: translateY(-2px);
}

.nav-item:hover::before {
  left: 100%;
}

.nav-item.active {
  background: linear-gradient(135deg, #00f5d4, #00bbf9);
  box-shadow: 0 4px 12px rgba(0, 245, 212, 0.4);
}

/* 下拉菜单触发器 */
.nav-dropdown-trigger {
  cursor: pointer;
  user-select: none;
}

.nav-arrow {
  font-size: 12px;
  margin-left: 2px;
  transition: transform 0.3s ease;
}

.nav-menu .el-dropdown:hover .nav-arrow {
  transform: rotate(180deg);
}

/* 下拉菜单项高亮 */
.nav-menu .el-dropdown-menu__item {
  padding: 8px 20px;
}

.nav-menu .el-dropdown-menu__item i {
  margin-right: 6px;
  color: #00f5d4;
}

.nav-menu .el-dropdown-menu__item.is-active {
  color: #00f5d4;
  font-weight: 600;
}

.user-section {
  display: flex;
  align-items: center;
  gap: 10px;
}

.auth-buttons {
  display: flex;
  gap: 8px;
  align-items: center;
}

.auth-buttons .el-button {
  border-radius: 18px;
  font-weight: 500;
  transition: all 0.3s ease;
  padding: 5px 12px;
  font-size: 13px;
}

.auth-buttons .el-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 245, 212, 0.3);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.user-info:hover {
  background-color: rgba(0, 245, 212, 0.1);
  box-shadow: 0 4px 12px rgba(0, 245, 212, 0.3);
}

.user-name {
  font-size: 14px;
  font-weight: 500;
}

.role-badge {
  font-size: 11px;
  padding: 6px 8px;
  border-radius: 10px;
  background: rgba(0, 245, 212, 0.1);
  color: #00f5d4;
  margin-left: 4px;
}

.dropdown-role {
  font-size: 12px;
  color: #909399;
}

/* ===== 老人简化模式 ===== */
.nav-elderly {
  gap: 12px;
}

.nav-item-elderly {
  padding: 10px 22px;
  border-radius: 24px;
  font-size: 17px;
  gap: 8px;
  border: 1.5px solid rgba(0, 245, 212, 0.3);
  background: rgba(0, 245, 212, 0.06);
}

.nav-item-elderly i {
  font-size: 22px;
}

.nav-item-elderly:hover {
  background: rgba(0, 245, 212, 0.15);
  border-color: rgba(0, 245, 212, 0.6);
  box-shadow: 0 4px 20px rgba(0, 245, 212, 0.3);
  transform: translateY(-2px);
}

.nav-item-elderly.active {
  background: linear-gradient(135deg, #00f5d4, #00bbf9);
  box-shadow: 0 4px 16px rgba(0, 245, 212, 0.5);
  border-color: transparent;
}

@media (max-width: 960px) {
  .nav-item-elderly span {
    display: inline !important;
  }
  .nav-item-elderly {
    padding: 10px 18px;
    border-radius: 24px;
  }
}

/* 响应式：中屏下拉菜单隐藏文字 */
@media (max-width: 960px) {
  .nav-item span:not(.nav-arrow) {
    display: none;
  }
  .nav-item {
    padding: 8px;
    border-radius: 50%;
  }
  .nav-arrow {
    display: none;
  }
  .nav-menu .el-dropdown {
    flex-shrink: 0;
  }
  .system-name {
    font-size: 16px;
  }
}

@media (max-width: 768px) {
  .mobile-menu-btn {
    display: flex;
  }

  .nav-menu {
    position: fixed;
    top: 60px;
    left: -100%;
    width: 220px;
    height: calc(100vh - 60px);
    background-color: rgba(10, 14, 39, 0.95);
    backdrop-filter: blur(10px);
    border-right: 1px solid rgba(0, 245, 212, 0.2);
    flex-direction: column;
    align-items: stretch;
    padding: 20px 0;
    transition: left 0.3s ease;
    box-shadow: 4px 0 20px rgba(0, 245, 212, 0.1);
  }

  .nav-menu-open {
    left: 0;
  }

  .nav-menu .el-dropdown {
    width: 100%;
  }

  .nav-dropdown-trigger {
    width: 100%;
    justify-content: flex-start;
    border-radius: 10px;
    margin: 0 10px;
    padding: 12px 16px !important;
    border-radius: 10px;
  }

  .nav-dropdown-trigger span:not(.nav-arrow),
  .nav-arrow {
    display: inline !important;
  }

  .nav-item {
    width: 80%;
    justify-content: flex-start;
    border-radius: 10px;
    margin: 0 auto 8px;
  }

  .nav-item span {
    display: inline !important;
  }

  .system-name {
    display: none;
  }
}

@media (max-width: 992px) {
  .auth-buttons .el-button span {
    display: none;
  }
  
  .auth-buttons .el-button {
    padding: 5px;
    border-radius: 50%;
    width: 32px;
    height: 32px;
  }
  
  .auth-buttons .el-button i {
    font-size: 16px;
  }
}

@media (max-width: 768px) {
  .auth-buttons {
    gap: 5px;
  }
  
  .auth-buttons .el-button {
    font-size: 12px;
    padding: 4px 8px;
  }
  
  .auth-buttons .el-button i {
    font-size: 14px;
  }
}

@media (max-width: 576px) {
  .container {
    padding: 0 10px;
  }
  
  .logo {
    width: 35px;
    height: 35px;
  }
  
  .user-name {
    display: none;
  }
  
  .nav-menu {
    width: 100%;
    left: -100%;
  }
  
  .auth-buttons {
    display: flex;
  }
  
  .auth-buttons .el-button {
    font-size: 11px;
    padding: 4px 6px;
  }
  
  .auth-buttons .el-button span {
    display: none;
  }
  
  .auth-buttons .el-button i {
    font-size: 16px;
  }
}
</style>
