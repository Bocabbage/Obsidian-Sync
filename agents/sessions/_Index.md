---
type: agent-index
updated: 2026-10-02
---

# Sessions

这里索引 `agents/sessions/` 中的 Agent 会话与操作摘要；它不是逐字聊天记录，也不自动成为 Wiki 知识。

```dataview
TABLE WITHOUT ID
  link(file.path, file.name) AS "Session",
  status AS "状态",
  started AS "开始",
  updated AS "更新"
FROM "agents/sessions"
WHERE type = "session" OR (file.ext = "md" AND contains(file.name, ".session"))
SORT updated DESC, started DESC
LIMIT 30
```
