<template>
  <div class="kg-progress">
    <span class="kg-label">生成知识图谱: {{ progress }}%</span>
    <el-progress
      :percentage="progress"
      :stroke-width="4"
      :show-text="false"
      :color="kgProgressColor"
    ></el-progress>
  </div>
</template>

<script>
export default {
  name: 'KgProgress',
  props: {
    progress: {
      type: Number,
      default: 0
    }
  },
  computed: {
    kgProgressColor() {
      if (this.progress < 30) return '#409eff';
      if (this.progress < 70) return '#e6a23c';
      return '#67c23a';
    }
  }
};
</script>

<style scoped>
.kg-progress {
  margin-top: 8px;
}

.kg-label {
  font-size: 12px;
  color: #606266;
  display: block;
  margin-bottom: 4px;
}
</style>
