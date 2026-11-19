---
type: agent-index
updated: 2026-10-02
---

# Homepage 组件

本目录保存个人知识库的首页、Canvas 和共用查询实现。它是展示层；Daily、Todo、Task 等个人工作事实仍保存在 Workspace，来源与知识仍由 Raw 和 Wiki 承载。

本目录为 [[agents/views/overview/home|Workspace Homepage]] 和 [[agents/views/overview/overview.canvas|Workspace Overview Canvas]] 提供共用的动态查询组件。自动启动使用紧凑的 Markdown Homepage；Canvas 保留为可手动进入的视觉布局。

- [[agents/views/overview/calendar|Calendar]]：当前月份与 Daily 状态。
- [[agents/views/overview/today|Today]]：当天 Daily 和当天任务切片。
- [[agents/views/overview/todo|Tasks & Todos]]：读取月度 Todo 的未完成原条目，以及 Task Entity 的活跃、阻塞和 Inbox 状态。
- [[agents/views/overview/activity|Recent Activity]]：限量合并最近的 Daily、Douban 与 Wiki 活动。
- [[agents/views/overview/focus|Focus]]：当前 Period Plan、Active Theme、Recent Insight 与 Review 提醒。
- [[agents/views/overview/shortcuts|Explore]]：媒体、Theme、Plan、Insight、Wiki 与待分流记录的紧凑入口。
- [[agents/views/overview/media|Media]]、[[agents/views/overview/knowledge|Knowledge]]：保留完整下钻视图，不在自动首页展开长列表。

首页只聚合 Markdown、Properties 和任务，不在 Canvas 或视图中保存唯一事实。首页卡片默认只显示少量项目，完整历史继续由 Daily、Todos、Tasks、Themes、Plans、Insights、Media 和 Wiki 各自承载。

`_views/todo-pool/` 同时供 Daily 和 Todo 索引使用；显示录入日期和今日必做 / 逾期 / 常规任务；今日允许的添加、勾选与改期写入 Todo 原行，过去 Daily 只读展示历史，规则见 [[agents/schema/workflows/daily|Daily]] 和 [[agents/schema/views|视图规范]]。

共用查询位于 `_views/homepage/view.js`，展示样式位于 `.obsidian/snippets/homepage.css`；后者必须在 Obsidian 的 CSS snippets 中启用。

## Task Pool

`_views/task-pool/` 提供 Daily 关注组与全量任务池；传入 `{ mode: "manage" }` 用作关注组总览。创建/编辑/关闭由本地 Vault Daily Todos 插件执行并保存 Markdown。历史页只读每日组快照，视图渲染不写文件。

## Exercise History

`_views/exercise-history/` 从 Daily 的锻炼表逐条汇总某个动作的历史，复用模型解析训练行；只读展示，不合并同日记录。新动作页由 Daily Review 的 `exercise-review.mjs` 只读计划辅助创建。
