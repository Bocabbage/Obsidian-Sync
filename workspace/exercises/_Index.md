---
type: workspace-index
updated: 2026-10-27
---

# 锻炼动作

在 Daily 的“锻炼”表格记录动作、重量、组数与次数或时间、休息间隔。同一天同一动作可以写多行，每条都会保留。

Daily review 时整理动作链接，首次记录的新动作自动建页。没有锻炼记录的日子直接跳过。动作页可以持续补充动作笔记和学习资料，训练历史从 Daily 汇总，点日期可回到当天。

```dataview
TABLE WITHOUT ID link(file.path, title) AS "动作", created AS "建页日期"
FROM "workspace/exercises"
WHERE type = "exercise"
SORT title ASC
```
