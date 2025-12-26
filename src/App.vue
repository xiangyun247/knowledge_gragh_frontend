<template>
  <div id="app" class="app-container" :data-theme="currentTheme">
    <!-- 动态背景 -->
    <AnimatedBackground v-if="currentTheme === 'tech'" />
    
    <!-- 顶部导航栏（封面页隐藏） -->
    <TopNavBar v-if="showLayout" />
    
    <!-- 主内容区域 -->
    <main :class="['main-content', { 'main-content--full': !showLayout }]">
      <transition name="fade" mode="out-in">
        <router-view />
      </transition>
    </main>
    
    <!-- 底部信息栏（封面页隐藏） -->
    <Footer v-if="showLayout" />
  </div>
</template>

<script>
import TopNavBar from './components/layout/TopNavBar.vue'
import Footer from './components/layout/Footer.vue'
import AnimatedBackground from './components/common/AnimatedBackground.vue'

export default {
  name: 'App',
  components: {
    TopNavBar,
    Footer,
    AnimatedBackground
  },
  data() {
    return {
      currentTheme: 'tech' // 默认科技风
    }
  },
  computed: {
    showLayout() {
      return !(this.$route && this.$route.meta && this.$route.meta.hideLayout)
    }
  },
  mounted() {
    // 从localStorage读取保存的主题
    const savedTheme = localStorage.getItem('app-theme') || 'tech'
    this.setTheme(savedTheme)
    
    // 确保 body 标签也有 data-theme 属性
    document.body.setAttribute('data-theme', savedTheme)
  },
  methods: {
    setTheme(theme) {
      this.currentTheme = theme
      document.documentElement.setAttribute('data-theme', theme)
      document.body.setAttribute('data-theme', theme)
      localStorage.setItem('app-theme', theme)
      // 触发主题切换事件，供其他组件使用
      this.$root.$emit('theme-changed', theme)
    }
  }
}
</script>

<style>
.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--primary-dark);
  color: var(--text-primary);
  position: relative;
  overflow-x: hidden;
  transition: background-color 0.3s ease, color 0.3s ease;
}

.main-content {
  flex: 1;
  padding: 20px;
  position: relative;
  z-index: 1;
}

.main-content--full {
  padding: 0;
}

/* 页面切换动画 */
.fade-enter-active,
.fade-leave-active {
  transition: all 0.5s ease;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
  transform: translateY(20px);
}
</style>
