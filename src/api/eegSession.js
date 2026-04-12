/**
 * EEG 监测会话管理 API
 *
 * 涉及两张表：
 *   eeg_subjects      - 受试者信息
 *   eeg_sessions      - 监测会话记录（含特征值和评分）
 */
import request from '@/utils/request'

// ==================== 受试者管理 ====================

/**
 * 获取受试者列表
 * @param {{ keyword?: string, cognitive_status?: string, page?: number, page_size?: number }} params
 */
export function getSubjectList(params) {
  return request({
    url: '/api/eeg-session/subjects',
    method: 'get',
    params
  })
}

/**
 * 获取单个受试者
 * @param {number} subjectId
 */
export function getSubject(subjectId) {
  return request({
    url: `/api/eeg-session/subjects/${subjectId}`,
    method: 'get'
  })
}

/**
 * 新增受试者
 * @param {{ subject_code: string, name?: string, age: number, gender: 'male'|'female', cognitive_status: 'normal'|'mci'|'dementia', remark?: string }} data
 */
export function createSubject(data) {
  return request({
    url: '/api/eeg-session/subjects',
    method: 'post',
    data
  })
}

/**
 * 更新受试者
 * @param {number} subjectId
 * @param {Partial<{ name?: string, age?: number, gender?: string, cognitive_status?: string, remark?: string }>} data
 */
export function updateSubject(subjectId, data) {
  return request({
    url: `/api/eeg-session/subjects/${subjectId}`,
    method: 'put',
    data
  })
}

/**
 * 删除受试者
 * @param {number} subjectId
 */
export function deleteSubject(subjectId) {
  return request({
    url: `/api/eeg-session/subjects/${subjectId}`,
    method: 'delete'
  })
}

// ==================== 监测会话管理 ====================

/**
 * 创建监测会话（开始监测时调用）
 * @param {{ subject_id: number, session_note?: string }} data
 * @returns {{ session_id: number, start_time: string }}
 */
export function createSession(data) {
  return request({
    url: '/api/eeg-session/sessions',
    method: 'post',
    data
  })
}

/**
 * 结束监测会话（停止监测时调用，保存最终特征和评分）
 * @param {number} sessionId
 * @param {{
 *   duration_seconds: number,
 *   avg_score: number,
 *   avg_theta_beta: number,
 *   avg_alpha_beta: number,
 *   avg_theta_power: number,
 *   avg_alpha_power: number,
 *   avg_beta_power: number,
 *   avg_snr: number,
 *   score_trend: number[],
 *   cognitive_level: 'low'|'medium'|'high',
 *   session_note?: string
 * }} data
 */
export function endSession(sessionId, data) {
  return request({
    url: `/api/eeg-session/sessions/${sessionId}/end`,
    method: 'post',
    data
  })
}

/**
 * 获取会话列表
 * @param {{ subject_id?: number, start_time?: string, end_time?: string, page?: number, page_size?: number }} params
 */
export function getSessionList(params) {
  return request({
    url: '/api/eeg-session/sessions',
    method: 'get',
    params
  })
}

/**
 * 获取单个会话详情
 * @param {number} sessionId
 */
export function getSession(sessionId) {
  return request({
    url: `/api/eeg-session/sessions/${sessionId}`,
    method: 'get'
  })
}

/**
 * 删除会话
 * @param {number} sessionId
 */
export function deleteSession(sessionId) {
  return request({
    url: `/api/eeg-session/sessions/${sessionId}`,
    method: 'delete'
  })
}

// ==================== 数据汇总 ====================

/**
 * 获取多人认知负荷汇总统计
 * @param {{ group_by?: 'subject'|'status'|'date', start_date?: string, end_date?: string }} params
 */
export function getSessionSummary(params) {
  return request({
    url: '/api/eeg-session/sessions/summary',
    method: 'get',
    params
  })
}

/**
 * 导出监测数据为 CSV
 * @param {{ subject_ids?: number[], start_date?: string, end_date?: string }} data
 */
export function exportSessionsCSV(data) {
  return request({
    url: '/api/eeg-session/sessions/export',
    method: 'post',
    data,
    responseType: 'blob'
  })
}
