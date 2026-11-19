---
type: workspace-index
status: active
updated: 2026-09-20
---

# Tasks

Task Entity 保存需要多次推进的任务身份和全局状态；Daily 的“跨日任务”保存每天实际计划与推进的 occurrence，“当日任务”保存今天计划收口的一次性事项，未排期或延期的一次性小事进入 [[workspace/todos/_Index|小任务待办池]]。

每个 Task 的 `Todo` 保存跨日子项；Daily 的 `待办` 链接跳转同一条原记录，复盘更新、次日续入。月度小任务池仍独立。详见 [[agents/schema/workflows/task-todo|续入规则]]。

## 活跃任务

```dataview
TABLE WITHOUT ID
  link(file.path, title) AS "任务",
  task_id AS "Task ID",
  priority AS "优先级",
  status AS "状态",
  due AS "截止"
FROM "workspace/tasks"
WHERE type = "task" AND (status = "active" OR status = "blocked" OR status = "inbox")
SORT choice(priority = "high", 1, choice(priority = "normal", 2, 3)) ASC, due ASC, updated DESC
```

## 最近闭环

```dataview
TABLE WITHOUT ID
  link(file.path, title) AS "任务",
  task_id AS "Task ID",
  status AS "状态",
  closed AS "闭环日期"
FROM "workspace/tasks"
WHERE type = "task" AND (status = "done" OR status = "cancelled")
SORT closed DESC, updated DESC
LIMIT 12
```

## 使用约定

- Daily 中通过 `[[workspace/tasks/TASK-YYYYMM-NNN|任务标题]]` 引用同一任务。
- 执行本身需要多次推进、独立上下文、稳定映射或统计时才提升；单纯以后再做的小事留在 Todo，不为每个 Checkbox 建页。
- DIDA 只是 Task Entity 的可选外部映射，不覆盖本地状态。
- `dida_urls` 可放多个父/子任务链接，也允许不同本地 Task 共用同一来源；需统计的子任务单独加入，不自动展开父任务。详见 [[agents/schema/page-types/task|Task 规则]]。

## 周期关注

[[workspace/task-groups/_Index|任务关注组]] 可组织季度 LIFE 或版本迭代的重点任务，并在 Daily 任务池置顶。未分组任务仍正常参与 Daily，关闭组不会关闭任务。
