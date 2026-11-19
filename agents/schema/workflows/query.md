---
type: schema
schema: workflow
workflow: query
updated: 2026-10-02
---

# Query Workflow

Query 默认针对已编译 Wiki，而不是每次从所有 Raw 重新发现知识。

## 流程

1. 从 `wiki/index.md` 和相关领域 Map 定位候选页面。
2. 阅读相关 concept、entity、synthesis 和来源页。
3. 仅在需要核实原文、补充缺口或确认引用时进入 Raw。
4. 对 Wiki Legacy 中的内容注明其 provisional 状态和可能缺失的来源链。
5. 回答中区分既有知识、来源事实和新的推断。
6. 只有具备长期复用价值时才把查询结果保存为 synthesis，并更新索引和日志。

## 默认排除

- Root Legacy 不参加普通 Query，以免与 Raw、Workspace 或 Wiki 内容重复。
- Archived 不参加 Query，除非用户明确要求历史检索。
- Agent 会话、暂定草稿和 Workspace 计划不作为一般事实来源；涉及操作追溯、待审核材料或用户当前状态时才按需读取。
