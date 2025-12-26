<template>
  <div class="faq-page">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1 class="app-title">常见问题</h1>
      <p class="page-subtitle">了解医疗知识图谱系统的使用方法和常见问题解答</p>
    </div>
    
    <!-- 搜索区域 -->
    <div class="search-section">
      <el-card class="search-card" shadow="hover">
        <div class="search-content">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索常见问题..."
            clearable
            size="large"
            class="faq-search-input"
            @input="debounceSearch"
          >
            <template #prepend>
              <i class="el-icon-search"></i>
            </template>
          </el-input>
          
          <!-- 搜索结果统计 -->
          <div class="search-stats" v-if="searchKeyword && filteredFAQs.length > 0">
            <span>找到 {{ filteredFAQs.length }} 个相关问题</span>
          </div>
          <div class="search-stats empty" v-else-if="searchKeyword">
            <span>没有找到相关问题</span>
          </div>
        </div>
      </el-card>
    </div>
    
    <!-- 分类导航 -->
    <div class="category-section" v-if="faqCategories.length > 0">
      <el-card class="category-card" shadow="hover">
        <div class="category-content">
          <h3 class="category-title">问题分类</h3>
          <div class="category-tabs">
            <el-tabs
              v-model="activeCategory"
              type="card"
              @tab-click="handleTabClick"
              class="faq-tabs"
            >
              <el-tab-pane
                v-for="category in faqCategories"
                :key="category.id"
                :label="category.name"
                :name="category.id"
              >
                <div class="tab-content">
                  <el-collapse
                    v-model="activeNames"
                    accordion
                    class="faq-collapse"
                  >
                    <!-- FAQ 项目 -->
                    <el-collapse-item
                      v-for="faq in getCategoryFAQs(category.id)"
                      :key="faq.id"
                      :title="faq.question"
                      :name="faq.id"
                      class="faq-item"
                    >
                      <div class="faq-answer">
                        {{ faq.answer }}
                        <!-- 相关问题 -->
                        <div class="related-questions" v-if="faq.related.length > 0">
                          <h4 class="related-title">相关问题</h4>
                          <ul class="related-list">
                            <li
                              v-for="relatedId in faq.related"
                              :key="relatedId"
                              class="related-item"
                              @click="expandRelatedFAQ(relatedId)"
                            >
                              <i class="el-icon-arrow-right"></i>
                              {{ getFAQById(relatedId)?.question }}
                            </li>
                          </ul>
                        </div>
                      </div>
                    </el-collapse-item>
                  </el-collapse>
                  
                  <!-- 空状态 -->
                  <div class="empty-category" v-if="getCategoryFAQs(category.id).length === 0">
                    <el-empty
                      description="该分类下暂无问题"
                      class="empty-component"
                    ></el-empty>
                  </div>
                </div>
              </el-tab-pane>
            </el-tabs>
          </div>
        </div>
      </el-card>
    </div>
    
    <!-- 全部问题列表 -->
    <div class="all-questions-section" v-else>
      <el-card class="all-questions-card" shadow="hover">
        <div class="card-header">
          <h3 class="section-title">所有常见问题</h3>
          <span class="question-count">{{ filteredFAQs.length }} 个问题</span>
        </div>
        
        <div class="questions-list">
          <el-collapse
            v-model="activeNames"
            accordion
            class="faq-collapse"
          >
            <!-- FAQ 项目 -->
            <el-collapse-item
              v-for="faq in filteredFAQs"
              :key="faq.id"
              :title="faq.question"
              :name="faq.id"
              class="faq-item"
            >
              <div class="faq-answer">
                {{ faq.answer }}
                <!-- 相关问题 -->
                <div class="related-questions" v-if="faq.related.length > 0">
                  <h4 class="related-title">相关问题</h4>
                  <ul class="related-list">
                    <li
                      v-for="relatedId in faq.related"
                      :key="relatedId"
                      class="related-item"
                      @click="expandRelatedFAQ(relatedId)"
                    >
                      <i class="el-icon-arrow-right"></i>
                      {{ getFAQById(relatedId)?.question }}
                    </li>
                  </ul>
                </div>
              </div>
            </el-collapse-item>
          </el-collapse>
        </div>
        
        <!-- 空状态 -->
        <div class="empty-all-questions" v-if="filteredFAQs.length === 0">
          <el-empty
            description="暂无常见问题"
            class="empty-component"
          ></el-empty>
        </div>
      </el-card>
    </div>
    
    <!-- 反馈区域 -->
    <div class="feedback-section">
      <el-card class="feedback-card" shadow="hover">
        <div class="feedback-content">
          <h3 class="feedback-title">还有其他问题？</h3>
          <p class="feedback-subtitle">如果您的问题没有在上面找到答案，请填写反馈表单</p>
          
          <el-form :model="feedbackForm" :rules="feedbackRules" ref="feedbackForm" class="feedback-form">
            <div class="form-row">
              <el-form-item prop="name" class="form-item">
                <el-input
                  v-model="feedbackForm.name"
                  placeholder="您的姓名"
                  size="large"
                  class="form-input"
                ></el-input>
              </el-form-item>
              
              <el-form-item prop="email" class="form-item">
                <el-input
                  v-model="feedbackForm.email"
                  placeholder="您的邮箱"
                  size="large"
                  class="form-input"
                ></el-input>
              </el-form-item>
            </div>
            
            <el-form-item prop="subject" class="form-item">
              <el-input
                v-model="feedbackForm.subject"
                placeholder="问题主题"
                size="large"
                class="form-input"
              ></el-input>
            </el-form-item>
            
            <el-form-item prop="message" class="form-item">
              <el-input
                v-model="feedbackForm.message"
                type="textarea"
                :rows="5"
                placeholder="请详细描述您的问题..."
                size="large"
                class="form-textarea"
              ></el-input>
            </el-form-item>
            
            <el-form-item class="form-item submit-item">
              <el-button
                type="primary"
                size="large"
                @click="submitFeedback"
                :loading="submitting"
                class="submit-btn"
              >
                <i class="el-icon-s-promotion"></i>
                提交反馈
              </el-button>
            </el-form-item>
          </el-form>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script>
export default {
  name: 'FAQPage',
  data() {
    return {
      // 搜索关键词
      searchKeyword: '',
      
      // 分类
      faqCategories: [],
      activeCategory: 'all',
      
      // FAQ 数据
      faqs: [],
      filteredFAQs: [],
      activeNames: [],
      
      // 反馈表单
      feedbackForm: {
        name: '',
        email: '',
        subject: '',
        message: ''
      },
      
      // 表单验证规则
      feedbackRules: {
        name: [
          { required: true, message: '请输入您的姓名', trigger: 'blur' },
          { min: 2, max: 20, message: '姓名长度在 2 到 20 个字符', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入您的邮箱', trigger: 'blur' },
          { type: 'email', message: '请输入有效的邮箱地址', trigger: 'blur' }
        ],
        subject: [
          { required: true, message: '请输入问题主题', trigger: 'blur' },
          { min: 5, max: 50, message: '主题长度在 5 到 50 个字符', trigger: 'blur' }
        ],
        message: [
          { required: true, message: '请输入问题描述', trigger: 'blur' },
          { min: 10, max: 500, message: '问题描述长度在 10 到 500 个字符', trigger: 'blur' }
        ]
      },
      
      // 提交状态
      submitting: false,
      
      // 搜索防抖计时器
      searchTimer: null
    };
  },
  created() {
    // 加载 FAQ 数据
    this.loadFAQs();
  },
  methods: {
    // 加载 FAQ 数据
    loadFAQs() {
      // 模拟数据加载
      setTimeout(() => {
        this.generateMockData();
        this.filteredFAQs = [...this.faqs];
      }, 500);
    },
    
    // 生成模拟数据
    generateMockData() {
      // 生成分类
      this.faqCategories = [
        { id: 'basic', name: '基础使用', icon: 'el-icon-info' },
        { id: 'theme', name: '主题与界面', icon: 'el-icon-view' },
        { id: 'chat', name: '聊天问答', icon: 'el-icon-chat-dot-round' },
        { id: 'graph', name: '图谱可视化', icon: 'el-icon-data-analysis' },
        { id: 'search', name: '实体搜索', icon: 'el-icon-search' },
        { id: 'upload', name: '数据上传', icon: 'el-icon-upload2' },
        { id: 'history', name: '历史记录', icon: 'el-icon-document-copy' },
        { id: 'tech', name: '技术支持', icon: 'el-icon-cpu' }
      ];
      
      // 生成 FAQ
      this.faqs = [
        {
          id: 'faq_001',
          category: 'basic',
          question: '什么是医疗知识图谱系统？',
          answer: '医疗知识图谱系统是基于人工智能技术构建的医疗知识网络，将海量医疗数据结构化存储，通过图谱可视化方式展示医疗实体之间的关系。系统支持自然语言问答、实体搜索、知识图谱可视化、数据上传等功能，帮助用户快速获取和理解医疗知识。系统提供"科技风"和"医疗风"两种主题风格，可根据个人喜好自由切换。',
          related: ['faq_002', 'faq_003', 'faq_018']
        },
        {
          id: 'faq_002',
          category: 'basic',
          question: '如何登录和注册系统？',
          answer: '在系统右上角点击"登录"或"注册"按钮，进入登录注册页面。注册时需要填写用户名、邮箱和密码（至少8位），系统会自动验证信息格式。登录后，您可以在个人中心修改密码和完善个人信息。登录状态会保存在本地，下次访问时自动登录。',
          related: ['faq_001', 'faq_019']
        },
        {
          id: 'faq_003',
          category: 'basic',
          question: '系统支持哪些浏览器和设备？',
          answer: '系统推荐使用 Chrome 80+、Firefox 75+、Safari 13+、Edge 80+ 等现代浏览器，以获得最佳的使用体验。系统已针对桌面端、平板和移动端进行了响应式优化，支持在不同屏幕尺寸下正常使用。请确保浏览器已开启 JavaScript 功能。',
          related: ['faq_001', 'faq_018']
        },
        {
          id: 'faq_018',
          category: 'theme',
          question: '如何切换主题风格？',
          answer: '系统提供"科技风"和"医疗风"两种主题风格。在顶部导航栏右侧，点击主题切换按钮即可在两种风格间切换。科技风采用赛博青绿配色，具有霓虹发光效果和丰富的动画；医疗风采用经典白蓝配色，界面简洁干净，适合长时间阅读。主题选择会自动保存，下次访问时会记住您的偏好。',
          related: ['faq_001', 'faq_003']
        },
        {
          id: 'faq_019',
          category: 'theme',
          question: '两种主题风格有什么区别？',
          answer: '科技风：采用深色背景和赛博青绿配色，具有霓虹发光、粒子动画等炫酷效果，适合追求科技感的用户。医疗风：采用白色背景和医疗蓝配色，界面简洁干净，动画效果更加克制，适合需要长时间使用的医疗专业人员。两种主题的功能完全相同，只是视觉风格不同，您可以根据个人喜好和使用场景自由选择。',
          related: ['faq_018']
        },
        {
          id: 'faq_004',
          category: 'chat',
          question: '如何使用聊天问答功能？',
          answer: '在"新对话"页面，您可以直接在输入框中输入自然语言问题，点击"发送"按钮或按 Enter 键提交。系统会自动分析问题并基于知识图谱返回相关的医疗知识。您可以询问疾病症状、治疗方法、药物信息、检查项目等各类医疗问题。系统还提供了示例问题快捷按钮，点击即可快速提问。右侧会显示关联的医疗实体信息，帮助您更好地理解答案。',
          related: ['faq_005', 'faq_006', 'faq_020']
        },
        {
          id: 'faq_005',
          category: 'chat',
          question: '聊天问答支持哪些语言？',
          answer: '目前系统主要支持中文问答，后续会逐步扩展支持英文等其他语言。请使用标准中文提问，避免使用过于口语化或模糊的表述。提问时尽量使用医疗领域的专业术语，这样能获得更准确的回答。',
          related: ['faq_004', 'faq_006']
        },
        {
          id: 'faq_006',
          category: 'chat',
          question: '如何提高问答的准确性？',
          answer: '为了获得更准确的回答，建议您：1) 提问时尽量具体明确，例如"糖尿病的常见症状有哪些？"而不是"糖尿病是什么？"；2) 提供足够的上下文信息；3) 避免使用模糊的词汇；4) 对于复杂问题，可以拆分为多个简单问题；5) 利用右侧的关联实体信息，深入了解相关医疗知识。',
          related: ['faq_004', 'faq_020']
        },
        {
          id: 'faq_020',
          category: 'chat',
          question: '聊天记录会保存吗？',
          answer: '是的，您的聊天记录会自动保存到历史记录中。您可以在"历史记录"页面查看所有对话历史，包括问题、答案和关联实体信息。历史记录支持按时间、类型等条件筛选和搜索，方便您快速找到之前的对话内容。',
          related: ['faq_004', 'faq_021']
        },
        {
          id: 'faq_007',
          category: 'graph',
          question: '图谱可视化功能可以展示什么？',
          answer: '知识图谱可视化功能可以展示医疗实体（如疾病、症状、药物、治疗方法、检查项目等）之间的关系网络。您可以查看实体的详细属性信息、实体间的关联关系类型和强度。系统支持缩放、拖拽、筛选、全屏等丰富的交互操作。图谱会根据实体类型使用不同颜色标识，图例会显示各类实体的含义，帮助您快速理解知识结构。',
          related: ['faq_008', 'faq_009', 'faq_010']
        },
        {
          id: 'faq_008',
          category: 'graph',
          question: '如何在图谱中搜索和筛选实体？',
          answer: '在图谱可视化页面顶部的工具栏中，您可以使用搜索框输入实体名称，系统会自动定位到该实体并高亮显示。您也可以通过筛选下拉菜单，选择特定类型的实体（如只显示疾病、只显示药物等）。点击图例按钮可以显示或隐藏图例说明，帮助您理解不同颜色代表的实体类型。',
          related: ['faq_007', 'faq_009', 'faq_010']
        },
        {
          id: 'faq_009',
          category: 'graph',
          question: '如何导出和操作图谱？',
          answer: '在图谱可视化页面的工具栏中，您可以：1) 使用放大/缩小按钮调整视图；2) 点击重置视图按钮恢复默认视角；3) 点击清除按钮清空当前图谱；4) 点击导出按钮，将当前图谱导出为 PNG 图片或 JSON 数据文件；5) 点击全屏按钮进入全屏模式，获得更好的查看体验。',
          related: ['faq_007', 'faq_008']
        },
        {
          id: 'faq_010',
          category: 'search',
          question: '实体搜索支持哪些类型？',
          answer: '实体搜索支持疾病、症状、药物、治疗方法、检查项目、发生部位等多种医疗实体类型。您可以在搜索框上方选择搜索类型（全部类型、疾病、症状、药物、治疗），也可以直接输入实体名称进行搜索。系统支持模糊匹配，即使输入不完整也能找到相关实体。搜索结果会显示实体名称、类型标签和简要描述。',
          related: ['faq_011', 'faq_012']
        },
        {
          id: 'faq_011',
          category: 'search',
          question: '如何查看实体的详细信息和关联？',
          answer: '在搜索结果中，点击实体卡片即可在弹窗中查看实体的详细信息，包括基本属性、描述、相关实体等。您也可以点击"查看详情"按钮查看完整信息，或点击"查看关联"按钮，在图谱可视化页面中查看该实体的关系网络。搜索结果支持按相关度、名称排序，方便您快速找到目标实体。',
          related: ['faq_010', 'faq_007']
        },
        {
          id: 'faq_012',
          category: 'search',
          question: '搜索不到结果怎么办？',
          answer: '如果搜索不到结果，建议您：1) 检查输入的关键词是否正确，尝试使用同义词或相关术语；2) 尝试使用热门搜索标签中的推荐关键词；3) 调整搜索类型筛选，选择"全部类型"进行搜索；4) 如果确实没有相关实体，可以通过数据上传功能添加新的医疗数据。',
          related: ['faq_010', 'faq_013']
        },
        {
          id: 'faq_013',
          category: 'upload',
          question: '支持上传哪些格式的数据文件？',
          answer: '系统支持上传 TXT、PDF、JSON 等格式的数据文件。上传的数据会自动解析并构建知识图谱，新增的实体和关系会合并到现有知识图谱中。建议上传结构化的医疗数据，例如包含实体名称、类型、属性、关系等信息的 JSON 文件，这样能获得更好的解析效果。',
          related: ['faq_014', 'faq_015']
        },
        {
          id: 'faq_014',
          category: 'upload',
          question: '上传文件的大小限制和注意事项？',
          answer: '单个文件上传大小限制为 100MB，建议将大型文件分割为多个小文件上传。系统会自动验证文件格式和数据结构，上传完成后会生成详细的数据报告，包括成功导入的实体数、关系数和可能的错误信息。上传过程中请保持网络连接稳定，避免中途中断。',
          related: ['faq_013', 'faq_015']
        },
        {
          id: 'faq_015',
          category: 'upload',
          question: '如何查看上传进度和处理结果？',
          answer: '在数据上传页面，您可以实时查看文件上传进度条。上传完成后，系统会自动解析数据并显示处理结果，包括成功导入的实体数、关系数和可能的错误信息。您可以在上传历史中查看所有上传记录和处理状态。如果上传失败，系统会显示具体的错误原因，您可以根据提示修正后重新上传。',
          related: ['faq_013', 'faq_014']
        },
        {
          id: 'faq_021',
          category: 'history',
          question: '历史记录功能如何使用？',
          answer: '在"历史记录"页面，您可以查看所有操作历史，包括聊天问答、实体搜索、图谱查询、数据上传等。历史记录支持按时间范围、记录类型、状态等条件筛选。您可以搜索历史记录内容，批量删除不需要的记录，也可以点击记录查看详细信息或重新执行操作。历史记录会长期保存，方便您随时回顾和管理。',
          related: ['faq_020', 'faq_004']
        },
        {
          id: 'faq_022',
          category: 'history',
          question: '如何管理和删除历史记录？',
          answer: '在历史记录页面，您可以：1) 使用搜索框快速查找特定记录；2) 使用时间范围选择器筛选特定时间段 records；3) 使用类型和状态筛选器过滤记录；4) 勾选记录后点击"删除选中"批量删除；5) 点击"删除全部"清空所有记录（需谨慎操作）。删除操作不可恢复，请确认后再执行。',
          related: ['faq_021']
        },
        {
          id: 'faq_016',
          category: 'tech',
          question: '系统出现故障或错误怎么办？',
          answer: '如果系统出现故障或异常，请按以下步骤操作：1) 先尝试刷新页面（F5 或 Ctrl+R）；2) 清除浏览器缓存后重新访问；3) 检查网络连接是否正常；4) 如果问题仍然存在，请查看浏览器控制台的错误信息；5) 在常见问题页面底部的反馈表单中提交问题，详细描述错误现象和操作步骤，我们会尽快处理。',
          related: ['faq_017', 'faq_018']
        },
        {
          id: 'faq_017',
          category: 'tech',
          question: '如何获取技术支持？',
          answer: '您可以通过以下方式获取技术支持：1) 在常见问题页面底部的反馈表单中提交问题；2) 发送邮件至技术支持邮箱；3) 查看常见问题页面，很多问题都有详细解答。我们会尽快回复您的问题，工作时间：周一至周五 9:00-18:00。',
          related: ['faq_016']
        },
        {
          id: 'faq_023',
          category: 'tech',
          question: '系统会定期更新吗？有哪些新功能？',
          answer: '是的，系统会定期进行功能更新和性能优化。更新内容包括：新功能上线（如主题切换、历史记录管理等）、bug 修复、性能优化、数据更新等。系统更新一般在非工作时间进行，不会影响用户的正常使用。您可以在首页的"系统监控"区域查看系统状态和数据更新情况。',
          related: ['faq_016', 'faq_017']
        },
        {
          id: 'faq_024',
          category: 'basic',
          question: '首页的数据监控信息是什么意思？',
          answer: '首页的"系统监控"区域显示知识图谱的实时统计信息：总实体数表示知识图谱中包含的医疗实体总数；关系总数表示实体之间的关联关系数量；搜索量显示系统被使用的频率；用户活跃度反映系统的使用情况。这些数据会实时更新，帮助您了解知识图谱的规模和活跃程度。',
          related: ['faq_001', 'faq_007']
        },
        {
          id: 'faq_025',
          category: 'basic',
          question: '封面页和首页有什么区别？',
          answer: '封面页是系统的欢迎页面，展示系统介绍、知识图谱概览和快速入口按钮，适合首次访问的用户了解系统。首页是系统的主要功能页面，包含系统能力导航、实时数据监控和图表可视化，适合日常使用。点击封面页右下角的"进入系统"按钮即可进入首页。',
          related: ['faq_001', 'faq_002']
        }
      ];
    },
    
    // 搜索防抖
    debounceSearch() {
      if (this.searchTimer) {
        clearTimeout(this.searchTimer);
      }
      this.searchTimer = setTimeout(() => {
        this.filterFAQs();
      }, 300);
    },
    
    // 筛选 FAQ
    filterFAQs() {
      if (!this.searchKeyword) {
        this.filteredFAQs = [...this.faqs];
        return;
      }
      
      const keyword = this.searchKeyword.toLowerCase();
      this.filteredFAQs = this.faqs.filter(faq => {
        return faq.question.toLowerCase().includes(keyword) ||
               faq.answer.toLowerCase().includes(keyword);
      });
      
      // 如果当前分类下没有匹配的问题，自动切换到全部分类
      if (this.activeCategory !== 'all' && this.getCategoryFAQs(this.activeCategory).length === 0) {
        this.activeCategory = 'all';
      }
    },
    
    // 获取分类下的 FAQ
    getCategoryFAQs(categoryId) {
      if (categoryId === 'all') {
        return this.filteredFAQs;
      }
      return this.filteredFAQs.filter(faq => faq.category === categoryId);
    },
    
    // 根据 ID 获取 FAQ
    getFAQById(id) {
      return this.faqs.find(faq => faq.id === id);
    },
    
    // 处理标签点击
    handleTabClick() {
      this.activeNames = [];
    },
    
    // 展开相关 FAQ
    expandRelatedFAQ(relatedId) {
      // 找到相关 FAQ 的分类
      const relatedFAQ = this.getFAQById(relatedId);
      if (relatedFAQ) {
        // 切换到相关 FAQ 的分类
        this.activeCategory = relatedFAQ.category;
        // 展开相关 FAQ
        this.$nextTick(() => {
          this.activeNames = [relatedId];
        });
      }
    },
    
    // 提交反馈
    submitFeedback() {
      this.$refs.feedbackForm.validate((valid) => {
        if (valid) {
          this.submitting = true;
          // 模拟提交反馈
          setTimeout(() => {
            this.submitting = false;
            this.$message.success('反馈提交成功，我们会尽快回复您！');
            // 重置表单
            this.$refs.feedbackForm.resetFields();
          }, 1500);
        } else {
          this.$message.error('请填写完整的反馈信息');
          return false;
        }
      });
    }
  }
};
</script>

<style scoped>
.faq-page {
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

/* 搜索区域 */
.search-section {
  margin-bottom: 30px;
  animation: fadeInUp 0.5s ease-out 0.1s both;
}

.search-card {
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  transition: all 0.3s ease;
}

.search-card:hover {
  box-shadow: var(--shadow-card-hover);
  border-color: var(--primary-blue);
}

.search-content {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.faq-search-input {
  width: 100%;
}

.faq-search-input .el-input__inner {
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
}

.search-stats {
  text-align: center;
  font-size: 14px;
  color: var(--primary-blue);
}

.search-stats.empty {
  color: var(--error-color);
}

/* 分类导航 */
.category-section {
  animation: fadeInUp 0.5s ease-out 0.2s both;
}

.category-card {
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
}

.category-content {
  padding: 20px 0;
}

.category-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 20px;
  padding-left: 20px;
}

.category-tabs {
  padding: 0 20px;
}

.faq-tabs .el-tabs__header {
  margin-bottom: 20px;
}

.faq-tabs .el-tabs__nav {
  background: var(--bg-secondary);
  padding: 5px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-primary);
}

.faq-tabs .el-tabs__item {
  color: var(--text-secondary);
  border-radius: var(--radius-sm);
  margin: 0 5px;
  transition: all 0.3s ease;
}

.faq-tabs .el-tabs__item:hover {
  color: var(--primary-blue);
}

.faq-tabs .el-tabs__item.is-active {
  color: var(--text-primary);
  background: var(--bg-card);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.faq-tabs .el-tabs__active-bar {
  display: none;
}

/* FAQ 折叠面板 */
.faq-collapse {
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.faq-item {
  border-bottom: 1px solid var(--border-primary);
  transition: all 0.3s ease;
}

.faq-item:last-child {
  border-bottom: none;
}

.faq-item .el-collapse-item__header {
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-weight: 500;
  padding: 16px 20px;
  transition: all 0.3s ease;
  border-left: 3px solid transparent;
}

.faq-item .el-collapse-item__header:hover {
  background: var(--bg-card);
  border-left-color: var(--primary-blue);
}

.faq-item.is-active .el-collapse-item__header {
  background: var(--bg-card);
  border-left-color: var(--primary-blue);
  color: var(--primary-blue);
}

.faq-item .el-collapse-item__header i {
  color: var(--primary-blue);
  font-size: 16px;
}

.faq-answer {
  background: var(--bg-secondary);
  color: var(--text-secondary);
  padding: 20px;
  line-height: 1.8;
  font-size: 14px;
}

/* 相关问题 */
.related-questions {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid var(--border-primary);
}

.related-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 10px;
}

.related-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.related-item {
  padding: 8px 0;
  color: var(--primary-blue);
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
  display: flex;
  align-items: center;
}

.related-item:hover {
  color: var(--accent-purple);
  transform: translateX(5px);
}

.related-item i {
  margin-right: 8px;
  font-size: 12px;
}

/* 空状态 */
.empty-category, .empty-all-questions {
  padding: 40px 20px;
  text-align: center;
}

/* 全部问题列表 */
.all-questions-section {
  animation: fadeInUp 0.5s ease-out 0.2s both;
}

.all-questions-card {
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
}

.all-questions-card .card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid var(--border-primary);
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.question-count {
  font-size: 14px;
  color: var(--text-secondary);
  background: var(--bg-secondary);
  padding: 4px 12px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-primary);
}

.questions-list {
  padding: 20px;
}

/* 反馈区域 */
.feedback-section {
  margin-top: 30px;
  animation: fadeInUp 0.5s ease-out 0.3s both;
}

.feedback-card {
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
}

.feedback-content {
  padding: 30px 20px;
}

.feedback-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 10px;
  text-align: center;
}

.feedback-subtitle {
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 30px;
  text-align: center;
}

.feedback-form {
  max-width: 800px;
  margin: 0 auto;
}

.form-row {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.form-item {
  flex: 1;
  margin-bottom: 0;
}

.form-input, .form-textarea {
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  color: var(--text-primary);
  border-radius: var(--radius-md);
}

.form-input:focus, .form-textarea:focus {
  border-color: var(--primary-blue);
  box-shadow: 0 0 0 2px rgba(0, 212, 255, 0.2);
}

.submit-item {
  text-align: center;
  margin-top: 30px;
}

.submit-btn {
  padding: 12px 40px;
  font-size: 16px;
  font-weight: 600;
  border-radius: var(--radius-md);
  transition: all 0.3s ease;
  background: var(--gradient-main);
  border: none;
}

.submit-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 0 20px rgba(0, 212, 255, 0.3);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .faq-page {
    padding: 15px;
  }
  
  .form-row {
    flex-direction: column;
    gap: 15px;
  }
  
  .category-content {
    padding: 10px 0;
  }
  
  .category-title {
    padding-left: 15px;
    font-size: 18px;
  }
  
  .category-tabs {
    padding: 0 15px;
  }
  
  .faq-tabs .el-tabs__nav {
    padding: 3px;
  }
  
  .faq-tabs .el-tabs__item {
    padding: 8px 12px;
    font-size: 13px;
  }
  
  .faq-item .el-collapse-item__header {
    padding: 12px 16px;
    font-size: 14px;
  }
  
  .faq-answer {
    padding: 16px;
    font-size: 13px;
  }
  
  .all-questions-card .card-header {
    padding: 15px;
  }
  
  .questions-list {
    padding: 15px;
  }
  
  .feedback-content {
    padding: 20px 15px;
  }
  
  .feedback-title {
    font-size: 18px;
  }
}
</style>