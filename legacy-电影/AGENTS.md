# Legacy 影视迁移规则

本目录是 Root Legacy，不再作为正式影视库写入目标。

- 先阅读根 `AGENTS.md`、`schema/workflows/migrate-legacy.md`、`schema/sources/douban.md` 和 `workspace/migrations/legacy-migration.md`。
- 本目录混合观影记录、作品对象、导演/电影知识、模板、视图和附件，不能整体迁入 Workspace 或 Wiki。
- 除非用户明确要求维护或迁移 Legacy，不新增电影、剧集、导演、海报或视图，不批量格式化现有文件。
- 迁移时分别确定 Raw 引用、Workspace 观影记录、Wiki 来源/导演/知识和派生视图的目标。
- Douban 同步内容和根 `assets/` 封面由插件维护，不在本目录复制出新的事实来源。
