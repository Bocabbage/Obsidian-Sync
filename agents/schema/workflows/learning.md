---
type: schema
schema: workflow
workflow: learning
updated: 2026-10-05
---

# 学习记录工作流

本流程把已确认的学习 roadmap 转成可直接记录的个人笔记，并维护 Theme 到阶段标题的入口。它不替用户听课、预写个人理解或判断阶段完成。

## 触发与边界

- 用户明确创建学习类 Theme 并确认 roadmap 后，同次生成主学习笔记；已有 Theme 则按用户明确的生成或维护请求处理。
- 仅讨论学习方向、提出路线建议、读取或复盘既有 Theme 不触发创建；Theme 的确认与状态选择继续遵循 [[agents/schema/page-types/theme|Theme Schema]]。
- 新结构用于今后新增的 Theme 学习记录。Reading Note 和 `raws/Notes/` 按原契约维护，不自动迁移、改写或复制。

## 首次生成

1. 阅读相关 Theme、[[agents/schema/page-types/learning-note|Learning Note Schema]]、[[agents/schema/templates/learning-note-template|通用模板]]、`workspace/AGENTS.md` 与 `workspace/learning/AGENTS.md`。确认用户已认可的阶段标题、顺序和关注内容；正文同时使用 `human-writing` Skill。
2. 先查 Theme 的正文链接和 `workspace/learning/` 中 `themes` 的关联，再检查目标路径。复用已服务这个 Theme 的主笔记，不仅凭文件名判断；目标同名但属于别的记录时先消除冲突，不覆盖。
3. 默认路径为 `workspace/learning/<Theme 标题> · 学习笔记.md`。填入五个最小 Properties，`themes` 用带引号的完整 Theme wikilink 列表，正文顶部回链 Theme；日期使用执行当日，Theme 状态不因生成改变。
4. 模板仅示范一个阶段，按实际 roadmap 生成全部同名二级标题，每阶段给一句关注问题和简短整理方向，保留“随手记录”“阶段整理”两个三级标题。两个记录区留空，不预写听课内容、分析结果或个人结论，不遗留模板占位符。
5. Theme 的 roadmap 增加“记录入口”，以完整笔记路径和阶段标题链接；正文可链接整份主笔记。使用 Obsidian 的 `[[完整笔记路径#阶段标题|记录]]` 形式，表格中将别名分隔符写为 `\|`，见 [官方链接语法](https://help.obsidian.md/links)。
6. 来源链接留在正文，Theme 的 `materials` 仍只关联实际 Raw。PDF 保留在 Zotero 时，使用已核实的附件键；个人库可用 `zotero://open-pdf/library/items/<附件键>?page=<PDF页码>`，页码按 PDF 阅读器页序定位，正文印刷页码另行注明。未核实的库类型、附件键、视频 URL 或集数不能补造；附件语法见 [Zotero 官方论坛确认](https://forums.zotero.org/discussion/86980/quickly-create-a-open-pdf-link)。

## 重复生成与路线调整

- 重复请求先复用主笔记，只补缺失的阶段、结构或入口，不覆盖已经写下的随手记录、阶段整理、来源定位和个人判断。不生成第二份同用途主笔记。
- 路线有变化时以用户已确认的安排为准。缺失阶段按同样结构补充；既有阶段只更新相关标题、关注提示和入口，已改写的个人内容完整保留，不整页从模板重建。
- 标题改动先搜索所有标题链接、wikilink、Markdown link 和路径引用，再同步修复；保留原记录归属，不仅修改 roadmap 中显示的文字。
- 不在路线删减或重排时直接丢弃旧阶段正文。已退出当前路线的记录仍保留在原笔记，必要时说明原阶段或补导航；没有明确归属时不猜测合并。
- 无实际变化时不刷新 `updated`；有实质修改才更新对应页面。拆页后仍保留主笔记导航和 Theme 回链，检查 Git 忽略规则覆盖新路径。

## 后续记录与复盘

- 用户指定阶段时直接进入对应标题；未指定时根据已有上下文判断，无法确定则保留原记录并询问归属，不丢弃想法。
- 个人理解、课程说法和 Agent 建议保留各自身份。来源捕获按 source adapter，成熟认识按 Compile Workflow，不把整理操作当作学习成果。
- 复盘只根据实际新内容、问题变化和产物判断进展；生成骨架不表示学习开始，留白也不代表阶段未完成。不要自动新增 Task、Wiki 或学习完成状态。

## 检查

- YAML 类型和最小字段正确，`themes` 列表链接实际 Theme，顶部回链一致。
- 当前 roadmap 每个阶段都有记录入口，指向实际文件和完全一致的二级标题；标题变更引用已修复，生成页无遗留占位符。
- 既有内容、来源身份和 Theme 状态保留，个人笔记未混入 `materials`。
- `workspace/learning/` 的规则、说明、索引在 Git 白名单内，个人笔记及拆分页仍被忽略。
- 按 Session Workflow 更新本次会话记录，不因生成骨架执行 Wiki ingest / compile 或写 Wiki Log。
