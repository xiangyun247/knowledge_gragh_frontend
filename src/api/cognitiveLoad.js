import request from '@/utils/request'

export function uploadCognitiveEvents(events) {
  console.log('[cognitive-load] 上传事件数据:', JSON.stringify(events?.slice(0,3) || [], null, 2))
  return request({
    url: '/api/cognitive-load/events',
    method: 'post',
    data: events
  }).then(res => {
    console.log('[cognitive-load] 事件上传成功:', res?.data || res)
    return res
  })
}

export function uploadCognitiveQuestionnaires(questionnaires) {
  console.log('[cognitive-load] 上传问卷数据:', JSON.stringify(questionnaires?.slice(0,3) || [], null, 2))
  return request({
    url: '/api/cognitive-load/questionnaires',
    method: 'post',
    data: questionnaires
  }).then(res => {
    console.log('[cognitive-load] 问卷上传成功:', res?.data || res)
    return res
  })
}

