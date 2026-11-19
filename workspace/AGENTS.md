# Workspace Agent 规则

进入本目录前先阅读根目录 `AGENTS.md`、`agents/README.md`、`agents/schema/ownership.md` 和相关工作流。

- Workspace 保存人的日常计划、任务、想法、学习笔记和草稿，内容不是默认的长期知识事实。
- 给人读的正文写作同时使用`agents/README.md` 路由的 `human-writing` Skill；不因润色改变原有安排、任务状态、历史记录或结构字段。
- 只在用户请求或对应本地 Skill 已触发时修改实际工作记录。
- Daily 写入 `workspace/daily/`，轻量待办写入 `workspace/todos/`，跨日 Task 写入 `workspace/tasks/`，Theme 写入 `workspace/themes/`，Insight 写入 `workspace/insights/`，周期计划写入 `workspace/plans/`。
- 人工阅读笔记写入 `workspace/reading/books/`，个人观影记录写入 `workspace/viewing/`；Douban 已有目录状态且没有额外人工内容时不建立空壳页。
- 新增的 Theme 学习记录写入 `workspace/learning/`；先读 `agents/schema/page-types/learning-note.md`、`agents/schema/workflows/learning.md` 和目录内 `AGENTS.md`。用户明确创建学习 Theme 并确认 roadmap 后，同次生成主笔记和阶段入口；重复维护保留已有内容。笔记用 `themes` 回链，Theme 的 `materials` 继续只关联 Raw；不自动迁移 Reading Note 或 `raws/Notes/`。
- Daily 以“跨日任务”保存 Task Entity 的当天 occurrence；一次性小事统一进入月度 Todo，通过 Daily 的“小任务”直接添加、勾选，一行一项且不建页。随手记录统一写入“小零碎”。执行本身需多次推进、需统计或带稳定 DIDA 映射的事项才使用 Task Entity。`/daily-review` 先收口当日 occurrence，再生成关联任务的当天专注汇总并自动摘录高置信 Insight。详细规则见 `agents/schema/workflows/daily.md`。
- Task 内部可独立追踪子项统一写该页 `## Todo`，Daily 以稳定 `#^step-NNN` 链接静态 occurrence，复盘按同一条目更新；自动续入见 `agents/schema/workflows/task-todo.md`。小任务只保留同一份清单，不另设今日安排或候选区，常规任务不要求当天清空，今日必做与逾期项必须明确处理后才可复盘关闭；旧版当日任务和候选池继续兼容，历史 Daily 不重排。
- 知识库规范、系统设计、会话摘要、迁移记录、Agent 草稿与维护待办分别存入 `agents/`；`agents/drafts/` 保存待审核的暂定分析与试写，个人内容不因由 AI 辅助写作就自动归入该目录。具体所有权与写入边界见 `agents/schema/ownership.md`。
- Theme 是用户主动设立、值得独立规划和回看的方向或阶段性事项，保存目的、范围、推进路线和结果，并指导 Task；支持持续学习和一次旅行等有限事项。Agent 只建议，不从工作反复出现自动创建或激活。Task 与 Theme 可多对多或不关联，Daily 无需逐动作标 Theme。Theme 用 `materials` 列表正式关联 Raw，正文保留用途说明，Raw 通过原生反向链接查看 Theme。Insight 按月保存可独立重读的想法。
- Todo 的日期保存在原行（录入 `➕`、应完成 `📅`、完成 `✅`、取消/转 Task 的 `[closed:: YYYY-MM-DD]`）；改期保留 `due_history`，Daily 先读复盘快照、缺快照再按日期回看，不用当前未完成过滤冒充历史。Task 的 DIDA 绑定使用 `dida_urls` 列表，允许 N:N。
- Workspace 的导航索引统一命名 `_Index.md`，包括 Todo 聚合入口；保留 `type: workspace-index`，不当作实体正文。Wiki 和插件来源目录不随之改名。
- Homepage、Canvas 与查询组件集中在 `agents/views/overview/`；Workspace 只保留个人工作事实和相关导航，不在首页或 Canvas 中复制数据。
- 值得长期复用的结论通过 compile 进入 Wiki，不直接移动整份过程记录。


新建 Task 和日常补录都在 `## Todo` 使用「事项｜状态｜完成时间｜备注」四列表格，每项一行。表头、分隔线和数据行之间不留空行，单元格中的竖线写成 `\|`，备注按来源日期组织并用 <br> 换行。保留 task-step 元数据、完成日链接和唯一的 ^step-NNN 兼容锚点。Daily review 只补尚未记录的过程笔记，保留原文和来源链接。详见 `agents/schema/workflows/task-todo.md`。

- `workspace/task-groups/` 保存周期关注组，按 `agents/schema/page-types/task-group.md` 维护；多个组可并行，未分组 Task 照常参与 Daily。组关闭不改 Task 状态，历史 Daily 的组名/成员以每日快照为准，禁止用当前组补造旧快照。

- `workspace/exercises/` 保存动作页，按 `agents/schema/page-types/exercise.md` 维护。Daily review 只在有记录时创建缺失动作页并补链接；同日同动作的多条记录全部保留，动作页知识正文不自动覆盖。
