---
type: implementation-spec
status: agreed
implementation_status: complete
version: 2
created: 2026-09-12
updated: 2026-09-12
---

# Knowledge Intake v2

## 目标

把 Daily 中的零碎记录、外部 Raw、持续关注、执行计划和 Wiki 知识连接为一条可渐进使用的链路，而不要求每条记录立即分类或编译。

~~~text
External source → Raw
Daily / Raw → Theme / Insight / Task / Candidate
Theme → Period Plan → Task / Output
Raw / Theme / Workspace material → compile → Wiki
~~~

## 已确认边界

- Raw 按来源系统保存；Web Raw 按捕获年月分片，标签只作宽松元数据，不复制 Wiki 领域目录。
- Theme 属于 Workspace，是围绕同一关注原因持续收集问题、线索和暂定理解的工作页，不是 Raw，也不是 compiled knowledge。
- Theme 可以被月度或季度 Plan 选中；Plan 声明阶段结果并连接 Task，Theme 本身不移动进 workspace/plans。
- Insight 是值得以后翻阅的独立想法，初期不强制分类，按月汇入 workspace/insights。
- Daily Review 扫描整篇 Daily，允许候选被路由为 Insight、Theme、Task、待编译材料或仅保留的个人片段。
- Wiki 允许从 Theme 渐进编译局部成熟结论，不要求整个 Theme 一次性“毕业”。
- Weekly、Monthly、Quarterly 使用同一 Period Plan 模型；季度表达方向，月份选择投入，周复盘汇总实际证据。
- DIDA 继续只是 Task 的可选外部映射与专注来源，Obsidian 保存上下文、关联和成果。

## 实施清单

- [x] 单独提交 Homepage v2 与“跨日任务 / 当日任务”基线。
- [x] 将 Douban 封面迁到 raws/Douban/_assets 并同步插件、Raw 与视图引用。
- [x] 将没有实际人工内容的 Legacy Viewing Note 移入可恢复快照。
- [x] 建立 Web Raw adapter、Theme、Insight 与 Period Plan Schema。
- [x] 改造 Daily Review、Candidate 聚合与 Compile Workflow。
- [x] 重写季度规划 Skill，并增加周/月 Review Skill。
- [x] 从现有 Daily 建立首批 Theme、Insight 与周期计划草案。
- [x] 将 Theme、Plan、Insight 和 Review 提示接入 Homepage / Canvas。
- [x] 整理 Session 入口，完成链接、查询、配置与 Git 边界验收。

## 验收

- Raw、Workspace、Wiki 与 Schema 的事实边界没有被新视图打破。
- 删除 Homepage 或索引不会丢失 Theme、Insight、Plan、Task 或知识事实。
- 普通碎片可以原样留在 Daily；没有任何流程要求当天完成强制分类。
- 同一 Theme 可以同时连接 Raw、Insight、Plan、Task 和多个 Wiki 输出。
- 真实内容迁移保留来源链接；不把重复 occurrence 当作多个独立需求。
- 规则、模板、Skills、索引和 .gitignore 对新路径的描述一致。
