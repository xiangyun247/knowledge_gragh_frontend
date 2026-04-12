<template>
  <div class="eeg-monitor-page">
    <!-- 页头 -->
    <div class="panel-card header-card">
      <div class="eeg-monitor-header">
        <div class="header-left">
          <h1 class="page-title">
            <i class="el-icon-monitor"></i>
            EEG 实时监测
          </h1>
          <p class="page-desc">基于 10-20 国际标准电极放置系统的多通道脑电信号实时可视化与分析</p>
        </div>
        <div class="header-right">
          <div class="connection-status" :class="connectionStatusClass">
            <span class="status-dot"></span>
            <span class="status-text">{{ connectionStatusText }}</span>
          </div>
          <el-tooltip content="设置" placement="bottom">
            <el-button size="small" circle icon="el-icon-setting" @click="showSettings = true" />
          </el-tooltip>
        </div>
      </div>
    </div>

    <!-- Tab 导航 -->
    <div class="panel-card tab-card">
      <el-tabs v-model="activeTab" type="border-card" @tab-click="onTabChange">
        <el-tab-pane label="实时监测" name="monitor">
          <span slot="label"><i class="el-icon-monitor"></i> 实时监测</span>
        </el-tab-pane>
        <el-tab-pane label="历史记录" name="history">
          <span slot="label"><i class="el-icon-document"></i> 历史记录</span>
        </el-tab-pane>
        <el-tab-pane label="数据汇总" name="summary">
          <span slot="label"><i class="el-icon-data-analysis"></i> 数据汇总</span>
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- 控制面板（仅监测 Tab 显示） -->
    <div v-show="activeTab === 'monitor'" class="panel-card control-card">
      <div class="control-row">
        <!-- 受试者选择 -->
        <div class="control-group subject-group">
          <label class="control-label">受试者</label>
          <el-select
            v-model="currentSubjectId"
            size="small"
            filterable
            allow-create
            placeholder="选择或输入受试者"
            style="width: 180px"
            :loading="subjectLoading"
            @change="onSubjectChange"
          >
            <el-option
              v-for="s in subjectList"
              :key="s.id"
              :label="`${s.subject_code}${s.name ? ' - ' + s.name : ''} (${s.age}岁/${genderLabel(s.gender)})`"
              :value="s.id"
            />
          </el-select>
          <el-button size="mini" icon="el-icon-plus" circle title="新增受试者" @click="resetSubjectForm(); showSubjectDialog = true" />
        </div>
        <div class="control-group">
          <label class="control-label">数据源</label>
          <el-radio-group v-model="dataSource" size="small" @change="onDataSourceChange">
            <el-radio-button label="simulation">模拟信号</el-radio-button>
            <el-radio-button label="device" disabled>真实设备</el-radio-button>
          </el-radio-group>
        </div>
        <div class="control-group">
          <label class="control-label">认知负荷等级</label>
          <el-radio-group v-model="cognitiveLevel" size="small">
            <el-radio-button label="low">低</el-radio-button>
            <el-radio-button label="medium">中</el-radio-button>
            <el-radio-button label="high">高</el-radio-button>
          </el-radio-group>
        </div>
        <div class="control-group">
          <label class="control-label">信号质量</label>
          <el-select v-model="signalQuality" size="small" style="width: 110px">
            <el-option label="优秀" value="excellent" />
            <el-option label="良好" value="good" />
            <el-option label="一般" value="fair" />
            <el-option label="差" value="poor" />
          </el-select>
        </div>
        <div class="control-actions">
          <el-button
            v-if="!isRunning"
            :disabled="!currentSubjectId"
            type="primary"
            size="small"
            icon="el-icon-video-play"
            @click="startSession"
          >开始监测</el-button>
          <el-button
            v-else
            type="danger"
            size="small"
            icon="el-icon-video-pause"
            @click="stopSession"
          >结束监测</el-button>
          <el-button size="small" icon="el-icon-refresh" @click="resetData">重置</el-button>
        </div>
      </div>
      <!-- 会话状态栏 -->
      <div v-if="activeSessionId" class="session-status-bar">
        <span><i class="el-icon-time"></i> 会话时长: {{ formatDuration(elapsedTime) }}</span>
        <span class="session-divider">|</span>
        <span><i class="el-icon-user"></i> {{ currentSubjectName }}</span>
        <span class="session-divider">|</span>
        <span class="status-dot running"></span> 监测中
      </div>
    </div>

    <!-- 监测内容 -->
    <template v-if="activeTab === 'monitor'">
    <div class="eeg-content">
      <!-- 左侧：波形图 + 频谱 -->
      <div class="eeg-main">
        <!-- 8通道实时波形 -->
        <div class="panel-card chart-card waveform-card">
          <div class="chart-header">
            <h3 class="chart-title">
              <i class="el-icon-data-line"></i> 实时脑电波形
            </h3>
            <div class="chart-controls">
              <el-radio-group v-model="timeWindow" size="mini" @change="onTimeWindowChange">
                <el-radio-button :label="5">5s</el-radio-button>
                <el-radio-button :label="10">10s</el-radio-button>
                <el-radio-button :label="20">20s</el-radio-button>
              </el-radio-group>
              <span class="sample-rate-info">{{ sampleRate }} Hz</span>
            </div>
          </div>
          <div ref="waveformChart" class="chart-dom waveform-chart-dom"></div>
        </div>

        <!-- 下方三栏：功率谱 + 信号质量 + 频段雷达 -->
        <div class="sub-chart-row">
          <div class="panel-card chart-card sub-card">
            <h4 class="sub-title">功率谱密度 (PSD)</h4>
            <div ref="psdChart" class="chart-dom sub-chart-dom"></div>
          </div>
          <div class="panel-card chart-card sub-card">
            <h4 class="sub-title">频段能量分布</h4>
            <div ref="bandChart" class="chart-dom sub-chart-dom"></div>
          </div>
          <div class="panel-card chart-card sub-card">
            <h4 class="sub-title">信号质量</h4>
            <div ref="qualityChart" class="chart-dom sub-chart-dom"></div>
          </div>
        </div>
      </div>

      <!-- 右侧面板 -->
      <div class="eeg-sidebar">
        <!-- 脑地形图 -->
        <div class="panel-card chart-card topomap-card">
          <h4 class="sub-title">
            <i class="el-icon-place"></i> 脑地形图 (Topomap)
          </h4>
          <div ref="topomapChart" class="chart-dom topomap-dom"></div>
        </div>

        <!-- 认知负荷实时评分 -->
        <div class="panel-card cognitive-score-card">
          <h4 class="sub-title">
            <i class="el-icon-data-analysis"></i> 实时认知负荷评估
          </h4>
          <div class="score-display">
            <div class="score-circle" :class="'level-' + cognitiveLoadLevel">
              <span class="score-num">{{ cognitiveLoadScore || 0 }}</span>
              <span class="score-label">分</span>
            </div>
            <div class="score-detail">
              <div class="level-indicator" :class="'level-' + cognitiveLoadLevel">
                {{ cognitiveLoadLabel }}
              </div>
              <div class="score-desc">基于 θ/β 比值 + α 功率综合评估</div>
            </div>
          </div>

          <!-- 实时特征指标 -->
          <div class="feature-metrics">
            <div class="metric-item">
              <span class="metric-label">θ/β 比值</span>
              <span class="metric-value" :style="{ color: thetaBetaColor }">{{ (currentThetaBeta || 0).toFixed(2) }}</span>
            </div>
            <div class="metric-item">
              <span class="metric-label">α/β 比值</span>
              <span class="metric-value">{{ (currentAlphaBeta || 0).toFixed(2) }}</span>
            </div>
            <div class="metric-item">
              <span class="metric-label">θ 功率</span>
              <span class="metric-value">{{ (currentThetaPower || 0).toFixed(1) }} μV²</span>
            </div>
            <div class="metric-item">
              <span class="metric-label">α 功率</span>
              <span class="metric-value">{{ (currentAlphaPower || 0).toFixed(1) }} μV²</span>
            </div>
            <div class="metric-item">
              <span class="metric-label">β 功率</span>
              <span class="metric-value">{{ (currentBetaPower || 0).toFixed(1) }} μV²</span>
            </div>
            <div class="metric-item">
              <span class="metric-label">SNR</span>
              <span class="metric-value" :style="{ color: snrColor }">{{ (currentSNR || 0).toFixed(1) }} dB</span>
            </div>
          </div>

          <!-- 认知负荷趋势条 -->
          <div class="load-trend">
            <h5 class="trend-title">负荷趋势（近 60s）</h5>
            <div ref="trendChart" class="chart-dom trend-dom"></div>
          </div>
        </div>
      </div>
    </div>
    </template>

    <!-- 历史记录 -->
    <template v-if="activeTab === 'history'">
    <div class="panel-card">
      <div class="history-header">
        <h3 class="chart-title"><i class="el-icon-document"></i> 监测历史记录</h3>
        <div class="history-filters">
          <el-select v-model="historyFilter.subject_id" placeholder="筛选受试者" size="small" clearable style="width: 180px">
            <el-option v-for="s in subjectList" :key="s.id" :label="`${s.subject_code}${s.name ? ' - ' + s.name : ''}`" :value="s.id" />
          </el-select>
          <el-button size="small" icon="el-icon-refresh" @click="loadHistory">刷新</el-button>
        </div>
      </div>
      <el-table
        :data="historyData"
        v-loading="historyLoading"
        size="small"
        style="width: 100%"
        :header-cell-style="{ background: 'var(--bg-elevated, rgba(0,0,0,0.2))', color: 'var(--text-secondary, #aaa)' }"
        :cell-style="{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }"
        :row-style="{ height: '44px', verticalAlign: 'middle' }"
      >
        <el-table-column label="受试者" min-width="120">
          <template slot-scope="{ row }">
            <span style="font-weight: 600">{{ row.subject_code }}</span>
            <span v-if="row.subject_name" style="opacity: 0.6; margin-left: 4px">- {{ row.subject_name }}</span>
          </template>
        </el-table-column>
        <el-table-column label="开始时间" width="170">
          <template slot-scope="{ row }">{{ row.start_time }}</template>
        </el-table-column>
        <el-table-column label="时长" width="80" align="center">
          <template slot-scope="{ row }">{{ formatDuration(row.duration_seconds || 0) }}</template>
        </el-table-column>
        <el-table-column label="认知评分" width="90" align="center">
          <template slot-scope="{ row }">
            <span :style="{ color: scoreColor(row.avg_score), fontWeight: 700 }">{{ row.avg_score || 0 }}</span>
          </template>
        </el-table-column>
        <el-table-column label="负荷等级" width="100" align="center">
          <template slot-scope="{ row }">
            <el-tag :type="levelTagType(row.cognitive_level)" size="mini" effect="dark">
              {{ levelText(row.cognitive_level) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="θ/β" width="70" align="center">
          <template slot-scope="{ row }">{{ (row.avg_theta_beta || 0).toFixed(2) }}</template>
        </el-table-column>
        <el-table-column label="SNR" width="75" align="center">
          <template slot-scope="{ row }">{{ (row.avg_snr || 0).toFixed(1) }} dB</template>
        </el-table-column>
        <el-table-column label="操作" width="120" align="center">
          <template slot-scope="{ row }">
            <el-button type="text" size="mini" @click="viewSessionDetail(row)">详情</el-button>
            <el-button type="text" size="mini" style="color: #ef4444" @click="deleteSession(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div v-if="historyData.length === 0 && !historyLoading" class="history-empty">
        <i class="el-icon-folder-opened" style="font-size: 40px; opacity: 0.3"></i>
        <p>暂无监测记录</p>
      </div>
    </div>
    </template>

    <!-- 数据汇总 -->
    <template v-if="activeTab === 'summary'">
    <div class="panel-card">
      <div class="summary-header">
        <h3 class="chart-title"><i class="el-icon-data-analysis"></i> 认知负荷数据汇总</h3>
        <el-button size="small" icon="el-icon-refresh" :loading="summaryLoading" @click="loadSummary">刷新</el-button>
      </div>

      <!-- 统计卡片 -->
      <div class="summary-cards">
        <div class="summary-card">
          <div class="card-icon" style="background: rgba(0, 212, 255, 0.12); color: #00d4ff;">
            <i class="el-icon-user"></i>
          </div>
          <div class="card-info">
            <div class="card-value">{{ summaryStats.total_subjects }}</div>
            <div class="card-label">受试者总数</div>
          </div>
        </div>
        <div class="summary-card">
          <div class="card-icon" style="background: rgba(34, 197, 94, 0.12); color: #22c55e;">
            <i class="el-icon-coin"></i>
          </div>
          <div class="card-info">
            <div class="card-value">{{ summaryStats.total_sessions }}</div>
            <div class="card-label">总会话次数</div>
          </div>
        </div>
        <div class="summary-card">
          <div class="card-icon" style="background: rgba(245, 158, 11, 0.12); color: #f59e0b;">
            <i class="el-icon-data-line"></i>
          </div>
          <div class="card-info">
            <div class="card-value">{{ summaryStats.avg_score }}</div>
            <div class="card-label">平均认知评分</div>
          </div>
        </div>
        <div class="summary-card">
          <div class="card-icon" style="background: rgba(239, 68, 68, 0.12); color: #ef4444;">
            <i class="el-icon-warning-outline"></i>
          </div>
          <div class="card-info">
            <div class="card-value">{{ summaryStats.high_risk_ratio }}%</div>
            <div class="card-label">高负荷占比</div>
          </div>
        </div>
      </div>

      <!-- 图表区 -->
      <div class="summary-charts">
        <div class="panel-card chart-card">
          <h4 class="sub-title"><i class="el-icon-s-data"></i> 各受试者认知评分对比</h4>
          <div ref="summaryBarChart" style="width: 100%; height: 280px;"></div>
        </div>
        <div class="panel-card chart-card">
          <h4 class="sub-title"><i class="el-icon-pie-chart"></i> 认知状态分组评分分布</h4>
          <div ref="summaryGroupChart" style="width: 100%; height: 280px;"></div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="summaryStats.total_sessions === 0 && !summaryLoading" class="history-empty">
        <i class="el-icon-folder-opened" style="font-size: 40px; opacity: 0.3"></i>
        <p>暂无数据，请先进行监测</p>
      </div>
    </div>
    </template>

    <!-- 会话详情弹窗 -->
    <el-dialog title="会话详情" :visible.sync="showDetailDialog" width="560px" append-to-body>
      <div v-if="detailData" class="detail-content">
        <div class="detail-info">
          <div class="detail-row"><span class="detail-label">受试者</span><span>{{ detailData.subject_code }}<span v-if="detailData.subject_name"> - {{ detailData.subject_name }}</span></span></div>
          <div class="detail-row"><span class="detail-label">开始时间</span><span>{{ detailData.start_time }}</span></div>
          <div class="detail-row"><span class="detail-label">时长</span><span>{{ formatDuration(detailData.duration_seconds || 0) }}</span></div>
          <div class="detail-row"><span class="detail-label">认知评分</span><span :style="{ color: scoreColor(detailData.avg_score), fontWeight: 700 }">{{ detailData.avg_score || 0 }} 分</span></div>
          <div class="detail-row"><span class="detail-label">负荷等级</span><span><el-tag :type="levelTagType(detailData.cognitive_level)" size="mini" effect="dark">{{ levelText(detailData.cognitive_level) }}</el-tag></span></div>
        </div>
        <h4 class="detail-section-title">特征指标均值</h4>
        <div class="detail-metrics">
          <div class="detail-metric"><span class="detail-metric-label">θ/β 比值</span><span>{{ (detailData.avg_theta_beta || 0).toFixed(2) }}</span></div>
          <div class="detail-metric"><span class="detail-metric-label">α/β 比值</span><span>{{ (detailData.avg_alpha_beta || 0).toFixed(2) }}</span></div>
          <div class="detail-metric"><span class="detail-metric-label">θ 功率</span><span>{{ (detailData.avg_theta_power || 0).toFixed(1) }} μV²</span></div>
          <div class="detail-metric"><span class="detail-metric-label">α 功率</span><span>{{ (detailData.avg_alpha_power || 0).toFixed(1) }} μV²</span></div>
          <div class="detail-metric"><span class="detail-metric-label">β 功率</span><span>{{ (detailData.avg_beta_power || 0).toFixed(1) }} μV²</span></div>
          <div class="detail-metric"><span class="detail-metric-label">SNR</span><span>{{ (detailData.avg_snr || 0).toFixed(1) }} dB</span></div>
        </div>
        <h4 class="detail-section-title">评分趋势</h4>
        <div ref="detailTrendChart" style="width: 100%; height: 160px;"></div>
      </div>
      <span slot="footer">
        <el-button size="small" @click="showDetailDialog = false">关闭</el-button>
      </span>
    </el-dialog>

    <!-- 受试者管理弹窗 -->
    <el-dialog
      :title="editingSubjectId ? '编辑受试者' : '新增受试者'"
      :visible.sync="showSubjectDialog"
      width="480px"
      append-to-body
      @close="resetSubjectForm"
    >
      <el-form ref="subjectForm" :model="subjectForm" :rules="subjectRules" label-width="90px" size="small">
        <el-form-item label="受试者编号" prop="subject_code">
          <el-input v-model="subjectForm.subject_code" placeholder="如 SUB001" :disabled="!!editingSubjectId" />
        </el-form-item>
        <el-form-item label="姓名">
          <el-input v-model="subjectForm.name" placeholder="留空则为匿名" />
        </el-form-item>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="年龄" prop="age">
              <el-input-number v-model="subjectForm.age" :min="40" :max="100" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="性别" prop="gender">
              <el-select v-model="subjectForm.gender" style="width: 100%">
                <el-option label="男" value="male" />
                <el-option label="女" value="female" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="认知状态" prop="cognitive_status">
          <el-select v-model="subjectForm.cognitive_status" style="width: 100%">
            <el-option label="正常" value="normal" />
            <el-option label="轻度认知障碍 (MCI)" value="mci" />
            <el-option label="痴呆" value="dementia" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="subjectForm.remark" type="textarea" :rows="2" placeholder="可选" />
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button size="small" @click="showSubjectDialog = false">取消</el-button>
        <el-button type="primary" size="small" :loading="subjectSaving" @click="saveSubject">保存</el-button>
      </span>
    </el-dialog>

    <!-- 设置弹窗 -->
    <el-dialog title="EEG 监测设置" :visible.sync="showSettings" width="420px" append-to-body>
      <el-form label-width="100px" size="small">
        <el-form-item label="采样率">
          <el-select v-model="sampleRate" style="width: 100%">
            <el-option :value="128" label="128 Hz（标准）" />
            <el-option :value="256" label="256 Hz（高精度）" />
            <el-option :value="512" label="512 Hz（科研级）" />
          </el-select>
        </el-form-item>
        <el-form-item label="显示通道">
          <el-checkbox-group v-model="visibleChannels">
            <el-checkbox v-for="ch in ALL_CHANNELS" :key="ch.id" :label="ch.id">{{ ch.label }}</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="伪迹检测">
          <el-switch v-model="artifactDetection" />
          <span class="setting-hint">自动标记眼电/肌电干扰</span>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button size="small" @click="showSettings = false">关闭</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import { getEChartsTheme } from '@/utils/echartsTheme'

// 10-20 系统电极配置
const ALL_CHANNELS = [
  { id: 'Fp1', label: 'Fp1', color: '#00d4ff', region: 'frontal' },
  { id: 'Fp2', label: 'Fp2', color: '#00e5ff', region: 'frontal' },
  { id: 'C3',  label: 'C3',  color: '#9c27ff', region: 'central' },
  { id: 'C4',  label: 'C4',  color: '#bb6bd9', region: 'central' },
  { id: 'P3',  label: 'P3',  color: '#22c55e', region: 'parietal' },
  { id: 'P4',  label: 'P4',  color: '#4ade80', region: 'parietal' },
  { id: 'O1',  label: 'O1',  color: '#f59e0b', region: 'occipital' },
  { id: 'O2',  label: 'O2',  color: '#fbbf24', region: 'occipital' }
]

// 频段定义
const BANDS = [
  { name: 'δ (Delta)', range: [0.5, 4],   color: '#ef4444' },
  { name: 'θ (Theta)', range: [4, 8],       color: '#f59e0b' },
  { name: 'α (Alpha)', range: [8, 13],      color: '#22c55e' },
  { name: 'β (Beta)',  range: [13, 30],     color: '#3b82f6' },
  { name: 'γ (Gamma)', range: [30, 45],     color: '#9c27ff' }
]

// 脑地形图电极位置（归一化到 0-1，10-20 系统简化）
const TOPO_ELECTRODES = {
  'Fp1': [0.30, 0.18], 'Fpz': [0.50, 0.12], 'Fp2': [0.70, 0.18],
  'F7':  [0.15, 0.32], 'F3':  [0.32, 0.30], 'Fz':  [0.50, 0.28], 'F4': [0.68, 0.30], 'F8': [0.85, 0.32],
  'T3':  [0.08, 0.50], 'C3':  [0.28, 0.50], 'Cz':  [0.50, 0.48], 'C4': [0.72, 0.50], 'T4': [0.92, 0.50],
  'T5':  [0.15, 0.68], 'P3':  [0.32, 0.70], 'Pz':  [0.50, 0.72], 'P4': [0.68, 0.70], 'T6': [0.85, 0.68],
  'O1':  [0.30, 0.88], 'Oz':  [0.50, 0.92], 'O2':  [0.70, 0.88]
}

export default {
  name: 'EEGMonitorView',

  data() {
    return {
      ALL_CHANNELS,
      // Tab 状态
      activeTab: 'monitor',

      // 受试者
      subjectList: [],
      currentSubjectId: null,
      currentSubjectName: '',
      subjectLoading: false,
      showSubjectDialog: false,
      editingSubjectId: null,
      subjectSaving: false,
      subjectForm: {
        subject_code: '',
        name: '',
        age: 65,
        gender: 'male',
        cognitive_status: 'normal',
        remark: ''
      },
      subjectRules: {
        subject_code: [{ required: true, message: '请输入受试者编号', trigger: 'blur' }],
        age: [{ required: true, message: '请输入年龄', trigger: 'change' }],
        gender: [{ required: true, message: '请选择性别', trigger: 'change' }],
        cognitive_status: [{ required: true, message: '请选择认知状态', trigger: 'change' }]
      },

      // 会话
      activeSessionId: null,
      sessionTimer: null,

      // 历史记录
      historyData: [],
      historyLoading: false,
      historyFilter: { subject_id: null },

      // 数据汇总
      summaryLoading: false,
      summaryStats: {
        total_subjects: 0,
        total_sessions: 0,
        avg_score: 0,
        high_risk_ratio: 0
      },
      summarySubjectData: [],  // 柱状图数据
      summaryGroupData: [],    // 分组数据

      // 会话详情弹窗
      showDetailDialog: false,
      detailData: null,

      // 控制参数
      dataSource: 'simulation',
      cognitiveLevel: 'medium',
      signalQuality: 'good',
      sampleRate: 256,
      timeWindow: 10,
      artifactDetection: true,
      visibleChannels: ['Fp1', 'Fp2', 'C3', 'C4', 'P3', 'P4', 'O1', 'O2'],
      showSettings: false,

      // 运行状态
      isRunning: false,
      animationId: null,
      lastTimestamp: 0,
      elapsedTime: 0,

      // 数据缓冲区（每通道一个环形数组）
      channelBuffers: {},
      // 功率谱缓冲（用于 PSD 图）
      psdBuffers: {},

      // 实时特征值
      currentThetaBeta: 1.0,
      currentAlphaBeta: 1.0,
      currentThetaPower: 15.0,
      currentAlphaPower: 20.0,
      currentBetaPower: 18.0,
      currentSNR: 20.0,
      cognitiveLoadScore: 35,
      cognitiveLoadLevel: 'low',

      // 负荷趋势历史
      loadTrendHistory: [],

      // ECharts 实例
      charts: {},
      resizeHandler: null,

      // 伪迹标记
      artifactMarkers: {}
    }
  },

  computed: {
    connectionStatusClass() {
      return this.isRunning ? 'connected' : 'disconnected'
    },
    connectionStatusText() {
      if (!this.isRunning) return '未连接'
      return this.dataSource === 'simulation' ? '模拟信号传输中' : '设备已连接'
    },
    cognitiveLoadLabel() {
      const map = { low: '低负荷', medium: '中等负荷', high: '高负荷' }
      return map[this.cognitiveLoadLevel] || '中等负荷'
    },
    thetaBetaColor() {
      if (this.currentThetaBeta < 1.0) return '#22c55e'
      if (this.currentThetaBeta < 2.0) return '#f59e0b'
      return '#ef4444'
    },
    snrColor() {
      if (this.currentSNR > 15) return '#22c55e'
      if (this.currentSNR > 8) return '#f59e0b'
      return '#ef4444'
    },
    visibleChannelObjects() {
      return ALL_CHANNELS.filter(ch => this.visibleChannels.includes(ch.id))
    }
  },

  watch: {
    cognitiveLevel() {
      // 切换负荷等级时，特征值平滑过渡
    }
  },

  mounted() {
    this.initBuffers()
    this.loadSubjectList()
    this.$nextTick(() => {
      this.initCharts()
      this.handleResize = () => {
        Object.values(this.charts).forEach(c => c && c.resize())
      }
      window.addEventListener('resize', this.handleResize)
    })
    // 监听主题切换
    this.$root.$on('theme-changed', () => {
      this.$nextTick(() => this.updateChartsTheme())
    })
  },

  beforeDestroy() {
    this.stopRunning()
    if (this.sessionTimer) {
      clearInterval(this.sessionTimer)
      this.sessionTimer = null
    }
    window.removeEventListener('resize', this.handleResize)
    Object.values(this.charts).forEach(c => c && c.dispose())
    this.charts = {}
    this.$root.$off('theme-changed')
  },

  methods: {
    // ==================== 初始化 ====================
    initBuffers() {
      const bufSize = this.sampleRate * 20 // 最多缓存 20 秒
      ALL_CHANNELS.forEach(ch => {
        this.channelBuffers[ch.id] = new Float32Array(bufSize)
        this.psdBuffers[ch.id] = []
      })
      // 负荷趋势 60 个点（每秒 1 个）
      this.loadTrendHistory = new Array(60).fill(35)
    },

    initCharts() {
      this.initWaveformChart()
      this.initPSDChart()
      this.initBandChart()
      this.initQualityChart()
      this.initTopomapChart()
      this.initTrendChart()
    },

    // ==================== EEG 信号模拟 ====================
    /**
     * 基于认知负荷经典 EEG 标志生成模拟信号
     * - 低负荷：α 功率高、θ/β 比值低
     * - 中负荷：α 适中、θ/β 比值适中
     * - 高负荷：θ 功率↑、β 功率↓、α 抑制、θ/β 比值↑
     */
    generateEEGSample(channel, timeSeconds) {
      const levelConfig = {
        low:    { thetaAmp: 8,  alphaAmp: 30, betaAmp: 20, gammaAmp: 5,  deltaAmp: 12, noiseLevel: 0.3 },
        medium: { thetaAmp: 15, alphaAmp: 22, betaAmp: 18, gammaAmp: 8,  deltaAmp: 14, noiseLevel: 0.5 },
        high:   { thetaAmp: 28, alphaAmp: 10, betaAmp: 12, gammaAmp: 6,  deltaAmp: 16, noiseLevel: 0.8 }
      }
      const cfg = levelConfig[this.cognitiveLevel] || levelConfig.medium

      // 信号质量影响噪声
      const qualityNoise = {
        excellent: 1.0,
        good: 1.5,
        fair: 3.0,
        poor: 6.0
      }
      const qNoise = qualityNoise[this.signalQuality] || 1.5

      // 区域差异：额区(Fp) θ 更强，枕区(O) α 更强
      let regionMod = 1.0
      if (channel.region === 'frontal') { regionMod = { alpha: 0.7, theta: 1.3, beta: 0.9 } }
      else if (channel.region === 'occipital') { regionMod = { alpha: 1.4, theta: 0.8, beta: 1.1 } }
      else if (channel.region === 'parietal') { regionMod = { alpha: 1.1, theta: 1.1, beta: 1.0 } }
      else { regionMod = { alpha: 1.0, theta: 1.0, beta: 1.0 } }

      const alphaAmp = cfg.alphaAmp * (regionMod.alpha || 1) * qNoise
      const thetaAmp = cfg.thetaAmp * (regionMod.theta || 1) * qNoise
      const betaAmp  = cfg.betaAmp  * (regionMod.beta || 1)  * qNoise
      const gammaAmp = cfg.gammaAmp * qNoise
      const deltaAmp = cfg.deltaAmp * qNoise

      let value = 0
      // α 节律 (8-13 Hz) — 枕区主导
      value += alphaAmp * Math.sin(2 * Math.PI * 10.5 * timeSeconds + channel.id.charCodeAt(1) * 0.5)
      value += alphaAmp * 0.3 * Math.sin(2 * Math.PI * 9.8 * timeSeconds + 1.2)
      // θ 节律 (4-8 Hz) — 额区主导，认知负荷时增强
      value += thetaAmp * Math.sin(2 * Math.PI * 5.5 * timeSeconds + channel.id.charCodeAt(2) * 0.7)
      value += thetaAmp * 0.4 * Math.sin(2 * Math.PI * 6.2 * timeSeconds + 2.1)
      // β 节律 (13-30 Hz)
      value += betaAmp * Math.sin(2 * Math.PI * 18 * timeSeconds + 0.8)
      value += betaAmp * 0.5 * Math.sin(2 * Math.PI * 22 * timeSeconds + 1.5)
      value += betaAmp * 0.3 * Math.sin(2 * Math.PI * 15 * timeSeconds + 2.3)
      // γ 节律 (30-45 Hz)
      value += gammaAmp * Math.sin(2 * Math.PI * 35 * timeSeconds + 0.3)
      value += gammaAmp * 0.4 * Math.sin(2 * Math.PI * 40 * timeSeconds + 1.7)
      // δ 节律 (0.5-4 Hz)
      value += deltaAmp * Math.sin(2 * Math.PI * 2 * timeSeconds + 0.5)

      // 随机噪声
      value += (Math.random() - 0.5) * cfg.noiseLevel * qNoise * 10

      // 偶尔出现伪迹（眼电/肌电）
      if (this.artifactDetection && Math.random() < 0.001 * qNoise) {
        value += (Math.random() - 0.5) * 80 * qNoise
        this.artifactMarkers[channel.id] = true
      } else {
        this.artifactMarkers[channel.id] = false
      }

      return value
    },

    // ==================== 数据更新 ====================
    updateData(timestamp) {
      if (!this.isRunning) return

      const dt = this.lastTimestamp ? (timestamp - this.lastTimestamp) / 1000 : 1 / 60
      this.lastTimestamp = timestamp
      this.elapsedTime += dt

      const timePerSample = 1 / this.sampleRate
      const samplesThisFrame = Math.max(1, Math.round(dt / timePerSample))

      for (let s = 0; s < samplesThisFrame; s++) {
        const t = this.elapsedTime - (samplesThisFrame - s) * timePerSample
        ALL_CHANNELS.forEach(ch => {
          const buf = this.channelBuffers[ch.id]
          // 环形缓冲：左移一位
          buf.copyWithin(0, 1)
          buf[buf.length - 1] = this.generateEEGSample(ch, t)
        })
      }

      // 每 0.5 秒更新特征值和图表
      if (!this._lastFeatureUpdate || timestamp - this._lastFeatureUpdate > 500) {
        this._lastFeatureUpdate = timestamp
        this.updateFeatures()
        this.updateWaveformChart()
        this.updatePSDChart()
        this.updateBandChart()
        this.updateQualityChart()
        this.updateTopomapChart()
        this.updateTrendChart()
      }

      this.animationId = requestAnimationFrame(this.updateData)
    },

    updateFeatures() {
      const channels = this.visibleChannelObjects
      if (!channels.length) return // 无可见通道时跳过

      // 从最新 1 秒数据计算功率特征
      const n = this.sampleRate
      let thetaSum = 0, alphaSum = 0, betaSum = 0, gammaSum = 0, deltaSum = 0
      let signalSum = 0, noiseSum = 0

      channels.forEach(ch => {
        const buf = this.channelBuffers[ch.id]
        if (!buf || buf.length === 0) return
        const start = Math.max(0, buf.length - n)
        const segment = buf.slice(start)
        const segLen = segment.length
        if (segLen === 0) return

        // 方差
        let segSum = 0
        for (let i = 0; i < segLen; i++) segSum += segment[i]
        const mean = segLen > 0 ? segSum / segLen : 0
        let variance = 0
        for (let i = 0; i < segLen; i++) variance += (segment[i] - mean) ** 2

        // 用正弦拟合窗口近似各频段功率
        const t0 = this.elapsedTime - 1
        let bandPow = { delta: 0, theta: 0, alpha: 0, beta: 0, gamma: 0 }
        const step = Math.max(1, Math.floor(segLen / 64))
        const divStep = segLen / step || 1 // 防止除零
        for (let i = 0; i < segLen; i += step) {
          const t = t0 + (i / segLen)
          const v = segment[i]
          bandPow.delta += v * Math.sin(2 * Math.PI * 2 * t)
          bandPow.theta += v * Math.sin(2 * Math.PI * 6 * t)
          bandPow.alpha += v * Math.sin(2 * Math.PI * 10.5 * t)
          bandPow.beta  += v * Math.sin(2 * Math.PI * 20 * t)
          bandPow.gamma += v * Math.sin(2 * Math.PI * 38 * t)
          signalSum += v * v
        }
        const powerScale = divStep / channels.length
        deltaSum += Math.abs(bandPow.delta) * powerScale
        thetaSum += Math.abs(bandPow.theta) * powerScale
        alphaSum += Math.abs(bandPow.alpha) * powerScale
        betaSum  += Math.abs(bandPow.beta)  * powerScale
        gammaSum += Math.abs(bandPow.gamma) * powerScale
        noiseSum += variance / segLen
      })

      // 平滑过渡（对 NaN 防护）
      const safeVal = (v) => isNaN(v) || !isFinite(v) ? 0 : v
      const smooth = 0.3
      this.currentThetaPower = safeVal(this.currentThetaPower) * (1 - smooth) + safeVal(thetaSum) * smooth
      this.currentAlphaPower = safeVal(this.currentAlphaPower) * (1 - smooth) + safeVal(alphaSum) * smooth
      this.currentBetaPower  = safeVal(this.currentBetaPower)  * (1 - smooth) + safeVal(betaSum)  * smooth

      const safeBeta = Math.max(safeVal(this.currentBetaPower), 0.01)
      const safeAlpha = Math.max(safeVal(this.currentAlphaPower), 0.01)
      this.currentThetaBeta = this.currentThetaPower / safeBeta
      this.currentAlphaBeta = this.currentAlphaPower / safeBeta

      // SNR
      const totalSamples = channels.length * this.sampleRate || 1
      const avgSignal = safeVal(signalSum) / totalSamples
      const avgNoise = safeVal(noiseSum) / (channels.length || 1)
      this.currentSNR = avgNoise > 0 ? 10 * Math.log10(Math.max(avgSignal, 0.001) / avgNoise) : 20

      // 认知负荷评分（基于 θ/β 比值 + α 功率）
      const tbNorm = Math.min(Math.max(safeVal(this.currentThetaBeta), 0), 5) / 5
      const alphaNorm = 1 - Math.min(Math.max(safeVal(this.currentAlphaPower), 0), 40) / 40
      this.cognitiveLoadScore = Math.round((tbNorm * 0.6 + alphaNorm * 0.4) * 100)

      if (isNaN(this.cognitiveLoadScore)) this.cognitiveLoadScore = 35
      if (this.cognitiveLoadScore < 33) this.cognitiveLoadLevel = 'low'
      else if (this.cognitiveLoadScore < 66) this.cognitiveLoadLevel = 'medium'
      else this.cognitiveLoadLevel = 'high'

      // 更新趋势
      this.loadTrendHistory.push(this.cognitiveLoadScore)
      if (this.loadTrendHistory.length > 60) this.loadTrendHistory.shift()
    },

    // ==================== 图表初始化与更新 ====================
    getTheme() {
      return getEChartsTheme()
    },

    initWaveformChart() {
      const dom = this.$refs.waveformChart
      if (!dom) return
      this.charts.waveform = echarts.init(dom)
      this.updateWaveformChart()
    },

    updateWaveformChart() {
      const chart = this.charts.waveform
      if (!chart) return
      const t = this.getTheme()
      const channels = this.visibleChannelObjects
      const nPoints = this.sampleRate * this.timeWindow
      const gap = 80 // 通道间电压偏移（μV）
      const totalRange = channels.length * gap

      const series = channels.map((ch, idx) => {
        const buf = this.channelBuffers[ch.id]
        const start = Math.max(0, buf.length - nPoints)
        const data = []
        for (let i = start; i < buf.length; i++) {
          data.push(buf[i] + (channels.length - 1 - idx) * gap)
        }
        return {
          name: ch.label,
          type: 'line',
          data,
          smooth: false,
          symbol: 'none',
          lineStyle: { width: 1.2, color: ch.color },
          emphasis: { disabled: true },
          animation: false
        }
      })

      const yLabels = channels.map((ch, idx) => {
        const y = (channels.length - 1 - idx) * gap
        return { name: ch.label, yAxisIndex: 0, coord: [0, y],
          label: { show: true, position: 'insideStartTop', formatter: ch.label,
            color: ch.color, fontSize: 11, fontWeight: 'bold' },
          lineStyle: { color: 'rgba(255,255,255,0.15)', type: 'dashed' }
        }
      })

      chart.setOption({
        animation: false,
        backgroundColor: 'transparent',
        grid: { left: 50, right: 20, top: 10, bottom: 30 },
        xAxis: {
          type: 'category',
          data: new Array(nPoints).fill(''),
          show: false,
          boundaryGap: false
        },
        yAxis: {
          type: 'value',
          min: -gap / 2,
          max: totalRange + gap / 2,
          axisLabel: { show: false },
          splitLine: { show: false },
          axisLine: { show: false },
          axisTick: { show: false }
        },
        tooltip: {
          trigger: 'axis',
          formatter: params => {
            if (!params || !params.length) return ''
            const idx = params[0].dataIndex
            const time = ((idx / this.sampleRate) - this.timeWindow).toFixed(2)
            let html = `<div style="font-size:12px;color:${t.textPrimary}">时间: ${time}s</div>`
            params.forEach(p => {
              const rawVal = p.value - (channels.length - 1 - params.indexOf(p)) * gap
              html += `<div style="font-size:11px"><span style="color:${p.color};font-weight:bold">${p.seriesName}</span>: ${rawVal.toFixed(1)} μV</div>`
            })
            return html
          }
        },
        markLine: { data: yLabels },
        series
      }, true)
    },

    initPSDChart() {
      const dom = this.$refs.psdChart
      if (!dom) return
      this.charts.psd = echarts.init(dom)
      this.updatePSDChart()
    },

    updatePSDChart() {
      const chart = this.charts.psd
      if (!chart) return
      const t = this.getTheme()

      // 生成模拟 PSD（0-50 Hz）
      const freqs = []
      const powers = []
      for (let f = 0; f <= 50; f += 0.5) {
        freqs.push(f.toFixed(1))
        let pw = 2 + Math.random() * 1
        if (f >= 0.5 && f < 4) pw += this.currentDeltaPower * 0.1 * Math.exp(-((f - 2) ** 2) / 2)
        if (f >= 4 && f < 8)   pw += this.currentThetaPower * 0.15 * Math.exp(-((f - 6) ** 2) / 2)
        if (f >= 8 && f < 13)  pw += this.currentAlphaPower * 0.12 * Math.exp(-((f - 10.5) ** 2) / 3)
        if (f >= 13 && f < 30) pw += this.currentBetaPower * 0.1 * Math.exp(-((f - 20) ** 2) / 20)
        if (f >= 30 && f < 45) pw += 3 * Math.exp(-((f - 38) ** 2) / 10)
        powers.push(pw)
      }

      // 频段背景色
      const markAreas = BANDS.map(b => [{
        xAxis: String(b.range[0]),
        itemStyle: { color: b.color, opacity: 0.08 }
      }, {
        xAxis: String(b.range[1])
      }])

      chart.setOption({
        animation: false,
        backgroundColor: 'transparent',
        grid: { left: 35, right: 10, top: 10, bottom: 25 },
        xAxis: {
          type: 'category',
          data: freqs,
          axisLabel: { color: t.textMuted, fontSize: 9, interval: 19 },
          axisLine: { lineStyle: { color: t.borderLight } },
          splitLine: { show: false }
        },
        yAxis: {
          type: 'value',
          name: 'μV²/Hz',
          nameTextStyle: { color: t.textMuted, fontSize: 9 },
          axisLabel: { color: t.textMuted, fontSize: 9 },
          splitLine: { lineStyle: { color: t.borderLight, type: 'dashed' } },
          axisLine: { show: false }
        },
        tooltip: { trigger: 'axis', formatter: p => `${p[0].axisValue} Hz: ${p[0].value.toFixed(2)} μV²/Hz` },
        series: [{
          type: 'line',
          data: powers,
          smooth: true,
          symbol: 'none',
          lineStyle: { color: t.primaryBlue, width: 1.5 },
          areaStyle: { color: t.rgbaPrimary(0.15) },
          markArea: { silent: true, data: markAreas }
        }]
      }, true)
    },

    initBandChart() {
      const dom = this.$refs.bandChart
      if (!dom) return
      this.charts.band = echarts.init(dom)
      this.updateBandChart()
    },

    updateBandChart() {
      const chart = this.charts.band
      if (!chart) return
      const t = this.getTheme()

      const pTheta = this.currentThetaPower
      const pAlpha = this.currentAlphaPower
      const pBeta  = this.currentBetaPower
      const pDelta = this.currentThetaPower * 0.7
      const pGamma = pBeta * 0.3

      const data = BANDS.map(b => {
        let val
        if (b.name.includes('δ')) val = pDelta
        else if (b.name.includes('θ')) val = pTheta
        else if (b.name.includes('α')) val = pAlpha
        else if (b.name.includes('β')) val = pBeta
        else val = pGamma
        return { name: b.name, value: val, itemStyle: { color: b.color } }
      })

      chart.setOption({
        animation: false,
        backgroundColor: 'transparent',
        radar: {
          shape: 'polygon',
          indicator: BANDS.map(b => ({ name: b.name.split(' ')[0], max: 50 })),
          axisName: { color: t.textMuted, fontSize: 10 },
          splitArea: { areaStyle: { color: ['transparent', 'rgba(255,255,255,0.02)'] } },
          splitLine: { lineStyle: { color: t.borderLight } },
          axisLine: { lineStyle: { color: t.borderLight } }
        },
        series: [{
          type: 'radar',
          data: [{
            value: data.map(d => d.value),
            name: '频段能量',
            lineStyle: { color: t.primaryBlue, width: 1.5 },
            areaStyle: { color: t.rgbaPrimary(0.2) },
            itemStyle: { color: t.primaryBlue }
          }]
        }]
      }, true)
    },

    initQualityChart() {
      const dom = this.$refs.qualityChart
      if (!dom) return
      this.charts.quality = echarts.init(dom)
      this.updateQualityChart()
    },

    updateQualityChart() {
      const chart = this.charts.quality
      if (!chart) return
      const t = this.getTheme()

      const snrVal = Math.min(Math.max(this.currentSNR, 0), 30)
      const snrColor = snrVal > 15 ? '#22c55e' : snrVal > 8 ? '#f59e0b' : '#ef4444'

      chart.setOption({
        animation: false,
        backgroundColor: 'transparent',
        series: [{
          type: 'gauge',
          startAngle: 200,
          endAngle: -20,
          min: 0,
          max: 30,
          radius: '85%',
          splitNumber: 5,
          axisLine: {
            lineStyle: {
              width: 12,
              color: [
                [0.27, '#ef4444'],
                [0.5, '#f59e0b'],
                [1, '#22c55e']
              ]
            }
          },
          pointer: {
            length: '60%',
            width: 5,
            itemStyle: { color: snrColor }
          },
          axisTick: { show: false },
          splitLine: { show: false },
          axisLabel: { show: false },
          title: { show: false },
          detail: {
            valueAnimation: false,
            formatter: '{value} dB',
            color: snrColor,
            fontSize: 16,
            fontWeight: 'bold',
            offsetCenter: [0, '40%']
          },
          data: [{ value: snrVal }]
        }]
      }, true)
    },

    initTopomapChart() {
      const dom = this.$refs.topomapChart
      if (!dom) return
      this.charts.topomap = echarts.init(dom)
      this.updateTopomapChart()
    },

    updateTopomapChart() {
      const chart = this.charts.topomap
      if (!chart) return
      const t = this.getTheme()

      // 生成各电极功率值
      const electrodeData = []
      const channelPowerMap = {
        'Fp1': this.currentThetaPower * 1.2,
        'Fp2': this.currentThetaPower * 1.1,
        'C3': this.currentAlphaPower * 0.9 + this.currentBetaPower * 0.3,
        'C4': this.currentAlphaPower * 0.85 + this.currentBetaPower * 0.35,
        'P3': this.currentAlphaPower * 1.0,
        'P4': this.currentAlphaPower * 0.95,
        'O1': this.currentAlphaPower * 1.3,
        'O2': this.currentAlphaPower * 1.25
      }

      // 为所有电极生成数据
      Object.entries(TOPO_ELECTRODES).forEach(([name, [x, y]]) => {
        let power = 15 + Math.random() * 5
        if (channelPowerMap[name] != null) {
          power = channelPowerMap[name] + (Math.random() - 0.5) * 3
        } else {
          // 插值估算其他电极
          const pick = (k1, k2) => (channelPowerMap[k1] || 15) + (channelPowerMap[k2] || 15)
          if (name === 'Cz') power = pick('C3', 'C4') / 2
          else if (name === 'Pz') power = pick('P3', 'P4') / 2
          else if (name === 'Fz') power = pick('Fp1', 'Fp2') / 2 * 0.8
          else if (name === 'Oz') power = pick('O1', 'O2') / 2
          else power = 10 + Math.random() * 15
        }
        electrodeData.push({
          name,
          value: [x, y, Math.max(0, power)],
          symbolSize: 10,
          itemStyle: { borderColor: '#fff', borderWidth: 1 }
        })
      })

      const minP = 0, maxP = 45

      chart.setOption({
        animation: false,
        backgroundColor: 'transparent',
        grid: { left: 5, right: 5, top: 5, bottom: 5 },
        xAxis: {
          type: 'value', min: 0, max: 1, show: false
        },
        yAxis: {
          type: 'value', min: 0, max: 1, show: false
        },
        visualMap: {
          min: minP,
          max: maxP,
          calculable: false,
          orient: 'horizontal',
          left: 'center',
          bottom: 0,
          itemWidth: 80,
          itemHeight: 8,
          textStyle: { color: t.textMuted, fontSize: 9 },
          inRange: {
            color: ['#0a1628', '#003366', '#0066cc', '#00ccff', '#ffcc00', '#ff6600', '#ff0000']
          },
          text: ['高', '低']
        },
        tooltip: {
          formatter: p => `${p.name}: ${p.value[2].toFixed(1)} μV²`
        },
        series: [{
          type: 'effectScatter',
          coordinateSystem: 'cartesian2d',
          data: electrodeData,
          symbolSize: function(val) { return 12 + (val[2] / maxP) * 8 },
          rippleEffect: {
            brushType: 'stroke',
            scale: 2.5,
            period: 3
          },
          itemStyle: {
            shadowBlur: 10,
            shadowColor: 'rgba(0, 212, 255, 0.4)'
          },
          label: {
            show: true,
            formatter: '{b}',
            position: 'right',
            color: t.textMuted,
            fontSize: 9
          }
        }]
      }, true)
    },

    initTrendChart() {
      const dom = this.$refs.trendChart
      if (!dom) return
      this.charts.trend = echarts.init(dom)
      this.updateTrendChart()
    },

    updateTrendChart() {
      const chart = this.charts.trend
      if (!chart) return
      const t = this.getTheme()

      const data = this.loadTrendHistory.map((v, i) => [i, v])
      const getAreaColor = (level) => {
        if (level === 'high') return t.rgbaError(0.3)
        if (level === 'medium') return t.rgbaPrimary(0.2)
        return t.rgbaAccentCyan(0.2)
      }

      chart.setOption({
        animation: false,
        backgroundColor: 'transparent',
        grid: { left: 30, right: 8, top: 5, bottom: 20 },
        xAxis: {
          type: 'value',
          min: 0,
          max: 59,
          axisLabel: { show: false },
          axisLine: { show: false },
          splitLine: { show: false }
        },
        yAxis: {
          type: 'value',
          min: 0,
          max: 100,
          axisLabel: { color: t.textMuted, fontSize: 9, formatter: '{value}' },
          splitLine: { lineStyle: { color: t.borderLight, type: 'dashed' } },
          axisLine: { show: false }
        },
        tooltip: { trigger: 'axis', formatter: p => `负荷指数: ${p[0].value[1]}` },
        visualMap: {
          show: false,
          pieces: [
            { lte: 33, color: '#22c55e' },
            { gt: 33, lte: 66, color: '#f59e0b' },
            { gt: 66, color: '#ef4444' }
          ]
        },
        series: [{
          type: 'line',
          data,
          smooth: true,
          symbol: 'none',
          lineStyle: { width: 2 },
          areaStyle: { color: getAreaColor(this.cognitiveLoadLevel) }
        }]
      }, true)
    },

    updateChartsTheme() {
      Object.values(this.charts).forEach(c => {
        if (c) {
          c.dispose()
        }
      })
      this.charts = {}
      this.$nextTick(() => this.initCharts())
    },

    // ==================== 会话管理 ====================
    async startSession() {
      if (!this.currentSubjectId) {
        this.$message.warning('请先选择受试者')
        return
      }
      // 设置当前受试者名称
      const subject = this.subjectList.find(s => s.id === this.currentSubjectId)
      this.currentSubjectName = subject
        ? `${subject.subject_code}${subject.name ? ' - ' + subject.name : ''}`
        : '未知'

      // 尝试调后端 API 创建会话
      try {
        const { createSession } = require('@/api/eegSession')
        const res = await createSession({ subject_id: this.currentSubjectId })
        if (res && res.data && res.data.session_id) {
          this.activeSessionId = res.data.session_id
        }
      } catch (e) {
        // 后端还没好，前端照样跑，不影响演示
        console.warn('[EEG] 后端创建会话失败，使用前端本地模式:', e.message || e)
        this.activeSessionId = 'local_' + Date.now()
      }

      // 启动模拟信号
      this.startRunning()

      // 启动计时器
      this.elapsedTime = 0
      this.sessionTimer = setInterval(() => {
        if (this.isRunning) {
          // elapsedTime 已在 updateData 里更新，这里只是确保 UI 刷新
        }
      }, 1000)

      this.$message.success(`开始监测：${this.currentSubjectName}`)
    },

    async stopSession() {
      // 停止模拟信号
      this.stopRunning()

      // 停止计时器
      if (this.sessionTimer) {
        clearInterval(this.sessionTimer)
        this.sessionTimer = null
      }

      // 尝试调后端 API 保存会话结果
      if (this.activeSessionId && this.activeSessionId !== 'local_') {
        try {
          const { endSession } = require('@/api/eegSession')
          await endSession(this.activeSessionId, {
            duration_seconds: Math.round(this.elapsedTime),
            avg_score: this.cognitiveLoadScore,
            avg_theta_beta: this.currentThetaBeta,
            avg_alpha_beta: this.currentAlphaBeta,
            avg_theta_power: this.currentThetaPower,
            avg_alpha_power: this.currentAlphaPower,
            avg_beta_power: this.currentBetaPower,
            avg_snr: this.currentSNR,
            score_trend: [...this.loadTrendHistory],
            cognitive_level: this.cognitiveLoadLevel
          })
          this.$message.success('会话数据已保存')
        } catch (e) {
          console.warn('[EEG] 后端保存会话失败:', e.message || e)
          this.$message.info('会话已结束（本地模式，数据未上传）')
        }
      } else {
        this.$message.info('会话已结束（本地模式）')
      }

      this.activeSessionId = null
    },

    async loadSubjectList() {
      this.subjectLoading = true
      try {
        const { getSubjectList } = require('@/api/eegSession')
        const res = await getSubjectList({ page_size: 200 })
        if (res && res.data) {
          this.subjectList = res.data.subjects || res.data.items || res.data || []
        }
      } catch (e) {
        // 后端还没好，用空数组
        console.warn('[EEG] 加载受试者列表失败:', e.message || e)
        this.subjectList = []
      } finally {
        this.subjectLoading = false
      }
    },

    onSubjectChange(val) {
      if (this.isRunning) {
        this.$message.warning('监测进行中，请先结束当前会话再切换受试者')
        // 回滚选择
        this.$nextTick(() => {
          this.currentSubjectId = this.activeSessionId ? this.currentSubjectId : null
        })
      }
    },

    onTabChange(tab) {
      // 切到非监测 Tab 时不需要特殊处理
      if (tab.name === 'monitor' && this.isRunning) {
        this.$nextTick(() => this.initCharts())
      }
      if (tab.name === 'history') {
        this.loadHistory()
      }
      if (tab.name === 'summary') {
        this.loadSummary()
      }
    },

    formatDuration(seconds) {
      const m = Math.floor(seconds / 60)
      const s = Math.floor(seconds % 60)
      return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
    },

    genderLabel(g) {
      const map = { male: '男', female: '女', M: '男', F: '女' }
      return map[g] || '未知'
    },

    // ==================== 受试者弹窗 ====================
    resetSubjectForm() {
      this.editingSubjectId = null
      this.subjectForm = {
        subject_code: '',
        name: '',
        age: 65,
        gender: 'male',
        cognitive_status: 'normal',
        remark: ''
      }
      if (this.$refs.subjectForm) {
        this.$refs.subjectForm.clearValidate()
      }
    },

    async saveSubject() {
      // 表单校验
      try {
        await this.$refs.subjectForm.validate()
      } catch (e) {
        return
      }

      this.subjectSaving = true
      try {
        const { createSubject, updateSubject } = require('@/api/eegSession')
        if (this.editingSubjectId) {
          await updateSubject(this.editingSubjectId, {
            name: this.subjectForm.name,
            age: this.subjectForm.age,
            gender: this.subjectForm.gender,
            cognitive_status: this.subjectForm.cognitive_status,
            remark: this.subjectForm.remark
          })
          this.$message.success('受试者信息已更新')
        } else {
          await createSubject({
            subject_code: this.subjectForm.subject_code,
            name: this.subjectForm.name,
            age: this.subjectForm.age,
            gender: this.subjectForm.gender,
            cognitive_status: this.subjectForm.cognitive_status,
            remark: this.subjectForm.remark
          })
          this.$message.success('受试者已创建')
        }
        this.showSubjectDialog = false
        this.loadSubjectList()
      } catch (e) {
        console.warn('[EEG] 保存受试者失败:', e.message || e)
        this.$message.error('保存失败，请检查后端服务是否启动')
      } finally {
        this.subjectSaving = false
      }
    },

    // ==================== 历史记录 ====================
    async loadHistory() {
      this.historyLoading = true
      try {
        const { getSessionList } = require('@/api/eegSession')
        const params = { page_size: 100 }
        if (this.historyFilter.subject_id) {
          params.subject_id = this.historyFilter.subject_id
        }
        const res = await getSessionList(params)
        if (res && res.data) {
          this.historyData = Array.isArray(res.data) ? res.data : (res.data.sessions || res.data.items || [])
        }
      } catch (e) {
        console.warn('[EEG] 加载历史记录失败:', e.message || e)
        this.historyData = []
      } finally {
        this.historyLoading = false
      }
    },

    async viewSessionDetail(row) {
      this.detailData = row
      this.showDetailDialog = true
      // 弹窗打开后初始化趋势图
      this.$nextTick(() => this.renderDetailTrend(row))
    },

    renderDetailTrend(row) {
      const dom = this.$refs.detailTrendChart
      if (!dom) return
      const trend = row.score_trend || []
      if (trend.length === 0) return

      // 用独立 ECharts 实例，不存到 this.charts（弹窗销毁时手动清理）
      if (!this._detailChart) {
        this._detailChart = echarts.init(dom)
      }
      const t = this.getTheme()
      const data = trend.map((v, i) => [i, v])

      this._detailChart.setOption({
        animation: false,
        backgroundColor: 'transparent',
        grid: { left: 30, right: 10, top: 10, bottom: 20 },
        xAxis: {
          type: 'value', min: 0, max: Math.max(trend.length - 1, 1),
          show: false
        },
        yAxis: {
          type: 'value', min: 0, max: 100,
          axisLabel: { color: t.textMuted, fontSize: 9 },
          splitLine: { lineStyle: { color: t.borderLight, type: 'dashed' } },
          axisLine: { show: false }
        },
        visualMap: {
          show: false,
          pieces: [
            { lte: 33, color: '#22c55e' },
            { gt: 33, lte: 66, color: '#f59e0b' },
            { gt: 66, color: '#ef4444' }
          ]
        },
        series: [{
          type: 'line',
          data,
          smooth: true,
          symbol: 'none',
          lineStyle: { width: 2 },
          areaStyle: { color: 'rgba(0, 212, 255, 0.15)' }
        }]
      }, true)
    },

    async deleteSession(row) {
      try {
        await this.$confirm(`确定删除 ${row.subject_code} 的监测记录？`, '确认删除', {
          confirmButtonText: '删除',
          cancelButtonText: '取消',
          type: 'warning'
        })
      } catch (e) {
        return // 用户取消
      }
      try {
        const { deleteSession: delApi } = require('@/api/eegSession')
        await delApi(row.id)
        this.$message.success('已删除')
        this.loadHistory()
      } catch (e) {
        console.warn('[EEG] 删除会话失败:', e.message || e)
        this.$message.error('删除失败')
      }
    },

    scoreColor(score) {
      if (score < 33) return '#22c55e'
      if (score < 66) return '#f59e0b'
      return '#ef4444'
    },

    levelTagType(level) {
      const map = { low: 'success', medium: 'warning', high: 'danger' }
      return map[level] || 'info'
    },

    levelText(level) {
      const map = { low: '低负荷', medium: '中等负荷', high: '高负荷' }
      return map[level] || '未知'
    },

    // ==================== 数据汇总 ====================
    async loadSummary() {
      this.summaryLoading = true
      try {
        const { getSessionSummary } = require('@/api/eegSession')
        const res = await getSessionSummary({ group_by: 'subject' })
        if (res && res.data) {
          const d = res.data
          this.summaryStats = {
            total_subjects: d.total_subjects || 0,
            total_sessions: d.total_sessions || 0,
            avg_score: d.avg_score ? d.avg_score.toFixed(1) : '0',
            high_risk_ratio: d.high_risk_ratio != null ? Math.round(d.high_risk_ratio * 100) : 0
          }
          this.summarySubjectData = d.subject_details || []
          this.summaryGroupData = d.status_groups || []
        }
      } catch (e) {
        console.warn('[EEG] 加载汇总数据失败:', e.message || e)
        this.summaryStats = { total_subjects: 0, total_sessions: 0, avg_score: 0, high_risk_ratio: 0 }
        this.summarySubjectData = []
        this.summaryGroupData = []
      } finally {
        this.summaryLoading = false
        this.$nextTick(() => {
          this.renderSummaryBarChart()
          this.renderSummaryGroupChart()
        })
      }
    },

    renderSummaryBarChart() {
      const dom = this.$refs.summaryBarChart
      if (!dom) return
      if (!this._summaryBarChart) {
        this._summaryBarChart = echarts.init(dom)
      }
      const t = this.getTheme()
      const subjects = this.summarySubjectData

      if (subjects.length === 0) {
        this._summaryBarChart.setOption({
          backgroundColor: 'transparent',
          title: { text: '暂无数据', left: 'center', top: 'center', textStyle: { color: t.textMuted, fontSize: 13 } }
        })
        return
      }

      const names = subjects.map(s => s.subject_code)
      const scores = subjects.map(s => s.avg_score)
      const colors = scores.map(s => this.scoreColor(s))

      this._summaryBarChart.setOption({
        animation: true,
        backgroundColor: 'transparent',
        grid: { left: 80, right: 20, top: 20, bottom: 40 },
        xAxis: {
          type: 'category',
          data: names,
          axisLabel: { color: t.textMuted, fontSize: 11, rotate: names.length > 6 ? 30 : 0 },
          axisLine: { lineStyle: { color: t.borderLight } }
        },
        yAxis: {
          type: 'value', min: 0, max: 100,
          name: '评分',
          nameTextStyle: { color: t.textMuted, fontSize: 10 },
          axisLabel: { color: t.textMuted, fontSize: 10 },
          splitLine: { lineStyle: { color: t.borderLight, type: 'dashed' } },
          axisLine: { show: false }
        },
        tooltip: { trigger: 'axis', formatter: p => `${p[0].name}: ${p[0].value} 分` },
        series: [{
          type: 'bar',
          data: scores.map((v, i) => ({
            value: v,
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: colors[i] },
                { offset: 1, color: 'rgba(0,0,0,0.1)' }
              ]),
              borderRadius: [4, 4, 0, 0]
            }
          })),
          barWidth: subjects.length > 10 ? '40%' : '50%',
          label: {
            show: subjects.length <= 12,
            position: 'top',
            color: t.textMuted,
            fontSize: 10,
            formatter: '{c}'
          }
        }]
      }, true)
    },

    renderSummaryGroupChart() {
      const dom = this.$refs.summaryGroupChart
      if (!dom) return
      if (!this._summaryGroupChart) {
        this._summaryGroupChart = echarts.init(dom)
      }
      const t = this.getTheme()
      const groups = this.summaryGroupData

      if (groups.length === 0) {
        this._summaryGroupChart.setOption({
          backgroundColor: 'transparent',
          title: { text: '暂无数据', left: 'center', top: 'center', textStyle: { color: t.textMuted, fontSize: 13 } }
        })
        return
      }

      const statusLabels = { high: '高认知负荷', medium: '中认知负荷', low: '低认知负荷' }
      const statusColors = { high: '#22c55e', medium: '#f59e0b', low: '#ef4444' }

      // 箱线图需要 min/Q1/median/Q3/max 格式
      const boxData = groups.map(g => {
        const min = g.min_score || 0
        const max = g.max_score || 100
        const spread = max - min
        return {
          name: statusLabels[g.cognitive_status] || g.cognitive_status,
          value: [
            min,
            min + spread * 0.25,
            g.avg_score || 0,
            min + spread * 0.75,
            max
          ],
          itemStyle: { color: statusColors[g.cognitive_status] || '#999', borderColor: statusColors[g.cognitive_status] || '#999' }
        }
      })

      this._summaryGroupChart.setOption({
        animation: true,
        backgroundColor: 'transparent',
        grid: { left: 60, right: 20, top: 20, bottom: 40 },
        xAxis: {
          type: 'category',
          data: groups.map(g => statusLabels[g.cognitive_status] || g.cognitive_status),
          axisLabel: { color: t.textMuted, fontSize: 12 },
          axisLine: { lineStyle: { color: t.borderLight } }
        },
        yAxis: {
          type: 'value', min: 0, max: 100,
          name: '评分',
          nameTextStyle: { color: t.textMuted, fontSize: 10 },
          axisLabel: { color: t.textMuted, fontSize: 10 },
          splitLine: { lineStyle: { color: t.borderLight, type: 'dashed' } },
          axisLine: { show: false }
        },
        tooltip: {
          trigger: 'item',
          formatter: p => `${p.name}<br/>最小: ${p.value[0]}<br/>Q1: ${p.value[1]}<br/>中位数: ${p.value[2]}<br/>Q3: ${p.value[3]}<br/>最大: ${p.value[4]}`
        },
        series: [{
          type: 'boxplot',
          data: boxData,
          boxWidth: ['30%', '50%'],
          itemStyle: { borderWidth: 2 }
        }]
      }, true)
    },

    // ==================== 控制 ====================
    toggleRunning() {
      if (this.isRunning) {
        this.stopRunning()
      } else {
        this.startRunning()
      }
    },

    startRunning() {
      this.isRunning = true
      this.lastTimestamp = 0
      this._lastFeatureUpdate = 0
      this.animationId = requestAnimationFrame(this.updateData)
    },

    stopRunning() {
      this.isRunning = false
      if (this.animationId) {
        cancelAnimationFrame(this.animationId)
        this.animationId = null
      }
    },

    resetData() {
      this.stopRunning()
      this.elapsedTime = 0
      this.initBuffers()
      this.currentThetaBeta = 1.0
      this.currentAlphaBeta = 1.0
      this.currentThetaPower = 15.0
      this.currentAlphaPower = 20.0
      this.currentBetaPower = 18.0
      this.currentSNR = 20.0
      this.cognitiveLoadScore = 35
      this.cognitiveLoadLevel = 'low'
      this.loadTrendHistory = new Array(60).fill(35)
      this.$nextTick(() => {
        this.updateWaveformChart()
        this.updatePSDChart()
        this.updateBandChart()
        this.updateQualityChart()
        this.updateTopomapChart()
        this.updateTrendChart()
      })
      this.$message.success('数据已重置')
    },

    onDataSourceChange(val) {
      if (val === 'simulation') {
        // 模拟模式不需要额外处理
      }
    },

    onTimeWindowChange() {
      if (this.isRunning) {
        this.updateWaveformChart()
      }
    }
  }
}
</script>

<style scoped>
/* ==================== 页面布局 ==================== */
.eeg-monitor-page {
  max-width: 1600px;
  margin: 0 auto;
  padding-bottom: 40px;
}

.panel-card {
  background: var(--bg-card, rgba(10, 14, 39, 0.9));
  backdrop-filter: blur(15px);
  border: 1px solid var(--border-primary, rgba(0, 212, 255, 0.3));
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 16px;
  transition: border-color 0.3s;
}
.panel-card:hover {
  border-color: rgba(var(--primary-blue-rgb, 0,212,255), 0.5);
}

/* ==================== 头部 ==================== */
.header-card { margin-bottom: 16px; }
.eeg-monitor-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
}
.header-left { flex: 1; }
.page-title {
  font-size: 22px;
  font-weight: 700;
  background: linear-gradient(135deg, var(--primary-blue, #00d4ff), var(--accent-cyan, #00e5ff));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0 0 6px;
}
.page-title i {
  -webkit-text-fill-color: var(--primary-blue, #00d4ff);
  margin-right: 8px;
}
.page-desc {
  font-size: 13px;
  color: var(--text-muted, rgba(255,255,255,0.6));
  margin: 0;
}
.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* 连接状态 */
.connection-status {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  transition: all 0.3s;
}
.connection-status.connected {
  background: rgba(34, 197, 94, 0.15);
  color: #22c55e;
}
.connection-status.disconnected {
  background: rgba(255, 255, 255, 0.06);
  color: var(--text-muted, rgba(255,255,255,0.5));
}
.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: currentColor;
}
.connection-status.connected .status-dot {
  animation: pulse 1.5s infinite;
}
@keyframes pulse {
  0%, 100% { opacity: 1; box-shadow: 0 0 0 0 currentColor; }
  50% { opacity: 0.7; box-shadow: 0 0 0 4px transparent; }
}

/* ==================== 控制面板 ==================== */
.control-card { padding: 16px 20px; }
.control-row {
  display: flex;
  align-items: center;
  gap: 24px;
  flex-wrap: wrap;
}
.control-group {
  display: flex;
  align-items: center;
  gap: 8px;
}
.control-label {
  font-size: 13px;
  color: var(--text-secondary, rgba(255,255,255,0.8));
  white-space: nowrap;
  font-weight: 500;
}
.control-actions {
  display: flex;
  gap: 8px;
  margin-left: auto;
}

/* ==================== 主内容 ==================== */
.eeg-content {
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 16px;
}
.eeg-main {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.eeg-sidebar {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* ==================== 图表卡片 ==================== */
.chart-card { padding: 16px; }
.chart-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}
.chart-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary, #fff);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 6px;
}
.chart-title i { color: var(--primary-blue, #00d4ff); }
.chart-controls {
  display: flex;
  align-items: center;
  gap: 12px;
}
.sample-rate-info {
  font-size: 11px;
  color: var(--text-muted, rgba(255,255,255,0.5));
  background: rgba(var(--primary-blue-rgb, 0,212,255), 0.08);
  padding: 2px 8px;
  border-radius: 10px;
}

.waveform-chart-dom {
  width: 100%;
  height: 400px;
}

.sub-chart-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}
.sub-card { padding: 14px; }
.sub-title {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary, rgba(255,255,255,0.8));
  margin: 0 0 10px;
  display: flex;
  align-items: center;
  gap: 5px;
}
.sub-title i { color: var(--primary-blue, #00d4ff); font-size: 13px; }
.sub-chart-dom {
  width: 100%;
  height: 200px;
}

/* ==================== 右侧面板 ==================== */
.topomap-dom {
  width: 100%;
  height: 240px;
}

/* 认知负荷评分 */
.cognitive-score-card { padding: 16px; }
.score-display {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
}
.score-circle {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.5s;
  border: 3px solid;
}
.score-circle.level-low {
  border-color: #22c55e;
  background: rgba(34, 197, 94, 0.1);
  box-shadow: 0 0 20px rgba(34, 197, 94, 0.3);
}
.score-circle.level-medium {
  border-color: #f59e0b;
  background: rgba(245, 158, 11, 0.1);
  box-shadow: 0 0 20px rgba(245, 158, 11, 0.3);
}
.score-circle.level-high {
  border-color: #ef4444;
  background: rgba(239, 68, 68, 0.1);
  box-shadow: 0 0 20px rgba(239, 68, 68, 0.3);
}
.score-num {
  font-size: 24px;
  font-weight: 800;
  line-height: 1;
}
.level-low .score-num { color: #22c55e; }
.level-medium .score-num { color: #f59e0b; }
.level-high .score-num { color: #ef4444; }
.score-label {
  font-size: 10px;
  color: var(--text-muted, rgba(255,255,255,0.5));
}
.score-detail {}
.level-indicator {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 4px;
}
.level-indicator.level-low { color: #22c55e; }
.level-indicator.level-medium { color: #f59e0b; }
.level-indicator.level-high { color: #ef4444; }
.score-desc {
  font-size: 11px;
  color: var(--text-muted, rgba(255,255,255,0.5));
}

/* 特征指标 */
.feature-metrics {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  margin-bottom: 16px;
  padding: 12px;
  background: rgba(var(--primary-blue-rgb, 0,212,255), 0.04);
  border-radius: 10px;
  border: 1px solid rgba(var(--primary-blue-rgb, 0,212,255), 0.08);
}
.metric-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 0;
}
.metric-label {
  font-size: 11px;
  color: var(--text-muted, rgba(255,255,255,0.6));
}
.metric-value {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary, #fff);
  font-family: 'Consolas', 'Monaco', monospace;
}

/* 负荷趋势 */
.load-trend { margin-top: 4px; }
.trend-title {
  font-size: 11px;
  color: var(--text-muted, rgba(255,255,255,0.5));
  margin: 0 0 8px;
}
.trend-dom {
  width: 100%;
  height: 80px;
}

/* ==================== 设置弹窗 ==================== */
.setting-hint {
  font-size: 11px;
  color: var(--text-muted, rgba(255,255,255,0.5));
  margin-left: 8px;
}

/* ==================== 主题适配 ==================== */
[data-theme="medical"] .panel-card,
[data-theme="elderly"] .panel-card {
  border-color: var(--border-primary, #cce5ff);
}
[data-theme="medical"] .page-title,
[data-theme="elderly"] .page-title {
  background: linear-gradient(135deg, #0066cc, #4a90e2);
  -webkit-background-clip: text;
  background-clip: text;
}

/* ==================== 历史记录 ==================== */
.history-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 12px;
}
.history-filters {
  display: flex;
  align-items: center;
  gap: 8px;
}
.history-empty {
  text-align: center;
  padding: 40px 0;
  color: var(--text-muted, rgba(255,255,255,0.4));
}

/* ==================== 数据汇总 ==================== */
.summary-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}
.summary-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 20px;
}
.summary-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background: rgba(var(--primary-blue-rgb, 0,212,255), 0.03);
  border: 1px solid rgba(var(--primary-blue-rgb, 0,212,255), 0.08);
  border-radius: 12px;
  transition: transform 0.2s;
}
.summary-card:hover {
  transform: translateY(-2px);
}
.card-icon {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
}
.card-info { flex: 1; }
.card-value {
  font-size: 22px;
  font-weight: 700;
  color: var(--text-primary, #fff);
  font-family: 'Consolas', 'Monaco', monospace;
  line-height: 1.2;
}
.card-label {
  font-size: 11px;
  color: var(--text-muted, rgba(255,255,255,0.5));
  margin-top: 2px;
}
.summary-charts {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

/* ==================== 会话详情 ==================== */
.detail-content { padding: 0 8px; }
.detail-row {
  display: flex;
  justify-content: space-between;
  padding: 6px 0;
  border-bottom: 1px solid var(--border-light, rgba(255,255,255,0.06));
  font-size: 13px;
}
.detail-label {
  color: var(--text-muted, rgba(255,255,255,0.6));
  flex-shrink: 0;
  width: 80px;
}
.detail-section-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary, rgba(255,255,255,0.8));
  margin: 16px 0 8px;
}
.detail-metrics {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}
.detail-metric {
  background: rgba(var(--primary-blue-rgb, 0,212,255), 0.04);
  border: 1px solid rgba(var(--primary-blue-rgb, 0,212,255), 0.08);
  border-radius: 8px;
  padding: 8px;
  text-align: center;
}
.detail-metric-label {
  display: block;
  font-size: 11px;
  color: var(--text-muted, rgba(255,255,255,0.5));
  margin-bottom: 4px;
}
.detail-metric span:last-child {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary, #fff);
  font-family: 'Consolas', 'Monaco', monospace;
}

/* ==================== 响应式 ==================== */
@media (max-width: 1200px) {
  .eeg-content {
    grid-template-columns: 1fr;
  }
  .sub-chart-row {
    grid-template-columns: 1fr 1fr;
  }
  .summary-charts {
    grid-template-columns: 1fr;
  }
}
@media (max-width: 768px) {
  .control-row {
    flex-direction: column;
    align-items: flex-start;
  }
  .control-actions {
    margin-left: 0;
  }
  .waveform-chart-dom {
    height: 300px;
  }
  .sub-chart-row {
    grid-template-columns: 1fr;
  }
  .feature-metrics {
    grid-template-columns: 1fr;
  }
  .eeg-monitor-header {
    flex-direction: column;
  }
  .summary-cards {
    grid-template-columns: repeat(2, 1fr);
  }
  .detail-metrics {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
