<template>
  <div class="elderly-test-page">
    <!-- 顶部 -->
    <div class="test-topbar">
      <button class="back-btn" @click="handleBack">
        <i class="el-icon-arrow-left"></i>
      </button>
      <span class="test-title">🧪 认知评估测试</span>
      <div class="topbar-right-actions">
        <el-dropdown trigger="click" @command="handleExperimenterTool">
          <button class="experimenter-tool-btn" title="实验员工具">
            <i class="el-icon-s-tools"></i>
          </button>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item icon="el-icon-monitor" command="/eeg-monitor">EEG 实时监测</el-dropdown-item>
            <el-dropdown-item icon="el-icon-data-analysis" command="/cognitive-load">认知负荷评估</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
        <span class="test-timer" v-if="isRunning">{{ formatDuration(elapsedTime) }}</span>
      </div>
    </div>

    <!-- 流程步骤条 -->
    <div class="step-bar">
      <div
        v-for="(s, i) in steps"
        :key="i"
        :class="['step-item', {
          active: currentStep === i,
          done: currentStep > i
        }]"
      >
        <div class="step-dot">{{ currentStep > i ? '✓' : i + 1 }}</div>
        <span class="step-label">{{ s }}</span>
      </div>
    </div>

    <!-- Step 0: 准备页面 -->
    <div v-if="currentStep === 0" class="step-content">
      <div class="prepare-card">
        <div class="prepare-icon">🧠</div>
        <h2 class="prepare-heading">准备开始测试</h2>
        <p class="prepare-desc">接下来的流程很简单，您放心~</p>
        <div class="prepare-steps">
          <div class="prepare-step">
            <span class="ps-num">1</span>
            <span>先帮您连上脑电设备</span>
          </div>
          <div class="prepare-step">
            <span class="ps-num">2</span>
            <span>填一个小问卷（问您几个感受）</span>
          </div>
          <div class="prepare-step">
            <span class="ps-num">3</span>
            <span>跟小忆正常聊天（设备会一直在后台记录）</span>
          </div>
          <div class="prepare-step">
            <span class="ps-num">4</span>
            <span>聊完再填一次问卷就结束啦！</span>
          </div>
        </div>
        <button class="big-btn" @click="nextStep">准备好了，开始</button>
      </div>
    </div>

    <!-- Step 1: 连接 EEG -->
    <div v-if="currentStep === 1" class="step-content">
      <div class="eeg-connect-card">
        <div class="eeg-connect-icon" :class="{ connected: eegConnected, connecting: eegConnecting }">
          🎧
        </div>
        <h2>{{ eegConnected ? '设备已连接' : '正在连接脑电设备...' }}</h2>
        <p>{{ eegConnected ? '信号良好，可以开始测试啦！' : '请确保设备已佩戴好并开机' }}</p>

        <!-- 信号状态 -->
        <div class="signal-status" v-if="eegConnected">
          <div class="signal-dot good"></div>
          <span>信号良好</span>
          <span class="signal-detail">模拟模式</span>
        </div>

        <!-- 受试者信息（实验操作者填写） -->
        <div class="subject-section" v-if="!eegConnected">
          <p class="subject-label">受试者编号</p>
          <input
            v-model="subjectCode"
            class="subject-input"
            placeholder="输入编号，如 E001"
            @keyup.enter="connectEEG"
          />
        </div>

        <button
          v-if="!eegConnected && subjectCode.trim()"
          class="big-btn"
          @click="connectEEG"
          :disabled="eegConnecting"
        >
          {{ eegConnecting ? '连接中...' : '连接设备' }}
        </button>
        <button v-if="eegConnected" class="big-btn" @click="nextStep">下一步，填问卷</button>
      </div>
    </div>

    <!-- Step 2: 基线量表 -->
    <div v-if="currentStep === 2" class="step-content">
      <NasaTlxElderly
        :is-baseline="true"
        :task-id="taskId"
        :session-id="sessionId"
        @submit="onBaselineSubmit"
      />
    </div>

    <!-- Step 3: 聊天中 -->
    <div v-if="currentStep === 3" class="step-content">
      <div class="chat-phase-card">
        <div class="chat-phase-icon">💬</div>
        <h2>现在去跟小忆聊天吧！</h2>
        <p>设备正在后台记录脑电信号，您正常跟小忆聊天就好~</p>
        <p>想结束的时候点下面的按钮回来就行。</p>

        <div class="eeg-live-bar" v-if="eegConnected">
          <span class="live-dot"></span>
          <span>脑电监测中 · {{ formatDuration(elapsedTime) }}</span>
        </div>

        <button class="big-btn primary" @click="goToChat">
          去聊天
        </button>
        <button class="big-btn secondary" @click="finishChat" v-if="chatStarted">
          聊完了，填问卷
        </button>
      </div>
    </div>

    <!-- Step 4: 后测量表 -->
    <div v-if="currentStep === 4" class="step-content">
      <NasaTlxElderly
        :is-baseline="false"
        :task-id="taskId"
        :session-id="sessionId"
        @submit="onPostSubmit"
      />
    </div>

    <!-- Step 5: 完成 -->
    <div v-if="currentStep === 5" class="step-content">
      <div class="done-card">
        <div class="done-icon">🎉</div>
        <h2>测试完成啦！</h2>
        <p>辛苦啦，您表现得很好~</p>

        <div class="done-summary" v-if="testResult">
          <div class="summary-row">
            <span>测试时长</span>
            <span>{{ formatDuration(testResult.duration) }}</span>
          </div>
          <div class="summary-row">
            <span>基线问卷</span>
            <span>{{ testResult.baselineDone ? '已填写' : '未填写' }}</span>
          </div>
          <div class="summary-row">
            <span>后测问卷</span>
            <span>{{ testResult.postDone ? '已填写' : '未填写' }}</span>
          </div>
          <div class="summary-row">
            <span>脑电数据</span>
            <span>{{ testResult.eegDone ? '已采集' : '未采集' }}</span>
          </div>
        </div>

        <button class="big-btn" @click="backToChat">回到聊天</button>
      </div>
    </div>
  </div>
</template>

<script>
import NasaTlxElderly from './NasaTlxElderly.vue'
import { createSession, endSession } from '@/api/eegSession'
import { recordEvent, COGNITIVE_EVENT_TYPES } from '@/utils/cognitiveLoad'
import storage from '@/utils/storage'

const TEST_STATE_KEY = 'elderly_test_state'

export default {
  name: 'ElderlyTestView',
  components: { NasaTlxElderly },
  data() {
    return {
      steps: ['准备', '设备', '前问卷', '聊天', '后问卷', '完成'],
      currentStep: 0,
      // EEG
      eegConnected: false,
      eegConnecting: false,
      subjectCode: '',
      // Session
      taskId: 'test-' + Date.now(),
      sessionId: null,
      // 计时
      elapsedTime: 0,
      sessionTimer: null,
      isRunning: false,
      // 聊天阶段
      chatStarted: false,
      // 结果
      testResult: null,
      // 问卷数据
      baselineAnswers: null,
      postAnswers: null,
      // EEG 模拟数据存储
      eegSimulationTimer: null,
      eegData: []
    }
  },
  created() {
    this.restoreState()
  },
  beforeDestroy() {
    this.cleanup()
  },
  methods: {
    // ===== 步骤控制 =====
    nextStep() {
      this.currentStep++
      this.saveState()
    },
    handleExperimenterTool(path) {
      this.$router.push(path)
    },
    handleBack() {
      if (this.currentStep === 0) {
        this.cleanup()
        this.$router.push('/elderly-chat')
      } else if (this.currentStep <= 2) {
        this.currentStep--
      }
      // Step 3+ 不允许返回
    },

    // ===== EEG 连接 =====
    async connectEEG() {
      if (!this.subjectCode.trim()) return
      this.eegConnecting = true

      try {
        // 尝试后端创建会话
        try {
          const res = await createSession({
            subject_id: this.subjectCode
          })
          if (res && res.data && res.data.session_id) {
            this.sessionId = res.data.session_id
          }
        } catch (e) {
          // 后端可能不可用，用本地模式
          console.warn('[ElderlyTest] 后端创建会话失败，使用本地模式')
          this.sessionId = 'local_' + Date.now()
        }

        // 模拟连接过程
        await new Promise(resolve => setTimeout(resolve, 1500))
        this.eegConnected = true
        this.startEEGSimulation()
        this.recordTestEvent('eeg_connected')
      } catch (e) {
        this.$message.error('设备连接失败，请检查设备')
      } finally {
        this.eegConnecting = false
      }
    },

    startEEGSimulation() {
      // 生成模拟 EEG 数据（与 EEGMonitorView 类似逻辑）
      const sampleRate = 250
      const channels = ['TP9', 'AF7', 'AF8', 'TP10', 'Fp1', 'Fp2']
      this.eegData = []
      this.eegSimulationTimer = setInterval(() => {
        const sample = {}
        const ts = Date.now()
        channels.forEach(ch => {
          sample[ch] = this.generateEEGSignal()
        })
        sample.timestamp = ts
        this.eegData.push(sample)
        // 保留最近 5 分钟数据（250Hz * 60s * 5min = 75000）
        if (this.eegData.length > 75000) {
          this.eegData = this.eegData.slice(-75000)
        }
      }, 1000 / sampleRate)
    },

    generateEEGSignal() {
      // 简化版 EEG 模拟：混合多个正弦波 + 噪声
      const t = Date.now() / 1000
      let val = 0
      val += 10 * Math.sin(2 * Math.PI * 4 * t)     // delta (1-4 Hz)
      val += 8 * Math.sin(2 * Math.PI * 8 * t)      // theta (4-8 Hz)
      val += 5 * Math.sin(2 * Math.PI * 10 * t)     // alpha (8-12 Hz)
      val += 3 * Math.sin(2 * Math.PI * 20 * t)     // beta (12-30 Hz)
      val += (Math.random() - 0.5) * 4               // noise
      return val
    },

    // ===== 量表 =====
    onBaselineSubmit(data) {
      this.baselineAnswers = data.answers
      this.recordTestEvent('baseline_questionnaire', { answers_count: Object.keys(data.answers).length })
      this.recordTestEvent('task_start', { source: 'elderly_test' })
      this.startTimer()
      this.nextStep()
    },

    onPostSubmit(data) {
      this.postAnswers = data.answers
      this.recordTestEvent('post_questionnaire', { answers_count: Object.keys(data.answers).length })
      this.stopTimer()
      this.stopEEGAndEndSession()
      this.nextStep()
    },

    // ===== 聊天阶段 =====
    goToChat() {
      this.chatStarted = true
      const stateData = {
        active: true,
        currentStep: 3,
        taskId: this.taskId,
        sessionId: String(this.sessionId),
        eegConnected: this.eegConnected,
        chatStarted: true,
        baselineAnswers: this.baselineAnswers,
        startTime: Date.now()
      }
      storage.set(TEST_STATE_KEY, stateData)
      this.$router.push('/elderly-chat')
    },

    finishChat() {
      // 停止计时和 EEG
      this.recordTestEvent('task_end', { source: 'elderly_test' })
      this.nextStep()
    },

    // ===== 计时器 =====
    startTimer() {
      this.isRunning = true
      this.elapsedTime = 0
      const startTime = Date.now()
      this.sessionTimer = setInterval(() => {
        this.elapsedTime = (Date.now() - startTime) / 1000
      }, 1000)
    },
    stopTimer() {
      this.isRunning = false
      if (this.sessionTimer) {
        clearInterval(this.sessionTimer)
        this.sessionTimer = null
      }
    },

    // ===== 结束会话 =====
    async stopEEGAndEndSession() {
      if (this.eegSimulationTimer) {
        clearInterval(this.eegSimulationTimer)
        this.eegSimulationTimer = null
      }

      console.log('[ElderlyTest] stopEEGAndEndSession, eegData.length:', this.eegData.length)
      this.testResult = {
        duration: this.elapsedTime,
        baselineDone: !!this.baselineAnswers,
        postDone: !!this.postAnswers,
        eegDone: this.eegData.length > 0,
        eegDataPoints: this.eegData.length,
        baselineAnswers: this.baselineAnswers,
        postAnswers: this.postAnswers
      }

      // 尝试上报后端
      if (this.sessionId && !this.sessionId.startsWith('local_')) {
        try {
          // 计算简单的 EEG 特征（模拟）
          const avgScore = Math.round(30 + Math.random() * 40)
          const scoreTrend = Array.from({ length: 10 }, () => Math.round(30 + Math.random() * 40))
          await endSession(this.sessionId, {
            duration_seconds: Math.round(this.elapsedTime),
            avg_score: avgScore,
            avg_theta_beta: parseFloat((0.8 + Math.random() * 1.2).toFixed(2)),
            avg_alpha_beta: parseFloat((0.6 + Math.random() * 1.0).toFixed(2)),
            avg_theta_power: parseFloat((10 + Math.random() * 10).toFixed(1)),
            avg_alpha_power: parseFloat((15 + Math.random() * 10).toFixed(1)),
            avg_beta_power: parseFloat((12 + Math.random() * 10).toFixed(1)),
            avg_snr: parseFloat((15 + Math.random() * 10).toFixed(1)),
            score_trend: scoreTrend,
            cognitive_level: avgScore > 60 ? 'high' : avgScore > 35 ? 'medium' : 'low',
            session_note: JSON.stringify({
              test_type: 'elderly_companion_test',
              baseline: this.baselineAnswers,
              post: this.postAnswers
            })
          })
        } catch (e) {
          console.warn('[ElderlyTest] 结束会话上报失败:', e)
        }
      }

      // 清除测试状态
      storage.remove(TEST_STATE_KEY)
      this.recordTestEvent('test_complete', { duration: Math.round(this.elapsedTime) })
    },

    // ===== 状态管理 =====
    saveState() {
      storage.set(TEST_STATE_KEY, {
        active: this.currentStep >= 2,
        currentStep: this.currentStep,
        taskId: this.taskId,
        sessionId: this.sessionId,
        eegConnected: this.eegConnected,
        subjectCode: this.subjectCode,
        chatStarted: this.chatStarted,
        baselineAnswers: this.baselineAnswers,
        startTime: this.isRunning ? (Date.now() - this.elapsedTime * 1000) : null
      })
    },

    restoreState() {
      const saved = storage.get(TEST_STATE_KEY)
      if (saved && saved.active) {
        if (saved.currentStep >= 5) {
          storage.remove(TEST_STATE_KEY)
          return
        }
        this.taskId = saved.taskId || this.taskId
        this.sessionId = saved.sessionId
        this.eegConnected = saved.eegConnected
        this.subjectCode = saved.subjectCode || ''
        this.chatStarted = saved.chatStarted || false
        this.currentStep = saved.currentStep !== undefined ? saved.currentStep : (this.chatStarted ? 3 : 2)
        this.baselineAnswers = saved.baselineAnswers || null
        if (saved.startTime) {
          this.elapsedTime = (Date.now() - saved.startTime) / 1000
          this.startTimer()
        }
        if (this.eegConnected && !this.eegSimulationTimer) {
          this.startEEGSimulation()
        }
      } else if (saved) {
        storage.remove(TEST_STATE_KEY)
      }
    },

    cleanup() {
      this.stopTimer()
      if (this.eegSimulationTimer) {
        clearInterval(this.eegSimulationTimer)
        this.eegSimulationTimer = null
      }
    },

    // ===== 行为埋点 =====
    recordTestEvent(eventType, extra = {}) {
      recordEvent(eventType, {
        task_id: this.taskId,
        session_id: this.sessionId,
        source: 'elderly_test',
        ...extra
      })
    },

    // ===== 工具 =====
    formatDuration(seconds) {
      if (!seconds || seconds <= 0) return '00:00'
      const m = Math.floor(seconds / 60)
      const s = Math.floor(seconds % 60)
      return String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0')
    },

    backToChat() {
      this.$router.push('/elderly-chat')
    }
  }
}
</script>

<style scoped>
.elderly-test-page {
  min-height: 100vh;
  background: #FFF8F0;
  max-width: 720px;
  margin: 0 auto;
  padding-bottom: 40px;
}

/* ===== 顶部 ===== */
.test-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: #FFFFFF;
  border-bottom: 1px solid #F0E6DB;
  position: sticky;
  top: 0;
  z-index: 10;
}
.back-btn {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  border: 1.5px solid #F0E6DB;
  background: #FFF8F0;
  color: #5D4E3C;
  font-size: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}
.back-btn:hover { border-color: #E8734A; color: #E8734A; }
.test-title {
  font-size: 20px;
  font-weight: 600;
  color: #3D3229;
}
.test-timer {
  font-size: 20px;
  font-weight: 700;
  color: #E8734A;
  font-variant-numeric: tabular-nums;
}
.topbar-right-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}
.experimenter-tool-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1.5px solid #F0E6DB;
  background: #FFFFFF;
  color: #9E9489;
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.2s;
}
.experimenter-tool-btn:hover {
  border-color: #E8734A;
  color: #E8734A;
  background: #FFF5F0;
}

/* ===== 步骤条 ===== */
.step-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 20px 16px;
}
.step-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  opacity: 0.4;
  transition: all 0.3s;
}
.step-item.active { opacity: 1; }
.step-item.done { opacity: 0.7; }
.step-dot {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #F0E6DB;
  color: #7A7067;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.3s;
}
.step-item.active .step-dot {
  background: #E8734A;
  color: #FFFFFF;
  box-shadow: 0 4px 12px rgba(232, 115, 74, 0.35);
}
.step-item.done .step-dot {
  background: #4CAF82;
  color: #FFFFFF;
}
.step-label {
  font-size: 12px;
  color: #7A7067;
}
.step-item.active .step-label { color: #3D3229; font-weight: 600; }

/* ===== 内容区 ===== */
.step-content {
  padding: 0 20px;
  animation: fadeUp 0.3s ease-out;
}
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}

/* ===== 准备卡片 ===== */
.prepare-card,
.eeg-connect-card,
.chat-phase-card,
.done-card {
  background: #FFFFFF;
  border-radius: 20px;
  padding: 36px 28px;
  text-align: center;
  box-shadow: 0 2px 12px rgba(0,0,0,0.04);
  border: 1px solid #F0E6DB;
}
.prepare-icon,
.eeg-connect-icon,
.chat-phase-icon,
.done-icon {
  font-size: 56px;
  margin-bottom: 16px;
}
.prepare-heading,
.eeg-connect-card h2,
.chat-phase-card h2,
.done-card h2 {
  font-size: 24px;
  font-weight: 700;
  color: #3D3229;
  margin: 0 0 10px;
}
.prepare-desc,
.eeg-connect-card p,
.chat-phase-card p {
  font-size: 18px;
  color: #7A7067;
  line-height: 1.6;
  margin: 0 0 24px;
}

.prepare-steps {
  text-align: left;
  margin-bottom: 28px;
}
.prepare-step {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 0;
  border-bottom: 1px solid #F5EDE4;
  font-size: 18px;
  color: #3D3229;
}
.prepare-step:last-child { border-bottom: none; }
.ps-num {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #FFF1E6;
  color: #E8734A;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  flex-shrink: 0;
}

/* ===== EEG 连接 ===== */
.eeg-connect-icon {
  transition: all 0.3s;
}
.eeg-connect-icon.connected {
  animation: none;
}
.eeg-connect-icon.connecting {
  animation: pulse 1s ease-in-out infinite;
}
@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.signal-status {
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: center;
  padding: 12px 24px;
  background: #E8F5E9;
  border-radius: 12px;
  margin-bottom: 24px;
  font-size: 18px;
  color: #2E7D32;
}
.signal-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #4CAF82;
  animation: blink 1.5s ease-in-out infinite;
}
@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}
.signal-detail {
  font-size: 14px;
  color: #7A7067;
  margin-left: auto;
}

.subject-section {
  margin-bottom: 24px;
}
.subject-label {
  font-size: 16px;
  color: #7A7067;
  margin-bottom: 8px;
}
.subject-input {
  width: 200px;
  padding: 14px 18px;
  border: 2px solid #F0E6DB;
  border-radius: 14px;
  font-size: 20px;
  color: #3D3229;
  text-align: center;
  outline: none;
  transition: border-color 0.2s;
}
.subject-input:focus {
  border-color: #E8734A;
}

/* ===== 聊天阶段 ===== */
.eeg-live-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: center;
  padding: 12px 24px;
  background: #FFF1E6;
  border-radius: 12px;
  margin: 16px 0;
  font-size: 16px;
  color: #E8734A;
  font-weight: 600;
}
.live-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #EF4444;
  animation: blink 1s ease-in-out infinite;
}

/* ===== 完成 ===== */
.done-summary {
  text-align: left;
  background: #FFF8F0;
  border-radius: 14px;
  padding: 16px 20px;
  margin: 20px 0;
}
.summary-row {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid #F0E6DB;
  font-size: 16px;
  color: #3D3229;
}
.summary-row:last-child { border-bottom: none; }

/* ===== 按钮 ===== */
.big-btn {
  display: inline-block;
  padding: 16px 48px;
  font-size: 20px;
  font-weight: 600;
  color: #FFFFFF;
  background: linear-gradient(135deg, #E8734A, #D4623D);
  border: none;
  border-radius: 30px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 6px 20px rgba(232, 115, 74, 0.35);
  margin: 4px;
}
.big-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(232, 115, 74, 0.45);
}
.big-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.big-btn.secondary {
  background: #FFFFFF;
  color: #E8734A;
  border: 2px solid #E8734A;
  box-shadow: none;
}
.big-btn.secondary:hover {
  background: #FFF5F0;
}
</style>
