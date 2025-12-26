// 数据验证工具函数

const validators = {
  // 验证必填项
  required(value) {
    if (value === null || value === undefined) return false;
    if (typeof value === 'string') return value.trim() !== '';
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === 'object') return Object.keys(value).length > 0;
    return true;
  },

  // 验证最小长度
  minLength(value, min) {
    if (!value) return false;
    if (typeof value === 'string' || Array.isArray(value)) {
      return value.length >= min;
    }
    if (typeof value === 'number') {
      return value >= min;
    }
    return false;
  },

  // 验证最大长度
  maxLength(value, max) {
    if (!value) return true;
    if (typeof value === 'string' || Array.isArray(value)) {
      return value.length <= max;
    }
    if (typeof value === 'number') {
      return value <= max;
    }
    return false;
  },

  // 验证长度范围
  lengthRange(value, min, max) {
    return this.minLength(value, min) && this.maxLength(value, max);
  },

  // 验证数字范围
  numberRange(value, min, max) {
    if (typeof value !== 'number' && isNaN(Number(value))) return false;
    const num = Number(value);
    return num >= min && num <= max;
  },

  // 验证整数
  isInteger(value) {
    if (typeof value === 'number') {
      return Number.isInteger(value);
    }
    if (typeof value === 'string') {
      return /^-?\d+$/.test(value);
    }
    return false;
  },

  // 验证浮点数
  isFloat(value) {
    if (typeof value === 'number') {
      return !Number.isInteger(value);
    }
    if (typeof value === 'string') {
      return /^-?\d+\.\d+$/.test(value);
    }
    return false;
  },

  // 验证正数
  isPositive(value) {
    if (typeof value !== 'number' && isNaN(Number(value))) return false;
    return Number(value) > 0;
  },

  // 验证非负数
  isNonNegative(value) {
    if (typeof value !== 'number' && isNaN(Number(value))) return false;
    return Number(value) >= 0;
  },

  // 验证邮箱地址
  isEmail(value) {
    if (!value || typeof value !== 'string') return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  },

  // 验证手机号（中国大陆）
  isPhoneNumber(value) {
    if (!value || typeof value !== 'string') return false;
    const phoneRegex = /^1[3-9]\d{9}$/;
    return phoneRegex.test(value);
  },

  // 验证身份证号码（中国大陆）
  isIdCard(value) {
    if (!value || typeof value !== 'string') return false;
    
    // 18位身份证号码验证
    const idCardRegex = /^[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]$/;
    if (!idCardRegex.test(value)) return false;
    
    // 校验码验证（可选，这里简化处理）
    const weights = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
    const checkCodes = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2'];
    
    let sum = 0;
    for (let i = 0; i < 17; i++) {
      sum += parseInt(value[i]) * weights[i];
    }
    
    const checkCode = checkCodes[sum % 11];
    return checkCode === value[17].toUpperCase();
  },

  // 验证URL
  isURL(value) {
    if (!value || typeof value !== 'string') return false;
    const urlRegex = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\w .-]*)*\/?$/;
    return urlRegex.test(value);
  },

  // 验证IP地址
  isIP(value) {
    if (!value || typeof value !== 'string') return false;
    const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    return ipRegex.test(value);
  },

  // 验证IPv4地址
  isIPv4(value) {
    return this.isIP(value);
  },

  // 验证IPv6地址
  isIPv6(value) {
    if (!value || typeof value !== 'string') return false;
    const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
    return ipv6Regex.test(value);
  },

  // 验证日期格式
  isDate(value, format = 'YYYY-MM-DD') {
    if (!value || typeof value !== 'string') return false;
    
    // 简单的日期格式验证，可以根据需要扩展
    const dateRegexMap = {
      'YYYY-MM-DD': /^\d{4}-\d{2}-\d{2}$/,
      'YYYY/MM/DD': /^\d{4}\/\d{2}\/\d{2}$/,
      'DD/MM/YYYY': /^\d{2}\/\d{2}\/\d{4}$/
    };
    
    const regex = dateRegexMap[format] || /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(value)) return false;
    
    // 验证日期有效性
    const parts = format === 'YYYY-MM-DD' || format === 'YYYY/MM/DD' ? 
      value.split(format.includes('-') ? '-' : '/') : 
      value.split('/').reverse();
    
    const year = parseInt(parts[0]);
    const month = parseInt(parts[1]) - 1; // JavaScript月份从0开始
    const day = parseInt(parts[2]);
    
    const date = new Date(year, month, day);
    return date.getFullYear() === year && date.getMonth() === month && date.getDate() === day;
  },

  // 验证时间格式
  isTime(value, format = 'HH:mm:ss') {
    if (!value || typeof value !== 'string') return false;
    
    const timeRegexMap = {
      'HH:mm:ss': /^([01]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/,
      'HH:mm': /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/
    };
    
    const regex = timeRegexMap[format] || /^([01]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/;
    return regex.test(value);
  },

  // 验证日期时间格式
  isDateTime(value, format = 'YYYY-MM-DD HH:mm:ss') {
    if (!value || typeof value !== 'string') return false;
    
    const [datePart, timePart] = value.split(' ');
    if (!datePart || !timePart) return false;
    
    return this.isDate(datePart, format.split(' ')[0]) && 
           this.isTime(timePart, format.split(' ')[1]);
  },

  // 验证是否为图片文件
  isImageFile(file) {
    if (!file || !file.type) return false;
    return file.type.startsWith('image/');
  },

  // 验证文件大小
  isFileSize(file, maxSize) {
    if (!file || !file.size) return false;
    return file.size <= maxSize;
  },

  // 验证文件类型
  isFileType(file, allowedTypes) {
    if (!file || !file.type) return false;
    if (!Array.isArray(allowedTypes)) return false;
    return allowedTypes.some(type => file.type === type || file.name.endsWith(type));
  },

  // 验证密码强度
  isStrongPassword(password) {
    if (!password || typeof password !== 'string') return false;
    
    // 至少包含8个字符，至少包含一个大写字母、一个小写字母和一个数字
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  },

  // 验证两次输入是否一致
  isSame(value1, value2) {
    return value1 === value2;
  },

  // 验证正则表达式
  isMatch(value, regex) {
    if (!value || typeof value !== 'string') return false;
    if (!(regex instanceof RegExp)) return false;
    return regex.test(value);
  },

  // 验证是否为中文
  isChinese(value) {
    if (!value || typeof value !== 'string') return false;
    const chineseRegex = /^[\u4e00-\u9fa5]+$/;
    return chineseRegex.test(value);
  },

  // 验证是否为英文
  isEnglish(value) {
    if (!value || typeof value !== 'string') return false;
    const englishRegex = /^[a-zA-Z]+$/;
    return englishRegex.test(value);
  },

  // 验证是否为字母数字组合
  isAlphanumeric(value) {
    if (!value || typeof value !== 'string') return false;
    const alphanumericRegex = /^[a-zA-Z0-9]+$/;
    return alphanumericRegex.test(value);
  },

  // 验证是否包含特殊字符
  hasSpecialChars(value) {
    if (!value || typeof value !== 'string') return false;
    const specialCharsRegex = /[^a-zA-Z0-9\u4e00-\u9fa5]/;
    return specialCharsRegex.test(value);
  },

  // 验证UUID
  isUUID(value) {
    if (!value || typeof value !== 'string') return false;
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(value);
  },

  // 验证MAC地址
  isMACAddress(value) {
    if (!value || typeof value !== 'string') return false;
    const macRegex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;
    return macRegex.test(value);
  },

  // 验证邮政编码（中国大陆）
  isPostalCode(value) {
    if (!value || typeof value !== 'string') return false;
    const postalCodeRegex = /^\d{6}$/;
    return postalCodeRegex.test(value);
  },

  // 验证银行卡号
  isBankCard(value) {
    if (!value || typeof value !== 'string') return false;
    const bankCardRegex = /^\d{16,19}$/;
    return bankCardRegex.test(value);
  },

  // 验证统一社会信用代码
  isCreditCode(value) {
    if (!value || typeof value !== 'string') return false;
    const creditCodeRegex = /^[0-9A-HJ-NPQRTUWXY]{2}\d{6}[0-9A-HJ-NPQRTUWXY]{10}$/;
    return creditCodeRegex.test(value);
  },

  // 验证组织机构代码
  isOrganizationCode(value) {
    if (!value || typeof value !== 'string') return false;
    const orgCodeRegex = /^[0-9A-HJ-NPQRTUWXY]{8}-[0-9A-HJ-NPQRTUWXY]$/;
    return orgCodeRegex.test(value);
  },

  // 验证自定义规则
  validateCustom(value, validator) {
    if (typeof validator !== 'function') return false;
    return validator(value);
  },

  // 批量验证
  validateBatch(rules, data) {
    const errors = {};
    
    for (const field in rules) {
      const fieldRules = rules[field];
      const value = data[field];
      
      for (const rule of fieldRules) {
        const { type, message, ...options } = rule;
        
        if (!this[type](value, ...Object.values(options))) {
          errors[field] = message || `Field ${field} validation failed`;
          break;
        }
      }
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }
};

export default validators;
