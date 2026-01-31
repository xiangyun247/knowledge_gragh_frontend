<template>
  <div class="user-profile-page">
    <div class="profile-container">
      <div class="profile-header">
        <div class="profile-header-top">
          <el-button
            type="default"
            icon="el-icon-back"
            @click="goBack"
            class="back-btn"
          >
            返回
          </el-button>
        </div>
        <h2 class="profile-title">个人中心</h2>
        <p class="profile-subtitle">查看和修改您的个人信息</p>
      </div>
      
      <div class="profile-content">
        <!-- 头像上传区域 -->
        <div class="avatar-section">
          <div class="avatar-container">
            <img 
              :src="localUserInfo.avatar" 
              alt="用户头像" 
              class="user-avatar"
              @error="handleAvatarError"
            />
            <div class="avatar-upload-overlay" @click="triggerFileInput" v-if="!avatarUploading">
              <i class="el-icon-camera"></i>
              <span>更换头像</span>
            </div>
            <div class="avatar-upload-overlay" v-if="avatarUploading">
              <i class="el-icon-loading"></i>
              <span>上传中...</span>
            </div>
            <input 
              type="file" 
              ref="fileInput" 
              class="avatar-file-input" 
              accept="image/jpeg,image/png,image/jpg" 
              @change="handleAvatarUpload"
            />
          </div>
          <p class="avatar-tip">支持 JPG、PNG 格式，建议尺寸 200x200px，最大 2MB</p>
        </div>
        
        <!-- 个人信息表单 -->
        <div class="info-section">
          <el-form :model="localUserInfo" :rules="formRules" ref="userForm" label-position="top" class="profile-form">
            <el-form-item label="用户名" prop="username">
              <el-input v-model="localUserInfo.username" placeholder="请输入用户名" maxlength="20" />
            </el-form-item>
            
            <el-form-item label="真实姓名" prop="realName">
              <el-input v-model="localUserInfo.realName" placeholder="请输入真实姓名" maxlength="10" />
            </el-form-item>
            
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="localUserInfo.email" placeholder="请输入邮箱" maxlength="50" />
            </el-form-item>
            
            <el-form-item label="手机号" prop="phone">
              <el-input v-model="localUserInfo.phone" placeholder="请输入手机号" maxlength="11" />
            </el-form-item>
            
            <el-form-item label="性别" prop="gender">
              <el-radio-group v-model="localUserInfo.gender">
                <el-radio label="男">男</el-radio>
                <el-radio label="女">女</el-radio>
                <el-radio label="保密">保密</el-radio>
              </el-radio-group>
            </el-form-item>
            
            <el-form-item label="部门" prop="department">
              <el-input v-model="localUserInfo.department" placeholder="请输入所在部门" maxlength="20" />
            </el-form-item>
            
            <el-form-item label="职位" prop="position">
              <el-input v-model="localUserInfo.position" placeholder="请输入职位" maxlength="20" />
            </el-form-item>
            
            <el-form-item label="个人简介" prop="bio">
              <el-input 
                v-model="localUserInfo.bio" 
                type="textarea" 
                placeholder="请输入个人简介" 
                maxlength="200" 
                :rows="4"
              />
            </el-form-item>
            
            <el-form-item>
              <div class="form-actions">
                <el-button type="primary" @click="handleSubmit" :loading="isSubmitting">保存修改</el-button>
                <el-button @click="resetForm">重置</el-button>
              </div>
            </el-form-item>
          </el-form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'UserProfile',
  data() {
    return {
      formRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 2, max: 20, message: '用户名长度在 2 到 20 个字符', trigger: 'blur' }
        ],
        email: [
          { type: 'email', message: '请输入有效的邮箱地址', trigger: 'blur' },
          { max: 50, message: '邮箱长度不能超过 50 个字符', trigger: 'blur' }
        ],
        phone: [
          { pattern: /^1[3456789]\d{9}$/, message: '请输入有效的手机号', trigger: 'blur' }
        ]
      },
      isSubmitting: false,
      avatarUploading: false
    }
  },
  computed: {
    ...mapGetters(['userInfo']),
    // 创建本地用户信息副本，用于表单编辑
    localUserInfo() {
      return {
        username: this.userInfo.username || '',
        realName: this.userInfo.realName || '',
        email: this.userInfo.email || '',
        phone: this.userInfo.phone || '',
        gender: this.userInfo.gender || '保密',
        department: this.userInfo.department || '',
        position: this.userInfo.position || '',
        bio: this.userInfo.bio || '',
        avatar: this.userInfo.avatar || this.getDefaultAvatar()
      }
    }
  },
  methods: {
    ...mapActions('user', ['updateUserInfo']),

    // 返回上一页或首页
    goBack() {
      if (window.history.length > 1) {
        this.$router.go(-1);
      } else {
        this.$router.push('/');
      }
    },
    
    // 获取默认头像
    getDefaultAvatar() {
      // 使用 SVG 数据 URI 作为默认头像
      return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxMDAiIGN5PSIxMDAiIHI9IjEwMCIgZmlsbD0iIzAwZDRmZiIgb3BhY2l0eT0iMC4yIi8+PHBhdGggZD0iTTEwMCAxMDBjMjcuNiAwIDUwIDIyLjQgNTAgNTBzLTIyLjQgNTAtNTAgNTAtNTAtMjIuNC01MC01MCAyMi40LTUwIDUwLTUwem0wIDIwYy0xNi42IDAtMzAgMTMuNC0zMCAzMHMxMy40IDMwIDMwIDMwIDMwLTEzLjQgMzAtMzAtMTMuNC0zMC0zMC0zMHoiIGZpbGw9IiMwMGQ0ZmYiLz48L3N2Zz4='
    },
    
    // 处理头像加载错误
    handleAvatarError(event) {
      // 如果头像加载失败，使用默认头像
      event.target.src = this.getDefaultAvatar()
    },
    
    // 触发文件选择
    triggerFileInput() {
      this.$refs.fileInput.click()
    },
    
    // 处理头像上传
    handleAvatarUpload(e) {
      const file = e.target.files[0]
      if (!file) return
      
      // 验证文件类型和大小
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg']
      const maxSize = 2 * 1024 * 1024 // 2MB
      
      if (!validTypes.includes(file.type)) {
        this.$message.error('请选择 JPG 或 PNG 格式的图片')
        e.target.value = ''
        return
      }
      
      if (file.size > maxSize) {
        this.$message.error('图片大小不能超过 2MB')
        e.target.value = ''
        return
      }
      
      this.avatarUploading = true
      
      // 读取文件为 base64
      const reader = new FileReader()
      reader.onload = async (event) => {
        try {
          const avatarDataUrl = event.target.result
          
          // 立即更新本地显示
          const updatedUserInfo = {
            ...this.userInfo,
            avatar: avatarDataUrl
          }
          
          // 同步更新到 Vuex store
          await this.updateUserInfo(updatedUserInfo)
          
          this.$message.success('头像上传成功')
        } catch (error) {
          console.error('头像上传失败:', error)
          this.$message.error('头像上传失败，请重试')
        } finally {
          this.avatarUploading = false
          // 清空文件输入，以便再次选择同一文件
          e.target.value = ''
        }
      }
      
      reader.onerror = () => {
        this.$message.error('图片读取失败，请重试')
        this.avatarUploading = false
        e.target.value = ''
      }
      
      reader.readAsDataURL(file)
    },
    
    // 提交表单
    handleSubmit() {
      this.$refs.userForm.validate(async (valid) => {
        if (valid) {
          this.isSubmitting = true
          
          try {
            // 更新用户信息到 Vuex store
            await this.updateUserInfo(this.localUserInfo)
            this.$message.success('个人信息更新成功')
          } catch (error) {
            console.error('更新失败:', error)
            this.$message.error('个人信息更新失败，请重试')
          } finally {
            this.isSubmitting = false
          }
        } else {
          this.$message.error('请完善表单信息')
          return false
        }
      })
    },
    
    // 重置表单
    resetForm() {
      this.$refs.userForm.resetFields()
      // 重置为 Vuex store 中的原始数据
      this.$refs.userForm.clearValidate()
    }
  },
  mounted() {
    // 如果用户信息中没有头像，设置默认头像
    if (!this.userInfo.avatar) {
      this.updateUserInfo({
        ...this.userInfo,
        avatar: this.getDefaultAvatar()
      })
    }
  }
}
</script>

<style scoped>
.user-profile-page {
  min-height: 100vh;
  padding: 20px;
  background-color: var(--primary-dark);
  color: var(--text-primary);
}

.profile-container {
  max-width: 800px;
  margin: 0 auto;
  background: var(--secondary-dark);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  padding: 30px;
  border: 1px solid var(--border-primary);
}

.profile-header {
  text-align: center;
  margin-bottom: 30px;
}

.profile-header-top {
  display: flex;
  justify-content: flex-start;
  margin-bottom: 16px;
}

.back-btn {
  color: var(--text-primary);
  border-color: var(--border-primary);
  background: var(--bg-secondary);
}

.back-btn:hover {
  color: var(--primary-blue);
  border-color: var(--primary-blue);
  background: rgba(0, 212, 255, 0.08);
}

.profile-header h2.profile-title {
  position: relative;
  font-size: 28px;
  font-weight: 600;
  margin-bottom: 10px;
  color: var(--text-primary);
}

/* 个人中心标题下装饰条：使用青绿/蓝绿配色，去掉蓝紫发光 */
.profile-header h2.profile-title::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 60px;
  height: 3px;
  background: linear-gradient(90deg, #0d9488 0%, #0ea5e9 100%);
  border-radius: 2px;
  opacity: 0.9;
  animation: none;
}

.profile-subtitle {
  color: var(--text-secondary);
  font-size: 16px;
}

.profile-content {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

/* 头像区域 */
.avatar-section {
  text-align: center;
}

.avatar-container {
  position: relative;
  width: 150px;
  height: 150px;
  margin: 0 auto 15px;
  cursor: pointer;
}

.user-avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid var(--border-primary);
  box-shadow: 0 4px 15px rgba(0, 212, 255, 0.2);
  transition: all 0.3s ease;
  background-color: var(--bg-secondary);
  display: block;
}

.user-avatar:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 20px rgba(0, 212, 255, 0.3);
}

.user-avatar[src=""],
.user-avatar:not([src]) {
  background-image: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxMDAiIGN5PSIxMDAiIHI9IjEwMCIgZmlsbD0iIzAwZDRmZiIgb3BhY2l0eT0iMC4yIi8+PHBhdGggZD0iTTEwMCAxMDBjMjcuNiAwIDUwIDIyLjQgNTAgNTBzLTIyLjQgNTAtNTAgNTAtNTAtMjIuNC01MC01MCAyMi40LTUwIDUwLTUwem0wIDIwYy0xNi42IDAtMzAgMTMuNC0zMCAzMHMxMy40IDMwIDMwIDMwIDMwLTEzLjQgMzAtMzAtMTMuNC0zMC0zMC0zMHoiIGZpbGw9IiMwMGQ0ZmYiLz48L3N2Zz4=');
  background-size: cover;
  background-position: center;
}

.avatar-upload-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  color: #ffffff;
}

.avatar-container:hover .avatar-upload-overlay {
  opacity: 1;
}

.avatar-upload-overlay i {
  font-size: 24px;
  margin-bottom: 5px;
}

.avatar-upload-overlay span {
  font-size: 14px;
}

.avatar-file-input {
  display: none;
}

.avatar-tip {
  color: var(--text-secondary);
  font-size: 13px;
  margin-top: 5px;
}

/* 信息表单区域 */
.info-section {
  background: rgba(26, 31, 58, 0.5);
  border-radius: var(--radius-md);
  padding: 20px;
  border: 1px solid var(--border-primary);
}

.profile-form {
  max-width: 600px;
  margin: 0 auto;
}

.el-form-item {
  margin-bottom: 20px;
}

.el-form-item__label {
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.el-input__inner, .el-textarea__inner {
  background-color: rgba(26, 31, 58, 0.7);
  border-color: var(--border-primary);
  color: var(--text-primary);
  border-radius: var(--radius-md);
  transition: all 0.3s ease;
}

.el-input__inner:focus, .el-textarea__inner:focus {
  border-color: var(--border-glow);
  box-shadow: 0 0 0 2px rgba(0, 212, 255, 0.2);
  background-color: rgba(26, 31, 58, 0.9);
}

.el-radio__input.is-checked .el-radio__inner {
  border-color: var(--primary-blue);
  background-color: var(--primary-blue);
}

.el-radio__input.is-checked + .el-radio__label {
  color: var(--primary-blue);
}

/* 表单按钮 */
.form-actions {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 30px;
}

.el-button--primary {
  background: linear-gradient(135deg, #00d4ff 0%, #0080ff 100%);
  border: none;
  padding: 10px 30px;
  font-size: 16px;
  font-weight: 500;
  border-radius: var(--radius-md);
  transition: all 0.3s ease;
}

.el-button--primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 212, 255, 0.4);
  background: linear-gradient(135deg, #0080ff 0%, #00d4ff 100%);
}

.el-button {
  padding: 10px 30px;
  font-size: 16px;
  border-radius: var(--radius-md);
  transition: all 0.3s ease;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .profile-container {
    padding: 20px;
    margin: 10px;
  }
  
  .profile-header h2.profile-title {
    font-size: 24px;
  }
  
  .avatar-container {
    width: 120px;
    height: 120px;
  }
  
  .form-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .el-button {
    width: 100%;
    max-width: 200px;
  }
}
</style>