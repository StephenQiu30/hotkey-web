# hotkey-web

HotKey 是面向内容创作者的热点监控与 AI 选题助手。`hotkey-web` 是它的 **Next.js Web 创作者工作台**——在桌面端完成登录、浏览热点、理解事件、生成选题、管理收藏与通知配置。

## 你在用什么

Web 端把后端能力组织成创作者日常可用的工作流：

- **热点榜单**：按评分与趋势浏览值得跟进的话题
- **快速理解**：查看 AI 摘要、真实度判断与关键证据
- **内容选题**：基于热点生成角度、形式与创作理由
- **收藏与关注**：沉淀个人选题池，配置提醒与通知
- **趋势分析**：趋势曲线、来源占比、分类分布等基础可视化

## 在 HotKey 生态中的位置

```text
hotkey-server（OpenAPI 事实源）
       ↓ 生成客户端
hotkey-web（本仓）──── 桌面端完整工作台
hotkey-miniapp ──── 微信端轻量入口
```

本仓 **不维护** 后端 API 契约。所有接口类型与请求函数必须通过 `@umijs/openapi` 从 `hotkey-server` 的 OpenAPI 规范生成，禁止手写后端类型。

## 技术栈

| 类别 | 选型 |
|------|------|
| 框架 | Next.js 16 + React 19 + TypeScript |
| UI 组件 | Ant Design 5 + ProLayout |
| 图标 | @ant-design/icons |
| 图表 | recharts |
| HTTP 客户端 | axios |
| 状态管理 | zustand |
| API 客户端生成 | `@umijs/openapi`（命名空间 `HotKeyAPI`） |

## 快速开始

### 环境要求

- Node.js 20+
- 本地已克隆并可用 [`hotkey-server`](../hotkey-server)（用于 OpenAPI 规范）

### 安装与开发

```bash
npm install

# 根据后端仓库已提交的 OpenAPI 文档生成 TypeScript 请求客户端
npm run openapi:generate

# 启动开发服务器
npm run dev
```

浏览器访问 [http://localhost:3000](http://localhost:3000)。

### 常用命令

```bash
npm run build          # 生产构建
npm run typecheck      # TypeScript 类型检查
npm run openapi:generate  # 从后端 OpenAPI 文档生成 API 请求与类型
```

## OpenAPI 客户端生成

生成配置见 [`openapi2ts.config.ts`](./openapi2ts.config.ts)：

- 规范来源：`http://127.0.0.1:8080/openapi.json`（当前运行中的后端注解生成文档）
- 输出目录：`src/services/hotkey/hotkey-server/`
- 请求封装：`src/lib/request.ts`（基于 axios）

生成结果包含每个后端模块的请求函数、请求参数和响应类型。执行 `npm run openapi:generate` 会直接读取当前后端的 `/openapi.json`。生成目录只允许由该命令更新，不得手工维护。

后端接口有变更时，按以下顺序操作：

1. 在 `hotkey-server` 修改接口，并执行 `make openapi-check` 生成、校验和确认 OpenAPI 文档无漂移
2. 启动 `hotkey-server`，确认接口文档可通过 `http://127.0.0.1:8080/docs` 访问
3. 在 `hotkey-web` 执行 `npm run openapi:generate`
4. 检查 `src/services/hotkey/hotkey-server/` 的生成差异，并执行 `npm run typecheck` 与 `npm run test:unit`
5. 在页面与组件中接入新接口并回归

## 目录结构

```text
app/                  # Next.js App Router 页面
├── login/            # 登录页
└── dashboard/        # 创作者工作台
src/
├── layouts/          # 页面布局（ProLayout 顶部导航）
├── components/       # 业务组件
├── lib/              # 基础设施（axios 实例、工具函数）
├── stores/           # 状态管理（zustand）
└── services/hotkey/  # OpenAPI 生成的 API 客户端（勿手改）
docs/                 # PRD、设计、验收与运维文档
```

## 跨仓协作

默认开发顺序：

```text
server → web → miniapp → 回归
```

Web 端通常在 Server 契约稳定后再生成客户端并开发页面。复杂需求以 Linear ticket 为单位，在 Server 完成接口后再接入本仓。

| 仓库 | 链接 |
|------|------|
| 后端 | [hotkey-server](https://github.com/StephenQiu30/hotkey-server) |
| Web（本仓） | [hotkey-web](https://github.com/StephenQiu30/hotkey-web) |
| 小程序 | [hotkey-miniapp](https://github.com/StephenQiu30/hotkey-miniapp) |

## 文档与规范

- [文档索引](./docs/README.md)

## 许可证

本项目为 HotKey 产品私有仓库，未经授权请勿对外分发。
