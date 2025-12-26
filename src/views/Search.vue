<template>
  <div class="search-page">
    <!-- 搜索区域 -->
    <div class="search-section">
      <div class="search-container">
        <h1 class="app-title">实体搜索</h1>
        <div class="search-bar-wrapper">
          <el-input
            v-model="searchQuery"
            placeholder="输入疾病、症状、药物或其他医疗实体..."
            class="search-input"
            size="large"
            clearable
            @keyup.enter.native="handleSearch"
          >
            <el-button
              slot="append"
              type="primary"
              icon="el-icon-search"
              @click="handleSearch"
              class="search-btn"
            ></el-button>
          </el-input>
          
          <!-- 搜索类型筛选 -->
          <div class="search-filters">
            <el-radio-group v-model="searchType" class="filter-group">
              <el-radio-button label="all">全部类型</el-radio-button>
              <el-radio-button label="disease">疾病</el-radio-button>
              <el-radio-button label="symptom">症状</el-radio-button>
              <el-radio-button label="drug">药物</el-radio-button>
              <el-radio-button label="treatment">治疗</el-radio-button>
            </el-radio-group>
          </div>
        </div>
        
        <!-- 热门搜索 -->
        <div class="hot-searches">
          <span class="hot-label">热门搜索：</span>
          <el-tag
            v-for="tag in hotSearchTags"
            :key="tag"
            type="info"
            @click="searchQuery = tag; handleSearch()"
            class="hot-tag"
          >
            {{ tag }}
          </el-tag>
        </div>
      </div>
    </div>
    
    <!-- 结果区域 -->
    <div class="results-section" v-if="searchResults.length > 0">
      <div class="results-header">
        <h2 class="results-title">
          搜索结果 <span class="result-count">({{ searchResults.length }})</span>
        </h2>
        <el-select
          v-model="sortBy"
          placeholder="排序方式"
          class="sort-select"
          size="small"
        >
          <el-option label="相关度" value="relevance"></el-option>
          <el-option label="名称A-Z" value="name_asc"></el-option>
          <el-option label="名称Z-A" value="name_desc"></el-option>
        </el-select>
      </div>
      
      <!-- 搜索结果列表 -->
      <div class="results-list">
        <el-card
          v-for="result in searchResults"
          :key="result.id"
          class="result-card"
          shadow="hover"
          @click="showEntityDetail(result)"
        >
          <div class="result-content">
            <div class="result-header">
              <h3 class="entity-name">{{ result.name }}</h3>
              <el-tag
                :type="getTagType(result.type)"
                size="small"
                class="entity-type-tag"
              >
                {{ getTypeName(result.type) }}
              </el-tag>
            </div>
            
            <p class="entity-summary">{{ result.summary || '暂无描述信息' }}</p>
            
            <div class="entity-details">
              <el-button
                type="primary"
                size="small"
                icon="el-icon-info"
                class="detail-btn"
                @click.stop="showEntityDetail(result)"
              >
                查看详情
              </el-button>
              <el-button
                type="success"
                size="small"
                icon="el-icon-connection"
                class="graph-btn"
                @click.stop="viewInGraph(result.id)"
              >
                查看关联
              </el-button>
            </div>
          </div>
        </el-card>
      </div>
      
      <!-- 分页 -->
      <div class="pagination" v-if="totalResults > pageSize">
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="currentPage"
          :page-sizes="[10, 20, 50, 100]"
          :page-size="pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="totalResults"
        ></el-pagination>
      </div>
    </div>
    
    <!-- 空状态 -->
    <div class="empty-state" v-else-if="searchQuery && !isLoading">
      <el-empty
        description="暂无搜索结果"
        class="empty-search"
      >
        <el-button type="primary" @click="resetSearch">重新搜索</el-button>
      </el-empty>
    </div>
    
    <!-- 实体详情弹窗 -->
    <el-dialog
      v-model="showDetail"
      :title="selectedEntity ? selectedEntity.name : '实体详情'"
      width="80%"
      class="entity-detail-dialog"
    >
      <div class="entity-detail-content" v-if="selectedEntity">
        <div class="detail-header">
          <h3 class="detail-title">{{ selectedEntity.name }}</h3>
          <el-tag
            :type="getTagType(selectedEntity.type)"
            class="detail-type-tag"
          >
            {{ getTypeName(selectedEntity.type) }}
          </el-tag>
        </div>
        
        <!-- 实体基本信息 -->
        <div class="detail-info">
          <p class="detail-summary">{{ selectedEntity.summary || '暂无描述信息' }}</p>
          
          <!-- 实体属性 -->
          <div class="entity-properties">
            <h4 class="properties-title">基本属性</h4>
            <el-descriptions :column="2" border>
              <el-descriptions-item label="中文名称">{{ selectedEntity.name }}</el-descriptions-item>
              <el-descriptions-item label="英文名称">{{ selectedEntity.englishName || '-' }}</el-descriptions-item>
              <el-descriptions-item label="编码">{{ selectedEntity.code || '-' }}</el-descriptions-item>
              <el-descriptions-item label="分类">{{ selectedEntity.category || '-' }}</el-descriptions-item>
            </el-descriptions>
          </div>
          
          <!-- 实体关联 -->
          <div class="entity-relations">
            <h4 class="relations-title">关联实体</h4>
            <div class="relations-grid">
              <el-tag
                v-for="(relation, index) in selectedEntity.relations.slice(0, 10)"
                :key="index"
                class="relation-tag"
                @click="viewRelationEntity(relation.targetId)"
              >
                {{ relation.targetName }} <span class="relation-type">({{ relation.type }})</span>
              </el-tag>
              <el-tag v-if="selectedEntity.relations.length > 10" type="info">
                共 {{ selectedEntity.relations.length }} 个关联实体
              </el-tag>
            </div>
          </div>
        </div>
        
        <!-- 操作按钮 -->
        <div class="detail-actions">
          <el-button type="primary" @click="viewInGraph(selectedEntity.id)">
            <i class="el-icon-connection"></i> 查看图谱
          </el-button>
          <el-button @click="addRelation"><i class="el-icon-plus"></i> 添加关联</el-button>
          <el-button @click="editEntity"><i class="el-icon-edit"></i> 编辑</el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'SearchPage',
  data() {
    return {
      searchQuery: '',
      searchType: 'all',
      searchResults: [],
      isLoading: false,
      selectedEntity: null,
      showDetail: false,
      currentPage: 1,
      pageSize: 10,
      totalResults: 0,
      sortBy: 'relevance',
      hotSearchTags: ['糖尿病', '高血压', '感冒', '阿司匹林', '头痛', '肺炎'],
      // 模拟搜索结果数据
      mockResults: [
        {
          id: '1',
          name: '糖尿病',
          type: 'disease',
          summary: '一种以高血糖为特征的代谢性疾病，长期高血糖会导致各种组织损伤。',
          englishName: 'Diabetes Mellitus',
          code: 'E11',
          category: '慢性疾病',
          relations: [
            { targetId: '2', targetName: '胰岛素', type: '治疗药物' },
            { targetId: '3', targetName: '高血糖', type: '症状' },
            { targetId: '4', targetName: '视网膜病变', type: '并发症' }
          ]
        },
        {
          id: '2',
          name: '胰岛素',
          type: 'drug',
          summary: '一种由胰腺分泌的激素，主要作用是调节血糖水平。',
          englishName: 'Insulin',
          code: 'H01AB',
          category: '激素及相关药物',
          relations: [
            { targetId: '1', targetName: '糖尿病', type: '适应症' }
          ]
        },
        {
          id: '3',
          name: '高血压',
          type: 'disease',
          summary: '以体循环动脉血压增高为主要特征的临床综合征，可伴有心、脑、肾等器官的功能或器质性损害。',
          englishName: 'Hypertension',
          code: 'I10',
          category: '心血管疾病',
          relations: [
            { targetId: '5', targetName: '头痛', type: '症状' },
            { targetId: '6', targetName: '硝苯地平', type: '治疗药物' }
          ]
        },
        {
          id: '4',
          name: '阿司匹林',
          type: 'drug',
          summary: '一种历史悠久的解热镇痛药，也用于预防心血管疾病。',
          englishName: 'Aspirin',
          code: 'B01AC06',
          category: '非甾体抗炎药',
          relations: [
            { targetId: '7', targetName: '头痛', type: '适应症' },
            { targetId: '8', targetName: '发热', type: '适应症' }
          ]
        },
        {
          id: '5',
          name: '头痛',
          type: 'symptom',
          summary: '头部疼痛是常见的症状，可由多种原因引起。',
          englishName: 'Headache',
          code: 'R51',
          category: '神经系统症状',
          relations: [
            { targetId: '3', targetName: '高血压', type: '病因' },
            { targetId: '4', targetName: '阿司匹林', type: '治疗药物' }
          ]
        },
        {
          id: '6',
          name: '肺炎',
          type: 'disease',
          summary: '肺部的炎症，通常由细菌、病毒或真菌引起。',
          englishName: 'Pneumonia',
          code: 'J18',
          category: '呼吸系统疾病',
          relations: [
            { targetId: '9', targetName: '咳嗽', type: '症状' },
            { targetId: '10', targetName: '发热', type: '症状' }
          ]
        }
      ]
    };
  },
  methods: {
    // 处理搜索
    handleSearch() {
      if (!this.searchQuery.trim()) {
        this.$message.warning('请输入搜索关键词');
        return;
      }
      
      this.isLoading = true;
      
      // 模拟API请求
      setTimeout(() => {
        // 过滤搜索结果
        let results = this.mockResults.filter(item => {
          const matchesQuery = item.name.includes(this.searchQuery) || 
                              item.summary.includes(this.searchQuery);
          const matchesType = this.searchType === 'all' || item.type === this.searchType;
          return matchesQuery && matchesType;
        });
        
        this.searchResults = results;
        this.totalResults = results.length;
        this.isLoading = false;
        
        // 页面滚动到结果区域
        this.$nextTick(() => {
          document.querySelector('.results-section')?.scrollIntoView({ behavior: 'smooth' });
        });
      }, 500);
    },
    
    // 查看实体详情
    showEntityDetail(entity) {
      this.selectedEntity = entity;
      this.showDetail = true;
    },
    
    // 在图谱中查看
    viewInGraph(entityId) {
      this.$router.push({ path: '/graph', query: { entityId } });
    },
    
    // 查看关联实体
    viewRelationEntity(targetId) {
      const entity = this.mockResults.find(item => item.id === targetId);
      if (entity) {
        this.selectedEntity = entity;
      }
    },
    
    // 获取类型名称
    getTypeName(type) {
      const typeMap = {
        disease: '疾病',
        symptom: '症状',
        drug: '药物',
        treatment: '治疗'
      };
      return typeMap[type] || type;
    },
    
    // 获取标签类型
    getTagType(type) {
      const typeMap = {
        disease: 'danger',
        symptom: 'warning',
        drug: 'success',
        treatment: 'info'
      };
      return typeMap[type] || 'info';
    },
    
    // 分页大小改变
    handleSizeChange(size) {
      this.pageSize = size;
    },
    
    // 当前页改变
    handleCurrentChange(current) {
      this.currentPage = current;
    },
    
    // 重置搜索
    resetSearch() {
      this.searchQuery = '';
      this.searchResults = [];
      this.totalResults = 0;
      this.currentPage = 1;
    },
    
    // 添加关联
    addRelation() {
      this.$message.info('添加关联功能开发中');
    },
    
    // 编辑实体
    editEntity() {
      this.$message.info('编辑实体功能开发中');
    }
  }
};
</script>

<style scoped>
.search-page {
  min-height: 100%;
  padding: 20px;
  position: relative;
}

/* 搜索区域 */
.search-section {
  margin-bottom: 30px;
  animation: fadeInUp 0.5s ease-out;
}

.search-container {
  max-width: 800px;
  margin: 0 auto;
  text-align: center;
}

.search-bar-wrapper {
  margin: 30px 0;
  position: relative;
}

.search-input {
  width: 100%;
  border-radius: 50px;
  background: var(--bg-card);
  border: 2px solid var(--border-primary);
  transition: all 0.3s ease;
  font-size: 18px;
  padding: 15px 20px;
}

.search-input:focus {
  border-color: var(--primary-blue);
  box-shadow: 0 0 20px rgba(0, 212, 255, 0.3);
}

.search-btn {
  background: var(--gradient-main);
  border-radius: 50px;
  padding: 0 25px;
  font-size: 16px;
  transition: all 0.3s ease;
}

.search-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 0 15px rgba(102, 126, 234, 0.5);
}

.search-filters {
  margin-top: 20px;
}

.filter-group {
  background: var(--bg-card);
  padding: 5px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-primary);
}

/* 热门搜索 */
.hot-searches {
  margin-top: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 10px;
}

.hot-label {
  color: var(--text-secondary);
  font-size: 14px;
}

.hot-tag {
  cursor: pointer;
  transition: all 0.3s ease;
  background: var(--bg-secondary);
  color: var(--text-primary);
  border: 1px solid var(--border-primary);
}

.hot-tag:hover {
  background: var(--primary-blue);
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 0 10px rgba(0, 212, 255, 0.4);
}

/* 结果区域 */
.results-section {
  animation: fadeInUp 0.5s ease-out 0.2s both;
}

.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--border-primary);
}

.results-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary);
}

.result-count {
  color: var(--primary-blue);
  font-size: 16px;
}

.sort-select {
  min-width: 120px;
}

/* 结果列表 */
.results-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.result-card {
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.result-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-card-hover);
  border-color: var(--primary-blue);
}

.result-content {
  padding: 20px;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.entity-name {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.entity-type-tag {
  font-size: 12px;
}

.entity-summary {
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: 15px;
  height: 60px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}

.entity-details {
  display: flex;
  justify-content: space-between;
  gap: 10px;
}

.detail-btn, .graph-btn {
  border-radius: var(--radius-md);
  transition: all 0.3s ease;
}

.detail-btn:hover {
  background: var(--primary-blue-hover);
  transform: scale(1.05);
}

.graph-btn:hover {
  background: var(--accent-cyan);
  transform: scale(1.05);
}

/* 分页 */
.pagination {
  display: flex;
  justify-content: center;
  margin-top: 30px;
}

/* 空状态 */
.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 300px;
  animation: fadeIn 0.5s ease-out;
}

/* 详情弹窗 */
.entity-detail-dialog {
  background: rgba(10, 14, 39, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid var(--border-primary);
}

.entity-detail-content {
  padding: 20px;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.detail-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

.detail-type-tag {
  font-size: 14px;
  padding: 5px 15px;
}

.detail-summary {
  font-size: 16px;
  line-height: 1.8;
  color: var(--text-secondary);
  margin-bottom: 30px;
  padding: 15px;
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  border-left: 4px solid var(--primary-blue);
}

.entity-properties, .entity-relations {
  margin-bottom: 30px;
}

.properties-title, .relations-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 15px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--border-primary);
}

.relations-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.relation-tag {
  cursor: pointer;
  transition: all 0.3s ease;
  background: var(--bg-secondary);
  color: var(--text-primary);
  border: 1px solid var(--border-primary);
}

.relation-tag:hover {
  background: var(--primary-blue);
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 0 10px rgba(0, 212, 255, 0.4);
}

.relation-type {
  color: var(--text-secondary);
  font-size: 12px;
}

.detail-actions {
  display: flex;
  gap: 15px;
  justify-content: flex-end;
  margin-top: 30px;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .search-container {
    max-width: 700px;
  }
  
  .results-list {
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 18px;
  }
}

@media (max-width: 768px) {
  .search-page {
    padding: 10px;
  }
  
  .search-container {
    padding: 0 20px;
    max-width: 100%;
  }
  
  .app-title {
    font-size: 28px;
  }
  
  .search-input {
    font-size: 14px;
    padding: 12px 15px;
  }
  
  .search-btn {
    padding: 0 20px;
    font-size: 14px;
  }
  
  .results-list {
    grid-template-columns: 1fr;
    gap: 15px;
  }
  
  .result-content {
    padding: 15px;
  }
  
  .results-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
  
  .results-title {
    font-size: 18px;
  }
  
  .hot-searches {
    flex-direction: column;
    align-items: flex-start;
    padding: 0 20px;
  }
  
  .detail-actions {
    flex-direction: column;
  }
  
  /* 详情弹窗 */
  .entity-detail-dialog {
    width: 95% !important;
    margin: 10px;
  }
  
  .detail-title {
    font-size: 20px;
  }
  
  .entity-properties .el-descriptions {
    --el-descriptions-column: 1;
  }
}

@media (max-width: 576px) {
  .search-container {
    padding: 0 15px;
  }
  
  .app-title {
    font-size: 24px;
  }
  
  .filter-group {
    width: 100%;
    overflow-x: auto;
    white-space: nowrap;
  }
  
  .el-radio-button {
    flex-shrink: 0;
  }
  
  .hot-searches {
    padding: 0 15px;
  }
  
  .hot-label {
    width: 100%;
    text-align: left;
  }
  
  .entity-name {
    font-size: 16px;
  }
  
  .entity-summary {
    font-size: 14px;
    height: 50px;
    -webkit-line-clamp: 2;
  }
  
  .entity-details {
    flex-direction: column;
  }
  
  .detail-btn, .graph-btn {
    width: 100%;
  }
  
  /* 分页 */
  .pagination {
    padding: 0 15px;
  }
  
  .el-pagination {
    font-size: 12px;
  }
  
  /* 详情弹窗 */
  .entity-detail-content {
    padding: 15px;
  }
  
  .detail-summary {
    font-size: 14px;
  }
  
  .entity-properties, .entity-relations {
    margin-bottom: 20px;
  }
  
  .properties-title, .relations-title {
    font-size: 16px;
  }
  
  .relations-grid {
    gap: 8px;
  }
}

@media (max-width: 420px) {
  .search-page {
    padding: 5px;
  }
  
  .search-container {
    padding: 0 10px;
  }
  
  .app-title {
    font-size: 20px;
  }
  
  .search-input {
    font-size: 13px;
    padding: 10px 12px;
  }
  
  .search-btn {
    padding: 0 15px;
    font-size: 13px;
  }
  
  .result-content {
    padding: 12px;
  }
  
  .hot-tag {
    font-size: 12px;
  }
  
  /* 详情弹窗 */
  .detail-actions {
    gap: 10px;
  }
}
</style>