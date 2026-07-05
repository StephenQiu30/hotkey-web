# CLAUDE.local.md — hotkey-web 局部项目规范

本文件用于记录放在 hotkey-web 项目中的局部规范性配置。

## 使用边界

1. `CLAUDE.md` 应存放长期稳定的全局规则、角色协作原则和交付格式
2. `CLAUDE.local.md` 则负责**当前项目特有的规范、路径、命令、环境约束和临时协作约定**
3. 当两者冲突时，**应优先确认项目上下文，并以更具体、更贴近当前项目的规则为准**

## 当前项目规范

### 技术栈
- Next.js 16 + React 19
- Tailwind CSS 4 + shadcn/ui
- TypeScript

### 项目结构
```
hotkey-web/
├── app/                # Next.js App Router
│   ├── layout.tsx      # Ant Design ConfigProvider + 蓝白主题
│   └── login/          # 登录页
│   └── dashboard/      # 创作者工作台（ProLayout 包裹）
├── src/
│   ├── layouts/        # 页面布局（MainLayout.tsx）
│   ├── stores/         # zustand 状态管理
│   ├── components/     # 业务组件
│   ├── lib/
│   │   ├── axios.ts    # axios 实例配置
│   │   └── request.ts  # API 生成适配层
│   └── services/
│       └── hotkey/
│           └── hotkey-server/    # 自动生成的 API 客户端
├── public/             # 静态资源
├── package.json        # 依赖配置
├── tsconfig.json       # TypeScript 配置
└── openapi2ts.config.ts  # @umijs/openapi 生成配置
```

### 常用命令
```bash
npm run dev           # 开发服务器
npm run build         # 生产构建
npx tsc --noEmit      # 类型检查
npm run openapi:generate   # 从后端 Swagger 重新生成 API 客户端
```

### API 客户端生成
- 从 `hotkey-server` 的 OpenAPI 规范生成
- 使用 `@umijs/openapi` 工具
- 生成路径：`src/services/hotkey/hotkey-server/`
- **绝不手写后端 API 类型**

### 角色配置
角色配置存放于 `.claude/agents/` 目录

### 可复用流程
可复用流程存放于 `.claude/skills/` 目录
