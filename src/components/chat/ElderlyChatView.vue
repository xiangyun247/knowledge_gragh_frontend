<template>
  <div class="elderly-chat-wrapper">
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
          <button class="start-test-btn" v-if="!testActive" @click="startTest">
            <i class="el-icon-video-camera"></i>
            <span>开始测试</span>
          </button>
          <!-- 实验员工具 -->
          <el-dropdown trigger="click" @command="handleExperimenterTool">
            <button class="experimenter-tool-btn" title="实验员工具">
              <i class="el-icon-s-tools"></i>
            </button>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item icon="el-icon-monitor" command="/eeg-monitor">EEG 实时监测</el-dropdown-item>
              <el-dropdown-item icon="el-icon-data-analysis" command="/cognitive-load">认知负荷评估</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
          <el-avatar :size="38" :icon="avatarIcon" class="elderly-avatar"></el-avatar>
        </div>
      </div>

    <!-- 测试状态条（测试进行中显示） -->
    <div class="eeg-status-bar" v-if="testActive">
      <span class="live-dot"></span>
      <span class="eeg-status-text">测试进行中</span>
      <button class="finish-test-btn" @click="finishTest">结束测试</button>
    </div>

    <!-- 聊天消息区域 -->
    <div class="elderly-messages" ref="messagesBox">
      <!-- 欢迎消息 -->
      <div class="msg bot" v-if="messages.length === 0">
        <div class="msg-avatar">🤗</div>
        <div class="msg-bubble">
          <div class="bubble-text">
            <p>{{ greetingText }}</p>
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
          <div class="bubble-text" v-html="renderText(msg.content)"></div>
          <div class="msg-time">{{ formatTime(msg.timestamp) }}</div>
        </div>
      </div>

      <!-- 正在输入 -->
      <div class="msg bot" v-if="isSending">
        <div class="msg-avatar">🤗</div>
        <div class="msg-bubble typing-bubble">
          <span class="dot" v-for="n in 3" :key="n" :style="{ animationDelay: n * 0.2 + 's' }"></span>
        </div>
      </div>
    </div>

    <!-- 快捷回复 -->
    <div class="quick-replies" v-if="showQuickReplies && messages.length <= 2 && !isSending">
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
      </button>
      <div class="input-wrap">
        <textarea
          ref="inputBox"
          v-model="inputText"
          placeholder="跟小忆说说话..."
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
    </div><!-- /.elderly-chat-page -->
  </div><!-- /.elderly-chat-wrapper -->
</template>

<script>
import storage from '@/utils/storage'
import { sendMessageToBackendStream } from '@/api/chat'
import { recordEvent, COGNITIVE_EVENT_TYPES } from '@/utils/cognitiveLoad'
import { saveHistoryRecord, getHistoryByType, HISTORY_TYPES } from '@/utils/historyUtils'

const SESSION_KEY = 'elderly_chat_session_id'
const HISTORY_KEY = 'elderly_chat_messages'
const TEST_STATE_KEY = 'elderly_test_state'

export default {
  name: 'ElderlyChatView',
  data() {
    return {
      messages: [],
      inputText: '',
      isSending: false,
      isRecording: false,
      mediaRecorder: null,
      recordChunks: [],
      sessionId: null,
      quickReplies: [
        '今天天气怎么样呀？',
        '我最近总忘事儿',
        '讲个故事给我听呗',
        '今天过得还不错'
      ],
      greetingText: '爷爷好呀！我是小忆，今天想跟您聊聊天~ 您今天过得怎么样呀？',
      // 测试状态
      testActive: false,
      testTaskId: null,
      testSessionId: null,
      // 左侧历史对话栏
      leftSidebarOpen: false,
      chatSessions: [],
      sessionLoading: false,
      activeSessionId: null
    }
  },
  computed: {
    showQuickReplies() {
      return this.messages.filter(m => m.role === 'user').length < 2
    },
    avatarIcon() {
      return 'el-icon-user'
    },
    currentTime() {
      return this.formatTime(Date.now())
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
    // 恢复测试状态（立即执行）
    this.restoreTestState()
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
    window.addEventListener('historyUpdated', this.onHistoryUpdated)
    // 轮询检测测试状态（兜底所有时序问题）
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
    // 页面可见性变化时也检查
    this._onVisibilityChange = () => {
      if (!document.hidden) {
        this.restoreTestState()
      }
    }
    document.addEventListener('visibilitychange', this._onVisibilityChange)
  },
  beforeDestroy() {
    if (this._testStateTimer) {
      clearInterval(this._testStateTimer)
      this._testStateTimer = null
    }
    if (this._onVisibilityChange) {
      document.removeEventListener('visibilitychange', this._onVisibilityChange)
    }
    window.removeEventListener('historyUpdated', this.onHistoryUpdated)
  },
  watch: {
    '$route'(to) {
      if (to.path === '/elderly-chat') {
        this.restoreTestState()
      }
    }
  },
  methods: {
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

      // 行为埋点：记录用户点击发送
      if (this.testActive) {
        recordEvent(COGNITIVE_EVENT_TYPES.CLICK, {
          task_id: this.testTaskId,
          session_id: this.testSessionId,
          source: 'elderly_test',
          action: 'send_message',
          message_length: text.length
        })
      }

      // 调用后端
      this.isSending = true
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
          // 用最终答案确保完整性
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
        },
        onError: (e) => {
          this.messages[botIdx].content = '哎呀，小忆走神了，您再说一遍好不好呀？'
          this.messages[botIdx].timestamp = Date.now()
          this.saveMessages()
          this.isSending = false
          this.scrollToBottom()
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

    renderText(text) {
      if (!text) return ''
      // 简单转义，保留换行
      return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\n/g, '<br>')
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
      // 只保留最近 50 条
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
      this.testActive = false
      this.testTaskId = null
      this.testSessionId = null
      recordEvent(COGNITIVE_EVENT_TYPES.TASK_END, {
        source: 'elderly_test'
      })
      // 自动开新对话，准备测下一个人
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
        }).catch(() => {})
      } else {
        this.doNewConversation()
      }
    },

    doNewConversation() {
      this.messages = []
      this.inputText = ''
      this.activeSessionId = null
      // 生成新 sessionId
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
      // 清空当前消息并展示历史问答
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
.elderly-chat-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  max-width: 720px;
  margin: 0 auto;
  background: #FFF8F0;
  position: relative;
}

/* ===== 顶部栏 ===== */
.elderly-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  background: #FFFFFF;
  border-bottom: 1px solid #F0E6DB;
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
  color: #3D3229;
}
.topbar-title .highlight {
  color: #E8734A;
}
.topbar-right {
  display: flex;
  align-items: center;
  gap: 12px;
}
.elderly-avatar {
  background: #FFF1E6 !important;
  border: 2px solid #E8734A !important;
}

/* ===== 开始测试按钮 ===== */
.start-test-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 18px;
  background: linear-gradient(135deg, #E8734A, #D4623D);
  color: #FFFFFF;
  border: none;
  border-radius: 20px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 3px 12px rgba(232, 115, 74, 0.3);
}
.start-test-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 5px 16px rgba(232, 115, 74, 0.4);
}
.start-test-btn i { font-size: 16px; }

/* ===== 实验员工具按钮 ===== */
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

/* ===== EEG 状态条 ===== */
.eeg-status-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 24px;
  background: linear-gradient(90deg, #FFF1E6, #FFF8F0);
  border-bottom: 1px solid #F0E6DB;
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
  color: #E8734A;
  font-weight: 600;
  flex: 1;
}
.finish-test-btn {
  padding: 6px 16px;
  background: #FFFFFF;
  color: #E8734A;
  border: 1.5px solid #E8734A;
  border-radius: 16px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}
.finish-test-btn:hover {
  background: #FFF5F0;
}

/* ===== 聊天消息区 ===== */
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
  width: 42px;
  height: 42px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  flex-shrink: 0;
  background: #FFF1E6;
}
.msg.bot .msg-avatar {
  background: #FFF1E6;
}
.msg.user .msg-avatar {
  background: #E8F5E9;
}

.msg-bubble {
  max-width: 75%;
  padding: 14px 18px;
  border-radius: 20px;
  line-height: 1.7;
  font-size: 18px;
  position: relative;
}
.msg.bot .msg-bubble {
  background: #FFFFFF;
  color: #3D3229;
  border-bottom-left-radius: 6px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  border: 1px solid #F0E6DB;
}
.msg.user .msg-bubble {
  background: #E8734A;
  color: #FFFFFF;
  border-bottom-right-radius: 6px;
  box-shadow: 0 2px 8px rgba(232, 115, 74, 0.2);
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

.msg-time {
  font-size: 12px;
  color: #B0A89E;
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
  background: #E8734A;
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
  border: 1.5px solid #F0E6DB;
  border-radius: 24px;
  background: #FFFFFF;
  color: #5D4E3C;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}
.quick-btn:hover {
  border-color: #E8734A;
  color: #E8734A;
  background: #FFF5F0;
}

/* ===== 输入区域 ===== */
.elderly-input-area {
  display: flex;
  align-items: flex-end;
  gap: 10px;
  padding: 12px 16px 16px;
  background: #FFFFFF;
  border-top: 1px solid #F0E6DB;
  flex-shrink: 0;
}
.voice-btn {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  border: 2px solid #E8734A;
  background: #FFF5F0;
  color: #E8734A;
  font-size: 22px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.2s;
}
.voice-btn:hover {
  background: #E8734A;
  color: #FFFFFF;
}
.voice-btn.recording {
  background: #EF4444;
  border-color: #EF4444;
  color: #FFFFFF;
  animation: pulse 1s ease-in-out infinite;
}
@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.08); }
}

.input-wrap {
  flex: 1;
  background: #FFF8F0;
  border: 1.5px solid #F0E6DB;
  border-radius: 24px;
  padding: 10px 16px;
  transition: border-color 0.2s;
}
.input-wrap:focus-within {
  border-color: #E8734A;
}
.input-wrap textarea {
  width: 100%;
  border: none;
  outline: none;
  background: transparent;
  font-size: 18px;
  color: #3D3229;
  line-height: 1.5;
  resize: none;
  font-family: inherit;
}
.input-wrap textarea::placeholder {
  color: #BFB5A8;
}

.send-btn {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  border: none;
  background: #E8734A;
  color: #FFFFFF;
  font-size: 22px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(232, 115, 74, 0.3);
}
.send-btn:hover:not(:disabled) {
  background: #D4623D;
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(232, 115, 74, 0.4);
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
  background: #FFFFFF;
  border-top: 1px solid #F0E6DB;
  flex-shrink: 0;
}
.nav-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  text-decoration: none;
  color: #9E9489;
  font-size: 14px;
  padding: 6px 16px;
  border-radius: 16px;
  transition: all 0.2s;
}
.nav-btn i {
  font-size: 24px;
}
.nav-btn:hover {
  color: #E8734A;
  background: #FFF5F0;
}
.nav-btn.active {
  color: #E8734A;
  font-weight: 600;
}

/* ===== 响应式 ===== */
@media (max-width: 480px) {
  .elderly-chat-page {
    max-width: 100%;
  }
  .msg-bubble {
    max-width: 85%;
    font-size: 16px;
    padding: 12px 14px;
  }
  .topbar-title {
    font-size: 20px;
  }
  .quick-btn {
    font-size: 15px;
    padding: 8px 14px;
  }
}

/* ===== 覆盖 Element UI ===== */
.elderly-chat-page .el-message {
  font-size: 16px !important;
}

/* ===== 外层包裹（flex 横排：侧边栏 + 主页面） ===== */
.elderly-chat-wrapper {
  display: flex;
  height: 100vh;
  max-width: 100%;
  margin: 0 auto;
  background: #FFF8F0;
  position: relative;
}

/* ===== 侧边栏展开按钮（收起时显示在左侧） ===== */
.elderly-sidebar-toggle {
  width: 28px;
  min-width: 28px;
  background: #FFFFFF;
  border-radius: 0 12px 12px 0;
  border: 1px solid #F0E6DB;
  border-left: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #E8734A;
  transition: all 0.2s ease;
  flex-shrink: 0;
  align-self: center;
  box-shadow: 2px 2px 8px rgba(0,0,0,0.06);
}
.elderly-sidebar-toggle:hover {
  background: #FFF5F0;
  color: #D4623D;
}

/* ===== 左侧会话侧边栏 ===== */
.elderly-session-sidebar {
  width: 240px;
  min-width: 240px;
  background: #FFFFFF;
  border-radius: 0 16px 16px 0;
  box-shadow: 4px 0 16px rgba(0,0,0,0.06);
  padding: 16px 12px;
  display: flex;
  flex-direction: column;
  border: 1px solid #F0E6DB;
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
  color: #9E9489 !important;
}
.session-collapse-btn:hover {
  color: #E8734A !important;
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
  color: #3D3229;
  font-size: 15px;
}
.session-title i {
  color: #E8734A;
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
  color: #9E9489;
}
.session-refresh-btn {
  padding: 0 !important;
  color: #9E9489 !important;
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
  color: #5D4E3C;
}
.session-item:hover {
  background: #FFF5F0;
}
.session-item.active {
  background: #E8734A;
  color: #FFFFFF;
  box-shadow: 0 3px 10px rgba(232, 115, 74, 0.3);
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
  color: #9E9489;
}
.session-item.active .session-item-meta {
  color: rgba(255, 255, 255, 0.75);
}
.session-empty {
  margin-top: 12px;
  text-align: center;
  font-size: 12px;
  color: #B0A89E;
}

/* 响应式：小屏侧边栏宽度缩小 */
@media (max-width: 480px) {
  .elderly-session-sidebar {
    width: 200px;
    min-width: 200px;
  }
}
</style>
