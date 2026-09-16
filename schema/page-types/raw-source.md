---
type: schema
schema: page-type
page_type: raw-source
updated: 2026-09-16
---

# Raw Source

Raw Source 是可追溯、尚未进行知识编译的来源材料，例如 Douban 条目、WeRead 高亮、网页、论文、访谈记录和 AI 学习对话。它可以是原文，也可以是忠于明确范围的结构化捕获；“尚未成熟”本身不构成 Raw 归属理由。

- 既有 Raw 默认只读，插件生成的字段和正文结构保持原样；经用户授权的新捕获按对应 source adapter 创建，完成后默认冻结。
- 对话素材可以摘录、去重、分组为概念表或问答列表，但必须保留说话者、来源、范围和不确定性，不把后加解释冒充原文。可读性和排版形式不是 Raw / Workspace / Wiki 的分界。
- 不要求不同插件使用统一 Properties；字段差异由 `schema/sources/` 中的适配规则解释。
- Raw 的目录以来源系统和稳定介质为主，不以最终知识领域为主。
- 手工捕获的通用 Raw 按捕获年月分片；可使用 Obsidian 原生 `tags` 保留少量宽松来源语义，但不承担 Theme 或 Wiki 领域分类。见 [[schema/sources/web|Web 来源适配]]和 [[schema/sources/codex|Codex 对话来源适配]]。
- 已有 Raw 的派生摘要、分类和来源质量判断通常写入 `type: source` 的 Wiki 页面；首次捕获时的忠实整理见对应 adapter，不与 Wiki 知识综合混同。Douban 媒体目录是已定义的例外：目录视图可直接消费 Raw，精确 ISBN 关系动态推导，人工关系覆盖使用 `type: source-link`。
- 一次学习对话的有界记录可放 Raw；持续修改的个人理解留 Workspace，跨来源、面向复用的知识综合进入 Wiki。不强制同时保存逐字对话和工作笔记两份文件，也不默认把学习素材塞进 Session。
- 同步报告、错误日志和缓存文件不自动获得知识来源地位。
