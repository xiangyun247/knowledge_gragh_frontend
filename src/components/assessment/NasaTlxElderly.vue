<template>
  <div class="nasa-tlx-elderly">
    <div class="tlx-header">
      <h3 class="tlx-title">{{ isBaseline ? '开始前的感受' : '用完之后的感受' }}</h3>
      <p class="tlx-desc">{{ isBaseline
        ? '请回想您平时用手机聊天软件（如微信、豆包等）时的感受来选，没有对错哦~'
        : '刚才用小忆聊天的体验怎么样呀？选最符合您感觉的就行' }}</p>
    </div>

    <div class="tlx-items">
      <div v-for="(q, idx) in questions" :key="q.id" class="tlx-item">
        <div class="tlx-item-header">
          <span class="tlx-num">{{ idx + 1 }}</span>
          <span class="tlx-question">{{ q.text }}</span>
        </div>
        <div class="tlx-options">
          <button
            v-for="opt in q.options"
            :key="opt.value"
            :class="['tlx-option', { active: answers[q.id] === opt.value }]"
            @click="selectAnswer(q.id, opt.value)"
          >
            <span class="opt-emoji">{{ opt.emoji }}</span>
            <span class="opt-label">{{ opt.label }}</span>
          </button>
        </div>
      </div>
    </div>

    <div class="tlx-footer">
      <button class="tlx-submit" :disabled="!allAnswered" @click="submit">
        {{ isBaseline ? '填好啦，下一步' : '填好啦，提交' }}
      </button>
    </div>
  </div>
</template>

<script>
// NASA-TLX 6 维度，适老化措辞 + emoji 辅助
const TLX_QUESTIONS = [
  {
    id: 'mental_demand',
    text: '刚才的事情，需要您动脑筋想吗？',
    options: [
      { value: 1, label: '一点都不用', emoji: '😊' },
      { value: 2, label: '稍微想了想', emoji: '🙂' },
      { value: 3, label: '一般般', emoji: '😐' },
      { value: 4, label: '想了挺多', emoji: '😕' },
      { value: 5, label: '费了好多脑子', emoji: '😰' }
    ]
  },
  {
    id: 'physical_demand',
    text: '刚才的操作，累手累眼吗？',
    options: [
      { value: 1, label: '一点也不累', emoji: '😊' },
      { value: 2, label: '有一点点', emoji: '🙂' },
      { value: 3, label: '一般般', emoji: '😐' },
      { value: 4, label: '挺累的', emoji: '😕' },
      { value: 5, label: '非常累', emoji: '😰' }
    ]
  },
  {
    id: 'temporal_demand',
    text: '您觉得时间够用吗？会不会觉得赶？',
    options: [
      { value: 1, label: '时间很充裕', emoji: '😊' },
      { value: 2, label: '时间差不多', emoji: '🙂' },
      { value: 3, label: '一般', emoji: '😐' },
      { value: 4, label: '有点赶', emoji: '😕' },
      { value: 5, label: '太赶了来不及', emoji: '😰' }
    ]
  },
  {
    id: 'performance',
    text: '您觉得自己完成得怎么样？',
    options: [
      { value: 1, label: '非常好', emoji: '😊' },
      { value: 2, label: '挺好的', emoji: '🙂' },
      { value: 3, label: '还行吧', emoji: '😐' },
      { value: 4, label: '不太好', emoji: '😕' },
      { value: 5, label: '很不好', emoji: '😰' }
    ]
  },
  {
    id: 'effort',
    text: '为了完成任务，您花了多大力气？',
    options: [
      { value: 1, label: '没费什么劲', emoji: '😊' },
      { value: 2, label: '稍微费了点', emoji: '🙂' },
      { value: 3, label: '一般般', emoji: '😐' },
      { value: 4, label: '费了不少力气', emoji: '😕' },
      { value: 5, label: '太费劲了', emoji: '😰' }
    ]
  },
  {
    id: 'frustration',
    text: '过程中您有没有觉得烦或者着急？',
    options: [
      { value: 1, label: '一点也不烦', emoji: '😊' },
      { value: 2, label: '不太烦', emoji: '🙂' },
      { value: 3, label: '一般', emoji: '😐' },
      { value: 4, label: '有点烦', emoji: '😕' },
      { value: 5, label: '特别烦特别急', emoji: '😰' }
    ]
  }
]

export default {
  name: 'NasaTlxElderly',
  props: {
    isBaseline: { type: Boolean, default: true },
    taskId: { type: String, default: '' },
    sessionId: { type: String, default: '' }
  },
  data() {
    return {
      questions: TLX_QUESTIONS,
      answers: {}
    }
  },
  computed: {
    allAnswered() {
      return this.questions.every(q => this.answers[q.id] != null)
    }
  },
  created() {
    this.resetAnswers()
  },
  methods: {
    resetAnswers() {
      this.answers = {}
      this.questions.forEach(q => {
        this.$set(this.answers, q.id, null)
      })
    },
    selectAnswer(qid, value) {
      this.$set(this.answers, qid, value)
    },
    submit() {
      if (!this.allAnswered) return
      const result = this.questions.map(q => ({
        qid: q.id,
        value: this.answers[q.id],
        label: q.options.find(o => o.value === this.answers[q.id])?.label || ''
      }))
      // 转成后端需要的 nasa_tlx 格式
      const nasaAnswers = {}
      result.forEach(r => { nasaAnswers[r.qid] = r.value })
      this.$emit('submit', {
        type: this.isBaseline ? 'baseline' : 'post',
        answers: nasaAnswers,
        raw: result,
        task_id: this.taskId,
        session_id: this.sessionId
      })
    }
  }
}
</script>

<style scoped>
.nasa-tlx-elderly {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px 16px;
}

.tlx-header {
  text-align: center;
  margin-bottom: 28px;
}
.tlx-title {
  font-size: 24px;
  font-weight: 700;
  color: #3D3229;
  margin: 0 0 10px;
}
.tlx-desc {
  font-size: 18px;
  color: #7A7067;
  line-height: 1.6;
  margin: 0;
}

.tlx-items {
  display: flex;
  flex-direction: column;
  gap: 24px;
  margin-bottom: 28px;
}

.tlx-item {
  background: #FFFFFF;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  border: 1px solid #F0E6DB;
}
.tlx-item-header {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 16px;
}
.tlx-num {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #FFF1E6;
  color: #E8734A;
  font-size: 18px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.tlx-question {
  font-size: 20px;
  color: #3D3229;
  line-height: 1.5;
  padding-top: 4px;
}

.tlx-options {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.tlx-option {
  flex: 1 1 calc(50% - 10px);
  min-width: 140px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 16px;
  border: 2px solid #F0E6DB;
  border-radius: 14px;
  background: #FFF8F0;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0;
}
.tlx-option:hover {
  border-color: #E8734A;
  background: #FFF5F0;
}
.tlx-option.active {
  border-color: #E8734A;
  background: #E8734A;
}
.tlx-option.active .opt-label,
.tlx-option.active .opt-emoji {
  color: #FFFFFF;
}

.opt-emoji {
  font-size: 24px;
  line-height: 1;
  flex-shrink: 0;
}
.opt-label {
  font-size: 16px;
  color: #3D3229;
  line-height: 1.4;
}

.tlx-footer {
  text-align: center;
  padding: 10px 0 20px;
}
.tlx-submit {
  padding: 16px 60px;
  font-size: 20px;
  font-weight: 600;
  color: #FFFFFF;
  background: linear-gradient(135deg, #E8734A, #D4623D);
  border: none;
  border-radius: 30px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 6px 20px rgba(232, 115, 74, 0.35);
}
.tlx-submit:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(232, 115, 74, 0.45);
}
.tlx-submit:disabled {
  opacity: 0.45;
  cursor: not-allowed;
  transform: none;
}

/* 响应式 */
@media (max-width: 480px) {
  .tlx-question { font-size: 18px; }
  .tlx-option { flex: 1 1 100%; }
  .tlx-submit { padding: 14px 40px; font-size: 18px; }
}
</style>
