---
type: schema
schema: source-adapter
source_system: web
updated: 2026-09-15
---

# Web 来源适配

## 推荐位置

~~~text
raws/Web/{YYYY}/{YYYY-MM}/{YYYY-MM-DD}-{slug}.md
~~~

目录只按捕获日期分片，避免在尚未理解内容时强行决定领域；主题使用多值 `tags`，不复制 Wiki 领域树。

## 最小字段映射

~~~yaml
---
type: raw-source
source_system: web
title:
url:
captured: YYYY-MM-DD
published:
author:
tags: []
---
~~~

- url 与 captured 是最低可追溯字段；published、author 和 `tags` 按来源能力填写。
- 外部 Web Clipper 使用自己的字段名时可以由 adapter 映射，不为格式统一批量改写已捕获正文。
- `tags` 使用 Obsidian 原生标签语义，只保留少量宽松来源主题，不代表 Wiki domain、Theme 或编译结论。

## 所有权与消费

- 外部采集器或人工剪藏拥有 Raw，Agent 默认不改写正文。
- Theme、Insight、处理状态和领域判断写入 Workspace 或 Wiki，不回写 Raw。
- 需要长期知识时按 ingest / compile 建立来源链；只值得留存的网页可以永远停在 Raw。
- 当前 Vault 没有可由 Agent 直接配置的 Web Clipper 插件数据，因此本 Schema 与模板定义目标格式；实际采集器接入时只需映射这些字段和路径。
