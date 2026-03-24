<template>
  <el-dialog
    title="认知负荷小问卷（可选）"
    :visible.sync="dialogVisible"
    width="480px"
    :close-on-click-modal="false"
    append-to-body
    modal-append-to-body
    @close="handleClose"
  >
    <p class="questionnaire-desc">请根据刚才的阅读/问答体验，简单勾选（约 10 秒）：</p>
    <div v-for="(q, idx) in questions" :key="q.id" class="questionnaire-item">
      <div class="questionnaire-label">{{ idx + 1 }}. {{ q.text }}</div>
      <el-radio-group v-model="answers[q.id]" size="small" class="questionnaire-options">
        <el-radio
          v-for="opt in q.options"
          :key="opt.value"
          :label="opt.value"
        >
          {{ opt.label }}
        </el-radio>
      </el-radio-group>
    </div>
    <span slot="footer" class="dialog-footer">
      <el-button @click="handleSkip">跳过</el-button>
      <el-button type="primary" @click="handleSubmit">提交</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { recordQuestionnaire } from '@/utils/cognitiveLoad'

// 3–5 道极简主观题（M11）
const QUESTIONNAIRE_ITEMS = [
  { id: 'q1', text: '刚才这段内容理解起来难吗？', options: [{ value: 1, label: '很容易' }, { value: 2, label: '较容易' }, { value: 3, label: '一般' }, { value: 4, label: '较难' }, { value: 5, label: '很难' }] },
  { id: 'q2', text: '需要反复看吗？', options: [{ value: 1, label: '不需要' }, { value: 2, label: '偶尔' }, { value: 3, label: '有时' }, { value: 4, label: '经常' }, { value: 5, label: '总是' }] },
  { id: 'q3', text: '信息量感觉如何？', options: [{ value: 1, label: '太少' }, { value: 2, label: '偏少' }, { value: 3, label: '刚好' }, { value: 4, label: '偏多' }, { value: 5, label: '太多' }] },
  { id: 'q4', text: '整体阅读/理解负担如何？', options: [{ value: 1, label: '很轻松' }, { value: 2, label: '较轻松' }, { value: 3, label: '一般' }, { value: 4, label: '较吃力' }, { value: 5, label: '很吃力' }] }
]

export default {
  name: 'CognitiveLoadQuestionnaire',
  props: {
    visible: { type: Boolean, default: false },
    taskId: { type: String, default: '' },
    sessionId: { type: String, default: '' },
    source: { type: String, default: 'patient_education' }
  },
  data() {
    return {
      questions: QUESTIONNAIRE_ITEMS,
      answers: {}
    }
  },
  computed: {
    dialogVisible: {
      get() { return this.visible },
      set(v) { this.$emit('update:visible', v) }
    }
  },
  watch: {
    visible(v) {
      if (v) {
        this.answers = {}
        this.questions.forEach(q => { this.$set(this.answers, q.id, null) })
      }
    }
  },
  methods: {
    handleSkip() {
      this.dialogVisible = false
      this.$emit('skip')
    },
    handleSubmit() {
      const list = this.questions.map(q => ({ qid: q.id, value: this.answers[q.id] })).filter(a => a.value != null)
      if (list.length) {
        recordQuestionnaire(this.taskId, this.sessionId, this.source, list)
      }
      this.dialogVisible = false
      this.$emit('submit', list)
    },
    handleClose() {
      this.$emit('close')
    }
  }
}
</script>

<style scoped>
.questionnaire-desc {
  color: rgba(255,255,255,0.85);
  margin-bottom: 16px;
  font-size: 14px;
}
.questionnaire-item {
  margin-bottom: 16px;
}
.questionnaire-label {
  margin-bottom: 8px;
  font-size: 14px;
  color: #00f5d4;
}
.questionnaire-options {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
</style>
