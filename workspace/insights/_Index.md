---
type: workspace-index
workspace_type: insights
updated: 2026-10-03
---

# Insights

按月保存值得以后重读的想法。Daily Review 从“小零碎”等记录逐条摘录，并在每条末尾附少量主题标签，方便以后把同一问题的材料找回来；疑问和还没验证的判断照样保留。不要求编号、独立建页或转成任务。条目格式见 [[agents/schema/page-types/insight-log|Insight Log Schema]]。

## 按主题找材料

在 Obsidian 搜索中输入，例如：

```text
path:"workspace/insights" tag:#topic/知识管理
```

如果还想找同一条里提到“编译”的想法，可以用：

```text
path:"workspace/insights" line:("#topic/知识管理" "编译")
```

标签放在每条想法的主行上；找到后再沿 Daily 或材料链接回看上下文。旧条目未统一补标，仍可用关键词搜索。标签和搜索语法见 [Obsidian Tags](https://obsidian.md/help/tags) 与 [Search](https://obsidian.md/help/plugins/search)。

## 月度文件

```dataview
TABLE WITHOUT ID
  link(file.path, file.name) AS "月份",
  status AS "状态",
  updated AS "更新"
FROM "workspace/insights"
WHERE type = "insight-log"
SORT period DESC
```
