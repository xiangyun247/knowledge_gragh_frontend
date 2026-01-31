# 前端项目文档

本目录存放测试与对接相关文档，便于后续回归测试与联调参考。

## 文档说明

| 文件 | 说明 |
|------|------|
| [FRONTEND_E2E_TEST_CHECKLIST.md](./FRONTEND_E2E_TEST_CHECKLIST.md) | 前端端到端手工测试清单，按模块逐项检查功能与 API 调用。建议在发布前或联调后执行。 |
| [API_INTEGRATION_CHECK.md](./API_INTEGRATION_CHECK.md) | 前后端 API 集成检查报告，记录已对接的接口、路径与配置。 |

## 使用建议

1. **联调前**：在后端项目运行 `python scripts/check_frontend_backend_api.py` 做接口连通性检查。
2. **手工测试**：按 `FRONTEND_E2E_TEST_CHECKLIST.md` 从「一、环境与启动」起顺序执行，并在清单中勾选结果与备注。
