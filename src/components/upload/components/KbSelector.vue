<template>
  <div class="kb-selector">
    <div class="selector-header">
      <span class="label">选择知识库:</span>
      <el-select
        v-model="selectedKb"
        placeholder="请选择知识库"
        size="small"
        class="kb-select"
        @change="handleChange"
      >
        <el-option
          v-for="kb in knowledgeBases"
          :key="kb.id"
          :label="kb.name"
          :value="kb.id"
        ></el-option>
      </el-select>
      <el-button size="small" @click="$emit('refresh')" class="refresh-btn">
        <i class="el-icon-refresh"></i>
      </el-button>
    </div>
    <div class="kb-stats" v-if="selectedKbInfo">
      <span class="stat">
        <i class="el-icon-document"></i>
        {{ selectedKbInfo.docCount || 0 }} 个文档
      </span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'KbSelector',
  props: {
    knowledgeBases: {
      type: Array,
      default: () => []
    },
    value: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      selectedKb: this.value
    };
  },
  computed: {
    selectedKbInfo() {
      return this.knowledgeBases.find(kb => kb.id === this.selectedKb);
    }
  },
  watch: {
    value(newVal) {
      this.selectedKb = newVal;
    }
  },
  methods: {
    handleChange(value) {
      this.$emit('input', value);
      this.$emit('change', value);
    }
  }
};
</script>

<style scoped>
.kb-selector {
  margin-bottom: 16px;
}

.selector-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.label {
  font-size: 14px;
  color: #606266;
}

.kb-select {
  width: 200px;
}

.refresh-btn {
  margin-left: 4px;
}

.kb-stats {
  margin-top: 8px;
  font-size: 12px;
  color: #909399;
}

.stat {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
</style>
