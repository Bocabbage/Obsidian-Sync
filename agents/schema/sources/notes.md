---
type: schema
schema: source-adapter
source_system: notes
updated: 2026-10-03
---

# 用户维护的学习笔记

## 位置与身份

```text
raws/Notes/{YYYY}/{YYYY-MM}/{YYYY-MM-DD}-{slug}.md
```

日期表示迁入或建页的时间，后续持续编辑不移动文件。这里保存用户明确选择在本地继续维护的学习材料；它是 Raw 层的限定例外，不改变 Codex 对话、Web 剪藏或插件 Raw 的只读规则。

```yaml
---
type: raw-source
source_system: notes
title: "原文标题"
origin_system: feishu
origin_url: "https://..."
migrated: YYYY-MM-DD
updated: YYYY-MM-DD
---
```

没有外部原页的新笔记可以省略 `origin_system`、`origin_url` 和 `migrated`。有原页时保留真实链接，说明何时改由本地维护；后续修订不再标作原页的逐字快照。正文可以继续记录问题、暂定理解、实验、学习进度和纠错；引用外部资料或 Codex 对话时链接具体来源，并区别来源内容与新写的理解。`updated` 随实质内容变化更新。

## 迁入与附件

- 迁入前查重，并读取原页全量正文；保持阶段编号、任务勾选、问答、代码和图的含义。允许为了本地可读性转换表格、图片引用和排版，不借迁入机会改写技术结论。
- 图片等来源附件放在同一月份目录下的 `_assets/`，在正文使用本地 Obsidian 链接。迁入完成后检查每个引用实际存在、可打开。
- 原页停止更新后，后续新内容直接改本地文件；不必为每次学习建立新的 Raw 快照。需要留存一次 Codex 对话原貌时，仍单独使用 `raws/Codex/`。
- 明确服务既有 Theme 的 Notes，在迁入、保存或整理时将实际 Raw 完整 wikilink 加入该 Theme 的 `materials` 并去重，正文保留用途说明；不在 Notes 回写 Theme 关系。详细 Roadmap 可以在 Notes 中持续维护，Theme 只保存方向与概览，避免两处维护同一组勾选状态。Task 状态仍由 Task Entity 维护。

Notes 仍是学习过程材料，不因放在 Raw 而视作已经编译或核实的 Wiki 知识。
