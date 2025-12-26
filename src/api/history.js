// 历史记录相关 API 请求
import { request } from '../utils';

const history = {
  // 获取历史记录列表
  getHistoryList(params = {}) {
    return request({
      url: '/api/history/list',
      method: 'GET',
      params
    });
  },
  
  // 保存历史记录
  saveHistory(data) {
    return request({
      url: '/api/history/save',
      method: 'POST',
      data
    });
  },
  
  // 更新历史记录状态
  updateHistoryStatus(id, data) {
    return request({
      url: `/api/history/${id}/status`,
      method: 'PUT',
      data
    });
  },

  // 获取历史记录详情
  getHistoryDetail(historyId) {
    return request({
      url: `/api/history/${historyId}`,
      method: 'GET'
    });
  },

  // 删除历史记录
  deleteHistory(historyId) {
    return request({
      url: `/api/history/${historyId}`,
      method: 'DELETE'
    });
  },

  // 批量删除历史记录
  batchDeleteHistory(historyIds) {
    return request({
      url: '/api/history/batch-delete',
      method: 'DELETE',
      data: { ids: historyIds }
    });
  },

  // 清空历史记录
  clearHistory() {
    return request({
      url: '/api/history/clear',
      method: 'DELETE'
    });
  },

  // 搜索历史记录
  searchHistory(params = {}) {
    return request({
      url: '/api/history/search',
      method: 'GET',
      params
    });
  },

  // 恢复历史记录
  restoreHistory(historyId) {
    return request({
      url: `/api/history/${historyId}/restore`,
      method: 'POST'
    });
  },

  // 标记历史记录为收藏
  favoriteHistory(historyId) {
    return request({
      url: `/api/history/${historyId}/favorite`,
      method: 'POST'
    });
  },

  // 取消收藏历史记录
  unfavoriteHistory(historyId) {
    return request({
      url: `/api/history/${historyId}/unfavorite`,
      method: 'DELETE'
    });
  },

  // 获取收藏的历史记录
  getFavoriteHistory() {
    return request({
      url: '/api/history/favorites',
      method: 'GET'
    });
  },

  // 获取历史记录统计信息
  getHistoryStats() {
    return request({
      url: '/api/history/stats',
      method: 'GET'
    });
  },

  // 导出历史记录
  exportHistory(params = {}) {
    return request({
      url: '/api/history/export',
      method: 'GET',
      params,
      responseType: 'blob'
    });
  },

  // 导入历史记录
  importHistory(data) {
    return request({
      url: '/api/history/import',
      method: 'POST',
      data,
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  // 分类历史记录
  categorizeHistory(historyId, category) {
    return request({
      url: `/api/history/${historyId}/categorize`,
      method: 'PUT',
      data: { category }
    });
  },

  // 获取历史记录分类
  getHistoryCategories() {
    return request({
      url: '/api/history/categories',
      method: 'GET'
    });
  },

  // 获取历史记录时间线
  getHistoryTimeline(params = {}) {
    return request({
      url: '/api/history/timeline',
      method: 'GET',
      params
    });
  },

  // 清理过期历史记录
  cleanupExpiredHistory() {
    return request({
      url: '/api/history/cleanup',
      method: 'POST'
    });
  }
};

export default history;
