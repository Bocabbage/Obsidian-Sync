---
type: schema
schema: page-type
page_type: task
updated: 2026-09-12
---

# Task Entity

Task Entity 是本 Vault 中需要跨日承接、独立统计或稳定外部关联的 Workspace 任务实体。它保存任务身份和全局状态；Daily 只保存某一天实际计划或推进的 occurrence。

## 路径与 ID

```text
workspace/tasks/TASK-{YYYYMM}-{NNN}.md
```

- `task_id` 固定使用文件名中的本地 ID，例如 `TASK-202608-001`。
- 序号按创建月份递增；创建前扫描已有 ID，禁止复用或因标题变化重新编号。
- Task ID 只在本 Vault 内有效，不作为 DIDA、飞书或其他系统的公共身份。

## Properties

```yaml
---
type: task
task_id: TASK-202608-001
title: 示例任务
status: active
priority: normal
created: 2026-08-28
updated: 2026-09-12
due:
dida_project_id:
dida_task_id:
dida_url:
themes: []
---
```

字段约束：

- `status` 取值为 `inbox`、`active`、`blocked`、`done` 或 `cancelled`。
- `priority` 取值为 `high`、`normal` 或 `low`，表示任务池中的全局优先级；Daily 的高低分组只表示当天排序，两者无需强制一致。
- `due` 可选，只在存在真实截止日期时填写 `YYYY-MM-DD`。
- 任务进入 `done` 或 `cancelled` 时必须增加 `closed: YYYY-MM-DD`；Daily 任务池以该日期保留历史时点上的未闭环任务。
- DIDA 字段可选；存在关联时同时保存 project ID、task ID 和稳定 Webapp URL。其他外部系统以后使用独立适配字段，不复用 `task_id`。
- `themes` 可选，用于连接一个或多个持续关注主题；Task 状态仍独立于 Theme 和 Period Plan。

## 何时建立 Task Entity

满足任一条件时建立或提升为 Task Entity：

- 已知会跨日推进；
- 需要在 Weekly Review 中按同一事项聚合；
- 需要保存 DIDA 等稳定外部映射或统计专注；
- 当日 inline task 未完成，并且用户决定以后继续；
- 需要独立记录目标、阻塞、下一步或任务级结论。

当日即可完成、无需独立统计的一次性事项继续只写在 Daily 的“当日任务”，不创建空壳页面。

## Daily occurrence

Task Entity 在 Daily 中以 wikilink 标识所有权：

```markdown
- [ ] [[workspace/tasks/TASK-202608-001|示例任务]] — 今天计划完成的切片
  - [ ] 当天子任务
```

- 同一 Task 可以出现在多个 Daily；每天的文案和子任务可以不同，但必须链接同一实体。
- Daily Checkbox 只表示当日 occurrence，不自动覆盖 Task Entity 的全局 `status`。
- 已完成 Daily 中的 occurrence 必须使用 `[x]`、`[-]` 或 `[>]` 收口；`[>]` 表示当天已交接给 Task Entity，不表示全局任务完成。
- Task Entity 的 `done` / `cancelled` 是全局闭环事实；旧 Daily 无需因全局状态变化被反向改写。

## 身份归并

- 相同 `task_id` 必然是同一任务。
- 相同且非空的 `dida_task_id` 可以精确归并到同一 Task Entity。
- 没有稳定外部 ID 时，标题相似只产生人工候选；只有目标、范围和连续上下文都一致时才能合并。
- 一次性子任务、同一项目下的不同事项、日期不同的例行执行不得仅因关键词相同而合并。

## 页面正文

- `目标`：任务完成时应成立的结果。
- `当前状态`：下一步、阻塞或需要保留的任务级上下文。
- `Daily 时间线`：按 `### YYYY-MM-DD` 日期小标题维护，每天只保留一条来源 Daily 链接和一句 occurrence 摘要；不使用 Dataview 或表格，也不复制当天完整正文。
- `任务级结论`：只有跨日仍有价值的决定或结论；当天进展继续写在 Daily。
