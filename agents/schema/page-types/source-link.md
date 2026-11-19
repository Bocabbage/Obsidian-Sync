---
type: schema
schema: page-type
page_type: source-link
updated: 2026-08-26
---

# Source Link

`type: source-link` 保存无法只靠 ISBN 安全推导的 Douban–WeRead 关系。它是稳定的人工覆盖，不是新的书籍元数据副本。

```yaml
---
type: source-link
catalog_type: book
douban_id:
catalog_source:
weread_source:
relation:
identity_status:
evidence: []
created:
updated:
---
```

- `relation` 可取 `same_edition`、`same_work` 或 `not_same`。
- `identity_status` 可取 `confirmed`、`conflict` 或 `rejected`。
- `conflict` 可以在目录中显示候选 WeRead 分支，但必须明确标记为待复核。
- `rejected` 阻止目录按 ISBN 自动连接该候选。
- 文件保存在 `wiki/sources/link-overrides/`，并同时链接实际存在的 Raw 文件。
