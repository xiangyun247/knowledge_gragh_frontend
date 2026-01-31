// 历史记录工具函数
import historyApi from '../api/history'

// 历史记录类型（与后端 / MySQL 中的 type / record_type 推断保持一致）
export const HISTORY_TYPES = {
  CHAT: 'chat',              // 问答
  SEARCH: 'search',          // 实体搜索
  GRAPH_QUERY: 'graph_query',// 图谱查询
  GRAPH_BUILD: 'graph_build',// 图谱构建
  UPLOAD: 'upload'           // 数据上传
}

// 保存历史记录（统一入口）
// extra 可选字段：status、graphId、fileId、entities 等
export async function saveHistoryRecord(type, data = {}, extra = {}) {
  const now = new Date().toISOString()

  // 把 graphId / fileId 也塞进 content 里，方便后端 get_histories 做类型与重放推断
  const content = {
    ...data,
    graphId: extra.graphId || data.graphId,
    fileId: extra.fileId || data.fileId
  }

  const newRecord = {
    id: Date.now(),                // 必填：后端 Pydantic 需要
    type,                          // 必填：chat / search / graph_query / graph_build / upload
    title: generateTitle(type, content),
    content,
    status: extra.status || getDefaultStatus(type),
    entities: extra.entities || [],// 保持字段存在，避免前端访问出错
    createTime: now,
    updateTime: now
  }

  try {
    const response = await historyApi.saveHistory(newRecord)
    const saved = response.data?.data ?? response.data ?? newRecord
    window.dispatchEvent(new CustomEvent('historyUpdated', { detail: { newRecord: saved } }))
    return saved
  } catch (error) {
    console.error('保存历史记录失败:', error)
    return newRecord
  }
}

// 获取所有历史记录
export async function getAllHistory() {
  try {
    const response = await historyApi.getHistoryList({ limit: 1000 })
    const list = response.data?.data?.list || response.data?.data?.records
    return Array.isArray(list) ? list : []
  } catch (error) {
    console.error('获取历史记录失败:', error)
    return []
  }
}

// 根据类型获取历史记录
export async function getHistoryByType(type) {
  try {
    const response = await historyApi.getHistoryList({ type, limit: 1000 })
    const list = response.data?.data?.list || response.data?.data?.records
    return Array.isArray(list) ? list : []
  } catch (error) {
    console.error('获取历史记录失败:', error)
    return []
  }
}

// 删除历史记录
export async function deleteHistoryRecord(id) {
  try {
    await historyApi.deleteHistory(id)

    // 触发自定义事件，通知其他组件历史记录已更新
    window.dispatchEvent(new CustomEvent('historyUpdated', { detail: { deletedId: id } }))

    return true
  } catch (error) {
    console.error('删除历史记录失败:', error)
    return false
  }
}

// 删除所有历史记录
export async function clearAllHistory() {
  try {
    await historyApi.clearHistory()

    // 触发自定义事件，通知其他组件历史记录已更新
    window.dispatchEvent(new CustomEvent('historyUpdated', { detail: { cleared: true } }))

    return true
  } catch (error) {
    console.error('清空历史记录失败:', error)
    return false
  }
}

// 生成历史记录标题
function generateTitle(type, data) {
  switch (type) {
    case HISTORY_TYPES.CHAT:
      return `聊天: ${data.question || '新对话'}`
    case HISTORY_TYPES.SEARCH:
      return `实体搜索: ${data.query || data.keyword || '搜索'}`
    case HISTORY_TYPES.GRAPH_QUERY:
      return `图谱查询: ${data.entity || '知识图谱'}`
    case HISTORY_TYPES.GRAPH_BUILD:
      return `图谱构建: ${data.graphName || data.graphId || '新图谱'}`
    case HISTORY_TYPES.UPLOAD:
      return `数据上传: ${data.filename || '未知文件'}`
    default:
      return '未知记录'
  }
}

// 获取默认状态
function getDefaultStatus(type) {
  switch (type) {
    case HISTORY_TYPES.CHAT:
      return 'completed'
    case HISTORY_TYPES.SEARCH:
      return 'completed'
    case HISTORY_TYPES.GRAPH_QUERY:
      return 'completed'
    case HISTORY_TYPES.GRAPH_BUILD:
      return 'completed'
    case HISTORY_TYPES.UPLOAD:
      return 'pending'
    default:
      return 'completed'
  }
}

// 更新历史记录状态
export async function updateHistoryStatus(id, status, message = '') {
  try {
    await historyApi.updateHistoryStatus(id, { status, message })
    
    // 触发自定义事件，通知其他组件历史记录已更新
    window.dispatchEvent(new CustomEvent('historyUpdated', { detail: { updatedRecord: { id, status, message } } }))
    
    return true
  } catch (error) {
    console.error('更新历史记录状态失败:', error)
    return false
  }
}
