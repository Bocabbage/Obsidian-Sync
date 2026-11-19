---
type: schema
schema: page-type
page_type: task
updated: 2026-10-14
---

# Task Entity

Task Entity 是本 Vault 中需要多次推进、独立统计或稳定外部关联的 Workspace 任务实体。它保存任务身份和全局状态；Daily 只保存某一天实际计划或推进的 occurrence。仅仅等待到另一天执行的一次性事项属于 Todo Log，不因跨过日期自动成为 Task。

## 路径与 ID

```text
workspace/tasks/TASK-{YYYYMM}-{NNN}.md
```

- `task_id` 固定使用文件名中的本地 ID，例如 `TASK-202608-001`。
- 序号按创建月份递增；创建前扫描已有 ID，禁止复用或因标题变化重新编号。
- Task ID 只在本 Vault 内有效，不作为 DIDA、飞书或其他系统的公共身份。

## Properties

```yaml
---
type: task
task_id: TASK-202608-001
title: 示例任务
status: active
priority: normal
created: 2026-08-28
updated: 2026-09-12
due:
dida_urls: []
themes: []
---
```

字段约束：

- `status` 取值为 `inbox`、`active`、`blocked`、`done` 或 `cancelled`。
- `priority` 取值为 `high`、`normal` 或 `low`，表示任务池中的全局优先级；Daily 的高低分组只表示当天排序，两者无需强制一致。
- `due` 可选，只在存在真实截止日期时填写 `YYYY-MM-DD`。
- 任务进入 `done` 或 `cancelled` 时必须增加 `closed: YYYY-MM-DD`；Daily 任务池以该日期保留历史时点上的未闭环任务。
- `dida_urls` 是稳定 DIDA Webapp URL 字符串列表，每项可指向父任务或实际计时的子任务；project/task ID 从 URL 解析，无需重复维护。
- 一个本地 Task 可以绑定多个 DIDA task，多个本地 Task 也可以共享来源（N:N）。子任务必须显式加入列表；不假定父任务包含子任务计时，不自动递归绑定整棵任务树。
- 旧单值 `dida_project_id` / `dida_task_id` / `dida_url` 仍可读取；单页使用新列表或旧字段其中一种，不混写。多个 URL 的示例：

```yaml
dida_urls:
  - "https://dida365.com/webapp/#p/<project-id>/tasks/<parent-id>"
  - "https://dida365.com/webapp/#p/<project-id>/tasks/<child-id>"
```

示例占位值需替换为真实链接；不要从标题猜测 ID。

- `themes` 可选，用于连接一个或多个用户已设立的方向或阶段性事项；Theme 指导任务，关联不代表所有活动或时间属于该 Theme。允许无 Theme 的任务，Task 状态仍独立于 Theme 和 Period Plan。

## 何时建立 Task Entity

满足任一条件时建立或提升为 Task Entity：

- 已知执行本身会跨日推进，而不只是以后再做；
- 需要在 Weekly Review 中按同一事项聚合；
- 需要保存 DIDA 等稳定外部映射或统计专注；
- 当日 inline task 未完成，并且后续需要多次推进或保留任务级上下文；
- 需要独立记录目标、阻塞、下一步或任务级结论。

当日即可完成、无需独立统计的一次性事项和以后再做的小事统一写入 [[agents/schema/page-types/todo-log|Todo Log]]，通过 Daily 的“小任务”或待办总览处理，不创建空壳 Task 页面。旧 Daily 中的当日 inline task 继续兼容。

## Daily occurrence

Task Entity 在 Daily 中以不带 Checkbox 的普通列表项标题标识所有权；Checkbox 只写在其缩进的具体事项上：

```markdown
- [[workspace/tasks/TASK-202608-001|示例任务]] — 今天计划推进的切片
  - [ ] 当天具体事项 ↪ [[workspace/tasks/TASK-202608-001#^step-001|明细]]
```

- 同一 Task 可以出现在多个 Daily；每天的文案和子任务可以不同，但必须链接同一实体。
- Task 标题没有 Checkbox，不表示当日或全局完成；Task Entity 的完成只按用户明确确认更新。
- 具体事项的 Checkbox 只表示当日处理；未完成事项必须使用 `[x]`、`[-]` 或 `[>]` 收口。新制缩进的 `[>]` 必须精确链接该 Task 的 Todo block，表示已交接给持续原条目，不表示全局任务完成；旧 Daily 的实体级交接保留。
- Task Entity 的 `done` / `cancelled` 是全局闭环事实；旧 Daily 无需因全局状态变化被反向改写。

## 身份归并

- 相同 `task_id` 必然是同一任务。
- 多个本地 Task 可以共享同一个 DIDA task（例如季度计时容器），DIDA ID 相同不构成本地任务相同的证据。
- 标题或外部 ID 相似只产生人工候选；只有目标、范围和连续上下文都一致时才能合并。
- 一次性子任务、同一项目下的不同事项、日期不同的例行执行不得仅因关键词相同而合并。

## 专注归属

- Daily Review 按当天出现的本地 Task 与全部 DIDA 映射归属专注，正文按本地 Task 合并，来源和记录明细保存在每日侧车快照。
- 一条 focus 同时带父/子来源且候选本地 Task 相同时，只计一次；候选不止一个则待归属。人工指定后只计入被指定 Task，其他候选不得重复计入。
- 更新 Task 的绑定不改写旧 Daily 已保存的映射；历史纠正仍须明确使用 `--refresh-mappings`。
- 默认同日一个 DIDA 计时来源只对应一个本地 Task；偶发多个本地 Task 共用时保留候选并标注待归属，不自动覆盖、平分或重复计入任务小计。
- 周/月统计消费已经保存的每日归属，不将季度 DIDA 总量映射到每个关联 Task，也不据当前映射重算历史。
- Task 与 Theme 的关联不是工时分摊规则，不提供精确 Theme 工时。

Todo 的可选截止日期按 [[agents/schema/workflows/task-todo|Task Todo 工作流]] 的 DDL 规则维护，精度为 YYYY-MM-DD，独立于 Task 全局 due。

## 页面正文

- `目标`：任务完成时应成立的结果。
- `当前状态`：推进概况、阻塞或需要保留的任务级上下文，不再维护第二份下一步清单。
- `Todo`：统一四列表格，每项一行，备注按来源日期记录进展和思考，包含当天新增且完成的事项，详见 [[agents/schema/workflows/task-todo|Task 明细表与 Daily 续入]]。
- `任务级结论`：只有跨日仍有价值的决定或结论；跨多个 Todo 的过程可按日期记录在可选的 `整体思路` 下，不强行归属或重复复制。

## 手写入口与 Todo 笔记

新建 Task 和日常补录都在 `## Todo` 使用「事项｜状态｜完成时间｜备注」四列表格，每项一行。表头、分隔线和数据行之间不留空行，单元格中的竖线写成 `\|`，备注按来源日期组织并用 <br> 换行。保留 task-step 元数据、完成日链接和唯一的 ^step-NNN 兼容锚点。Daily review 只补尚未记录的过程笔记，保留原文和来源链接。详见 `agents/schema/workflows/task-todo.md`。

## 周期关注组

[[agents/schema/page-types/task-group|Task Group]] 可以引用本 Task，关系仅保存在组的 `tasks` 中，不在 Task 增加反向字段。Task 可以属于多个组或不分组，均能参与 Daily。关闭组不改变 Task 的状态、优先级、明细续入和 DIDA 归属。
