<template>
  <div class="graph-view-container">
    <!-- 顶部工具栏 -->
    <div class="graph-toolbar">
      <div class="toolbar-left">
        <h3>知识图谱可视化</h3>
      </div>
      <div class="toolbar-right">
        <!-- 图谱切换功能 -->
        <el-select
          v-model="selectedGraphId"
          placeholder="选择图谱"
          style="width: 200px; margin-right: 10px;"
          @change="handleGraphChange"
          clearable
          filterable
        >
          <el-option
            label="全部图谱（合并显示）"
            value=""
          ></el-option>
          <el-option
            v-for="graph in graphList"
            :key="graph.graph_id"
            :label="`${graph.graph_name} (${graph.entity_count}实体/${graph.relation_count}关系)`"
            :value="graph.graph_id"
          >
            <span style="float: left">{{ graph.graph_name }}</span>
            <span style="float: right; color: #8492a6; font-size: 13px">
              {{ graph.entity_count }}/{{ graph.relation_count }}
            </span>
          </el-option>
        </el-select>
        
        <!-- 搜索功能 -->
        <el-input
          v-model="searchKeyword"
          placeholder="搜索实体名称"
          style="width: 240px; margin-right: 10px;"
          @keyup.enter.native="handleSearch"
        >
          <el-button slot="append" icon="el-icon-search" @click="handleSearch"></el-button>
        </el-input>
        
        <el-button-group>
          <el-button @click="zoomIn" title="放大">
            <i class="el-icon-plus"></i>
          </el-button>
          <el-button @click="zoomOut" title="缩小">
            <i class="el-icon-minus"></i>
          </el-button>
          <el-button @click="resetZoom" title="重置视图">
            <i class="el-icon-refresh"></i>
          </el-button>
          <el-button @click="resetView" title="返回完整视图（清空搜索与筛选）">
            <i class="el-icon-back"></i>
            返回
          </el-button>
          <el-button
            v-if="selectedGraphId"
            @click="deleteCurrentGraph"
            title="删除当前图谱"
            type="danger"
            plain
          >
            <i class="el-icon-delete"></i>
            删除当前图谱
          </el-button>
          <el-button @click="clearGraph" title="清除全部图谱" type="danger">
            <i class="el-icon-delete"></i>
            清除全部
          </el-button>
          <el-dropdown @command="handleExport" trigger="click">
            <el-button title="导出图谱">
              <i class="el-icon-download"></i>
              导出 <i class="el-icon-arrow-down el-icon--right"></i>
            </el-button>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item command="json">导出完整数据 (JSON)</el-dropdown-item>
              <el-dropdown-item command="image">导出当前视图 (图片)</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
          <el-button @click="toggleFullscreen" title="全屏/退出全屏">
            <i :class="isFullscreen ? 'el-icon-cancel' : 'el-icon-full-screen'"></i>
          </el-button>
        </el-button-group>
        
        <el-dropdown @command="handleFilter">
          <el-button>
            <i class="el-icon-filter"></i>
            筛选 <i class="el-icon-arrow-down el-icon--right"></i>
          </el-button>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command="all">全部实体</el-dropdown-item>
            <el-dropdown-item command="disease">疾病</el-dropdown-item>
            <el-dropdown-item command="symptom">症状</el-dropdown-item>
            <el-dropdown-item command="treatment">治疗方法</el-dropdown-item>
            <el-dropdown-item command="medicine">药物</el-dropdown-item>
            <el-dropdown-item command="examination">检查</el-dropdown-item>
            <el-dropdown-item command="location">部位</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
        
        <el-button @click="toggleLegend" title="显示/隐藏图例">
          <i class="el-icon-picture-outline"></i>
          图例
        </el-button>
      </div>
    </div>
    
    <!-- 图谱容器 -->
    <div class="graph-container" ref="graphContainer"></div>
    
    <!-- 右侧图例 -->
    <div class="graph-legend" v-if="showLegend">
      <div class="legend-header">
        <h4>实体类型</h4>
        <el-button size="small" type="text" @click="toggleLegend">
          <i class="el-icon-close"></i>
        </el-button>
      </div>
      <div class="legend-content">
        <div v-for="(legend, index) in legendData" :key="index" class="legend-item">
          <span class="legend-color" :style="{ backgroundColor: legend.color }"></span>
          <span class="legend-text">{{ legend.name }}</span>
        </div>
      </div>
    </div>
    
    <!-- 节点详情弹窗 -->
    <el-dialog
      :visible.sync="showNodeDetail"
      title="实体详情"
      width="420px"
      :modal="false"
      :close-on-click-modal="false"
      :close-on-press-escape="true"
    >
      <div v-if="selectedNode" class="node-detail">
        <div class="node-detail-header">
          <div class="node-type-tag" :style="{ backgroundColor: selectedNode.color }"></div>
          <h4>{{ selectedNode.name }}</h4>
        </div>
        <div class="node-detail-content">
          <el-descriptions :column="1" border>
            <el-descriptions-item label="类型">{{ getNodeTypeName(selectedNode.category) }}</el-descriptions-item>
            <el-descriptions-item label="描述" v-if="selectedNode.description">
              {{ selectedNode.description }}
            </el-descriptions-item>
            <el-descriptions-item label="关联实体" v-if="selectedNode.relations && selectedNode.relations.length > 0">
              <div class="relation-list">
                <div v-for="(relation, index) in selectedNode.relations" :key="index" class="relation-item">
                  <span class="relation-type">{{ relation.type }}</span>
                  <span class="relation-target">{{ relation.target }}</span>
                </div>
              </div>
            </el-descriptions-item>
          </el-descriptions>
        </div>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="highlightSameType" v-if="selectedNode">高亮同类型</el-button>
        <el-button type="primary" @click="askDoctor" v-if="selectedNode">问医生</el-button>
        <el-button @click="showNodeDetail = false">关闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import service from '../../utils/request'
import { saveHistoryRecord, HISTORY_TYPES } from '../../utils/historyUtils'
import graphApi from '../../api/graph'


export default {
  name: 'GraphView',
  components: {},
  data() {
    return {
      chart: null,
      graphData: null,
      showLegend: false,
      showNodeDetail: false,
      selectedNode: null,
      searchKeyword: '',
      isFullscreen: false,
      legendData: [
        { name: '疾病', color: '#ff6b6b' },
        { name: '症状', color: '#4ecdc4' },
        { name: '治疗方法', color: '#45b7d1' },
        { name: '药物', color: '#96ceb4' },
        { name: '检查', color: '#ffeaa7' },
        { name: '部位', color: '#dda0dd' }
      ],
      // 懒加载相关数据
      loading: false,
      loadedCount: 0,
      pageSize: 100,
      maxNodes: 1000,  // 设置最大加载节点数，防止性能问题
      lazyLoadEnabled: true,
      // 图谱切换相关数据
      selectedGraphId: '',
      graphList: [],
      // 程序化缩放比例（用于放大/缩小按钮）
      graphZoomScale: 1
    }
  },
  mounted() {
    this.initChart()
    this.applyRouteGraph()
    this.getGraphList().finally(() => {
      this.loadGraphData()
    })
    window.addEventListener('resize', this.handleResize)
  },
  watch: {
    '$route': function (to) {
      if (to.name === 'GraphViewWithFile' && to.params.file_id) {
        this.applyRouteGraph()
        this.loadGraphData()
      } else if (to.name === 'GraphView' && to.query.graphId) {
        this.selectedGraphId = to.query.graphId
        this.loadGraphData()
      }
    }
  },
  beforeDestroy() {
    if (this.chart) {
      this.chart.dispose()
    }
    window.removeEventListener('resize', this.handleResize)
  },
  methods: {
    // 初始化ECharts图表
    initChart() {
      this.chart = echarts.init(this.$refs.graphContainer)
      
      // 设置图表事件
      this.chart.on('click', (params) => {
        console.log('[Graph] click event:', params)
        if (params.dataType === 'node') {
          const nodeData = params.data || {}
          this.showNodeDetailDialog(nodeData)
          // 仅在用户真正点节点时保存一条“图谱查询”历史
          saveHistoryRecord(HISTORY_TYPES.GRAPH_QUERY, {
            entity: nodeData.name,
            nodeId: nodeData.id,
            category: nodeData.category,
            graphId: this.$route?.query?.graphId || null,
            timestamp: Date.now()
          })
        }
      })
      
      // 懒加载事件监听
      if (this.lazyLoadEnabled) {
        // 监听图表的缩放和拖拽事件
        this.chart.on('graphRoam', () => {
          this.checkLazyLoad()
        })
        
        // 监听鼠标移动事件，当鼠标靠近图表边缘时加载更多数据
        this.chart.on('mousemove', () => {
          this.checkLazyLoad()
        })
      }
      
      // 设置图表选项
      const option = {
        tooltip: {
          trigger: 'item',
          formatter: (params) => {
            if (params.dataType === 'node') {
              return `${params.name}<br/>类型: ${this.getNodeTypeName(params.data.category)}`
            } else {
              return params.data.relation
            }
          }
        },
        series: [
          {
            type: 'graph',
            layout: 'force',
            data: [],
            links: [],
            roam: true,
            focusNodeAdjacency: true,
            force: {
              repulsion: 300,
              gravity: 0.1,
              edgeLength: 100
            },
            edgeSymbol: ['none', 'arrow'],
            edgeSymbolSize: 8,
            edgeLabel: {
              fontSize: 12,
              formatter: '{c}',
              color: '#ffffff'
            },
            lineStyle: {
              color: '#00d4ff',
              width: 2,
              opacity: 0.6,
              curveness: 0.3
            },
            itemStyle: {
              // 使用节点自身的color属性
              color: function(params) {
                return params.data.color || '#9c27ff';
              },
              borderColor: '#00d4ff',
              borderWidth: 2,
              shadowColor: 'rgba(0, 212, 255, 0.5)',
              shadowBlur: 10
            },
            label: {
              show: true,
              position: 'right',
              color: '#ffffff',
              fontSize: 14,
              formatter: '{b}'
            },
            emphasis: {
              lineStyle: {
                width: 3,
                color: '#00e5ff'
              },
              itemStyle: {
                shadowColor: 'rgba(0, 229, 255, 0.8)',
                shadowBlur: 15,
                borderWidth: 3
              }
            },
            animationDuration: 1500,
            animationEasingUpdate: 'quinticInOut'
          }
        ]
      }
      
      this.chart.setOption(option)
    },
    
    // 根据路由设置当前图谱（/graph/:file_id 或 query.graphId）
    applyRouteGraph() {
      const fileId = this.$route?.params?.file_id
      const queryGraphId = this.$route?.query?.graphId
      if (fileId) {
        this.selectedGraphId = fileId
        this.graphData = null
      } else if (queryGraphId) {
        this.selectedGraphId = queryGraphId
        this.graphData = null
      } else {
        this.selectedGraphId = ''
        this.graphData = null
      }
    },

    // 获取图谱列表
    async getGraphList() {
      try {
        const response = await graphApi.getGraphList()
        if (response.data && response.data.status === 'success') {
          this.graphList = response.data.data.list || []
          console.log('获取图谱列表成功:', this.graphList.length, '个图谱')
        }
        return response
      } catch (error) {
        console.error('获取图谱列表失败:', error)
        this.$message.warning('获取图谱列表失败，将显示全部图谱')
        throw error
      }
    },
    
    // 处理图谱切换
    handleGraphChange(graphId) {
      console.log('切换图谱:', graphId)
      this.selectedGraphId = graphId || ''
      // 重置懒加载状态
      this.loadedCount = 0
      this.lazyLoadEnabled = true
      // 清空当前图谱数据
      this.graphData = null
      // 重新加载图谱数据
      this.loadGraphData()
    },
    
    // 加载图谱数据
    async loadGraphData() {
      try {
        // 构建请求参数
        const params = {
          limit: 100  // 初始加载限制 100 个节点
        }
        
        // 如果选择了特定图谱，添加 graph_id 参数
        if (this.selectedGraphId) {
          params.graph_id = this.selectedGraphId
          console.log('加载指定图谱数据:', this.selectedGraphId)
        } else {
          console.log('加载全部图谱数据（合并显示）')
        }
        
        // 从后端 API 获取图谱数据
        const response = await service.get('/api/graph/data', {
          params
        })
        
        // 定义节点类型与颜色映射
        const nodeTypes = [
          { name: '疾病', category: 'disease', color: '#ff6b6b' },
          { name: '症状', category: 'symptom', color: '#4ecdc4' },
          { name: '治疗方法', category: 'treatment', color: '#45b7d1' },
          { name: '药物', category: 'medicine', color: '#96ceb4' },
          { name: '检查', category: 'examination', color: '#ffeaa7' },
          { name: '部位', category: 'location', color: '#dda0dd' }
        ]
        
        // 处理后端返回的数据格式，为节点添加颜色属性
        const nodesWithColor = (response.data.nodes || []).map(node => {
          const typeInfo = nodeTypes.find(t => t.category === node.category)
          return {
            ...node,
            id: node.id ?? node.name,
            name: node.name ?? node.id,
            color: typeInfo ? typeInfo.color : '#9c27ff' // 默认颜色
          }
        })
        const rawEdges = response.data.edges || response.data.data?.relations || []
        // 建立 规范化键 -> 实际节点 id 的映射，保证 source/target 与节点 id 一致（兼容大小写、空格）
        const idByKey = new Map()
        nodesWithColor.forEach(n => {
          const id = n.id ?? n.name
          if (id == null || id === '') return
          const key = String(id).trim()
          idByKey.set(key, id)
          idByKey.set(key.toLowerCase(), id)
        })
        const resolveId = (val) => {
          if (val == null || val === '') return null
          const key = String(val).trim()
          return idByKey.get(key) ?? idByKey.get(key.toLowerCase()) ?? null
        }
        // 只保留两端都能解析到节点 id 的边，并统一为 ECharts 所需的 source/target/value
        const links = []
        rawEdges.forEach(e => {
          const s = e.source ?? e.subject ?? ''
          const t = e.target ?? e.object ?? ''
          const actualSource = resolveId(s)
          const actualTarget = resolveId(t)
          if (actualSource && actualTarget) {
            links.push({
              source: actualSource,
              target: actualTarget,
              value: e.value ?? e.relation ?? e.predicate ?? e.type ?? '',
              relation: e.relation ?? e.predicate ?? e.type ?? ''
            })
          }
        })
        if (rawEdges.length > 0 && links.length === 0) {
          console.warn('[GraphView] 边数据被全部过滤：rawEdges=', rawEdges.length, 'nodes=', nodesWithColor.length, '示例边', rawEdges[0], '示例节点id', nodesWithColor[0]?.id ?? nodesWithColor[0]?.name)
        }
        
        const graphData = {
          nodes: nodesWithColor,
          links
        }
        
        this.graphData = graphData
        this.graphZoomScale = 1
        
        // 更新图表数据
        this.chart.setOption({
          series: [{
            data: this.graphData.nodes,
            links: this.graphData.links
          }]
        })
        this.$nextTick(() => this._applyGraphZoom())
        
        // 启动节点出现动画
        this.startNodeAnimation()
      } catch (error) {
        console.error('加载图谱数据失败:', error)
        // 如果 API 请求失败，使用模拟数据作为后备
        this.graphData = this.generateMockGraphData()
        this.chart.setOption({
          series: [{
            data: this.graphData.nodes,
            links: this.graphData.links
          }]
        })
        this.startNodeAnimation()
      }
    },
    
    // 生成模拟图谱数据
    generateMockGraphData() {
      const nodeTypes = [
        { name: '疾病', category: 'disease', color: '#ff6b6b' },
        { name: '症状', category: 'symptom', color: '#4ecdc4' },
        { name: '治疗方法', category: 'treatment', color: '#45b7d1' },
        { name: '药物', category: 'medicine', color: '#96ceb4' },
        { name: '检查', category: 'examination', color: '#ffeaa7' },
        { name: '部位', category: 'location', color: '#dda0dd' }
      ]
      
      // 生成节点
      const nodes = []
      const nodeNames = [
        { name: '糖尿病', type: 'disease' },
        { name: '高血压', type: 'disease' },
        { name: '心脏病', type: 'disease' },
        { name: '头晕', type: 'symptom' },
        { name: '口渴', type: 'symptom' },
        { name: '疲劳', type: 'symptom' },
        { name: '药物治疗', type: 'treatment' },
        { name: '饮食控制', type: 'treatment' },
        { name: '胰岛素', type: 'medicine' },
        { name: '降压药', type: 'medicine' },
        { name: '血糖检查', type: 'examination' },
        { name: '心脏超声', type: 'examination' },
        { name: '胰腺', type: 'location' },
        { name: '心脏', type: 'location' },
        { name: '血管', type: 'location' }
      ]
      
      nodeNames.forEach((node, index) => {
        const typeInfo = nodeTypes.find(t => t.category === node.type)
        nodes.push({
          id: index,
          name: node.name,
          category: node.type,
          symbolSize: 40 + Math.random() * 20,
          color: typeInfo.color,
          description: `这是${node.name}的详细描述信息，包含疾病的病因、症状、治疗方法等。`,
          relations: []
        })
      })
      
      // 生成关系
      const links = []
      const relationTypes = ['症状', '治疗方法', '药物', '检查', '发生部位']
      
      // 为每个节点生成随机关系
      nodes.forEach((node, index) => {
        const relationCount = Math.floor(Math.random() * 3) + 1
        const relatedNodes = new Set()
        
        while (relatedNodes.size < relationCount) {
          const targetIndex = Math.floor(Math.random() * nodes.length)
          if (targetIndex !== index) {
            relatedNodes.add(targetIndex)
          }
        }
        
        relatedNodes.forEach(targetIndex => {
          const relationType = relationTypes[Math.floor(Math.random() * relationTypes.length)]
          links.push({
            source: index,
            target: targetIndex,
            relation: relationType,
            value: relationType
          })
          
          // 更新节点关系信息
          node.relations.push({
            target: nodes[targetIndex].name,
            type: relationType
          })
        })
      })
      
      return { nodes, links }
    },
    
    // 启动节点出现动画
    startNodeAnimation() {
      const nodes = this.graphData.nodes
      const links = this.graphData.links
      
      // 清空现有数据
      this.chart.setOption({
        series: [{
          data: [],
          links: []
        }]
      })
      
      // 逐个添加节点，实现动画效果
      nodes.forEach((node, index) => {
        setTimeout(() => {
          // 获取当前已添加节点的ID集合
          const addedNodeIds = new Set(nodes.slice(0, index + 1).map(n => n.id))
          this.chart.setOption({
            series: [{
              data: nodes.slice(0, index + 1),
              links: links.filter(link => addedNodeIds.has(link.source) && addedNodeIds.has(link.target))
            }]
          })
        }, 200 * index)
      })
    },
    
    // 放大（通过 zrender 根节点缩放）
    zoomIn() {
      if (!this.chart) return
      this.graphZoomScale = Math.min(this.graphZoomScale * 1.25, 5)
      this._applyGraphZoom()
    },
    
    // 缩小
    zoomOut() {
      if (!this.chart) return
      this.graphZoomScale = Math.max(this.graphZoomScale / 1.25, 0.2)
      this._applyGraphZoom()
    },
    
    // 获取 zrender 根节点列表（zrender 使用 getRoots() 返回 _roots 数组）
    _getZrRoots() {
      const zr = this.chart && this.chart.getZr && this.chart.getZr()
      if (!zr || !zr.storage) return []
      const s = zr.storage
      if (typeof s.getRoots === 'function') return s.getRoots() || []
      if (s._roots && Array.isArray(s._roots)) return s._roots
      return []
    },
    
    // 应用当前缩放比例到画布
    _applyGraphZoom() {
      try {
        const roots = this._getZrRoots()
        if (!roots.length) return
        roots.forEach(root => {
          if (root && root.scale !== undefined) {
            root.scale = [this.graphZoomScale, this.graphZoomScale]
            if (root.dirty) root.dirty(true)
          }
        })
        const zr = this.chart.getZr()
        if (zr && zr.refresh) zr.refresh()
      } catch (e) {
        console.warn('图谱缩放失败:', e)
      }
    },
    
    // 重置视图（缩放与平移）
    resetZoom() {
      if (!this.chart) return
      this.graphZoomScale = 1
      try {
        const roots = this._getZrRoots()
        roots.forEach(root => {
          if (root) {
            if (root.scale !== undefined) root.scale = [1, 1]
            if (root.position !== undefined) root.position = [0, 0]
            if (root.dirty) root.dirty(true)
          }
        })
        const zr = this.chart.getZr()
        if (zr && zr.refresh) zr.refresh()
      } catch (e) {
        console.warn('重置视图失败:', e)
      }
    },
    
    // 返回完整视图：清空搜索、取消筛选、重置缩放，恢复显示全部节点与边
    resetView() {
      this.searchKeyword = ''
      this.graphZoomScale = 1
      if (!this.graphData) return
      this.chart.setOption({
        series: [{
          data: this.graphData.nodes,
          links: this.graphData.links
        }]
      })
      this._applyGraphZoom()
      this.$message.success('已恢复完整视图')
    },
    
    // 删除当前选中的图谱
    deleteCurrentGraph() {
      if (!this.selectedGraphId) return
      this.$confirm(`确定要删除当前图谱吗？此操作不可恢复。`, '删除图谱确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          await graphApi.deleteGraph(this.selectedGraphId)
          this.selectedGraphId = ''
          await this.getGraphList()
          await this.loadGraphData()
          this.$message.success('当前图谱已删除')
        } catch (error) {
          console.error('删除图谱失败:', error)
          this.$message.error('删除图谱失败，请稍后重试')
        }
      }).catch(() => {
        this.$message.info('已取消')
      })
    },
    // 清除全部图谱
    clearGraph() {
      this.$confirm('确定要清除所有图谱（节点和关系）吗？此操作不可恢复。', '清除图谱确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          // 调用后端API清除数据库中的数据
          await graphApi.clearGraphData()
          this.selectedGraphId = ''
          await this.getGraphList()
          // 更新图表数据，清空节点和边
          this.chart.setOption({
            series: [{
              data: [],
              links: []
            }]
          })
          this.graphData = { nodes: [], links: [] }
          this.$message.success('图谱已成功清除')
        } catch (error) {
          // 处理错误
          console.error('清除图谱失败:', error)
          this.$message.error('清除图谱失败，请稍后重试')
        }
      }).catch(() => {
        // 取消清除操作
        this.$message.info('已取消清除操作')
      })
    },
    
    // 导出：完整数据(JSON) 或 当前视图(图片)
    handleExport(command) {
      if (command === 'json') {
        if (!this.graphData || (!this.graphData.nodes.length && !this.graphData.links.length)) {
          this.$message.warning('暂无图谱数据可导出')
          return
        }
        const payload = {
          nodes: this.graphData.nodes,
          links: this.graphData.links,
          exportedAt: new Date().toISOString()
        }
        const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `知识图谱_${new Date().getTime()}.json`
        link.click()
        URL.revokeObjectURL(url)
        this.$message.success('已导出完整数据 (JSON)')
      } else if (command === 'image') {
        const dataURL = this.chart.getDataURL({
          type: 'png',
          backgroundColor: '#0a0e27',
          pixelRatio: 2,
          excludeComponents: ['toolbox']
        })
        const link = document.createElement('a')
        link.href = dataURL
        link.download = `知识图谱_${new Date().getTime()}.png`
        link.click()
        this.$message.success('已导出当前视图 (图片)')
      }
    },
    
    // 处理筛选
    handleFilter(command) {
      if (command === 'all') {
        this.chart.setOption({
          series: [{
            data: this.graphData.nodes,
            links: this.graphData.links
          }]
        })
      } else {
        // 筛选特定类型的节点
        const filteredNodes = this.graphData.nodes.filter(node => node.category === command)
        const filteredNodeIds = new Set(filteredNodes.map(node => node.id))
        const filteredLinks = this.graphData.links.filter(link => 
          filteredNodeIds.has(link.source) && filteredNodeIds.has(link.target)
        )
        
        this.chart.setOption({
          series: [{
            data: filteredNodes,
            links: filteredLinks
          }]
        })
      }
    },
    
    // 全屏功能
    toggleFullscreen() {
      const graphContainer = this.$refs.graphContainer
      
      if (!this.isFullscreen) {
        // 进入全屏
        if (graphContainer.requestFullscreen) {
          graphContainer.requestFullscreen()
        } else if (graphContainer.mozRequestFullScreen) {
          graphContainer.mozRequestFullScreen()
        } else if (graphContainer.webkitRequestFullscreen) {
          graphContainer.webkitRequestFullscreen()
        } else if (graphContainer.msRequestFullscreen) {
          graphContainer.msRequestFullscreen()
        }
      } else {
        // 退出全屏
        if (document.exitFullscreen) {
          document.exitFullscreen()
        } else if (document.mozCancelFullScreen) {
          document.mozCancelFullScreen()
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen()
        } else if (document.msExitFullscreen) {
          document.msExitFullscreen()
        }
      }
      
      this.isFullscreen = !this.isFullscreen
    },
    
    // 搜索功能
    handleSearch() {
      if (!this.searchKeyword.trim()) {
        // 如果搜索关键词为空，显示所有节点
        this.chart.setOption({
          series: [{
            data: this.graphData.nodes,
            links: this.graphData.links
          }]
        })
        return
      }
      
      const keyword = this.searchKeyword.trim().toLowerCase()
      
      // 过滤包含关键词的节点
      const filteredNodes = this.graphData.nodes.filter(node => 
        node.name.toLowerCase().includes(keyword)
      )
      
      // 过滤与这些节点相关的链接
      const filteredLinks = this.graphData.links.filter(link => {
        const sourceNode = filteredNodes.find(n => n.id === link.source)
        const targetNode = filteredNodes.find(n => n.id === link.target)
        return sourceNode && targetNode
      })
      
      // 更新图表显示
      this.chart.setOption({
        series: [{
          data: filteredNodes,
          links: filteredLinks
        }]
      })
      
      // 高亮显示匹配的节点
      if (filteredNodes.length > 0) {
        // 可以添加更复杂的高亮逻辑，比如放大匹配的节点
        this.chart.dispatchAction({
          type: 'focusNodeAdjacency',
          dataIndex: 0
        })
      }
    },
    
    // 切换图例显示
    toggleLegend() {
      this.showLegend = !this.showLegend
    },
    
    // 显示节点详情对话框
    showNodeDetailDialog(nodeData) {
      this.selectedNode = nodeData
      this.showNodeDetail = true
    },

    // 高亮同类型子图
    highlightSameType() {
      if (!this.selectedNode || !this.graphData) return
      const targetCategory = this.selectedNode.category
      const filteredNodes = this.graphData.nodes.filter(n => n.category === targetCategory)
      const ids = new Set(filteredNodes.map(n => n.id))
      const filteredLinks = this.graphData.links.filter(
        l => ids.has(l.source) && ids.has(l.target)
      )
      this.chart.setOption({
        series: [{
          data: filteredNodes,
          links: filteredLinks
        }]
      })
    },

    // 从节点一键发起“问医生”：跳转问答页并自动填入、发送「请为我介绍一下XXX」
    askDoctor() {
      if (!this.selectedNode) return
      const name = this.selectedNode.name || '该实体'
      const question = `请为我介绍一下${name}`
      this.$router.push({
        path: '/chat',
        query: { question, autoSend: '1' }
      })
      this.showNodeDetail = false
    },
    
    // 获取节点类型名称
    getNodeTypeName(category) {
      const typeMap = {
        'disease': '疾病',
        'symptom': '症状',
        'treatment': '治疗方法',
        'medicine': '药物',
        'examination': '检查',
        'location': '部位'
      }
      return typeMap[category] || '未知类型'
    },
    
    // 检查是否需要懒加载更多数据
    checkLazyLoad() {
      if (this.loading || this.loadedCount >= this.maxNodes) {
        return
      }
      
      // 获取当前图表视图范围
      const option = this.chart.getOption()
      if (!option || !option.series || !option.series[0]) {
        return
      }
      
      // 这里可以实现更复杂的懒加载逻辑
      // 例如：检测鼠标位置、视图边界等
      // 简单实现：当用户有任何交互时，加载更多数据
      this.loadMoreNodes()
    },
    
    // 加载更多节点
    async loadMoreNodes() {
      if (this.loading || this.loadedCount >= this.maxNodes) {
        return
      }
      
      try {
        this.loading = true
        
        // 计算下一页的偏移量
        const offset = this.loadedCount
        
        // 构建请求参数
        const params = {
          limit: this.pageSize,
          offset: offset
        }
        
        // 如果选择了特定图谱，添加 graph_id 参数
        if (this.selectedGraphId) {
          params.graph_id = this.selectedGraphId
        }
        
        // 从后端 API 获取更多节点数据
        const response = await service.get('/api/graph/data', {
          params
        })
        
        // 处理新获取的数据
        const newNodes = response.data.nodes
        const newEdges = response.data.edges
        
        if (newNodes.length === 0) {
          // 没有更多数据了
          this.lazyLoadEnabled = false
          return
        }
        
        // 更新已加载节点数
        this.loadedCount += newNodes.length
        
        // 合并新旧数据
        if (this.graphData) {
          // 添加新节点
          const existingNodeIds = new Set(this.graphData.nodes.map(node => node.id))
          const filteredNewNodes = newNodes.filter(node => !existingNodeIds.has(node.id))
          this.graphData.nodes.push(...filteredNewNodes)
          
          // 添加新边
          const newEdgeSet = new Set()
          newEdges.forEach(edge => {
            const edgeKey = `${edge.source}-${edge.target}-${edge.relation}`
            newEdgeSet.add(edgeKey)
          })
          
          const existingEdgeKeys = new Set(
            this.graphData.links.map(edge => `${edge.source}-${edge.target}-${edge.relation}`)
          )
          
          const filteredNewEdges = newEdges.filter(edge => {
            const edgeKey = `${edge.source}-${edge.target}-${edge.relation}`
            return !existingEdgeKeys.has(edgeKey)
          })
          
          this.graphData.links.push(...filteredNewEdges)
        } else {
          // 第一次加载
          this.graphData = {
            nodes: newNodes,
            links: newEdges
          }
        }
        
        // 更新图表数据
        this.chart.setOption({
          series: [{
            data: this.graphData.nodes,
            links: this.graphData.links
          }]
        })
        
      } catch (error) {
        console.error('加载更多数据失败:', error)
      } finally {
        this.loading = false
      }
    },
    
    // 处理窗口大小变化
    handleResize() {
      if (this.chart) {
        this.chart.resize()
      }
    }
  }
}
</script>

<style>
.graph-view-container {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 140px);
  background-color: var(--primary-dark);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 212, 255, 0.1);
  border: 1px solid rgba(0, 212, 255, 0.2);
  position: relative;
}

/* 顶部工具栏 */
.graph-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background-color: rgba(255, 255, 255, 0.03);
  border-bottom: 1px solid rgba(0, 212, 255, 0.2);
  z-index: 10;
}

.graph-toolbar h3 {
  color: #ffffff;
  font-size: 18px;
  font-weight: 600;
  background: var(--gradient-glow);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.toolbar-right {
  display: flex;
  gap: 16px;
  align-items: center;
}

.toolbar-right .el-button-group {
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 4px;
}

.toolbar-right .el-button {
  background-color: transparent;
  color: var(--primary-blue);
  border: 1px solid rgba(0, 212, 255, 0.3);
  border-radius: 6px;
  transition: all 0.3s ease;
}

.toolbar-right .el-button:hover {
  background-color: rgba(0, 212, 255, 0.1);
  box-shadow: 0 4px 12px rgba(0, 212, 255, 0.3);
  transform: translateY(-2px);
}

.toolbar-right .el-button-group .el-button {
  border-radius: 4px;
  margin: 0 2px;
}

/* 图谱容器 */
.graph-container {
  flex: 1;
  position: relative;
  background: linear-gradient(135deg, rgba(10, 14, 39, 0.95) 0%, rgba(156, 39, 255, 0.1) 100%);
}

/* 右侧图例 */
.graph-legend {
  position: absolute;
  right: 20px;
  top: 80px;
  width: 200px;
  background-color: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  padding: 16px;
  border: 1px solid rgba(0, 212, 255, 0.2);
  z-index: 100;
  animation: legendSlideIn 0.3s ease-out;
}

@keyframes legendSlideIn {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.legend-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(0, 212, 255, 0.2);
}

.legend-header h4 {
  color: #ffffff;
  font-size: 14px;
  font-weight: 600;
}

.legend-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.legend-color {
  width: 16px;
  height: 16px;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 212, 255, 0.3);
}

.legend-text {
  color: rgba(255, 255, 255, 0.8);
  font-size: 12px;
}

/* 节点详情弹窗 */
.node-detail {
  color: #ffffff;
}

.node-detail-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(0, 212, 255, 0.2);
}

.node-type-tag {
  width: 16px;
  height: 16px;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 212, 255, 0.3);
}

.node-detail-header h4 {
  color: #ffffff;
  font-size: 16px;
  font-weight: 600;
  margin: 0;
}

.node-detail-content .el-descriptions {
  background-color: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(0, 212, 255, 0.2);
}

.node-detail-content .el-descriptions__header {
  display: none;
}

.node-detail-content .el-descriptions__body {
  padding: 16px;
}

.node-detail-content .el-descriptions__item {
  border-bottom: 1px solid rgba(0, 212, 255, 0.1);
}

.node-detail-content .el-descriptions__item:last-child {
  border-bottom: none;
}

.node-detail-content .el-descriptions__label {
  color: var(--primary-blue);
  font-weight: 600;
  background-color: rgba(0, 212, 255, 0.05);
}

.node-detail-content .el-descriptions__content {
  color: #ffffff;
}

.relation-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.relation-item {
  display: flex;
  gap: 8px;
  align-items: center;
  padding: 6px 12px;
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 6px;
  border: 1px solid rgba(0, 212, 255, 0.2);
}

.relation-type {
  font-size: 12px;
  color: var(--accent-cyan);
  font-weight: 600;
}

.relation-target {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
}

/* 弹窗样式 */
.el-dialog {
  background-color: rgba(10, 14, 39, 0.95);
  border: 1px solid rgba(0, 212, 255, 0.3);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 212, 255, 0.2);
}

.el-dialog__header {
  border-bottom: 1px solid rgba(0, 212, 255, 0.2);
}

.el-dialog__title {
  color: #ffffff;
  font-weight: 600;
}

.el-dialog__footer {
  border-top: 1px solid rgba(0, 212, 255, 0.2);
}

.el-dialog__close {
  color: rgba(255, 255, 255, 0.6);
}

.el-dialog__close:hover {
  color: var(--primary-blue);
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .graph-legend {
    width: 200px;
  }
}

@media (max-width: 1024px) {
  .graph-toolbar {
    padding: 15px 20px;
  }
  
  .graph-legend {
    width: 180px;
  }
}

@media (max-width: 768px) {
  .graph-toolbar {
    flex-direction: column;
    gap: 12px;
    padding: 12px 16px;
  }
  
  .toolbar-left h3 {
    font-size: 20px;
  }
  
  .toolbar-right {
    flex-wrap: wrap;
    justify-content: center;
    gap: 8px;
  }
  
  .graph-legend {
    width: calc(100% - 40px);
    left: 20px;
    right: 20px;
    top: 120px;
    max-height: 200px;
    overflow-y: auto;
  }
  
  /* 节点详情弹窗 */
  .el-dialog {
    width: 95% !important;
    margin: 10px;
  }
  
  .node-detail-header h4 {
    font-size: 18px;
  }
}

@media (max-width: 576px) {
  .graph-toolbar {
    padding: 10px 15px;
  }
  
  .toolbar-left h3 {
    font-size: 18px;
  }
  
  .toolbar-right {
    flex-direction: column;
    width: 100%;
  }
  
  .el-button-group {
    width: 100%;
    justify-content: space-between;
  }
  
  .el-button-group .el-button {
    flex: 1;
  }
  
  .graph-legend {
    width: calc(100% - 20px);
    left: 10px;
    right: 10px;
    top: 160px;
  }
  
  .legend-header h4 {
    font-size: 14px;
  }
}

@media (max-width: 420px) {
  .graph-toolbar {
    gap: 8px;
    padding: 8px 12px;
  }
  
  .toolbar-right {
    gap: 6px;
  }
  
  .el-button {
    font-size: 12px;
    padding: 8px 12px;
  }
  
  .el-dropdown {
    width: 100%;
  }
  
  .el-dropdown .el-button {
    width: 100%;
    justify-content: center;
  }
  
  .graph-legend {
    top: 180px;
  }
  
  .legend-item {
    font-size: 12px;
  }
}
</style>