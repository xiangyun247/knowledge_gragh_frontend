<template>
  <div class="elderly-test-page" :class="[themeClass, 'font-size-' + fontSizeLevel]">
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

    <!-- Step 0: 填写个人信息 -->
    <div v-if="currentStep === 0" class="step-content">
      <div class="prepare-card">
        <div class="prepare-icon">📝</div>
        <h2 class="prepare-heading">先了解一下您</h2>
        <p class="prepare-desc">填一下基本信息，我们好为您记录</p>

        <div class="info-form">
          <div class="form-row">
            <label class="form-label">您的姓名</label>
            <input
              v-model="subjectInfo.name"
              class="form-input"
              placeholder="请输入姓名"
            />
          </div>
          <div class="form-row">
            <label class="form-label">编号</label>
            <input
              v-model="subjectInfo.subjectCode"
              class="form-input"
              placeholder="如 E001（自动分配）"
            />
          </div>
          <div class="form-row two-col">
            <div class="col">
              <label class="form-label">年龄</label>
              <input
                v-model.number="subjectInfo.age"
                class="form-input"
                type="number"
                min="1"
                max="120"
                placeholder="岁"
              />
            </div>
            <div class="col">
              <label class="form-label">性别</label>
              <div class="gender-btns">
                <button
                  :class="['gender-btn', { active: subjectInfo.gender === 'male' }]"
                  @click="subjectInfo.gender = 'male'"
                >👨 男</button>
                <button
                  :class="['gender-btn', { active: subjectInfo.gender === 'female' }]"
                  @click="subjectInfo.gender = 'female'"
                >👩 女</button>
              </div>
            </div>
          </div>
        </div>

        <button
          class="big-btn"
          :disabled="!formValid"
          @click="onInfoSubmit"
        >
          填好啦，下一步
        </button>
      </div>
    </div>

    <!-- Step 1: 连接 EEG -->
    <div v-if="currentStep === 1" class="step-content">
      <div class="eeg-connect-card">
        <div class="eeg-connect-icon" :class="{ connected: eegConnected, connecting: eegConnecting }">
          🎧
        </div>
        <h2>{{ eegConnected ? '设备已连接' : '正在连接脑电设备...' }}</h2>
        <p v-if="!eegConnected">请确保设备已佩戴好并开机</p>
        <p v-else>信号良好，可以开始测试啦！</p>

        <!-- 信号状态 -->
        <div class="signal-status" v-if="eegConnected">
          <div class="signal-dot good"></div>
          <span>信号良好</span>
          <span class="signal-detail">模拟模式</span>
        </div>

        <!-- 受试者信息确认 -->
        <div class="subject-confirm" v-if="!eegConnected">
          <p class="confirm-label">受试者：{{ subjectInfo.name || subjectInfo.subjectCode }}</p>
        </div>

        <button
          v-if="!eegConnected"
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

    <!-- Step 5: 完成 + 评分结果 -->
    <div v-if="currentStep === 5" class="step-content">
      <div class="done-card">
        <div class="done-icon">🎉</div>
        <h2>测试完成啦！</h2>
        <p>辛苦啦，您表现得很好~</p>

        <!-- 认知负荷评分结果 -->
        <div class="score-card" v-if="testResult && testResult.cognitiveScore != null">
          <div class="score-circle" :class="scoreLevel">
            <span class="score-num">{{ testResult.cognitiveScore }}</span>
            <span class="score-unit">分</span>
          </div>
          <p class="score-label">{{ scoreLevelText }}</p>
          <p class="score-desc">{{ scoreLevelDesc }}</p>
        </div>

        <!-- 三模态评分明细 -->
        <div class="fusion-card" v-if="testResult && testResult.questionnaireScore != null">
          <h3 class="fusion-title">📊 评分详情</h3>
          <div class="fusion-rows">
            <div class="fusion-row">
              <div class="fusion-row-head">
                <span class="fusion-icon">📝</span>
                <span class="fusion-name">问卷评分</span>
                <span class="fusion-weight">权重 50%</span>
              </div>
              <div class="fusion-bar-wrap">
                <div class="fusion-bar" :style="{ width: testResult.questionnaireScore + '%' }" :class="getBarClass(testResult.questionnaireScore)"></div>
              </div>
              <span class="fusion-val">{{ testResult.questionnaireScore }}分</span>
            </div>
            <div class="fusion-row" v-if="testResult.behavioralScore != null">
              <div class="fusion-row-head">
                <span class="fusion-icon">👆</span>
                <span class="fusion-name">行为评分</span>
                <span class="fusion-weight">权重 {{ (testResult.fusedBreakdown && testResult.fusedBreakdown.weights) ? Math.round(testResult.fusedBreakdown.weights.behavioral * 100) + '%' : '30%' }}</span>
              </div>
              <div class="fusion-bar-wrap">
                <div class="fusion-bar" :style="{ width: testResult.behavioralScore + '%' }" :class="getBarClass(testResult.behavioralScore)"></div>
              </div>
              <span class="fusion-val">{{ testResult.behavioralScore }}分</span>
              <p class="fusion-hint" v-if="testResult.behavioralDetails">
                共{{ testResult.behavioralDetails.totalInteractions }}次操作，平均间隔{{ testResult.behavioralDetails.avgIntervalSec || '-' }}秒
              </p>
            </div>
            <div class="fusion-row" v-if="testResult.eegScore != null">
              <div class="fusion-row-head">
                <span class="fusion-icon">🧠</span>
                <span class="fusion-name">脑电评分</span>
                <span class="fusion-weight">权重 {{ (testResult.fusedBreakdown && testResult.fusedBreakdown.weights) ? Math.round(testResult.fusedBreakdown.weights.eeg * 100) + '%' : '20%' }}</span>
              </div>
              <div class="fusion-bar-wrap">
                <div class="fusion-bar" :style="{ width: testResult.eegScore + '%' }" :class="getBarClass(testResult.eegScore)"></div>
              </div>
              <span class="fusion-val">{{ testResult.eegScore }}分</span>
            </div>
            <div class="fusion-total">
              <span>综合评分</span>
              <span class="fusion-total-val" :class="'score-text-' + scoreLevel">{{ testResult.cognitiveScore }}分</span>
            </div>
          </div>
        </div>

        <div class="done-summary" v-if="testResult">
          <div class="summary-row">
            <span>受试者</span>
            <span>{{ testResult.subjectName }}</span>
          </div>
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
          <div class="summary-row" v-if="testResult.cognitiveScore != null">
            <span>认知负荷评分</span>
            <span :class="'score-text-' + scoreLevel">{{ testResult.cognitiveScore }}分（{{ scoreLevelText }}）</span>
          </div>
        </div>

        <button class="big-btn" @click="backToChat">回到聊天</button>
      </div>
    </div>
  </div>
</template>

<script>
import NasaTlxElderly from './NasaTlxElderly'
import { createSubject, createSession, endSession } from '@/api/eegSession'
import { recordEvent, recordQuestionnaire, COGNITIVE_EVENT_TYPES, calcBehavioralScore, calcFusedScore } from '@/utils/cognitiveLoad'
import storage from '@/utils/storage'

const TEST_STATE_KEY = 'elderly_test_state'
const THEME_KEY = 'elderly_chat_theme'
const FONTSIZE_KEY = 'elderly_font_size'

export default {
  name: 'ElderlyTestView',
  components: { NasaTlxElderly },
  data() {
    return {
      steps: ['信息', '设备', '前问卷', '聊天', '后问卷', '完成'],
      currentStep: 0,
      // 主题
      theme: 'light',
      resolvedTheme: 'light',
      fontSizeLevel: 0,
      // 受试者个人信息
      subjectInfo: {
        name: '',
        subjectCode: '',
        age: null,
        gender: ''
      },
      // EEG
      eegConnected: false,
      eegConnecting: false,
      // Session
      taskId: 'test-' + Date.now(),
      sessionId: null,
      subjectDbId: null, // 数据库中的 subject_id
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
  computed: {
    themeClass() {
      if (this.resolvedTheme === 'dark') return 'theme-dark'
      if (this.resolvedTheme === 'high-contrast') return 'theme-high-contrast'
      return 'theme-light'
    },
    formValid() {
      return this.subjectInfo.name.trim() && this.subjectInfo.age > 0 && this.subjectInfo.gender
    },
    scoreLevel() {
      if (!this.testResult || this.testResult.cognitiveScore == null) return ''
      const s = this.testResult.cognitiveScore
      if (s <= 30) return 'low'
      if (s <= 60) return 'medium'
      return 'high'
    },
    scoreLevelText() {
      const map = { low: '认知负荷较低', medium: '认知负荷适中', high: '认知负荷较高' }
      return map[this.scoreLevel] || ''
    },
    scoreLevelDesc() {
      const map = {
        low: '您在使用过程中感觉比较轻松，认知负担不大。',
        medium: '您在使用过程中需要一定的注意力，但整体还好。',
        high: '您在使用过程中感觉有些吃力，可能需要简化操作。'
      }
      return map[this.scoreLevel] || ''
    },
    getBarClass(score) {
      if (score <= 30) return 'bar-low'
      if (score <= 60) return 'bar-medium'
      return 'bar-high'
    }
  },
  created() {
    this.restoreState()
    // 加载主题和字号（与聊天界面共享）
    this.theme = storage.get(THEME_KEY) || 'light'
    this.fontSizeLevel = parseInt(storage.get(FONTSIZE_KEY)) || 0
    if (this.fontSizeLevel < 0 || this.fontSizeLevel > 3) this.fontSizeLevel = 0
    if (this.theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      this.resolvedTheme = prefersDark ? 'dark' : 'light'
    } else {
      this.resolvedTheme = this.theme
    }
    // 监听系统主题切换
    this._onMediaQueryChange = (e) => {
      if (this.theme === 'system') {
        this.resolvedTheme = e.matches ? 'dark' : 'light'
      }
    }
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', this._onMediaQueryChange)
  },
  beforeDestroy() {
    this.cleanup()
    if (this._onMediaQueryChange) {
      window.matchMedia('(prefers-color-scheme: dark)').removeEventListener('change', this._onMediaQueryChange)
    }
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

    // ===== Step 0: 提交个人信息 =====
    async onInfoSubmit() {
      if (!this.formValid) return
      // 如果没填编号，自动生成
      if (!this.subjectInfo.subjectCode.trim()) {
        this.subjectInfo.subjectCode = 'E' + String(Date.now()).slice(-6)
      }
      this.nextStep()
    },

    // ===== Step 1: 连接 EEG（自动创建受试者+会话） =====
    async connectEEG() {
      this.eegConnecting = true

      try {
        // 1. 创建受试者（如果后端可用）
        try {
          const subjectRes = await createSubject({
            subject_code: this.subjectInfo.subjectCode,
            name: this.subjectInfo.name,
            age: this.subjectInfo.age,
            gender: this.subjectInfo.gender,
            cognitive_status: 'normal'
          })
          this.subjectDbId = subjectRes.data.id || subjectRes.data
          console.log('[ElderlyTest] 受试者创建成功, id:', this.subjectDbId)
        } catch (e) {
          // 如果是"已存在"，尝试查一下
          if (e.response && e.response.data && e.response.data.detail && e.response.data.detail.includes('已存在')) {
            console.warn('[ElderlyTest] 受试者已存在，继续使用')
          } else {
            console.warn('[ElderlyTest] 创建受试者失败，使用本地模式:', e)
          }
        }

        // 2. 创建会话
        try {
          const res = await createSession({
            subject_id: this.subjectInfo.subjectCode
          })
          if (res && res.data && res.data.session_id) {
            this.sessionId = res.data.session_id
          }
        } catch (e) {
          console.warn('[ElderlyTest] 后端创建会话失败，使用本地模式')
          this.sessionId = 'local_' + Date.now()
        }

        // 3. 模拟连接过程
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
        if (this.eegData.length > 75000) {
          this.eegData = this.eegData.slice(-75000)
        }
      }, 1000 / sampleRate)
    },

    generateEEGSignal() {
      const t = Date.now() / 1000
      let val = 0
      val += 10 * Math.sin(2 * Math.PI * 4 * t)     // delta
      val += 8 * Math.sin(2 * Math.PI * 8 * t)      // theta
      val += 5 * Math.sin(2 * Math.PI * 10 * t)     // alpha
      val += 3 * Math.sin(2 * Math.PI * 20 * t)     // beta
      val += (Math.random() - 0.5) * 4               // noise
      return val
    },

    // ===== NASA-TLX 评分计算 =====
    calcTlxScore(answers) {
      if (!answers) return null
      const values = Object.values(answers).filter(v => v != null)
      if (values.length === 0) return null
      const sum = values.reduce((a, b) => a + b, 0)
      return Math.round((sum / values.length) * 20) // 1-5 → 20-100 分
    },

    // ===== 量表 =====
    onBaselineSubmit(data) {
      this.baselineAnswers = data.answers
      // 记录到认知负荷评估系统
      const answersArr = Object.entries(data.answers).map(([qid, value]) => ({ qid, value }))
      recordQuestionnaire(this.taskId, this.sessionId, 'elderly_test_baseline', answersArr)
      this.recordTestEvent('baseline_questionnaire', { answers_count: Object.keys(data.answers).length })
      this.recordTestEvent('task_start', { source: 'elderly_test' })
      this.startTimer()
      this.nextStep()
    },

    onPostSubmit(data) {
      this.postAnswers = data.answers
      // 记录到认知负荷评估系统
      const answersArr = Object.entries(data.answers).map(([qid, value]) => ({ qid, value }))
      recordQuestionnaire(this.taskId, this.sessionId, 'elderly_test_post', answersArr)
      this.recordTestEvent('post_questionnaire', { answers_count: Object.keys(data.answers).length })
      this.stopTimer()

      // 1. NASA-TLX 问卷分
      const questionnaireScore = this.calcTlxScore(data.answers)
      const baselineScore = this.calcTlxScore(this.baselineAnswers)

      // 2. 行为指标分
      const behavioralResult = calcBehavioralScore(this.sessionId, this.elapsedTime)

      // 3. EEG 仿真分（基于 theta/beta 比值模拟）
      let eegScore = null
      if (this.eegData.length > 0) {
        // 用仿真数据的简单特征模拟：取最后60秒的信号方差
        const recentData = this.eegData.slice(-15000) // ~60s @ 250Hz
        const tp9 = recentData.map(d => d.TP9 || 0)
        const mean = tp9.reduce((a, b) => a + b, 0) / tp9.length
        const variance = tp9.reduce((a, v) => a + (v - mean) ** 2, 0) / tp9.length
        // 方差越大→信号越不规则→认知负荷可能越高
        eegScore = Math.round(Math.max(20, Math.min(100, 30 + Math.sqrt(variance) * 3)))
      }

      // 4. 三模态融合
      const fused = calcFusedScore(
        { score: questionnaireScore },
        behavioralResult,
        { score: eegScore }
      )

      // 保存结果
      this.testResult = {
        subjectName: this.subjectInfo.name || this.subjectInfo.subjectCode,
        duration: this.elapsedTime,
        baselineDone: !!this.baselineAnswers,
        postDone: !!this.postAnswers,
        eegDone: this.eegData.length > 0,
        eegDataPoints: this.eegData.length,
        baselineAnswers: this.baselineAnswers,
        postAnswers: this.postAnswers,
        cognitiveScore: fused.finalScore,
        baselineScore: baselineScore,
        // 三模态明细
        questionnaireScore,
        behavioralScore: behavioralResult.score,
        behavioralDetails: behavioralResult.details,
        eegScore,
        fusedBreakdown: fused.breakdown
      }

      // 上报后端
      this.stopEEGAndEndSession(fused.finalScore, fused.breakdown)
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
        subjectInfo: this.subjectInfo,
        startTime: Date.now()
      }
      storage.set(TEST_STATE_KEY, stateData)
      this.$router.push('/elderly-chat')
    },

    finishChat() {
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
    async stopEEGAndEndSession(cognitiveScore, breakdown) {
      if (this.eegSimulationTimer) {
        clearInterval(this.eegSimulationTimer)
        this.eegSimulationTimer = null
      }

      console.log('[ElderlyTest] stopEEGAndEndSession, eegData.length:', this.eegData.length)

      // 尝试上报后端
      if (this.sessionId && !this.sessionId.startsWith('local_')) {
        try {
          const avgScore = cognitiveScore || Math.round(30 + Math.random() * 40)
          const scoreTrend = Array.from({ length: 10 }, () => Math.round(20 + Math.random() * 60))
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
            cognitive_level: avgScore > 60 ? 'high' : avgScore > 30 ? 'medium' : 'low',
            session_note: JSON.stringify({
              test_type: 'elderly_companion_test',
              subject_info: this.subjectInfo,
              baseline: this.baselineAnswers,
              post: this.postAnswers,
              baseline_score: this.testResult && this.testResult.baselineScore,
              post_score: cognitiveScore,
              // 三模态融合明细
              multimodal_fusion: breakdown || {},
              behavioral_details: this.testResult && this.testResult.behavioralDetails || null
            })
          })
          console.log('[ElderlyTest] 会话上报成功')
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
        active: this.currentStep >= 1,
        currentStep: this.currentStep,
        taskId: this.taskId,
        sessionId: this.sessionId,
        eegConnected: this.eegConnected,
        subjectInfo: this.subjectInfo,
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
        this.subjectInfo = saved.subjectInfo || this.subjectInfo
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
/* ===== 浅色主题（默认，与聊天界面一致） ===== */
.theme-light .elderly-test-page,
.elderly-test-page.theme-light {
  --bg-primary: #FFF8F0;
  --bg-secondary: #FFFFFF;
  --bg-input: #FFF8F0;
  --bg-card: #FFFFFF;
  --bg-hover: #FFF5F0;
  --bg-accent-soft: #FFF1E6;
  --text-primary: #3D3229;
  --text-secondary: #5D4E3C;
  --text-muted: #7A7067;
  --text-placeholder: #B8ADA3;
  --accent: #E8734A;
  --accent-hover: #D4623D;
  --border: #F0E6DB;
  --border-hover: #D4C4B5;
  --shadow: rgba(0,0,0,0.04);
  --shadow-accent: rgba(232,115,74,0.35);
  --signal-bg: #E8F5E9;
  --signal-text: #2E7D32;
  --signal-dot: #4CAF82;
}

/* ===== 深色主题 ===== */
.theme-dark .elderly-test-page,
.elderly-test-page.theme-dark {
  --bg-primary: #1a1814;
  --bg-secondary: #252220;
  --bg-input: #2a2724;
  --bg-card: #252220;
  --bg-hover: #352f2a;
  --bg-accent-soft: #3a2e22;
  --text-primary: #E8DDD0;
  --text-secondary: #B8AFA4;
  --text-muted: #A89A8C;
  --text-placeholder: #7a7067;
  --accent: #E8734A;
  --accent-hover: #F08B64;
  --border: #3a3530;
  --border-hover: #4a4540;
  --shadow: rgba(0,0,0,0.2);
  --shadow-accent: rgba(232,115,74,0.4);
  --signal-bg: #1a2e1c;
  --signal-text: #66BB6A;
  --signal-dot: #4CAF82;
}

/* ===== 高对比度主题 ===== */
.theme-high-contrast .elderly-test-page,
.elderly-test-page.theme-high-contrast {
  --bg-primary: #000000;
  --bg-secondary: #1a1a1a;
  --bg-input: #0a0a0a;
  --bg-card: #1a1a1a;
  --bg-hover: #2a2a00;
  --bg-accent-soft: #2a2200;
  --text-primary: #FFFFFF;
  --text-secondary: #FFD700;
  --text-muted: #FFD700;
  --text-placeholder: #FFD700;
  --accent: #FFD700;
  --accent-hover: #FFC107;
  --border: #FFD700;
  --border-hover: #FFC107;
  --shadow: rgba(0,0,0,0.4);
  --shadow-accent: rgba(255,215,0,0.5);
  --signal-bg: #1a2e1c;
  --signal-text: #FFD700;
  --signal-dot: #4CAF82;
}

/* ===== 主题过渡 ===== */
.elderly-test-page {
  transition: background 0.3s ease, color 0.3s ease;
}
.elderly-test-page *,
.elderly-test-page *::before,
.elderly-test-page *::after {
  transition: background 0.3s ease, color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
}

/* ===== 字体大小 ===== */
.font-size-0 .prepare-heading,
.font-size-0 .eeg-connect-card h2,
.font-size-0 .chat-phase-card h2,
.font-size-0 .done-card h2,
.font-size-0 .tlx-title { font-size: 24px; }
.font-size-1 .prepare-heading,
.font-size-1 .eeg-connect-card h2,
.font-size-1 .chat-phase-card h2,
.font-size-1 .done-card h2,
.font-size-1 .tlx-title { font-size: 26px; }
.font-size-2 .prepare-heading,
.font-size-2 .eeg-connect-card h2,
.font-size-2 .chat-phase-card h2,
.font-size-2 .done-card h2,
.font-size-2 .tlx-title { font-size: 28px; }
.font-size-3 .prepare-heading,
.font-size-3 .eeg-connect-card h2,
.font-size-3 .chat-phase-card h2,
.font-size-3 .done-card h2,
.font-size-3 .tlx-title { font-size: 30px; }

.font-size-0 .prepare-desc,
.font-size-0 .eeg-connect-card p,
.font-size-0 .chat-phase-card p,
.font-size-0 .tlx-desc,
.font-size-0 .tlx-question { font-size: 18px; }
.font-size-1 .prepare-desc,
.font-size-1 .eeg-connect-card p,
.font-size-1 .chat-phase-card p,
.font-size-1 .tlx-desc,
.font-size-1 .tlx-question { font-size: 20px; }
.font-size-2 .prepare-desc,
.font-size-2 .eeg-connect-card p,
.font-size-2 .chat-phase-card p,
.font-size-2 .tlx-desc,
.font-size-2 .tlx-question { font-size: 22px; }
.font-size-3 .prepare-desc,
.font-size-3 .eeg-connect-card p,
.font-size-3 .chat-phase-card p,
.font-size-3 .tlx-desc,
.font-size-3 .tlx-question { font-size: 24px; }

.font-size-0 .form-input,
.font-size-0 .gender-btn { font-size: 18px; }
.font-size-1 .form-input,
.font-size-1 .gender-btn { font-size: 20px; }
.font-size-2 .form-input,
.font-size-2 .gender-btn { font-size: 22px; }
.font-size-3 .form-input,
.font-size-3 .gender-btn { font-size: 24px; }

.font-size-0 .big-btn,
.font-size-0 .tlx-submit { font-size: 20px; }
.font-size-1 .big-btn,
.font-size-1 .tlx-submit { font-size: 22px; }
.font-size-2 .big-btn,
.font-size-2 .tlx-submit { font-size: 24px; }
.font-size-3 .big-btn,
.font-size-3 .tlx-submit { font-size: 26px; }

.font-size-0 .form-label { font-size: 17px; }
.font-size-1 .form-label { font-size: 19px; }
.font-size-2 .form-label { font-size: 21px; }
.font-size-3 .form-label { font-size: 23px; }

.font-size-0 .step-label { font-size: 12px; }
.font-size-1 .step-label { font-size: 13px; }
.font-size-2 .step-label { font-size: 14px; }
.font-size-3 .step-label { font-size: 15px; }

/* ===== 页面容器 ===== */
.elderly-test-page {
  min-height: 100vh;
  background: var(--bg-primary);
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
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border);
  position: sticky;
  top: 0;
  z-index: 10;
}
.back-btn {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  border: 1.5px solid var(--border);
  background: var(--bg-primary);
  color: var(--text-secondary);
  font-size: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}
.back-btn:hover { border-color: var(--accent); color: var(--accent); }
.test-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
}
.test-timer {
  font-size: 20px;
  font-weight: 700;
  color: var(--accent);
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
  border: 1.5px solid var(--border);
  background: var(--bg-secondary);
  color: var(--text-muted);
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.experimenter-tool-btn:hover {
  border-color: var(--accent);
  color: var(--accent);
  background: var(--bg-hover);
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
}
.step-item.active { opacity: 1; }
.step-item.done { opacity: 0.7; }
.step-dot {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--border);
  color: var(--text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
}
.step-item.active .step-dot {
  background: var(--accent);
  color: #FFFFFF;
  box-shadow: 0 4px 12px var(--shadow-accent);
}
.step-item.done .step-dot {
  background: #4CAF82;
  color: #FFFFFF;
}
.step-label {
  font-size: 12px;
  color: var(--text-muted);
}
.step-item.active .step-label { color: var(--text-primary); font-weight: 600; }

/* ===== 内容区 ===== */
.step-content {
  padding: 0 20px;
  animation: fadeUp 0.3s ease-out;
}
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}

/* ===== 通用卡片 ===== */
.prepare-card,
.eeg-connect-card,
.chat-phase-card,
.done-card {
  background: var(--bg-card);
  border-radius: 20px;
  padding: 36px 28px;
  text-align: center;
  box-shadow: 0 2px 12px var(--shadow);
  border: 1px solid var(--border);
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
  color: var(--text-primary);
  margin: 0 0 10px;
}
.prepare-desc,
.eeg-connect-card p,
.chat-phase-card p {
  font-size: 18px;
  color: var(--text-muted);
  line-height: 1.6;
  margin: 0 0 24px;
}

/* ===== 个人信息表单 ===== */
.info-form {
  text-align: left;
  margin-bottom: 28px;
}
.form-row {
  margin-bottom: 20px;
}
.form-row.two-col {
  display: flex;
  gap: 16px;
}
.form-row.two-col .col {
  flex: 1;
}
.form-label {
  display: block;
  font-size: 17px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;
}
.form-input {
  width: 100%;
  padding: 14px 18px;
  border: 2px solid var(--border);
  border-radius: 14px;
  font-size: 18px;
  color: var(--text-primary);
  background: var(--bg-input);
  outline: none;
  box-sizing: border-box;
}
.form-input:focus {
  border-color: var(--accent);
}
.form-input::placeholder {
  color: var(--text-placeholder);
}
.gender-btns {
  display: flex;
  gap: 12px;
}
.gender-btn {
  flex: 1;
  padding: 14px 12px;
  border: 2px solid var(--border);
  border-radius: 14px;
  background: var(--bg-input);
  font-size: 18px;
  color: var(--text-secondary);
  cursor: pointer;
}
.gender-btn.active {
  border-color: var(--accent);
  background: var(--bg-accent-soft);
  color: var(--accent);
  font-weight: 600;
}
.gender-btn:hover:not(.active) {
  border-color: var(--border-hover);
}

/* ===== EEG 连接 ===== */
.eeg-connect-icon {
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
  background: var(--signal-bg);
  border-radius: 12px;
  margin-bottom: 24px;
  font-size: 18px;
  color: var(--signal-text);
}
.signal-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--signal-dot);
  animation: blink 1.5s ease-in-out infinite;
}
@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}
.signal-detail {
  font-size: 14px;
  color: var(--text-muted);
  margin-left: auto;
}

.subject-confirm {
  margin-bottom: 24px;
  padding: 12px 20px;
  background: var(--bg-accent-soft);
  border-radius: 12px;
}
.confirm-label {
  font-size: 17px;
  color: var(--text-secondary);
  font-weight: 500;
}

/* ===== 聊天阶段 ===== */
.eeg-live-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: center;
  padding: 12px 24px;
  background: var(--bg-accent-soft);
  border-radius: 12px;
  margin: 16px 0;
  font-size: 16px;
  color: var(--accent);
  font-weight: 600;
}
.live-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #EF4444;
  animation: blink 1s ease-in-out infinite;
}

/* ===== 认知负荷评分卡 ===== */
.score-card {
  margin: 20px 0;
  padding: 24px;
  background: linear-gradient(135deg, var(--bg-primary), var(--bg-accent-soft));
  border-radius: 20px;
  border: 1px solid var(--border);
}
.score-circle {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  transition: all 0.3s;
}
.score-circle.low {
  background: linear-gradient(135deg, #4CAF82, #66BB6A);
  box-shadow: 0 6px 20px rgba(76, 175, 130, 0.4);
}
.score-circle.medium {
  background: linear-gradient(135deg, #FFA726, #FFB74D);
  box-shadow: 0 6px 20px rgba(255, 167, 38, 0.4);
}
.score-circle.high {
  background: linear-gradient(135deg, #EF5350, #E57373);
  box-shadow: 0 6px 20px rgba(239, 83, 80, 0.4);
}
.score-num {
  font-size: 36px;
  font-weight: 800;
  color: #FFFFFF;
  line-height: 1;
}
.score-unit {
  font-size: 14px;
  color: rgba(255,255,255,0.85);
}
.score-label {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 6px;
}
.score-desc {
  font-size: 16px;
  color: var(--text-muted);
  margin: 0;
  line-height: 1.5;
}

/* ===== 三模态融合评分明细 ===== */
.fusion-card {
  margin: 16px 0;
  padding: 20px 24px;
  background: var(--bg-primary);
  border-radius: 16px;
  border: 1px solid var(--border);
}
.fusion-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 16px;
}
.fusion-rows {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.fusion-row-head {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}
.fusion-icon {
  font-size: 18px;
}
.fusion-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  flex: 1;
}
.fusion-weight {
  font-size: 13px;
  color: var(--text-muted);
  background: var(--bg-accent-soft);
  padding: 2px 8px;
  border-radius: 6px;
}
.fusion-bar-wrap {
  height: 10px;
  background: var(--bg-accent-soft);
  border-radius: 5px;
  overflow: hidden;
  margin-bottom: 4px;
}
.fusion-bar {
  height: 100%;
  border-radius: 5px;
  transition: width 0.6s ease;
}
.fusion-bar.bar-low { background: linear-gradient(90deg, #4CAF82, #66BB6A); }
.fusion-bar.bar-medium { background: linear-gradient(90deg, #FFA726, #FFB74D); }
.fusion-bar.bar-high { background: linear-gradient(90deg, #EF5350, #E57373); }
.fusion-val {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
}
.fusion-hint {
  font-size: 13px;
  color: var(--text-muted);
  margin: 4px 0 0;
}
.fusion-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0 0;
  margin-top: 8px;
  border-top: 1px dashed var(--border);
  font-size: 17px;
  font-weight: 600;
  color: var(--text-primary);
}
.fusion-total-val {
  font-size: 22px;
  font-weight: 800;
}

/* ===== 完成 ===== */
.done-summary {
  text-align: left;
  background: var(--bg-primary);
  border-radius: 14px;
  padding: 16px 20px;
  margin: 20px 0;
}
.summary-row {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid var(--border);
  font-size: 16px;
  color: var(--text-primary);
}
.summary-row:last-child { border-bottom: none; }
.score-text-low { color: #4CAF82; font-weight: 600; }
.score-text-medium { color: #FFA726; font-weight: 600; }
.score-text-high { color: #EF5350; font-weight: 600; }

/* ===== 按钮 ===== */
.big-btn {
  display: inline-block;
  padding: 16px 48px;
  font-size: 20px;
  font-weight: 600;
  color: #FFFFFF;
  background: linear-gradient(135deg, var(--accent), var(--accent-hover));
  border: none;
  border-radius: 30px;
  cursor: pointer;
  box-shadow: 0 6px 20px var(--shadow-accent);
  margin: 4px;
}
.big-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px var(--shadow-accent);
}
.big-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.big-btn.secondary {
  background: var(--bg-secondary);
  color: var(--accent);
  border: 2px solid var(--accent);
  box-shadow: none;
}
.big-btn.secondary:hover {
  background: var(--bg-hover);
}

/* 响应式 */
@media (max-width: 576px) {
  .test-topbar {
    padding: 12px 16px;
  }
  .test-title {
    font-size: 18px;
  }
  .step-bar {
    padding: 16px 12px;
    gap: 2px;
  }
  .step-dot {
    width: 28px;
    height: 28px;
    font-size: 12px;
  }
  .step-label {
    font-size: 11px;
  }
  .form-input {
    font-size: 16px;
    padding: 12px 14px;
  }
  .gender-btn {
    font-size: 16px;
    padding: 12px;
  }
  .big-btn {
    padding: 14px 24px;
    font-size: 17px;
  }
  .score-circle {
    width: 80px;
    height: 80px;
  }
  .score-num {
    font-size: 30px;
  }
  .form-row.two-col {
    flex-direction: column;
    gap: 0;
  }
}
</style>
