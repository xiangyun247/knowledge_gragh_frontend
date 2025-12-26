<template>
  <div class="user-profile-page">
    <div class="profile-container">
      <div class="profile-header">
        <h2>个人中心</h2>
        <p class="profile-subtitle">查看和修改您的个人信息</p>
      </div>
      
      <div class="profile-content">
        <!-- 头像上传区域 -->
        <div class="avatar-section">
          <div class="avatar-container">
            <img :src="userInfo.avatar" alt="用户头像" class="user-avatar" />
            <div class="avatar-upload-overlay" @click="triggerFileInput">
              <i class="el-icon-camera"></i>
              <span>更换头像</span>
            </div>
            <input 
              type="file" 
              ref="fileInput" 
              class="avatar-file-input" 
              accept="image/*" 
              @change="handleAvatarUpload"
            />
          </div>
          <p class="avatar-tip">支持 JPG、PNG 格式，建议尺寸 200x200px</p>
        </div>
        
        <!-- 个人信息表单 -->
        <div class="info-section">
          <el-form :model="userInfo" :rules="formRules" ref="userForm" label-position="top" class="profile-form">
            <el-form-item label="用户名" prop="username">
              <el-input v-model="userInfo.username" placeholder="请输入用户名" maxlength="20" />
            </el-form-item>
            
            <el-form-item label="真实姓名" prop="realName">
              <el-input v-model="userInfo.realName" placeholder="请输入真实姓名" maxlength="10" />
            </el-form-item>
            
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="userInfo.email" placeholder="请输入邮箱" maxlength="50" />
            </el-form-item>
            
            <el-form-item label="手机号" prop="phone">
              <el-input v-model="userInfo.phone" placeholder="请输入手机号" maxlength="11" />
            </el-form-item>
            
            <el-form-item label="性别" prop="gender">
              <el-radio-group v-model="userInfo.gender">
                <el-radio label="男">男</el-radio>
                <el-radio label="女">女</el-radio>
                <el-radio label="保密">保密</el-radio>
              </el-radio-group>
            </el-form-item>
            
            <el-form-item label="部门" prop="department">
              <el-input v-model="userInfo.department" placeholder="请输入所在部门" maxlength="20" />
            </el-form-item>
            
            <el-form-item label="职位" prop="position">
              <el-input v-model="userInfo.position" placeholder="请输入职位" maxlength="20" />
            </el-form-item>
            
            <el-form-item label="个人简介" prop="bio">
              <el-input 
                v-model="userInfo.bio" 
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
export default {
  name: 'UserProfile',
  data() {
    return {
      userInfo: {
        username: 'admin',
        realName: '管理员',
        email: 'admin@example.com',
        phone: '13800138000',
        gender: '男',
        department: '技术部',
        position: '系统管理员',
        bio: '负责医疗知识图谱系统的管理和维护工作',
        avatar: require('@/assets/images/default-avatar.svg')
      },
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
      isSubmitting: false
    }
  },
  methods: {
    // 触发文件选择
    triggerFileInput() {
      this.$refs.fileInput.click()
    },
    
    // 处理头像上传
    handleAvatarUpload(e) {
      const file = e.target.files[0]
      if (!file) return
      
      // 验证文件类型和大小
      const validTypes = ['image/jpeg', 'image/png']
      const maxSize = 2 * 1024 * 1024 // 2MB
      
      if (!validTypes.includes(file.type)) {
        this.$message.error('请选择 JPG 或 PNG 格式的图片')
        return
      }
      
      if (file.size > maxSize) {
        this.$message.error('图片大小不能超过 2MB')
        return
      }
      
      // 预览头像
      const reader = new FileReader()
      reader.onload = (event) => {
        this.userInfo.avatar = event.target.result
        this.$message.success('头像上传成功')
      }
      reader.readAsDataURL(file)
      
      // 清空文件输入，以便再次选择同一文件
      e.target.value = ''
    },
    
    // 提交表单
    handleSubmit() {
      this.$refs.userForm.validate((valid) => {
        if (valid) {
          this.isSubmitting = true
          
          // 模拟API请求
          setTimeout(() => {
            this.isSubmitting = false
            this.$message.success('个人信息更新成功')
          }, 1500)
        } else {
          this.$message.error('请完善表单信息')
          return false
        }
      })
    },
    
    // 重置表单
    resetForm() {
      this.$refs.userForm.resetFields()
    }
  },
  mounted() {
    // 检查是否存在默认头像文件，如果不存在则使用占位符
    try {
      require('@/assets/images/default-avatar.svg')
    } catch (error) {
      // 如果默认头像不存在，使用占位符
      this.userInfo.avatar = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTAwIDEwMGMyNy42IDEwMCA1MCAzMi40IDUwIDYwcy0yMi40IDUwLTUwIDUwLTUwLTIyLjQtNTAtNjAgMjIuNC02MCA1MC02MHoiIGZpbGw9IiMwMGRmZmYiIG9wYWNpdHk9Ii4zIi8+PHJlY3QgeD0iNjAiIHk9IjgwIiB3aWR0aD0iODAiIGhlaWdodD0iODAiIHJ4PSIyMCIgZmlsbD0idXJsKCNwYXRoKSIvPjxwYXRoIGQ9Ik0xMDAgMTYwYzEwLjUgMCAxOS04LjUgMTktMTlzLTguNS0xOS0xOS0xOS0xOSA4LjUtMTkgMTkgOC41IDE5IDE5IDE5em0wLTM4Yy03LjcgMC0xNC02LjMgMTQtMTQgNi4zLTE0IDE0LTYuMyAxNCAxNC02LjMgMTQtMTQgNi4zLTE0IDE0eiIgZmlsbD0iIzAwZDRmZiIvPjwvc3ZnPg=='
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

.profile-header h2 {
  font-size: 28px;
  font-weight: 600;
  margin-bottom: 10px;
  color: var(--text-primary);
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
}

.user-avatar:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 20px rgba(0, 212, 255, 0.3);
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
  
  .profile-header h2 {
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