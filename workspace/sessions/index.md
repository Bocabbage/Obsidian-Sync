---
type: workspace-index
workspace_type: sessions
updated: 2026-09-12
---

# Sessions

这里索引 Agent 会话的结构化摘要；它不是逐字聊天记录，也不自动成为 Wiki 知识。

```dataview
TABLE WITHOUT ID
  link(file.path, file.name) AS "Session",
  status AS "状态",
  started AS "开始",
  updated AS "更新"
FROM "workspace/sessions"
SORT updated DESC, started DESC
LIMIT 30
```
