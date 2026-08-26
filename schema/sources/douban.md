---
type: schema
schema: source-adapter
source_system: douban
updated: 2026-08-26
---

# Douban 来源适配

## 当前位置

- 数据：`raws/Douban/book/`、`raws/Douban/movie/`、`raws/Douban/teleplay/`。
- 同步报告：`raws/Douban/豆瓣同步结果_*.md`。
- 封面缓存：根目录 `assets/`。

## 所有权

- Douban 插件拥有同步文件和封面缓存，Agent 默认只读。
- 不在同步文件内手工增加跨来源 wikilink 或人工状态字段，避免被覆盖。
- 自定义同步模板、覆盖策略或附件目录属于单独的插件配置任务。

## 目录职责

- Douban Raw 是书籍、电影和剧集的唯一媒体目录；卡片和筛选视图可以直接消费 Raw，不为每个条目复制 Wiki 对象页。
- `doubanId` 是目录锚点。同步文件名由标题生成，可能随标题变化或出现清洗异常，不得把文件名当作稳定身份。
- 根 `assets/` 的封面由插件维护。书籍当前使用 JPG，电影与剧集当前常见为 WebP；视图先按 Raw 文件名解析，命名不一致时只读使用 Raw 正文中的插件封面路径。若该链接本身失效，只允许采用唯一的文件名前缀候选；不得改写缓存或做模糊多选匹配。

## 可用字段

当前同步文件常见字段包括 `doubanId`、`title`、`type`、`score`、`myRating`、`state`、`collectionDate`、`director`、`author`、`url` 等。

- 将 `doubanId` 映射为编译来源页的 `identifiers.douban`。
- `score` 是平台评分，`myRating` 是用户评分，两者不得混用。
- `collectionDate` 是用户在豆瓣记录的日期，不自动等同于首次阅读或观看日期。
- `豆瓣同步结果_*.md` 只用于诊断同步，不参与知识引用。

## 消费目标

- 卡片目录进入 `wiki/sources/books/`、`movies/` 和 `series/`，视图本身不是新的事实来源。
- WeRead、人工阅读笔记和观影评论作为 Douban 目录项的分支展示，但不回写 Raw。
- 只有确有人工内容时才建立 Workspace Reading Note 或 Viewing Note。
- 作者、导演、作品分析和领域概念通过 Wiki 页面表达，并保留实际 Raw 或人工页面来源链。
