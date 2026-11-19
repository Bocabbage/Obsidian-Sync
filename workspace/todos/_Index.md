---
type: workspace-index
status: active
updated: 2026-10-03
---

# 小任务待办池

这里统一保存一次性小事，常规任务和今日必做都可以记在这里。Daily 的“小任务”也显示同一份清单。每条 Todo 只在月度文件中保存一份 Checkbox；月份表示记录月份，不表示必须在当月完成。

## 当前待办与今日完成

```dataviewjs
await dv.view("agents/views/overview/_views/todo-pool");
```

## 月度文件

```dataview
TABLE WITHOUT ID
  link(file.path, file.name) AS "月份",
  length(filter(file.tasks, (task) => task.status = " " OR task.status = "/")) AS "未完成",
  length(filter(file.tasks, (task) => task.completed)) AS "已完成"
FROM "workspace/todos"
WHERE type = "todo-log"
SORT period DESC
```

## 使用约定

- 添加时默认“常规任务”；需要当天完成就选“今日必做”，也可以从今日 Daily 的“小任务”直接添加。
- 在任一入口勾选都会更新同一原条目，并自动记录完成日期；没做完就留在原处，不需要每天搬运。
- 每条任务末尾显示录入日期；已有任务可点“安排 / 改期”，设为今日必做、指定日期或转回常规任务。
- 今日必做跨天未完成会显示为逾期；复盘前需完成、取消或明确调整安排，常规任务无需清空。
- 旧 Daily 按自己的日期回看；日复盘保存快照后，后续操作不会改变当天保存的待办文字和状态。
- 跨月未完成事项不搬运；总览会继续查询所有月度文件。
- 需要多次推进、保存上下文、稳定映射或独立统计时，再升级为 [[workspace/tasks/_Index|Task Entity]]。
