<template>
  <div class="theme-switcher">
    <el-tooltip content="切换风格" placement="bottom">
      <div class="theme-toggle-btn" @click="toggleTheme">
        <i class="el-icon-brush"></i>
      </div>
    </el-tooltip>
  </div>
</template>

<script>
export default {
  name: 'ThemeSwitcher',
  data() {
    return {
      currentTheme: 'tech'
    }
  },
  mounted() {
    // 从localStorage读取当前主题，或从App.vue获取
    const savedTheme = localStorage.getItem('app-theme') || 'tech'
    this.currentTheme = savedTheme
    
    // 确保DOM元素有正确的主题属性
    if (document.documentElement.getAttribute('data-theme') !== savedTheme) {
      document.documentElement.setAttribute('data-theme', savedTheme)
      document.body.setAttribute('data-theme', savedTheme)
    }
    
    // 监听主题切换事件
    this.$root.$on('theme-changed', (theme) => {
      this.currentTheme = theme
    })
  },
  beforeDestroy() {
    this.$root.$off('theme-changed')
  },
  methods: {
    toggleTheme() {
      const newTheme = this.currentTheme === 'tech' ? 'medical' : 'tech'
      this.currentTheme = newTheme

      // 统一交给 App 根组件处理主题切换（设置 DOM、localStorage 并广播事件）
      if (this.$root.$children[0] && this.$root.$children[0].setTheme) {
        this.$root.$children[0].setTheme(newTheme)
      }
    }
  }
}
</script>

<style scoped>
.theme-switcher {
  display: flex;
  align-items: center;
}

.theme-toggle-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, #00f5d4, #22c55e);
  color: #ffffff;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 10px rgba(0, 245, 212, 0.4);
  user-select: none;
  border: none;
}

.theme-toggle-btn:hover {
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 4px 16px rgba(0, 245, 212, 0.5);
}

.theme-toggle-btn i {
  font-size: 18px;
}
</style>

