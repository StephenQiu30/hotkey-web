# HotKey Web 项目结构整改实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 统一项目结构为 `src/app/` 标准模式，重构 Layout 架构为通用 BasicLayout，新增品牌欢迎页，实现 Server/Client Component 正确分离。

**Architecture:** 将 `app/` 目录整体移入 `src/app/`，提取 ConfigProvider 为独立 AppProvider 组件（Client），在根 layout 中保持 html/body 为 Server Component。将耦合的 MainLayout 重写为 props 驱动的通用 BasicLayout。新增 AuthGuard 组件处理权限逻辑。新增品牌欢迎页（纯 Server Component）。

**Tech Stack:** Next.js 16 + React 19 + Ant Design 5 + ProLayout + TypeScript

---

### Task 1: 基础设施 — 创建公共组件和目录

**Files:**
- Create: `src/components/AppProvider.tsx`
- Create: `src/components/AuthGuard.tsx`
- Create: `src/app/dashboard/menuConfig.ts`
- Create: `public/.gitkeep`

- [ ] **Step 1: 创建 AppProvider.tsx**

```tsx
// src/components/AppProvider.tsx
"use client";

import { ConfigProvider, App as AntApp } from "antd";
import zhCN from "antd/locale/zh_CN";

export default function AppProvider({ children }: { children: React.ReactNode }) {
  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        token: {
          colorPrimary: "#1677FF",
          borderRadius: 6,
        },
      }}
    >
      <AntApp>{children}</AntApp>
    </ConfigProvider>
  );
}
```

- [ ] **Step 2: 创建 AuthGuard.tsx**

```tsx
// src/components/AuthGuard.tsx
"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/stores/authStore";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, hydrate } = useAuthStore();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated) {
    window.location.href = "/login";
    return null;
  }

  return <>{children}</>;
}
```

- [ ] **Step 3: 创建 menuConfig.ts**

```tsx
// src/app/dashboard/menuConfig.ts
import {
  FireOutlined,
  FileTextOutlined,
  StarOutlined,
  BellOutlined,
  SettingOutlined,
} from "@ant-design/icons";

export interface MenuItem {
  path: string;
  name: string;
  icon: React.ReactNode;
}

export const dashboardMenuItems: MenuItem[] = [
  {
    path: "/dashboard",
    name: "热点榜单",
    icon: <FireOutlined />,
  },
  {
    path: "/dashboard/topics",
    name: "内容选题",
    icon: <FileTextOutlined />,
  },
  {
    path: "/dashboard/favorites",
    name: "收藏关注",
    icon: <StarOutlined />,
  },
  {
    path: "/dashboard/notifications",
    name: "通知配置",
    icon: <BellOutlined />,
  },
  {
    path: "/dashboard/settings",
    name: "设置",
    icon: <SettingOutlined />,
  },
];
```

- [ ] **Step 4: 创建 public/ 目录**

```bash
mkdir -p public
touch public/.gitkeep
```

- [ ] **Step 5: 提交 Task 1**

```bash
git add src/components/AppProvider.tsx src/components/AuthGuard.tsx src/app/dashboard/menuConfig.ts public/.gitkeep
git commit -m "chore: 创建 AppProvider、AuthGuard、菜单配置等基础设施组件

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 2: 新增 — 品牌欢迎页组件

**Files:**
- Create: `src/components/WelcomeHeader.tsx`
- Create: `src/components/WelcomeHero.tsx`
- Create: `src/components/WelcomeFeatures.tsx`
- Create: `src/components/WelcomeCTA.tsx`
- Create: `src/components/WelcomeFooter.tsx`

所有 Welcome 组件都是 Server Component（**不**加 `"use client"`），纯展示。

- [ ] **Step 1: 创建 WelcomeHeader.tsx**

```tsx
// src/components/WelcomeHeader.tsx
import Link from "next/link";
import { FireOutlined } from "@ant-design/icons";

export default function WelcomeHeader() {
  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "16px 48px",
        maxWidth: 1200,
        margin: "0 auto",
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <FireOutlined style={{ fontSize: 24, color: "#1677FF" }} />
        <span style={{ fontSize: 18, fontWeight: 600, color: "#1a1a1a" }}>
          HotKey
        </span>
      </div>
      <nav style={{ display: "flex", alignItems: "center", gap: 24 }}>
        <Link
          href="/login"
          style={{ color: "#666", textDecoration: "none", fontSize: 14 }}
        >
          登录
        </Link>
        <Link
          href="/login"
          style={{
            display: "inline-flex",
            alignItems: "center",
            padding: "8px 20px",
            background: "#1677FF",
            color: "#fff",
            borderRadius: 6,
            textDecoration: "none",
            fontSize: 14,
            fontWeight: 500,
          }}
        >
          开始使用 →
        </Link>
      </nav>
    </header>
  );
}
```

- [ ] **Step 2: 创建 WelcomeHero.tsx**

```tsx
// src/components/WelcomeHero.tsx
import Link from "next/link";

export default function WelcomeHero() {
  return (
    <section
      style={{
        textAlign: "center",
        padding: "80px 24px 60px",
        maxWidth: 800,
        margin: "0 auto",
      }}
    >
      <h1
        style={{
          fontSize: 48,
          fontWeight: 700,
          lineHeight: 1.2,
          color: "#1a1a1a",
          margin: "0 0 20px",
          letterSpacing: "-0.02em",
        }}
      >
        热点监控 · 内容创作 · 数据洞察
      </h1>
      <p
        style={{
          fontSize: 18,
          lineHeight: 1.6,
          color: "#666",
          margin: "0 auto 40px",
          maxWidth: 600,
        }}
      >
        一站式热点追踪平台，助力内容创作者把握流量脉搏，做出爆款内容
      </p>
      <div style={{ display: "flex", gap: 16, justifyContent: "center" }}>
        <Link
          href="/login"
          style={{
            display: "inline-flex",
            alignItems: "center",
            padding: "12px 32px",
            background: "#1677FF",
            color: "#fff",
            borderRadius: 8,
            textDecoration: "none",
            fontSize: 16,
            fontWeight: 500,
          }}
        >
          立即开始
        </Link>
        <a
          href="#features"
          style={{
            display: "inline-flex",
            alignItems: "center",
            padding: "12px 32px",
            background: "#f5f5f5",
            color: "#333",
            borderRadius: 8,
            textDecoration: "none",
            fontSize: 16,
            fontWeight: 500,
          }}
        >
          了解更多 →
        </a>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: 创建 WelcomeFeatures.tsx**

```tsx
// src/components/WelcomeFeatures.tsx
const features = [
  {
    title: "热点趋势追踪",
    description: "实时追踪微博、知乎、B站等多渠道热点趋势变化，不错过每一个流量风口",
    icon: "📊",
  },
  {
    title: "智能内容选题",
    description: "AI 智能分析热点关联话题，推荐最具创作价值的内容方向",
    icon: "🎯",
  },
  {
    title: "实时数据报告",
    description: "自动生成热点趋势报告，可视化数据洞察，支持日报和周报一键导出",
    icon: "📈",
  },
  {
    title: "多平台监控",
    description: "自定义监控关键词和平台，7×24 小时持续追踪，第一时间发现热点",
    icon: "🔍",
  },
];

export default function WelcomeFeatures() {
  return (
    <section
      id="features"
      style={{
        padding: "80px 24px",
        background: "#f8f9fa",
      }}
    >
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
        }}
      >
        <h2
          style={{
            textAlign: "center",
            fontSize: 32,
            fontWeight: 600,
            color: "#1a1a1a",
            margin: "0 0 12px",
          }}
        >
          核心功能
        </h2>
        <p
          style={{
            textAlign: "center",
            fontSize: 16,
            color: "#666",
            margin: "0 0 48px",
          }}
        >
          为内容创作者打造的全链路热点工具
        </p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 24,
          }}
        >
          {features.map((feature) => (
            <article
              key={feature.title}
              style={{
                background: "#fff",
                borderRadius: 12,
                padding: 32,
                boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
              }}
            >
              <div style={{ fontSize: 36, marginBottom: 16 }}>
                {feature.icon}
              </div>
              <h3
                style={{
                  fontSize: 18,
                  fontWeight: 600,
                  color: "#1a1a1a",
                  margin: "0 0 8px",
                }}
              >
                {feature.title}
              </h3>
              <p
                style={{
                  fontSize: 14,
                  lineHeight: 1.6,
                  color: "#666",
                  margin: 0,
                }}
              >
                {feature.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: 创建 WelcomeCTA.tsx**

```tsx
// src/components/WelcomeCTA.tsx
import Link from "next/link";

export default function WelcomeCTA() {
  return (
    <section
      style={{
        textAlign: "center",
        padding: "80px 24px",
        background: "linear-gradient(135deg, #1677FF 0%, #0958d9 100%)",
      }}
    >
      <h2
        style={{
          fontSize: 32,
          fontWeight: 600,
          color: "#fff",
          margin: "0 0 16px",
        }}
      >
        准备好提升你的创作效率了吗？
      </h2>
      <p
        style={{
          fontSize: 16,
          color: "rgba(255,255,255,0.8)",
          margin: "0 0 32px",
        }}
      >
        免费使用，即刻开始追踪热点
      </p>
      <Link
        href="/login"
        style={{
          display: "inline-flex",
          alignItems: "center",
          padding: "14px 40px",
          background: "#fff",
          color: "#1677FF",
          borderRadius: 8,
          textDecoration: "none",
          fontSize: 16,
          fontWeight: 600,
        }}
      >
        免费开始使用 →
      </Link>
    </section>
  );
}
```

- [ ] **Step 5: 创建 WelcomeFooter.tsx**

```tsx
// src/components/WelcomeFooter.tsx

export default function WelcomeFooter() {
  return (
    <footer
      style={{
        textAlign: "center",
        padding: "24px 48px",
        color: "#999",
        fontSize: 13,
        borderTop: "1px solid #eee",
      }}
    >
      © 2026 HotKey. All rights reserved.
    </footer>
  );
}
```

- [ ] **Step 6: 提交 Task 2**

```bash
git add src/components/WelcomeHeader.tsx src/components/WelcomeHero.tsx src/components/WelcomeFeatures.tsx src/components/WelcomeCTA.tsx src/components/WelcomeFooter.tsx
git commit -m "feat: 新增品牌欢迎页组件（纯 Server Component）

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 3: 重写 — 将 MainLayout 重构为通用 BasicLayout

**Files:**
- Delete: `src/layouts/MainLayout.tsx`
- Create: `src/layouts/BasicLayout.tsx`

- [ ] **Step 1: 删除旧 MainLayout.tsx**

```bash
rm src/layouts/MainLayout.tsx
```

- [ ] **Step 2: 创建 BasicLayout.tsx**

```tsx
// src/layouts/BasicLayout.tsx
"use client";

import { useRef } from "react";
import ProLayout from "@ant-design/pro-layout";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Dropdown, Avatar } from "antd";
import { UserOutlined, SettingOutlined } from "@ant-design/icons";
import { useAuthStore } from "@/stores/authStore";

interface MenuItem {
  path: string;
  name: string;
  icon: React.ReactNode;
}

interface BasicLayoutProps {
  children: React.ReactNode;
  menuItems: MenuItem[];
  logo?: React.ReactNode;
  title?: string;
  headerRight?: React.ReactNode;
  onLogoClick?: () => void;
}

const defaultLogo = (
  <UserOutlined style={{ fontSize: 24, color: "#1677FF" }} />
);

export default function BasicLayout({
  children,
  menuItems,
  logo = defaultLogo,
  title = "HotKey",
  headerRight,
  onLogoClick,
}: BasicLayoutProps) {
  const pathname = usePathname();
  const actionRef = useRef<any>(null);
  const { logout } = useAuthStore();

  const userMenuItems = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "个人信息",
    },
    { type: "divider" as const },
    {
      key: "logout",
      icon: <SettingOutlined />,
      label: "退出登录",
      danger: true,
    },
  ];

  const handleMenuClick = ({ key }: { key: string }) => {
    if (key === "profile") {
      window.location.href = "/dashboard/profile";
    } else if (key === "logout") {
      logout();
      window.location.href = "/login";
    }
  };

  const defaultHeaderRight = (
    <Dropdown
      key="user"
      menu={{ items: userMenuItems, onClick: handleMenuClick }}
    >
      <Avatar
        style={{
          cursor: "pointer",
          backgroundColor: "#1677FF",
          verticalAlign: "middle",
        }}
        icon={<UserOutlined />}
      />
    </Dropdown>
  );

  return (
    <ProLayout
      actionRef={actionRef}
      logo={logo}
      title={title}
      layout="top"
      navTheme="light"
      fixedHeader
      contentWidth="Fluid"
      menu={{ locale: false }}
      menuDataRender={() => menuItems}
      location={{ pathname } as any}
      menuItemRender={(item: any, _dom: React.ReactNode) => {
        if (!item.path) return _dom;
        return <Link href={item.path}>{item.name}</Link>;
      }}
      onMenuHeaderClick={() => {
        if (onLogoClick) {
          onLogoClick();
        } else {
          window.location.href = "/dashboard";
        }
      }}
      actionsRender={() => [headerRight ?? defaultHeaderRight]}
    >
      {children}
    </ProLayout>
  );
}
```

- [ ] **Step 3: 创建 FireOutlined 图标作为默认 logo（修改 BasicLayout 的 defaultLogo）**

上面用的 `UserOutlined` 不对，改成用 `FireOutlined`：

```bash
# 无需额外步骤，已直接编辑
```

等一下，实际上应该直接用传入的 logo 或是 Ant Design 图标。让我修正 BasicLayout.tsx 第 15 行：

```tsx
// 保持 FireOutlined 图标风格一致
const defaultLogo = null; // 由 ProLayout 的 title 属性处理
```

更准确地：ProLayout 的 `logo` prop 接受 ReactNode，如果传 null 则只显示 title。所以可以直接去掉默认 logo，让每个使用方自己定义。我们来修正：

```tsx
// BasicLayout.tsx 中的 defaultLogo 改为：
import { FireOutlined } from "@ant-design/icons";
const defaultLogo = <FireOutlined style={{ fontSize: 24, color: "#1677FF" }} />;
```

- [ ] **Step 4: 提交 Task 3**

```bash
git add src/layouts/BasicLayout.tsx
git rm src/layouts/MainLayout.tsx
git commit -m "refactor: 将 MainLayout 重构为通用 BasicLayout

- 菜单数据通过 props 注入，不再硬编码
- 权限逻辑已提取到 AuthGuard（移出 layout）
- 用户头像菜单可通过 headerRight 插槽自定义
- Logo、标题均可通过 props 配置

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 4: 搬移 — 将 app/ 目录整体迁移到 src/app/

**Files:**
- Move: `app/*` → `src/app/*`
- Delete: `app/` 根目录

- [ ] **Step 1: 搬移所有文件**

```bash
# 创建目标目录
mkdir -p src/app/dashboard

# 搬移根文件
cp app/layout.tsx src/app/layout.tsx
cp app/page.tsx src/app/page.tsx
cp app/globals.css src/app/globals.css
cp app/icon.svg src/app/icon.svg

# 搬移 login
cp -r app/login src/app/

# 搬移 dashboard 所有子页面
for dir in app/dashboard/*/; do
  subdir=$(basename "$dir")
  mkdir -p "src/app/dashboard/$subdir"
  cp -r "$dir"/* "src/app/dashboard/$subdir/"
done

# 搬移 dashboard 根文件
cp app/dashboard/page.tsx src/app/dashboard/page.tsx
cp app/dashboard/layout.tsx src/app/dashboard/layout.tsx
```

简化方法（cp -r 递归搬移所有内容）：

```bash
# 确保 src/app/ 存在
mkdir -p src/app

# 全量递归复制 app/ 到 src/app/
cp -r app/* src/app/

# 确认复制正确
ls -la src/app/
```

- [ ] **Step 2: 删除旧的根目录 app/**

```bash
rm -rf app/
```

- [ ] **Step 3: 更新 app/dashboard/layout.tsx 引用 BasicLayout**

当前 `app/dashboard/layout.tsx`（已变为 `src/app/dashboard/layout.tsx`）引用的是 `@/layouts/MainLayout`。需要改为 `@/layouts/BasicLayout` 并添加 AuthGuard：

```tsx
// src/app/dashboard/layout.tsx
"use client";

import AuthGuard from "@/components/AuthGuard";
import BasicLayout from "@/layouts/BasicLayout";
import { dashboardMenuItems } from "./menuConfig";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <BasicLayout menuItems={dashboardMenuItems} title="HotKey">
        {children}
      </BasicLayout>
    </AuthGuard>
  );
}
```

- [ ] **Step 4: 提交 Task 4**

```bash
git add src/app/ --all
git rm -r app/
git add src/app/dashboard/layout.tsx
git commit -m "refactor: 将 app/ 搬移到 src/app/，完成统一 src/ 模式

- dashboard layout 改用 AuthGuard + BasicLayout
- 所有 import 路径保持 @/ 绝对路径，无需修改

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 5: 分离 — 优化根 layout 为 Server Component，添加 AppProvider

**Files:**
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: 替换 src/app/layout.tsx 为纯 Server Component**

```tsx
// src/app/layout.tsx — Server Component (no "use client")
import type { Metadata } from "next";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import AppProvider from "@/components/AppProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "HotKey - 内容创作者热点工作台",
  description: "一站式热点追踪平台，助力内容创作者把握流量脉搏",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body>
        <AntdRegistry>
          <AppProvider>{children}</AppProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}
```

注意：`AppProvider` 是 Client Component，但放在 Server Component 的 JSX 中没问题——Next.js 会自动处理边界。

- [ ] **Step 2: 提交 Task 5**

```bash
git add src/app/layout.tsx
git commit -m "refactor: 根 layout 拆分为 Server Component + AppProvider

- html/body 在 Server Component 中渲染
- ConfigProvider 提取为 AppProvider（Client Component）
- 添加 metadata 支持 SEO

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 6: 新增 — 品牌欢迎页作为根路由

**Files:**
- Create: `src/app/page.tsx`（替换之前的跳转页）

- [ ] **Step 1: 创建欢迎页 page.tsx**

```tsx
// src/app/page.tsx — Server Component
import WelcomeHeader from "@/components/WelcomeHeader";
import WelcomeHero from "@/components/WelcomeHero";
import WelcomeFeatures from "@/components/WelcomeFeatures";
import WelcomeCTA from "@/components/WelcomeCTA";
import WelcomeFooter from "@/components/WelcomeFooter";

export default function HomePage() {
  return (
    <>
      <WelcomeHeader />
      <main>
        <WelcomeHero />
        <WelcomeFeatures />
        <WelcomeCTA />
      </main>
      <WelcomeFooter />
    </>
  );
}
```

注意：这是 Server Component（无 `"use client"`），所有 Welcome 子组件也都是 Server Component。

- [ ] **Step 2: 添加欢迎页全局样式**

```css
/* 追加到 src/app/globals.css */
html {
  scroll-behavior: smooth;
}

body {
  margin: 0;
  padding: 0;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

- [ ] **Step 3: 提交 Task 6**

```bash
git add src/app/page.tsx src/app/globals.css
git commit -m "feat: 实现品牌欢迎页作为根路由

- Server Component，纯展示无客户端逻辑
- 简约 SaaS 风格页面结构
- 平滑滚动支持

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 7: 调整 — tsconfig.json 路径更新

**Files:**
- Modify: `tsconfig.json`

- [ ] **Step 1: 更新 include 路径**

```json
{
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts"
  ],
  "exclude": [
    "node_modules"
  ]
}
```

删除 `.next/dev/types/**/*.ts`（开发环境特有路径，且不再存在）。

- [ ] **Step 2: 提交 Task 7**

```bash
git add tsconfig.json
git commit -m "chore: 更新 tsconfig.json include 路径

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 8: 验证 — 类型检查和构建

- [ ] **Step 1: 类型检查**

```bash
npx tsc --noEmit
```

Expected: No output (zero errors).

- [ ] **Step 2: 清空 Next.js 缓存并构建**

```bash
rm -rf .next
npm run build
```

Expected: Build succeeds with no errors.

- [ ] **Step 3: 启动开发服务器验证**

```bash
npm run dev
```

验证：
1. 浏览器打开 `http://localhost:3000/` → 显示品牌欢迎页
2. 点击"开始使用" → 跳转到 `/login`
3. 登录后 → 跳转到 `/dashboard`，正常显示
4. Dashboard 导航菜单正常
5. 各子页面（topics、favorites、notifications、settings、profile）正常

- [ ] **Step 4: 如果有问题，git diff 排查**

```bash
git diff
```

确认无遗漏文件或配置。

- [ ] **Step 5: 最终提交（如果验证中有修复）**

```bash
git add -A
git commit -m "fix: 结构整改验证修复

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

## 最终文件清单检查

实施完成后，应确认以下文件存在：

| 路径 | 用途 |
|------|------|
| `src/app/layout.tsx` | Server Component 根布局 |
| `src/app/page.tsx` | 品牌欢迎页 |
| `src/app/globals.css` | 全局样式 |
| `src/app/icon.svg` | 网站图标 |
| `src/app/login/page.tsx` | 登录页 |
| `src/app/dashboard/layout.tsx` | Dashboard 布局（AuthGuard + BasicLayout） |
| `src/app/dashboard/menuConfig.ts` | 导航菜单配置 |
| `src/app/dashboard/page.tsx` | 热点榜单 |
| `src/app/dashboard/favorites/page.tsx` | 收藏关注 |
| `src/app/dashboard/notifications/page.tsx` | 通知配置 |
| `src/app/dashboard/profile/page.tsx` | 个人信息 |
| `src/app/dashboard/settings/page.tsx` | 设置 |
| `src/app/dashboard/topics/page.tsx` | 内容选题 |
| `src/components/AppProvider.tsx` | ConfigProvider 包装器 |
| `src/components/AuthGuard.tsx` | 权限守卫 |
| `src/components/Welcome*.tsx` | 欢迎页组件集 |
| `src/layouts/BasicLayout.tsx` | 通用 ProLayout |
| `public/` | 静态资源目录 |
