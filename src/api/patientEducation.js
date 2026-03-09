import request from '@/utils/request'

// 生成患者教育配图
export function generatePatientEduImages(data) {
  return request({
    url: '/api/patient-education/generate-images',
    method: 'post',
    data
  })
}

// 保存一条患者教育记录
export function savePatientEducation(data) {
  return request({
    url: '/api/patient-education/save',
    method: 'post',
    data
  })
}

// 获取当前用户的患者教育列表
export function listPatientEducation(params) {
  return request({
    url: '/api/patient-education/list',
    method: 'get',
    params
  })
}

// 获取单条患者教育详情
export function getPatientEducationDetail(id) {
  return request({
    url: `/api/patient-education/${id}`,
    method: 'get'
  })
}

