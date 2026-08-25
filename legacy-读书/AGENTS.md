# Legacy 读书迁移规则

本目录是 Root Legacy，不再作为正式读书库写入目标。

- 先阅读根 `AGENTS.md`、`schema/workflows/migrate-legacy.md`、`schema/sources/douban.md`、`schema/sources/weread.md` 和 `workspace/migrations/legacy-migration.md`。
- 本目录混合书籍记录、个人阅读内容、作者分析、模板、视图和附件，不能整体迁入 Wiki。
- 除非用户明确要求维护或迁移 Legacy，不新增书籍、作者、封面或视图，不批量格式化现有文件。
- 迁移时分别确定 Raw 引用、Workspace 阅读记录、Wiki 来源/作者/知识和派生视图的目标。
- Douban 与 WeRead 的跨来源身份通过 `wiki/sources/` 连接，不回写插件 Raw。
