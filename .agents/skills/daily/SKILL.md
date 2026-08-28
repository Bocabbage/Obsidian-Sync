---
name: daily
description: 在本 Obsidian Vault 创建或更新轻量 Daily 与跨日 Task Entity；用户说“今日计划”“开始今天”或“/daily”时维护当天 occurrence、小任务和材料，说“今日总结”“记录完成”或“/daily-review”时收口当日状态并汇总已关联 DIDA 任务的专注。DIDA 不是唯一任务来源。
---

# Daily v3

Daily 是当天工作切片和材料入口，Task Entity 是跨日承诺与全局状态。执行前阅读 `schema/page-types/daily.md`、`schema/page-types/task.md` 与 `schema/workflows/daily.md`。

## 路径与模板

```text
workspace/daily/{YYYY}/{YYYY-MM}/{YYYY-MM-DD}.daily.md
workspace/tasks/TASK-{YYYYMM}-{NNN}.md
schema/templates/daily-template.md
schema/templates/task-template.md
```

日期使用 Asia/Shanghai。文件不存在时从模板创建；已经存在时更新原文件，不覆盖人工内容。

## 晨间：`/daily`

- 创建或打开当天 Daily。
- `任务池` 只读显示活跃 Task；只把用户今天确实要推进的 Task 作为 occurrence 写入 `大任务` 或 `小任务`。
- Task occurrence 使用 `[[workspace/tasks/TASK-YYYYMM-NNN|任务标题]] — 今日切片`；同一任务跨日重复引用同一实体，不复制任务本体。
- 同时维护 Task 页面的 `Daily 时间线`：使用 `### YYYY-MM-DD` 日期小标题，下方只写一条 Daily 链接和一句切片摘要；同日条目更新而不重复追加，不使用 Dataview 或表格。
- 一次性小任务继续直接写 Daily，不为每个 Checkbox 建页。
- 稳定 DIDA 链接写在 Task Entity；尚未提升的一次性事项允许在 Daily 中直接关联。不要自动拉取 DIDA 今日任务。
- DIDA 不是唯一来源，没有外部链接的本地任务完全合法。
- 保留 `大任务`、`小任务` 两个二级标题原名；高低优先级是 `大任务` 中的三级标题，不影响 DIDA 链接解析。
- Task 的 `priority` 是任务池全局优先级，Daily 高低分组表示当天顺序，可以不同。

状态约定：

| 标记 | 含义 |
|---|---|
| `[ ]` | 未开始 |
| `[/]` | 进行中 |
| `[>]` | 当天 occurrence 已交接给 Task Entity，以后继续 |
| `[x]` | 今天计划完成的切片已完成 |
| `[-]` | 取消 |

Daily Checkbox 不代表 Task Entity 或 DIDA 整体状态。不要因 DIDA 仍未完成而撤销当天的 `[x]`，也不要从单日 `[x]` 自动关闭 Task Entity。

## Task 提升与归并

- 已知跨日、需要 Weekly 聚合、需要 DIDA 映射，或 Daily review 后仍要继续的事项才建立 Task Entity。
- 新 ID 使用 `TASK-{YYYYMM}-{NNN}`，创建前扫描已有文件取当月下一序号；ID 永不复用。
- 相同非空 DIDA task ID 可以精确复用已有 Task Entity；只有标题相似时不得自动合并，必须核对目标、范围和连续上下文。
- 提升 inline task 时创建实体，把稳定上下文和 DIDA 映射移入 Task 页面，并把原 Daily occurrence 改为链接实体的 `[>]`。

## 晚间：`/daily-review`

1. 定位当天 Daily；不存在时创建空模板，但不臆造任务。
2. 根据用户明确报告，把 `大任务`、`小任务` 中的 `[ ]` / `[/]` 全部收口为 `[x]`、`[-]` 或 `[>]`；普通 inline task 只有先提升为 Task Entity 后才能使用 `[>]`。
3. 用户只说“今天这一段做完”时只标记 Daily `[x]`；只有用户明确说整体完成、取消或阻塞，才更新 Task Entity 全局状态。随后同步更新 Task 页当天时间线条目的完成、交接或取消摘要。
4. 运行本 Skill 目录下的只读收口检查：

   ```bash
   node scripts/daily-review-check.mjs --file <当天 Daily 的绝对路径>
   ```

   若仍有 `[ ]` / `[/]`，或存在没有 Task 归属的顶层 `[>]`，保持 `status: open` 并让用户决定，不臆造结果。

5. 检查通过后运行专注汇总：

   ```bash
   node scripts/dida-focus-summary.mjs --file <当天 Daily 的绝对路径>
   ```

6. 只替换以下标记之间的内容，保留标题、标记和所有人工正文：

   ```markdown
   <!-- dida-focus:start -->
   <!-- dida-focus:end -->
   ```

7. 检查与汇总都成功并完成刷新后，把页面 Property `status` 设为 `closed`。再次执行时刷新同一区域，不追加重复摘要。

专注脚本读取 `大任务`、`小任务` 中的 Task wikilink，并解析实体上的 DIDA 映射；同时兼容 Daily 里的直接 DIDA Webapp 链接。它按 `tasks[].taskId` 匹配当天 focus、按记录 ID 去重，不会写回 DIDA，也不会为无 DIDA 映射的本地任务虚构时长。

若脚本失败、未登录或生成标记缺失/重复，保留现有专注区不变并报告问题。不要退回使用不可靠的 `task get.focusSummaries`。

## 材料与 Knowledge Candidates

- 与任务直接相关的进展、阻塞或产出可以缩进写在任务下，不建立“过程中”栏目。
- 需要独立检索或复用的内容写入 `产生的材料`，引用可选；随手捕获写入其下的 `碎碎念`。
- Knowledge Candidate 只是候选；只有用户明确选择后才能按 compile workflow 进入 Wiki。
