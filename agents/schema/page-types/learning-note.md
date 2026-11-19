---
type: schema
schema: page-type
page_type: learning-note
updated: 2026-10-05
---

# Learning Note

Learning Note 保存与已确认 Theme roadmap 对应的个人学习过程，包括听课补充、疑问、个人理解、分析尝试和阶段整理。它属于 Workspace，不是 Raw 捕获、阅读目录或已编译的 Wiki 知识。

## 路径与粒度

```text
workspace/learning/<Theme 标题> · 学习笔记.md
```

- 初期每个 Theme 一份主笔记，按 roadmap 阶段组织，不为每节课提前建页。
- 内容明显增多或某部分需要独立引用时再按需拆页；主笔记保留导航，Theme 的阶段入口修复到实际记录位置。移动和重命名之前检查所有引用。
- 既有 Reading Note 和用户指定的 `raws/Notes/` 按原契约维护，不因新增类型转换或迁移。

## Properties

```yaml
---
type: learning-note
title: 学习笔记标题
themes: []
created: YYYY-MM-DD
updated: YYYY-MM-DD
---
```

- 五个字段必填。实际生成时，`themes` 使用带引号的完整 Vault 路径 wikilink 列表，关联用户已设立的 Theme；通常为一项，需要服务多个已确认 Theme 时可以多项，不凭标签相同自动关联。
- `created` 首次建立后不改；`updated` 在正文、阶段结构或关联有实质变化时更新，无变化的重复生成不刷新。
- 不设独立完成状态、阶段 ID 或派生进度字段。笔记的建立和更新不改变 Theme 状态。

## 正文

- 一级标题与笔记标题一致，顶部以普通 wikilink 关联 Theme；需要时说明课程或资料来源、页码、视频集数或时间定位。未核实的信息明确待补，不编造。
- 每个阶段使用与 roadmap 完全一致的二级标题，包括序号与文字；随后是一句关注问题和简短整理方向，再保留 `### 随手记录` 与 `### 阶段整理` 两个三级标题。
- 首次生成时两个记录区留空，只给方向提示。后续内容来自实际学习，不填入虚构的听课摘要、个人观点、分析结果或完成状态。
- 随手记录容纳解释、例子、疑问和想法，不要求逐条填写表单。阶段整理按内容选择短说明、关系图、对照表或分析；不强制每阶段产出全部形式。
- 后续写作区分来源说法、个人理解和 Agent 建议，必要时保留日期与定位；原资料仍可留在 Zotero，不为建立笔记复制 PDF。
- Workspace 新附件放在 `workspace/_assets/`。

## 与 Theme 和 Wiki 的关系

- `themes` 负责笔记回链，Theme 的 roadmap 使用完整笔记路径和阶段标题链接，正文可链接整份主笔记。`materials` 只关联 Raw，不列入学习笔记或 Wiki 成果。
- 生成与重复维护遵循 [[agents/schema/workflows/learning|学习记录工作流]]，不因读取既有 Theme 自动建页。
- 成熟的局部认识按 [[agents/schema/workflows/compile|Compile Workflow]] 编译，再将成果链接补回相关阶段或 Theme；保留原记录与疑问，不整份搬走。
