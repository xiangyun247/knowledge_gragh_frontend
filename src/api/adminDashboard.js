import request from '@/utils/request'

export function fetchCognitiveDashboard() {
  return request({
    url: '/api/admin/cognitive-dashboard',
    method: 'get'
  })
}
