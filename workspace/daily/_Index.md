---
type: workspace-index
status: active
updated: 2026-10-03
---

# Daily 总览

Daily 正式路径为 `workspace/daily/{YYYY}/{YYYY-MM}/{YYYY-MM-DD}.daily.md`。一次性小事由 [[workspace/todos/_Index|小任务待办池]] 保存唯一 Checkbox，在 Daily 的“小任务”直接处理；跨日任务由 [[workspace/tasks/_Index|Tasks]] 保存身份与全局状态；Daily 的 Markdown task 只表示当天 occurrence。

跨日子项由 Task Todo 承接；新建今天的日记自动续入，复盘补交接。如果先建日记再补复盘，使用命令 **Vault Daily Todos: 续入今天尚未列出的 Task Todo**。历史页不刷新为当前待办。详见 [[agents/schema/workflows/task-todo|续入规则]]。

## 最近 Daily

```dataview
TABLE WITHOUT ID
  link(file.path, dateformat(date, "yyyy-MM-dd")) AS "日期",
  status AS "复盘"
FROM "workspace/daily"
WHERE type = "daily"
SORT date DESC
LIMIT 14
```

## 活跃 Tasks

```dataview
TABLE WITHOUT ID
  link(file.path, title) AS "任务",
  priority AS "优先级",
  status AS "状态",
  due AS "截止"
FROM "workspace/tasks"
WHERE type = "task" AND (status = "active" OR status = "blocked" OR status = "inbox")
SORT choice(priority = "high", 1, choice(priority = "normal", 2, 3)) ASC, due ASC, updated DESC
```

## 当前轻量待办

```dataviewjs
await dv.view("agents/views/overview/_views/todo-pool");
```

## 已关闭 Daily 的收口异常

```dataview
TASK
FROM "workspace/daily"
WHERE file.frontmatter.status = "closed"
  AND (status = " " OR status = "/")
  AND (
    meta(section).subpath = "跨日任务"
    OR meta(section).subpath = "当日任务"
    OR meta(section).subpath = "今日安排"
    OR meta(section).subpath = "1 高优先级"
    OR meta(section).subpath = "2 低优先级"
    OR meta(section).subpath = "WORK"
    OR meta(section).subpath = "LIFE"
  )
GROUP BY file.link
SORT file.day DESC
```

## 历史待分流

这里保留旧 Daily 中明确列出的候选。新记录直接写在小零碎，复盘时再整理。

```dataviewjs
await dv.view("agents/views/overview/_views/homepage", { panel: "candidates" });
```
