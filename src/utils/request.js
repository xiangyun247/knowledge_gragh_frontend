// Axios 请求封装
import axios from 'axios';
import { Message } from 'element-ui';
import storage from './storage';
import auth from '@/api/auth';

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

// 刷新中 Promise，避免并发多次刷新
let refreshPromise = null;

function clearAuthAndRedirect() {
  storage.remove(ACCESS_TOKEN_KEY);
  storage.remove(REFRESH_TOKEN_KEY);
  storage.remove('token');
  storage.remove('userInfo');
  refreshPromise = null;
  const base = (window.location.href || '').split('#')[0];
  window.location.href = `${base}#/login`;
}

// 创建 axios 实例
const service = axios.create({
  // 留空时用相对路径 /api/xxx（Nginx 反代）；设了 VUE_APP_API_BASE_URL 时用该地址
  baseURL: process.env.VUE_APP_API_BASE_URL || '',
  timeout: 600000, // 请求超时时间，改为10分钟
  // 移除默认的Content-Type设置，让axios自动根据请求数据设置正确的Content-Type
  responseType: 'json'
});

// 请求拦截器
service.interceptors.request.use(
  config => {
    // 添加 Token：优先 access_token，兼容旧 token
    const token = storage.get(ACCESS_TOKEN_KEY) || storage.get('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    // 7.1 多租户：当前用户 id 供后端 KB、图谱、Agent 做权限过滤
    const userInfo = storage.get('userInfo');
    if (userInfo && userInfo.id != null && userInfo.id !== '') {
      config.headers['X-User-Id'] = String(userInfo.id);
    }

    // 处理请求参数
    if (config.method === 'get') {
      config.params = {
        ...config.params,
        _t: Date.now()
      };
    }

    if (process.env.NODE_ENV !== 'production') {
      console.log('API请求:', config.method.toUpperCase(), config.url);
    }
    return config;
  },
  error => {
    if (process.env.NODE_ENV !== 'production') {
      console.error('请求错误:', error);
    }
    return Promise.reject(error);
  }
);

// 响应拦截器
service.interceptors.response.use(
  response => {
    return response;
  },
  async error => {
    const { response, config } = error;

    if (response && response.status === 401) {
      // 若是 refresh 接口本身失败，不再尝试刷新
      const isRefreshReq = (config && config.url && String(config.url).includes('/api/auth/refresh'));
      if (isRefreshReq) {
        Message.error('登录已过期，请重新登录');
        clearAuthAndRedirect();
        return Promise.reject(error);
      }

      const refreshToken = storage.get(REFRESH_TOKEN_KEY);
      if (!refreshToken) {
        Message.error('未授权，请重新登录');
        clearAuthAndRedirect();
        return Promise.reject(error);
      }

      // 避免重复刷新：若已有刷新在进行，等待其完成后再重试
      if (!refreshPromise) {
        refreshPromise = auth.refresh(refreshToken)
          .then(resp => {
            const data = resp.data || resp;
            const accessToken = data.access_token || (data.data && data.data.access_token);
            const newRefreshToken = data.refresh_token || (data.data && data.data.refresh_token);
            if (accessToken) {
              storage.set(ACCESS_TOKEN_KEY, accessToken, 60 * 60);
              if (newRefreshToken) {
                storage.set(REFRESH_TOKEN_KEY, newRefreshToken, 7 * 24 * 60 * 60);
              }
            }
            refreshPromise = null;
            return accessToken;
          })
          .catch(() => {
            refreshPromise = null;
            Message.error('登录已过期，请重新登录');
            clearAuthAndRedirect();
            return null;
          });
      }

      const newToken = await refreshPromise;
      if (newToken && config) {
        config.headers['Authorization'] = `Bearer ${newToken}`;
        return service.request(config);
      }
      return Promise.reject(error);
    }

    // 非 401 错误（生产环境不打印详细错误，避免泄露）
    if (process.env.NODE_ENV !== 'production') {
      console.error('响应错误:', error);
      if (response) {
        console.error('响应状态:', response.status, '数据:', response.data);
      }
    }

    let message = '网络错误，请稍后重试';
    if (response) {
      switch (response.status) {
        case 400:
          message = '请求参数错误';
          break;
        case 403:
          message = '拒绝访问';
          break;
        case 404:
          message = '请求地址不存在';
          break;
        case 408:
          message = '请求超时';
          break;
        case 500:
          message = '服务器内部错误';
          break;
        case 501:
          message = '服务未实现';
          break;
        case 502:
          message = '网关错误';
          break;
        case 503:
          message = '服务不可用';
          break;
        case 504:
          message = '网关超时';
          break;
        case 505:
          message = 'HTTP 版本不受支持';
          break;
        default:
          message = `请求失败 (${error.response.status})`;
      }
    } else if (error.request) {
      // 请求已发送但没有收到响应
      message = '服务器无响应，请稍后重试';
    }
    
    // 进度轮询等接口不弹出全局错误，由业务层自行处理
    const isProgressPoll = config && config.url && String(config.url).includes('/api/kg/build/progress/');
    if (!isProgressPoll) {
      Message({
        message: message,
        type: 'error',
        duration: 5 * 1000
      });
    }
    
    return Promise.reject(error);
  }
);

export default service;
