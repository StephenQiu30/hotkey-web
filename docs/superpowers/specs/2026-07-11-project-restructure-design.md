# HotKey Web 项目结构整改设计

> 编写日期：2026-07-11
> 状态：设计完成，待实施

---

## 1. 背景

HotKey Web 项目存在多项项目结构问题：app/ 与 src/ 目录体系混乱、根页面使用 useEffect hack 跳转、根布局全量 Client Component 失去 SSR 优势、缺少 components/ 目录、业务 layout 耦合度过高等。

本次整改旨在**统一为 src/app/ 标准 Next.js 模式**，同时重建 Layout 架构、新增品牌欢迎页、补齐缺失的基础设施。

## 2. 整改目标

1. 统一项目结构为完整的 `src/` 模式
2. 使用通用化 BasicLayout 替代耦合的 MainLayout
3. 根路由改为品牌欢迎页（简约 SaaS 风格）
4. Server/Client Component 正确分离
5. 新增 components/ 目录并合理组织
6. 权限逻辑与布局逻辑解耦

## 3. 目标目录结构

```
hotkey-web/
├── src/                         ← 全部源码
│   ├── app/                     ← Next.js App Router
│   │   ├── globals.css          ← 全局样式
│   │   ├── icon.svg             ← 网站图标
│   │   ├── layout.tsx           ← Server Component 根布局
│   │   ├── page.tsx             ← 品牌欢迎页
│   │   ├── login/               ← 登录页
│   │   │   └── page.tsx
│   │   └── dashboard/           ← 创作者工作台
│   │       ├── layout.tsx       ← AuthGuard + BasicLayout
│   │       ├── page.tsx         ← 热点榜单
│   │       ├── menuConfig.ts    ← 导航菜单配置
│   │       ├── favorites/
│   │       ├── notifications/
│   │       ├── profile/
│   │       ├── settings/
│   │       └── topics/
│   ├── components/              ← 业务组件（新增）
│   │   ├── AppProvider.tsx      ← ConfigProvider + AntApp（Client）
│   │   ├── AuthGuard.tsx        ← 权限守卫（Client）
│   │   ├── WelcomeHeader.tsx    ← 欢迎页导航
│   │   ├── WelcomeHero.tsx      ← 欢迎页 Hero 区
│   │   ├── WelcomeFeatures.tsx  ← 欢迎页功能卡片
│   │   ├── WelcomeCTA.tsx       ← 欢迎页号召行动
│   │   └── WelcomeFooter.tsx    ← 欢迎页页脚
│   ├── layouts/
│   │   └── BasicLayout.tsx      ← 通用 ProLayout 壳（重构）
│   ├── lib/
│   │   ├── axios.ts             ← axios 实例
│   │   └── request.ts           ← API 适配层
│   ├── stores/
│   │   └── authStore.ts         ← zustand 认证状态
│   └── services/
│       ├── auth.ts              ← 自动生成 API 文件
│       ├── monitors.ts
│       ├── ...
│       └── typings.d.ts
├── public/                      ← 静态资源（新增）
├── docs/
│   └── superpowers/specs/
├── openapi2ts.config.ts
├── next.config.ts
├── tsconfig.json
└── package.json
```

## 4. Layout 架构

### 4.1 原始方案（当前）

```
app/layout.tsx (Client: AntdConfig + ConfigProvider)
  └─ app/dashboard/layout.tsx → src/layouts/MainLayout.tsx (耦合：导航 + 权限 + 用户菜单)
       └─ 页面内容
```

### 4.2 目标方案

```
src/app/layout.tsx (Server: html + body + AntdRegistry)
  └─ src/components/AppProvider.tsx (Client: ConfigProvider + AntApp)
       ├─ src/app/page.tsx             ← 欢迎页 (Server)
       ├─ src/app/login/page.tsx       ← 登录页 (Client)
       └─ src/app/dashboard/layout.tsx  ← (AuthGuard + BasicLayout)
            └─ src/layouts/BasicLayout.tsx  (纯 UI 布局)
                 └─ 页面内容
```

### 4.3 BasicLayout 接口

```tsx
interface BasicLayoutProps {
  children: React.ReactNode;
  menuItems: { path: string; name: string; icon: React.ReactNode }[];
  headerRight?: React.ReactNode;
  logo?: React.ReactNode;
  title?: string;
  onLogoClick?: () => void;
}
```

- 不耦合任何业务逻辑
- 菜单数据从 props 传入
- 路由导航通过 Link 组件实现
- 用户头像/菜单通过 headerRight 插槽注入

## 5. 根布局 Server/Client 分离

```tsx
// src/app/layout.tsx — Server Component
export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN">
      <body>
        <AntdRegistry>{children}</AntdRegistry>
      </body>
    </html>
  );
}

// src/components/AppProvider.tsx — Client Component
"use client";
export default function AppProvider({ children }) {
  return (
    <ConfigProvider locale={zhCN} theme={{ token: { colorPrimary: "#1677FF" } }}>
      <AntApp>{children}</AntApp>
    </ConfigProvider>
  );
}
```

- `html`/`body` 标签保持在 Server Component 中
- `ConfigProvider` 提取为 `AppProvider`（Client Component），放在根 layout 中的 AntdRegistry 内部
- 这样所有子页面（欢迎页、登录页、dashboard）自动获得 Ant Design 主题，同时 html/body 仍是 Server 渲染
- AppProvider 只包裹一次，不会因为路由切换而重新挂载

## 6. 品牌欢迎页（简约 SaaS 风格）

### 页面布局

```
页面结构（纯文本流，无 "use client"）：
┌──────────────────────────────────────────┐
│  [HotKey Logo]     登录  开始使用 →      │ ← WelcomeHeader
├──────────────────────────────────────────┤
│                                          │
│      热点监控 · 内容创作 · 数据洞察       │ ← WelcomeHero
│  一站式热点追踪平台，助力内容创作者        │
│  把握流量脉搏，做出爆款内容               │
│                                          │
│    [立即开始]  [了解更多 →]               │
│                                          │
├──────────────────────────────────────────┤
│   热点趋势追踪  │  智能内容选题  │         │ ← WelcomeFeatures
│   ───────────  │  ───────────  │         │ (3-4 张卡片)
│   实时追踪多渠道 │  AI 分析热点  │         │
│   热点趋势变化  │  推荐创作方向  │         │
│                                          │
├──────────────────────────────────────────┤
│      准备好提升你的创作效率了吗？          │ ← WelcomeCTA
│         [免费开始使用 →]                  │
├──────────────────────────────────────────┤
│  © 2026 HotKey  隐私政策  服务条款        │ ← WelcomeFooter
└──────────────────────────────────────────┘
```

### 实现要点

- 全部为 Server Component（无 `"use client"`）
- 使用 Ant Design 的 `Button`、`Card`、`Row/Col`、`Typography` 等 Server-safe 组件
- CSS 动画（淡入、上移）通过 `globals.css` 的 `@keyframes` 实现
- 响应式：移动端卡片竖排，桌面端横排
- 渐变背景通过 CSS `background: linear-gradient()` 实现

## 7. 组件解耦

### AuthGuard（新增）

从 MainLayout 提取出的独立权限守卫：

```tsx
// src/components/AuthGuard.tsx
"use client";
export default function AuthGuard({ children }) {
  const { isAuthenticated, isLoading, hydrate } = useAuthStore();
  useEffect(() => { hydrate(); }, []);
  if (isLoading) return null;
  if (!isAuthenticated) { window.location.href = "/login"; return null; }
  return <>{children}</>;
}
```

### 菜单配置（新增）

```tsx
// src/app/dashboard/menuConfig.ts
import { FireOutlined, FileTextOutlined, ... } from "@ant-design/icons";

export const dashboardMenuItems = [
  { path: "/dashboard", name: "热点榜单", icon: <FireOutlined /> },
  { path: "/dashboard/topics", name: "内容选题", icon: <FileTextOutlined /> },
  // ...
];
```

## 8. 实施计划

### Step 1：基础设施

1. 创建 `src/components/AppProvider.tsx`
2. 创建 `src/components/AuthGuard.tsx`
3. 创建 `src/app/dashboard/menuConfig.ts`
4. 重写 `src/layouts/BasicLayout.tsx`
5. 创建 `public/` 目录（加一个 `.gitkeep`）
6. 创建欢迎页组件文件（`WelcomeHeader`、`WelcomeHero`、`WelcomeFeatures`、`WelcomeCTA`、`WelcomeFooter`）

### Step 2：搬移文件

1. `mv app/* src/app/` — 全量搬移
2. 检查搬移后页面中的相对路径引用，统一改为 `@/` 绝对路径
3. 删除根目录 `app/`（`rm -rf app/`）
4. 简化 `src/app/layout.tsx` 为纯 Server Component
5. `src/app/globals.css` — 添加欢迎页样式
6. 更新 `tsconfig.json` include 路径（`.next/types/**/*.ts` 加上 `src/` 前缀）

### Step 3：验证

1. `npx tsc --noEmit` — 类型检查通过
2. `npm run dev` — 启动确认
3. 验证欢迎页渲染、登录页、dashboard 各子页面

## 9. 文件搬移对照表

| 当前路径 | 目标路径 | 操作 |
|---------|---------|------|
| `app/layout.tsx` | `src/app/layout.tsx` | 搬移 + 精简 |
| `app/page.tsx` | — | 删除，替换为欢迎页 |
| `app/globals.css` | `src/app/globals.css` | 搬移 + 追加样式 |
| `app/icon.svg` | `src/app/icon.svg` | 搬移 |
| `app/login/page.tsx` | `src/app/login/page.tsx` | 搬移 |
| `app/dashboard/*` | `src/app/dashboard/*` | 全量搬移 |
| `src/layouts/MainLayout.tsx` | `src/layouts/BasicLayout.tsx` | 重写 |
| — | `src/components/AppProvider.tsx` | 新增 |
| — | `src/components/AuthGuard.tsx` | 新增 |
| — | `src/components/Welcome*.tsx` | 新增 |
| — | `src/app/dashboard/menuConfig.ts` | 新增 |
| — | `public/` | 新增目录 |
| `app/` | — | 删除根目录 |

## 10. 不回退事项

- 欢迎页不做登录前重定向，/ 就是品牌首页
- BasicLayout 保持通用，不浸入业务逻辑
- 不引入 Tailwind 或其他 CSS 框架（仅 Ant Design + CSS）
- 不引入额外 UI 设计系统（仅 Ant Design）
