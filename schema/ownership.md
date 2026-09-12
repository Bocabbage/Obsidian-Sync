---
type: schema
schema: ownership
updated: 2026-09-12
---

# 目录所有权

## 所有权矩阵

| 路径 | 事实地位 | 默认读取 | 默认写入 | 主要维护者 |
|---|---|---:|---:|---|
| `raws/` | 原始证据 | 是 | 否 | 外部来源或同步插件 |
| `raws/Douban/_assets/` | Douban 原始封面缓存 | 按需 | 否 | Douban 插件 |
| `workspace/` | 人的工作状态和过程记录 | 按需 | 是 | 人为主、Agent 辅助 |
| `wiki/` | 已编译或正在编译的长期知识 | 是 | 是 | Agent 为主、人审阅 |
| `schema/` | 结构与行为契约 | 是 | 谨慎 | 人与 Agent 共同维护 |
| 根级 `legacy-*` | 所有权仍混合的待拆分内容 | 仅迁移时 | 仅迁移时 | 迁移流程 |
| `wiki/**/legacy-*` | 领域已确认、结构尚未编译完成 | 是 | 是 | 领域编译流程 |
| `archived/` | 完全废弃、仅留存 | 否 | 否 | 无 |
| `.obsidian/` | Obsidian 配置与运行状态 | 按需 | 受限 | 用户/配置任务 |
| `.agents/`、`.claude/` | Agent Skills 与入口配置 | 按需 | 受限 | 技能或框架任务 |

## Raw 层

- `raws/` 中的文件由同步插件、导入器或人工捕获流程拥有，Agent 默认只读。
- 不为了补充分类、wikilink 或状态而手工修改插件控制的 Raw 文件；这类修改可能在下次同步时被覆盖。
- 对 Raw 的解释、分类、去重和跨来源连接不回写原文件。Douban 媒体目录的精确 ISBN 关系可由视图动态推导；其他稳定判断写入 `wiki/sources/`。
- `raws/Douban/豆瓣同步结果_*.md` 是同步运行报告，不作为知识来源引用。
- `raws/Douban/_assets/` 是 Douban 插件使用的封面缓存；它和 Douban Markdown 一样由插件拥有，不移动、改名或覆盖其中图片。
- Web Raw 以捕获日期组织路径，来源标签只保留采集侧语义；不在 Raw 内写入 Theme、处理状态或 Wiki 领域。

## Workspace 层

- `workspace/` 保存会话摘要、Daily、Task Entity、Theme、Insight、计划、草稿、迁移清单和待办等持续变化的工作状态。
- Agent 只在用户请求或已触发的本地 Skill 范围内修改 Workspace 内容。
- Workspace 内容不是长期知识结论；其中有复用价值的内容应经过 compile 后进入 Wiki。

## Wiki 层

- `wiki/` 保存人和 Agent 都能直接阅读的 compiled knowledge。
- 新建或重写页面时保留来源链，避免把无来源推断写成事实。
- `wiki/**/legacy-*` 可以参与查询，但属于 provisional 内容：结构、字段和来源可能尚未符合 Schema。
- `wiki/_meta/` 保存 Wiki 自身的操作日志和 lint 报告，不保存普通会话记录。

## Schema 层

- Schema 只保存可复用规则、字段定义、来源适配和工作流。
- 一次性迁移进度写入 `workspace/migrations/`，实际会话写入 `workspace/sessions/`。
- 修改 Schema 时检查受影响模板、Skills、查询和领域入口，避免只更新其中一处。

## Legacy 与 Archived

- 根级 `legacy-*` 默认不参加普通 query，防止与 Raw 或 Wiki 中的新内容重复。
- 根级 Legacy 只有在迁移任务中才能拆分、移动或改写。
- Wiki 内 Legacy 已确认领域归属，可逐步重组；移除 `legacy-` 前缀前必须完成引用检查和 lint。
- `archived/` 不参加 ingest、query、compile 或 lint，除非用户明确要求查看某项历史内容。

## 移动与删除

- 移动或重命名文件前，使用全文搜索检查 wikilink、Markdown link、Dataview 路径和 Skill 引用。
- 优先使用可恢复的移动；不在范围不清楚时批量删除。
- 普通重构不修改 `.obsidian/workspace*.json`。
