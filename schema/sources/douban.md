---
type: schema
schema: source-adapter
source_system: douban
updated: 2026-08-25
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

## 可用字段

当前同步文件常见字段包括 `doubanId`、`title`、`type`、`score`、`myRating`、`state`、`collectionDate`、`director`、`author`、`url` 等。

- 将 `doubanId` 映射为编译来源页的 `identifiers.douban`。
- `score` 是平台评分，`myRating` 是用户评分，两者不得混用。
- `collectionDate` 是用户在豆瓣记录的日期，不自动等同于首次阅读或观看日期。
- `豆瓣同步结果_*.md` 只用于诊断同步，不参与知识引用。

## 编译目标

- 书籍、电影、剧集的稳定来源页进入 `wiki/sources/`。
- 个人阅读、观看状态未来进入 Workspace 对象记录，不直接写入概念知识页。
- 作者、导演、作品分析和领域概念通过 Wiki 页面表达并引用来源页。
