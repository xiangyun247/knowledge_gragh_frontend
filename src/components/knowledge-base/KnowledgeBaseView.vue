<template>
  <div class="kb-page">
    <!-- 左侧侧边栏：个人/共享 + 我创建的/我加入的 -->
    <aside class="kb-sidebar" :class="{ collapsed: sidebarCollapsed }">
      <div class="sidebar-header">
        <el-button
          type="text"
          class="sidebar-collapse-btn"
          :icon="sidebarCollapsed ? 'el-icon-s-operation' : 'el-icon-fold'"
          @click="sidebarCollapsed = !sidebarCollapsed"
        ></el-button>
      </div>
      <template v-if="!sidebarCollapsed">
        <nav class="sidebar-nav">
          <div
            :class="['sidebar-nav-item', { active: activeTab === 'personal' }]"
            @click="activeTab = 'personal'; loadDocList()"
          >
            <i class="el-icon-folder-add"></i>
            <span>个人知识库</span>
          </div>
          <div
            :class="['sidebar-nav-item', { active: activeTab === 'shared' }]"
            @click="activeTab = 'shared'"
          >
            <i class="el-icon-folder-opened"></i>
            <span>共享知识库</span>
          </div>
        </nav>
        <div class="sidebar-sections">
          <div class="sidebar-section">
            <div class="section-title" @click="createdExpanded = !createdExpanded">
              <i :class="createdExpanded ? 'el-icon-arrow-down' : 'el-icon-arrow-right'"></i>
              <span>我创建的</span>
              <el-tooltip content="新建知识库" placement="right">
                <el-button type="text" size="mini" class="section-add" icon="el-icon-plus" @click.stop="openCreateKb"></el-button>
              </el-tooltip>
            </div>
            <div v-show="createdExpanded" class="section-list">
              <div
                v-for="base in kbBases"
                :key="base.id"
                :class="['section-item', { active: activeBase === base.id }]"
                @click="activeBase = base.id; loadDocList()"
              >
                <i class="el-icon-document"></i>
                <span class="section-item-name">{{ base.name }}</span>
                <span class="section-count" v-if="activeBase === base.id && docList.length > 0">{{ docList.length }}</span>
                <el-button
                  v-if="base.id !== 'default'"
                  type="text"
                  size="mini"
                  class="section-item-rename"
                  icon="el-icon-edit"
                  @click.stop="openRenameKb(base)"
                ></el-button>
              </div>
            </div>
          </div>
          <div class="sidebar-section">
            <div class="section-title" @click="joinedExpanded = !joinedExpanded">
              <i :class="joinedExpanded ? 'el-icon-arrow-down' : 'el-icon-arrow-right'"></i>
              <span>我加入的</span>
            </div>
            <div v-show="joinedExpanded" class="section-list">
              <div class="section-item empty-hint">暂无加入的知识库</div>
            </div>
          </div>
        </div>
      </template>
    </aside>

    <!-- 主内容区 -->
    <main class="kb-main">
      <header class="kb-main-header">
        <h1 class="kb-main-title">{{ activeTab === 'personal' ? (activeBaseName || '个人知识库') : '共享知识库' }}</h1>
        <div class="kb-main-actions">
          <el-tooltip content="检索文献" placement="bottom">
            <el-button type="text" icon="el-icon-search" @click="toggleSearchPanel"></el-button>
          </el-tooltip>
          <el-tooltip content="上传文档" placement="bottom">
            <el-button type="text" icon="el-icon-upload2" @click="goUpload"></el-button>
          </el-tooltip>
        </div>
      </header>

      <!-- 检索栏：仅点击「检索文献」后展示 -->
      <div class="search-section" v-show="searchPanelVisible">
        <div class="search-bar-wrapper">
          <el-input
            ref="searchInput"
            v-model="query"
            placeholder="输入问题或关键词，检索文献片段..."
            class="search-input"
            size="medium"
            clearable
            @keyup.enter.native="handleSearch"
          >
            <el-button slot="append" type="primary" icon="el-icon-search" @click="handleSearch" class="search-btn"></el-button>
          </el-input>
          <div class="search-filters">
            <span class="filter-label">类型：</span>
            <el-radio-group v-model="sourceType" size="small" class="filter-group">
              <el-radio-button label="">全部</el-radio-button>
              <el-radio-button label="pdf">PDF</el-radio-button>
              <el-radio-button label="txt">TXT</el-radio-button>
              <el-radio-button label="json">JSON</el-radio-button>
            </el-radio-group>
            <span class="filter-label filter-label--right">条数：</span>
            <el-select v-model="k" size="small" class="k-select">
              <el-option :value="5" label="5 条" />
              <el-option :value="10" label="10 条" />
              <el-option :value="20" label="20 条" />
            </el-select>
          </div>
        </div>
        <div class="hot-searches">
          <span class="hot-label">示例：</span>
          <el-tag
            v-for="tag in exampleQueries"
            :key="tag"
            type="info"
            @click="query = tag; handleSearch()"
            class="hot-tag"
          >{{ tag }}</el-tag>
        </div>
      </div>

      <!-- 检索结果列表 -->
      <div class="results-section" v-if="hits.length > 0">
        <div class="results-header">
          <h2 class="results-title">检索结果 <span class="result-count">({{ hits.length }})</span></h2>
        </div>
        <div class="results-list">
          <el-card
            v-for="(item, idx) in pagedHits"
            :key="item.id || idx"
            class="result-card"
            shadow="hover"
            @click.native="openDetail(item)"
          >
            <div class="result-content">
              <div class="result-meta">
                <el-tag size="mini" type="info">{{ (item.metadata && item.metadata.source_type) || 'doc' }}</el-tag>
                <span class="source-file">{{ (item.metadata && item.metadata.source_file) || '未知' }}</span>
                <span class="relevance">{{ relevanceText(item.distance) }}</span>
              </div>
              <p class="result-text">{{ snippet(item.text) }}</p>
              <el-button type="text" size="small" class="more-btn" @click.stop="openDetail(item)">查看全文</el-button>
            </div>
          </el-card>
        </div>
        <el-pagination
          v-if="hits.length > pageSize"
          class="results-pagination"
          background
          layout="prev, pager, next"
          :page-size="pageSize"
          :total="hits.length"
          :current-page.sync="page"
        />
      </div>

      <!-- 个人知识库下：仅展示已上传的文档卡片（仿 Ima） -->
      <div class="doc-grid-section" v-else-if="activeTab === 'personal' && !loading && docList.length > 0 && !(searchPanelVisible && query)">
        <div class="results-header">
          <h2 class="results-title">我的文档 <span class="result-count">({{ docList.length }})</span></h2>
        </div>
        <div class="doc-grid">
          <el-card
            v-for="doc in docList"
            :key="doc.doc_id"
            class="doc-card"
            shadow="hover"
            @click.native="searchByDoc(doc)"
          >
            <div class="doc-card-preview">
              <i class="el-icon-document"></i>
            </div>
            <div class="doc-card-body">
              <div class="doc-card-title" :title="doc.source_file">{{ doc.source_file || doc.doc_id }}</div>
              <div class="doc-card-meta">
                <el-tag size="mini" type="info">{{ (doc.source_type || 'doc').toUpperCase() }}</el-tag>
                <span class="doc-chunks">{{ doc.chunk_count || 0 }} 片段</span>
              </div>
            </div>
          </el-card>
        </div>
      </div>

      <div class="loading-state" v-else-if="loading">
        <el-empty description="检索中…" class="empty-search">
          <i class="el-icon-loading" style="font-size: 32px; color: var(--primary-blue);"></i>
        </el-empty>
      </div>

      <div class="empty-state" v-else-if="searchPanelVisible && query && !loading && hits.length === 0">
        <el-empty description="未找到相关文献" class="empty-search">
          <el-button type="primary" @click="query = ''">重新检索</el-button>
        </el-empty>
      </div>

      <div class="welcome-state" v-else-if="activeTab === 'personal' && !loading && docList.length === 0">
        <el-empty description="暂无文档，上传后即可在此查看与检索" class="empty-search">
          <el-button type="primary" @click="goUpload">去上传</el-button>
        </el-empty>
      </div>

      <div class="welcome-state" v-else-if="!query && !loading && activeTab === 'shared'">
        <el-empty description="共享知识库功能即将开放" class="empty-search"></el-empty>
      </div>
    </main>

    <!-- 底部：基于知识库提问（固定于视口底部，避免卡在结果中间） -->
    <div
      class="kb-ask-bar"
      :style="{ left: sidebarCollapsed ? '56px' : '240px' }"
    >
      <el-input
        v-model="askQuery"
        placeholder="基于知识库提问"
        size="medium"
        class="kb-ask-input"
        @keyup.enter.native="goAsk"
      >
        <el-button
          slot="append"
          type="primary"
          icon="el-icon-s-promotion"
          @click="goAsk"
          :loading="askLoading"
        >发送</el-button>
      </el-input>
      <p class="kb-ask-tip">内容由 AI 生成，仅供参考</p>
    </div>

    <!-- 新建知识库 -->
    <el-dialog
      title="新建知识库"
      :visible.sync="createDialogVisible"
      width="400px"
      @close="newKbName = ''"
    >
      <el-input v-model="newKbName" placeholder="输入知识库名称" maxlength="128" show-word-limit />
      <template slot="footer">
        <el-button @click="createDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmCreateKb">创建</el-button>
      </template>
    </el-dialog>

    <!-- 重命名知识库 -->
    <el-dialog
      title="重命名知识库"
      :visible.sync="renameDialogVisible"
      width="400px"
      @close="renameTargetKb = null; renameName = ''"
    >
      <el-input v-model="renameName" placeholder="输入新名称" maxlength="128" show-word-limit />
      <template slot="footer">
        <el-button @click="renameDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmRenameKb">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog
      :visible.sync="detailVisible"
      :title="detailItem ? (detailItem.metadata && detailItem.metadata.source_file) || '文献片段' : '文献片段'"
      width="640px"
      class="detail-dialog"
    >
      <div class="detail-body" v-if="detailItem">
        <div class="detail-meta">
          <el-tag size="small">{{ (detailItem.metadata && detailItem.metadata.source_type) || '-' }}</el-tag>
          <span class="detail-source">{{ (detailItem.metadata && detailItem.metadata.source_file) || '-' }}</span>
        </div>
        <div class="detail-text">{{ detailItem.text || '' }}</div>
      </div>
    </el-dialog>

    <!-- 基于知识库问答的回答展示 -->
    <el-dialog
      :visible.sync="askDialogVisible"
      title="基于知识库的回答"
      width="720px"
      class="kb-ask-dialog"
    >
      <div class="kb-ask-answer">
        <pre class="kb-ask-answer-text">{{ askAnswer }}</pre>
      </div>
      <template slot="footer">
        <el-button @click="askDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { kb } from '../../api'
import storage from '../../utils/storage'

export default {
  name: 'KnowledgeBaseView',
  data() {
    return {
      sidebarCollapsed: false,
      activeTab: 'personal',
      createdExpanded: true,
      joinedExpanded: true,
      searchPanelVisible: false,
      query: '',
      sourceType: '',
      k: 10,
      page: 1,
      pageSize: 5,
      loading: false,
      hits: [],
      docList: [],
      askQuery: '',
      askLoading: false,
      askDialogVisible: false,
      askAnswer: '',
      askSources: [],
      detailVisible: false,
      detailItem: null,
      exampleQueries: ['认知障碍与记忆减退', '服药提醒与日常照护', '高血压用药', '慢性肾病饮食'],
      kbBases: [],
      activeBase: 'default',
      createDialogVisible: false,
      newKbName: '',
      renameDialogVisible: false,
      renameTargetKb: null,
      renameName: ''
    }
  },
  created() {
    const { q, k: kq, type } = this.$route.query || {}
    if (q) {
      this.query = q
      this.searchPanelVisible = true
    }
    if (kq) this.k = Math.min(100, Math.max(1, parseInt(kq, 10) || 10))
    if (type) this.sourceType = type
    this.loadKbBases()
    this.loadDocList()
    if (this.query) this.handleSearch()
  },
  computed: {
    pagedHits() {
      const start = (this.page - 1) * this.pageSize
      return this.hits.slice(start, start + this.pageSize)
    },
    activeBaseName() {
      const b = this.kbBases.find(x => x.id === this.activeBase)
      return b ? b.name : '我的知识库'
    }
  },
  methods: {
    async loadKbBases() {
      try {
        const res = await kb.listBases()
        const d = res.data
        if (d && d.status === 'success' && d.data && Array.isArray(d.data.list)) {
          this.kbBases = d.data.list
          if (this.kbBases.length > 0 && !this.kbBases.some(b => b.id === this.activeBase)) {
            this.activeBase = this.kbBases[0].id
          }
        } else {
          this.kbBases = []
        }
      } catch (e) {
        this.kbBases = []
      }
    },
    openCreateKb() {
      this.newKbName = '未命名知识库'
      this.createDialogVisible = true
    },
    async confirmCreateKb() {
      const name = (this.newKbName || '').trim() || '未命名知识库'
      try {
        const res = await kb.createBase(name)
        const d = res.data
        if (d && d.status === 'success' && d.data) {
          this.$message.success('已创建知识库：' + (d.data.name || name))
          this.createDialogVisible = false
          await this.loadKbBases()
          this.activeBase = d.data.id
          this.loadDocList()
        } else {
          throw new Error(d?.message || '创建失败')
        }
      } catch (e) {
        this.$message.error(e.response?.data?.detail || e.message || '创建失败')
      }
    },
    openRenameKb(base) {
      this.renameTargetKb = base
      this.renameName = base.name || ''
      this.renameDialogVisible = true
    },
    async confirmRenameKb() {
      if (!this.renameTargetKb) return
      const name = (this.renameName || '').trim() || '未命名知识库'
      try {
        const res = await kb.renameBase(this.renameTargetKb.id, name)
        const d = res.data
        if (d && d.status === 'success') {
          this.$message.success('已重命名')
          this.renameDialogVisible = false
          this.renameTargetKb = null
          await this.loadKbBases()
        } else {
          throw new Error(d?.message || '重命名失败')
        }
      } catch (e) {
        this.$message.error(e.response?.data?.detail || e.message || '重命名失败')
      }
    },
    async loadDocList() {
      if (this.activeTab !== 'personal') return
      try {
        const res = await kb.list(this.activeBase, this.sourceType || null, 500)
        const d = res.data
        if (d && d.status === 'success' && d.data && Array.isArray(d.data.list)) {
          this.docList = d.data.list
        } else {
          this.docList = []
        }
      } catch (e) {
        this.docList = []
      }
    },
    toggleSearchPanel() {
      this.searchPanelVisible = !this.searchPanelVisible
      if (this.searchPanelVisible) {
        this.$nextTick(() => {
          this.$refs.searchInput && this.$refs.searchInput.focus()
        })
      }
    },
    goUpload() {
      this.$router.push('/upload')
    },
    searchByDoc(doc) {
      const name = (doc.source_file || doc.doc_id || '').replace(/\.[^.]+$/, '')
      this.query = name ? `与「${name}」相关的内容` : ''
      this.searchPanelVisible = true
      this.handleSearch()
    },
    async handleSearch() {
      const q = (this.query || '').trim()
      if (!q) {
        this.$message.warning('请输入检索词')
        return
      }
      this.page = 1
      this.loading = true
      this.hits = []
      try {
        const res = await kb.search(q, this.k, this.activeBase, this.sourceType || null)
        const d = res.data
        if (d && d.status === 'success' && Array.isArray(d.data)) {
          this.hits = d.data
        }
      } catch (e) {
        this.$message.error(e.response && e.response.data && e.response.data.detail ? e.response.data.detail : '检索失败，请稍后重试')
      } finally {
        this.loading = false
      }
    },
    snippet(t) {
      if (!t) return ''
      const max = 220
      return t.length <= max ? t : t.slice(0, max) + '…'
    },
    relevanceText(d) {
      if (d == null) return ''
      const d0 = Number(d)
      if (d0 <= 0.3) return '高相关'
      if (d0 <= 0.7) return '相关'
      return '参考'
    },
    openDetail(item) {
      this.detailItem = item
      this.detailVisible = true
    },
    async goAsk() {
      const q = (this.askQuery || '').trim()
      if (q) {
        this.askLoading = true
        try {
          const model = storage.get('chat_llm_model')
          const opts = {
            kb_id: this.activeBase === 'default' ? null : this.activeBase,
            k: this.k || 5,
            source_type: this.sourceType || null,
            model: model || null
          }
          const res = await kb.ask(q, opts)
          const d = res.data
          if (d && d.status === 'success' && d.data) {
            this.askAnswer = d.data.answer || ''
            this.askSources = d.data.sources || []
            this.askDialogVisible = true
            this.askQuery = ''
          } else {
            this.$message.error(d?.message || '基于知识库的回答生成失败')
          }
        } catch (e) {
          this.$message.error(e.response?.data?.detail || e.message || '基于知识库的回答生成失败')
        } finally {
          this.askLoading = false
        }
      } else {
        this.$message.info('请输入问题后发送')
      }
    }
  }
}
</script>

<style scoped>
.kb-page {
  display: flex;
  min-height: calc(100vh - 120px);
}

/* 左侧侧边栏 */
.kb-sidebar {
  width: 240px;
  min-width: 240px;
  background: rgba(255, 255, 255, 0.05);
  border-right: 1px solid var(--border-primary);
  display: flex;
  flex-direction: column;
  transition: width 0.2s ease, min-width 0.2s ease;
}

.kb-sidebar.collapsed {
  width: 56px;
  min-width: 56px;
}

.sidebar-header {
  padding: 12px;
  border-bottom: 1px solid var(--border-light);
}

.sidebar-collapse-btn {
  color: var(--text-secondary);
  font-size: 18px;
}

.sidebar-nav {
  padding: 12px 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.sidebar-nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 8px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.sidebar-nav-item i {
  font-size: 18px;
}

.sidebar-nav-item:hover {
  background: rgba(255, 255, 255, 0.08);
  color: var(--text-primary);
}

.sidebar-nav-item.active {
  background: rgba(0, 245, 212, 0.15);
  color: #00f5d4;
}

.sidebar-sections {
  flex: 1;
  padding: 8px;
  overflow-y: auto;
}

.sidebar-section {
  margin-bottom: 8px;
}

.sidebar-section .section-title {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 10px;
  font-size: 13px;
  color: var(--text-secondary);
  cursor: pointer;
  user-select: none;
}

.sidebar-section .section-title:hover {
  color: var(--text-primary);
}

.section-add {
  margin-left: auto;
  padding: 0 4px;
}

.section-list {
  padding-left: 8px;
}

.section-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 13px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.section-item i {
  font-size: 16px;
}

.section-item:hover {
  background: rgba(255, 255, 255, 0.06);
  color: var(--text-primary);
}

.section-item.active {
  background: rgba(0, 245, 212, 0.12);
  color: #00f5d4;
}

.section-count {
  margin-left: auto;
  font-size: 12px;
  color: var(--text-muted);
}

.section-item.active .section-count {
  color: rgba(0, 245, 212, 0.9);
}

.section-item-name {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.section-item-rename {
  padding: 0 4px;
  margin-left: 4px;
  opacity: 0.6;
}

.section-item-rename:hover {
  opacity: 1;
}

.section-item.empty-hint {
  cursor: default;
  color: var(--text-muted);
  font-style: italic;
}

/* 主内容区 */
.kb-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  padding: 20px 24px;
  overflow-y: auto;
}

.kb-main-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.kb-main-title {
  font-size: 20px;
  font-weight: 600;
  color: #00f5d4;
  margin: 0;
  background: none;
  -webkit-background-clip: border-box;
  -webkit-text-fill-color: #00f5d4;
  background-clip: border-box;
  text-shadow: none;
}

.kb-main-actions .el-button {
  color: var(--text-secondary);
}

.kb-main-actions .el-button:hover {
  color: var(--primary-blue);
}

.search-section {
  margin-bottom: 24px;
}

.search-bar-wrapper {
  margin-bottom: 12px;
}

.search-input {
  max-width: 560px;
  border-radius: 20px;
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
}

.search-input >>> .el-input__inner {
  border-radius: 20px;
}

.search-btn {
  border-radius: 0 20px 20px 0;
}

.search-filters {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 12px;
}

.filter-label {
  color: var(--text-secondary);
  font-size: 13px;
}

.filter-label--right {
  margin-left: 8px;
}

.filter-group {
  background: transparent;
}

.k-select {
  width: 90px;
}

.hot-searches {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

.hot-label {
  color: var(--text-secondary);
  font-size: 13px;
}

.hot-tag {
  cursor: pointer;
  transition: all 0.25s ease;
}

.hot-tag:hover {
  transform: translateY(-1px);
}

.results-section,
.doc-grid-section {
  animation: fadeInUp 0.35s ease-out;
}

/* 标题下横条：纯色分隔线，避免蓝紫渐变 */
.results-header {
  margin-bottom: 16px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--border-light);
}

.results-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.result-count {
  color: var(--primary-blue);
  font-size: 14px;
}

.results-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.results-pagination {
  margin-top: 16px;
  text-align: center;
}

.result-card {
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.25s ease;
}

.result-card:hover {
  border-color: var(--primary-blue);
  box-shadow: var(--shadow-card-hover);
}

.result-content {
  padding: 4px 0;
}

.result-meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 8px;
  font-size: 12px;
  color: var(--text-secondary);
}

.source-file {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.relevance {
  color: var(--primary-blue);
  font-weight: 500;
}

.result-text {
  color: var(--text-primary);
  line-height: 1.6;
  font-size: 14px;
  margin: 0 0 8px 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.more-btn {
  padding: 0;
  font-size: 13px;
}

/* 文档卡片网格 */
.doc-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}

.doc-card {
  cursor: pointer;
  transition: all 0.25s ease;
  border: 1px solid var(--border-primary);
  background: var(--bg-card);
}

.doc-card:hover {
  border-color: var(--primary-blue);
  box-shadow: var(--shadow-card-hover);
}

.doc-card-preview {
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 8px 8px 0 0;
  margin: -20px -20px 12px -20px;
}

.doc-card-preview i {
  font-size: 36px;
  color: var(--text-muted);
}

.doc-card-body {
  padding: 0;
}

.doc-card-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-bottom: 8px;
}

.doc-card-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: var(--text-secondary);
}

.doc-chunks {
  color: var(--text-muted);
}

.loading-state,
.empty-state,
.welcome-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 260px;
}

.welcome-hint {
  color: var(--text-secondary);
  font-size: 14px;
  margin-top: 12px;
}

/* 底部提问栏：位于结果下方，随页面滚动 */
.kb-ask-bar {
  margin-top: 24px;
  padding: 16px 24px 20px;
  background: var(--bg-card);
  border-top: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.kb-ask-input {
  max-width: 640px;
  width: 100%;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid var(--border-primary);
}

.kb-ask-input >>> .el-input__inner {
  border-radius: 24px;
  background: transparent;
}

.kb-ask-tip {
  margin: 0;
  font-size: 12px;
  color: var(--text-muted);
}

.detail-dialog >>> .el-dialog {
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
}

.detail-body {
  padding: 8px 0;
}

.detail-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
  font-size: 13px;
  color: var(--text-secondary);
}

.detail-text {
  color: var(--text-primary);
  line-height: 1.7;
  font-size: 14px;
  white-space: pre-wrap;
  word-break: break-word;
  max-height: 400px;
  overflow-y: auto;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .kb-sidebar {
    width: 56px;
    min-width: 56px;
  }

  .kb-sidebar .sidebar-nav-item span,
  .kb-sidebar .section-title span,
  .kb-sidebar .section-item span {
    display: none;
  }

  .kb-main {
    padding: 12px 16px;
  }

  .doc-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  }

  .kb-ask-bar {
    padding: 10px 16px 16px;
  }
}
</style>
