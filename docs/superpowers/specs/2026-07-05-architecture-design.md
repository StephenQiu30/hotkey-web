---
layer: Design
doc_no: SUP-DESIGN-002
audience:
  - Dev
  - PM
  - QA
feature_area: "架构总览"
purpose: "明确 hotkey-web 项目的整体架构设计、技术选型、目录结构与设计原则"
canonical_path: docs/superpowers/specs/
status: draft
version: 1.0.0
owner: "HotKey Web"
inputs:
  - "hotkey-server OpenAPI 规范"
  - "CLAUDE.md / CLAUDE.local.md 项目规范"
outputs:
  - "本文档作为后续所有设计文档的引用基线"
downstream:
  - "前端重新设计（/frontend-design:frontend-design）"
  - "组件拆分与实现计划"
---

# HotKey Web 架构设计

## 1. 背景

HotKey 是面向内容创作者的热点监控与 AI 选题助手。`hotkey-web` 是其 Web 创作者工作台，已有 MVP 原型（CreatorWorkbench 单组件）。随着项目演进，需将隐性技术决策正式化为架构文档，明确技术选型、目录职责、组件规范和未来重构方向，为 `/frontend-design:frontend-design` 的全面重新设计提供基线。

## 2. 目标

- **Specific（具体）**：明确技术栈选型及理由、目录结构职责、组件设计原则、数据流模式、测试策略
- **Measurable（可衡量）**：本文档通过后成为团队共识基准，后续 PR 须与之对齐
- **Achievable（可达成）**：所有选型均为已验证的开源项目，无定制方案
- **Relevant（相关）**：直接指导前端重构方向，消除设计不确定性
- **Time-bound（有时限）**：与前端重新设计同步，文档先行

## 3. 技术栈总览

| 层级 | 选型 | 版本 | 选用理由 |
|------|------|------|----------|
| **构建工具** | Vite | ^6 | 极速 HMR，原生 ESM 支持，零配置启动 |
| **UI 框架** | React | ^19 | 组件化开发，生态最成熟 |
| **语言** | TypeScript | ~5.9 | 静态类型安全，配合 OpenAPI 生成类型 |
| **路由** | React Router | ^7 | SPA 声明式路由，Vite 生态兼容，社区标准 |
| **HTTP 客户端** | axios | ^1 | 社区标准 HTTP 库，拦截器/请求取消/错误处理开箱即用 |
| **样式** | Tailwind CSS 4 | ^4 | 原子化 CSS，零运行时，与 shadcn/ui 原生配合 |
| **UI 组件** | shadcn/ui | latest | 基于 Radix UI 原语，可定制、非锁定的组件库 |
| **UI 原语** | Radix UI | latest | 无样式 headless 组件，无障碍内置 |
| **图标** | Lucide React | ^0.5 | 轻量、树摇优化、shadcn/ui 默认搭配 |
| **API 客户端生成** | @umijs/openapi | ^1 | 从 OpenAPI 规范生成 TypeScript 类型与请求函数 |
| **工具库** | cva + clsx + tailwind-merge | — | Tailwind 类名合并与变体管理 |

### 关键约束

- **绝不手写后端 API 类型**——所有 API 类型通过 `@umijs/openapi` 从后端 OpenAPI 规范生成
- **所有选型必须为成熟开源项目**——不自行封装重复轮子
- **Shadcn/ui 组件代码可自由修改**——代码存入 `src/components/ui/`，非 node_modules 锁定的外部包

## 4. 主题色系 — Radix UI 蓝白主题

以蓝色为主色调、白色为背景色，通过 shadcn/ui 的 CSS 变量体系实现：

```css
/* src/index.css */
@layer base {
  :root {
    /* 主色 — 蓝色系 */
    --primary: 210 100% 50%;
    --primary-foreground: 0 0% 100%;

    /* 背景 — 白色系 */
    --background: 0 0% 100%;
    --foreground: 210 10% 20%;

    /* 卡片与边框 */
    --card: 0 0% 100%;
    --card-foreground: 210 10% 20%;
    --border: 210 20% 90%;

    /* 次要与强调 */
    --secondary: 210 40% 96%;
    --secondary-foreground: 210 40% 30%;
    --accent: 210 40% 96%;
    --accent-foreground: 210 40% 30%;

    /* 状态色 */
    --muted: 210 20% 94%;
    --muted-foreground: 210 10% 50%;
    --destructive: 0 80% 55%;
    --destructive-foreground: 0 0% 100%;

    /* 环形与输入 */
    --ring: 210 100% 50%;
    --input: 210 20% 88%;
    --radius: 0.5rem;
  }
}
```

所有 shadcn/ui 和 Radix UI 组件自动继承这些色彩变量。

## 5. 目录结构与职责

```
hotkey-web/
├── index.html                  # Vite 入口 HTML
├── vite.config.ts              # Vite 配置（React 插件、devServer 代理、resolve alias）
├── tsconfig.json               # TypeScript 配置
├── tailwind.config.ts          # Tailwind CSS 4 配置
├── openapi2ts.config.ts        # @umijs/openapi 生成配置
├── package.json
│
├── public/                     # 静态资源（favicon, images...）
│
├── src/
│   ├── main.tsx                # React 应用入口：createRoot + RouterProvider
│   ├── App.tsx                 # 路由定义（React Router 路由表 / layout 配置）
│   ├── index.css               # Tailwind 指令 + CSS 变量主题定义
│   │
│   ├── routes/                 # 页面组件（每个文件对应一个路由页面）
│   │   ├── login.tsx           # 登录页
│   │   ├── workbench.tsx       # 创作者工作台主页
│   │   └── ...                 # 按功能扩展
│   │
│   ├── components/
│   │   ├── ui/                 # shadcn/ui 生成的基础组件（button.tsx, card.tsx, input.tsx...）
│   │   └── shared/             # 跨页面复用的业务组件
│   │
│   ├── lib/
│   │   ├── utils.ts            # cn() 等工具函数
│   │   └── axios.ts            # axios 实例（baseURL、拦截器、错误处理）
│   │
│   ├── services/
│   │   └── hotkey/
│   │       └── hotkey-server/  # @umijs/openapi 生成（禁止手改）
│   │
│   └── types/                  # 前端特有类型（非后端 API 类型）
│
├── tests/                      # Python 治理/契约测试
│   └── test_*.py
│
├── docs/                       # 项目文档
│   └── ...
│
└── .env.example                # 环境变量模板
```

### 目录职责原则

| 目录 | 可以放什么 | 不可以放什么 |
|------|-----------|-------------|
| `routes/` | 页面级组件、数据获取、状态编排 | UI 渲染细节、shadcn/ui 组件 |
| `components/shared/` | 跨页面复用业务组件 | 页面特化逻辑、API 直接调用 |
| `components/ui/` | shadcn/ui 原语、通用 UI 原子 | 业务逻辑 |
| `lib/` | 工具函数、基础设施封装 | 组件代码、API 调用 |
| `services/` | 自动生成的 API 客户端 | 手动修改 |
| `types/` | 前端本地枚举、常量、前端特有类型 | 后端 API 对应类型（应去 services/） |

## 6. 组件设计原则

### 6.1 层级结构与依赖方向

```
routes/ (页面组件)
    │ 数据获取 · 状态组合 · 布局编排
    ▼
components/shared/ (业务组件)
    │ 跨页面复用 · 无 API 直接调用
    ▼
components/ui/ (UI 原语)
    │ shadcn/ui · Radix UI · 通用原子组件
```

- **单向依赖**：页面 → shared → ui，禁止反向引用
- **每层只依赖其下方的层**，不越级依赖

### 6.2 组件粒度

- 单组件 200–500 行，超限按职责拆分
- 一个文件默认只导出一个主要组件
- 内联辅助组件可与主组件同文件（如 `Metric`、`SourceBar`）
- `components/ui/` 保持与 shadcn/ui 输出一致，不额外封装

### 6.3 Props 约定

- Props 类型定义：`interface {ComponentName}Props`
- 布尔 prop：`is`/`has`/`show` 前缀（`isLoading`、`hasError`、`showDetails`）
- 回调：`on` 前缀（`onSave`、`onDelete`）
- 根元素类名合并：使用 `cn(className)` 模式

### 6.4 状态管理

- MVP 阶段无全局状态库，使用 React 本地状态 + Context
- API 数据状态在页面级管理（loading / error / empty / data）
- URL search params 作为次要状态载体（筛选、分页）
- 表单完全受控

### 6.5 禁止事项

- 禁止 `document.querySelector` 等直接 DOM 操作
- 禁止 `ref.current.style`
- 禁止 `innerHTML`

## 7. 数据流架构

### 7.1 请求链路

```
页面组件 (routes/)
    │ 调用生成的 API 函数（如 apiClient.get(...)）
    ▼
services/hotkey/hotkey-server/*.ts
    │ @umijs/openapi 生成，内部调用 axios 实例
    ▼
lib/axios.ts — axios 实例
    │ baseURL: import.meta.env.VITE_API_BASE_URL (default http://localhost:8000)
    │ 请求拦截器：注入 Authorization header
    │ 响应拦截器：统一错误处理
    ▼
后端 API (hotkey-server)
```

### 7.2 axios 实例配置

```typescript
// src/lib/axios.ts
import axios, { AxiosError } from "axios";
import { HotKeyAPIError } from "./errors";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000",
  timeout: 15000,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ error?: string; code?: string }>) => {
    const message = error.response?.data?.error ?? error.message;
    const code = error.response?.data?.code;
    return Promise.reject(
      new HotKeyAPIError(message, error.response?.status ?? 0, code)
    );
  },
);

export default apiClient;
```

### 7.3 @umijs/openapi 对接 axios

```typescript
// openapi2ts.config.ts
export default {
  requestImportStatement: "import apiClient from '@/lib/axios';",
  schemaPath: 'http://localhost:8080/swagger/doc.json',
  serversPath: "./src/services/hotkey",
  projectName: "hotkey-server",
  namespace: "HotKeyAPI",
};
```

生成的 API 函数调用 `apiClient` 而非自定义 request。

### 7.4 页面数据获取模式

每个页面组件统一覆盖四种状态：

```typescript
function ExamplePage() {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData()
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Skeleton />;
  if (error) return <ErrorState message={error} onRetry={retry} />;
  if (!data?.length) return <EmptyState />;
  return <DataView data={data} />;
}
```

### 7.5 错误处理层次

| 层 | 处理方式 | 用户可见 |
|----|----------|----------|
| axios 响应拦截器 | 统一转为 `HotKeyAPIError` | 否 |
| 页面级 `catch` | 设置 error 状态，展示 ErrorState | 是 |
| 全局 Error Boundary | 未捕获异常兜底 | 是 |

### 7.6 请求取消

使用 axios 的 `CancelToken` 或 `AbortController`：

```typescript
useEffect(() => {
  const controller = new AbortController();
  fetchData({ signal: controller.signal }).then(...);
  return () => controller.abort();
}, []);
```

## 8. 测试策略

### 8.1 测试层次

| 层次 | 工具 | 运行命令 | 覆盖范围 |
|------|------|----------|----------|
| **治理/契约** | Python unittest | `npm run test` | OpenAPI 契约、仓库规范基线 |
| **单元测试** | Vitest + React Testing Library | `npm run test:unit` | 组件渲染、交互、状态展示 |
| **类型检查** | tsc --noEmit | `npm run typecheck` | 编译时类型安全 |

### 8.2 组件测试约定

每个数据展示组件覆盖：

- **Loading 态** — 渲染骨架屏或加载指示器
- **Error 态** — 渲染错误提示和重试按钮
- **Empty 态** — 渲染"暂无数据"提示
- **Data 态** — 正确渲染数据内容

## 9. 迁移路径（从当前到目标架构）

当前 MVP 是基于 Next.js 16 的 CreatorWorkbench 单组件。迁移至 Vite + React Router SPA 的分步路径：

### 阶段 1：脚手架搭建（前置条件）
- 使用 `create-vite` 初始化项目框架
- 安装 React Router v7、axios、Tailwind CSS 4、shadcn/ui
- 配置 `openapi2ts.config.ts`（axios 实例对接）
- 配置 `lib/axios.ts` 实例、`lib/errors.ts`
- 搭建蓝白 CSS 变量主题

### 阶段 2：页面路由搭建
- 定义 `main.tsx` + `App.tsx` 路由表
- 实现 `routes/login.tsx`（登录页）
- 实现 `routes/workbench.tsx`（工作台主页）

### 阶段 3：组件迁移
- 从 CreatorWorkbench.tsx 提取业务组件到 `components/shared/`
- 按职责拆分至 `components/{ui,shared}/`
- 替换自定义 fetch 请求为生成的 API 函数

### 阶段 4：测试与治理
- 配置 Vitest + React Testing Library
- 编写页面级状态覆盖测试
- 恢复治理测试通过

## 10. 非目标

- 不引入 Redux / Zustand 等全局状态库
- 不引入 GraphQL
- 不引入 SSR/SSG（Vite SPA 即可）
- 不引入 E2E 测试（MVF 阶段不做）
- 不自行封装 HTTP 请求库
- 不保留 Next.js App Router 结构和配置

## 11. 关联文档

### 输入文档
- `CLAUDE.md` / `CLAUDE.local.md` — 项目规范
- `docs/prd/001-web工作台完整配置与查看.md` — PRD
- `openapi2ts.config.ts` — API 生成配置

### 输出文档
- 本文档作为后续设计/实现引用的架构基线

### 下游
- 前端重新设计（`/frontend-design:frontend-design`）
- 组件拆分实现计划

## 12. 验收门禁

- [x] 所有技术选型明确版本和选用理由
- [x] 目录结构边界清晰
- [x] 组件依赖方向明确
- [x] 数据流链路完整（请求 → 错误 → 展示）
- [x] 测试层次和覆盖范围已定义
- [x] 迁移路径分阶段可执行
- [x] 无"TBD/TODO"等占位符

## 13. 待确认问题

- [ ] 前端重新设计阶段，各页面组件方案的详细确认（由 `/frontend-design:frontend-design` 处理）

## 14. 变更记录

| 日期 | 作者 | 版本 | 变更说明 |
|------|------|------|----------|
| 2026-07-05 | StephenQiu | 1.0.0 | 初始版本 |
