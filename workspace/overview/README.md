---
type: workspace-index
updated: 2026-08-28
---

# Homepage 组件

本目录为 [[workspace/overview/home|Workspace Homepage]] 和 [[workspace/overview.canvas|Workspace Overview Canvas]] 提供共用的动态查询组件。自动启动使用紧凑的 Markdown Homepage；Canvas 保留为可手动进入的视觉布局。

- [[workspace/overview/calendar|Calendar]]：当前月份与 Daily 状态。
- [[workspace/overview/today|Today]]：当天 Daily 和当天任务切片。
- [[workspace/overview/todo|Tasks]]：读取 Task Entity 的活跃、阻塞和 Inbox 状态。
- [[workspace/overview/activity|Recent Activity]]：限量合并最近的 Daily、Douban 与 Wiki 活动。
- [[workspace/overview/shortcuts|Explore]]：Books、Movies、Series、Wiki 与 Knowledge Candidates 的紧凑入口。
- [[workspace/overview/media|Media]]、[[workspace/overview/knowledge|Knowledge]]：保留完整下钻视图，不在自动首页展开长列表。

组件只读取 Markdown、Properties 和任务，不在 Canvas 或视图中保存唯一事实。首页卡片默认只显示 4～5 项，完整历史继续由 Daily、Tasks、Media 和 Wiki 各自承载。

共用查询位于 `_views/homepage/view.js`，展示样式位于 `.obsidian/snippets/homepage.css`；后者必须在 Obsidian 的 CSS snippets 中启用。
