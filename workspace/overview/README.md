---
type: workspace-index
updated: 2026-08-27
---

# Homepage 组件

本目录为 [[workspace/overview/home|Workspace Homepage]] 和 [[workspace/overview.canvas|Workspace Overview Canvas]] 提供共用的动态查询组件。自动启动使用 Markdown Homepage；Canvas 保留为可手动进入的视觉布局。

- [[workspace/overview/calendar|Calendar]]：当前月份与 Daily 状态。
- [[workspace/overview/today|Today]]：当天 Daily 和当天任务切片。
- [[workspace/overview/media|Media]]：Douban 目录入口与最近记录。
- [[workspace/overview/todo|Todo]]：当前以 Daily 未闭环为适配层，预留长期 Todo 入口。
- [[workspace/overview/knowledge|Knowledge]]：Knowledge Candidates 与最近 Wiki 更新。

组件只读取 Markdown、Properties 和任务，不在 Canvas 或视图中保存唯一事实。未来 Todo 数据模型落地后，优先替换 `todo.md` 的查询来源，保持 Canvas 布局和入口稳定。

共用查询位于 `_views/homepage/view.js`，展示样式位于 `.obsidian/snippets/homepage.css`；后者必须在 Obsidian 的 CSS snippets 中启用。
