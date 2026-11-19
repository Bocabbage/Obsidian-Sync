---
type: schema
schema: page-type
page_type: reading-note
updated: 2026-08-26
---

# Reading Note

`type: reading-note` 是按需建立的 Workspace 个人阅读页。Douban Raw 负责目录元数据，WeRead Raw 负责同步划线和评论；只有需要保存人工摘抄、想法、评分或非 WeRead 阅读过程时才建立 Reading Note。

最小字段：

```yaml
---
type: reading-note
title:
douban_id:
catalog_source:
weread_source:
medium: unknown
status:
started:
finished:
rating:
created:
updated:
---
```

- `douban_id` 使用字符串，并与 `catalog_source` 指向的 Douban Raw 一致。
- `weread_source` 仅在实际关联 WeRead Raw 时填写；不得把人工内容写回 WeRead 文件。
- `medium` 可取 `weread`、`print`、`other` 或 `unknown`，来源不明确时不得猜测为纸质书。
- `status` 可取 `planned`、`reading`、`finished`、`paused` 或 `abandoned`。
- `rating` 是用户评分，使用 `0`～`10` 的数值；不得从 Douban 平台 `score` 推断。
- 同一本书没有人工内容时不创建空壳页面。
