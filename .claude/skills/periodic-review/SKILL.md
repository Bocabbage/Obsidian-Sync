---
name: periodic-review
description: 在本 Obsidian Vault 创建或更新轻量 Weekly / Monthly Plan 与 Review；用户说“周复盘”“月度计划”“月度复盘”“/weekly-review”或“/monthly-plan”时，从 Daily、Task、Theme 和 Insight 汇总证据，并把阶段选择连接到同一组本地实体。
---

# Periodic Review

执行前阅读 agents/schema/page-types/period-plan.md 与 agents/schema/workflows/periodic-review.md。周期页属于 Workspace，不是 Wiki 知识或另一套任务事实。

## Weekly

路径为 workspace/plans/{YYYY}/weekly/{YYYY}-W{ww}.md，使用 weekly-plan-template.md。

- 读取上次 Review 之后的 Daily、Todo 完成日期与 `workspace/daily/_meta/todos/` 快照、Task 时间线、Theme 更新和 Insight。Todo 按来源文件和 block ID 去重，不把多日快照当成多个任务。
- Task Todo 按 `Task 路径 + step ID` 聚合，用 Daily 与时间线看推进、原条目日期看子项闭环；不把每天自动续入计成新任务。小任务的常规 / 当日必做 / 逾期以当日 Todo 快照及当时应完成日期为准；常规任务不自动成为当日承诺，旧快照缺少安排字段时不补猜。
- 汇总实际推进、知识收获、反复问题、意外工作和未闭环选择。
- 长期未完成 Todo 作为重新安排、删除或提升 Task 的提醒；等待时间本身不使它自动成为 Task。
- 缺周时使用“自上次 Review 以来”的真实范围，不补造空白周报或机械完成率。

## Monthly

路径为 workspace/plans/{YYYY}/monthly/{YYYY-MM}.md，使用 monthly-plan-template.md。

- 按用户选择，从已认可的 Theme 或独立 Task 中安排少量阶段结果；连接执行与可验证产物，Theme 可选，不为配对补建。
- Todo 池包含常规任务及已有应完成日期的事项；区分明确安排和待选择事项，不把全部未完成小事复制进月度承诺，不用当前改期结果重判历史。
- 明确“想做但未排上”和计划外工作，避免把愿望全部伪装成承诺。
- 月末在同一页复盘实际结果、知识与 Insight、取舍和下月选择。

## 共通边界

- 跨日任务的持续状态更新 Task Entity / Task Todo，当天切片保留在 Daily；独立小事的持续状态更新月度 Todo。周期页只引用，不复制状态清单或 DIDA 任务树。
- 证据不足时保持 status: draft，不推断用户未表达的目标或完成状态。
- Review 只能建议新 Theme 或拆分，须用户明确确认后执行（包括 seed）；一般整理授权、重复工作或 Plan 草案不代表创建/激活许可。
- Theme 可以是持续方向或阶段性事项，保存目的、范围、路线和结果；复盘优先检查与本次问题相关的 `materials` 及正文上下文，明确相关的新 Raw 按 Knowledge Intake 补入列表。不复制 Task 进度或把全部活动视为主题贡献；Daily 不要求动作级 Theme 标记。
- 工时读取 `workspace/daily/_meta/focus/` 的每日映射与 focus 记录快照，按日期与记录键去重；待归属单列，缺快照不当作零，不用当前映射重算历史或把季度 DIDA 总量重复分配，不推导精确 Theme 工时。
