---
type: schema
schema: page-type
page_type: daily
updated: 2026-09-16
---

# Daily

Daily 是按日期保存的轻量 Workspace 工作记录，用来组织跨日任务的当日 occurrence、一次性当日任务，并承接材料、待分流记录和晚间专注汇总。跨日任务的身份与全局状态由 [[schema/page-types/task|Task Entity]] 保存。

## 路径

```text
workspace/daily/{YYYY}/{YYYY-MM}/{YYYY-MM-DD}.daily.md
```

## Properties

```yaml
---
type: daily
date: YYYY-MM-DD
status: open
---
```

- `type` 固定为 `daily`。
- `date` 必须与文件名中的日期一致。
- `status` 只表示当日页面是否已经完成晚间复盘，取值为 `open` 或 `closed`；它不表示页面中任何任务的状态。

## 正文结构

- `任务池`：只读显示截至本页 `date` 尚未全局闭环的 Task Entity，供晨间选择；以 Task 的 `created` / `closed` 做日期截面筛选，不使用当前 `status` 过滤，也不把任务自动排入今天。表中的“当前状态”仅表示现在的状态。
- `跨日任务`：当天需要推进且由 Task Entity 承接的 occurrence；三级标题为 `1. 高优先级` / `2. 低优先级`，各自下设四级标题 `WORK` / `LIFE`，组内按书写顺序表达先后。
- `今日心情`：在“跨日任务”标题后、优先级分组前放一个 `[!note]` Callout，留一行供用户自由记录心情；可留空，不是任务、不增加 Property，也不由 Agent 代填。
- `当日任务`：不需要 Task Entity、预期在当天收口的一次性事项；下设三级标题 `WORK` / `LIFE`。一旦决定以后继续，必须提升为 Task Entity 并移交到跨日模型。
- `产生的材料`：当天形成或引用的 Workspace 材料；引用可选，随手捕获可写入 `碎碎念` 三级标题。
- `待分流`：问题、想法、需求或资料的显式候选；旧 Daily 的 `Knowledge Candidates` 继续兼容。
- `专注`：`/daily-review` 生成的 DIDA 关联任务当日专注汇总。
- `workspace/daily/_meta/focus/`：每份 Daily 对应的只读专注归属快照，供后续 Review 验证；不作为 Daily 正文展示。
- `收尾`：当天推进结果和明日关注点。

不设置“过程中”栏目。与某项任务直接相关的进展、阻塞或产出可以缩进写在该任务下；需要独立检索或复用时再建立单独页面并链接。

Task occurrence 使用完整路径 wikilink 连接实体，例如 `[[workspace/tasks/TASK-202608-001|任务标题]]`；同一任务在不同日期可以安排不同切片。Markdown 标题继续保留 `1. 高优先级` / `2. 低优先级`，Obsidian 提供给 Dataview 的 `meta(section).subpath` 会规范化为 `1 高优先级` / `2 低优先级`。

WORK / LIFE 只是 Daily 的组织分组，不是 Task 或 Theme 的新字段，不影响 DIDA 归属。保留用户已选的分组，不因主题名称自动归类；空分组可留空。视图兼容新分组及旧版没有分组的 Daily；无需回填历史。WORK / LIFE 标题在此模板中只用于任务区，其他材料区不复用这两个导航标题。

## Markdown task 状态

| 标记 | 含义 |
|---|---|
| `[ ]` | 今天尚未开始 |
| `[/]` | 今天正在进行 |
| `[>]` | 今天的 occurrence 已交接给 Task Entity，以后继续 |
| `[x]` | 今天计划完成的切片已经完成 |
| `[-]` | 今天取消 |

Checkbox 表示“这项任务在今天的切片”，不表示 Task Entity 或外部 DIDA 任务整体是否完成。Daily 完成晚间复盘后，`跨日任务`、`当日任务` 中不得残留 `[ ]` 或 `[/]`：当天完成用 `[x]`，取消用 `[-]`，以后继续则先建立或确认 Task Entity，再用 `[>]`。

## DIDA 关联

- DIDA 不是唯一任务来源；没有 DIDA 链接的本地事项完全合法。
- 稳定 DIDA 映射优先保存在 Task Entity；一次性或尚未提升的事项仍可在 Daily 中保留直接 DIDA Webapp 链接。
- `/daily-review` 同时解析 occurrence 指向的 Task Entity 和 Daily 中的兼容性直接链接，按 DIDA task ID 去重生成当天专注汇总。
- DIDA 的任务状态不得自动覆盖 Daily Checkbox。
- `专注` 中的生成内容必须限制在 `<!-- dida-focus:start -->` 与 `<!-- dida-focus:end -->` 之间。

## 待分流

候选项可以使用普通列表或 Markdown task；Daily Review 还会扫描整篇人工内容，而不只检查本节。写入 Daily 不等于成为 Wiki 事实，路由规则见 [[schema/workflows/knowledge-intake|Knowledge Intake]]。
