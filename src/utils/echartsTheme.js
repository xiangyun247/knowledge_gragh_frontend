// ECharts 不能直接吃 CSS 变量（canvas 渲染），
// 这里在运行时读取当前主题下 CSS 变量的“实际颜色值”，再注入 ECharts option。

function cssVar(name, fallback = '') {
  if (typeof document === 'undefined') return fallback
  const v = getComputedStyle(document.documentElement).getPropertyValue(name)
  const trimmed = (v || '').trim()
  return trimmed || fallback
}

function rgbaFromRgbVar(rgbVarName, alpha, fallbackRgb = '0, 0, 0') {
  const rgb = cssVar(rgbVarName, fallbackRgb).replace(/\s+/g, '')
  return `rgba(${rgb}, ${alpha})`
}

export function getEChartsTheme() {
  const primaryBlue = cssVar('--primary-blue', '#00d4ff')
  const accentCyan = cssVar('--accent-cyan', '#00e5ff')
  const accentPurple = cssVar('--accent-purple', '#9c27ff')
  const success = cssVar('--success', '#22c55e')
  const warning = cssVar('--warning', '#f59e0b')
  const error = cssVar('--error', '#ef4444')

  const textPrimary = cssVar('--text-primary', '#ffffff')
  const textSecondary = cssVar('--text-secondary', 'rgba(255, 255, 255, 0.8)')
  const textMuted = cssVar('--text-muted', 'rgba(255, 255, 255, 0.6)')

  const borderPrimary = cssVar('--border-primary', 'rgba(0, 212, 255, 0.3)')
  const borderLight = cssVar('--border-light', 'rgba(255, 255, 255, 0.1)')

  const bgPopup = cssVar('--bg-popup', 'rgba(12, 18, 48, 0.97)')
  const bgCard = cssVar('--bg-card', 'rgba(10, 14, 39, 0.9)')

  return {
    primaryBlue,
    accentCyan,
    accentPurple,
    success,
    warning,
    error,
    textPrimary,
    textSecondary,
    textMuted,
    borderPrimary,
    borderLight,
    bgPopup,
    bgCard,

    // RGB 分量用于构造透明度
    primaryBlueRgb: cssVar('--primary-blue-rgb', '0,212,255'),
    accentCyanRgb: cssVar('--accent-cyan-rgb', '0,229,255'),
    accentPurpleRgb: cssVar('--accent-purple-rgb', '156,39,255'),
    errorRgb: cssVar('--error-rgb', '239,68,68'),

    // 常用透明度颜色（保持与组件里的风格一致）
    rgbaPrimary(alpha) {
      return rgbaFromRgbVar('--primary-blue-rgb', alpha)
    },
    rgbaAccentCyan(alpha) {
      return rgbaFromRgbVar('--accent-cyan-rgb', alpha)
    },
    rgbaAccentPurple(alpha) {
      return rgbaFromRgbVar('--accent-purple-rgb', alpha)
    },
    rgbaError(alpha) {
      return rgbaFromRgbVar('--error-rgb', alpha, '239, 68, 68')
    }
  }
}

