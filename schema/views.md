---
type: schema
schema: views
updated: 2026-08-25
---

# 视图规范

```text
Markdown + YAML Properties + Markdown Tasks = 数据源
Bases + Dataview + Tasks = 查询和操作视图
Minimal/CSS snippets = 展示层
```

- 视图不成为唯一事实来源，删除视图后原始数据仍应完整存在。
- Bases 优先用于基于 Properties 的表格、卡片和筛选；Dataview 用于复杂查询、分组、统计和任务汇总。
- Markdown 表格只用于小型、稳定、手工维护的对照，不塞入大段正文或嵌套任务。
- Daily 的任务事实保留在 `大任务`、`小任务` 的 Markdown task 中；未闭环与 Knowledge Candidates 使用 Dataview `TASK` 派生，不复制原任务。
- Daily 的 DIDA 专注区是可重建快照，不代替 DIDA focus 明细；查询和 Canvas 只消费 Markdown 结果，不把视图本身作为事实源。
- 电影、书籍等竖版封面卡片使用 `cards-2-3`；方形图片使用 `cards-1-1`。
- 既有 Minimal 卡片继续使用 `cards`、`cards-cover`、`cards-left`、`cards-standardized`，公共样式放在 `.obsidian/snippets/card-layout.css`。
- 不直接修改主题原文件；样式变更只进入 snippets。
- Douban 卡片展示属于后续视图任务，不阻塞 Raw 导入与框架搭建。
