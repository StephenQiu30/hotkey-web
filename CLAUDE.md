# CLAUDE.md — hotkey-web

本文件为 Claude Code 提供在 hotkey-web 仓库中工作的指导规范。

## 项目概述

hotkey-web 是 HotKey 平台的 Web 工作台，提供内容创作者使用的界面。

### 技术栈
- Next.js 16 + React 19
- Ant Design 5 + ProLayout（顶部导航布局）
- @ant-design/icons
- axios（HTTP 客户端）
- zustand（状态管理）
- recharts（图表）
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

## 常用命令

```bash
npm run dev           # 开发服务器
npm run build         # 生产构建
npx tsc --noEmit      # 类型检查
npx openapi2ts        # 从服务器 OpenAPI 重新生成 API 客户端
python3 -m unittest discover -s tests   # 治理/契约测试
```

## 架构

### API 客户端生成
- 从 `hotkey-server` 的 OpenAPI 规范生成
- 使用 `@umijs/openapi` 工具
- 生成路径：`src/services/hotkey/hotkey-server/`
- **绝不手写后端 API 类型**

### 组件结构
- `src/components/CreatorWorkbench.tsx` — 主 UI 组件
- 使用 shadcn/ui 组件库
- Tailwind CSS 4 进行样式设计

---

## 项目开发原则

### 核心原则

**MVP 优先** — 以最小可用功能闭环为优先，不对功能、架构、流程或文档进行过度设计。

**单文件尺寸** — 文件保持在 200-500 行以内。超过时按职责拆分。

**TDD 驱动** — 严格遵循红-绿-重构循环。

**SMART 工程** — 需求和验收标准遵循 SMART 原则。

**变更闭环** — 每次重要的 OpenSpec 变更必须完成完整循环：实现、测试、验证、归档、归档后验证，然后才能进行中文 Git 提交。

---

## TDD 执行规范

1. 红阶段测试必须**明确表达预期行为或缺陷复现点**，不允许写空测试
2. 绿阶段只允许最少代码通过测试 — 不扩大范围、不过度设计
3. 重构阶段保持所有测试通过，聚焦命名、结构、可读性，不改变已验证的行为
4. 测试边界必须覆盖：正常路径、边界条件、错误处理
5. 测试失败时必须先理解失败原因，再编写最少代码使其通过
6. 重构后必须运行完整测试套件确认无回归

---

## Test-First PR 提交规范

提交顺序严格按：`test:` → `impl:` → `refactor:` → `chore:`

1. `test:` 提交只包含测试相关文件，**不允许包含业务实现、生产代码改动**
2. `impl:` 提交只交付通过测试的最少代码
3. `refactor:` 提交只做不改变行为的重构
4. `chore:` 提交包含配置、格式化、生成文件
5. 没有明确测试的 PR 不进入代码审查
6. Agent 只能协助生成实现，测试、边界和最终质量由提交人负责

---

## SMART 执行规范

- **Specific（具体）** — 清晰描述问题和影响范围
- **Measurable（可衡量）** — 通过测试、lint、API 响应、日志可验证标准
- **Achievable（可达成）** — MVP 范围的最小实现
- **Relevant（相关）** — 不做无关的重构或功能
- **Time-bound（有时限）** — 分阶段步骤，有清晰边界

---

## Git 提交规范

1. 重大变更后必须先完成测试和验证
2. 提交前检查工作区只包含相关文件
3. 功能性 PR 必须遵循 `test:→impl:→refactor:→chore:` 顺序
4. 提交信息使用中文
5. 中间产物和调试日志不进入提交
6. 提交前确认所有测试通过

---

## PR 提交与合并规范

1. 创建 PR 前检查是否有可复用的现有 PR
2. PR 标题和描述使用中文
3. 合并前必须打 tag 标记当前分支状态作为回滚点 — tag 名称应体现合并对象和日期
4. 多个 PR 按用户指定顺序合并，每次合并间重新检查冲突
5. PR 描述必须包含：Test-first Evidence、Tests added、Commands run、Result、Agent Usage、Reviewer Checklist

---

## 角色协作结构

### 标准角色与职责

| 角色 | 职责 |
|------|------|
| **PM** | 策略分解、任务拆分 |
| **Explorer** | 事实验证、上下文收集 |
| **Builder** | 实现执行、最小变更 |
| **Tester** | 质量保证、测试验证 |
| **Reporter** | 交付回顾、风险总结 |

### 角色配置
- 角色配置存放于 `.claude/agents/` 目录
- 可复用流程存放于 `.claude/skills/` 目录

### 标准执行流程
**Explorer → PM → Builder → Tester → Reporter**
1. Explorer 先收集上下文
2. PM 拆分任务，明确范围
3. Builder 实现最少变更
4. Tester 通过测试和 lint 验证
5. Reporter 总结变更内容、验证方式、剩余风险

---

## 交付输出要求

每个任务完成必须包含：
1. 变更了什么
2. 如何验证
3. 未验证的内容或残余风险
4. 关键文件
5. Git 提交状态（是否已中文提交、提交信息、工作区是否干净）
6. PR 状态（已创建/更新、合并需求、预合并 tag）

---

## 环境配置

复制 `.env.example` 到 `.env` 并配置。关键变量：
- `NEXT_PUBLIC_API_URL` — API 服务器地址
