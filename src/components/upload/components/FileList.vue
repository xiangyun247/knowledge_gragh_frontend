<template>
  <div class="file-list-section">
    <div class="section-header">
      <h2 class="section-title">文件列表</h2>
      <el-button
        v-if="completedFiles.length > 0"
        size="small"
        type="text"
        @click="$emit('clear-completed')"
        class="clear-btn"
      >
        <i class="el-icon-delete"></i> 清空已完成
      </el-button>
    </div>

    <!-- 上传中文件 -->
    <div class="uploading-files" v-if="uploadingFiles.length > 0">
      <h3 class="list-subtitle">上传中 ({{ uploadingFiles.length }})</h3>
      <div v-for="file in uploadingFiles" :key="file.name + '-' + file.id" class="file-card uploading">
        <FileInfo :file="file" />
        <div class="file-actions">
          <el-button size="small" type="text" @click="$emit('cancel-upload', file)">
            <i class="el-icon-close"></i>
          </el-button>
        </div>
        <UploadProgress :progress="file.progress" />
      </div>
    </div>

    <!-- 已完成文件 -->
    <div class="completed-files" v-if="completedFiles.length > 0">
      <h3 class="list-subtitle">已完成 ({{ completedFiles.length }})</h3>
      <div v-for="file in completedFiles" :key="file.name + '-' + file.id" class="file-card completed">
        <div class="file-info">
          <div class="file-icon">
            <i :class="getFileIcon(file.name)"></i>
            <div class="status-icon" :class="file.success ? 'success' : 'error'">
              <i :class="file.success ? 'el-icon-check' : 'el-icon-close'"></i>
            </div>
          </div>
          <div class="file-details">
            <div class="file-name">{{ file.name }}</div>
            <div class="file-meta">
              <span class="file-size">{{ formatFileSize(file.size) }}</span>
              <span class="file-status" :class="file.success ? 'success' : 'error'">
                {{ file.success ? '成功' : '失败' }}
              </span>
            </div>
            <div class="file-message" v-if="file.message">
              {{ file.message }}
            </div>
          </div>
          <KgProgress v-if="file.generatingKG" :progress="file.kgProgress || 0" />
          <div class="file-actions">
            <el-button v-if="file.success" size="small" type="text" @click="$emit('preview-file', file)">
              <i class="el-icon-view"></i>
            </el-button>
            <el-button size="small" type="text" @click="$emit('remove-file', file)">
              <i class="el-icon-delete"></i>
            </el-button>
          </div>
        </div>
        <span v-if="file.success && file.kbIngested" class="kb-badge">
          已入库 ({{ file.kbChunkCount || 0 }} 块)
        </span>
      </div>
    </div>
  </div>
</template>

<script>
import FileInfo from './FileInfo.vue';
import UploadProgress from './UploadProgress.vue';
import KgProgress from './KgProgress.vue';

export default {
  name: 'FileList',
  components: {
    FileInfo,
    UploadProgress,
    KgProgress
  },
  props: {
    uploadingFiles: {
      type: Array,
      default: () => []
    },
    completedFiles: {
      type: Array,
      default: () => []
    }
  },
  methods: {
    getFileIcon(filename) {
      const ext = filename.split('.').pop().toLowerCase();
      const iconMap = {
        json: 'el-icon-document',
        csv: 'el-icon-table',
        xml: 'el-icon-s-management',
        txt: 'el-icon-document',
        pdf: 'el-icon-document'
      };
      return iconMap[ext] || 'el-icon-file';
    },
    formatFileSize(size) {
      if (!size) return '0 B';
      const units = ['B', 'KB', 'MB', 'GB'];
      let i = 0;
      while (size >= 1024 && i < units.length - 1) {
        size /= 1024;
        i++;
      }
      return `${size.toFixed(1)} ${units[i]}`;
    }
  }
};
</script>

<style scoped>
.file-list-section {
  margin-top: 24px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

.clear-btn {
  color: #909399;
}

.list-subtitle {
  font-size: 14px;
  color: #606266;
  margin: 16px 0 8px 0;
}

.file-card {
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  padding: 12px;
  margin-bottom: 8px;
}

.file-card.uploading {
  opacity: 0.8;
}

.file-info {
  display: flex;
  align-items: flex-start;
}

.file-icon {
  position: relative;
  font-size: 24px;
  color: #409eff;
  margin-right: 12px;
}

.status-icon {
  position: absolute;
  bottom: -4px;
  right: -4px;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
}

.status-icon.success {
  background: #67c23a;
  color: #fff;
}

.status-icon.error {
  background: #f56c6c;
  color: #fff;
}

.file-details {
  flex: 1;
}

.file-name {
  font-size: 14px;
  color: #303133;
  margin-bottom: 4px;
}

.file-meta {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: #909399;
}

.file-status.success {
  color: #67c23a;
}

.file-status.error {
  color: #f56c6c;
}

.file-message {
  font-size: 12px;
  color: #f56c6c;
  margin-top: 4px;
}

.file-actions {
  display: flex;
  gap: 8px;
}

.kb-badge {
  display: inline-block;
  margin-top: 8px;
  padding: 2px 8px;
  font-size: 12px;
  background: #f0f9eb;
  color: #67c23a;
  border-radius: 4px;
}
</style>
