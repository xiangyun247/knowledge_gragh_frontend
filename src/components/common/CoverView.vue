<template>
  <div class="cover-container">
    <!-- 封面主内容区：左文案 + 右实景图 -->
    <section class="cover-hero">
      <div class="hero-layout">
        <!-- 左侧文案与按钮 -->
        <div class="hero-left">
          <div class="brand-chip">
            <span class="brand-en">YILUKANG</span>
            <span class="brand-sep">·</span>
            <span class="brand-zh">忆路康</span>
          </div>

          <h1 class="cover-title">
            <span class="title-line">忆路康 · 智护银龄 认知辅助</span>
            <span class="title-slogan">Low Cognitive Load Knowledge Assistant for Elderly with Cognitive Impairment</span>
            <span class="title-highlight">低认知负荷，让记忆有守护</span>
          </h1>

          <p class="cover-subtitle">
            基于大模型 + 知识图谱 + RAG，面向老龄认知障碍人群提供低认知负荷的知识辅助与患者教育，为照护者与机构提供可溯源的智能支持。
          </p>

          <div class="cover-cta-buttons">
            <router-link to="/chat" class="btn-primary app-btn app-btn-primary" v-ripple>
              <i class="el-icon-chat-dot-round"></i>
              问一问
            </router-link>
            <router-link to="/patient-education" class="btn-primary app-btn app-btn-primary" v-ripple>
              <i class="el-icon-medal"></i>
              患者教育
            </router-link>
            <router-link to="/graph" class="btn-secondary app-btn app-btn-secondary" v-ripple>
              <i class="el-icon-data-analysis"></i>
              知识图谱
            </router-link>
            <router-link to="/home" class="btn-more app-btn" v-ripple>
              <i class="el-icon-more"></i>
              更多
            </router-link>
          </div>

          <div class="hero-meta">
            <span class="hero-meta-item">多模态数据：病历 · 影像 · 检验 · 指南</span>
            <span class="hero-meta-dot"></span>
            <span class="hero-meta-item">应用场景：病例讨论 · 诊疗决策支持 · 科研分析</span>
          </div>
        </div>

        <!-- 右侧真实感视觉区域 -->
        <div class="hero-right">
          <div class="hero-image-card">
            <img
              class="hero-image"
              src="@/assets/images/Cover.png"
              alt="忆路康 智护银龄认知辅助系统封面图"
            />

            <!-- 叠加迷你图谱 + 问答卡片，增强“真实系统”感 -->
            <div class="hero-overlay hero-overlay-chat">
              <div class="overlay-header">
                <span class="overlay-tag">实时问答</span>
                <span class="overlay-status">在线 · 认知照护</span>
              </div>
              <div class="overlay-question">「轻度认知障碍老人居家要注意什么？」</div>
              <div class="overlay-answer">
                系统综合知识图谱与照护指南，建议 <span class="risk-high">规律作息、按时服药、防跌倒与走失</span>，
                并尽量用分步、简化的方式呈现信息，降低认知负荷。
              </div>
            </div>

            <div class="hero-overlay hero-overlay-graph">
              <div class="mini-graph-title">老年认知照护知识图谱</div>
              <div class="mini-graph-nodes">
                <span class="mini-node mini-node-primary">轻度认知障碍</span>
                <span class="mini-node">记忆减退</span>
                <span class="mini-node">日常照护</span>
                <span class="mini-node">服药提醒</span>
                <span class="mini-node">认知负荷</span>
                <span class="mini-node">患者教育</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 下方：患者历程卡片（知识图谱概览区域精简为一张卡片） -->
    <section class="cover-overview">
      <div class="overview-timeline">
        <div class="timeline-axis"></div>
        <div class="overview-cards">
          <div class="overview-card card-left patient-journey-card">
            <div class="card-node"></div>
            <div class="card-content">
              <div class="patient-journey-header">
                <div class="patient-journey-title">
                  <span class="patient-label">患者历程：</span>
                  <span class="patient-disease">老年认知障碍</span>
                </div>
                <div class="patient-case-meta">实时同步 · 病例 #AP-2026-018</div>
              </div>

              <ul class="patient-journey-steps">
                <li class="journey-step">
                  <span class="journey-dot journey-dot-primary"></span>
                  <div class="journey-text">
                    <div class="journey-title">急诊首诊</div>
                    <div class="journey-desc">自动抽取主诉与既往史，生成结构化入院要点。</div>
                  </div>
                </li>
                <li class="journey-step">
                  <span class="journey-dot journey-dot-secondary"></span>
                  <div class="journey-text">
                    <div class="journey-title">影像与检验整合</div>
                    <div class="journey-desc">关联 CT 所见与实验室指标，更新病例在图谱中的关联。</div>
                  </div>
                </li>
                <li class="journey-step">
                  <span class="journey-dot journey-dot-tertiary"></span>
                  <div class="journey-text">
                    <div class="journey-title">图谱推理 + 智能体会话</div>
                    <div class="journey-desc">基于指南与图谱完成风险评估与管理建议。</div>
                  </div>
                </li>
              </ul>
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
  max-width: 1440px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 32px;
  box-sizing: border-box;
  position: relative;
  overflow: hidden;
  background:
    radial-gradient(circle at 10% 0%, rgba(250, 204, 21, 0.15), transparent 55%),
    radial-gradient(circle at 85% 25%, rgba(59, 130, 246, 0.16), transparent 55%),
    radial-gradient(circle at 10% 80%, rgba(45, 212, 191, 0.14), transparent 55%),
    linear-gradient(135deg, #020617 0%, #020617 40%, #020617 100%);
}

/* ================= 医疗主题适配（封面页） ================= */

[data-theme="medical"] .cover-container {
  background: var(--gradient-bg);
  color: var(--text-primary);
}

[data-theme="medical"] .cover-title {
  color: var(--text-primary);
  text-shadow: none;
}

[data-theme="medical"] .cover-title .title-line,
[data-theme="medical"] .cover-title .title-slogan,
[data-theme="medical"] .cover-title .title-highlight {
  background: none;
  -webkit-background-clip: border-box;
  -webkit-text-fill-color: currentColor;
  background-clip: border-box;
  color: var(--primary-blue);
  text-shadow: none;
}

[data-theme="medical"] .cover-subtitle {
  color: var(--text-muted);
}

/* 封面主内容区：左右布局 */
.cover-hero {
  position: relative;
  z-index: 2;
  width: 100%;
  margin-bottom: 20px;
}

.hero-layout {
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(0, 1.15fr);
  gap: 40px;
  align-items: center;
}

.hero-left {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.brand-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 14px;
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.9);
  border: 1px solid rgba(148, 163, 184, 0.5);
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.7);
  width: fit-content;
}

.brand-en {
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: #facc15;
}

.brand-sep {
  color: rgba(148, 163, 184, 0.7);
}

.brand-zh {
  font-size: 13px;
  color: rgba(226, 232, 240, 0.9);
}

.cover-title {
  font-size: clamp(32px, 3.4vw, 56px);
  font-weight: 800;
  margin-bottom: 10px;
  line-height: 1.15;
  letter-spacing: 0.04em;
}

.title-line {
  display: block;
  background: linear-gradient(135deg, #e5e7eb, #f9fafb);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow:
    0 0 24px rgba(15, 23, 42, 0.9);
  animation: breathe 3s ease-in-out infinite;
}

.title-slogan {
  display: block;
  margin-top: 6px;
  font-size: 14px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(226, 232, 240, 0.9); /* 中性浅灰白 */
  background: none;
  -webkit-background-clip: border-box;
  -webkit-text-fill-color: currentColor;
  background-clip: border-box;
  text-shadow: none;
}

.title-highlight {
  display: block;
  margin-top: 8px;
  font-size: 0.8em;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  background: linear-gradient(120deg, #22c55e, #38bdf8, #eab308);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow:
    0 0 18px rgba(34, 197, 94, 0.9),
    0 0 32px rgba(56, 189, 248, 0.7);
  animation: breathe 3s ease-in-out infinite 0.4s;
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
  font-size: 18px;
  color: rgba(255, 255, 255, 0.85);
  margin-bottom: 24px;
  line-height: 1.8;
  max-width: 640px;
}

.cover-cta-buttons {
  display: flex;
  gap: 24px;
  justify-content: flex-start;
  flex-wrap: wrap;
}

.hero-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  font-size: 13px;
  color: rgba(148, 163, 184, 0.9);
}

.hero-meta-dot {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background-color: rgba(148, 163, 184, 0.6);
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
  transform: translateY(-1px);
  box-shadow: 0 6px 32px rgba(0, 245, 212, 0.6), 0 0 48px rgba(0, 187, 249, 0.4);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.08);
  color: #00f5d4;
  border: 2px solid rgba(0, 245, 212, 0.4);
  box-shadow: 0 4px 20px rgba(0, 245, 212, 0.2);
  backdrop-filter: blur(10px);
}

.btn-secondary:hover {
  transform: translateY(-1px);
  background: rgba(0, 245, 212, 0.12);
  border-color: rgba(0, 245, 212, 0.6);
  box-shadow: 0 5px 26px rgba(0, 245, 212, 0.35);
}

.btn-more {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border-radius: 24px;
  font-size: 15px;
  color: rgba(255, 255, 255, 0.85);
  border: 1px solid rgba(255, 255, 255, 0.25);
  background: rgba(255, 255, 255, 0.06);
  text-decoration: none;
  transition: all 0.3s ease;
}
.btn-more:hover {
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 255, 255, 0.4);
}

/* 右侧实景卡片 */
.hero-right {
  display: flex;
  justify-content: flex-end;
}

.hero-image-card {
  position: relative;
  width: 100%;
  max-width: 520px;
  border-radius: 28px;
  overflow: hidden;
  background: radial-gradient(circle at top left, rgba(15, 23, 42, 0.4), rgba(15, 23, 42, 0.98));
  box-shadow:
    0 24px 80px rgba(15, 23, 42, 0.9),
    0 0 50px rgba(15, 23, 42, 0.8);
  border: 1px solid rgba(148, 163, 184, 0.5);
  transform-origin: center center;
  transform: perspective(1200px) rotateX(0deg) rotateY(0deg);
  transition: transform 0.4s ease, box-shadow 0.4s ease;
}

.hero-image-card:hover {
  transform: perspective(1200px) rotateX(-3deg) rotateY(3deg) translateY(-4px);
  box-shadow:
    0 28px 90px rgba(15, 23, 42, 0.95),
    0 0 70px rgba(15, 23, 42, 0.9);
}

.hero-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.95;
  filter: saturate(1.15) contrast(1.05);
}

.hero-overlay {
  position: absolute;
  left: 20px;
  right: 20px;
  border-radius: 16px;
  padding: 12px 14px;
  background: rgba(15, 23, 42, 0.94);
  border: 1px solid rgba(148, 163, 184, 0.5);
  box-shadow: 0 14px 40px rgba(15, 23, 42, 0.9);
  color: #e5e7eb;
  font-size: 12px;
}

.hero-overlay-chat {
  bottom: 20px;
}

.hero-overlay-graph {
  top: 16px;
  right: auto;
  left: auto;
  max-width: 260px;
  background: rgba(15, 23, 42, 0.9);
}

.overlay-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.overlay-tag {
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 11px;
  background: rgba(34, 197, 94, 0.12);
  color: #4ade80;
  border: 1px solid rgba(34, 197, 94, 0.4);
}

.overlay-status {
  font-size: 11px;
  color: rgba(148, 163, 184, 0.9);
}

.overlay-question {
  font-size: 12px;
  color: rgba(248, 250, 252, 0.95);
  margin-bottom: 4px;
}

.overlay-answer {
  font-size: 11px;
  color: rgba(209, 213, 219, 0.95);
  line-height: 1.5;
}

.risk-high {
  color: #f97316;
  font-weight: 600;
}

.mini-graph-title {
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 6px;
  color: rgba(248, 250, 252, 0.96);
}

.mini-graph-nodes {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.mini-node {
  padding: 3px 8px;
  border-radius: 999px;
  font-size: 11px;
  color: rgba(226, 232, 240, 0.9);
  background: rgba(15, 23, 42, 0.9);
  border: 1px solid rgba(148, 163, 184, 0.6);
}

.mini-node-primary {
  background: radial-gradient(circle at 0 0, rgba(45, 212, 191, 0.3), rgba(15, 23, 42, 0.9));
  border-color: rgba(45, 212, 191, 0.8);
}

/* 知识图谱概览 */
.cover-overview {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto 8px;
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

/* 患者历程卡片样式 */
.patient-journey-card {
  padding: 24px 24px 22px;
}

.patient-journey-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 18px;
}

.patient-journey-title {
  font-size: 15px;
  font-weight: 500;
  color: rgba(226, 232, 240, 0.95);
}

.patient-label {
  opacity: 0.9;
}

.patient-disease {
  font-weight: 700;
  color: #4ade80;
}

.patient-case-meta {
  font-size: 12px;
  color: rgba(148, 163, 184, 0.9);
}

.patient-journey-steps {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.journey-step {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.journey-dot {
  width: 9px;
  height: 9px;
  border-radius: 999px;
  margin-top: 4px;
  box-shadow: 0 0 12px rgba(34, 197, 94, 0.7);
}

.journey-dot-primary {
  background: #22c55e;
}

.journey-dot-secondary {
  background: #2dd4bf;
  box-shadow: 0 0 12px rgba(45, 212, 191, 0.7);
}

.journey-dot-tertiary {
  background: #38bdf8;
  box-shadow: 0 0 12px rgba(56, 189, 248, 0.7);
}

.journey-text {
  flex: 1;
}

.journey-title {
  font-size: 14px;
  font-weight: 600;
  color: rgba(241, 245, 249, 0.98);
  margin-bottom: 2px;
}

.journey-desc {
  font-size: 13px;
  color: rgba(148, 163, 184, 0.95);
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

