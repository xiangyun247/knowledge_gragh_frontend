// API 请求入口文件

// 导入各个 API 模块
import chat from './chat';
import graph from './graph';
import history from './history';
import search from './search';
import upload from './upload';

// 导出所有 API 模块
export {
  chat,
  graph,
  history,
  search,
  upload
};

// 默认导出（可选，方便直接导入）
export default {
  chat,
  graph,
  history,
  search,
  upload
};
