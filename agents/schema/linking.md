---
type: schema
schema: linking
updated: 2026-10-05
---

# 链接与溯源

## Wikilinks

- 使用 `[[wikilinks]]` 连接知识库内页面。
- 标题唯一且稳定时可使用短链接；存在同名风险时使用完整 vault 路径和显示别名。
- 跨领域关系通过链接表达，不为了同时出现在多个目录而复制页面。
- Workspace 导航索引使用 `_Index.md`，链接须包含目录并带清晰别名，例如 `[[workspace/themes/_Index|Themes]]`；Wiki 和插件来源索引不随之改名。
- Agent 会话导航使用 `agents/sessions/_Index.md` 与 `type: agent-index`，不再归入 Workspace 导航类型。
- Learning Note 的 `themes` 使用带引号的完整 Theme wikilink 列表；Theme 的学习 roadmap 以 `[[完整笔记路径#阶段标题|记录]]` 链接对应二级标题，标题文字必须一致。在 Markdown 表格中将别名分隔符写为 `\|`。语法见 [Obsidian 标题链接](https://help.obsidian.md/links)。
- 页面重命名或移动前搜索所有 wikilink、Markdown link、Dataview 查询和 Skill 中的路径文本。结构迁移只修复历史文件的实际链接目标，不改正文中的历史路径描述、日期或状态。

## 来源链

长期知识的推荐溯源链是：

```text
raws/<source-system>/...
    → workspace/themes/<theme>（可选的形成过程）
    → wiki/sources/<source page> / wiki/<domain>/<knowledge>
```

- Raw 文件保存来源原文或声明范围的忠实捕获，来源页完成身份合并、派生摘要和质量说明；结构化捕获不自动成为已验证知识。
- concept、entity、synthesis 页面通过 `sources` 链接来源页。
- 直接引用 Raw 中的具体段落时，可以在正文增加对应 Raw wikilink或块引用，但不替代来源页。
- Theme 通过 `materials` 列表维护与 Raw 的正式 N:N 关系，每项使用带引号的完整 vault 路径 wikilink；正文链接继续解释用途。这是材料相关性，不替代 Wiki 来源身份与证据链，也不要求 Raw 必须经过 Theme 才能编译。
- 不在 Raw 文件中手工添加 Theme 反向关系；由 Obsidian 原生反向链接展示引用它的 Theme。来源页继续承担来源身份与质量说明。
- 个人学习笔记通过 Theme 的 roadmap 和正文关联，不加入仅关联 Raw 的 `materials`。笔记中的来源说明保留原始链接与定位；PDF 保留在 Zotero 时可使用已核实的附件链接和页码，不为关联强制创建 Raw 或 Wiki source。

Douban 媒体目录是一个特例：目录视图可以直接读取 Raw，并按 ISBN 动态连接 WeRead。无法自动推导的关系由 `wiki/sources/link-overrides/` 承担；Reading Note、Viewing Note 和评论页从人工页面单向链接 Douban Raw。

## 别名与同名

- 文件名优先使用常用、稳定名称，其他语言名、旧名或译名放入 `aliases`。
- 书籍、电影等同名对象必须通过完整路径或显示别名消除歧义。
- 同一作品的不同版本或版本号不因标题相似自动合并，身份规则见 `agents/schema/sources/identity-resolution.md`。

## 附件

- `raws/Douban/_assets/` 为 Douban Raw 封面缓存，由插件维护。
- 新生成的 Wiki 附件放入 `wiki/_assets/<domain>/`，Workspace 附件放入 `workspace/_assets/`。
- 不为了视图整齐裁剪或覆盖原始封面；展示比例由视图或 CSS 控制。
- 移动附件前检查 Markdown embed、wikilink、普通相对路径和插件模板配置。
