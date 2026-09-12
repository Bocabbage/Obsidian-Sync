---
type: schema
schema: workflow
workflow: knowledge-intake
updated: 2026-09-12
---

# Knowledge Intake Workflow

本流程把捕获与整理分离：先允许内容落在 Raw 或 Daily，再在 Review 中决定是否需要 Theme、Insight、Task 或 Wiki。

## 路由

| 输入 | 判断 | 去向 |
|---|---|---|
| 外部网页或同步内容 | 需要保留来源原貌 | Raw |
| 可以独立重读的想法 | 不要求执行或证明 | Insight Log |
| 多次出现且共享同一关注原因 | 仍在形成问题和理解 | Theme |
| 已形成跨日承诺或需稳定映射 | 需要跟踪执行 | Task Entity |
| 有复用价值但尚未成熟 | 需要以后处理 | Daily 待分流 |
| 已验证、可复用并有来源链 | 可以进入长期知识 | Wiki compile |
| 只对当天有意义 | 不需要提升 | 留在 Daily |

一条内容可以同时产生多个去向，例如先摘录 Insight，再把它作为 Theme 的一条线索；每个去向都应链接原始 Daily 或 Raw。

## Daily Review

1. 扫描整篇 Daily 的人工内容，排除模板、Dataview、自动专注区和纯任务池结果。
2. 提出少量高置信候选，区分 question、idea、insight、material 和 task，不强制每条都分类。
3. Insight 追加到当月 Insight Log；反复问题或相关线索更新现有 Theme，只有确实需要时才新建。
4. 执行承诺按 Task Entity 规则处理；知识材料留在待分流或按 Compile Workflow 输出。
5. 在原 Daily 候选后记录去向链接；普通碎片保持原文，不以“整理”为由重写用户表达。

重复出现的同一 Task occurrence 只算一条持续执行线索，不作为多个独立需求的证据。

## Theme Review

- 同一关注原因下积累至少两条线索，或单条问题已明确需要持续投入时，可以建立 seed Theme。
- Theme 被 Period Plan 选中时转为 active；暂停投入不删除历史线索。
- Theme 可以先输出一个 Wiki 页面、项目文档或实验结果，再继续保留其他未解决问题。
- 同一 Theme 的不同输出目标分别记录状态；不能因为一个目标完成就宣布全部知识闭环。

## 不自动发生的转换

- Raw tag 不自动变成 Theme、Wiki topic 或目录。
- Insight 不自动变成任务。
- Theme 不自动变成 Plan；Period Plan 只引用被选中的 Theme。
- Task 完成不自动证明相关知识已经编译。
- Wiki 输出不自动关闭 Theme。
