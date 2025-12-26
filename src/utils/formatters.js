// 数据格式化工具函数

const formatters = {
  // 格式化日期时间
  formatDateTime(date, format = 'YYYY-MM-DD HH:mm:ss') {
    if (!date) return '';
    
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');
    
    return format
      .replace('YYYY', year)
      .replace('MM', month)
      .replace('DD', day)
      .replace('HH', hours)
      .replace('mm', minutes)
      .replace('ss', seconds);
  },

  // 格式化日期
  formatDate(date, format = 'YYYY-MM-DD') {
    return this.formatDateTime(date, format);
  },

  // 格式化时间
  formatTime(date, format = 'HH:mm:ss') {
    return this.formatDateTime(date, format);
  },

  // 格式化相对时间
  formatRelativeTime(date) {
    if (!date) return '';
    
    const now = new Date();
    const d = new Date(date);
    const diff = now - d;
    
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);
    
    if (years > 0) return `${years}年前`;
    if (months > 0) return `${months}个月前`;
    if (days > 0) return `${days}天前`;
    if (hours > 0) return `${hours}小时前`;
    if (minutes > 0) return `${minutes}分钟前`;
    return `${seconds}秒前`;
  },

  // 格式化数字
  formatNumber(num, options = {}) {
    if (num === null || num === undefined) return '';
    
    const { decimals = 2, thousandsSeparator = ',', decimalSeparator = '.' } = options;
    
    if (typeof num !== 'number') num = Number(num);
    if (isNaN(num)) return '';
    
    const formatted = num.toFixed(decimals);
    const [integer, decimal] = formatted.split('.');
    
    // 添加千位分隔符
    const integerWithSeparator = integer.replace(/\B(?=(\d{3})+(?!\d))/g, thousandsSeparator);
    
    return decimal ? `${integerWithSeparator}${decimalSeparator}${decimal}` : integerWithSeparator;
  },

  // 格式化百分比
  formatPercentage(num, decimals = 2) {
    if (num === null || num === undefined) return '';
    
    if (typeof num !== 'number') num = Number(num);
    if (isNaN(num)) return '';
    
    return `${(num * 100).toFixed(decimals)}%`;
  },

  // 格式化文件大小
  formatFileSize(bytes) {
    if (bytes === null || bytes === undefined || bytes === 0) return '0 B';
    
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    const k = 1024;
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${units[i]}`;
  },

  // 格式化货币
  formatCurrency(amount, currency = '¥', options = {}) {
    if (amount === null || amount === undefined) return '';
    
    const formattedNumber = this.formatNumber(amount, options);
    return `${currency}${formattedNumber}`;
  },

  // 格式化电话号码
  formatPhoneNumber(phone) {
    if (!phone) return '';
    
    const cleaned = phone.replace(/\D/g, '');
    
    // 中国手机号格式：138-8888-8888
    if (cleaned.length === 11) {
      return cleaned.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
    }
    
    // 其他格式可以根据需要扩展
    return phone;
  },

  // 格式化邮箱地址（隐藏部分信息）
  formatEmail(email) {
    if (!email) return '';
    
    const [username, domain] = email.split('@');
    if (!username || !domain) return email;
    
    // 隐藏部分用户名
    if (username.length <= 3) {
      return `${username[0]}***@${domain}`;
    } else {
      const first = username.slice(0, 2);
      const last = username.slice(-1);
      return `${first}***${last}@${domain}`;
    }
  },

  // 格式化身份证号码（隐藏部分信息）
  formatIdCard(idCard) {
    if (!idCard) return '';
    
    if (idCard.length === 18) {
      return idCard.replace(/(\d{6})\d{8}(\d{4})/, '$1********$2');
    }
    
    return idCard;
  },

  // 格式化文本（去除多余空格、换行）
  formatText(text) {
    if (!text) return '';
    
    return text
      .replace(/\s+/g, ' ') // 替换多个空格为一个
      .trim(); // 去除首尾空格
  },

  // 截断文本
  truncateText(text, maxLength = 100, suffix = '...') {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    
    return text.slice(0, maxLength) + suffix;
  },

  // 格式化 JSON（用于显示）
  formatJSON(json, indent = 2) {
    if (!json) return '';
    
    try {
      if (typeof json === 'string') {
        json = JSON.parse(json);
      }
      return JSON.stringify(json, null, indent);
    } catch (error) {
      console.error('Format JSON error:', error);
      return json;
    }
  },

  // 格式化数组为字符串
  formatArray(array, separator = ', ') {
    if (!Array.isArray(array)) return '';
    return array.join(separator);
  },

  // 格式化对象为字符串
  formatObject(obj, options = {}) {
    if (!obj || typeof obj !== 'object') return '';
    
    const { separator = ', ', keyValueSeparator = ': ' } = options;
    return Object.entries(obj)
      .map(([key, value]) => `${key}${keyValueSeparator}${value}`)
      .join(separator);
  },

  // 格式化布尔值
  formatBoolean(bool, trueText = '是', falseText = '否') {
    return bool ? trueText : falseText;
  },

  // 格式化状态码
  formatStatusCode(code, statusMap = {}) {
    if (code === null || code === undefined) return '';
    return statusMap[code] || code;
  },

  // 格式化IP地址
  formatIP(ip) {
    if (!ip) return '';
    // IP地址格式验证和格式化
    const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    return ipRegex.test(ip) ? ip : 'Invalid IP';
  },

  // 格式化URL
  formatURL(url) {
    if (!url) return '';
    
    // 添加http://前缀如果没有
    if (!/^https?:\/\//i.test(url)) {
      return `http://${url}`;
    }
    
    return url;
  },

  // 格式化HTML为纯文本
  formatHTMLToText(html) {
    if (!html) return '';
    
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    return tempDiv.textContent || tempDiv.innerText || '';
  },

  // 格式化数据类型
  formatDataType(value) {
    if (value === null) return 'null';
    if (value === undefined) return 'undefined';
    return typeof value;
  },

  // 格式化唯一标识符（UUID）
  formatUUID(uuid) {
    if (!uuid) return '';
    
    // UUID格式验证和格式化
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid) ? uuid : 'Invalid UUID';
  },

  // 格式化颜色值（转换为十六进制）
  formatColor(color) {
    if (!color) return '';
    
    // 简单的颜色转换示例，可以根据需要扩展
    if (color.startsWith('#')) return color;
    
    // 颜色名称映射（简单示例）
    const colorMap = {
      'red': '#FF0000',
      'green': '#00FF00',
      'blue': '#0000FF',
      'black': '#000000',
      'white': '#FFFFFF'
    };
    
    return colorMap[color.toLowerCase()] || color;
  }
};

export default formatters;
