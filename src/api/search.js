// 搜索相关 API 请求
import { request } from '../utils';

const search = {
  // 搜索实体
  searchEntities(params = {}) {
    return request({
      url: '/api/search/entities',
      method: 'GET',
      params
    });
  },

  // 搜索关系
  searchRelations(params = {}) {
    return request({
      url: '/api/search/relations',
      method: 'GET',
      params
    });
  },

  // 搜索文档
  searchDocuments(params = {}) {
    return request({
      url: '/api/search/documents',
      method: 'GET',
      params
    });
  },

  // 搜索历史记录
  searchHistory(params = {}) {
    return request({
      url: '/api/search/history',
      method: 'GET',
      params
    });
  },

  // 搜索图谱数据
  searchGraphData(params = {}) {
    return request({
      url: '/api/search/graph',
      method: 'GET',
      params
    });
  },

  // 高级搜索
  advancedSearch(data) {
    return request({
      url: '/api/search/advanced',
      method: 'POST',
      data
    });
  },

  // 获取搜索建议
  getSearchSuggestions(query) {
    return request({
      url: '/api/search/suggestions',
      method: 'GET',
      params: { query }
    });
  },

  // 获取搜索历史
  getSearchHistory() {
    return request({
      url: '/api/search/history',
      method: 'GET'
    });
  },

  // 清空搜索历史
  clearSearchHistory() {
    return request({
      url: '/api/search/history/clear',
      method: 'DELETE'
    });
  },

  // 删除搜索历史记录
  deleteSearchHistoryItem(itemId) {
    return request({
      url: `/api/search/history/${itemId}`,
      method: 'DELETE'
    });
  },

  // 保存搜索
  saveSearch(data) {
    return request({
      url: '/api/search/save',
      method: 'POST',
      data
    });
  },

  // 获取保存的搜索
  getSavedSearches() {
    return request({
      url: '/api/search/saved',
      method: 'GET'
    });
  },

  // 删除保存的搜索
  deleteSavedSearch(searchId) {
    return request({
      url: `/api/search/saved/${searchId}`,
      method: 'DELETE'
    });
  },

  // 搜索统计信息
  getSearchStats() {
    return request({
      url: '/api/search/stats',
      method: 'GET'
    });
  },

  // 获取热门搜索
  getTrendingSearches() {
    return request({
      url: '/api/search/trending',
      method: 'GET'
    });
  },

  // 获取搜索结果总数
  getSearchCount(params = {}) {
    return request({
      url: '/api/search/count',
      method: 'GET',
      params
    });
  },

  // 导出搜索结果
  exportSearchResults(params = {}) {
    return request({
      url: '/api/search/export',
      method: 'GET',
      params,
      responseType: 'blob'
    });
  }
};

export default search;
