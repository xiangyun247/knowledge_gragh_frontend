<template>
  <div class="landing">
    <!-- 背景层 -->
    <div class="landing-bg"></div>

    <!-- 主内容区 -->
    <main class="landing-main">
      <!-- 品牌 -->
      <header class="brand">
        <div class="brand-logo">
          <span class="logo-icon">🧠</span>
          <h1 class="brand-name">忆路康</h1>
        </div>
        <p class="brand-tagline">面向认知障碍老年人的智能辅助系统</p>
      </header>

      <!-- 核心行动区 -->
      <section class="actions">
        <router-link to="/chat" class="action-btn primary">
          <i class="el-icon-chat-dot-round"></i>
          开始使用
        </router-link>
        <router-link to="/graph" class="action-btn ghost">
          知识图谱
        </router-link>
      </section>

      <!-- 底部导航链接 -->
      <nav class="quick-nav">
        <router-link to="/assessment/cognitive-load" class="nav-item">认知评估</router-link>
        <span class="nav-sep">·</span>
        <router-link to="/search" class="nav-item">知识搜索</router-link>
        <span class="nav-sep">·</span>
        <a href="#" class="nav-item">使用指南</a>
      </nav>
    </main>

    <!-- 页脚 -->
    <footer class="landing-footer">
      <span>智护银龄 · 认知辅助系统</span>
      <span class="footer-dot">·</span>
      <span>基于知识图谱与多模态融合技术</span>
    </footer>
  </div>
</template>

<script>
export default {
  name: 'Home'
}
</script>

<style scoped>
/* ===== 容器 & 布局 ===== */
.landing {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

/* 背景：极简渐变 */
.landing-bg {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse 80% 60% at 50% -10%, rgba(0, 119, 182, 0.12) 0%, transparent 70%),
    linear-gradient(180deg, var(--bg-deep, #080e1c) 0%, var(--bg-base, #0b1224) 100%);
  z-index: 0;
}

/* ===== 主内容 ===== */
.landing-main {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 40px;
  padding: 40px 24px;
  animation: fadeIn 0.8s ease-out;
}

/* ===== 品牌 ===== */
.brand {
  text-align: center;
}

.brand-logo {
  display: inline-flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 20px;
}

.logo-icon {
  font-size: 42px;
  line-height: 1;
  filter: drop-shadow(0 2px 8px rgba(0, 187, 249, 0.25));
}

.brand-name {
  font-size: 32px;
  font-weight: 700;
  color: var(--text-primary, #ffffff);
  letter-spacing: 3px;
  margin: 0;
}

.brand-tagline {
  font-size: 17px;
  color: var(--text-muted, rgba(255,255,255,0.55));
  max-width: 380px;
  margin: 0 auto;
  line-height: 1.7;
  letter-spacing: 0.5px;
}

/* ===== 行动按钮 ===== */
.actions {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  justify-content: center;
  margin-top: 8px;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 14px 36px;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.22s ease;
  cursor: pointer;
  letter-spacing: 0.5px;
}

.action-btn.primary {
  background: linear-gradient(135deg, #0077b6, #00a8e8);
  color: #fff;
  border: none;
  box-shadow: 0 4px 20px rgba(0, 119, 182, 0.35), inset 0 1px 0 rgba(255,255,255,0.15);
}

.action-btn.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(0, 119, 182, 0.5), inset 0 1px 0 rgba(255,255,255,0.2);
}

.action-btn.primary:active {
  transform: translateY(0);
  box-shadow: 0 2px 10px rgba(0, 119, 182, 0.35);
}

.action-btn.ghost {
  background: rgba(255, 255, 255, 0.06);
  color: var(--text-muted, rgba(255,255,255,0.7));
  border: 1px solid rgba(255, 255, 255, 0.12);
}

.action-btn.ghost:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  border-color: rgba(255, 255, 255, 0.2);
}

/* ===== 快捷导航 ===== */
.quick-nav {
  display: flex;
  align-items: center;
  gap: 14px;
  font-size: 14px;
}

.nav-item {
  color: var(--text-muted, rgba(255,255,255,0.45));
  text-decoration: none;
  transition: color 0.2s ease;
  letter-spacing: 0.3px;
}

.nav-item:hover {
  color: var(--text-primary, #ffffff);
}

.nav-sep {
  color: rgba(255, 255, 255, 0.15);
  user-select: none;
}

/* ===== 页脚 ===== */
.landing-footer {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.25);
  margin-top: auto;
  padding-bottom: 28px;
  letter-spacing: 0.5px;
}

.footer-dot {
  opacity: 0.4;
}

/* ===== 动画 ===== */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* ===== 响应式 ===== */
@media (max-width: 640px) {
  .logo-icon {
    font-size: 36px;
  }
  .brand-name {
    font-size: 26px;
    letter-spacing: 2px;
  }
  .brand-tagline {
    font-size: 15px;
  }
  .actions {
    flex-direction: column;
    width: 100%;
    max-width: 280px;
  }
  .action-btn {
    width: 100%;
    justify-content: center;
    padding: 14px 24px;
  }
  .quick-nav {
    font-size: 13px;
    gap: 10px;
  }
  .landing-footer {
    font-size: 12px;
    flex-wrap: wrap;
    justify-content: center;
    padding: 0 24px 24px;
  }
}
</style>
