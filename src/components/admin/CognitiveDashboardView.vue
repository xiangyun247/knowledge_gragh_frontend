<template>
  <div class="dashboard-page">
    <div class="dashboard-header">
      <h2 class="dashboard-title"><i class="el-icon-monitor"></i> 机构认知负荷看板</h2>
      <el-button type="primary" size="small" @click="loadData" :loading="loading" icon="el-icon-refresh">
        刷新数据
      </el-button>
    </div>

    <!-- 概览卡片 -->
    <div class="overview-cards">
      <div class="ov-card" v-for="card in overviewCards" :key="card.key">
        <div class="ov-icon"><i :class="card.icon"></i></div>
        <div class="ov-body">
          <div class="ov-value">{{ card.value }}</div>
          <div class="ov-label">{{ card.label }}</div>
        </div>
      </div>
    </div>

    <!-- 图表行1：趋势 + 来源分布 -->
    <div class="chart-row">
      <div class="chart-card chart-wide">
        <h3 class="chart-title">近 14 日活跃趋势</h3>
        <div id="dailyTrendChart" class="chart-dom"></div>
      </div>
      <div class="chart-card chart-narrow">
        <h3 class="chart-title">事件来源分布</h3>
        <div id="sourcePieChart" class="chart-dom"></div>
      </div>
    </div>

    <!-- 图表行2：事件类型 + 问卷得分 -->
    <div class="chart-row">
      <div class="chart-card chart-half">
        <h3 class="chart-title">事件类型分布</h3>
        <div id="eventTypeChart" class="chart-dom"></div>
      </div>
      <div class="chart-card chart-half">
        <h3 class="chart-title">问卷平均分 & 平均时长（按来源）</h3>
        <div id="scoreChart" class="chart-dom"></div>
      </div>
    </div>

    <!-- 用户排行表 -->
    <div class="chart-card full-width">
      <h3 class="chart-title">用户活跃排行（Top 10）</h3>
      <el-table :data="topUsers" size="small" class="dark-table" stripe>
        <el-table-column prop="user_id" label="用户 ID" min-width="200" show-overflow-tooltip />
        <el-table-column prop="events" label="事件数" width="120" sortable />
        <el-table-column prop="tasks" label="任务数" width="120" sortable />
      </el-table>
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import { fetchCognitiveDashboard } from '@/api/adminDashboard'
import { getEChartsTheme } from '@/utils/echartsTheme'

const SOURCE_LABELS = {
  patient_education: '患者教育',
  chat: '聊天问答',
  medication_reminder: '服药提醒',
  unknown: '其他'
}
const EVENT_LABELS = {
  task_start: '任务开始',
  task_end: '任务结束',
  step_view: '分步查看',
  back: '回退',
  click: '点击',
  error_or_repeat: '错误/重复',
  submit_questionnaire: '提交问卷'
}

export default {
  name: 'CognitiveDashboardView',
  data() {
    return {
      loading: false,
      dashData: null,
      chartInstances: {},
      resizeHandler: null
    }
  },
  computed: {
    overviewCards() {
      const ov = (this.dashData && this.dashData.overview) || {}
      return [
        { key: 'events', label: '总事件数', value: ov.total_events || 0, icon: 'el-icon-data-line' },
        { key: 'users', label: '总用户数', value: ov.total_users || 0, icon: 'el-icon-user' },
        { key: 'tasks', label: '总任务数', value: ov.total_tasks || 0, icon: 'el-icon-tickets' },
        { key: 'q', label: '问卷数', value: ov.total_questionnaires || 0, icon: 'el-icon-document-checked' },
        { key: 'days', label: '活跃天数', value: ov.active_days || 0, icon: 'el-icon-date' }
      ]
    },
    topUsers() {
      return (this.dashData && this.dashData.top_users) || []
    }
  },
  mounted() {
    this.loadData()
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
    async loadData() {
      this.loading = true
      try {
        const res = await fetchCognitiveDashboard()
        this.dashData = res.data || {}
        this.$nextTick(() => this.renderCharts())
      } catch (e) {
        console.error('加载看板数据失败', e)
        this.$message.error(e?.message || '加载看板数据失败')
      } finally {
        this.loading = false
      }
    },
    handleThemeChange() {
      this.$nextTick(() => this.renderCharts())
    },
    renderCharts() {
      this.renderDailyTrend()
      this.renderSourcePie()
      this.renderEventType()
      this.renderScore()
    },
    initChart(domId) {
      if (this.chartInstances[domId]) this.chartInstances[domId].dispose()
      const dom = document.getElementById(domId)
      if (!dom) return null
      const ch = echarts.init(dom)
      this.chartInstances[domId] = ch
      return ch
    },
    renderDailyTrend() {
      const ch = this.initChart('dailyTrendChart')
      if (!ch) return
      const rows = (this.dashData && this.dashData.daily_trend) || []
      const t = getEChartsTheme()
      ch.setOption({
        tooltip: { trigger: 'axis' },
        legend: { data: ['事件数', '活跃用户'], textStyle: { color: t.textSecondary } },
        grid: { left: '3%', right: '4%', bottom: '3%', top: '16%', containLabel: true },
        xAxis: {
          type: 'category',
          data: rows.map(r => r.day),
          axisLabel: { color: t.textMuted },
          axisLine: { lineStyle: { color: t.rgbaPrimary(0.3) } }
        },
        yAxis: [
          { type: 'value', name: '事件', axisLabel: { color: t.textMuted }, splitLine: { lineStyle: { color: t.rgbaPrimary(0.06) } } },
          { type: 'value', name: '用户', axisLabel: { color: t.textMuted }, splitLine: { show: false } }
        ],
        series: [
          {
            name: '事件数', type: 'bar', data: rows.map(r => r.events),
            itemStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: t.primaryBlue }, { offset: 1, color: t.accentCyan }]) }
          },
          {
            name: '活跃用户', type: 'line', yAxisIndex: 1, data: rows.map(r => r.users),
            lineStyle: { color: t.accentPurple, width: 2 }, itemStyle: { color: t.accentPurple }, smooth: true
          }
        ]
      })
    },
    renderSourcePie() {
      const ch = this.initChart('sourcePieChart')
      if (!ch) return
      const rows = (this.dashData && this.dashData.by_source) || []
      const t = getEChartsTheme()
      ch.setOption({
        tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
        legend: { orient: 'vertical', right: 10, top: 20, textStyle: { color: t.textSecondary } },
        series: [{
          type: 'pie',
          radius: ['40%', '70%'],
          center: ['40%', '55%'],
          avoidLabelOverlap: true,
          itemStyle: { borderRadius: 6, borderColor: t.bgCard, borderWidth: 2 },
          label: { color: t.textSecondary },
          data: rows.map(r => ({
            name: SOURCE_LABELS[r.source] || r.source,
            value: r.count
          })),
          color: [t.primaryBlue, t.accentCyan, t.accentPurple, t.error, t.warning]
        }]
      })
    },
    renderEventType() {
      const ch = this.initChart('eventTypeChart')
      if (!ch) return
      const rows = (this.dashData && this.dashData.by_event_type) || []
      const t = getEChartsTheme()
      ch.setOption({
        tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, backgroundColor: t.bgPopup, borderColor: t.borderPrimary, textStyle: { color: t.textPrimary } },
        grid: { left: '3%', right: '4%', bottom: '3%', top: '8%', containLabel: true },
        xAxis: {
          type: 'category',
          data: rows.map(r => EVENT_LABELS[r.event_type] || r.event_type),
          axisLabel: { color: t.textMuted, rotate: 30 },
          axisLine: { lineStyle: { color: t.rgbaPrimary(0.3) } }
        },
        yAxis: { type: 'value', axisLabel: { color: t.textMuted }, splitLine: { lineStyle: { color: t.rgbaPrimary(0.06) } } },
        series: [{
          type: 'bar',
          data: rows.map(r => r.count),
          itemStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: t.accentCyan }, { offset: 1, color: t.accentPurple }]), borderRadius: [4, 4, 0, 0] }
        }]
      })
    },
    renderScore() {
      const ch = this.initChart('scoreChart')
      if (!ch) return
      const t = getEChartsTheme()
      const scores = (this.dashData && this.dashData.avg_score_by_source) || []
      const durations = (this.dashData && this.dashData.avg_duration_by_source) || []
      const allSources = [...new Set([...scores.map(s => s.source), ...durations.map(d => d.source)])]
      const sourceLabels = allSources.map(s => SOURCE_LABELS[s] || s)

      const scoreMap = {}
      scores.forEach(s => { scoreMap[s.source] = s.avg_score })
      const durMap = {}
      durations.forEach(d => { durMap[d.source] = Math.round(d.avg_duration_ms / 1000) })

      ch.setOption({
        tooltip: { trigger: 'axis' },
        legend: { data: ['平均问卷分(1-5)', '平均时长(秒)'], textStyle: { color: t.textSecondary } },
        grid: { left: '3%', right: '4%', bottom: '3%', top: '16%', containLabel: true },
        xAxis: {
          type: 'category',
          data: sourceLabels,
          axisLabel: { color: t.textMuted },
          axisLine: { lineStyle: { color: t.rgbaPrimary(0.3) } }
        },
        yAxis: [
          { type: 'value', name: '分数', max: 5, axisLabel: { color: t.textMuted }, splitLine: { lineStyle: { color: t.rgbaPrimary(0.06) } } },
          { type: 'value', name: '秒', axisLabel: { color: t.textMuted }, splitLine: { show: false } }
        ],
        series: [
          {
            name: '平均问卷分(1-5)', type: 'bar',
            data: allSources.map(s => scoreMap[s] || 0),
            itemStyle: { color: t.primaryBlue, borderRadius: [4, 4, 0, 0] }
          },
          {
            name: '平均时长(秒)', type: 'bar', yAxisIndex: 1,
            data: allSources.map(s => durMap[s] || 0),
            itemStyle: { color: t.accentPurple, borderRadius: [4, 4, 0, 0] }
          }
        ]
      })
    }
  }
}
</script>

<style scoped>
.dashboard-page {
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.dashboard-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.dashboard-title {
  font-size: var(--font-size-lg, 20px);
  color: var(--text-primary);
  font-weight: 700;
}
.dashboard-title i {
  color: var(--primary-blue);
  margin-right: 8px;
}

/* 概览卡片 */
.overview-cards {
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
}
.ov-card {
  flex: 1 1 160px;
  min-width: 140px;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px 16px;
  border-radius: var(--radius-xl, 14px);
  background: var(--bg-card);
  border: 1px solid rgba(var(--primary-blue-rgb), 0.25);
  box-shadow: 0 4px 16px rgba(var(--primary-blue-rgb), 0.1);
  transition: transform 0.25s, box-shadow 0.25s;
}
.ov-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(var(--primary-blue-rgb), 0.2);
}
.ov-icon {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(var(--primary-blue-rgb), 0.2), rgba(var(--accent-cyan-rgb), 0.2));
  font-size: 22px;
  color: var(--primary-blue);
  flex-shrink: 0;
}
.ov-body { display: flex; flex-direction: column; }
.ov-value { font-size: var(--font-size-xl, 24px); font-weight: 700; color: var(--text-primary); }
.ov-label { font-size: 12px; color: var(--text-muted); margin-top: 2px; }

/* 图表区域 */
.chart-row {
  display: flex;
  gap: 14px;
}
.chart-card {
  background: var(--bg-card);
  border-radius: var(--radius-xl, 14px);
  padding: 16px;
  border: 1px solid rgba(var(--primary-blue-rgb), 0.2);
  box-shadow: 0 4px 16px rgba(var(--primary-blue-rgb), 0.08);
}
.chart-wide { flex: 2; }
.chart-narrow { flex: 1; }
.chart-half { flex: 1; }
.full-width { width: 100%; }
.chart-title {
  font-size: var(--font-size-base, 14px);
  color: rgba(255,255,255,0.85);
  font-weight: 600;
  margin-bottom: 10px;
}
.chart-dom {
  width: 100%;
  height: 280px;
}

/* 表格暗色主题 */
.dark-table {
  background: transparent !important;
}
.dark-table >>> .el-table__header-wrapper th {
  background: rgba(var(--primary-blue-rgb), 0.06) !important;
  color: var(--text-secondary) !important;
  border-bottom: 1px solid rgba(var(--primary-blue-rgb), 0.15) !important;
}
.dark-table >>> .el-table__body-wrapper tr {
  background: transparent !important;
  color: rgba(255,255,255,0.85) !important;
}
.dark-table >>> .el-table__body-wrapper tr:hover > td {
  background: rgba(var(--primary-blue-rgb), 0.06) !important;
}
.dark-table >>> .el-table__body-wrapper tr.el-table__row--striped > td {
  background: rgba(255,255,255,0.02) !important;
}
.dark-table >>> td, .dark-table >>> th {
  border-bottom: 1px solid var(--border-light) !important;
}
.dark-table >>> .el-table__empty-text {
  color: var(--text-muted) !important;
}

@media (max-width: 900px) {
  .chart-row { flex-direction: column; }
  .overview-cards { gap: 10px; }
  .ov-card { min-width: 120px; }
}
</style>
