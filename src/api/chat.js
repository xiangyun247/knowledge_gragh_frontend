import request from '@/utils/request'
import storage from '@/utils/storage'

const API_BASE = process.env.VUE_APP_API_BASE_URL || ''

/**
 * 获取可用的 LLM 模型列表（需在 .env 配置对应 API Key）
 */
export function getAvailableModels() {
  return request({
    url: '/api/llm/models',
    method: 'get'
  })
}

// 发送消息到后端查询API（使用 LangGraph Agent：/api/agent/query）
// 6.1 传入 session_id 可启用多轮记忆；body 支持 { question, session_id, model, deep_think, intent }
export function sendMessageToBackend(data) {
  const body =
    typeof data === 'string'
      ? { question: data }
      : {
          question: data.question,
          session_id: data.session_id,
          model: data.model || undefined,
          deep_think: !!data.deep_think,
          intent: data.intent || undefined
        }
  return request({
    url: '/api/agent/query',
    method: 'post',
    data: body
  })
}

/**
 * 6.2 流式问答：POST /api/agent/query/stream，SSE 推送 chunk / done / error
 * @param {string} question
 * @param {string} [sessionId]
 * @param {{ onChunk, onDone, onError, deepThink?: boolean, intent?: string, model?: string }} handlers
 *   model: 多 LLM 支持，如 deepseek-chat、qwen-plus
 *   intent: 'patient_education' 时直接生成患者教育，返回结构化 { title, sections, summary }
 */
export function sendMessageToBackendStream(question, sessionId, { onChunk, onDone, onError, deepThink = false, intent, model }) {
  const base = (API_BASE || '').replace(/\/$/, '')
  const url = base ? `${base}/api/agent/query/stream` : '/api/agent/query/stream'
  const token = storage.get('access_token') || storage.get('token')
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const body = {
    question,
    session_id: sessionId || null,
    deep_think: !!deepThink
  }
  if (intent) body.intent = intent
  if (model) body.model = model

  fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
    credentials: 'include'
  })
    .then(res => {
      if (!res.ok) throw new Error(res.statusText)
      return res.body.getReader()
    })
    .then(reader => {
      const dec = new TextDecoder()
      let buf = ''
      const read = () => {
        reader.read().then(({ done, value }) => {
          if (done) return
          buf += dec.decode(value, { stream: true })
          const parts = buf.split(/\n\n/)
          buf = parts.pop() || ''
          for (const p of parts) {
            const m = p.match(/^data:\s*(\{.*\})/s)
            if (!m) continue
            try {
              const ev = JSON.parse(m[1])
              if (ev.type === 'chunk' && ev.delta) onChunk(ev.delta)
              else if (ev.type === 'done') onDone({
                answer: ev.answer || '',
                sources: ev.sources || [],
                trace: ev.trace || null,
                patient_education: ev.patient_education || null
              })
              else if (ev.type === 'error') onError(new Error(ev.detail || 'stream error'))
            } catch (_) { /* ignore JSON parse error */ }
          }
          read()
        })
      }
      read()
    })
    .catch(onError)
}

// 获取统计信息
export function getStats() {
  return request({
    url: '/api/stats',
    method: 'get'
  })
}

/**
 * 生成科普推文（用于「推文版」按钮）
 * @param {{ topic: string, source_content?: string, word_limit?: number, style?: string }} params
 */
export function generateScienceTweet(params) {
  return request({
    url: '/api/science-tweet',
    method: 'post',
    data: {
      topic: params.topic,
      source_content: params.source_content || undefined,
      word_limit: params.word_limit ?? 140,
      style: params.style || '轻松'
    }
  })
}
