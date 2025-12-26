<template>
  <div class="login-page">
    <div class="login-container">
      <!-- 左侧背景区域 -->
      <div class="login-bg">
        <div class="bg-content">
          <img src="@/assets/images/logo.png" alt="Logo" class="bg-logo" />
          <h2 class="bg-title">医疗知识图谱系统</h2>
          <p class="bg-description">探索医疗知识的无限可能</p>
          
          <!-- 知识图谱可视化（带粒子特效） -->
          <div class="knowledge-graph">
            <svg width="350" height="250" viewBox="0 0 350 250">
              <!-- 粒子背景 -->
              <g class="particles">
                <circle cx="80" cy="60" r="2" fill="rgba(0, 212, 255, 0.6)" class="particle" style="animation-delay: 0s;"></circle>
                <circle cx="120" cy="90" r="1" fill="rgba(0, 212, 255, 0.4)" class="particle" style="animation-delay: 0.5s;"></circle>
                <circle cx="160" cy="50" r="1.5" fill="rgba(0, 212, 255, 0.5)" class="particle" style="animation-delay: 1s;"></circle>
                <circle cx="200" cy="70" r="2" fill="rgba(0, 212, 255, 0.7)" class="particle" style="animation-delay: 1.5s;"></circle>
                <circle cx="240" cy="50" r="1" fill="rgba(0, 212, 255, 0.4)" class="particle" style="animation-delay: 2s;"></circle>
                <circle cx="90" cy="120" r="1.5" fill="rgba(0, 212, 255, 0.5)" class="particle" style="animation-delay: 2.5s;"></circle>
                <circle cx="140" cy="140" r="2" fill="rgba(0, 212, 255, 0.6)" class="particle" style="animation-delay: 3s;"></circle>
                <circle cx="180" cy="160" r="1" fill="rgba(0, 212, 255, 0.3)" class="particle" style="animation-delay: 3.5s;"></circle>
                <circle cx="220" cy="130" r="1.5" fill="rgba(0, 212, 255, 0.5)" class="particle" style="animation-delay: 4s;"></circle>
                <circle cx="250" cy="100" r="2" fill="rgba(0, 212, 255, 0.7)" class="particle" style="animation-delay: 4.5s;"></circle>
                <circle cx="270" cy="140" r="1" fill="rgba(0, 212, 255, 0.4)" class="particle" style="animation-delay: 5s;"></circle>
                <circle cx="110" cy="170" r="1.5" fill="rgba(0, 212, 255, 0.5)" class="particle" style="animation-delay: 5.5s;"></circle>
                <circle cx="230" cy="180" r="2" fill="rgba(0, 212, 255, 0.6)" class="particle" style="animation-delay: 6s;"></circle>
                <circle cx="160" cy="200" r="1" fill="rgba(0, 212, 255, 0.4)" class="particle" style="animation-delay: 6.5s;"></circle>
              </g>
              
              <!-- 连接线 -->
              <g class="graph-links">
                <path d="M100 50 C125 75 125 75 150 100" stroke="rgba(0, 212, 255, 0.4)" stroke-width="2" fill="none" />
                <path d="M150 100 C175 75 175 75 200 50" stroke="rgba(0, 212, 255, 0.4)" stroke-width="2" fill="none" />
                <path d="M100 50 C100 100 100 100 100 150" stroke="rgba(0, 212, 255, 0.4)" stroke-width="2" fill="none" />
                <path d="M200 50 C200 100 200 100 200 150" stroke="rgba(0, 212, 255, 0.4)" stroke-width="2" fill="none" />
                <path d="M100 150 C125 125 125 125 150 100" stroke="rgba(0, 212, 255, 0.4)" stroke-width="2" fill="none" />
                <path d="M200 150 C175 125 175 125 150 100" stroke="rgba(0, 212, 255, 0.4)" stroke-width="2" fill="none" />
                
                <!-- 连接线动画点 -->
                <g class="link-dots">
                  <circle r="3" fill="rgba(0, 212, 255, 0.8)" class="dot dot-1"></circle>
                  <circle r="3" fill="rgba(0, 212, 255, 0.8)" class="dot dot-2"></circle>
                  <circle r="3" fill="rgba(0, 212, 255, 0.8)" class="dot dot-3"></circle>
                </g>
              </g>
              
              <!-- 节点光晕 -->
              <g class="node-glows">
                <circle cx="100" cy="50" r="25" fill="rgba(0, 212, 255, 0.1)" class="glow" />
                <circle cx="200" cy="50" r="25" fill="rgba(0, 212, 255, 0.1)" class="glow" />
                <circle cx="100" cy="150" r="25" fill="rgba(0, 212, 255, 0.1)" class="glow" />
                <circle cx="200" cy="150" r="25" fill="rgba(0, 212, 255, 0.1)" class="glow" />
                <circle cx="150" cy="100" r="35" fill="rgba(0, 212, 255, 0.15)" class="glow-center" />
              </g>
              
              <!-- 节点 -->
              <g class="graph-nodes">
                <!-- 周围节点 -->
                <circle cx="100" cy="50" r="18" fill="rgba(255, 255, 255, 0.15)" class="node" />
                <text x="100" y="55" text-anchor="middle" fill="white" font-size="11" font-weight="500">症状</text>
                
                <circle cx="200" cy="50" r="18" fill="rgba(255, 255, 255, 0.15)" class="node" />
                <text x="200" y="55" text-anchor="middle" fill="white" font-size="11" font-weight="500">治疗</text>
                
                <circle cx="100" cy="150" r="18" fill="rgba(255, 255, 255, 0.15)" class="node" />
                <text x="100" y="155" text-anchor="middle" fill="white" font-size="11" font-weight="500">药物</text>
                
                <circle cx="200" cy="150" r="18" fill="rgba(255, 255, 255, 0.15)" class="node" />
                <text x="200" y="155" text-anchor="middle" fill="white" font-size="11" font-weight="500">预防</text>
                
                <!-- 中心节点 -->
                <circle cx="150" cy="100" r="25" fill="rgba(0, 212, 255, 0.9)" class="node-center" />
                <text x="150" y="106" text-anchor="middle" fill="white" font-size="14" font-weight="bold">疾病</text>
              </g>
            </svg>
          </div>
        </div>
      </div>
      
      <!-- 右侧表单区域 -->
      <div class="login-form-container">
        <div class="form-content">
          <!-- 切换标签 -->
          <el-tabs v-model="activeTab" class="login-tabs">
            <el-tab-pane label="登录" name="login">
              <el-form :model="loginForm" :rules="loginRules" ref="loginForm" label-position="left">
                <el-form-item label="用户名" prop="username">
                  <el-input
                    v-model="loginForm.username"
                    placeholder="请输入用户名"
                    prefix-icon="el-icon-user"
                    size="large"
                  ></el-input>
                </el-form-item>
                <el-form-item label="密码" prop="password">
                  <el-input
                    v-model="loginForm.password"
                    type="password"
                    placeholder="请输入密码"
                    prefix-icon="el-icon-lock"
                    size="large"
                    show-password
                  ></el-input>
                </el-form-item>
                <div class="form-options">
                  <el-checkbox v-model="loginForm.rememberMe">记住我</el-checkbox>
                  <el-button type="text" class="forget-password">忘记密码？</el-button>
                </div>
                <el-form-item>
                  <el-button type="primary" size="large" class="login-btn app-btn app-btn-primary" :loading="loginLoading" @click="handleLogin">
                    登录
                  </el-button>
                </el-form-item>
                <el-form-item>
                  <el-button type="success" size="large" class="switch-btn app-btn app-btn-secondary" @click="activeTab = 'register'">
                    立即注册
                  </el-button>
                </el-form-item>
              </el-form>
            </el-tab-pane>
            
            <el-tab-pane label="注册" name="register">
              <el-form :model="registerForm" :rules="registerRules" ref="registerForm" label-position="left">
                <el-form-item label="用户名" prop="username">
                  <el-input
                    v-model="registerForm.username"
                    placeholder="请输入用户名"
                    prefix-icon="el-icon-user"
                    size="large"
                  ></el-input>
                </el-form-item>
                <el-form-item label="邮箱" prop="email">
                  <el-input
                    v-model="registerForm.email"
                    placeholder="请输入邮箱"
                    prefix-icon="el-icon-message"
                    size="large"
                  ></el-input>
                </el-form-item>
                <el-form-item label="密码" prop="password">
                  <el-input
                    v-model="registerForm.password"
                    type="password"
                    placeholder="请输入密码（至少8位）"
                    prefix-icon="el-icon-lock"
                    size="large"
                    show-password
                  ></el-input>
                </el-form-item>
                <el-form-item label="确认密码" prop="confirmPassword">
                  <el-input
                    v-model="registerForm.confirmPassword"
                    type="password"
                    placeholder="请再次输入密码"
                    prefix-icon="el-icon-lock"
                    size="large"
                    show-password
                  ></el-input>
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" size="large" class="register-btn app-btn app-btn-primary" :loading="registerLoading" @click="handleRegister">
                    注册
                  </el-button>
                </el-form-item>
                <el-form-item>
                  <el-button type="info" size="large" class="switch-btn app-btn app-btn-secondary" @click="activeTab = 'login'">
                    立即登录
                  </el-button>
                </el-form-item>
              </el-form>
            </el-tab-pane>
          </el-tabs>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex'

export default {
  name: 'Login',
  data() {
    return {
      activeTab: 'login',
      loginLoading: false,
      registerLoading: false,
      loginForm: {
        username: '',
        password: '',
        rememberMe: false
      },
      registerForm: {
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
      },
      loginRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, message: '密码长度不能少于 6 个字符', trigger: 'blur' }
        ]
      },
      registerRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 8, message: '密码长度不能少于 8 个字符', trigger: 'blur' }
        ],
        confirmPassword: [
          { required: true, message: '请确认密码', trigger: 'blur' },
          { validator: this.validateConfirmPassword, trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    // 检查URL查询参数，设置默认标签
    if (this.$route.query.activeTab === 'register') {
      this.activeTab = 'register'
    }
  },
  methods: {
    validateConfirmPassword(rule, value, callback) {
      if (value !== this.registerForm.password) {
        callback(new Error('两次输入的密码不一致'))
      } else {
        callback()
      }
    },
    ...mapActions('user', ['login', 'register']),
    handleLogin() {
      this.$refs.loginForm.validate((valid) => {
        if (valid) {
          this.loginLoading = true
          // 使用Vuex的login action
          this.login(this.loginForm)
            .then(() => {
              this.$router.push('/')
            })
            .catch((error) => {
              this.$message.error('登录失败：' + (error.message || '未知错误'))
            })
            .finally(() => {
              this.loginLoading = false
            })
        } else {
          this.$message.error('请填写正确的登录信息')
          return false
        }
      })
    },
    handleRegister() {
      this.$refs.registerForm.validate((valid) => {
        if (valid) {
          this.registerLoading = true
          // 使用Vuex的register action
          this.register(this.registerForm)
            .then(() => {
              this.$message.success('注册成功，请登录')
              this.activeTab = 'login'
            })
            .catch((error) => {
              this.$message.error('注册失败：' + (error.message || '未知错误'))
            })
            .finally(() => {
              this.registerLoading = false
            })
        } else {
          this.$message.error('请填写正确的注册信息')
          return false
        }
      })
    }
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #0a0e27 0%, #1a1f3a 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-container {
  width: 900px;
  min-height: 500px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  display: flex;
}

/* 左侧背景区域 */
.login-bg {
  width: 50%;
  background: linear-gradient(135deg, rgba(0, 212, 255, 0.1) 0%, rgba(10, 14, 39, 0.8) 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  min-height: 500px; /* 确保最小高度一致 */
  flex-grow: 1;
}

.bg-content {
  text-align: center;
}

.bg-logo {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: linear-gradient(135deg, #00d4ff 0%, #0a0e27 100%);
  box-shadow: 0 0 30px rgba(0, 212, 255, 0.5);
  margin-bottom: 20px;
  animation: rotate 20s linear infinite;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.bg-title {
  color: #ffffff;
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 10px;
}

.bg-description {
  color: rgba(255, 255, 255, 0.7);
  font-size: 16px;
  line-height: 1.6;
  margin-bottom: 30px;
}

/* 知识图谱样式 */
.knowledge-graph {
  display: flex;
  justify-content: center;
  margin-top: 20px;
  opacity: 0.9;
  position: relative;
  overflow: hidden;
}

.knowledge-graph svg {
  max-width: 100%;
  height: auto;
  filter: drop-shadow(0 0 20px rgba(0, 212, 255, 0.1));
}

/* 粒子动画 */
.particles {
  opacity: 0.7;
}

.particle {
  animation: float 6s ease-in-out infinite;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px);
    opacity: 0.6;
  }
  50% {
    transform: translateY(-15px);
    opacity: 1;
  }
}

/* 节点光晕效果 */
.node-glows .glow {
  animation: glowPulse 4s ease-in-out infinite;
}

.node-glows .glow-center {
  animation: glowPulse 3s ease-in-out infinite;
}

@keyframes glowPulse {
  0%, 100% {
    opacity: 0.1;
    transform: scale(1);
  }
  50% {
    opacity: 0.2;
    transform: scale(1.1);
  }
}

/* 节点动画 */
.node {
  animation: nodeFloat 5s ease-in-out infinite, nodeGlow 3s ease-in-out infinite;
  filter: drop-shadow(0 0 5px rgba(0, 212, 255, 0.3));
}

.node-center {
  animation: centerNodeFloat 4s ease-in-out infinite, centerNodeGlow 2.5s ease-in-out infinite;
  filter: drop-shadow(0 0 10px rgba(0, 212, 255, 0.6));
}

@keyframes nodeFloat {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-8px);
  }
}

@keyframes centerNodeFloat {
  0%, 100% {
    transform: translateY(0px) scale(1);
  }
  50% {
    transform: translateY(-5px) scale(1.05);
  }
}

@keyframes nodeGlow {
  0%, 100% {
    opacity: 0.8;
  }
  50% {
    opacity: 1;
    filter: drop-shadow(0 0 8px rgba(0, 212, 255, 0.5));
  }
}

@keyframes centerNodeGlow {
  0%, 100% {
    opacity: 0.9;
  }
  50% {
    opacity: 1;
    filter: drop-shadow(0 0 15px rgba(0, 212, 255, 0.8));
  }
}

/* 节点悬停效果 */
.node:hover {
  fill: rgba(0, 212, 255, 0.3) !important;
  transform: scale(1.15) translateY(-5px);
  transition: all 0.4s ease;
  filter: drop-shadow(0 0 12px rgba(0, 212, 255, 0.6));
}

.node-center:hover {
  fill: rgba(0, 212, 255, 1) !important;
  transform: scale(1.2) translateY(-5px);
  transition: all 0.4s ease;
  filter: drop-shadow(0 0 20px rgba(0, 212, 255, 1));
}

/* 连接线动画 */
.graph-links path {
  animation: linkPulse 4s ease-in-out infinite;
  stroke-dasharray: 5, 15;
  stroke-linecap: round;
}

@keyframes linkPulse {
  0%, 100% {
    stroke-opacity: 0.3;
    stroke-width: 2;
    stroke-dashoffset: 0;
  }
  50% {
    stroke-opacity: 0.7;
    stroke-width: 3;
    stroke-dashoffset: 20;
  }
}

/* 连接线动画点 */
.link-dots .dot {
  animation: dotMove 5s linear infinite;
  filter: drop-shadow(0 0 3px rgba(0, 212, 255, 0.8));
}

.dot-1 {
  animation-delay: 0s;
}

.dot-2 {
  animation-delay: 1.5s;
}

.dot-3 {
  animation-delay: 3s;
}

@keyframes dotMove {
  0% {
    transform: translate(100px, 50px);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  33% {
    transform: translate(150px, 100px);
  }
  66% {
    transform: translate(200px, 50px);
  }
  90% {
    opacity: 1;
  }
  100% {
    transform: translate(100px, 50px);
    opacity: 0;
  }
}

/* 延迟动画，使节点依次浮动 */
.node:nth-child(2) {
  animation-delay: 0.5s;
}

.node:nth-child(3) {
  animation-delay: 1s;
}

.node:nth-child(4) {
  animation-delay: 1.5s;
}

.node:nth-child(5) {
  animation-delay: 2s;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .knowledge-graph svg {
    width: 250px;
    height: 180px;
  }
}

/* 右侧表单区域 */
.login-form-container {
  width: 50%;
  padding: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.form-content {
  width: 100%;
  max-width: 320px;
}

/* 标签样式 */
.login-tabs {
  margin-bottom: 20px;
}

.login-tabs >>> .el-tabs__header {
  margin-bottom: 30px;
}

.login-tabs >>> .el-tabs__nav-wrap::after {
  background-color: rgba(255, 255, 255, 0.1);
}

.login-tabs >>> .el-tabs__active-bar {
  background-color: #00d4ff;
}

.login-tabs >>> .el-tabs__item {
  color: rgba(255, 255, 255, 0.7);
  font-size: 16px;
  font-weight: 500;
}

.login-tabs >>> .el-tabs__item.is-active {
  color: #00d4ff;
}

/* 表单样式 */
.el-form-item {
  margin-bottom: 25px;
}

.el-form-item__label {
  color: rgba(255, 255, 255, 0.8);
  font-weight: 500;
}

.el-input {
  background-color: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: #ffffff;
}

.el-input__inner {
  background-color: transparent;
  color: #ffffff;
  border: none;
}

.el-input__inner::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.el-input__prefix {
  color: rgba(255, 255, 255, 0.5);
}

/* 选项区域 */
.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
}

.el-checkbox__label {
  color: rgba(255, 255, 255, 0.7);
}

.forget-password {
  color: #00d4ff;
  font-size: 14px;
}

/* 按钮样式 */
.login-btn, .register-btn {
  width: 100%;
  height: 45px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  background: linear-gradient(135deg, #00d4ff 0%, #0080ff 100%);
  border: none;
  transition: all 0.3s ease;
}

.login-btn:hover, .register-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 212, 255, 0.4);
  background: linear-gradient(135deg, #0080ff 0%, #00d4ff 100%);
}

/* 切换按钮样式 */
.switch-btn {
  width: 100%;
  height: 45px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  transition: all 0.3s ease;
  margin-top: 10px;
}

.switch-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .login-container {
    width: 100%;
    height: 100vh;
    border-radius: 0;
    flex-direction: column;
  }
  
  .login-bg {
    width: 100%;
    height: 30%;
    padding: 20px;
  }
  
  .bg-logo {
    width: 80px;
    height: 80px;
  }
  
  .bg-title {
    font-size: 24px;
  }
  
  .login-form-container {
    width: 100%;
    height: 70%;
    padding: 20px;
  }
  
  .form-content {
    max-width: 100%;
  }
}
</style>