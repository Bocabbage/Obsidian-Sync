---
type: schema
schema: page-type
page_type: source
updated: 2026-08-26
---

# Wiki Source

`type: source` 页面是一个来源在人类与 Agent 可读层的编译表示，负责连接一个或多个 Raw 文件。

必备内容：

- 稳定标题和来源类型。
- 可用的标准 ID 与平台 ID。
- `raw_sources` 链接。
- 来源摘要、覆盖范围和限制。
- 与其他版本、作品或来源页的关系。

来源页可以随新 Raw 更新，但不得假装替代原始材料；重要判断必须能够回溯到 Raw。

Douban 媒体目录不要求为每个 Raw 条目建立 source page：目录视图直接读取 Raw；ISBN 可自动连接的 WeRead 分支也由视图推导。只有需要稳定摘要、来源质量说明或跨版本讨论时才按需创建 source page。纯关系覆盖使用 `type: source-link`，不复制整套来源元数据。
