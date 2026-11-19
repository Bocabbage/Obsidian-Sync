---
type: schema
schema: page-type
page_type: insight-log
updated: 2026-10-03
---

# Insight Log

Insight Log 是 Workspace 中可浏览的点子本，保存值得以后重读、但未必需要转成任务或知识页的独立想法。每条新增摘录附主题标签，便于跨日期检索，作为后续知识编译的个人材料。

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

- 💡 按主题检索多天的想法，可能更容易发现可以一起整理的问题。 #topic/知识管理 #topic/知识编译
  - 来源：[[workspace/daily/YYYY/YYYY-MM/YYYY-MM-DD.daily|Daily]]
  - Theme：[[workspace/themes/示例 Theme]]
~~~

- 上例仅示意格式，不是待写入个人 Insight 的事实。Theme 仍可选；主题标签与 Theme 实体互不替代，不因打标签创建或激活 Theme。
- 一条 Insight 可以以后链接到多个 Theme、Task、Plan 或 Wiki，但不因建立链接自动改变事实地位。
- Daily Review 自动摘录用户明确表达或上下文足够确定、可以独立重读的内容；保留原意、去重并链接来源，不把普通流水账、模板句或 Agent 新推论改写成格言。含义不确定时继续留在 Daily，不强行分类。

## 每条摘录的主题标签

- 每条新增或本次复盘更新的 `💡` 主行末尾保留主题标签。优先原样沿用用户在 Daily 写好的标签；没有或不足以表达主题时，Agent 再按 1–3 个的轻量范围补充，默认格式为 `#topic/主题`，例如 `#topic/知识管理`。标签与想法在同一行，便于按行检索；不只写在月文件 YAML，也不另建标签子列表。
- 用户已有标签够用时不再补标；普通 `#主题` 与 `#topic/主题` 都可以沿用，不擅自改名、加前缀或为符合数量删掉用户标签。相同标签只保留一次；明显歧义先保留并提示，不静默替换。需要补标时，优先复用 `workspace/insights/` 已有准确名称；新概念确需检索时才新增，不为每句话造一个新标签。
- 使用稳定、易搜的中文主题名；成熟技术名可用英文小写，例如 `#topic/kubernetes`。不含空格，不用日期、情绪或“待编译”状态代替主题；不能确定细分主题时选内容明确支持的较宽主题，不猜测动机或敏感特征。
- Daily 中用户手写的标签随原文保留，摘录时一起带入 Insight。Agent 后续补充的标签只维护在 Insight，不要求用户两边重复打标签。旧 Insight 不因规则变化批量补标；再次复盘命中已有同一条目时更新它，不因标签差异另抄一条。

## 为后续编译保留的信息

- 一点一条，保留所谈对象、必要场景、用户的判断或疑问；原文已经清楚时直接摘录，不为“知识风格”扩写成论断。
- 只有上下文明确支持时才补足省略的指代。保留“可能”“还没验证”等限定，问题保持问题，不把个人经验当普遍事实。
- Daily 来源链接必填；原文已有 Raw、文章、代码或其他材料链接时一并保留。可复用已有块链接定位原片段，不强制为每条新建页面或 ID。
- 标签使材料可检索，不表示已经验证或编译。编译时按主题聚合不同日期的条目，再核对来源、合并重复、保留分歧与适用条件；见 [[agents/schema/workflows/compile|Compile Workflow]]。
