---
type: backlog
status: active
updated: 2026-08-25
---

# 知识库 Backlog

当前 Daily、来源身份、Legacy、卡片与 Canvas 的总体实施基线见 [[workspace/specs/knowledge-system-v1|Knowledge System v1]]。

## 来源与对象记录

- [ ] 建立 Douban 与 WeRead 书籍身份匹配清单，并按 ISBN 优先生成 `wiki/sources/` 来源页。
- [ ] 设计读书记录在 Workspace 中的正式结构，再迁移 `legacy-读书`。
- [ ] 设计观影记录在 Workspace 中的正式结构，再迁移 `legacy-电影`。
- [ ] 明确根 `assets/` 的长期附件策略；当前继续由 Douban 插件维护。

## 视图

- [ ] 为 Douban 书籍、电影和剧集补充可查询的封面字段。
- [ ] 使用 Bases 或 Dataview + Minimal 重建书籍与影视卡片；此项不阻塞来源同步和 Wiki 编译。
- [ ] 在正式视图建立后更新或替换根 `卡片导航.md`。

## Wiki 编译

- [ ] 试点编译 `wiki/computer-science/legacy-大数据原理`。
- [ ] 逐步处理其他 `wiki/**/legacy-*`，完成来源链和领域 Map 后移除前缀。
- [ ] 根据实际使用决定是否建立跨领域共享目录。

## Agent 与计划

- [ ] 在新的 `workspace/plans/` 上实际使用一次 Daily 和 Quarterly Skills，并根据结果调整格式。
- [ ] 读书/影视拆分完成后解除 `reading-maintenance` 的迁移保护并重写其正式维护路径。
