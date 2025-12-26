<template>
  <div class="home-container">
    <div class="home-layout">
      <!-- 左侧：功能导航翼 -->
      <section class="home-column home-left">
        <h2 class="section-title side-title">系统能力</h2>
        <div class="features-section">
          <div class="feature-timeline"></div>
          <div class="features-grid vertical">
        <router-link to="/chat" class="feature-card">
          <div class="feature-icon chat-icon">
            <i class="el-icon-chat-dot-round"></i>
          </div>
          <h3 class="feature-title">智能问答</h3>
          <p class="feature-description">
            基于医疗知识图谱的智能问答系统，为您解答各类医疗问题
          </p>
        </router-link>
        
        <router-link to="/graph" class="feature-card">
          <div class="feature-icon graph-icon">
            <i class="el-icon-s-data"></i>
          </div>
          <h3 class="feature-title">图谱可视化</h3>
          <p class="feature-description">
            直观展示医疗实体之间的关系，让知识结构一目了然
          </p>
        </router-link>
        
        <router-link to="/search" class="feature-card">
          <div class="feature-icon search-icon">
            <i class="el-icon-search"></i>
          </div>
          <h3 class="feature-title">实体搜索</h3>
          <p class="feature-description">
            快速查找医疗实体信息，支持多条件筛选和精确匹配
          </p>
        </router-link>
        
        <router-link to="/upload" class="feature-card">
          <div class="feature-icon upload-icon">
            <i class="el-icon-upload2"></i>
          </div>
          <h3 class="feature-title">数据上传</h3>
          <p class="feature-description">
            支持批量上传医疗数据，自动构建和扩展知识图谱
          </p>
        </router-link>
        
        <router-link to="/history" class="feature-card">
          <div class="feature-icon history-icon">
            <i class="el-icon-document-copy"></i>
          </div>
          <h3 class="feature-title">历史记录</h3>
          <p class="feature-description">
            完整保存您的查询历史，方便随时回顾和管理
          </p>
        </router-link>
        
        <router-link to="/faq" class="feature-card">
          <div class="feature-icon faq-icon">
            <i class="el-icon-question"></i>
          </div>
          <h3 class="feature-title">常见问题</h3>
          <p class="feature-description">
            解答使用过程中可能遇到的各类问题，提供操作指南
          </p>
        </router-link>
          </div>
      </div>
    </section>

      <!-- 中间：主时间线舞台 -->
      <section class="home-column home-center">
        <!-- 欢迎区域 -->
        <section class="welcome-section">
          <div class="welcome-content">
            <h1 class="welcome-title">
              <span class="title-line">探索医疗知识的</span>
              <span class="title-highlight">智能图谱</span>
            </h1>
            <p class="welcome-subtitle">
              利用人工智能技术构建的医疗知识图谱系统，为您提供专业、准确的医疗信息查询与可视化服务
            </p>
            <div class="cta-buttons">
              <router-link to="/chat" class="btn-primary" v-ripple>
                <i class="el-icon-chat-dot-round"></i>
                开始问答
              </router-link>
              <router-link to="/graph" class="btn-secondary" v-ripple>
                <i class="el-icon-s-data"></i>
                查看图谱
              </router-link>
            </div>
          </div>
        </section>
      
        <!-- 数据时间线 -->
        <section class="data-dashboard-section timeline-section">
          <h2 class="section-title">知识图谱概览</h2>

          <div class="data-displays timeline-displays">
            <div class="timeline-line"></div>

            <div class="data-display timeline-item">
              <div class="timeline-node"></div>
          <div class="display-header">
            <span class="display-title">总实体数</span>
            <span class="display-icon">📊</span>
          </div>
          <div class="display-body">
            <span class="stat-number">10,500</span>
            <span class="display-subtitle">个知识实体</span>
          </div>
          <div class="display-footer">
            <span class="trend-up">+5.2%</span>
            <span class="trend-label">较上月</span>
          </div>
        </div>
        
            <div class="data-display timeline-item">
              <div class="timeline-node"></div>
          <div class="display-header">
            <span class="display-title">关系总数</span>
            <span class="display-icon">🔗</span>
          </div>
          <div class="display-body">
            <span class="stat-number">52,000</span>
            <span class="display-subtitle">条知识关联</span>
          </div>
          <div class="display-footer">
            <span class="trend-up">+8.7%</span>
            <span class="trend-label">较上月</span>
          </div>
        </div>
        
            <div class="data-display timeline-item">
              <div class="timeline-node"></div>
          <div class="display-header">
            <span class="display-title">搜索量</span>
            <span class="display-icon">🔍</span>
          </div>
          <div class="display-body">
            <span class="stat-number">15,230</span>
            <span class="display-subtitle">次搜索</span>
          </div>
          <div class="display-footer">
            <span class="trend-up">+12.3%</span>
            <span class="trend-label">较上月</span>
          </div>
        </div>
        
            <div class="data-display timeline-item">
              <div class="timeline-node"></div>
          <div class="display-header">
            <span class="display-title">用户活跃度</span>
            <span class="display-icon">👥</span>
          </div>
          <div class="display-body">
            <span class="stat-number">89.5%</span>
            <span class="display-subtitle">活跃度</span>
          </div>
          <div class="display-footer">
            <span class="trend-up">+3.2%</span>
            <span class="trend-label">较上月</span>
          </div>
        </div>
      </div>
        </section>
      </section>
      
      <!-- 右侧：数据监控翼 -->
      <section class="home-column home-right">
        <h2 class="section-title side-title">实时监控</h2>

        <section class="charts-section">
      <div class="charts-grid">
        <div class="chart-container">
          <h3 class="chart-title">实体类型分布</h3>
          <div id="entityTypeChart" class="chart"></div>
        </div>
        
        <div class="chart-container">
          <h3 class="chart-title">关系类型分布</h3>
          <div id="relationTypeChart" class="chart"></div>
        </div>
        
        <div class="chart-container full-width">
          <h3 class="chart-title">知识增长趋势</h3>
          <div id="growthChart" class="chart"></div>
        </div>
      </div>
    </section>
    
        <section class="stats-section compact">
      <div class="stats-grid">
        <div class="stat-item">
          <div class="stat-number">10,000+</div>
          <div class="stat-label">医疗实体</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">50,000+</div>
          <div class="stat-label">关系连接</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">99.9%</div>
          <div class="stat-label">数据准确率</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">24/7</div>
          <div class="stat-label">持续更新</div>
        </div>
      </div>
        </section>
    </section>
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import anime from 'animejs/lib/anime.es.js'

export default {
  name: 'Home',
  mounted() {
    // 添加滚动动画效果
    this.addScrollAnimations()
    // 初始化图表 & 动画
    this.$nextTick(() => {
      this.initCharts()
      this.startNumberAnimation()
      this.initNeonCardsAnimation()
    })
  },
  methods: {
    addScrollAnimations() {
      const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      }
      
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.style.opacity = '1'
            entry.target.style.transform = 'translateY(0)'
          }
        })
      }, observerOptions)
      
      // 观察需要滚动出现动画的元素（数据卡片使用 anime.js 单独处理）
      document.querySelectorAll('.feature-card, .stat-item, .chart-container').forEach(el => {
        el.style.opacity = '0'
        el.style.transform = 'translateY(30px)'
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease'
        observer.observe(el)
      })
    },
    
    // 初始化图表
    initCharts() {
      // 实体类型分布饼图
      this.initEntityTypeChart()
      // 关系类型分布柱状图
      this.initRelationTypeChart()
      // 知识增长趋势图
      this.initGrowthChart()
    },
    
    // 实体类型分布饼图
    initEntityTypeChart() {
      const chartDom = document.getElementById('entityTypeChart')
      if (!chartDom) return
      
      const chart = echarts.init(chartDom)
      const option = {
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b}: {c} ({d}%)',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          borderColor: '#00d4ff',
          textStyle: {
            color: '#ffffff'
          }
        },
        legend: {
          orient: 'vertical',
          right: 10,
          top: 'center',
          textStyle: {
            color: '#ffffff'
          }
        },
        series: [
          {
            name: '实体类型',
            type: 'pie',
            radius: ['40%', '70%'],
            center: ['35%', '50%'],
            avoidLabelOverlap: false,
            itemStyle: {
              borderRadius: 10,
              borderColor: '#050b18',
              borderWidth: 2,
              shadowBlur: 12,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 245, 212, 0.55)'
            },
            label: {
              show: false,
              position: 'center'
            },
            emphasis: {
              label: {
                show: true,
                fontSize: '18',
                fontWeight: 'bold',
                color: '#ffffff'
              }
            },
            labelLine: {
              show: false
            },
            data: [
              { value: 2500, name: '疾病', itemStyle: { color: '#00f5d4' } },
              { value: 3000, name: '症状', itemStyle: { color: '#00bbf9' } },
              { value: 1500, name: '治疗方法', itemStyle: { color: '#38bdf8' } },
              { value: 2000, name: '药物', itemStyle: { color: '#22c55e' } },
              { value: 1000, name: '检查', itemStyle: { color: '#e2ff4f' } }
            ]
          }
        ]
      }
      
      chart.setOption(option)
      
      // 添加窗口大小变化监听
      window.addEventListener('resize', () => chart.resize())
    },
    
    // 关系类型分布柱状图
    initRelationTypeChart() {
      const chartDom = document.getElementById('relationTypeChart')
      if (!chartDom) return
      
      const chart = echarts.init(chartDom)
      const option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          },
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          borderColor: '#00d4ff',
          textStyle: {
            color: '#ffffff'
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: ['症状', '治疗方法', '药物', '检查', '发生部位'],
          axisLine: {
            lineStyle: {
              color: '#ffffff'
            }
          },
          axisLabel: {
            color: '#ffffff'
          }
        },
        yAxis: {
          type: 'value',
          axisLine: {
            lineStyle: {
              color: '#ffffff'
            }
          },
          axisLabel: {
            color: '#ffffff'
          },
          splitLine: {
            lineStyle: {
              color: 'rgba(255, 255, 255, 0.1)'
            }
          }
        },
        series: [
          {
            name: '关系数量',
            type: 'bar',
            barWidth: '60%',
            data: [12000, 8000, 10000, 5000, 7000],
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: '#00f5d4' },
                { offset: 1, color: '#00bbf9' }
              ]),
              borderRadius: [10, 10, 0, 0],
              shadowBlur: 12,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 245, 212, 0.55)'
            },
            emphasis: {
              itemStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  { offset: 0, color: '#00e5ff' },
                  { offset: 1, color: '#a832ff' }
                ])
              }
            },
            animationDelay: function (idx) {
              return idx * 100
            }
          }
        ],
        animationEasing: 'elasticOut'
      }
      
      chart.setOption(option)
      
      // 添加窗口大小变化监听
      window.addEventListener('resize', () => chart.resize())
    },
    
    // 知识增长趋势图
    initGrowthChart() {
      const chartDom = document.getElementById('growthChart')
      if (!chartDom) return
      
      const chart = echarts.init(chartDom)
      const option = {
        tooltip: {
          trigger: 'axis',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          borderColor: '#00d4ff',
          textStyle: {
            color: '#ffffff'
          }
        },
        legend: {
          data: ['实体数量', '关系数量'],
          textStyle: {
            color: '#ffffff'
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: ['1月', '2月', '3月', '4月', '5月', '6月'],
          axisLine: {
            lineStyle: {
              color: '#ffffff'
            }
          },
          axisLabel: {
            color: '#ffffff'
          }
        },
        yAxis: {
          type: 'value',
          axisLine: {
            lineStyle: {
              color: '#ffffff'
            }
          },
          axisLabel: {
            color: '#ffffff'
          },
          splitLine: {
            lineStyle: {
              color: 'rgba(255, 255, 255, 0.1)'
            }
          }
        },
        series: [
          {
            name: '实体数量',
            type: 'line',
            stack: 'Total',
            smooth: true,
            lineStyle: {
              width: 4,
              color: '#00f5d4'
            },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(0, 245, 212, 0.5)' },
                { offset: 1, color: 'rgba(0, 245, 212, 0.08)' }
              ])
            },
            emphasis: {
              focus: 'series'
            },
            data: [6000, 7000, 8500, 9500, 10000, 10500]
          },
          {
            name: '关系数量',
            type: 'line',
            stack: 'Total',
            smooth: true,
            lineStyle: {
              width: 4,
              color: '#00bbf9'
            },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(0, 187, 249, 0.5)' },
                { offset: 1, color: 'rgba(0, 187, 249, 0.08)' }
              ])
            },
            emphasis: {
              focus: 'series'
            },
            data: [25000, 30000, 38000, 45000, 50000, 52000]
          }
        ]
      }
      
      chart.setOption(option)
      
      // 添加窗口大小变化监听
      window.addEventListener('resize', () => chart.resize())
    },
    
    // 数字增长动画
    startNumberAnimation() {
      const numbers = document.querySelectorAll('.stat-number')
      numbers.forEach(number => {
        const target = number.innerText.replace(/[+,%]/g, '')
        const isPercentage = number.innerText.includes('%')
        const isPlus = number.innerText.includes('+')
        
        let current = 0
        const increment = parseFloat(target) / 100
        const timer = setInterval(() => {
          current += increment
          if (current >= parseFloat(target)) {
            current = parseFloat(target)
            clearInterval(timer)
          }
          
          let displayText = ''
          if (target.includes(',')) {
            displayText = Math.floor(current).toLocaleString()
          } else {
            displayText = current.toFixed(1)
          }
          
          if (isPercentage) {
            displayText += '%'
          } else if (isPlus) {
            displayText += '+'
          }
          
          number.innerText = displayText
        }, 20)
      })
    },
    
    // 主页大屏数据卡片霓虹进场动画
    initNeonCardsAnimation() {
      const cards = document.querySelectorAll('.data-display')
      if (!cards.length) return

      anime({
        targets: cards,
        opacity: [0, 1],
        translateY: [24, 0],
        scale: [0.96, 1],
        delay: anime.stagger(120, { start: 300 }),
        duration: 700,
        easing: 'easeOutCubic'
      })
    }
  }
}
</script>

<style>
.home-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px;
  position: relative;
  overflow-x: hidden;
}

/* 三列布局 */
.home-layout {
  display: grid;
  grid-template-columns: 1.1fr 1.4fr 1.2fr;
  gap: 32px;
  align-items: flex-start;
}

.home-column {
  position: relative;
}

.home-left,
.home-right {
  padding-top: 12px;
}

.side-title {
  font-size: 18px;
  text-align: left;
  margin-bottom: 18px;
}

/* 欢迎区域（中间列顶部） */
.welcome-section {
  text-align: center;
  padding: 80px 0;
  position: relative;
  overflow: hidden;
  border-radius: 24px;
  background:
    radial-gradient(circle at top, rgba(0, 245, 212, 0.16), transparent 55%),
    radial-gradient(circle at 20% 120%, rgba(0, 187, 249, 0.12), transparent 55%);
}

.welcome-content {
  max-width: 800px;
  margin: 0 auto;
  position: relative;
  z-index: 2;
}

.welcome-title {
  font-size: 64px;
  font-weight: 800;
  margin-bottom: 20px;
  line-height: 1.2;
  animation: fadeInUp 1s ease-out;
  letter-spacing: 2px;
  position: relative;
}

.title-line {
  display: block;
  background: linear-gradient(135deg, rgba(0, 255, 255, 1), rgba(255, 0, 255, 1));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 
    0 0 10px rgba(0, 255, 255, 1),
    0 0 20px rgba(0, 255, 255, 0.8),
    0 0 30px rgba(0, 255, 255, 0.6),
    0 0 40px rgba(255, 0, 255, 0.6),
    0 0 60px rgba(255, 0, 255, 0.4),
    0 0 80px rgba(255, 0, 255, 0.2);
  -webkit-text-stroke: 1px rgba(0, 255, 255, 0.5);
  opacity: 1;
  animation: 
    breathe 3s ease-in-out infinite,
    float 4s ease-in-out infinite;
}

.title-highlight {
  display: block;
  background: linear-gradient(135deg, rgba(0, 255, 255, 1), rgba(255, 0, 255, 1));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 
    0 0 10px rgba(0, 255, 255, 1),
    0 0 20px rgba(0, 255, 255, 0.8),
    0 0 30px rgba(0, 255, 255, 0.6),
    0 0 40px rgba(255, 0, 255, 0.6),
    0 0 60px rgba(255, 0, 255, 0.4),
    0 0 80px rgba(255, 0, 255, 0.2);
  -webkit-text-stroke: 1px rgba(0, 255, 255, 0.5);
  opacity: 1;
  animation: 
    breathe 3s ease-in-out infinite 0.5s,
    float 4s ease-in-out infinite 0.5s;
}

/* 呼吸效果 */
@keyframes breathe {
  0%, 100% {
    opacity: 0.8;
    text-shadow: 
      0 0 10px rgba(0, 255, 255, 0.8),
      0 0 20px rgba(0, 255, 255, 0.6),
      0 0 30px rgba(0, 255, 255, 0.4),
      0 0 40px rgba(255, 0, 255, 0.4),
      0 0 60px rgba(255, 0, 255, 0.3);
  }
  50% {
    opacity: 1;
    text-shadow: 
      0 0 15px rgba(0, 255, 255, 1),
      0 0 30px rgba(0, 255, 255, 0.8),
      0 0 45px rgba(0, 255, 255, 0.6),
      0 0 60px rgba(255, 0, 255, 0.6),
      0 0 90px rgba(255, 0, 255, 0.5),
      0 0 120px rgba(255, 0, 255, 0.4);
  }
}

/* 悬浮动画 */
@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
}

.welcome-subtitle {
  font-size: 18px;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 40px;
  line-height: 1.6;
  animation: fadeInUp 1s ease-out 0.2s both;
}

.cta-buttons {
  display: flex;
  gap: 20px;
  justify-content: center;
  flex-wrap: wrap;
  animation: fadeInUp 1s ease-out 0.4s both;
}

.btn-primary,
.btn-secondary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 30px;
  border-radius: 30px;
  font-size: 16px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s ease;
  border: none;
  cursor: pointer;
  overflow: hidden;
  position: relative;
}

.btn-primary::before,
.btn-secondary::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: all 0.3s ease;
}

.btn-primary:hover::before,
.btn-secondary:hover::before {
  left: 100%;
}

.btn-primary {
  background: var(--gradient-glow);
  color: #ffffff;
  box-shadow: 0 4px 20px rgba(0, 212, 255, 0.4);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 30px rgba(0, 212, 255, 0.6);
}

.btn-secondary {
  background-color: rgba(255, 255, 255, 0.1);
  color: var(--primary-blue);
  border: 2px solid rgba(0, 212, 255, 0.3);
  box-shadow: 0 4px 20px rgba(0, 212, 255, 0.2);
}

.btn-secondary:hover {
  transform: translateY(-2px);
  background-color: rgba(0, 212, 255, 0.1);
  box-shadow: 0 6px 30px rgba(0, 212, 255, 0.4);
}

/* 功能快速入口 */
.features-section {
  padding: 0;
}

.section-title {
  text-align: center;
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 50px;
  background: linear-gradient(135deg, #00f5d4, #00bbf9);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  position: relative;
}

.section-title::after {
  content: '';
  display: block;
  width: 80px;
  height: 3px;
  background: linear-gradient(135deg, #00f5d4, #00bbf9);
  margin: 20px auto;
  border-radius: 2px;
  box-shadow: 0 0 10px rgba(0, 245, 212, 0.5);
}

.features-grid {
  display: grid;
  gap: 18px;
  margin-bottom: 10px;
}

.features-grid.vertical .feature-card {
  margin-left: 18px;
}

.feature-timeline {
  position: absolute;
  top: 40px;
  left: 10px;
  bottom: 20px;
  width: 2px;
  background: linear-gradient(to bottom, rgba(0, 245, 212, 0.2), rgba(0, 187, 249, 0.8));
  box-shadow: 0 0 15px rgba(0, 245, 212, 0.5);
  opacity: 0.9;
}

.feature-card {
  background: radial-gradient(circle at top left, rgba(0, 245, 212, 0.12), rgba(5, 11, 24, 0.96));
  border: 1px solid rgba(0, 245, 212, 0.28);
  border-radius: 16px;
  padding: 30px;
  text-decoration: none;
  color: #ffffff;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.feature-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(0, 245, 212, 0.12), transparent);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.feature-card::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #00f5d4, #00bbf9);
  transform: scaleX(0);
  transition: transform 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-8px);
  border-color: var(--primary-blue);
  box-shadow: 0 12px 40px rgba(0, 245, 212, 0.34), 0 0 30px rgba(0, 187, 249, 0.4);
}

.feature-card:hover::before {
  opacity: 1;
}

.feature-card:hover::after {
  transform: scaleX(1);
}

.feature-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  margin-bottom: 20px;
  position: relative;
  z-index: 1;
  transition: transform 0.3s ease;
}

.feature-card:hover .feature-icon {
  transform: scale(1.1);
}

.chat-icon {
  background: linear-gradient(135deg, #00f5d4, #00bbf9);
  box-shadow: 0 0 20px rgba(0, 245, 212, 0.6);
}

.graph-icon {
  background: linear-gradient(135deg, #00bbf9, #00f5d4);
  box-shadow: 0 0 20px rgba(0, 187, 249, 0.6);
}

.search-icon {
  background: linear-gradient(135deg, #22c55e, #00f5d4);
  box-shadow: 0 0 20px rgba(34, 197, 94, 0.6);
}

.upload-icon {
  background: linear-gradient(135deg, #e2ff4f, #00f5d4);
  box-shadow: 0 0 20px rgba(226, 255, 79, 0.6);
}

.history-icon {
  background: linear-gradient(135deg, #00bbf9, #22c55e);
  box-shadow: 0 0 20px rgba(0, 187, 249, 0.6);
}

.faq-icon {
  background: linear-gradient(135deg, #00f5d4, #e2ff4f);
  box-shadow: 0 0 20px rgba(0, 245, 212, 0.6);
}

.feature-title {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 12px;
  position: relative;
  z-index: 1;
}

.feature-description {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.6;
  position: relative;
  z-index: 1;
}

/* 大数据显示屏区域 */
.data-dashboard-section {
  padding: 60px 0;
  background: rgba(255, 255, 255, 0.02);
  position: relative;
  overflow: hidden;
  margin-bottom: 60px;
  border-radius: 20px;
}

.data-dashboard-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(0, 245, 212, 0.08) 0%, rgba(0, 187, 249, 0.08) 100%);
  opacity: 0.6;
}

/* 垂直数据流线条，增强大屏未来感 */
.data-dashboard-section::after {
  content: '';
  position: absolute;
  top: 10%;
  right: 40px;
  width: 2px;
  height: 65%;
  background: linear-gradient(to bottom, transparent, rgba(0, 245, 212, 0.9), rgba(0, 187, 249, 0.9), transparent);
  opacity: 0.8;
  mix-blend-mode: screen;
  animation: dataStreamMove 1.6s linear infinite;
}

.data-displays {
  position: relative;
  margin: 0 auto 10px;
  padding: 30px 0 10px;
  z-index: 1;
}

.timeline-displays {
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.timeline-line {
  position: absolute;
  top: 10px;
  bottom: 10px;
  left: 50%;
  width: 2px;
  transform: translateX(-50%);
  background: linear-gradient(to bottom, rgba(0, 245, 212, 0.1), rgba(0, 245, 212, 0.85));
  box-shadow: 0 0 18px rgba(0, 245, 212, 0.6);
}

.data-display {
  background: radial-gradient(circle at top, rgba(0, 245, 212, 0.14), rgba(5, 11, 24, 0.98));
  border: 1px solid rgba(148, 163, 184, 0.3);
  border-radius: 15px;
  padding: 25px;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.data-display::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #00f5d4, #00bbf9);
}

.data-display:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 30px rgba(0, 187, 249, 0.4), 0 0 30px rgba(0, 245, 212, 0.6);
  border-color: rgba(0, 245, 212, 0.7);
}

.timeline-item {
  width: 52%;
  position: relative;
}

.timeline-item:nth-child(2n+1) {
  align-self: flex-start;
  margin-left: 0;
}

.timeline-item:nth-child(2n) {
  align-self: flex-end;
  margin-right: 0;
}

.timeline-node {
  position: absolute;
  top: 28px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #00f5d4;
  box-shadow: 0 0 15px rgba(0, 245, 212, 0.9);
}

.timeline-item:nth-child(2n+1) .timeline-node {
  right: -6px;
}

.timeline-item:nth-child(2n) .timeline-node {
  left: -6px;
}

.display-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.display-title {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 500;
}

.display-icon {
  font-size: 24px;
}

.display-body {
  margin-bottom: 20px;
}

.display-subtitle {
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
  margin-top: 5px;
}

.display-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 15px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.trend-up {
  color: #00ff9d;
  font-weight: 600;
  font-size: 14px;
}

.trend-down {
  color: #ff4757;
  font-weight: 600;
  font-size: 14px;
}

.trend-label {
  color: rgba(255, 255, 255, 0.6);
  font-size: 13px;
}

/* 图表区域 */
.charts-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 18px;
  position: relative;
  z-index: 1;
}

.chart-container {
  background: radial-gradient(circle at top, rgba(0, 245, 212, 0.1), rgba(5, 11, 24, 0.98));
  border: 1px solid rgba(148, 163, 184, 0.28);
  border-radius: 15px;
  padding: 25px;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
}

.chart-container:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 30px rgba(0, 187, 249, 0.32), 0 0 25px rgba(0, 245, 212, 0.5);
}

.chart-container.full-width {
  grid-column: 1 / -1;
}

.chart-title {
  font-size: 18px;
  margin-bottom: 20px;
  color: #ffffff;
  font-weight: 600;
  display: flex;
  align-items: center;
}

.chart-title::before {
  content: '';
  display: inline-block;
  width: 8px;
  height: 8px;
  background: linear-gradient(135deg, #00f5d4, #00bbf9);
  border-radius: 50%;
  margin-right: 10px;
  box-shadow: 0 0 10px rgba(0, 245, 212, 0.5);
}

.chart {
  width: 100%;
  height: 300px;
}

.chart-container.full-width .chart {
  height: 350px;
}

/* 统计信息 */
.stats-section {
  padding: 40px 0;
  background-color: rgba(5, 11, 24, 0.95);
  border-radius: 20px;
  margin-bottom: 60px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 30px;
  text-align: center;
  max-width: 1200px;
  margin: 0 auto;
}

.stat-item {
  padding: 20px;
  position: relative;
  z-index: 1;
}

.stat-number {
  font-size: 36px;
  font-weight: 800;
  background: var(--gradient-glow);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 8px;
  animation: countUp 2s ease-out;
  display: block;
}

.stat-label {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  text-transform: uppercase;
  letter-spacing: 1px;
}

/* 动画效果 */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes countUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.02);
  }
}

@keyframes dataStreamMove {
  0% {
    transform: translateY(-100%);
    opacity: 0;
  }
  20% {
    opacity: 1;
  }
  80% {
    opacity: 1;
  }
  100% {
    transform: translateY(100%);
    opacity: 0;
  }
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .home-layout {
    grid-template-columns: 1fr 1.2fr;
    grid-template-rows: auto auto;
  }

  .home-right {
    grid-column: 1 / -1;
  }

  .welcome-title {
    font-size: 40px;
  }
  
  .features-grid {
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 25px;
  }
  
  .charts-grid {
    grid-template-columns: 1fr;
  }
  
  .chart-container.full-width {
    grid-column: 1;
  }
}

@media (max-width: 768px) {
  .home-layout {
    grid-template-columns: 1fr;
  }

  .welcome-section {
    padding: 60px 0;
  }
  
  .welcome-title {
    font-size: 32px;
  }
  
  .welcome-subtitle {
    font-size: 16px;
    padding: 0 20px;
  }
  
  .cta-buttons {
    flex-direction: column;
    align-items: center;
    gap: 15px;
  }
  
  .btn-primary, .btn-secondary {
    width: 200px;
    justify-content: center;
  }
  
  .features-section {
    padding: 40px 0;
  }
  
  .section-title {
    font-size: 28px;
  }
  
  .features-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .feature-card {
    padding: 25px;
  }
  
  .stats-section {
    padding: 30px 0;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
  }
  
  .stat-number {
    font-size: 28px;
  }
  
  .stat-label {
    font-size: 12px;
  }
  
  .data-dashboard-section {
    padding: 40px 0;
  }
  
  .data-displays {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .chart {
    height: 250px;
  }
  
  .chart-container.full-width .chart {
    height: 300px;
  }
}

@media (max-width: 576px) {
  .home-container {
    padding: 0 10px;
  }
  
  .welcome-section {
    padding: 40px 0;
  }
  
  .welcome-title {
    font-size: 28px;
  }
  
  .welcome-subtitle {
    font-size: 14px;
    padding: 0 10px;
  }
  
  .btn-primary, .btn-secondary {
    width: 180px;
    padding: 10px 20px;
    font-size: 14px;
  }
  
  .section-title {
    font-size: 24px;
  }
  
  .feature-card {
    padding: 20px;
  }
  
  .feature-icon {
    width: 50px;
    height: 50px;
    font-size: 20px;
  }
  
  .feature-title {
    font-size: 18px;
  }
  
  .feature-description {
    font-size: 13px;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .stat-item {
    padding: 15px;
  }
}

@media (max-width: 420px) {
  .welcome-title {
    font-size: 24px;
  }
  
  .welcome-subtitle {
    font-size: 13px;
  }
  
  .btn-primary, .btn-secondary {
    width: 100%;
    max-width: 200px;
  }
}
</style>
