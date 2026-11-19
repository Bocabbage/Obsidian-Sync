---
type: workspace-index
updated: 2026-10-08
---

# Workspace

这里保存你的日常工作、计划、思考和笔记，不作为 compiled knowledge。知识库规范、系统设计和 Agent 工作记录见 [[agents/README|Agent 材料]]。

想先弄清目录、任务和材料怎样串起来，可以读 [[agents/docs/vault-guide|这个知识库怎么用]]。指南帮助理解，现行结构与行为契约以 [[agents/schema/README|Schema]] 为准。

- `daily/`：每天的工作切片、小任务入口、小零碎和复盘。
- `plans/`：Weekly、Monthly 与 Quarterly 的选择和复盘。
- `todos/`：按创建月分片的小任务待办池；一行一个一次性事项，跨月不搬运。
- `tasks/`：需要跨日承接、独立统计或稳定外部映射的 Task Entity；其 `Todo` 持续保存子步骤，复盘回收、次日自动续入，Daily 保留当天 occurrence。
- `themes/`：你主动设立、值得独立规划和回看的方向或阶段性事项，保存目的、范围、推进路线和结果，并指导 Task；学习和旅行都可以。相关 Raw 放进 Theme 的 `materials` 属性，正文说明用途；Agent 仅建议，不自动创建。
- `learning/`：按已确认的 Theme roadmap 组织个人学习记录，初期每个 Theme 一份主笔记。从 Theme 的阶段入口即可打开对应标题，记下听课补充、想法和阶段整理；全部笔记见 [[workspace/learning/_Index|学习笔记索引]]。
- `insights/`：按月保存、值得以后重读的独立想法。
- `reading/`：确有人工摘抄、想法、评分或非 WeRead 阅读过程时按需建立的 Reading Note。
- `viewing/`：确有个人评分、观看日期或评论时才按需出现，不保留空目录。

Daily 的“小任务”和待办总览使用同一份清单，显示录入日期；添加时可选“常规任务”或“今日必做”，已有任务可调整安排。到期未完成会显示逾期，复盘前需明确处理；常规任务不要求当天清空。随手想法和资料链接放在“小零碎”。使用细则见 [[agents/schema/workflows/daily|Daily 工作流]]。

长期可复用结论经过 `agents/schema/workflows/compile.md` 定义的流程进入 Wiki。
系统设计、会话摘要、迁移记录和 [[agents/drafts/README|Agent 草稿]] 集中到 [[agents/README|Agent 材料]]；不混入个人工作目录。
首页与展示组件见 [[agents/views/overview/README|Overview]]；[[agents/views/overview/home|首页]] 和 [[agents/views/overview/overview.canvas|Canvas]] 聚合这里的工作内容。

- [[workspace/task-groups/_Index|任务关注组]]：按季度生活事项、版本迭代等周期组织重点 Task，多个组可并行；不限制未分组任务参与 Daily。

- [[workspace/exercises/_Index|锻炼动作]]：Daily 记录训练，review 创建新动作页；按动作回看每条训练，并补充个人笔记与资料。
