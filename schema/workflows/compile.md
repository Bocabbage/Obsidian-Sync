---
type: schema
schema: workflow
workflow: compile
updated: 2026-09-14
---

# Compile Workflow

Compile 将 Raw、Theme、其他 Workspace 材料或 Wiki Legacy 整理为可复用的长期知识。

## 流程

1. 明确本次编译的领域、问题、输出目标、版本范围和文件边界。
2. 区分来源事实、个人记录、既有综合结论和派生视图。
3. 检索现有 Wiki 页面，优先更新已有概念和实体，避免重复建页。
4. 合并重复信息，保留分歧、适用条件和不确定性。
5. 为核心结论建立 `sources`，必要时先创建来源页。
6. 更新相关 Map、索引和 `updated` 日期。
7. 回链相关 Theme、Daily 或 Workspace 材料，分别记录 Wiki、项目文档或其他目标的输出状态。
8. 在 `wiki/_meta/log.md` 记录编译范围和主要变化。

## 渐进编译

- Theme 可以只编译其中一个已经成熟的问题，其余内容继续留在 Workspace。
- Theme 中积累的暂定理解不能替代一手来源；Wiki 结论仍需链接 Raw、来源页或明确标注为个人判断。
- 涉及代码或产品行为时保留版本、提交或来源日期，不能把某一时点观察写成永久规则。
- 一个主题需要输出到 Wiki、项目文档或其他系统时，各目标分别记录结果，不能用其中一个完成状态代替全部。

## Legacy 编译

- Wiki 内 Legacy 可直接作为待整理材料，但不假定其字段或来源完整。
- Root Legacy 先按 `migrate-legacy.md` 拆分所有权，再分别进入 Raw、Workspace 或 Wiki。
- 不在一个未审阅批次中大规模重命名、拆分和改写多个领域。
