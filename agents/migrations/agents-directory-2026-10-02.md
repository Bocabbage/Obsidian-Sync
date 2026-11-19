---
type: migration
status: complete
created: 2026-10-02
updated: 2026-10-02
---

# 规范与 Agent 工作材料集中到 agents

用户确认将外围 Schema 和 Workspace 中的系统设计、会话摘要、迁移记录及维护待办集中到 `agents/`。个人工作内容继续保存在 Workspace，现有技能加载目录继续使用。

## 迁移清单

| 原位置 | 新位置 | 文件数 |
|---|---|---:|
| `schema/` | `agents/schema/` | 64 |
| `workspace/specs/` | `agents/specs/` | 3 |
| `workspace/sessions/` | `agents/sessions/` | 44 |
| `workspace/migrations/` | `agents/migrations/` | 4 |
| `workspace/backlog.md` | `agents/backlog.md` | 1 |

共移动 116 个既有文件。移动前保存了路径、大小、SHA-256 和 Git 状态；移动后逐文件核对原始内容一致，再按范围修复引用。旧位置已移空并移除，不保留跳转空壳。

- [[agents/migrations/agents-directory-2026-10-02.inventory.json|文件清单与迁移前后校验值]]
- [[agents/migrations/agents-directory-2026-10-02.verification.json|验证结果与历史路径例外]]

## 入口与规则

- 根 `AGENTS.md` 保留阅读入口和关键限制，原有详细操作要求移入 [[agents/README|Agent 总览与规范]]。
- 所有权、分类、字段、Workspace 导航、会话工作流、各目录入口和两套本地 Skills 已同步。
- Agent 总览与会话索引使用 `type: agent-index`；具体会话的类型、日期和状态按原有会话规则维护。
- Schema 表达现行契约，Specs 保存设计与历史版本，Sessions 和 Migrations 保存运行过程。
- 模板目录与 Daily 模板配置只修改了路径字段；首页系统 Backlog 读取与跳转已指向新位置。
- 两个 Daily 脚本改为从 `agents/schema/` 与 Workspace 识别 Vault；测试模板路径和夹具已同步。
- Git 白名单已迁到新位置；具体会话、个人正文及历史快照仍不进入 Git。保留原有未提交改动，未暂存、commit 或 push。

## 历史保护

按用户选择，仅修复历史文件的实际链接目标；10 份历史或个人内容文件的差异已核对，链接之外的正文、别名、日期和状态保持一致。当前会话另按 session-log 更新实施摘要。

历史 Spec、迁移报告、会话和 Wiki 日志中描述当时位置的路径文本继续保留；这些路径不是现行入口。具体例外见验证结果。本文件的原位置列和清单中的源路径用于迁移追溯。

699 个 Raw 来源、附件和 Daily 快照文件的 SHA-256 保持一致。Raw 只修复四份规则或入口说明中的规范引用；未修改同步内容、个人笔记事实或 Archived。未手工写入 Obsidian 工作区状态文件；运行中的 Obsidian 自行保存了 `workspace.json`，其他 127 份匹配的状态文件保持原校验值。

## 验证结果

- 116 个迁移文件均存在，五个旧位置均已移除；有效规范与运行代码无旧路径依赖。
- 最终检查覆盖 Agent、Workspace、Wiki 和规则入口的 233 份 YAML frontmatter，均可解析；66 条迁移目标 wikilinks 均可解析，无旧位置的实际链接。规则代码围栏、JavaScript 语法和 Git diff whitespace 检查通过。
- 原有 39 项相关测试及新增 Backlog 回归共 40 项通过；CLI 测试夹具只有新 Schema 位置，能从嵌套 Daily 路径识别 Vault；Task Todo 测试读取新位置的模板。
- 两套 Skills 本轮修改一致；原有 `reading-maintenance/agents/openai.yaml` 仅存在于 `.agents` 的差异保持原样。
- 12 条 Git ignore 边界检查通过，模板配置的其他字段保持一致。
- 运行中的 Obsidian 核心模板插件从新目录完成内存编辑器插入并解析日期变量，未创建测试 Daily；会话索引真实查询返回 30 行，真实 DataviewJS 渲染正确生成新 Backlog 入口且无渲染错误。

本轮迁移已完成。检查范围是目录、规则与关联运行入口，不代表 Wiki Legacy 内容已完成知识编译。
