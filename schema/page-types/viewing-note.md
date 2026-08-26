---
type: schema
schema: page-type
page_type: viewing-note
updated: 2026-08-26
---

# Viewing Note

`type: viewing-note` 是按需建立的 Workspace 个人观影页。Douban Raw 继续承担电影与剧集目录；只有需要保存个人评分、观看日期、短评或观感时才建立 Viewing Note。

最小字段：

```yaml
---
type: viewing-note
title:
douban_id:
catalog_source:
watched:
rating:
created:
updated:
---
```

- `douban_id` 使用字符串，并与 `catalog_source` 指向的 Douban Raw 一致。
- `rating` 是用户评分，使用 `0`～`10` 的数值；不得复制 Douban 平台 `score` 冒充个人评分。
- 只有 Douban 已经保存观看状态且没有额外人工内容时，不创建重复页面。
- 可复用的电影语言、导演或主题分析经过 compile 后进入 Wiki，不把整份个人观感直接当作知识事实。
