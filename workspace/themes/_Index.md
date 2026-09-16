---
type: workspace-index
workspace_type: themes
updated: 2026-09-14
---

# Themes

Theme 是你主动设立、用于指导任务的持续研究或学习方向，不是自动提炼的项目分类。Agent 可以建议，但未经你确认不会创建（包括 seed）。创建规则见 [[schema/page-types/theme|Theme Schema]]。

## 当前关注

```dataview
TABLE WITHOUT ID
  link(file.path, title) AS "Theme",
  status AS "状态",
  next_review AS "下次复核",
  updated AS "更新"
FROM "workspace/themes"
WHERE type = "theme" AND status != "closed"
SORT choice(status = "active", 1, choice(status = "seed", 2, 3)) ASC, next_review ASC, updated DESC
```

## 已关闭

```dataview
LIST
FROM "workspace/themes"
WHERE type = "theme" AND status = "closed"
SORT updated DESC
```
