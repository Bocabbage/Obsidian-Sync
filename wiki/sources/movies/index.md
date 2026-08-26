---
type: map
title: Douban Movies
updated: 2026-08-26
---

# Douban Movies

Douban Raw 是唯一电影目录。只有实际存在的个人观影页才作为分支显示，平台评分与个人评分保持分离。

```dataviewjs
await dv.view("wiki/sources/_views/douban-catalog", { mediaType: "movie" });
```
