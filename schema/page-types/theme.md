---
type: schema
schema: page-type
page_type: theme
updated: 2026-09-12
---

# Theme

Theme 是 Workspace 中围绕“同一个持续关注原因”聚合问题、线索、暂定理解和投入判断的工作页。它不是 Raw，不是任务，也不代表内容已经编译为 Wiki。

## 路径与粒度

~~~text
workspace/themes/<稳定的人类可读标题>.md
~~~

- 一页应能在一次 Review 中作为同一个话题讨论，例如“Redis 在实际系统中的行为”，而不是整个“计算机科学”。
- 初期允许标题较宽；当问题、投入方向或输出开始明显分叉时再拆 Theme。
- 不因为建立 Theme 就创建对应 Wiki 目录；Wiki 页面自然形成稳定集合后再调整领域结构。

## Properties

~~~yaml
---
type: theme
title:
status: seed
created: YYYY-MM-DD
updated: YYYY-MM-DD
next_review:
---
~~~

- status 取值为 seed、active、paused 或 closed。
- seed 表示已有多条相关线索但尚未承诺投入；active 表示正在理解或被 Plan 选中。
- next_review 可选，只在确实需要提醒重新判断时填写。

## 正文

- 为什么关注：真实问题、动机或反复出现的情境。
- 问题与边界：仍待解释的具体问题，以及明确不包含什么。
- 观察与线索：链接 Daily、Raw、Insight、项目材料或已有 Wiki，不复制大段原文。
- 当前理解：允许暂定和不完整，并明确待验证处。
- 投入与输出：链接 Period Plan、Task、项目文档和 Wiki 产物。
- Review Log：只记录 Theme 粒度的选择、拆分、暂停或关闭，不重复 Daily 时间线。

Theme 可以持续产出多个 Wiki 页面；是否关闭由关注是否仍需维护决定，不由“是否已经编译过一次”决定。
