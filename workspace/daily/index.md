---
type: workspace-record
status: active
updated: 2026-08-25
---

# Daily 总览

Daily 正式路径为 `workspace/daily/{YYYY}/{YYYY-MM}/{YYYY-MM-DD}.daily.md`。当天任务以 Markdown task 保存；DIDA 只是可选关联，晚间专注汇总由 `/daily-review` 生成。

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

## 未闭环

```dataview
TASK
FROM "workspace/daily"
WHERE !completed
  AND status != "-"
  AND (
    meta(section).subpath = "大任务"
    OR meta(section).subpath = "小任务"
  )
GROUP BY file.link
SORT file.day DESC
```

## Knowledge Candidates

```dataview
TASK
FROM "workspace/daily"
WHERE !completed
  AND status != "-"
  AND meta(section).subpath = "Knowledge Candidates"
GROUP BY file.link
SORT file.day DESC
```
