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
          <h3>欢迎使用「胰明」医疗知识图谱智能体</h3>
          <p>我专注胰腺相关疾病，基于知识图谱与文献为你提供可溯源的智能分析（结果仅供参考，请遵医嘱）。</p>
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
        <el-input
          v-model="inputMessage"
          type="textarea"
          :rows="1"
          placeholder="请输入您的问题..."
          @keyup.enter.native="sendMessage"
          resize="none"
        ></el-input>
        <el-checkbox v-model="enableDeepThink" size="small" class="stream-checkbox">深度思考</el-checkbox>
        <el-button 
          type="primary" 
          class="app-btn app-btn-primary chat-send-btn" 
          @click="sendMessage" 
          :disabled="!inputMessage.trim() || isTyping"
          :loading="isTyping"
        >
          <i class="el-icon-send" v-if="!isTyping"></i>
          <span v-if="!isTyping">发送</span>
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
import { sendMessageToBackend as apiSendMessage, sendMessageToBackendStream } from '../../api/chat'
import { saveHistoryRecord, HISTORY_TYPES, getHistoryByType } from '../../utils/historyUtils'

export default {
  name: 'ChatView',
  components: {
    TypingIndicator
  },
  data() {
    return {
      inputMessage: '',
      isTyping: false,
      enableDeepThink: false,
      sidebarOpen: true,
      leftSidebarOpen: true,
      analysisActiveNames: ['deep'],
       // 左侧「历史对话」列表
      chatSessions: [],
      sessionLoading: false,
      activeSessionId: null,
      quickQuestions: [
        '什么是急性胰腺炎？',
        '胰腺炎常见症状有哪些？',
        '胰腺炎需要做哪些检查？',
        '胰腺炎的常规治疗方案是什么？'
      ]
    }
  },
  computed: {
    ...mapState('chat', ['messages', 'sessionId', 'sourcesGraph', 'sourcesDoc', 'lastQuestionForSources', 'analysisTrace'])
  },
  mounted() {
    if (!this.sessionId) {
      this.$store.commit('chat/SET_SESSION_ID', `s-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`)
    }
    this.loadChatSessions()
    window.addEventListener('historyUpdated', this.onHistoryUpdated)
    this.applyQuestionFromRoute()
  },
  watch: {
    '$route'(to) {
      if (to.path === '/chat' && to.query.question && to.query.autoSend === '1') {
        this.applyQuestionFromRoute()
      }
    }
  },
  beforeDestroy() {
    window.removeEventListener('historyUpdated', this.onHistoryUpdated)
  },
  methods: {
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

    // 新对话：清空当前会话内容并生成新的 sessionId
    handleNewConversation() {
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
      if (!this.inputMessage.trim()) return
      
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
          this.sendMessage()
          this.$router.replace({ path: '/chat', query: {} })
        }
      })
    },
    
    // 调用后端API发送消息（Agent 返回 answer、sources）。6.1 session_id 启用多轮；现在默认使用流式输出
    sendMessageToBackend(question) {
      this.$store.commit('chat/SET_SOURCES', { sourcesGraph: [], sourcesDoc: [] })
      const sys = { type: 'system', content: '', timestamp: Date.now() }
      this.$store.commit('chat/ADD_MESSAGE', sys)
      this.isTyping = true
      const idx = this.messages.length - 1
      this.$store.commit('chat/SET_ANALYSIS_TRACE', null)
      sendMessageToBackendStream(question, this.sessionId, {
        deepThink: this.enableDeepThink,
        onChunk: (d) => {
          this.$store.commit('chat/APPEND_MESSAGE_CONTENT', { index: idx, chunk: d })
        },
        onDone: ({ answer, sources, trace }) => {
          const m = this.messages[idx]
          if (m && m.type === 'system' && !(m.content || '').trim()) {
            this.$store.commit('chat/UPDATE_MESSAGE_CONTENT', { index: idx, content: answer || '未获取到有效回答' })
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

    // 将少量 Markdown 样式（1. / - ）渲染成真正的列表 + 段落 HTML
    renderMessageContent(message) {
      const text = (message && message.content) || ''
      if (!text) return ''

      // 先对 HTML 做转义，避免 XSS
      const escapeHtml = (s) =>
        s
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
      const lines = text.split('\n').map(escapeHtml)

      const blocks = []
      let ul = []
      let ol = []

      const flushLists = () => {
        if (ul.length) {
          blocks.push(`<ul class="msg-list msg-list-ul">${ul.join('')}</ul>`)
          ul = []
        }
        if (ol.length) {
          blocks.push(`<ol class="msg-list msg-list-ol">${ol.join('')}</ol>`)
          ol = []
        }
      }

      lines.forEach((line) => {
        const trimmed = line.trim()
        if (!trimmed) {
          // 空行：先把列表收尾，再插入一个段落空行
          flushLists()
          blocks.push('<p class="msg-paragraph">&nbsp;</p>')
          return
        }

        const mBullet = trimmed.match(/^[-*]\s+(.+)/)
        const mNumber = trimmed.match(/^\d+[.)]\s+(.+)/)

        if (mBullet) {
          // 无序列表项
          if (ol.length) flushLists()
          ul.push(`<li class="msg-list-item">${mBullet[1]}</li>`)
        } else if (mNumber) {
          // 有序列表项
          if (ul.length) flushLists()
          ol.push(`<li class="msg-list-item">${mNumber[1]}</li>`)
        } else {
          // 普通段落：先结束列表，再渲染成 <p>
          flushLists()
          blocks.push(`<p class="msg-paragraph">${trimmed}</p>`)
        }
      })

      flushLists()
      return blocks.join('')
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

.msg-paragraph {
  margin: 0 0 4px;
}

.msg-list {
  margin: 0 0 4px 20px;
  padding-left: 18px;
}

.msg-list-item {
  margin: 2px 0;
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

.stream-checkbox {
  color: rgba(255, 255, 255, 0.85);
}
.stream-checkbox .el-checkbox__label { color: inherit; }

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