---
name: daily
description: 在本 Obsidian Vault 创建或更新轻量 Daily；用户说“今日计划”“开始今天”或“/daily”时维护大任务、小任务和当天材料，说“今日总结”“记录完成”或“/daily-review”时汇总 Daily 已关联 DIDA 任务的当天专注。DIDA 不是唯一任务来源。
---

# Daily v2

Daily 是当天工作切片和材料入口，不是完整项目管理系统。执行前阅读 `schema/page-types/daily.md` 与 `schema/workflows/daily.md`。

## 路径与模板

```text
workspace/daily/{YYYY}/{YYYY-MM}/{YYYY-MM-DD}.daily.md
schema/templates/daily-template.md
```

日期使用 Asia/Shanghai。文件不存在时从模板创建；已经存在时更新原文件，不覆盖人工内容。

## 晨间：`/daily`

- 创建或打开当天 Daily。
- 用户在 `大任务` 的 `1. 高优先级` / `2. 低优先级` 分组或 `小任务` 下维护当天要完成的切片。
- DIDA 链接由用户按需手工粘贴；不要自动拉取 DIDA 今日任务。
- DIDA 不是唯一来源，没有外部链接的本地任务完全合法。
- `未闭环` 只查询旧 Daily，不自动复制或迁移任务。
- 保留 `大任务`、`小任务` 两个二级标题原名；高低优先级是 `大任务` 中的三级标题，不影响 DIDA 链接解析。
- `meta(section).subpath` 会把编号标题规范化为 `1 高优先级` / `2 低优先级`；维护未闭环查询时使用这两个值，不使用带句点的 Markdown 标题原文。

状态约定：

| 标记 | 含义 |
|---|---|
| `[ ]` | 未开始 |
| `[/]` | 进行中 |
| `[>]` | 顺延到以后 |
| `[x]` | 今天计划完成的切片已完成 |
| `[-]` | 取消 |

Daily Checkbox 不代表 DIDA 整体任务状态。不要因 DIDA 仍未完成而撤销当天的 `[x]`，也不要因 DIDA 已完成而自动修改 Daily。

## 晚间：`/daily-review`

1. 定位当天 Daily；不存在时创建空模板，但不臆造任务。
2. 不依据 DIDA 状态改变大任务或小任务的 Checkbox。只有用户明确报告状态时才更新。
3. 运行本 Skill 目录下的只读脚本：

   ```bash
   node scripts/dida-focus-summary.mjs --file <当天 Daily 的绝对路径>
   ```

4. 只替换以下标记之间的内容，保留标题、标记和所有人工正文：

   ```markdown
   <!-- dida-focus:start -->
   <!-- dida-focus:end -->
   ```

5. 脚本成功并完成刷新后，把页面 Property `status` 设为 `closed`。再次执行时刷新同一区域，不追加重复摘要。

脚本只读取 `大任务`、`小任务` 中的 DIDA Webapp 链接；按 `tasks[].taskId` 匹配当天 focus，按记录 ID 去重，并处理实际响应的毫秒时长。它不会写回 DIDA，也不会为无 DIDA 链接的本地任务虚构时长。

若脚本失败、未登录或生成标记缺失/重复，保留现有专注区不变并报告问题。不要退回使用不可靠的 `task get.focusSummaries`。

## 材料与 Knowledge Candidates

- 与任务直接相关的进展、阻塞或产出可以缩进写在任务下，不建立“过程中”栏目。
- 需要独立检索或复用的内容写入 `产生的材料`，引用可选；随手捕获写入其下的 `碎碎念`。
- Knowledge Candidate 只是候选；只有用户明确选择后才能按 compile workflow 进入 Wiki。
