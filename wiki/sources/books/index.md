---
type: map
title: Douban Books
updated: 2026-08-26
---

# Douban Books

Douban Raw 是唯一书籍目录。ISBN 完全一致时自动显示 WeRead 分支；人工阅读笔记和相关版本覆盖只在实际存在时显示。

```dataviewjs
await dv.view("wiki/sources/_views/douban-catalog", { mediaType: "book" });
```

只有 WeRead、尚无 Douban 条目的版本不会在本目录生成第二套书卡；它们保留在 Raw，定期通过身份审计发现。
