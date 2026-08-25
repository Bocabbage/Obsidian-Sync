---
type: schema
schema: workflow
workflow: compile
updated: 2026-08-25
---

# Compile Workflow

Compile 将 Raw、Workspace 或 Wiki Legacy 中的材料整理为可复用的长期知识。

## 流程

1. 明确本次编译的领域、问题和文件边界。
2. 区分来源事实、个人记录、既有综合结论和派生视图。
3. 检索现有 Wiki 页面，优先更新已有概念和实体，避免重复建页。
4. 合并重复信息，保留分歧、适用条件和不确定性。
5. 为核心结论建立 `sources`，必要时先创建来源页。
6. 更新相关 Map、索引和 `updated` 日期。
7. 在 `wiki/_meta/log.md` 记录编译范围和主要变化。

## Legacy 编译

- Wiki 内 Legacy 可直接作为待整理材料，但不假定其字段或来源完整。
- Root Legacy 先按 `migrate-legacy.md` 拆分所有权，再分别进入 Raw、Workspace 或 Wiki。
- 不在一个未审阅批次中大规模重命名、拆分和改写多个领域。
