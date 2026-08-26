---
type: schema
schema: source-adapter
source_system: weread
updated: 2026-08-26
---

# WeRead 来源适配

## 当前位置

- 数据：`raws/WeRead/<微信读书分类>/`。
- 文件包含书目元数据、高亮、划线评论、书评和阅读状态。

## 所有权

- WeRead 插件拥有同步文件，Agent 默认只读。
- 不在同步文件中手工写入 Douban 链接、Wiki 反向链接或整理后的概念结构。
- 微信读书分类是来源侧粗分类，不等同于最终 Wiki 领域。

## 目录关系

- WeRead 不是另一套书籍目录，而是挂在 Douban 目录项下的电子书来源与阅读内容分支。
- ISBN 完全一致时，Douban 卡片视图可以动态连接对应 WeRead Raw。
- ISBN 不同或元数据冲突时，使用 `wiki/sources/link-overrides/` 保存人工判断，不修改任一 Raw。
- 已关联条目可以提供本地 WeRead 笔记链接，以及 `weread://reading?bId=<bookId>` 应用跳转。

## 可用字段

当前常见字段包括 `doc_type`、`bookId`、`title`、`author`、`isbn`、`readingStatus`、`progress`、`readingDate`、`lastReadDate` 等。

- 将 `bookId` 映射为 `identifiers.weread`。
- 将可靠的 `isbn` 用作跨来源版本匹配的第一优先级。
- 高亮和用户评论可以作为知识编译证据，但应区分原文、用户想法和热门划线。
- 阅读进度是 Workspace 状态，不作为领域知识事实。

## 消费目标

- WeRead 文件由 Douban 书籍目录按 ISBN 或人工覆盖连接，不要求为每本书建立中间 source page。
- 插件同步正文不能承载额外人工笔记；确有个人摘抄、想法或评分时建立 Workspace Reading Note。
- 高亮中的可复用知识经过 compile 后进入领域 concept；个人阅读体验保留在 Workspace。
