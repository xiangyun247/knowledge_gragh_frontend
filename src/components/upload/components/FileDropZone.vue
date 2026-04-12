<template>
  <div
    class="drop-zone"
    :class="{ 'dragover': isDragover }"
    @dragover.prevent="handleDragOver"
    @dragleave="handleDragLeave"
    @drop.prevent="handleDrop"
  >
    <input
      ref="fileInput"
      type="file"
      multiple
      accept=".txt,.pdf,.json,.csv,.xml"
      class="file-input"
      @change="handleFileSelect"
    />
    <div class="drop-content">
      <div class="upload-icon">
        <i class="el-icon-upload2"></i>
      </div>
      <h3 class="upload-title">拖拽文件到此处</h3>
      <p class="upload-description">或</p>
      <el-button size="medium" type="primary" @click="triggerFileSelect" class="browse-btn">
        <i class="el-icon-folder-opened"></i> 浏览文件
      </el-button>
      <div class="file-types">
        <span class="file-type">支持格式: TXT, PDF, JSON, CSV</span>
        <span class="file-size">最大文件: 50MB</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'FileDropZone',
  props: {
    isDragover: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      fileInput: null
    };
  },
  mounted() {
    this.fileInput = this.$refs.fileInput;
  },
  methods: {
    triggerFileSelect() {
      this.$refs.fileInput.click();
    },
    handleDragOver(e) {
      this.$emit('dragover', e);
    },
    handleDragLeave(e) {
      this.$emit('dragleave', e);
    },
    handleDrop(e) {
      const files = Array.from(e.dataTransfer.files);
      this.$emit('drop', files);
    },
    handleFileSelect(e) {
      const files = Array.from(e.target.files);
      this.$emit('select', files);
      e.target.value = '';
    }
  }
};
</script>

<style scoped>
.drop-zone {
  border: 2px dashed #d9d9d9;
  border-radius: 8px;
  padding: 40px;
  text-align: center;
  transition: all 0.3s;
  cursor: pointer;
  background: #fafafa;
}

.drop-zone.dragover {
  border-color: #409eff;
  background: #ecf5ff;
}

.file-input {
  display: none;
}

.drop-content {
  pointer-events: none;
}

.upload-icon {
  font-size: 48px;
  color: #909399;
  margin-bottom: 16px;
}

.upload-title {
  font-size: 16px;
  color: #303133;
  margin: 0 0 8px 0;
}

.upload-description {
  font-size: 14px;
  color: #606266;
  margin: 0 0 16px 0;
}

.browse-btn {
  pointer-events: auto;
}

.file-types {
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.file-type,
.file-size {
  font-size: 12px;
  color: #909399;
}
</style>
