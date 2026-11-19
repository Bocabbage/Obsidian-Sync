---
type: schema
schema: taxonomy
updated: 2026-10-03
---

# 分类体系

## 两个正交维度

- 顶层目录表达用途、生命周期和所有权：Raw 来源、Workspace 个人工作、Wiki 知识、Agents 规范与工作材料、Legacy 待迁移内容、Archived 废弃留存。Schema 位于 `agents/schema/`，仍单独表达当前生效的结构与行为契约。
- Wiki 内目录表达知识领域：computer-science、photography、language、health 等。
- `agents/views/` 表达可复用展示层，不因界面供人使用就归入 Workspace；个人记录与其展示方式分开维护。

不要用知识领域替代所有权边界，也不要在 Raw 与 Wiki 中机械复制完全相同的目录树。

## 领域目录

- 使用稳定的英文小写 kebab-case 作为 Wiki 一级领域目录名。
- 当前确认的领域是 `computer-science`、`photography`、`language`、`health`、`cinema`。
- 页面只有一个主要领域时使用 `domain`；确实跨领域时可使用 `domains` 列表并选择一个主要存放位置。
- 跨领域主题优先通过 wikilinks 和 `topics` 连接，不为多重分类复制正文。
- 只有跨领域页面形成稳定集合时才创建共享领域目录，不提前建立空分类。

## 页面类型与主题

- 页面类型用 `type` 表达，例如 `source`、`concept`、`entity`、`map`、`synthesis`。
- `topics` 是可选的多值主题，用于跨目录检索，不承担主要领域分组。
- 文件夹用于稳定的浏览结构；Properties 用于可变、多值的语义分类。

## Insight 条目标签

- 月度 Insight 包含多条不同想法，主题附在各条正文末尾，优先原样沿用用户已有标签，Agent 补标默认使用 1–3 个 `#topic/主题` 行内标签；不以文件级 YAML tags 代替条目分类。
- 标签用于跨日期检索材料，优先复用已有名称，不预建完整分类树。中文主题名或稳定英文技术名都可用；完整规则见 [[agents/schema/page-types/insight-log|Insight Log]]。
- `#topic/…` 不等同于 Theme 实体或 Wiki 的 `topics` Property，不自动创建 Theme、不自动提升为 Wiki，也不回写 Raw。

## Legacy 前缀

- `legacy-` 是迁移状态，不是领域名称，也不是永久分类。
- `wiki/<domain>/legacy-*` 表示领域归属合理，但内部结构和来源链仍待编译。
- 根级 `legacy-*` 表示内容仍混合 Raw、Workspace、Wiki、视图或附件，不能直接整体迁入某一层。
- 迁移完成后移除 `legacy-` 前缀，并更新迁移清单、链接和索引。

## Raw 分类

- Raw 优先按来源系统或稳定介质组织，例如 `Douban/`、`WeRead/`、`Web/`、`Codex/`、`Papers/`。
- 来源系统自带的粗分类可以保留，但不等同于最终 Wiki 领域。
- Web 等通用来源优先按日期分片，tags 保存宽松、多值的来源语义，不用主题目录提前决定知识结构。
- Theme 与 Raw 的正式关系写入 Theme 的 `materials` 列表；标签相同只提供检索线索，不自动建立关联。领域判断和跨来源身份关系写入 Workspace 或编译后的来源页，不回写 Raw。
