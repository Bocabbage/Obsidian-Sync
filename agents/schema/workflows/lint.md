---
type: schema
schema: workflow
workflow: lint
updated: 2026-08-25
---

# Lint Workflow

Lint 检查 Wiki 和 Schema 的结构健康，不擅自进行破坏性修复。

## 检查项

- 根 `AGENTS.md`、Schema、领域 Agent 路由和 Skills 是否引用存在的路径。
- 新建页面的 YAML 是否位于文件开头、字段类型是否符合页面类型。
- wikilinks、Markdown links、Dataview 路径和附件引用是否有效。
- concept、entity、synthesis 是否缺少来源链。
- 是否存在孤立页、重复概念、同名歧义、过时结论或互相矛盾的页面。
- `wiki/**/legacy-*` 是否满足移除前缀的条件。
- Root Legacy、Archived 或 Raw 是否被错误纳入普通视图和 Query。

## 输出

- 将本次检查范围、发现和待处理项写入 `wiki/_meta/lint-report.md`。
- 可以自动修复明确、局部、可逆的问题；移动、合并或删除必须先确认范围。
- 不为了达到“零告警”而隐藏确实存在的来源缺口或迁移债务。
