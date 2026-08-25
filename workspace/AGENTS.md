# Workspace Agent 规则

进入本目录前先阅读根目录 `AGENTS.md`、`schema/ownership.md` 和相关工作流。

- Workspace 保存人的计划、会话、草稿、迁移和待办，内容不是默认的长期知识事实。
- 只在用户请求或对应本地 Skill 已触发时修改实际工作记录。
- 会话写入 `workspace/sessions/`，Daily 写入 `workspace/daily/`，Quarterly Plan 写入 `workspace/plans/`，迁移状态写入 `workspace/migrations/`。
- Daily 以大任务、小任务保存当天切片；DIDA 链接由用户按需手工关联，`/daily-review` 只生成这些关联任务的当天专注汇总。详细规则见 `schema/workflows/daily.md`。
- `workspace/specs/` 保存已形成共识但尚未生效的实施规格；Spec 提升到 Schema 前不得当作当前规则执行。
- 值得长期复用的结论通过 compile 进入 Wiki，不直接移动整份过程记录。
