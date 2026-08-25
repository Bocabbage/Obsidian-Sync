---
type: schema
schema: workflow
workflow: session
updated: 2026-08-25
---

# Session Workflow

Agent 会话摘要保存在 `workspace/sessions/{年份}/YYYY-MM/`，属于 Workspace 运行记录，不属于 Schema 或 Wiki。

- 每个会话文件记录任务、要点、结论和下次待办。
- 同一会话持续更新同一文件，关闭时将状态从 `active` 改为 `closed`。
- 会话中的长期知识只有经过 compile 才进入 Wiki。
- Wiki 的 ingest/query/lint 操作另记入 `wiki/_meta/log.md`，不与会话摘要混用。
- 存储格式和自动触发行为由 `.agents/skills/session-log/SKILL.md` 定义。
