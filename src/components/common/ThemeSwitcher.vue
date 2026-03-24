<template>
  <div class="theme-switcher">
    <el-dropdown trigger="click" @command="setTheme">
      <div class="theme-toggle-btn">
        <i class="el-icon-brush"></i>
        <span class="theme-label">{{ themeLabel }}</span>
      </div>
      <el-dropdown-menu slot="dropdown">
        <el-dropdown-item command="tech">科技风</el-dropdown-item>
        <el-dropdown-item command="medical">医疗风</el-dropdown-item>
        <el-dropdown-item command="elderly">适老模式</el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown>
  </div>
</template>

<script>
const THEME_LABELS = { tech: '科技风', medical: '医疗风', elderly: '适老模式' }
export default {
  name: 'ThemeSwitcher',
  data() {
    return {
      currentTheme: 'tech'
    }
  },
  computed: {
    themeLabel() {
      return THEME_LABELS[this.currentTheme] || '主题'
    }
  },
  mounted() {
    const savedTheme = localStorage.getItem('app-theme') || 'tech'
    this.currentTheme = savedTheme
    if (document.documentElement.getAttribute('data-theme') !== savedTheme) {
      document.documentElement.setAttribute('data-theme', savedTheme)
      document.body.setAttribute('data-theme', savedTheme)
    }
    this.$root.$on('theme-changed', (theme) => {
      this.currentTheme = theme
    })
  },
  beforeDestroy() {
    this.$root.$off('theme-changed')
  },
  methods: {
    setTheme(theme) {
      if (!theme || !THEME_LABELS[theme]) return
      this.currentTheme = theme
      if (this.$root.$children[0] && this.$root.$children[0].setTheme) {
        this.$root.$children[0].setTheme(theme)
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
  gap: 6px;
  min-width: 36px;
  height: 36px;
  padding: 0 10px;
  background: linear-gradient(135deg, #00f5d4, #22c55e);
  color: #ffffff;
  border-radius: 18px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 10px rgba(0, 245, 212, 0.4);
  user-select: none;
  border: none;
}
.theme-toggle-btn:hover {
  transform: translateY(-2px) scale(1.02);
  box-shadow: 0 4px 16px rgba(0, 245, 212, 0.5);
}
.theme-toggle-btn i {
  font-size: 18px;
}
.theme-label {
  font-size: 13px;
  max-width: 72px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
@media (max-width: 768px) {
  .theme-label { display: none; }
  .theme-toggle-btn { padding: 0; width: 36px; border-radius: 50%; }
}
</style>

