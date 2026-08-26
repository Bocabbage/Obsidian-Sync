---
type: schema
schema: source-identity
updated: 2026-08-26
---

# 跨来源身份匹配

跨来源链接由目录视图动态推导，或由 `wiki/sources/link-overrides/` 保存人工覆盖；不直接在 Douban 与 WeRead Raw 文件之间互相写链接。

## 书籍匹配顺序

1. ISBN 完全一致：目录可以自动形成同版本链接；若存在明显元数据异常，则由人工覆盖标记冲突或拒绝。
2. ISBN 不同、标题与作者一致：只作为同作品或相关版本候选，不自动连接。
3. 没有 ISBN：使用规范化标题、作者、出版社和出版年份生成候选，必须人工或 Agent 复核。
4. 仅标题相似：不得自动合并。

## 目录锚点、作品与版本

- Douban 条目在导航中是目录锚点，不强制等同于抽象作品实体。
- 一个作品可以有多个版本；人工覆盖必须用 `same_edition` 或 `same_work` 区分。
- 需要跨版本讨论时再建立作品实体页，不为目录展示机械生成作品页。
- `doubanId` 和 `weread bookId` 是平台 ID，不能互相替代。

## 规范化

- 匹配时可以忽略全半角、常见标点、括号中的营销文字和明确的版本装饰词。
- 不在文件系统中批量改名来完成身份匹配；规范化只用于候选比较。
- 关系决定、冲突和人工确认写入 `type: source-link` 页面或迁移记录。

## 人工覆盖示例

```yaml
---
type: source-link
catalog_type: book
douban_id: "26897187"
catalog_source: "[[raws/Douban/book/活着回来的男人]]"
weread_source: "[[raws/WeRead/历史/活着回来的男人：一个普通日本兵的二战及战后生命史]]"
relation: same_work
identity_status: confirmed
evidence:
  - 标题与作者一致
  - ISBN、出版社和出版年份不同
---
```
