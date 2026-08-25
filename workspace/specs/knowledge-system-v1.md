---
type: implementation-spec
status: agreed
implementation_status: not-started
version: 1
created: 2026-08-25
updated: 2026-08-25
---

# Knowledge System v1

## 1. 目的

在现有 Raw、Workspace、Wiki、Schema 所有权边界上，依次建立：

1. 可持续使用的 Daily 工作循环。
2. Douban 与 WeRead 的书籍身份、链接和封面字段规范。
3. `legacy-读书/` 与 `legacy-电影/` 的可验证迁移流程。
4. 基于稳定 Properties 的书籍与影视卡片。
5. 汇聚 Daily、来源新增、阅读观看状态和 Wiki 更新的 Canvas 首页。

本 Spec 固化目标、顺序、边界和待确认决策；它不表示这些功能已经实现。

## 2. 不变边界

- `raws/Douban/`、`raws/WeRead/` 和根 `assets/` 仍由插件维护，默认只读。
- Douban 与 WeRead Raw 不直接互相写链接，跨来源关系由 `wiki/sources/` 承担。
- Workspace 保存个人状态和过程，Wiki 保存长期可复用知识。
- Bases、Dataview、Minimal 卡片和 Canvas 都是视图，不成为唯一数据源。
- Legacy 迁移采用小批次、可核验方式；完成验收前不删除原文件或附件。
- 当前已生效规则仍以根 `AGENTS.md` 与 `schema/` 为准。

## 3. 实施顺序

```text
Daily v2
  → 来源身份与目标对象模型
  → Legacy 小样本试迁移
  → 卡片视图
  → Legacy 批量迁移
  → Canvas 首页
```

后一个阶段依赖前一个阶段提供的真实字段和路径；除小样本验证外，不并行建设依赖尚未稳定的数据视图。

## 4. Phase 1：Daily v2

### 目标

同一份每日记录覆盖晨间计划、日间捕获和晚间复盘，并能把值得长期保留的内容标记为 Wiki 编译候选。

### 推荐结构

```text
workspace/daily/{年份}/YYYY-MM/YYYY-MM-DD.daily.md
```

Daily 不再只是 `workspace/plans/` 下的任务表，而是一类独立的 Workspace 工作记录。

### 页面内容

- Morning：今日重点、预期成果、任务及关联季度目标。
- During：临时记录、决策、阻塞和产生的材料。
- Evening：完成情况、偏差原因、收获和未完成事项。
- Knowledge Candidates：值得后续 compile 的概念、来源或问题。
- Tomorrow：需要明确延续到下一天的事项。

### 数据约束

- 行动项使用标准 Markdown task，允许 Dataview `TASK` 或 Tasks 汇总。
- YAML 只保存日期、页面类型、状态等稳定字段，不保存会频繁变化的总结统计。
- Knowledge Candidate 只是候选，不因写入 Daily 自动成为 Wiki 事实。
- 晨间和晚间更新同一文件，不分别建立 morning/review 文件。

### 需要提升到 Schema 的内容

- 新增 Daily page type、模板和 workflow。
- 更新 Workspace 路由与 Properties 规范。
- 重写 `daily` Skill 的路径、交互和晚间复盘规则。
- 建立 Daily 总览，为后续 Canvas 提供稳定入口。

### 验收

- 连续完成至少一次晨间创建和晚间复盘。
- 未完成任务能够被查询，但不会被无提示复制到下一天。
- Knowledge Candidates 能够被单独汇总和人工选择 compile。

## 5. Phase 2：Douban / WeRead 身份与目标模型

### 目标

用编译来源页表示一个可辨识的书籍版本，并把平台元数据、个人阅读状态和知识分析分开。

### 关系

```text
raws/Douban/book/... ─┐
                      ├→ wiki/sources/.../某本书.md
raws/WeRead/... ──────┘

个人阅读状态 ─────────→ Workspace 阅读记录
作者与主题分析 ───────→ Wiki entity / concept / synthesis
```

### 身份规则

- ISBN 完全一致时可以自动形成同版本候选，仍需检查明显异常。
- ISBN 不同但标题、作者一致时只建立相关版本关系，不自动合并。
- 没有 ISBN 时使用标题、作者、出版社和年份生成候选，并要求复核。
- 只凭标题相似不得自动合并。
- Douban ID 与 WeRead bookId 分字段保存，不能相互替代。
- 跨版本讨论通过作品实体页表达，不把所有版本强行合并为一页。

### 卡片所需的最小稳定字段

- `type`
- `source_type`
- `title`
- `creators`
- `cover`
- `identifiers`
- `raw_sources`
- `identity_status`
- `created`
- `updated`

个人评分、阅读进度、想读/在读/已读不进入来源页的稳定元数据，进入 Workspace 阅读记录。

### 需要提升到 Schema 的内容

- 扩展 source page type 和 Properties 字段契约。
- 补充书籍版本、作品实体和人工确认状态。
- 为 `cover` 定义本地路径、外部 URL、缺失值和插件覆盖规则。
- 定义 Workspace 阅读记录；影视观看记录在 Legacy 试点时按同一原则单独定型。

### 验收

- 至少验证仅 Douban、仅 WeRead、两者匹配、不同版本和疑似冲突五类样本。
- 每个合并决定都可回溯到 Raw 文件和匹配依据。
- Raw 文件没有被加入人工维护字段或跨来源反向链接。

## 6. Phase 3：Legacy 小样本试迁移

### 范围

- 先选 3～5 本书，覆盖 Douban、WeRead、双来源、作者分析和个人读书内容。
- 再选 3～5 个影视对象，覆盖电影、剧集、导演分析和个人观影内容。
- 读书优先，因为它能同时验证双来源身份和个人状态拆分。

### 拆分目标

| Legacy 内容 | 目标 |
|---|---|
| 平台原始元数据 | 保留或链接 Raw |
| 书籍、电影、剧集对象 | `wiki/sources/` |
| 阅读、观影状态与体验 | Workspace 对象记录 |
| 作者、导演、主题分析 | Wiki entity/concept/synthesis |
| 卡片与列表 | 派生视图 |
| 封面与旧附件 | 按所有权逐项决定，不批量搬运 |

### 验收

- 小样本中的路径、字段、wikilink 和附件可正常使用。
- 同一事实没有在 Raw、Workspace 和 Wiki 中产生多个手工事实源。
- 试迁移发现的问题先回写 Spec，再修改 Schema。
- 原 Legacy 内容保留到新结构通过检查为止。

## 7. Phase 4：卡片视图

### 视图分层

- Raw Inbox：最近同步的 Douban / WeRead 条目，用于发现新增来源。
- Compiled Library：规范化后的书籍、电影和剧集来源页。
- Personal Activity：想读、在读、已读、想看、看过等 Workspace 状态。

### 实现原则

- 优先使用已启用的 Obsidian Bases 构建 Property 卡片和筛选。
- Dataview 只承担 Bases 不便表达的复杂查询、统计和任务汇总。
- Minimal/CSS 只负责封面比例、卡片密度和布局，不修补缺失数据。
- 卡片字段以小样本验证后的正式 Schema 为准，不直接绑定偶然的插件模板字段。

### 验收

- 删除视图不会丢失任何书籍、影视或个人状态数据。
- 缺封面、身份待确认和缺个人状态的对象可以被筛选出来。
- 卡片可以作为后续批量迁移的质量检查入口。

## 8. Phase 5：Legacy 批量迁移

- 按小样本确认的映射逐批处理 `legacy-读书/`，再处理 `legacy-电影/`。
- 每批记录文件数、目标、异常和检查结果。
- 同步更新导航、Skills、旧 Dataview 查询和附件引用。
- 全部迁移且 lint 通过后，另行取得用户确认再决定删除、归档或保留旧目录。
- 读书迁移完成后，将 `reading-maintenance` 从迁移保护 Skill 重写为正式维护 Skill。

## 9. Phase 6：Canvas 首页

### 位置与职责

推荐放置于：

```text
workspace/overview.canvas
```

Canvas 只负责布局、入口和状态概览，不直接保存任务、书目或知识事实。

### 第一版区域

- 今天的 Daily 与未完成任务。
- 最近新增的 Douban / WeRead Raw。
- 当前阅读、最近阅读、最近观看。
- 最近编译或更新的 Wiki 页面。
- Legacy 迁移进度。
- Workspace、Sources 和各 Wiki 领域入口。

动态内容由 Markdown、Bases 或 Dataview 页面提供，Canvas 负责引用或打开这些页面。

### 启动方式

本地已经启用 Canvas、Workspaces、Daily Notes 和 Bases。正式实施时二选一：

1. 使用核心 Workspaces 和 Obsidian 的状态恢复。
2. 经用户确认后安装专门的 Homepage 插件，将 Canvas 或首页笔记设置为启动页。

不通过手工改写 `.obsidian/workspace*.json` 实现首页。

## 10. 开工前必须确认

### Phase 1 前

- Daily 正式路径是否采用 `workspace/daily/`，替代当前 `workspace/plans/.../daily/`。
- 行动项是否统一使用 Markdown task；表格只做摘要，不作为任务事实源。
- 未完成任务采用查询汇总还是人工显式迁移；默认不自动复制。
- Knowledge Candidates 是否必须人工确认后才能 compile；建议是。

### Phase 2 前

- `wiki/sources/` 是否按 `books/`、`movies/`、`series/` 分目录。
- Workspace 阅读和观影记录采用何种目录名与最小字段。
- 卡片 `cover` 使用插件缓存路径、外部 URL，还是建立规范附件；建议优先引用现有缓存，不复制。
- 人工确认身份冲突时使用 Property、迁移清单还是两者结合。

### Legacy 批量迁移前

- 原文件完成验收后的处置方式：删除、移入 Archived 或保留一段观察期。
- 是否保留旧文件名作为 alias，以及哪些旧入口需要兼容跳转页。
- 附件去重和无引用附件的处理方式。

### Canvas 前

- Canvas 主要面向工作日启动还是全知识库导航。
- 首页采用核心 Workspaces 还是安装 Homepage 插件。
- “最近新增”的时间窗口和各区域默认显示数量。

## 11. Schema 提升规则

- 本 Spec 不直接修改当前 Schema 的行为语义。
- 每个 Phase 开始时，只把该 Phase 已确认的 page type、Properties、workflow 和模板提升到 `schema/`。
- 提升时同步更新根/局部 `AGENTS.md`、相关 Skills、视图和 lint 规则。
- Phase 验收后更新本文件的实施状态和决策记录；未实现部分继续留在 Spec，不提前写成强制规则。
