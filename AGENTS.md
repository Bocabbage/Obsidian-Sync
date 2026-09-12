# Obsidian 知识库 Agent 规范

这是一个以 Markdown、YAML Properties、wikilinks 和附件为事实载体的 Obsidian 个人知识库，不是代码项目。

## 必读顺序

1. 所有 Agent 先阅读本文件。
2. 阅读 `schema/README.md` 和 `schema/ownership.md`。
3. 进入具体目录时阅读该目录最近的 `AGENTS.md`。
4. 根据任务读取相关 `schema/workflows/`、`schema/sources/` 和 `schema/domains/` 文件。

`CLAUDE.md` 只作为兼容入口；详细契约以本文件和 `schema/` 为准。规则冲突时先停止批量修改并修正规则来源。

## 顶层所有权

| 路径 | 角色 | 默认读取 | 默认写入 |
|---|---|---:|---:|
| `raws/` | 外部来源与同步数据 | 是 | 否 |
| `assets/` | 当前为 Douban 封面缓存 | 按需 | 否 |
| `workspace/` | 会话、计划、草稿、迁移和待办 | 按需 | 是 |
| `wiki/` | 人和 Agent 可读的 compiled knowledge | 是 | 是 |
| `schema/` | 结构、字段、来源和工作流契约 | 是 | 谨慎 |
| 根级 `legacy-*` | 所有权混合的待拆分内容 | 仅迁移时 | 仅迁移时 |
| `wiki/**/legacy-*` | 领域已确认、结构待编译的知识 | 是 | 是 |
| `archived/` | 完全废弃、仅留存 | 否 | 否 |

完整解释见 `schema/ownership.md`。

## 核心原则

- Markdown 是持久事实来源，不把唯一数据只存进插件视图、缓存或聊天历史。
- Raw 保留来源原貌；Workspace 保存过程；Wiki 保存长期成果；Schema 保存规则。
- Wiki 内容必须区分来源事实、用户判断和 Agent 推断，并保持可追溯的来源链。
- 使用 `[[wikilinks]]` 连接页面，存在同名风险时使用完整 vault 路径和显示别名。
- YAML 放在文件开头，只保存稳定、可筛选或可校验的字段；具体规则见 `schema/properties.md`。
- 不为了目录整齐过度拆页，只有需要独立检索、复用或被引用时才拆分。

## 工作流路由

| 任务 | 必读规则 | 主要输出 |
|---|---|---|
| 导入一个来源 | `schema/workflows/ingest.md` + 对应 source adapter | `wiki/sources/`、相关领域页、Wiki Log |
| 编译或重组知识 | `schema/workflows/compile.md` + domain schema | Wiki concept/entity/map/synthesis |
| 基于知识库回答 | `schema/workflows/query.md` | 对话答案；必要时保存 synthesis |
| 健康检查 | `schema/workflows/lint.md` | `wiki/_meta/lint-report.md` |
| 迁移 Legacy | `schema/workflows/migrate-legacy.md` | `workspace/migrations/` + 目标层 |
| 会话记录 | `schema/workflows/session.md` + `session-log` Skill | `workspace/sessions/` |
| Daily / Task 创建与复盘 | `schema/workflows/daily.md` + `daily` Skill | `workspace/daily/`、`workspace/tasks/` |
| 书籍与影视目录 | `schema/workflows/media-catalog.md` + source adapters | `wiki/sources/*/index.md` |
| Homepage / Canvas | `schema/workflows/homepage.md` + `schema/views.md` | `workspace/overview/home.md` + `workspace/overview.canvas` |

## Raw 与来源

- `raws/Douban/`、`raws/WeRead/` 和根 `assets/` 由同步插件维护，Agent 默认不得手工改写。
- 不在插件文件中增加跨来源链接；Douban 与 WeRead 的自动关系由目录视图推导，例外覆盖写入 `wiki/sources/link-overrides/`。
- 书籍匹配优先使用 ISBN，标题相似不得直接合并；见 `schema/sources/identity-resolution.md`。
- 需要调整同步模板、覆盖行为或附件路径时，先读取插件配置和官方文档，并将其视为单独配置任务。

## Wiki

- 普通 Query 从 `wiki/index.md` 和领域 Map 开始，只有核实原文时再进入 Raw。
- `wiki/**/legacy-*` 可以参与查询，但必须视为 provisional 内容，不能假定来源和字段完整。
- 新 Wiki 页面按 `schema/page-types/` 创建，优先更新已有页面而不是制造重复总结；Douban 媒体目录不要求为每个 Raw 建立 source page。
- Ingest、compile、query 存档和 lint 操作追加到 `wiki/_meta/log.md`；普通会话不写入该日志。

## Workspace

- 会话摘要写入 `workspace/sessions/{年份}/YYYY-MM/`。
- Daily 写入 `workspace/daily/{年份}/YYYY-MM/`；Quarterly Plan 继续写入 `workspace/plans/`，旧计划留在 Archived，不自动迁回。
- 跨日、需统计或带稳定外部映射的任务写入 `workspace/tasks/`；Daily 的“跨日任务”只保存当天 occurrence，“当日任务”不强制建页。
- Reading Note 写入 `workspace/reading/books/`，Viewing Note 写入 `workspace/viewing/`；两者都只在确有人工内容时按需建立。
- DIDA 是 Task Entity 或 Daily 的可选外部映射与专注来源；不自动拉取今日任务，也不使用 DIDA 整体状态覆盖本地 Task 或当天 Checkbox。
- 一次性迁移进度写入 `workspace/migrations/`，后续事项写入 `workspace/backlog.md`。
- Workspace 内容只有经过 compile 才进入 Wiki。

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

- 视图不是新的事实来源，详细规范见 `schema/views.md`。
- 不直接修改主题原文件；样式调整放入 `.obsidian/snippets/`。
- 当前根 `assets/` 不作普通共享附件目录使用；媒体目录可以只读展示其中的 Douban 封面。新 Wiki 附件放 `wiki/_assets/<domain>/`，Workspace 附件放 `workspace/_assets/`。

## 文件操作与检查

- 修改前检查目标目录、相关 Schema、现有内容和 `git status`，保留用户已有改动。
- 移动或重命名文件前使用全文搜索检查 wikilink、Markdown link、Dataview、模板和 Skill 引用。
- 不修改 `.obsidian/workspace*.json` 来完成内容结构调整。
- 这是 Markdown 知识库，没有构建流程；完成后检查路径、YAML、wikilinks、查询语法和规则一致性。
- 对不确定的插件行为先查本地配置或官方文档，不凭假设批量改写内容。

## Git 与同步

- OneDrive 负责整个 Vault 的内容同步；Git 只保存 Agent 规则、Schema、Skills、系统 Spec、迁移控制、索引骨架、CSS snippets 和明确列入白名单的视图。
- Raw、附件、日常记录、会话、普通 Wiki 正文、Legacy 和 Archived 不进入 Git；完整白名单见 `schema/version-control.md`。
- `.gitignore` 默认忽略所有 Vault 内容，不使用 `git add .` 绕过白名单。
- 提交前检查 `git status` 和 staged diff，避开用户的历史删除、工作区状态、缓存和无关配置变化。
- 不在用户未明确要求时 commit 或 push。
- OneDrive 与 Git 并存时尽量在单一主设备执行 Git 操作，减少同步冲突。
