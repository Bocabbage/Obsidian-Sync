---
type: schema
schema: page-type
page_type: period-plan
updated: 2026-09-14
---

# Period Plan

Period Plan 在同一页面保存一个周期的选择与复盘，并通过 Theme、Task 和产物链接连接知识系统与执行系统。

## 路径

~~~text
workspace/plans/{YYYY}/weekly/{YYYY}-W{ww}.md
workspace/plans/{YYYY}/monthly/{YYYY-MM}.md
workspace/plans/{YYYY}/quarterly/{YYYY}-Q{n}.md
~~~

## Properties

~~~yaml
---
type: period-plan
period_type: weekly
period:
status: draft
starts: YYYY-MM-DD
ends: YYYY-MM-DD
created: YYYY-MM-DD
updated: YYYY-MM-DD
next_review:
---
~~~

- period_type 取值为 weekly、monthly 或 quarterly。
- status 取值为 draft、active、reviewed 或 cancelled。
- next_review 只用于视图提醒，不替代页面中的真实复盘。

## 层级职责

- Weekly 汇总自上次 Review 以来的推进、学习、反复问题、Theme 与 Insight，不强求完成率。
- Monthly 从用户认可的 Theme 或独立 Task 中选择少量阶段结果，连接执行与预期产物，并记录“想做但没有排上”的事项；Theme 不是必填上级。
- Quarterly 只表达方向、投入边界和判断标准，不复制月度或 Task 清单。
- 一个 Task 可以关联多个周期，但全局状态仍只保存在 Task Entity。
