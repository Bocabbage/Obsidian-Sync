---
type: workspace-index
workspace_type: themes
updated: 2026-10-05
---

# Themes

Theme 是你主动设立、值得独立规划和回看的方向或阶段性事项，保存目的、范围、推进路线和结果，并指导 Task。跨季度学习和一次旅行都可以使用，由你决定开始、暂停或结束。Agent 可以建议，但未经你确认不会创建（包括 seed）。创建规则见 [[agents/schema/page-types/theme|Theme Schema]]。

每个 Theme 的 `materials` 属性列出明确相关的 Raw，点开即可阅读；在 Raw 的原生反向链接中可以看到引用它的 Theme。同一份材料可以服务多个 Theme，暂时没有归属的材料也可以继续保留。

学习类 Theme 确认 roadmap 后，会有一份主学习笔记；从路线里的“记录入口”可以直接打开相应阶段。个人笔记通过路线和正文关联，全部笔记见 [[workspace/learning/_Index|学习笔记索引]]。

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
