---
type: migration
status: complete
created: 2026-09-12
updated: 2026-09-14
---

# Knowledge Intake v2 Migration

> 2026-09-14 纠偏：下面保留 9 月 12 日的实施历史；其中由 Daily 自动建立 active Theme 的做法已撤销，现行规则要求用户明确设立或确认。Lain 可靠性与来源表预览两个页面已转为 Task 关联草稿，详见 [[agents/migrations/theme-task-boundaries-2026-09-14|本轮改造记录]]。

## 范围

- Douban 封面缓存归入 Raw 来源目录。
- 清理没有实际人工内容的 Viewing 空壳。
- 建立 Web Raw、Theme、Insight、Period Plan 与 Knowledge Intake 契约。
- 从现有 Daily 提取首批高置信 Theme、Insight 与周期草案。
- 更新 Homepage、Canvas、Skills、索引和 Git 边界。

## 来源与目录

- [x] 169 个 Douban 封面从根 assets 移至 raws/Douban/_assets。
- [x] 169 份 Douban Raw 的封面引用更新为新路径。
- [x] Douban 插件 attachmentPath 与媒体卡片视图同步更新。
- [x] 已知“女人步上楼梯时 女”仍使用唯一文件名前缀回退，其余 Raw 引用均精确命中。
- [x] workspace/viewing 的 README 与《洛丽塔》空壳页移入 .trash/knowledge-intake-v2-2026-09-12/workspace/viewing，可恢复。
- [x] 建立 raws/Web 的日期分片目标与 source adapter；本 Vault 未发现可直接配置的 Web Clipper 插件数据。

## 新模型

- [x] 建立 Theme、Insight Log、Period Plan page types 与模板。
- [x] 建立 Knowledge Intake 与 Periodic Review workflows。
- [x] 重写 quarterly-plan，并增加 periodic-review Skill；.agents 与 .claude 镜像一致。
- [x] Daily 新模板使用“待分流”，查询继续兼容旧 Knowledge Candidates 和普通列表。

## 首批真实内容

- [x] 建立 Obsidian 知识系统演进、10.18 来源表与预览状态模型、Lain 运维工具的可靠性与可观测性三个 active Theme。
- [x] 建立 2026-09 Insight Log，摘录四条有明确 Daily 来源的高置信想法。
- [x] 建立 2026-W37、2026-09 与 2026-Q3 三份 evidence-backed draft Period Plan。
- [x] 相关 Task、Daily、Theme、Plan 与输出之间完成回链；未把单次 Redis、Zotero 等候选强行提升。

## 最终验收

- [x] YAML、JSON、JavaScript、Skill 和 Git diff 检查通过。
- [x] Homepage Focus、待分流聚合与 Canvas 运行态检查通过。
- [x] 当前 Daily occurrence 与 Session Log 更新完成。
- [x] Spec 和迁移状态更新为 complete。
