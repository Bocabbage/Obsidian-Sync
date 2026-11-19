---
type: schema-index
schema_version: 1
updated: 2026-10-05
---

# 知识库 Schema

本目录保存知识库的长期结构契约。根目录 `AGENTS.md` 是所有 Agent 的执行入口，`agents/README.md` 保存全库操作规范与导航；本目录解释页面是什么、目录由谁维护，以及各类工作流如何运行。

## 阅读顺序

1. 先阅读根目录 `AGENTS.md` 和 `agents/README.md`。
2. 阅读 [[agents/schema/ownership|目录所有权]]、[[agents/schema/properties|Properties 规范]] 和 [[agents/schema/linking|链接规范]]。
3. 根据任务读取 `workflows/`、`sources/` 或 `domains/` 下的相关文件。
4. 进入已有领域时，再阅读该领域目录下的本地 `AGENTS.md`。

## Schema 索引

- [[agents/schema/ownership|目录所有权]]：各层的事实地位、读写权限和迁移状态。
- [[agents/schema/taxonomy|分类体系]]：领域、主题、目录和 `legacy-` 前缀规则。
- [[agents/schema/properties|Properties 规范]]：新建页面的通用字段与类型约束。
- [[agents/schema/linking|链接与溯源]]：wikilinks、来源链和附件规则。
- [[agents/schema/views|视图规范]]：Bases、Dataview、Tasks 和卡片展示的职责。
- [[agents/schema/version-control|Git 与 OneDrive]]：开发资产白名单、内容同步边界和提交规则。
- `page-types/`：Raw、Workspace、Daily、Todo Log、Task Entity、Theme、Learning Note、Insight Log、Period Plan、Reading Note、Viewing Note、Source Link 和 Wiki 页面类型。
- `workflows/`：Daily、Task Todo 续入、Knowledge Intake、Learning、Periodic Review、Douban 媒体目录、Homepage、ingest、compile、query、lint、会话和 legacy migration。
- [[agents/schema/page-types/learning-note|Learning Note]] 与 [[agents/schema/workflows/learning|学习记录工作流]]：确认学习 roadmap 后生成个人笔记，维护 Theme 阶段入口并保留已有内容。
- [[agents/schema/workflows/task-todo|Task Todo 与 Daily 续入]]：子项身份、复盘交接、延期与暂停、每日静态 occurrence 生成及本地插件边界。
- `sources/`：Douban、WeRead、Web、Codex 对话捕获、用户维护的 Notes 以及跨来源身份匹配。
- `domains/`：当前已确认 Wiki 领域的补充规则。
- `templates/`：新建 Wiki 与 Workspace 页面时使用的最小模板。

## 变更原则

- Schema 是规则，不存放会话日志、临时清单或具体领域知识。
- 只为实际使用的字段和工作流增加规则，不提前设计无人使用的分类。
- 规则变化时同步检查根 `AGENTS.md`、`agents/README.md`、领域 `AGENTS.md`、本地 Skills 和相关模板。
- 如果两份规则冲突，停止批量修改，先修正规则来源，不自行选择方便的一份。

- [[agents/schema/page-types/task-group|Task Group]]：周期关注组、Daily 展示与每日成员快照；未分组任务照常参与执行。

- [[agents/schema/page-types/exercise|锻炼与动作页]]：Daily 训练表、review 建页与逐行历史汇总。
