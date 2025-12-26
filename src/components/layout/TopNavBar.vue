<template>
  <header class="top-navbar">
    <div class="container">
      <!-- Logo 和系统名称 -->
      <div class="logo-section">
        <img src="@/assets/images/logo.png" alt="Logo" class="logo" />
        <h1 class="system-name">医疗知识图谱系统</h1>
      </div>
      
      <!-- 移动端菜单按钮 -->
      <div class="mobile-menu-btn" @click="toggleMenu">
        <i :class="{ 'el-icon-menu': !isMenuOpen, 'el-icon-close': isMenuOpen }" class="menu-icon"></i>
      </div>
      
      <!-- 功能按钮导航 -->
      <nav :class="{ 'nav-menu': true, 'nav-menu-open': isMenuOpen }">
        <router-link to="/" class="nav-item" active-class="active" @click="closeMenu">
          <i class="el-icon-s-home"></i>
          <span>首页</span>
        </router-link>
        <router-link to="/chat" class="nav-item" active-class="active" @click="closeMenu">
          <i class="el-icon-chat-dot-round"></i>
          <span>新对话</span>
        </router-link>
        <router-link to="/graph" class="nav-item" active-class="active" @click="closeMenu">
          <i class="el-icon-data-analysis"></i>
          <span>知识图谱</span>
        </router-link>
        <router-link to="/search" class="nav-item" active-class="active" @click="closeMenu">
          <i class="el-icon-search"></i>
          <span>实体搜索</span>
        </router-link>
        <router-link to="/history" class="nav-item" active-class="active" @click="closeMenu">
          <i class="el-icon-document-copy"></i>
          <span>历史记录</span>
        </router-link>
        <router-link to="/upload" class="nav-item" active-class="active" @click="closeMenu">
          <i class="el-icon-upload2"></i>
          <span>数据上传</span>
        </router-link>
        <router-link to="/faq" class="nav-item" active-class="active" @click="closeMenu">
          <i class="el-icon-question"></i>
          <span>常见问题</span>
        </router-link>
      </nav>
      
      <!-- 用户信息和设置 -->
      <div class="user-section">
        <!-- 主题切换按钮 -->
        <ThemeSwitcher />
        
        <!-- 未登录时显示登录/注册按钮 -->
        <div v-if="!isLoggedIn" class="auth-buttons">
          <el-button type="primary" size="small" plain class="app-btn app-btn-ghost" @click="handleLoginClick">
            <i class="el-icon-key"></i>
            登录
          </el-button>
          <el-button type="success" size="small" class="app-btn app-btn-secondary" @click="handleRegisterClick">
            <i class="el-icon-user-plus"></i>
            注册
          </el-button>
        </div>
        <!-- 登录后显示用户信息下拉菜单 -->
        <el-dropdown v-else trigger="click">
          <span class="user-info">
            <el-avatar 
              :src="avatarSrc" 
              :icon="!avatarSrc && 'el-icon-user'" 
              size="medium"
            ></el-avatar>
            <span class="user-name">{{ userInfo.username || '用户' }}</span>
            <i class="el-icon-arrow-down"></i>
          </span>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item @click.native="handleProfileClick">
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

export default {
  name: 'TopNavBar',
  components: {
    ThemeSwitcher
  },
  data() {
    return {
      isMenuOpen: false
    }
  },
  computed: {
    ...mapGetters(['isLoggedIn', 'userInfo']),
    // 计算头像源，如果没有头像则使用默认头像
    avatarSrc() {
      return this.userInfo.avatar || this.getDefaultAvatar()
    }
  },
  methods: {
    ...mapActions('user', ['logout']),
    // 获取默认头像
    getDefaultAvatar() {
      return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxMDAiIGN5PSIxMDAiIHI9IjEwMCIgZmlsbD0iIzAwZDRmZiIgb3BhY2l0eT0iMC4yIi8+PHBhdGggZD0iTTEwMCAxMDBjMjcuNiAwIDUwIDIyLjQgNTAgNTBzLTIyLjQgNTAtNTAgNTAtNTAtMjIuNC01MC01MCAyMi40LTUwIDUwLTUwem0wIDIwYy0xNi42IDAtMzAgMTMuNC0zMCAzMHMxMy40IDMwIDMwIDMwIDMwLTEzLjQgMzAtMzAtMTMuNC0zMC0zMC0zMHoiIGZpbGw9IiMwMGQ0ZmYiLz48L3N2Zz4='
    },
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
  box-shadow: 0 4px 20px rgba(0, 255, 255, 0.1);
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
  background: linear-gradient(135deg, rgba(0, 255, 255, 1), rgba(255, 0, 255, 1));
  box-shadow: 0 0 20px rgba(0, 255, 255, 0.5);
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
  box-shadow: 0 4px 12px rgba(0, 255, 255, 0.3);
}

.menu-icon {
  font-size: 20px;
  color: #00f5d4;
}

.nav-menu {
  display: flex;
  gap: 5px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  color: #ffffff;
  text-decoration: none;
  border-radius: 20px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.nav-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(0, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.nav-item:hover {
  background-color: rgba(0, 245, 212, 0.1);
  box-shadow: 0 4px 12px rgba(0, 255, 255, 0.3);
  transform: translateY(-2px);
}

.nav-item:hover::before {
  left: 100%;
}

.nav-item.active {
  background: linear-gradient(135deg, rgba(0, 255, 255, 1), rgba(255, 0, 255, 1));
  box-shadow: 0 4px 12px rgba(0, 255, 255, 0.4);
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
  box-shadow: 0 4px 12px rgba(0, 255, 255, 0.3);
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
  box-shadow: 0 4px 12px rgba(0, 255, 255, 0.3);
}

.user-name {
  font-size: 14px;
  font-weight: 500;
}

/* 响应式设计 */
@media (max-width: 992px) {
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
    box-shadow: 4px 0 20px rgba(0, 255, 255, 0.1);
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
