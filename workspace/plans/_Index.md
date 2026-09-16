---
type: workspace-index
workspace_type: plans
updated: 2026-09-14
---

# Plans

Weekly、Monthly 与 Quarterly 使用同一个 Period Plan 模型，在同页保存选择与复盘。

## 当前周期

```dataview
TABLE WITHOUT ID
  link(file.path, period) AS "周期",
  period_type AS "类型",
  status AS "状态",
  next_review AS "下次复核"
FROM "workspace/plans"
WHERE type = "period-plan" AND (status = "draft" OR status = "active")
SORT starts DESC
```

## 最近复盘

```dataview
TABLE WITHOUT ID
  link(file.path, period) AS "周期",
  period_type AS "类型",
  updated AS "复盘时间"
FROM "workspace/plans"
WHERE type = "period-plan" AND status = "reviewed"
SORT updated DESC
LIMIT 12
```
