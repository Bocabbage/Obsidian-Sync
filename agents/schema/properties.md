---
type: schema
schema: properties
updated: 2026-10-05
---

# Properties 规范

## 通用规则

- 新建的 Agent 总览与运行记录、Workspace、Wiki 和 Schema 页面在文件开头使用 YAML Properties。
- 新建编译页面的字段使用英文 `snake_case`；插件生成的 Raw 字段保持原样，不批量改写。
- 日期使用 `YYYY-MM-DD`，时间需要精确到分钟时使用 `YYYY-MM-DD HH:mm`。
- 外部 ID 使用字符串，避免前导零、超长数字或平台格式被 YAML 转换。
- Wikilink 作为 Property 值时加引号；多个链接使用 YAML 列表。
- 不为“可能以后有用”增加字段；只有参与筛选、校验、溯源或稳定显示的字段进入 Properties。

## Wiki 通用字段

```yaml
---
type: concept
title: 页面标题
domain: computer-science
topics: []
sources: []
created: 2026-08-25
updated: 2026-09-12
---
```

约束：

- `type` 必填，取值由 `page-types/` 定义。
- `title` 推荐填写稳定的人类可读标题，并与文件名保持语义一致。
- `domain` 对领域知识页必填；来源页和全局入口可以省略。
- `topics` 可选，使用列表。
- `sources` 对 concept、entity、synthesis 页面必填；没有来源时必须在正文标明是个人推断或待验证内容。
- `created` 首次建立后不改，`updated` 在实质内容变化时更新。

## 来源身份字段

编译后的来源页使用统一身份字段，不把不同平台的 ID 当作同一 ID：

```yaml
identifiers:
  isbn: "9787115576019"
  douban: "1234567"
  weread: "41779833"
raw_sources:
  - "实际存在的 Raw 文件 wikilink"
```

- `identifiers` 保存平台或标准标识符。
- `raw_sources` 只用于 `type: source` 页面，列出实际 Raw 文件。
- 示例中的说明文字必须替换成真实 wikilink，不保留虚构链接。
- 普通知识页的 `sources` 应优先链接编译来源页，而不是直接堆叠多个插件文件。

### Douban 目录与跨源覆盖

- Douban 目录视图直接读取 Raw 的 `doubanId`、`type`、`title`、`state`、`score`、`collectionDate` 等字段；这些插件字段不批量改名。
- `doubanId` 是目录锚点，必须按字符串比较；文件名和标题不是稳定 ID。
- ISBN 完全一致的 Douban–WeRead 关系可以由视图动态推导，不要求为每本书创建 source page。
- 只有无法自动推导或需要阻止自动匹配时才创建 `type: source-link` 页面。

## Agent 总览与运行记录

- Agent 总览 `agents/README.md`、会话索引 `agents/sessions/_Index.md`、草稿入口 `agents/drafts/README.md` 与 `agents/views/` 的 README 使用 `type: agent-index`，可保存 `updated`；它们是导航，不是会话或知识事实。
- `agents/views/overview/` 的首页与组件 Markdown 使用 `type: view`，`view` 标识组件用途，可保留 `cssclasses` 和 `updated`；不保存个人任务状态或工作事实。
- Agent 草稿使用 `type: draft` 与已有的标题、状态、创建和更新日期；暂定判断不因目录迁移获得已确认事实的身份。
- 会话继续使用 `type: session`、`status`、`started`、`updated`，迁移记录继续使用原有迁移类型与状态。迁移目录不改变具体会话的日期、状态或身份。
- 系统设计与历史运行记录不因移入 `agents/` 成为 Schema 现行契约；会话和迁移状态不得复制到 Wiki 页面。

## Workspace 字段

- Workspace 页面使用各自类型所需的最小字段，例如 `type`、`status`、`date`。
- 计划及其他个人工作状态的字段不得复制到 Wiki 页面。
- 不要求现有 Legacy 笔记立即补齐 Properties；字段迁移应随领域 compile 分批进行。

### Theme、Insight 与 Period Plan

- Theme 使用 `type: theme` 和 `status: seed|active|paused|closed`，可选 `next_review`；适用于用户设立的持续方向或阶段性事项。
- Theme 的 `materials` 是正式关联 Raw 的链接列表，值为带引号、指向实际文件的完整 Vault 路径 wikilink；支持 N:N，同一文件不重复列入，新模板默认 `[]`，旧页缺少时按空列表理解。材料说明与成果链接继续保存在正文；不向 Raw 反写 Theme 归属，也不把主题标签当作实体关联。
- 月度 Insight 文件使用 `type: insight-log`、`period: YYYY-MM` 和 `status: active|closed`，单条 Insight 不单独建立页面或 ID。
- 周/月/季度计划统一使用 `type: period-plan`，以 `period_type`、`period`、`starts`、`ends` 和可选 `next_review` 描述周期。

### Learning Note

```yaml
---
type: learning-note
title: 学习笔记标题
themes: []
created: YYYY-MM-DD
updated: YYYY-MM-DD
---
```

- 最小字段为 `type`、`title`、`themes`、`created`、`updated`。实际生成时 `themes` 填入用户已确认的 Theme，每项为带引号、指向实际文件的完整 Vault 路径 wikilink；不只保存标题或标签。
- `created` 首次建立后不改，`updated` 在正文、阶段结构或关系有实质变化时更新；无变化的重复生成不刷新日期。
- 阶段标题和记录入口留在正文，不另设进度、完成数或阶段 ID 字段。链接只表示关联，不表示开始学习、阶段完成或 Theme 已激活。
- 路径与正文结构见 [[agents/schema/page-types/learning-note|Learning Note]]。

### Reading Note 与 Viewing Note

- `reading-note` 和 `viewing-note` 都是按需页面，不作为媒体目录。
- `catalog_source` 链接 Douban Raw，`douban_id` 保存相同条目的稳定平台 ID。
- `weread_source` 只用于 Reading Note，并链接实际 WeRead Raw。
- `rating` 始终表示用户评分，采用 `0`～`10` 数值；平台评分继续保留在 Douban Raw 的 `score`。
- Reading Note 的 `medium` 可取 `weread`、`print`、`other` 或 `unknown`；不得仅凭没有 WeRead 文件就推断为纸质书。

### Task Entity

```yaml
---
type: task
task_id: TASK-202608-001
title: 示例任务
status: active
priority: normal
created: 2026-08-28
updated: 2026-09-12
due:
dida_urls: []
themes: []
---
```

- `task_id` 是 Vault 内部身份，必须与文件名一致并且永不复用。
- `status` 取值为 `inbox`、`active`、`blocked`、`done` 或 `cancelled`；`priority` 取值为 `high`、`normal` 或 `low`。
- `due`、`closed` 和 `dida_urls` 均为可选字段；URL 列表允许父/子任务、多来源和共享来源，不覆盖本地身份或状态。
- `themes` 可选，只保存用户已设立的稳定 Theme wikilink；允许多对多或为空，临时上下文继续留在正文。关联不等于活动或工时的独占归属。
- DIDA URL 不要求跨本地 Task 唯一，不用于归并 Task。旧单值字段继续兼容，与 `dida_urls` 不混写；专注按本地 Task 合并、按记录去重，并按 Daily 日期保存归属。
- 完整生命周期与 occurrence 语法见 [[agents/schema/page-types/task|Task Entity]]。

### Todo Log

```yaml
---
type: todo-log
period: 2026-09
created: 2026-09-18
updated: 2026-09-18
---
```

- `period` 必须为 `YYYY-MM` 并与文件名一致，只表示记录月份，不是截止月份。
- 单条 Todo 不增加 YAML、独立页面或 Task ID；录入日期 `➕`、完成日期 `✅`、取消/转 Task 日期 `[closed:: YYYY-MM-DD]` 与状态保存在 Checkbox 原行。局部 block ID 用于稳定回链，Daily 历史由日期回看和复盘快照保存。
- 完整边界见 [[agents/schema/page-types/todo-log|Todo Log]]。

### Daily

```yaml
---
type: daily
date: 2026-08-25
status: open
---
```

- `date` 必须为 `YYYY-MM-DD`，并与 `YYYY-MM-DD.daily.md` 文件名一致。
- `status` 取值为 `open` 或 `closed`，只表示是否已完成 `/daily-review`。
- 任务完成数、专注时长、番茄数等派生统计不得写入 YAML；它们保留在正文生成区或查询视图中。
