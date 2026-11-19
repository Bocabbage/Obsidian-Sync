---
type: workspace-index
updated: 2026-10-21
---

# 任务关注组

把一个周期里重点推进的 Task 放在一起，例如一个季度的 LIFE 任务，或某个版本迭代的核心任务。多个组可以同时开放。

点击“创建关注组”，填写名称和周期，勾选已有任务；之后可以编辑成员或关闭组。预计结束日期只作提示。关闭组保留记录，任务继续存在，也可以加入后续组。

Daily 优先展开当前关注组，全量任务池折叠在下面。未分组任务仍可正常安排和自动续入；没有当前关注组时，全量池默认展开。过去 Daily 使用当天保存的关注组记录，不随后续成员调整变化。

```dataviewjs
await dv.view("agents/views/overview/_views/task-pool", { mode: "manage" });
```

[[workspace/tasks/_Index|全部 Tasks]] · [[workspace/daily/_Index|Daily]]
