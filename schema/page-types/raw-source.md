---
type: schema
schema: page-type
page_type: raw-source
updated: 2026-08-25
---

# Raw Source

Raw Source 是未经知识编译的外部输入或同步结果，例如 Douban 条目、WeRead 高亮、网页、论文和访谈记录。

- Raw 内容默认只读，并保留来源系统生成的字段和正文结构。
- 不要求不同插件使用统一 Properties；字段差异由 `schema/sources/` 中的适配规则解释。
- Raw 的目录以来源系统和稳定介质为主，不以最终知识领域为主。
- 分类、摘要、身份合并和来源质量判断写入 `type: source` 的 Wiki 页面。
- 同步报告、错误日志和缓存文件不自动获得知识来源地位。
