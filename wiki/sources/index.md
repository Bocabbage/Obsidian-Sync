---
type: map
title: Compiled Sources
updated: 2026-08-26
---

# Compiled Sources

本目录保存 Raw 来源的稳定入口、按需编译页和跨来源人工覆盖。Douban 书籍、电影和剧集目录直接读取 Raw，不复制整套元数据。

## 媒体目录

- [[wiki/sources/books/index|Douban Books]]
- [[wiki/sources/movies/index|Douban Movies]]
- [[wiki/sources/series/index|Douban Series]]

ISBN 完全一致的 WeRead 分支由书籍目录动态推导；不同版本、冲突或拒绝关系保存在 `wiki/sources/link-overrides/`。

规则见：

- `schema/page-types/wiki-source.md`
- `schema/page-types/source-link.md`
- `schema/workflows/media-catalog.md`
- `schema/sources/identity-resolution.md`
