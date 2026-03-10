/**
 * 实体类型与关系类型配置
 * 与后端 config.py 保持一致（表2 实体描述框架、表3 实体关系描述框架）
 */

// ==================== 实体类型 ====================

/** 实体类型列表（英文，用于 API 请求的 type 参数） */
export const ENTITY_TYPES = [
  'Disease',
  'Symptom',
  'Population',
  'Medicine',
  'Prognosis',
  'PhysicalExamination',
  'LaboratoryExamination',
  'ImagingExamination',
  'PathologyExamination',
  'OtherExamination',
  'AbnormalExaminationResult',
  'TCMTreatment',
  'Surgery',
  'DrugTreatment',
  'WesternPhysicalTherapy',
  'OtherTreatment',
  'AnatomicalSite',
  'AnatomicalSubstance',
  'MedicalEquipment',
  'Hospital',
  'Department',
  'Gene',
  'Microorganism',
  'PhysicalChemicalFactor',
  'PsychologicalBehavior',
  'Lifestyle',
  'ImmuneFactor',
  'DisuseFactor',
  'ICD10Code',
  'Synonym'
]

/** 实体类型：英文 → 中文 */
export const ENTITY_TYPE_LABELS = {
  Disease: '疾病',
  Symptom: '症状或体征',
  Population: '群体',
  Medicine: '药物',
  Prognosis: '预后',
  PhysicalExamination: '体格检查',
  LaboratoryExamination: '实验室检查',
  ImagingExamination: '影像学检查',
  PathologyExamination: '病理检查',
  OtherExamination: '其它检查',
  AbnormalExaminationResult: '异常检查结果',
  TCMTreatment: '中医治疗',
  Surgery: '手术',
  DrugTreatment: '药物治疗',
  WesternPhysicalTherapy: '西医理疗',
  OtherTreatment: '其它治疗',
  AnatomicalSite: '解剖部位',
  AnatomicalSubstance: '解剖物质',
  MedicalEquipment: '医用设备、器械和材料',
  Hospital: '医院',
  Department: '科室',
  Gene: '基因',
  Microorganism: '微生物类',
  PhysicalChemicalFactor: '理化因素',
  PsychologicalBehavior: '心理行为',
  Lifestyle: '生活习惯',
  ImmuneFactor: '免疫因素',
  DisuseFactor: '废用性因素',
  ICD10Code: 'ICD10编码',
  Synonym: '同义词'
}

/** 实体类型颜色（与后端 graph_retriever.NODE_COLOR_MAP 一致） */
export const ENTITY_TYPE_COLORS = {
  Disease: '#ff6b6b',
  Symptom: '#4ecdc4',
  Population: '#a29bfe',
  Medicine: '#55efc4',
  Prognosis: '#74b9ff',
  PhysicalExamination: '#ffeaa7',
  LaboratoryExamination: '#fdcb6e',
  ImagingExamination: '#e17055',
  PathologyExamination: '#d63031',
  OtherExamination: '#e84393',
  AbnormalExaminationResult: '#fd79a8',
  TCMTreatment: '#00b894',
  Surgery: '#0984e3',
  DrugTreatment: '#6c5ce7',
  WesternPhysicalTherapy: '#00cec9',
  OtherTreatment: '#81ecec',
  AnatomicalSite: '#dfe6e9',
  AnatomicalSubstance: '#b2bec3',
  MedicalEquipment: '#636e72',
  Hospital: '#2d3436',
  Department: '#fab1a0',
  Gene: '#a8e6cf',
  Microorganism: '#ff8b94',
  PhysicalChemicalFactor: '#ffaaa5',
  PsychologicalBehavior: '#ffd3b6',
  Lifestyle: '#dcedd2',
  ImmuneFactor: '#ffecd2',
  DisuseFactor: '#e0bbe4',
  ICD10Code: '#9575cd',
  Synonym: '#b39ddb'
}

/** 实体类型完整配置（用于图谱、搜索等组件） */
export const ENTITY_TYPE_CONFIG = ENTITY_TYPES.map(type => ({
  value: type,
  label: ENTITY_TYPE_LABELS[type] || type,
  category: type.toLowerCase(),
  color: ENTITY_TYPE_COLORS[type] || '#9c27ff'
}))

// ==================== 关系类型 ====================

/** 关系类型列表（英文） */
export const RELATION_TYPES = [
  'HAS_ABNORMAL_EXAM_RESULT',
  'EXAM_HAS_ABNORMAL_RESULT',
  'REQUIRES_EXAM',
  'TREATED_BY',
  'PREVENTED_BY',
  'TREATS_COMPLICATION',
  'HAS_SIDE_EFFECT',
  'HAS_SYMPTOM',
  'AFFECTS_POPULATION',
  'HAS_COMPLICATION',
  'DIFFERENTIAL_DIAGNOSIS',
  'HAS_ETIOLOGY',
  'BELONGS_TO_DEPARTMENT',
  'TREATED_AT_HOSPITAL',
  'AFFECTS_SITE',
  'HAS_PROGNOSIS',
  'USES_EQUIPMENT',
  'BELONGS_TO',
  'HAS_ICD10_CODE',
  'HAS_SYNONYM'
]

/** 关系类型：英文 → 中文 */
export const RELATION_TYPE_LABELS = {
  HAS_ABNORMAL_EXAM_RESULT: '异常检查结果',
  EXAM_HAS_ABNORMAL_RESULT: '检查-异常结果',
  REQUIRES_EXAM: '用于检查',
  TREATED_BY: '用于治疗',
  PREVENTED_BY: '用于预防',
  TREATS_COMPLICATION: '治疗并发症',
  HAS_SIDE_EFFECT: '副作用',
  HAS_SYMPTOM: '症状或体征',
  AFFECTS_POPULATION: '多发人群',
  HAS_COMPLICATION: '并发症',
  DIFFERENTIAL_DIAGNOSIS: '鉴别诊断',
  HAS_ETIOLOGY: '病因',
  BELONGS_TO_DEPARTMENT: '就诊科室',
  TREATED_AT_HOSPITAL: '就诊医院',
  AFFECTS_SITE: '发病部位',
  HAS_PROGNOSIS: '预后',
  USES_EQUIPMENT: '使用于',
  BELONGS_TO: '属于',
  HAS_ICD10_CODE: 'ICD10编码',
  HAS_SYNONYM: '别称'
}

// ==================== 工具函数 ====================

/**
 * 根据类型获取中文名称（支持英文、小写 category）
 * @param {string} type - 实体类型（如 'Disease'、'disease'、'laboratoryexamination'）
 * @returns {string} 中文名称
 */
export function getEntityTypeLabel(type) {
  if (!type) return '未知类型'
  const key = Object.keys(ENTITY_TYPE_LABELS).find(
    k => k.toLowerCase() === String(type).toLowerCase()
  )
  return key ? ENTITY_TYPE_LABELS[key] : type
}

/**
 * 根据类型获取颜色
 * @param {string} type - 实体类型
 * @returns {string} 颜色值
 */
export function getEntityTypeColor(type) {
  if (!type) return '#9c27ff'
  const key = Object.keys(ENTITY_TYPE_COLORS).find(
    k => k.toLowerCase() === String(type).toLowerCase()
  )
  return key ? ENTITY_TYPE_COLORS[key] : '#9c27ff'
}

/**
 * 根据关系类型获取中文名称
 * @param {string} type - 关系类型
 * @returns {string} 中文名称
 */
export function getRelationTypeLabel(type) {
  if (!type) return ''
  return RELATION_TYPE_LABELS[type] || type
}

/**
 * 将前端 type 转为 API 所需的英文类型（如 'disease' -> 'Disease'）
 * @param {string} type - 前端传入的类型（可能为小写或中文）
 * @returns {string} 英文类型
 */
export function normalizeEntityTypeForApi(type) {
  if (!type || type === 'all') return ''
  const key = Object.keys(ENTITY_TYPE_LABELS).find(
    k => k.toLowerCase() === String(type).toLowerCase()
  )
  return key || type
}
