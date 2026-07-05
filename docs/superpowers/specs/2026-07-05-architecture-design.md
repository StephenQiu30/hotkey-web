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
- **Time-bound（有时限）**：确定技术栈选型以指导后续实现

## 3. 技术栈总览

| 层级 | 选型 | 选用理由 |
|------|------|----------|
| **框架** | Next.js 16 + React 19 + TypeScript 5.x | App Router 文件路由，稳定 SSR/SSR 同构 |
| **UI 组件库** | Ant Design 5 | 企业级组件库，开箱即用，完善的设计体系 |
| **高级组件** | ProLayout | 顶部导航/侧栏布局，Ant Design Pro 风格 |
| **图标** | @ant-design/icons | Ant Design 原生图标库 |
| **HTTP 客户端** | axios | 社区标准，拦截器/请求取消/错误处理开箱即用 |
| **API 客户端生成** | @umijs/openapi | 从 OpenAPI 规范生成 TypeScript 类型与请求函数 |
| **状态管理** | zustand | 极简 React 状态管理 |
| **图表** | recharts | React 原生图表库 |

## 4. 主题色系 — Ant Design 蓝白主题

基于 Ant Design 5 的 ConfigProvider 主题配置：

```typescript
// 使用 Ant Design 默认蓝色主色 #1677FF
// 通过 ConfigProvider theme 配置微调
<ConfigProvider
  locale={zhCN}
  theme={{
    token: {
      colorPrimary: '#1677FF',
      borderRadius: 6,
    },
  }}
>
  <AntdRegistry>
    <App />
  </AntdRegistry>
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
├── next.config.ts              # Next.js 配置（含 API 代理 rewrites）
├── app/                        # Next.js App Router（页面路由）
│   ├── layout.tsx              # Ant Design ConfigProvider + 蓝白主题
│   ├── login/                  # 登录页
│   │   └── page.tsx
│   └── dashboard/              # 创作者工作台子页面
│       ├── layout.tsx          # ProLayout + 认证守卫
│       ├── page.tsx            # 工作台主页
│       ├── topics/page.tsx     # 内容选题
│       ├── favorites/page.tsx  # 收藏关注
│       ├── notifications/page.tsx  # 通知记录
│       └── settings/page.tsx   # 监控管理
├── src/
│   ├── layouts/
│   │   └── MainLayout.tsx      # ProLayout 顶部导航封装
│   ├── stores/
│   │   └── authStore.ts        # zustand 认证状态
│   ├── lib/
│   │   ├── axios.ts            # axios 实例配置
│   │   └── request.ts          # API 生成适配层
│   └── services/
│       └── hotkey/
│           └── hotkey-server/  # @umijs/openapi 生成（禁止手改）
├── public/                     # 静态资源
├── docs/                       # 项目文档
└── tests/                      # 治理/契约测试
```

## 7. 组件规范

### 7.1 布局层级

```
app/dashboard/ (页面组件)
    │ ProLayout + Next.js App Router
    ▼
src/layouts/ (布局组件)
    │ ProLayout 顶部导航 + 认证守卫
    ▼
Ant Design 5 + ProLayout (UI 基础)
```

### 7.2 状态管理

- 认证状态 → zustand store
- 页面数据 → 本地 useState + useEffect
- 路由参数 → Next.js searchParams
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
    │ baseURL: ""（通过 Next.js rewrites 同源代理）
    │ 请求拦截器：注入 token
    │ 响应拦截器：401 → 跳转登录
    ▼
后端 API (hotkey-server)
```

## 9. 项目历程

1. 初始版本为 CreatorWorkbench 单组件（Next.js 16 + shadcn/ui）
2. 重新设计为 Ant Design 5 + ProLayout 顶部导航布局
3. 接入真实后端 API（Next.js rewrites 代理解决 CORS）
4. 全部页面覆盖 loading/error/empty/data 四种状态

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
| 2026-07-05 | StephenQiu | 1.2.0 | 更新为 Next.js 16 App Router，删除所有 shadcn/ui 残余引用 |
