# OpenAPI 远程 URL 切换实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 `openapi2ts.config.ts` 的 `schemaPath` 从本地文件 `../hotkey-server/docs/openapi.json` 切换为远程 URL `http://localhost:8080/swagger/doc.json`，清理不再需要的 `path` 导入。

**Architecture:** 单文件配置变更。`@umijs/openapi` 的 `schemaPath` 原生支持 HTTP URL，从本地文件切换到远程 URL 后，生成流程和输出结构完全不变。变更内容：1 行 URL 替换 + 1 行无用 import 清理。

**Tech Stack:** TypeScript, `@umijs/openapi` v1.x

## Global Constraints

- `schemaPath` 必须使用完整的 HTTP URL 格式
- 不允许修改 `serversPath`、`projectName`、`namespace`、`requestImportStatement` 等已有配置
- 生成后必须通过 `npx tsc --noEmit` 类型检查
- 不修改请求库 `src/lib/request.ts`
- 不修改生成文件输出路径

---

### Task 1: 修改 openapi2ts.config.ts

**Files:**
- Modify: `openapi2ts.config.ts`（整文件替换）
- Verify: `src/services/hotkey/hotkey-server/` 下已存在的生成文件

**Interfaces:**
- Consumes: 后端 `http://localhost:8080/swagger/doc.json`（需在生成时运行）
- Produces: 更新后的 `src/services/hotkey/hotkey-server/*.ts`（由 openapi2ts 自动生成）

- [ ] **Step 1: 确认后端 Swagger 端点可访问**

```bash
curl -s http://localhost:8080/swagger/doc.json | head -20
```

Expected: 返回有效的 JSON，包含 `openapi: "3.x"` 或 `swagger: "2.x"` 字段。

- [ ] **Step 2: 修改 openapi2ts.config.ts**

将当前配置：

```typescript
import path from "node:path";

const serverSchemaPath = "../hotkey-server/docs/openapi.json";

export default {
  requestImportStatement: "import { request } from '@/lib/request';",
  schemaPath: path.resolve(__dirname, serverSchemaPath),
  serversPath: "./src/services/hotkey",
  projectName: "hotkey-server",
  namespace: "HotKeyAPI",
};
```

改为：

```typescript
export default {
  requestImportStatement: "import { request } from '@/lib/request';",
  schemaPath: 'http://localhost:8080/swagger/doc.json',
  serversPath: "./src/services/hotkey",
  projectName: "hotkey-server",
  namespace: "HotKeyAPI",
};
```

变更说明：
- `schemaPath` 从 `path.resolve(__dirname, "../hotkey-server/docs/openapi.json")` 改为 `'http://localhost:8080/swagger/doc.json'`
- 删除 `import path from "node:path";`（不再需要）
- 删除 `const serverSchemaPath = "../hotkey-server/docs/openapi.json";`（不再需要）

- [ ] **Step 3: 重新生成 API 客户端**

```bash
npm run openapi:generate
```

Expected: 命令执行成功，无报错。`src/services/hotkey/hotkey-server/` 下文件被重新生成。

- [ ] **Step 4: TypeScript 类型检查**

```bash
npx tsc --noEmit
```

Expected: 无类型错误，退出码 0。

- [ ] **Step 5: 确认开发服务器正常启动**

```bash
npm run dev
```

在浏览器访问 `http://localhost:3000`，确认页面正常渲染无报错。按 Ctrl+C 停止。

- [ ] **Step 6: 提交**

```bash
git add openapi2ts.config.ts
git diff --cached --stat
git commit -m "chore: 切换 openapi schemaPath 为远程 URL

- schemaPath 从本地 openapi.json 改为 http://localhost:8080/swagger/doc.json
- 清理不再需要的 path 导入和 serverSchemaPath 变量
- openapi2ts.config.ts 遵循 @umijs/openapi 官方远程 URL 用法

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

## 验证清单

- [ ] `curl http://localhost:8080/swagger/doc.json` 返回有效 JSON
- [ ] `npm run openapi:generate` 执行成功
- [ ] `npx tsc --noEmit` 类型检查通过
- [ ] `npm run dev` 开发服务器正常
- [ ] 配置文件中无残留的 `path` 导入或 `serverSchemaPath` 变量
