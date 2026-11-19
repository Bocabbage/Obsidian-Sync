---
type: daily
date: "{{date:YYYY-MM-DD}}"
status: open
---

# {{date:YYYY-MM-DD}}

> [!note] 今日心情
>

> [[workspace/daily/_Index|📅 Daily 总览]]

## 任务池

> [[workspace/tasks/_Index|查看全部 Tasks]] · 截至本页日期仍未全局闭环的 Task；只把今天实际推进的 Task 作为 occurrence 放入“跨日任务”。

```dataviewjs
await dv.view("agents/views/overview/_views/task-pool");
```

## 跨日任务

<!-- task-todo:pending -->

### 1. 高优先级

#### WORK

#### LIFE

### 2. 低优先级

#### WORK

#### LIFE

## 小任务

```dataviewjs
await dv.view("agents/views/overview/_views/todo-pool");
```

## 锻炼

| 动作 | 重量 | 组数 × 次数 / 时间 | 休息间隔 |
|---|---|---|---|
|  |  |  |  |

## 小零碎

## 专注

<!-- dida-focus:start -->
<!-- /daily-review 时生成当天已关联 DIDA 任务的专注汇总 -->
<!-- dida-focus:end -->

## 收尾

- 今天完成或推进：
- 已交接或取消：
- 明天关注：
