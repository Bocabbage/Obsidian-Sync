---
type: schema
schema: workflow
workflow: ingest
updated: 2026-10-03
---

# Ingest Workflow

Ingest 将一个 Raw 来源纳入可持续维护的 Wiki，但不改写 Raw 本身。

仅把对话/资料捕获到 Raw 时，执行对应 source adapter 即可；不要求为一次捕获同时建立 Wiki 页面或写入 Wiki 操作日志。

## 流程

1. 确认来源文件属于 `raws/` 或其他明确的只读来源位置。
2. 阅读对应 `agents/schema/sources/<source-system>.md`，识别来源字段和覆盖风险。
3. 按 `agents/schema/sources/identity-resolution.md` 查找现有来源页，不以标题相似直接判定同一对象。
4. 若材料明确服务某个既有 Theme，检查并维护其 `materials` 中的实际 Raw 完整 wikilink，避免重复；可在正文补充用途或相关问题。没有 Theme 也可继续 ingest，不自动创建 Theme；材料关联不能替代来源身份或 Wiki 证据。
5. 需要稳定来源身份时创建或更新 `wiki/sources/` 下的来源页，填写 Raw 链接、标识符、摘要和限制。
6. 更新受该来源影响的 concept、entity、map 或 synthesis 页面，并保留来源链。
7. 更新 `wiki/index.md` 或相关领域 Map。
8. 在 `wiki/_meta/log.md` 追加 ingest 记录。

## 边界

- 默认一次处理一个来源或一组身份明确的同源文件，便于人工检查。
- 批量 ingest 必须先定义匹配规则、冲突策略和可回滚范围。
- 不把来源摘要当作最终知识结构；一个来源可以更新多个知识页。
- 不因 ingest 自动移动 Root Legacy 或读取 Archived。
