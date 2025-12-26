<template>
  <footer class="footer">
    <div class="container">
      <div class="footer-content">
        <div class="copyright-info">
          <span>&copy; {{ new Date().getFullYear() }} 医疗知识图谱系统. All Rights Reserved.</span>
        </div>
        <div class="footer-links">
          <a href="#" class="footer-link">关于我们</a>
          <span class="divider">|</span>
          <a href="#" class="footer-link">隐私政策</a>
          <span class="divider">|</span>
          <a href="#" class="footer-link">服务条款</a>
          <span class="divider">|</span>
          <a href="#" class="footer-link">联系我们</a>
        </div>
        <div class="technical-support">
          <span>技术支持：<span class="support-team">AI医疗技术团队</span></span>
        </div>
      </div>
    </div>
  </footer>
</template>

<script>
export default {
  name: 'Footer'
}
</script>

<style>
.footer {
  background-color: rgba(10, 14, 39, 0.85);
  backdrop-filter: blur(10px);
  border-top: 1px solid rgba(0, 212, 255, 0.2);
  padding: 15px 0;
  margin-top: auto;
  position: relative;
  z-index: 100;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px;
}

.footer-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
}

.copyright-info {
  text-align: center;
}

.footer-links {
  display: flex;
  gap: 8px;
  align-items: center;
}

.footer-link {
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  transition: all 0.3s ease;
  position: relative;
}

.footer-link:hover {
  color: var(--primary-blue);
  text-shadow: 0 0 10px rgba(0, 212, 255, 0.5);
}

.footer-link::after {
  content: '';
  position: absolute;
  width: 0;
  height: 1px;
  bottom: -2px;
  left: 0;
  background-color: var(--primary-blue);
  transition: width 0.3s ease;
}

.footer-link:hover::after {
  width: 100%;
}

.divider {
  color: rgba(0, 212, 255, 0.3);
}

.technical-support {
  text-align: center;
}

.support-team {
  color: var(--primary-blue);
  font-weight: 500;
  text-shadow: 0 0 10px rgba(0, 212, 255, 0.5);
}
</style>
