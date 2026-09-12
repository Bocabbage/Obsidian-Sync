---
name: quarterly-plan
description: 在本 Obsidian Vault 创建或更新季度方向与季度复盘；用户说“季度计划”“规划 Qx”“季度复盘”或“/quarterly-plan”时，用 Theme 表达持续关注、用月度 Plan 和 Task 承接执行，不再维护 YEC/SGT 等旧分类任务表。
---

# Quarterly Plan

季度页只保存方向、投入边界和判断标准，不复制月度或 DIDA 任务树。执行前阅读 schema/page-types/period-plan.md 与 schema/workflows/periodic-review.md。

## 路径

~~~text
workspace/plans/{YYYY}/quarterly/{YYYY}-Q{n}.md
~~~

从 schema/templates/quarterly-plan-template.md 创建；存在时更新原页，不覆盖人工内容。

## 创建或更新

- 先读取前一季度、当前 Monthly Plan、active / seed Theme 和活跃 Task，只把它们作为选择证据。
- 每个方向说明为什么值得投入、关联 Theme、明确不投入什么，以及季末用什么证据判断是否推进。
- 具体事项连接到 Monthly Plan 或本地 Task；DIDA 链接继续保存在 Task Entity。
- 旧 YEC、SGT、MBE、BBR、SBK 分类或旧计划 ID 只作为 Archived 历史，不在新页中延续。
- 缺少足够目标信息时建立 status: draft，并明确哪些内容来自现有记录；不要替用户虚构承诺。

## 季度复盘

- 汇总得到真实推进的方向和产物，不用完成任务数代替结果。
- 记录值得继续、暂停或主动停止的 Theme，以及影响投入的计划外工作。
- 将页面 status 更新为 reviewed；Task 的全局状态仍由 Task Entity 维护。
