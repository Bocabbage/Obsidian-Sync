---
type: workspace-index
workspace_type: learning
updated: 2026-10-05
---

# 学习笔记

按已确认的 Theme roadmap 记录听课补充、想法和阶段整理。点击笔记查看全文，也可以从 Theme 的阶段入口直接进入相应标题。

```dataview
TABLE WITHOUT ID
  link(file.path, title) AS "学习笔记",
  themes AS "Theme",
  updated AS "更新"
FROM "workspace/learning"
WHERE type = "learning-note"
SORT updated DESC
```

使用说明见 [[workspace/learning/README|学习记录]]。
