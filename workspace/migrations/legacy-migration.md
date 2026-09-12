---
type: migration
status: active
created: 2026-08-25
updated: 2026-09-12
---

# Legacy Migration

迁移规则见 `schema/workflows/migrate-legacy.md`。文件数用于估算范围，不作为完成条件。

## Root Legacy

| 目录 | 约文件数 | 当前判断 | 目标 | 状态 |
|---|---:|---|---|---|
| `legacy-读书/` | 21 | 书籍记录、个人阅读内容、作者分析、模板、视图和附件混合 | Douban 目录 + Workspace Reading Note + 关系覆盖 + 卡片视图 | 已完成（2026-08-26） |
| `legacy-电影/` | 20 | 观影记录、影片对象、导演/电影分析、模板、视图和附件混合 | Douban 目录 + Workspace Viewing Note + Cinema Wiki + 卡片视图 | 已完成（2026-08-26） |
| `legacy-对话日志/` | 24 | Agent 会话摘要 | `workspace/sessions/` | 已完成（2026-08-25） |

## Wiki Legacy

| 目录 | 约文件数 | 领域归属 | 状态 |
|---|---:|---|---|
| `wiki/computer-science/legacy-大数据原理/` | 128 | 已确认 | 待编译 |
| `wiki/computer-science/legacy-编程语言/` | 105 | 已确认 | 待编译 |
| `wiki/computer-science/legacy-计算机网络/` | 28 | 已确认 | 待编译 |
| `wiki/computer-science/legacy-软件工程 & 环境配置/` | 13 | 已确认 | 待编译 |
| `wiki/photography/legacy-摄影/` | 29 | 已确认 | 待编译 |
| `wiki/language/legacy-日语/` | 8 | 已确认 | 待编译 |
| `wiki/health/legacy-力量训练/` | 1 | 已确认 | 待编译 |

## 排除

- `archived/` 完全废弃，不进入迁移计划。
- `raws/` 与根 `assets/` 由来源插件拥有，不通过 Legacy Migration 改写。

## 迁移记录

- 2026-08-25：将 `legacy-对话日志/` 整体移动到 `workspace/sessions/`，保留原年份、月份和文件名；同步更新 `session-log` Skill。
- 2026-08-26：完成 Douban 唯一媒体目录、WeRead 分支、Reading / Viewing Note 和 Cinema Wiki 改造；迁移 4 个过程附件后，将 `legacy-读书/` 与 `legacy-电影/` 的剩余 37 个文件移动到 `.trash/knowledge-system-v1-2026-08-26/`。该快照可恢复，未永久删除。
- 2026-09-12：复核发现唯一 Viewing Note《洛丽塔》只有迁移说明、空标题与语义不确定的旧评分，不构成实际人工观影内容；已将整个 `workspace/viewing/` 移入 `.trash/knowledge-intake-v2-2026-09-12/workspace/viewing/`。Viewing Note Schema 保留，未来有真实内容时按需重建目录。
- 2026-09-12：Douban 插件封面缓存从根 `assets/` 迁至 `raws/Douban/_assets/`，并同步 169 个 Raw 引用、插件附件路径和目录视图。
