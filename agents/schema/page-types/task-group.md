---
type: schema
schema: page-type
page_type: task-group
updated: 2026-10-21
---

# Task Group

关注组保存一个周期内重点关注的 Task 集合，例如季度 LIFE 或工作版本迭代。多个组可以同时开放，周期不必一致。Group 不替代 Theme 的目标与路线，也不替代 Daily 的当天安排。

## 存储与字段

组记录在 `workspace/task-groups/GROUP-{YYYYMMDD}-{唯一后缀}.md`；插件用 UUID 后缀避免重名。文件名作为稳定身份，不随名称修改。索引为 `workspace/task-groups/_Index.md`。

```yaml
---
type: task-group
title: 2026 Q4 · LIFE
status: open
created: "2026-10-21"
updated: "2026-10-21"
start: "2026-10-01"
end: "2026-12-31"
tasks:
  - "[[workspace/tasks/TASK-202610-001]]"
---
```

- `title` 必填，`status` 为 `open` / `closed`；`created`、`start` 为有效日期字符串。创建日期记录真实录入日，开始日期可以表示已开始的季度，但不据此回填之前 Daily。
- `end` 可空，只表示预计结束日期，到期提示但不自动关闭。
- `tasks` 为完整 Task wikilink 列表，允许空列表，同一组成员去重。一个 Task 可以被多个组引用，也可以完全不分组。
- 关闭组同时写 `status: closed` 和 `closed: YYYY-MM-DD`，保留名称、周期、全部成员和正文；关闭不完成、取消、暂停或移动 Task。已关闭组不通过管理界面编辑或重新开放；后续周期新建组并引用原 Task。
- 组成员引用 Task 本体，不引用明细 block，不复制 Task、DIDA 映射或状态。创建/编辑/关闭由用户决定，Agent 不按 Theme、标签或任务优先级自动圈选成员。
- 记录只有 Markdown 是事实来源；具体组与每日快照由 OneDrive 管理，不进入 Git。

## Daily 展示与执行

`agents/views/overview/_views/task-pool` 读取当前组，在今日开放 Daily 展示 `created <= date`、`start <= date` 且 `status: open` 的组。组内按既有任务池的创建/闭环日期筛选未闭环 Task；其余组成员仍有折叠链接可查。

- 当前组默认展开；“全部任务”包含所有符合原日期筛选的 Task，默认折叠。有零个当前组时，全量池默认展开，不设条目上限。
- 组内沿用 Task 全局优先级排序；任务状态列仍标为“当前状态”，不冒充历史状态。
- Group 只影响候选展示。未分组、已关闭组内或尚未开始组内的 Task 都能手动安排进 Daily；Task Todo 自动续入、复盘、DIDA 统计不以组为筛选条件。
- 今日提供创建、编辑、关闭入口，管理索引展示全部开放/未来/已关闭组；历史 Daily 不提供组编辑按钮。

## 历史保存

`workspace/daily/_meta/task-groups/{YYYY}/{YYYY-MM}/{YYYY-MM-DD}.task-groups.md` 保存每日 version 1 快照：`date`、当时各组的路径、名称、周期和完整 Task 路径列表。文件带 `type: task-group-snapshot` Properties，数据使用 Markdown 中的 JSON 围栏；不是插件缓存。

- 今日开放 Daily 的快照由 Vault Daily Todos 插件在启动、Daily 创建/修改/打开、组创建/修改/删除/重命名时更新。创建当天不存在的 Daily 不在此功能范围内。视图渲染只读，不触发快照写入。
- 同一天保存最新关注范围，不保存逐次点击的版本。Daily 已关闭或日期已过去后冻结快照，即使该 Daily 仍标 open，也不能随后续组变化重写；关闭组后原组文件仍保留成员。
- 过去/已关闭 Daily 只读取本日快照，绝不读取当前组重建当时的成员。快照缺失时明确提示，仅保留原全量池日期查询；快照损坏时报错并保留文件。旧 Daily 不批量切换视图、不补造快照。
- 新视图的 Daily 复盘关闭前必须保存最新快照，包含“没有当前组”的空列表；`daily-review-check.mjs` 检查存在性、格式及今日开放页的内容是否最新。旧视图不增加此要求，不自动重开历史页。
- Task 的标题、全局优先级和“当前状态”仍来自 Task 当前属性；快照冻结组名和成员，不宣称冻结 Task 全部属性。被删成员文件显示失效引用，不静默删除快照里的成员。
- 插件停用、离线或同步冲突造成漏记时，不能用当前组补历史。今日开放页可通过命令“保存今日关注组快照”重试。Agent 可用下列只读脚本输出快照，核对最新源文件后保存到指定路径：

  ```bash
  node .agents/skills/daily/scripts/task-group-snapshot.mjs --file <Daily绝对路径>
  ```

  脚本复用视图模型，YAML 读取依赖本地 `python3` 和 PyYAML；缺依赖则报告错误，不覆盖原快照。历史/已关闭页面只能返回已有快照，缺失时拒绝补造。没有 `--refresh` 历史重建开关。

- 插件采用串行保存、原文校验和 Vault.process 保护用户并发改动。仍应在单一主设备编辑同一组和当天 Daily；这不是跨设备分布式锁。
