<template>
  <div class="family-report">
    <!-- 页头 -->
    <div class="report-header">
      <h1 class="report-title">家属照护周报</h1>
      <p class="report-period">{{ periodLabel }}</p>
    </div>

    <!-- 总体状态卡 -->
    <div :class="['status-card', statusLevel]">
      <div class="status-icon-wrap">
        <i :class="statusIcon"></i>
      </div>
      <div class="status-body">
        <div class="status-text">{{ statusText }}</div>
        <div class="status-sub">{{ statusSub }}</div>
      </div>
    </div>

    <!-- 服药情况 -->
    <div class="section-card">
      <h2 class="section-label">本周服药情况</h2>
      <div class="med-summary" v-if="medStats.totalExpected > 0">
        <div class="med-ring-wrap">
          <svg class="med-ring" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="10" />
            <circle cx="60" cy="60" r="52" fill="none" :stroke="medRingColor" stroke-width="10"
              stroke-linecap="round" :stroke-dasharray="medDash" stroke-dashoffset="0"
              transform="rotate(-90 60 60)" />
          </svg>
          <div class="med-ring-text">
            <span class="med-ring-pct">{{ medStats.rate }}%</span>
            <span class="med-ring-label">完成率</span>
          </div>
        </div>
        <div class="med-detail">
          <div class="med-detail-row">
            <span class="md-label">应服次数</span>
            <span class="md-value">{{ medStats.totalExpected }}</span>
          </div>
          <div class="med-detail-row">
            <span class="md-label">已确认服用</span>
            <span class="md-value highlight">{{ medStats.totalTaken }}</span>
          </div>
          <div class="med-detail-row">
            <span class="md-label">漏服次数</span>
            <span :class="['md-value', medStats.missed > 0 ? 'warn' : '']">{{ medStats.missed }}</span>
          </div>
        </div>
      </div>
      <div v-else class="section-empty">本周暂无服药记录</div>
    </div>

    <!-- 认知负荷状态 -->
    <div class="section-card">
      <h2 class="section-label">认知状态评估</h2>
      <div v-if="cogStats.hasData" class="cog-summary">
        <div class="cog-gauge">
          <div class="cog-gauge-bar">
            <div class="cog-gauge-fill" :style="{ width: cogGaugeWidth, background: cogGaugeColor }"></div>
            <div class="cog-gauge-marker" :style="{ left: cogGaugeWidth }"></div>
          </div>
          <div class="cog-gauge-labels">
            <span>轻松</span>
            <span>适中</span>
            <span>吃力</span>
          </div>
        </div>
        <div class="cog-score-row">
          <span class="cog-score-label">本周问卷平均分</span>
          <span class="cog-score-value">{{ cogStats.avgScore }} <small>/ 5</small></span>
        </div>
        <div class="cog-trend-row" v-if="cogStats.trend">
          <i :class="cogStats.trend === 'up' ? 'el-icon-top' : cogStats.trend === 'down' ? 'el-icon-bottom' : 'el-icon-minus'"></i>
          <span>{{ cogStats.trendText }}</span>
        </div>
        <div class="cog-detail-row">
          <span>本周完成任务 <strong>{{ cogStats.tasks }}</strong> 个，填写问卷 <strong>{{ cogStats.questionnaires }}</strong> 份</span>
        </div>
      </div>
      <div v-else class="section-empty">本周暂无认知评估数据</div>
    </div>

    <!-- 近期活动 -->
    <div class="section-card">
      <h2 class="section-label">近期活动记录</h2>
      <div v-if="recentActivities.length" class="activity-list">
        <div v-for="(act, idx) in recentActivities" :key="idx" class="activity-item">
          <div class="activity-dot" :style="{ background: act.color }"></div>
          <div class="activity-body">
            <div class="activity-text">{{ act.text }}</div>
            <div class="activity-time">{{ act.time }}</div>
          </div>
        </div>
      </div>
      <div v-else class="section-empty">暂无近期活动</div>
    </div>

    <!-- 温馨提示 -->
    <div class="section-card tips-card">
      <h2 class="section-label">给您的建议</h2>
      <div class="tips-list">
        <div v-for="(tip, idx) in tips" :key="idx" class="tip-item">
          <i class="el-icon-chat-line-round"></i>
          <span>{{ tip }}</span>
        </div>
      </div>
    </div>

    <div class="report-footer">
      <p>本报告由「智护银龄」认知减负引擎自动生成</p>
      <p>数据来源：本地行为埋点 + 问卷反馈 · {{ generatedAt }}</p>
    </div>
  </div>
</template>

<script>
import dayjs from 'dayjs'
import { getCognitiveEvents, getCognitiveQuestionnaires } from '@/utils/cognitiveLoad'

const MED_STORAGE_MEDS = 'medication_list'
const MED_STORAGE_RECORDS = 'medication_records'
const FAMILY_REPORT_VIEWED_WEEK_KEY = 'family_report_viewed_week_start'

function getWeekRange() {
  const now = dayjs()
  const start = now.startOf('week')
  const end = now.endOf('week')
  return { start, end, startMs: start.valueOf(), endMs: end.valueOf() }
}

function freqTimes(freq) {
  return { qd: 1, bid: 2, tid: 3, prn: 1 }[freq] || 1
}

export default {
  name: 'FamilyReportView',
  data() {
    return {
      medications: [],
      medRecords: [],
      events: [],
      questionnaires: []
    }
  },
  computed: {
    periodLabel() {
      const w = getWeekRange()
      return `${w.start.format('M月D日')} — ${w.end.format('M月D日')}`
    },
    generatedAt() {
      return dayjs().format('YYYY-MM-DD HH:mm')
    },

    // ---- 服药统计 ----
    medStats() {
      const w = getWeekRange()
      const daysInWeek = 7
      let totalExpected = 0
      for (const med of this.medications) {
        totalExpected += freqTimes(med.frequency) * daysInWeek
      }
      const weekRecords = this.medRecords.filter(r => {
        const d = dayjs(r.date)
        return d.isAfter(w.start.subtract(1, 'day')) && d.isBefore(w.end.add(1, 'day'))
      })
      const totalTaken = weekRecords.length
      const missed = Math.max(0, totalExpected - totalTaken)
      const rate = totalExpected > 0 ? Math.min(100, Math.round((totalTaken / totalExpected) * 100)) : 0
      return { totalExpected, totalTaken, missed, rate }
    },
    medRingColor() {
      if (this.medStats.rate >= 90) return '#00f5d4'
      if (this.medStats.rate >= 60) return '#e6a23c'
      return '#f56c6c'
    },
    medDash() {
      const circ = 2 * Math.PI * 52
      const filled = (this.medStats.rate / 100) * circ
      return `${filled} ${circ}`
    },

    // ---- 认知负荷统计 ----
    cogStats() {
      const w = getWeekRange()
      const weekEvents = this.events.filter(e => e.ts >= w.startMs && e.ts <= w.endMs)
      const weekQ = this.questionnaires.filter(q => q.ts >= w.startMs && q.ts <= w.endMs)

      if (!weekEvents.length && !weekQ.length) {
        return { hasData: false }
      }

      const taskStarts = weekEvents.filter(e => e.event_type === 'task_start')
      let sum = 0; let cnt = 0
      weekQ.forEach(q => {
        (q.answers || []).forEach(a => { if (typeof a.value === 'number') { sum += a.value; cnt++ } })
      })
      const avgScore = cnt > 0 ? (sum / cnt).toFixed(1) : '-'

      // 趋势：本周 vs 上周
      const prevStart = w.start.subtract(7, 'day').valueOf()
      const prevEnd = w.start.subtract(1, 'millisecond').valueOf()
      const prevQ = this.questionnaires.filter(q => q.ts >= prevStart && q.ts <= prevEnd)
      let prevSum = 0; let prevCnt = 0
      prevQ.forEach(q => {
        (q.answers || []).forEach(a => { if (typeof a.value === 'number') { prevSum += a.value; prevCnt++ } })
      })
      let trend = null; let trendText = ''
      if (prevCnt > 0 && cnt > 0) {
        const prevAvg = prevSum / prevCnt
        const curAvg = sum / cnt
        const diff = curAvg - prevAvg
        if (diff > 0.3) {
          trend = 'up'; trendText = `比上周吃力一些（+${diff.toFixed(1)}）`
        } else if (diff < -0.3) {
          trend = 'down'; trendText = `比上周轻松一些（${diff.toFixed(1)}）`
        } else {
          trend = 'stable'; trendText = '与上周基本持平'
        }
      }

      return {
        hasData: true,
        avgScore,
        tasks: taskStarts.length,
        questionnaires: weekQ.length,
        trend,
        trendText
      }
    },
    cogGaugeWidth() {
      const score = parseFloat(this.cogStats.avgScore)
      if (isNaN(score)) return '0%'
      return Math.min(100, Math.round((score / 5) * 100)) + '%'
    },
    cogGaugeColor() {
      const score = parseFloat(this.cogStats.avgScore)
      if (isNaN(score)) return '#00f5d4'
      if (score <= 2) return '#00f5d4'
      if (score <= 3.5) return '#e6a23c'
      return '#f56c6c'
    },

    // ---- 总体状态 ----
    statusLevel() {
      const medOk = this.medStats.rate >= 80
      const cogScore = parseFloat(this.cogStats.avgScore)
      const cogOk = isNaN(cogScore) || cogScore < 3
      if (medOk && cogOk) return 'good'
      if (!medOk && !cogOk) return 'warn'
      return 'caution'
    },
    statusIcon() {
      return {
        good: 'el-icon-circle-check',
        caution: 'el-icon-info',
        warn: 'el-icon-warning'
      }[this.statusLevel]
    },
    statusText() {
      return {
        good: '整体状况良好',
        caution: '有一些需要关注的地方',
        warn: '建议多关注近期状况'
      }[this.statusLevel]
    },
    statusSub() {
      const parts = []
      if (this.medStats.totalExpected > 0) {
        parts.push(`服药完成率 ${this.medStats.rate}%`)
      }
      if (this.cogStats.hasData && this.cogStats.avgScore !== '-') {
        parts.push(`认知负荷 ${this.cogStats.avgScore}/5`)
      }
      return parts.join(' · ') || '暂无足够数据'
    },

    // ---- 近期活动 ----
    recentActivities() {
      const acts = []
      const recent = this.events.slice(-50).reverse()
      for (const e of recent) {
        if (acts.length >= 8) break
        const time = dayjs(e.ts).format('M/D HH:mm')
        const src = { patient_education: '患者教育', chat: '聊天问答', medication_reminder: '服药提醒' }[e.source] || ''
        if (e.event_type === 'task_start') {
          const topic = (e.params && e.params.topic) || ''
          acts.push({ text: `开始了一次${src}任务${topic ? '：' + topic : ''}`, time, color: '#00bbf9' })
        } else if (e.event_type === 'task_end') {
          const dur = e.params && e.params.duration_ms
          const durText = dur ? `（用时 ${Math.round(dur / 1000)} 秒）` : ''
          acts.push({ text: `完成了一次${src}任务${durText}`, time, color: '#00f5d4' })
        }
      }
      const recentMeds = this.medRecords.slice(-5).reverse()
      for (const r of recentMeds) {
        if (acts.length >= 10) break
        const med = this.medications.find(m => m.id === r.medId)
        acts.push({
          text: `已确认服用 ${med ? med.name : '药物'}（${r.time}）`,
          time: `${dayjs(r.date).format('M/D')} ${r.doneTime}`,
          color: '#00f5d4'
        })
      }
      acts.sort((a, b) => b.time.localeCompare(a.time))
      return acts.slice(0, 8)
    },

    // ---- 建议 ----
    tips() {
      const t = []
      if (this.medStats.rate < 80 && this.medStats.totalExpected > 0) {
        t.push('本周服药完成率偏低，建议关注是否有遗忘或抗拒服药的情况。')
      }
      const cogScore = parseFloat(this.cogStats.avgScore)
      if (!isNaN(cogScore) && cogScore >= 3.5) {
        t.push('认知负荷评分较高，说明操作时感到吃力，系统已自动切换到更简单的显示模式。')
      }
      if (this.cogStats.trend === 'up') {
        t.push('认知负荷比上周有所上升，建议与老人多交流，了解近期是否有不适。')
      }
      if (this.cogStats.trend === 'down') {
        t.push('认知状态比上周有所改善，目前的使用节奏比较合适，可以继续保持。')
      }
      t.push('如有任何疑问，请及时咨询主治医生，本报告仅供参考。')
      if (t.length < 3) {
        t.unshift('保持规律的生活节奏有助于稳定认知功能，可以鼓励老人多参与日常活动。')
      }
      return t
    }
  },
  created() {
    this.loadData()
    // 让首页「查看家属周报」实现闭环：用户只要打开过本周周报，就记为完成
    try {
      const weekStartMs = dayjs().startOf('week').valueOf()
      localStorage.setItem(FAMILY_REPORT_VIEWED_WEEK_KEY, String(weekStartMs))
      const viewedAt = Date.now()
      localStorage.setItem('family_report_viewed_at', String(viewedAt))
      // 用于首页 C7 推断“更可能的打开时间”，降低硬编码时间点脆弱性
      const LIST_KEY = 'family_report_viewed_times'
      let prev = []
      try {
        prev = JSON.parse(localStorage.getItem(LIST_KEY) || '[]')
      } catch { prev = [] }
      if (!Array.isArray(prev)) prev = []
      prev.push(viewedAt)
      // 只保留最近 30 次，避免 localStorage 无限增长
      const trimmed = prev.slice(-30)
      localStorage.setItem(LIST_KEY, JSON.stringify(trimmed))
    } catch (e) {
      // 忽略本地存储失败，不影响页面渲染
    }
  },
  methods: {
    loadData() {
      try {
        this.medications = JSON.parse(localStorage.getItem(MED_STORAGE_MEDS) || '[]')
      } catch { this.medications = [] }
      try {
        this.medRecords = JSON.parse(localStorage.getItem(MED_STORAGE_RECORDS) || '[]')
      } catch { this.medRecords = [] }
      this.events = getCognitiveEvents()
      this.questionnaires = getCognitiveQuestionnaires()
    }
  }
}
</script>

<style scoped>
.family-report {
  max-width: 640px;
  margin: 0 auto;
  padding: 24px 16px 40px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

/* 页头 */
.report-header { text-align: center; }
.report-title {
  font-size: var(--font-size-xl, 24px);
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 4px;
}
.report-period { font-size: var(--font-size-base, 15px); color: var(--text-muted); }

/* 总体状态卡 */
.status-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  border-radius: 16px;
  transition: all 0.3s;
}
.status-card.good {
  background: linear-gradient(135deg, rgba(var(--primary-blue-rgb), 0.15), rgba(var(--accent-cyan-rgb), 0.1));
  border: 1px solid rgba(var(--primary-blue-rgb), 0.35);
}
.status-card.caution {
  background: linear-gradient(135deg, rgba(230,162,60,0.15), rgba(230,162,60,0.08));
  border: 1px solid rgba(230,162,60,0.35);
}
.status-card.warn {
  background: linear-gradient(135deg, rgba(245,108,108,0.15), rgba(245,108,108,0.08));
  border: 1px solid rgba(245,108,108,0.35);
}
.status-icon-wrap {
  width: 52px; height: 52px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 28px; flex-shrink: 0;
}
.good .status-icon-wrap { background: rgba(var(--primary-blue-rgb), 0.2); color: var(--primary-blue); }
.caution .status-icon-wrap { background: rgba(230,162,60,0.2); color: #e6a23c; }
.warn .status-icon-wrap { background: rgba(245,108,108,0.2); color: #f56c6c; }
.status-text { font-size: var(--font-size-lg, 20px); font-weight: 700; color: var(--text-primary); }
.status-sub { font-size: var(--font-size-base, 14px); color: var(--text-secondary); margin-top: 2px; }

/* 通用 section 卡 */
.section-card {
  background: var(--bg-card);
  border-radius: 16px;
  padding: 20px;
  border: 1px solid rgba(var(--primary-blue-rgb), 0.2);
}
.section-label {
  font-size: var(--font-size-base, 16px);
  font-weight: 600;
  color: var(--text-primary, #333);
  margin-bottom: 14px;
}
.section-empty {
  text-align: center;
  padding: 20px 0;
  font-size: var(--font-size-base, 14px);
  color: var(--text-disabled);
}

/* 服药环形图 */
.med-summary { display: flex; align-items: center; gap: 24px; }
.med-ring-wrap { position: relative; width: 120px; height: 120px; flex-shrink: 0; }
.med-ring { width: 100%; height: 100%; }
.med-ring-text {
  position: absolute; inset: 0;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
}
.med-ring-pct { font-size: 26px; font-weight: 700; color: var(--text-primary); }
.med-ring-label { font-size: 12px; color: var(--text-muted); }
.med-detail { display: flex; flex-direction: column; gap: 10px; flex: 1; }
.med-detail-row { display: flex; justify-content: space-between; align-items: center; }
.md-label { font-size: var(--font-size-base, 14px); color: var(--text-secondary); }
.md-value { font-size: var(--font-size-lg, 18px); font-weight: 600; color: var(--text-primary); }
.md-value.highlight { color: var(--primary-blue); }
.md-value.warn { color: #f56c6c; }

/* 认知负荷仪表 */
.cog-summary { display: flex; flex-direction: column; gap: 12px; }
.cog-gauge { margin-bottom: 4px; }
.cog-gauge-bar {
  height: 12px; border-radius: 6px;
  background: var(--border-light);
  position: relative; overflow: hidden;
}
.cog-gauge-fill {
  height: 100%; border-radius: 6px;
  transition: width 0.6s ease, background 0.6s ease;
}
.cog-gauge-marker {
  position: absolute; top: -3px;
  width: 4px; height: 18px; border-radius: 2px;
  background: #fff; transform: translateX(-2px);
  transition: left 0.6s ease;
}
.cog-gauge-labels {
  display: flex; justify-content: space-between;
  font-size: 11px; color: var(--text-disabled); margin-top: 4px;
}
.cog-score-row { display: flex; justify-content: space-between; align-items: center; }
.cog-score-label { font-size: var(--font-size-base, 14px); color: var(--text-secondary); }
.cog-score-value { font-size: var(--font-size-lg, 20px); font-weight: 700; color: var(--text-primary); }
.cog-score-value small { font-size: 13px; color: var(--text-muted); }
.cog-trend-row {
  display: flex; align-items: center; gap: 6px;
  font-size: var(--font-size-base, 14px); color: var(--text-secondary);
}
.cog-trend-row .el-icon-top { color: #f56c6c; }
.cog-trend-row .el-icon-bottom { color: var(--primary-blue); }
.cog-trend-row .el-icon-minus { color: #e6a23c; }
.cog-detail-row {
  font-size: 13px; color: var(--text-muted);
}
.cog-detail-row strong { color: var(--primary-blue); }

/* 近期活动 */
.activity-list { display: flex; flex-direction: column; gap: 10px; }
.activity-item { display: flex; align-items: flex-start; gap: 10px; }
.activity-dot {
  width: 8px; height: 8px; border-radius: 50%;
  margin-top: 6px; flex-shrink: 0;
}
.activity-body { flex: 1; }
.activity-text { font-size: var(--font-size-base, 14px); color: var(--text-primary, #333); line-height: 1.5; }
.activity-time { font-size: 12px; color: var(--text-disabled); margin-top: 2px; }

/* 建议 */
.tips-card {
  background: linear-gradient(135deg, rgba(var(--accent-cyan-rgb), 0.08), rgba(var(--primary-blue-rgb), 0.05));
  border-color: rgba(var(--accent-cyan-rgb), 0.25);
}
.tips-list { display: flex; flex-direction: column; gap: 10px; }
.tip-item {
  display: flex; align-items: flex-start; gap: 8px;
  font-size: var(--font-size-base, 14px);
  color: var(--text-primary, #333);
  line-height: 1.6;
}
.tip-item i { color: var(--accent-cyan); font-size: 16px; margin-top: 3px; flex-shrink: 0; }

/* 页脚 */
.report-footer {
  text-align: center;
  font-size: 12px;
  color: var(--text-disabled);
  padding-top: 12px;
  border-top: 1px solid rgba(var(--primary-blue-rgb), 0.12);
}
.report-footer p { margin: 2px 0; }

@media (max-width: 500px) {
  .med-summary { flex-direction: column; align-items: center; }
  .med-ring-wrap { width: 100px; height: 100px; }
  .status-card { flex-direction: column; text-align: center; }
}
</style>
