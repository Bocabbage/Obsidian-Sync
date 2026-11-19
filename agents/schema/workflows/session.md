---
type: schema
schema: workflow
workflow: session
updated: 2026-10-02
---

# Session Workflow

Agent 会话摘要保存在 `agents/sessions/{年份}/YYYY-MM/`，属于 Agent 运行记录，不属于个人 Workspace 内容、Schema 现行契约或 Wiki 知识。

Session 记录 Agent 做了什么、作了哪些决定、还有什么待办。需要保存 AI 学习对话的概念、问答和实践材料时，经用户授权按 [[agents/schema/sources/codex|Codex 来源适配]] 捕获到 Raw，不能仅因它来自“会话”就写成 Session；持续修改的个人理解则属于 Workspace 笔记。Session 可以链接这些材料，但不要求重复保存全文。

- 每个会话文件记录任务、要点、结论和下次待办。
- 同一会话持续更新同一文件，关闭时将状态从 `active` 改为 `closed`。
- 会话中的长期知识只有经过 compile 才进入 Wiki。
- Wiki 的 ingest/query/lint 操作另记入 `wiki/_meta/log.md`，不与会话摘要混用。
- 存储格式和自动触发行为由 `.agents/skills/session-log/SKILL.md` 定义。
