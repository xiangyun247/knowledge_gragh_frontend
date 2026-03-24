<template>
  <div class="med-reminder-page">
    <!-- 左侧：药物管理面板 -->
    <div class="med-left">
      <div class="panel-card">
        <h3 class="panel-title">
          <i class="el-icon-first-aid-kit"></i> 我的用药方案
        </h3>
        <div class="med-add-form">
          <el-input v-model="newMed.name" placeholder="药物名称" size="small" class="med-input" />
          <el-input v-model="newMed.dosage" placeholder="用量（如 1片）" size="small" class="med-input" />
          <div class="med-time-row">
            <el-select v-model="newMed.frequency" placeholder="频次" size="small" class="med-select">
              <el-option label="每日1次" value="qd" />
              <el-option label="每日2次" value="bid" />
              <el-option label="每日3次" value="tid" />
              <el-option label="需要时服用" value="prn" />
            </el-select>
            <el-time-select
              v-model="newMed.time"
              :picker-options="{ start: '06:00', step: '00:30', end: '22:00' }"
              placeholder="服药时间"
              size="small"
              class="med-time-picker"
            />
          </div>
          <el-input v-model="newMed.notes" placeholder="备注（可选）" size="small" class="med-input" />
          <el-button type="primary" size="small" class="med-add-btn" @click="addMedication" :disabled="!canAdd">
            <i class="el-icon-plus"></i> 添加药物
          </el-button>
        </div>

        <el-divider />

        <div class="med-list-title">已添加药物（{{ medications.length }}）</div>
        <div class="med-list" v-if="medications.length">
          <div v-for="(med, idx) in medications" :key="med.id" class="med-list-item">
            <div class="med-item-info">
              <span class="med-item-name">{{ med.name }}</span>
              <span class="med-item-detail">{{ med.dosage }} · {{ freqLabel(med.frequency) }} · {{ med.time }}</span>
              <span class="med-item-notes" v-if="med.notes">{{ med.notes }}</span>
            </div>
            <el-button type="text" size="mini" class="med-del-btn" @click="removeMedication(idx)">
              <i class="el-icon-delete"></i>
            </el-button>
          </div>
        </div>
        <div v-else class="med-list-empty">暂未添加任何药物</div>

        <div class="med-preset-section">
          <div class="med-preset-label">快速添加认知障碍常用药：</div>
          <div class="med-preset-btns">
            <el-button
              v-for="p in presetMeds"
              :key="p.name"
              size="mini"
              type="primary"
              plain
              @click="applyPreset(p)"
            >{{ p.name }}</el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 中间：今日服药任务 -->
    <div class="med-main">
      <div class="panel-card">
        <div class="med-main-header">
          <h3 class="panel-title">
            <i class="el-icon-bell"></i> 今日服药任务
          </h3>
          <div class="med-display-mode">
            <span class="mode-label">呈现模式：</span>
            <el-radio-group v-model="displayMode" size="small" @change="onDisplayModeChange">
              <el-radio-button label="list">
                列表<span v-if="recommendedMode === 'list'" class="mode-rec-badge">推荐</span>
              </el-radio-button>
              <el-radio-button label="step">
                分步<span v-if="recommendedMode === 'step'" class="mode-rec-badge">推荐</span>
              </el-radio-button>
              <el-radio-button label="card">
                卡片<span v-if="recommendedMode === 'card'" class="mode-rec-badge">推荐</span>
              </el-radio-button>
            </el-radio-group>
            <span v-if="adaptHintText" class="adapt-hint">
              <i class="el-icon-magic-stick"></i> {{ adaptHintText }}
            </span>
          </div>
        </div>

        <div class="med-date-bar">
          <span class="med-date-text">{{ todayLabel }}</span>
          <span class="med-progress-text">已完成 {{ completedCount }} / {{ todayTasks.length }}</span>
          <el-progress
            :percentage="progressPercent"
            :stroke-width="8"
            :color="progressColor"
            class="med-progress-bar"
          />
        </div>

        <div v-if="todayTasks.length === 0" class="med-empty-tasks">
          <el-empty description="暂无今日服药任务，请在左侧添加药物" />
        </div>

        <!-- 列表模式 -->
        <template v-if="displayMode === 'list' && todayTasks.length">
          <div class="med-task-list">
            <div
              v-for="task in todayTasks"
              :key="task.id"
              :class="['med-task-item', { 'med-task-done': task.done }]"
            >
              <div class="med-task-time-col">
                <div class="med-task-time">{{ task.time }}</div>
                <div :class="['med-task-dot', { done: task.done }]"></div>
              </div>
              <div class="med-task-body">
                <div class="med-task-name">{{ task.name }}</div>
                <div class="med-task-dosage">{{ task.dosage }}</div>
                <div class="med-task-notes" v-if="task.notes">{{ task.notes }}</div>
              </div>
              <div class="med-task-action">
                <el-button
                  v-if="!task.done"
                  type="success"
                  size="small"
                  @click="confirmTaken(task)"
                >
                  <i class="el-icon-check"></i> 已服用
                </el-button>
                <span v-else class="med-task-done-label">
                  <i class="el-icon-circle-check"></i> {{ task.doneTime }}
                </span>
              </div>
            </div>
          </div>
        </template>

        <!-- 分步模式 -->
        <template v-else-if="displayMode === 'step' && todayTasks.length">
          <div class="med-step-view">
            <div class="med-step-counter">
              第 {{ stepIndex + 1 }} 项 / 共 {{ todayTasks.length }} 项
            </div>
            <div :class="['med-step-card', { 'med-step-done': currentStepTask.done }]">
              <div class="med-step-time">{{ currentStepTask.time }}</div>
              <div class="med-step-name">{{ currentStepTask.name }}</div>
              <div class="med-step-dosage">{{ currentStepTask.dosage }}</div>
              <div class="med-step-notes" v-if="currentStepTask.notes">{{ currentStepTask.notes }}</div>
              <el-button
                v-if="!currentStepTask.done"
                type="success"
                class="med-step-btn"
                @click="confirmTaken(currentStepTask)"
              >
                <i class="el-icon-check"></i> 确认已服用
              </el-button>
              <div v-else class="med-step-done-label">
                <i class="el-icon-circle-check"></i> 已于 {{ currentStepTask.doneTime }} 服用
              </div>
            </div>
            <div class="med-step-nav">
              <el-button :disabled="stepIndex <= 0" @click="onStepBack">上一项</el-button>
              <el-button type="primary" :disabled="stepIndex >= todayTasks.length - 1" @click="onStepNext">下一项</el-button>
            </div>
          </div>
        </template>

        <!-- 卡片模式 -->
        <template v-else-if="displayMode === 'card' && todayTasks.length">
          <div class="med-cards-view">
            <div
              v-for="task in todayTasks"
              :key="task.id"
              :class="['med-card-block', { 'med-card-done': task.done }]"
            >
              <div class="med-card-header">
                <span class="med-card-time">{{ task.time }}</span>
                <span v-if="task.done" class="med-card-status done">已服用</span>
                <span v-else class="med-card-status pending">待服用</span>
              </div>
              <div class="med-card-name">{{ task.name }}</div>
              <div class="med-card-dosage">{{ task.dosage }}</div>
              <el-button
                v-if="!task.done"
                type="success"
                class="med-card-btn"
                @click="confirmTaken(task)"
              >
                <i class="el-icon-check"></i> 已服用
              </el-button>
            </div>
          </div>
        </template>
      </div>
    </div>

    <!-- 右侧：服药统计 -->
    <div class="med-right">
      <div class="panel-card">
        <h3 class="panel-title"><i class="el-icon-data-line"></i> 服药统计</h3>
        <div class="med-stats">
          <div class="med-stat-item">
            <div class="med-stat-value">{{ stats.totalDays }}</div>
            <div class="med-stat-label">累计天数</div>
          </div>
          <div class="med-stat-item">
            <div class="med-stat-value">{{ stats.totalTaken }}</div>
            <div class="med-stat-label">已服药次</div>
          </div>
          <div class="med-stat-item">
            <div class="med-stat-value">{{ stats.adherenceRate }}%</div>
            <div class="med-stat-label">依从率</div>
          </div>
        </div>

        <el-divider />
        <h4 class="panel-sub-title">最近 7 日记录</h4>
        <div class="med-history">
          <div v-for="day in recentDays" :key="day.date" class="med-history-row">
            <span class="med-history-date">{{ day.label }}</span>
            <span :class="['med-history-status', day.status]">{{ day.statusLabel }}</span>
          </div>
        </div>

        <el-divider />
        <div class="med-tips">
          <div class="med-tips-title"><i class="el-icon-info"></i> 服药提示</div>
          <ul>
            <li>请按时服药，不要自行增减剂量</li>
            <li>如忘记服药，请勿下次加倍</li>
            <li>如有不适，请及时咨询医生</li>
          </ul>
        </div>
      </div>
    </div>

    <!-- 认知负荷问卷 -->
    <CognitiveLoadQuestionnaire
      :visible.sync="showQuestionnaire"
      :task-id="currentTaskId"
      session-id=""
      source="medication_reminder"
    />
  </div>
</template>

<script>
import dayjs from 'dayjs'
import CognitiveLoadQuestionnaire from '@/components/assessment/CognitiveLoadQuestionnaire.vue'
import {
  recordEvent,
  COGNITIVE_EVENT_TYPES,
  COGNITIVE_SOURCE,
  getRecommendedDisplayMode,
  getReasonLabel
} from '@/utils/cognitiveLoad'

const STORAGE_KEY_MEDS = 'medication_list'
const STORAGE_KEY_RECORDS = 'medication_records'

const MODE_MAP = { long: 'list', step: 'step', card: 'card' }

export default {
  name: 'MedicationReminderView',
  components: { CognitiveLoadQuestionnaire },
  data() {
    return {
      medications: [],
      records: [],
      newMed: { name: '', dosage: '', frequency: 'bid', time: '08:00', notes: '' },
      presetMeds: [
        { name: '多奈哌齐', dosage: '5mg 1片', frequency: 'qd', time: '08:00', notes: '阿尔茨海默病一线药' },
        { name: '美金刚', dosage: '10mg 1片', frequency: 'bid', time: '08:00', notes: '中重度AD辅助用药' },
        { name: '卡巴拉汀', dosage: '1.5mg 1粒', frequency: 'bid', time: '08:00', notes: '胆碱酯酶抑制剂' },
        { name: '奥氮平', dosage: '2.5mg 1片', frequency: 'qd', time: '20:00', notes: '遵医嘱，精神行为症状' }
      ],
      displayMode: 'list',
      recommendedMode: null,
      recommendedReason: '',
      stepIndex: 0,
      showQuestionnaire: false,
      currentTaskId: null,
      taskStartTime: null,
      taskEndTimer: null
    }
  },
  computed: {
    canAdd() {
      return this.newMed.name.trim() && this.newMed.dosage.trim() && this.newMed.time
    },
    todayTasks() {
      const today = dayjs().format('YYYY-MM-DD')
      const tasks = []
      for (const med of this.medications) {
        const times = this.getTimesForFrequency(med.frequency, med.time)
        for (const t of times) {
          const id = `${med.id}_${t}`
          const rec = this.records.find(r => r.medId === med.id && r.time === t && r.date === today)
          tasks.push({
            id,
            medId: med.id,
            name: med.name,
            dosage: med.dosage,
            notes: med.notes,
            time: t,
            done: !!rec,
            doneTime: rec ? rec.doneTime : ''
          })
        }
      }
      tasks.sort((a, b) => a.time.localeCompare(b.time))
      return tasks
    },
    completedCount() {
      return this.todayTasks.filter(t => t.done).length
    },
    progressPercent() {
      if (!this.todayTasks.length) return 0
      return Math.round((this.completedCount / this.todayTasks.length) * 100)
    },
    progressColor() {
      if (this.progressPercent === 100) return '#00f5d4'
      if (this.progressPercent >= 50) return '#00bbf9'
      return '#f56c6c'
    },
    todayLabel() {
      return dayjs().format('M月D日 dddd')
    },
    currentStepTask() {
      return this.todayTasks[this.stepIndex] || {}
    },
    stats() {
      const allDates = [...new Set(this.records.map(r => r.date))]
      const totalTaken = this.records.length
      const totalExpected = allDates.length * Math.max(this.todayTasks.length, 1)
      const rate = totalExpected > 0 ? Math.round((totalTaken / totalExpected) * 100) : 0
      return {
        totalDays: allDates.length,
        totalTaken,
        adherenceRate: Math.min(rate, 100)
      }
    },
    recentDays() {
      const days = []
      for (let i = 0; i < 7; i++) {
        const d = dayjs().subtract(i, 'day')
        const date = d.format('YYYY-MM-DD')
        const label = i === 0 ? '今天' : i === 1 ? '昨天' : d.format('M/D')
        const dayRecords = this.records.filter(r => r.date === date)
        let status = 'none'
        let statusLabel = '无记录'
        if (dayRecords.length > 0) {
          status = 'done'
          statusLabel = `已服 ${dayRecords.length} 次`
        }
        days.push({ date, label, status, statusLabel })
      }
      return days
    },
    adaptHintText() {
      const label = getReasonLabel(this.recommendedReason)
      if (!label) return ''
      const modeName = { list: '列表', step: '分步', card: '卡片' }[this.recommendedMode] || ''
      return `${label}，推荐「${modeName}」模式`
    }
  },
  created() {
    this.loadMedications()
    this.loadRecords()
    this.applyAdaptiveMode()
    this.startTask()
  },
  beforeDestroy() {
    if (this.taskEndTimer) clearTimeout(this.taskEndTimer)
  },
  methods: {
    // ---- 数据持久化 ----
    loadMedications() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY_MEDS)
        this.medications = raw ? JSON.parse(raw) : []
      } catch { this.medications = [] }
    },
    saveMedications() {
      localStorage.setItem(STORAGE_KEY_MEDS, JSON.stringify(this.medications))
    },
    loadRecords() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY_RECORDS)
        this.records = raw ? JSON.parse(raw) : []
      } catch { this.records = [] }
    },
    saveRecords() {
      localStorage.setItem(STORAGE_KEY_RECORDS, JSON.stringify(this.records))
    },

    // ---- 药物管理 ----
    addMedication() {
      if (!this.canAdd) return
      this.medications.push({
        id: 'med_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
        name: this.newMed.name.trim(),
        dosage: this.newMed.dosage.trim(),
        frequency: this.newMed.frequency,
        time: this.newMed.time,
        notes: this.newMed.notes.trim()
      })
      this.saveMedications()
      this.newMed = { name: '', dosage: '', frequency: 'bid', time: '08:00', notes: '' }
      this.$message.success('药物已添加')
    },
    removeMedication(idx) {
      const med = this.medications[idx]
      this.$confirm(
        `确定删除药物「${med ? med.name : ''}」吗？删除后需重新添加。`,
        '删除确认',
        { confirmButtonText: '确定删除', cancelButtonText: '取消', type: 'warning' }
      ).then(() => {
        this.medications.splice(idx, 1)
        this.saveMedications()
        this.$message.success('已删除')
      }).catch(() => {})
    },
    applyPreset(p) {
      this.newMed = { ...p }
    },
    freqLabel(freq) {
      return { qd: '每日1次', bid: '每日2次', tid: '每日3次', prn: '需要时' }[freq] || freq
    },
    getTimesForFrequency(freq, baseTime) {
      if (freq === 'qd' || freq === 'prn') return [baseTime]
      if (freq === 'bid') {
        const h = parseInt(baseTime.split(':')[0], 10)
        const evening = ((h + 12) % 24).toString().padStart(2, '0') + ':00'
        return [baseTime, evening]
      }
      if (freq === 'tid') {
        const h = parseInt(baseTime.split(':')[0], 10)
        const noon = ((h + 6) % 24).toString().padStart(2, '0') + ':00'
        const evening = ((h + 12) % 24).toString().padStart(2, '0') + ':00'
        return [baseTime, noon, evening]
      }
      return [baseTime]
    },

    // ---- 服药确认 ----
    confirmTaken(task) {
      const today = dayjs().format('YYYY-MM-DD')
      const doneTime = dayjs().format('HH:mm')
      this.records.push({
        medId: task.medId,
        date: today,
        time: task.time,
        doneTime
      })
      this.saveRecords()
      this.$message.success(`${task.name}（${task.time}）已确认服用`)

      recordEvent(COGNITIVE_EVENT_TYPES.CLICK, {
        task_id: this.currentTaskId,
        source: COGNITIVE_SOURCE.MEDICATION_REMINDER,
        target: 'confirm_taken',
        med_name: task.name,
        med_time: task.time
      })

      if (this.completedCount === this.todayTasks.length && this.todayTasks.length > 0) {
        this.$root.$emit('emotional-feedback', { type: 'med_all_done', progress: true })
        this.finishTask()
      } else {
        this.$root.$emit('emotional-feedback', { type: 'med_taken' })
      }
    },

    // ---- 认知负荷埋点 ----
    startTask() {
      this.currentTaskId = 'mr_' + Date.now()
      this.taskStartTime = Date.now()
      recordEvent(COGNITIVE_EVENT_TYPES.TASK_START, {
        task_id: this.currentTaskId,
        source: COGNITIVE_SOURCE.MEDICATION_REMINDER,
        med_count: this.medications.length
      })
    },
    finishTask() {
      if (this.taskEndTimer) clearTimeout(this.taskEndTimer)
      this.taskEndTimer = setTimeout(() => {
        this.taskEndTimer = null
        if (!this.currentTaskId || !this.taskStartTime) return
        recordEvent(COGNITIVE_EVENT_TYPES.TASK_END, {
          task_id: this.currentTaskId,
          source: COGNITIVE_SOURCE.MEDICATION_REMINDER,
          duration_ms: Date.now() - this.taskStartTime,
          view_mode: this.displayMode,
          completed_count: this.completedCount,
          total_count: this.todayTasks.length
        })
        this.showQuestionnaire = true
      }, 2000)
    },

    // ---- 自适应调度 ----
    applyAdaptiveMode() {
      const rec = getRecommendedDisplayMode(COGNITIVE_SOURCE.MEDICATION_REMINDER)
      const mapped = MODE_MAP[rec.mode] || rec.mode
      this.recommendedMode = mapped
      this.recommendedReason = rec.reason
      if (rec.confidence !== 'low') {
        this.displayMode = mapped
        const label = getReasonLabel(rec.reason)
        if (label) {
          const modeName = { list: '列表', step: '分步', card: '卡片' }[mapped] || mapped
          this.$nextTick(() => {
            this.$message.info(`${label}，已为您切换到「${modeName}」模式`)
          })
        }
      }
    },
    onDisplayModeChange() {
      this.stepIndex = 0
      recordEvent(COGNITIVE_EVENT_TYPES.CLICK, {
        task_id: this.currentTaskId,
        source: COGNITIVE_SOURCE.MEDICATION_REMINDER,
        target: 'switch_mode'
      })
    },
    onStepBack() {
      const from = this.stepIndex
      this.stepIndex = Math.max(0, this.stepIndex - 1)
      recordEvent(COGNITIVE_EVENT_TYPES.BACK, {
        task_id: this.currentTaskId,
        source: COGNITIVE_SOURCE.MEDICATION_REMINDER,
        from_step: from,
        to_step: this.stepIndex
      })
    },
    onStepNext() {
      this.stepIndex = Math.min(this.todayTasks.length - 1, this.stepIndex + 1)
      recordEvent(COGNITIVE_EVENT_TYPES.STEP_VIEW, {
        task_id: this.currentTaskId,
        source: COGNITIVE_SOURCE.MEDICATION_REMINDER,
        step_index: this.stepIndex,
        total_steps: this.todayTasks.length
      })
    }
  }
}
</script>

<style scoped>
.med-reminder-page {
  display: flex;
  height: calc(100vh - 140px);
  gap: 20px;
}

/* ---- 三栏布局 ---- */
.med-left { width: 320px; flex-shrink: 0; }
.med-main { flex: 1; min-width: 0; }
.med-right { width: 280px; flex-shrink: 0; }

.panel-card {
  background: var(--bg-card);
  border-radius: var(--radius-xl, 16px);
  padding: 20px;
  border: 1px solid rgba(var(--primary-blue-rgb), 0.25);
  box-shadow: 0 8px 24px rgba(var(--primary-blue-rgb), 0.15);
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.panel-title {
  font-size: var(--font-size-base, 16px);
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 14px;
}
.panel-title i { color: var(--primary-blue); margin-right: 6px; }
.panel-sub-title {
  font-size: var(--font-size-base, 14px);
  color: rgba(255,255,255,0.85);
  margin-bottom: 10px;
}

/* ---- 添加药物表单 ---- */
.med-add-form {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.med-time-row { display: flex; gap: 8px; }
.med-select, .med-time-picker { flex: 1; }
.med-add-btn { width: 100%; }

/* ---- 药物列表 ---- */
.med-list-title {
  font-size: 13px;
  color: var(--text-secondary);
  margin-bottom: 8px;
}
.med-list { display: flex; flex-direction: column; gap: 6px; }
.med-list-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 10px;
  border-radius: 8px;
  background: rgba(var(--primary-blue-rgb), 0.06);
  border: 1px solid rgba(var(--primary-blue-rgb), 0.15);
}
.med-item-info { display: flex; flex-direction: column; gap: 2px; flex: 1; min-width: 0; }
.med-item-name { font-size: var(--font-size-base, 14px); color: var(--text-primary); font-weight: 600; }
.med-item-detail { font-size: 12px; color: var(--text-muted); }
.med-item-notes { font-size: 12px; color: var(--primary-blue); }
.med-del-btn { color: #f56c6c !important; }
.med-list-empty { font-size: 13px; color: var(--text-muted); text-align: center; padding: 16px 0; }

/* ---- 预设药物 ---- */
.med-preset-section { margin-top: 12px; }
.med-preset-label { font-size: 12px; color: var(--text-muted); margin-bottom: 6px; }
.med-preset-btns { display: flex; flex-wrap: wrap; gap: 6px; }

/* ---- 主区域头部 ---- */
.med-main-header { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 10px; margin-bottom: 12px; }
.med-display-mode { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.mode-label { font-size: 13px; color: var(--text-secondary); }
.mode-rec-badge {
  display: inline-block;
  margin-left: 4px;
  padding: 0 5px;
  font-size: 10px;
  line-height: 16px;
  border-radius: 8px;
  background: linear-gradient(135deg, var(--primary-blue), var(--accent-cyan));
  color: #0a0e27;
  font-weight: 700;
  vertical-align: middle;
}
.adapt-hint { font-size: 12px; color: var(--primary-blue); white-space: nowrap; }

/* ---- 日期进度条 ---- */
.med-date-bar { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; flex-wrap: wrap; }
.med-date-text { font-size: var(--font-size-base, 15px); color: rgba(255,255,255,0.85); font-weight: 500; }
.med-progress-text { font-size: 13px; color: var(--primary-blue); }
.med-progress-bar { flex: 1; min-width: 120px; }
.med-empty-tasks { padding: 40px 0; }

/* ---- 列表模式 ---- */
.med-task-list { display: flex; flex-direction: column; gap: 10px; }
.med-task-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  border-radius: 12px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(var(--primary-blue-rgb), 0.15);
  transition: all 0.3s ease;
}
.med-task-item:hover { border-color: rgba(var(--primary-blue-rgb), 0.35); }
.med-task-done { opacity: 0.6; }
.med-task-time-col { display: flex; flex-direction: column; align-items: center; gap: 4px; }
.med-task-time { font-size: var(--font-size-lg, 18px); font-weight: 700; color: var(--primary-blue); }
.med-task-dot {
  width: 10px; height: 10px; border-radius: 50%;
  background: rgba(var(--primary-blue-rgb), 0.3);
  border: 2px solid var(--primary-blue);
}
.med-task-dot.done { background: var(--primary-blue); }
.med-task-body { flex: 1; min-width: 0; }
.med-task-name { font-size: var(--font-size-base, 16px); color: var(--text-primary); font-weight: 600; margin-bottom: 2px; }
.med-task-dosage { font-size: var(--font-size-base, 14px); color: var(--text-secondary); }
.med-task-notes { font-size: 12px; color: rgba(0, 245, 212, 0.8); margin-top: 2px; }
.med-task-done-label { font-size: 13px; color: var(--primary-blue); white-space: nowrap; }

/* ---- 分步模式 ---- */
.med-step-view { text-align: center; padding: 20px 0; }
.med-step-counter { font-size: 13px; color: var(--text-muted); margin-bottom: 16px; }
.med-step-card {
  padding: 28px 24px;
  border-radius: 16px;
  background: rgba(var(--primary-blue-rgb), 0.06);
  border: 1px solid rgba(var(--primary-blue-rgb), 0.25);
  margin-bottom: 20px;
  transition: all 0.3s;
}
.med-step-done { opacity: 0.6; }
.med-step-time { font-size: var(--font-size-xl, 22px); font-weight: 700; color: var(--primary-blue); margin-bottom: 8px; }
.med-step-name { font-size: var(--font-size-lg, 20px); color: var(--text-primary); font-weight: 600; margin-bottom: 6px; }
.med-step-dosage { font-size: var(--font-size-base, 16px); color: var(--text-secondary); margin-bottom: 4px; }
.med-step-notes { font-size: 14px; color: rgba(0, 245, 212, 0.8); margin-bottom: 16px; }
.med-step-btn { margin-top: 12px; }
.med-step-done-label { font-size: 15px; color: var(--primary-blue); margin-top: 12px; }
.med-step-nav { display: flex; justify-content: center; gap: 12px; }

/* ---- 卡片模式 ---- */
.med-cards-view { display: flex; flex-wrap: wrap; gap: 14px; }
.med-card-block {
  flex: 1 1 200px;
  min-width: 180px;
  padding: 20px;
  border-radius: 14px;
  background: rgba(var(--primary-blue-rgb), 0.06);
  border: 1px solid rgba(var(--primary-blue-rgb), 0.25);
  text-align: center;
  transition: all 0.3s;
}
.med-card-block:hover { border-color: rgba(var(--primary-blue-rgb), 0.4); transform: translateY(-2px); }
.med-card-done { opacity: 0.55; }
.med-card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
.med-card-time { font-size: var(--font-size-base, 15px); font-weight: 700; color: var(--primary-blue); }
.med-card-status { font-size: 12px; padding: 2px 8px; border-radius: 10px; }
.med-card-status.done { background: rgba(var(--primary-blue-rgb), 0.2); color: var(--primary-blue); }
.med-card-status.pending { background: rgba(245, 108, 108, 0.2); color: #f56c6c; }
.med-card-name { font-size: var(--font-size-lg, 18px); color: var(--text-primary); font-weight: 600; margin-bottom: 4px; }
.med-card-dosage { font-size: var(--font-size-base, 14px); color: var(--text-secondary); margin-bottom: 12px; }
.med-card-btn { width: 100%; }

/* ---- 右侧统计 ---- */
.med-stats { display: flex; gap: 12px; justify-content: center; }
.med-stat-item { text-align: center; flex: 1; }
.med-stat-value { font-size: var(--font-size-xl, 24px); font-weight: 700; color: var(--primary-blue); }
.med-stat-label { font-size: 12px; color: var(--text-muted); margin-top: 2px; }

.med-history { display: flex; flex-direction: column; gap: 6px; }
.med-history-row { display: flex; justify-content: space-between; align-items: center; padding: 6px 0; }
.med-history-date { font-size: var(--font-size-base, 13px); color: var(--text-secondary); }
.med-history-status { font-size: 12px; padding: 2px 8px; border-radius: 10px; }
.med-history-status.done { background: rgba(var(--primary-blue-rgb), 0.15); color: var(--primary-blue); }
.med-history-status.none { background: var(--border-light); color: var(--text-disabled); }

.med-tips { font-size: 12px; color: var(--text-muted); }
.med-tips-title { font-size: 13px; color: var(--text-secondary); font-weight: 600; margin-bottom: 6px; }
.med-tips-title i { color: var(--accent-cyan); margin-right: 4px; }
.med-tips ul { padding-left: 16px; margin: 0; }
.med-tips li { margin: 3px 0; }

/* ---- 响应式 ---- */
@media (max-width: 1024px) {
  .med-reminder-page { flex-direction: column; height: auto; }
  .med-left, .med-right { width: 100%; }
  .panel-card { height: auto; }
}
</style>
