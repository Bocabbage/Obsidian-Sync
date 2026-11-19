---
type: spec-index
updated: 2026-09-12
---

# Workspace Specs

这里保存已经形成共识、但尚未全部实现的知识库演进规格。

## 与其他目录的区别

- `agents/specs/`：描述准备建设什么、依赖关系、开放决策和验收标准。
- `agents/schema/`：描述当前已经生效、Agent 必须遵守的结构与行为契约。
- `agents/migrations/`：记录一次迁移实际执行到哪里。
- `agents/backlog.md`：保存不需要完整设计的后续事项。

Spec 中的规则在提升到 Schema 之前不视为已生效；当前行为仍以根 `AGENTS.md` 和 `agents/schema/` 为准。

## 当前规格

- [[agents/specs/knowledge-system-v1|Knowledge System v1]]：Daily、Douban/WeRead、Legacy、卡片与 Canvas 首页的整体演进。
- [[agents/specs/knowledge-intake-v2|Knowledge Intake v2]]：Theme、Insight、周期规划、知识编译与来源目录的第二阶段改造。
