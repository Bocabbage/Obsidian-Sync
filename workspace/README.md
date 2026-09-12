---
type: workspace-index
updated: 2026-09-12
---

# Workspace

这里保存人的持续工作状态和 Agent 运行记录，不作为 compiled knowledge。

- `sessions/`：Agent 会话摘要。
- `plans/`：Weekly、Monthly 与 Quarterly 的选择和复盘。
- `tasks/`：需要跨日承接、独立统计或稳定外部映射的 Task Entity；当天 occurrence 继续写入 Daily。
- `themes/`：持续关注的问题、线索、暂定理解和投入判断。
- `insights/`：按月保存、值得以后重读的独立想法。
- `specs/`：已经形成共识、但尚未全部实现的系统演进规格。
- `migrations/`：一次性结构迁移清单和进度。
- `drafts/`：尚未决定是否进入 Wiki 的草稿。
- `overview/home.md`：工作日自动启动首页；`overview.canvas`：同一组组件的手动视觉布局。
- `reading/`：确有人工摘抄、想法、评分或非 WeRead 阅读过程时按需建立的 Reading Note。
- `viewing/`：确有个人评分、观看日期或评论时才按需出现，不保留空目录。
- [[workspace/backlog|Backlog]]：不阻塞当前工作的后续事项。

长期可复用结论经过 `schema/workflows/compile.md` 定义的流程进入 Wiki。
当前演进基线见 [[workspace/specs/knowledge-intake-v2|Knowledge Intake v2]]；v1 保留为历史记录。
