---
type: schema
schema: ownership
updated: 2026-10-05
---

# 目录所有权

## 所有权矩阵

| 路径 | 事实地位 | 默认读取 | 默认写入 | 主要维护者 |
|---|---|---:|---:|---|
| `raws/` | 可追溯的来源材料 | 是 | 默认否；授权捕获可新建 | 同步插件、导入器或人工/Agent 捕获流程 |
| `raws/Notes/` | 迁入本地后持续维护的学习笔记 | 是 | 经用户委托可编辑 | 用户为主、Agent 辅助 |
| `raws/Douban/_assets/` | Douban 原始封面缓存 | 按需 | 否 | Douban 插件 |
| `workspace/` | 人的日常工作状态、思考与过程记录 | 按需 | 是 | 人为主、Agent 辅助 |
| `workspace/learning/` | 与已确认 Theme 关联的个人学习过程 | 按需 | 经用户委托可生成或维护 | 用户为主、Agent 辅助 |
| `wiki/` | 已编译或正在编译的长期知识 | 是 | 是 | Agent 为主、人审阅 |
| `agents/` | 规范、系统设计、Agent 运行与维护材料 | 按需 | 按用途与授权 | 用户与 Agent |
| `agents/schema/` | 结构与行为契约 | 是 | 谨慎 | 人与 Agent 共同维护 |
| `agents/drafts/` | Agent 暂定分析、待审核建议与试写 | 按需 | 经授权或已触发 Skill | Agent 为主、用户审阅 |
| `agents/views/` | 从现有事实派生的界面与查询实现 | 按需 | 经用户委托维护 | 用户使用、Agent 辅助维护 |
| 根级 `legacy-*` | 所有权仍混合的待拆分内容 | 仅迁移时 | 仅迁移时 | 迁移流程 |
| `wiki/**/legacy-*` | 领域已确认、结构尚未编译完成 | 是 | 是 | 领域编译流程 |
| `archived/` | 完全废弃、仅留存 | 否 | 否 | 无 |
| `.obsidian/` | Obsidian 配置与运行状态 | 按需 | 受限 | 用户/配置任务 |
| `.agents/`、`.claude/` | Agent Skills 与入口配置 | 按需 | 受限 | 技能或框架任务 |

## Raw 层

- `raws/` 中的文件由同步插件、导入器或人工捕获流程拥有，Agent 默认只读。
- 用户明确要求捕获特定对话或资料时，Agent 可按 source adapter 新建来源文件；捕获后默认只读。创建权限不等于可任意修改既有 Raw，也不延伸到插件拥有的文件。
- `raws/Notes/` 是明确例外：用户选择将现有学习笔记迁入本地并在该目录继续写作时，按 `agents/schema/sources/notes.md` 维护。目录日期表示迁入或建页时间，后续编辑不改变路径；原始链接、迁入日期和后续修订身份须可区分。
- Raw 不限于逐字原文：忠于指定范围、明确角色与来源的结构化对话快照也是来源材料。去重、分组或排成表格不等于知识编译；普通 Raw 的新解释与持续发展的个人理解另放 Workspace，跨来源综合进入 Wiki。Notes 例外可以持续记录学习中的理解，但不自动获得 Wiki 已验证知识的地位。
- 不为了补充分类、wikilink 或状态而手工修改插件控制的 Raw 文件；这类修改可能在下次同步时被覆盖。
- 对 Raw 的解释、分类、去重和跨来源连接不回写原文件。Theme 与 Raw 的正式材料关系维护在 Theme 的 `materials`，由 Obsidian 原生反向链接提供 Raw 侧入口。Douban 媒体目录的精确 ISBN 关系可由视图动态推导；其他来源身份和质量判断写入 `wiki/sources/`。
- `raws/Douban/豆瓣同步结果_*.md` 是同步运行报告，不作为知识来源引用。
- `raws/Douban/_assets/` 是 Douban 插件使用的封面缓存；它和 Douban Markdown 一样由插件拥有，不移动、改名或覆盖其中图片。
- Web / Codex Raw 以捕获日期组织路径，来源标签只保留采集侧语义；不在 Raw 内写入可变 Theme、处理状态或 Wiki 领域。

## Workspace 层

- `workspace/` 保存 Daily、月度 Todo、Task Entity、Theme、Insight、计划、草稿、阅读与观影笔记等个人工作内容。知识库规则、系统设计、Agent 会话、迁移记录和维护待办另存 `agents/`。
- Agent 只在用户请求或已触发的本地 Skill 范围内修改 Workspace 内容。
- `workspace/learning/` 保存新增的 Theme 学习记录。用户明确创建学习 Theme 并确认 roadmap 后，可同次生成笔记骨架；已有听课内容、个人理解和阶段整理属于用户记录，维护入口时完整保留。目录规则、说明与索引属于开发资产，具体笔记正文由 OneDrive 管理。
- 既有 Reading Note 和用户指定的 `raws/Notes/` 仍按各自契约维护；新增学习目录不授权迁移或改写这些材料。外部 PDF 可以保留在 Zotero，以正文链接引用，不为建立笔记复制来源文件。
- Workspace 内容不是长期知识结论；其中有复用价值的内容应经过 compile 后进入 Wiki。

## Wiki 层

- `wiki/` 保存人和 Agent 都能直接阅读的 compiled knowledge。
- 新建或重写页面时保留来源链，避免把无来源推断写成事实。
- `wiki/**/legacy-*` 可以参与查询，但属于 provisional 内容：结构、字段和来源可能尚未符合 Schema。
- `wiki/_meta/` 保存 Wiki 自身的操作日志和 lint 报告，不保存普通会话记录。

## Agent 材料与 Schema

- `agents/README.md` 保存全库操作规范与导航，根 `AGENTS.md` 只作阅读入口并保留关键限制。
- `agents/schema/` 只保存当前生效的可复用规则、字段定义、来源适配、工作流和模板。
- `agents/specs/` 保存系统设计；未提升到 Schema 的设计不得作为现行规则执行。已完成或已被替代的 Spec 保留其历史身份。
- `agents/drafts/` 保存 Agent 暂定分析、待审核建议和写作试稿，正文使用 `type: draft`。引用这些材料不等于用户已确认判断；用户采纳的工作内容再整理到对应 Task、Theme 或个人笔记，长期知识通过 compile 进入 Wiki。
- `agents/views/` 保存首页、Canvas、查询脚本与展示样式等可复用视图；它们供用户使用，不是个人工作记录或新的事实来源。视图若支持操作，结果仍写入对应原始 Markdown，并遵循 Daily 历史保护等工作流。
- `agents/sessions/` 保存会话摘要，`agents/migrations/` 保存迁移清单与执行记录，`agents/backlog.md` 保存知识库自身的后续事项，不替代个人 Todo。
- 运行记录只在用户请求或对应本地 Skill 已触发时更新，不作为一般知识事实来源。会话中的学习材料或长期知识按 Raw 捕获、Workspace 笔记或 Wiki compile 的规则另行保存。
- 结构迁移可修复历史文件的实际链接目标，保留正文中的历史路径描述、日期与状态；这不授权重写来源、个人事实或过往决定。
- 修改规则时检查根入口、Agent 总览、受影响模板、Skills、查询、配置和领域入口，避免只更新其中一处。

## Legacy 与 Archived

- 根级 `legacy-*` 默认不参加普通 query，防止与 Raw 或 Wiki 中的新内容重复。
- 根级 Legacy 只有在迁移任务中才能拆分、移动或改写。
- Wiki 内 Legacy 已确认领域归属，可逐步重组；移除 `legacy-` 前缀前必须完成引用检查和 lint。
- `archived/` 不参加 ingest、query、compile 或 lint，除非用户明确要求查看某项历史内容。

## 移动与删除

- 移动或重命名文件前，使用全文搜索检查 wikilink、Markdown link、Dataview 路径和 Skill 引用。
- 优先使用可恢复的移动；不在范围不清楚时批量删除。
- 普通重构不修改 `.obsidian/workspace*.json`。
