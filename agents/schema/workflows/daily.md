---
type: schema
schema: workflow
workflow: daily
updated: 2026-10-14
---

# Daily Workflow

Daily 在同一文件中完成晨间组织、日间状态更新和晚间复盘。Task Entity 保存需要多次推进的承诺，`跨日任务` 保存其当天 occurrence；一次性小事统一存入 Todo Log，由 Daily 的 `小任务` 直接展示和操作。随手记录统一写入 `小零碎`。

## 晨间创建

1. 以 Asia/Shanghai 的当前日期解析目标路径：

   ```text
   workspace/daily/{YYYY}/{YYYY-MM}/{YYYY-MM-DD}.daily.md
   ```

2. 文件不存在时使用 `agents/schema/templates/daily-template.md` 创建；已存在时打开或追加，不覆盖人工内容。日期标题后先放“今日心情”，导航下按“任务池 → 跨日任务 → 小任务 → 锻炼 → 小零碎 → 专注 → 收尾”排列。
3. `任务池` 只读显示截至本页日期尚未全局闭环的实体：`created <= Daily.date` 且 `closed` 为空或晚于 Daily.date。不得按 Task 的当前 `status` 过滤，否则后来闭环会从历史 Daily 消失；已有 Task Todo 依 [[agents/schema/workflows/task-todo|Task Todo 与 Daily 续入]] 自动生成带实体及子项链接的 occurrence；用户再补充、调整今天的安排。
4. `小任务` 是独立二级标题，直接展开 `agents/views/overview/_views/todo-pool` 视图，不再分今日安排与候选池。按 Daily.date 读取已保存快照；缺快照则按每条 Todo 的录入/结束日期回看。按当时应完成日期分为今日必做、逾期、常规任务，显示录入日期。今日开放 Daily 可直接添加、勾选和调整安排并自动记日期，过去页面只读；不把原条目复制成 Daily Checkbox。
5. 跨日任务按三级优先级、四级 `WORK` / `LIFE` 分组；所有一次性小事统一从 `小任务` 添加到月度 Todo，今天做或以后做均只保留一份原条目。沿用用户分组，不新增实体分类字段、不重排既有 Daily；旧 `当日任务` / `今日安排` 及未分组的历史记录继续兼容。
6. 不自动拉取 DIDA 今日任务，不自动把全部活跃 Task 排入今天，也不直接复制旧 Daily 或月度 Todo Log 的未完成任务。只从 Task 自身 Todo 续入符合条件的子项，延期/暂停项跳过；插件不可用时按续入工作流的只读脚本处理。

同一 Task 在多日出现时重复引用同一个 Task Entity，并按当天目标重新描述切片。Task Entity 的 `priority` 是任务池全局优先级，Daily 的高低分组是当天安排；两者可以不同，不需要每天回写全局字段。

Daily 中的 Task 使用不带 Checkbox 的普通列表项 wikilink 标题作为视觉分组，具体事项缩进在其下并使用 Checkbox；不得为了收口给 Task 标题补 Checkbox 或状态图标。具体事项的 `[x]`、`[-]`、`[>]` 只表示当天处理；Task 全局状态仍只按用户明确确认更新。

Agent 晨间保留可编辑的 Daily 切片；手写新增事项在 `/daily-review` 时再匹配或录入 Task Todo 并补精确回链；当天笔记整理到对应 Todo 的日期下，Daily 原文保留。

## 日间更新

- 用 Highlightr 的 Red 标记当天重点。选中任务或事件文字即可，勾选框与明细回链放在高亮外。
- 用户可以随时更新 Markdown task 状态；`[ ]` 和 `[/]` 是尚未完成当天决策的临时状态。
- 与任务直接相关的进展或阻塞写在该任务的缩进项目下。
- 随手想法、问题、资料链接和当天片段统一写入 `小零碎`；任务相关的材料也可以直接链接在任务下。确有独立检索或复用需要时再建材料页，不预设空栏目。
- 一次性事项写入当前月 Todo Log，记录真实录入日期 `➕ YYYY-MM-DD`；从 Daily 的 `小任务` 即可添加和勾选。添加入口会自动记录日期与 block ID；手工记录时也须保留日期。完成/取消/转 Task 均记录真实发生日期，见 Todo Log。默认常规任务，选今日必做时保存当天的 `📅` 日期。没做完留在原处；跨天未完成进入逾期，不逐日复制或自动滚期。安排 / 改期入口维护 `due_history`，Agent 按用户决定用 Daily Skill 的只读改期脚本生成差异，不直接丢弃原日期。
- Task Entity 的全局状态只在用户明确表达整体完成、取消或阻塞时更新；Agent 不从 DIDA 状态或单日 Checkbox 自动推断。

## 晚间 `/daily-review`

**识别当天重点。** 复盘时读取当天 Daily 的人工正文，把 Highlightr Red（`<mark class="hltr-red">…</mark>`）视为用户标记的重点。事项正文只要有一段红色高亮，就回顾整条事项，每条只列一次。带红色高亮的普通笔记也列为重点事件，无需补勾选框。只按这种高亮识别，跳过模板示例和自动生成内容。

**报告完成情况。** 有重点时，在复盘回复里加一小段「今日重点」，按当天勾选状态区分已完成 `[x]`、未完成 `[ ]` / `[/]`、继续推进 `[>]`、已取消 `[-]`，只列实际出现的状态。仅完成当日切片时，按切片范围描述。没有勾选框的重点事件只回顾内容。未标重点时省略这一段。

**保留标记。** 红色高亮留在原 Daily。匹配或录入 Task Todo 时去掉高亮标签，次日续入沿用任务正文。

1. 定位当天 Daily；不存在时先从模板创建，不臆造任务。
2. 根据用户报告把跨日任务具体事项的 `[ ]` / `[/]` 收口为：当天完成 `[x]`、取消 `[-]`，或以后继续 `[>]`。纯 Task 标题本身不加状态。全部子项（包括当天完成的）先归入该 Task 的 `## Todo` 并以 `#^step-NNN` 回链；不交给月度小事池。同一子项复用原锚点，完成/取消时补真实日期，按 Task Todo 工作流区分整项子步骤与局部切片。旧版 `当日任务` / `今日安排` 仍需收口；延期后仍是一次性小事时，在 Todo Log 创建或复用唯一原条目并精确交接；确需多次推进或独立上下文时才提升为 Task Entity。
3. 若用户明确表示 Task 整体完成、取消或阻塞，同步更新对应 Task Entity；整体完成或取消时同时写入 `closed: YYYY-MM-DD`。否则只改变 Daily occurrence。随后更新 Task Todo 的状态、完成日期，并按来源日期归入当天过程笔记；不创建 Task 级重复时间线。
4. 运行 `daily-review-check.mjs`，同时强校验今日心情与任务收口。`今日心情` Callout 必须有用户填写的正文；缺少栏目、只有标题、空白、注释或空列表/Checkbox 标记均不通过，简短文字或 emoji 可以通过。未填写时即使任务已全部处理，也保持 `status: open` 并提示用户补写，不由 Agent 编造或代填。任务范围包括跨日 occurrence、旧版当日任务和月度 Todo 的今日必做 / 逾期项。常规任务无需清空；必做 / 逾期未处理或日期无效时返回 `smallTaskIssues`，须由用户决定完成、取消、转 Task、改期或转回常规任务，不为通过校验自行改期；受检区仍有 `[ ]` / `[/]`，或新制跨日 `[>]` 缺少有效同 Task Todo 原条目，或旧版一次性 `[>]` 未精确交接时，也停止关闭并请求用户决定。新增校验不自动重开或补写已关闭的历史 Daily。
5. 读取整个月度 Todo 原条目并核对日期，然后运行 `todo-snapshot.mjs --file <Daily绝对路径>`，保存输出到 `workspace/daily/_meta/todos/{YYYY}/{YYYY-MM}/{YYYY-MM-DD}.todos.md`。缺日期或安排历史矛盾先核实，不能伪造快照。新快照 version 2 同时保存录入日期及当时的应完成日期；旧版 version 1 保留原分组，不推断截止日期；已有快照默认沿用，明确纠正该日时才用 `--refresh`。
6. 从 `跨日任务` 及旧版 `当日任务` 提取 Task wikilink，读取实体 `dida_urls` 中全部父/子来源（兼容旧单值字段），同时兼容旧任务区的直接 DIDA 链接。`小任务` 视图不自动参与专注归属；需稳定映射或独立专注统计的事项由 Task 承接。仅绑定父任务不会自动展开子任务；实际计时子任务必须显式列入。
7. 以 Asia/Shanghai 当天 `00:00:00` 到次日 `00:00:00` 为只读查询窗口，分别读取 `pomodoro` 和 `timing`。
8. 使用 focus 响应中的 `tasks[].taskId` 匹配关联任务，按 focus 记录 `id` 去重，并把实际返回的毫秒 `duration` 换算为可读时长。
9. 同一 Task 可绑定多个父/子 DIDA 来源，摘要按本地 Task 合并；同一 focus 即使命中多个来源，也只计一次。所有命中来源都映射到同一个本地 Task 时归属该 Task；候选不唯一或混有无法归属的外部来源时列入待归属，不平分。人工指定后只计入选中 Task；无映射不生成自动时长。
   用户明确指定一条共享 focus 记录归属某个候选本地 Task 时，可使用汇总命令的 --assign <record-key>=workspace/tasks/TASK-YYYYMM-NNN；生成侧车在 manualAttributions 中保存该次用户确认，后续同日刷新沿用它，不自动改写或平分。
10. 同时以 `--format snapshot` 生成并更新 `workspace/daily/_meta/focus/{YYYY}/{YYYY-MM}/{YYYY-MM-DD}.dida-focus.md`；它是单日专注归属的可复核 Markdown 侧车，不显示在 Daily 正文。

11. 只替换以下标记之间的内容：

   ```markdown
   <!-- dida-focus:start -->
   <!-- dida-focus:end -->
   ```

12. 按 `knowledge-intake.md` 逐条查看小零碎，扫描任务子项和收尾，并兼容旧 `碎碎念`、材料、待分流等人工内容，无需用户预先分类。高置信且可以脱离当天上下文独立重读的用户想法，一点一条追加到当月 Insight Log；保留对象、必要上下文、疑问、不确定性、Daily 来源及原有材料链接。每条 `💡` 主行末尾附主题标签，优先原样沿用 Daily 中用户手写的标签（普通 `#主题` 也可）；够用就不补，不强改命名或删减。未写或不足时再按默认 1–3 个 `#topic/主题` 补充，优先复用已有准确名称。Daily 原标签保留，Agent 补充标签只维护在 Insight。按内容与来源去重，标签变化不重复建条目；完成后逐条核对摘录、来源与标签。每点都查看，但不把流水账、模板句或 Agent 新推论包装成 Insight。Theme、Task 和编译材料仍只提出候选或按各自授权边界处理。
13. 保留任务正文、Checkbox、小零碎和人工复盘；今日心情与任务收口检查通过、Todo 快照保存成功、专注区与专注侧车快照完成刷新后，才把页面 `status` 改为 `closed`。

专注摘要在 Daily 正文生成区只保存日期、关联任务合计、番茄钟次数与时长、正计时时长、按任务明细和待归属项；当日映射快照与记录 ID / 时长保存到 `workspace/daily/_meta/focus/{YYYY}/{YYYY-MM}/{YYYY-MM-DD}.dida-focus.md`。同日刷新沿用该侧车映射；只有用户明确要求纠正归属时才以 `--refresh-mappings` 重建，并先核对差异。旧摘要没有侧车时兼容读取其内嵌快照，不批量回填历史；用户确认后可针对该日迁移。Task Entity 关联项使用本地 Task wikilink 作为主身份，并保留 DIDA 来源入口；已关联但当天没有 focus 记录的任务显示 `0m`。

检查命令：

```bash
node .agents/skills/daily/scripts/daily-review-check.mjs --file <当天 Daily 的绝对路径>
```

Todo 快照命令（只读输出，Agent 保存到指定侧车；已有快照默认沿用）：

```bash
node .agents/skills/daily/scripts/todo-snapshot.mjs --file <当天 Daily 的绝对路径>
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
- `manualAttributions` 只保存用户明确确认的单条归属，键为记录 `key`，值为候选 `localPath` 与确认来源；它不改变 DIDA 原始关联任务 ID。
- 日期内合计按记录 `key` 去重并包含待归属记录一次；周期汇总按 `date + key` 去重。不得把每个来源行的“待归属”提示再次求和，因为同一记录可能提示在多个来源上。
- 快照只有在成功 Review 写入生成区后才成为保存结果；脚本本身只读。历史缺快照时报告缺失，当前任务区与快照不同则警告并保留旧归属，不悄悄覆盖。

- DIDA CLI 未安装、未登录、查询失败或返回无法解析的数据时，保留现有生成区不变并报告原因。
- 不使用不可靠的 `task get.focusSummaries` 作为实际专注事实。
- 不通过 Daily 工作流完成、更新、移动、评论或删除 DIDA 任务。
- 不因标题或 DIDA task ID 相同合并 Task；必须核对目标、范围和连续上下文。DIDA 可以是多个 Task 共享的长期计时来源。
- 不扫描或修改 `raws/`、Legacy、Archived、Canvas 或 `.obsidian/workspace*.json`。

## Knowledge Intake

- Review 逐条查看小零碎，扫描任务子项与收尾，兼容旧 `碎碎念`、材料与待分流；排除任务池、Dataview 与自动专注区。
- 高置信 Insight 在 Review 中直接追加到当月 Insight Log，不再要求逐条确认；保持用户原意、去重并链接来源 Daily，在每条正文末尾沿用用户已有主题标签，未写或不足时再按默认 1–3 个补充。含义不确定时留在原处，不为达到数量而改写成格言。格式与标签规则见 [[agents/schema/page-types/insight-log|Insight Log]]。相关发现和成果可更新已有 Theme，新建 Theme 必须由用户明确提出或确认，不从工作次数或主题标签推断。
- 新 Daily 不设专门候选栏目；待整理内容留在原记录。既有聚合继续兼容旧标题 `Knowledge Candidates` 与 `待分流` 下的普通列表、Markdown task，不把全部小零碎自动列为候选。
- Theme、Task 与 Compile 等会改变承诺或长期知识的位置仍按各自边界确认；Insight 是 Review 的低成本自动摘录去向。明确委托整批迁移时可以处理其他高置信内容，但不包含未逐项确认的新 Theme。Daily 不要求动作级 Theme 标签，Task 全部活动与时长也不自动归入 Theme。
- compile 完成后可以在原候选后追加目标 Wiki wikilink，并将 task 候选标为完成。

## 手写入口与 Todo 笔记

新建 Task 和日常补录都在 `## Todo` 使用「事项｜状态｜完成时间｜备注」四列表格，每项一行。表头、分隔线和数据行之间不留空行，单元格中的竖线写成 `\|`，备注按来源日期组织并用 <br> 换行。保留 task-step 元数据、完成日链接和唯一的 ^step-NNN 兼容锚点。Daily review 只补尚未记录的过程笔记，保留原文和来源链接。详见 `agents/schema/workflows/task-todo.md`。

## 关注组快照与复盘

晨间的新模板使用 `task-pool` 共享视图，当前关注组置顶，全量池折叠，无当前组时全量展开。未分组任务仍正常参与 Daily，自动续入不按组过滤。具体组由用户选择，Agent 不自动建季度/迭代组。

新视图的 Daily 在收口检查前，先运行 `node .agents/skills/daily/scripts/task-group-snapshot.mjs --file <Daily绝对路径>`，核对并将输出保存到 `workspace/daily/_meta/task-groups/{YYYY}/{YYYY-MM}/{YYYY-MM-DD}.task-groups.md`。本地插件也会自动保存今日开放页，并提供“保存今日关注组快照”命令。随后 `daily-review-check.mjs` 校验快照存在、有效且与今天的组一致；缺失或变化须修复后再关闭。快照脚本只读，依赖 python3 + PyYAML；失败时保留原文件。历史缺失不可使用当前组补造，旧视图 Daily 不新增此关闭条件。详见 [[agents/schema/page-types/task-group|Task Group]]。

## 锻炼整理

Daily Review 在原有任务收口检查之前，按 [[agents/schema/page-types/exercise|锻炼与动作页]] 执行只读 `exercise-review.mjs`，先创建缺失动作页，再只补 Daily 动作链接；重复执行须无新建页和正文差异。未解决的问题会由收口检查报告。当天无记录直接忽略。动作页只读汇总每条训练记录；同日相同动作的多行不合并、不去重，已有知识正文不覆盖。
