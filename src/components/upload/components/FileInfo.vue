<template>
  <div class="file-info">
    <div class="file-icon">
      <i :class="fileIcon"></i>
    </div>
    <div class="file-details">
      <div class="file-name">{{ file.name }}</div>
      <div class="file-meta">
        <span class="file-size">{{ formatFileSize(file.size) }}</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'FileInfo',
  props: {
    file: {
      type: Object,
      required: true
    }
  },
  computed: {
    fileIcon() {
      const ext = this.file.name.split('.').pop().toLowerCase();
      const iconMap = {
        json: 'el-icon-document',
        csv: 'el-icon-table',
        xml: 'el-icon-s-management',
        txt: 'el-icon-document',
        pdf: 'el-icon-document'
      };
      return iconMap[ext] || 'el-icon-file';
    }
  },
  methods: {
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
.file-info {
  display: flex;
  align-items: center;
  flex: 1;
}

.file-icon {
  font-size: 24px;
  color: #409eff;
  margin-right: 12px;
}

.file-name {
  font-size: 14px;
  color: #303133;
}

.file-size {
  font-size: 12px;
  color: #909399;
}
</style>
