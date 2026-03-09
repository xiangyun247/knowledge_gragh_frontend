/**
 * 聊天问答状态：消息、会话、来源等
 * 存入 Vuex 后，切换路由再返回时聊天记录会保留
 */
export default {
  namespaced: true,
  state: {
    messages: [],
    sessionId: '',
    sourcesGraph: [],
    sourcesDoc: [],
    lastQuestionForSources: '',
    // 「深度思考」分析 trace：{ retrievals: [], reasoning: '' }
    analysisTrace: null
  },
  mutations: {
    ADD_MESSAGE(state, msg) {
      state.messages.push(msg)
    },
    SET_SESSION_ID(state, id) {
      state.sessionId = id || ''
    },
    SET_SOURCES(state, { sourcesGraph = [], sourcesDoc = [], lastQuestionForSources = '' } = {}) {
      state.sourcesGraph = sourcesGraph
      state.sourcesDoc = sourcesDoc
      state.lastQuestionForSources = lastQuestionForSources
    },
    /** 流式输出：追加最后一条系统消息的 content */
    APPEND_MESSAGE_CONTENT(state, { index, chunk }) {
      const m = state.messages[index]
      if (m) {
        const next = (m.content || '') + (chunk || '')
        state.messages.splice(index, 1, { ...m, content: next })
      }
    },
    /** 更新某条消息的 content（流式结束、错误时用），可选附带 patientEducation / scienceTweet 结构化数据 */
    UPDATE_MESSAGE_CONTENT(state, { index, content, patientEducation, scienceTweet }) {
      const m = state.messages[index]
      if (m) {
        const update = { ...m }
        if (content !== undefined) update.content = content || m.content
        if (patientEducation !== undefined) update.patientEducation = patientEducation
        if (scienceTweet !== undefined) update.scienceTweet = scienceTweet
        state.messages.splice(index, 1, update)
      }
    },
    /** 可选：清空当前会话，用于「新对话」等 */
    RESET_CHAT(state) {
      state.messages = []
      state.sessionId = ''
      state.sourcesGraph = []
      state.sourcesDoc = []
      state.lastQuestionForSources = ''
      state.analysisTrace = null
    },
    /** 设置「深度思考」分析 trace */
    SET_ANALYSIS_TRACE(state, trace) {
      state.analysisTrace = trace || null
    }
  }
}
