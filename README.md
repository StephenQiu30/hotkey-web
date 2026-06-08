# HotKey Web

HotKey 是面向内容创作者的热点监控与 AI 选题助手。`hotkey-web` 是它的 **Next.js Web 创作者工作台**——在桌面端完成登录、浏览热点、理解事件、生成选题、管理收藏与通知配置。

## 你在用什么

Web 端把后端能力组织成创作者日常可用的工作流：

- **热点榜单**：按评分与趋势浏览值得跟进的话题
- **快速理解**：查看 AI 摘要、真实度判断与关键证据
- **内容选题**：基于热点生成角度、形式与创作理由
- **收藏与关注**：沉淀个人选题池，配置提醒与通知
- **趋势分析**：趋势曲线、来源占比、分类分布等基础可视化

当前主界面为 `CreatorWorkbench` 组件，对接后端热点、报告、通知等 API。

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
| 样式 | Tailwind CSS 4 |
| 组件 | Radix UI、Lucide 图标 |
| API 客户端 | `@umijs/openapi`（命名空间 `HotKeyAPI`） |

## 快速开始

### 环境要求

- Node.js 20+
- 本地已克隆并可用 [`hotkey-server`](../hotkey-server)（用于 OpenAPI 规范）
- Python 3（治理基线测试）

### 安装与开发

```bash
npm install

# 从 server 的 openapi.json 生成 TypeScript 客户端
# 需先启动 hotkey-server 并导出规范，或确保 ../hotkey-server/docs/openapi.json 存在
npm run openapi:generate

# 启动开发服务器
npm run dev
```

浏览器访问 [http://localhost:3000](http://localhost:3000)。

### 常用命令

```bash
npm run build          # 生产构建
npm run typecheck      # TypeScript 类型检查
npm run test           # 仓库治理基线测试
```

## OpenAPI 客户端生成

生成配置见 [`openapi2ts.config.ts`](./openapi2ts.config.ts)：

- 规范路径：`../hotkey-server/docs/openapi.json`
- 输出目录：`src/services/hotkey/hotkey-server/`
- 请求封装：`src/lib/request.ts`

后端接口有变更时，按以下顺序操作：

1. 在 `hotkey-server` 稳定 OpenAPI 并合并到 `main`
2. 更新本仓的 `openapi.json`（可从运行中的服务 `curl /openapi.json` 获取）
3. 执行 `npm run openapi:generate`
4. 在页面与组件中接入新接口并回归

## 目录结构

```text
app/                  # Next.js App Router 页面
src/components/       # UI 与业务组件（含 CreatorWorkbench）
src/lib/              # 请求封装与工具函数
src/services/hotkey/  # OpenAPI 生成的 API 客户端（勿手改）
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
- [AGENTS.md](./AGENTS.md) — AI 协作与工程规范（通用部分同步自 server）

## 许可证

本项目为 HotKey 产品私有仓库，未经授权请勿对外分发。
