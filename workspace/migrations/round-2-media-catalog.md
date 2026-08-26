---
type: migration
status: complete
created: 2026-08-26
updated: 2026-08-26
---

# Round 2：Douban 媒体目录与 Legacy 改造

## 范围

- Douban Raw 作为书籍、电影和剧集的唯一目录。
- WeRead 按 ISBN 或人工覆盖成为书籍分支。
- 个人阅读、观影内容进入 Workspace；电影知识进入 Wiki。
- `legacy-读书/` 与 `legacy-电影/` 在验收通过后移入可恢复的 `.trash` 快照。
- Raw、根 `assets/` 和插件配置保持只读。

## 真实数据审计

| 项目 | 数量 |
|---|---:|
| Douban 书籍 | 94 |
| WeRead 书籍 | 56 |
| ISBN 精确匹配 | 36 |
| Douban 未精确匹配 | 58 |
| WeRead 未精确匹配 | 20 |
| Douban / WeRead 重复平台 ID | 0 / 0 |
| Douban / WeRead 重复 ISBN | 0 / 0 |

## 五类验收样本

| 类型 | Douban | WeRead | 预期关系 | 结果 |
|---|---|---|---|---|
| 仅 Douban | [[raws/Douban/book/两条鳄鱼]] | 无 | 不生成 WeRead 分支 | 已验证 |
| 仅 WeRead | 无 | [[raws/WeRead/哲学宗教/逻辑学导论（第15版）]] | 保留 Raw，不建立第二套正式目录 | 已验证 |
| 两者匹配 | [[raws/Douban/book/十一个时区之旅]] | [[raws/WeRead/文学/十一个时区之旅：北国五十年]] | ISBN `9787513946391` 自动同版本 | 已验证 |
| 不同版本 | [[raws/Douban/book/活着回来的男人]] | [[raws/WeRead/历史/活着回来的男人：一个普通日本兵的二战及战后生命史]] | `same_work`，ISBN 不同，人工确认 | 已建立覆盖 |
| 疑似冲突 | [[raws/Douban/book/洛丽塔]] | [[raws/WeRead/文学/洛丽塔]] | 同 ISBN 但出版日期冲突，显示候选并标记 `conflict` | 已建立覆盖 |

## Legacy 拆分

### 读书

- 迁移 4 份有独立人工内容的 Reading Note：`两条鳄鱼`、`凯罗斯`、`十一个时区之旅`、`在流放地`。
- `涅朵奇卡` 的大部分摘抄已存在于 WeRead Raw；只建立一份最小补遗页，保留同步文件中缺失的一句开头，不重复其他高亮。
- 作者空壳页不迁移；卡普钦斯基页的唯一人工线索并入 `十一个时区之旅`，并标记待复核。
- 2 张阅读地图迁入 `workspace/_assets/reading/`；5 张重复封面不迁移。

### 电影

- `洛丽塔` 建立 Viewing Note，保留旧 `score: 8` 并明确其个人评分语义仍待确认。
- `八仙！` 只有与 Douban 重复的空壳记录，不迁移。
- `天国与地狱` 明确标记为可忽略的 AI 演示，不迁移。
- `摄影`、`场面调度`、`剪辑` 和 `小津安二郎` 的有效内容进入 `wiki/cinema/`；2 张思维导图迁入 `wiki/_assets/cinema/`。
- 3 张重复海报、空导演页、旧模板和旧仪表盘不迁移。

## 验收清单

- [x] DataviewJS 目录视图代码通过 JavaScript 语法检查。
- [x] Douban、WeRead 平台 ID 和 ISBN 均按字符串处理，未发现重复。
- [x] 目录按 Raw 文件名解析实际 JPG / WebP 封面，不复制根 `assets/`。
- [x] 168 个 Douban 媒体条目中仅 `女人步上楼梯时 女` 的 Raw 文件名与封面名不一致，且 Raw 内插件链接同样失效；视图采用唯一文件名前缀候选后可覆盖全部条目。
- [x] Workspace 笔记与 Wiki 内容只单向链接 Raw，未回写插件文件。
- [x] 自动匹配、相关版本和冲突覆盖的优先级已编码。
- [x] 新增与迁移页面的 YAML、wikilink 和附件引用通过最终检查。
- [x] 旧目录剩余 37 个文件移入 `.trash/knowledge-system-v1-2026-08-26/`；4 个有效过程附件已先迁入新位置。
- [x] 最终 Git 检查已识别并保留无关 Daily 改动与根 `卡片导航.md` 删除；staged 为空，未 commit / push。
