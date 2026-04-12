<template>
  <div class="upload-progress">
    <el-progress
      :percentage="progress"
      :stroke-width="6"
      :show-text="false"
    ></el-progress>
    <span class="progress-text">{{ progress }}%</span>
  </div>
</template>

<script>
export default {
  name: 'UploadProgress',
  props: {
    progress: {
      type: Number,
      default: 0
    }
  }
};
</script>

<style scoped>
.upload-progress {
  margin-top: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.progress-text {
  font-size: 12px;
  color: #909399;
  min-width: 35px;
}
</style>
