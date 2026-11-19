---
type: schema
schema: page-type
page_type: exercise
updated: 2026-10-27
---

# 动作与锻炼记录

Daily 的 `## 锻炼` 保存当日训练事实；`workspace/exercises/动作名.md` 保存动作身份、个人学习笔记和训练历史视图。动作不是 Task 或 Theme，不参与任务续入、专注归属或任务完成统计。

## Daily 表格

四列固定为 `动作`、`重量`、`组数 × 次数 / 时间`、`休息间隔`。日间可以手写动作名称；重量带单位，按实际记录注明单只或总重，组数/次数/时间也保留单位。缺值保持空白，Agent 不推测数值或自动给出训练建议。

- 一行表示一条训练记录。同日同动作可出现多行，包含不同重量、次数、时长，以及数值完全相同的行；全部保留，按 Daily 原行顺序展示。
- 同动作不同训练规格分行。动作页按日期倒序、当天原行顺序展示，附当日条目序号和原 Daily 链接。
- 没有栏目、只有表头或全空占位行，视为没有记录，review 直接跳过，不创建页面、不补零、不增加关闭要求。
- 不完整维度可留空，但有数值却无动作名、错误列数或错误链接必须先澄清修正，不能静默丢弃。表格外的正文不当作训练记录。
- 表格 wikilink 的别名分隔符须转义，例如 `[[workspace/exercises/哑铃卧推\|哑铃卧推]]`。

## 动作页

Properties：`type: exercise`、`title`、`created: YYYY-MM-DD`、`aliases: []`。`created` 为动作页实际创建日，不冒充首次锻炼日。页面模板由 `exercise-history/model.cjs` 的 `page()` 提供；包括 `动作笔记`、`学习资料`、`训练记录`。不预填用户尚未提供的动作知识。

动作页的训练记录由 `agents/views/overview/_views/exercise-history` 只读汇总正式 Daily 文件中的动作链接。Daily 是训练事实的唯一来源，动作页不复制第二份可编辑记录表。删除视图代码不丢失原训练记录；既有笔记与资料正文不被 review 覆盖。新增知识不会改写过去 Daily。

只按已有页面完整链接、精确标题/文件名或明确登记的 aliases 匹配；不以近义词模糊合并动作及变式。多页同名/别名冲突、失效链接、同名非动作文件或非法文件名都先报告，不覆盖、不自动重命名。新动作名可用且无冲突时自动建页，不需要逐项确认；用户已授权通过 review 创建新动作页。页面重命名需按全库规则检查引用，不在 review 中自行执行。

## Review 步骤

1. 运行只读 `node .agents/skills/daily/scripts/exercise-review.mjs --file <Daily绝对路径>`，获取 `records`、`issues`、`creates`、`markdown`。空记录直接跳过；已有动作元数据读取依赖 python3 + PyYAML。
2. 有问题先解决，不应用部分计划。无问题时，先确认创建目标仍不存在，按 `creates` 新建页面；再重读 Daily，只应用动作单元格的链接差异，原数值、行顺序和正文不变。脚本不会写文件，不允许直接覆盖并发更新后的 Daily。
3. 再次运行应无新建页且正文无差异。重复 review 复用页面，不重复追加记录；汇总视图按每个真实行展示，不去重。
4. `daily-review-check.mjs` 对非空记录检查整理是否完成；空记录不影响收口。历史已关闭 Daily 不自动改写，历史纠正需明确授权。新模板和当天开放页可增加空表，不批量回填旧 Daily。

具体动作页是 OneDrive-only 个人记录；索引、Schema、Skill 和视图代码属于 Git 开发资产。Workspace 动作知识仍是个人学习内容，不自动视为 Wiki 已验证知识。
