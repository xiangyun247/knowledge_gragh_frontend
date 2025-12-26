// LocalStorage 封装

const storage = {
  // 设置存储项
  set(key, value, expire = null) {
    try {
      const data = {
        value,
        expire: expire ? Date.now() + expire * 1000 : null
      };
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('Storage set error:', error);
      return false;
    }
  },

  // 获取存储项
  get(key) {
    try {
      const data = localStorage.getItem(key);
      if (!data) return null;
      
      const parsed = JSON.parse(data);
      
      // 检查是否过期
      if (parsed.expire && Date.now() > parsed.expire) {
        this.remove(key);
        return null;
      }
      
      return parsed.value;
    } catch (error) {
      console.error('Storage get error:', error);
      return null;
    }
  },

  // 移除存储项
  remove(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Storage remove error:', error);
      return false;
    }
  },

  // 清空所有存储项
  clear() {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error('Storage clear error:', error);
      return false;
    }
  },

  // 检查存储项是否存在
  has(key) {
    try {
      return localStorage.getItem(key) !== null;
    } catch (error) {
      console.error('Storage has error:', error);
      return false;
    }
  },

  // 获取存储大小（字节）
  getSize() {
    try {
      let size = 0;
      for (let key in localStorage) {
        if (Object.prototype.hasOwnProperty.call(localStorage, key)) {
          size += localStorage[key].length;
        }
      }
      return size;
    } catch (error) {
      console.error('Storage getSize error:', error);
      return 0;
    }
  },

  // 获取所有存储项的键
  getKeys() {
    try {
      const keys = [];
      for (let key in localStorage) {
        if (Object.prototype.hasOwnProperty.call(localStorage, key)) {
          keys.push(key);
        }
      }
      return keys;
    } catch (error) {
      console.error('Storage getKeys error:', error);
      return [];
    }
  },

  // 批量设置存储项
  setMultiple(items, expire = null) {
    try {
      items.forEach(item => {
        this.set(item.key, item.value, expire);
      });
      return true;
    } catch (error) {
      console.error('Storage setMultiple error:', error);
      return false;
    }
  },

  // 批量获取存储项
  getMultiple(keys) {
    try {
      const result = {};
      keys.forEach(key => {
        result[key] = this.get(key);
      });
      return result;
    } catch (error) {
      console.error('Storage getMultiple error:', error);
      return {};
    }
  },

  // 批量移除存储项
  removeMultiple(keys) {
    try {
      keys.forEach(key => {
        this.remove(key);
      });
      return true;
    } catch (error) {
      console.error('Storage removeMultiple error:', error);
      return false;
    }
  },

  // 会话存储（临时存储，页面关闭后失效）
  session: {
    set(key, value) {
      try {
        sessionStorage.setItem(key, JSON.stringify(value));
        return true;
      } catch (error) {
        console.error('SessionStorage set error:', error);
        return false;
      }
    },

    get(key) {
      try {
        const data = sessionStorage.getItem(key);
        return data ? JSON.parse(data) : null;
      } catch (error) {
        console.error('SessionStorage get error:', error);
        return null;
      }
    },

    remove(key) {
      try {
        sessionStorage.removeItem(key);
        return true;
      } catch (error) {
        console.error('SessionStorage remove error:', error);
        return false;
      }
    },

    clear() {
      try {
        sessionStorage.clear();
        return true;
      } catch (error) {
        console.error('SessionStorage clear error:', error);
        return false;
      }
    }
  }
};

export default storage;
