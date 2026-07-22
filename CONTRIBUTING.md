# 为 HotKey Web 贡献

感谢你愿意帮助 HotKey Web 变得更清晰、更可靠、更易用。我们欢迎 UI/UX、可访问性、可视化、性能、测试、文档和真实使用反馈。

参与社区即表示你同意遵守 [行为准则](CODE_OF_CONDUCT.md)。安全问题请遵循 [安全策略](SECURITY.md)，不要公开披露。

## 从哪里开始

- 小型样式、文案、测试或文档修复可以直接提交 Pull Request。
- 新页面、跨页面交互或后端契约变化，请先创建 Feature Request。
- 后端能力缺失时，请先在 [hotkey-server](https://github.com/StephenQiu30/hotkey-server) 对齐 OpenAPI 契约。
- UI 改动请说明目标用户、视口、交互状态和可访问性影响。

## 本地开发

```bash
git clone https://github.com/StephenQiu30/hotkey-web.git
cd hotkey-web
npm ci
cp .env.example .env
npm run dev
```

默认需要 `hotkey-server` 运行在 `http://127.0.0.1:8080`。

## 开发约束

- 使用 Next.js App Router、React、TypeScript 和现有 UI 组合组件。
- API 类型与请求函数由 OpenAPI 生成，不手写后端 DTO。
- 测试文件统一放在根目录 `test/`。
- 保持键盘可操作、可见焦点、语义化标签和合理颜色对比度。
- 同时检查桌面与移动视口；动效应尊重 `prefers-reduced-motion`。
- 不提交 `.env`、Token、真实用户数据、截图中的隐私内容或生成产物。

完整约束见 [AGENTS.md](AGENTS.md)。

## 验证

提交前按改动范围运行：

```bash
npm run typecheck
npm run test:unit
npm run build
git diff --check
```

涉及关键用户流程时，请补充浏览器验证，并在 Pull Request 中提供截图或短视频。请覆盖正常、空、加载、错误和权限不足状态。

## OpenAPI 变更

1. 先在 `hotkey-server` 完成接口和 `make openapi-check`。
2. 启动后端并确认 `/openapi.json` 可访问。
3. 执行 `npm run openapi:generate`。
4. 审查生成代码，只在页面和组件中编写适配逻辑。
5. 运行类型检查、测试和生产构建。

## Pull Request 内容

请说明：

- 用户问题和预期结果
- 主要界面或技术选择
- 测试与手工验证方式
- 桌面和移动端截图（如适用）
- 对后端契约、环境变量或部署的影响
- 是否使用 AI Agent，以及人工审查范围

尽量保持一次 Pull Request 只解决一个问题，方便审查、验证和回滚。
