---
type: schema
schema: properties
updated: 2026-08-26
---

# Properties 规范

## 通用规则

- 新建的 Workspace、Wiki 和 Schema 页面在文件开头使用 YAML Properties。
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
updated: 2026-08-25
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

## Workspace 字段

- Workspace 页面使用各自类型所需的最小字段，例如 `type`、`status`、`date`。
- 会话、计划和迁移状态的字段不得复制到 Wiki 页面。
- 不要求现有 Legacy 笔记立即补齐 Properties；字段迁移应随领域 compile 分批进行。

### Reading Note 与 Viewing Note

- `reading-note` 和 `viewing-note` 都是按需页面，不作为媒体目录。
- `catalog_source` 链接 Douban Raw，`douban_id` 保存相同条目的稳定平台 ID。
- `weread_source` 只用于 Reading Note，并链接实际 WeRead Raw。
- `rating` 始终表示用户评分，采用 `0`～`10` 数值；平台评分继续保留在 Douban Raw 的 `score`。
- Reading Note 的 `medium` 可取 `weread`、`print`、`other` 或 `unknown`；不得仅凭没有 WeRead 文件就推断为纸质书。

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
