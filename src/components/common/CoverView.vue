<template>
  <div class="cover-container">
    <!-- 主内容区 -->
    <main class="cover-main">
      <!-- 左侧内容 -->
      <div class="main-left">
        <div class="brand-header">
          <img src="@/assets/images/logo1.png" alt="Logo" class="brand-logo" />
          <h1 class="brand-name">忆路康</h1>
        </div>
        <h2 class="main-title">认知健康管理平台</h2>
        <p class="main-subtitle">面向认知障碍老年人的智能照护系统</p>
        <div class="action-buttons">
          <router-link to="/chat" class="btn-primary">开始对话</router-link>
          <router-link to="/patient-education" class="btn-secondary">查看文档</router-link>
          <router-link to="/home" class="btn-enter">进入系统</router-link>
        </div>

        <!-- 底部快速入口 -->
        <div class="quick-links">
          <a href="#" class="quick-card">
            <i class="el-icon-video-camera"></i>
            <span>演示视频</span>
          </a>
          <a href="#" class="quick-card">
            <i class="el-icon-document"></i>
            <span>文档中心</span>
          </a>
          <a href="#" class="quick-card">
            <i class="el-icon-edit-outline"></i>
            <span>提交 Issue</span>
          </a>
          <a href="#" class="quick-card">
            <i class="el-icon-chat-dot-round"></i>
            <span>开发者线圈</span>
          </a>
        </div>
      </div>

      <!-- 右侧深色区域 + 卡片 -->
      <div class="main-right">
        <div class="stats-card">
          <div class="stat-row">
            <div class="stat-item">
              <i class="el-icon-star-on stat-icon"></i>
              <div class="stat-info">
                <div class="stat-number">{{ userCount }}+</div>
                <div class="stat-label">注册用户数</div>
                <div class="stat-desc">服务社区认可与支持</div>
              </div>
            </div>
            <div class="stat-item">
              <i class="el-icon-circle-check stat-icon"></i>
              <div class="stat-info">
                <div class="stat-number">{{ assessmentCount }}+</div>
                <div class="stat-label">完成评估次数</div>
                <div class="stat-desc">持续改进问题解决能力</div>
              </div>
            </div>
          </div>
          <div class="stat-row">
            <div class="stat-item">
              <i class="el-icon-data-line stat-icon"></i>
              <div class="stat-info">
                <div class="stat-number">{{ knowledgeNodes }}+</div>
                <div class="stat-label">累计知识节点</div>
                <div class="stat-desc">活跃的开发迭代和功能更新</div>
              </div>
            </div>
            <div class="stat-item">
              <i class="el-icon-lock stat-icon"></i>
              <div class="stat-info">
                <div class="stat-number">MIT 协议</div>
                <div class="stat-label">开源协议</div>
                <div class="stat-desc">完全免费，支持商业使用</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- 底部版权 -->
    <footer class="cover-footer">
      © 忆路康 2026 v1.0.0
    </footer>
  </div>
</template>

<script>
export default {
  name: 'CoverView',
  data() {
    return {
      userCount: '50+',
      assessmentCount: '1000+',
      knowledgeNodes: '8000+'
    }
  },
  mounted() {
    this.startNumberAnimation()
  },
  methods: {
    startNumberAnimation() {
      const numbers = document.querySelectorAll('.stat-number')
      numbers.forEach(number => {
        if (number.innerText.includes('MIT')) return
        
        const target = parseInt(number.innerText)
        let current = 0
        const increment = target / 100
        const timer = setInterval(() => {
          current += increment
          if (current >= target) {
            current = target
            clearInterval(timer)
          }
          number.innerText = Math.floor(current).toLocaleString() + '+'
        }, 20)
      })
    }
  }
}
</script>

<style scoped>
.cover-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f8fafc;
}

/* 主内容区 */
.cover-main {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 580px;
  position: relative;
  overflow: hidden;
}

.main-left {
  padding: 90px 70px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  z-index: 10;
  justify-content: center;
}

/* 品牌区域 */
.brand-header {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 8px;
}

.brand-logo {
  width: 56px;
  height: 56px;
  object-fit: contain;
}

.brand-name {
  font-size: 40px;
  font-weight: 800;
  color: #0f172a;
  margin: 0;
  letter-spacing: -0.02em;
}

.main-title {
  font-size: 56px;
  font-weight: 800;
  color: #1e293b;
  line-height: 1.2;
  margin: 0;
  letter-spacing: -0.03em;
}

.main-subtitle {
  font-size: 19px;
  color: #64748b;
  margin: 0;
  margin-top: 6px;
  line-height: 1.6;
}

.action-buttons {
  display: flex;
  gap: 14px;
  margin-top: 8px;
}

.btn-primary {
  padding: 14px 36px;
  border-radius: 8px;
  background: linear-gradient(135deg, #00f5d4, #00bbf9);
  color: #020617;
  font-weight: 600;
  font-size: 15px;
  text-decoration: none;
  transition: all 0.25s ease;
  box-shadow:
    0 4px 18px rgba(0, 245, 212, 0.3),
    0 0 35px rgba(0, 187, 249, 0.12);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow:
    0 8px 26px rgba(0, 245, 212, 0.45),
    0 0 55px rgba(0, 187, 249, 0.2);
}

.btn-secondary {
  padding: 14px 36px;
  border-radius: 8px;
  background: white;
  color: #475569;
  border: 1px solid #e2e8f0;
  font-weight: 600;
  font-size: 15px;
  text-decoration: none;
  transition: all 0.25s ease;
}

.btn-secondary:hover {
  border-color: #cbd5e1;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
  color: #334155;
}

.btn-enter {
  padding: 14px 36px;
  border-radius: 8px;
  background: linear-gradient(135deg, #0f172a, #1e293b);
  color: white;
  font-weight: 600;
  font-size: 15px;
  text-decoration: none;
  transition: all 0.25s ease;
  box-shadow:
    0 4px 18px rgba(15, 23, 42, 0.2),
    0 0 30px rgba(15, 23, 42, 0.08);
}

.btn-enter:hover {
  transform: translateY(-2px);
  box-shadow:
    0 8px 26px rgba(15, 23, 42, 0.35),
    0 0 50px rgba(15, 23, 42, 0.12);
}

/* 快速入口 */
.quick-links {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
  margin-top: auto;
  padding-top: 48px;
}

.quick-card {
  background: white;
  border-radius: 10px;
  padding: 18px 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.04);
  border: 1px solid #f1f5f9;
  transition: all 0.25s ease;
}

.quick-card:hover {
  box-shadow: 0 4px 16px rgba(0, 245, 212, 0.1);
  transform: translateY(-3px);
  border-color: rgba(0, 245, 212, 0.3);
}

.quick-card i {
  font-size: 22px;
  color: #00f5d4;
}

.quick-card span {
  font-size: 13px;
  font-weight: 500;
  color: #475569;
  text-align: center;
}

/* 右侧深色区域 */
.main-right {
  background:
    radial-gradient(circle at 25% 15%, rgba(0, 245, 212, 0.12), transparent 45%),
    radial-gradient(circle at 75% 85%, rgba(0, 187, 249, 0.08), transparent 40%),
    linear-gradient(145deg, #020617 0%, #0c1929 50%, #020617 100%);
  clip-path: polygon(18% 0, 100% 0, 100% 100%, 5% 100%);
  padding: 80px 80px 80px 140px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.main-right::before {
  content: '';
  position: absolute;
  top: -180px;
  right: -80px;
  width: 450px;
  height: 450px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(0, 245, 212, 0.06) 0%, transparent 65%);
  pointer-events: none;
}

.main-right::after {
  content: '';
  position: absolute;
  bottom: -120px;
  left: 60px;
  width: 350px;
  height: 350px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(0, 187, 249, 0.05) 0%, transparent 65%);
  pointer-events: none;
}

/* 右侧数据卡片 */
.stats-card {
  background: rgba(15, 23, 42, 0.75);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(0, 245, 212, 0.18);
  box-shadow:
    0 10px 40px rgba(0, 0, 0, 0.5),
    0 0 70px rgba(0, 245, 212, 0.07),
    inset 0 1px 0 rgba(255, 255, 255, 0.04);
  border-radius: 20px;
  padding: 40px;
  width: 100%;
  max-width: 460px;
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.stat-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 28px;
}

.stat-item {
  display: flex;
  gap: 14px;
  align-items: flex-start;
}

.stat-icon {
  font-size: 22px;
  color: #00f5d4;
  width: 22px;
  height: 22px;
  flex-shrink: 0;
  margin-top: 2px;
  filter: drop-shadow(0 0 8px rgba(0, 245, 212, 0.5));
}

.stat-info {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.stat-number {
  font-size: 28px;
  font-weight: 700;
  color: #f1f5f9;
  letter-spacing: -0.02em;
  text-shadow: 0 0 24px rgba(0, 245, 212, 0.25);
}

.stat-label {
  font-size: 13px;
  color: #94a3b8;
  font-weight: 500;
}

.stat-desc {
  font-size: 11px;
  color: rgba(148, 163, 184, 0.6);
  margin-top: 2px;
  line-height: 1.4;
}

/* 底部版权 */
.cover-footer {
  background: white;
  border-top: 1px solid #f1f5f9;
  padding: 18px;
  text-align: center;
  font-size: 13px;
  color: #94a3b8;
}

/* 响应式设计 */
@media (max-width: 1100px) {
  .cover-main {
    grid-template-columns: 1fr;
  }

  .main-right {
    clip-path: none;
    padding: 60px 40px;
    min-height: 400px;
  }

  .quick-links {
    grid-template-columns: repeat(2, 1fr);
  }

  .main-left {
    padding: 60px 40px;
  }

  .brand-name {
    font-size: 34px;
  }

  .main-title {
    font-size: 44px;
  }

  .main-right::before,
  .main-right::after {
    display: none;
  }
}

@media (max-width: 768px) {
  .quick-links {
    grid-template-columns: repeat(2, 1fr);
  }

  .action-buttons {
    flex-direction: column;
  }

  .btn-primary,
  .btn-secondary {
    text-align: center;
  }

  .main-left {
    padding: 40px 24px;
  }

  .brand-name {
    font-size: 30px;
  }

  .main-title {
    font-size: 38px;
  }

  .brand-logo {
    width: 44px;
    height: 44px;
  }
}
</style>