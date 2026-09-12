---
name: periodic-review
description: 在本 Obsidian Vault 创建或更新轻量 Weekly / Monthly Plan 与 Review；用户说“周复盘”“月度计划”“月度复盘”“/weekly-review”或“/monthly-plan”时，从 Daily、Task、Theme 和 Insight 汇总证据，并把阶段选择连接到同一组本地实体。
---

# Periodic Review

执行前阅读 schema/page-types/period-plan.md 与 schema/workflows/periodic-review.md。周期页属于 Workspace，不是 Wiki 知识或另一套任务事实。

## Weekly

路径为 workspace/plans/{YYYY}/weekly/{YYYY}-W{ww}.md，使用 weekly-plan-template.md。

- 读取上次 Review 之后的 Daily、Task 时间线、Theme 更新和 Insight。
- 汇总实际推进、知识收获、反复问题、意外工作和未闭环选择。
- 缺周时使用“自上次 Review 以来”的真实范围，不补造空白周报或机械完成率。

## Monthly

路径为 workspace/plans/{YYYY}/monthly/{YYYY-MM}.md，使用 monthly-plan-template.md。

- 从 Theme 中选择少量阶段结果，每项连接 Theme、Task 与可验证产物。
- 明确“想做但未排上”和计划外工作，避免把愿望全部伪装成承诺。
- 月末在同一页复盘实际结果、知识与 Insight、取舍和下月选择。

## 共通边界

- 日常执行状态只更新 Task Entity；周期页只引用，不复制 DIDA 任务树。
- 证据不足时保持 status: draft，不推断用户未表达的目标或完成状态。
- Review 可以提出新 Theme 或拆分建议，但不把一次出现的关键词自动提升为 Theme。
