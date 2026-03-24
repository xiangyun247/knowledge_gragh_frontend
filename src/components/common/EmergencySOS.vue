<template>
  <div class="sos-wrapper" v-if="visible">
    <!-- 悬浮按钮 -->
    <div
      class="sos-fab"
      :class="{ expanded: isExpanded, pulsing: !isExpanded }"
      @click="handleFabClick"
      @touchstart.prevent="onTouchStart"
      @touchend.prevent="onTouchEnd"
      :style="fabStyle"
    >
      <i class="el-icon-phone-outline" v-if="!isExpanded"></i>
      <i class="el-icon-close" v-else></i>
      <span class="sos-label" v-if="!isExpanded">求助</span>
    </div>

    <!-- 展开面板 -->
    <transition name="sos-panel">
      <div class="sos-panel" v-if="isExpanded">
        <div class="sos-panel-header">
          <i class="el-icon-warning-outline"></i>
          <span>紧急求助</span>
        </div>

        <!-- 快捷拨号 -->
        <div class="sos-contacts">
          <div
            v-for="(c, idx) in contacts"
            :key="idx"
            class="sos-contact-btn"
            @click="callContact(c)"
          >
            <div class="sos-contact-icon">
              <i :class="c.icon"></i>
            </div>
            <div class="sos-contact-info">
              <div class="sos-contact-name">{{ c.name }}</div>
              <div class="sos-contact-phone">{{ c.phone }}</div>
            </div>
            <i class="el-icon-phone sos-call-icon"></i>
          </div>
        </div>

        <!-- 120 急救 -->
        <div class="sos-emergency-btn" @click="call120">
          <i class="el-icon-first-aid-kit"></i>
          <span>拨打 120 急救</span>
        </div>

        <!-- 设置入口 -->
        <div class="sos-settings-link" @click="goSettings">
          <i class="el-icon-setting"></i>
          <span>设置紧急联系人</span>
        </div>

        <!-- 最近求助记录 -->
        <div class="sos-log" v-if="recentLog">
          <span class="sos-log-text">上次求助：{{ recentLog }}</span>
        </div>
      </div>
    </transition>

    <!-- 遮罩 -->
    <div class="sos-overlay" v-if="isExpanded" @click="close"></div>

    <!-- 长按确认弹窗 -->
    <el-dialog
      title="确认拨打"
      :visible.sync="confirmVisible"
      width="340px"
      :close-on-click-modal="false"
      append-to-body
      modal-append-to-body
      class="sos-confirm-dialog"
    >
      <div class="sos-confirm-body">
        <p>即将拨打：</p>
        <div class="sos-confirm-target">
          <strong>{{ confirmTarget.name }}</strong>
          <span>{{ confirmTarget.phone }}</span>
        </div>
      </div>
      <span slot="footer" class="sos-confirm-footer">
        <el-button @click="confirmVisible = false">取消</el-button>
        <el-button type="danger" @click="doCall">确认拨打</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import dayjs from 'dayjs'

const SOS_CONTACTS_KEY = 'sos_emergency_contacts'
const SOS_LOG_KEY = 'sos_call_log'

export default {
  name: 'EmergencySOS',
  data() {
    return {
      isExpanded: false,
      confirmVisible: false,
      confirmTarget: { name: '', phone: '' },
      holdTimer: null,
      fabStyle: {}
    }
  },
  computed: {
    visible() {
      const route = this.$route
      if (!route) return false
      if (route.meta && route.meta.hideLayout) return false
      return true
    },
    contacts() {
      try {
        const saved = JSON.parse(localStorage.getItem(SOS_CONTACTS_KEY) || '[]')
        if (saved.length) return saved
      } catch { /* noop */ }
      return [
        { name: '家属1', phone: '请设置', icon: 'el-icon-user' },
        { name: '社区医生', phone: '请设置', icon: 'el-icon-first-aid-kit' }
      ]
    },
    recentLog() {
      try {
        const logs = JSON.parse(localStorage.getItem(SOS_LOG_KEY) || '[]')
        if (logs.length) {
          const last = logs[logs.length - 1]
          return `${dayjs(last.ts).format('M/D HH:mm')} 拨打了 ${last.name}`
        }
      } catch { /* noop */ }
      return ''
    }
  },
  methods: {
    handleFabClick() {
      if (this.isExpanded) {
        this.close()
      } else {
        this.isExpanded = true
      }
    },
    onTouchStart() {
      this.holdTimer = setTimeout(() => {
        this.quickSOS()
      }, 1500)
    },
    onTouchEnd() {
      if (this.holdTimer) {
        clearTimeout(this.holdTimer)
        this.holdTimer = null
        this.handleFabClick()
      }
    },
    quickSOS() {
      this.holdTimer = null
      const primary = this.contacts[0]
      if (primary && primary.phone && primary.phone !== '请设置') {
        this.confirmTarget = primary
        this.confirmVisible = true
      } else {
        this.call120()
      }
    },
    close() {
      this.isExpanded = false
    },
    callContact(c) {
      if (!c.phone || c.phone === '请设置') {
        this.$message.warning('请先在设置中添加紧急联系人电话')
        return
      }
      this.confirmTarget = c
      this.confirmVisible = true
    },
    call120() {
      this.confirmTarget = { name: '120 急救中心', phone: '120' }
      this.confirmVisible = true
    },
    doCall() {
      const target = { ...this.confirmTarget }
      this.confirmVisible = false
      this.isExpanded = false

      this.logCall(target)

      window.location.href = `tel:${target.phone}`
      this.$message.success(`正在拨打 ${target.name}（${target.phone}）`)
    },
    logCall(target) {
      try {
        const logs = JSON.parse(localStorage.getItem(SOS_LOG_KEY) || '[]')
        logs.push({ name: target.name, phone: target.phone, ts: Date.now() })
        if (logs.length > 20) logs.splice(0, logs.length - 20)
        localStorage.setItem(SOS_LOG_KEY, JSON.stringify(logs))
      } catch { /* noop */ }
    },
    goSettings() {
      this.isExpanded = false
      this.$router.push('/profile')
    }
  }
}
</script>

<style scoped>
/* 悬浮按钮 */
.sos-fab {
  position: fixed;
  right: 20px;
  bottom: 100px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, #f56c6c, #e63946);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 2px;
  font-size: 22px;
  cursor: pointer;
  box-shadow: 0 4px 20px rgba(245, 108, 108, 0.5);
  z-index: 9999;
  transition: all 0.3s ease;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}

.sos-fab.pulsing {
  animation: sosPulse 2s ease-in-out infinite;
}

.sos-fab:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 28px rgba(245, 108, 108, 0.65);
}

.sos-fab.expanded {
  background: rgba(60, 60, 60, 0.9);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
  width: 44px;
  height: 44px;
  font-size: 18px;
  right: 24px;
  bottom: 440px;
}

.sos-label {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 1px;
  line-height: 1;
}

@keyframes sosPulse {
  0%, 100% { box-shadow: 0 4px 20px rgba(245, 108, 108, 0.4); }
  50% { box-shadow: 0 4px 32px rgba(245, 108, 108, 0.7), 0 0 0 8px rgba(245, 108, 108, 0.15); }
}

/* 遮罩 */
.sos-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  z-index: 9997;
  backdrop-filter: blur(2px);
}

/* 面板 */
.sos-panel {
  position: fixed;
  right: 16px;
  bottom: 80px;
  width: 300px;
  background: var(--bg-popup);
  border: 1px solid rgba(245, 108, 108, 0.3);
  border-radius: 20px;
  padding: 20px;
  z-index: 9998;
  display: flex;
  flex-direction: column;
  gap: 14px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.5);
}

.sos-panel-enter-active,
.sos-panel-leave-active {
  transition: all 0.3s ease;
}
.sos-panel-enter,
.sos-panel-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}

.sos-panel-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 700;
  color: #f56c6c;
}

.sos-panel-header i {
  font-size: 22px;
}

/* 联系人按钮 */
.sos-contacts {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.sos-contact-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  cursor: pointer;
  transition: all 0.25s ease;
}

.sos-contact-btn:hover {
  background: rgba(245, 108, 108, 0.1);
  border-color: rgba(245, 108, 108, 0.3);
  transform: translateX(4px);
}

.sos-contact-btn:active {
  transform: scale(0.97);
}

.sos-contact-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(245, 108, 108, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: #f56c6c;
  flex-shrink: 0;
}

.sos-contact-info {
  flex: 1;
  min-width: 0;
}

.sos-contact-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
}

.sos-contact-phone {
  font-size: 13px;
  color: var(--text-muted);
}

.sos-call-icon {
  font-size: 20px;
  color: #f56c6c;
  flex-shrink: 0;
}

/* 120 按钮 */
.sos-emergency-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 14px;
  border-radius: 14px;
  background: linear-gradient(135deg, #f56c6c, #e63946);
  color: #fff;
  font-size: 17px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.25s ease;
  box-shadow: 0 4px 16px rgba(245, 108, 108, 0.3);
}

.sos-emergency-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 24px rgba(245, 108, 108, 0.5);
}

.sos-emergency-btn:active {
  transform: scale(0.97);
}

.sos-emergency-btn i {
  font-size: 20px;
}

/* 设置入口 */
.sos-settings-link {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.45);
  cursor: pointer;
  padding: 6px 0;
  transition: color 0.2s;
}

.sos-settings-link:hover {
  color: rgba(255, 255, 255, 0.8);
}

/* 求助记录 */
.sos-log {
  text-align: center;
  padding-top: 8px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.sos-log-text {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.3);
}

/* 确认弹窗 */
.sos-confirm-body {
  text-align: center;
  font-size: 15px;
  color: rgba(255, 255, 255, 0.85);
}

.sos-confirm-target {
  margin-top: 12px;
  padding: 14px;
  background: rgba(245, 108, 108, 0.1);
  border: 1px solid rgba(245, 108, 108, 0.25);
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.sos-confirm-target strong {
  font-size: 18px;
  color: var(--text-primary);
}

.sos-confirm-target span {
  font-size: 20px;
  font-weight: 700;
  color: #f56c6c;
  letter-spacing: 2px;
}

.sos-confirm-footer {
  display: flex;
  justify-content: center;
  gap: 12px;
}

@media (max-width: 400px) {
  .sos-panel {
    right: 8px;
    left: 8px;
    width: auto;
    bottom: 70px;
  }
  .sos-fab {
    right: 12px;
    bottom: 80px;
  }
  .sos-fab.expanded {
    bottom: 400px;
    right: 16px;
  }
}
</style>
