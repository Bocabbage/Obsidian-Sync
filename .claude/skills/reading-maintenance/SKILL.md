---
name: reading-maintenance
description: 维护本 Vault 的 Douban 书籍目录、WeRead 关联、纸质或其他人工阅读笔记、作者知识、封面与卡片视图；在新增、整理、匹配、评分、迁移或查询书籍时区分 Raw、Workspace、Wiki 和派生视图的所有权。
---

# 读书维护

Douban Raw 是唯一书籍目录；WeRead、纸质书或其他人工阅读内容作为目录项的分支存在。目录关系和卡片都不得成为新的手工事实副本。

## 必读

- 根 `AGENTS.md`。
- `schema/ownership.md`。
- `schema/workflows/media-catalog.md`。
- `schema/sources/douban.md`、`schema/sources/weread.md` 和 `schema/sources/identity-resolution.md`。
- `schema/page-types/reading-note.md` 和 `schema/page-types/source-link.md`。
- 涉及旧内容时再读 `schema/workflows/migrate-legacy.md` 与 `workspace/migrations/legacy-migration.md`。

## 正式结构

- `raws/Douban/book/` 与 `raws/WeRead/` 由插件维护，默认只读。
- `wiki/sources/books/index.md` 直接读取 Douban Raw 形成卡片目录，不为每本书批量生成 compiled source page。
- ISBN 完全一致且没有人工覆盖时，目录动态连接 WeRead；不同版本或冲突写入 `wiki/sources/link-overrides/`。
- 人工摘抄、想法、个人评分和非插件阅读过程写入 `workspace/reading/books/`，只有确有内容时才建页。
- `raws/Douban/_assets/` 是 Douban 插件封面缓存，只读展示；阅读过程附件放 `workspace/_assets/reading/`。
- 作者、作品和可复用阅读知识只有经过 compile 才进入 Wiki。
- 已退役的 `legacy-读书/` 不再是写入目标；需要恢复时从迁移记录指向的 `.trash` 快照处理。

## 请求处理

- 新增或同步来源：优先使用对应插件，不手工伪造 Raw 文件。
- 整理某本书：先按 `doubanId` 找目录锚点，再核对 ISBN、作者、出版社与年份；文件名和相似标题不能代替身份确认。
- 连接 WeRead：同 ISBN 允许自动关系；ISBN 不同只能创建 `same_work` 候选并人工确认；明显冲突使用 `conflict`，错误候选使用 `rejected` 或 `not_same`。
- 建立纸质书页：用户明确是纸质阅读时使用 `medium: print`；只知道“没有 WeRead”时使用 `unknown`，不擅自推断。
- 调整书卡片：修改 `wiki/sources/_views/douban-catalog/` 或入口页，只增加派生展示，不把筛选状态写回 Raw。
- 整理作者或主题：个人阅读体验留在 Workspace；可复用分析按 compile 进入 Wiki，并保留来源性质。
- 不虚构阅读状态、摘抄、评分、读后感或作者事实。
