---
type: backlog
status: active
updated: 2026-08-26
---

# 知识库 Backlog

当前 Daily、来源身份、Legacy、卡片与 Canvas 的总体实施基线见 [[workspace/specs/knowledge-system-v1|Knowledge System v1]]。

## 来源与对象记录

- [x] 以 Douban 为唯一媒体目录；ISBN 精确匹配由视图推导，例外关系使用 `source-link` 覆盖。
- [x] 建立 `workspace/reading/books/` Reading Note，并完成 `legacy-读书` 迁移。
- [x] 建立 `workspace/viewing/` Viewing Note，并完成 `legacy-电影` 迁移。
- [x] 明确根 `assets/` 继续作为 Douban 插件封面缓存，只读用于卡片展示。

## 视图

- [x] 书籍、电影和剧集卡片按实际文件名解析根 `assets/` 的 JPG / WebP 封面，不回写 Raw 字段。
- [x] 使用 DataviewJS 重建书籍与影视卡片，支持状态、分支、冲突、搜索和排序筛选。
- [ ] 在正式视图建立后更新或替换根 `卡片导航.md`。

## Wiki 编译

- [ ] 试点编译 `wiki/computer-science/legacy-大数据原理`。
- [ ] 逐步处理其他 `wiki/**/legacy-*`，完成来源链和领域 Map 后移除前缀。
- [ ] 根据实际使用决定是否建立跨领域共享目录。

## Agent 与计划

- [ ] 在新的 `workspace/plans/` 上实际使用一次 Daily 和 Quarterly Skills，并根据结果调整格式。
- [x] 解除 `reading-maintenance` 的迁移保护并重写为正式目录维护 Skill。
