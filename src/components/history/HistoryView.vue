<template>
  <div class="history-page">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1 class="app-title">历史记录</h1>
      <p class="page-subtitle">查看和管理您的知识图谱查询历史</p>
    </div>
    
    <!-- 搜索和筛选 -->
    <div class="search-filter-section">
      <el-card class="filter-card" shadow="hover">
        <div class="filter-content">
          <!-- 搜索框 -->
          <el-input
            v-model="searchKeyword"
            placeholder="搜索历史记录..."
            clearable
            size="large"
            class="search-input"
            @input="debounceSearch"
          >
            <template #prepend>
              <i class="el-icon-search"></i>
            </template>
          </el-input>
          
          <!-- 筛选条件 -->
          <div class="filter-options">
            <!-- 时间范围 -->
            <el-date-picker
              v-model="dateRange"
              type="datetimerange"
              range-separator="至"
              start-placeholder="开始时间"
              end-placeholder="结束时间"
              format="yyyy-MM-dd HH:mm"
              value-format="yyyy-MM-dd HH:mm"
              size="large"
              class="date-filter"
              @change="filterHistory"
            ></el-date-picker>
            
            <!-- 类型筛选 -->
            <el-select
              v-model="typeFilter"
              placeholder="选择记录类型"
              clearable
              size="large"
              class="type-filter"
              @change="filterHistory"
            >
              <el-option label="全部" value=""></el-option>
              <el-option label="问答" value="chat"></el-option>
              <el-option label="实体搜索" value="search"></el-option>
              <el-option label="图谱查询" value="graph_query"></el-option>
              <el-option label="图谱构建" value="graph_build"></el-option>
              <el-option label="数据上传" value="upload"></el-option>
            </el-select>
            
            <!-- 状态筛选 -->
            <el-select
              v-model="statusFilter"
              placeholder="选择状态"
              clearable
              size="large"
              class="status-filter"
              @change="filterHistory"
            >
              <el-option label="全部" value=""></el-option>
              <el-option label="成功" value="success"></el-option>
              <el-option label="失败" value="failed"></el-option>
              <el-option label="进行中" value="processing"></el-option>
            </el-select>
            
            <!-- 批量操作 -->
            <div class="batch-actions">
              <el-button
                type="warning"
                icon="el-icon-refresh"
                @click="resetFilters"
                size="large"
                class="batch-btn"
              >
                重置
              </el-button>
              <el-button
                type="danger"
                icon="el-icon-delete"
                @click="deleteSelected"
                :disabled="selectedRecords.length === 0"
                size="large"
                class="batch-btn"
              >
                删除选中
              </el-button>
              <el-button
                type="danger"
                icon="el-icon-delete"
                @click="deleteAll"
                :disabled="filteredRecords.length === 0"
                size="large"
                class="batch-btn"
              >
                清空全部
              </el-button>
            </div>
          </div>
        </div>
      </el-card>
    </div>
    
    <!-- 统计概览 -->
    <div class="stats-section" v-if="totalRecords > 0">
      <el-card class="stats-card" shadow="hover">
        <div class="stats-content">
          <div class="stat-item">
            <div class="stat-value">{{ totalRecords }}</div>
            <div class="stat-label">总记录数</div>
          </div>
          <div class="stat-item">
            <div class="stat-value success">{{ successRecords }}</div>
            <div class="stat-label">成功</div>
          </div>
          <div class="stat-item">
            <div class="stat-value error">{{ failedRecords }}</div>
            <div class="stat-label">失败</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ todayRecords }}</div>
            <div class="stat-label">今日新增</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ filteredRecords.length }}</div>
            <div class="stat-label">当前显示</div>
          </div>
        </div>
      </el-card>
    </div>
    
    <!-- 历史记录列表 -->
    <div class="history-list-section">
      <!-- 选择全选 -->
      <div class="list-header" v-if="filteredRecords.length > 0">
        <div class="select-all">
          <el-checkbox v-model="selectAll" @change="handleSelectAll">全选</el-checkbox>
        </div>
        <div class="list-info">
          <span>共 {{ filteredRecords.length }} 条记录</span>
        </div>
      </div>
      
      <!-- 时间轴列表 -->
      <div class="timeline-container" v-if="filteredRecords.length > 0">
        <el-timeline>
          <el-timeline-item
            v-for="record in filteredRecords"
            :key="record.id"
            :timestamp="formatDateTime(record.createTime)"
            placement="top"
            :icon="getRecordIcon(record.type)"
            :type="getRecordType(record.type)"
            size="large"
          >
            <!-- 记录卡片 -->
            <div class="record-card" :class="record.status">
              <div class="card-header">
                <!-- 选择框 -->
                <div class="record-select">
                  <el-checkbox v-model="record.selected" @change="handleSelectRecord"></el-checkbox>
                </div>
                
                <!-- 记录标题和类型 -->
                <div class="record-header">
                  <h3 class="record-title">
                    <template v-if="record.type === 'chat'">
                      {{ record.content?.question || record.title || '新对话' }}
                    </template>
                    <template v-else-if="record.type === 'search'">
                      实体搜索：{{ record.content?.query || record.content?.keyword || record.title || '搜索' }}
                    </template>
                    <template v-else-if="record.type === 'graph_query'">
                      图谱查询：{{ record.content?.entity || record.title || '知识图谱' }}
                    </template>
                    <template v-else-if="record.type === 'graph_build'">
                      图谱构建：{{ record.content?.graphName || record.content?.graphId || record.title || '新图谱' }}
                    </template>
                    <template v-else-if="record.type === 'upload'">
                      {{ record.content?.filename || record.title || '未知文件' }}
                    </template>
                    <template v-else>
                      {{ record.title || '未知记录' }}
                    </template>
                  </h3>
                  <el-tag :type="getRecordStatusType(record.status)" class="status-tag">
                    {{ getRecordStatusText(record.status) }}
                  </el-tag>
                  <el-tag size="small" class="type-tag" :type="getRecordType(record.type)">
                    {{ getRecordTypeText(record.type) }}
                  </el-tag>
                </div>
                
                <!-- 操作按钮 -->
                <div class="record-actions">
                  <el-button
                    type="primary"
                    icon="el-icon-view"
                    size="mini"
                    @click="viewRecord(record)"
                    class="action-btn"
                  ></el-button>
                  <el-button
                    type="success"
                    icon="el-icon-copy-document"
                    size="mini"
                    @click="repeatRecord(record)"
                    class="action-btn"
                  ></el-button>
                  <el-button
                    type="danger"
                    icon="el-icon-delete"
                    size="mini"
                    @click="deleteRecord(record.id)"
                    class="action-btn"
                  ></el-button>
                </div>
              </div>
              
              <!-- 记录内容 -->
              <div class="record-content">
                <div class="record-text">
                  <template v-if="record.type === 'chat'">
                    <div class="chat-answer">{{ record.content?.answer || '无回答内容' }}</div>
                  </template>
                  <template v-else-if="record.type === 'search'">
                    <div class="search-info">
                      关键词：{{ record.content?.query || record.content?.keyword || '未知' }}，
                      类型：{{ record.content?.searchType || 'all' }}，
                      结果数：{{ record.content?.resultCount || 0 }}
                      <div v-if="record.content?.topResults && record.content.topResults.length">
                        Top 结果：
                        <el-tag
                          v-for="(name, idx) in record.content.topResults"
                          :key="idx"
                          size="mini"
                          class="result-tag"
                        >
                          {{ name }}
                        </el-tag>
                      </div>
                    </div>
                  </template>
                  <template v-else-if="record.type === 'graph_query'">
                    <div class="graph-info">
                      查询实体: {{ record.content?.entity || '全部实体' }}
                    </div>
                  </template>
                  <template v-else-if="record.type === 'graph_build'">
                    <div class="graph-build-info">
                      图谱ID：{{ record.graph_id || record.content?.graphId || '-' }}
                    </div>
                  </template>
                  <template v-else-if="record.type === 'upload'">
                    <div class="upload-info">
                      文件大小: {{ formatFileSize(record.content?.fileSize || 0) }}, 文件类型: {{ record.content?.fileType || '未知' }}
                      <template v-if="record.status === 'success'">
                        <span class="upload-success"> ✓ 上传成功</span>
                      </template>
                      <template v-else-if="record.status === 'failed'">
                        <span class="upload-failed"> ✗ 上传失败</span>
                      </template>
                    </div>
                  </template>
                  <template v-else>
                    {{ record.content }}
                  </template>
                </div>
                <div class="record-meta">
                  <span class="record-duration" v-if="record.duration">
                    耗时: {{ record.duration }}s
                  </span>
                </div>
              </div>
              
              <!-- 扩展信息 -->
              <el-collapse-transition>
                <div v-if="expandedRecordId === record.id" class="record-expand">
                  <div class="expand-content">
                    <h4 class="expand-title">详细信息</h4>
                    <div class="expand-details">
                      <div class="detail-item">
                        <label>执行时间:</label>
                        <span>{{ formatDateTime(record.createTime) }}</span>
                      </div>
                      <template v-if="record.type === 'chat'">
                        <div class="detail-item">
                          <label>问题:</label>
                          <span class="result-text">{{ record.content?.question || '无问题内容' }}</span>
                        </div>
                        <div class="detail-item">
                          <label>回答:</label>
                          <span class="result-text">{{ record.content?.answer || '无回答内容' }}</span>
                        </div>
                      </template>
                      <template v-else-if="record.type === 'search'">
                        <div class="detail-item">
                          <label>关键词:</label>
                          <span class="result-text">{{ record.content?.query || record.content?.keyword || '未知' }}</span>
                        </div>
                        <div class="detail-item">
                          <label>类型:</label>
                          <span class="result-text">{{ record.content?.searchType || 'all' }}</span>
                        </div>
                        <div class="detail-item">
                          <label>执行结果:</label>
                          <div class="result-text">
                            共 {{ record.content?.resultCount || 0 }} 条结果
                            <div v-if="record.content?.topResults && record.content.topResults.length">
                              <div
                                v-for="(name, idx) in record.content.topResults.slice(0,3)"
                                :key="idx"
                                class="search-result-item"
                              >
                                <el-tag size="mini" class="result-tag">{{ name }}</el-tag>
                                <el-button
                                  type="text"
                                  size="mini"
                                  @click="repeatSearchResult(record, name)"
                                >
                                  查看详细
                                </el-button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </template>
                      <template v-else-if="record.type === 'graph_query'">
                        <div class="detail-item">
                          <label>查询实体:</label>
                          <span class="result-text">{{ record.content?.entity || '无实体内容' }}</span>
                        </div>
                        <div class="detail-item">
                          <label>统计数据:</label>
                          <div class="stats-grid">
                            <div class="stat-grid-item">
                              <span class="stat-key">节点数:</span>
                              <span class="stat-value">{{ record.content?.nodes || 0 }}</span>
                            </div>
                            <div class="stat-grid-item">
                              <span class="stat-key">链接数:</span>
                              <span class="stat-value">{{ record.content?.links || 0 }}</span>
                            </div>
                          </div>
                        </div>
                      </template>
                      <template v-else-if="record.type === 'graph_build'">
                        <div class="detail-item">
                          <label>图谱ID:</label>
                          <span class="result-text">{{ record.graph_id || record.content?.graphId || '-' }}</span>
                        </div>
                      </template>
                      <template v-else-if="record.type === 'upload'">
                        <div class="detail-item">
                          <label>文件名:</label>
                          <span class="result-text">{{ record.content?.filename || '未知文件名' }}</span>
                        </div>
                        <div class="detail-item">
                          <label>文件大小:</label>
                          <span class="result-text">{{ formatFileSize(record.content?.fileSize || 0) }}</span>
                        </div>
                        <div class="detail-item">
                          <label>文件类型:</label>
                          <span class="result-text">{{ record.content?.fileType || '未知类型' }}</span>
                        </div>
                        <div class="detail-item">
                          <label>上传状态:</label>
                          <span class="result-text" :class="record.status">
                            {{ getRecordStatusText(record.status) }}
                          </span>
                        </div>
                      </template>
                      <template v-else>
                        <div class="detail-item">
                          <label>执行结果:</label>
                          <span class="result-text">{{ record.result }}</span>
                        </div>
                      </template>
                    </div>
                  </div>
                </div>
              </el-collapse-transition>
              
              <!-- 展开/收起按钮 -->
              <div class="expand-btn-container">
                <el-button
                  type="text"
                  size="small"
                  @click="toggleExpand(record.id)"
                  class="expand-btn"
                >
                  <i :class="expandedRecordId === record.id ? 'el-icon-arrow-up' : 'el-icon-arrow-down'"></i>
                  {{ expandedRecordId === record.id ? '收起' : '展开' }}
                </el-button>
              </div>
            </div>
          </el-timeline-item>
        </el-timeline>
      </div>
      
      <!-- 空状态 -->
      <div class="empty-state" v-else>
        <el-empty
          description="暂无历史记录"
          class="empty-component"
        >
          <el-button type="primary" @click="resetFilters">重置筛选</el-button>
        </el-empty>
      </div>
    </div>
    
    <!-- 分页 -->
    <div class="pagination-container" v-if="filteredRecords.length > 0">
      <el-pagination
        v-model="currentPage"
        :page-size="pageSize"
        :total="filteredRecords.length"
        layout="total, sizes, prev, pager, next, jumper"
        :page-sizes="[10, 20, 50, 100]"
        :pager-count="5"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        class="pagination"
      ></el-pagination>
    </div>
    
    <!-- 详情弹窗 -->
    <el-dialog
      v-model="showRecordDetail"
      :title="currentRecord?.title || '记录详情'"
      width="80%"
      class="detail-dialog"
    >
      <div class="detail-content" v-if="currentRecord">
        <div class="detail-header">
          <div class="detail-meta">
            <el-tag :type="getRecordType(currentRecord.type)" class="detail-type-tag">
              {{ getRecordTypeText(currentRecord.type) }}
            </el-tag>
            <el-tag :type="getRecordStatusType(currentRecord.status)" class="detail-status-tag">
              {{ getRecordStatusText(currentRecord.status) }}
            </el-tag>
            <span class="detail-time">{{ formatDateTime(currentRecord.createTime) }}</span>
            <span class="detail-duration" v-if="currentRecord.duration">
              耗时: {{ currentRecord.duration }}s
            </span>
          </div>
        </div>
        
        <div class="detail-body">
          <h3 class="detail-section-title">请求内容</h3>
          <div class="detail-text">
            <template v-if="currentRecord.type === 'chat'">
              <div class="chat-question">问题: {{ currentRecord.content?.question || '无问题内容' }}</div>
            </template>
            <template v-else-if="currentRecord.type === 'graph'">
              <div class="graph-entity">实体: {{ currentRecord.content?.entity || '无实体内容' }}</div>
            </template>
            <template v-else-if="currentRecord.type === 'upload'">
              <div class="upload-info">
                <div>文件名: {{ currentRecord.content?.filename || '未知文件名' }}</div>
                <div>文件大小: {{ formatFileSize(currentRecord.content?.fileSize || 0) }}</div>
                <div>文件类型: {{ currentRecord.content?.fileType || '未知类型' }}</div>
              </div>
            </template>
            <template v-else>
              {{ typeof currentRecord.content === 'string' ? currentRecord.content : JSON.stringify(currentRecord.content || {}) }}
            </template>
          </div>
          
          <h3 class="detail-section-title">执行结果</h3>
          <div class="detail-result">
            <template v-if="currentRecord.type === 'chat'">
              <pre class="result-content">{{ currentRecord.content?.answer || '无回答内容' }}</pre>
            </template>
            <template v-else-if="currentRecord.type === 'graph'">
              <pre class="result-content">节点数: {{ currentRecord.content?.nodes || 0 }}, 链接数: {{ currentRecord.content?.links || 0 }}</pre>
            </template>
            <template v-else-if="currentRecord.type === 'upload'">
              <pre class="result-content">状态: {{ getRecordStatusText(currentRecord.status) }}</pre>
            </template>
            <template v-else>
              <pre class="result-content">{{ currentRecord.result || '无结果' }}</pre>
            </template>
          </div>
          
          <h3 class="detail-section-title">统计信息</h3>
          <div class="detail-stats" v-if="currentRecord.stats">
            <el-descriptions :column="3" border>
              <el-descriptions-item
                v-for="(value, key) in currentRecord.stats"
                :key="key"
                :label="key"
              >
                {{ value }}
              </el-descriptions-item>
            </el-descriptions>
          </div>
          <div v-else class="no-stats">无统计信息</div>
          
          <h3 class="detail-section-title">相关实体</h3>
          <div class="related-entities">
            <el-tag
              v-for="entity in currentRecord.entities"
              :key="entity"
              size="small"
              class="entity-tag"
              @click="searchEntity(entity)"
            >
              {{ entity }}
            </el-tag>
            <span v-if="currentRecord.entities.length === 0" class="no-entities">无相关实体</span>
          </div>
        </div>
      </div>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showRecordDetail = false">关闭</el-button>
          <el-button type="primary" @click="repeatRecord(currentRecord)">重复操作</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { getAllHistory, clearAllHistory, batchDeleteHistoryRecord } from '../../utils/historyUtils'

export default {
  name: 'HistoryPage',
  data() {
    return {
      // 搜索和筛选
      searchKeyword: '',
      dateRange: [],
      typeFilter: '',
      statusFilter: '',
      
      // 分页
      currentPage: 1,
      pageSize: 10,
      
      // 历史记录数据
      historyRecords: [],
      filteredRecords: [],
      
      // 选中状态
      selectAll: false,
      selectedRecords: [],
      
      // 展开状态
      expandedRecordId: null,
      
      // 详情弹窗
      showRecordDetail: false,
      currentRecord: null,
      
      // 搜索防抖计时器
      searchTimer: null
    };
  },
  computed: {
    // 总记录数
    totalRecords() {
      return this.historyRecords.length;
    },
    
    // 成功记录数
    successRecords() {
      return this.historyRecords.filter(record => record.status === 'success').length;
    },
    
    // 失败记录数
    failedRecords() {
      return this.historyRecords.filter(record => record.status === 'failed').length;
    },
    
    // 今日记录数
    todayRecords() {
      const today = new Date().toDateString();
      return this.historyRecords.filter(record => {
        const time = record.createTime || record.timestamp;
        if (!time) return false;
        return new Date(time).toDateString() === today;
      }).length;
    }
  },
  created() {
    // 加载历史记录
    this.loadHistory();
    
    // 监听历史记录更新事件
    window.addEventListener('historyUpdated', this.handleHistoryUpdated);
  },
  beforeDestroy() {
    // 移除事件监听
    window.removeEventListener('historyUpdated', this.handleHistoryUpdated);
  },
  methods: {
    // 加载历史记录
    async loadHistory() {
      // 从localStorage获取真实历史记录
      let records = await getAllHistory();
      // 确保records是数组
      if (!Array.isArray(records)) {
        console.error('获取的历史记录不是数组:', records);
        records = [];
      }
      // 为所有记录添加entities属性默认值，避免模板中访问长度时出错
      records = records.map(record => {
        return {
          ...record,
          entities: record.entities || []
        };
      });
      this.historyRecords = records;
      this.filteredRecords = [...this.historyRecords];
    },
    
    // 处理历史记录更新事件
    handleHistoryUpdated() {
      this.loadHistory();
      this.filterHistory();
    },
    
    // 搜索防抖
    debounceSearch() {
      if (this.searchTimer) {
        clearTimeout(this.searchTimer);
      }
      this.searchTimer = setTimeout(() => {
        this.filterHistory();
      }, 300);
    },
    
    // 筛选历史记录
    filterHistory() {
      let filtered = [...this.historyRecords];
      
      // 关键词筛选
      if (this.searchKeyword) {
        const keyword = this.searchKeyword.toLowerCase();
        filtered = filtered.filter(record => {
          // 确保属性存在再进行访问
          const title = record.title || '';
          const content = record.content ? (typeof record.content === 'string' ? record.content : JSON.stringify(record.content)) : '';
          const result = record.result || '';
          return title.toLowerCase().includes(keyword) ||
                 content.toLowerCase().includes(keyword) ||
                 result.toLowerCase().includes(keyword);
        });
      }
      
      // 类型筛选
      if (this.typeFilter) {
        filtered = filtered.filter(record => record.type === this.typeFilter);
      }
      
      // 状态筛选
      if (this.statusFilter) {
        filtered = filtered.filter(record => record.status === this.statusFilter);
      }
      
      // 时间范围筛选
      if (this.dateRange && this.dateRange.length === 2) {
        const startDate = new Date(this.dateRange[0]);
        const endDate = new Date(this.dateRange[1]);
        endDate.setHours(23, 59, 59, 999); // 设置为结束日期的最后一刻
        
        filtered = filtered.filter(record => {
          const recordDate = new Date(record.createTime);
          return recordDate >= startDate && recordDate <= endDate;
        });
      }
      
      this.filteredRecords = filtered;
      this.currentPage = 1; // 重置页码
    },
    
    // 重置筛选
    resetFilters() {
      this.searchKeyword = '';
      this.dateRange = [];
      this.typeFilter = '';
      this.statusFilter = '';
      this.filterHistory();
      this.resetSelection();
    },
    
    // 全选/取消全选
    handleSelectAll() {
      this.filteredRecords.forEach(record => {
        record.selected = this.selectAll;
      });
      this.updateSelectedRecords();
    },
    
    // 选择单个记录
    handleSelectRecord() {
      this.updateSelectedRecords();
      // 检查是否全选
      this.selectAll = this.filteredRecords.every(record => record.selected);
    },
    
    // 更新选中记录列表
    updateSelectedRecords() {
      this.selectedRecords = this.filteredRecords.filter(record => record.selected).map(record => record.id);
    },
    
    // 重置选择
    resetSelection() {
      this.selectAll = false;
      this.filteredRecords.forEach(record => {
        record.selected = false;
      });
      this.selectedRecords = [];
    },
    
    // 切换展开/收起
    toggleExpand(recordId) {
      this.expandedRecordId = this.expandedRecordId === recordId ? null : recordId;
    },
    
    // 查看记录详情
    viewRecord(record) {
      this.currentRecord = record;
      this.showRecordDetail = true;
    },
    
    // 重复记录操作
    repeatRecord(record) {
      // 根据记录类型跳转到相应页面并执行操作
      switch (record.type) {
        case 'chat': {
          this.$router.push('/chat');
          // 实际项目中这里应该通过Vuex或事件总线传递消息内容
          const question = record.content?.question || '未知问题';
          this.$message.success(`正在重复问答：${question}`);
          break;
        }
        case 'search': {
          const keyword = record.content?.query || record.content?.keyword || ''
          const type = record.content?.searchType || 'all'
          this.$router.push({
            path: '/search',
            query: {
              keyword,
              type,
              auto: '1',
              openDetail: '1'
            }
          })
          this.$message.success(`正在重放实体搜索：${keyword || '未知关键词'}`)
          break;
        }
        case 'graph_query': {
          const graphId = record.graph_id || record.content?.graphId
          this.$router.push({
            path: '/graph',
            query: graphId ? { graphId } : {}
          })
          const entity = record.content?.entity || '未知实体';
          this.$message.success(`正在重复图谱查询：${entity}`);
          break;
        }
        case 'graph_build': {
          const graphId = record.graph_id || record.content?.graphId
          this.$router.push({
            path: '/graph',
            query: graphId ? { graphId } : {}
          })
          this.$message.success('正在重放图谱构建结果');
          break;
        }
        case 'upload': {
          this.$router.push('/upload');
          const filename = record.content?.filename || '未知文件';
          this.$message.success(`请重新上传文件：${filename}`);
          break;
        }
      }
      
      this.showRecordDetail = false;
    },
    
    // 删除记录
    deleteRecord(id) {
      this.$confirm('确定要删除这条历史记录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const { deleteHistoryRecord } = await import('../../utils/historyUtils');
        const success = await deleteHistoryRecord(id);
        if (success) {
          await this.loadHistory();
          this.$message.success('记录删除成功');
        } else {
          this.$message.error('删除失败，请稍后重试');
        }
      }).catch(() => {
        this.$message.info('已取消删除');
      });
    },
    
    // 删除选中记录
    deleteSelected() {
      if (this.selectedRecords.length === 0) {
        this.$message.warning('请先选择要删除的记录');
        return;
      }
      
      this.$confirm(`确定要删除选中的${this.selectedRecords.length}条历史记录吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const success = await batchDeleteHistoryRecord(this.selectedRecords);
        if (success) {
          await this.loadHistory();
          this.resetSelection();
          this.$message.success('选中记录删除成功');
        } else {
          this.$message.error('批量删除失败，请稍后重试');
        }
      }).catch(() => {
        this.$message.info('已取消删除');
      });
    },
    
    // 删除所有记录（当前筛选条件下）
    deleteAll() {
      if (this.filteredRecords.length === 0) {
        this.$message.warning('没有可删除的记录');
        return;
      }
      
      this.$confirm(`确定要删除当前筛选条件下的${this.filteredRecords.length}条历史记录吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const ids = this.filteredRecords.map(r => r.id);
        const success = await batchDeleteHistoryRecord(ids);
        if (success) {
          await this.loadHistory();
          this.resetSelection();
          this.$message.success('记录删除成功');
        } else {
          this.$message.error('清空历史记录失败，请稍后重试');
        }
      }).catch(() => {
        this.$message.info('已取消删除');
      });
    },
    
    // 搜索实体
    searchEntity(entity) {
      this.$router.push({ path: '/search', query: { keyword: entity } });
    },
    
    // 分页大小变化
    handleSizeChange(size) {
      this.pageSize = size;
      this.currentPage = 1;
    },
    
    // 当前页码变化
    handleCurrentChange(page) {
      this.currentPage = page;
    },
    
    // 格式化日期时间
    formatDateTime(dateTime) {
      if (!dateTime) return '';
      const date = new Date(dateTime);
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    },
    
    // 获取记录图标
    getRecordIcon(type) {
      const iconMap = {
        'chat': 'el-icon-chat-dot-round',
        'search': 'el-icon-search',
        'graph_query': 'el-icon-data-analysis',
        'graph_build': 'el-icon-s-operation',
        'upload': 'el-icon-upload2'
      };
      return iconMap[type] || 'el-icon-document';
    },
    
    // 获取记录类型样式
    getRecordType(type) {
      const typeMap = {
        'chat': 'primary',
        'search': 'info',
        'graph_query': 'success',
        'graph_build': 'warning',
        'upload': 'warning'
      };
      return typeMap[type] || 'info';
    },
    
    // 获取记录类型文本
    getRecordTypeText(type) {
      const typeMap = {
        'chat': '问答',
        'search': '实体搜索',
        'graph_query': '图谱查询',
        'graph_build': '图谱构建',
        'upload': '数据上传'
      };
      return typeMap[type] || '未知';
    },
    
    // 获取记录状态样式
    getRecordStatusType(status) {
      const statusMap = {
        'completed': 'success',
        'success': 'success',
        'failed': 'danger',
        'error': 'danger',
        'pending': 'warning',
        'uploading': 'warning',
        'processing': 'warning'
      };
      return statusMap[status] || 'info';
    },
    
    // 获取记录状态文本
    getRecordStatusText(status) {
      const statusMap = {
        'completed': '成功',
        'success': '成功',
        'failed': '失败',
        'error': '失败',
        'pending': '进行中',
        'uploading': '进行中',
        'processing': '进行中'
      };
      return statusMap[status] || '未知';
    },

    formatFileSize(bytes) {
      if (bytes === 0) return '0 B';
      const k = 1024;
      const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },

    // 从搜索记录里“查看详细”某个 top 结果
    repeatSearchResult(record, name) {
      const keyword = name || record.content?.query || record.content?.keyword || ''
      const type = record.content?.searchType || 'all'
      this.$router.push({
        path: '/search',
        query: {
          keyword,
          type,
          auto: '1',
          openDetail: '1'
        }
      })
    }
  },
  mounted() {
    // 加载历史记录
    this.loadHistory();
  }
};
</script>

<style scoped>
.history-page {
  padding: 20px;
  position: relative;
}

/* 页面标题 */
.page-header {
  margin-bottom: 30px;
  animation: fadeInUp 0.5s ease-out;
}

.page-subtitle {
  color: var(--text-secondary);
  font-size: 16px;
  margin-top: 10px;
  margin-left: 2px;
}

/* 搜索筛选区域 */
.search-filter-section {
  margin-bottom: 30px;
  animation: fadeInUp 0.5s ease-out 0.1s both;
}

.filter-card {
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  transition: all 0.3s ease;
}

.filter-card:hover {
  box-shadow: var(--shadow-card-hover);
  border-color: var(--primary-blue);
}

.filter-content {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  align-items: center;
}

.search-input {
  flex: 1;
  min-width: 300px;
}

.search-input .el-input__prepend {
  background: var(--bg-secondary);
  border-right: none;
}

.search-input .el-input__inner {
  background: var(--bg-secondary);
  border-left: none;
}

.filter-options {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  align-items: center;
}

.date-filter, .type-filter, .status-filter {
  min-width: 200px;
}

.batch-actions {
  display: flex;
  gap: 10px;
}

.batch-btn {
  transition: all 0.3s ease;
}

.batch-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

/* 统计概览 */
.stats-section {
  margin-bottom: 30px;
  animation: fadeInUp 0.5s ease-out 0.2s both;
}

.stats-card {
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
}

.stats-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 20px;
}

.stat-item {
  text-align: center;
  padding: 15px 0;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: var(--primary-blue);
  margin-bottom: 5px;
}

.stat-value.success {
  color: var(--success-color);
}

.stat-value.error {
  color: var(--error-color);
}

.stat-label {
  font-size: 14px;
  color: var(--text-secondary);
  font-weight: 500;
}

/* 历史记录列表 */
.history-list-section {
  margin-bottom: 30px;
  animation: fadeInUp 0.5s ease-out 0.3s both;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 10px 0;
  border-bottom: 1px solid var(--border-primary);
}

.select-all {
  font-size: 14px;
  color: var(--text-primary);
}

.list-info {
  font-size: 14px;
  color: var(--text-secondary);
}

/* 时间轴 */
.timeline-container {
  position: relative;
}

.el-timeline {
  padding-left: 0;
}

.el-timeline-item {
  margin-bottom: 30px;
}

.el-timeline-item__timestamp {
  color: var(--text-secondary);
  font-size: 14px;
  margin-bottom: 10px;
}

/* 记录卡片 */
.record-card {
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  padding: 20px;
  transition: all 0.3s ease;
  box-shadow: var(--shadow-card);
}

.record-card:hover {
  box-shadow: var(--shadow-card-hover);
  border-color: var(--primary-blue);
  transform: translateY(-2px);
}

.record-card.success {
  border-left: 4px solid var(--success-color);
}

.record-card.failed {
  border-left: 4px solid var(--error-color);
}

.record-card.processing {
  border-left: 4px solid var(--warning-color);
}

/* 卡片头部 */
.card-header {
  display: flex;
  align-items: flex-start;
  gap: 15px;
  margin-bottom: 15px;
}

.record-select {
  margin-top: 5px;
}

.record-header {
  flex: 1;
  min-width: 0;
}

.record-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 10px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.status-tag, .type-tag {
  margin-right: 8px;
  margin-bottom: 5px;
}

.record-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  transition: all 0.3s ease;
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.1);
}

/* 记录内容 */
.record-content {
  margin-bottom: 15px;
}

.record-text {
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: 10px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.record-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  font-size: 12px;
  color: var(--text-secondary);
}

/* 展开内容 */
.record-expand {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid var(--border-primary);
}

.expand-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 15px;
}

.expand-details {
  background: var(--bg-secondary);
  padding: 20px;
  border-radius: var(--radius-md);
}

.detail-item {
  display: flex;
  margin-bottom: 10px;
  font-size: 14px;
}

.detail-item label {
  width: 100px;
  font-weight: 600;
  color: var(--text-primary);
}

.detail-item span {
  color: var(--text-secondary);
  flex: 1;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
  margin-top: 10px;
}

.stat-grid-item {
  display: flex;
  justify-content: space-between;
  padding: 8px;
  background: var(--bg-card);
  border-radius: var(--radius-sm);
}

.stat-key {
  font-weight: 500;
  color: var(--text-primary);
}

.stat-value {
  color: var(--primary-blue);
  font-weight: 600;
}

/* 展开按钮 */
.expand-btn-container {
  text-align: center;
  margin-top: 15px;
}

.expand-btn {
  color: var(--primary-blue);
  font-size: 12px;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
}

/* 分页 */
.pagination-container {
  text-align: center;
  margin-top: 30px;
  animation: fadeInUp 0.5s ease-out 0.4s both;
}

.pagination {
  display: inline-block;
}

/* 详情弹窗 */
.detail-dialog {
  background: rgba(10, 14, 39, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid var(--border-primary);
}

.detail-content {
  padding: 10px 0;
}

.detail-header {
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid var(--border-primary);
}

.detail-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  align-items: center;
}

.detail-type-tag, .detail-status-tag {
  font-size: 14px;
}

.detail-time, .detail-duration {
  font-size: 14px;
  color: var(--text-secondary);
}

.detail-body {
  max-height: 600px;
  overflow-y: auto;
}

.detail-section-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 20px 0 15px 0;
}

.detail-text {
  background: var(--bg-secondary);
  padding: 15px;
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: 15px;
}

.detail-result {
  margin-bottom: 20px;
}

.result-content {
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  padding: 15px;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.5;
  color: var(--text-primary);
  white-space: pre-wrap;
  word-break: break-all;
  max-height: 300px;
  overflow-y: auto;
}

.detail-stats {
  margin-bottom: 20px;
}

.no-stats {
  color: var(--text-secondary);
  font-style: italic;
  margin-bottom: 20px;
}

.related-entities {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.entity-tag {
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  cursor: pointer;
  transition: all 0.3s ease;
}

.entity-tag:hover {
  background: var(--primary-blue);
  color: white;
  border-color: var(--primary-blue);
  transform: translateY(-2px);
  box-shadow: 0 0 10px rgba(0, 212, 255, 0.4);
}

.no-entities {
  color: var(--text-secondary);
  font-style: italic;
}

.dialog-footer {
  text-align: right;
  padding: 20px;
  border-top: 1px solid var(--border-primary);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .history-page {
    padding: 15px;
  }
  
  .filter-content {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-input {
    min-width: auto;
  }
  
  .filter-options {
    width: 100%;
  }
  
  .date-filter, .type-filter, .status-filter {
    min-width: auto;
    width: 100%;
  }
  
  .batch-actions {
    width: 100%;
    justify-content: flex-start;
  }
  
  .card-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .record-select {
    align-self: flex-start;
  }
  
  .record-header {
    order: -1;
  }
  
  .record-actions {
    justify-content: flex-start;
  }
  
  .record-meta {
    flex-direction: column;
    gap: 5px;
  }
  
  .stats-content {
    grid-template-columns: repeat(2, 1fr);
    gap: 15px;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>