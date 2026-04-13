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
 * 行为指标评分（用于适老测试流程的三模态融合）
 *
 * 基于该 session 内的行为事件计算行为认知负荷分数 (20-100)。
 * 信号：
 *   1. 平均操作间隔 > 30s → 犹豫，+认知负荷
 *   2. back / error_or_repeat 占比高 → 迷惑/困难，+认知负荷
 *   3. 交互过密（< 3s/次）→ 急躁/焦虑，+认知负荷
 *   4. 交互适中 → 认知负荷正常
 *
 * @param {string} sessionId - 测试会话 ID
 * @param {number} [durationSec] - 聊天阶段总时长（秒），可选
 * @returns {{ score: number, details: object }}
 */
export function calcBehavioralScore(sessionId, durationSec) {
  const allEvents = getCognitiveEvents()
  const sessionEvents = sessionId
    ? allEvents.filter(e => e.session_id === sessionId)
    : allEvents

  // 只关注 task_start 到 test_complete 之间的聊天阶段事件
  const taskStartIdx = sessionEvents.findIndex(e => e.event_type === 'task_start')
  const events = taskStartIdx >= 0 ? sessionEvents.slice(taskStartIdx) : sessionEvents

  const clicks = events.filter(e => e.event_type === 'click')
  const backs = events.filter(e => e.event_type === 'back')
  const errors = events.filter(e => e.event_type === 'error_or_repeat')
  const taskEnd = events.find(e => e.event_type === 'task_end' || e.event_type === 'test_complete')

  // 时间范围
  const startTs = events[0] ? events[0].ts : 0
  const endTs = taskEnd ? taskEnd.ts : (durationSec ? startTs + durationSec * 1000 : (events.length > 0 ? events[events.length - 1].ts : startTs))
  const totalMs = endTs - startTs
  const totalSec = Math.max(totalMs / 1000, 1)

  // 信号1：平均操作间隔
  let avgIntervalScore = 50 // 基线50分
  if (clicks.length >= 2) {
    const intervals = []
    for (let i = 1; i < clicks.length; i++) {
      intervals.push((clicks[i].ts - clicks[i - 1].ts) / 1000)
    }
    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length
    if (avgInterval > 30) {
      avgIntervalScore = 50 + Math.min((avgInterval - 30) / 20 * 30, 30) // 50-80
    } else if (avgInterval > 15) {
      avgIntervalScore = 50 // 正常
    } else if (avgInterval > 3) {
      avgIntervalScore = 50 // 正常
    } else {
      avgIntervalScore = 50 + Math.min((3 - avgInterval) / 3 * 30, 30) // 过密→50-80
    }
  }

  // 信号2：错误/后退比例
  const interactionTotal = clicks.length + backs.length + errors.length
  let errorRateScore = 50
  if (interactionTotal >= 3) {
    const errorRatio = (backs.length + errors.length) / interactionTotal
    if (errorRatio > 0.3) {
      errorRateScore = 50 + Math.min(errorRatio * 40, 35) // 50-85
    } else if (errorRatio > 0.15) {
      errorRateScore = 55
    }
    // 低错误率保持50
  }

  // 信号3：交互频率（每分钟操作次数）
  let freqScore = 50
  const opsPerMin = (clicks.length + backs.length + errors.length) / (totalSec / 60)
  if (opsPerMin > 20) {
    freqScore = 50 + Math.min((opsPerMin - 20) / 10 * 25, 25) // 过密→50-75
  } else if (opsPerMin >= 2) {
    freqScore = 45 // 正常略低
  } else if (opsPerMin < 0.5 && totalSec > 60) {
    freqScore = 50 + 10 // 几乎没操作，可能犹豫
  }

  // 加权融合
  const rawScore = avgIntervalScore * 0.35 + errorRateScore * 0.40 + freqScore * 0.25
  const score = Math.round(Math.max(20, Math.min(100, rawScore)))

  return {
    score,
    details: {
      totalInteractions: interactionTotal,
      clickCount: clicks.length,
      backCount: backs.length,
      errorCount: errors.length,
      durationSec: Math.round(totalSec),
      avgIntervalSec: clicks.length >= 2
        ? parseFloat((clicks.reduce((sum, c, i) => i > 0 ? sum + (c.ts - clicks[i - 1].ts) / 1000 : 0, 0) / (clicks.length - 1)).toFixed(1))
        : null,
      opsPerMin: parseFloat(opsPerMin.toFixed(1)),
      avgIntervalScore: Math.round(avgIntervalScore),
      errorRateScore: Math.round(errorRateScore),
      freqScore: Math.round(freqScore)
    }
  }
}

/**
 * 三模态融合认知负荷评分
 *
 * 权重分配：
 *   - NASA-TLX 问卷（主观）：50%
 *   - 行为埋点（客观操作）：30%
 *   - EEG 脑电（生理信号）：20%
 *
 * @param {{ score: number }} questionnaire - { score: 20-100 }
 * @param {{ score: number }} behavioral - { score: 20-100 }
 * @param {{ score: number }} eeg - { score: 20-100 }
 * @returns {{ finalScore: number, breakdown: object }}
 */
export function calcFusedScore(questionnaire, behavioral, eeg) {
  const qScore = (questionnaire && questionnaire.score != null) ? questionnaire.score : null
  const bScore = (behavioral && behavioral.score != null) ? behavioral.score : null
  const eScore = (eeg && eeg.score != null) ? eeg.score : null

  const available = [qScore, bScore, eScore].filter(s => s != null)
  if (available.length === 0) return { finalScore: null, breakdown: {} }

  // 默认权重，如果某个模态缺失则重新分配
  let wQ = 0.5, wB = 0.3, wE = 0.2

  if (qScore == null) { wB = 0.55; wE = 0.45 }
  else if (bScore == null) { wQ = 0.65; wE = 0.35 }
  else if (eScore == null) { wQ = 0.6; wB = 0.4 }

  let finalScore = 0
  if (qScore != null) finalScore += qScore * wQ
  if (bScore != null) finalScore += bScore * wB
  if (eScore != null) finalScore += eScore * wE

  finalScore = Math.round(Math.max(20, Math.min(100, finalScore)))

  return {
    finalScore,
    breakdown: {
      questionnaire: qScore,
      behavioral: bScore,
      eeg: eScore,
      weights: { questionnaire: wQ, behavioral: wB, eeg: wE }
    }
  }
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
