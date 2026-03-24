<template>
  <div class="patient-edu-page">
    <!-- 左侧：生成面板 -->
    <div class="patient-edu-left">
      <div class="panel-card">
        <h3 class="panel-title">患者教育生成</h3>
        <p class="panel-subtitle">
          输入一个你关心的主题，或从下方一键选择认知照护预设主题：
        </p>
        <div class="preset-topics">
          <span class="preset-label">认知照护预设：</span>
          <el-button
            v-for="(preset, idx) in presetTopics"
            :key="idx"
            size="small"
            type="primary"
            plain
            class="preset-topic-btn"
            @click="topic = preset"
          >
            {{ preset }}
          </el-button>
        </div>
        <el-input
          v-model="topic"
          type="textarea"
          :rows="3"
          placeholder="例如：轻度认知障碍老人居家注意事项、认知障碍老人服药提醒要点……"
          resize="none"
        />

        <div class="panel-options">
          <el-checkbox v-model="enableImages">
            为每个小节生成一张插图（GLM-Image）
          </el-checkbox>
        </div>

        <div class="panel-actions">
          <el-button
            type="primary"
            class="app-btn app-btn-primary panel-action-btn"
            :disabled="!topic.trim() || loading"
            :loading="loading"
            @click="handleGenerate"
          >
            <i class="el-icon-magic-stick" v-if="!loading"></i>
            <span v-if="!loading">生成患者教育</span>
            <span v-else>生成中，请稍候...</span>
          </el-button>
          <el-button
            type="success"
            class="panel-action-btn save-btn"
            :disabled="!patientEdu"
            @click="handleSave"
          >
            <i class="el-icon-collection"></i>
            保存到我的患者教育
          </el-button>
        </div>

        <div class="panel-tips">
          <p>说明：</p>
          <ul>
            <li>内容基于知识图谱 + 文献 + 大模型生成，仅供参考，请遵医嘱。</li>
            <li>插图由 GLM-Image 生成，用于辅助理解，不代表真实病例。</li>
          </ul>
        </div>
      </div>
    </div>

    <!-- 中间：当前患者教育预览 -->
    <div class="patient-edu-main">
      <div class="panel-card patient-edu-preview" v-if="patientEdu">
        <h2 class="edu-title">{{ patientEdu.title }}</h2>

        <!-- 切换呈现：长文 / 分步 / 卡片（M8） -->
        <div class="edu-display-mode">
          <span class="edu-mode-label">呈现模式：</span>
          <el-radio-group v-model="displayMode" size="small" @change="onDisplayModeChange">
            <el-radio-button label="long">
              长文<span v-if="recommendedMode === 'long'" class="mode-rec-badge">推荐</span>
            </el-radio-button>
            <el-radio-button label="step">
              分步<span v-if="recommendedMode === 'step'" class="mode-rec-badge">推荐</span>
            </el-radio-button>
            <el-radio-button label="card">
              卡片<span v-if="recommendedMode === 'card'" class="mode-rec-badge">推荐</span>
            </el-radio-button>
          </el-radio-group>
          <span v-if="recommendedReason && recommendedReason !== 'default' && recommendedReason !== 'no_data'" class="edu-adapt-hint">
            <i class="el-icon-magic-stick"></i> {{ adaptHintText }}
          </span>
        </div>

        <!-- 长文模式（M15：支持分步展开，默认只显示第一条） -->
        <template v-if="displayMode === 'long'">
          <div
            v-for="(sec, idx) in visibleSections"
            :key="idx"
            class="edu-section"
          >
            <h3 class="edu-heading">{{ sec.heading }}</h3>
            <div class="edu-body">
              <div class="edu-text" v-html="formatContent(sec.content)"></div>
              <div
                v-if="sectionImageMap[idx]"
                class="edu-image-wrapper"
              >
                <img
                  :src="sectionImageMap[idx].url"
                  class="edu-image"
                  alt="患者教育插图"
                />
              </div>
            </div>
          </div>
          <div v-if="hasMoreSections" class="edu-expand-row">
            <el-button type="primary" plain size="medium" @click="expandNextSection">
              <i class="el-icon-arrow-down"></i> 展开下一步
            </el-button>
          </div>
          <div class="edu-summary" v-if="patientEdu.summary && !hasMoreSections">
            <div class="edu-summary-label">温馨提示</div>
            <div class="edu-summary-text">{{ patientEdu.summary }}</div>
          </div>
          <div class="edu-share" v-if="shareText && !hasMoreSections">
            <div class="edu-share-label">分享文案</div>
            <div class="edu-share-text">{{ shareText }}</div>
          </div>
        </template>

        <!-- 分步模式：一屏只显示当前步 + 下一步 -->
        <template v-else-if="displayMode === 'step'">
          <div class="edu-step-view">
            <div v-if="stepsForDisplay.length" class="edu-step-content">
              <div class="edu-step-number">第 {{ stepIndex + 1 }} 步 / 共 {{ stepsForDisplay.length }} 步</div>
              <div class="edu-step-text">{{ currentStepText }}</div>
              <div class="edu-step-nav">
                <el-button size="medium" :disabled="stepIndex <= 0" @click="onStepBack">
                  上一步
                </el-button>
                <el-button type="primary" size="medium" :disabled="stepIndex >= stepsForDisplay.length - 1" @click="onStepNext">
                  下一步
                </el-button>
              </div>
            </div>
            <div v-else class="edu-step-empty">暂无分步数据，请使用长文模式查看。</div>
          </div>
        </template>

        <!-- 卡片模式：大字号、高对比度块状要点 -->
        <template v-else-if="displayMode === 'card'">
          <div class="edu-cards-view">
            <div
              v-for="(card, idx) in cardsForDisplay"
              :key="idx"
              class="edu-card-block"
            >
              <div class="edu-card-title">{{ card.title }}</div>
              <div class="edu-card-content" v-html="formatContent(card.content)"></div>
            </div>
            <div v-if="patientEdu.summary" class="edu-card-block edu-card-summary">
              <div class="edu-card-title">温馨提示</div>
              <div class="edu-card-content">{{ patientEdu.summary }}</div>
            </div>
          </div>
        </template>

        <div class="edu-actions">
          <el-button size="small" @click="handleReadAloud" :disabled="!patientEdu" :loading="ttsLoading" :type="isTtsPlaying ? 'warning' : 'default'">
            <i :class="isTtsPlaying ? 'el-icon-video-pause' : 'el-icon-headset'" v-if="!ttsLoading"></i>
            {{ isTtsPlaying ? '停止' : '朗读' }}
          </el-button>
          <el-button size="small" @click="copyFullText">
            <i class="el-icon-document-copy"></i> 复制全文
          </el-button>
          <el-button size="small" @click="copyShareText" :disabled="!shareText">
            <i class="el-icon-tickets"></i> 复制分享文案
          </el-button>
          <el-button size="small" @click="printEducation" :disabled="!patientEdu">
            <i class="el-icon-printer"></i> 打印 / 导出
          </el-button>
        </div>
      </div>

      <div v-else class="empty-preview">
        <el-empty description="请输入上方主题并点击「生成患者教育」" />
      </div>
    </div>

    <!-- 右侧：我的患者教育列表 -->
    <div class="patient-edu-right">
      <div class="panel-card">
        <h3 class="panel-title">我的患者教育</h3>
        <div class="edu-list-header">
          <el-button type="text" size="mini" icon="el-icon-refresh" @click="loadMyEducations" :loading="listLoading">
            刷新
          </el-button>
        </div>
        <el-scrollbar class="edu-list-scroll">
          <div
            v-for="item in educationList"
            :key="item.id"
            :class="['edu-list-item', { active: item.id === selectedEducationId }]"
            @click="handleSelectEducation(item)"
          >
            <div class="edu-list-title" :title="item.title">{{ item.title }}</div>
            <div class="edu-list-meta">
              <span class="edu-list-topic" v-if="item.topic">{{ item.topic }}</span>
              <span class="edu-list-time">{{ formatTime(item.created_at) }}</span>
              <span v-if="item.has_images" class="edu-list-tag">含配图</span>
            </div>
          </div>
          <div v-if="!educationList.length && !listLoading" class="edu-list-empty">
            暂无保存的患者教育
          </div>
        </el-scrollbar>
      </div>
    </div>

    <!-- 认知负荷简易问卷（M11）：阅读完成后弹出 -->
    <CognitiveLoadQuestionnaire
      :visible.sync="showQuestionnaire"
      :task-id="currentTaskId"
      session-id=""
      source="patient_education"
    />
  </div>
</template>

<script>
import { mapState } from 'vuex'
import dayjs from 'dayjs'
import { sendMessageToBackend } from '@/api/chat'
import { generatePatientEduImages, savePatientEducation, listPatientEducation, getPatientEducationDetail } from '@/api/patientEducation'
import { synthesizeTTS } from '@/api/multimodal'
import { recordEvent, COGNITIVE_EVENT_TYPES, COGNITIVE_SOURCE, getRecommendedDisplayMode, getReasonLabel } from '@/utils/cognitiveLoad'
import CognitiveLoadQuestionnaire from '@/components/assessment/CognitiveLoadQuestionnaire.vue'

export default {
  name: 'PatientEducationView',
  components: { CognitiveLoadQuestionnaire },
  data() {
    return {
      topic: '',
      presetTopics: [
        '轻度认知障碍老人居家注意事项',
        '认知障碍老人服药提醒要点',
        '复诊前准备与注意事项',
        '家属如何与认知障碍老人沟通'
      ],
      enableImages: true,
      loading: false,
      patientEdu: null, // { title, sections, summary }
      sectionImages: [], // [{ section_index, url, prompt }]
      // 我的患者教育列表
      educationList: [],
      listLoading: false,
      selectedEducationId: null,
      ttsLoading: false,
      ttsAudio: null,
      ttsAudioUrl: null,
      displayMode: 'long', // long | step | card（M8）
      recommendedMode: null, // 调度器推荐的模式
      recommendedReason: '',
      stepIndex: 0,
      visibleSectionCount: 1, // M15 长文分步展开：默认只显示第一条
      // M10/M11 认知负荷：当前任务 id、开始时间、问卷弹窗、结束定时器
      currentTaskId: null,
      taskStartTime: null,
      showQuestionnaire: false,
      taskEndTimer: null
    }
  },
  computed: {
    ...mapState('user', ['isLoggedIn']),
    stepsForDisplay() {
      const pe = this.patientEdu
      if (!pe) return []
      if (Array.isArray(pe.steps) && pe.steps.length) return pe.steps
      // 旧数据无 steps 时从前端简单派生：每小节标题或首句，最多 7 步、每步 30 字
      const steps = []
      const maxLen = 30
      for (const sec of (pe.sections || [])) {
        const title = (sec.heading || '').trim()
        if (title && steps.length < 7) steps.push({ text: title.length > maxLen ? title.slice(0, maxLen) : title })
        const first = (sec.content || '').split(/[。！？\n]/)[0].trim()
        if (first && steps.length < 7) steps.push({ text: first.length > maxLen ? first.slice(0, maxLen) : first })
      }
      return steps.slice(0, 7)
    },
    cardsForDisplay() {
      const pe = this.patientEdu
      if (!pe) return []
      if (Array.isArray(pe.cards) && pe.cards.length) return pe.cards
      return (pe.sections || []).map(s => ({ title: s.heading || '', content: s.content || '' }))
    },
    currentStepText() {
      const steps = this.stepsForDisplay
      if (!steps.length || this.stepIndex < 0 || this.stepIndex >= steps.length) return ''
      const item = steps[this.stepIndex]
      return (item && (item.text || item.content)) || ''
    },
    sectionImageMap() {
      const map = {}
      ;(this.sectionImages || []).forEach(img => {
        if (img && typeof img.section_index === 'number') {
          map[img.section_index] = img
        }
      })
      return map
    },
    shareText() {
      return (this.patientEdu && (this.patientEdu.share_text || this.patientEdu.shareText)) || ''
    },
    visibleSections() {
      const sec = (this.patientEdu && this.patientEdu.sections) || []
      return sec.slice(0, this.visibleSectionCount)
    },
    hasMoreSections() {
      const sec = (this.patientEdu && this.patientEdu.sections) || []
      return this.visibleSectionCount < sec.length
    },
    isTtsPlaying() {
      return this.ttsAudio && !this.ttsAudio.paused
    },
    adaptHintText() {
      const label = getReasonLabel(this.recommendedReason)
      if (!label) return ''
      const modeName = { long: '长文', step: '分步', card: '卡片' }[this.recommendedMode] || ''
      return `${label}，推荐「${modeName}」模式`
    }
  },
  watch: {
    patientEdu(val) {
      this.stepIndex = 0
      this.visibleSectionCount = 1
      // 自适应调度：根据历史认知负荷数据选择最优呈现模式
      const rec = getRecommendedDisplayMode(COGNITIVE_SOURCE.PATIENT_EDUCATION)
      this.recommendedMode = rec.mode
      this.recommendedReason = rec.reason
      if (rec.confidence !== 'low') {
        this.displayMode = rec.mode
        if (val) {
          const label = getReasonLabel(rec.reason)
          const modeName = { long: '长文', step: '分步', card: '卡片' }[rec.mode] || rec.mode
          if (label) {
            this.$nextTick(() => {
              this.$message.info(`${label}，已为您切换到「${modeName}」模式`)
            })
          }
        }
      } else {
        this.displayMode = 'long'
      }
      if (val) this.scheduleTaskEndAndQuestionnaire()
    },
    stepIndex(newVal, oldVal) {
      if (this.displayMode === 'step' && this.stepsForDisplay.length && oldVal !== undefined && newVal !== oldVal) {
        recordEvent(COGNITIVE_EVENT_TYPES.STEP_VIEW, {
          task_id: this.currentTaskId,
          source: COGNITIVE_SOURCE.PATIENT_EDUCATION,
          step_index: newVal,
          total_steps: this.stepsForDisplay.length
        })
      }
    }
  },
  created() {
    if (this.isLoggedIn) {
      this.loadMyEducations()
    }
  },
  beforeDestroy() {
    this.stopTts()
    if (this.taskEndTimer) clearTimeout(this.taskEndTimer)
  },
  methods: {
    ensureLoggedIn() {
      if (this.isLoggedIn) return true
      this.$message.warning('请先登录后再使用患者教育功能')
      this.$router.push({ path: '/login', query: { redirect: this.$route.fullPath } })
      return false
    },
    formatTime(ts) {
      if (!ts) return ''
      // 兼容时间戳 / 字符串
      return dayjs(ts).format('MM-DD HH:mm')
    },
    onDisplayModeChange() {
      this.stepIndex = 0
      if (this.currentTaskId) {
        recordEvent(COGNITIVE_EVENT_TYPES.CLICK, {
          task_id: this.currentTaskId,
          source: COGNITIVE_SOURCE.PATIENT_EDUCATION,
          target: 'switch_mode'
        })
      }
    },
    expandNextSection() {
      const total = (this.patientEdu && this.patientEdu.sections && this.patientEdu.sections.length) || 0
      if (this.visibleSectionCount < total) this.visibleSectionCount++
    },
    onStepBack() {
      const fromStep = this.stepIndex
      this.stepIndex = Math.max(0, this.stepIndex - 1)
      recordEvent(COGNITIVE_EVENT_TYPES.BACK, {
        task_id: this.currentTaskId,
        source: COGNITIVE_SOURCE.PATIENT_EDUCATION,
        from_step: fromStep,
        to_step: this.stepIndex
      })
    },
    onStepNext() {
      this.stepIndex = Math.min(this.stepsForDisplay.length - 1, this.stepIndex + 1)
      recordEvent(COGNITIVE_EVENT_TYPES.CLICK, {
        task_id: this.currentTaskId,
        source: COGNITIVE_SOURCE.PATIENT_EDUCATION,
        target: 'next_step'
      })
    },
    scheduleTaskEndAndQuestionnaire() {
      if (this.taskEndTimer) clearTimeout(this.taskEndTimer)
      this.taskEndTimer = setTimeout(() => {
        this.taskEndTimer = null
        if (!this.currentTaskId || !this.taskStartTime) return
        recordEvent(COGNITIVE_EVENT_TYPES.TASK_END, {
          task_id: this.currentTaskId,
          source: COGNITIVE_SOURCE.PATIENT_EDUCATION,
          duration_ms: Date.now() - this.taskStartTime,
          view_mode: this.displayMode
        })
        this.$root.$emit('emotional-feedback', { type: 'edu_done' })
        this.showQuestionnaire = true
      }, 5000)
    },

    async handleGenerate() {
      if (!this.ensureLoggedIn()) return
      if (!this.topic.trim()) return
      if (this.taskEndTimer) clearTimeout(this.taskEndTimer)
      this.taskEndTimer = null
      this.currentTaskId = 'pe_' + Date.now()
      this.taskStartTime = Date.now()
      recordEvent(COGNITIVE_EVENT_TYPES.TASK_START, {
        task_id: this.currentTaskId,
        source: COGNITIVE_SOURCE.PATIENT_EDUCATION,
        topic: this.topic.trim()
      })
      this.loading = true
      this.patientEdu = null
      this.sectionImages = []
      try {
        // 1. 生成患者教育文字（调用已有 Agent 接口，intent=patient_education）
        const res = await sendMessageToBackend({
          question: this.topic.trim(),
          session_id: null,
          deep_think: false,
          intent: 'patient_education'
        })
        const data = res.data || {}
        const pe = data.patient_education || null
        if (!pe || !pe.title || !Array.isArray(pe.sections)) {
          this.$message.error('患者教育内容生成失败，请稍后重试。')
          return
        }
        this.patientEdu = pe

        // 2. 可选：为每个小节生成插图
        if (this.enableImages) {
          try {
            const imgRes = await generatePatientEduImages({
              title: pe.title,
              sections: pe.sections.map(s => ({
                heading: s.heading,
                content: s.content
              }))
            })
            const imgs = (imgRes.data && imgRes.data.images) || []
            this.sectionImages = imgs
          } catch (e) {
            console.error('患者教育配图生成失败', e)
            this.$message.warning('文字已生成，配图生成失败或暂不可用。')
          }
        }
      } catch (e) {
        console.error('患者教育生成失败', e)
        this.$message.error(e?.message || '生成失败，请稍后重试。')
      } finally {
        this.loading = false
      }
    },

    async handleSave() {
      if (!this.ensureLoggedIn()) return
      if (!this.patientEdu) return
      try {
        const res = await savePatientEducation({
          topic: this.topic || this.patientEdu.title || '',
          patient_education: this.patientEdu,
          images: this.sectionImages
        })
        const data = res.data || {}
        this.$message.success('已保存到我的患者教育')
        // 简单刷新列表
        this.loadMyEducations()
        this.selectedEducationId = data.id || null
      } catch (e) {
        console.error('保存患者教育失败', e)
        this.$message.error(e?.message || '保存失败，请稍后重试。')
      }
    },

    async loadMyEducations() {
      if (!this.isLoggedIn) {
        this.educationList = []
        return
      }
      this.listLoading = true
      try {
        const res = await listPatientEducation({ limit: 50, offset: 0 })
        const items = (res.data && res.data.items) || []
        this.educationList = items
      } catch (e) {
        console.error('获取患者教育列表失败', e)
      } finally {
        this.listLoading = false
      }
    },

    async handleSelectEducation(item) {
      if (!this.ensureLoggedIn()) return
      if (!item || !item.id) return
      this.selectedEducationId = item.id
      try {
        const res = await getPatientEducationDetail(item.id)
        const data = res.data || {}
        const pe = data.patient_education || data.patientEducation || null
        if (pe && Array.isArray(pe.sections)) {
          this.patientEdu = pe
          this.topic = data.topic || pe.title || ''
          this.sectionImages = data.images || []
        } else {
          this.$message.error('患者教育记录格式异常')
        }
      } catch (e) {
        console.error('加载患者教育详情失败', e)
        this.$message.error('加载详情失败，请稍后重试。')
      }
    },

    formatContent(text) {
      if (!text) return ''
      const esc = s =>
        String(s || '')
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
      const lines = String(text).split('\n').map(esc)
      return lines
        .map(line => (line.trim() ? `<p class="edu-paragraph">${line}</p>` : '<p class="edu-paragraph">&nbsp;</p>'))
        .join('')
    },

    getFullText() {
      if (!this.patientEdu) return ''
      const { title, sections, summary } = this.patientEdu
      let text = title + '\n\n'
      ;(sections || []).forEach(sec => {
        if (sec.heading) text += sec.heading + '\n'
        if (sec.content) text += sec.content + '\n\n'
      })
      if (summary) {
        text += '【温馨提示】\n' + summary
      }
      return text
    },

    stopTts() {
      if (this.ttsAudio) {
        this.ttsAudio.pause()
        this.ttsAudio.currentTime = 0
        if (this.ttsAudioUrl) {
          URL.revokeObjectURL(this.ttsAudioUrl)
          this.ttsAudioUrl = null
        }
        this.ttsAudio = null
        this.$message.info('已停止朗读')
      }
    },

    async handleReadAloud() {
      if (this.isTtsPlaying) {
        this.stopTts()
        return
      }
      // M17：分步模式下只朗读当前步，长文/卡片模式朗读全文
      const text = this.displayMode === 'step' && this.currentStepText
        ? this.currentStepText.trim()
        : this.getFullText()
      if (!text || !text.trim()) return
      this.ttsLoading = true
      try {
        const blob = await synthesizeTTS({ text: text.trim() })
        const url = URL.createObjectURL(blob)
        this.ttsAudioUrl = url
        if (this.ttsAudio) this.stopTts()
        const audio = new Audio(url)
        this.ttsAudio = audio
        audio.onended = () => {
          if (this.ttsAudioUrl) {
            URL.revokeObjectURL(this.ttsAudioUrl)
            this.ttsAudioUrl = null
          }
          this.ttsAudio = null
        }
        audio.onerror = () => {
          this.$message.error('播放失败')
          if (this.ttsAudioUrl) {
            URL.revokeObjectURL(this.ttsAudioUrl)
            this.ttsAudioUrl = null
          }
          this.ttsAudio = null
        }
        await audio.play()
        this.$message.success('开始朗读')
      } catch (e) {
        this.$message.error(e?.message || '朗读失败，请稍后重试')
      } finally {
        this.ttsLoading = false
      }
    },

    copyFullText() {
      const text = this.getFullText()
      if (!text) return
      const ta = document.createElement('textarea')
      ta.value = text
      document.body.appendChild(ta)
      ta.select()
      try {
        document.execCommand('copy')
        this.$message.success('已复制到剪贴板')
      } catch (_) {
        this.$message.error('复制失败，请手动选择文本复制')
      } finally {
        document.body.removeChild(ta)
      }
    },

    copyShareText() {
      const text = this.shareText
      if (!text) return
      const ta = document.createElement('textarea')
      ta.value = text
      document.body.appendChild(ta)
      ta.select()
      try {
        document.execCommand('copy')
        this.$message.success('分享文案已复制')
      } catch (_) {
        this.$message.error('复制失败，请手动选择文本复制')
      } finally {
        document.body.removeChild(ta)
      }
    },

    printEducation() {
      if (!this.patientEdu) return
      const main = this.$el.querySelector('.patient-edu-main')
      if (!main) return
      const html = main.innerHTML
      const win = window.open('', '_blank')
      if (!win) return
      win.document.write(`
        <html>
          <head>
            <meta charset="utf-8" />
            <title>${this.patientEdu.title || '患者教育'}</title>
            <style>
              body { font-family: -apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif; padding: 24px; }
              .panel-card { box-shadow: none; border: none; background: #fff; color: #000; }
              .edu-image { max-width: 260px; }
              h2,h3 { color: #000; }
            </style>
          </head>
          <body>${html}</body>
        </html>
      `)
      win.document.close()
      win.focus()
      win.print()
      // 有的浏览器不允许立即关闭，这里不强制
    }
  }
}
</script>

<style scoped>
.patient-edu-page {
  display: flex;
  height: calc(100vh - 140px);
  gap: 20px;
}

.patient-edu-left {
  width: 340px;
  flex-shrink: 0;
}

.patient-edu-main {
  flex: 1;
  min-width: 0;
}

.patient-edu-right {
  width: 320px;
  flex-shrink: 0;
}

.panel-card {
  background: rgba(10, 14, 39, 0.9);
  border-radius: 16px;
  padding: 20px 20px 16px;
  border: 1px solid rgba(0, 245, 212, 0.25);
  box-shadow: 0 8px 24px rgba(0, 245, 212, 0.15);
  height: 100%;
  display: flex;
  flex-direction: column;
}

.panel-title {
  font-size: 18px;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 6px;
}

.panel-subtitle {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 12px;
}

.panel-example {
  color: #00f5d4;
}

.preset-topics {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}
.preset-label {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.8);
  white-space: nowrap;
}
.preset-topic-btn {
  margin: 0;
}

.panel-options {
  margin-top: 12px;
}

.panel-actions {
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.panel-action-btn {
  width: 100%;
}

.save-btn {
  margin-left: 0;
}

.panel-tips {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  margin-top: 16px;
}

.panel-tips ul {
  padding-left: 18px;
  margin: 4px 0 0;
}

.panel-tips li {
  margin: 2px 0;
}

.patient-edu-preview {
  overflow-y: auto;
}

.edu-title {
  font-size: 20px;
  font-weight: 600;
  color: #00f5d4;
  margin-bottom: 16px;
}

.edu-display-mode {
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 10px;
}
.edu-mode-label {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.8);
}
.mode-rec-badge {
  display: inline-block;
  margin-left: 4px;
  padding: 0 5px;
  font-size: 10px;
  line-height: 16px;
  border-radius: 8px;
  background: linear-gradient(135deg, #00f5d4, #00bbf9);
  color: #0a0e27;
  font-weight: 700;
  vertical-align: middle;
}
.edu-adapt-hint {
  font-size: 12px;
  color: #00f5d4;
  margin-left: 6px;
  white-space: nowrap;
}
.edu-adapt-hint .el-icon-magic-stick {
  margin-right: 2px;
}

.edu-step-view {
  min-height: 120px;
  padding: 16px 0;
}
.edu-step-content {
  text-align: center;
}
.edu-step-number {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 12px;
}
.edu-step-text {
  font-size: var(--font-size-lg, 20px);
  line-height: var(--line-height-relaxed, 1.6);
  color: #fff;
  margin-bottom: 24px;
  padding: 16px;
  background: rgba(0, 245, 212, 0.08);
  border-radius: 8px;
  max-width: 100%;
}
.edu-step-nav {
  display: flex;
  justify-content: center;
  gap: 12px;
}
.edu-step-empty {
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
  padding: 24px;
}

.edu-cards-view {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.edu-card-block {
  padding: 20px;
  background: rgba(0, 245, 212, 0.08);
  border-radius: 10px;
  border: 1px solid rgba(0, 245, 212, 0.25);
}
.edu-card-title {
  font-size: var(--font-size-lg, 18px);
  font-weight: 600;
  color: #00f5d4;
  margin-bottom: 10px;
}
.edu-card-content {
  font-size: var(--font-size-base, 16px);
  line-height: var(--line-height-relaxed, 1.6);
  color: rgba(255, 255, 255, 0.95);
}
.edu-card-summary .edu-card-title {
  color: #00f5d4;
}

.edu-expand-row {
  margin-top: 16px;
  margin-bottom: 16px;
}

.edu-section {
  margin-bottom: 18px;
  padding-bottom: 14px;
  border-bottom: 1px dashed rgba(0, 245, 212, 0.25);
}

.edu-heading {
  font-size: var(--font-size-base, 16px);
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 8px;
}

.edu-body {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.edu-text {
  flex: 2;
  color: rgba(255, 255, 255, 0.9);
  font-size: var(--font-size-base, 16px);
  line-height: var(--line-height-base, 1.6);
}

.edu-paragraph {
  margin: 0 0 4px;
}

.edu-image-wrapper {
  flex: 1;
  max-width: 220px;
}

.edu-image {
  width: 100%;
  border-radius: 10px;
  border: 1px solid rgba(0, 245, 212, 0.4);
  box-shadow: 0 4px 12px rgba(0, 245, 212, 0.35);
  object-fit: cover;
}

.edu-summary {
  margin-top: 12px;
  padding: 10px 12px;
  border-radius: 10px;
  background: rgba(0, 245, 212, 0.08);
  border-left: 3px solid #00f5d4;
}

.edu-summary-label {
  font-size: 13px;
  font-weight: 600;
  color: #00f5d4;
  margin-bottom: 4px;
}

.edu-summary-text {
  font-size: var(--font-size-base, 16px);
  color: rgba(255, 255, 255, 0.9);
}

.edu-share {
  margin-top: 12px;
  padding: 10px 12px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.04);
  border-left: 3px solid rgba(0, 187, 249, 0.7);
}

.edu-share-label {
  font-size: 13px;
  font-weight: 600;
  color: #00bbf9;
  margin-bottom: 4px;
}

.edu-share-text {
  font-size: var(--font-size-base, 16px);
  color: rgba(255, 255, 255, 0.9);
}

.edu-actions {
  margin-top: 16px;
}

.empty-preview {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.edu-list-header {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 8px;
}

.edu-list-scroll {
  flex: 1;
}

.edu-list-item {
  padding: 8px 10px;
  border-radius: 10px;
  margin-bottom: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: rgba(255, 255, 255, 0.02);
}

.edu-list-item:hover {
  background: rgba(0, 245, 212, 0.08);
}

.edu-list-item.active {
  background: linear-gradient(135deg, rgba(0, 245, 212, 0.3), rgba(0, 187, 249, 0.3));
}

.edu-list-title {
  font-size: 14px;
  color: #ffffff;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.edu-list-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 8px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
}

.edu-list-topic {
  flex: 1 1 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.edu-list-time {
  opacity: 0.8;
}

.edu-list-tag {
  padding: 1px 6px;
  border-radius: 10px;
  background: rgba(0, 245, 212, 0.18);
  color: #00f5d4;
}

.edu-list-empty {
  margin-top: 20px;
  text-align: center;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
}

@media (max-width: 1024px) {
  .patient-edu-page {
    flex-direction: column;
    height: auto;
  }
  .patient-edu-left {
    width: 100%;
  }
  .patient-edu-main {
    height: auto;
  }
  .patient-edu-right {
    width: 100%;
    margin-top: 10px;
  }
  .panel-card {
    height: auto;
  }
}

@media (max-width: 768px) {
  .edu-body {
    flex-direction: column;
  }
  .edu-image-wrapper {
    max-width: 100%;
  }
}
</style>

