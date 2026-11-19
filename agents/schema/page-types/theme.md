---
type: schema
schema: page-type
page_type: theme
updated: 2026-10-05
---

# Theme

Theme 是用户主动设立、值得独立规划和回看的方向或阶段性事项，保存目的、范围、推进路线和结果，并指导相关 Task。它可以是跨季度的学习方向，也可以是一次旅行等有明确结束点的事项；它不是 Raw、项目分类或任务的自动上级，也不代表内容已经编译为 Wiki。

## 创建与选择权

- 用户明确提出需要独立规划的方向或阶段性事项，或接受 Agent 的具体建页建议后，才可建立 Theme；不要求用户使用“Theme”术语。
- 多条相关线索只触发建议，不触发建页；一般性的整理、迁移或自主执行授权不等于确认新 Theme。
- 未确认的建议留在原 Daily 的小零碎、原记录或 Review 中，不新建候选实体；seed 也不能绕过确认。
- 用户选择开始投入、暂停或结束关注时才调整状态；Task 正在执行、反复出现或 Plan 草案引用都不能自动激活 Theme。

## 路径与粒度

~~~text
workspace/themes/<稳定的人类可读标题>.md
~~~

- 一页应能在一次 Review 中作为同一个话题讨论，例如“Redis 在实际系统中的行为”或“一次秋季旅行”，而不是整个“计算机科学”或所有生活事务。
- Theme 保存整体目的、路线和取舍，Task 保存具体执行事项；简单事项可以只使用 Task 或 Todo，不因进入季度安排就自动新建 Theme。
- 初期允许标题较宽；当问题、投入方向或输出开始明显分叉时再拆 Theme。
- 不因为建立 Theme 就创建对应 Wiki 目录；Wiki 页面自然形成稳定集合后再调整领域结构。

## Properties

~~~yaml
---
type: theme
title:
status: seed
created: YYYY-MM-DD
updated: YYYY-MM-DD
next_review:
materials: []
---
~~~

- status 取值为 seed、active、paused 或 closed。
- seed 表示用户已认可方向或事项但仍在探索；active 表示用户已选择投入；paused 和 closed 分别表示暂停与结束关注。阶段性事项收尾后，可由用户确认关闭；季度结束不自动关闭 Theme。
- next_review 可选，只在确实需要提醒重新判断时填写。
- materials 使用列表保存明确关联的 Raw 材料，每项为带引号、指向实际文件的完整 Vault 路径 wikilink；不重复列入同一文件。新页默认 `[]`，旧页缺少字段时按空列表理解。

## 与 Raw 材料的关系

- `materials` 是 Theme–Raw 正式关联的统一入口，支持 N:N：一个 Theme 可关联多份 Raw，同一份 Raw 可服务多个 Theme；未关联 Theme 的 Raw 可以继续只保留标签。
- 关系只维护在 Theme 一侧，不在 Raw 写入 Theme 字段或标签。Obsidian 将属性中的 wikilink 作为内部链接，Raw 可通过原生反向链接找到引用它的 Theme。
- 正文保留材料的用途、阶段和上下文说明，已有链接不必删除；正式材料集合从 `materials` 读取，普通正文提及不自动成为正式关联。
- 捕获或整理时，已明确服务某个既有 Theme 的材料应同步加入其 `materials`；先确认文件存在、检查重复，再写入关系。只有标签相同或内容可能相关时，保留为候选，不自动关联或新建 Theme。
- 关联不表示材料已核验、阶段完成或 Theme 已激活；正文、标签和学习状态仍遵守对应来源的所有权规则。不为建立关联提前创建 Wiki 来源页或中间关系页。

## 学习类 Theme 与学习记录

- 用户明确创建学习类 Theme 并确认 roadmap 后，按 [[agents/schema/workflows/learning|学习记录工作流]] 同次生成 `workspace/learning/` 主学习笔记；仅讨论或读取不触发生成。初期每个 Theme 一份主笔记，内容明显增多后再按需拆页。
- 学习笔记使用 [[agents/schema/page-types/learning-note|Learning Note]] 的 `themes` 列表回链。Theme 的 roadmap 增加“记录入口”，以完整 Vault 路径链接笔记中同名的阶段二级标题，正文可链接整份笔记。
- `materials` 只关联实际 Raw 文件，不列入个人学习笔记、Wiki 成果或外部 Zotero URL。外部资料链接及其用途留在正文。
- 骨架、阶段入口和整理提示不表示已经开始或完成学习，也不自动激活 Theme。维护路线时复用笔记、补齐缺失阶段并修复引用，已有学习内容完整保留。

## 正文：面向人的方向笔记

- 标题下直接用一小段话说明为什么想做、希望获得什么，不单独设置动机表单，也不把 Agent 推断写成用户目标。
- `Roadmap`：按需用表格保存阶段、重点、行动和预期结果；学习、旅行等事项可按需要调整列，已有路线保留。没有路线就留空，不替用户编造，不强制状态、日期或 Task 列，也不要求阶段逐一建 Task。
- `最近在关注`：保存当前问题、思考和下一步，按需链接周期安排。
- `Tasks`：位于“最近在关注”与“积累”之间，用普通 wikilink 列表连接任务对象，每项附一句它如何服务这个方向；无关联任务时留空，不使用表格或 Dataview，也不复制状态、优先级和每日进度。
- `积累`：保存值得重读的发现、暂定理解、实践结果和来源/知识链接；只有内容需要时才自然增加小标题。尚未验证的建议和已取得成果应区分清楚。
- 只在真正改变理解或方向时留下日期和简短说明，不强制 Review Log 或每轮流水账。来源链保留，但不要求独立的“观察与线索”栏目。
- 创建权限、关系同步和复盘步骤属于 Schema / Skill，不塞入模板正文或 HTML 指令注释；状态和日期留在 Properties。

Theme 的结果可以是理解、行程、实践记录或其他成果，不要求都产出 Wiki 页面。是否关闭由用户根据是否仍需推进或维护决定，不由“是否已经编译过一次”决定。

## 与 Task 和日常材料的关系

- 一个 Theme 可指导多个 Task，一个 Task 可服务多个 Theme，也允许无 Theme 的独立 Task；不为配对而拆分或新建任务。
- 稳定关系保存在 Task 的 `themes`，Theme 正文说明任务如何服务阶段方向；建立关系时同步两端，不复制任务状态。
- Daily 不要求动作级 Theme 标签；Review 仅把相关发现、问题变化和成果回链到已有 Theme，不自动汇入 Task 的全部活动或时长。
- 外部来源按各自来源契约保存，也可在正文引用 Zotero 等外部资料；个人过程留 Daily、Learning Note 或 Workspace 草稿。成熟的局部认识可逐步 compile 到 Wiki，不必等整个 Theme 完成。
