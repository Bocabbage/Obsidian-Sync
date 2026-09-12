---
type: daily
date: "{{date:YYYY-MM-DD}}"
status: open
---

# {{date:YYYY-MM-DD}}

> [[workspace/daily/index|📅 Daily 总览]]

## 任务池

> [[workspace/tasks/index|查看全部 Tasks]] · 截至本页日期仍未全局闭环的 Task；只把今天实际推进的 Task 作为 occurrence 放入“跨日任务”。

```dataview
TABLE WITHOUT ID
  link(file.path, title) AS "任务",
  priority AS "优先级",
  status AS "当前状态"
FROM "workspace/tasks"
WHERE type = "task"
  AND date(created) <= this.date
  AND (!closed OR date(closed) > this.date)
SORT choice(priority = "high", 1, choice(priority = "normal", 2, 3)) ASC, updated DESC
```

## 跨日任务

### 1. 高优先级

### 2. 低优先级

## 当日任务

## 产生的材料

### 碎碎念

## Knowledge Candidates

## 专注

<!-- dida-focus:start -->
<!-- /daily-review 时生成当天已关联 DIDA 任务的专注汇总 -->
<!-- dida-focus:end -->

## 收尾

- 今天完成或推进：
- 已交接或取消：
- 明天关注：
