<template>
  <div class="cover-container">
    <!-- 封面主内容区 -->
    <section class="cover-hero">
      <div class="cover-content">
        <h1 class="cover-title">
          <span class="title-line">探索医疗知识的</span>
          <span class="title-highlight">智能图谱</span>
        </h1>
        <p class="cover-subtitle">
          利用人工智能技术构建的医疗知识图谱系统，为您提供专业、准确的医疗信息查询与可视化服务
        </p>
        <div class="cover-cta-buttons">
          <router-link to="/chat" class="btn-primary app-btn app-btn-primary" v-ripple>
            <i class="el-icon-chat-dot-round"></i>
            开始问答
          </router-link>
          <router-link to="/graph" class="btn-secondary app-btn app-btn-secondary" v-ripple>
            <i class="el-icon-s-data"></i>
            查看图谱
          </router-link>
        </div>
      </div>
    </section>

    <!-- 知识图谱概览 -->
    <section class="cover-overview">
      <h2 class="overview-title">知识图谱概览</h2>
      <div class="overview-timeline">
        <div class="timeline-axis"></div>
        <div class="overview-cards">
          <div class="overview-card card-left">
            <div class="card-node"></div>
            <div class="card-content">
              <div class="card-header">
                <span class="card-title">总实体数</span>
                <span class="card-icon card-icon-data">
                  <i class="el-icon-s-data"></i>
                </span>
              </div>
              <div class="card-body">
                <span class="card-number">10,500</span>
                <span class="card-subtitle">个知识实体</span>
              </div>
              <div class="card-footer">
                <span class="card-trend">+5.2%</span>
                <span class="card-label">较上月</span>
              </div>
            </div>
          </div>

          <div class="overview-card card-right">
            <div class="card-node"></div>
            <div class="card-content">
              <div class="card-header">
                <span class="card-title">关系总数</span>
                <span class="card-icon card-icon-link">
                  <i class="el-icon-link"></i>
                </span>
              </div>
              <div class="card-body">
                <span class="card-number">52,000</span>
                <span class="card-subtitle">条知识关联</span>
              </div>
              <div class="card-footer">
                <span class="card-trend">+8.7%</span>
                <span class="card-label">较上月</span>
              </div>
            </div>
          </div>

          <div class="overview-card card-left">
            <div class="card-node"></div>
            <div class="card-content">
              <div class="card-header">
                <span class="card-title">搜索量</span>
                <span class="card-icon card-icon-search">
                  <i class="el-icon-search"></i>
                </span>
              </div>
              <div class="card-body">
                <span class="card-number">15,230</span>
                <span class="card-subtitle">次搜索</span>
              </div>
              <div class="card-footer">
                <span class="card-trend">+12.3%</span>
                <span class="card-label">较上月</span>
              </div>
            </div>
          </div>

          <div class="overview-card card-right">
            <div class="card-node"></div>
            <div class="card-content">
              <div class="card-header">
                <span class="card-title">用户活跃度</span>
                <span class="card-icon card-icon-user">
                  <i class="el-icon-user-solid"></i>
                </span>
              </div>
              <div class="card-body">
                <span class="card-number">89.5%</span>
                <span class="card-subtitle">活跃度</span>
              </div>
              <div class="card-footer">
                <span class="card-trend">+3.2%</span>
                <span class="card-label">较上月</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 进入系统按钮 + 系统状态（右下角区域） -->
    <div class="cover-enter">
      <div class="enter-status">
        <span class="status-dot"></span>
        <span class="status-text">系统状态：正常 · 数据实时更新</span>
      </div>
      <router-link to="/home" class="btn-enter app-btn app-btn-primary" v-ripple>
        <span class="btn-text">进入系统</span>
        <i class="el-icon-right"></i>
      </router-link>
    </div>
  </div>
</template>

<script>
import anime from 'animejs/lib/anime.es.js'

export default {
  name: 'CoverView',
  mounted() {
    this.$nextTick(() => {
      this.initAnimations()
      this.startNumberAnimation()
    })
  },
  methods: {
    initAnimations() {
      const isMedical = document.body.getAttribute('data-theme') === 'medical'
      const baseEasing = 'easeOutCubic'
      const titleDuration = isMedical ? 700 : 800
      const blockDuration = isMedical ? 600 : 800
      const translateTitle = isMedical ? -12 : -20
      const buttonScaleFrom = isMedical ? 0.96 : 0.9
      const cardTranslate = isMedical ? 18 : 30
      const enterBtnScaleFrom = isMedical ? 0.98 : 0.95

      // 标题和按钮淡入
      anime({
        targets: '.cover-title, .cover-subtitle',
        opacity: [0, 1],
        translateY: [translateTitle, 0],
        delay: 200,
        duration: titleDuration,
        easing: baseEasing
      })

      anime({
        targets: '.cover-cta-buttons .btn-primary, .cover-cta-buttons .btn-secondary',
        opacity: [0, 1],
        scale: [buttonScaleFrom, 1],
        delay: anime.stagger(150, { start: 600 }),
        duration: blockDuration,
        easing: baseEasing
      })

      // 概览卡片时间线动画
      const cards = document.querySelectorAll('.overview-card')
      if (cards.length) {
        anime({
          targets: cards,
          opacity: [0, 1],
          translateX: (el, i) => {
            return i % 2 === 0 ? [-cardTranslate, 0] : [cardTranslate, 0]
          },
          delay: anime.stagger(200, { start: 1000 }),
          duration: blockDuration,
          easing: baseEasing
        })
      }

      // 进入系统按钮动画
      anime({
        targets: '.btn-enter',
        opacity: [0, 1],
        scale: [enterBtnScaleFrom, 1],
        delay: 2000,
        duration: blockDuration,
        easing: baseEasing
      })
    },
    
    startNumberAnimation() {
      const numbers = document.querySelectorAll('.card-number')
      numbers.forEach(number => {
        const target = number.innerText.replace(/[,%]/g, '')
        const isPercentage = number.innerText.includes('%')
        
        let current = 0
        const increment = parseFloat(target) / 100
        const timer = setInterval(() => {
          current += increment
          if (current >= parseFloat(target)) {
            current = parseFloat(target)
            clearInterval(timer)
          }
          
          let displayText = ''
          if (target.includes(',')) {
            displayText = Math.floor(current).toLocaleString()
          } else {
            displayText = current.toFixed(1)
          }
          
          if (isPercentage) {
            displayText += '%'
          }
          
          number.innerText = displayText
        }, 20)
      })
    }
  }
}
</script>

<style scoped>
.cover-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  padding: 24px 24px 24px;
  box-sizing: border-box;
  position: relative;
  overflow: hidden;
  background: 
    radial-gradient(circle at top, rgba(0, 245, 212, 0.12), transparent 60%),
    radial-gradient(circle at 80% 40%, rgba(0, 187, 249, 0.08), transparent 50%),
    linear-gradient(135deg, #020817 0%, #050b18 50%, #020617 100%);
}

/* 封面主内容区 */
.cover-hero {
  text-align: center;
  margin-bottom: 24px;
  position: relative;
  z-index: 2;
}

.cover-content {
  max-width: 900px;
  margin: 0 auto;
}

.cover-title {
  font-size: clamp(32px, 4vw, 72px);
  font-weight: 800;
  margin-bottom: 24px;
  line-height: 1.2;
  letter-spacing: clamp(1px, 0.2vw, 3px);
  position: relative;
}

.title-line {
  display: block;
  background: linear-gradient(135deg, #00f5d4, #00bbf9);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 
    0 0 20px rgba(0, 245, 212, 0.8),
    0 0 40px rgba(0, 245, 212, 0.6),
    0 0 60px rgba(0, 187, 249, 0.4);
  animation: breathe 3s ease-in-out infinite;
}

.title-highlight {
  display: block;
  background: linear-gradient(135deg, #00f5d4, #00bbf9);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 
    0 0 20px rgba(0, 245, 212, 0.8),
    0 0 40px rgba(0, 245, 212, 0.6),
    0 0 60px rgba(0, 187, 249, 0.4);
  animation: breathe 3s ease-in-out infinite 0.5s;
}

@keyframes breathe {
  0%, 100% {
    opacity: 0.85;
    filter: brightness(1);
  }
  50% {
    opacity: 1;
    filter: brightness(1.15);
  }
}

.cover-subtitle {
  font-size: 20px;
  color: rgba(255, 255, 255, 0.85);
  margin-bottom: 48px;
  line-height: 1.8;
  max-width: 700px;
  margin-left: auto;
  margin-right: auto;
}

.cover-cta-buttons {
  display: flex;
  gap: 24px;
  justify-content: center;
  flex-wrap: wrap;
}

.btn-primary,
.btn-secondary {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 14px 36px;
  border-radius: 32px;
  font-size: 17px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s ease;
  border: none;
  cursor: pointer;
  overflow: hidden;
  position: relative;
}

.btn-primary::before,
.btn-secondary::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: all 0.4s ease;
}

.btn-primary:hover::before,
.btn-secondary:hover::before {
  left: 100%;
}

.btn-primary {
  background: linear-gradient(135deg, #00f5d4, #00bbf9);
  color: #020817;
  box-shadow: 0 6px 30px rgba(0, 245, 212, 0.5), 0 0 40px rgba(0, 187, 249, 0.3);
}

.btn-primary:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 40px rgba(0, 245, 212, 0.7), 0 0 60px rgba(0, 187, 249, 0.5);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.08);
  color: #00f5d4;
  border: 2px solid rgba(0, 245, 212, 0.4);
  box-shadow: 0 4px 20px rgba(0, 245, 212, 0.2);
  backdrop-filter: blur(10px);
}

.btn-secondary:hover {
  transform: translateY(-3px);
  background: rgba(0, 245, 212, 0.12);
  border-color: rgba(0, 245, 212, 0.6);
  box-shadow: 0 6px 30px rgba(0, 245, 212, 0.4);
}

/* 知识图谱概览 */
.cover-overview {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto 16px;
  position: relative;
  z-index: 2;
}

.overview-title {
  text-align: center;
  font-size: 36px;
  font-weight: 700;
  margin-bottom: 50px;
  background: linear-gradient(135deg, #00f5d4, #00bbf9);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  position: relative;
}

.overview-title::after {
  content: '';
  display: block;
  width: 100px;
  height: 3px;
  background: linear-gradient(135deg, #00f5d4, #00bbf9);
  margin: 20px auto;
  border-radius: 2px;
  box-shadow: 0 0 15px rgba(0, 245, 212, 0.6);
}

.overview-timeline {
  position: relative;
  padding: 16px 0 8px;
}

.timeline-axis {
  position: absolute;
  left: 50%;
  top: 0;
  bottom: 0;
  width: 3px;
  background: linear-gradient(to bottom, 
    transparent 0%,
    rgba(0, 245, 212, 0.4) 10%,
    rgba(0, 245, 212, 0.8) 50%,
    rgba(0, 187, 249, 0.8) 50%,
    rgba(0, 245, 212, 0.4) 90%,
    transparent 100%
  );
  transform: translateX(-50%);
  box-shadow: 0 0 20px rgba(0, 245, 212, 0.5);
}

.overview-cards {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.overview-card {
  position: relative;
  width: 42%;
  background: radial-gradient(circle at top left, rgba(0, 245, 212, 0.1), rgba(5, 11, 24, 0.95));
  border: 1px solid rgba(148, 163, 184, 0.3);
  border-radius: 18px;
  padding: 28px;
  backdrop-filter: blur(12px);
  box-shadow: 0 6px 30px rgba(0, 0, 0, 0.4);
  transition: all 0.4s ease;
}

.overview-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 10px 40px rgba(0, 245, 212, 0.4), 0 0 30px rgba(0, 187, 249, 0.3);
  border-color: rgba(0, 245, 212, 0.6);
}

.card-left {
  margin-right: auto;
}

.card-right {
  margin-left: auto;
}

.card-node {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 16px;
  height: 16px;
  background: radial-gradient(circle, #00f5d4, #00bbf9);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  box-shadow: 0 0 20px rgba(0, 245, 212, 0.8), 0 0 40px rgba(0, 187, 249, 0.6);
  z-index: 3;
  animation: nodePulse 2s ease-in-out infinite;
}

@keyframes nodePulse {
  0%, 100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 1;
  }
  50% {
    transform: translate(-50%, -50%) scale(1.2);
    opacity: 0.8;
  }
}

.card-content {
  position: relative;
  z-index: 1;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.card-title {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.85);
  font-weight: 500;
}

.card-icon {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  background: radial-gradient(circle at top, rgba(0, 245, 212, 0.22), rgba(5, 11, 24, 0.96));
  box-shadow: 0 0 18px rgba(0, 245, 212, 0.65);
  border: 1px solid rgba(148, 163, 184, 0.6);
  color: #e0faff;
  backdrop-filter: blur(10px);
  position: relative;
  overflow: hidden;
}

.card-icon::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 30% 0%, rgba(0, 245, 212, 0.4), transparent 55%);
  opacity: 0.9;
}

.card-icon i {
  position: relative;
  z-index: 1;
}

.card-body {
  margin-bottom: 20px;
}

.card-number {
  font-size: 42px;
  font-weight: 800;
  background: linear-gradient(135deg, #00f5d4, #00bbf9);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  display: block;
  margin-bottom: 6px;
}

.card-subtitle {
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.12);
}

.card-trend {
  color: #00f2a9;
  font-weight: 600;
  font-size: 15px;
}

.card-label {
  color: rgba(255, 255, 255, 0.6);
  font-size: 13px;
}

/* 进入系统按钮 */
.cover-enter {
  position: absolute;
  right: 40px;
  bottom: 56px;
  display: flex;
  align-items: center;
  gap: 16px;
  z-index: 2;
}

.btn-enter {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  padding: 16px 48px;
  border-radius: 40px;
  font-size: 18px;
  font-weight: 700;
  text-decoration: none;
  background: linear-gradient(135deg, #00f5d4, #00bbf9);
  color: #020817;
  box-shadow: 
    0 8px 40px rgba(0, 245, 212, 0.6),
    0 0 60px rgba(0, 187, 249, 0.4);
  transition: all 0.4s ease;
  position: relative;
  overflow: hidden;
  letter-spacing: 1px;
}

.btn-enter::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
  transition: left 0.5s ease;
}

.btn-enter:hover::before {
  left: 100%;
}

.btn-enter:hover {
  transform: translateY(-4px) scale(1.05);
  box-shadow: 
    0 12px 50px rgba(0, 245, 212, 0.8),
    0 0 80px rgba(0, 187, 249, 0.6);
}

.btn-text {
  position: relative;
  z-index: 1;
}

.btn-enter i {
  position: relative;
  z-index: 1;
  transition: transform 0.3s ease;
}

.btn-enter:hover i {
  transform: translateX(4px);
}

.enter-status {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  border-radius: 999px;
  background: radial-gradient(circle at top left, rgba(15, 23, 42, 0.96), rgba(15, 23, 42, 0.88));
  border: 1px solid rgba(148, 163, 184, 0.5);
  box-shadow: 0 0 22px rgba(15, 23, 42, 0.95), 0 0 26px rgba(0, 245, 212, 0.35);
  font-size: 13px;
  color: rgba(241, 245, 249, 0.95);
  backdrop-filter: blur(10px);
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #22c55e;
  box-shadow: 0 0 10px rgba(34, 197, 94, 0.9);
}

.status-text {
  white-space: nowrap;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .cover-title {
    font-size: 56px;
  }
  
  .overview-card {
    width: 48%;
  }
}

@media (max-width: 768px) {
  .cover-container {
    padding: 40px 16px;
  }
  
  .cover-title {
    font-size: 42px;
    letter-spacing: 2px;
  }
  
  .cover-subtitle {
    font-size: 16px;
  }
  
  .cover-cta-buttons {
    flex-direction: column;
    align-items: center;
  }
  
  .btn-primary,
  .btn-secondary {
    width: 240px;
    justify-content: center;
  }
  
  .overview-title {
    font-size: 28px;
  }
  
  .overview-card {
    width: 85%;
    margin-left: auto !important;
    margin-right: auto !important;
  }
  
  .timeline-axis {
    left: 20px;
  }
  
  .card-node {
    left: 20px;
  }
  
  .btn-enter {
    padding: 14px 36px;
    font-size: 16px;
  }
}

@media (max-width: 576px) {
  .cover-title {
    font-size: 32px;
  }
  
  .cover-subtitle {
    font-size: 14px;
  }
  
  .overview-card {
    width: 100%;
    padding: 20px;
  }
  
  .card-number {
    font-size: 32px;
  }
}
</style>

