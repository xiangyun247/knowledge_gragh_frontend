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
          问一问
        </router-link>
        <router-link to="/patient-education" class="quick-btn">
          <i class="el-icon-medal"></i>
          患者教育
        </router-link>
        <router-link to="/graph" class="quick-btn">
          <i class="el-icon-data-analysis"></i>
          知识图谱
        </router-link>
        <el-dropdown trigger="click" class="quick-dropdown" @command="goMore">
          <span class="quick-btn quick-btn-more">
            <i class="el-icon-more"></i>
            更多
            <i class="el-icon-arrow-down"></i>
          </span>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command="/search">实体搜索</el-dropdown-item>
            <el-dropdown-item command="/knowledge-base">知识库</el-dropdown-item>
            <el-dropdown-item command="/upload">数据上传</el-dropdown-item>
            <el-dropdown-item command="/history">历史记录</el-dropdown-item>
            <el-dropdown-item command="/cognitive-load">认知负荷评估</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
    </section>

    <!-- 今日三件小事：数据驱动 -->
    <section class="daily-tasks-section">
      <div class="section-header">
        <h3 class="section-title">
          <i class="el-icon-sunny"></i>
          今日三件小事
        </h3>
        <span class="section-hint">系统根据您的使用数据自动推荐，完成后可打勾</span>
      </div>
      <div class="daily-tasks-list">
        <div
          v-for="(task, idx) in smartTasks"
          :key="task.id"
          :class="['daily-task-card', { done: task.done }]"
          @click="toggleTask(task)"
        >
          <div class="task-check">
            <i :class="task.done ? 'el-icon-success' : 'el-icon-circle-check'"></i>
          </div>
          <div class="task-body">
            <div class="task-num">{{ idx + 1 }}</div>
            <div class="task-content">
              <div class="task-title">{{ task.title }}</div>
              <div class="task-desc">{{ task.desc }}</div>
            </div>
          </div>
          <div class="task-tag" :style="{ background: task.tagColor }">{{ task.tag }}</div>
        </div>
      </div>
      <div class="tasks-progress-bar">
        <div class="tasks-progress-fill" :style="{ width: taskProgress + '%' }"></div>
      </div>
      <div class="tasks-progress-label">
        已完成 {{ doneCount }} / {{ smartTasks.length }}
        <span v-if="doneCount === smartTasks.length" class="all-done-text">全部完成，今天做得很好！</span>
      </div>
    </section>

    <!-- 今日日程时间轴 -->
    <section class="timeline-section" v-if="timelineItems.length">
      <div class="section-header">
        <h3 class="section-title">
          <i class="el-icon-date"></i>
          今日日程
        </h3>
        <span class="section-hint">整合服药、学习与生活提醒</span>
      </div>
      <div class="timeline-list">
        <div
          v-for="(item, idx) in timelineItems"
          :key="idx"
          :class="['tl-item', { done: item.done, soon: item.soon, missed: item.missed, current: item.current, future: item.future }]"
        >
          <div class="tl-time">{{ item.time }}</div>
          <div class="tl-dot-col">
            <div
              :class="[
                'tl-dot',
                item.done ? 'tl-dot-done' : '',
                item.soon ? 'tl-dot-soon' : '',
                item.missed ? 'tl-dot-missed' : '',
                !item.done && !item.missed && item.current ? 'tl-dot-now' : ''
              ]"
            >
              <i
                :class="item.done ? 'el-icon-check' : item.missed ? 'el-icon-warning' : item.icon"
                v-if="item.done || item.missed || item.current"
              ></i>
            </div>
            <div class="tl-line" v-if="idx < timelineItems.length - 1"></div>
          </div>
          <div class="tl-content">
            <div class="tl-label">
              {{ item.label }}
              <span v-if="item.done" class="tl-status tl-status-done">已完成</span>
              <span v-else-if="item.soon" class="tl-status tl-status-soon">提醒中</span>
              <span v-else-if="item.missed" class="tl-status tl-status-missed">已错过</span>
              <span v-if="!item.done && item.snoozed" class="tl-status tl-status-snoozed">已推迟</span>
            </div>
            <div class="tl-desc" v-if="item.desc">{{ item.desc }}</div>
          </div>
          <div v-if="item.route && !item.done" class="tl-actions">
            <button class="tl-snooze" type="button" @click.stop="snoozeItem(item)">稍后提醒</button>
            <router-link :to="item.route" class="tl-go">
              {{ item.missed ? '马上查看' : item.soon ? '去处理' : '前往' }} <i class="el-icon-right"></i>
            </router-link>
          </div>
        </div>
      </div>
    </section>

    <!-- 认知减负引擎可视化 -->
    <section class="engine-section">
      <div class="section-header">
        <h3 class="section-title">
          <i class="el-icon-cpu"></i>
          认知减负引擎
        </h3>
        <span class="section-hint">实时运行的自适应策略 pipeline</span>
      </div>
      <div class="engine-pipeline">
        <div class="engine-stage" v-for="(stage, idx) in engineStages" :key="stage.id">
          <div :class="['stage-icon-wrap', { active: stage.active }]">
            <i :class="stage.icon"></i>
          </div>
          <div class="stage-label">{{ stage.label }}</div>
          <div class="stage-value">{{ stage.value }}</div>
          <div v-if="idx < engineStages.length - 1" class="stage-arrow">
            <span class="arrow-line"></span>
            <i class="el-icon-right"></i>
          </div>
        </div>
      </div>
      <div class="engine-detail-row">
        <div class="engine-detail-card" v-for="d in engineDetails" :key="d.label">
          <div class="ed-label">{{ d.label }}</div>
          <div :class="['ed-value', d.cls]">{{ d.value }}</div>
        </div>
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
import { home } from '../../api'
import { getCognitiveEvents, getCognitiveQuestionnaires, getRecommendedDisplayMode } from '@/utils/cognitiveLoad'
import { getEChartsTheme } from '@/utils/echartsTheme'

const TASK_DONE_KEY = 'home_daily_tasks_done'

function todayKey() {
  return dayjs().format('YYYY-MM-DD')
}

function loadDoneIds() {
  try {
    const raw = JSON.parse(localStorage.getItem(TASK_DONE_KEY) || '{}')
    return raw[todayKey()] || []
  } catch { return [] }
}

function saveDoneIds(ids) {
  try {
    const raw = JSON.parse(localStorage.getItem(TASK_DONE_KEY) || '{}')
    raw[todayKey()] = ids
    const keys = Object.keys(raw).sort()
    if (keys.length > 7) {
      keys.slice(0, keys.length - 7).forEach(k => delete raw[k])
    }
    localStorage.setItem(TASK_DONE_KEY, JSON.stringify(raw))
  } catch { /* noop */ }
}

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
      searchTop3: '认知障碍、记忆、日常照护',
      doneTaskIds: loadDoneIds(),
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
    },

    // ---- 智能每日任务 ----
    smartTasks() {
      const tasks = []
      const meds = this._getMeds()
      const events = getCognitiveEvents()
      const quests = getCognitiveQuestionnaires()
      const todayStart = dayjs().startOf('day').valueOf()
      const todayEvents = events.filter(e => e.ts >= todayStart)
      const todayMedRecords = this._getTodayMedRecords()

      // Task 1: medication-related
      if (meds.length > 0) {
        const pending = meds.filter(m => {
          return !todayMedRecords.some(r => r.medId === m.id)
        })
        if (pending.length > 0) {
          tasks.push({
            id: 'med_take',
            title: `按时服药：${pending[0].name}`,
            desc: `今日还有 ${pending.length} 种药物未确认服用，前往服药提醒页完成打卡`,
            tag: '服药',
            tagColor: '#f56c6c',
            done: this.doneTaskIds.includes('med_take')
          })
        } else {
          tasks.push({
            id: 'med_done',
            title: '服药已全部完成',
            desc: '今日药物均已确认服用，继续保持',
            tag: '服药',
            tagColor: '#00f5d4',
            done: true
          })
        }
      } else {
        tasks.push({
          id: 'med_setup',
          title: '设置您的药物清单',
          desc: '前往服药提醒页添加您正在使用的药物，系统将自动追踪',
          tag: '设置',
          tagColor: '#e6a23c',
          done: this.doneTaskIds.includes('med_setup')
        })
      }

      // Task 2: cognitive/education-related
      const eduEvents = todayEvents.filter(e => e.source === 'patient_education')
      if (eduEvents.length === 0) {
        tasks.push({
          id: 'edu_read',
          title: '阅读一篇健康知识',
          desc: '前往患者教育中心，花 3 分钟阅读一个主题，系统会自动调整内容难度',
          tag: '学习',
          tagColor: '#00bbf9',
          done: this.doneTaskIds.includes('edu_read')
        })
      } else {
        tasks.push({
          id: 'edu_read',
          title: '今日已完成健康阅读',
          desc: `已浏览 ${eduEvents.filter(e => e.event_type === 'task_start').length} 篇教育内容`,
          tag: '学习',
          tagColor: '#00f5d4',
          done: true
        })
      }

      // Task 3: social/report-related
      const recentQ = quests.filter(q => q.ts >= todayStart)
      if (recentQ.length === 0 && events.length > 5) {
        tasks.push({
          id: 'report_check',
          title: '查看家属周报',
          desc: '您已有足够的使用数据，可以前往家属周报页查看本周照护概况',
          tag: '沟通',
          tagColor: '#9b59b6',
          done: this.doneTaskIds.includes('report_check')
        })
      } else {
        tasks.push({
          id: 'chat_ask',
          title: '向 AI 问一个问题',
          desc: '有任何关于认知障碍照护的疑问？试试与 AI 对话',
          tag: '互动',
          tagColor: '#00bbf9',
          done: this.doneTaskIds.includes('chat_ask')
        })
      }

      return tasks
    },
    doneCount() {
      return this.smartTasks.filter(t => t.done).length
    },
    taskProgress() {
      return this.smartTasks.length > 0 ? Math.round((this.doneCount / this.smartTasks.length) * 100) : 0
    },

    // ---- 日程时间轴 ----
    timelineItems() {
      const items = []
      const now = dayjs()
      const nowHHmm = now.format('HH:mm')
      const today = now.format('YYYY-MM-DD')
      const todayStartMs = now.startOf('day').valueOf()
      const weekStartMs = now.startOf('week').valueOf()
      const events = getCognitiveEvents()
      const GRACE_MINUTES = 15 // 宽限期：超过才算“已错过”

      // 1) 服药任务
      const meds = this._getMeds()
      const medRecords = this._getTodayMedRecords()
      for (const med of meds) {
        const freqMap = { qd: [med.time], prn: [med.time] }
        if (med.frequency === 'bid') {
          const h = parseInt(med.time.split(':')[0], 10)
          freqMap.bid = [med.time, ((h + 12) % 24).toString().padStart(2, '0') + ':00']
        }
        if (med.frequency === 'tid') {
          const h = parseInt(med.time.split(':')[0], 10)
          freqMap.tid = [med.time, ((h + 6) % 24).toString().padStart(2, '0') + ':00', ((h + 12) % 24).toString().padStart(2, '0') + ':00']
        }
        const times = freqMap[med.frequency] || [med.time]
        for (const t of times) {
          const done = medRecords.some(r => r.medId === med.id && r.time === t)
          items.push({
            id: `med_${med.id}_${t}`,
            time: t,
            label: `服药：${med.name}`,
            desc: med.dosage,
            icon: 'el-icon-first-aid-kit',
            done,
            route: '/medication',
            category: 'med'
          })
        }
      }

      // 2) 固定提醒
      const todayEndMs = todayStartMs + 24 * 60 * 60 * 1000

      const parseHHmmToMinutes = (hhmm) => {
        const [hStr, mStr] = String(hhmm || '').split(':')
        const h = Number(hStr)
        const m = Number(mStr)
        if (Number.isNaN(h) || Number.isNaN(m)) return null
        return h * 60 + m
      }

      const formatMinutesToHHmm = (minutes) => {
        const m = Math.max(0, Math.min(1439, Number(minutes)))
        const h = Math.floor(m / 60)
        const mm = m % 60
        return `${String(h).padStart(2, '0')}:${String(mm).padStart(2, '0')}`
      }

      const roundMinutesToStep = (minutes, step = 5) => {
        const m = Number(minutes)
        if (!Number.isFinite(m)) return null
        return Math.round(m / step) * step
      }

      const median = (arr) => {
        const xs = (arr || []).filter(v => Number.isFinite(v)).sort((a, b) => a - b)
        if (!xs.length) return null
        return xs[Math.floor(xs.length / 2)]
      }

      const eduEventsAll = events.filter(e => e.source === 'patient_education' && e.event_type === 'task_end')
      const chatEventsAll = events.filter(e => e.source === 'chat' && e.event_type === 'task_end')

      // 已完成：用“今天最后一次完成”的时间来展示（比固定 09:00 更真实）
      let lastEduTs = null
      let lastChatTs = null
      for (const e of eduEventsAll) {
        if (e.ts >= todayStartMs && e.ts < todayEndMs) lastEduTs = Math.max(lastEduTs || 0, e.ts)
      }
      for (const e of chatEventsAll) {
        if (e.ts >= todayStartMs && e.ts < todayEndMs) lastChatTs = Math.max(lastChatTs || 0, e.ts)
      }

      const eduDone = !!lastEduTs
      const chatDone = !!lastChatTs

      // 未完成：用最近几次完成的时间中位数作为“偏好时间”
      const eduPrefMins = median(
        eduEventsAll.slice(-20).map(e => dayjs(e.ts).hour() * 60 + dayjs(e.ts).minute())
      )
      const chatPrefMins = median(
        chatEventsAll.slice(-20).map(e => dayjs(e.ts).hour() * 60 + dayjs(e.ts).minute())
      )

      const familyReportViewedWeekStart = Number(localStorage.getItem('family_report_viewed_week_start') || 0)
      const familyDone = familyReportViewedWeekStart === weekStartMs
      const familyViewedAt = Number(localStorage.getItem('family_report_viewed_at') || 0)

      // 家属周报：用最近打开的时间中位数当偏好时间；若本周已完成则用本次打开时间
      let reportTimes = []
      try {
        reportTimes = JSON.parse(localStorage.getItem('family_report_viewed_times') || '[]')
      } catch { reportTimes = [] }
      const reportPrefMins = median(
        (Array.isArray(reportTimes) ? reportTimes : []).slice(-20).map(ts => dayjs(ts).hour() * 60 + dayjs(ts).minute())
      )

      const defaultEduMinutes = parseHHmmToMinutes('09:00') || 9 * 60
      const defaultChatMinutes = parseHHmmToMinutes('10:00') || 10 * 60
      const defaultReportMinutes = parseHHmmToMinutes('20:00') || 20 * 60

      const eduMinutes = eduDone ? (dayjs(lastEduTs).hour() * 60 + dayjs(lastEduTs).minute()) : (eduPrefMins ?? defaultEduMinutes)
      const chatMinutes = chatDone ? (dayjs(lastChatTs).hour() * 60 + dayjs(lastChatTs).minute()) : (chatPrefMins ?? defaultChatMinutes)
      const reportMinutes = familyDone && familyViewedAt ? (dayjs(familyViewedAt).hour() * 60 + dayjs(familyViewedAt).minute()) : (reportPrefMins ?? defaultReportMinutes)

      const eduTime = formatMinutesToHHmm(roundMinutesToStep(eduMinutes))
      const chatTime = formatMinutesToHHmm(roundMinutesToStep(chatMinutes))
      const reportTime = formatMinutesToHHmm(roundMinutesToStep(reportMinutes))

      items.push({
        id: 'edu',
        time: eduTime,
        label: '阅读健康知识',
        desc: '花 3 分钟看一篇，系统自动调整难度',
        icon: 'el-icon-medal',
        done: eduDone,
        route: '/patient-education',
        category: 'edu'
      })

      items.push({
        id: 'chat',
        time: chatTime,
        label: '和家人聊聊天',
        desc: '分享今天的一件小事',
        icon: 'el-icon-phone-outline',
        done: chatDone,
        route: '/chat',
        category: 'social'
      })

      items.push({
        id: 'report',
        time: reportTime,
        label: '查看家属周报',
        desc: '了解本周照护概况',
        icon: 'el-icon-notebook-2',
        done: familyDone,
        route: '/family-report',
        category: 'report'
      })

      // 2.1) “稍后提醒”本地推迟（仅今天生效）
      const SNOOZE_KEY = `home_timeline_snooze_${today}`
      let snoozeMap = {}
      try {
        snoozeMap = JSON.parse(localStorage.getItem(SNOOZE_KEY) || '{}') || {}
      } catch { snoozeMap = {} }

      const parseMinutes = (hhmm) => parseHHmmToMinutes(hhmm)
      const nowMinutes = now.hour() * 60 + now.minute()

      for (const it of items) {
        const addMin = Number(snoozeMap && it.id ? snoozeMap[it.id] : 0) || 0
        it.snoozed = addMin > 0
        if (addMin > 0) {
          const mins = parseMinutes(it.time)
          if (mins != null) {
            it.time = formatMinutesToHHmm(roundMinutesToStep(mins + addMin))
          }
        }
      }

      // sort by time, mark current
      items.sort((a, b) => a.time.localeCompare(b.time))

      let currentFound = false
      for (const it of items) {
        const itMinutes = parseMinutes(it.time)
        it._minutes = itMinutes
        it.future = itMinutes != null ? itMinutes > nowMinutes : it.time > nowHHmm
        it.soon = false
        // 宽限期：超过 GRACE_MINUTES 才算错过；宽限期内标记为提醒中（soon）
        if (!it.done && itMinutes != null) {
          if (nowMinutes >= itMinutes && nowMinutes < itMinutes + GRACE_MINUTES) it.soon = true
          it.missed = nowMinutes >= itMinutes + GRACE_MINUTES
        } else {
          it.missed = false
        }
        it.current = false
      }
      for (let i = items.length - 1; i >= 0; i--) {
        const m = items[i]._minutes
        const due = m != null ? m <= nowMinutes : items[i].time <= nowHHmm
        if (!items[i].done && due) {
          items[i].current = true
          currentFound = true
          break
        }
      }
      if (!currentFound) {
        const next = items.find(it => !it.done && it.future)
        if (next) next.current = true
      }

      return items
    },

    // ---- 引擎可视化 ----
    engineStages() {
      const events = getCognitiveEvents()
      const questionnaires = getCognitiveQuestionnaires()
      const rec = getRecommendedDisplayMode('patient_education')

      const totalEvents = events.length
      let avgScore = '-'
      let cnt = 0; let sum = 0
      questionnaires.forEach(q => {
        (q.answers || []).forEach(a => { if (typeof a.value === 'number') { sum += a.value; cnt++ } })
      })
      if (cnt > 0) avgScore = (sum / cnt).toFixed(1)

      const modeMap = { long: '长文模式', card: '卡片模式', step: '分步模式' }

      return [
        { id: 'collect', icon: 'el-icon-collection', label: '行为采集', value: `${totalEvents} 条事件`, active: totalEvents > 0 },
        { id: 'analyze', icon: 'el-icon-data-analysis', label: '负荷分析', value: avgScore !== '-' ? `均分 ${avgScore}/5` : '待积累', active: cnt > 0 },
        { id: 'adapt', icon: 'el-icon-setting', label: '自适应调节', value: modeMap[rec.mode] || rec.mode, active: rec.confidence > 0 },
        { id: 'feedback', icon: 'el-icon-chat-line-round', label: '反馈闭环', value: `${questionnaires.length} 份问卷`, active: questionnaires.length > 0 }
      ]
    },
    engineDetails() {
      const events = getCognitiveEvents()
      const rec = getRecommendedDisplayMode('patient_education')

      const backEvents = events.filter(e => e.event_type === 'back')
      const backRate = events.length > 0 ? Math.round((backEvents.length / events.length) * 100) : 0

      const taskEnds = events.filter(e => e.event_type === 'task_end' && e.params && e.params.duration_ms)
      const avgDur = taskEnds.length > 0 ? Math.round(taskEnds.reduce((s, e) => s + e.params.duration_ms, 0) / taskEnds.length / 1000) : 0

      const reasonMap = {
        questionnaire_high: '问卷分数偏高',
        questionnaire_medium: '问卷分数适中',
        back_ratio: '回退操作频繁',
        user_preference: '用户偏好',
        default: '默认策略'
      }

      return [
        { label: '回退率', value: backRate + '%', cls: backRate > 30 ? 'warn' : 'good' },
        { label: '平均任务用时', value: avgDur > 0 ? avgDur + ' 秒' : '-', cls: '' },
        { label: '当前推荐策略', value: reasonMap[rec.reason] || rec.reason, cls: 'info' },
        { label: '信心度', value: rec.confidence > 0 ? Math.round(rec.confidence * 100) + '%' : '-', cls: rec.confidence >= 0.6 ? 'good' : '' }
      ]
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.fetchOverview()
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
    goMore(path) {
      if (path) this.$router.push(path)
    },
    snoozeItem(item) {
      if (!item || !item.id) return
      if (item.done) return
      const today = dayjs().format('YYYY-MM-DD')
      const SNOOZE_KEY = `home_timeline_snooze_${today}`
      try {
        const raw = JSON.parse(localStorage.getItem(SNOOZE_KEY) || '{}')
        const map = (raw && typeof raw === 'object') ? raw : {}
        const cur = Number(map[item.id] || 0) || 0
        const next = Math.min(cur + 30, 180) // 最多推迟 3 小时，避免无限推迟
        map[item.id] = next
        localStorage.setItem(SNOOZE_KEY, JSON.stringify(map))
        this.$message.success('已推迟 30 分钟')
        this.$forceUpdate()
      } catch (e) {
        this.$message.warning('推迟失败，请稍后重试')
      }
    },
    toggleTask(task) {
      if (task.done && !this.doneTaskIds.includes(task.id)) return
      const idx = this.doneTaskIds.indexOf(task.id)
      const wasUndone = idx < 0
      if (idx >= 0) {
        this.doneTaskIds.splice(idx, 1)
      } else {
        this.doneTaskIds.push(task.id)
      }
      saveDoneIds([...this.doneTaskIds])

      if (wasUndone) {
        this.$nextTick(() => {
          if (this.doneCount === this.smartTasks.length) {
            this.$root.$emit('emotional-feedback', { type: 'all_tasks_done', progress: true })
          } else {
            this.$root.$emit('emotional-feedback', { type: 'task_done' })
          }
        })
      }
    },
    _getMeds() {
      try { return JSON.parse(localStorage.getItem('medication_list') || '[]') } catch { return [] }
    },
    _getTodayMedRecords() {
      try {
        const records = JSON.parse(localStorage.getItem('medication_records') || '[]')
        const today = dayjs().format('YYYY-MM-DD')
        return records.filter(r => r.date === today)
      } catch { return [] }
    },
    async fetchOverview() {
      try {
        const res = await home.overview()
        const d = res.data
        if (d && d.status === 'success' && d.data) {
          const m = d.data
          this.metrics = {
            ...this.metrics,
            totalEntities: m.totalEntities != null ? m.totalEntities : this.metrics.totalEntities,
            totalRelations: m.totalRelations != null ? m.totalRelations : this.metrics.totalRelations,
            graphCount: m.graphCount != null ? m.graphCount : this.metrics.graphCount,
            docCount: m.docCount != null ? m.docCount : this.metrics.docCount,
            searchCount: m.searchCount != null ? m.searchCount : this.metrics.searchCount,
            accuracy: m.accuracy != null ? m.accuracy : this.metrics.accuracy,
            searchFail: m.searchFail != null ? m.searchFail : this.metrics.searchFail,
            searchRate: m.searchRate != null ? m.searchRate : this.metrics.searchRate,
            storage: this.metrics.storage
          }
        }
      } catch (e) {
        // 首页统计失败不阻塞页面，仅记录控制台
        // eslint-disable-next-line no-console
        console.warn('获取首页概览失败', e)
      }
    },
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
      const t = getEChartsTheme()
      const days = this.timeRange === '7d' ? 7 : this.timeRange === '14d' ? 14 : 14
      const xData = []
      for (let i = days - 1; i >= 0; i--) {
        xData.push(dayjs().subtract(i, 'day').format('MM-DD'))
      }
      const base = [1200, 1400, 1350, 1600, 1500, 1450, 1500]
      const base2 = [4800, 5200, 5000, 5600, 5400, 5300, 5500]
      const d1 = Array.from({ length: days }, (_, i) => base[i % base.length] + Math.floor(i / 7) * 100)
      const d2 = Array.from({ length: days }, (_, i) => base2[i % base2.length] + Math.floor(i / 7) * 200)
      const c1 = t.primaryBlue
      const c2 = t.accentCyan
      const axisLineColor = t.rgbaPrimary(0.3)
      const axisLabelColor = t.textMuted
      const splitLineColor = t.rgbaPrimary(0.08)

      ch.setOption({
        tooltip: { trigger: 'axis', backgroundColor: t.bgPopup, borderColor: t.borderPrimary, textStyle: { color: t.textPrimary } },
        grid: { left: '3%', right: '4%', bottom: '3%', top: '12%', containLabel: true },
        xAxis: { type: 'category', data: xData, axisLine: { lineStyle: { color: axisLineColor } }, axisLabel: { color: axisLabelColor } },
        yAxis: { type: 'value', axisLine: { show: false }, axisLabel: { color: axisLabelColor }, splitLine: { lineStyle: { color: splitLineColor } } },
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
      const t = getEChartsTheme()
      const xData = []
      for (let i = 6; i >= 0; i--) xData.push(dayjs().subtract(i, 'day').format('MM-DD'))
      const c = t.primaryBlue
      const axisLineColor = t.rgbaPrimary(0.3)
      const axisLabelColor = t.textMuted
      const splitLineColor = t.rgbaPrimary(0.08)

      ch.setOption({
        tooltip: { trigger: 'axis', backgroundColor: t.bgPopup, borderColor: t.borderPrimary, textStyle: { color: t.textPrimary } },
        grid: { left: '3%', right: '4%', bottom: '3%', top: '12%', containLabel: true },
        xAxis: { type: 'category', boundaryGap: false, data: xData, axisLine: { lineStyle: { color: axisLineColor } }, axisLabel: { color: axisLabelColor } },
        yAxis: { type: 'value', axisLine: { show: false }, axisLabel: { color: axisLabelColor }, splitLine: { lineStyle: { color: splitLineColor } } },
        series: [{ name: '活跃度', type: 'line', smooth: true, data: [2, 5, 8, 4, 6, 3, 5], lineStyle: { width: 2, color: c }, areaStyle: { color: t.rgbaPrimary(0.2) } }]
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
  background: rgba(var(--primary-blue-rgb), 0.06);
  border: 1px solid rgba(var(--primary-blue-rgb), 0.2);
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
  color: var(--text-secondary);
}

.welcome-greeting {
  font-size: 15px;
  font-weight: 600;
  background: linear-gradient(135deg, var(--primary-blue), var(--accent-cyan));
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
  color: var(--primary-blue);
  border: 1px solid rgba(var(--primary-blue-rgb), 0.4);
  background: rgba(var(--primary-blue-rgb), 0.08);
  transition: all 0.3s ease;
}

.quick-btn:hover {
  background: rgba(var(--primary-blue-rgb), 0.15);
  border-color: rgba(var(--primary-blue-rgb), 0.6);
  box-shadow: 0 4px 16px rgba(var(--primary-blue-rgb), 0.25);
}

.quick-dropdown { display: inline-flex; }
.quick-btn-more { cursor: pointer; }

/* Section Header */
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 8px;
}
.section-title {
  font-size: var(--font-size-lg, 17px);
  font-weight: 700;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
}
.section-title i {
  color: var(--primary-blue);
  font-size: 20px;
}
.section-hint {
  font-size: 12px;
  color: var(--text-muted);
}

/* 今日三件小事 */
.daily-tasks-section {
  margin-bottom: 24px;
  padding: 20px;
  background: radial-gradient(circle at top left, rgba(var(--primary-blue-rgb), 0.06), rgba(5,11,24,0.98));
  border: 1px solid rgba(var(--primary-blue-rgb), 0.2);
  border-radius: 16px;
}
.daily-tasks-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 14px;
}
.daily-task-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  border-radius: 12px;
  background: rgba(255,255,255,0.03);
  border: 1px solid var(--border-light);
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}
.daily-task-card:hover {
  border-color: rgba(var(--primary-blue-rgb), 0.35);
  background: rgba(var(--primary-blue-rgb), 0.04);
  transform: translateX(4px);
}
.daily-task-card.done {
  opacity: 0.55;
  border-color: rgba(var(--primary-blue-rgb), 0.15);
}
.daily-task-card.done .task-title {
  text-decoration: line-through;
  color: var(--text-muted);
}
.task-check {
  font-size: 24px;
  color: rgba(255,255,255,0.25);
  flex-shrink: 0;
  transition: color 0.2s;
}
.daily-task-card.done .task-check,
.daily-task-card:hover .task-check {
  color: var(--primary-blue);
}
.task-body {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
}
.task-num {
  width: 26px; height: 26px; border-radius: 50%;
  background: linear-gradient(135deg, var(--primary-blue), var(--accent-cyan));
  color: #020817; font-size: 13px; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.task-content { flex: 1; min-width: 0; }
.task-title {
  font-size: var(--font-size-base, 15px);
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 2px;
}
.task-desc {
  font-size: 13px;
  color: var(--text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.task-tag {
  font-size: 11px;
  padding: 3px 10px;
  border-radius: 10px;
  color: #fff;
  font-weight: 600;
  flex-shrink: 0;
}
.tasks-progress-bar {
  height: 6px;
  border-radius: 3px;
  background: var(--border-light);
  overflow: hidden;
  margin-bottom: 6px;
}
.tasks-progress-fill {
  height: 100%;
  border-radius: 3px;
  background: linear-gradient(90deg, var(--primary-blue), var(--accent-cyan));
  transition: width 0.5s ease;
}
.tasks-progress-label {
  font-size: 12px;
  color: var(--text-muted);
}
.all-done-text {
  color: var(--primary-blue);
  margin-left: 8px;
  font-weight: 600;
}

/* 认知减负引擎 */
.engine-section {
  margin-bottom: 24px;
  padding: 20px;
  background: radial-gradient(circle at top right, rgba(var(--accent-cyan-rgb), 0.06), rgba(5,11,24,0.98));
  border: 1px solid rgba(var(--accent-cyan-rgb), 0.2);
  border-radius: 16px;
}
.engine-pipeline {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  gap: 0;
  margin-bottom: 20px;
  flex-wrap: wrap;
}
.engine-stage {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  min-width: 90px;
}
.stage-icon-wrap {
  width: 52px; height: 52px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 22px;
  background: rgba(255,255,255,0.05);
  border: 2px solid var(--border-light);
  color: var(--text-disabled);
  transition: all 0.4s ease;
  margin-bottom: 8px;
}
.stage-icon-wrap.active {
  background: rgba(var(--primary-blue-rgb), 0.12);
  border-color: rgba(var(--primary-blue-rgb), 0.5);
  color: var(--primary-blue);
  box-shadow: 0 0 20px rgba(var(--primary-blue-rgb), 0.2);
  animation: enginePulse 2s ease-in-out infinite;
}
@keyframes enginePulse {
  0%, 100% { box-shadow: 0 0 12px rgba(var(--primary-blue-rgb), 0.15); }
  50% { box-shadow: 0 0 24px rgba(var(--primary-blue-rgb), 0.35); }
}
.stage-label {
  font-size: 13px;
  font-weight: 600;
  color: rgba(255,255,255,0.85);
  margin-bottom: 2px;
}
.stage-value {
  font-size: 11px;
  color: var(--text-muted);
  text-align: center;
}
.stage-arrow {
  position: absolute;
  right: -28px;
  top: 16px;
  display: flex;
  align-items: center;
  gap: 0;
  color: rgba(var(--primary-blue-rgb), 0.35);
  width: 48px;
}
.arrow-line {
  flex: 1;
  height: 2px;
  background: linear-gradient(90deg, rgba(var(--primary-blue-rgb), 0.3), rgba(var(--primary-blue-rgb), 0.1));
}
.stage-arrow i {
  font-size: 14px;
}
.engine-detail-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}
.engine-detail-card {
  text-align: center;
  padding: 10px 6px;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 10px;
}
.ed-label {
  font-size: 11px;
  color: var(--text-muted);
  margin-bottom: 4px;
}
.ed-value {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}
.ed-value.good { color: var(--primary-blue); }
.ed-value.warn { color: #f56c6c; }
.ed-value.info { color: var(--accent-cyan); }

/* 第一行：6 指标卡 */
.metrics-row {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.metric-card {
  background: radial-gradient(circle at top left, rgba(var(--primary-blue-rgb), 0.1), rgba(5, 11, 24, 0.96));
  border: 1px solid rgba(148, 163, 184, 0.28);
  border-radius: 14px;
  padding: 20px;
  text-align: center;
  transition: all 0.3s ease;
}

.metric-card:hover {
  border-color: rgba(var(--primary-blue-rgb), 0.4);
  box-shadow: 0 8px 24px rgba(var(--primary-blue-rgb), 0.15);
}

.metric-icon {
  font-size: 24px;
  color: var(--primary-blue);
  margin-bottom: 10px;
  display: block;
}

.metric-value {
  font-size: 26px;
  font-weight: 700;
  background: linear-gradient(135deg, var(--primary-blue), var(--accent-cyan));
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
  background: radial-gradient(circle at top, rgba(var(--primary-blue-rgb), 0.08), rgba(5, 11, 24, 0.98));
  border: 1px solid rgba(148, 163, 184, 0.28);
  border-radius: 14px;
  padding: 20px;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.panel:hover {
  border-color: rgba(var(--primary-blue-rgb), 0.3);
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.2);
}

.panel-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 12px 0;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--border-light);
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
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s;
}

.chart-tabs span:hover,
.chart-tabs span.active {
  background: rgba(var(--primary-blue-rgb), 0.2);
  color: var(--primary-blue);
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
  background: rgba(var(--primary-blue-rgb), 0.06);
  border: 1px solid rgba(var(--primary-blue-rgb), 0.15);
  border-radius: 10px;
}

.mini-value {
  font-size: 20px;
  font-weight: 700;
  color: var(--primary-blue);
}

.mini-label {
  font-size: 11px;
  color: var(--text-muted);
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
  color: var(--text-secondary);
  margin-bottom: 12px;
}

.panel-analysis .panel-metrics strong {
  color: var(--primary-blue);
}

.panel-analysis .panel-metrics .text-danger { color: #f56c6c; }
.panel-analysis .panel-metrics .text-success { color: #67c23a; }

.top-block {
  padding-top: 12px;
  border-top: 1px solid var(--border-light);
}

.top-block-title {
  font-size: 12px;
  color: var(--text-muted);
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
  .engine-detail-row { grid-template-columns: repeat(2, 1fr); }
  .engine-pipeline { gap: 4px; }
  .stage-arrow { display: none; }
  .engine-stage { min-width: 70px; }
}

@media (max-width: 480px) {
  .metrics-row { grid-template-columns: 1fr; }
  .activity-cards { grid-template-columns: 1fr; }
}

/* ===== 今日日程时间轴 ===== */
.timeline-section {
  margin-bottom: 28px;
}

.timeline-list {
  position: relative;
  padding-left: 0;
}

.tl-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 10px 14px;
  border-radius: 12px;
  margin-bottom: 2px;
  transition: background 0.25s, opacity 0.25s;
}

.tl-item.done {
  opacity: 0.55;
}

.tl-item.current {
  background: rgba(var(--primary-blue-rgb), 0.08);
}

.tl-item.missed {
  background: rgba(var(--error-rgb), 0.06);
}

.tl-time {
  flex: 0 0 52px;
  font-size: var(--font-size-base, 15px);
  font-weight: 700;
  color: var(--text-primary);
  text-align: right;
  line-height: 1.4;
  padding-top: 2px;
}

.tl-item.done .tl-time {
  text-decoration: line-through;
  color: var(--text-disabled);
}

.tl-item.current .tl-time {
  color: var(--primary-blue);
}

.tl-item.missed .tl-time {
  color: var(--error);
}

.tl-dot-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 0 0 20px;
  padding-top: 4px;
}

.tl-dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 2px solid var(--border-light);
  background: var(--bg-card, #1e293b);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 9px;
  color: #fff;
  transition: all 0.3s;
  position: relative;
  z-index: 1;
}

.tl-dot-done {
  border-color: var(--success);
  background: var(--success);
}

.tl-dot-missed {
  border-color: var(--error);
  background: var(--error);
  box-shadow: 0 0 10px rgba(var(--error-rgb), 0.45);
}

.tl-dot-now {
  border-color: var(--primary-blue);
  background: var(--primary-blue);
  box-shadow: 0 0 8px rgba(var(--primary-blue-rgb), 0.5);
  animation: tlPulse 2s ease-in-out infinite;
}

@keyframes tlPulse {
  0%, 100% { box-shadow: 0 0 4px rgba(var(--primary-blue-rgb), 0.3); }
  50% { box-shadow: 0 0 14px rgba(var(--primary-blue-rgb), 0.7); }
}

.tl-line {
  width: 2px;
  flex: 1;
  min-height: 22px;
  background: var(--border-light);
  margin: 2px 0;
}

.tl-content {
  flex: 1;
  min-width: 0;
}

.tl-label {
  font-size: var(--font-size-base, 15px);
  font-weight: 600;
  color: var(--text-primary);
  line-height: 1.4;
}
.tl-item.missed .tl-label {
  color: var(--error);
}

.tl-status {
  display: inline-block;
  margin-left: 10px;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  border: 1px solid currentColor;
  line-height: 1.2;
}

.tl-status-done {
  color: var(--success);
}

.tl-status-missed {
  color: var(--error);
}

.tl-status-soon {
  color: var(--warning);
}

.tl-status-snoozed {
  color: var(--accent-cyan);
}

.tl-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
  align-self: center;
}

.tl-snooze {
  font-size: calc(var(--font-size-base, 13px) - 1px);
  padding: 4px 10px;
  border-radius: 8px;
  border: 1px dashed rgba(var(--primary-blue-rgb), 0.35);
  background: rgba(var(--primary-blue-rgb), 0.08);
  color: var(--text-primary);
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s;
  white-space: nowrap;
  min-height: 34px;
}

.tl-snooze:hover {
  background: rgba(var(--primary-blue-rgb), 0.15);
  border-color: rgba(var(--primary-blue-rgb), 0.55);
}

.tl-item.soon {
  background: rgba(var(--warning-rgb), 0.06);
}

.tl-dot-soon {
  border-color: var(--warning);
  background: var(--warning);
  box-shadow: 0 0 10px rgba(245, 158, 11, 0.35);
}


.tl-item.done .tl-label {
  text-decoration: line-through;
  color: var(--text-disabled);
}

.tl-desc {
  font-size: calc(var(--font-size-base, 14px) - 1px);
  color: var(--text-muted);
  margin-top: 2px;
}

.tl-go {
  flex-shrink: 0;
  font-size: calc(var(--font-size-base, 13px) - 1px);
  color: var(--primary-blue);
  text-decoration: none;
  padding: 4px 10px;
  border-radius: 8px;
  border: 1px solid rgba(var(--primary-blue-rgb), 0.3);
  transition: background 0.2s;
  white-space: nowrap;
  align-self: center;
}

.tl-go:hover {
  background: rgba(var(--primary-blue-rgb), 0.15);
}

.tl-item.future .tl-time {
  color: var(--text-disabled);
}

.tl-item.future .tl-label {
  color: var(--text-muted);
}

@media (max-width: 480px) {
  .tl-time { flex: 0 0 42px; font-size: 13px; }
  .tl-go { font-size: 12px; padding: 3px 8px; }
}
</style>
