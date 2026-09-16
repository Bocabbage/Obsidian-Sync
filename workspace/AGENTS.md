# Workspace Agent 规则

进入本目录前先阅读根目录 `AGENTS.md`、`schema/ownership.md` 和相关工作流。

- Workspace 保存人的计划、会话、草稿、迁移和待办，内容不是默认的长期知识事实。
- 只在用户请求或对应本地 Skill 已触发时修改实际工作记录。
- 会话写入 `workspace/sessions/`，Daily 写入 `workspace/daily/`，跨日 Task 写入 `workspace/tasks/`，Theme 写入 `workspace/themes/`，Insight 写入 `workspace/insights/`，周期计划写入 `workspace/plans/`，迁移状态写入 `workspace/migrations/`。
- 人工阅读笔记写入 `workspace/reading/books/`，个人观影记录写入 `workspace/viewing/`；Douban 已有目录状态且没有额外人工内容时不建立空壳页。
- Daily 以“跨日任务”保存 Task Entity 的当天 occurrence，以“当日任务”保存无需建页的一次性事项；跨日、需统计或带稳定 DIDA 映射的事项使用 Task Entity，同一实体在多日重复引用。`/daily-review` 先收口当日 occurrence，再生成关联任务的当天专注汇总。详细规则见 `schema/workflows/daily.md`。
- `workspace/specs/` 保存已形成共识但尚未生效的实施规格；Spec 提升到 Schema 前不得当作当前规则执行。
- Theme 由用户设立或明确确认后创建，用来指导任务并积累问题、理解和成果；Agent 只建议，不从工作反复出现自动创建或激活。Task 与 Theme 可多对多或不关联，Daily 无需逐动作标 Theme。Insight 按月保存可独立重读的想法。
- Workspace 的导航索引统一命名 `_Index.md`，保留 `type: workspace-index`，不当作实体正文；Wiki 和插件来源目录不随之改名。
- Homepage 使用 `workspace/overview/home.md` 自动启动，并以 `workspace/overview.canvas` 提供手动视觉布局；两者共用 `workspace/overview/` 查询组件，只聚合现有事实。
- 值得长期复用的结论通过 compile 进入 Wiki，不直接移动整份过程记录。
