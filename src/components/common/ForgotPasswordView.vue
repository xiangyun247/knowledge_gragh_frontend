<template>
  <div class="forgot-page">
    <div class="forgot-container">
      <div class="forgot-card">
        <h2 class="title">找回密码</h2>
        <p class="subtitle">请输入您注册时使用的邮箱，我们会向该邮箱发送重置密码的说明（示意界面，当前不实际发送邮件）。</p>

        <el-form :model="form" :rules="rules" ref="form" label-position="top">
          <el-form-item label="邮箱" prop="email">
            <el-input
              v-model="form.email"
              placeholder="请输入注册邮箱"
              prefix-icon="el-icon-message"
            ></el-input>
          </el-form-item>

          <el-form-item>
            <el-button
              type="primary"
              class="app-btn app-btn-primary submit-btn"
              :loading="submitting"
              @click="handleSubmit"
            >
              发送重置邮件
            </el-button>
          </el-form-item>

          <el-alert
            v-if="success"
            type="success"
            :closable="false"
            class="success-tip"
            title="如果该邮箱已注册，我们会向其发送一封包含重置说明的邮件，请注意查收。"
          />

          <div class="back-login">
            <el-button type="text" @click="goLogin">
              返回登录
            </el-button>
          </div>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ForgotPasswordView',
  data() {
    return {
      form: {
        email: ''
      },
      submitting: false,
      success: false,
      rules: {
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    handleSubmit() {
      this.$refs.form.validate(valid => {
        if (!valid) return
        this.submitting = true
        // 仅做前端模拟，不实际调用后端
        setTimeout(() => {
          this.submitting = false
          this.success = true
        }, 800)
      })
    },
    goLogin() {
      this.$router.push('/login')
    }
  }
}
</script>

<style scoped>
.forgot-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #0a0e27 0%, #1a1f3a 100%);
}

.forgot-container {
  width: 420px;
  padding: 32px 28px;
  border-radius: 16px;
  background: rgba(15, 23, 42, 0.92);
  box-shadow: 0 20px 40px rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(148, 163, 184, 0.35);
}

.title {
  font-size: 22px;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 8px;
}

.subtitle {
  font-size: 13px;
  line-height: 1.6;
  color: rgba(226, 232, 240, 0.85);
  margin-bottom: 20px;
}

.submit-btn {
  width: 100%;
}

.success-tip {
  margin-top: 4px;
}

.back-login {
  margin-top: 16px;
  text-align: center;
}

.back-login .el-button {
  color: #00d4ff;
}
</style>

