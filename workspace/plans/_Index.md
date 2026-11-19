---
type: workspace-index
workspace_type: plans
updated: 2026-10-03
---

# Plans

这里汇总已有的周期计划与复盘。旧草案已清理，目前没有计划正文；列表为空是正常状态。目录说明见 [[workspace/plans/README|Plans]]。

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
