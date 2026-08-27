---
type: schema
schema: page-type
page_type: daily
updated: 2026-08-27
---

# Daily

Daily 是按日期保存的轻量 Workspace 工作记录，用来组织当天的大任务、小任务，并承接材料、Knowledge Candidates 和晚间专注汇总。它不是完整的项目管理系统，也不要求任务来自同一个外部系统。

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

- `未闭环`：派生查询，只显示旧 Daily 中仍未闭环的大任务和小任务，不复制原任务。
- `大任务`：当天需要集中推进的事项，默认以 `1. 高优先级` 和 `2. 低优先级` 两个三级标题分组，组内仍按书写顺序表达先后。
- `小任务`：当天可以穿插处理的事项。
- `产生的材料`：当天形成或引用的 Workspace 材料；引用可选，随手捕获可写入 `碎碎念` 三级标题。
- `Knowledge Candidates`：值得后续人工选择 compile 的候选。
- `专注`：`/daily-review` 生成的 DIDA 关联任务当日专注汇总。
- `收尾`：当天推进结果和明日关注点。

不设置“过程中”栏目。与某项任务直接相关的进展、阻塞或产出可以缩进写在该任务下；需要独立检索或复用时再建立单独页面并链接。

`未闭环` 查询必须同时纳入 `大任务`、`小任务` 和两个优先级子标题下的 task。Markdown 标题保留 `1. 高优先级` / `2. 低优先级`，但 Obsidian 提供给 Dataview 的 `meta(section).subpath` 会规范化为 `1 高优先级` / `2 低优先级`；查询必须使用后者。

## Markdown task 状态

| 标记 | 含义 |
|---|---|
| `[ ]` | 今天尚未开始 |
| `[/]` | 今天正在进行 |
| `[>]` | 今天未闭环，顺延到以后 |
| `[x]` | 今天计划完成的切片已经完成 |
| `[-]` | 今天取消 |

Checkbox 表示“这项任务在今天的切片”，不表示外部 DIDA 任务整体是否完成。`[/]` 和 `[>]` 继续参加未闭环查询；`[x]` 和 `[-]` 不参加。

## DIDA 关联

- DIDA 不是唯一任务来源；没有 DIDA 链接的本地事项完全合法。
- 用户按需把真实 DIDA Webapp 链接手工写入 `大任务` 或 `小任务`。
- `/daily-review` 只为这两个栏目中已关联的 DIDA 任务生成当天专注汇总。
- DIDA 的任务状态不得自动覆盖 Daily Checkbox。
- `专注` 中的生成内容必须限制在 `<!-- dida-focus:start -->` 与 `<!-- dida-focus:end -->` 之间。

## Knowledge Candidates

候选项可以使用 Markdown task 表示待处理状态。写入 Daily 不等于成为 Wiki 事实；只有用户明确选择后才能执行 compile，完成后再链接目标 Wiki 页面。
