---
type: schema
schema: workflow
workflow: knowledge-intake
updated: 2026-09-16
---

# Knowledge Intake Workflow

本流程把捕获与整理分离：先允许内容落在 Raw 或 Daily，再在 Review 中决定是否需要 Theme、Insight、Task 或 Wiki。

## 路由

| 输入 | 判断 | 去向 |
|---|---|---|
| 外部网页或同步内容 | 需要保留来源原貌 | Raw |
| AI 对话及其概念/问答整理 | 忠于明确的来源范围，保留角色与未验证边界 | 经用户授权捕获为 Raw |
| 持续补充、改写的个人理解 | 已不再是一次来源捕获 | Workspace 笔记/草稿 |
| 可以独立重读的想法 | 不要求执行或证明 | Insight Log |
| 多次出现且共享同一关注原因 | 用户尚未确认持续研究方向 | 留在原记录，提出 Theme 建议 |
| 用户明确设立或确认的持续方向 | 需要指导任务并积累理解 | Theme |
| 已形成跨日承诺或需稳定映射 | 需要跟踪执行 | Task Entity |
| 有复用价值但尚未成熟 | 需要以后处理 | Daily 待分流 |
| 已验证、可复用并有来源链 | 可以进入长期知识 | Wiki compile |
| 只对当天有意义 | 不需要提升 | 留在 Daily |

一条内容可以同时产生多个去向，例如先摘录 Insight，再把它作为 Theme 的一条线索；每个去向都应链接原始 Daily 或 Raw。

Raw 捕获不同于 Wiki ingest / compile；对话排成表格或问答并不自动改变归属。Session 只记录整理操作，不代替素材；不强制同时创建完整对话、Workspace 笔记和 Wiki 三份页面。

## Daily Review

1. 扫描整篇 Daily 的人工内容，排除模板、Dataview、自动专注区和纯任务池结果。
2. 提出少量高置信候选，区分 question、idea、insight、material 和 task，不强制每条都分类。
3. Insight 追加到当月 Insight Log；相关线索可以更新已有 Theme，但新 Theme 必须由用户明确提出或逐项确认，不能从反复工作自动创建。
4. 执行承诺按 Task Entity 规则处理；知识材料留在待分流或按 Compile Workflow 输出。
5. 在原 Daily 候选后记录去向链接；普通碎片保持原文，不以“整理”为由重写用户表达。

重复出现的同一 Task occurrence 只算一条持续执行线索，不作为多个独立需求的证据。

## Theme Review

- 多条相关线索可触发建议；只有用户明确设立或接受该方向后才建立 seed Theme，单条明确的学习意图也足够。
- 用户明确选择投入时才转为 active；Plan 草案或活跃 Task 的关联不代表选择。暂停投入不删除历史线索。
- Review 记录问题、理解和成果的变化，不复制全部 Task 进度，不要求 Daily 每个动作标注 Theme。
- Theme 可以先输出一个 Wiki 页面、项目文档或实验结果，再继续保留其他未解决问题。
- 同一 Theme 的不同输出目标分别记录状态；不能因为一个目标完成就宣布全部知识闭环。

## 不自动发生的转换

- Raw tag 不自动变成 Theme、Wiki topic 或目录。
- Task、反复工作或一般性的批量整理授权不自动产生 Theme；未确认的建议留在原记录。
- Insight 不自动变成任务。
- Theme 不自动变成 Plan；Period Plan 只引用被选中的 Theme。
- Task 完成不自动证明相关知识已经编译。
- Wiki 输出不自动关闭 Theme。
