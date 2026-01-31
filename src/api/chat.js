import request from '@/utils/request'
import storage from '@/utils/storage'

const API_BASE = process.env.VUE_APP_API_BASE_URL || ''

// 发送消息到后端查询API（使用 LangGraph Agent：/api/agent/query）
// 6.1 传入 session_id 可启用多轮记忆；body 支持 { question, session_id, deep_think }
export function sendMessageToBackend(data) {
  const body =
    typeof data === 'string'
      ? { question: data }
      : {
          question: data.question,
          session_id: data.session_id,
          deep_think: !!data.deep_think
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
 * @param {{ onChunk: (delta: string) => void, onDone: ({ answer, sources, trace }) => void, onError: (err: any) => void, deepThink?: boolean }} handlers
 */
export function sendMessageToBackendStream(question, sessionId, { onChunk, onDone, onError, deepThink = false }) {
  const base = (API_BASE || '').replace(/\/$/, '')
  const url = base ? `${base}/api/agent/query/stream` : '/api/agent/query/stream'
  const token = storage.get('token')
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`

  fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      question,
      session_id: sessionId || null,
      deep_think: !!deepThink
    }),
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
              else if (ev.type === 'done') onDone({ answer: ev.answer || '', sources: ev.sources || [], trace: ev.trace || null })
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
