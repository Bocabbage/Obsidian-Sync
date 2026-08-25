---
name: reading-maintenance
description: 在读书结构迁移期间安全处理书籍记录、作者页、封面和卡片请求；用于识别 Douban/WeRead Raw、legacy-读书、Workspace 与 Wiki 的边界，避免继续向旧混合目录写入。
---

# 读书维护（迁移态）

当前正式读书结构尚未完成，`legacy-读书/` 同时混合个人阅读记录、作者分析、模板、视图和附件。

## 必读

- 根 `AGENTS.md`。
- `schema/ownership.md`。
- `schema/workflows/migrate-legacy.md`。
- `schema/sources/douban.md`、`schema/sources/weread.md` 和 `schema/sources/identity-resolution.md`。
- `workspace/migrations/legacy-migration.md`。

## 当前边界

- `raws/Douban/book/` 与 `raws/WeRead/` 由插件维护，默认只读。
- `legacy-读书/` 只在用户明确要求迁移或维护 Legacy 时修改，不再作为新书的默认写入位置。
- Douban 与 WeRead 不直接互相写链接；跨来源连接进入 `wiki/sources/`。
- 正式阅读记录结构尚待设计，不能擅自假定 `workspace/reading/` 的最终字段或目录。
- 作者、作品和可复用阅读知识只有经过 compile 才进入 Wiki。

## 请求处理

- 新增或同步来源：优先使用对应插件，不手工伪造 Raw 文件。
- 整理某本书：先识别 Douban、WeRead 和 Legacy 中的候选，按身份规则报告匹配结果。
- 迁移书籍或作者：先给出 Raw、Workspace、Wiki 和视图的目标拆分，再在明确范围内执行。
- 调整书卡片：当前视为 Legacy 视图维护；除非用户明确要求，不重写卡片或封面体系。
- 不虚构阅读状态、摘抄、评分、读后感或作者事实。

迁移完成后应再次更新本 Skill，使其指向正式的阅读记录与 Wiki 结构。
