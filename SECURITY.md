# 安全策略

HotKey Web 处理登录状态、事件证据、报告内容和管理操作。请负责任地报告安全问题，避免泄露真实实例中的账号与数据。

## 支持范围

| 版本 | 安全更新 |
|------|----------|
| `main` / 最新发布版本 | 支持 |
| 历史提交与未维护分支 | 不支持 |

## 私密报告漏洞

请使用 GitHub 的 [Private Vulnerability Reporting](https://github.com/StephenQiu30/hotkey-web/security/advisories/new) 提交报告，不要创建公开 Issue、Pull Request 或 Discussion。

如果私密入口不可用，请仅创建一个不含漏洞细节的 Issue，请求维护者提供私密联系方式。不要提交访问 Token、Refresh Cookie、邮箱、真实内容、完整响应或可直接利用的攻击载荷。

报告最好包含：

- 受影响的版本、提交、页面和浏览器
- 漏洞类型、影响和前置条件
- 最小化复现步骤或概念验证
- 对 `hotkey-server` 的依赖关系
- 建议的缓解或修复方向

## 响应目标

- 3 个工作日内确认收到报告。
- 14 天内完成初步评估并同步处理计划。
- 修复发布前与报告者协调披露时间。

## 重点关注领域

- 登录、Token 刷新、退出和权限边界
- XSS、Markdown 渲染、开放重定向和不安全链接
- Next.js rewrites、跨源 Cookie 与代理配置
- 敏感信息出现在客户端 Bundle、日志或错误页面
- 管理操作的越权调用与 CSRF
- 依赖和构建供应链风险

## 安全使用建议

- 生产环境始终使用 HTTPS，并为后端启用 Secure Cookie 和精确 CORS Origin。
- 不要把后端密钥放入 `NEXT_PUBLIC_*` 环境变量。
- 使用受支持的 Node.js 与依赖版本，并定期审查安全更新。
- 部署前检查构建产物、错误监控和反向代理配置。

感谢你帮助保护 HotKey 社区。
