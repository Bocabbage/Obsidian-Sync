---
type: workspace-index
updated: 2026-08-28
---

# Workspace

这里保存人的持续工作状态和 Agent 运行记录，不作为 compiled knowledge。

- `sessions/`：Agent 会话摘要。
- `plans/`：每日与季度计划。
- `tasks/`：需要跨日承接、独立统计或稳定外部映射的 Task Entity；当天 occurrence 继续写入 Daily。
- `specs/`：已经形成共识、但尚未全部实现的系统演进规格。
- `migrations/`：一次性结构迁移清单和进度。
- `drafts/`：尚未决定是否进入 Wiki 的草稿。
- `overview/home.md`：工作日自动启动首页；`overview.canvas`：同一组组件的手动视觉布局。
- `reading/`：确有人工摘抄、想法、评分或非 WeRead 阅读过程时按需建立的 Reading Note。
- `viewing/`：确有个人评分、观看日期或评论时按需建立的 Viewing Note。
- [[workspace/backlog|Backlog]]：不阻塞当前工作的后续事项。

长期可复用结论经过 `schema/workflows/compile.md` 定义的流程进入 Wiki。
当前演进顺序和开工前决策见 [[workspace/specs/knowledge-system-v1|Knowledge System v1]]。
