<template>
  <div class="theme-switcher">
    <el-tooltip :content="currentTheme === 'tech' ? '切换到医疗风' : '切换到科技风'" placement="bottom">
      <div 
        class="theme-toggle-btn" 
        @click="toggleTheme"
        :class="{ 'medical': currentTheme === 'medical' }"
      >
        <i :class="currentTheme === 'tech' ? 'el-icon-view' : 'el-icon-medicine-box'"></i>
        <span class="theme-label">{{ currentTheme === 'tech' ? '科技风' : '医疗风' }}</span>
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
  gap: 6px;
  padding: 6px 14px;
  background: linear-gradient(135deg, rgba(0, 255, 255, 1), rgba(255, 0, 255, 1));
  color: #ffffff;
  border-radius: 18px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 255, 255, 0.3);
  font-size: 13px;
  font-weight: 600;
  user-select: none;
  border: none;
}

.theme-toggle-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 255, 255, 0.4);
}

.theme-toggle-btn.medical {
  background: linear-gradient(135deg, #0066cc, #00a8e8);
  box-shadow: 0 2px 8px rgba(0, 102, 204, 0.3);
}

.theme-toggle-btn.medical:hover {
  box-shadow: 0 4px 12px rgba(0, 102, 204, 0.4);
}

.theme-label {
  font-size: 13px;
}

.theme-toggle-btn i {
  font-size: 16px;
}

/* 医疗风下的主题切换按钮 */
[data-theme="medical"] .theme-toggle-btn {
  background: linear-gradient(135deg, #0066cc, #00a8e8);
  box-shadow: 0 2px 8px rgba(0, 102, 204, 0.3);
  color: #ffffff;
}

[data-theme="medical"] .theme-toggle-btn:hover {
  box-shadow: 0 4px 12px rgba(0, 102, 204, 0.4);
}

/* 响应式设计 */
@media (max-width: 992px) {
  .theme-label {
    display: none;
  }
  
  .theme-toggle-btn {
    padding: 6px 10px;
  }
}

@media (max-width: 768px) {
  .theme-toggle-btn {
    padding: 5px 8px;
    font-size: 12px;
  }
  
  .theme-toggle-btn i {
    font-size: 14px;
  }
}
</style>

