---
type: workspace-index
workspace_type: insights
updated: 2026-09-12
---

# Insights

按月保存值得以后重读的想法，不要求分类、编号或转成任务。条目格式见 [[schema/page-types/insight-log|Insight Log Schema]]。

```dataview
TABLE WITHOUT ID
  link(file.path, period) AS "月份",
  status AS "状态",
  updated AS "更新"
FROM "workspace/insights"
WHERE type = "insight-log"
SORT period DESC
```
