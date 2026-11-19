---
type: schema
schema: views
updated: 2026-10-03
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
- Todo 的当前状态与录入/结束日期保存在 `workspace/todos/` 月文件原行。Daily 的“小任务”直接展开 `todo-pool`，与待办总览操作同一原条目并自动记日期；显示录入日期，按今日必做、逾期、常规任务分组，提供添加时选择与原条目安排 / 改期入口；历史按本页日期读复盘快照或日期回看，只读展示。Task Entity 的全局状态保存在 `workspace/tasks/`，Daily 的“跨日任务”保存 Task occurrence。新 Daily 不设材料或待分流栏；既有候选视图兼容旧待分流 / Knowledge Candidates 的普通列表和 Markdown task，不把全部小零碎自动聚合为候选。
- Daily 的小任务按 Todo 原条目统计，不重复参与 Today/Calendar 的 occurrence 数量；旧当日任务继续统计，旧折叠候选池继续排除。Task Todo 的自动续入由本地插件写为当天静态 Markdown，不由 Dataview 渲染写入、不用动态查询替代历史。
- Daily 的 DIDA 专注区是可重建快照，不代替 DIDA focus 明细；查询和 Canvas 只消费 Markdown 结果，不把视图本身作为事实源。
- 电影、书籍等竖版封面卡片使用 `cards-2-3`；方形图片使用 `cards-1-1`。
- 既有 Minimal 卡片继续使用 `cards`、`cards-cover`、`cards-left`、`cards-standardized`，公共样式放在 `.obsidian/snippets/card-layout.css`。
- 不直接修改主题原文件；样式变更只进入 snippets。
- Douban 媒体目录使用 `wiki/sources/_views/douban-catalog/` 的可复用 DataviewJS 视图，直接读取 Raw 和 `raws/Douban/_assets/`；同名封面缺失时只读解析 Raw 中的插件封面路径，失效时只接受唯一的文件名前缀候选。
- 目录可以按标题、状态和分支筛选，并显示 WeRead、Reading Note 或 Viewing Note 链接；这些派生关系不成为新的事实来源。
- ISBN 自动关联仅适用于没有人工覆盖的完全一致值；`source-link` 的冲突、拒绝和相关版本判断优先于自动结果。
- `agents/views/overview/home.md` 是稳定的工作日自动启动页，`agents/views/overview/overview.canvas` 是同一组组件的手动视觉布局；动态内容由 `agents/views/overview/` 中的 DataviewJS 组件提供，两种入口都不保存任务、媒体或知识事实。
- Homepage 采用首屏摘要：Today 与 Calendar 在首行，Tasks 与 Recent Activity 在次行，Explore 只保留媒体、Wiki 和 Candidates 的紧凑入口；卡片默认限制为 4～5 项，完整列表下沉到详情页。
- Homepage 的 Today 与 Calendar 消费 Daily，Media / Activity 只读消费 Douban Raw，Knowledge / Activity 消费 Daily Candidates 与 Wiki，Tasks & Todos 消费 `workspace/todos/` 原条目及 `workspace/tasks/` 全局状态，并保留系统 Backlog 入口。
- Homepage 的 Focus 消费 Period Plan、Theme 与 Insight Log，只提供限量链接和 Review 提醒，不保存选择或结论。
- 修改 Homepage 时保持组件入口稳定，优先替换查询来源而不是在首页或 Canvas 文本节点中复制结果；完整规则见 `agents/schema/workflows/homepage.md`。

## Daily 关注组

Daily 任务池使用 `agents/views/overview/_views/task-pool`：当前关注组展开，全量池折叠，无当前组时全量展开。管理入口为 [[workspace/task-groups/_Index|任务关注组]]。组只决定展示，不过滤 Task Todo 续入或复盘。历史读取每日组快照，不用当前成员重建；细则见 [[agents/schema/page-types/task-group|Task Group]]。

## 动作训练历史

`agents/views/overview/_views/exercise-history` 读取 Daily 的锻炼表和动作链接，逐行汇总日期、当日条目序号、动作、重量、组数/次数/时间与休息间隔。同日多行不去重；视图不写数据，不修改动作页知识正文。具体动作页放 `workspace/exercises/`，训练原始事实只在 Daily。
