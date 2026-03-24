<template>
  <transition name="backbar-slide">
    <div class="global-back-bar" v-if="showBar">
      <div class="back-btn-wrap" @click="goBack">
        <i class="el-icon-arrow-left"></i>
        <span>返回</span>
      </div>
      <div class="breadcrumb-text">
        <i :class="pageIcon"></i>
        <span>{{ pageLabel }}</span>
      </div>
    </div>
  </transition>
</template>

<script>
const PAGE_META = {
  '/home': { label: '首页', icon: 'el-icon-s-home' },
  '/chat': { label: '聊天问答', icon: 'el-icon-chat-dot-round' },
  '/patient-education': { label: '患者教育', icon: 'el-icon-medal' },
  '/medication': { label: '服药提醒', icon: 'el-icon-first-aid-kit' },
  '/graph': { label: '知识图谱', icon: 'el-icon-data-analysis' },
  '/knowledge-base': { label: '知识库', icon: 'el-icon-document' },
  '/search': { label: '实体搜索', icon: 'el-icon-search' },
  '/upload': { label: '数据上传', icon: 'el-icon-upload2' },
  '/history': { label: '历史记录', icon: 'el-icon-document-copy' },
  '/cognitive-load': { label: '认知负荷评估', icon: 'el-icon-data-line' },
  '/family-report': { label: '家属周报', icon: 'el-icon-notebook-2' },
  '/admin/dashboard': { label: '机构看板', icon: 'el-icon-monitor' },
  '/faq': { label: '常见问题', icon: 'el-icon-question' },
  '/profile': { label: '个人中心', icon: 'el-icon-user' }
}

const HIDE_ON = ['/', '/home', '/login', '/forgot-password']

export default {
  name: 'GlobalBackBar',
  computed: {
    showBar() {
      const route = this.$route
      if (!route) return false
      if (route.meta && route.meta.hideLayout) return false
      return !HIDE_ON.includes(route.path)
    },
    pageLabel() {
      const path = this.$route && this.$route.path
      const meta = PAGE_META[path]
      return (meta && meta.label) || (this.$route && this.$route.meta && this.$route.meta.title) || ''
    },
    pageIcon() {
      const path = this.$route && this.$route.path
      const meta = PAGE_META[path]
      return (meta && meta.icon) || 'el-icon-location-outline'
    }
  },
  methods: {
    goBack() {
      if (window.history.length > 1) {
        this.$router.go(-1)
      } else {
        this.$router.push('/home')
      }
    }
  }
}
</script>

<style scoped>
.global-back-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 44px;
  background: var(--bg-card);
  border-top: 1px solid rgba(var(--primary-blue-rgb), 0.15);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  padding: 0 16px;
  z-index: 900;
  gap: 16px;
}

.back-btn-wrap {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 14px;
  border-radius: 20px;
  background: rgba(var(--primary-blue-rgb), 0.1);
  border: 1px solid rgba(var(--primary-blue-rgb), 0.25);
  color: var(--primary-blue);
  font-size: var(--font-size-base, 14px);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s ease;
  flex-shrink: 0;
}

.back-btn-wrap:hover {
  background: rgba(var(--primary-blue-rgb), 0.2);
  border-color: rgba(var(--primary-blue-rgb), 0.5);
  transform: translateX(-2px);
}

.back-btn-wrap:active {
  transform: scale(0.96);
}

.back-btn-wrap i {
  font-size: 16px;
}

.breadcrumb-text {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: var(--font-size-base, 14px);
  color: var(--text-muted);
}

.breadcrumb-text i {
  font-size: 15px;
  color: rgba(var(--primary-blue-rgb), 0.6);
}

.backbar-slide-enter-active,
.backbar-slide-leave-active {
  transition: all 0.3s ease;
}
.backbar-slide-enter,
.backbar-slide-leave-to {
  transform: translateY(100%);
  opacity: 0;
}

@media (max-width: 768px) {
  .global-back-bar {
    height: 48px;
    padding: 0 12px;
  }
  .back-btn-wrap {
    padding: 8px 16px;
    font-size: 15px;
  }
}
</style>
