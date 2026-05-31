# WORKFLOW.md — hotkey-web 工作流调度契约

本文件定义 hotkey-web 项目基于 Linear Ticket 的工作流调度规范。

## 配置

```yaml
# Linear 配置
tracker: linear
polling: 5000ms

# 活跃状态
active_states:
  - Todo
  - In Progress
  - Merging
  - Rework

# 终态
terminal_states:
  - Closed
  - Cancelled
  - Done
  - Duplicate

# Agent 配置
agent:
  max_concurrent: 10
  max_turns: 20

# Claude runner
claude:
  command: claude --dangerously-skip-permissions
```

本工作流默认使用 Claude 执行。所有进度事实源使用 `## Claude Workpad`，可复用流程和角色配置使用 `.claude/` 路径。

## Ticket 状态机

```
Backlog → Todo → In Progress → Human Review → Merging → Done
                                    ↓
                                  Rework
```

### 状态说明

| 状态 | 行为 |
|------|------|
| **Backlog** | 需要手动提升到 Todo |
| **Todo** | 可被 Symphony runner 接收执行 |
| **In Progress** | Agent 在隔离工作区执行 |
| **Human Review** | 需要 PR 和证据就绪 |
| **Merging** | 执行合并流程 |
| **Rework** | 完整重做流程，不是补丁 |

## 执行流程

### Step 0: 确定 Ticket 状态
1. 读取当前 ticket 状态
2. 路由到对应流程
3. 检查是否存在已关闭的 PR
4. 处理 Todo ticket 的启动序列

### Step 1: 开始/继续执行
1. 查找或创建 Workpad 评论
2. 协调计划
3. 执行 pull skill
4. 捕获复现信号

### Step 2: 执行阶段
1. 实现变更
2. 验证
3. 推送代码
4. 附加 PR，添加 `symphony` 标签
5. 合并最新 `origin/main`
6. 更新 Workpad 最终状态，包含"Confusions"部分

### Step 3: 人工审查与合并
1. 轮询更新
2. 如需返工，遵循 rework 流程
3. 执行 `.claude/skills/land/SKILL.md` 中的 `land` skill 进行合并

### Step 4: 返工处理
1. **视为完整方案重置，不是增量补丁**
2. 关闭现有 PR
3. 创建新分支
4. 从头开始

## PR 反馈扫描协议

当 ticket 有附加 PR 时：
1. 收集所有反馈
2. 将可操作的评论视为阻塞项
3. 直到被解决或推送反对意见后才继续

## 完成标准

进入 Human Review 前必须满足：
- [ ] Workpad 已更新，所有项已勾选
- [ ] 按 ticket 要求执行验证
- [ ] 测试/lint/构建通过
- [ ] PR 已创建/更新，已关联 ticket
- [ ] PR 检查通过
- [ ] 反馈扫描完成
- [ ] 如适用，UI 证据已提供

## Workpad 模板

每个 Linear ticket 维护一个持久评论作为唯一事实来源：

```markdown
## Claude Workpad

### 环境
- 时间：{{ timestamp }}
- 分支：{{ branch }}
- 提交：{{ commit }}

### 计划
- [ ] 任务 1
- [ ] 任务 2
- [ ] 任务 3

### 验收标准
- [ ] 标准 1
- [ ] 标准 2

### 验证
- [ ] 单元测试通过
- [ ] 集成测试通过
- [ ] Lint 检查通过
- [ ] 构建成功

### 备注
（进度和决策记录）

### 困惑
（不确定或需要澄清的事项）
```

## 护栏规则

1. 每个 issue 只维护一个 Workpad 评论
2. 不编辑 issue 正文
3. 临时证据编辑必须还原
4. 超出范围的工作放入单独的 Backlog issue
5. 功能或行为变更默认 test-first；文档、清理、CI 和删除无用代码可用可执行验证替代红灯测试
