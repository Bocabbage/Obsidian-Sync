---
type: implementation-spec
status: agreed
implementation_status: in-progress
phase_1_status: complete
phase_2_status: complete
phase_3_status: complete
phase_4_status: complete
phase_5_status: complete
version: 1
created: 2026-08-25
updated: 2026-08-26
---

# Knowledge System v1

## 1. 目的

在现有 Raw、Workspace、Wiki、Schema 所有权边界上，依次建立：

1. 可持续使用的 Daily 工作循环。
2. 以 Douban Raw 为唯一媒体目录，并将 WeRead、人工阅读和观影内容作为分支连接。
3. `legacy-读书/` 与 `legacy-电影/` 的可验证拆分和退役。
4. 直接消费 Raw 与稳定人工字段的书籍、电影和剧集卡片。
5. 汇聚 Daily、来源新增、阅读观看状态和 Wiki 更新的 Canvas 首页。

本 Spec 固化目标、顺序、边界和决策；各 Phase 是否已经实现以文件头状态和对应验收记录为准。

## 2. 不变边界

- `raws/Douban/`、`raws/WeRead/` 和根 `assets/` 仍由插件维护，默认只读。
- Douban 与 WeRead Raw 不直接互相写链接；精确 ISBN 关系由目录视图推导，例外关系由 `wiki/sources/link-overrides/` 承担。
- Workspace 保存个人状态和过程，Wiki 保存长期可复用知识。
- Bases、Dataview、Minimal 卡片和 Canvas 都是视图，不成为唯一数据源。
- Legacy 迁移采用小批次、可核验方式；完成验收前不删除原文件或附件。
- 当前已生效规则仍以根 `AGENTS.md` 与 `schema/` 为准。

## 3. 实施顺序

```text
Daily v2
  → Douban 唯一目录与分支模型
  → Legacy 验证与拆分
  → Douban 卡片视图
  → Legacy 退役
  → Canvas 首页
```

后一个阶段依赖前一个阶段提供的真实字段和路径。实际实施时，Phase 2 审计发现两个 Root Legacy 目录规模有限，因此在同一轮内连续完成 Phase 2～5，并在每个内部检查点后再进入下一步。

## 4. Phase 1：Daily v2

### 目标

同一份每日记录覆盖晨间计划、日间捕获和晚间复盘，并能把值得长期保留的内容标记为 Wiki 编译候选。

### 推荐结构

```text
workspace/daily/{年份}/YYYY-MM/YYYY-MM-DD.daily.md
```

Daily 不再只是 `workspace/plans/` 下的任务表，而是一类独立的 Workspace 工作记录。

### 页面内容

- Morning：大任务、小任务，以及用户按需手工加入的 DIDA 任务链接；DIDA 不是唯一来源。
- During：直接更新当天任务切片的 Checkbox；任务相关进展写在任务下，独立产出写入“产生的材料”，不建立单独的“过程中”栏目。
- Evening：`/daily-review` 只为大任务、小任务中已关联的 DIDA 任务生成当天番茄钟与正计时，并保留人工收尾。
- Knowledge Candidates：值得后续 compile 的概念、来源或问题。
- 未闭环：通过查询显示旧 Daily 中的未完成切片，默认不复制到下一天。

### 数据约束

- 行动项使用标准 Markdown task，允许 Dataview `TASK` 或 Tasks 汇总。
- YAML 只保存日期、页面类型、状态等稳定字段，不保存会频繁变化的总结统计。
- Knowledge Candidate 只是候选，不因写入 Daily 自动成为 Wiki 事实。
- 晨间和晚间更新同一文件，不分别建立 morning/review 文件。
- Daily Checkbox 表示当天计划完成的切片，不表示 DIDA 整体任务状态；DIDA 状态不得自动覆盖 Checkbox。
- DIDA 链接由用户手工加入大任务或小任务；`/daily-review` 只读 focus 明细，使用 `tasks[].taskId` 匹配并按实际毫秒时长换算。

### 已提升到 Schema 的内容

- [[schema/page-types/daily|Daily page type]]、[[schema/templates/daily-template|模板]]和 [[schema/workflows/daily|workflow]]。
- Workspace 路由、Properties 与视图规范。
- `.agents` / `.claude` 同步的 `daily` Skill 及只读 DIDA focus 聚合脚本。
- `workspace/daily/index.md` 总览，为后续 Canvas 提供稳定入口。

### 验收

- 已验证：`workspace/daily/2026/2026-08/2026-08-25.daily.md` 按正式模板创建，并由晚间 focus 聚合生成区刷新为 `closed`。
- 已验证：未完成的大任务、小任务由 Dataview `TASK` 查询，模板和 Skill 均不自动复制任务。
- 已验证：Knowledge Candidates 在 Daily 总览中单独汇总，compile 仍要求用户明确选择。
- 已验证：测试 DIDA 任务当天聚合为 9 个番茄、3h45m；结果与独立 CLI/JQ 聚合的 9 条记录、13500000 毫秒一致。

## 5. Phase 2：Douban / WeRead 身份与目标模型

### 目标

以 Douban Raw 作为书籍、电影和剧集的唯一目录，不为每个条目复制 compiled source page；把平台元数据、个人阅读过程和长期知识分析分开。

### 关系

```text
Douban 书籍 Raw（目录锚点）
  ├─ ISBN 精确匹配 / 人工覆盖 ─→ WeRead Raw
  └─ 按需 ────────────────────→ Workspace Reading Note

Douban 电影 / 剧集 Raw（目录锚点）
  ├─ 按需 ────────────────────→ Workspace Viewing Note
  └─ compile ─────────────────→ Cinema entity / concept / synthesis
```

只有 WeRead、尚无 Douban 条目的版本继续保留在 Raw，并通过维护审计发现；它不自动形成第二套正式书目。

### 身份规则

- ISBN 完全一致且没有人工覆盖时自动形成同版本链接。
- ISBN 相同但出版社、出版日期等存在明显异常时，人工覆盖为 `conflict`，候选链接仍可显示但必须待复核。
- ISBN 不同但标题、作者一致时只建立 `same_work` 相关版本关系，不自动合并。
- 没有 ISBN 时使用标题、作者、出版社和年份生成候选，并要求复核。
- 只凭标题相似不得自动合并。
- Douban ID 与 WeRead bookId 分字段保存，不能相互替代。
- Douban 条目是导航锚点，不强制等同于抽象作品实体；跨版本讨论确有需要时再建立作品实体页。

### 稳定字段与页面

- 目录直接读取 Douban Raw 的 `doubanId`、`type`、`title`、`state`、`score`、`collectionDate`、作者/导演等插件字段。
- `source-link` 只保存 `douban_id`、实际 Raw 链接、`relation`、`identity_status` 和证据，不复制书籍元数据。
- Reading Note 保存人工内容、阅读媒介、个人状态和评分；Viewing Note 保存个人观看日期、评分和评论。
- 作者、导演和主题分析经过 compile 后进入 Wiki entity / concept / synthesis。

### 封面策略

- 根 `assets/` 继续由 Douban 插件维护，目录优先只读解析同名 JPG / WebP / PNG；命名不一致时使用 Raw 正文中的插件封面路径回退，链接失效时只接受唯一的文件名前缀候选。
- 不复制 Legacy 封面，不把根 `assets/` 改成共享附件目录。
- Reading Note 过程附件进入 `workspace/_assets/reading/`；Cinema 长期知识附件进入 `wiki/_assets/cinema/`。

### 已提升到 Schema 的内容

- `schema/workflows/media-catalog.md`。
- `schema/page-types/reading-note.md`、`viewing-note.md` 和 `source-link.md`。
- Douban、WeRead、identity resolution、Properties、linking 和 views 契约。
- `reading-maintenance` 正式维护 Skill。

### 验收

- 已审计 94 个 Douban 书籍、56 个 WeRead 书籍；36 个 ISBN 精确匹配，平台 ID 与 ISBN 均无重复。
- 已验证：仅 Douban `两条鳄鱼`、仅 WeRead `逻辑学导论（第15版）`、精确匹配 `十一个时区之旅`、相关版本 `活着回来的男人`、冲突候选 `洛丽塔`。
- 每个人工关系均链接实际 Raw 并记录证据；Raw 没有加入人工字段或跨来源反向链接。
- 完整审计见 `workspace/migrations/round-2-media-catalog.md`。

## 6. Phase 3：Legacy 验证与拆分

两个 Root Legacy 目录合计只有 41 个文件，审计后在一个可核验批次内完成全部拆分，不再保留“试点后等待批量”的中间态。

### 实际拆分

| Legacy 内容 | 目标 |
|---|---|
| 平台原始元数据 | 保留或链接 Raw |
| 书籍、电影、剧集目录 | Douban Raw + `wiki/sources/*/index.md` 派生视图 |
| 阅读、观影状态与体验 | Workspace Reading / Viewing Note |
| 作者、导演、主题分析 | 有实际内容者进入 Wiki 或相关 Reading Note；空壳不迁移 |
| 卡片、列表与旧模板 | 由新 Schema 与 DataviewJS 视图替代 |
| 封面 | 使用根 `assets/` 插件缓存，Legacy 重复图不迁移 |
| 过程图与知识图 | 分别进入 Workspace / Wiki 附件目录 |

### 验收

- 5 份 Reading Note 保留人工内容，其中 `涅朵奇卡` 只保存 WeRead 当前缺失的一句补遗。
- 1 份 Viewing Note 保留 Legacy 评分并明确语义待确认；空壳观影页和 AI 演示不迁移。
- `摄影`、`场面调度`、`剪辑`、`小津安二郎` 及 2 张思维导图进入 Cinema Wiki。
- 新页面 YAML、wikilink 和附件引用通过检查后，才执行 Legacy 退役。

## 7. Phase 4：卡片视图

### 实现

- `wiki/sources/books/index.md`、`movies/index.md` 和 `series/index.md` 是稳定入口。
- `wiki/sources/_views/douban-catalog/` 使用 DataviewJS 跨目录连接 Douban、WeRead、人工覆盖和 Workspace Note；这是 Bases 当前不便表达的关系查询。
- 支持标题/作者/导演搜索，Douban 状态、关联分支和冲突筛选，以及最近记录、标题和平台评分排序。
- 卡片分别显示 Douban 平台评分、WeRead 状态、人工媒介/状态和个人评分；可跳转本地 Raw、豆瓣网页、WeRead Raw、`weread://` 与人工笔记。
- 视图按 Raw 文件名解析根 `assets/` 的实际扩展名，适配书籍 JPG 与电影/剧集 WebP；对 1 个 Raw 与封面命名不一致且插件链接失效的样本，采用唯一文件名前缀候选。

### 验收

- 视图代码通过 JavaScript 语法检查，入口路径与 Dataview `dv.view` 加载规则一致。
- 删除视图不会丢失任何来源、关系覆盖或个人笔记事实。
- 自动匹配、相关版本、冲突和人工分支均可在卡片中区分。

## 8. Phase 5：Legacy 批量迁移

- 已按 Phase 3 映射完整处理 `legacy-读书/` 与 `legacy-电影/`。
- 4 个有效过程附件先迁移到新位置；其余重复封面随旧目录快照保留。
- 验收通过后，两个旧目录剩余 37 个文件移动到 `.trash/knowledge-system-v1-2026-08-26/`，没有永久删除，可按原目录整体恢复。
- 旧 Dataview 卡片、模板、空壳作者/导演页和 AI 演示不进入新结构。
- `reading-maintenance` 已从迁移保护 Skill 重写为正式目录维护 Skill。

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

- 已确认：Daily 正式采用 `workspace/daily/`，不迁移或改写旧计划。
- 已确认：行动项使用 Markdown task，表格不作为任务事实源。
- 已确认：未完成任务通过查询显示；当天继续时由用户重新描述切片或再次引用，默认不自动复制。
- 已确认：Knowledge Candidates 必须由用户明确选择后才能 compile。
- 已确认：保留大任务、小任务；DIDA 链接由用户早上按需手工加入，晚间只生成关联任务当天的专注计时。

### Phase 2 前

- 已确认：`wiki/sources/` 按 `books/`、`movies/`、`series/` 提供目录入口，不批量建立对象页。
- 已确认：Reading Note 使用 `workspace/reading/books/`；Viewing Note 使用 `workspace/viewing/movies/` 或 `series/`。
- 已确认：卡片只读使用 Douban 插件的根 `assets/` 缓存，不复制封面。
- 已确认：人工身份关系使用 `source-link` Property；迁移清单记录批次与验收证据。

### Legacy 批量迁移前

- 已确认：验收后的旧目录移入可恢复 `.trash` 快照，不保留旧入口跳转页。
- 已确认：重复封面不迁移；有实际引用价值的过程图和思维导图迁入所属层附件目录。
- 已确认：Raw、附件缓存、普通 Workspace / Wiki 正文继续由 OneDrive 管理，Git 只跟踪可复现 Schema、Skill、入口和视图代码。

### Canvas 前

- Canvas 主要面向工作日启动还是全知识库导航。
- 首页采用核心 Workspaces 还是安装 Homepage 插件。
- “最近新增”的时间窗口和各区域默认显示数量。

## 11. Schema 提升规则

- 本 Spec 不直接修改当前 Schema 的行为语义。
- 每个 Phase 开始时，只把该 Phase 已确认的 page type、Properties、workflow 和模板提升到 `schema/`。
- 提升时同步更新根/局部 `AGENTS.md`、相关 Skills、视图和 lint 规则。
- Phase 验收后更新本文件的实施状态和决策记录；未实现部分继续留在 Spec，不提前写成强制规则。
