---
type: schema
schema: workflow
workflow: daily
updated: 2026-08-25
---

# Daily Workflow

Daily 在同一文件中完成晨间组织、日间状态更新和晚间复盘。任务可以来自 DIDA、其他来源或纯本地输入。

## 晨间创建

1. 以 Asia/Shanghai 的当前日期解析目标路径：

   ```text
   workspace/daily/{YYYY}/{YYYY-MM}/{YYYY-MM-DD}.daily.md
   ```

2. 文件不存在时使用 `schema/templates/daily-template.md` 创建；已存在时打开或追加，不覆盖人工内容。
3. 用户在 `大任务`、`小任务` 中录入当天切片，按需手工粘贴 DIDA 链接。
4. 不自动拉取 DIDA 今日任务，不自动复制旧 Daily 的未完成任务。

`未闭环` 查询只是旧任务的交互视图。用户确实要在今天继续时，可以在今天重新描述当日切片或再次引用对应 DIDA 任务；原记录保持不变。

## 日间更新

- 用户可以随时更新 Markdown task 状态。
- 与任务直接相关的进展或阻塞写在该任务的缩进项目下。
- 当天形成的独立材料写入 `产生的材料`；值得长期保留的概念、来源或问题写入 `Knowledge Candidates`。
- Agent 不因 DIDA 任务完成或仍未完成而自动改变 Daily Checkbox。

## 晚间 `/daily-review`

1. 定位当天 Daily；不存在时先从模板创建，不臆造任务。
2. 只从 `大任务`、`小任务` 两个二级标题中提取 DIDA Webapp 任务链接。
3. 以 Asia/Shanghai 当天 `00:00:00` 到次日 `00:00:00` 为只读查询窗口，分别读取 `pomodoro` 和 `timing`。
4. 使用 focus 响应中的 `tasks[].taskId` 匹配关联任务，按 focus 记录 `id` 去重，并把实际返回的毫秒 `duration` 换算为可读时长。
5. 同一 DIDA 任务在 Daily 中重复出现时只聚合一次；没有 DIDA 链接的本地任务不生成自动时长。
6. 只替换以下标记之间的内容：

   ```markdown
   <!-- dida-focus:start -->
   <!-- dida-focus:end -->
   ```

7. 保留任务正文、Checkbox、材料、候选和人工复盘；完成刷新后把页面 `status` 改为 `closed`。

专注摘要至少包括关联任务合计、番茄钟次数与时长、正计时时长和按任务明细。已关联但当天没有 focus 记录的任务显示 `0m`，避免把“没有查询”误解为“遗漏任务”。

## 失败边界

- DIDA CLI 未安装、未登录、查询失败或返回无法解析的数据时，保留现有生成区不变并报告原因。
- 不使用不可靠的 `task get.focusSummaries` 作为实际专注事实。
- 不通过 Daily 工作流完成、更新、移动、评论或删除 DIDA 任务。
- 不扫描或修改 `raws/`、Legacy、Archived、Canvas 或 `.obsidian/workspace*.json`。

## Knowledge Candidates

- 候选只进入 Daily 汇总，不自动 compile。
- 用户明确选择某个候选后，另按 `schema/workflows/compile.md` 处理。
- compile 完成后可以在原候选后追加目标 Wiki wikilink，并将候选标为完成。
