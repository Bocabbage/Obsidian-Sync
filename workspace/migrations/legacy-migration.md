---
type: migration
status: active
created: 2026-08-25
updated: 2026-08-25
---

# Legacy Migration

迁移规则见 `schema/workflows/migrate-legacy.md`。文件数用于估算范围，不作为完成条件。

## Root Legacy

| 目录 | 约文件数 | 当前判断 | 目标 | 状态 |
|---|---:|---|---|---|
| `legacy-读书/` | 21 | 书籍记录、个人阅读内容、作者分析、模板、视图和附件混合 | Raw 引用 + Workspace 阅读记录 + Wiki 来源/作者/知识 + 派生视图 | 待设计 |
| `legacy-电影/` | 20 | 观影记录、影片对象、导演/电影分析、模板、视图和附件混合 | Raw 引用 + Workspace 观影记录 + Wiki 来源/导演/知识 + 派生视图 | 待设计 |
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
