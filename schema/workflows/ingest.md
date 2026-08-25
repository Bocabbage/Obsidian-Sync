---
type: schema
schema: workflow
workflow: ingest
updated: 2026-08-25
---

# Ingest Workflow

Ingest 将一个 Raw 来源纳入可持续维护的 Wiki，但不改写 Raw 本身。

## 流程

1. 确认来源文件属于 `raws/` 或其他明确的只读来源位置。
2. 阅读对应 `schema/sources/<source-system>.md`，识别来源字段和覆盖风险。
3. 按 `schema/sources/identity-resolution.md` 查找现有来源页，不以标题相似直接判定同一对象。
4. 创建或更新 `wiki/sources/` 下的来源页，填写 Raw 链接、标识符、摘要和限制。
5. 更新受该来源影响的 concept、entity、map 或 synthesis 页面，并保留来源链。
6. 更新 `wiki/index.md` 或相关领域 Map。
7. 在 `wiki/_meta/log.md` 追加 ingest 记录。

## 边界

- 默认一次处理一个来源或一组身份明确的同源文件，便于人工检查。
- 批量 ingest 必须先定义匹配规则、冲突策略和可回滚范围。
- 不把来源摘要当作最终知识结构；一个来源可以更新多个知识页。
- 不因 ingest 自动移动 Root Legacy 或读取 Archived。
