<template>
  <div class="cognitive-load-page">
    <div class="panel-card header-card">
      <h1 class="page-title">认知负荷评估</h1>
      <p class="page-desc">行为埋点与问卷数据（本地存储），可按任务/来源汇总并导出 CSV，供实验分析使用。</p>
      <div class="header-actions">
        <el-button type="primary" size="small" @click="loadData" :loading="loading">
          <i class="el-icon-refresh"></i> 刷新
        </el-button>
        <el-button type="success" size="small" @click="exportCSV" :disabled="!hasData">
          <i class="el-icon-download"></i> 导出 CSV
        </el-button>
        <el-button type="info" size="small" @click="handleUploadToServer" :disabled="!hasData">
          <i class="el-icon-upload2"></i> 上传到服务器
        </el-button>
        <el-button type="warning" size="small" plain @click="confirmClear" :disabled="!hasData">
          <i class="el-icon-delete"></i> 清空本地数据
        </el-button>
      </div>
    </div>

    <!-- 概览数字卡片 -->
    <div class="panel-card stats-card">
      <h3 class="section-title">汇总</h3>
      <div class="stats-grid">
        <div class="stat-item">
          <span class="stat-value">{{ events.length }}</span>
          <span class="stat-label">行为事件</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">{{ questionnaires.length }}</span>
          <span class="stat-label">问卷提交</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">{{ taskIds.size }}</span>
          <span class="stat-label">任务数</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">{{ avgQuestionnaireScore }}</span>
          <span class="stat-label">问卷平均分(1-5)</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">{{ backRate }}</span>
          <span class="stat-label">回退率</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">{{ avgDuration }}</span>
          <span class="stat-label">平均任务时长</span>
        </div>
      </div>
    </div>

    <!-- 趋势图区 -->
    <div class="chart-row" v-if="hasData">
      <div class="panel-card chart-card chart-wide">
        <h3 class="section-title">认知负荷趋势（按日）</h3>
        <div id="trendChart" class="chart-dom"></div>
      </div>
      <div class="panel-card chart-card chart-narrow">
        <h3 class="section-title">各题项平均分（按来源）</h3>
        <div id="sourceScoreChart" class="chart-dom"></div>
      </div>
    </div>

    <!-- 波动报告 -->
    <div class="panel-card report-card" v-if="reportText">
      <h3 class="section-title"><i class="el-icon-document"></i> 认知负荷波动报告</h3>
      <div class="report-body">
        <div v-for="(line, idx) in reportLines" :key="idx" :class="['report-line', line.type]">
          <i :class="line.icon"></i>
          <span>{{ line.text }}</span>
        </div>
      </div>
    </div>

    <!-- 行为事件表 -->
    <div class="panel-card table-card">
      <h3 class="section-title">行为事件（最近 200 条）</h3>
      <el-table :data="eventsSlice" border size="small" max-height="360">
        <el-table-column prop="ts" label="时间" width="175">
          <template slot-scope="scope">
            {{ formatTs(scope.row.ts) }}
          </template>
        </el-table-column>
        <el-table-column prop="event_type" label="事件类型" width="140" />
        <el-table-column prop="task_id" label="task_id" width="160" show-overflow-tooltip />
        <el-table-column prop="source" label="来源" width="120" />
        <el-table-column prop="params" label="参数">
          <template slot-scope="scope">
            <span class="params-json">{{ paramsSummary(scope.row.params) }}</span>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 问卷记录表 -->
    <div class="panel-card table-card">
      <h3 class="section-title">问卷记录（最近 100 条）</h3>
      <el-table :data="questionnairesSlice" border size="small" max-height="280">
        <el-table-column prop="ts" label="时间" width="175">
          <template slot-scope="scope">
            {{ formatTs(scope.row.ts) }}
          </template>
        </el-table-column>
        <el-table-column prop="task_id" label="task_id" width="160" show-overflow-tooltip />
        <el-table-column prop="source" label="来源" width="120" />
        <el-table-column label="得分(q1-q4)">
          <template slot-scope="scope">
            {{ answersSummary(scope.row.answers) }}
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import {
  getCognitiveEvents,
  getCognitiveQuestionnaires,
  exportCognitiveLoadCSV,
  clearCognitiveLoadData
} from '@/utils/cognitiveLoad'
import { uploadCognitiveEvents, uploadCognitiveQuestionnaires } from '@/api/cognitiveLoad'
import { getEChartsTheme } from '@/utils/echartsTheme'

const SOURCE_LABELS = {
  patient_education: '患者教育',
  chat: '聊天问答',
  medication_reminder: '服药提醒',
  unknown: '其他'
}
const Q_LABELS = {
  q1: '理解难度',
  q2: '反复查看',
  q3: '信息量',
  q4: '整体负担'
}

function toDateKey(ts) {
  const d = new Date(ts)
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${mm}-${dd}`
}

export default {
  name: 'CognitiveLoadAssessmentView',
  data() {
    return {
      loading: false,
      events: [],
      questionnaires: [],
      chartInstances: {},
      resizeHandler: null
    }
  },
  computed: {
    hasData() {
      return this.events.length > 0 || this.questionnaires.length > 0
    },
    eventsSlice() {
      return this.events.slice(-200).reverse()
    },
    questionnairesSlice() {
      return this.questionnaires.slice(-100).reverse()
    },
    taskIds() {
      const set = new Set()
      this.events.forEach(e => { if (e.task_id) set.add(e.task_id) })
      this.questionnaires.forEach(q => { if (q.task_id) set.add(q.task_id) })
      return set
    },
    avgQuestionnaireScore() {
      if (!this.questionnaires.length) return '-'
      let sum = 0; let count = 0
      this.questionnaires.forEach(q => {
        (q.answers || []).forEach(a => { if (typeof a.value === 'number') { sum += a.value; count++ } })
      })
      return count ? (sum / count).toFixed(2) : '-'
    },
    backRate() {
      const backs = this.events.filter(e => e.event_type === 'back').length
      const clicks = this.events.filter(e => e.event_type === 'click').length
      const total = backs + clicks
      if (!total) return '-'
      return Math.round((backs / total) * 100) + '%'
    },
    avgDuration() {
      const ends = this.events.filter(e => e.event_type === 'task_end' && e.params && e.params.duration_ms)
      if (!ends.length) return '-'
      const avg = ends.reduce((s, e) => s + e.params.duration_ms, 0) / ends.length
      return avg >= 60000 ? (avg / 60000).toFixed(1) + ' 分' : Math.round(avg / 1000) + ' 秒'
    },

    // 按日聚合数据
    dailyData() {
      const map = {}
      this.events.forEach(e => {
        const dk = toDateKey(e.ts)
        if (!map[dk]) map[dk] = { events: 0, tasks: new Set(), backs: 0 }
        map[dk].events++
        if (e.task_id) map[dk].tasks.add(e.task_id)
        if (e.event_type === 'back') map[dk].backs++
      })
      this.questionnaires.forEach(q => {
        const dk = toDateKey(q.ts)
        if (!map[dk]) map[dk] = { events: 0, tasks: new Set(), backs: 0 }
        if (!map[dk].scores) map[dk].scores = []
        const answers = q.answers || []
        const avg = answers.length ? answers.reduce((s, a) => s + (a.value || 0), 0) / answers.length : 0
        if (avg > 0) map[dk].scores.push(avg)
      })
      const days = Object.keys(map).sort()
      return days.map(d => ({
        day: d,
        events: map[d].events,
        tasks: map[d].tasks.size,
        backs: map[d].backs,
        avgScore: map[d].scores && map[d].scores.length
          ? +(map[d].scores.reduce((a, b) => a + b, 0) / map[d].scores.length).toFixed(2)
          : null
      }))
    },

    // 按来源×题项 聚合问卷分数
    sourceQuestionData() {
      const map = {}
      this.questionnaires.forEach(q => {
        const src = q.source || 'unknown'
        if (!map[src]) map[src] = {}
        ;(q.answers || []).forEach(a => {
          if (!map[src][a.qid]) map[src][a.qid] = []
          map[src][a.qid].push(a.value)
        })
      })
      return map
    },

    // 波动报告文字
    reportText() {
      return this.reportLines.length > 0
    },
    reportLines() {
      const lines = []
      const dd = this.dailyData
      if (dd.length < 2) return []
      const qCount = this.questionnaires.length
      const evCount = this.events.length

      lines.push({
        type: 'info',
        icon: 'el-icon-data-line',
        text: `共采集 ${evCount} 条行为事件、${qCount} 份问卷，覆盖 ${dd.length} 天。`
      })

      // 问卷得分趋势
      const scored = dd.filter(d => d.avgScore !== null)
      if (scored.length >= 2) {
        const first = scored.slice(0, Math.ceil(scored.length / 2))
        const second = scored.slice(Math.ceil(scored.length / 2))
        const avg1 = first.reduce((s, d) => s + d.avgScore, 0) / first.length
        const avg2 = second.reduce((s, d) => s + d.avgScore, 0) / second.length
        const diff = avg2 - avg1
        if (Math.abs(diff) > 0.2) {
          const dir = diff > 0 ? '上升' : '下降'
          const sentiment = diff > 0 ? 'warn' : 'good'
          lines.push({
            type: sentiment,
            icon: diff > 0 ? 'el-icon-top' : 'el-icon-bottom',
            text: `问卷平均分从前半段 ${avg1.toFixed(2)} ${dir}至后半段 ${avg2.toFixed(2)}（${diff > 0 ? '+' : ''}${diff.toFixed(2)}），认知负荷${diff > 0 ? '有所加重' : '逐步减轻'}。`
          })
        } else {
          lines.push({
            type: 'good',
            icon: 'el-icon-minus',
            text: `问卷平均分在前后半段保持稳定（${avg1.toFixed(2)} → ${avg2.toFixed(2)}），认知负荷无显著波动。`
          })
        }
      }

      // 回退率分析
      const totalBacks = this.events.filter(e => e.event_type === 'back').length
      const totalClicks = this.events.filter(e => e.event_type === 'click').length
      const bkRate = (totalBacks + totalClicks) > 0 ? totalBacks / (totalBacks + totalClicks) : 0
      if (bkRate > 0.3) {
        lines.push({
          type: 'warn',
          icon: 'el-icon-warning',
          text: `回退率 ${(bkRate * 100).toFixed(0)}%（较高），提示用户频繁回看，可能需要简化呈现方式。`
        })
      } else if (bkRate > 0) {
        lines.push({
          type: 'info',
          icon: 'el-icon-info',
          text: `回退率 ${(bkRate * 100).toFixed(0)}%，处于正常范围。`
        })
      }

      // 来源对比
      const srcMap = this.sourceQuestionData
      const srcKeys = Object.keys(srcMap)
      if (srcKeys.length > 1) {
        const avgBySrc = srcKeys.map(s => {
          const all = Object.values(srcMap[s]).flat()
          return { source: s, avg: all.length ? +(all.reduce((a, b) => a + b, 0) / all.length).toFixed(2) : 0 }
        }).sort((a, b) => b.avg - a.avg)
        const highest = avgBySrc[0]
        const lowest = avgBySrc[avgBySrc.length - 1]
        if (highest.avg - lowest.avg > 0.3) {
          lines.push({
            type: 'info',
            icon: 'el-icon-sort',
            text: `「${SOURCE_LABELS[highest.source] || highest.source}」场景认知负荷最高（${highest.avg}），「${SOURCE_LABELS[lowest.source] || lowest.source}」最低（${lowest.avg}），建议优先优化高负荷场景的信息呈现。`
          })
        }
      }

      // 自适应调度器建议
      const avgScore = parseFloat(this.avgQuestionnaireScore)
      if (!isNaN(avgScore)) {
        if (avgScore >= 3.5) {
          lines.push({ type: 'warn', icon: 'el-icon-magic-stick', text: '整体认知负荷偏高（≥3.5），自适应调度器将自动推荐「卡片」模式以减轻阅读负担。' })
        } else if (avgScore >= 2.8) {
          lines.push({ type: 'info', icon: 'el-icon-magic-stick', text: '认知负荷中等（≥2.8），自适应调度器将自动推荐「分步」模式引导阅读。' })
        } else {
          lines.push({ type: 'good', icon: 'el-icon-circle-check', text: '认知负荷处于较低水平，默认「长文」模式即可满足需求。' })
        }
      }

      return lines
    }
  },
  created() {
    this.loadData()
  },
  mounted() {
    this.resizeHandler = () => {
      Object.values(this.chartInstances).forEach(c => c && c.resize())
    }
    window.addEventListener('resize', this.resizeHandler)
    this.$root.$on('theme-changed', this.handleThemeChange)
  },
  beforeDestroy() {
    Object.values(this.chartInstances).forEach(c => c && c.dispose())
    if (this.resizeHandler) window.removeEventListener('resize', this.resizeHandler)
    this.$root.$off('theme-changed', this.handleThemeChange)
  },
  methods: {
    handleThemeChange() {
      // initChart 内部会 dispose 旧实例，这里直接重绘即可
      this.$nextTick(() => this.renderCharts())
    },
    loadData() {
      this.loading = true
      this.events = getCognitiveEvents()
      this.questionnaires = getCognitiveQuestionnaires()
      this.loading = false
      this.$nextTick(() => this.renderCharts())
    },
    formatTs(ts) {
      if (!ts) return ''
      return new Date(ts).toLocaleString('zh-CN')
    },
    paramsSummary(params) {
      if (!params || typeof params !== 'object') return ''
      const s = JSON.stringify(params)
      return s.length > 60 ? s.slice(0, 60) + '…' : s
    },
    answersSummary(answers) {
      if (!Array.isArray(answers) || !answers.length) return '-'
      return answers.map(a => `${a.qid}:${a.value}`).join(', ')
    },
    exportCSV() {
      const csv = exportCognitiveLoadCSV()
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `cognitive_load_${new Date().toISOString().slice(0, 10)}.csv`
      a.click()
      URL.revokeObjectURL(url)
      this.$message.success('已导出 CSV')
    },
    confirmClear() {
      this.$confirm('确定清空本地认知负荷数据吗？此操作不可恢复。', '提示', {
        type: 'warning'
      }).then(() => {
        clearCognitiveLoadData()
        this.loadData()
        this.$message.success('已清空')
      }).catch(() => {})
    },
    async handleUploadToServer() {
      if (!this.hasData) {
        this.$message.warning('暂无可上传的评估数据')
        return
      }
      try {
        const events = this.events || []
        const questionnaires = this.questionnaires || []
        const eventPayload = events.map(e => ({
          ts: e.ts, event_type: e.event_type, task_id: e.task_id || null,
          session_id: e.session_id || null, source: e.source || null, params: e.params || {}
        }))
        const questionnairePayload = questionnaires.map(q => ({
          ts: q.ts, task_id: q.task_id, session_id: q.session_id || null,
          source: q.source || null, answers: (q.answers || []).map(a => ({ qid: a.qid, value: a.value }))
        }))
        const reqs = []
        if (eventPayload.length) reqs.push(uploadCognitiveEvents(eventPayload))
        if (questionnairePayload.length) reqs.push(uploadCognitiveQuestionnaires(questionnairePayload))
        if (!reqs.length) { this.$message.warning('暂无可上传的评估数据'); return }
        await Promise.all(reqs)
        this.$message.success('评估数据已上传到服务器')
      } catch (e) {
        console.error('上传认知负荷数据失败', e)
        this.$message.error('上传认知负荷数据失败，请稍后重试')
      }
    },

    // ---- 图表 ----
    initChart(domId) {
      if (this.chartInstances[domId]) this.chartInstances[domId].dispose()
      const dom = document.getElementById(domId)
      if (!dom) return null
      const ch = echarts.init(dom)
      this.chartInstances[domId] = ch
      return ch
    },
    renderCharts() {
      if (!this.hasData) return
      this.renderTrend()
      this.renderSourceScore()
    },
    renderTrend() {
      const ch = this.initChart('trendChart')
      if (!ch) return
      const dd = this.dailyData
      const t = getEChartsTheme()
      ch.setOption({
        tooltip: { trigger: 'axis' },
        legend: { data: ['问卷平均分', '事件数', '回退数'], textStyle: { color: t.textSecondary } },
        grid: { left: '3%', right: '4%', bottom: '3%', top: '16%', containLabel: true },
        xAxis: {
          type: 'category',
          data: dd.map(d => d.day),
          axisLabel: { color: t.textMuted, rotate: dd.length > 10 ? 30 : 0 },
          axisLine: { lineStyle: { color: t.rgbaPrimary(0.3) } }
        },
        yAxis: [
          { type: 'value', name: '分数', min: 0, max: 5, axisLabel: { color: t.textMuted }, splitLine: { lineStyle: { color: t.rgbaPrimary(0.06) } } },
          { type: 'value', name: '数量', axisLabel: { color: t.textMuted }, splitLine: { show: false } }
        ],
        series: [
          {
            name: '问卷平均分', type: 'line', data: dd.map(d => d.avgScore), connectNulls: true,
            lineStyle: { color: t.primaryBlue, width: 3 }, itemStyle: { color: t.primaryBlue },
            smooth: true, symbol: 'circle', symbolSize: 8,
            areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: t.rgbaPrimary(0.3) }, { offset: 1, color: t.rgbaPrimary(0) }]) },
            markLine: {
              silent: true,
              data: [
                { yAxis: 2.8, label: { formatter: '分步阈值', color: t.warning }, lineStyle: { color: t.warning, type: 'dashed' } },
                { yAxis: 3.5, label: { formatter: '卡片阈值', color: t.error }, lineStyle: { color: t.error, type: 'dashed' } }
              ]
            }
          },
          {
            name: '事件数', type: 'bar', yAxisIndex: 1, data: dd.map(d => d.events),
            itemStyle: { color: t.rgbaAccentCyan(0.5), borderRadius: [3, 3, 0, 0] }, barMaxWidth: 20
          },
          {
            name: '回退数', type: 'bar', yAxisIndex: 1, data: dd.map(d => d.backs),
            itemStyle: { color: t.rgbaAccentPurple(0.5), borderRadius: [3, 3, 0, 0] }, barMaxWidth: 20
          }
        ]
      })
    },
    renderSourceScore() {
      const ch = this.initChart('sourceScoreChart')
      if (!ch) return
      const t = getEChartsTheme()
      const srcMap = this.sourceQuestionData
      const sources = Object.keys(srcMap)
      if (!sources.length) return
      const qids = ['q1', 'q2', 'q3', 'q4']
      const colors = [t.primaryBlue, t.accentCyan, t.accentPurple, t.error]
      const series = qids.map((qid, i) => ({
        name: Q_LABELS[qid] || qid,
        type: 'bar',
        data: sources.map(src => {
          const vals = (srcMap[src] && srcMap[src][qid]) || []
          return vals.length ? +(vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2) : 0
        }),
        itemStyle: { color: colors[i], borderRadius: [3, 3, 0, 0] }
      }))
      ch.setOption({
        tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
        legend: { data: qids.map(q => Q_LABELS[q] || q), textStyle: { color: t.textSecondary } },
        grid: { left: '3%', right: '4%', bottom: '3%', top: '16%', containLabel: true },
        xAxis: {
          type: 'category',
          data: sources.map(s => SOURCE_LABELS[s] || s),
          axisLabel: { color: t.textMuted },
          axisLine: { lineStyle: { color: t.rgbaPrimary(0.3) } }
        },
        yAxis: {
          type: 'value', max: 5, name: '平均分',
          axisLabel: { color: t.textMuted },
          splitLine: { lineStyle: { color: t.rgbaPrimary(0.06) } }
        },
        series
      })
    }
  }
}
</script>

<style scoped>
.cognitive-load-page {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}
.header-card { margin-bottom: 20px; }
.page-title { font-size: var(--font-size-xl, 22px); color: var(--primary-blue); margin-bottom: 8px; }
.page-desc { font-size: 13px; color: var(--text-secondary); margin-bottom: 16px; }
.header-actions { display: flex; gap: 10px; flex-wrap: wrap; }
.stats-card { margin-bottom: 20px; }
.section-title { font-size: var(--font-size-base, 16px); color: rgba(255,255,255,0.9); margin-bottom: 12px; }
.section-title i { color: var(--primary-blue); margin-right: 6px; }

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 12px;
}
.stat-item {
  text-align: center;
  padding: 14px 10px;
  background: rgba(var(--primary-blue-rgb), 0.06);
  border-radius: 10px;
  border: 1px solid rgba(var(--primary-blue-rgb), 0.12);
}
.stat-value { display: block; font-size: var(--font-size-xl, 24px); color: var(--primary-blue); font-weight: 700; }
.stat-label { font-size: 12px; color: var(--text-muted); }

/* 图表区 */
.chart-row { display: flex; gap: 16px; margin-bottom: 20px; }
.chart-card { flex: 1; }
.chart-wide { flex: 3; }
.chart-narrow { flex: 2; }
.chart-dom { width: 100%; height: 300px; }

/* 波动报告 */
.report-card { margin-bottom: 20px; }
.report-body { display: flex; flex-direction: column; gap: 10px; }
.report-line {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px 14px;
  border-radius: 10px;
  font-size: var(--font-size-base, 14px);
  line-height: 1.6;
}
.report-line i { font-size: 18px; margin-top: 2px; flex-shrink: 0; }
.report-line.info {
  background: rgba(var(--accent-cyan-rgb), 0.08);
  border: 1px solid rgba(var(--accent-cyan-rgb), 0.2);
  color: rgba(255,255,255,0.9);
}
.report-line.info i { color: var(--accent-cyan); }
.report-line.good {
  background: rgba(var(--primary-blue-rgb), 0.08);
  border: 1px solid rgba(var(--primary-blue-rgb), 0.2);
  color: rgba(255,255,255,0.9);
}
.report-line.good i { color: var(--primary-blue); }
.report-line.warn {
  background: rgba(245,108,108,0.08);
  border: 1px solid rgba(245,108,108,0.2);
  color: rgba(255,255,255,0.9);
}
.report-line.warn i { color: #f56c6c; }

.table-card { margin-bottom: 20px; }
.params-json { font-size: 12px; word-break: break-all; }

@media (max-width: 900px) {
  .chart-row { flex-direction: column; }
  .stats-grid { grid-template-columns: repeat(3, 1fr); }
}
</style>
