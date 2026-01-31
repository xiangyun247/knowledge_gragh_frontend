// Axios 请求封装
import axios from 'axios';
import { Message } from 'element-ui';
import storage from './storage';

// 创建 axios 实例
const service = axios.create({
  baseURL: process.env.VUE_APP_API_BASE_URL || '/api', // API 基础路径
  timeout: 600000, // 请求超时时间，改为10分钟
  // 移除默认的Content-Type设置，让axios自动根据请求数据设置正确的Content-Type
  responseType: 'json'
});

// 请求拦截器
service.interceptors.request.use(
  config => {
    // 在请求发送之前做一些处理
    
    // 添加 Token
    const token = storage.get('token');
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
      // GET 请求参数处理
      config.params = {
        ...config.params,
        _t: Date.now() // 添加时间戳防止缓存
      };
    }
    
    // 调试信息
    console.log('API请求:', config.method.toUpperCase(), config.url);
    console.log('请求参数:', config.params || config.data);
    console.log('请求头:', config.headers);
    
    return config;
  },
  error => {
    // 请求错误处理
    console.error('请求错误:', error);
    Promise.reject(error);
  }
);

// 响应拦截器
service.interceptors.response.use(
  response => {
    // 简化响应处理：只要HTTP状态码是200，就认为请求成功
    // 直接返回响应数据，由调用方自行处理数据结构
    
    // 调试信息
    console.log('API响应:', response.config.method.toUpperCase(), response.config.url);
    console.log('响应状态:', response.status);
    console.log('响应数据:', response.data);
    
    return response;
  },
  error => {
    // 响应错误处理
    console.error('响应错误:', error);
    
    // 详细错误信息
    if (error.response) {
      console.error('响应错误状态:', error.response.status);
      console.error('响应错误数据:', error.response.data);
      console.error('响应错误头:', error.response.headers);
    } else if (error.request) {
      console.error('请求已发送但没有收到响应:', error.request);
    } else {
      console.error('请求配置错误:', error.message);
    }
    
    // 网络错误提示
    let message = '网络错误，请稍后重试';
    if (error.response) {
      // HTTP 状态码处理
      switch (error.response.status) {
        case 400:
          message = '请求参数错误';
          break;
        case 401:
          message = '未授权，请重新登录';
          // 清除 Token 并跳转到登录页
          storage.remove('token');
          setTimeout(() => {
            window.location.href = '/login';
          }, 1500);
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
    
    // 显示错误消息
    Message({
      message: message,
      type: 'error',
      duration: 5 * 1000
    });
    
    return Promise.reject(error);
  }
);

export default service;
