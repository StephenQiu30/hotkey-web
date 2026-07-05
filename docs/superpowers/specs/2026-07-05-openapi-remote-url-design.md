---
layer: Design
doc_no: SUP-DESIGN-001
audience:
  - Dev
feature_area: "API 客户端生成"
purpose: "将 @umijs/openapi 的 schemaPath 从本地文件切换为远程 URL，实现从后端 Swagger 端点动态生成 TypeScript API 客户端"
canonical_path: docs/superpowers/specs/
status: draft
version: 0.1.0
owner: "HotKey Web"
inputs:
  - "hotkey-server Swagger JSON (http://localhost:8080/swagger/doc.json)"
outputs:
  - "src/services/hotkey/hotkey-server/*.ts（重新生成）"
triggers:
  - "后端 OpenAPI 契约变更需同步至 Web 端"
downstream: []
---

# OpenAPI 客户端生成：切换为远程 URL 数据源

## 1. 背景

当前 `openapi2ts.config.ts` 的 `schemaPath` 指向本地文件 `../hotkey-server/docs/openapi.json`。这意味着：

1. 必须先手动拉取或确保本地存在后端最新的 `openapi.json` 文件
2. 文件可能过期，与后端实际运行的服务不一致
3. 多开发者环境下，每人需要保证本地 `openapi.json` 是最新版本

后端已在 `http://localhost:8080/swagger/doc.json` 提供标准 Swagger/OpenAPI JSON 端点，`@umijs/openapi` 原生支持 HTTP URL 作为 `schemaPath`。切换到远程 URL 后，每次生成直接拉取最新的接口契约，消除手动同步步骤。

## 2. 目标

- **Specific（具体）**：将 `openapi2ts.config.ts` 的 `schemaPath` 改为 `http://localhost:8080/swagger/doc.json`，其余配置不变
- **Measurable（可衡量）**：`npm run openapi:generate` 执行后，`src/services/hotkey/hotkey-server/` 下文件正确生成，`npx tsc --noEmit` 通过
- **Achievable（可达成）**：仅修改一处配置项，`@umijs/openapi` 官方文档明确支持此用法
- **Relevant（相关）**：直接对应"接口文档动态生成 API 文件"的需求，消除本地文件同步负担
- **Time-bound（有时限）**：单次配置变更，完成后即生效，后续生成自动使用远程源

```gherkin
Given 后端运行在 localhost:8080 且 /swagger/doc.json 可访问
When 执行 npm run openapi:generate
Then 生成 src/services/hotkey/hotkey-server/ 下的 API 客户端文件
And TypeScript 类型检查通过

Given 后端未运行
When 执行 npm run openapi:generate
Then 工具报 fetch 连接错误
And 已有生成的客户端文件不受影响
```

## 3. 非目标

- 不修改 `request.ts` 请求封装库
- 不修改生成文件的输出路径或命名空间
- 不引入多源配置（当前仅一个后端服务）
- 不引入环境变量间接层（YAGNI）
- 不删除或废弃本地 `openapi.json` 回退方案——但不再作为配置依赖

## 4. 核心内容

### 4.1 配置变更

唯一变更文件：`openapi2ts.config.ts`

```typescript
// openapi2ts.config.ts
export default {
  requestImportStatement: "import { request } from '@/lib/request';",
  schemaPath: 'http://localhost:8080/swagger/doc.json',  // 从本地文件改为远程 URL
  serversPath: "./src/services/hotkey",
  projectName: "hotkey-server",
  namespace: "HotKeyAPI",
};
```

说明：
- `schemaPath` 改为完整的 HTTP URL
- 其余配置（`serversPath`、`projectName`、`namespace`、`requestImportStatement`）**零改动**
- `import path from "node:path"` 不再需要，可一并清理
- 这是 `@umijs/openapi` 官方标准用法，参见 [github.com/781574155/openapi2typescript](https://github.com/781574155/openapi2typescript)

### 4.2 数据流

```
hotkey-server（运行在 8080 端口）
    │
    │ HTTP GET /swagger/doc.json
    ▼
@umijs/openapi（生成时调用 fetch 获取）
    │
    │ 解析 OpenAPI 3.0 JSON → TypeScript 类型 + 请求函数
    ▼
src/services/hotkey/hotkey-server/
    ├── typings.d.ts         # 所有 API 类型
    ├── hotspots.ts          # 热点模块
    ├── auth.ts              # 认证模块
    ├── notifications.ts     # 通知模块
    ├── reports.ts           # 报告模块
    ├── analytics.ts         # 分析模块
    ├── health.ts            # 健康检查
    ├── index.ts             # 入口聚合
    └── ...（其他模块）
```

### 4.3 执行方式

命令不变：

```bash
npm run openapi:generate
# 实际上执行的是 openapi2ts 命令
# 读取 openapi2ts.config.ts 配置

# 类型检查验证
npx tsc --noEmit
```

### 4.4 使用场景

| 场景 | 操作 | 说明 |
|------|------|------|
| 日常开发 | 先启动后端，然后 `npm run openapi:generate` | 后端 8080 端口需运行中 |
| 后端接口变更 | 重新生成即可 | 变更自动反映到生成的客户端 |
| CI/CD | 在 workflow 中先确保后端可用 | 或切回本地文件方式 |
| 后端未启动时 | `openapi:generate` 会失败，但已有代码不变 | 不阻塞开发 |

### 4.5 错误处理

| 错误情况 | 表现 | 处理方式 |
|----------|------|----------|
| 后端未启动 | fetch 连接拒绝，工具报错退出 | 启动后端后重试 |
| URL 不可达 | HTTP 404/其他非 JSON 响应 | 检查后端 Swagger 端点 URL |
| 生成代码类型错误 | tsc --noEmit 报类型不匹配 | 检查后端 OpenAPI 规范是否兼容 |
| 生成空文件 | 后端 OpenAPI 无端点定义 | 检查后端路由注册 |

**安全策略**：生成失败时，已有客户端文件不会被删除，因此不会破坏现有功能。

### 4.6 验证清单

- [ ] `curl http://localhost:8080/swagger/doc.json` 返回有效 JSON
- [ ] `npm run openapi:generate` 执行成功，无报错
- [ ] `src/services/hotkey/hotkey-server/` 下文件正确生成
- [ ] `npx tsc --noEmit` 类型检查通过
- [ ] 本地开发服务器 `npm run dev` 正常运行

## 5. 关联文档

### 输入文档
- `openapi2ts.config.ts` — 当前配置文件
- `@umijs/openapi` 官方文档 — [github.com/781574155/openapi2typescript](https://github.com/781574155/openapi2typescript)

### 输出文档
- 本设计文档

### 下游文档
- 后续实现计划（writing-plans）

## 6. 验收门禁

- [x] 文档结构完整
- [x] 目标符合 SMART 原则（已将非目标单独列出）
- [x] 验收标准明确（验证清单 + BDD 场景）
- [x] 风险已识别（错误处理章节）

## 7. 风险与边界

- **依赖后端运行**：生成时要求后端在 8080 端口运行。如 CI 环境中后端不便运行，可保留本地 `openapi.json` 作为降级方案
- **兼容性**：后端 `/swagger/doc.json` 格式必须为 OpenAPI 3.0 或 Swagger 2.0，当前 `@umijs/openapi` 均支持
- **网络**：本地开发无网络问题；CI 中需确保能访问对应后端地址

## 8. 待确认问题

- [x] 无未确认问题，所有前置问题已在 brainstorming 中澄清

## 9. 变更记录

| 日期 | 作者 | 版本 | 变更说明 |
|------|------|------|----------|
| 2026-07-05 | StephenQiu | 0.1.0 | 初始版本 |
