---
type: schema
schema: workflow
workflow: knowledge-intake
updated: 2026-10-05
---

# Knowledge Intake Workflow

本流程把捕获与整理分离：先允许内容落在 Raw 或 Daily，再在 Review 中决定是否需要 Theme、Insight、Task 或 Wiki。

## 路由

| 输入 | 判断 | 去向 |
|---|---|---|
| 外部网页或同步内容 | 需要保留来源原貌 | Raw |
| AI 对话及其概念/问答整理 | 忠于明确的来源范围，保留角色与未验证边界 | 经用户授权捕获为 Raw |
| 用户指定在本地继续维护的迁入学习笔记 | 保留原始链接与迁入日期，后续修订由本地页承接 | `raws/Notes/` |
| 已确认学习 Theme 的听课补充、理解与阶段整理 | 按用户确认的 roadmap 归类，保留来源与个人判断 | `workspace/learning/` 的 Learning Note |
| 持续补充、改写的个人理解 | 已不再是一次来源捕获，也未指定 Notes 例外 | Workspace 笔记/草稿 |
| 可以独立重读的想法 | 不要求执行或证明 | Insight Log |
| 多次出现且共享同一关注原因 | 用户尚未确认需要独立规划的方向或事项 | 留在原记录，提出 Theme 建议 |
| 用户明确设立或确认的方向或阶段性事项 | 需要保存目的、路线和结果，并指导任务 | Theme |
| 已形成跨日承诺或需稳定映射 | 需要跟踪执行 | Task Entity |
| 有复用价值但尚未成熟 | 需要以后处理 | 留在 Daily 小零碎或原记录 |
| 已验证、可复用并有来源链 | 可以进入长期知识 | Wiki compile |
| 只对当天有意义 | 不需要提升 | 留在 Daily |

一条内容可以同时产生多个去向，例如先摘录 Insight，再把它作为 Theme 的一条线索；每个去向都应链接原始 Daily 或 Raw。

Raw 捕获不同于 Wiki ingest / compile；对话排成表格或问答并不自动改变归属。Session 只记录整理操作，不代替素材；不强制同时创建完整对话、Workspace 笔记和 Wiki 三份页面。

## Raw 与既有 Theme 的关联

- 捕获或整理材料时，如果用户已明确关联，或本次授权范围内的来源、内容和既有 Theme 目的能够明确对应，将实际 Raw 文件的完整 wikilink 加入该 Theme 的 `materials`，先查重再写入；不改变 Theme 状态。
- 只维护 Theme 一侧的链接列表。Raw 的正文、Properties 和标签仍按来源规则维护，不为关联补写 Theme 字段或标签；原生反向链接提供 Raw 到 Theme 的导航。
- 标签相同仅提供检索线索，不能直接当作实体关联。含义不明确时留在原记录或提出候选，不自动创建 Theme，也不要求每份 Raw 都有 Theme。
- 正文可保留材料用途和相关阶段的说明；不为建立关系额外创建 Wiki source 或中间关系页。

## 学习记录

- 用户明确创建学习类 Theme 并确认 roadmap 后，按 [[agents/schema/workflows/learning|学习记录工作流]] 同次生成主学习笔记及阶段入口；已有 Theme 则按用户的具体生成或维护请求处理。仅讨论、检索或 Review 不触发建页。
- 后续听课补充、疑问、个人理解和作品分析进入对应阶段；来源捕获、Reading Note 和用户指定的 `raws/Notes/` 仍沿用各自契约，不因新增目录迁移。
- Theme 的 `materials` 只收录实际 Raw，学习记录通过 roadmap 和正文链接关联；外部 Zotero PDF 保留在原处，以正文链接定位。

## Daily Review

1. 扫描整篇 Daily 的人工内容，排除模板、Dataview、自动专注区和纯任务池结果。
2. 区分 question、idea、insight、material 和 task，不强制每条都分类；普通碎片与含义不确定的表达保持原文。
3. 逐条查看 `小零碎`（兼容旧 `碎碎念`）及其他人工内容；高置信、可以脱离当天上下文重读的用户想法直接追加到当月 Insight Log，不要求逐条确认。一点一条，保留对象、必要上下文、疑问与不确定性，并保留来源 Daily 和已有材料链接；不得把流水账、模板句或 Agent 新推论改写成 Insight。每条摘录在 `💡` 主行末尾附主题标签，优先原样沿用 Daily 中用户手写的标签，普通 `#主题` 也可；已有标签够用时不补，不强改命名或删减。未写或不足时再补，默认 1–3 个 `#topic/主题`，优先复用已有名称，按内容与来源去重，标签变化不产生重复条目。Daily 原标签保留，Agent 补充标签只维护在 Insight，不要求两边重复打标。格式与选词见 [[agents/schema/page-types/insight-log|Insight Log]]。
   相关线索可以更新已有 Theme，但主题标签不等于 Theme；新 Theme 必须由用户明确提出或逐项确认，不能从反复工作或打标签自动创建。
4. 执行承诺按 Task Entity / Todo Log 规则处理；知识材料留在小零碎或原记录，需要编译时按 Compile Workflow 输出。不要求新 Daily 预设待分流栏目。
5. 整理后在原记录旁保留去向链接；普通碎片保持原文，不以“整理”为由重写用户表达。旧 Daily 的待分流与 Knowledge Candidates 继续兼容，不把所有小零碎自动标为候选。

完成摘录后逐条核对：可独立理解、忠于原意、来源可回看、主题标签已补齐。每个点都要查看，不等于每个点都必须进入 Insight；未达到原有摘录标准的片段仍保留在 Daily。旧 Daily 不改标题、不因本次规则批量补标或重写。

重复出现的同一 Task occurrence 只算一条持续执行线索，不作为多个独立需求的证据。

## Theme Review

- 多条相关线索可触发建议；只有用户明确设立或接受该方向或阶段性事项后才建立 seed Theme，单条明确的学习、旅行等规划意图也足够。
- 用户明确选择投入时才转为 active；Plan 草案或活跃 Task 的关联不代表选择。暂停投入不删除历史线索。
- Review 记录问题、理解、安排和成果的变化，检查本次新增材料是否需要加入 `materials`；不复制全部 Task 进度，不要求 Daily 每个动作标注 Theme。
- 学习 Theme 同时查看 roadmap 链接的笔记中与本次问题相关的新记录、疑问与阶段整理；空白骨架和提示不算学习成果，也不因段落为空判断阶段未完成。
- Theme 可以先输出一个 Wiki 页面、项目文档或实验结果，再继续保留其他未解决问题。
- 同一 Theme 的不同输出目标分别记录状态；不能因为一个目标完成就宣布整个事项结束或全部知识闭环。

## 不自动发生的转换

- Raw tag 不自动变成 Theme、Wiki topic 或目录。
- Task、反复工作或一般性的批量整理授权不自动产生 Theme；未确认的建议留在原记录。
- Insight 不自动变成任务。
- Theme 不自动变成 Plan；Period Plan 只引用被选中的 Theme。
- Task 完成不自动证明相关知识已经编译。
- Wiki 输出不自动关闭 Theme。
