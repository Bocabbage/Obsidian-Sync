---
type: schema
schema: workflow
workflow: media-catalog
updated: 2026-09-12
---

# Media Catalog Workflow

Douban Raw 是书籍、电影和剧集的唯一目录；目录视图直接消费 Raw Properties 与 `raws/Douban/_assets/` 封面，不为每个条目复制一份 Wiki 对象页。

## 入口

- 书籍：`wiki/sources/books/index.md`
- 电影：`wiki/sources/movies/index.md`
- 剧集：`wiki/sources/series/index.md`

## 书籍分支

1. 以 `doubanId` 识别目录锚点，文件名和标题只用于展示。
2. ISBN 完全一致且没有人工覆盖时，目录视图自动连接对应 WeRead Raw。
3. ISBN 不同、元数据冲突或明确拒绝的候选使用 `wiki/sources/link-overrides/`。
4. 有人工摘抄、想法、评分或非 WeRead 阅读过程时，按需建立 `workspace/reading/books/` Reading Note。
5. 没有人工内容时不建立重复页面。

## 电影与剧集分支

1. Douban Raw 继续承担作品元数据、平台评分、状态和封面。
2. 只有个人评分、观看日期或评论需要独立保存时，电影建立 `workspace/viewing/movies/` Viewing Note，剧集建立 `workspace/viewing/series/` Viewing Note。
3. 可复用的导演、电影语言和主题分析通过 compile 进入 Wiki。

## 约束

- 目录视图和人工覆盖不回写 Raw。
- `raws/Douban/_assets/` 继续由 Douban 插件维护，不复制、重命名或覆盖。
- `collectionDate` 是 Douban 记录日期，不自动改名为实际阅读或观看完成日期。
- 只有 WeRead、没有对应 Douban 条目的版本保留在 Raw，并进入维护审计；它不自动成为第二套正式目录。
- 删除 Legacy 目录页或重复封面前，先验证新目录、人工内容和附件引用均可访问。
