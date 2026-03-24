import request from '@/utils/request'

export function uploadCognitiveEvents(events) {
  return request({
    url: '/api/cognitive-load/events',
    method: 'post',
    data: events
  })
}

export function uploadCognitiveQuestionnaires(questionnaires) {
  return request({
    url: '/api/cognitive-load/questionnaires',
    method: 'post',
    data: questionnaires
  })
}

