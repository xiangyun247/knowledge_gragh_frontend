// Hadoop 和 Celery 集成相关 API 请求
import { request } from '../utils';

const hadoop = {
  // 批量上传文件到HDFS
  batchUploadFiles(files, onUploadProgress = null) {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });
    
    return request({
      url: '/api/hadoop/upload/batch',
      method: 'POST',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress
    });
  },

  // 批量构建知识图谱
  batchBuildKG(fileIds, useHadoop = true) {
    return request({
      url: '/api/hadoop/build/batch',
      method: 'POST',
      data: {
        file_ids: fileIds,
        use_hadoop: useHadoop
      }
    });
  },

  // 查询批量任务状态
  getBatchTaskStatus(taskId) {
    return request({
      url: `/api/hadoop/status/${taskId}`,
      method: 'GET'
    });
  },

  // 获取所有批量任务列表
  listBatchTasks() {
    return request({
      url: '/api/hadoop/tasks',
      method: 'GET'
    });
  }
};

export default hadoop;
