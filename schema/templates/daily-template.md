---
type: daily
date: "{{date:YYYY-MM-DD}}"
status: open
---

# {{date:YYYY-MM-DD}}

> [[workspace/daily/index|📅 Daily 总览]]

## 未闭环

```dataview
TASK
FROM "workspace/daily"
WHERE file.day < this.file.day
  AND !completed
  AND status != "-"
  AND (
    meta(section).subpath = "大任务"
    OR meta(section).subpath = "小任务"
  )
SORT file.day DESC
```

## 大任务

## 小任务

## 产生的材料

## Knowledge Candidates

## 专注

<!-- dida-focus:start -->
<!-- /daily-review 时生成当天已关联 DIDA 任务的专注汇总 -->
<!-- dida-focus:end -->

## 收尾

- 今天完成或推进：
- 明天关注：
