---
type: schema
schema: page-type
page_type: daily
updated: 2026-10-14
---

# Daily

Daily 是按日期保存的轻量 Workspace 工作记录，用来组织跨日任务的当日 occurrence、查看和处理一次性小任务，并承接小零碎和晚间专注汇总。跨日任务的身份与全局状态由 [[agents/schema/page-types/task|Task Entity]] 保存，一次性事项统一由 [[agents/schema/page-types/todo-log|Todo Log]] 保存。

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

- `今日心情`：紧接日期一级标题、放在导航与所有任务区之前的 `[!note]` Callout，留一行供用户自由记录心情。创建时可留空，Daily Review 收口前必须填写正文；缺少栏目、只有标题、空白、注释或空列表/Checkbox 标记均不通过。简短文字或 emoji 即可，不评价情绪，也不由 Agent 编造或代填，不增加 Property。
- `任务池`：只读显示截至本页 `date` 尚未全局闭环的 Task Entity，供晨间选择；以 Task 的 `created` / `closed` 做日期截面筛选，不使用当前 `status` 过滤，也不把实体整项自动排入今天；只有已维护的 Task Todo 按续入规则成为 occurrence。表中的“当前状态”仅表示现在的状态。
- `跨日任务`：当天需要推进且由 Task Entity 承接的 occurrence；三级标题为 `1. 高优先级` / `2. 低优先级`，各自下设四级标题 `WORK` / `LIFE`，组内按书写顺序表达先后。
- `小任务`：直接展开小任务待办池视图，是一次性事项的统一入口；今天做或以后做都在同一处添加、勾选，不再另设 `当日任务`、`今日安排` 或折叠候选区。按本页 `date` 展示今日必做、逾期、常规任务、当日完成和当日取消/转 Task，并显示录入日期；优先读取 Todo 快照，缺快照时按原条目日期回看。今日开放页面可操作唯一原条目并自动记日期，过去或已复盘的页面只读；常规任务不阻止 Daily 收口，今日必做与逾期项须完成、取消、转 Task 或由用户明确调整安排。
- `小零碎`：独立二级标题，随手记想法、问题、资料链接和当天片段；旧名为 `碎碎念`，历史标题继续兼容。日间不要求用户打标签；复盘逐条查看，摘录到 Insight 的内容在 Insight 主行附主题标签。不预设 `产生的材料`、`待分流` 等分类。
- `专注`：`/daily-review` 生成的 DIDA 关联任务当日专注汇总。
- `workspace/daily/_meta/todos/`：冻结每日复盘时的 Todo 状态、文字及来源，供历史回看。
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
| `[>]` | 今天的 occurrence 已交接给 Task Entity 或 Todo 原条目，以后继续 |
| `[x]` | 今天计划完成的切片已经完成 |
| `[-]` | 今天取消 |

Daily 正文中的任务 Checkbox 表示“这项任务在今天的切片”，不表示 Task Entity 或外部 DIDA 任务整体是否完成；`小任务` 视图的 Checkbox 则直接操作 Todo 原条目。Daily 完成晚间复盘后，`跨日任务` 中不得残留 `[ ]` 或 `[/]`：当天完成用 `[x]`，取消用 `[-]`；以后继续时先更新该 Task 的 Todo 子项并以 `#^step-NNN` 精确回链，再用 `[>]`。

旧版 `当日任务`（含 `今日安排`）继续按当天承诺收口；旧的一次性事项延期时在 Todo Log 创建或复用唯一原条目并精确回链。旧版候选池仍不纳入收口，不为精简模板重排历史 Daily。

跨日续入和 Review 交接见 [[agents/schema/workflows/task-todo|Task Todo 与 Daily 续入]]；历史文案/状态不跟随当前 Task Todo 变化。小任务不要求全部清空，但今日必做与逾期项必须处理；完成安排与改期历史见 Todo Log。

## 复盘关闭条件

`daily-review-check.mjs` 同时检查今日心情、跨日 occurrence、旧版当日任务及月度 Todo 中的今日必做 / 逾期项；常规任务可保留。今日心情未填写时，即使任务全部处理完毕也返回 `closeable: false`、退出码 `2`；Daily 保持 `status: open`，提示用户补写。只有心情与任务检查通过，且 Todo / 专注快照等复盘步骤完成后，才可设为 `closed`。规则用于后续复盘，不因新增校验自动重开或补写已关闭的历史 Daily。

## DIDA 关联

- DIDA 不是唯一任务来源；没有 DIDA 链接的本地事项完全合法。
- 需要稳定 DIDA 映射或专注统计的事项按 Task Entity 规则承接；旧 Daily 任务区里的直接 DIDA Webapp 链接继续兼容。小任务池不自动参与 DIDA 归属。
- `/daily-review` 同时解析 occurrence 指向的 Task Entity 和 Daily 中的兼容性直接链接，按 DIDA task ID 去重生成当天专注汇总。
- DIDA 的任务状态不得自动覆盖 Daily Checkbox。
- `专注` 中的生成内容必须限制在 `<!-- dida-focus:start -->` 与 `<!-- dida-focus:end -->` 之间。

## 小零碎与复盘整理

Daily Review 逐条查看小零碎并扫描整篇人工内容，无需先把片段搬进专门的候选栏。旧 Daily 的 `碎碎念`、`产生的材料`、`待分流`、`Knowledge Candidates` 继续读取；既有候选聚合只兼容显式候选记录，不把全部小零碎自动当成待处理事项。写入 Daily 不等于成为 Wiki 事实，路由规则见 [[agents/schema/workflows/knowledge-intake|Knowledge Intake]]。

高置信、可以脱离当天上下文重读的个人想法由 Daily Review 直接追加到当月 Insight Log，每条保留 Daily 来源，并在正文末尾沿用用户手写的主题标签，未写或不足时再按默认 1–3 个 `#topic/主题` 补充，保留必要上下文与不确定性，作为后续跨日期检索和知识编译的材料。普通流水账与含义不确定的碎片不自动提升。标签不等于已验证知识或 Theme，新 Theme 仍必须由用户明确确认。

## 手写入口与 Todo 笔记

新建 Task 和日常补录都在 `## Todo` 使用「事项｜状态｜完成时间｜备注」四列表格，每项一行。表头、分隔线和数据行之间不留空行，单元格中的竖线写成 `\|`，备注按来源日期组织并用 <br> 换行。保留 task-step 元数据、完成日链接和唯一的 ^step-NNN 兼容锚点。Daily review 只补尚未记录的过程笔记，保留原文和来源链接。详见 `agents/schema/workflows/task-todo.md`。

## 周期关注组

任务池使用 [[agents/schema/page-types/task-group|Task Group]] 的共享视图，多个当前组并行展开，全量池默认折叠；无当前组则全量展开。未分组 Task 继续正常安排与续入。`workspace/daily/_meta/task-groups/` 保存每日组名和成员快照；今日开放页可更新，过去/已关闭页冻结。新视图复盘关闭前须保存最新快照，缺失或过期不能通过检查；旧 Daily 不批量修改、不倒推分组历史。

## 锻炼记录

“小任务”后、“小零碎”前设可选 `## 锻炼` 四列表格：动作、重量、组数 × 次数 / 时间、休息间隔。Daily review 按 [[agents/schema/page-types/exercise|锻炼契约]] 整理链接并创建新动作页。同日同动作的多行和完全相同行全部保留。无记录直接跳过；非空记录须先解决链接/命名/格式问题再关闭 Daily。
