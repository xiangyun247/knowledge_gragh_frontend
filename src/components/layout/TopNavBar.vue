<template>
  <header class="top-navbar">
    <div class="container">
      <!-- Logo 和系统名称 -->
      <div class="logo-section">
        <img src="@/assets/images/logo.png" alt="Logo" class="logo" />
        <h1 class="system-name">智护银龄</h1>
      </div>
      
      <!-- 移动端菜单按钮 -->
      <div class="mobile-menu-btn" @click="toggleMenu">
        <i :class="{ 'el-icon-menu': !isMenuOpen, 'el-icon-close': isMenuOpen }" class="menu-icon"></i>
      </div>
      
      <!-- 功能按钮导航：首页 / 对话·图谱·知识库 / 搜索·上传 / 历史·FAQ -->
      <nav :class="{ 'nav-menu': true, 'nav-menu-open': isMenuOpen, 'nav-elderly': isElderly }">
        <!-- 老人模式：只显示 4 个核心入口 -->
        <template v-if="isElderly">
          <router-link to="/home" class="nav-item nav-item-elderly" active-class="active" @click="closeMenu">
            <i class="el-icon-s-home"></i>
            <span>首页</span>
          </router-link>
          <router-link to="/chat" class="nav-item nav-item-elderly" active-class="active" @click="closeMenu">
            <i class="el-icon-chat-dot-round"></i>
            <span>问一问</span>
          </router-link>
          <router-link to="/medication" class="nav-item nav-item-elderly" active-class="active" @click="closeMenu">
            <i class="el-icon-first-aid-kit"></i>
            <span>吃药</span>
          </router-link>
          <router-link to="/patient-education" class="nav-item nav-item-elderly" active-class="active" @click="closeMenu">
            <i class="el-icon-medal"></i>
            <span>学知识</span>
          </router-link>
        </template>

        <!-- 其他身份：完整导航 -->
        <template v-else>
          <router-link to="/" class="nav-item" active-class="active" @click="closeMenu">
            <i class="el-icon-s-home"></i>
            <span>首页</span>
          </router-link>
          <router-link to="/chat" class="nav-item" active-class="active" @click="closeMenu">
            <i class="el-icon-chat-dot-round"></i>
            <span>新对话</span>
          </router-link>
          <router-link to="/patient-education" class="nav-item" active-class="active" @click="closeMenu">
            <i class="el-icon-medal"></i>
            <span>患者教育中心</span>
          </router-link>
          <router-link to="/medication" class="nav-item" active-class="active" @click="closeMenu">
            <i class="el-icon-first-aid-kit"></i>
            <span>服药提醒</span>
          </router-link>
          <router-link to="/graph" class="nav-item" active-class="active" @click="closeMenu">
            <i class="el-icon-data-analysis"></i>
            <span>知识图谱</span>
          </router-link>
          <router-link to="/knowledge-base" class="nav-item" active-class="active" @click="closeMenu">
            <i class="el-icon-document"></i>
            <span>知识库</span>
          </router-link>
          <router-link v-if="canUseCore" to="/search" class="nav-item" active-class="active" @click="closeMenu">
            <i class="el-icon-search"></i>
            <span>实体搜索</span>
          </router-link>
          <router-link v-if="canUpload" to="/upload" class="nav-item" active-class="active" @click="closeMenu">
            <i class="el-icon-upload2"></i>
            <span>数据上传</span>
          </router-link>
          <router-link v-if="canUseCore" to="/history" class="nav-item" active-class="active" @click="closeMenu">
            <i class="el-icon-document-copy"></i>
            <span>历史记录</span>
          </router-link>
          <router-link v-if="canUseCore" to="/cognitive-load" class="nav-item" active-class="active" @click="closeMenu">
            <i class="el-icon-data-line"></i>
            <span>认知负荷评估</span>
          </router-link>
          <router-link to="/family-report" class="nav-item" active-class="active" @click="closeMenu">
            <i class="el-icon-notebook-2"></i>
            <span>家属周报</span>
          </router-link>
          <router-link v-if="canUpload" to="/admin/dashboard" class="nav-item" active-class="active" @click="closeMenu">
            <i class="el-icon-monitor"></i>
            <span>机构看板</span>
          </router-link>
          <router-link to="/faq" class="nav-item" active-class="active" @click="closeMenu">
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
  justify-content: space-between;
  height: 70px;
  flex-wrap: wrap;
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
  flex-wrap: nowrap;
  gap: 4px;
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

@media (max-width: 1100px) {
  .nav-item-elderly span {
    display: inline !important;
  }
  .nav-item-elderly {
    padding: 10px 18px;
    border-radius: 24px;
  }
}

/* 响应式：中屏改为仅图标，避免顶栏挤换行 */
@media (max-width: 1100px) {
  .nav-item span {
    display: none;
  }
  
  .nav-item {
    padding: 8px;
    border-radius: 50%;
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
    width: 200px;
    height: calc(100vh - 60px);
    background-color: rgba(10, 14, 39, 0.95);
    backdrop-filter: blur(10px);
    border-right: 1px solid rgba(0, 245, 212, 0.2);
    flex-direction: column;
    align-items: center;
    padding: 20px 0;
    transition: left 0.3s ease;
    box-shadow: 4px 0 20px rgba(0, 245, 212, 0.1);
  }
  
  .nav-menu-open {
    left: 0;
  }
  
  .nav-item {
    width: 80%;
    justify-content: flex-start;
    border-radius: 10px;
    margin-bottom: 10px;
  }
  
  .nav-item span {
    display: inline;
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
    display: none;
  }
}
</style>
