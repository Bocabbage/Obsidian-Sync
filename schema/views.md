---
type: schema
schema: views
updated: 2026-08-28
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
- Task Entity 的全局状态保存在 `workspace/tasks/`，Daily 的 `大任务`、`小任务` 只保存当天 occurrence；Knowledge Candidates 和检查视图使用 Dataview 派生，不复制原任务。
- Daily 的 DIDA 专注区是可重建快照，不代替 DIDA focus 明细；查询和 Canvas 只消费 Markdown 结果，不把视图本身作为事实源。
- 电影、书籍等竖版封面卡片使用 `cards-2-3`；方形图片使用 `cards-1-1`。
- 既有 Minimal 卡片继续使用 `cards`、`cards-cover`、`cards-left`、`cards-standardized`，公共样式放在 `.obsidian/snippets/card-layout.css`。
- 不直接修改主题原文件；样式变更只进入 snippets。
- Douban 媒体目录使用 `wiki/sources/_views/douban-catalog/` 的可复用 DataviewJS 视图，直接读取 Raw 和根 `assets/`；同名封面缺失时只读解析 Raw 中的插件封面路径，失效时只接受唯一的文件名前缀候选。
- 目录可以按标题、状态和分支筛选，并显示 WeRead、Reading Note 或 Viewing Note 链接；这些派生关系不成为新的事实来源。
- ISBN 自动关联仅适用于没有人工覆盖的完全一致值；`source-link` 的冲突、拒绝和相关版本判断优先于自动结果。
- `workspace/overview/home.md` 是稳定的工作日自动启动页，`workspace/overview.canvas` 是同一组组件的手动视觉布局；动态内容由 `workspace/overview/` 中的 DataviewJS 组件提供，两种入口都不保存任务、媒体或知识事实。
- Homepage 的 Today 与 Calendar 消费 Daily，Media 只读消费 Douban Raw，Knowledge 消费 Daily Candidates 与 Wiki，Todo 消费 `workspace/tasks/` 的全局状态并保留系统 Backlog 入口。
- 修改 Homepage 时保持组件入口稳定，优先替换查询来源而不是在首页或 Canvas 文本节点中复制结果；完整规则见 `schema/workflows/homepage.md`。
