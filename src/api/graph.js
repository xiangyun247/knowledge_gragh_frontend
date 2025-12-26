// 图谱相关 API 请求
import { request } from '../utils';

const graph = {
  // 获取图谱数据
  getGraphData(params = {}) {
    return request({
      url: '/api/graph/data',
      method: 'GET',
      params
    });
  },

  // 获取实体详情
  getEntityDetail(entityId) {
    return request({
      url: `/api/graph/entity/${entityId}`,
      method: 'GET'
    });
  },

  // 获取关系详情
  getRelationDetail(relationId) {
    return request({
      url: `/api/graph/relation/${relationId}`,
      method: 'GET'
    });
  },

  // 搜索图谱实体
  searchEntities(params = {}) {
    return request({
      url: '/api/graph/entities/search',
      method: 'GET',
      params
    });
  },

  // 搜索图谱关系
  searchRelations(params = {}) {
    return request({
      url: '/api/graph/relations/search',
      method: 'GET',
      params
    });
  },

  // 扩展实体
  expandEntity(entityId, params = {}) {
    return request({
      url: `/api/graph/entity/${entityId}/expand`,
      method: 'GET',
      params
    });
  },

  // 添加实体
  addEntity(data) {
    return request({
      url: '/api/graph/entity',
      method: 'POST',
      data
    });
  },

  // 更新实体
  updateEntity(entityId, data) {
    return request({
      url: `/api/graph/entity/${entityId}`,
      method: 'PUT',
      data
    });
  },

  // 删除实体
  deleteEntity(entityId) {
    return request({
      url: `/api/graph/entity/${entityId}`,
      method: 'DELETE'
    });
  },

  // 添加关系
  addRelation(data) {
    return request({
      url: '/api/graph/relation',
      method: 'POST',
      data
    });
  },

  // 更新关系
  updateRelation(relationId, data) {
    return request({
      url: `/api/graph/relation/${relationId}`,
      method: 'PUT',
      data
    });
  },

  // 删除关系
  deleteRelation(relationId) {
    return request({
      url: `/api/graph/relation/${relationId}`,
      method: 'DELETE'
    });
  },

  // 批量导入图谱数据
  importGraphData(data) {
    return request({
      url: '/api/graph/import',
      method: 'POST',
      data,
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  // 导出图谱数据
  exportGraphData(params = {}) {
    return request({
      url: '/api/graph/export',
      method: 'GET',
      params,
      responseType: 'blob'
    });
  },

  // 获取图谱统计信息
  getGraphStats() {
    return request({
      url: '/api/graph/stats',
      method: 'GET'
    });
  },

  // 清空图谱数据
  clearGraphData() {
    return request({
      url: '/api/graph/clear',
      method: 'DELETE'
    });
  },

  // 保存图谱布局
  saveGraphLayout(data) {
    return request({
      url: '/api/graph/layout/save',
      method: 'POST',
      data
    });
  },

  // 加载图谱布局
  loadGraphLayout(graphId) {
    return request({
      url: `/api/graph/layout/${graphId}`,
      method: 'GET'
    });
  },

  // 获取图谱类型列表
  getGraphTypes() {
    return request({
      url: '/api/graph/types',
      method: 'GET'
    });
  },

  // 获取关系类型列表
  getRelationTypes() {
    return request({
      url: '/api/graph/relation-types',
      method: 'GET'
    });
  },

  // 获取实体属性列表
  getEntityProperties(entityId) {
    return request({
      url: `/api/graph/entity/${entityId}/properties`,
      method: 'GET'
    });
  },

  // 获取关系属性列表
  getRelationProperties(relationId) {
    return request({
      url: `/api/graph/relation/${relationId}/properties`,
      method: 'GET'
    });
  },

  // 执行图谱查询
  executeGraphQuery(data) {
    return request({
      url: '/api/graph/query',
      method: 'POST',
      data
    });
  }
};

export default graph;
