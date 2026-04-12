import { assessCognitiveLoad } from '@/api/cognitiveLoad'
import { getCognitiveEvents } from '@/utils/cognitiveLoad'

let questionnaireCompletedHandler = null
let questionnaireSkippedHandler = null
let initialized = false

export function initCognitiveQuestionnaireHandler() {
  if (initialized || typeof window === 'undefined') return

  initialized = true

  questionnaireCompletedHandler = (data) => {
    handleQuestionnaireCompleted(data)
  }

  questionnaireSkippedHandler = (data) => {
    handleQuestionnaireSkipped(data)
  }

  window.Vue.prototype.$root.$on('cognitive-questionnaire-completed', questionnaireCompletedHandler)
  window.Vue.prototype.$root.$on('cognitive-questionnaire-skipped', questionnaireSkippedHandler)


}

if (typeof window !== 'undefined' && window.Vue) {
  window.Vue.prototype.$nextTick(() => {
    initCognitiveQuestionnaireHandler()
  })
}

export function destroyCognitiveQuestionnaireHandler() {
  if (typeof window === 'undefined') return

  if (questionnaireCompletedHandler) {
    window.Vue.prototype.$root.$off('cognitive-questionnaire-completed', questionnaireCompletedHandler)
  }
  if (questionnaireSkippedHandler) {
    window.Vue.prototype.$root.$off('cognitive-questionnaire-skipped', questionnaireSkippedHandler)
  }
}

async function handleQuestionnaireCompleted(data) {
  if (!data || !data.task_id) {
    console.warn('[CognitiveLoad] Invalid questionnaire data:', data)
    return
  }

  try {
    const events = getCognitiveEvents()
    const taskEvents = events.filter(e => e.task_id === data.task_id)

    const taskStartEvent = taskEvents.find(e => e.event_type === 'task_start')
    const taskEndEvent = taskEvents.find(e => e.event_type === 'task_end')

    const requestData = {
      user_id: data.user_id || 'current_user',
      session_id: data.session_id || null,
      task_id: data.task_id,
      source: data.source || 'patient_education',
      task_start_ts: taskStartEvent?.ts || null,
      task_end_ts: taskEndEvent?.ts || Date.now(),
      behavior_events: taskEvents.map(e => ({
        event_type: e.event_type,
        ts: e.ts,
        params: e.params || {}
      })),
      nasa_tlx_answers: {
        mental_demand: data.answers?.mental_demand || 4,
        physical_demand: data.answers?.physical_demand || 4,
        temporal_demand: data.answers?.temporal_demand || 4,
        performance: data.answers?.performance || 4,
        effort: data.answers?.effort || 4,
        frustration: data.answers?.frustration || 4
      }
    }

    const response = await assessCognitiveLoad(requestData)

  } catch (error) {
    console.error('[CognitiveLoad] Assessment failed:', error)
  }
}

function handleQuestionnaireSkipped(data) {
  if (!data || !data.task_id) return

}

export default {
  initCognitiveQuestionnaireHandler,
  destroyCognitiveQuestionnaireHandler
}
