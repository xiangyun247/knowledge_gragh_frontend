/**
 * 角色权限工具（医疗场景）
 * 与后端 admin / doctor / patient / guest 一致
 */

export const ROLES = {
  ADMIN: 'admin',
  DOCTOR: 'doctor',
  PATIENT: 'patient',
  ELDERLY: 'elderly',
  GUEST: 'guest'
}

/** 角色显示名 */
export const ROLE_LABELS = {
  [ROLES.ADMIN]: '管理员',
  [ROLES.DOCTOR]: '医生',
  [ROLES.PATIENT]: '患者',
  [ROLES.ELDERLY]: '老人',
  [ROLES.GUEST]: '访客'
}

/** 老人身份可见的路由白名单 */
export const ELDERLY_ALLOWED_ROUTES = [
  '/', '/home', '/elderly-chat', '/elderly-test', '/medication', '/patient-education', '/family-report',
  '/login', '/profile', '/faq', '/forgot-password', '/eeg-monitor', '/cognitive-load'
]

/**
 * 判断当前角色是否在允许列表中
 * @param {string} userRole 当前用户角色
 * @param {string[]} allowedRoles 允许的角色列表
 * @returns {boolean}
 */
export function hasRole(userRole, allowedRoles) {
  if (!userRole || !Array.isArray(allowedRoles)) return false
  return allowedRoles.includes(String(userRole).toLowerCase())
}

/**
 * 获取角色显示名
 * @param {string} role
 * @returns {string}
 */
export function getRoleLabel(role) {
  return ROLE_LABELS[role] || role || '用户'
}
