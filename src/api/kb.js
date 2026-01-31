/**
 * 文档知识库 API：知识库 CRUD、入库、检索、列表、删除、重索引
 */
import { request } from '../utils';

const kb = {
  /**
   * 知识库列表（当前用户）
   */
  listBases() {
    return request.get('/api/kb/bases');
  },

  /**
   * 创建知识库
   * @param {string} name
   */
  createBase(name) {
    return request.post('/api/kb/bases', { name: (name || '').trim() || '未命名知识库' });
  },

  /**
   * 重命名知识库
   * @param {string} kb_id
   * @param {string} name
   */
  renameBase(kb_id, name) {
    return request.patch(`/api/kb/bases/${encodeURIComponent(kb_id)}`, { name: (name || '').trim() || '未命名知识库' });
  },

  /**
   * 使用 file 直接上传并入库（multipart）
   * @param {File} file
   * @param {string} [kb_id] 目标知识库 id
   */
  ingestWithFile(file, kb_id = null) {
    const fd = new FormData();
    fd.append('file', file);
    if (kb_id) fd.append('kb_id', kb_id);
    return request.post('/api/kb/documents/ingest', fd);
  },

  /**
   * 使用 file_id 入库（来自 /api/upload 或 /api/hadoop/upload/batch）
   * @param {string} file_id
   * @param {string} [kb_id] 目标知识库 id，不传则入库到「我的知识库」
   */
  ingestWithFileId(file_id, kb_id = null) {
    const fd = new FormData();
    fd.append('file_id', file_id);
    if (kb_id) fd.append('kb_id', kb_id);
    return request.post('/api/kb/documents/ingest', fd);
  },

  /**
   * 语义检索
   * @param {string} q 查询文本
   * @param {number} [k=10]
   * @param {string} [kb_id] 知识库 id
   * @param {string} [source_type] pdf/txt/json
   */
  search(q, k = 10, kb_id = null, source_type = null) {
    const params = { q, k };
    if (kb_id) params.kb_id = kb_id;
    if (source_type) params.source_type = source_type;
    return request.get('/api/kb/documents/search', { params });
  },

  /**
   * 文档列表
   * @param {string} [kb_id] 知识库 id
   * @param {string} [source_type]
   * @param {number} [limit=500]
   */
  list(kb_id = null, source_type = null, limit = 500) {
    const params = { limit };
    if (kb_id) params.kb_id = kb_id;
    if (source_type) params.source_type = source_type;
    return request.get('/api/kb/documents/list', { params });
  },

  /**
   * 按 doc_id 删除文档
   * @param {string} doc_id
   */
  deleteDocument(doc_id) {
    return request.delete(`/api/kb/documents/${encodeURIComponent(doc_id)}`);
  },

  /**
   * 重索引（仅当 doc_id 仍在 backend 的 uploaded_files 时可用）
   * @param {string} doc_id
   * @param {{ user_id?: string, strategy?: string, chunk_size?: number, chunk_overlap?: number }} [opts]
   */
  reindex(doc_id, opts = {}) {
    return request.post('/api/kb/documents/reindex', { doc_id, ...opts });
  }
};

export default kb;
