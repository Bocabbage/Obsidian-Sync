---
type: agent-index
updated: 2026-10-14
---

# Agent 规范与工作材料

这是一个以 Markdown、YAML Properties、wikilinks 和附件为事实载体的 Obsidian 个人知识库，不是代码项目。

本目录集中保存知识库规范、系统设计、展示组件和 Agent 工作记录。`agents/` 是普通内容目录；`.agents/skills/` 和 `.claude/skills/` 是现有工具的技能加载入口。

## 目录导航

- [[agents/docs/vault-guide|这个知识库怎么用]]：给人看的使用指南，配有目录、任务关系和材料流转图；帮助理解，不替代 Schema 契约。
- [[agents/schema/README|Schema]]：当前生效的结构、字段、来源适配、工作流和模板。
- [[agents/specs/README|Specs]]：系统改造设计；未经提升到 Schema，不作为现行规则执行。
- [[agents/sessions/_Index|Sessions]]：Agent 会话与操作摘要。
- [[agents/drafts/README|Agent 草稿]]：暂定分析、待审核建议和写作试稿。
- [[agents/views/README|Views]]：首页、Canvas 和可复用展示组件。
- `agents/migrations/`：一次性迁移的清单、进度与验证记录。
- [[agents/backlog|Backlog]]：知识库自身的维护待办。

## 必读顺序

1. 先阅读根目录 `AGENTS.md`，再阅读本文件。
2. 阅读 `agents/schema/README.md` 和 `agents/schema/ownership.md`。
3. 进入具体目录时阅读该目录最近的 `AGENTS.md`。
4. 根据任务读取相关 `agents/schema/workflows/`、`agents/schema/sources/` 和 `agents/schema/domains/` 文件。

`CLAUDE.md` 只作为兼容入口；详细契约以本文件和 `agents/schema/` 为准。规则冲突时先停止批量修改并修正规则来源。

## 顶层所有权

| 路径 | 角色 | 默认读取 | 默认写入 |
|---|---|---:|---:|
| `raws/` | 可追溯的来源材料与同步数据 | 是 | 默认否；授权捕获见下文 |
| `raws/Douban/_assets/` | Douban 封面缓存 | 按需 | 否 |
| `workspace/` | 日常计划、任务、想法、笔记与草稿 | 按需 | 是 |
| `wiki/` | 人和 Agent 可读的 compiled knowledge | 是 | 是 |
| `agents/` | 规范、系统设计、视图、会话、迁移与维护待办 | 按需 | 按下述类型规则 |
| `agents/schema/` | 结构、字段、来源和工作流契约 | 是 | 谨慎 |
| 根级 `legacy-*` | 所有权混合的待拆分内容 | 仅迁移时 | 仅迁移时 |
| `wiki/**/legacy-*` | 领域已确认、结构待编译的知识 | 是 | 是 |
| `archived/` | 完全废弃、仅留存 | 否 | 否 |

完整解释见 `agents/schema/ownership.md`。

## 核心原则

- Markdown 是持久事实来源，不把唯一数据只存进插件视图、缓存或聊天历史。
- Raw 保留可追溯的来源材料（原文或忠实整理的捕获）；`raws/Notes/` 是用户明确选择的可持续编辑学习笔记例外。Workspace 保存计划与过程；Wiki 保存编译成果；Schema 保存规则。
- Wiki 内容必须区分来源事实、用户判断和 Agent 推断，并保持可追溯的来源链。
- 使用 `[[wikilinks]]` 连接页面，存在同名风险时使用完整 vault 路径和显示别名。
- YAML 放在文件开头，只保存稳定、可筛选或可校验的字段；具体规则见 `agents/schema/properties.md`。
- 不为了目录整齐过度拆页，只有需要独立检索、复用或被引用时才拆分。

## 面向人的写作

- 新建或修改 Theme、Task、Plan、Review、Insight、学习笔记和 Wiki 的自然语言正文时，同时使用 `.agents/skills/human-writing/SKILL.md`；Claude 兼容副本在 `.claude/skills/human-writing/`。只作用于当前获准写入的内容，不因读取而改写页面。
- 技术概念、来源与必要限定保留；日常描述写得自然、具体。Schema、模板和既定安排照常遵守，不为改善文风另改结构契约、任务状态或学习路线。
- 写作 Skill 不改 Raw、同步数据、引用原文或历史记录，也不触发批量润色。用户要求试写时先给草稿，具体边界与样例见 Skill。

## 工作流路由

| 任务 | 必读规则 | 主要输出 |
|---|---|---|
| 导入一个来源 | `agents/schema/workflows/ingest.md` + 对应 source adapter | `wiki/sources/`、相关领域页、Wiki Log |
| 捕获对话素材（不等于 Wiki ingest） | `agents/schema/page-types/raw-source.md` + `agents/schema/sources/codex.md`（Codex 来源） | 经用户授权的 `raws/Codex/` 捕获 |
| 编译或重组知识 | `agents/schema/workflows/compile.md` + domain schema | Wiki concept/entity/map/synthesis |
| 基于知识库回答 | `agents/schema/workflows/query.md` | 对话答案；必要时保存 synthesis |
| 健康检查 | `agents/schema/workflows/lint.md` | `wiki/_meta/lint-report.md` |
| 迁移 Legacy | `agents/schema/workflows/migrate-legacy.md` | `agents/migrations/` + 目标层 |
| 会话记录 | `agents/schema/workflows/session.md` + `session-log` Skill | `agents/sessions/` |
| Daily / Todo / Task 创建与复盘 | `agents/schema/workflows/daily.md` + `daily` Skill | `workspace/daily/`、`workspace/todos/`、`workspace/tasks/` |
| 零碎记录分流 | `agents/schema/workflows/knowledge-intake.md` | `workspace/themes/`、`workspace/insights/`、Wiki |
| 用户设立或维护 Theme | `agents/schema/page-types/theme.md` + `agents/schema/workflows/knowledge-intake.md` | 经用户确认的 Theme、相关 Task 链接与成果 |
| 确认学习 roadmap、生成或维护学习记录 | `agents/schema/workflows/learning.md` + `agents/schema/page-types/learning-note.md` | `workspace/learning/` 主学习笔记、Theme 阶段入口 |
| 周/月/季度计划复盘 | `agents/schema/workflows/periodic-review.md` + 对应 Skill | `workspace/plans/` |
| 书籍与影视目录 | `agents/schema/workflows/media-catalog.md` + source adapters | `wiki/sources/*/index.md` |
| Homepage / Canvas | `agents/schema/workflows/homepage.md` + `agents/schema/views.md` | `agents/views/overview/home.md` + `agents/views/overview/overview.canvas` |

## Raw 与来源

- 用户明确要求保存某次对话/资料为来源材料时，Agent 可按对应 adapter 新建 Raw；这不授权改写既有 Raw 或插件文件。捕获后默认只读。
- `raws/Notes/` 保存用户选择迁入本地并继续维护的学习笔记。仅此目录可在用户委托下修改既有正文；原始来源和迁入日期须保留，后续内容不冒充迁入时原文。具体见 `agents/schema/sources/notes.md`。
- AI 对话可以按概念、问答、列表或表格忠实整理，不要求完整逐字导出；必须保留范围、来源、说话者和未验证边界，不把捕获时新生成的解释混入原对话。
- 持续改写的个人理解通常留 Workspace；用户明确指定的 `raws/Notes/` 学习笔记按其适配规则维护。跨来源知识综合进入 Wiki；`agents/sessions/` 保存操作摘要，不替代学习对话素材。Theme 通过 `materials` 列表正式关联 Raw，正文继续解释材料用途；Raw 通过 Obsidian 原生反向链接查看相关 Theme，不回写关系或 Theme 状态。
- `raws/Douban/`、`raws/Douban/_assets/` 和 `raws/WeRead/` 由同步插件维护，Agent 默认不得手工改写。
- Web 剪藏按 `raws/Web/{年份}/YYYY-MM/` 保存，日期负责分片，来源标签只作宽松元数据；领域与 Theme 判断不回写 Raw。
- 不在插件文件中增加跨来源链接；Douban 与 WeRead 的自动关系由目录视图推导，例外覆盖写入 `wiki/sources/link-overrides/`。
- 书籍匹配优先使用 ISBN，标题相似不得直接合并；见 `agents/schema/sources/identity-resolution.md`。
- 需要调整同步模板、覆盖行为或附件路径时，先读取插件配置和官方文档，并将其视为单独配置任务。

## Wiki

- 普通 Query 从 `wiki/index.md` 和领域 Map 开始，只有核实原文时再进入 Raw。
- `wiki/**/legacy-*` 可以参与查询，但必须视为 provisional 内容，不能假定来源和字段完整。
- 新 Wiki 页面按 `agents/schema/page-types/` 创建，优先更新已有页面而不是制造重复总结；Douban 媒体目录不要求为每个 Raw 建立 source page。
- Ingest、compile、query 存档和 lint 操作追加到 `wiki/_meta/log.md`；普通会话不写入该日志。

## Agent 工作材料

- `agents/schema/` 保存当前生效的契约；修改时同步检查入口、Skills、模板、查询和配置。
- `agents/specs/` 保存系统设计；Spec 提升到 Schema 前不得当作当前规则执行。
- `agents/drafts/` 保存 Agent 暂定分析、待审核建议和试写；Task 或 Theme 引用不表示用户已确认其中的判断，不自动当作个人结论、Wiki 知识或 Schema 规则。
- `agents/views/` 保存首页、Canvas 与可复用展示组件；个人工作事实留在 Workspace，视图的操作能力遵循对应工作流。
- 会话摘要写入 `agents/sessions/{年份}/YYYY-MM/`，记录 Agent 操作、决定和待办，不替代学习素材或个人笔记。
- 一次性迁移进度写入 `agents/migrations/`，知识库自身的后续事项写入 `agents/backlog.md`；后者不替代个人 Todo。
- 运行记录只在用户请求或对应本地 Skill 已触发时更新；历史文件保留当时正文、日期和状态，结构迁移只修复实际链接目标。

## Workspace

- Daily 写入 `workspace/daily/{年份}/YYYY-MM/`；一次性 Todo 按创建月写入 `workspace/todos/{年份}/YYYY-MM.md`；Theme、Insight 与周/月/季度计划分别写入 `workspace/themes/`、`workspace/insights/` 和 `workspace/plans/`。
- 需要多次推进、独立统计或稳定外部映射的任务写入 `workspace/tasks/`；Task 的 `## Todo` 聚合可独立追踪子项；Daily 的“跨日任务”保存当天 occurrence 和精确子项回链。一次性小事统一保存到月度 Todo，在 Daily 的“小任务”直接添加、勾选，常规任务未完成不阻止收口，今日必做与逾期项需先处理；随手记录统一放“小零碎”，不预设材料或待分流栏目。等待跨过日期本身不构成 Task。
- Reading Note 写入 `workspace/reading/books/`，Viewing Note 写入 `workspace/viewing/`；两者都只在确有人工内容时按需建立。
- 新增的学习类 Theme 记录写入 `workspace/learning/`，使用 `type: learning-note`。用户明确创建 Theme 并确认 roadmap 后，同次生成一份主笔记；按阶段留下随手记录和阶段整理，并在 Theme 的 roadmap 链接对应标题。重复生成复用已有页，保留已写内容；具体见 `agents/schema/workflows/learning.md`。
- 学习笔记用 `themes` 回链已确认的 Theme，Theme 通过 roadmap 和正文关联笔记；`materials` 仍只关联 Raw。既有 Reading Note 和 `raws/Notes/` 继续遵循各自契约，不因新增目录迁移。
- Task Todo 复盘交接、晨间自动续入与历史保护遵循 `agents/schema/workflows/task-todo.md`；不把旧 Daily 的未勾选项直接复制为新事实，不实时双向勾选同步。
- DIDA 是 Task Entity 或 Daily 的可选外部映射与专注来源；不自动拉取今日任务，也不使用 DIDA 整体状态覆盖本地 Task 或当天 Checkbox。
- Workspace 内容只有经过 compile 才进入 Wiki。
- Daily Review 摘录 Insight 时逐条保留上下文与来源，在每条正文末尾沿用用户手写的主题标签，未写或不足时再按默认 1–3 个 `#topic/主题` 补充；标签用于跨日期检索编译材料，不等同于 Theme 或已验证知识，详见 `agents/schema/page-types/insight-log.md`。
- Theme 是用户主动设立、值得独立规划和回看的方向或阶段性事项，保存目的、范围、推进路线和结果，并指导 Task；可以是跨季度学习，也可以是一次旅行。Agent 只能建议，未经明确确认不得建页（包括 seed），一般性整理/迁移授权也不例外。Task 可以没有 Theme；明确服务既有 Theme 的 Raw 在捕获或整理时维护该 Theme 的 `materials`，不凭标签相同自动关联。
- Task 与 DIDA 通过 `dida_urls` 维护 N:N 映射，可显式列入父/子任务来源；不按 DIDA ID 合并本地 Task。专注按记录去重、按本地 Task 合并并保存每日归属，不推导精确 Theme 工时。
- Todo 原行保存录入、应完成与完成/结束日期；改期记录当日安排历史，视图显示录入日期及今日必做、逾期、常规任务分组；Daily 按本页日期回看，复盘时冻结待办快照。过去的 Daily 只读显示历史，不能由后来完成或新增事项改写。

## Legacy 与 Archived

- 根级 `legacy-*` 默认不参加普通 Query，也不允许因“看起来相似”整体移动到 Wiki。
- 迁移 Root Legacy 时先拆分 Raw、Workspace、Wiki、视图和附件的所有权。
- Wiki 内 Legacy 已确认领域归属，可以在明确范围内逐步编译；移除前缀前检查链接和 lint。
- `archived/` 默认不读取、不修改、不迁移；只有用户明确指定历史内容时才进入。

## 视图与附件

```text
Markdown + Properties + Tasks = 数据源
Bases + Dataview + Tasks = 查询/操作视图
Minimal + CSS snippets = 展示层
```

- 视图不是新的事实来源，详细规范见 `agents/schema/views.md`。
- 不直接修改主题原文件；样式调整放入 `.obsidian/snippets/`。
- Douban 封面只读展示 `raws/Douban/_assets/`；新 Wiki 附件放 `wiki/_assets/<domain>/`，Workspace 附件放 `workspace/_assets/`。

## 文件操作与检查

- 修改前检查目标目录、相关 Schema、现有内容和 `git status`，保留用户已有改动。
- 移动或重命名文件前使用全文搜索检查 wikilink、Markdown link、Dataview、模板和 Skill 引用。
- 不修改 `.obsidian/workspace*.json` 来完成内容结构调整。
- 这是 Markdown 知识库，没有构建流程；完成后检查路径、YAML、wikilinks、查询语法和规则一致性。
- 对不确定的插件行为先查本地配置或官方文档，不凭假设批量改写内容。

## Git 与同步

- OneDrive 负责整个 Vault 的内容同步；Git 只保存 Agent 规则、Schema、Skills、系统 Spec、迁移控制、索引骨架、CSS snippets、明确列入白名单的视图与本地 Daily 插件源码。
- Raw 与来源附件、Daily/Todo/Task 正文、Theme/Insight/Plan/Learning Note 正文、会话、普通 Wiki 正文、Legacy 和 Archived 不进入 Git；完整白名单见 `agents/schema/version-control.md`。
- `.gitignore` 默认忽略所有 Vault 内容，不使用 `git add .` 绕过白名单。
- 提交前检查 `git status` 和 staged diff，避开用户的历史删除、工作区状态、缓存和无关配置变化。
- 不在用户未明确要求时 commit 或 push。
- OneDrive 与 Git 并存时尽量在单一主设备执行 Git 操作，减少同步冲突。


新建 Task 和日常补录都在 `## Todo` 使用「事项｜状态｜完成时间｜备注」四列表格，每项一行。表头、分隔线和数据行之间不留空行，单元格中的竖线写成 `\|`，备注按来源日期组织并用 <br> 换行。保留 task-step 元数据、完成日链接和唯一的 ^step-NNN 兼容锚点。Daily review 只补尚未记录的过程笔记，保留原文和来源链接。详见 `agents/schema/workflows/task-todo.md`。

## 周期任务关注组

[[workspace/task-groups/_Index|关注组]] 保存季度 LIFE、工作版本迭代等周期内的 Task 集合，可多个并行。Group 只影响 Daily 任务池展示，未分组任务照常安排和续入；关闭组不关闭任务。维护前阅读 [[agents/schema/page-types/task-group|Task Group 契约]]。每日组快照保存于 `workspace/daily/_meta/task-groups/`，过去或已关闭 Daily 不随当前成员变动；新视图复盘前须保存并检查最新快照。

## Daily 锻炼记录

每日锻炼表与动作页按 [[agents/schema/page-types/exercise|锻炼契约]] 维护。Daily review 有记录才整理链接并在 `workspace/exercises/` 创建新动作页，无记录跳过；同日每行分别保留。动作页汇总 Daily 训练历史并承接个人动作笔记和学习资料，不作为另一份可编辑训练台账。
