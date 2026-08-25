---
type: schema
schema: linking
updated: 2026-08-25
---

# 链接与溯源

## Wikilinks

- 使用 `[[wikilinks]]` 连接知识库内页面。
- 标题唯一且稳定时可使用短链接；存在同名风险时使用完整 vault 路径和显示别名。
- 跨领域关系通过链接表达，不为了同时出现在多个目录而复制页面。
- 页面重命名或移动前搜索所有 wikilink、Markdown link、Dataview 查询和 Skill 中的路径文本。

## 来源链

长期知识的推荐溯源链是：

```text
raws/<source-system>/...
    → wiki/sources/<source page>
    → wiki/<domain>/<concept or synthesis>
```

- Raw 文件保存来源原貌，来源页完成身份合并、摘要和质量说明。
- concept、entity、synthesis 页面通过 `sources` 链接来源页。
- 直接引用 Raw 中的具体段落时，可以在正文增加对应 Raw wikilink或块引用，但不替代来源页。
- 不在插件控制的 Raw 文件中手工添加反向链接；由来源页承担汇聚关系。

## 别名与同名

- 文件名优先使用常用、稳定名称，其他语言名、旧名或译名放入 `aliases`。
- 书籍、电影等同名对象必须通过完整路径或显示别名消除歧义。
- 同一作品的不同版本或版本号不因标题相似自动合并，身份规则见 `schema/sources/identity-resolution.md`。

## 附件

- 当前根 `assets/` 为 Douban Raw 封面缓存，由插件维护。
- 新生成的 Wiki 附件放入 `wiki/_assets/<domain>/`，Workspace 附件放入 `workspace/_assets/`。
- 不为了视图整齐裁剪或覆盖原始封面；展示比例由视图或 CSS 控制。
- 移动附件前检查 Markdown embed、wikilink、普通相对路径和插件模板配置。
