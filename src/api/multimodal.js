import request from '@/utils/request'
import storage from '@/utils/storage'

const API_BASE = process.env.VUE_APP_API_BASE_URL || ''

/**
 * TTS：文本转语音
 * @param {{ text: string, voice?: string, rate?: string, volume?: string }} params
 * @returns {Promise<Blob>} 音频 Blob
 */
export function synthesizeTTS(params) {
  const base = (API_BASE || '').replace(/\/$/, '')
  const url = base ? `${base}/api/tts/synthesize` : '/api/tts/synthesize'
  const token = storage.get('access_token') || storage.get('token')
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`
  return fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      text: params.text,
      voice: params.voice || 'zh-CN-XiaoxiaoNeural',
      rate: params.rate || '+0%',
      volume: params.volume || '+0%'
    }),
    credentials: 'include'
  }).then(res => {
    if (!res.ok) throw new Error(res.statusText)
    return res.blob()
  })
}

/**
 * STT：语音转文本
 * @param {File} audioFile 音频文件（wav/mp3/webm 等）
 * @returns {Promise<{ text: string }>}
 */
export function transcribeSTT(audioFile) {
  const formData = new FormData()
  formData.append('audio', audioFile)
  return request({
    url: '/api/stt/transcribe',
    method: 'post',
    data: formData
  })
}

/**
 * OCR：图片文字提取
 * @param {File} imageFile 图片文件
 * @returns {Promise<{ text: string }>}
 */
export function extractOCR(imageFile) {
  const formData = new FormData()
  formData.append('image', imageFile)
  return request({
    url: '/api/ocr/extract',
    method: 'post',
    data: formData
  })
}

/**
 * OCR + 解读：图片文字提取并生成通俗解读
 * @param {File} imageFile 图片文件
 * @returns {Promise<{ text: string, interpretation: string }>}
 */
export function interpretOCR(imageFile) {
  const formData = new FormData()
  formData.append('image', imageFile)
  return request({
    url: '/api/ocr/interpret',
    method: 'post',
    data: formData
  })
}
