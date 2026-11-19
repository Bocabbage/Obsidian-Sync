---
type: migration
status: complete
created: 2026-10-02
updated: 2026-10-02
---

# Agent 草稿移出 Workspace

用户确认当前 drafts 是 Agent 草稿，授权整体迁入 `agents/drafts/`。本轮移动四个文件，保留文件名，旧目录已移除。

| 原位置 | 新位置 | 文件数 |
|---|---|---:|
| `workspace/drafts/` | `agents/drafts/` | 4 |

移动前保存文件清单、SHA-256、Git 状态和相关文件副本；先核对移动内容一致，再更新入口与分类。详见 [[agents/migrations/agent-drafts-2026-10-02.inventory.json|文件清单、校验值与验证结果]]。

- README 说明这里保存暂定分析、待审核建议和写作试稿，使用 `type: agent-index`。
- 两份 Task 相关分析的类型从 `workspace-record` 改为 `draft`，其余正文、日期和状态不变；human-writing 试写内容完全不变。
- Task、Theme、计划、Daily、历史迁移和会话中的实际链接指向新位置；10 份相关文件的差异只涉及链接目标，正文、别名、日期和状态不变。
- 同步 Agent 与 Workspace 入口、所有权、字段说明、Query 范围及 Git 白名单。README 继续可跟踪，三份草稿正文仍只由 OneDrive 管理。

## 验证

- 四个目标文件均存在，旧目录不存在。
- 校验值及允许的分类差异核对通过；19 份相关 frontmatter 可解析。
- 17 条新位置 wikilinks 均能解析，没有指向旧 drafts 位置的实际链接。
- 四个文件的 Git ignore 边界符合规则；Git diff whitespace 检查通过。

本轮未移动 Overview，未修改 Raw、Archived 或 Obsidian 工作区状态文件，未暂存、commit 或 push。Overview 是聚合展示层，后续可整体移出 Workspace；目标目录仍在讨论。
