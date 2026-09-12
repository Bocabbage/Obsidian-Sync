---
type: workspace-index
status: active
updated: 2026-08-28
---

# Tasks

Task Entity 保存跨日任务的本地身份和全局状态；Daily 的“跨日任务”保存每天实际计划与推进的 occurrence，“当日任务”保存无需独立建页的一次性事项。

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
- 任务需要继续到以后时才提升；不要为每个 Checkbox 建页。
- DIDA 只是 Task Entity 的可选外部映射，不覆盖本地状态。
