<template>
  <div class="chat-page">
    <!-- 左侧收起时显示的展开按钮 -->
    <div class="left-sidebar-toggle" v-if="!leftSidebarOpen" @click="toggleLeftSidebar" title="展开对话列表">
      <i class="el-icon-d-arrow-right"></i>
    </div>
    <!-- 左侧会话侧边栏：新对话 + 历史对话 -->
    <div class="chat-session-sidebar" :class="{ collapsed: !leftSidebarOpen }">
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
          >
            新对话
          </el-button>
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
          >
          </el-button>
        </div>
        <el-scrollbar class="session-scroll">
          <div
            v-for="item in chatSessions"
            :key="item.id"
            :class="['session-item', { active: activeSessionId === item.id }]"
            @click="handleSelectSession(item)"
          >
            <div class="session-item-title" :title="item._displayTitle">
              {{ item._displayTitle }}
            </div>
            <div class="session-item-meta">
              <span class="session-item-time">{{ item._displayTime }}</span>
            </div>
          </div>
          <div v-if="!chatSessions.length && !sessionLoading" class="session-empty">
            暂无历史对话
          </div>
        </el-scrollbar>
      </div>
    </div>

    <!-- 中间聊天区域 + 右侧关联信息 -->
    <div class="chat-container">
      <!-- 聊天主区域 -->
      <div class="chat-main">
        <!-- 聊天消息区域 -->
        <div class="chat-messages" ref="messagesContainer">
        <!-- 欢迎消息 -->
        <div class="welcome-message">
          <div class="welcome-icon">
            <i class="el-icon-chat-dot-round"></i>
          </div>
          <h3>欢迎使用「忆路康」智护银龄认知辅助</h3>
          <p>我专注老年认知障碍与认知负荷，基于知识图谱与文献为你提供可溯源的照护与患者教育支持（结果仅供参考，请遵医嘱）。</p>
          <div class="quick-questions">
            <el-button size="small" v-for="(q, index) in quickQuestions" :key="index" @click="sendQuickQuestion(q)">
              {{ q }}
            </el-button>
          </div>
        </div>
        
        <!-- 消息列表 -->
        <div v-for="(message, index) in messages" :key="index" class="message-item">
          <div :class="['message-content', message.type === 'user' ? 'user-message' : 'system-message']">
            <div class="message-avatar">
              <i :class="message.type === 'user' ? 'el-icon-user' : 'el-icon-medal'"></i>
            </div>
            <div class="message-bubble">
              <div class="message-text" v-html="renderMessageContent(message)"></div>
              <div class="message-actions" v-if="message.type === 'system' && (message.content || message.patientEducation) && index > 0 && messages[index - 1].type === 'user'">
                <el-button size="mini" type="text" class="tweet-btn" @click="handleTweetVersion(index)" :loading="tweetLoadingIndex === index">
                  <i class="el-icon-chat-line-square"></i> 推文版
                </el-button>
                <el-button size="mini" type="text" class="read-aloud-btn" @click="handleReadAloudMessage(index)" :loading="chatTtsLoadingIndex === index">
                  <i class="el-icon-headset"></i> 朗读
                </el-button>
              </div>
              <div class="message-time">{{ formatTime(message.timestamp) }}</div>
            </div>
          </div>
        </div>
        
        <!-- 正在输入动画 -->
        <div v-if="isTyping" class="typing-indicator">
          <div class="message-content system-message">
            <div class="message-avatar">
              <i class="el-icon-medal"></i>
            </div>
            <div class="message-bubble">
              <TypingIndicator />
            </div>
          </div>
        </div>
      </div>
      <!-- 输入区域 -->
      <div class="chat-input">
        <div class="chat-input-body">
          <div class="chat-input-row">
            <el-input
              v-model="inputMessage"
              type="textarea"
              :rows="1"
              :placeholder="chatModePlaceholder"
              @keyup.enter.native="sendMessage"
              resize="none"
            ></el-input>
            <div class="chat-input-btns">
              <el-tooltip content="语音输入" placement="top">
                <span
                  class="input-extra-btn"
                  :class="{ recording: isRecording }"
                  @click="toggleRecord"
                >
                  <i class="el-icon-microphone"></i>
                </span>
              </el-tooltip>
              <el-tooltip content="图片解读" placement="top">
                <label class="input-extra-btn" for="chat-image-input">
                  <i class="el-icon-picture-outline"></i>
                </label>
              </el-tooltip>
              <input
                id="chat-image-input"
                ref="imageInput"
                type="file"
                accept="image/*"
                style="position:absolute;width:0;height:0;opacity:0;pointer-events:none"
                @change="handleImageUpload"
              />
            </div>
          </div>
          <div class="chat-input-options">
            <div class="model-selector" v-if="availableModels.length > 0">
              <span class="mode-label">模型：</span>
              <el-select
                v-model="selectedModel"
                size="small"
                placeholder="选择模型"
                class="model-select"
                @change="onModelChange"
              >
                <el-option
                  v-for="m in availableModels"
                  :key="m.id"
                  :label="m.configured ? m.name : (m.name + ' (未配置)')"
                  :value="m.id"
                  :class="{ 'model-option-unconfigured': !m.configured }"
                />
              </el-select>
            </div>
            <div class="mode-switch">
              <span class="mode-label">模式：</span>
              <el-radio-group v-model="chatMode" size="small" class="mode-radio">
                <el-radio-button label="normal">普通问答</el-radio-button>
                <el-radio-button label="patient_education">
                  <i class="el-icon-document"></i> 患者教育
                </el-radio-button>
                <el-radio-button label="science_tweet">
                  <i class="el-icon-chat-line-square"></i> 科普推文
                </el-radio-button>
              </el-radio-group>
            </div>
            <el-checkbox v-model="enableDeepThink" size="small" class="stream-checkbox" v-if="chatMode === 'normal'">深度思考</el-checkbox>
            <el-checkbox v-model="enableConciseAnswer" size="small" class="stream-checkbox" v-if="chatMode === 'normal'">简洁回答（三步以内）</el-checkbox>
          </div>
        </div>
        <el-button 
          type="primary" 
          class="app-btn app-btn-primary chat-send-btn" 
          @click="sendMessage" 
          :disabled="!inputMessage.trim() || isTyping"
          :loading="isTyping"
        >
          <i class="el-icon-send" v-if="!isTyping"></i>
          <span v-if="!isTyping">{{ chatModeButtonText }}</span>
          <span v-else>发送中...</span>
        </el-button>
      </div>
      </div>
      
      <!-- 右侧关联实体/图谱展示 -->
      <div class="chat-sidebar" :class="{ collapsed: !sidebarOpen }">
        <div class="sidebar-header">
        <h3>关联信息</h3>
        <el-button size="small" type="text" @click="toggleSidebar">
          <i class="el-icon-close"></i>
        </el-button>
      </div>
      
        <div class="sidebar-content">
        <div v-if="sourcesGraph.length > 0" class="sources-from-graph">
          <h4>来自图谱</h4>
          <div class="sources-list">
            <div
              v-for="(s, idx) in sourcesGraph"
              :key="'g'+idx"
              class="source-item source-item--graph"
              @click="goToSource(s)"
            >
              {{ (s.content || '').slice(0, 72) }}{{ (s.content || '').length > 72 ? '…' : '' }}
            </div>
          </div>
        </div>
        <div v-if="sourcesDoc.length > 0" class="sources-from-doc">
          <h4>来自文献</h4>
          <div class="sources-list">
            <div
              v-for="(s, idx) in sourcesDoc"
              :key="'d'+idx"
              class="source-item source-item--doc"
              @click="goToSource(s)"
            >
              {{ (s.content || '').slice(0, 72) }}{{ (s.content || '').length > 72 ? '…' : '' }}
            </div>
          </div>
        </div>
        <div v-if="sourcesGraph.length === 0 && sourcesDoc.length === 0" class="empty-sidebar">
          <el-empty description="暂无关联信息"></el-empty>
        </div>

        <!-- 认知负荷简易问卷（M11）：一次问答完成后弹出 -->
        <CognitiveLoadQuestionnaire
          :visible.sync="showCognitiveQuestionnaire"
          :task-id="currentChatTaskId"
          :session-id="sessionId || ''"
          source="chat"
        />

        <!-- 深度思考：检索与推理折叠面板 -->
        <div v-if="analysisTrace && enableDeepThink" class="analysis-panel">
          <el-collapse v-model="analysisActiveNames">
            <el-collapse-item name="deep">
              <template slot="title">
                <span class="analysis-title">深度思考 · 推理过程</span>
              </template>
              <div class="analysis-section" v-if="analysisTrace.retrievals && analysisTrace.retrievals.length">
                <h5 class="analysis-subtitle">本次用到的检索</h5>
                <ul class="analysis-list">
                  <li v-for="(r, idx) in analysisTrace.retrievals" :key="idx" class="analysis-item">
                    <span class="analysis-tag" :class="'analysis-tag-' + (r.type || 'tool')">
                      {{ r.type === 'graph' ? '图谱' : r.type === 'doc' ? '文献' : r.type === 'history' ? '历史会话' : '工具' }}
                    </span>
                    <span class="analysis-text">{{ r.snippet }}</span>
                  </li>
                </ul>
              </div>
              <div class="analysis-section" v-if="analysisTrace.reasoning">
                <h5 class="analysis-subtitle">推理步骤摘要</h5>
                <p class="analysis-reasoning">
                  {{ analysisTrace.reasoning }}
                </p>
              </div>
              <div
                v-if="(!analysisTrace.retrievals || !analysisTrace.retrievals.length) && !analysisTrace.reasoning"
                class="analysis-empty"
              >
                暂无可展示的分析过程。
              </div>
            </el-collapse-item>
          </el-collapse>
        </div>
        </div>
      </div>
      
      <!-- 侧边栏控制按钮 -->
      <div class="sidebar-toggle" @click="toggleSidebar" v-if="!sidebarOpen">
        <i class="el-icon-menu"></i>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import TypingIndicator from './TypingIndicator.vue'
import dayjs from 'dayjs'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import { sendMessageToBackendStream, generateScienceTweet, getAvailableModels } from '../../api/chat'
import { transcribeSTT, interpretOCR } from '../../api/multimodal'
import { saveHistoryRecord, HISTORY_TYPES, getHistoryByType } from '../../utils/historyUtils'
import storage from '../../utils/storage'
import { recordEvent, COGNITIVE_EVENT_TYPES, COGNITIVE_SOURCE } from '../../utils/cognitiveLoad'
import CognitiveLoadQuestionnaire from '../assessment/CognitiveLoadQuestionnaire.vue'
import { synthesizeTTS } from '../../api/multimodal'

marked.setOptions({
  breaks: true,
  gfm: true
})

export default {
  name: 'ChatView',
  components: {
    TypingIndicator,
    CognitiveLoadQuestionnaire
  },
  data() {
    return {
      inputMessage: '',
      isTyping: false,
      enableDeepThink: false,
      enableConciseAnswer: false, // M9：简洁回答（三步以内简要版）
      chatMode: 'normal', // 'normal' | 'patient_education' | 'science_tweet'
      sidebarOpen: true,
      tweetLoadingIndex: -1,
      isRecording: false,
      mediaRecorder: null,
      recordChunks: [],
      recordStartTime: null,
      leftSidebarOpen: true,
      analysisActiveNames: ['deep'],
       // 左侧「历史对话」列表
      chatSessions: [],
      sessionLoading: false,
      activeSessionId: null,
      // M10/M11 认知负荷：当前问答任务 id、开始时间、问卷弹窗
      currentChatTaskId: null,
      chatTaskStartTime: null,
      showCognitiveQuestionnaire: false,
      chatTtsLoadingIndex: null,
      chatTtsAudio: null,
      chatTtsAudioUrl: null,
      quickQuestions: [
        '什么是轻度认知障碍？',
        '认知障碍老人日常要注意什么？',
        '如何降低老人使用产品时的认知负荷？',
        '记忆减退老人需要做哪些检查？'
      ],
      availableModels: [],
      selectedModel: ''
    }
  },
  computed: {
    ...mapState('chat', ['messages', 'sessionId', 'sourcesGraph', 'sourcesDoc', 'lastQuestionForSources', 'analysisTrace']),
    ...mapState('user', ['isLoggedIn']),
    chatModePlaceholder() {
      if (this.chatMode === 'patient_education') return '输入主题，如：轻度认知障碍老人居家注意事项'
      if (this.chatMode === 'science_tweet') return '输入主题，如：轻度认知障碍老人居家注意事项'
      return '请输入您的问题...'
    },
    chatModeButtonText() {
      if (this.chatMode === 'patient_education') return '生成患者教育'
      if (this.chatMode === 'science_tweet') return '生成科普推文'
      return '发送'
    }
  },
  mounted() {
    if (!this.sessionId) {
      this.$store.commit('chat/SET_SESSION_ID', `s-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`)
    }
    this.loadChatSessions()
    this.loadAvailableModels()
    window.addEventListener('historyUpdated', this.onHistoryUpdated)
    this.applyQuestionFromRoute()
    this.applyModeFromRoute(this.$route)
  },
  watch: {
    '$route'(to) {
        if (to.path === '/chat' && (to.query.question || to.query.mode)) {
        this.applyQuestionFromRoute()
        this.applyModeFromRoute(to)
      }
    }
  },
  beforeDestroy() {
    window.removeEventListener('historyUpdated', this.onHistoryUpdated)
    if (this.chatTtsAudio && !this.chatTtsAudio.paused) this.chatTtsAudio.pause()
    if (this.chatTtsAudioUrl) URL.revokeObjectURL(this.chatTtsAudioUrl)
  },
  methods: {
    ensureLoggedIn() {
      if (this.isLoggedIn) return true
      this.$message.warning('请先登录后再使用问答功能')
      this.$router.push({ path: '/login', query: { redirect: this.$route.fullPath } })
      return false
    },
    // 加载问答类型的历史记录，用于左侧列表
    async loadChatSessions() {
      this.sessionLoading = true
      try {
        const list = await getHistoryByType(HISTORY_TYPES.CHAT)
        // 简单按时间倒序
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
            _displayTitle: q.length > 18 ? `${q.slice(0, 18)}…` : q,
            _displayTime: t ? dayjs(t).format('MM-DD HH:mm') : ''
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

    async loadAvailableModels() {
      try {
        const res = await getAvailableModels()
        const data = res.data || res
        this.availableModels = data.data || []
        const defaultId = data.default || (() => {
          const configured = this.availableModels.find(m => m.configured)
          return (configured && configured.id) || (this.availableModels[0] && this.availableModels[0].id)
        })()
        const saved = storage.get('chat_llm_model')
        this.selectedModel = (saved && this.availableModels.some(m => m.id === saved))
          ? saved
          : (defaultId || '')
      } catch (e) {
        console.error('加载模型列表失败', e)
      }
    },

    onModelChange(val) {
      if (val) {
        storage.set('chat_llm_model', val)
        const m = this.availableModels.find(x => x.id === val)
        if (m && !m.configured) {
          this.$alert('未配置该模型，请在服务端 .env 中配置对应 API Key 后刷新页面。', '未配置该模型', {
            confirmButtonText: '知道了',
            type: 'warning'
          })
        }
      }
    },

    handleNewConversation() {
      if (this.messages && this.messages.length > 0) {
        this.$confirm('开始新对话将清空当前聊天内容，确定继续吗？', '新对话', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'info'
        }).then(() => {
          this.doNewConversation()
        }).catch(() => {})
      } else {
        this.doNewConversation()
      }
    },
    doNewConversation() {
      this.$store.commit('chat/RESET_CHAT')
      this.$store.commit('chat/SET_SESSION_ID', `s-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`)
      this.inputMessage = ''
      this.activeSessionId = null
      this.scrollToBottom()
    },

    // 从历史记录中恢复一轮问答，方便用户回看
    handleSelectSession(item) {
      if (!item) return
      this.activeSessionId = item.id
      const content = item.content || {}
      const question = content.question
      const answer = content.answer
      // 用当前会话展示这轮问答，不重新触发后端
      this.$store.commit('chat/RESET_CHAT')
      this.$store.commit('chat/SET_SESSION_ID', `s-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`)
      const now = Date.now()
      if (question) {
        this.$store.commit('chat/ADD_MESSAGE', {
          type: 'user',
          content: question,
          timestamp: now - 1000
        })
      }
      if (answer) {
        this.$store.commit('chat/ADD_MESSAGE', {
          type: 'system',
          content: answer,
          timestamp: now
        })
      }
      this.scrollToBottom()
    },
    
    // 发送消息
    sendMessage() {
      if (!this.ensureLoggedIn()) return
      if (!this.inputMessage.trim()) return
      if (this.selectedModel) {
        const m = this.availableModels.find(x => x.id === this.selectedModel)
        if (m && !m.configured) {
          this.$alert('未配置该模型，请在服务端 .env 中配置对应 API Key。', '未配置该模型', {
            confirmButtonText: '知道了',
            type: 'warning'
          })
          return
        }
      }
      // 添加用户消息
      const userMessage = {
        type: 'user',
        content: this.inputMessage.trim(),
        timestamp: Date.now()
      }
      this.$store.commit('chat/ADD_MESSAGE', userMessage)
      
      // 清空输入框
      this.inputMessage = ''
      
      // 滚动到底部
      this.scrollToBottom()
      
      // 调用真实后端API
      this.sendMessageToBackend(userMessage.content)
    },
    
    // 发送快速问题
    sendQuickQuestion(question) {
      if (!this.ensureLoggedIn()) return
      this.inputMessage = question
      this.sendMessage()
    },
    // 从路由 query 填入并发送问题（图谱页「问医生」跳转过来时）
    applyQuestionFromRoute() {
      const q = this.$route && this.$route.query && this.$route.query.question
      if (!q || !String(q).trim()) return
      const autoSend = this.$route.query.autoSend === '1'
      this.$nextTick(() => {
        this.inputMessage = String(q).trim()
        if (autoSend) {
          if (this.ensureLoggedIn()) {
            this.sendMessage()
          }
          this.$router.replace({ path: '/chat', query: {} })
        }
      })
    },
    // 从路由 query 设置模式（如 /chat?mode=science_tweet）
    applyModeFromRoute(route) {
      const mode = route && route.query && route.query.mode
      if (mode === 'science_tweet' || mode === 'patient_education') {
        this.chatMode = mode
      }
    },
    
    // 调用后端API发送消息（Agent 返回 answer、sources）。6.1 session_id 启用多轮；现在默认使用流式输出
    sendMessageToBackend(question) {
      this.currentChatTaskId = 'chat_' + Date.now()
      this.chatTaskStartTime = Date.now()
      recordEvent(COGNITIVE_EVENT_TYPES.TASK_START, {
        task_id: this.currentChatTaskId,
        session_id: this.sessionId || null,
        source: COGNITIVE_SOURCE.CHAT,
        question: question.slice(0, 200)
      })
      this.$store.commit('chat/SET_SOURCES', { sourcesGraph: [], sourcesDoc: [] })
      const sys = { type: 'system', content: '', timestamp: Date.now() }
      this.$store.commit('chat/ADD_MESSAGE', sys)
      this.isTyping = true
      const idx = this.messages.length - 1
      this.$store.commit('chat/SET_ANALYSIS_TRACE', null)
      const intent = this.chatMode === 'patient_education' ? 'patient_education' : this.chatMode === 'science_tweet' ? 'science_tweet' : undefined
      sendMessageToBackendStream(question, this.sessionId, {
        deepThink: this.enableDeepThink,
        intent,
        model: this.selectedModel || undefined,
        answerStyle: this.enableConciseAnswer ? 'concise' : undefined,
        onChunk: (d) => {
          this.$store.commit('chat/APPEND_MESSAGE_CONTENT', { index: idx, chunk: d })
        },
        onDone: ({ answer, sources, trace, patient_education, science_tweet }) => {
          if (this.currentChatTaskId && this.chatTaskStartTime) {
            recordEvent(COGNITIVE_EVENT_TYPES.TASK_END, {
              task_id: this.currentChatTaskId,
              session_id: this.sessionId || null,
              source: COGNITIVE_SOURCE.CHAT,
              duration_ms: Date.now() - this.chatTaskStartTime
            })
            this.showCognitiveQuestionnaire = true
          }
          const m = this.messages[idx]
          if (m && m.type === 'system') {
            this.$store.commit('chat/UPDATE_MESSAGE_CONTENT', {
              index: idx,
              content: answer || '未获取到有效回答',
              patientEducation: patient_education || undefined,
              scienceTweet: science_tweet || undefined
            })
          }
          this.$store.commit('chat/SET_SOURCES', {
            sourcesGraph: (sources || []).filter(s => s && ['graph', 'entity'].includes(s.type)),
            sourcesDoc: (sources || []).filter(s => s && s.type === 'doc'),
            lastQuestionForSources: question
          })
          if (trace) {
            this.$store.commit('chat/SET_ANALYSIS_TRACE', trace)
          }
          const finalContent = (this.messages[idx] && this.messages[idx].content) || answer
          saveHistoryRecord(HISTORY_TYPES.CHAT, { question, answer: finalContent, messages: [this.messages[idx - 1], this.messages[idx]] })
          this.isTyping = false
          this.scrollToBottom()
        },
        onError: (e) => {
          this.$store.commit('chat/UPDATE_MESSAGE_CONTENT', { index: idx, content: `请求失败: ${e?.message || '未知错误'}` })
          this.isTyping = false
          this.scrollToBottom()
        }
      })
      this.scrollToBottom()
    },
    
    // 5.3 来源跳转：文献→文献检索，图/实体→图谱或实体搜索
    goToSource(s) {
      if (!s) return
      if (s.type === 'doc') {
        this.$router.push({ path: '/knowledge-base', query: this.lastQuestionForSources ? { q: this.lastQuestionForSources } : {} })
      } else if (s.type === 'entity') {
        this.$router.push({ path: '/search', query: this.lastQuestionForSources ? { keyword: this.lastQuestionForSources } : {} })
      } else {
        this.$router.push({ path: '/graph' })
      }
    },
    
    // 格式化时间
    formatTime(timestamp) {
      return dayjs(timestamp).format('HH:mm')
    },

    renderMessageContent(message) {
      const pe = message && message.patientEducation
      if (pe && pe.title) {
        return this.renderPatientEducation(pe)
      }

      const text = (message && message.content) || ''
      if (!text) return ''

      const rawHtml = marked.parse(text)
      return DOMPurify.sanitize(rawHtml, {
        ADD_TAGS: ['iframe'],
        ADD_ATTR: ['target'],
        ALLOW_DATA_ATTR: false
      })
    },

    // 患者教育结构化展示：标题 + 分节 + 温馨提示
    renderPatientEducation(pe) {
      const escapeHtml = (s) =>
        String(s || '')
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
      let html = `<div class="patient-edu-block"><h4 class="patient-edu-title">${escapeHtml(pe.title)}</h4>`
      for (const sec of pe.sections || []) {
        const h = escapeHtml(sec.heading || '')
        const c = escapeHtml(sec.content || '').replace(/\n/g, '<br>')
        html += `<div class="patient-edu-section"><h5 class="patient-edu-heading">${h}</h5><div class="patient-edu-content">${c}</div></div>`
      }
      if (pe.summary) {
        html += `<div class="patient-edu-summary">${escapeHtml(pe.summary)}</div>`
      }
      html += '</div>'
      return html
    },
    
    // 滚动到底部
    scrollToBottom() {
      setTimeout(() => {
        if (this.$refs.messagesContainer) {
          this.$refs.messagesContainer.scrollTop = this.$refs.messagesContainer.scrollHeight
        }
      }, 100)
    },
    
    // 切换侧边栏
    toggleSidebar() {
      this.sidebarOpen = !this.sidebarOpen
    },
    toggleLeftSidebar() {
      this.leftSidebarOpen = !this.leftSidebarOpen
    },

    // 语音输入
    toggleRecord() {
      if (!this.ensureLoggedIn()) return
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
        this.recordStartTime = Date.now()
        mr.ondataavailable = (e) => {
          if (e.data.size) this.recordChunks.push(e.data)
        }
        mr.onstop = () => {
          stream.getTracks().forEach(t => t.stop())
          const durationSec = this.recordStartTime ? (Date.now() - this.recordStartTime) / 1000 : 0
          this.finishRecord(durationSec)
        }
        mr.start()
        this.isRecording = true
        this.$message.success('开始录音，再次点击结束')
      } catch (e) {
        this.$message.error('无法访问麦克风，请检查权限')
      }
    },

    async stopRecord() {
      if (!this.mediaRecorder || !this.isRecording) return
      this.mediaRecorder.stop()
      this.isRecording = false
    },

    async finishRecord(durationSec) {
      this.recordStartTime = null
      const chunks = this.recordChunks || []
      this.recordChunks = []
      this.mediaRecorder = null
      if (durationSec < 1.5 || !chunks.length) {
        this.$message.warning('录音太短，请至少说 2 秒再试一次')
        return
      }
      const blob = new Blob(chunks, { type: 'audio/webm' })
      if (!blob || blob.size === 0) {
        this.$message.error('录音数据为空，请重试')
        return
      }
      const file = new File([blob], 'recording.webm', { type: 'audio/webm' })
      this.isTyping = true
      try {
        const res = await transcribeSTT(file)
        const text = (res.data && res.data.text) || res.text || ''
        if (text) {
          this.inputMessage = (this.inputMessage ? this.inputMessage + ' ' : '') + text
          this.$message.success('识别完成')
        } else {
          this.$message.warning('未能识别出文字')
        }
      } catch (e) {
        this.$message.error(e?.message || '语音识别失败')
      } finally {
        this.isTyping = false
      }
    },

    // 图片解读
    async handleImageUpload(e) {
      if (!this.ensureLoggedIn()) return
      const file = e.target.files && e.target.files[0]
      if (e.target) e.target.value = ''
      if (!file || !file.type.startsWith('image/')) return
      this.isTyping = true
      const sysIdx = this.messages.length
      this.$store.commit('chat/ADD_MESSAGE', {
        type: 'user',
        content: `[图片解读] ${file.name}`,
        timestamp: Date.now() - 500
      })
      this.$store.commit('chat/ADD_MESSAGE', {
        type: 'system',
        content: '正在识别并解读图片...',
        timestamp: Date.now()
      })
      try {
        const res = await interpretOCR(file)
        const data = res.data || res
        const interp = data.interpretation || ''
        const ocrText = data.text || ''
        let answer = interp
        if (ocrText && !interp.includes(ocrText)) {
          answer = `【识别文字】\n${ocrText}\n\n【通俗解读】\n${interp}`
        }
        this.$store.commit('chat/UPDATE_MESSAGE_CONTENT', {
          index: sysIdx + 1,
          content: answer || '未能生成解读'
        })
        saveHistoryRecord(HISTORY_TYPES.CHAT, {
          question: `[图片解读] ${file.name}`,
          answer,
          messages: [this.messages[sysIdx], this.messages[sysIdx + 1]]
        })
      } catch (err) {
        this.$store.commit('chat/UPDATE_MESSAGE_CONTENT', {
          index: sysIdx + 1,
          content: `图片解读失败: ${err?.message || '未知错误'}`
        })
      } finally {
        this.isTyping = false
        this.scrollToBottom()
      }
    },

    // 「推文版」按钮：将当前问答转化为科普推文
    getMessagePlainText(message) {
      if (!message) return ''
      const pe = message.patientEducation
      if (pe && pe.title) {
        let t = pe.title + '\n\n'
        ;(pe.sections || []).forEach(s => { t += (s.heading || '') + '\n' + (s.content || '') + '\n\n' })
        if (pe.summary) t += '温馨提示：' + pe.summary
        return t.replace(/\n{3,}/g, '\n\n').trim()
      }
      const c = (message.content || '').trim()
      return c.replace(/<[^>]+>/g, '').trim() || c
    },

    async handleReadAloudMessage(msgIndex) {
      if (msgIndex < 0 || !this.messages[msgIndex]) return
      const text = this.getMessagePlainText(this.messages[msgIndex])
      if (!text) {
        this.$message.warning('该条消息无文字可朗读')
        return
      }
      if (this.chatTtsAudio && !this.chatTtsAudio.paused) {
        this.chatTtsAudio.pause()
        this.chatTtsAudio = null
        if (this.chatTtsAudioUrl) URL.revokeObjectURL(this.chatTtsAudioUrl)
        this.chatTtsAudioUrl = null
      }
      this.chatTtsLoadingIndex = msgIndex
      try {
        const blob = await synthesizeTTS({ text: text.slice(0, 3000) })
        const url = URL.createObjectURL(blob)
        this.chatTtsAudioUrl = url
        const audio = new Audio(url)
        this.chatTtsAudio = audio
        audio.onended = () => {
          this.chatTtsLoadingIndex = null
          if (this.chatTtsAudioUrl) URL.revokeObjectURL(this.chatTtsAudioUrl)
          this.chatTtsAudioUrl = null
          this.chatTtsAudio = null
        }
        audio.onerror = () => {
          this.chatTtsLoadingIndex = null
          if (this.chatTtsAudioUrl) URL.revokeObjectURL(this.chatTtsAudioUrl)
          this.chatTtsAudioUrl = null
          this.chatTtsAudio = null
          this.$message.error('播放失败')
        }
        await audio.play()
        this.$message.success('开始朗读')
      } catch (e) {
        this.chatTtsLoadingIndex = null
        this.$message.error(e?.message || '朗读失败')
      }
    },

    async handleTweetVersion(msgIndex) {
      if (!this.ensureLoggedIn()) return
      if (msgIndex <= 0 || !this.messages[msgIndex] || !this.messages[msgIndex - 1]) return
      const question = this.messages[msgIndex - 1].content || ''
      const answer = this.messages[msgIndex].content || ''
      if (!question.trim()) return
      this.tweetLoadingIndex = msgIndex
      try {
        const res = await generateScienceTweet({
          topic: question,
          source_content: answer,
          word_limit: 140,
          style: '轻松'
        })
        const raw = res.data || {}
        const data = raw.data || raw
        const tweets = data.tweets || []
        const hashtags = data.hashtags || []
        let tweetText = ''
        if (tweets.length) {
          tweetText = tweets.map((t, i) => `推文 ${i + 1}：${t}`).join('\n')
          if (hashtags.length) tweetText += `\n\n话题标签建议：${hashtags.join(' ')}`
        } else {
          tweetText = '未生成有效推文'
        }
        this.$store.commit('chat/ADD_MESSAGE', {
          type: 'system',
          content: `【推文版】\n\n${tweetText}`,
          timestamp: Date.now()
        })
        this.scrollToBottom()
      } catch (e) {
        this.$message.error(e?.message || '推文生成失败')
      } finally {
        this.tweetLoadingIndex = -1
      }
    }
  }
}
</script>

<style>
.chat-container {
  display: flex;
  flex: 1;
  height: calc(100vh - 140px);
  gap: 20px;
  background-color: rgba(10, 14, 39, 0.8);
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 8px 32px rgba(0, 255, 255, 0.1);
  border: 1px solid rgba(0, 245, 212, 0.2);
  position: relative;
  overflow: hidden;
}

/* 整体布局：左侧对话列表 + 中间聊天区 */
.chat-page {
  display: flex;
  height: calc(100vh - 140px);
  gap: 16px;
}

/* 左侧收起时显示的展开条 */
.left-sidebar-toggle {
  width: 28px;
  min-width: 28px;
  background: linear-gradient(145deg, rgba(6, 12, 33, 0.96), rgba(9, 16, 52, 0.96));
  border-radius: 12px;
  border: 1px solid rgba(0, 245, 212, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #00f5d4;
  transition: all 0.2s ease;
  flex-shrink: 0;
}
.left-sidebar-toggle:hover {
  background: rgba(0, 245, 212, 0.15);
  color: #fff;
}

.chat-session-sidebar {
  width: 260px;
  min-width: 260px;
  background: linear-gradient(145deg, rgba(6, 12, 33, 0.96), rgba(9, 16, 52, 0.96));
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 255, 255, 0.15);
  padding: 16px 12px;
  display: flex;
  flex-direction: column;
  border: 1px solid rgba(0, 245, 212, 0.3);
  height: 100%;
  overflow: hidden;
  transition: width 0.25s ease, min-width 0.25s ease, padding 0.25s ease;
  flex-shrink: 0;
}
.chat-session-sidebar.collapsed {
  width: 0;
  min-width: 0;
  padding: 0;
  border: none;
  box-shadow: none;
}
.session-header-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}
.session-collapse-btn {
  padding: 4px;
  color: rgba(148, 163, 184, 0.9);
}
.session-collapse-btn:hover {
  color: #00f5d4;
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
  color: #e5f6ff;
}

.session-title i {
  color: #00f5d4;
}

.new-session-btn {
  border-radius: 999px;
  padding: 4px 10px;
}

.session-list-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-top: 4px;
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
  color: rgba(148, 163, 184, 0.9);
}

.session-refresh-btn {
  padding: 0;
}

.session-scroll {
  flex: 1;
  height: 100%;
}

.session-item {
  padding: 8px 10px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: 4px;
  color: rgba(209, 213, 219, 0.95);
}

.session-item:hover {
  background: radial-gradient(circle at left, rgba(0, 245, 212, 0.2), transparent);
}

.session-item.active {
  background: linear-gradient(135deg, #00f5d4, #00bbf9);
  color: #020617;
  box-shadow: 0 4px 14px rgba(0, 255, 255, 0.45);
}

.session-item-title {
  font-size: 13px;
  font-weight: 500;
  color: inherit;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.session-item-meta {
  margin-top: 2px;
  font-size: 11px;
  color: rgba(148, 163, 184, 0.9);
}

.session-item.active .session-item-meta {
  color: rgba(226, 232, 240, 0.9);
}

.session-empty {
  margin-top: 12px;
  text-align: center;
  font-size: 12px;
  color: rgba(148, 163, 184, 0.9);
}

/* 聊天主区域 */
.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
  background-color: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  padding: 20px;
  border: 1px solid rgba(0, 245, 212, 0.1);
}

/* 聊天消息区域 */
.chat-messages {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-right: 10px;
}

/* 欢迎消息 */
.welcome-message {
  text-align: center;
  padding: 40px 20px;
  background: linear-gradient(135deg, rgba(0, 245, 212, 0.1), rgba(0, 187, 249, 0.1));
  border-radius: 16px;
  border: 1px solid rgba(0, 245, 212, 0.2);
  margin-bottom: 20px;
}

.welcome-icon {
  width: 60px;
  height: 60px;
  /* 去掉蓝紫渐变，统一为青蓝主色光圈 */
  background: radial-gradient(circle at 30% 20%, #00f5d4, #00bbf9);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  margin: 0 auto 20px;
  box-shadow: 0 0 20px rgba(0, 245, 212, 0.5);
}

.welcome-message h3 {
  color: #ffffff;
  margin-bottom: 10px;
}

.welcome-message p {
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 20px;
  line-height: 1.6;
}

.quick-questions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
}

.quick-questions .el-button {
  background-color: rgba(255, 255, 255, 0.1);
  color: #00f5d4;
  border: 1px solid rgba(0, 245, 212, 0.3);
  transition: all 0.3s ease;
}

.quick-questions .el-button:hover {
  background-color: rgba(0, 245, 212, 0.1);
  box-shadow: 0 4px 12px rgba(0, 255, 255, 0.3);
  transform: translateY(-2px);
}

/* 消息项 */
.message-item {
  animation: messageSlideUp 0.3s ease-out;
}

@keyframes messageSlideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.message-content {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

/* 用户消息 */
.user-message {
  flex-direction: row-reverse;
}

.user-message .message-avatar {
  /* 去掉蓝紫渐变，统一为清爽的青色圆形头像底 */
  background: #00f5d4;
}

.user-message .message-bubble {
  background: linear-gradient(135deg, rgba(0, 245, 212, 0.3), rgba(0, 187, 249, 0.3));
  color: #ffffff;
  border-bottom-right-radius: 4px;
  border: 1px solid rgba(0, 245, 212, 0.4);
}

/* 系统消息 */
.system-message .message-avatar {
  background: linear-gradient(135deg, rgba(0, 187, 249, 1), rgba(0, 245, 212, 1));
}

.system-message .message-bubble {
  background-color: rgba(255, 255, 255, 0.1);
  color: #ffffff;
  border-bottom-left-radius: 4px;
}

/* 消息头像 */
.message-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  box-shadow: 0 2px 8px rgba(0, 255, 255, 0.3);
  flex-shrink: 0;
}

/* 消息气泡 */
.message-bubble {
  max-width: 70%;
  padding: 12px 16px;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  position: relative;
}

.message-text {
  line-height: 1.6;
  margin-bottom: 8px;
  word-break: break-word;
}

/* ===== Markdown typography inside message bubbles ===== */
.message-text h1,
.message-text h2,
.message-text h3,
.message-text h4,
.message-text h5,
.message-text h6 {
  margin: 14px 0 8px;
  font-weight: 700;
  line-height: 1.35;
  color: #fff;
}
.message-text h1 { font-size: 1.35em; }
.message-text h2 { font-size: 1.2em; color: #00f5d4; }
.message-text h3 { font-size: 1.1em; color: rgba(0,245,212,0.85); }
.message-text h4,
.message-text h5,
.message-text h6 { font-size: 1em; }
.message-text h1:first-child,
.message-text h2:first-child,
.message-text h3:first-child { margin-top: 0; }

.message-text p {
  margin: 0 0 8px;
  line-height: 1.7;
}
.message-text p:last-child { margin-bottom: 0; }

.message-text strong { color: #00f5d4; font-weight: 600; }
.message-text em { color: rgba(255,255,255,0.85); font-style: italic; }

.message-text ul,
.message-text ol {
  margin: 4px 0 10px;
  padding-left: 22px;
}
.message-text li {
  margin: 3px 0;
  line-height: 1.6;
}
.message-text li::marker { color: #00f5d4; }

.message-text blockquote {
  margin: 8px 0;
  padding: 8px 14px;
  border-left: 3px solid #00f5d4;
  background: rgba(0,245,212,0.06);
  border-radius: 0 8px 8px 0;
  color: rgba(255,255,255,0.85);
}
.message-text blockquote p { margin-bottom: 4px; }

.message-text code {
  background: rgba(0,245,212,0.1);
  color: #00f5d4;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.9em;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
}

.message-text pre {
  margin: 8px 0;
  padding: 12px 14px;
  background: rgba(0,0,0,0.35);
  border: 1px solid rgba(0,245,212,0.15);
  border-radius: 8px;
  overflow-x: auto;
}
.message-text pre code {
  background: transparent;
  color: rgba(255,255,255,0.9);
  padding: 0;
  font-size: 0.85em;
  line-height: 1.55;
}

.message-text table {
  width: 100%;
  border-collapse: collapse;
  margin: 8px 0;
  font-size: 0.9em;
}
.message-text th,
.message-text td {
  padding: 6px 10px;
  border: 1px solid rgba(255,255,255,0.12);
  text-align: left;
}
.message-text th {
  background: rgba(0,245,212,0.1);
  color: #00f5d4;
  font-weight: 600;
}
.message-text tr:nth-child(even) td {
  background: rgba(255,255,255,0.02);
}

.message-text hr {
  border: none;
  border-top: 1px solid rgba(255,255,255,0.1);
  margin: 12px 0;
}

.message-text a {
  color: #00bbf9;
  text-decoration: underline;
  text-decoration-color: rgba(0,187,249,0.4);
  transition: color 0.2s;
}
.message-text a:hover {
  color: #00f5d4;
}

.message-text img {
  max-width: 100%;
  border-radius: 8px;
  margin: 6px 0;
}

.message-actions {
  margin-top: 8px;
  margin-bottom: 4px;
}
.tweet-btn {
  color: #00bbf9 !important;
  font-size: 12px;
  padding: 2px 8px;
}
.tweet-btn:hover {
  color: #00f5d4 !important;
}
.read-aloud-btn {
  color: #00bbf9 !important;
  font-size: 12px;
  padding: 2px 8px;
}
.read-aloud-btn:hover {
  color: #00f5d4 !important;
}

.message-time {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  text-align: right;
}

/* 正在输入动画 */
.typing-indicator {
  margin-bottom: 16px;
}

/* 聊天输入区域 */
.chat-input {
  display: flex;
  gap: 12px;
  align-items: flex-end;
  padding: 16px;
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  border: 1px solid rgba(0, 245, 212, 0.2);
}

.chat-input-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 0;
}
.chat-input-row {
  display: flex;
  align-items: flex-end;
  gap: 8px;
}
.chat-input-row .el-input {
  flex: 1;
}
.chat-input-btns {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
}
.input-extra-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.7);
  padding: 8px 10px;
  cursor: pointer;
  border-radius: 6px;
  transition: color 0.2s, background 0.2s;
  user-select: none;
}
.input-extra-btn:hover {
  color: #00f5d4;
  background: rgba(0, 245, 212, 0.1);
}
.input-extra-btn.recording {
  color: #ef4444 !important;
  animation: recordPulse 1s ease-in-out infinite;
}
@keyframes recordPulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.chat-input .el-input {
  flex: 1;
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  border: 1px solid rgba(0, 245, 212, 0.3);
}

.chat-input .el-input__inner {
  background-color: transparent;
  color: #ffffff;
  border: none;
  resize: none;
}

.chat-input .el-input__inner:focus {
  box-shadow: 0 0 0 2px rgba(0, 255, 255, 0.3);
}

/* 输入区模式切换 */
.chat-input-options {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
  width: 100%;
}
.model-selector {
  display: flex;
  align-items: center;
  gap: 8px;
}
.model-select {
  width: 160px;
}
.model-select .el-input__inner {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(0, 245, 212, 0.3);
  color: rgba(255, 255, 255, 0.9);
}
.model-option-unconfigured {
  color: rgba(255, 255, 255, 0.5);
}
.mode-switch {
  display: flex;
  align-items: center;
  gap: 8px;
}
.mode-label {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.75);
}
.mode-radio .el-radio-button__inner {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(0, 245, 212, 0.3);
  color: rgba(255, 255, 255, 0.9);
}
.mode-radio .el-radio-button__inner:hover {
  color: #00f5d4;
}
.mode-radio .el-radio-button__original-radio:checked + .el-radio-button__inner {
  background: linear-gradient(135deg, rgba(0, 245, 212, 0.25), rgba(0, 187, 249, 0.25));
  border-color: #00f5d4;
  color: #00f5d4;
  box-shadow: 0 0 8px rgba(0, 245, 212, 0.4);
}
.mode-radio .el-radio-button__inner i {
  margin-right: 4px;
}

.stream-checkbox {
  color: rgba(255, 255, 255, 0.85);
}
.stream-checkbox .el-checkbox__label { color: inherit; }

/* 患者教育结构化展示 */
.patient-edu-block {
  padding: 4px 0;
}
.patient-edu-title {
  font-size: 16px;
  font-weight: 600;
  color: #00f5d4;
  margin: 0 0 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(0, 245, 212, 0.3);
}
.patient-edu-section {
  margin-bottom: 14px;
}
.patient-edu-heading {
  font-size: 14px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.95);
  margin: 0 0 6px;
}
.patient-edu-content {
  font-size: 13px;
  line-height: 1.65;
  color: rgba(255, 255, 255, 0.88);
  white-space: pre-wrap;
}
.patient-edu-summary {
  margin-top: 12px;
  padding: 10px 12px;
  background: rgba(0, 245, 212, 0.1);
  border-radius: 8px;
  border-left: 3px solid #00f5d4;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.9);
  font-style: italic;
}

/* 深度思考面板 */
.analysis-panel {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px dashed rgba(0, 245, 212, 0.25);
}

.analysis-title {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.9);
}

.analysis-section {
  margin-bottom: 8px;
}

.analysis-subtitle {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  margin: 4px 0 6px;
}

.analysis-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.analysis-item {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  margin-bottom: 6px;
  font-size: 12px;
  line-height: 1.5;
}

.analysis-tag {
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 11px;
  flex-shrink: 0;
}

.analysis-tag-graph {
  background-color: rgba(0, 245, 212, 0.12);
  color: #00f5d4;
}

.analysis-tag-doc {
  background-color: rgba(0, 187, 249, 0.12);
  color: #00bbf9;
}

.analysis-tag-history {
  background-color: rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.9);
}

.analysis-tag-tool {
  background-color: rgba(140, 122, 230, 0.16);
  color: #b197fc;
}

.analysis-text {
  color: rgba(255, 255, 255, 0.86);
}

.analysis-reasoning {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.6;
  margin: 0;
}

.analysis-empty {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
}

.chat-input .el-button {
  /* 去掉蓝紫渐变，统一为品牌主色青蓝按钮 */
  background: linear-gradient(135deg, #00f5d4, #00bbf9);
  border: none;
  box-shadow: 0 2px 8px rgba(0, 245, 212, 0.4);
  border-radius: 8px;
  transition: all 0.3s ease;
}

.chat-input .el-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 245, 212, 0.55);
}

/* 聊天侧边栏 */
.chat-sidebar {
  width: 300px;
  background-color: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  padding: 20px;
  border: 1px solid rgba(0, 245, 212, 0.1);
  display: flex;
  flex-direction: column;
  gap: 20px;
  transition: all 0.3s ease;
}

.chat-sidebar.collapsed {
  width: 0;
  padding: 0;
  border: none;
  overflow: hidden;
}

/* 侧边栏头部 */
.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(0, 245, 212, 0.2);
}

.sidebar-header h3 {
  color: #ffffff;
  font-size: 16px;
  font-weight: 600;
  background: linear-gradient(135deg, #00f5d4, #00bbf9);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.sidebar-header .el-button {
  color: rgba(255, 255, 255, 0.6);
}

.sidebar-header .el-button:hover {
  color: #00f5d4;
}

/* 侧边栏内容 */
.sidebar-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 24px;
  overflow-y: auto;
}

/* 来自图谱 / 来自文献 */
.sources-from-graph h4,
.sources-from-doc h4 {
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
  margin-bottom: 12px;
  font-weight: 600;
}

.sources-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.source-item {
  padding: 8px 10px;
  border-radius: 8px;
  font-size: 12px;
  line-height: 1.4;
  color: rgba(255, 255, 255, 0.9);
  cursor: pointer;
  transition: all 0.25s ease;
  border: 1px solid transparent;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}

.source-item--graph {
  background-color: rgba(0, 245, 212, 0.08);
  border-color: rgba(0, 245, 212, 0.25);
}

.source-item--graph:hover {
  background-color: rgba(0, 245, 212, 0.15);
  border-color: rgba(0, 245, 212, 0.4);
  box-shadow: 0 2px 8px rgba(0, 255, 255, 0.2);
}

.source-item--doc {
  background-color: rgba(0, 187, 249, 0.08);
  border-color: rgba(0, 187, 249, 0.25);
}

.source-item--doc:hover {
  background-color: rgba(0, 187, 249, 0.15);
  border-color: rgba(0, 187, 249, 0.4);
  box-shadow: 0 2px 8px rgba(0, 187, 249, 0.2);
}

/* 迷你图谱 */
.mini-graph {
  background-color: rgba(255, 255, 255, 0.02);
  border-radius: 8px;
  padding: 16px;
  border: 1px solid rgba(0, 245, 212, 0.1);
}

.graph-preview {
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
  border: 1px dashed rgba(0, 245, 212, 0.3);
}

/* 空状态 */
.empty-sidebar {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 滚动条样式 */
.chat-messages::-webkit-scrollbar,
.sidebar-content::-webkit-scrollbar {
  width: 6px;
}

.chat-messages::-webkit-scrollbar-track,
.sidebar-content::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 3px;
}

.chat-messages::-webkit-scrollbar-thumb,
.sidebar-content::-webkit-scrollbar-thumb {
  background: rgba(0, 245, 212, 0.3);
  border-radius: 3px;
}

.chat-messages::-webkit-scrollbar-thumb:hover,
.sidebar-content::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 255, 255, 0.5);
}

/* 侧边栏切换按钮 */
.sidebar-toggle {
  position: absolute;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  width: 36px;
  height: 36px;
  background-color: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(0, 245, 212, 0.3);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #00f5d4;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 255, 255, 0.2);
}

.sidebar-toggle:hover {
  background-color: rgba(0, 245, 212, 0.1);
  box-shadow: 0 4px 12px rgba(0, 255, 255, 0.3);
  transform: translateY(-50%) scale(1.1);
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .chat-page {
    flex-direction: column;
    height: auto;
  }

  .chat-session-sidebar {
    width: 100%;
    min-width: 0;
    flex-direction: row;
    align-items: center;
    padding: 10px 12px;
  }
  .chat-session-sidebar.collapsed {
    width: 0;
    min-width: 0;
    padding: 0;
  }

  .session-list-wrapper {
    margin-top: 0;
  }

  .chat-sidebar {
    width: 250px;
  }
  
  .quick-questions .el-button {
    font-size: 12px;
    padding: 6px 12px;
  }
}

@media (max-width: 768px) {
  .chat-container {
    flex-direction: column;
    height: auto;
    min-height: calc(100vh - 140px);
    padding: 10px;
    gap: 10px;
  }
  
  .chat-main {
    padding: 15px;
  }
  
  .chat-sidebar {
    width: 100%;
    height: 300px;
  }
  
  .chat-sidebar.collapsed {
    height: 0;
  }
  
  .sidebar-toggle {
    display: none;
  }
  
  .message-bubble {
    max-width: 85%;
  }
  
  .welcome-message {
    padding: 20px 10px;
  }
  
  .welcome-message h3 {
    font-size: 18px;
  }
  
  .welcome-message p {
    font-size: 14px;
  }
  
  .quick-questions {
    flex-direction: column;
    align-items: center;
  }
  
  .quick-questions .el-button {
    width: 80%;
    margin-bottom: 10px;
  }
}

@media (max-width: 576px) {
  .chat-main {
    padding: 10px;
  }
  
  .chat-messages {
    gap: 12px;
  }
  
  .message-content {
    gap: 8px;
  }
  
  .message-avatar {
    width: 30px;
    height: 30px;
    font-size: 14px;
  }
  
  .message-bubble {
    max-width: 90%;
    padding: 10px 14px;
  }
  
  .message-text {
    font-size: 14px;
  }
  
  .message-time {
    font-size: 11px;
  }
  
  .chat-input {
    flex-direction: column;
    gap: 10px;
    padding: 10px;
    align-items: stretch;
  }
  
  .chat-input .el-button {
    align-self: flex-end;
    padding: 8px 16px;
  }
  
  .welcome-icon {
    width: 50px;
    height: 50px;
    font-size: 20px;
  }
}

@media (max-width: 420px) {
  .chat-container {
    border-radius: 0;
    border: none;
    box-shadow: none;
  }
  
  .chat-main {
    border-radius: 8px;
  }
  
  .chat-sidebar {
    border-radius: 8px;
  }
  
  .message-bubble {
    max-width: 95%;
    padding: 8px 12px;
  }
  
  .message-text {
    font-size: 13px;
  }
}
</style>