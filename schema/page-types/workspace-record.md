---
type: schema
schema: page-type
page_type: workspace-record
updated: 2026-08-25
---

# Workspace Record

Workspace Record 保存人的当前状态、过程和未定稿内容，例如 session、plan、draft、migration 和 backlog。

- 内容允许持续更新，但不自动视为长期知识事实。
- Agent 仅在用户授权或相关 Skill 已触发时修改。
- 页面应使用明确的 `type` 和必要状态字段，不强迫过程内容适配 Wiki Schema。
- 值得复用的结论通过 compile 进入 Wiki；迁移完成或失去价值的记录可以归档。
