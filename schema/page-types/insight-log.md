---
type: schema
schema: page-type
page_type: insight-log
updated: 2026-09-12
---

# Insight Log

Insight Log 是 Workspace 中可浏览的点子本，保存值得以后重读、但未必需要转成任务或知识页的独立想法。

## 路径

~~~text
workspace/insights/{YYYY}/{YYYY-MM}.md
~~~

## Properties

~~~yaml
---
type: insight-log
period: YYYY-MM
status: active
created: YYYY-MM-DD
updated: YYYY-MM-DD
---
~~~

status 取值为 active 或 closed；跨月后旧文件可以关闭，但不要求机械执行。

## 条目格式

~~~markdown
## YYYY-MM-DD

- 💡 一条可以脱离当天上下文重新理解的想法。
  - 来源：[[workspace/daily/YYYY/YYYY-MM/YYYY-MM-DD.daily|Daily]]
  - Theme：[[workspace/themes/示例 Theme]]
~~~

- Theme 可选，初期不要求分类或标签。
- 一条 Insight 可以以后链接到多个 Theme、Task、Plan 或 Wiki，但不因建立链接自动改变事实地位。
- Daily Review 只摘录用户明确表达或上下文足够确定的内容；不把普通流水账改写成格言。
