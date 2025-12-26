import request from '@/utils/request'

// 发送消息到后端查询API
export function sendMessageToBackend(data) {
  return request({
    url: '/api/query',
    method: 'post',
    data
  })
}

// 获取统计信息
export function getStats() {
  return request({
    url: '/api/stats',
    method: 'get'
  })
}
