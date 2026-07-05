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
status: approved
version: 1.1.0
owner: "HotKey Web"
inputs:
  - "hotkey-server OpenAPI 规范"
  - "CLAUDE.md / CLAUDE.local.md 项目规范"
outputs:
  - "本文档作为后续所有设计文档的引用基线"
downstream:
  - "前端重新设计与实现"
---

# HotKey Web 架构设计

## 1. 背景

HotKey 是面向内容创作者的热点监控与 AI 选题助手。`hotkey-web` 是其 Web 创作者工作台，已有 MVP 原型（CreatorWorkbench 单组件，基于 Next.js 16）。现需全面重构为 Vite + React SPA，并采用 Ant Design + ProComponents 作为 UI 组件库。

## 2. 目标

- **Specific（具体）**：明确技术栈选型及理由、目录结构职责、布局规范
- **Measurable（可衡量）**：本文档通过后成为团队共识基准
- **Achievable（可达成）**：所有选型均为成熟开源项目
- **Relevant（相关）**：直接指导前端重构实现
- **Time-bound（有时限）**：Vite SPA + Ant Design 替换 Next.js + shadcn/ui

## 3. 技术栈总览

| 层级 | 选型 | 选用理由 |
|------|------|----------|
| **构建工具** | Vite 6 | 极速 HMR，原生 ESM，构建时零配置 |
| **UI 框架** | React 19 + TypeScript 5.x | 类型安全，生态成熟 |
| **路由** | React Router DOM v7 | SPA 声明式路由，顶部导航无需文件路由 |
| **UI 组件库** | Ant Design 5 | 企业级组件库，开箱即用，完善的设计体系 |
| **高级组件** | ProComponents（ProLayout, ProTable） | 快速构建中后台 CRUD 与布局 |
| **图标** | @ant-design/icons | Ant Design 原生图标库 |
| **HTTP 客户端** | axios | 社区标准，拦截器/请求取消/错误处理开箱即用 |
| **API 客户端生成** | @umijs/openapi | 从 OpenAPI 规范生成 TypeScript 类型与请求函数 |
| **状态管理** | zustand | 极简 React 状态管理 |
| **表单** | react-hook-form + zod | 类型安全表单验证 |
| **通知** | sonner | 轻量 Toast |
| **图表** | recharts | React 原生图表库，ProComponents 推荐搭配 |

## 4. 主题色系 — Ant Design 蓝白主题

基于 Ant Design 5 的 ConfigProvider 主题配置：

```typescript
// 使用 Ant Design 默认蓝色主色 #1677FF
// 通过 ConfigProvider theme 配置微调
<ConfigProvider
  theme={{
    token: {
      colorPrimary: '#1677FF',
      borderRadius: 6,
    },
  }}
>
  <App />
</ConfigProvider>
```

保持 Ant Design 5 的默认蓝白色系，不做大幅定制，保证与 Ant Design 生态（ProComponents）原生兼容。

## 5. 布局方案 — 顶部导航（Ant Design Pro 风格）

```
┌───────────────────────────────────────────────────┐
│  Logo  HotKey   导航1  导航2  导航3   用户 | 设置  │  ← ProLayout 顶部导航栏
├───────────────────────────────────────────────────┤
│                                                   │
│                   页面内容                         │
│                  Content Area                      │
│                                                   │
│                                                   │
└───────────────────────────────────────────────────┘
```

- 使用 `ProLayout` 的 top-menu 模式
- 顶部导航栏左侧：Logo + 项目名 + 主导航项
- 顶部导航栏右侧：用户头像/下拉菜单、设置入口
- 内容区域：根据路由切换显示不同页面

## 6. 目录结构与职责

```
hotkey-web/
├── index.html                  # Vite 入口 HTML
├── vite.config.ts              # Vite 配置
├── tsconfig.json               # TypeScript 配置
├── package.json
│
├── public/                     # 静态资源
│
├── src/
│   ├── main.tsx                # React 应用入口
│   ├── App.tsx                 # 路由定义 + ConfigProvider + ProLayout
│   ├── index.css               # 全局样式
│   │
│   ├── pages/                  # 页面组件
│   │   ├── Login/
│   │   │   └── index.tsx       # 登录页
│   │   ├── Workbench/
│   │   │   └── index.tsx       # 创作者工作台
│   │   └── Settings/
│   │       └── index.tsx       # 设置页
│   │
│   ├── components/             # 业务组件
│   │   ├── MetricCard/         # 指标卡片
│   │   ├── HotspotList/        # 热点列表
│   │   ├── TrendChart/         # 趋势图
│   │   ├── SourceBar/          # 来源分布条
│   │   └── NotificationList/   # 通知列表
│   │
│   ├── layouts/
│   │   └── MainLayout/         # 主布局（ProLayout 封装）
│   │       └── index.tsx
│   │
│   ├── stores/
│   │   └── authStore.ts        # zustand 认证状态
│   │
│   ├── lib/
│   │   ├── axios.ts            # axios 实例配置
│   │   └── utils.ts            # 工具函数
│   │
│   ├── services/
│   │   └── hotkey/
│   │       └── hotkey-server/  # @umijs/openapi 生成（禁止手改）
│   │
│   └── types/                  # 手写前端类型
│
├── tests/                      # Python 治理/契约测试
│
└── docs/                       # 项目文档
```

## 7. 组件规范

### 7.1 布局层级

```
pages/ (页面组件)
    │ ProLayout + Router 路由展示
    ▼
components/ (业务组件)
    │ 独立功能模块，可复用
    ▼
Ant Design 5 + ProComponents (UI 基础)
```

### 7.2 状态管理

- 认证状态 → zustand store
- 页面数据 → 本地 useState + useEffect
- 路由参数 → React Router search params
- 无需全局状态库（zustand 仅用于认证等少量跨组件状态）

### 7.3 数据获取模式

每个页面覆盖四种状态：

```typescript
function Page() {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData()
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spin />;
  if (error) return <Result status="error" title={error} />;
  if (!data.length) return <Empty />;
  return <DataView data={data} />;
}
```

## 8. 数据流架构

```
页面组件
    │ 调用 axios 或生成的 API 函数
    ▼
lib/axios.ts — axios 实例
    │ baseURL: import.meta.env.VITE_API_BASE_URL
    │ 请求拦截器：注入 token
    │ 响应拦截器：401 → 跳转登录
    ▼
后端 API (hotkey-server)
```

## 9. 迁移路径

1. **脚手架**：初始化 Vite 项目，安装所有依赖
2. **布局**：实现 ProLayout 顶部导航布局
3. **路由**：定义 React Router 路由表
4. **登录页**：基于 Ant Design 组件实现
5. **工作台**：迁移并重构 CreatorWorkbench 各模块
6. **API 层**：配置 axios + openapi2ts
7. **测试**：回归治理测试

## 10. 非目标

- 不引入 @umijs/preset-openapi 等 Umi 框架依赖
- 不保留 Next.js App Router 结构和配置
- 不做 SSR/SSG
- 不使用 shadcn/ui / Radix UI / Lucide

## 11. 关联文档

### 输入文档
- `CLAUDE.md` / `CLAUDE.local.md`
- `docs/prd/001-web工作台完整配置与查看.md`

### 输出文档
- 本文档

## 12. 变更记录

| 日期 | 作者 | 版本 | 变更说明 |
|------|------|------|----------|
| 2026-07-05 | StephenQiu | 1.0.0 | 初始版本（shadcn/ui + React Router v7） |
| 2026-07-05 | StephenQiu | 1.1.0 | 切换为 Ant Design + ProComponents，顶部导航布局 |
