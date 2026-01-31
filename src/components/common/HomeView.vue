<template>
  <div class="home-dashboard">
    <!-- 欢迎栏：日期、问候、快捷入口 -->
    <section class="welcome-bar">
      <div class="welcome-left">
        <span class="welcome-date">{{ formatDate }}</span>
        <span class="welcome-greeting">{{ greeting }}，{{ userInfo.username || '用户' }}</span>
      </div>
      <div class="quick-actions">
        <router-link to="/chat" class="quick-btn">
          <i class="el-icon-chat-dot-round"></i>
          开始问答
        </router-link>
        <router-link to="/graph" class="quick-btn">
          <i class="el-icon-data-analysis"></i>
          查看图谱
        </router-link>
      </div>
    </section>

    <!-- 第一行：6 个指标卡 -->
    <section class="metrics-row">
      <div class="metric-card">
        <i class="metric-icon el-icon-s-data"></i>
        <div class="metric-value">{{ metrics.totalEntities }}</div>
        <div class="metric-label">总实体数</div>
      </div>
      <div class="metric-card">
        <i class="metric-icon el-icon-link"></i>
        <div class="metric-value">{{ metrics.totalRelations }}</div>
        <div class="metric-label">总关系数</div>
      </div>
      <div class="metric-card">
        <i class="metric-icon el-icon-pie-chart"></i>
        <div class="metric-value">{{ metrics.graphCount }}</div>
        <div class="metric-label">知识图谱</div>
      </div>
      <div class="metric-card">
        <i class="metric-icon el-icon-document"></i>
        <div class="metric-value">{{ metrics.docCount }}</div>
        <div class="metric-label">知识库文档</div>
      </div>
      <div class="metric-card">
        <i class="metric-icon el-icon-search"></i>
        <div class="metric-value">{{ metrics.searchCount }}</div>
        <div class="metric-label">检索次数</div>
      </div>
      <div class="metric-card">
        <i class="metric-icon el-icon-s-claim"></i>
        <div class="metric-value">{{ metrics.accuracy }}%</div>
        <div class="metric-label">数据准确率</div>
      </div>
    </section>

    <!-- 第二行：左 知识数据统计 柱状图 | 右 使用活跃度 折线+3 小卡 -->
    <section class="charts-row">
      <div class="panel panel-stats">
        <h3 class="panel-title">知识数据统计</h3>
        <p class="panel-subtitle">展示近 7/14 天内实体与关系的新增趋势（示意数据，可与实际图谱数据对齐）</p>
        <div class="chart-tabs">
          <span
            v-for="t in timeRangeOpts"
            :key="t.key"
            :class="{ active: timeRange === t.key }"
            @click="timeRange = t.key"
          >{{ t.label }}</span>
        </div>
        <div id="statsChart" class="chart"></div>
      </div>
      <div class="panel panel-activity">
        <h3 class="panel-title">使用活跃度分析</h3>
        <p class="panel-subtitle">按会话和活跃用户估计系统使用情况，辅助评估智能体与图谱的应用热度</p>
        <div class="activity-cards">
          <div class="mini-card">
            <div class="mini-value">{{ activity.total }}</div>
            <div class="mini-label">总会话/用户</div>
          </div>
          <div class="mini-card">
            <div class="mini-value">{{ activity.active24h }}</div>
            <div class="mini-label">24H 活跃</div>
          </div>
          <div class="mini-card">
            <div class="mini-value">{{ activity.active7d }}</div>
            <div class="mini-label">7日 活跃</div>
          </div>
        </div>
        <div id="activityChart" class="chart"></div>
      </div>
    </section>

    <!-- 第三行：3 个分析面板 -->
    <section class="panels-row">
      <div class="panel panel-analysis">
        <h3 class="panel-title">知识图谱概况</h3>
        <div class="panel-metrics">
          <p>图谱总数 <strong>{{ metrics.graphCount }}</strong> 个</p>
          <p>总实体 <strong>{{ metrics.totalEntities }}</strong>，总关系 <strong>{{ metrics.totalRelations }}</strong></p>
        </div>
        <div class="top-block">
          <div class="top-block-title">实体类型分布 TOP 3</div>
          <div class="top-list">
            <span v-for="(t, i) in entityTop3" :key="i" class="top-item">
              <span class="dot" :style="{ background: t.color }"></span>{{ t.name }} {{ t.value }}
            </span>
          </div>
        </div>
      </div>
      <div class="panel panel-analysis">
        <h3 class="panel-title">检索与问答监控</h3>
        <div class="panel-metrics">
          <p>总检索 <strong>{{ metrics.searchCount }}</strong></p>
          <p>失败 <strong class="text-danger">{{ metrics.searchFail }}</strong>，成功率 <strong class="text-success">{{ metrics.searchRate }}%</strong></p>
        </div>
        <div class="top-block">
          <div class="top-block-title">热门检索 TOP 3</div>
          <div class="top-list">{{ searchTop3 }}</div>
        </div>
      </div>
      <div class="panel panel-analysis">
        <h3 class="panel-title">知识库使用情况</h3>
        <div class="panel-metrics">
          <p>知识库 <strong>1</strong> 个，文档 <strong>{{ metrics.docCount }}</strong> 个</p>
          <p>存储容量 <strong>{{ metrics.storage }}</strong></p>
        </div>
        <div class="top-block">
          <div class="top-block-title">类型分布</div>
          <div class="top-list">
            <span class="top-item"><span class="dot" style="background:#00f5d4"></span>PDF</span>
            <span class="top-item"><span class="dot" style="background:#00bbf9"></span>TXT</span>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import dayjs from 'dayjs'
import { mapGetters } from 'vuex'

export default {
  name: 'HomeView',
  data() {
    return {
      timeRange: '7d',
      timeRangeOpts: [
        { key: '7d', label: '近7天' },
        { key: '14d', label: '近14天' },
        { key: '14w', label: '近14周' }
      ],
      metrics: {
        totalEntities: '10,500',
        totalRelations: '52,000',
        graphCount: '12',
        docCount: '21',
        searchCount: '15,230',
        accuracy: '99.9',
        searchFail: '12',
        searchRate: '99.9',
        storage: '0 B'
      },
      activity: { total: 3, active24h: 0, active7d: 3 },
      entityTop3: [
        { name: '症状', value: 3000, color: '#00f5d4' },
        { name: '疾病', value: 2500, color: '#00bbf9' },
        { name: '药物', value: 2000, color: '#22c55e' }
      ],
      searchTop3: '胰腺炎、症状、治疗',
      chartInstances: {
        stats: null,
        activity: null
      },
      statsResizeHandler: null,
      activityResizeHandler: null
    }
  },
  computed: {
    ...mapGetters(['userInfo']),
    formatDate() {
      return dayjs().format('YYYY年MM月DD日 HH:mm:ss')
    },
    greeting() {
      const h = dayjs().hour()
      if (h < 6) return '凌晨好'
      if (h < 9) return '早上好'
      if (h < 12) return '上午好'
      if (h < 14) return '中午好'
      if (h < 18) return '下午好'
      return '晚上好'
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.initCharts()
      this.startClock()
    })
    this.$root.$on('theme-changed', this.handleThemeChange)
  },
  beforeDestroy() {
    this.$root.$off('theme-changed', this.handleThemeChange)
    if (this._clockTimer) clearInterval(this._clockTimer)
    if (this.statsResizeHandler) {
      window.removeEventListener('resize', this.statsResizeHandler)
      this.statsResizeHandler = null
    }
    if (this.activityResizeHandler) {
      window.removeEventListener('resize', this.activityResizeHandler)
      this.activityResizeHandler = null
    }
    Object.values(this.chartInstances).forEach(c => c && c.dispose && c.dispose())
  },
  methods: {
    startClock() {
      this._clockTimer = setInterval(() => {
        this.$forceUpdate()
      }, 1000)
    },
    handleThemeChange() {
      this.$nextTick(() => this.initCharts())
    },
    initCharts() {
      this.initStatsChart()
      this.initActivityChart()
    },
    _theme() {
      return document.body.getAttribute('data-theme') === 'medical' ? 'medical' : 'default'
    },
    initStatsChart() {
      const dom = document.getElementById('statsChart')
      if (!dom) return
      // 先清理旧实例和旧的 resize 监听
      if (this.chartInstances.stats) {
        this.chartInstances.stats.dispose()
        this.chartInstances.stats = null
      }
      if (this.statsResizeHandler) {
        window.removeEventListener('resize', this.statsResizeHandler)
        this.statsResizeHandler = null
      }

      const ch = echarts.init(dom)
      this.chartInstances.stats = ch

      const isM = this._theme() === 'medical'
      const days = this.timeRange === '7d' ? 7 : this.timeRange === '14d' ? 14 : 14
      const xData = []
      for (let i = days - 1; i >= 0; i--) {
        xData.push(dayjs().subtract(i, 'day').format('MM-DD'))
      }
      const base = [1200, 1400, 1350, 1600, 1500, 1450, 1500]
      const base2 = [4800, 5200, 5000, 5600, 5400, 5300, 5500]
      const d1 = Array.from({ length: days }, (_, i) => base[i % base.length] + Math.floor(i / 7) * 100)
      const d2 = Array.from({ length: days }, (_, i) => base2[i % base2.length] + Math.floor(i / 7) * 200)
      const c1 = isM ? '#0066cc' : '#00f5d4'
      const c2 = isM ? '#4a90e2' : '#00bbf9'

      ch.setOption({
        tooltip: { trigger: 'axis', backgroundColor: isM ? 'rgba(255,255,255,0.95)' : 'rgba(0,0,0,0.8)', borderColor: isM ? '#0066cc' : '#00d4ff', textStyle: { color: isM ? '#000' : '#fff' } },
        grid: { left: '3%', right: '4%', bottom: '3%', top: '12%', containLabel: true },
        xAxis: { type: 'category', data: xData, axisLine: { lineStyle: { color: isM ? '#666' : 'rgba(255,255,255,0.6)' } }, axisLabel: { color: isM ? '#333' : 'rgba(255,255,255,0.8)' } },
        yAxis: { type: 'value', axisLine: { show: false }, axisLabel: { color: isM ? '#333' : 'rgba(255,255,255,0.8)' }, splitLine: { lineStyle: { color: isM ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)' } } },
        series: [
          { name: '实体', type: 'bar', stack: 'kg', data: d1, itemStyle: { color: c1, borderRadius: [4, 4, 0, 0] } },
          { name: '关系', type: 'bar', stack: 'kg', data: d2, itemStyle: { color: c2, borderRadius: [4, 4, 0, 0] } }
        ]
      })

      // 统一使用实例表中的引用做 resize，避免对已 dispose 的实例调用
      this.statsResizeHandler = () => {
        const inst = this.chartInstances.stats
        if (inst) inst.resize()
      }
      window.addEventListener('resize', this.statsResizeHandler)
    },
    initActivityChart() {
      const dom = document.getElementById('activityChart')
      if (!dom) return
      // 先清理旧实例和旧的 resize 监听
      if (this.chartInstances.activity) {
        this.chartInstances.activity.dispose()
        this.chartInstances.activity = null
      }
      if (this.activityResizeHandler) {
        window.removeEventListener('resize', this.activityResizeHandler)
        this.activityResizeHandler = null
      }

      const ch = echarts.init(dom)
      this.chartInstances.activity = ch

      const isM = this._theme() === 'medical'
      const xData = []
      for (let i = 6; i >= 0; i--) xData.push(dayjs().subtract(i, 'day').format('MM-DD'))
      const c = isM ? '#0066cc' : '#00f5d4'

      ch.setOption({
        tooltip: { trigger: 'axis', backgroundColor: isM ? 'rgba(255,255,255,0.95)' : 'rgba(0,0,0,0.8)', borderColor: isM ? '#0066cc' : '#00d4ff', textStyle: { color: isM ? '#000' : '#fff' } },
        grid: { left: '3%', right: '4%', bottom: '3%', top: '12%', containLabel: true },
        xAxis: { type: 'category', boundaryGap: false, data: xData, axisLine: { lineStyle: { color: isM ? '#666' : 'rgba(255,255,255,0.6)' } }, axisLabel: { color: isM ? '#333' : 'rgba(255,255,255,0.8)' } },
        yAxis: { type: 'value', axisLine: { show: false }, axisLabel: { color: isM ? '#333' : 'rgba(255,255,255,0.8)' }, splitLine: { lineStyle: { color: isM ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)' } } },
        series: [{ name: '活跃度', type: 'line', smooth: true, data: [2, 5, 8, 4, 6, 3, 5], lineStyle: { width: 2, color: c }, areaStyle: { color: isM ? 'rgba(0,102,204,0.2)' : 'rgba(0,245,212,0.2)' } }]
      })

      this.activityResizeHandler = () => {
        const inst = this.chartInstances.activity
        if (inst) inst.resize()
      }
      window.addEventListener('resize', this.activityResizeHandler)
    }
  },
  watch: {
    timeRange() {
      this.initStatsChart()
    }
  }
}
</script>

<style scoped>
.home-dashboard {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px 24px 40px;
}

/* 欢迎栏 */
.welcome-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 24px;
  padding: 12px 16px;
  background: rgba(0, 245, 212, 0.06);
  border: 1px solid rgba(0, 245, 212, 0.2);
  border-radius: 12px;
}

.welcome-left {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.welcome-date {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
}

.welcome-greeting {
  font-size: 15px;
  font-weight: 600;
  background: linear-gradient(135deg, #00f5d4, #00bbf9);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.quick-actions {
  display: flex;
  gap: 10px;
}

.quick-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
  color: #00f5d4;
  border: 1px solid rgba(0, 245, 212, 0.4);
  background: rgba(0, 245, 212, 0.08);
  transition: all 0.3s ease;
}

.quick-btn:hover {
  background: rgba(0, 245, 212, 0.15);
  border-color: rgba(0, 245, 212, 0.6);
  box-shadow: 0 4px 16px rgba(0, 245, 212, 0.25);
}

/* 第一行：6 指标卡 */
.metrics-row {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.metric-card {
  background: radial-gradient(circle at top left, rgba(0, 245, 212, 0.1), rgba(5, 11, 24, 0.96));
  border: 1px solid rgba(148, 163, 184, 0.28);
  border-radius: 14px;
  padding: 20px;
  text-align: center;
  transition: all 0.3s ease;
}

.metric-card:hover {
  border-color: rgba(0, 245, 212, 0.4);
  box-shadow: 0 8px 24px rgba(0, 245, 212, 0.15);
}

.metric-icon {
  font-size: 24px;
  color: #00f5d4;
  margin-bottom: 10px;
  display: block;
}

.metric-value {
  font-size: 26px;
  font-weight: 700;
  background: linear-gradient(135deg, #00f5d4, #00bbf9);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 4px;
}

.metric-label {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.65);
}

/* 第二行：2 图表面板 */
.charts-row {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 20px;
  margin-bottom: 24px;
}

.panel {
  background: radial-gradient(circle at top, rgba(0, 245, 212, 0.08), rgba(5, 11, 24, 0.98));
  border: 1px solid rgba(148, 163, 184, 0.28);
  border-radius: 14px;
  padding: 20px;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.panel:hover {
  border-color: rgba(0, 245, 212, 0.3);
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.2);
}

.panel-title {
  font-size: 16px;
  font-weight: 600;
  color: #fff;
  margin: 0 0 12px 0;
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.panel-subtitle {
  margin: 0 0 12px 0;
  font-size: 12px;
  color: rgba(148, 163, 184, 0.9);
}

.chart-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.chart-tabs span {
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  transition: all 0.2s;
}

.chart-tabs span:hover,
.chart-tabs span.active {
  background: rgba(0, 245, 212, 0.2);
  color: #00f5d4;
}

.chart {
  width: 100%;
  height: 260px;
}

/* 活跃度 3 小卡 */
.activity-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-bottom: 14px;
}

.mini-card {
  text-align: center;
  padding: 10px 8px;
  background: rgba(0, 245, 212, 0.06);
  border: 1px solid rgba(0, 245, 212, 0.15);
  border-radius: 10px;
}

.mini-value {
  font-size: 20px;
  font-weight: 700;
  color: #00f5d4;
}

.mini-label {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.6);
  margin-top: 2px;
}

.panel-activity .chart {
  height: 200px;
}

/* 第三行：3 分析面板 */
.panels-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.panel-analysis .panel-metrics {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 12px;
}

.panel-analysis .panel-metrics strong {
  color: #00f5d4;
}

.panel-analysis .panel-metrics .text-danger { color: #f56c6c; }
.panel-analysis .panel-metrics .text-success { color: #67c23a; }

.top-block {
  padding-top: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.top-block-title {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 8px;
}

.top-list {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.85);
}

.top-item {
  display: inline-block;
  margin-right: 12px;
  margin-bottom: 4px;
}

.dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 6px;
  vertical-align: middle;
}

/* 响应式 */
@media (max-width: 1200px) {
  .metrics-row { grid-template-columns: repeat(3, 1fr); }
  .charts-row { grid-template-columns: 1fr; }
}

@media (max-width: 768px) {
  .home-dashboard { padding: 16px; }
  .metrics-row { grid-template-columns: repeat(2, 1fr); gap: 12px; }
  .metric-value { font-size: 22px; }
  .panels-row { grid-template-columns: 1fr; }
  .welcome-bar { flex-direction: column; align-items: flex-start; }
}

@media (max-width: 480px) {
  .metrics-row { grid-template-columns: 1fr; }
  .activity-cards { grid-template-columns: 1fr; }
}
</style>
