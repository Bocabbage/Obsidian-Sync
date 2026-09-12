---
type: schema
schema: workflow
workflow: homepage
updated: 2026-08-28
---

# Homepage Workflow

Homepage 是工作日启动和快速导航视图，不是新的事实层。

## 入口

```text
自动启动：workspace/overview/home.md
视觉布局：workspace/overview.canvas
```

两种入口共用 `workspace/overview/` 下的查询组件：

| 组件 | 当前数据源 | 职责 |
|---|---|---|
| `calendar.md` | `workspace/daily/` | 当前月份、Daily 状态和待收口 occurrence 数量 |
| `today.md` | 当天 Daily | 今日任务切片和完成概览 |
| `media.md` | Douban Raw、媒体目录入口 | Books、Movies、Series 和最近记录 |
| `todo.md` | `workspace/tasks/`、`workspace/backlog.md` | 活跃、阻塞、Inbox 与系统 Backlog 入口 |
| `knowledge.md` | Daily Knowledge Candidates、`wiki/` | 候选知识和最近 Wiki 更新 |
| `activity.md` | Daily、Douban Raw、`wiki/` | 限量合并最近活动，不保存事件副本 |
| `shortcuts.md` | 媒体目录、`wiki/`、Daily Candidates | Books、Movies、Series、Wiki 与候选知识入口 |

`home.md` 在一个稳定的 Markdown 阅读视图中组合首屏摘要；Canvas 通过同一组文件节点提供可自由缩放、重排的视觉布局。完整的 Media 与 Knowledge 组件作为下钻页保留，不在自动首页展开长列表。这些组件只派生展示；删除任一入口或查询组件不得丢失 Daily、任务、媒体和 Wiki 事实。

## 首屏布局

```text
Workspace 状态与快捷入口
Today (7/12)             Calendar (5/12)
Tasks (7/12)             Recent Activity (5/12)
Explore (12/12)
```

- Today 与 Tasks 各最多展示 4 项，Recent Activity 最多展示 5 项。
- Recent Activity 分别从媒体、Wiki 和 Daily 取少量最近项，避免单一高频来源占满首页。
- Explore 只显示计数和入口；完整目录、日志与历史继续留在各自页面。
- 窄窗口按 Today、Calendar、Tasks、Recent Activity、Explore 顺序堆叠。

## 启动配置

本 Vault 使用社区插件 `homepage` 打开启动页：

```text
Homepage: workspace/overview/home
Kind: File
Open on startup: true
Opening method: Replace last note
Manual opening method: Keep open notes
View: Reading view
Refresh Dataview: true
```

- 当前 Obsidian 1.12.7 与 Homepage 4.4.4 组合中，直接以 Canvas 作为自动启动目标会先恢复节点框、后初始化嵌入内容，可能得到空白卡片；因此自动启动依赖 `home.md`，Canvas 作为手动视觉入口保留。
- Markdown 首页和 Canvas 使用同一份组件与查询逻辑，不形成两套事实或维护规则；展示样式由已启用的 `.obsidian/snippets/homepage.css` 提供。
- 插件目录、启用状态和 `data.json` 由 OneDrive 同步，不进入 Git。
- Markdown 首页、Canvas 与可复现查询组件进入 Git。
- 不通过修改 `.obsidian/workspace*.json` 设置首页。
- 核心 Workspace 可以由用户另行保存界面状态，但不是 Homepage 的启动依赖或事实源。

## Daily 边界

- Calendar 只链接已经存在的 Daily；缺失日期不直接创建空白文件。
- 当天 Daily 不存在时，提示用户使用核心“打开今天的日记”命令，以确保应用正式模板。
- Today 读取 Daily Markdown occurrence，Todo 读取 Task Entity Properties；两者都不复制或自动改写事实。

## Media 边界

- Media 只读统计 `raws/Douban/book/`、`movie/` 和 `teleplay/`。
- Books 入口继续通过正式目录连接 WeRead；Homepage 不建立第二套媒体身份关系。
- 最近记录优先使用 `collectionDate`，缺失时仅以文件修改时间作为展示回退，不回写 Raw。

## Todo 演进

- `workspace/tasks/` 已接管跨日承诺、Inbox、活跃与阻塞状态；`workspace/backlog.md` 仍只是知识系统自身的后续事项，不属于个人任务事实。
- Daily occurrence 继续表示当天切片，Task Entity 表示跨日承诺；两者通过 wikilink 关联，不自动互相覆盖完成状态。
- `due` 存在时 Todo 可以派生 Upcoming / Overdue；Projects 暂不建立独立事实模型，直到出现真实分组需求。

## 修改与检查

1. 修改查询逻辑时更新 `workspace/overview/_views/homepage/view.js`，修改展示时更新 `.obsidian/snippets/homepage.css`，都不得回写数据来源。
2. 新增组件时同步检查 `home.md` 组合列表、Canvas 文件节点、`workspace/overview/README.md`、`.gitignore` 白名单和 `schema/views.md`。
3. 完成后验证 Canvas JSON、DataviewJS 语法、内部路径、Markdown 阅读视图和 Homepage 插件目标。
4. 插件升级时核对 `minAppVersion` 和现有 `data.json` 结构，不盲目覆盖用户设置。
