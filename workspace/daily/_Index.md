---
type: workspace-index
status: active
updated: 2026-09-14
---

# Daily 总览

Daily 正式路径为 `workspace/daily/{YYYY}/{YYYY-MM}/{YYYY-MM-DD}.daily.md`。跨日任务由 [[workspace/tasks/_Index|Tasks]] 保存身份与全局状态，Daily 的 Markdown task 只表示当天 occurrence。

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

## 已关闭 Daily 的收口异常

```dataview
TASK
FROM "workspace/daily"
WHERE file.frontmatter.status = "closed"
  AND (status = " " OR status = "/")
  AND (
    meta(section).subpath = "跨日任务"
    OR meta(section).subpath = "当日任务"
    OR meta(section).subpath = "1 高优先级"
    OR meta(section).subpath = "2 低优先级"
    OR meta(section).subpath = "WORK"
    OR meta(section).subpath = "LIFE"
  )
GROUP BY file.link
SORT file.day DESC
```

## 待分流

```dataviewjs
await dv.view("workspace/overview/_views/homepage", { panel: "candidates" });
```
