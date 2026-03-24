<template>
  <transition name="ef-fade">
    <div class="ef-overlay" v-if="showing" @click="dismiss">
      <!-- 粒子动画 -->
      <div class="ef-particles">
        <span v-for="i in 24" :key="i" class="ef-particle" :style="particleStyle(i)"></span>
      </div>

      <!-- 中央卡片 -->
      <div class="ef-card" @click.stop>
        <div class="ef-emoji">{{ currentEmoji }}</div>
        <div class="ef-title">{{ currentTitle }}</div>
        <div class="ef-desc">{{ currentDesc }}</div>

        <!-- 连续天数 -->
        <div class="ef-streak" v-if="streakDays > 1">
          <div class="ef-streak-num">{{ streakDays }}</div>
          <div class="ef-streak-label">天连续使用</div>
        </div>

        <!-- 进度（全部完成时） -->
        <div class="ef-progress" v-if="showProgress">
          <div class="ef-progress-bar">
            <div class="ef-progress-fill" style="width:100%"></div>
          </div>
          <span class="ef-progress-text">今日任务全部完成</span>
        </div>

        <button class="ef-btn" @click="dismiss">
          {{ streakDays > 1 ? '继续保持' : '好的' }}
        </button>
      </div>
    </div>
  </transition>
</template>

<script>
import dayjs from 'dayjs'

const STREAK_KEY = 'ef_streak_data'

const FEEDBACK_PRESETS = {
  med_taken: {
    emojis: ['💊', '👍', '✅'],
    titles: ['药已服用，真棒！', '做得好！', '又完成一次！'],
    descs: ['按时服药是最重要的事，您做到了。', '坚持每天按时吃药，身体会越来越好。', '每一次按时服药，都是对自己的关爱。']
  },
  med_all_done: {
    emojis: ['🎉', '🌟', '🏆'],
    titles: ['今日服药全部完成！', '太厉害了！', '全部搞定！'],
    descs: ['今天的药都吃完了，好好休息吧。', '一项都没落下，给自己点个赞！', '完美的一天，所有药物都已确认服用。']
  },
  task_done: {
    emojis: ['⭐', '👏', '🌸'],
    titles: ['完成一件小事！', '又做到了！', '做得真好！'],
    descs: ['每完成一件小事，今天就更有意义。', '一步一步来，不着急。', '保持这个节奏，您很棒。']
  },
  all_tasks_done: {
    emojis: ['🎊', '🌈', '💪'],
    titles: ['今天的三件小事都完成了！', '全部完成，太棒了！', '今天做得很好！'],
    descs: ['忙碌又充实的一天，好好享受接下来的时光。', '三件事全做完了，今天圆满！', '您的坚持让每一天都有进步。']
  },
  edu_done: {
    emojis: ['📖', '🧠', '💡'],
    titles: ['学到新知识了！', '又长见识了！', '知识就是力量！'],
    descs: ['多学一点，多了解一点，对自己和家人都好。', '保持好奇心，生活更有趣。', '每天学一点健康知识，是最好的投资。']
  }
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function loadStreak() {
  try {
    return JSON.parse(localStorage.getItem(STREAK_KEY) || '{}')
  } catch { return {} }
}

function updateStreak() {
  const data = loadStreak()
  const today = dayjs().format('YYYY-MM-DD')
  const yesterday = dayjs().subtract(1, 'day').format('YYYY-MM-DD')

  if (data.lastDate === today) {
    return data.days || 1
  }

  let days = 1
  if (data.lastDate === yesterday) {
    days = (data.days || 0) + 1
  }

  localStorage.setItem(STREAK_KEY, JSON.stringify({ lastDate: today, days }))
  return days
}

export default {
  name: 'EmotionalFeedback',
  data() {
    return {
      showing: false,
      currentEmoji: '🎉',
      currentTitle: '',
      currentDesc: '',
      streakDays: 0,
      showProgress: false,
      dismissTimer: null
    }
  },
  mounted() {
    this.$root.$on('emotional-feedback', this.trigger)
  },
  beforeDestroy() {
    this.$root.$off('emotional-feedback', this.trigger)
    if (this.dismissTimer) clearTimeout(this.dismissTimer)
  },
  methods: {
    trigger({ type, progress }) {
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
      if (userInfo.role !== 'elderly') return

      const preset = FEEDBACK_PRESETS[type]
      if (!preset) return

      this.currentEmoji = pick(preset.emojis)
      this.currentTitle = pick(preset.titles)
      this.currentDesc = pick(preset.descs)
      this.streakDays = updateStreak()
      this.showProgress = !!progress
      this.showing = true

      if (this.dismissTimer) clearTimeout(this.dismissTimer)
      this.dismissTimer = setTimeout(() => this.dismiss(), 6000)
    },
    dismiss() {
      this.showing = false
      if (this.dismissTimer) {
        clearTimeout(this.dismissTimer)
        this.dismissTimer = null
      }
    },
    particleStyle(i) {
      const angle = (i / 24) * 360
      const dist = 80 + Math.random() * 120
      const size = 6 + Math.random() * 10
      const delay = Math.random() * 0.8
      const hue = Math.random() * 60 + 140
      return {
        '--angle': angle + 'deg',
        '--dist': dist + 'px',
        '--size': size + 'px',
        '--delay': delay + 's',
        '--hue': hue
      }
    }
  }
}
</script>

<style scoped>
.ef-overlay {
  position: fixed;
  inset: 0;
  z-index: 10010;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(3px);
}

/* 粒子 */
.ef-particles {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}

.ef-particle {
  position: absolute;
  top: 50%;
  left: 50%;
  width: var(--size);
  height: var(--size);
  border-radius: 50%;
  background: hsl(var(--hue), 80%, 65%);
  animation: efBurst 1.2s ease-out var(--delay) forwards;
  opacity: 0;
}

@keyframes efBurst {
  0% {
    transform: translate(-50%, -50%) scale(0);
    opacity: 1;
  }
  60% {
    opacity: 0.8;
  }
  100% {
    transform: translate(
      calc(-50% + cos(var(--angle)) * var(--dist)),
      calc(-50% + sin(var(--angle)) * var(--dist))
    );
    opacity: 0;
  }
}

/* 卡片 */
.ef-card {
  position: relative;
  z-index: 10011;
  background: var(--bg-popup);
  border: 1.5px solid rgba(var(--primary-blue-rgb), 0.35);
  border-radius: 24px;
  padding: 32px 28px 24px;
  max-width: 320px;
  width: calc(100vw - 48px);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  animation: efCardPop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes efCardPop {
  0% { transform: scale(0.5); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}

.ef-emoji {
  font-size: 52px;
  line-height: 1;
  animation: efEmojiWiggle 0.6s ease-in-out 0.3s;
}

@keyframes efEmojiWiggle {
  0%, 100% { transform: rotate(0); }
  25% { transform: rotate(-12deg); }
  75% { transform: rotate(12deg); }
}

.ef-title {
  font-size: 22px;
  font-weight: 700;
  color: var(--text-primary);
  text-align: center;
}

.ef-desc {
  font-size: 15px;
  line-height: 1.6;
  color: var(--text-secondary);
  text-align: center;
}

/* 连续天数 */
.ef-streak {
  display: flex;
  align-items: baseline;
  gap: 6px;
  margin-top: 4px;
  padding: 8px 16px;
  background: rgba(var(--primary-blue-rgb), 0.08);
  border: 1px solid rgba(var(--primary-blue-rgb), 0.2);
  border-radius: 14px;
}

.ef-streak-num {
  font-size: 28px;
  font-weight: 800;
  background: linear-gradient(135deg, var(--primary-blue), var(--accent-cyan));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.ef-streak-label {
  font-size: 14px;
  color: var(--text-muted);
}

/* 进度 */
.ef-progress {
  width: 100%;
  margin-top: 4px;
}

.ef-progress-bar {
  height: 8px;
  border-radius: 4px;
  background: var(--border-light);
  overflow: hidden;
  margin-bottom: 4px;
}

.ef-progress-fill {
  height: 100%;
  border-radius: 4px;
  background: linear-gradient(90deg, var(--primary-blue), var(--accent-cyan));
  animation: efProgressGrow 0.8s ease-out 0.3s both;
}

@keyframes efProgressGrow {
  from { width: 0 !important; }
}

.ef-progress-text {
  font-size: 12px;
  color: var(--primary-blue);
  font-weight: 600;
}

/* 按钮 */
.ef-btn {
  margin-top: 8px;
  padding: 12px 32px;
  border: none;
  border-radius: 22px;
  background: linear-gradient(135deg, var(--primary-blue), var(--accent-cyan));
  color: var(--primary-dark);
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.25s ease;
  box-shadow: 0 4px 14px rgba(var(--primary-blue-rgb), 0.3);
}

.ef-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(var(--primary-blue-rgb), 0.5);
}

.ef-btn:active {
  transform: scale(0.96);
}

/* 过渡 */
.ef-fade-enter-active,
.ef-fade-leave-active {
  transition: opacity 0.4s;
}
.ef-fade-enter, .ef-fade-leave-to {
  opacity: 0;
}

@media (max-width: 400px) {
  .ef-card { padding: 24px 20px 18px; }
  .ef-emoji { font-size: 44px; }
  .ef-title { font-size: 19px; }
}
</style>
