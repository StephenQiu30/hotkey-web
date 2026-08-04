<p align="center">
  <img src="public/brand/hotkey-mark.svg" width="72" alt="HotKey logo">
</p>

<h1 align="center">HotKey Web</h1>

<p align="center"><a href="README.md">简体中文</a> · <a href="README_EN.md">English</a></p>

<p align="center">
  <strong>面向内容创作者与研究者的开源 AI 热点情报工作台。</strong>
</p>

<p align="center">
  <a href="https://github.com/StephenQiu30/hotkey-web/actions/workflows/ci.yml"><img alt="CI" src="https://github.com/StephenQiu30/hotkey-web/actions/workflows/ci.yml/badge.svg?branch=main"></a>
  <a href="https://nextjs.org/"><img alt="Next.js 16" src="https://img.shields.io/badge/Next.js-16-black?logo=next.js"></a>
  <a href="https://www.typescriptlang.org/"><img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white"></a>
  <a href="LICENSE"><img alt="MIT License" src="https://img.shields.io/badge/license-MIT-green.svg"></a>
</p>

HotKey 把 RSS、Atom、Hacker News 等公开信号转化为可验证的事件情报、内容选题与日报周报。`hotkey-web` 是它的桌面 Web 工作台：你可以在同一界面管理监控主题、检查来源、阅读证据、理解事件、发布报告并配置通知。

> 如果这个方向对你有价值，欢迎 Star 项目、分享真实使用场景，或参与改进交互、可视化和可访问性。

## 项目组成

HotKey 是一个前后端分离的开源项目：

| 仓库                                                           | 职责                                                            |
| -------------------------------------------------------------- | --------------------------------------------------------------- |
| [hotkey-web](https://github.com/StephenQiu30/hotkey-web)       | 本仓库；提供面向最终用户的桌面 Web 工作台                       |
| [hotkey-server](https://github.com/StephenQiu30/hotkey-server) | 提供后端 API、采集与 AI 任务、数据模型、交付能力和 OpenAPI 契约 |

你可以分别开发和部署两个仓库；使用完整产品功能时需要同时运行前后端。

## 你可以用它做什么

- **发现正在加速的事件**：按热度、趋势和更新时间浏览事件，而不是只看孤立内容。
- **理解证据与脉络**：查看事件成员、时间线、实体、声明、来源和原始 Markdown 文档。
- **管理长期监控**：创建监控主题，维护多语言规则与来源，预览后再发布配置。
- **把热点变成输出**：构建、预览并发布日报或周报，沉淀到 Obsidian 或通过邮件、RSS/Atom 分发。
- **保持数据自主**：浏览器只访问自己的 Next.js 与 [hotkey-server](https://github.com/StephenQiu30/hotkey-server)，核心数据保存在自己的基础设施中。
- **获得完整管理界面**：覆盖身份、内容、收藏、来源、通知、个人资料与系统设置。

## 产品工作流

```text
公开来源 → 监控与采集 → 内容证据 → 事件聚合 → AI 研判 → 报告与知识交付
                               ↑
                        HotKey Web 工作台
```

Web 端不手写后端 API 类型。所有请求函数和 DTO 都从 `hotkey-server` 的 OpenAPI 规范生成，降低前后端契约漂移。

## 技术栈

| 类别       | 选型                                                |
| ---------- | --------------------------------------------------- |
| 应用框架   | Next.js 16 App Router、React 19、TypeScript 5.9     |
| 样式系统   | Tailwind CSS 4、CSS Variables、深色主题             |
| UI 基础    | Radix UI、Lucide Icons、自有组合组件                |
| 图表与动效 | Recharts、GSAP                                      |
| 数据与状态 | Axios、Zustand、OpenAPI Generated Client            |
| 测试       | Vitest、Testing Library、Playwright / agent-browser |

## 快速开始

### 环境要求

- Node.js 22（CI 使用版本）
- npm
- 已启动的 [hotkey-server](https://github.com/StephenQiu30/hotkey-server)，默认地址为 `http://127.0.0.1:8080`

### 本地开发

```bash
git clone https://github.com/StephenQiu30/hotkey-web.git
cd hotkey-web
npm ci
cp .env.example .env
npm run dev
```

访问 <http://localhost:3000>。

默认 `.env.example` 已将 Next.js 服务端代理指向本机后端：

```dotenv
HOTKEY_API_ORIGIN=http://127.0.0.1:8080
```

`HOTKEY_API_ORIGIN` 只由 Next.js 服务端 rewrites 使用，不会作为 `NEXT_PUBLIC_*` 变量暴露给浏览器。完整说明见 [`.env.example`](.env.example)。

也可以在 WebStorm 中直接运行 `package.json` 的 `dev` 脚本。Web 端与后端分别启动，不依赖 `.sh` 文件；注册、邮件和管理员配置请参阅 [hotkey-server 文档](https://github.com/StephenQiu30/hotkey-server#readme)。

### Docker

Docker 启动会显式加载 `.env.<环境>`，默认环境为 `prod`。首次启动先创建本地生产配置：

```bash
cp .env.prod.example .env.prod
npm run docker:up
```

默认命令等价于 `docker compose --env-file .env.prod up --build`。需要后台运行时追加 `-d`：

```bash
npm run docker:up -- -d
```

其他部署环境使用 `--env` 选择对应文件。例如 `.env.staging`：

```bash
cp .env.prod.example .env.staging
# 将 .env.staging 中的 HOTKEY_DEPLOY_ENV、COMPOSE_PROJECT_NAME、端口和后端地址改为预发布配置
npm run docker:config -- --env staging
npm run docker:up -- --env staging -d
```

`-env staging` 也可作为 `--env staging` 的兼容写法。环境名只用于选择部署配置；容器内的 `NODE_ENV` 始终为 `production`，`HOTKEY_DEPLOY_ENV` 和 `COMPOSE_PROJECT_NAME` 用于区分镜像标签及 Compose 网络、容器等资源。

常用 Docker 命令：

```bash
npm run docker:config                 # 校验默认 .env.prod
npm run docker:logs                   # 查看默认生产环境日志
npm run docker:down                   # 停止默认生产环境
npm run docker:down -- --env staging  # 停止预发布环境
```

## 常用命令

```bash
npm run dev               # 本地开发与 Fast Refresh
npm run docker:up         # 使用 .env.prod 构建并启动 Docker
npm run docker:config     # 校验 .env.prod 对应的 Compose 配置
npm run typecheck         # TypeScript 类型检查
npm run test:unit         # 单元测试
npm run build             # 生产构建
npm run openapi:generate  # 从运行中的后端重新生成 API Client
npm run openapi:check     # 校验契约可用性并检查生成客户端是否同步
```

只有后端 OpenAPI 契约发生变化时才需要运行 `openapi:generate`。生成结果位于 `src/services/hotkey/hotkey-server/`，请勿手工修改。

## 项目结构

```text
src/app/                         # 页面与 App Router
src/components/                  # 业务组件与 UI 组合组件
src/layouts/                     # 工作台布局
src/lib/                         # 请求、认证会话与通用工具
src/stores/                      # Zustand 状态
src/services/hotkey/             # OpenAPI 生成客户端
test/                            # 集中的单元测试
docs/                            # PRD、设计、计划、验收与运维文档
```

## OpenAPI 协作流程

1. 在 `hotkey-server` 修改接口并执行 `make openapi-check`。
2. 启动后端，确认 `http://127.0.0.1:8080/openapi.json` 可访问。
3. 在本仓执行 `npm run openapi:generate`，只使用官方 `openapi2ts` CLI 生成客户端。
4. 审查生成差异，业务代码只调用 `src/services/hotkey/hotkey-server/` 中的生成函数，不手写接口路径、请求 DTO 或响应类型。
5. 执行 `npm run openapi:check`，确认服务契约可用且再次生成不会产生漂移。
6. 运行 `npm run typecheck`、`npm run test:unit` 和 `npm run build`，再在页面或组件中接入新能力。

## 项目状态

HotKey Web 正处于积极开发阶段。登录、注册、热点工作台、监控主题、来源、内容详情、报告、收藏、通知、个人资料和设置页面已经接入真实后端契约；1.0 前的导航、视觉细节和部分工作流仍会持续调整。

当前版本适合本地体验、自托管评估和共同建设。路线与功能建议通过 [GitHub Issues](https://github.com/StephenQiu30/hotkey-web/issues) 公开讨论；发现界面或交互问题时，欢迎附带浏览器、视口、复现步骤和截图。

## 参与贡献

我们欢迎以下贡献：

- 可访问性、响应式布局和交互细节改进
- 事件证据、趋势和来源数据的可视化
- 测试覆盖、错误提示和性能优化
- 中文或英文文档与上手体验
- 与 `hotkey-server` 新能力配套的界面

提交代码前请阅读：

- [贡献指南](CONTRIBUTING.md)
- [行为准则](CODE_OF_CONDUCT.md)
- [安全策略](SECURITY.md)
- [项目文档](docs/README.md)

大型改动请先创建 Issue，描述用户问题、交互范围和验收方式。

## 相关仓库

| 仓库                                                           | 说明                                      |
| -------------------------------------------------------------- | ----------------------------------------- |
| [hotkey-server](https://github.com/StephenQiu30/hotkey-server) | 后端、任务系统、数据模型与 OpenAPI 事实源 |
| [hotkey-web](https://github.com/StephenQiu30/hotkey-web)       | 本仓库，桌面 Web 工作台                   |

## 许可证

本项目基于 [MIT License](LICENSE) 开源。`package.json` 中的 `private: true` 仅用于防止误发布到 npm，不代表 GitHub 项目为私有授权。
