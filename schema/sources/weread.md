---
type: schema
schema: source-adapter
source_system: weread
updated: 2026-08-25
---

# WeRead 来源适配

## 当前位置

- 数据：`raws/WeRead/<微信读书分类>/`。
- 文件包含书目元数据、高亮、划线评论、书评和阅读状态。

## 所有权

- WeRead 插件拥有同步文件，Agent 默认只读。
- 不在同步文件中手工写入 Douban 链接、Wiki 反向链接或整理后的概念结构。
- 微信读书分类是来源侧粗分类，不等同于最终 Wiki 领域。

## 可用字段

当前常见字段包括 `doc_type`、`bookId`、`title`、`author`、`isbn`、`readingStatus`、`progress`、`readingDate`、`lastReadDate` 等。

- 将 `bookId` 映射为 `identifiers.weread`。
- 将可靠的 `isbn` 用作跨来源版本匹配的第一优先级。
- 高亮和用户评论可以作为知识编译证据，但应区分原文、用户想法和热门划线。
- 阅读进度是 Workspace 状态，不作为领域知识事实。

## 编译目标

- 一个 WeRead 文件可以与一个 Douban 版本共同连接到同一 `wiki/sources/` 来源页。
- 高亮中的可复用知识进入领域 concept；个人阅读体验保留在未来的 Workspace 阅读记录。
