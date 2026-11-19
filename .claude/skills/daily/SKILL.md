---
name: daily
description: 在本 Obsidian Vault 创建或更新轻量 Daily、月度 Todo 与跨日 Task Entity；用户说“今日计划”“开始今天”或“/daily”时维护任务 occurrence、小任务和小零碎，说“今日总结”“记录完成”或“/daily-review”时收口当日状态、汇总 DIDA 专注、摘录 Insight，并建议 Theme、Task 或知识材料的去向。DIDA 不是唯一任务来源。
---

# Daily v5

Daily 是当天工作切片、小任务和小零碎的入口，Todo Log 统一保存一次性小事，Task Entity 保存需要多次推进的承诺与全局状态。执行前阅读 `agents/schema/page-types/daily.md`、`agents/schema/page-types/todo-log.md`、`agents/schema/page-types/task.md`、`agents/schema/page-types/insight-log.md`、`agents/schema/workflows/daily.md`、`agents/schema/workflows/task-todo.md` 与 `agents/schema/workflows/knowledge-intake.md`。

## 路径与模板

```text
workspace/daily/{YYYY}/{YYYY-MM}/{YYYY-MM-DD}.daily.md
workspace/todos/{YYYY}/{YYYY-MM}.md
workspace/tasks/TASK-{YYYYMM}-{NNN}.md
agents/schema/templates/daily-template.md
agents/schema/templates/todo-month-template.md
agents/schema/templates/task-template.md
```

日期使用 Asia/Shanghai。文件不存在时从模板创建；已经存在时更新原文件，不覆盖人工内容。

## 晨间：`/daily`

- 创建或打开当天 Daily。日期标题后先放“今日心情” Callout，再放导航；正文按“任务池 → 跨日任务 → 小任务 → 锻炼 → 小零碎 → 专注 → 收尾”排列。锻炼保留空表供手写，未填写时直接忽略。
- `任务池` 只读显示截至本页日期尚未全局闭环的 Task；已有 Task Todo 按续入规则生成今天的 occurrence，用户可以调整；不因 Task 活跃就自动加入整项任务。
- `小任务` 是独立二级标题，直接展开小任务待办池视图；今天做和以后做都在同一处添加、勾选，不另设今日安排或候选区。按 Daily.date 展示今日必做、逾期、常规任务和当日完成/结束事项，显示录入日期；优先读取 `workspace/daily/_meta/todos/` 快照；缺快照时根据原条目日期回看。今日开放页面支持添加、勾选和安排 / 改期，历史页只读，跨月不搬运；常规任务不影响收口，今日必做与逾期项需先处理。
- Task occurrence 使用不带 Checkbox 的普通列表项标题：`- [[workspace/tasks/TASK-YYYYMM-NNN|任务标题]] — 今日切片`；具体事项缩进在标题下并使用 Checkbox。不要给 Task 标题加 Checkbox 或状态图标；同一任务跨日重复引用同一实体，不复制任务本体。
- 日间手写 Daily 即可；在 `/daily-review` 时由 Agent 整理 Task Todo 列表及按日期的笔记，并补明细回链。
- 一次性小事统一写入当前月 Todo Log，从 Daily 的 `小任务` 即可添加、勾选，一行一个 Checkbox，不为它建立页面或 Task ID，不重复写入 Daily 正文。
- 稳定 DIDA 链接与独立专注统计由 Task Entity 承接；旧 Daily 任务区的直接关联继续兼容，小任务视图不自动参与专注归属。不要自动拉取 DIDA 今日任务。
- DIDA 不是唯一来源，没有外部链接的本地任务完全合法。
- `跨日任务` 以三级高低优先级分组，各自下设四级 `WORK` / `LIFE`；`小任务` 使用现有视图与原条目分组，不再预留空的今日安排。空组可留空，保留用户已选分组；不新增 Task/Theme 分类字段、不批量重排历史。旧版 `当日任务`、`今日安排` 与折叠候选池继续兼容。
- 可独立追踪子项的持续状态只放对应 Task 的 `## Todo`，每日用精确 `#^step-NNN` 回链并保存静态文案。创建时本地 Vault Daily Todos 插件一次性续入；Agent 晨间先核对是否已生成，必要时用 `scripts/task-todo.mjs --file <今日Daily绝对路径>` 只读生成建议、应用差异，不重复复制。延期/暂停、去重与失败边界见 `agents/schema/workflows/task-todo.md`。
- Task 的 `priority` 是任务池全局优先级，Daily 高低分组表示当天顺序，可以不同。
- 任务池共享视图沿用 `date(created) <= this.date` 且 `(!closed OR date(closed) > this.date)`，不按当前 `status` 过滤，也不设条目上限；旧内嵌 Dataview 查询继续兼容。表中的 `status` 应标注为“当前状态”。当前关注组展开，全量池折叠；无当前组时全量池展开。未分组任务正常参与 Daily，自动续入不按组过滤。

状态约定：

| 标记 | 含义 |
|---|---|
| `[ ]` | 未开始 |
| `[/]` | 进行中 |
| `[>]` | 当天 occurrence 已交接给 Task Entity 或 Todo 原条目，以后继续 |
| `[x]` | 今天计划完成的切片已完成 |
| `[-]` | 取消 |

Daily 的具体事项 Checkbox 不代表 Task Entity 或 DIDA 整体状态。不要因 DIDA 仍未完成而撤销当天的 `[x]`，也不要从单日 `[x]` 自动关闭 Task Entity；Task 标题本身没有完成状态。

## Todo 交接与 Task 提升

- “常规任务”表示当前不必当天完成，不代表低优先级，也不等于“工作本身跨日”。一次性小事统一进入 `workspace/todos/{YYYY}/{YYYY-MM}.md`；创建月份只是存储分片，没做完留在原处，跨月不搬运。
- Todo 原行保存 `➕` 录入日期、可选 `📅` 应完成日期、`✅` 完成日期及状态；取消/转 Task 用 `[closed:: YYYY-MM-DD]`。视图添加/勾选自动记录 Shanghai 当日日期和 block ID；Agent 处理时按真实发生日记录，不能以文件日期猜测。
- 默认录入常规任务；只有用户明确当天必须完成才设为今日必做（`📅` 今天）。到期未完成自动显示逾期，未到期显示在常规任务并注明应完成日期。已有任务不因查看或复盘自动变成必做，不批量补日期。
- 用户决定改期或转回常规任务时，使用 `node scripts/todo-schedule.mjs --file <月度Todo绝对路径> --id <todo-ID> --due YYYY-MM-DD`，取消日期用 `--due none`。脚本只输出建议的月文件，不写入；核对最新原文并应用目标条目差异，保留其他用户改动。它复用 ID 并维护 `due_history`，不要只删 `📅` 而丢弃旧安排。新条目可直接按 Todo Log 格式创建；尚无 ID 的旧条目先核对身份并补唯一锚点。具体格式见 `agents/schema/page-types/todo-log.md`。
- 直接操作 Todo 原条目；如需补记当天经过，在小零碎中链接它，不复制第二个待办 Checkbox。跨日重新提出已完成事项时创建新条目并引用旧条目，保留旧完成事实。
- 旧 Daily 的当日事项交接给 Todo 时，原事项改为 `[>] ... → [[workspace/todos/YYYY/YYYY-MM#^todo-YYYYMMDD-NN|小任务待办池]]`，保留当天交接历史，不再复制一个未完成 Checkbox。新模板的小任务已在 Todo 中，无需逐日交接。
- 已知执行本身会多次推进、需要 Weekly 按实体聚合、需要稳定 DIDA 映射或需要独立上下文时才建立 Task Entity。
- 新 ID 使用 `TASK-{YYYYMM}-{NNN}`，创建前扫描已有文件取当月下一序号；ID 永不复用。
- `dida_urls` 是 URL 字符串列表，支持本地 Task 与 DIDA N:N 绑定；父/子任务分别显式列入，不自动递归展开。旧单值字段继续兼容，单页不得混写。相同 DIDA ID 或标题不能自动复用本地实体。
- 专注按记录去重、按本地 Task 合并；同一记录命中多个父/子来源而本地候选唯一时归属该 Task，多候选继续待归属并保留人工指定能力。
- 提升 inline task 时创建实体，把稳定上下文和 DIDA 映射移入 Task 页面，并把原 Daily occurrence 改为链接实体的 `[>]`。等待天数本身不构成提升理由。

## 日间重点

用 Highlightr 的 Red 标记当天重点。选中任务或事件文字即可，勾选框与明细回链放在高亮外。

## 晚间：`/daily-review`

先处理可选锻炼记录：读取 `agents/schema/page-types/exercise.md`，运行 `node scripts/exercise-review.mjs --file <Daily绝对路径>` 获取只读 JSON 计划。当天没有锻炼记录（栏目缺失、只有表头或空行）直接跳过，不建动作页、不补零、不影响收口。有记录时先核对 `issues`，为空才按 `creates` 创建缺失动作页，再将 `markdown` 中仅动作链接的差异应用到当前 Daily；应用前重读源文件，保留并发人工改动。再次运行确认 `creates` 为空、Daily 无需改动，然后执行原有复盘流程。不得用整个旧输出覆盖新编辑。已有动作笔记不改写，不按“日期 + 动作”或相同数值去重，同日每行按原顺序保留。未解决名称歧义、失效链接或表格错误时先提示，不声称整理完成或关闭页面；已关闭历史 Daily 不自动补录。

**识别当天重点。** 复盘时读取当天 Daily 的人工正文，把 Highlightr Red（`<mark class="hltr-red">…</mark>`）视为用户标记的重点。事项正文只要有一段红色高亮，就回顾整条事项，每条只列一次。带红色高亮的普通笔记也列为重点事件，无需补勾选框。只按这种高亮识别，跳过模板示例和自动生成内容。

**报告完成情况。** 有重点时，在复盘回复里加一小段「今日重点」，按当天勾选状态区分已完成 `[x]`、未完成 `[ ]` / `[/]`、继续推进 `[>]`、已取消 `[-]`，只列实际出现的状态。仅完成当日切片时，按切片范围描述。没有勾选框的重点事件只回顾内容。未标重点时省略这一段。

**保留标记。** 红色高亮留在原 Daily。匹配或录入 Task Todo 时去掉高亮标签，次日续入沿用任务正文。

1. 定位当天 Daily；不存在时创建空模板，但不臆造任务。
2. 根据用户明确报告，把 Task 标题下的具体事项 `[ ]` / `[/]` 全部收口为 `[x]`、`[-]` 或 `[>]`；`[>]` 必须精确交接给对应 Task 的 Todo block。旧版 `当日任务` / `今日安排`（含直接 WORK/LIFE）仍检查，一次性 `[>]` 精确交接给月度 Todo 原条目。月度 `小任务` 中的今日必做 / 逾期项须完成、取消、转 Task 或由用户明确改期 / 转回常规任务；常规任务及旧候选展示不要求逐项交接，不复制第二份 Checkbox。纯 Task 标题不添加状态。
   先更新 Task Todo 再改 Daily：同一子项复用锚点；未完成留待办、整项完成/取消补结束日期，Daily 只完成局部时不自动结束原条目。更新 Task Todo 与当天笔记；绝不只留一个没有实际待办的实体级交接。详见 `agents/schema/workflows/task-todo.md`。
3. 用户只说“今天这一段做完”时只标记 Daily `[x]`；只有用户明确说整体完成、取消或阻塞，才更新 Task Entity 全局状态。整体完成或取消时同时写入 `closed: YYYY-MM-DD`。随后更新 Task Todo 的状态、完成日期，并按来源日期归入当天过程笔记；不创建 Task 级重复时间线。
4. 若 Daily 使用 `agents/views/overview/_views/task-pool`，先运行 `node scripts/task-group-snapshot.mjs --file <Daily绝对路径>`（只读，依赖 python3 + PyYAML），核对最新源文件后把输出保存到 `workspace/daily/_meta/task-groups/{YYYY}/{YYYY-MM}/{YYYY-MM-DD}.task-groups.md`；即使没有当前组也保存空列表。今天开放页可更新，历史/已关闭页只沿用已有快照，缺失时不以当前组补造。随后运行本 Skill 目录下的只读收口检查，同时强校验今日心情、任务状态和新视图的组快照：

   ```bash
   node scripts/daily-review-check.mjs --file <当天 Daily 的绝对路径>
   ```

   `今日心情` Callout 必须有用户填写的正文；缺少栏目、只有标题、空白、注释或空列表/Checkbox 标记均不通过，简短文字或 emoji 即可。未填写时即使所有任务都已处理，也必须保持 `status: open` 并提示用户补写，不编造、不代填。检查报告的 `smallTaskIssues` 同时列出月度 Todo 的今日必做 / 逾期未处理项及无效日期；未处理必须保持开放，不能默默延期。若受检任务区仍有 `[ ]` / `[/]`，或 `[>]` 没有精确有效的交接（新制 Task Todo / 月度 Todo block），同样保持开放并让用户决定，不臆造结果。新增校验不自动重开或补写已关闭的历史 Daily。

5. 核对全部 Todo 的录入与结束日期，运行 `node scripts/todo-snapshot.mjs --file <Daily绝对路径>`，把输出保存到 `workspace/daily/_meta/todos/{YYYY}/{YYYY-MM}/{YYYY-MM-DD}.todos.md`。已有快照默认沿用，明确纠正该日时才用 `--refresh`；补做历史快照标为 reconstructed，不冒充当天保存。缺日期或安排历史矛盾先依据证据修正，不编造。新快照 version 2 保存当日 `due` 和 `created`；旧快照 version 1 沿用原分组，不补猜当时的必做安排。

6. 检查通过后运行专注汇总：

   ```bash
   node scripts/dida-focus-summary.mjs --file <当天 Daily 的绝对路径>
   ```

7. 同时以 `--format snapshot` 生成并更新 `workspace/daily/_meta/focus/{YYYY}/{YYYY-MM}/{YYYY-MM-DD}.dida-focus.md`；该侧车 Markdown 保存映射和记录快照，不占用 Daily 阅读视图。

8. 只替换以下标记之间的内容，保留标题、标记和所有人工正文：

   ```markdown
   <!-- dida-focus:start -->
   <!-- dida-focus:end -->
   ```

9. 逐条查看 `小零碎`（兼容旧 `碎碎念`），并扫描整篇 Daily 的其他人工内容，排除任务池、Todo 查询、Dataview、模板提示和专注生成区；区分 Insight、Theme、Task、待编译材料和仅保留的个人片段。
10. 高置信、可以脱离当天上下文独立重读的用户想法，直接追加到 `workspace/insights/{YYYY}/{YYYY-MM}.md`，一点一条。保持原意、对象、必要场景、疑问与不确定性，按内容与来源去重，保留 Daily 和原有材料链接；不得把流水账、模板句或 Agent 新推论改写成 Insight，含义不确定时留在 Daily。
    每条摘录的 `💡` 主行末尾必须附主题标签，不只写在月文件 YAML。优先原样沿用用户在 Daily 写好的标签（普通 `#主题` 也可）；够用就不补，不强改命名或为凑数量删标签。未写或不足时再补，默认使用 1–3 个 `#topic/主题`，优先复用已有准确名称。Daily 原标签保留，Agent 补充标签只维护在 Insight；已摘录的同一条目补标签，不因标签变化再次复制。完成后逐条核对内容可独立理解、来源有效、标签已补齐，具体选词和格式见 `agents/schema/page-types/insight-log.md`。每点都查看，但仍按原有标准决定是否摘录，不强制把所有碎片搬进 Insight。
11. Theme、Task 和 Compile 候选仍用一个紧凑问题让用户确认去向；用户明确授权整批迁移时可处理高置信内容，但新 Theme 仍需逐项明确确认。相关发现和成果可更新已有 Theme；明确服务既有 Theme 的 Raw 按 Knowledge Intake 维护其 `materials`，核对实际文件并去重，不回写 Raw。不从工作反复出现自动创建或激活。
12. 今日心情与任务收口检查通过，且 Todo 快照、专注摘要与侧车快照都成功保存后，把页面 Property `status` 设为 `closed`。再次执行时刷新同一区域与同一个侧车文件，不追加重复摘要。

专注脚本读取 `跨日任务` 及旧版 `当日任务` 中的 Task wikilink，并解析实体上的全部 `dida_urls`（兼容旧单值字段）；同时兼容这些任务区里的直接 DIDA Webapp 链接。它按 `tasks[].taskId` 匹配当天 focus、按记录 ID 去重，不会写回 DIDA，也不会为小任务池或无 DIDA 映射的本地任务虚构时长。

专注正文只保留可读汇总；当日映射、记录 ID 与时长快照保存到 `workspace/daily/_meta/focus/{YYYY}/{YYYY-MM}/{YYYY-MM-DD}.dida-focus.md`。重复 Review 默认沿用该侧车映射，不按当前 Task 映射重写历史；没有侧车时才兼容读取旧 Daily 内嵌快照。只有用户明确纠正该日归属时使用 `--refresh-mappings`。同日共享 DIDA 来源或 focus 记录归属不明时列入待归属，保留全部候选，不覆盖、不平分；这些项不妨碍 Daily 状态收口，但不得宣称已精确归属。周/月只汇总保存的每日结果，不重复映射季度总量。

用户明确指定一条共享 focus 记录的归属时，使用 --assign <record-key>=workspace/tasks/TASK-YYYYMM-NNN；只有候选本地 Task 可以被指定。生成侧车会在 manualAttributions 保存用户确认，后续同日刷新沿用该归属，不自动平分或转移。

Daily 不要求动作级 Theme 标记；Task.themes 只表示相关性，不能据此统计精确 Theme 工时。Task 可独立于 Theme。

若脚本失败、未登录或生成标记缺失/重复，保留现有专注区不变并报告问题。不要退回使用不可靠的 `task get.focusSummaries`。

## 小零碎与材料

- 与任务直接相关的进展、阻塞或产出可以缩进写在任务下，不建立“过程中”栏目。
- 随手想法、问题、资料链接与当天片段统一写入二级标题 `小零碎`；确需独立检索或复用时再建立材料页，从原记录链接。
- 新 Daily 不预设 `产生的材料`、`待分流`。Review 扫描整篇人工内容，旧 Daily 的 `碎碎念`、材料、待分流与 `Knowledge Candidates` 继续兼容；不把所有小零碎自动纳入候选聚合，不为更名重排历史 Daily。
- 按 Knowledge Intake 决定是否进入 Insight、Theme、Task 或 Compile，不要求所有碎片当天分类。

## 关注组

维护关注组前阅读 `agents/schema/page-types/task-group.md`。用户决定创建、增删成员和关闭；季度 LIFE 和工作迭代可多个并行。仅把 Task 引用保存在组文件，不改 Task 优先级/状态、不自动创建 Theme。关闭保留组与成员，后续周期引用同一 Task。过去 Daily 的组名/成员读取当天快照，今日开放页保存当天最新范围；旧 Daily 不批量迁移。插件提供创建、管理、保存今日快照命令，视图渲染不写快照。

## 手写入口与 Todo 笔记

新建 Task 和日常补录都在 `## Todo` 使用「事项｜状态｜完成时间｜备注」四列表格，每项一行。表头、分隔线和数据行之间不留空行，单元格中的竖线写成 `\|`，备注按来源日期组织并用 <br> 换行。保留 task-step 元数据、完成日链接和唯一的 ^step-NNN 兼容锚点。Daily review 只补尚未记录的过程笔记，保留原文和来源链接。详见 `agents/schema/workflows/task-todo.md`。

每项 Todo 的过程明细按来源日期和原有层级写入同页的 `## Todo 过程明细`，表格负责汇总。已有过程笔记的事项，将唯一的 `^step-NNN` 放在对应明细块的编号行（例如 `> 015 ^step-015`），让 Daily 的「明细」直接跳到过程记录。表格备注可保留摘要或来源链接。复盘时先核对 Daily 内部步骤已按同一事项归档，再做收口检查。

归档过程明细时，先用当前 Task 路径和 step ID 确认事项身份。只收录该事项下实际缩进的笔记，到下一个同级事项、分组或标题即停止。同级 Checkbox 各自归档，即使标题相似或外部链接相同。已有关联的表格备注也应有独立明细块，保持同一锚点。没有过程内容的事项保留定位锚点即可。收口前逐项核对明细里没有其他事项的记录。

核对过程明细时，逐项对照表格备注和来源 Daily。先确认 Task 路径、step ID 和日期，再比较内容。等义摘要保留一次，摘要省略的步骤、疑问、状态和链接补进对应日期。跨任务移交可以保留明确标注的回链。若原文未带 step，仅在同一 Task 内能唯一对应时归档。手写时让同级事项对齐，笔记比事项多缩进一级。
