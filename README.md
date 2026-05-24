# hotkey-web

`hotkey-web` 是 HotKey 内容创作者热点选题工具的 Next.js Web 创作者工作台。

本仓不维护后端 API 契约事实源。后端接口以 `hotkey-server` 的 Swagger/OpenAPI 为准，Web 端必须通过 `@umijs/openapi` 生成 API 客户端。

## P0 职责

1. Web 登录入口。
2. 热点榜单与热点详情。
3. AI 快速理解热点展示。
4. AI 内容选题生成工作流。
5. 收藏、关注和通知配置入口。
6. 趋势曲线、来源占比、分类分布等基础可视化。

## 技术栈

- Next.js + TypeScript
- `@umijs/openapi`
- 后续 UI 与图表库以实施计划确认结果为准

## 跨仓协作顺序

默认顺序：

```text
server -> web -> miniapp -> 回归
```

Web 端只有在 `hotkey-server` 的 OpenAPI 契约稳定后，才生成客户端并接入页面。

## 规范文件

- [AGENTS.md](./AGENTS.md)：Web 仓规范，通用部分同步自 `hotkey-server`。

## M0 验证

运行仓库治理基线测试：

```bash
python3 -m unittest discover -s tests -p 'test_repository_governance.py'
```

该测试用于确认本仓声明了 Next.js Web 创作者工作台职责、`@umijs/openapi` 生成客户端规则和跨仓协作顺序。
