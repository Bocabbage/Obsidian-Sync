---
type: schema
schema: workflow
workflow: periodic-review
updated: 2026-09-14
---

# Periodic Review Workflow

Periodic Review 以实际证据建立全局视角，不要求为了形式每天、每周补齐统计。

## Weekly

1. 读取上次 Review 之后的 Daily、Task 时间线、Theme 更新和 Insight。
2. 汇总实际推进、获得的知识、反复出现的问题、意外工作和仍未闭环的选择。
3. 可以建议新建或拆分 Theme，但必须由用户明确确认后执行；未确认建议留在 Review，不建 seed 候选页。
4. 写入同一个 Weekly 页面；缺周时直接覆盖“自上次 Review 以来”，不补造空白周报。

## Monthly

1. 根据用户选择，从已认可的 Theme 或独立 Task 中安排少量本月阶段结果，而不是复制所有愿望。
2. 每个结果链接相关 Task 和可验证产物，Theme 可选；不为独立事务补建 Theme。未获投入的愿望写入“想做但未排上”，Plan 草案不自动激活 Theme。
3. 月末按证据记录完成、部分完成、放弃或被计划外工作替代，并说明取舍。
4. 复盘结果用于下一月选择和季度方向判断，不反向覆盖 Task 全局状态。

## Quarterly

1. 只确定少量方向、为什么值得投入、投入边界和季度末判断标准。
2. 引用相关 Theme；具体执行留给 Monthly、Weekly 与 Task。
3. 季度复盘汇总方向是否得到真实推进、哪些 Theme 值得继续，以及哪些方向主动停止。

## 与 DIDA 的关系

DIDA 可以执行和计时，Period Plan 不复制其任务树；稳定外部链接保存在 Task Entity，Plan 通过本地 Task 链接获得执行证据。

- 工时汇总读取 `workspace/daily/_meta/focus/` 保存的日期、归属和记录快照，不用当前映射把长期 DIDA 总量重复分配给多个 Task。
- 汇总按日期与记录键去重；待归属记录单列，不计入任何 Task 小计；旧 Daily 缺少可核验快照时标为缺失/旧口径，不当作零时长。
- Theme 看问题、理解与成果变化，不把关联 Task 全部进度或工时视为该 Theme 的贡献；无需动作级标签。
