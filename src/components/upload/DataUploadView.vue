<template>
  <div class="upload-page">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1 class="app-title">数据上传</h1>
      <p class="page-subtitle">上传医疗知识图谱数据，支持JSON、CSV、XML等格式</p>
    </div>
    
    <!-- 上传区域 -->
    <div class="upload-section">
      <el-card class="upload-card" shadow="hover">
        <div
          class="drop-zone"
          :class="{ 'dragover': isDragover }"
          @dragover.prevent="isDragover = true"
          @dragleave.prevent="isDragover = false"
          @drop.prevent="handleDrop"
        >
          <!-- 拖拽上传提示 -->
          <div class="drop-content">
            <div class="upload-icon">
              <i class="el-icon-upload2"></i>
            </div>
            <h3 class="upload-title">拖拽文件到此处</h3>
            <p class="upload-description">或</p>
            <el-button
              type="primary"
              size="large"
              icon="el-icon-folder-opened"
              @click="$refs.uploadInput.click()"
              class="browse-btn"
            >
              浏览文件
            </el-button>
            <input
              ref="uploadInput"
              type="file"
              multiple
              accept=".json,.txt,.pdf,.csv"
              style="display: none"
              @change="handleFileSelect"
            >
            <div class="file-types">
              <span class="file-type">支持格式: TXT, PDF, JSON, CSV</span>
              <span class="file-size">最大文件: 50MB</span>
            </div>
          </div>
        </div>
      </el-card>
    </div>
    
    <!-- 文件列表 -->
    <div class="file-list-section" v-if="uploadingFiles.length > 0 || completedFiles.length > 0">
      <div class="section-header">
        <h2 class="section-title">文件列表</h2>
        <el-button
          type="danger"
          icon="el-icon-delete"
          @click="clearAllFiles"
          :disabled="isUploading"
          class="clear-btn"
        >
          清空所有
        </el-button>
      </div>
      
      <!-- 上传中文件 -->
      <div class="uploading-files" v-if="uploadingFiles.length > 0">
        <h3 class="list-subtitle">上传中 ({{ uploadingFiles.length }})</h3>
        <el-card
          v-for="file in uploadingFiles"
          :key="file.uid"
          class="file-card uploading"
          shadow="hover"
        >
          <div class="file-info">
            <div class="file-icon">
              <i :class="getFileIcon(file.name)"></i>
            </div>
            <div class="file-details">
              <div class="file-name">{{ file.name }}</div>
              <div class="file-meta">
                <span class="file-size">{{ formatFileSize(file.size) }}</span>
                <span class="file-status">上传中</span>
              </div>
            </div>
            <div class="file-actions">
              <el-button
                type="danger"
                icon="el-icon-delete"
                size="mini"
                @click="cancelUpload(file.uid)"
              ></el-button>
            </div>
          </div>
          <div class="upload-progress">
            <el-progress
              :percentage="file.progress"
              :color="customProgressColor"
              :stroke-width="3"
              class="progress-bar"
            ></el-progress>
            <span class="progress-text">{{ file.progress }}%</span>
          </div>
        </el-card>
      </div>
      
      <!-- 已完成文件 -->
      <div class="completed-files" v-if="completedFiles.length > 0">
        <h3 class="list-subtitle">已完成 ({{ completedFiles.length }})</h3>
        <el-card
          v-for="file in completedFiles"
          :key="file.uid"
          class="file-card completed"
          shadow="hover"
        >
          <div class="file-info">
            <div class="file-icon">
              <i :class="getFileIcon(file.name)"></i>
              <div class="status-icon" :class="file.success ? 'success' : 'error'">
                <i :class="file.success ? 'el-icon-check' : 'el-icon-close'" ></i>
              </div>
            </div>
            <div class="file-details">
              <div class="file-name">{{ file.name }}</div>
              <div class="file-meta">
                <span class="file-size">{{ formatFileSize(file.size) }}</span>
                <span class="file-status" :class="file.success ? 'success' : 'error'">
                  {{ file.success ? '上传成功' : '上传失败' }}
                </span>
              </div>
              <div class="file-message" v-if="file.message">
                {{ file.message }}
              </div>
              <!-- 知识图谱生成进度条 -->
              <div class="kg-progress" v-if="file.generatingKG">
                <div class="progress-header">
                  <span class="progress-title">知识图谱生成中</span>
                  <span class="progress-percentage">{{ file.kgProgress || 0 }}%</span>
                </div>
                <el-progress
                  :percentage="file.kgProgress || 0"
                  :color="customProgressColor"
                  :stroke-width="3"
                  class="progress-bar"
                ></el-progress>
                <div class="progress-info">
                  <span v-if="file.currentChunk && file.totalChunks">
                    处理进度: {{ file.currentChunk }}/{{ file.totalChunks }} 段
                  </span>
                  <span v-if="file.entitiesCreated || file.relationsCreated">
                    已生成: {{ file.entitiesCreated || 0 }}个实体, {{ file.relationsCreated || 0 }}条关系
                  </span>
                  <span v-if="file.currentProcessing">
                    当前: {{ file.currentProcessing }}
                  </span>
                </div>
              </div>
            </div>
            <div class="file-actions">
              <el-button
                v-if="file.success && file.fileId && !file.kbIngested"
                type="warning"
                icon="el-icon-upload2"
                size="mini"
                @click="ingestToKb(file)"
                :loading="file.ingestingKb"
              >
                入库
              </el-button>
              <span v-if="file.success && file.kbIngested" class="kb-badge">已入库 ({{ file.kbChunkCount || 0 }} 块)</span>
              <el-button
                v-if="file.success && !file.kgGenerated"
                type="primary"
                icon="el-icon-data-line"
                size="mini"
                @click="generateKnowledgeGraph(file)"
                :loading="file.generatingKG"
              >
                生成知识图谱
              </el-button>
              <el-button
                v-if="file.success && file.kgGenerated"
                type="success"
                icon="el-icon-check"
                size="mini"
              >
                已生成
              </el-button>
              <el-button
                v-if="file.success"
                type="success"
                icon="el-icon-view"
                size="mini"
                @click="viewFile(file)"
              ></el-button>
              <el-button
                type="danger"
                icon="el-icon-delete"
                size="mini"
                @click="removeFile(file.uid, 'completed')"
              ></el-button>
            </div>
          </div>
        </el-card>
      </div>
    </div>
    
    <!-- 上传控制 -->
    <div class="upload-controls" v-if="pendingFiles.length > 0">
      <el-card class="controls-card" shadow="hover">
        <div class="controls-content">
          <div class="pending-info">
            <span class="pending-count">{{ pendingFiles.length }}个文件等待上传</span>
          </div>
          <div class="controls-buttons">
            <el-button
              type="warning"
              icon="el-icon-delete"
              @click="clearPendingFiles"
              class="control-btn"
            >
              清空
            </el-button>
            <el-button
              type="primary"
              icon="el-icon-upload2"
              @click="startUpload"
              class="control-btn"
            >
              开始上传
            </el-button>
          </div>
        </div>
      </el-card>
    </div>
    
    <!-- 上传统计 -->
    <div class="upload-stats" v-if="totalUploads > 0">
      <el-card class="stats-card" shadow="hover">
        <div class="stats-content">
          <div class="stat-item">
            <div class="stat-value">{{ totalUploads }}</div>
            <div class="stat-label">总上传</div>
          </div>
          <div class="stat-item">
            <div class="stat-value success">{{ successfulUploads }}</div>
            <div class="stat-label">成功</div>
          </div>
          <div class="stat-item">
            <div class="stat-value error">{{ failedUploads }}</div>
            <div class="stat-label">失败</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ uploadingFiles.length }}</div>
            <div class="stat-label">上传中</div>
          </div>
        </div>
      </el-card>
    </div>
    
    <!-- 文档知识库管理 -->
    <div class="kb-section">
      <el-card class="kb-card" shadow="hover">
        <div class="kb-content">
          <h3 class="kb-title">
            <i class="el-icon-document"></i>
            文档知识库
          </h3>
          <p class="kb-description">将已上传的文档入库到向量知识库，支持语义检索；可在此管理已入库文档。选择目标知识库后，在上方文件列表中点击「入库」或使用「批量入库」。</p>
          <div class="kb-toolbar">
            <span class="kb-toolbar-label">入库到知识库：</span>
            <el-select
              v-model="selectedKbId"
              size="small"
              placeholder="选择知识库"
              class="kb-select"
              style="width: 200px; margin-right: 12px;"
            >
              <el-option
                v-for="b in kbBasesList"
                :key="b.id"
                :label="b.name"
                :value="b.id"
              />
            </el-select>
            <el-button
              type="primary"
              icon="el-icon-upload2"
              @click="batchIngestToKb"
              :loading="batchKbLoading"
              :disabled="completedFiles.filter(f => f.success && f.fileId && !f.kbIngested).length === 0"
              class="kb-btn"
            >
              批量入库
            </el-button>
            <el-button
              icon="el-icon-refresh"
              @click="loadKbDocList"
              :loading="kbListLoading"
              class="kb-btn"
            >
              刷新文档列表
            </el-button>
          </div>
          <div class="kb-list-wrap">
            <el-table
              v-if="kbDocList.length > 0"
              :data="kbDocList"
              stripe
              size="small"
              class="kb-table"
            >
              <el-table-column prop="source_file" label="文件名" min-width="180" show-overflow-tooltip>
                <template slot-scope="scope">{{ scope.row.source_file || scope.row.doc_id || '—' }}</template>
              </el-table-column>
              <el-table-column label="类型" width="80">
                <template slot-scope="scope">{{ scope.row.source_type || '—' }}</template>
              </el-table-column>
              <el-table-column label="块数" width="80" align="center">
                <template slot-scope="scope">{{ scope.row.chunk_count != null ? scope.row.chunk_count : '—' }}</template>
              </el-table-column>
              <el-table-column label="操作" width="160" align="center" fixed="right">
                <template slot-scope="scope">
                  <el-button
                    type="danger"
                    size="mini"
                    icon="el-icon-delete"
                    @click="deleteKbDoc(scope.row)"
                  >
                    删除
                  </el-button>
                  <el-button
                    type="warning"
                    size="mini"
                    icon="el-icon-refresh"
                    :disabled="!canReindexKb(scope.row)"
                    @click="reindexKbDoc(scope.row)"
                  >
                    重索引
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
            <div v-else-if="kbListLoading" class="kb-empty">加载中…</div>
            <div v-else class="kb-empty">暂无已入库文档，点击「刷新文档列表」或先对上方文件执行「入库」。</div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- Hadoop批量操作区域 -->
    <div class="hadoop-section" v-if="completedFiles.length > 0">
      <el-card class="hadoop-card" shadow="hover">
        <div class="hadoop-content">
          <h3 class="hadoop-title">
            <i class="el-icon-server"></i>
            Hadoop批量操作
          </h3>
          <p class="hadoop-description">使用Hadoop和Celery进行批量文件处理和知识图谱构建。批量构建可直接使用已上传的文件，无需先上传到HDFS。</p>
          <div class="hadoop-buttons">
            <el-button
              type="primary"
              icon="el-icon-upload2"
              @click="batchUploadToHadoop"
              :loading="batchUploadLoading"
              :disabled="completedFiles.filter(f => f.success && f.fileId && !f.hdfsUploaded).length === 0"
              class="hadoop-btn"
            >
              批量上传至HDFS
            </el-button>
            <el-button
              type="success"
              icon="el-icon-data-line"
              @click="batchBuildKG"
              :loading="batchBuildLoading"
              :disabled="completedFiles.filter(f => f.success && f.fileId).length === 0"
              class="hadoop-btn"
            >
              批量构建知识图谱
            </el-button>
          </div>
          <!-- Hadoop任务状态 -->
          <div class="hadoop-status" v-if="hadoopTaskId">
            <div class="status-header">
              <span class="status-title">批量构建任务状态</span>
              <span class="task-id">任务ID: {{ hadoopTaskId }}</span>
            </div>
            <div class="status-content">
              <el-progress
                :percentage="hadoopProgress"
                :color="customProgressColor"
                :stroke-width="3"
                class="progress-bar"
              ></el-progress>
              <div class="status-info">
                <span class="status-text">{{ getStatusText(hadoopStatus) }}</span>
                <span class="progress-text">{{ hadoopProgress }}%</span>
              </div>
              <div class="status-detail" v-if="hadoopStatus">
                <el-button
                  type="text"
                  size="small"
                  icon="el-icon-refresh"
                  @click="refreshTaskStatus"
                  :loading="refreshingStatus"
                >
                  刷新状态
                </el-button>
              </div>
            </div>
          </div>
        </div>
      </el-card>
    </div>
    
    <!-- 数据模板下载 -->
    <div class="template-section">
      <el-card class="template-card" shadow="hover">
        <div class="template-content">
          <h3 class="template-title">
            <i class="el-icon-document"></i>
            数据模板
          </h3>
          <p class="template-description">下载数据模板，按照格式准备您的知识图谱数据</p>
          <div class="template-list">
            <el-button
              v-for="template in templates"
              :key="template.name"
              type="info"
              size="small"
              icon="el-icon-download"
              @click="downloadTemplate(template)"
              class="template-btn"
            >
              {{ template.name }} ({{ template.format }})
            </el-button>
          </div>
        </div>
      </el-card>
    </div>
    
    <!-- 数据预览弹窗 -->
    <el-dialog
      v-model="showPreview"
      title="文件预览"
      width="80%"
      class="preview-dialog"
    >
      <div class="preview-content" v-if="previewFile">
        <div class="preview-header">
          <h3 class="preview-title">{{ previewFile.name }}</h3>
          <span class="preview-size">{{ formatFileSize(previewFile.size) }}</span>
        </div>
        <div class="preview-body">
          <pre class="file-content">{{ previewContent }}</pre>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { saveHistoryRecord, updateHistoryStatus, HISTORY_TYPES } from '../../utils/historyUtils'
import { hadoop, kb } from '../../api'

export default {
  name: 'DataUploadPage',
  data() {
    return {
      // 拖拽状态
      isDragover: false,
      
      // 文件列表
      pendingFiles: [],      // 待上传文件
      uploadingFiles: [],    // 上传中文件
      completedFiles: [],    // 已完成文件
      
      // 预览信息
      showPreview: false,
      previewFile: null,
      previewContent: '',
      
      // 模板列表
      templates: [
        { name: '疾病数据模板', format: 'JSON' },
        { name: '症状数据模板', format: 'CSV' },
        { name: '药物数据模板', format: 'JSON' },
        { name: '关系数据模板', format: 'XML' }
      ],
      
      // Hadoop相关状态
      batchUploadLoading: false,  // 批量上传加载状态
      batchBuildLoading: false,   // 批量构建加载状态
      hadoopTaskId: null,         // Hadoop任务ID
      hadoopProgress: 0,          // Hadoop任务进度
      hadoopStatus: '',           // Hadoop任务状态
      progressInterval: null,     // 进度查询定时器
      refreshingStatus: false,    // 是否正在刷新状态

      // 文档知识库相关
      kbDocList: [],              // 已入库文档列表
      kbListLoading: false,       // 文档列表加载中
      batchKbLoading: false,      // 批量入库加载中
      kbBasesList: [],            // 知识库列表（入库时选择目标）
      selectedKbId: 'default'     // 当前选中的目标知识库 id
    };
  },
  created() {
    this.loadKbBasesList();
  },
  computed: {
    // 是否正在上传
    isUploading() {
      return this.uploadingFiles.length > 0;
    },
    
    // 总上传数量
    totalUploads() {
      return this.uploadingFiles.length + this.completedFiles.length;
    },
    
    // 成功上传数量
    successfulUploads() {
      return this.completedFiles.filter(file => file.success).length;
    },
    
    // 失败上传数量
    failedUploads() {
      return this.completedFiles.filter(file => !file.success).length;
    },
    
    // 自定义进度条颜色
    customProgressColor() {
      return ['#667eea', '#00d4ff'];
    }
  },
  methods: {
    // 处理文件选择
    handleFileSelect(event) {
      const files = event.target.files;
      this.addFiles(files);
      // 清空输入，允许重复选择相同文件
      event.target.value = '';
    },
    
    // 处理拖拽文件
    handleDrop(event) {
      this.isDragover = false;
      const files = event.dataTransfer.files;
      this.addFiles(files);
    },
    
    // 添加文件到待上传列表
    addFiles(fileList) {
      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];
        
        // 检查文件格式
        if (!this.validateFileFormat(file.name)) {
          this.$message.warning(`不支持的文件格式: ${file.name}`);
          continue;
        }
        
        // 检查文件大小
        if (!this.validateFileSize(file.size)) {
          this.$message.warning(`文件过大: ${file.name} (最大支持50MB)`);
          continue;
        }
        
        // 创建文件对象
        const fileObj = {
          uid: Date.now() + i,
          name: file.name,
          size: file.size,
          file: file,
          progress: 0,
          success: false,
          message: ''
        };
        
        this.pendingFiles.push(fileObj);
      }
    },
    
    // 验证文件格式
    validateFileFormat(filename) {
      const allowedExtensions = ['.json', '.txt', '.pdf', '.csv'];
      const ext = filename.substring(filename.lastIndexOf('.')).toLowerCase();
      return allowedExtensions.includes(ext);
    },
    
    // 验证文件大小
    validateFileSize(size) {
      const maxSize = 50 * 1024 * 1024; // 50MB
      return size <= maxSize;
    },
    
    // 开始上传
    startUpload() {
      if (this.pendingFiles.length === 0) {
        this.$message.warning('没有待上传的文件');
        return;
      }
      
      // 将待上传文件移到上传中列表
      while (this.pendingFiles.length > 0) {
        const file = this.pendingFiles.shift();
        this.uploadingFiles.push(file);
        this.uploadFile(file);
      }
    },
    
    // 上传文件
    async uploadFile(file) {
      // 添加知识图谱生成状态字段
      file.kgGenerated = false;
      file.generatingKG = false;
      
      // 保存初始上传记录（必须 await，否则 historyRecord 为 Promise，id 为 undefined 导致 PUT /api/history/undefined/status）
      const historyRecord = await saveHistoryRecord(HISTORY_TYPES.UPLOAD, {
        filename: file.name,
        fileSize: file.size,
        fileType: file.name.split('.').pop().toLowerCase(),
        progress: 0
      })
      
      try {
        const formData = new FormData();
        formData.append('file', file.file);
        
        console.log('开始上传文件:', file.name);
        console.log('文件大小:', file.size);
        
        // 使用 axios 或其他 HTTP 客户端发送请求
        const response = await this.$http.post('/api/upload', formData, {
          // 移除手动设置的Content-Type，让axios自动处理
          onUploadProgress: (progressEvent) => {
            console.log('上传进度事件:', progressEvent);
            if (progressEvent.total) {
              const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              file.progress = progress;
              console.log(`文件 ${file.name} 上传进度: ${progress}%`);
              // 更新历史记录进度
              updateHistoryStatus(historyRecord.id, 'uploading', '', {
                progress: file.progress
              });
            } else {
              console.log('没有总大小信息，使用模拟进度');
              // 如果没有总大小信息，模拟进度
              if (file.progress < 90) {
                file.progress += Math.random() * 5;
                console.log(`文件 ${file.name} 模拟进度: ${file.progress}%`);
              }
            }
          }
        });
        
        // 上传成功（用 $set 保证 fileId 等为响应式，入库按钮才能正确显示）
        file.progress = 100;
        file.success = true;
        this.$set(file, 'fileId', response.data.file_id);
        file.message = '文件上传成功，可点击「入库」加入知识库或「生成知识图谱」';
        this.$message.success(`文件上传成功: ${file.name}`);
        
        // 更新历史记录状态
        updateHistoryStatus(historyRecord.id, 'success', '上传成功');
        
        // 移到已完成列表
        const index = this.uploadingFiles.indexOf(file);
        if (index > -1) {
          this.uploadingFiles.splice(index, 1);
          this.completedFiles.push(file);
        }
        
      } catch (error) {
        // 上传失败
        file.progress = 100;
        file.success = false;
        file.message = error.response?.data?.detail || '文件上传失败';
        this.$message.error(`文件上传失败: ${file.name}`);
        
        // 更新历史记录状态
        updateHistoryStatus(historyRecord.id, 'failed', file.message);
        
        // 移到已完成列表
        const index = this.uploadingFiles.indexOf(file);
        if (index > -1) {
          this.uploadingFiles.splice(index, 1);
          this.completedFiles.push(file);
        }
      }
    },
    
    // 生成知识图谱
    async generateKnowledgeGraph(file) {
      try {
        file.generatingKG = true;
        file.kgProgress = 0;
        file.taskId = null;
        file.progressInterval = null;
        // 初始化进度相关属性
        file.currentChunk = 0;
        file.totalChunks = 0;
        file.entitiesCreated = 0;
        file.relationsCreated = 0;
        file.currentProcessing = '';
        
        file.message = '正在启动知识图谱生成任务...';
        this.$message.info(`正在为文件 ${file.name} 生成知识图谱...`);
        
        // 调试信息：打印fileId
        console.log('fileId:', file.fileId);
        console.log('API请求URL:', '/api/kg/build');
        console.log('请求数据:', { file_id: file.fileId });
        
        // 调用生成知识图谱的API
        const response = await this.$http.post('/api/kg/build', {
          file_id: file.fileId
        });
        
        // 调试信息：打印响应
        console.log('API响应:', response);
        
        if (response.data && response.data.task_id) {
          file.taskId = response.data.task_id;
          file.message = '知识图谱生成任务已启动，正在处理...';
          
          // 开始定期查询进度
          this.startProgressCheck(file);
        } else {
          throw new Error('获取任务ID失败');
        }
        
      } catch (error) {
        // 生成失败
        console.error('生成知识图谱失败:', error);
        console.error('错误详情:', error.response || error.request || error.message);
        file.generatingKG = false;
        file.kgProgress = 0;
        // 重置进度相关属性
        file.currentChunk = 0;
        file.totalChunks = 0;
        file.entitiesCreated = 0;
        file.relationsCreated = 0;
        file.currentProcessing = '';
        
        file.message = `文件上传成功，但生成知识图谱失败: ${error.response?.data?.detail || '生成失败'}`;
        this.$message.error(`生成知识图谱失败: ${file.name}`);
      }
    },
    
    // 开始定期检查进度
    startProgressCheck(file) {
      // 清除可能存在的旧定时器
      if (file.progressInterval) {
        clearInterval(file.progressInterval);
      }
      
      // 每2秒查询一次进度
      file.progressInterval = setInterval(async () => {
        try {
          const response = await this.$http.get(`/api/kg/build/progress/${file.taskId}`);
          const progressData = response.data;
          
          // 更新文件进度和状态
          file.kgProgress = progressData.progress;
          // 更新详细进度属性
          file.currentChunk = progressData.current_chunk || 0;
          file.totalChunks = progressData.total_chunks || 0;
          file.entitiesCreated = progressData.entities_created || 0;
          file.relationsCreated = progressData.relations_created || 0;
          file.currentProcessing = progressData.current_processing || '';
          
          file.message = progressData.message || '正在生成知识图谱...';
          
          // 如果任务完成或失败，停止查询
          if (progressData.status === 'completed') {
            clearInterval(file.progressInterval);
            file.progressInterval = null;
            file.generatingKG = false;
            file.kgGenerated = true;
            file.message = `知识图谱生成成功，共包含 ${progressData.entities_created} 个实体和 ${progressData.relations_created} 条关系`;
            this.$message.success(`知识图谱生成成功: ${file.name}`);
            // 写入图谱构建历史，便于历史记录页正确显示
            saveHistoryRecord(HISTORY_TYPES.GRAPH_BUILD, {
              graphName: file.name,
              graphId: file.fileId,
              entities_created: progressData.entities_created,
              relations_created: progressData.relations_created
            }, { status: 'success' });
          } else if (progressData.status === 'failed') {
            clearInterval(file.progressInterval);
            file.progressInterval = null;
            file.generatingKG = false;
            file.message = `知识图谱生成失败: ${progressData.message}`;
            this.$message.error(`生成知识图谱失败: ${file.name}`);
            saveHistoryRecord(HISTORY_TYPES.GRAPH_BUILD, {
              graphName: file.name,
              graphId: file.fileId
            }, { status: 'failed' });
          }
          
        } catch (error) {
          console.error('查询进度失败:', error);
          // 如果查询失败，尝试几次后停止
          if (!file.progressRetryCount) file.progressRetryCount = 0;
          file.progressRetryCount++;
          
          if (file.progressRetryCount > 5) {
            clearInterval(file.progressInterval);
            file.progressInterval = null;
            file.generatingKG = false;
            file.message = '查询生成进度失败，请手动查看状态';
            this.$message.warning(`查询知识图谱生成进度失败: ${file.name}`);
          }
        }
      }, 2000);
    },
    
    // 取消上传
    cancelUpload(uid) {
      const index = this.uploadingFiles.findIndex(file => file.uid === uid);
      if (index > -1) {
        const file = this.uploadingFiles[index];
        clearInterval(file.uploadInterval);
        this.uploadingFiles.splice(index, 1);
        this.$message.info(`已取消上传: ${file.name}`);
      }
    },
    
    // 移除文件
    removeFile(uid, listType) {
      let list;
      if (listType === 'completed') {
        list = this.completedFiles;
      }
      
      if (list) {
        const index = list.findIndex(file => file.uid === uid);
        if (index > -1) {
          const file = list[index];
          list.splice(index, 1);
          this.$message.info(`已移除文件: ${file.name}`);
        }
      }
    },
    
    // 清空待上传文件
    clearPendingFiles() {
      if (this.pendingFiles.length > 0) {
        this.pendingFiles = [];
        this.$message.info('已清空所有待上传文件');
      }
    },
    
    // 清空所有文件
    clearAllFiles() {
      if (this.isUploading) {
        this.$message.warning('有文件正在上传中，无法清空');
        return;
      }
      
      this.pendingFiles = [];
      this.completedFiles = [];
      this.$message.info('已清空所有文件');
    },
    
    // 格式化文件大小
    formatFileSize(size) {
      if (size === 0) return '0 B';
      
      const k = 1024;
      const sizes = ['B', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(size) / Math.log(k));
      
      return parseFloat((size / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },
    
    // 获取文件图标
    getFileIcon(filename) {
      const ext = filename.substring(filename.lastIndexOf('.')).toLowerCase();
      const iconMap = {
        '.json': 'el-icon-document-json',
        '.csv': 'el-icon-document',
        '.xml': 'el-icon-document',
        '.txt': 'el-icon-document'
      };
      return iconMap[ext] || 'el-icon-document';
    },
    
    // 查看文件
    viewFile(file) {
      this.previewFile = file;
      
      // 模拟文件内容预览
      setTimeout(() => {
        // 根据文件类型生成模拟内容
        const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
        let content;
        
        switch (ext) {
          case '.json':
            content = JSON.stringify({
              "entities": [
                {
                  "id": "disease_001",
                  "name": "糖尿病",
                  "type": "disease",
                  "properties": {
                    "description": "一种以高血糖为特征的代谢性疾病",
                    "symptoms": ["多饮", "多尿", "多食"],
                    "treatments": ["胰岛素", "饮食控制"]
                  }
                }
              ],
              "relations": [
                {
                  "source": "disease_001",
                  "target": "drug_001",
                  "type": "treated_by"
                }
              ]
            }, null, 2);
            break;
          case '.csv':
            content = "id,name,type,description\ndisease_001,糖尿病,disease,一种以高血糖为特征的代谢性疾病\nsymptom_001,多饮,symptom,饮水量异常增加";            
            break;
          case '.xml':
            content = `<?xml version="1.0" encoding="UTF-8"?>
<knowledge-graph>
  <entity id="disease_001">
    <name>糖尿病</name>
    <type>disease</type>
    <description>一种以高血糖为特征的代谢性疾病</description>
  </entity>
  <relation>
    <source>disease_001</source>
    <target>drug_001</target>
    <type>treated_by</type>
  </relation>
</knowledge-graph>`;
            break;
          default:
            content = "# 疾病信息\n\n## 糖尿病\n- 类型: 慢性疾病\n- 症状: 多饮、多尿、多食\n- 治疗: 胰岛素、饮食控制";
        }
        
        this.previewContent = content;
        this.showPreview = true;
      }, 300);
    },
    
    // 下载模板：使用当前 API 基础地址请求 blob，再触发下载
    async downloadTemplate(template) {
      const typeMap = {
        '疾病数据模板': { type: 'disease', filename: '疾病数据模板.json' },
        '症状数据模板': { type: 'symptom', filename: '症状数据模板.csv' },
        '药物数据模板': { type: 'medicine', filename: '药物数据模板.json' },
        '关系数据模板': { type: 'relation', filename: '关系数据模板.xml' }
      };
      const meta = typeMap[template.name];
      if (!meta) {
        this.$message.error('未知的模板类型');
        return;
      }
      this.$message.info(`正在下载模板: ${template.name}`);
      try {
        const res = await this.$http.get(`/api/templates/${meta.type}`, { responseType: 'blob' });
        const blob = res.data;
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = meta.filename;
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        this.$message.success(`已下载: ${meta.filename}`);
      } catch (err) {
        console.error('模板下载失败:', err);
        this.$message.error(err.response?.data?.detail || '模板下载失败');
      }
    },
    
    // 批量上传到HDFS（可选步骤，用于需要HDFS存储的场景）
    async batchUploadToHadoop() {
      this.batchUploadLoading = true;
      try {
        const files = this.completedFiles.filter(f => f.success && !f.hdfsUploaded && f.file);
        if (files.length === 0) {
          this.$message.warning('没有需要上传到HDFS的文件（文件可能已上传或文件对象不可用）');
          return;
        }
        
        // 准备文件列表（使用原始文件对象）
        const fileList = files.map(f => f.file).filter(Boolean);
        if (fileList.length === 0) {
          this.$message.warning('没有可用的文件对象，请重新上传文件');
          return;
        }
        
        // 调用Hadoop API批量上传
        const response = await hadoop.batchUploadFiles(fileList);
        
        if (response.data && response.data.status === 'success') {
          // 更新文件状态
          const uploadedFileIds = response.data.uploaded_file_ids || [];
          files.forEach((file, index) => {
            if (uploadedFileIds.includes(file.fileId) || index < uploadedFileIds.length) {
              file.hdfsUploaded = true;
              file.hdfsFileId = uploadedFileIds[index] || file.fileId;
            }
          });
          
          this.$message.success(`批量上传到HDFS成功，共上传 ${response.data.total_files || files.length} 个文件`);
        } else {
          throw new Error(response.data?.message || '上传失败');
        }
      } catch (error) {
        console.error('批量上传到HDFS失败:', error);
        const errorMsg = error.response?.data?.detail || error.message || '批量上传到HDFS失败';
        this.$message.error(errorMsg);
      } finally {
        this.batchUploadLoading = false;
      }
    },
    
    // 批量构建知识图谱
    async batchBuildKG() {
      this.batchBuildLoading = true;
      try {
        // 获取所有已上传成功的文件ID（不管是否已上传到HDFS，都可以批量构建）
        const files = this.completedFiles.filter(f => f.success && f.fileId);
        if (files.length === 0) {
          this.$message.warning('没有可用的文件，请先上传文件');
          return;
        }
        
        // 提取文件ID列表
        const fileIds = files.map(f => f.fileId).filter(Boolean);
        if (fileIds.length === 0) {
          this.$message.warning('没有有效的文件ID');
          return;
        }
        
        // 调用Hadoop API批量构建知识图谱
        const response = await hadoop.batchBuildKG(fileIds, true);
        
        if (response.data && response.data.status === 'accepted' && response.data.task_id) {
          this.hadoopTaskId = response.data.task_id;
          this.hadoopProgress = 0;
          this.hadoopStatus = 'processing';
          this.$message.success(`批量构建任务已启动，任务ID: ${response.data.task_id}`);
          
          // 开始查询进度
          this.startHadoopProgressCheck();
        } else {
          throw new Error(response.data?.message || '获取任务ID失败');
        }
      } catch (error) {
        console.error('批量构建任务启动失败:', error);
        const errorMsg = error.response?.data?.detail || error.message || '批量构建任务启动失败';
        this.$message.error(errorMsg);
      } finally {
        this.batchBuildLoading = false;
      }
    },
    
    // 开始查询Hadoop任务进度
    startHadoopProgressCheck() {
      // 清除可能存在的旧定时器
      if (this.progressInterval) {
        clearInterval(this.progressInterval);
      }
      
      this.progressInterval = setInterval(async () => {
        try {
          const response = await hadoop.getBatchTaskStatus(this.hadoopTaskId);
          const taskData = response.data;
          
          if (!taskData || !taskData.task) {
            console.warn('任务数据为空');
            return;
          }
          
          const task = taskData.task;
          
          // 更新进度和状态
          this.hadoopProgress = task.progress || 0;
          this.hadoopStatus = task.status || '';
          
          // 更新状态文本显示
          if (task.message) {
            // 可以在这里更新更详细的状态信息
          }
          
          // 如果任务完成或失败，停止查询
          if (task.status === 'completed' || task.status === 'failed') {
            clearInterval(this.progressInterval);
            this.progressInterval = null;
            
            const message = task.message || '';
            if (task.status === 'completed') {
              const entitiesCount = task.entities_created || 0;
              const relationsCount = task.relations_created || 0;
              this.$message.success(
                `批量构建完成！共生成 ${entitiesCount} 个实体和 ${relationsCount} 条关系。${message}`
              );
              // 写入图谱构建历史，便于历史记录页正确显示
              saveHistoryRecord(HISTORY_TYPES.GRAPH_BUILD, {
                graphName: '批量构建',
                graphId: this.hadoopTaskId,
                entities_created: entitiesCount,
                relations_created: relationsCount
              }, { status: 'success' });
            } else {
              this.$message.error(`批量构建失败: ${message}`);
              saveHistoryRecord(HISTORY_TYPES.GRAPH_BUILD, {
                graphName: '批量构建',
                graphId: this.hadoopTaskId
              }, { status: 'failed' });
            }
          }
        } catch (error) {
          console.error('查询Hadoop任务进度失败:', error);
          // 如果任务不存在，停止查询
          if (error.response && error.response.status === 404) {
            clearInterval(this.progressInterval);
            this.progressInterval = null;
            this.$message.warning('任务不存在，已停止查询');
          }
        }
      }, 2000);
    },
    
    // 获取状态文本
    getStatusText(status) {
      const statusMap = {
        'processing': '处理中',
        'completed': '已完成',
        'failed': '失败',
        'pending': '等待中'
      };
      return statusMap[status] || status || '未知';
    },

    // ---------- 文档知识库 ----------
    async loadKbBasesList() {
      try {
        const res = await kb.listBases();
        const d = res.data;
        if (d && d.status === 'success' && d.data && Array.isArray(d.data.list)) {
          this.kbBasesList = d.data.list;
          if (this.kbBasesList.length > 0 && !this.kbBasesList.some(b => b.id === this.selectedKbId)) {
            this.selectedKbId = this.kbBasesList[0].id;
          }
        } else {
          this.kbBasesList = [];
        }
      } catch (e) {
        this.kbBasesList = [];
      }
    },
    async ingestToKb(file) {
      const fileId = file.fileId != null ? String(file.fileId).trim() : '';
      if (!fileId) {
        this.$message.warning('该文件暂无 fileId，请确认上传成功后再点击「入库」');
        return;
      }
      this.$set(file, 'ingestingKb', true);
      try {
        const res = await kb.ingestWithFileId(fileId, this.selectedKbId || null);
        const d = res.data;
        if (d && d.status === 'success') {
          this.$set(file, 'kbIngested', true);
          this.$set(file, 'kbChunkCount', d.chunk_count || 0);
          this.$message.success(`${file.name} 已入库，共 ${d.chunk_count || 0} 块`);
          this.loadKbDocList();
        } else {
          throw new Error(d?.message || '入库失败');
        }
      } catch (e) {
        const status = e.response?.status;
        const detail = e.response?.data?.detail;
        let msg = typeof detail === 'string' ? detail : (e.message || '入库失败');
        if (status === 404) {
          msg = '文件信息已失效（可能服务已重启），请重新上传该文件后再点击「入库」。';
        }
        this.$message.error(`${file.name} 入库失败: ${msg}`);
      } finally {
        this.$set(file, 'ingestingKb', false);
      }
    },

    async batchIngestToKb() {
      const files = this.completedFiles.filter(f => f.success && f.fileId != null && !f.kbIngested);
      if (files.length === 0) {
        this.$message.warning('没有可入库的文件');
        return;
      }
      this.batchKbLoading = true;
      let ok = 0;
      for (const f of files) {
        try {
          const fileId = String(f.fileId).trim();
          const res = await kb.ingestWithFileId(fileId, this.selectedKbId || null);
          if (res.data && res.data.status === 'success') {
            this.$set(f, 'kbIngested', true);
            this.$set(f, 'kbChunkCount', res.data.chunk_count || 0);
            ok++;
          }
        } catch (e) {
          console.warn('batch ingest fail:', f.name, e);
        }
      }
      this.batchKbLoading = false;
      this.$message.success(`批量入库完成：成功 ${ok}/${files.length}`);
      this.loadKbDocList();
    },

    async loadKbDocList() {
      this.kbListLoading = true;
      try {
        const res = await kb.list();
        const d = res.data;
        if (d && d.status === 'success' && d.data && Array.isArray(d.data.list)) {
          this.kbDocList = d.data.list.map((row) => ({
            ...row,
            doc_id: row.doc_id,
            source_file: row.source_file || row.doc_id || '—',
            source_type: row.source_type || '—',
            chunk_count: row.chunk_count != null ? row.chunk_count : 0
          }));
        } else {
          this.kbDocList = [];
        }
      } catch (e) {
        this.kbDocList = [];
        this.$message.error(e.response?.data?.detail || e.message || '获取文档列表失败');
      } finally {
        this.kbListLoading = false;
      }
    },

    canReindexKb(doc) {
      return this.completedFiles.some(f => f.success && f.fileId === doc.doc_id);
    },

    deleteKbDoc(doc) {
      this.$confirm(`确认删除「${doc.source_file || doc.doc_id}」？将移除该文档的全部向量块。`, '删除文档', {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          await kb.deleteDocument(doc.doc_id);
          this.$message.success('已删除');
          this.loadKbDocList();
        } catch (e) {
          this.$message.error(e.response?.data?.detail || e.message || '删除失败');
        }
      }).catch(() => {});
    },

    async reindexKbDoc(doc) {
      if (!this.canReindexKb(doc)) {
        this.$message.warning('仅当该文档对应的文件仍在当前页「已完成」列表中时可重索引');
        return;
      }
      try {
        const res = await kb.reindex(doc.doc_id);
        const d = res.data;
        if (d && d.status === 'success') {
          this.$message.success(`重索引完成：${d.chunk_count} 块`);
          this.loadKbDocList();
          const f = this.completedFiles.find(x => x.fileId === doc.doc_id);
          if (f) {
            f.kbChunkCount = d.chunk_count;
          }
        } else {
          throw new Error(d?.message || '重索引失败');
        }
      } catch (e) {
        this.$message.error(e.response?.data?.detail || e.message || '重索引失败');
      }
    },

    // 手动刷新任务状态
    async refreshTaskStatus() {
      if (!this.hadoopTaskId) {
        return;
      }
      
      this.refreshingStatus = true;
      try {
        const response = await hadoop.getBatchTaskStatus(this.hadoopTaskId);
        const taskData = response.data;
        
        if (taskData && taskData.task) {
          const task = taskData.task;
          this.hadoopProgress = task.progress || 0;
          this.hadoopStatus = task.status || '';
          
          if (task.status === 'completed' || task.status === 'failed') {
            // 如果任务已完成或失败，停止自动查询
            if (this.progressInterval) {
              clearInterval(this.progressInterval);
              this.progressInterval = null;
            }
          }
        }
        
        this.$message.success('状态已刷新');
      } catch (error) {
        console.error('刷新任务状态失败:', error);
        this.$message.error('刷新状态失败');
      } finally {
        this.refreshingStatus = false;
      }
    }
  },
  
  // 组件销毁时清理定时器
  beforeDestroy() {
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
      this.progressInterval = null;
    }
  }
};
</script>

<style scoped>
.upload-page {
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

/* 上传区域 */
.upload-section {
  margin-bottom: 30px;
  animation: fadeInUp 0.5s ease-out 0.1s both;
}

.upload-card {
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  transition: all 0.3s ease;
}

.upload-card:hover {
  box-shadow: var(--shadow-card-hover);
  border-color: var(--primary-blue);
}

.drop-zone {
  border: 2px dashed var(--border-primary);
  border-radius: var(--radius-md);
  padding: 60px 20px;
  text-align: center;
  transition: all 0.3s ease;
  background: var(--bg-secondary);
  cursor: pointer;
  min-height: 250px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.drop-zone.dragover {
  border-color: var(--primary-blue);
  background: rgba(0, 212, 255, 0.1);
  transform: scale(1.02);
  box-shadow: 0 0 30px rgba(0, 212, 255, 0.2);
}

.drop-content {
  max-width: 500px;
}

.upload-icon {
  font-size: 60px;
  color: var(--primary-blue);
  margin-bottom: 20px;
  animation: pulse 2s infinite;
}

.upload-title {
  font-size: 24px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 10px;
}

.upload-description {
  color: var(--text-secondary);
  margin-bottom: 30px;
  font-size: 14px;
}

.browse-btn {
  background: linear-gradient(135deg, #0d9488 0%, #14b8a6 50%, #22d3ee 100%);
  border: none;
  padding: 12px 30px;
  font-size: 16px;
  font-weight: 600;
  border-radius: var(--radius-md);
  transition: all 0.3s ease;
}

.browse-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 0 20px rgba(20, 184, 166, 0.5);
}

.file-types {
  margin-top: 20px;
  font-size: 12px;
  color: var(--text-secondary);
  display: flex;
  justify-content: center;
  gap: 20px;
}

/* 文件列表区域 */
.file-list-section {
  margin-bottom: 30px;
  animation: fadeInUp 0.5s ease-out 0.2s both;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--border-primary);
}

.section-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary);
}

.clear-btn {
  transition: all 0.3s ease;
}

.clear-btn:hover {
  background: var(--error-color);
  color: white;
  box-shadow: 0 0 10px rgba(245, 34, 45, 0.3);
}

/* 文件卡片 */
.file-card {
  margin-bottom: 15px;
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  transition: all 0.3s ease;
  cursor: default;
}

.file-card:hover {
  box-shadow: var(--shadow-card-hover);
  border-color: var(--primary-blue);
  transform: translateY(-2px);
}

.file-info {
  display: flex;
  align-items: flex-start;
  gap: 15px;
}

.file-icon {
  font-size: 40px;
  color: var(--primary-blue);
  position: relative;
  margin-top: 5px;
}

.status-icon {
  position: absolute;
  bottom: 0;
  right: -5px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: white;
}

.status-icon.success {
  background: var(--success-color);
}

.status-icon.error {
  background: var(--error-color);
}

.file-details {
  flex: 1;
  min-width: 0;
}

.file-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 5px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.file-meta {
  display: flex;
  gap: 20px;
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 5px;
}

.file-status {
  font-weight: 500;
}

.file-status.success {
  color: var(--success-color);
}

.file-status.error {
  color: var(--error-color);
}

.file-message {
  font-size: 12px;
  color: var(--text-secondary);
  padding: 5px 10px;
  background: var(--bg-secondary);
  border-radius: var(--radius-small);
  margin-top: 5px;
}

.file-actions {
  display: flex;
  gap: 8px;
}

/* 上传进度 */
.upload-progress {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid var(--border-primary);
  display: flex;
  align-items: center;
  gap: 15px;
}

.progress-bar {
  flex: 1;
}

.progress-text {
  width: 40px;
  text-align: right;
  font-size: 14px;
  color: var(--text-secondary);
}

/* 上传控制 */
.upload-controls {
  margin-bottom: 30px;
  animation: fadeInUp 0.5s ease-out 0.3s both;
}

.controls-card {
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
}

.controls-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pending-info {
  font-size: 16px;
  font-weight: 500;
  color: var(--text-primary);
}

.pending-count {
  color: var(--primary-blue);
}

.controls-buttons {
  display: flex;
  gap: 15px;
}

.control-btn {
  transition: all 0.3s ease;
}

.control-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

/* 上传统计 */
.upload-stats {
  margin-bottom: 30px;
  animation: fadeInUp 0.5s ease-out 0.4s both;
}

.stats-card {
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
}

.stats-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 30px;
}

.stat-item {
  text-align: center;
  padding: 20px 0;
}

.stat-value {
  font-size: 32px;
  font-weight: 700;
  color: var(--primary-blue);
  margin-bottom: 8px;
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

/* 文档知识库区域样式 */
.kb-section {
  margin-bottom: 30px;
  animation: fadeInUp 0.5s ease-out 0.45s both;
}

.kb-card {
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
}

.kb-content {
  text-align: left;
}

.kb-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.kb-description {
  color: var(--text-secondary);
  margin-bottom: 16px;
  font-size: 14px;
}

.kb-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.kb-toolbar-label {
  font-size: 14px;
  color: var(--text-secondary);
}

.kb-btn {
  transition: all 0.3s ease;
}

.kb-list-wrap {
  min-height: 120px;
}

.kb-table {
  width: 100%;
}

/* 文档列表条纹行：与深色主题一致，避免白底/文字发虚 */
.kb-table >>> .el-table__row--striped td {
  background: var(--bg-secondary) !important;
  color: var(--text-primary);
}
.kb-table >>> .el-table td,
.kb-table >>> .el-table th {
  color: var(--text-primary);
  border-color: var(--border-light);
}
.kb-table >>> .el-table {
  background: var(--bg-card);
  color: var(--text-primary);
}
.kb-table >>> .el-table thead {
  color: var(--text-secondary);
}

/* 文档列表行悬停：保持深色背景与可读文字，避免整行变白 */
.kb-table >>> .el-table__body tr:hover > td {
  background: rgba(255, 255, 255, 0.06) !important;
  color: var(--text-primary) !important;
}
.kb-table >>> .el-table__row--striped:hover > td {
  background: rgba(255, 255, 255, 0.08) !important;
  color: var(--text-primary) !important;
}

.kb-empty {
  color: var(--text-secondary);
  font-size: 14px;
  padding: 24px 0;
  text-align: center;
}

.kb-badge {
  font-size: 12px;
  color: var(--success-color);
  margin-right: 4px;
}

/* Hadoop批量操作区域样式 */
.hadoop-section {
  margin-bottom: 30px;
  animation: fadeInUp 0.5s ease-out 0.5s both;
}

.hadoop-card {
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
}

.hadoop-content {
  text-align: center;
}

.hadoop-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.hadoop-description {
  color: var(--text-secondary);
  margin-bottom: 20px;
  font-size: 14px;
}

.hadoop-buttons {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.hadoop-btn {
  transition: all 0.3s ease;
  padding: 10px 25px;
  font-size: 16px;
  font-weight: 600;
}

.hadoop-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 0 15px rgba(0, 212, 255, 0.4);
}

/* Hadoop任务状态样式 */
.hadoop-status {
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  padding: 20px;
  margin-top: 20px;
}

.status-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--border-primary);
}

.status-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}

.task-id {
  font-size: 14px;
  color: var(--primary-blue);
  background: rgba(0, 212, 255, 0.1);
  padding: 4px 10px;
  border-radius: var(--radius-small);
}

.status-content {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.status-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  color: var(--text-secondary);
}

.status-text {
  font-weight: 500;
}

.status-detail {
  margin-top: 10px;
  display: flex;
  justify-content: flex-end;
}

/* 模板下载 */
.template-section {
  animation: fadeInUp 0.5s ease-out 0.5s both;
}

.template-card {
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
}

.template-content {
  text-align: center;
}

.template-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.template-description {
  color: var(--text-secondary);
  margin-bottom: 20px;
  font-size: 14px;
}

.template-list {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
}

.template-btn {
  background: var(--bg-secondary);
  color: var(--text-primary);
  border: 1px solid var(--border-primary);
  transition: all 0.3s ease;
}

.template-btn:hover {
  background: var(--primary-blue);
  color: white;
  border-color: var(--primary-blue);
  transform: translateY(-2px);
  box-shadow: 0 0 10px rgba(0, 212, 255, 0.4);
}

/* 预览弹窗 */
.preview-dialog {
  background: rgba(10, 14, 39, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid var(--border-primary);
}

.preview-content {
  padding: 10px 0;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--border-primary);
}

.preview-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

.preview-size {
  font-size: 14px;
  color: var(--text-secondary);
}

.preview-body {
  max-height: 500px;
  overflow-y: auto;
}

.file-content {
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  padding: 20px;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.5;
  color: var(--text-primary);
  white-space: pre-wrap;
  word-break: break-all;
}

/* 自定义进度条颜色 */
.progress-bar .el-progress-bar__inner {
  background: var(--gradient-main);
  transition: width 0.3s ease;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .upload-page {
    padding: 15px;
  }
  
  .drop-zone {
    padding: 40px 15px;
    min-height: 200px;
  }
  
  .upload-icon {
    font-size: 40px;
  }
  
  .upload-title {
    font-size: 20px;
  }
  
  .file-info {
    flex-direction: column;
    gap: 10px;
  }
  
  .file-icon {
    font-size: 30px;
  }
  
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
  
  .controls-content {
    flex-direction: column;
    gap: 15px;
    align-items: flex-start;
  }
  
  .stats-content {
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
  }
  
  .stat-value {
    font-size: 24px;
  }
  
  .file-types {
    flex-direction: column;
    gap: 10px;
  }
  
  /* 文档知识库响应式 */
  .kb-toolbar {
    flex-direction: column;
    align-items: flex-start;
  }

  /* Hadoop响应式样式 */
  .hadoop-buttons {
    flex-direction: column;
    align-items: center;
  }
  
  .hadoop-btn {
    width: 100%;
    max-width: 300px;
  }
  
  .status-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
}

/* 动画效果 */
@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.8;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}
</style>