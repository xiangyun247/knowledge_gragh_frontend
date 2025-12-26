// 文件上传相关 API 请求
import { request } from '../utils';

const upload = {
  // 上传文件
  uploadFile(data, onUploadProgress = null) {
    return request({
      url: '/api/upload',
      method: 'POST',
      data,
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress
    });
  },

  // 批量上传文件
  batchUploadFiles(data, onUploadProgress = null) {
    return request({
      url: '/api/upload/batch',
      method: 'POST',
      data,
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress
    });
  },

  // 上传图片
  uploadImage(data, onUploadProgress = null) {
    return request({
      url: '/api/upload/image',
      method: 'POST',
      data,
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress
    });
  },

  // 上传文档
  uploadDocument(data, onUploadProgress = null) {
    return request({
      url: '/api/upload/document',
      method: 'POST',
      data,
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress
    });
  },

  // 上传图谱数据
  uploadGraphData(data, onUploadProgress = null) {
    return request({
      url: '/api/upload/graph',
      method: 'POST',
      data,
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress
    });
  },

  // 获取上传任务列表
  getUploadTasks(params = {}) {
    return request({
      url: '/api/upload/tasks',
      method: 'GET',
      params
    });
  },

  // 获取上传任务状态
  getUploadTaskStatus(taskId) {
    return request({
      url: `/api/upload/task/${taskId}`,
      method: 'GET'
    });
  },

  // 取消上传任务
  cancelUploadTask(taskId) {
    return request({
      url: `/api/upload/task/${taskId}/cancel`,
      method: 'POST'
    });
  },

  // 删除上传任务
  deleteUploadTask(taskId) {
    return request({
      url: `/api/upload/task/${taskId}`,
      method: 'DELETE'
    });
  },

  // 获取已上传文件列表
  getUploadedFiles(params = {}) {
    return request({
      url: '/api/upload/files',
      method: 'GET',
      params
    });
  },

  // 获取文件详情
  getFileDetail(fileId) {
    return request({
      url: `/api/upload/file/${fileId}`,
      method: 'GET'
    });
  },

  // 删除已上传文件
  deleteUploadedFile(fileId) {
    return request({
      url: `/api/upload/file/${fileId}`,
      method: 'DELETE'
    });
  },

  // 批量删除已上传文件
  batchDeleteUploadedFiles(fileIds) {
    return request({
      url: '/api/upload/files/batch-delete',
      method: 'DELETE',
      data: { ids: fileIds }
    });
  },

  // 下载文件
  downloadFile(fileId) {
    return request({
      url: `/api/upload/file/${fileId}/download`,
      method: 'GET',
      responseType: 'blob'
    });
  },

  // 预览文件
  previewFile(fileId) {
    return request({
      url: `/api/upload/file/${fileId}/preview`,
      method: 'GET'
    });
  },

  // 获取文件URL
  getFileUrl(fileId) {
    return request({
      url: `/api/upload/file/${fileId}/url`,
      method: 'GET'
    });
  },

  // 获取上传统计信息
  getUploadStats() {
    return request({
      url: '/api/upload/stats',
      method: 'GET'
    });
  },

  // 验证文件
  validateFile(data) {
    return request({
      url: '/api/upload/validate',
      method: 'POST',
      data,
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  // 获取支持的文件类型
  getSupportedFileTypes() {
    return request({
      url: '/api/upload/supported-types',
      method: 'GET'
    });
  }
};

export default upload;
