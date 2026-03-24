<template>
  <transition name="ob-fade">
    <div class="ob-overlay" v-if="active" @click.self="nextOrClose">
      <!-- 高亮框 -->
      <div class="ob-spotlight" :style="spotStyle"></div>

      <!-- 提示卡片 -->
      <div class="ob-card" :style="cardStyle">
        <div class="ob-step-badge">{{ currentStep + 1 }} / {{ steps.length }}</div>
        <div class="ob-card-icon">
          <i :class="currentData.icon"></i>
        </div>
        <div class="ob-card-title">{{ currentData.title }}</div>
        <div class="ob-card-desc">{{ currentData.desc }}</div>
        <div class="ob-card-actions">
          <span class="ob-skip" @click="finish">跳过</span>
          <button class="ob-next-btn" @click="nextOrClose">
            {{ isLast ? '开始使用' : '下一步' }}
            <i :class="isLast ? 'el-icon-check' : 'el-icon-arrow-right'"></i>
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
const OB_DONE_KEY = 'onboarding_elderly_done'

const GUIDE_STEPS = [
  {
    selector: '.nav-item-elderly[href="/chat"], a.nav-item-elderly[href="/chat"]',
    fallbackSelector: '.nav-menu .nav-item:nth-child(2)',
    title: '问一问',
    desc: '有任何问题，点这里直接问 AI，也可以按住右下角蓝色麦克风按钮说话。',
    icon: 'el-icon-chat-dot-round',
    cardPos: 'below'
  },
  {
    selector: '.nav-item-elderly[href="/medication"], a.nav-item-elderly[href="/medication"]',
    fallbackSelector: '.nav-menu .nav-item:nth-child(3)',
    title: '吃药提醒',
    desc: '在这里查看今天要吃什么药，吃完后点一下"已服用"打勾。',
    icon: 'el-icon-first-aid-kit',
    cardPos: 'below'
  },
  {
    selector: '.sos-fab',
    title: '紧急求助',
    desc: '遇到紧急情况，点这个红色按钮可以一键拨打家属或 120。',
    icon: 'el-icon-phone-outline',
    cardPos: 'left'
  }
]

export default {
  name: 'OnboardingGuide',
  data() {
    return {
      active: false,
      currentStep: 0,
      spotStyle: {},
      cardStyle: {}
    }
  },
  computed: {
    steps() { return GUIDE_STEPS },
    currentData() { return GUIDE_STEPS[this.currentStep] || GUIDE_STEPS[0] },
    isLast() { return this.currentStep >= GUIDE_STEPS.length - 1 }
  },
  methods: {
    start() {
      this.currentStep = 0
      this.active = true
      this.$nextTick(() => this.positionSpotlight())
    },
    nextOrClose() {
      if (this.isLast) {
        this.finish()
      } else {
        this.currentStep++
        this.$nextTick(() => this.positionSpotlight())
      }
    },
    finish() {
      this.active = false
      try { localStorage.setItem(OB_DONE_KEY, '1') } catch { /* noop */ }
    },
    shouldShow() {
      try { return !localStorage.getItem(OB_DONE_KEY) } catch { return false }
    },
    resetGuide() {
      try { localStorage.removeItem(OB_DONE_KEY) } catch { /* noop */ }
    },
    positionSpotlight() {
      const step = GUIDE_STEPS[this.currentStep]
      if (!step) return
      let el = document.querySelector(step.selector)
      if (!el && step.fallbackSelector) el = document.querySelector(step.fallbackSelector)
      if (!el) {
        this.spotStyle = { display: 'none' }
        this.cardStyle = { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }
        return
      }

      const rect = el.getBoundingClientRect()
      const pad = 8
      this.spotStyle = {
        top: (rect.top - pad) + 'px',
        left: (rect.left - pad) + 'px',
        width: (rect.width + pad * 2) + 'px',
        height: (rect.height + pad * 2) + 'px',
        display: 'block'
      }

      const cardW = 290
      const cardH = 200
      if (step.cardPos === 'below') {
        let left = rect.left + rect.width / 2 - cardW / 2
        left = Math.max(12, Math.min(left, window.innerWidth - cardW - 12))
        this.cardStyle = {
          top: (rect.bottom + 16) + 'px',
          left: left + 'px'
        }
      } else if (step.cardPos === 'left') {
        let top = rect.top + rect.height / 2 - cardH / 2
        top = Math.max(12, Math.min(top, window.innerHeight - cardH - 12))
        this.cardStyle = {
          top: top + 'px',
          left: Math.max(12, rect.left - cardW - 16) + 'px'
        }
      } else {
        this.cardStyle = {
          top: (rect.bottom + 16) + 'px',
          left: Math.max(12, rect.left) + 'px'
        }
      }
    }
  }
}
</script>

<style scoped>
.ob-overlay {
  position: fixed;
  inset: 0;
  z-index: 10000;
  background: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(2px);
}

.ob-spotlight {
  position: fixed;
  border-radius: 14px;
  box-shadow:
    0 0 0 4000px rgba(0, 0, 0, 0.6),
    0 0 0 4px rgba(var(--primary-blue-rgb), 0.6),
    0 0 24px rgba(var(--primary-blue-rgb), 0.3);
  z-index: 10001;
  pointer-events: none;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  animation: obSpotPulse 2s ease-in-out infinite;
}

@keyframes obSpotPulse {
  0%, 100% { box-shadow: 0 0 0 4000px rgba(0,0,0,0.6), 0 0 0 4px rgba(var(--primary-blue-rgb), 0.6), 0 0 24px rgba(var(--primary-blue-rgb), 0.3); }
  50% { box-shadow: 0 0 0 4000px rgba(0,0,0,0.6), 0 0 0 6px rgba(var(--primary-blue-rgb), 0.8), 0 0 36px rgba(var(--primary-blue-rgb), 0.5); }
}

.ob-card {
  position: fixed;
  width: 290px;
  background: var(--bg-popup);
  border: 1px solid rgba(var(--primary-blue-rgb), 0.35);
  border-radius: 18px;
  padding: 22px 20px 18px;
  z-index: 10002;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.5);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.ob-step-badge {
  position: absolute;
  top: -10px;
  right: 16px;
  background: linear-gradient(135deg, var(--primary-blue), var(--accent-cyan));
  color: var(--primary-dark);
  font-size: 11px;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 10px;
}

.ob-card-icon {
  width: 48px; height: 48px; border-radius: 50%;
  background: rgba(var(--primary-blue-rgb), 0.12);
  display: flex; align-items: center; justify-content: center;
  font-size: 24px; color: var(--primary-blue);
}

.ob-card-title {
  font-size: 19px;
  font-weight: 700;
  color: var(--text-primary);
}

.ob-card-desc {
  font-size: 15px;
  line-height: 1.65;
  color: var(--text-secondary);
  text-align: center;
}

.ob-card-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  margin-top: 6px;
}

.ob-skip {
  font-size: 13px;
  color: var(--text-disabled);
  cursor: pointer;
  padding: 4px 8px;
  transition: color 0.2s;
}
.ob-skip:hover { color: var(--text-secondary); }

.ob-next-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 22px;
  border: none;
  border-radius: 22px;
  background: linear-gradient(135deg, var(--primary-blue), var(--accent-cyan));
  color: var(--primary-dark);
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.25s ease;
  box-shadow: 0 4px 14px rgba(var(--primary-blue-rgb), 0.3);
}
.ob-next-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(var(--primary-blue-rgb), 0.5);
}
.ob-next-btn:active {
  transform: scale(0.96);
}
.ob-next-btn i {
  font-size: 15px;
}

.ob-fade-enter-active,
.ob-fade-leave-active {
  transition: opacity 0.4s;
}
.ob-fade-enter, .ob-fade-leave-to {
  opacity: 0;
}

@media (max-width: 400px) {
  .ob-card {
    width: calc(100vw - 32px);
    left: 16px !important;
  }
}
</style>
