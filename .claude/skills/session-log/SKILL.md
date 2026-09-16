---
name: session-log
description: 在此 Obsidian 知识库中工作时自动激活，将每次会话的任务、结论和待办记录到 workspace/sessions；用户要求保存、关闭或继续会话记录时也使用。
---

# 会话记录

会话摘要属于 Workspace 运行记录，不属于 Schema 或 Wiki。长期知识只有经过 compile 才进入 Wiki。

## 触发

- 在此知识库中开启任意会话时自动激活。
- 用户说“保存日志”“记录一下”或 `/session-log` 时更新当前会话文件。
- 用户说“关闭会话”“结束本次对话”时关闭当前会话文件。

## 存储位置

```text
workspace/sessions/{年份}/YYYY-MM/YYYY-MM-DD-{序号}.session.md
```

例如：`workspace/sessions/2026/2026-08/2026-08-25-01.session.md`。

同一会话持续更新同一文件；当天的新会话按现有最大序号加一。Task ID 从 1 开始，仅在当前会话文件内有效。

## 新文件格式

```markdown
---
type: session
status: active
started: 2026-08-25 10:30
updated: 2026-08-25 11:00
---

# 会话摘要

## 任务概览

| Task ID | 任务描述 | 状态 | 备注 |
|---|---|---|---|
| 1 | 示例任务 | active | 当前议题 |

## 对话摘要

- 本次讨论或完成的关键事项。

## 结论

- 已确认的决定及其边界。

## 下次待办

- 尚未完成或明确延期的事项。
```

旧会话文件可以保留原格式，不为格式统一而批量重写。

## 更新规则

- 更新当前任务、摘要、结论、待办和 `updated`，不覆盖用户已有内容。
- 关闭时将 `status` 改为 `closed`；旧格式文件则将顶部状态改为“已关闭”。
- 如果文件已关闭，不重复关闭；用户继续同一议题时可以新建会话，不把历史记录重新设为 active。
- 会话中的 Wiki ingest、compile 或 lint 操作另追加到 `wiki/_meta/log.md`。
- `workspace/sessions/_Index.md` 通过 Dataview 自动索引会话，不需要在创建或关闭时手工维护列表。
