---
type: schema
schema: workflow
workflow: migrate-legacy
updated: 2026-08-25
---

# Legacy Migration Workflow

## 两种 Legacy

- `wiki/<domain>/legacy-*`：领域位置已确认，可以在该领域内逐步编译和重组。
- 根级 `legacy-*`：所有权混合，必须先拆分为 Raw、Workspace、Wiki、视图或附件。

## 流程

1. 在 `agents/migrations/legacy-migration.md` 登记目录、内容类型、目标和状态。
2. 统计文件与附件，并搜索所有路径引用。
3. 给每类内容指定目标层和事实地位，不按原目录整体搬运混合内容。
4. 以小批次移动或编译，保持文件名、别名和反向链接可追踪。
5. 更新导航、模板、Dataview、Skills 和 Schema 引用。
6. 运行 Lint，确认没有遗留引用或重复事实来源。
7. 完成后移除 `legacy-` 前缀并关闭迁移条目。

## 约束

- 不迁移 `archived/`。
- 不把个人体验、计划或会话记录伪装成 Wiki 事实。
- 不把插件控制的 Raw 内容改造成手工维护页面。
- 移动大量附件前先验证 Obsidian 与插件使用的路径格式。
