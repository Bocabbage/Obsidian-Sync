---
type: schema
schema: workflow
workflow: daily
updated: 2026-09-14
---

# Daily Workflow

Daily 在同一文件中完成晨间组织、日间状态更新和晚间复盘。Task Entity 保存跨日承诺，`跨日任务` 保存其当天 occurrence，`当日任务` 保存无需建页的一次性事项。

## 晨间创建

1. 以 Asia/Shanghai 的当前日期解析目标路径：

   ```text
   workspace/daily/{YYYY}/{YYYY-MM}/{YYYY-MM-DD}.daily.md
   ```

2. 文件不存在时使用 `schema/templates/daily-template.md` 创建；已存在时打开或追加，不覆盖人工内容。
3. `任务池` 只读显示截至本页日期尚未全局闭环的实体：`created <= Daily.date` 且 `closed` 为空或晚于 Daily.date。不得按 Task 的当前 `status` 过滤，否则后来闭环会从历史 Daily 消失；用户选择今天实际推进的事项，在 `跨日任务` 中建立带 Task wikilink 的 occurrence。
4. 跨日任务按三级优先级、四级 `WORK` / `LIFE` 分组；当日即可完成的一次性事项在 `当日任务` 的三级 `WORK` / `LIFE` 下写普通 Checkbox，不必建立 Task Entity。沿用用户分组，不新增实体分类字段、不重排既有 Daily；未分组的历史记录继续兼容。
5. 不自动拉取 DIDA 今日任务，不自动把全部活跃 Task 排入今天，也不复制旧 Daily 的未完成任务。

同一 Task 在多日出现时重复引用同一个 Task Entity，并按当天目标重新描述切片。Task Entity 的 `priority` 是任务池全局优先级，Daily 的高低分组是当天安排；两者可以不同，不需要每天回写全局字段。

创建 occurrence 时同时维护 Task 页面 `Daily 时间线`：当天没有标题时追加 `### YYYY-MM-DD`，其下只写一条来源 Daily 链接和一句切片摘要；已经存在当天条目时更新原条目，不重复追加。时间线不使用 Dataview 或表格，完整上下文仍以 Daily 为准。

## 日间更新

- 用户可以随时更新 Markdown task 状态；`[ ]` 和 `[/]` 是尚未完成当天决策的临时状态。
- 与任务直接相关的进展或阻塞写在该任务的缩进项目下。
- 当天形成的独立材料写入 `产生的材料`；明确希望后续处理的问题、想法、需求或资料可以写入 `待分流`，普通碎片继续留在原位置。
- Task Entity 的全局状态只在用户明确表达整体完成、取消或阻塞时更新；Agent 不从 DIDA 状态或单日 Checkbox 自动推断。

## 晚间 `/daily-review`

1. 定位当天 Daily；不存在时先从模板创建，不臆造任务。
2. 根据用户报告把每个 `[ ]` / `[/]` occurrence 收口为：当天完成 `[x]`、取消 `[-]`，或以后继续 `[>]`。普通 inline task 只有先提升为 Task Entity 后才能使用 `[>]`。
3. 若用户明确表示 Task 整体完成、取消或阻塞，同步更新对应 Task Entity；整体完成或取消时同时写入 `closed: YYYY-MM-DD`。否则只改变 Daily occurrence。随后把 Task 页面当天时间线条目的摘要状态更新为完成、交接或取消。
4. 运行 `daily-review-check.mjs`；仍有 `[ ]` / `[/]` 或无 Task 归属的顶层 `[>]` 时停止关闭并请求用户决定。
5. 从 `跨日任务`、`当日任务` 中提取 Task wikilink，读取实体上的 DIDA 映射；同时兼容 Daily 中的直接 DIDA Webapp 链接。
6. 以 Asia/Shanghai 当天 `00:00:00` 到次日 `00:00:00` 为只读查询窗口，分别读取 `pomodoro` 和 `timing`。
7. 使用 focus 响应中的 `tasks[].taskId` 匹配关联任务，按 focus 记录 `id` 去重，并把实际返回的毫秒 `duration` 换算为可读时长。
8. 同一 Task 的重复 occurrence/来源链接只计一次；同日多个本地 Task 共享 DIDA ID 时保留全部候选并列为待归属，不覆盖或平分。跨多个 DIDA 来源的同一 focus 记录也只进入一次合计，归属不明确时不计入单个 Task 小计；无 DIDA 映射不生成自动时长。
9. 同时以 `--format snapshot` 生成并更新 `workspace/daily/_meta/focus/{YYYY}/{YYYY-MM}/{YYYY-MM-DD}.dida-focus.md`；它是单日专注归属的可复核 Markdown 侧车，不显示在 Daily 正文。

10. 只替换以下标记之间的内容：

   ```markdown
   <!-- dida-focus:start -->
   <!-- dida-focus:end -->
   ```

11. 按 `knowledge-intake.md` 扫描整篇 Daily 的人工内容，提出少量 Insight、Theme、Task 或编译材料候选；待分流内容不阻止 Daily 关闭。
12. 保留任务正文、Checkbox、材料、候选和人工复盘；检查通过且专注区与侧车快照完成刷新后，才把页面 `status` 改为 `closed`。

专注摘要在 Daily 正文生成区只保存日期、关联任务合计、番茄钟次数与时长、正计时时长、按任务明细和待归属项；当日映射快照与记录 ID / 时长保存到 `workspace/daily/_meta/focus/{YYYY}/{YYYY-MM}/{YYYY-MM-DD}.dida-focus.md`。同日刷新沿用该侧车映射；只有用户明确要求纠正归属时才以 `--refresh-mappings` 重建，并先核对差异。旧摘要没有侧车时兼容读取其内嵌快照，不批量回填历史；用户确认后可针对该日迁移。Task Entity 关联项使用本地 Task wikilink 作为主身份，并保留 DIDA 来源入口；已关联但当天没有 focus 记录的任务显示 `0m`。

检查命令：

```bash
node .agents/skills/daily/scripts/daily-review-check.mjs --file <当天 Daily 的绝对路径>
```

专注命令：

```bash
node .agents/skills/daily/scripts/dida-focus-summary.mjs --file <当天 Daily 的绝对路径>
```

## 失败边界

每日专注快照保存在 `workspace/daily/_meta/focus/{YYYY}/{YYYY-MM}/{YYYY-MM-DD}.dida-focus.md`，是可移植的 Markdown 侧车，不是插件缓存，也不占用 Daily 的 Live Preview：

- `version: 1`、`date`、`timeZone` 标明格式与统计日期；`mappings` 保存当日 DIDA `taskId`、来源 URL、本地 `localTaskId` / `localPath` 及 `candidates`，DIDA ID 不充当本地身份。
- `records` 保存去重后的 `key`（focus 类型 + 记录 ID）、`focusType`、`seconds`、`didaTaskIds`、`localPaths` 与 `attribution`。
- `attribution: local` 时唯一 `localPaths` 是本地归属；`external` 表示只有直接 DIDA 来源；`unallocated` 的 `localPaths` 仅是候选，不可分摊到任务小计。
- 日期内合计按记录 `key` 去重并包含待归属记录一次；周期汇总按 `date + key` 去重。不得把每个来源行的“待归属”提示再次求和，因为同一记录可能提示在多个来源上。
- 快照只有在成功 Review 写入生成区后才成为保存结果；脚本本身只读。历史缺快照时报告缺失，当前任务区与快照不同则警告并保留旧归属，不悄悄覆盖。

- DIDA CLI 未安装、未登录、查询失败或返回无法解析的数据时，保留现有生成区不变并报告原因。
- 不使用不可靠的 `task get.focusSummaries` 作为实际专注事实。
- 不通过 Daily 工作流完成、更新、移动、评论或删除 DIDA 任务。
- 不因标题或 DIDA task ID 相同合并 Task；必须核对目标、范围和连续上下文。DIDA 可以是多个 Task 共享的长期计时来源。
- 不扫描或修改 `raws/`、Legacy、Archived、Canvas 或 `.obsidian/workspace*.json`。

## Knowledge Intake

- Review 扫描任务子项、材料、碎碎念、待分流和收尾，但排除任务池、Dataview 与自动专注区。
- 高置信 Insight 追加到当月 Insight Log；相关发现和成果可更新已有 Theme，新建 Theme 必须由用户明确提出或确认，不从工作次数推断。
- 普通列表与 Markdown task 都可以作为候选；旧标题 `Knowledge Candidates` 与新标题 `待分流` 均被聚合。
- 用户日常使用时应先确认建议去向；明确委托整批迁移时可以处理高置信内容，但不包含未逐项确认的新 Theme。Daily 不要求动作级 Theme 标签，Task 全部活动与时长也不自动归入 Theme。
- compile 完成后可以在原候选后追加目标 Wiki wikilink，并将 task 候选标为完成。
