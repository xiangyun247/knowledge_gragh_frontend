<template>
  <div class="va-wrapper" v-if="visible">
    <!-- 悬浮麦克风按钮 -->
    <div
      class="va-fab"
      :class="{ recording: isRecording, thinking: isThinking }"
      @mousedown.prevent="startHold"
      @mouseup.prevent="endHold"
      @mouseleave="endHold"
      @touchstart.prevent="startHold"
      @touchend.prevent="endHold"
    >
      <i :class="fabIcon"></i>
    </div>

    <!-- 状态提示条 -->
    <transition name="va-tip">
      <div class="va-tip" v-if="tipText" :class="tipType">
        <div class="va-tip-icon">
          <i :class="tipIcon"></i>
        </div>
        <div class="va-tip-body">
          <div class="va-tip-text">{{ tipText }}</div>
          <div class="va-tip-sub" v-if="tipSub">{{ tipSub }}</div>
        </div>
        <div class="va-tip-close" @click="dismissTip">
          <i class="el-icon-close"></i>
        </div>
      </div>
    </transition>

    <!-- 录音波纹 -->
    <transition name="va-wave">
      <div class="va-wave-ring" v-if="isRecording">
        <span></span><span></span><span></span>
      </div>
    </transition>
  </div>
</template>

<script>
import { transcribeSTT } from '@/api/multimodal'
import { synthesizeTTS } from '@/api/multimodal'

const NAV_INTENTS = [
  { keywords: ['吃药', '服药', '药物', '药'], route: '/medication', label: '服药提醒' },
  { keywords: ['首页', '主页', '回家'], route: '/home', label: '首页' },
  { keywords: ['学习', '教育', '知识', '健康知识', '学知识'], route: '/patient-education', label: '患者教育' },
  { keywords: ['聊天', '对话', '问', '问一问', '问问'], route: '/chat', label: '聊天问答' },
  { keywords: ['周报', '家属', '报告'], route: '/family-report', label: '家属周报' },
  { keywords: ['图谱', '知识图谱'], route: '/graph', label: '知识图谱' },
  { keywords: ['个人', '设置', '资料', '信息'], route: '/profile', label: '个人中心' },
  { keywords: ['求助', '紧急', '帮助', '120', 'sos'], route: '__sos__', label: '紧急求助' }
]

export default {
  name: 'VoiceAssistant',
  data() {
    return {
      isRecording: false,
      isThinking: false,
      mediaRecorder: null,
      recordChunks: [],
      recordStartTime: null,
      tipText: '',
      tipSub: '',
      tipType: 'info',
      tipTimer: null,
      ttsAudio: null,
      ttsUrl: null
    }
  },
  computed: {
    visible() {
      const route = this.$route
      if (!route) return false
      if (route.meta && route.meta.hideLayout) return false
      return true
    },
    fabIcon() {
      if (this.isThinking) return 'el-icon-loading'
      if (this.isRecording) return 'el-icon-turn-off-microphone'
      return 'el-icon-microphone'
    },
    tipIcon() {
      if (this.tipType === 'success') return 'el-icon-success'
      if (this.tipType === 'warn') return 'el-icon-warning'
      if (this.tipType === 'recording') return 'el-icon-microphone'
      return 'el-icon-info'
    }
  },
  beforeDestroy() {
    this.cleanup()
  },
  methods: {
    startHold() {
      if (this.isRecording || this.isThinking) return
      this.startRecording()
    },
    endHold() {
      if (this.isRecording) {
        this.stopRecording()
      }
    },

    async startRecording() {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        this.showTip('您的浏览器不支持语音功能', '', 'warn')
        return
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        this.recordChunks = []
        const mr = new MediaRecorder(stream)
        this.mediaRecorder = mr
        this.recordStartTime = Date.now()
        mr.ondataavailable = (e) => {
          if (e.data.size) this.recordChunks.push(e.data)
        }
        mr.onstop = () => {
          stream.getTracks().forEach(t => t.stop())
          this.processRecording()
        }
        mr.start()
        this.isRecording = true
        this.showTip('正在聆听…', '松开按钮结束', 'recording')
      } catch {
        this.showTip('无法访问麦克风，请检查权限', '', 'warn')
      }
    },

    stopRecording() {
      if (!this.mediaRecorder || !this.isRecording) return
      this.mediaRecorder.stop()
      this.isRecording = false
    },

    async processRecording() {
      const chunks = this.recordChunks
      this.recordChunks = []
      this.mediaRecorder = null
      const duration = this.recordStartTime ? (Date.now() - this.recordStartTime) / 1000 : 0
      this.recordStartTime = null

      if (duration < 1.0 || !chunks.length) {
        this.showTip('说话时间太短，请长按按钮再试', '', 'warn')
        return
      }

      this.isThinking = true
      this.showTip('正在识别…', '', 'info')

      try {
        const blob = new Blob(chunks, { type: 'audio/webm' })
        const file = new File([blob], 'voice.webm', { type: 'audio/webm' })
        const res = await transcribeSTT(file)
        const text = (res.data && res.data.text) || res.text || ''

        if (!text.trim()) {
          this.showTip('没有识别出内容，请再试一次', '', 'warn')
          this.isThinking = false
          return
        }

        this.showTip(`"${text}"`, '正在理解…', 'info')
        this.handleIntent(text.trim())
      } catch (e) {
        this.showTip('语音识别失败', e.message || '', 'warn')
        this.isThinking = false
      }
    },

    handleIntent(text) {
      const lower = text.toLowerCase()

      for (const intent of NAV_INTENTS) {
        if (intent.keywords.some(kw => lower.includes(kw))) {
          if (intent.route === '__sos__') {
            this.showTip(`正在打开"紧急求助"`, '', 'success', 2000)
            this.isThinking = false
            this.speak('已为您打开紧急求助')
            return
          }

          this.isThinking = false
          this.showTip(`为您跳转到「${intent.label}」`, `识别：${text}`, 'success', 3000)
          this.speak(`好的，为您打开${intent.label}`)

          if (this.$route.path !== intent.route) {
            this.$router.push(intent.route)
          }
          return
        }
      }

      this.isThinking = false
      this.showTip(`为您提问：${text}`, '正在跳转到聊天…', 'success', 3000)
      this.speak('好的，帮您问一下')
      this.$router.push({
        path: '/chat',
        query: { question: text, autoSend: '1' }
      })
    },

    async speak(text) {
      try {
        const blob = await synthesizeTTS({ text })
        if (this.ttsUrl) URL.revokeObjectURL(this.ttsUrl)
        const url = URL.createObjectURL(blob)
        this.ttsUrl = url
        const audio = new Audio(url)
        this.ttsAudio = audio
        audio.onended = () => this.cleanupAudio()
        audio.onerror = () => this.cleanupAudio()
        await audio.play()
      } catch {
        // TTS failure is non-critical
      }
    },

    showTip(text, sub, type, autoHide) {
      if (this.tipTimer) clearTimeout(this.tipTimer)
      this.tipText = text
      this.tipSub = sub || ''
      this.tipType = type || 'info'
      if (autoHide) {
        this.tipTimer = setTimeout(() => this.dismissTip(), autoHide)
      }
    },

    dismissTip() {
      this.tipText = ''
      this.tipSub = ''
      if (this.tipTimer) {
        clearTimeout(this.tipTimer)
        this.tipTimer = null
      }
    },

    cleanupAudio() {
      if (this.ttsAudio) {
        this.ttsAudio.pause()
        this.ttsAudio = null
      }
      if (this.ttsUrl) {
        URL.revokeObjectURL(this.ttsUrl)
        this.ttsUrl = null
      }
    },

    cleanup() {
      this.cleanupAudio()
      if (this.tipTimer) clearTimeout(this.tipTimer)
      if (this.mediaRecorder && this.isRecording) {
        try { this.mediaRecorder.stop() } catch { /* noop */ }
      }
    }
  }
}
</script>

<style scoped>
/* 悬浮麦克风按钮 */
.va-fab {
  position: fixed;
  right: 20px;
  bottom: 170px;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--accent-cyan), var(--primary-blue));
  color: var(--primary-dark);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(var(--accent-cyan-rgb), 0.4);
  z-index: 9990;
  transition: all 0.3s ease;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}

.va-fab:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 24px rgba(0, 187, 249, 0.55);
}

.va-fab:active {
  transform: scale(0.95);
}

.va-fab.recording {
  background: linear-gradient(135deg, #f56c6c, #e63946);
  box-shadow: 0 4px 20px rgba(245, 108, 108, 0.5);
  animation: vaRecordPulse 0.8s ease-in-out infinite;
}

.va-fab.thinking {
  background: linear-gradient(135deg, #e6a23c, #f0c040);
  box-shadow: 0 4px 16px rgba(230, 162, 60, 0.4);
}

@keyframes vaRecordPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.08); }
}

/* 录音波纹 */
.va-wave-ring {
  position: fixed;
  right: 10px;
  bottom: 160px;
  width: 70px;
  height: 70px;
  z-index: 9989;
  pointer-events: none;
  display: flex;
  align-items: center;
  justify-content: center;
}

.va-wave-ring span {
  position: absolute;
  border: 2px solid rgba(var(--accent-cyan-rgb), 0.3);
  border-radius: 50%;
  animation: vaWaveExpand 1.5s ease-out infinite;
}

.va-wave-ring span:nth-child(1) { width: 56px; height: 56px; animation-delay: 0s; }
.va-wave-ring span:nth-child(2) { width: 56px; height: 56px; animation-delay: 0.4s; }
.va-wave-ring span:nth-child(3) { width: 56px; height: 56px; animation-delay: 0.8s; }

@keyframes vaWaveExpand {
  0% { transform: scale(1); opacity: 0.6; }
  100% { transform: scale(2.2); opacity: 0; }
}

.va-wave-enter-active, .va-wave-leave-active { transition: opacity 0.3s; }
.va-wave-enter, .va-wave-leave-to { opacity: 0; }

/* 状态提示条 */
.va-tip {
  position: fixed;
  bottom: 230px;
  right: 16px;
  width: 280px;
  padding: 12px 14px;
  border-radius: 14px;
  background: var(--bg-popup);
  border: 1px solid rgba(var(--accent-cyan-rgb), 0.3);
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.4);
  z-index: 9991;
  display: flex;
  align-items: flex-start;
  gap: 10px;
  backdrop-filter: blur(8px);
}

.va-tip.success { border-color: rgba(var(--primary-blue-rgb), 0.4); }
.va-tip.warn { border-color: rgba(245, 108, 108, 0.4); }
.va-tip.recording { border-color: rgba(245, 108, 108, 0.4); }

.va-tip-icon {
  width: 28px; height: 28px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 15px; flex-shrink: 0;
  background: rgba(var(--accent-cyan-rgb), 0.15);
  color: var(--accent-cyan);
}

.va-tip.success .va-tip-icon { background: rgba(var(--primary-blue-rgb), 0.15); color: var(--primary-blue); }
.va-tip.warn .va-tip-icon { background: rgba(245, 108, 108, 0.15); color: #f56c6c; }
.va-tip.recording .va-tip-icon {
  background: rgba(245, 108, 108, 0.15);
  color: #f56c6c;
  animation: vaRecordPulse 0.8s ease-in-out infinite;
}

.va-tip-body { flex: 1; min-width: 0; }
.va-tip-text {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  line-height: 1.4;
  word-break: break-word;
}
.va-tip-sub {
  font-size: 12px;
  color: var(--text-muted);
  margin-top: 2px;
}

.va-tip-close {
  cursor: pointer;
  color: rgba(255, 255, 255, 0.3);
  font-size: 14px;
  padding: 2px;
  flex-shrink: 0;
  transition: color 0.2s;
}
.va-tip-close:hover { color: rgba(255, 255, 255, 0.8); }

.va-tip-enter-active, .va-tip-leave-active {
  transition: all 0.3s ease;
}
.va-tip-enter, .va-tip-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

@media (max-width: 400px) {
  .va-tip {
    right: 8px;
    left: 8px;
    width: auto;
  }
  .va-fab {
    right: 12px;
    bottom: 150px;
  }
}
</style>
