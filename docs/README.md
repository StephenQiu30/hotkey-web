# 文档目录 - hotkey-web

本目录包含 hotkey-web 项目的各类文档，按类型组织。

## 目录结构

```
docs/
├── README.md          # 本文件
├── TEMPLATE.md        # 标准文档模板
├── prd/               # 产品需求文档（编号 1-25）
├── plans/             # 实现计划（编号 1-30）
├── design/            # 技术设计文档
├── acceptance/        # 验收测试文档
└── operations/        # 运维文档
```

## 文档规范

### 文档要求
- 只有对项目有长期影响的文档才放入 `docs/`
- 临时事项如待办列表、进度笔记放在对应的 Linear ticket 或 PR 中
- 正式文档需要 YAML frontmatter，包含 `layer`、`doc_no`、`audience`、`purpose` 等元数据字段
- 使用 `TEMPLATE.md` 作为标准模板

### 文档类型

| 目录 | 说明 | 编号规则 |
|------|------|----------|
| `prd/` | 产品需求文档 | 编号 1-25 |
| `plans/` | 实现计划 | 编号 1-30 |
| `design/` | 技术设计文档 | 自由命名 |
| `acceptance/` | 验收测试文档 | 自由命名 |
| `operations/` | 运维文档 | 自由命名 |

### 文档生命周期

1. **草稿**：`status: draft`
2. **评审中**：`status: review`
3. **已批准**：`status: approved`
4. **已废弃**：`status: deprecated`

### 变更记录

每个文档必须包含变更记录部分，记录版本、日期、作者和变更说明。
