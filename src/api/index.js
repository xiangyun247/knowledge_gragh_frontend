// API 请求入口文件

// 导入各个 API 模块
import * as chat from './chat';
import graph from './graph';
import history from './history';
import search from './search';
import upload from './upload';
import hadoop from './hadoop';
import kb from './kb';
import { request } from '../utils';
import auth from './auth';
import * as multimodal from './multimodal';

// 首页相关 API
const home = {
  /**
   * 首页概览统计：图谱数 / 文档数 / 本周问答 / 最近活动
   */
  overview() {
    return request.get('/api/home/overview');
  }
};

// 导出所有 API 模块
export {
  chat,
  graph,
  history,
  search,
  upload,
  hadoop,
  kb,
  home,
  auth,
  multimodal
};

// 默认导出（可选，方便直接导入）
export default {
  chat,
  graph,
  history,
  search,
  upload,
  hadoop,
  kb,
  home,
  auth,
  multimodal
};
