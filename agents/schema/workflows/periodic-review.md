---
type: schema
schema: workflow
workflow: periodic-review
updated: 2026-10-05
---

# Periodic Review Workflow

Periodic Review 以实际证据建立全局视角，不要求为了形式每天、每周补齐统计。Theme 可以是持续方向，也可以是旅行等阶段性事项；复盘依据其目的、范围、路线和结果，不要求都产出学习笔记。

检查相关 Theme 时，优先查看与本次复盘问题有关的 `materials` 及正文上下文；新发现明确相关的 Raw 按 Knowledge Intake 维护关联，不从材料数量或标签相同推断进展、完成或 Theme 状态。

学习类 Theme 还应查看 roadmap 链接的 Learning Note 中相关的新记录、问题变化、例子和阶段整理，以实际内容判断理解与安排的变化。笔记骨架和提示不算学习进展，空白段落也不能证明没有学习；不为复盘自动补造笔记、Task 或完成状态。

## Weekly

1. 读取上次 Review 之后的 Daily、Todo 完成日期与 `_meta/todos/` 的每日快照、Task 时间线、Theme 更新和 Insight；同一 Todo 按来源文件和 block ID 去重，不把每天的未完成快照算成多个任务。
   Task Todo 则按 `Task 路径 + step ID` 聚合；多日 occurrence 只是推进证据，不重复算新任务。子项完成看原条目结束日期，过程看 Task Todo 的日期笔记与来源 Daily；小任务不计作 Daily occurrence；常规任务不要求当天清空，今日必做与逾期项是否处理以当天快照为准，不能拿今天的安排重判历史。旧候选池继续兼容。
2. 汇总实际推进、获得的知识、反复出现的问题、意外工作和仍未闭环的选择；长期未完成 Todo 只作为提醒，不伪装成跨日 Task。
3. 可以建议新建或拆分 Theme，但必须由用户明确确认后执行；未确认建议留在 Review，不建 seed 候选页。
4. 写入同一个 Weekly 页面；缺周时直接覆盖“自上次 Review 以来”，不补造空白周报。

## Monthly

1. 根据用户选择，从已认可的 Theme 或独立 Task 中安排少量本月阶段结果，而不是复制所有愿望；Todo 池只提供尚未排期事项，不因月度规划自动全部提升。
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
- Theme 看目的、安排与实际结果的变化，学习方向也可记录问题和理解；不把关联 Task 全部进度或工时视为该 Theme 的贡献，无需动作级标签。
