<template>
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
          <h3>欢迎使用医疗知识图谱问答系统</h3>
          <p>我可以为您解答医疗相关问题，提供专业、准确的医疗信息</p>
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
              <i :class="message.type === 'user' ? 'el-icon-user' : 'el-icon-medal'">
              </i>
            </div>
            <div class="message-bubble">
              <div class="message-text">{{ message.content }}</div>
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
        <el-button type="primary" @click="sendMessage" :disabled="!inputMessage.trim()">
          <i class="el-icon-send"></i>
          发送
        </el-button>
      </div>
    </div>
    
    <!-- 右侧关联实体/图谱展示 -->
    <div class="chat-sidebar">
      <div class="sidebar-header">
        <h3>关联信息</h3>
        <el-button size="small" type="text" @click="toggleSidebar">
          <i class="el-icon-close"></i>
        </el-button>
      </div>
      
      <div class="sidebar-content">
        <div v-if="relatedEntities.length > 0" class="related-entities">
          <h4>相关实体</h4>
          <div class="entity-list">
            <el-tag
              v-for="(entity, index) in relatedEntities"
              :key="index"
              @click="viewEntityDetails(entity)"
              class="entity-tag"
            >
              {{ entity }}
            </el-tag>
          </div>
        </div>
        
        <div v-if="showMiniGraph" class="mini-graph">
          <h4>关系图谱</h4>
          <div class="graph-preview">
            <el-empty description="点击实体查看关系图谱"></el-empty>
          </div>
        </div>
        
        <div v-if="!relatedEntities.length && !showMiniGraph" class="empty-sidebar">
          <el-empty description="暂无关联信息"></el-empty>
        </div>
      </div>
    </div>
    
    <!-- 侧边栏控制按钮 -->
    <div class="sidebar-toggle" @click="toggleSidebar" v-if="!sidebarOpen">
      <i class="el-icon-menu"></i>
    </div>
  </div>
</template>

<script>
import TypingIndicator from '../components/chat/TypingIndicator.vue'
import dayjs from 'dayjs'
import { sendMessageToBackend as apiSendMessage } from '../api/chat'
import { saveHistoryRecord, HISTORY_TYPES } from '../utils/historyUtils'

export default {
  name: 'Chat',
  components: {
    TypingIndicator
  },
  data() {
    return {
      messages: [],
      inputMessage: '',
      isTyping: false,
      relatedEntities: [],
      showMiniGraph: false,
      sidebarOpen: true,
      quickQuestions: [
        '什么是糖尿病？',
        '高血压的治疗方法有哪些？',
        '如何预防心脏病？',
        '感冒的症状是什么？'
      ]
    }
  },
  mounted() {
    // 初始化聊天历史
    this.initChatHistory()
  },
  methods: {
    // 初始化聊天历史
    initChatHistory() {
      // 这里可以从localStorage或API加载历史记录
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
      this.messages.push(userMessage)
      
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
    
    // 调用后端API发送消息
    sendMessageToBackend(question) {
      this.isTyping = true
      
      // 调用真实API
      apiSendMessage({ question: question })
        .then(response => {
          console.log('收到完整响应:', response)
          // 处理后端返回的响应
          const systemMessage = {
            type: 'system',
            content: response.data.answer || response.data.response || '未获取到有效回答',
            timestamp: Date.now()
          }
          
          this.messages.push(systemMessage)
          this.isTyping = false
          
          // 保存聊天历史记录
          saveHistoryRecord(HISTORY_TYPES.CHAT, {
            question: question,
            answer: response.data.answer || response.data.response || '未获取到有效回答',
            messages: [
              { type: 'user', content: question, timestamp: Date.now() - 1000 },
              systemMessage
            ]
          })
          
          // 从响应中获取关联实体（兼容不同后端返回格式）
          if (response.data.sources) {
            // 从sources中提取实体
            this.relatedEntities = response.data.sources.map(source => {
              if (typeof source === 'object') {
                return source.name || source.type || '未知实体'
              }
              return source
            })
            this.showMiniGraph = true
          } else if (response.data.related_entities) {
            this.relatedEntities = response.data.related_entities
            this.showMiniGraph = true
          } else {
            this.relatedEntities = []
            this.showMiniGraph = false
          }
          
          // 滚动到底部
          this.scrollToBottom()
        })
        .catch(error => {
          // 添加更详细的错误日志
          console.error('请求失败:', error)
          console.error('错误详情:', {
            message: error.message,
            response: error.response,
            config: error.config,
            status: error.response?.status,
            data: error.response?.data
          })
          this.isTyping = false
          
          // 添加错误消息
          const errorMessage = {
            type: 'system',
            content: `请求失败: ${error.message || '未知错误'}，请查看控制台了解详情。`,
            timestamp: Date.now()
          }
          this.messages.push(errorMessage)
          this.scrollToBottom()
        })
    },
    
    // 查看实体详情
    viewEntityDetails(entity) {
      // 跳转到图谱页面或搜索页面
      this.$router.push({
        name: 'GraphView',
        params: { entity: entity }
      })
    },
    
    // 格式化时间
    formatTime(timestamp) {
      return dayjs(timestamp).format('HH:mm')
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
    }
  }
}
</script>

<style>
.chat-container {
  display: flex;
  height: calc(100vh - 140px);
  gap: 20px;
  background-color: rgba(10, 14, 39, 0.8);
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 8px 32px rgba(0, 212, 255, 0.1);
  border: 1px solid rgba(0, 212, 255, 0.2);
  position: relative;
  overflow: hidden;
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
  border: 1px solid rgba(0, 212, 255, 0.1);
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
  background: linear-gradient(135deg, rgba(0, 212, 255, 0.1), rgba(156, 39, 255, 0.1));
  border-radius: 16px;
  border: 1px solid rgba(0, 212, 255, 0.2);
  margin-bottom: 20px;
}

.welcome-icon {
  width: 60px;
  height: 60px;
  background: var(--gradient-glow);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  margin: 0 auto 20px;
  box-shadow: 0 0 20px rgba(0, 212, 255, 0.5);
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
  color: var(--primary-blue);
  border: 1px solid rgba(0, 212, 255, 0.3);
  transition: all 0.3s ease;
}

.quick-questions .el-button:hover {
  background-color: rgba(0, 212, 255, 0.1);
  box-shadow: 0 4px 12px rgba(0, 212, 255, 0.3);
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
  background: linear-gradient(135deg, #00d4ff, #9c27ff);
}

.user-message .message-bubble {
  background: var(--gradient-glow);
  color: #ffffff;
  border-bottom-right-radius: 4px;
}

/* 系统消息 */
.system-message .message-avatar {
  background: linear-gradient(135deg, #9c27ff, #00d4ff);
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
  box-shadow: 0 2px 8px rgba(0, 212, 255, 0.3);
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
  border: 1px solid rgba(0, 212, 255, 0.2);
}

.chat-input .el-input {
  flex: 1;
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  border: 1px solid rgba(0, 212, 255, 0.3);
}

.chat-input .el-input__inner {
  background-color: transparent;
  color: #ffffff;
  border: none;
  resize: none;
}

.chat-input .el-input__inner:focus {
  box-shadow: 0 0 0 2px rgba(0, 212, 255, 0.3);
}

.chat-input .el-button {
  background: var(--gradient-glow);
  border: none;
  box-shadow: 0 2px 8px rgba(0, 212, 255, 0.3);
  border-radius: 8px;
  transition: all 0.3s ease;
}

.chat-input .el-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 212, 255, 0.4);
}

/* 聊天侧边栏 */
.chat-sidebar {
  width: 300px;
  background-color: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  padding: 20px;
  border: 1px solid rgba(0, 212, 255, 0.1);
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
  border-bottom: 1px solid rgba(0, 212, 255, 0.2);
}

.sidebar-header h3 {
  color: #ffffff;
  font-size: 16px;
  font-weight: 600;
  background: var(--gradient-glow);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.sidebar-header .el-button {
  color: rgba(255, 255, 255, 0.6);
}

.sidebar-header .el-button:hover {
  color: var(--primary-blue);
}

/* 侧边栏内容 */
.sidebar-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 24px;
  overflow-y: auto;
}

/* 相关实体 */
.related-entities h4,
.mini-graph h4 {
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
  margin-bottom: 12px;
  font-weight: 600;
}

.entity-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.entity-tag {
  background-color: rgba(0, 212, 255, 0.1);
  color: var(--primary-blue);
  border: 1px solid rgba(0, 212, 255, 0.3);
  border-radius: 16px;
  padding: 4px 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 12px;
}

.entity-tag:hover {
  background-color: rgba(0, 212, 255, 0.2);
  box-shadow: 0 2px 8px rgba(0, 212, 255, 0.3);
  transform: translateY(-2px);
}

/* 迷你图谱 */
.mini-graph {
  background-color: rgba(255, 255, 255, 0.02);
  border-radius: 8px;
  padding: 16px;
  border: 1px solid rgba(0, 212, 255, 0.1);
}

.graph-preview {
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
  border: 1px dashed rgba(0, 212, 255, 0.3);
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
  background: rgba(0, 212, 255, 0.3);
  border-radius: 3px;
}

.chat-messages::-webkit-scrollbar-thumb:hover,
.sidebar-content::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 212, 255, 0.5);
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
  border: 1px solid rgba(0, 212, 255, 0.3);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary-blue);
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 212, 255, 0.2);
}

.sidebar-toggle:hover {
  background-color: rgba(0, 212, 255, 0.1);
  box-shadow: 0 4px 12px rgba(0, 212, 255, 0.3);
  transform: translateY(-50%) scale(1.1);
}

/* 响应式设计 */
@media (max-width: 1024px) {
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
