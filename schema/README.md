---
type: schema-index
schema_version: 1
updated: 2026-08-28
---

# 知识库 Schema

本目录保存知识库的长期结构契约。根目录 `AGENTS.md` 是所有 Agent 的执行入口；本目录解释页面是什么、目录由谁维护，以及各类工作流如何运行。

## 阅读顺序

1. 先阅读根目录 `AGENTS.md`。
2. 阅读 [[schema/ownership|目录所有权]]、[[schema/properties|Properties 规范]] 和 [[schema/linking|链接规范]]。
3. 根据任务读取 `workflows/`、`sources/` 或 `domains/` 下的相关文件。
4. 进入已有领域时，再阅读该领域目录下的本地 `AGENTS.md`。

## Schema 索引

- [[schema/ownership|目录所有权]]：各层的事实地位、读写权限和迁移状态。
- [[schema/taxonomy|分类体系]]：领域、主题、目录和 `legacy-` 前缀规则。
- [[schema/properties|Properties 规范]]：新建页面的通用字段与类型约束。
- [[schema/linking|链接与溯源]]：wikilinks、来源链和附件规则。
- [[schema/views|视图规范]]：Bases、Dataview、Tasks 和卡片展示的职责。
- [[schema/version-control|Git 与 OneDrive]]：开发资产白名单、内容同步边界和提交规则。
- `page-types/`：Raw、Workspace、[[schema/page-types/daily|Daily]]、[[schema/page-types/task|Task Entity]]、Reading Note、Viewing Note、Source Link 和 Wiki 页面类型。
- `workflows/`：[[schema/workflows/daily|Daily]]、[[schema/workflows/media-catalog|Douban 媒体目录]]、[[schema/workflows/homepage|Homepage]]、ingest、compile、query、lint、会话和 legacy migration。
- `sources/`：Douban、WeRead 以及跨来源身份匹配。
- `domains/`：当前已确认 Wiki 领域的补充规则。
- `templates/`：新建 Wiki 与 Workspace 页面时使用的最小模板。

## 变更原则

- Schema 是规则，不存放会话日志、临时清单或具体领域知识。
- 只为实际使用的字段和工作流增加规则，不提前设计无人使用的分类。
- 规则变化时同步检查根 `AGENTS.md`、领域 `AGENTS.md`、本地 Skills 和相关模板。
- 如果两份规则冲突，停止批量修改，先修正规则来源，不自行选择方便的一份。
