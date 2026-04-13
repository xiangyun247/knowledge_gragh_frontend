<template>
  <div class="elderly-chat-wrapper" :class="[themeClass, 'font-size-' + fontSizeLevel]">
    <!-- 首次使用引导 -->
    <transition name="fade">
      <div class="onboarding-overlay" v-if="showOnboarding" @click.self="skipOnboarding">
        <div class="onboarding-card">
          <div class="onboarding-step" v-if="onboardingStep === 0">
            <div class="onboarding-icon">🤗</div>
            <h3 class="onboarding-title">您好呀，我是小忆</h3>
            <p class="onboarding-desc">很高兴认识您！我可以陪您聊天、讲故事、记事情~</p>
          </div>
          <div class="onboarding-step" v-if="onboardingStep === 1">
            <div class="onboarding-icon">🎤</div>
            <h3 class="onboarding-title">打字或语音都行</h3>
            <p class="onboarding-desc">点左边的🎤按住说话，或者在输入框里打字，点发送就好啦</p>
          </div>
          <div class="onboarding-step" v-if="onboardingStep === 2">
            <div class="onboarding-icon">🎧</div>
            <h3 class="onboarding-title">不想看字？可以听</h3>
            <p class="onboarding-desc">点顶部的🎧按钮，小忆的每条回复都会自动读给您听</p>
          </div>
          <div class="onboarding-actions">
            <button class="onboarding-skip" @click="skipOnboarding" v-if="onboardingStep < 2">跳过</button>
            <button class="onboarding-next" @click="nextOnboarding">
              {{ onboardingStep < 2 ? '下一步' : '开始聊天' }}
            </button>
          </div>
          <div class="onboarding-dots">
            <span v-for="n in 3" :key="n" :class="{ active: onboardingStep === n - 1 }"></span>
          </div>
        </div>
      </div>
    </transition>

    <!-- 左侧收起时显示的展开按钮 -->
    <div class="elderly-sidebar-toggle" v-if="!leftSidebarOpen" @click="toggleLeftSidebar" title="展开对话列表">
      <i class="el-icon-d-arrow-right"></i>
    </div>
    <!-- 左侧会话侧边栏（默认收起） -->
    <div class="elderly-session-sidebar" :class="{ collapsed: !leftSidebarOpen }">
      <div class="session-header">
        <div class="session-title">
          <i class="el-icon-chat-line-round"></i>
          <span>对话</span>
        </div>
        <div class="session-header-actions">
          <el-button
            type="primary"
            size="mini"
            class="new-session-btn"
            icon="el-icon-plus"
            @click="handleNewConversation"
          >新对话</el-button>
          <el-button type="text" size="mini" class="session-collapse-btn" @click="toggleLeftSidebar" title="收起侧边栏">
            <i class="el-icon-d-arrow-left"></i>
          </el-button>
        </div>
      </div>
      <div class="session-list-wrapper">
        <div class="session-list-header">
          <span class="session-list-title">历史对话</span>
          <el-button
            type="text"
            size="mini"
            class="session-refresh-btn"
            icon="el-icon-refresh"
            @click="loadChatSessions"
          ></el-button>
        </div>
        <el-scrollbar class="session-scroll">
          <div
            v-for="item in chatSessions"
            :key="item.id"
            :class="['session-item', { active: activeSessionId === item.id }]"
            @click="handleSelectSession(item)"
          >
            <div class="session-item-title" :title="item._displayTitle">{{ item._displayTitle }}</div>
            <div class="session-item-meta">
              <span class="session-item-time">{{ item._displayTime }}</span>
            </div>
          </div>
          <div v-if="!chatSessions.length && !sessionLoading" class="session-empty">暂无历史对话</div>
        </el-scrollbar>
      </div>
    </div>

    <!-- 主聊天页面 -->
    <div class="elderly-chat-page">
      <!-- 顶部栏 -->
      <div class="elderly-topbar">
        <div class="topbar-left">
          <span class="topbar-logo">🧡</span>
          <span class="topbar-title">和<span class="highlight">小忆</span>聊天</span>
        </div>
        <div class="topbar-right">
          <!-- 字体大小切换 -->
          <el-dropdown trigger="click" @command="changeFontSize">
            <button class="toolbar-btn" title="字体大小">
              <span class="font-size-label">A{{ fontSizeLevel === 0 ? '' : fontSizeLevel === 1 ? '+' : fontSizeLevel === 2 ? '++' : '+++' }}</span>
            </button>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item command="0">标准 (A)</el-dropdown-item>
              <el-dropdown-item command="1">大字 (A+)</el-dropdown-item>
              <el-dropdown-item command="2">特大 (A++)</el-dropdown-item>
              <el-dropdown-item command="3">超大 (A+++)</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
          <!-- 主题切换 -->
          <el-dropdown trigger="click" @command="changeTheme">
            <button class="toolbar-btn" :title="themeLabel">
              <i :class="themeIcon"></i>
              <span class="toolbar-btn-text">{{ themeShortLabel }}</span>
            </button>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item command="light"><i class="el-icon-sunny"></i> 浅色</el-dropdown-item>
              <el-dropdown-item command="dark"><i class="el-icon-moon"></i> 深色</el-dropdown-item>
              <el-dropdown-item command="high-contrast"><i class="el-icon-view"></i> 高对比度</el-dropdown-item>
              <el-dropdown-item command="system"><i class="el-icon-monitor"></i> 跟随系统</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
          <!-- 自动朗读开关 -->
          <button
            class="toolbar-btn"
            :class="{ active: autoReadAloud }"
            @click="toggleAutoRead"
            :title="autoReadAloud ? '关闭自动朗读' : '开启自动朗读'"
          >
            <i class="el-icon-headset"></i>
            <span class="toolbar-btn-text">朗读</span>
          </button>
          <!-- 开始测试按钮（实验员模式） -->
          <button class="start-test-btn" v-if="experimenterMode && !testActive" @click="startTest">
            <i class="el-icon-video-camera"></i>
            <span>开始测试</span>
          </button>
          <!-- 实验员工具（实验员模式） -->
          <el-dropdown trigger="click" @command="handleExperimenterTool" v-if="experimenterMode">
            <button class="toolbar-btn" title="实验员工具">
              <i class="el-icon-s-tools"></i>
            </button>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item icon="el-icon-monitor" command="/eeg-monitor">EEG 实时监测</el-dropdown-item>
              <el-dropdown-item icon="el-icon-data-analysis" command="/cognitive-load">认知负荷评估</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
          <!-- 小忆记得按钮 -->
          <button
            class="toolbar-btn memory-btn"
            :class="{ active: memoryPanelOpen }"
            @click="openMemoryPanel"
            title="小忆记得"
          >
            <i class="el-icon-collection-tag"></i>
            <span class="toolbar-btn-text">记得</span>
          </button>
          <el-avatar :size="38" :icon="avatarIcon" class="elderly-avatar"></el-avatar>
        </div>
      </div>

    <!-- 测试状态条（测试进行中显示） -->
    <div class="eeg-status-bar" v-if="testActive">
      <span class="live-dot"></span>
      <span class="eeg-status-text">测试进行中</span>
      <button class="finish-test-btn" @click="finishTest">结束测试</button>
    </div>

    <!-- 网络异常提示条 -->
    <transition name="slide-down">
      <div class="offline-bar" v-if="isOffline">
        <i class="el-icon-warning"></i>
        <span>网络已断开，请检查网络连接</span>
      </div>
    </transition>

    <!-- 聊天消息区域 -->
    <div class="elderly-messages" ref="messagesBox">
      <!-- 欢迎消息 -->
      <div class="msg bot" v-if="messages.length === 0">
        <div class="msg-avatar">🤗</div>
        <div class="msg-bubble">
          <div class="msg-sender">小忆</div>
          <div class="bubble-text" v-html="renderText(greetingText)"></div>
          <div class="msg-actions">
            <button class="msg-action-btn tts-btn" @click="speakText(greetingText)" title="朗读">
              <i :class="isSpeaking === 'greeting' ? 'el-icon-loading' : 'el-icon-headset'"></i>
            </button>
          </div>
          <div class="msg-time">{{ currentTime }}</div>
        </div>
      </div>

      <!-- 消息列表 -->
      <div
        v-for="(msg, idx) in messages"
        :key="idx"
        :class="['msg', msg.role]"
      >
        <div class="msg-avatar">{{ msg.role === 'bot' ? '🤗' : '🧓' }}</div>
        <div class="msg-bubble">
          <div class="msg-sender">{{ msg.role === 'bot' ? '小忆' : '我' }}</div>
          <div class="bubble-text" v-html="renderText(msg.content)"></div>
          <!-- bot消息操作按钮 -->
          <div class="msg-actions" v-if="msg.role === 'bot' && msg.content">
            <button
              class="msg-action-btn tts-btn"
              :class="{ speaking: isSpeaking === 'msg-' + idx }"
              @click="speakText(msg.content, 'msg-' + idx)"
              title="朗读"
            >
              <i :class="isSpeaking === 'msg-' + idx ? 'el-icon-loading' : 'el-icon-headset'"></i>
            </button>
          </div>
          <div class="msg-time">{{ formatTime(msg.timestamp) }}</div>
        </div>
      </div>

      <!-- 正在输入 -->
      <div class="msg bot" v-if="isSending">
        <div class="msg-avatar typing-avatar">🤗</div>
        <div class="msg-bubble typing-bubble">
          <span class="dot" v-for="n in 3" :key="n" :style="{ animationDelay: n * 0.2 + 's' }"></span>
        </div>
      </div>
    </div>

    <!-- 快捷回复（前5轮对话内常驻，审计建议不突然消失） -->
    <div class="quick-replies" v-if="showQuickReplies && !isSending">
      <button
        v-for="(q, i) in quickReplies"
        :key="i"
        class="quick-btn"
        @click="sendQuick(q)"
      >{{ q }}</button>
    </div>

    <!-- 输入区域 -->
    <div class="elderly-input-area">
      <button
        class="voice-btn"
        :class="{ recording: isRecording }"
        @click="toggleRecord"
        :title="isRecording ? '点击结束录音' : '按住说话'"
      >
        <i :class="isRecording ? 'el-icon-microphone' : 'el-icon-microphone'"></i>
        <span v-if="isRecording" class="recording-label">正在录音</span>
      </button>
      <div class="input-wrap">
        <textarea
          ref="inputBox"
          v-model="inputText"
          :placeholder="inputPlaceholder"
          rows="1"
          @keydown.enter.exact.prevent="send"
          @input="autoResize"
        ></textarea>
      </div>
      <button class="send-btn" @click="send" :disabled="!inputText.trim() || isSending">
        <i class="el-icon-s-promotion"></i>
      </button>
    </div>

    <!-- 底部导航 -->
    <div class="elderly-bottom-nav">
      <router-link to="/elderly-chat" class="nav-btn active">
        <i class="el-icon-s-home"></i>
        <span>首页</span>
      </router-link>
      <router-link to="/medication" class="nav-btn">
        <i class="el-icon-first-aid-kit"></i>
        <span>吃药</span>
      </router-link>
      <router-link to="/family-report" class="nav-btn">
        <i class="el-icon-phone-outline"></i>
        <span>家人</span>
      </router-link>
    </div>

    <!-- 小忆记得·记忆面板 -->
    <transition name="slide-right">
      <div class="memory-panel" v-if="memoryPanelOpen">
        <div class="memory-panel-header">
          <span class="memory-panel-title">🧠 小忆记得</span>
          <button class="memory-panel-close" @click="memoryPanelOpen = false">
            <i class="el-icon-close"></i>
          </button>
        </div>
        <div class="memory-panel-body">
          <div v-if="memoryItems.length === 0" class="memory-empty">
            还没有记住什么，聊多了小忆就会记住啦~
          </div>
          <div
            v-for="(item, idx) in memoryItems"
            :key="idx"
            class="memory-card"
          >
            <div class="memory-card-icon">{{ item.icon }}</div>
            <div class="memory-card-content">
              <div class="memory-card-label">{{ item.label }}</div>
              <div class="memory-card-value">{{ item.value }}</div>
            </div>
          </div>
        </div>
      </div>
    </transition>
    </div><!-- /.elderly-chat-page -->
  </div><!-- /.elderly-chat-wrapper -->
</template>

<script>
import storage from '@/utils/storage'
import { sendMessageToBackendStream, getSessionHistory, synthesizeTTS } from '@/api/chat'
import { recordEvent, COGNITIVE_EVENT_TYPES } from '@/utils/cognitiveLoad'
import { saveHistoryRecord, getHistoryByType, HISTORY_TYPES } from '@/utils/historyUtils'
import { marked } from 'marked'
import DOMPurify from 'dompurify'

const SESSION_KEY = 'elderly_chat_session_id'
const HISTORY_KEY = 'elderly_chat_messages'
const TEST_STATE_KEY = 'elderly_test_state'
const THEME_KEY = 'elderly_chat_theme'
const FONTSIZE_KEY = 'elderly_chat_fontsize'
const AUTOREAD_KEY = 'elderly_chat_autoread'
const ONBOARDING_KEY = 'elderly_chat_onboarded'

// 配置 marked：不使用 GFM 的自动链接（避免安全问题）
marked.setOptions({
  breaks: true,
  gfm: false
})

export default {
  name: 'ElderlyChatView',
  data() {
    // 生成时间感知的问候语
    const hour = new Date().getHours()
    let timeGreeting = ''
    if (hour < 6) timeGreeting = '这么晚还没睡呀'
    else if (hour < 9) timeGreeting = '早上好呀'
    else if (hour < 12) timeGreeting = '上午好呀'
    else if (hour < 14) timeGreeting = '中午好呀'
    else if (hour < 18) timeGreeting = '下午好呀'
    else timeGreeting = '晚上好呀'

    return {
      messages: [],
      inputText: '',
      isSending: false,
      isRecording: false,
      mediaRecorder: null,
      recordChunks: [],
      sessionId: null,
      // v2 情感化快捷回复
      quickReplies: [
        '小忆，我想你了~',
        '今天天气真好啊',
        '给我讲个故事呗',
        '最近身体还行'
      ],
      // v2 尊重式问候语
      greetingText: `${timeGreeting}！我是小忆，很高兴又能跟您聊天了。您今天过得怎么样呀？有什么想聊的尽管说~`,
      // 测试状态
      testActive: false,
      testTaskId: null,
      testSessionId: null,
      // 左侧历史对话栏
      leftSidebarOpen: false,
      chatSessions: [],
      sessionLoading: false,
      activeSessionId: null,
      // ===== v2 新增 =====
      // 主题：light / dark / system
      theme: 'light',
      resolvedTheme: 'light',
      // 字体大小：0=标准 / 1=大字 / 2=特大
      fontSizeLevel: 0,
      // 自动朗读
      autoReadAloud: false,
      // TTS 状态
      isSpeaking: null,
      currentTTSAudio: null,
      // 记忆面板
      memoryPanelOpen: false,
      memoryItems: [
        // 示例数据，实际从对话中提取
        // { icon: '👤', label: '称呼', value: '王叔叔' }
      ],
      // 占位符列表（固定，不做轮换）
      placeholders: [
        '跟小忆说说话...',
        '想聊点啥呢...',
        '有什么事儿跟我说...'
      ],
      currentPlaceholderIdx: 0,
      // 实验员模式（默认开启，管理员/实验员可查看测试/EEG/评估功能）
      experimenterMode: true,
      // 网络状态
      isOffline: !navigator.onLine,
      // 首次使用引导
      showOnboarding: false,
      onboardingStep: 0
    }
  },
  computed: {
    showQuickReplies() {
      return this.messages.filter(m => m.role === 'user').length < 5
    },
    avatarIcon() {
      return 'el-icon-user'
    },
    currentTime() {
      return this.formatTime(Date.now())
    },
    themeClass() {
      if (this.resolvedTheme === 'dark') return 'theme-dark'
      if (this.resolvedTheme === 'high-contrast') return 'theme-high-contrast'
      return 'theme-light'
    },
    themeIcon() {
      if (this.theme === 'system') return 'el-icon-monitor'
      if (this.theme === 'high-contrast') return 'el-icon-view'
      return this.resolvedTheme === 'dark' ? 'el-icon-moon' : 'el-icon-sunny'
    },
    themeLabel() {
      if (this.theme === 'system') return '跟随系统'
      if (this.theme === 'high-contrast') return '高对比度模式'
      return this.resolvedTheme === 'dark' ? '深色模式' : '浅色模式'
    },
    themeShortLabel() {
      if (this.theme === 'high-contrast') return '对比'
      return ''
    },
    inputPlaceholder() {
      return this.placeholders[this.currentPlaceholderIdx % this.placeholders.length]
    }
  },
  created() {
    // 恢复 session
    this.sessionId = storage.get(SESSION_KEY)
    if (!this.sessionId) {
      this.sessionId = 'ec-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8)
      storage.set(SESSION_KEY, this.sessionId)
    }
    // 恢复本地聊天记录
    const saved = storage.get(HISTORY_KEY)
    if (saved && Array.isArray(saved)) {
      this.messages = saved
    }
    // 恢复主题
    this.theme = storage.get(THEME_KEY) || 'light'
    this.resolveTheme()
    // 恢复字体大小
    this.fontSizeLevel = parseInt(storage.get(FONTSIZE_KEY)) || 0
    if (this.fontSizeLevel < 0 || this.fontSizeLevel > 3) this.fontSizeLevel = 0
    // 恢复自动朗读
    this.autoReadAloud = storage.get(AUTOREAD_KEY) === true
    // 恢复测试状态
    this.restoreTestState()
    // 恢复实验员模式（默认 true，管理员/实验员可见）
    this.experimenterMode = storage.get('elderly_experimenter_mode') !== false
    // 首次使用引导
    if (!storage.get(ONBOARDING_KEY)) {
      this.showOnboarding = true
    }
  },
  activated() {
    this.restoreTestState()
  },
  mounted() {
    this.$nextTick(() => {
      this.scrollToBottom()
      if (this.$refs.inputBox) {
        this.$refs.inputBox.focus()
      }
    })
    // 加载历史对话列表
    this.loadChatSessions()
    // 从后端加载记忆
    this.loadMemoryFromSession()
    window.addEventListener('historyUpdated', this.onHistoryUpdated)
    // 轮询检测测试状态
    this._testStateTimer = setInterval(() => {
      const state = storage.get(TEST_STATE_KEY)
      if (state && state.active && !this.testActive) {
        this.testActive = true
        this.testTaskId = state.taskId
        this.testSessionId = state.sessionId
      } else if ((!state || !state.active) && this.testActive) {
        this.testActive = false
        this.testTaskId = null
        this.testSessionId = null
      }
    }, 1000)
    // 页面可见性变化
    this._onVisibilityChange = () => {
      if (!document.hidden) {
        this.restoreTestState()
        this.resolveTheme()
      }
    }
    document.addEventListener('visibilitychange', this._onVisibilityChange)
    // 系统主题变化监听
    this._mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    this._onMediaQueryChange = () => this.resolveTheme()
    if (this._mediaQuery.addEventListener) {
      this._mediaQuery.addEventListener('change', this._onMediaQueryChange)
    } else {
      this._mediaQuery.addListener(this._onMediaQueryChange)
    }
    // 占位符定时切换（每 8 秒换一个）
    this._placeholderTimer = setInterval(() => {
      this.currentPlaceholderIdx++
    }, 8000)
    // 网络状态监听
    this._onOnline = () => { this.isOffline = false }
    this._onOffline = () => { this.isOffline = true }
    window.addEventListener('online', this._onOnline)
    window.addEventListener('offline', this._onOffline)
  },
  beforeDestroy() {
    if (this._testStateTimer) {
      clearInterval(this._testStateTimer)
      this._testStateTimer = null
    }
    if (this._placeholderTimer) {
      clearInterval(this._placeholderTimer)
      this._placeholderTimer = null
    }
    if (this._onVisibilityChange) {
      document.removeEventListener('visibilitychange', this._onVisibilityChange)
    }
    if (this._mediaQuery) {
      if (this._mediaQuery.removeEventListener) {
        this._mediaQuery.removeEventListener('change', this._onMediaQueryChange)
      } else {
        this._mediaQuery.removeListener(this._onMediaQueryChange)
      }
    }
    window.removeEventListener('historyUpdated', this.onHistoryUpdated)
    window.removeEventListener('online', this._onOnline)
    window.removeEventListener('offline', this._onOffline)
    // 停止 TTS
    this.stopSpeaking()
  },
  watch: {
    '$route'(to) {
      if (to.path === '/elderly-chat') {
        this.restoreTestState()
      }
    }
  },
  methods: {
    // ===== 首次使用引导 =====
    nextOnboarding() {
      if (this.onboardingStep < 2) {
        this.onboardingStep++
      } else {
        this.skipOnboarding()
      }
    },
    skipOnboarding() {
      this.showOnboarding = false
      storage.set(ONBOARDING_KEY, true)
    },

    // ===== 主题 =====
    changeTheme(theme) {
      this.theme = theme
      storage.set(THEME_KEY, theme)
      this.resolveTheme()
    },
    resolveTheme() {
      if (this.theme === 'system') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        this.resolvedTheme = prefersDark ? 'dark' : 'light'
      } else {
        this.resolvedTheme = this.theme
      }
    },

    // ===== 字体大小 =====
    changeFontSize(level) {
      this.fontSizeLevel = parseInt(level)
      storage.set(FONTSIZE_KEY, this.fontSizeLevel)
    },

    // ===== 自动朗读 =====
    toggleAutoRead() {
      this.autoReadAloud = !this.autoReadAloud
      storage.set(AUTOREAD_KEY, this.autoReadAloud)
    },

    // ===== TTS 朗读（调用后端 Edge-TTS API） =====
    speakText(text, id) {
      if (!text) return
      // 如果正在朗读同一条，则停止
      if (this.isSpeaking === id) {
        this.stopSpeaking()
        return
      }
      this.stopSpeaking()
      // 去掉 HTML 标签，只留纯文本
      const plainText = text.replace(/<[^>]*>/g, '').replace(/\*\*/g, '').trim()
      if (!plainText) return

      this.isSpeaking = id
      synthesizeTTS(plainText, 'zh-CN-XiaoxiaoNeural')
        .then(res => {
          if (!res.ok) throw new Error('TTS 请求失败')
          return res.blob()
        })
        .then(blob => {
          const url = URL.createObjectURL(blob)
          const audio = new Audio(url)
          this.currentTTSAudio = audio
          audio.onended = () => {
            this.isSpeaking = null
            this.currentTTSAudio = null
            URL.revokeObjectURL(url)
          }
          audio.onerror = () => {
            this.isSpeaking = null
            this.currentTTSAudio = null
            URL.revokeObjectURL(url)
          }
          audio.play().catch(() => {
            this.isSpeaking = null
            this.currentTTSAudio = null
            URL.revokeObjectURL(url)
          })
        })
        .catch(() => {
          this.isSpeaking = null
          this.currentTTSAudio = null
        })
    },
    stopSpeaking() {
      if (this.currentTTSAudio) {
        this.currentTTSAudio.pause()
        this.currentTTSAudio = null
      }
      this.isSpeaking = null
    },

    // ===== 记忆提取（从后端 session 历史提取 + 正则补充） =====
    openMemoryPanel() {
      this.memoryPanelOpen = !this.memoryPanelOpen
      if (this.memoryPanelOpen) {
        this.loadMemoryFromSession()
      }
    },
    loadMemoryFromSession() {
      if (!this.sessionId) return
      getSessionHistory(this.sessionId)
        .then(res => {
          const history = (res.data && res.data.history) || res.history || []
          // 把后端记忆全部作为"小忆记得"展示
          this.memoryItems = []
          // 从历史对话中用正则提取关键信息
          for (const item of history) {
            if (item.role === 'user' && item.content) {
              this.extractMemory(item.content)
            }
          }
        })
        .catch(() => {
          // 后端不可用时，从本地消息中提取
          for (const msg of this.messages) {
            if (msg.role === 'user' && msg.content) {
              this.extractMemory(msg.content)
            }
          }
        })
    },
    extractMemory(text) {
      // 提取名字/称呼
      const namePatterns = [
        /我叫(.{1,4})[,，。！!~]/,
        /我姓(.{1,2})[,，。！!~]/,
        /我是(.{1,4})[,，。！!~]/
      ]
      for (const p of namePatterns) {
        const m = text.match(p)
        if (m) {
          const val = m[1].trim()
          if (val.length >= 1 && val.length <= 4 && !this.memoryItems.find(i => i.label === '称呼')) {
            this.memoryItems.push({ icon: '👤', label: '称呼', value: val })
            return
          }
        }
      }
      // 提取家人
      const familyPatterns = [
        /孙子叫(.{1,4})[,，。！!~]/,
        /老伴叫?(.{1,4})[,，。！!~]/,
        /儿子叫(.{1,4})[,，。！!~]/,
        /女儿叫(.{1,4})[,，。！!~]/
      ]
      for (const p of familyPatterns) {
        const m = text.match(p)
        if (m) {
          const val = m[1].trim()
          if (val.length >= 1 && val.length <= 4) {
            const label = p.source.includes('孙子') ? '孙子' : p.source.includes('老伴') ? '老伴' : p.source.includes('儿子') ? '儿子' : '女儿'
            if (!this.memoryItems.find(i => i.label === label)) {
              this.memoryItems.push({ icon: '👨‍👩‍👧', label, value: val })
              return
            }
          }
        }
      }
      // 提取爱好
      const hobbyPatterns = [
        /我喜欢(.{2,10})[,，。！!~]/,
        /我平时爱(.{2,10})[,，。！!~]/,
        /我平常喜欢(.{2,10})[,，。！!~]/
      ]
      for (const p of hobbyPatterns) {
        const m = text.match(p)
        if (m) {
          const val = m[1].trim()
          if (val.length >= 2 && !this.memoryItems.find(i => i.label === '爱好')) {
            this.memoryItems.push({ icon: '🌿', label: '爱好', value: val })
            return
          }
        }
      }
      // 提取身体情况关键词
      const healthKeywords = ['血压', '血糖', '糖尿病', '高血压', '膝盖', '腰', '失眠', '心脏', '头疼', '头晕']
      for (const kw of healthKeywords) {
        if (text.includes(kw) && !this.memoryItems.find(i => i.label === '健康' && i.value.includes(kw))) {
          const existing = this.memoryItems.find(i => i.label === '健康')
          if (existing) {
            if (!existing.value.includes(kw)) {
              existing.value += '、' + kw
            }
          } else {
            this.memoryItems.push({ icon: '💊', label: '健康', value: kw })
          }
          return
        }
      }
    },

    // ===== Markdown 渲染（带 DOMPurify 消毒） =====
    renderText(text) {
      if (!text) return ''
      try {
        const html = marked.parse(text)
        return DOMPurify.sanitize(html, {
          ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'ul', 'ol', 'li', 'blockquote', 'code', 'pre', 'span', 'div'],
          ALLOWED_ATTR: ['class']
        })
      } catch (e) {
        // fallback：简单转义 + 保留换行
        return text
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/\n/g, '<br>')
      }
    },

    // ===== 发送消息 =====
    send() {
      const text = this.inputText.trim()
      if (!text || this.isSending) return

      // 添加用户消息
      const userMsg = {
        role: 'user',
        content: text,
        timestamp: Date.now()
      }
      this.messages.push(userMsg)
      this.inputText = ''
      this.saveMessages()
      this.scrollToBottom()

      // 实时提取记忆（不等后端返回）
      this.extractMemory(text)

      // 行为埋点
      if (this.testActive) {
        recordEvent(COGNITIVE_EVENT_TYPES.CLICK, {
          task_id: this.testTaskId,
          session_id: String(this.testSessionId),
          source: 'elderly_test',
          action: 'send_message',
          message_length: text.length
        })
      }

      // 调用后端
      this.isSending = true
      this.stopSpeaking()
      const botMsg = { role: 'bot', content: '', timestamp: Date.now() }
      this.messages.push(botMsg)
      const botIdx = this.messages.length - 1
      this.scrollToBottom()

      sendMessageToBackendStream(text, this.sessionId, {
        intent: 'elderly_companion',
        onChunk: (delta) => {
          this.messages[botIdx].content += delta
          this.scrollToBottom()
        },
        onDone: ({ answer }) => {
          if (answer) {
            this.messages[botIdx].content = answer
          }
          this.messages[botIdx].timestamp = Date.now()
          this.saveMessages()
          this.isSending = false
          this.scrollToBottom()
          // 重置 input 高度
          if (this.$refs.inputBox) {
            this.$refs.inputBox.style.height = 'auto'
          }
          // 保存到历史记录
          saveHistoryRecord(HISTORY_TYPES.CHAT, {
            question: text,
            answer: this.messages[botIdx].content,
            sessionId: this.sessionId,
            intent: 'elderly_companion'
          })
          // 自动朗读
          if (this.autoReadAloud && this.messages[botIdx].content) {
            this.speakText(this.messages[botIdx].content, 'msg-' + botIdx)
          }
          // 刷新记忆面板
          this.loadMemoryFromSession()
        },
        onError: (e) => {
          this.messages[botIdx].content = '哎呀，刚才断了一下，您再说一遍好不好？'
          this.messages[botIdx].timestamp = Date.now()
          this.saveMessages()
          this.isSending = false
          this.scrollToBottom()
          // 错误也自动朗读
          if (this.autoReadAloud) {
            this.speakText(this.messages[botIdx].content, 'msg-' + botIdx)
          }
        }
      })
    },

    sendQuick(text) {
      this.inputText = text
      this.send()
    },

    formatTime(ts) {
      if (!ts) return ''
      const d = new Date(ts)
      const h = String(d.getHours()).padStart(2, '0')
      const m = String(d.getMinutes()).padStart(2, '0')
      return h + ':' + m
    },

    scrollToBottom() {
      this.$nextTick(() => {
        const box = this.$refs.messagesBox
        if (box) {
          box.scrollTop = box.scrollHeight
        }
      })
    },

    autoResize() {
      const el = this.$refs.inputBox
      if (!el) return
      el.style.height = 'auto'
      el.style.height = Math.min(el.scrollHeight, 120) + 'px'
    },

    saveMessages() {
      const toSave = this.messages.slice(-50)
      storage.set(HISTORY_KEY, toSave)
    },

    // 语音输入
    toggleRecord() {
      if (this.isRecording) {
        this.stopRecord()
      } else {
        this.startRecord()
      }
    },

    async startRecord() {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        this.$message.error('您的浏览器不支持语音录制，请使用 Chrome 或 Edge')
        return
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        this.recordChunks = []
        const mr = new MediaRecorder(stream)
        this.mediaRecorder = mr
        mr.ondataavailable = (e) => {
          if (e.data.size) this.recordChunks.push(e.data)
        }
        mr.onstop = async () => {
          stream.getTracks().forEach(t => t.stop())
          await this.finishRecord()
        }
        mr.start()
        this.isRecording = true
      } catch (e) {
        this.$message.error('无法访问麦克风，请检查权限')
      }
    },

    stopRecord() {
      if (this.mediaRecorder && this.isRecording) {
        this.mediaRecorder.stop()
        this.isRecording = false
      }
    },

    async finishRecord() {
      const chunks = this.recordChunks || []
      this.recordChunks = []
      this.mediaRecorder = null
      if (!chunks.length) return
      try {
        const { transcribeSTT } = await import('@/api/multimodal')
        const blob = new Blob(chunks, { type: 'audio/webm' })
        const file = new File([blob], 'recording.webm', { type: 'audio/webm' })
        const res = await transcribeSTT(file)
        const text = (res.data && res.data.text) || res.text || ''
        if (text) {
          this.inputText = text
          this.$nextTick(() => this.send())
        } else {
          this.$message.warning('没听清，您再说一次？')
        }
      } catch (e) {
        this.$message.error('语音识别失败')
      }
    },

    // ===== 测试流程 =====
    startTest() {
      this.$router.push('/elderly-test')
    },
    finishTest() {
      recordEvent(COGNITIVE_EVENT_TYPES.TASK_END, {
        task_id: this.testTaskId,
        session_id: String(this.testSessionId),
        source: 'elderly_test'
      })
      this.testActive = false
      this.testTaskId = null
      this.testSessionId = null
      this.doNewConversation()
      this.$router.push('/elderly-test')
    },
    restoreTestState() {
      const state = storage.get(TEST_STATE_KEY)
      if (state && state.active && state.currentStep < 5) {
        this.testActive = true
        this.testTaskId = state.taskId
        this.testSessionId = state.sessionId
      }
    },

    // ===== 实验员工具 =====
    handleExperimenterTool(path) {
      this.$router.push(path)
    },

    // ===== 侧边栏 =====
    toggleLeftSidebar() {
      this.leftSidebarOpen = !this.leftSidebarOpen
    },

    async loadChatSessions() {
      this.sessionLoading = true
      try {
        const list = await getHistoryByType(HISTORY_TYPES.CHAT)
        const sorted = (list || []).slice().sort((a, b) => {
          const ta = new Date(a.updateTime || a.createTime || 0).getTime()
          const tb = new Date(b.updateTime || b.createTime || 0).getTime()
          return tb - ta
        })
        this.chatSessions = sorted.map(r => {
          const q = r.content?.question || r.title || '新对话'
          const t = r.updateTime || r.createTime
          return {
            ...r,
            _displayTitle: q.length > 18 ? `${q.slice(0, 18)}...` : q,
            _displayTime: t ? this.formatTime(new Date(t).getTime()) : ''
          }
        })
      } catch (e) {
        console.error('加载聊天历史失败', e)
      } finally {
        this.sessionLoading = false
      }
    },

    onHistoryUpdated() {
      this.loadChatSessions()
    },

    handleNewConversation() {
      if (this.messages && this.messages.length > 0) {
        this.$confirm('开始新对话将清空当前聊天内容，确定继续吗？', '新对话', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'info'
        }).then(() => {
          this.doNewConversation()
          // 破坏性操作语音播报
          this.speakText('好的，我们开始新的聊天吧')
        }).catch(() => {})
      } else {
        this.doNewConversation()
      }
    },

    doNewConversation() {
      this.messages = []
      this.inputText = ''
      this.activeSessionId = null
      this.sessionId = 'ec-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8)
      storage.set(SESSION_KEY, this.sessionId)
      storage.set(HISTORY_KEY, [])
      this.saveMessages()
      this.scrollToBottom()
      this.loadChatSessions()
    },

    handleSelectSession(item) {
      if (!item) return
      this.activeSessionId = item.id
      const content = item.content || {}
      const question = content.question
      const answer = content.answer
      this.messages = []
      const now = Date.now()
      if (question) {
        this.messages.push({ role: 'user', content: question, timestamp: now - 1000 })
      }
      if (answer) {
        this.messages.push({ role: 'bot', content: answer, timestamp: now })
      }
      this.saveMessages()
      this.scrollToBottom()
    }
  }
}
</script>

<style scoped>
/* ===== 浅色主题（默认） ===== */
.theme-light .elderly-chat-wrapper,
.elderly-chat-wrapper.theme-light {
  --bg-primary: #FFF8F0;
  --bg-secondary: #FFFFFF;
  --bg-input: #FFF8F0;
  --bg-bubble-bot: #FFFFFF;
  --bg-bubble-user: #E8734A;
  --text-primary: #3D3229;
  --text-secondary: #5D4E3C;
  --text-placeholder: #5D4E3C;
  --text-time: #5D4E3C;
  --text-bubble-user: #FFFFFF;
  --accent: #E8734A;
  --accent-hover: #D4623D;
  --border: #F0E6DB;
  --hover-bg: #FFF5F0;
  --shadow: rgba(0,0,0,0.04);
  --shadow-accent: rgba(232,115,74,0.3);
}

/* ===== 深色主题 ===== */
.theme-dark .elderly-chat-wrapper,
.elderly-chat-wrapper.theme-dark {
  --bg-primary: #1a1814;
  --bg-secondary: #252220;
  --bg-input: #2a2724;
  --bg-bubble-bot: #2a2724;
  --bg-bubble-user: #E8734A;
  --text-primary: #E8DDD0;
  --text-secondary: #B8AFA4;
  --text-placeholder: #A89A8C;
  --text-time: #A89A8C;
  --text-bubble-user: #FFFFFF;
  --accent: #E8734A;
  --accent-hover: #F08B64;
  --border: #3a3530;
  --hover-bg: #352f2a;
  --shadow: rgba(0,0,0,0.2);
  --shadow-accent: rgba(232,115,74,0.4);
}

/* ===== 高对比度模式（黑底亮黄） ===== */
.theme-high-contrast .elderly-chat-wrapper,
.elderly-chat-wrapper.theme-high-contrast {
  --bg-primary: #000000;
  --bg-secondary: #1a1a1a;
  --bg-input: #0a0a0a;
  --bg-bubble-bot: #1a1a1a;
  --bg-bubble-user: #E8734A;
  --text-primary: #FFFFFF;
  --text-secondary: #FFD700;
  --text-placeholder: #FFD700;
  --text-time: #FFD700;
  --text-bubble-user: #FFFFFF;
  --accent: #FFD700;
  --accent-hover: #FFC107;
  --border: #FFD700;
  --hover-bg: #2a2a00;
  --shadow: rgba(0,0,0,0.4);
  --shadow-accent: rgba(255,215,0,0.5);
}

/* ===== 主题过渡 ===== */
.elderly-chat-wrapper {
  transition: background 0.3s ease, color 0.3s ease;
}

.elderly-chat-wrapper *,
.elderly-chat-wrapper *::before,
.elderly-chat-wrapper *::after {
  transition: background 0.3s ease, color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
}

/* ===== 字体大小 ===== */
.font-size-0 .msg-bubble { font-size: 17px; }
.font-size-1 .msg-bubble { font-size: 20px; }
.font-size-2 .msg-bubble { font-size: 23px; }
.font-size-3 .msg-bubble { font-size: 26px; }

.font-size-0 .input-wrap textarea { font-size: 17px; }
.font-size-1 .input-wrap textarea { font-size: 20px; }
.font-size-2 .input-wrap textarea { font-size: 23px; }
.font-size-3 .input-wrap textarea { font-size: 26px; }

.font-size-0 .quick-btn { font-size: 15px; }
.font-size-1 .quick-btn { font-size: 18px; }
.font-size-2 .quick-btn { font-size: 20px; }
.font-size-3 .quick-btn { font-size: 23px; }

/* 导航 ≥18px（审计要求） */
.font-size-0 .nav-btn span { font-size: 18px; }
.font-size-1 .nav-btn span { font-size: 20px; }
.font-size-2 .nav-btn span { font-size: 22px; }
.font-size-3 .nav-btn span { font-size: 24px; }

/* 侧边栏标题 ≥18px（审计要求） */
.font-size-0 .session-title { font-size: 18px; }
.font-size-1 .session-title { font-size: 20px; }
.font-size-2 .session-title { font-size: 22px; }
.font-size-3 .session-title { font-size: 24px; }

/* 会话列表标题 ≥16px */
.font-size-0 .session-list-title { font-size: 14px; }
.font-size-1 .session-list-title { font-size: 16px; }
.font-size-2 .session-list-title { font-size: 18px; }
.font-size-3 .session-list-title { font-size: 20px; }

/* 记忆面板文字 ≥16px（审计要求） */
.font-size-0 .memory-card-label { font-size: 14px; }
.font-size-1 .memory-card-label { font-size: 16px; }
.font-size-2 .memory-card-label { font-size: 18px; }
.font-size-3 .memory-card-label { font-size: 20px; }
.font-size-0 .memory-card-value { font-size: 16px; }
.font-size-1 .memory-card-value { font-size: 18px; }
.font-size-2 .memory-card-value { font-size: 20px; }
.font-size-3 .memory-card-value { font-size: 22px; }
.font-size-0 .memory-empty { font-size: 16px; }
.font-size-1 .memory-empty { font-size: 18px; }
.font-size-2 .memory-empty { font-size: 20px; }
.font-size-3 .memory-empty { font-size: 22px; }

/* 时间戳 ≥14px（审计建议） */
.font-size-0 .msg-time { font-size: 12px; }
.font-size-1 .msg-time { font-size: 14px; }
.font-size-2 .msg-time { font-size: 16px; }
.font-size-3 .msg-time { font-size: 18px; }

/* 消息名字标签 */
.font-size-0 .msg-sender { font-size: 12px; }
.font-size-1 .msg-sender { font-size: 14px; }
.font-size-2 .msg-sender { font-size: 16px; }
.font-size-3 .msg-sender { font-size: 18px; }

/* 工具栏按钮文字标签 */
.font-size-0 .toolbar-btn-text { font-size: 11px; }
.font-size-1 .toolbar-btn-text { font-size: 12px; }
.font-size-2 .toolbar-btn-text { font-size: 13px; }
.font-size-3 .toolbar-btn-text { font-size: 14px; }

/* 外层包裹 */
.elderly-chat-wrapper {
  display: flex;
  height: 100vh;
  max-width: 100%;
  margin: 0 auto;
  background: var(--bg-primary);
  position: relative;
}

/* ===== 主聊天页面 ===== */
.elderly-chat-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  max-width: 1100px;
  margin: 0 auto;
  flex: 1;
  min-width: 0;
  background: var(--bg-primary);
  position: relative;
}

/* ===== 顶部栏 ===== */
.elderly-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
}
.topbar-left {
  display: flex;
  align-items: center;
  gap: 10px;
}
.topbar-logo {
  font-size: 28px;
}
.topbar-title {
  font-size: 22px;
  font-weight: 600;
  color: var(--text-primary);
}
.topbar-title .highlight {
  color: var(--accent);
}
.topbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
}
.elderly-avatar {
  background: var(--hover-bg) !important;
  border: 2px solid var(--accent) !important;
}

/* ===== 工具栏按钮 ===== */
.toolbar-btn {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  border: 1.5px solid var(--border);
  background: var(--bg-secondary);
  color: var(--text-secondary);
  font-size: 20px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1px;
  flex-shrink: 0;
  transition: all 0.2s;
}
.toolbar-btn:hover {
  border-color: var(--accent);
  color: var(--accent);
  background: var(--hover-bg);
}
.toolbar-btn.active {
  background: var(--accent);
  border-color: var(--accent);
  color: #FFFFFF;
}
.toolbar-btn-text {
  font-size: 10px;
  line-height: 1;
  white-space: nowrap;
}
.toolbar-btn.active .toolbar-btn-text {
  color: #FFFFFF;
}
.font-size-label {
  font-size: 14px;
  font-weight: 700;
  font-style: italic;
}

/* 记忆按钮 */
.memory-btn.active {
  position: relative;
}
.memory-btn.active::after {
  content: '';
  position: absolute;
  top: -2px;
  right: -2px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #52c41a;
}

/* ===== 开始测试按钮 ===== */
.start-test-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 18px;
  background: linear-gradient(135deg, var(--accent), var(--accent-hover));
  color: #FFFFFF;
  border: none;
  border-radius: 20px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 3px 12px var(--shadow-accent);
}
.start-test-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 5px 16px var(--shadow-accent);
}
.start-test-btn i { font-size: 16px; }

/* ===== EEG 状态条 ===== */
.eeg-status-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 24px;
  background: linear-gradient(90deg, var(--hover-bg), var(--bg-primary));
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
}
.live-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #EF4444;
  animation: liveBlink 1s ease-in-out infinite;
  flex-shrink: 0;
}
@keyframes liveBlink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}
.eeg-status-text {
  font-size: 16px;
  color: var(--accent);
  font-weight: 600;
  flex: 1;
}
.finish-test-btn {
  padding: 6px 16px;
  background: var(--bg-secondary);
  color: var(--accent);
  border: 1.5px solid var(--accent);
  border-radius: 16px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  flex-shrink: 0;
}
.finish-test-btn:hover {
  background: var(--hover-bg);
}

/* ===== 聊天消息区 ===== */
.offline-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: #EF4444;
  color: #FFFFFF;
  font-size: 15px;
  font-weight: 600;
  text-align: center;
  justify-content: center;
  flex-shrink: 0;
}
.slide-down-enter-active,
.slide-down-leave-active {
  transition: max-height 0.3s ease, opacity 0.3s ease;
  max-height: 50px;
  overflow: hidden;
}
.slide-down-enter,
.slide-down-leave-to {
  max-height: 0;
  opacity: 0;
}

.elderly-messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.msg {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  animation: msgIn 0.3s ease-out;
}
@keyframes msgIn {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}
.msg.user {
  flex-direction: row-reverse;
}
.msg-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  flex-shrink: 0;
  background: var(--hover-bg);
}
.msg.bot .msg-avatar {
  background: var(--hover-bg);
}
.msg.user .msg-avatar {
  background: #E8F5E9;
}
.typing-avatar {
  animation: avatarShake 1.2s ease-in-out infinite;
}
@keyframes avatarShake {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(-5deg); }
  75% { transform: rotate(5deg); }
}

.msg-bubble {
  max-width: min(80%, 700px);
  padding: 14px 18px;
  border-radius: 20px;
  line-height: 1.7;
  font-size: 17px;
  position: relative;
}
.msg.bot .msg-bubble {
  background: var(--bg-bubble-bot);
  color: var(--text-primary);
  border-bottom-left-radius: 6px;
  box-shadow: 0 2px 8px var(--shadow);
  border: 1px solid var(--border);
}
.msg.user .msg-bubble {
  background: var(--bg-bubble-user);
  color: var(--text-bubble-user);
  border-bottom-right-radius: 6px;
  box-shadow: 0 2px 8px var(--shadow-accent);
}

/* 消息名字标签 */
.msg-sender {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 4px;
  opacity: 0.7;
}
.msg.user .msg-sender {
  text-align: right;
}

/* 消息内操作按钮 */
.msg-actions {
  display: flex;
  gap: 4px;
  margin-top: 6px;
  justify-content: flex-start;
}
.msg.user .msg-actions {
  justify-content: flex-end;
}
.msg-action-btn {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  border: 1.5px solid var(--border);
  background: var(--bg-secondary);
  color: var(--text-secondary);
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}
.msg-action-btn:hover {
  border-color: var(--accent);
  color: var(--accent);
  background: var(--hover-bg);
}
.tts-btn.speaking {
  background: var(--accent);
  border-color: var(--accent);
  color: #FFFFFF;
  animation: speakPulse 1s ease-in-out infinite;
}
@keyframes speakPulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(232,115,74,0.4); }
  50% { box-shadow: 0 0 0 8px rgba(232,115,74,0); }
}

.bubble-text {
  word-break: break-word;
}
.bubble-text p {
  margin: 0 0 6px;
}
.bubble-text p:last-child {
  margin-bottom: 0;
}
/* Markdown 样式 */
.bubble-text >>> strong {
  color: var(--accent);
  font-weight: 700;
}
.bubble-text >>> ul,
.bubble-text >>> ol {
  margin: 6px 0;
  padding-left: 20px;
}
.bubble-text >>> li {
  margin: 2px 0;
}
.bubble-text >>> blockquote {
  border-left: 3px solid var(--accent);
  padding-left: 12px;
  margin: 8px 0;
  opacity: 0.8;
}
.bubble-text >>> code {
  background: var(--hover-bg);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.9em;
}
.bubble-text >>> pre {
  background: var(--hover-bg);
  padding: 10px;
  border-radius: 8px;
  overflow-x: auto;
  margin: 8px 0;
}
.bubble-text >>> pre code {
  background: none;
  padding: 0;
}

.msg-time {
  font-size: 12px;
  color: var(--text-time);
  margin-top: 6px;
  text-align: right;
}
.msg.user .msg-time {
  color: rgba(255,255,255,0.7);
}

/* 打字动画 */
.typing-bubble {
  display: flex;
  gap: 6px;
  align-items: center;
  padding: 18px 22px !important;
}
.dot {
  width: 10px;
  height: 10px;
  background: var(--accent);
  border-radius: 50%;
  animation: dotBounce 1.2s ease-in-out infinite;
}
@keyframes dotBounce {
  0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
  40% { transform: scale(1); opacity: 1; }
}

/* ===== 快捷回复 ===== */
.quick-replies {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  padding: 0 16px 10px;
  flex-shrink: 0;
}
.quick-btn {
  padding: 10px 18px;
  border: 1.5px solid var(--border);
  border-radius: 24px;
  background: var(--bg-secondary);
  color: var(--text-secondary);
  font-size: 15px;
  cursor: pointer;
  white-space: nowrap;
}
.quick-btn:hover {
  border-color: var(--accent);
  color: var(--accent);
  background: var(--hover-bg);
}

/* ===== 输入区域 ===== */
.elderly-input-area {
  display: flex;
  align-items: flex-end;
  gap: 10px;
  padding: 12px 16px 16px;
  background: var(--bg-secondary);
  border-top: 1px solid var(--border);
  flex-shrink: 0;
}
.voice-btn {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  border: 2px solid var(--accent);
  background: var(--hover-bg);
  color: var(--accent);
  font-size: 22px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.voice-btn:hover {
  background: var(--accent);
  color: #FFFFFF;
}
.voice-btn.recording {
  background: #EF4444;
  border-color: #EF4444;
  color: #FFFFFF;
  animation: pulse 1s ease-in-out infinite;
  position: relative;
}
.recording-label {
  position: absolute;
  bottom: -20px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 11px;
  color: #EF4444;
  font-weight: 600;
  white-space: nowrap;
}
@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.08); }
}

.input-wrap {
  flex: 1;
  background: var(--bg-input);
  border: 1.5px solid var(--border);
  border-radius: 24px;
  padding: 10px 16px;
}
.input-wrap:focus-within {
  border-color: var(--accent);
}
.input-wrap textarea {
  width: 100%;
  border: none;
  outline: none;
  background: transparent;
  font-size: 17px;
  color: var(--text-primary);
  line-height: 1.5;
  resize: none;
  font-family: inherit;
}
.input-wrap textarea::placeholder {
  color: var(--text-placeholder);
}

.send-btn {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  border: none;
  background: var(--accent);
  color: #FFFFFF;
  font-size: 22px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 4px 12px var(--shadow-accent);
}
.send-btn:hover:not(:disabled) {
  background: var(--accent-hover);
  transform: translateY(-1px);
  box-shadow: 0 6px 16px var(--shadow-accent);
}
.send-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* ===== 底部导航 ===== */
.elderly-bottom-nav {
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 10px 16px;
  padding-bottom: max(10px, env(safe-area-inset-bottom));
  background: var(--bg-secondary);
  border-top: 1px solid var(--border);
  flex-shrink: 0;
}
.nav-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  text-decoration: none;
  color: var(--text-secondary);
  font-size: 18px;
  padding: 6px 16px;
  border-radius: 16px;
}
.nav-btn i {
  font-size: 24px;
}
.nav-btn:hover {
  color: var(--accent);
  background: var(--hover-bg);
}
.nav-btn.active {
  color: var(--accent);
  font-weight: 600;
}

/* ===== 小忆记得·记忆面板 ===== */
.memory-panel {
  position: fixed;
  top: 0;
  right: 0;
  width: 320px;
  height: 100vh;
  background: var(--bg-secondary);
  border-left: 1px solid var(--border);
  box-shadow: -4px 0 16px var(--shadow);
  z-index: 100;
  display: flex;
  flex-direction: column;
}
.memory-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  border-bottom: 1px solid var(--border);
}
.memory-panel-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
}
.memory-panel-close {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  border: none;
  background: var(--hover-bg);
  color: var(--text-secondary);
  font-size: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}
.memory-panel-close:hover {
  color: var(--accent);
  background: var(--hover-bg);
}
.memory-panel-body {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}
.memory-empty {
  text-align: center;
  color: var(--text-placeholder);
  font-size: 16px;
  padding: 40px 20px;
  line-height: 1.6;
}
.memory-card {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px;
  border-radius: 12px;
  background: var(--bg-primary);
  margin-bottom: 10px;
  border: 1px solid var(--border);
}
.memory-card-icon {
  font-size: 24px;
  flex-shrink: 0;
  margin-top: 2px;
}
.memory-card-content {
  flex: 1;
  min-width: 0;
}
.memory-card-label {
  font-size: 13px;
  color: var(--text-secondary);
  margin-bottom: 2px;
}
.memory-card-value {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  word-break: break-word;
}

/* 记忆面板滑入动画 */
.slide-right-enter-active,
.slide-right-leave-active {
  transition: transform 0.3s ease;
}
.slide-right-enter,
.slide-right-leave-to {
  transform: translateX(100%);
}

/* ===== 侧边栏展开按钮 ===== */
.elderly-sidebar-toggle {
  width: 28px;
  min-width: 28px;
  background: var(--bg-secondary);
  border-radius: 0 12px 12px 0;
  border: 1px solid var(--border);
  border-left: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--accent);
  flex-shrink: 0;
  align-self: center;
  box-shadow: 2px 2px 8px var(--shadow);
}
.elderly-sidebar-toggle:hover {
  background: var(--hover-bg);
  color: var(--accent-hover);
}

/* ===== 左侧会话侧边栏 ===== */
.elderly-session-sidebar {
  width: 240px;
  min-width: 240px;
  background: var(--bg-secondary);
  border-radius: 0 16px 16px 0;
  box-shadow: 4px 0 16px var(--shadow);
  padding: 16px 12px;
  display: flex;
  flex-direction: column;
  border: 1px solid var(--border);
  border-left: none;
  height: 100%;
  overflow: hidden;
  transition: width 0.25s ease, min-width 0.25s ease, padding 0.25s ease;
  flex-shrink: 0;
}
.elderly-session-sidebar.collapsed {
  width: 0;
  min-width: 0;
  padding: 0;
  border: none;
  box-shadow: none;
  overflow: hidden;
}

.session-header-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}
.session-collapse-btn {
  padding: 4px;
  color: var(--text-secondary) !important;
}
.session-collapse-btn:hover {
  color: var(--accent) !important;
}

.session-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}
.session-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
  color: var(--text-primary);
  font-size: 15px;
}
.session-title i {
  color: var(--accent);
}
.new-session-btn {
  border-radius: 999px !important;
  padding: 4px 10px !important;
}

.session-list-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-top: 4px;
  overflow: hidden;
}
.session-list-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
  padding: 0 4px;
}
.session-list-title {
  font-size: 12px;
  color: var(--text-secondary);
}
.session-refresh-btn {
  padding: 0 !important;
  color: var(--text-secondary) !important;
}
.session-scroll {
  flex: 1;
  height: 100%;
}

.session-item {
  padding: 8px 10px;
  border-radius: 10px;
  cursor: pointer;
  margin-bottom: 4px;
  color: var(--text-secondary);
}
.session-item:hover {
  background: var(--hover-bg);
}
.session-item.active {
  background: var(--accent);
  color: #FFFFFF;
  box-shadow: 0 3px 10px var(--shadow-accent);
}
.session-item-title {
  font-size: 14px;
  font-weight: 500;
  color: inherit;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.session-item-meta {
  margin-top: 2px;
  font-size: 12px;
  color: var(--text-secondary);
}
.session-item.active .session-item-meta {
  color: rgba(255, 255, 255, 0.75);
}
.session-empty {
  margin-top: 12px;
  text-align: center;
  font-size: 12px;
  color: var(--text-secondary);
}

/* ===== 首次使用引导 ===== */
.onboarding-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}
.onboarding-card {
  background: var(--bg-secondary, #FFFFFF);
  border-radius: 24px;
  padding: 40px 32px 28px;
  max-width: 400px;
  width: 100%;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0,0,0,0.3);
}
.onboarding-step {
  margin-bottom: 24px;
}
.onboarding-icon {
  font-size: 56px;
  margin-bottom: 16px;
}
.onboarding-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary, #3D3229);
  margin: 0 0 10px;
}
.onboarding-desc {
  font-size: 17px;
  color: var(--text-secondary, #5D4E3C);
  line-height: 1.6;
  margin: 0;
}
.onboarding-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-bottom: 20px;
}
.onboarding-skip {
  padding: 12px 28px;
  border-radius: 20px;
  border: 1.5px solid var(--border, #F0E6DB);
  background: transparent;
  color: var(--text-secondary, #5D4E3C);
  font-size: 16px;
  cursor: pointer;
}
.onboarding-skip:hover {
  background: var(--hover-bg, #FFF5F0);
}
.onboarding-next {
  padding: 12px 32px;
  border-radius: 20px;
  border: none;
  background: var(--accent, #E8734A);
  color: #FFFFFF;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 12px var(--shadow-accent, rgba(232,115,74,0.3));
}
.onboarding-next:hover {
  background: var(--accent-hover, #D4623D);
  transform: translateY(-1px);
}
.onboarding-dots {
  display: flex;
  gap: 8px;
  justify-content: center;
}
.onboarding-dots span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--border, #F0E6DB);
  transition: all 0.3s;
}
.onboarding-dots span.active {
  background: var(--accent, #E8734A);
  width: 24px;
  border-radius: 4px;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}

/* ===== 响应式 ===== */
@media (max-width: 480px) {
  .elderly-chat-page {
    max-width: 100%;
  }
  .msg-bubble {
    max-width: 85%;
    padding: 12px 14px;
  }
  .topbar-title {
    font-size: 20px;
  }
  .toolbar-btn {
    width: 36px;
    height: 36px;
  }
  .elderly-session-sidebar {
    width: 200px;
    min-width: 200px;
  }
  .memory-panel {
    width: 280px;
  }
}

@media (max-width: 375px) {
  .elderly-session-sidebar {
    width: 0;
    min-width: 0;
    padding: 0;
    border: none;
    box-shadow: none;
    overflow: hidden;
  }
  .elderly-sidebar-toggle {
    display: none;
  }
  .memory-panel {
    width: 100%;
    right: 0;
    border-radius: 16px 16px 0 0;
    max-height: 60vh;
  }
  .quick-reply-btn {
    padding: 8px 12px;
    font-size: 14px;
  }
  .chat-input-area {
    flex-direction: column;
    gap: 8px;
  }
  .chat-input-actions {
    width: 100%;
    justify-content: space-around;
  }
}

/* ===== 覆盖 Element UI ===== */
.elderly-chat-page .el-message {
  font-size: 16px !important;
}
</style>
