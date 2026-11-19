---
type: schema
schema: page-type
page_type: workspace-record
updated: 2026-10-05
---

# Workspace Record

Workspace Record 保存人的当前状态、过程和未定稿内容，例如个人计划、草稿和学习笔记。Agent 会话、系统设计、迁移记录和知识库维护待办属于 `agents/`，不再归入个人 Workspace。

- 内容允许持续更新，但不自动视为长期知识事实。
- Agent 仅在用户授权或相关 Skill 已触发时修改。
- 页面应使用明确的 `type` 和必要状态字段，不强迫过程内容适配 Wiki Schema。
- 与已确认 Theme roadmap 对应的新增学习记录使用 [[agents/schema/page-types/learning-note|Learning Note]]，保存到 `workspace/learning/`；生成与维护见 [[agents/schema/workflows/learning|学习记录工作流]]。Reading Note 与 `raws/Notes/` 不因新增类型自动转换。
- 值得复用的结论通过 compile 进入 Wiki；已结束或失去价值的记录可以按授权范围归档。
