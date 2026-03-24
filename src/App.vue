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

    <!-- 老人新手引导 -->
    <OnboardingGuide ref="onboarding" />

    <!-- 情感化反馈 -->
    <EmotionalFeedback />

    <!-- 全局底部返回条 -->
    <GlobalBackBar />

    <!-- 全局语音助手 -->
    <VoiceAssistant />

    <!-- 全局紧急求助浮窗 -->
    <EmergencySOS />
  </div>
</template>

<script>
import TopNavBar from './components/layout/TopNavBar.vue'
import Footer from './components/layout/Footer.vue'
import AnimatedBackground from './components/common/AnimatedBackground.vue'
import OnboardingGuide from './components/common/OnboardingGuide.vue'
import EmotionalFeedback from './components/common/EmotionalFeedback.vue'
import GlobalBackBar from './components/common/GlobalBackBar.vue'
import VoiceAssistant from './components/common/VoiceAssistant.vue'
import EmergencySOS from './components/common/EmergencySOS.vue'

export default {
  name: 'App',
  components: {
    TopNavBar,
    Footer,
    AnimatedBackground,
    OnboardingGuide,
    EmotionalFeedback,
    GlobalBackBar,
    VoiceAssistant,
    EmergencySOS
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
  watch: {
    '$route'(to) {
      this.tryOnboarding(to)
    }
  },
  mounted() {
    // 从localStorage读取保存的主题
    const savedTheme = localStorage.getItem('app-theme') || 'tech'
    this.setTheme(savedTheme)
    
    // 确保 body 标签也有 data-theme 属性
    document.body.setAttribute('data-theme', savedTheme)

    this.$nextTick(() => this.tryOnboarding(this.$route))
  },
  methods: {
    tryOnboarding(route) {
      if (!route || route.path !== '/home') return
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
      if (userInfo.role !== 'elderly') return
      const guide = this.$refs.onboarding
      if (guide && guide.shouldShow()) {
        setTimeout(() => guide.start(), 600)
      }
    },
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
