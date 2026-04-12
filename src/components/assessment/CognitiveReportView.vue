<template>
  <div class="cognitive-report-view">
    <div class="report-header" v-if="showHeader">
      <h2 class="report-title">{{ reportTitle }}</h2>
      <div class="report-meta">
        <span class="report-type-badge" :class="reportType">{{ reportTypeLabel }}</span>
        <span class="report-time" v-if="report.generated_at">
          {{ formatTime(report.generated_at) }}
        </span>
      </div>
    </div>

    <div class="report-content" v-loading="loading">
      <div v-if="error" class="error-container">
        <el-alert :title="error" type="error" show-icon :closable="false" />
      </div>

      <template v-else-if="report && !report.error">
        <el-row :gutter="20">
          <el-col :xs="24" :sm="12" :md="8">
            <div class="score-card" :class="'level-' + summaryLevel">
              <div class="score-ring-container">
                <svg class="score-ring" viewBox="0 0 120 120">
                  <circle class="ring-bg" cx="60" cy="60" r="52" />
                  <circle
                    class="ring-progress"
                    cx="60" cy="60" r="52"
                    :stroke-dasharray="circumference"
                    :stroke-dashoffset="progressOffset"
                    :class="summaryLevel"
                  />
                </svg>
                <div class="score-center">
                  <span class="score-value">{{ (summaryScore * 100).toFixed(0) }}</span>
                  <span class="score-unit">分</span>
                </div>
              </div>
              <div class="score-info">
                <span class="level-badge" :class="summaryLevel">{{ levelLabel }}</span>
                <span class="score-desc">综合认知负荷</span>
              </div>
            </div>
          </el-col>

          <el-col :xs="24" :sm="12" :md="8" v-if="report.summary">
            <div class="detail-card">
              <h4 class="card-title">分项评分</h4>
              <div class="score-breakdown">
                <div class="breakdown-item" v-if="report.summary.behavior_score !== null">
                  <span class="breakdown-label">行为评分</span>
                  <el-progress
                    :percentage="(report.summary.behavior_score * 100).toFixed(0)"
                    :stroke-width="10"
                    :color="getScoreColor(report.summary.behavior_score)"
                  />
                </div>
                <div class="breakdown-item" v-if="report.summary.questionnaire_score !== null">
                  <span class="breakdown-label">问卷评分</span>
                  <el-progress
                    :percentage="(report.summary.questionnaire_score * 100).toFixed(0)"
                    :stroke-width="10"
                    :color="getScoreColor(report.summary.questionnaire_score)"
                  />
                </div>
                <div class="breakdown-item" v-if="report.summary.task_time">
                  <span class="breakdown-label">任务耗时</span>
                  <span class="breakdown-value">{{ report.summary.task_time }}</span>
                </div>
              </div>
            </div>
          </el-col>

          <el-col :xs="24" :sm="12" :md="8" v-if="report.benchmarks">
            <div class="detail-card">
              <h4 class="card-title">对比参考</h4>
              <div class="benchmark-list">
                <div class="benchmark-item">
                  <span class="benchmark-label">个人历史平均</span>
                  <span class="benchmark-value">{{ (report.benchmarks.user_historical_avg * 100).toFixed(0) }}%</span>
                </div>
                <div class="benchmark-item">
                  <span class="benchmark-label">同龄组平均</span>
                  <span class="benchmark-value">{{ (report.benchmarks.elderly_norm * 100).toFixed(0) }}%</span>
                </div>
                <div class="benchmark-item">
                  <span class="benchmark-label">百分位排名</span>
                  <span class="benchmark-value">第 {{ report.benchmarks.percentile }} 位</span>
                </div>
              </div>
            </div>
          </el-col>
        </el-row>

        <el-row :gutter="20" v-if="report.radar_chart">
          <el-col :span="24">
            <div class="radar-section">
              <h3 class="section-title">认知负荷分布</h3>
              <div class="radar-container">
                <div class="radar-chart" ref="radarChartRef"></div>
                <div class="radar-legend">
                  <div v-for="(dim, idx) in report.radar_chart.dimensions" :key="dim" class="legend-item">
                    <span class="legend-color" :style="{ background: chartColors[idx % chartColors.length] }"></span>
                    <span class="legend-label">{{ dim }}</span>
                    <span class="legend-value">{{ report.radar_chart.raw_scores[idx] }}/7</span>
                  </div>
                </div>
              </div>
            </div>
          </el-col>
        </el-row>

        <el-row :gutter="20" v-if="report.risk_alerts && report.risk_alerts.length">
          <el-col :span="24">
            <div class="alerts-section">
              <h3 class="section-title warning">
                <i class="el-icon-warning"></i>
                风险预警
              </h3>
              <div class="alert-list">
                <el-alert
                  v-for="(alert, idx) in report.risk_alerts"
                  :key="idx"
                  :title="alert"
                  type="warning"
                  :closable="false"
                  show-icon
                />
              </div>
            </div>
          </el-col>
        </el-row>

        <el-row :gutter="20" v-if="report.key_findings && report.key_findings.length">
          <el-col :span="24">
            <div class="findings-section">
              <h3 class="section-title">
                <i class="el-icon-info"></i>
                关键发现
              </h3>
              <ul class="findings-list">
                <li v-for="(finding, idx) in report.key_findings" :key="idx">{{ finding }}</li>
              </ul>
            </div>
          </el-col>
        </el-row>

        <el-row :gutter="20" v-if="report.positive_aspects && report.positive_aspects.length">
          <el-col :span="24">
            <div class="positive-section">
              <h3 class="section-title positive">
                <i class="el-icon-circle-check"></i>
                积极方面
              </h3>
              <ul class="positive-list">
                <li v-for="(item, idx) in report.positive_aspects" :key="idx">{{ item }}</li>
              </ul>
            </div>
          </el-col>
        </el-row>

        <el-row :gutter="20" v-if="report.suggestions && report.suggestions.length">
          <el-col :span="24">
            <div class="suggestions-section">
              <h3 class="section-title">
                <i class="el-icon-lightbulb"></i>
                优化建议
              </h3>
              <div class="suggestion-cards">
                <el-card
                  v-for="(suggestion, idx) in report.suggestions"
                  :key="idx"
                  class="suggestion-card"
                  :class="'priority-' + suggestion.priority"
                  shadow="hover"
                >
                  <div class="suggestion-header">
                    <el-tag :type="getPriorityType(suggestion.priority)" size="small">
                      {{ getPriorityLabel(suggestion.priority) }}
                    </el-tag>
                    <span class="suggestion-category">{{ suggestion.category }}</span>
                  </div>
                  <p class="suggestion-text">{{ suggestion.suggestion }}</p>
                  <div class="suggestion-impact" v-if="suggestion.expected_impact">
                    <i class="el-icon-connection"></i>
                    {{ suggestion.expected_impact }}
                  </div>
                </el-card>
              </div>
            </div>
          </el-col>
        </el-row>

        <el-row :gutter="20" v-if="report.timeline">
          <el-col :span="24">
            <div class="trend-section">
              <h3 class="section-title">认知负荷趋势</h3>
              <div class="trend-chart" ref="trendChartRef"></div>
              <div class="trend-summary" v-if="report.trend_summary">
                <div class="summary-item">
                  <span class="summary-label">趋势方向</span>
                  <span class="summary-value" :class="report.trend_summary.trend_direction">
                    {{ getTrendIcon(report.trend_summary.trend_direction) }}
                    {{ getTrendLabel(report.trend_summary.trend_direction) }}
                  </span>
                </div>
                <div class="summary-item">
                  <span class="summary-label">变化率</span>
                  <span class="summary-value">
                    {{ (report.trend_summary.change_rate * 100).toFixed(1) }}%
                  </span>
                </div>
              </div>
            </div>
          </el-col>
        </el-row>
      </template>

      <div v-else-if="!loading" class="empty-state">
        <el-empty description="暂无报告数据"></el-empty>
      </div>
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts'

const CHART_COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD']

export default {
  name: 'CognitiveReportView',

  props: {
    report: {
      type: Object,
      default: () => ({})
    },
    reportType: {
      type: String,
      default: 'single'
    },
    loading: {
      type: Boolean,
      default: false
    },
    error: {
      type: String,
      default: ''
    },
    showHeader: {
      type: Boolean,
      default: true
    }
  },

  data() {
    return {
      chartColors: CHART_COLORS,
      circumference: 2 * Math.PI * 52,
      radarChart: null,
      trendChart: null
    }
  },

  computed: {
    reportTitle() {
      const titles = {
        single: '单次评估报告',
        task: '任务分析报告',
        trend: '认知负荷趋势',
        period: '周期评估报告'
      }
      return titles[this.reportType] || '评估报告'
    },

    reportTypeLabel() {
      const labels = {
        single: '即时',
        task: '任务',
        trend: '趋势',
        period: '周期'
      }
      return labels[this.reportType] || ''
    },

    summaryScore() {
      return this.report?.summary?.overall_score || 0.5
    },

    summaryLevel() {
      return this.report?.summary?.overall_level || 'medium'
    },

    levelLabel() {
      const labels = {
        low: '低负荷',
        medium: '中等',
        high: '高负荷'
      }
      return labels[this.summaryLevel] || '未知'
    },

    progressOffset() {
      return this.circumference * (1 - this.summaryScore)
    }
  },

  watch: {
    report: {
      handler() {
        this.$nextTick(() => {
          this.initRadarChart()
          this.initTrendChart()
        })
      },
      deep: true
    }
  },

  mounted() {
    this.$nextTick(() => {
      this.initRadarChart()
      this.initTrendChart()
    })
  },

  beforeDestroy() {
    if (this.radarChart) {
      this.radarChart.dispose()
    }
    if (this.trendChart) {
      this.trendChart.dispose()
    }
  },

  methods: {
    getScoreColor(score) {
      if (score < 0.4) return '#67c23a'
      if (score < 0.7) return '#e6a23c'
      return '#f56c6c'
    },

    getPriorityType(priority) {
      const types = {
        high: 'danger',
        medium: 'warning',
        low: 'info'
      }
      return types[priority] || 'info'
    },

    getPriorityLabel(priority) {
      const labels = {
        high: '高优先',
        medium: '中优先',
        low: '低优先'
      }
      return labels[priority] || priority
    },

    getTrendIcon(direction) {
      const icons = {
        increasing: '↑',
        decreasing: '↓',
        stable: '→'
      }
      return icons[direction] || '→'
    },

    getTrendLabel(direction) {
      const labels = {
        increasing: '上升中',
        decreasing: '下降中',
        stable: '稳定'
      }
      return labels[direction] || '稳定'
    },

    formatTime(isoString) {
      if (!isoString) return ''
      return new Date(isoString).toLocaleString('zh-CN')
    },

    initRadarChart() {
      if (!this.$refs.radarChartRef || !this.report?.radar_chart) return

      if (this.radarChart) {
        this.radarChart.dispose()
      }

      this.radarChart = echarts.init(this.$refs.radarChartRef)

      const option = {
        color: ['#5470c6', '#91cc75'],
        tooltip: {
          trigger: 'item'
        },
        legend: {
          data: ['本次评估', '老年人常模'],
          bottom: 0,
          textStyle: { color: '#fff' }
        },
        radar: {
          indicator: this.report.radar_chart.dimensions.map((dim, idx) => ({
            name: dim,
            max: 1,
            axisName: {
              color: CHART_COLORS[idx % CHART_COLORS.length]
            }
          })),
          shape: 'polygon',
          splitNumber: 4,
          axisName: {
            color: '#fff'
          },
          splitLine: {
            lineStyle: { color: 'rgba(255,255,255,0.1)' }
          },
          splitArea: {
            areaStyle: { color: ['rgba(64,158,255,0.05)', 'rgba(64,158,255,0.1)'] }
          },
          axisLine: {
            lineStyle: { color: 'rgba(255,255,255,0.2)' }
          }
        },
        series: [
          {
            type: 'radar',
            data: [
              {
                value: this.report.radar_chart.scores,
                name: '本次评估',
                lineStyle: { color: '#409eff', width: 2 },
                areaStyle: { color: 'rgba(64,158,255,0.3)' },
                itemStyle: { color: '#409eff' }
              },
              {
                value: this.report.radar_chart.norm_values,
                name: '老年人常模',
                lineStyle: { color: '#67c23a', width: 2, type: 'dashed' },
                areaStyle: { color: 'rgba(103,194,58,0.2)' },
                itemStyle: { color: '#67c23a' }
              }
            ]
          }
        ]
      }

      this.radarChart.setOption(option)
      window.addEventListener('resize', () => this.radarChart?.resize())
    },

    initTrendChart() {
      if (!this.$refs.trendChartRef || !this.report?.timeline) return

      if (this.trendChart) {
        this.trendChart.dispose()
      }

      this.trendChart = echarts.init(this.$refs.trendChartRef)

      const timeline = this.report.timeline

      const option = {
        tooltip: {
          trigger: 'axis'
        },
        xAxis: {
          type: 'category',
          data: timeline.dates,
          axisLabel: { color: '#fff' },
          axisLine: { lineStyle: { color: '#fff' } }
        },
        yAxis: {
          type: 'value',
          min: 0,
          max: 1,
          axisLabel: {
            color: '#fff',
            formatter: (val) => (val * 100).toFixed(0) + '%'
          },
          splitLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } }
        },
        series: [
          {
            type: 'line',
            data: timeline.scores,
            smooth: true,
            lineStyle: {
              color: '#409eff',
              width: 3
            },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(64,158,255,0.5)' },
                { offset: 1, color: 'rgba(64,158,255,0.1)' }
              ])
            },
            itemStyle: {
              color: '#409eff'
            },
            markLine: {
              silent: true,
              data: [
                { yAxis: 0.4, lineStyle: { color: '#67c23a' }, name: '低' },
                { yAxis: 0.7, lineStyle: { color: '#f56c6c' }, name: '高' }
              ],
              label: { color: '#fff', formatter: '{b}' }
            }
          }
        ],
        grid: {
          left: '10%',
          right: '10%',
          bottom: '15%',
          top: '10%'
        }
      }

      this.trendChart.setOption(option)
      window.addEventListener('resize', () => this.trendChart?.resize())
    }
  }
}
</script>

<style scoped>
.cognitive-report-view {
  padding: 20px;
}

.report-header {
  margin-bottom: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.report-title {
  margin: 0;
  font-size: 24px;
  color: #fff;
}

.report-meta {
  display: flex;
  align-items: center;
  gap: 12px;
}

.report-type-badge {
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
}

.report-type-badge.single { background: #409eff; color: white; }
.report-type-badge.task { background: #67c23a; color: white; }
.report-type-badge.trend { background: #e6a23c; color: white; }
.report-type-badge.period { background: #909399; color: white; }

.report-time {
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
}

.error-container {
  padding: 40px;
}

.score-card {
  background: linear-gradient(135deg, rgba(64,158,255,0.2), rgba(64,158,255,0.05));
  border-radius: 16px;
  padding: 24px;
  text-align: center;
  border: 1px solid rgba(64,158,255,0.3);
  height: 100%;
}

.score-card.level-low {
  background: linear-gradient(135deg, rgba(103,194,58,0.2), rgba(103,194,58,0.05));
  border-color: rgba(103,194,58,0.3);
}

.score-card.level-high {
  background: linear-gradient(135deg, rgba(245,108,108,0.2), rgba(245,108,108,0.05));
  border-color: rgba(245,108,108,0.3);
}

.score-ring-container {
  position: relative;
  width: 120px;
  height: 120px;
  margin: 0 auto 16px;
}

.score-ring {
  transform: rotate(-90deg);
  width: 100%;
  height: 100%;
}

.ring-bg {
  fill: none;
  stroke: rgba(255,255,255,0.1);
  stroke-width: 8;
}

.ring-progress {
  fill: none;
  stroke-width: 8;
  stroke-linecap: round;
  stroke: #409eff;
  transition: stroke-dashoffset 1s ease;
}

.ring-progress.low { stroke: #67c23a; }
.ring-progress.high { stroke: #f56c6c; }

.score-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.score-value {
  display: block;
  font-size: 36px;
  font-weight: bold;
  color: #fff;
  line-height: 1;
}

.score-unit {
  font-size: 12px;
  color: rgba(255,255,255,0.5);
}

.score-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.level-badge {
  padding: 4px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: bold;
  display: inline-block;
}

.level-badge.low { background: #67c23a; color: white; }
.level-badge.medium { background: #e6a23c; color: white; }
.level-badge.high { background: #f56c6c; color: white; }

.score-desc {
  color: rgba(255,255,255,0.6);
  font-size: 14px;
}

.detail-card,
.radar-section,
.alerts-section,
.findings-section,
.positive-section,
.suggestions-section,
.trend-section {
  background: rgba(255,255,255,0.05);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  border: 1px solid rgba(255,255,255,0.08);
}

.card-title,
.section-title {
  margin: 0 0 16px 0;
  font-size: 16px;
  color: #fff;
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-title.warning { color: #e6a23c; }
.section-title.positive { color: #67c23a; }

.score-breakdown {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.breakdown-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.breakdown-label {
  color: rgba(255,255,255,0.7);
  font-size: 14px;
}

.breakdown-value {
  color: #fff;
  font-size: 18px;
  font-weight: bold;
}

.benchmark-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.benchmark-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.benchmark-label {
  color: rgba(255,255,255,0.6);
  font-size: 14px;
}

.benchmark-value {
  color: #fff;
  font-weight: bold;
}

.radar-container {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
}

.radar-chart {
  width: 300px;
  height: 300px;
  flex-shrink: 0;
}

.radar-legend {
  display: flex;
  flex-direction: column;
  gap: 8px;
  justify-content: center;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 2px;
}

.legend-label {
  color: rgba(255,255,255,0.7);
}

.legend-value {
  color: #fff;
  font-weight: bold;
  margin-left: auto;
}

.alert-list,
.findings-list,
.positive-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.findings-list li,
.positive-list li {
  padding: 8px 0;
  color: rgba(255,255,255,0.8);
  border-bottom: 1px solid rgba(255,255,255,0.05);
}

.findings-list li:last-child,
.positive-list li:last-child {
  border-bottom: none;
}

.suggestion-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.suggestion-card {
  background: rgba(255,255,255,0.05);
  border-radius: 8px;
  border: 1px solid rgba(255,255,255,0.1);
}

.suggestion-card.priority-high {
  border-left: 3px solid #f56c6c;
}

.suggestion-card.priority-medium {
  border-left: 3px solid #e6a23c;
}

.suggestion-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.suggestion-category {
  color: rgba(255,255,255,0.6);
  font-size: 12px;
}

.suggestion-text {
  margin: 0 0 12px 0;
  color: #fff;
  line-height: 1.6;
}

.suggestion-impact {
  color: rgba(255,255,255,0.5);
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.trend-chart {
  width: 100%;
  height: 300px;
}

.trend-summary {
  display: flex;
  gap: 24px;
  margin-top: 16px;
  flex-wrap: wrap;
}

.summary-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.summary-label {
  color: rgba(255,255,255,0.5);
  font-size: 12px;
}

.summary-value {
  color: #fff;
  font-size: 16px;
  font-weight: bold;
}

.summary-value.increasing { color: #f56c6c; }
.summary-value.decreasing { color: #67c23a; }
.summary-value.stable { color: #409eff; }

.empty-state {
  padding: 60px 20px;
  text-align: center;
}
</style>
