/**
 * 认知负荷评估：行为埋点与问卷存储（M10/M11/M12）
 * 事件格式：时间戳 + 事件类型 + 关键参数；先落前端 localStorage，后续可接后端上报。
 */

const STORAGE_KEY_EVENTS = 'cognitive_load_events'
const STORAGE_KEY_QUESTIONNAIRES = 'cognitive_load_questionnaires'
const MAX_EVENTS = 2000
const MAX_QUESTIONNAIRES = 500

export const COGNITIVE_EVENT_TYPES = {
  TASK_START: 'task_start',
  TASK_END: 'task_end',
  STEP_VIEW: 'step_view',
  BACK: 'back',
  CLICK: 'click',
  ERROR_OR_REPEAT: 'error_or_repeat',
  SUBMIT_QUESTIONNAIRE: 'submit_questionnaire'
}

export const COGNITIVE_SOURCE = {
  PATIENT_EDUCATION: 'patient_education',
  CHAT: 'chat',
  MEDICATION_REMINDER: 'medication_reminder'
}

/**
 * 记录一条行为事件
 * @param {string} eventType - 见 COGNITIVE_EVENT_TYPES
 * @param {object} params - { task_id?, session_id?, source?, ... }
 */
export function recordEvent(eventType, params = {}) {
  const event = {
    ts: Date.now(),
    event_type: eventType,
    task_id: params.task_id || null,
    session_id: params.session_id || null,
    source: params.source || null,
    params: { ...params }
  }
  delete event.params.task_id
  delete event.params.session_id
  delete event.params.source

  try {
    const raw = localStorage.getItem(STORAGE_KEY_EVENTS)
    const list = raw ? JSON.parse(raw) : []
    list.push(event)
    const trimmed = list.slice(-MAX_EVENTS)
    localStorage.setItem(STORAGE_KEY_EVENTS, JSON.stringify(trimmed))
    return event
  } catch (e) {
    console.warn('cognitiveLoad.recordEvent failed', e)
    return event
  }
}

/**
 * 获取所有行为事件（用于管理端/导出）
 */
export function getCognitiveEvents() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_EVENTS)
    return raw ? JSON.parse(raw) : []
  } catch (e) {
    return []
  }
}

/**
 * 提交问卷结果
 * @param {string} taskId
 * @param {string} [sessionId]
 * @param {string} source - patient_education | chat
 * @param {Array<{qid: string, value: number}>} answers
 */
export function recordQuestionnaire(taskId, sessionId, source, answers) {
  const record = {
    ts: Date.now(),
    task_id: taskId,
    session_id: sessionId || null,
    source: source || null,
    answers: Array.isArray(answers) ? answers : []
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY_QUESTIONNAIRES)
    const list = raw ? JSON.parse(raw) : []
    list.push(record)
    const trimmed = list.slice(-MAX_QUESTIONNAIRES)
    localStorage.setItem(STORAGE_KEY_QUESTIONNAIRES, JSON.stringify(trimmed))
    recordEvent(COGNITIVE_EVENT_TYPES.SUBMIT_QUESTIONNAIRE, {
      task_id: taskId,
      session_id: sessionId,
      source,
      answers_count: record.answers.length
    })
    return record
  } catch (e) {
    console.warn('cognitiveLoad.recordQuestionnaire failed', e)
    return record
  }
}

/**
 * 获取所有问卷记录
 */
export function getCognitiveQuestionnaires() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_QUESTIONNAIRES)
    return raw ? JSON.parse(raw) : []
  } catch (e) {
    return []
  }
}

/**
 * 导出为 CSV 文本（事件 + 问卷）
 */
export function exportCognitiveLoadCSV() {
  const events = getCognitiveEvents()
  const questionnaires = getCognitiveQuestionnaires()

  const rows = []
  rows.push('type,ts,ts_iso,task_id,session_id,source,extra')
  for (const e of events) {
    const extra = JSON.stringify(e.params || {}).replace(/"/g, '""')
    rows.push(`event,${e.ts},${new Date(e.ts).toISOString()},${e.task_id || ''},${e.session_id || ''},${e.source || ''},"${extra}"`)
  }
  for (const q of questionnaires) {
    const extra = JSON.stringify(q.answers || []).replace(/"/g, '""')
    rows.push(`questionnaire,${q.ts},${new Date(q.ts).toISOString()},${q.task_id || ''},${q.session_id || ''},${q.source || ''},"${extra}"`)
  }
  return '\uFEFF' + rows.join('\n')
}

/**
 * 自适应调度器：根据历史认知负荷数据推荐最优呈现模式
 *
 * 决策优先级：
 *   1. 用户近期手动切换偏好（>50% 选同一模式 → 尊重偏好）
 *   2. 近 N 份问卷平均分 ≥ 3.5 → card（最简）
 *   3. 近 N 份问卷平均分 ≥ 2.8 → step（分步引导）
 *   4. back 事件占比高 → step
 *   5. 默认 long
 *
 * @param {string} [source] - 限定来源，如 'patient_education'
 * @returns {{ mode: string, reason: string, confidence: string }}
 */
export function getRecommendedDisplayMode(source) {
  const RECENT_Q_LIMIT = 10
  const RECENT_EVT_LIMIT = 200

  const allEvents = getCognitiveEvents()
  const allQuestionnaires = getCognitiveQuestionnaires()

  const events = source
    ? allEvents.filter(e => e.source === source).slice(-RECENT_EVT_LIMIT)
    : allEvents.slice(-RECENT_EVT_LIMIT)
  const questionnaires = source
    ? allQuestionnaires.filter(q => q.source === source).slice(-RECENT_Q_LIMIT)
    : allQuestionnaires.slice(-RECENT_Q_LIMIT)

  if (!events.length && !questionnaires.length) {
    return { mode: 'long', reason: 'no_data', confidence: 'low' }
  }

  // ---- 信号 1: 用户手动模式偏好（从 TASK_END 的 view_mode 统计） ----
  const taskEndEvents = events.filter(
    e => e.event_type === 'task_end' && e.params && e.params.view_mode
  )
  if (taskEndEvents.length >= 3) {
    const modeCount = {}
    for (const e of taskEndEvents) {
      const m = e.params.view_mode
      modeCount[m] = (modeCount[m] || 0) + 1
    }
    const total = taskEndEvents.length
    for (const [m, count] of Object.entries(modeCount)) {
      if (count / total > 0.5) {
        return { mode: m, reason: 'user_preference', confidence: 'high' }
      }
    }
  }

  // ---- 信号 2: 问卷平均分 ----
  if (questionnaires.length >= 2) {
    let sum = 0
    let cnt = 0
    for (const q of questionnaires) {
      for (const a of (q.answers || [])) {
        if (typeof a.value === 'number') {
          sum += a.value
          cnt++
        }
      }
    }
    if (cnt > 0) {
      const avg = sum / cnt
      if (avg >= 3.5) {
        return { mode: 'card', reason: 'high_cognitive_load', confidence: 'high' }
      }
      if (avg >= 2.8) {
        return { mode: 'step', reason: 'moderate_cognitive_load', confidence: 'medium' }
      }
    }
  }

  // ---- 信号 3: back 事件频率 ----
  const backCount = events.filter(e => e.event_type === 'back').length
  const clickCount = events.filter(e => e.event_type === 'click').length
  const interactionTotal = backCount + clickCount
  if (interactionTotal >= 5 && backCount / interactionTotal > 0.3) {
    return { mode: 'step', reason: 'frequent_back', confidence: 'medium' }
  }

  return { mode: 'long', reason: 'default', confidence: 'low' }
}

const REASON_LABELS = {
  user_preference: '根据您的使用习惯',
  high_cognitive_load: '检测到阅读负担较重',
  moderate_cognitive_load: '根据您的反馈评估',
  frequent_back: '检测到频繁回看操作',
  default: '',
  no_data: ''
}

/**
 * 获取推荐理由的中文描述
 * @param {string} reason
 * @returns {string}
 */
export function getReasonLabel(reason) {
  return REASON_LABELS[reason] || ''
}

/**
 * 清空本地评估数据（可选，供管理端使用）
 */
export function clearCognitiveLoadData() {
  try {
    localStorage.removeItem(STORAGE_KEY_EVENTS)
    localStorage.removeItem(STORAGE_KEY_QUESTIONNAIRES)
    return true
  } catch (e) {
    return false
  }
}
