---
type: migration
status: complete
created: 2026-09-14
updated: 2026-09-14
---

# Theme / Task 边界与 Workspace 索引改造

## 用户确认的边界

- Theme 由用户设立，指导具体任务；Agent 只建议，不从反复工作或一般迁移授权自动建页（包括 seed）或激活。
- Theme / Task 可多对多，允许独立 Task；Daily 不增加动作级 Theme 必填标签。
- 多个本地 Task 可以共享 DIDA 长期计时来源，本地身份不按 DIDA ID 归并；每日归属单独保存。
- Workspace 导航文件采用 `_Index.md`，不扩大到 Wiki / Raw 索引。

## 已完成

- [x] 同步根/Workspace 规则、Theme/Task/周期计划 Schema、模板、Daily/周期/季度 Skills 与兼容镜像。
- [x] 撤去两个误建 Theme 身份，材料保留为 [[workspace/drafts/Lain 运维设计问题与线索]] 与 [[workspace/drafts/10.18 来源表与预览状态分析]]，标明 Agent 暂定归纳。
- [x] 修正关联 Task、Weekly/Monthly/Quarterly 和 UED Theme 的引用；Daily 仅维护去向链接，不改原始表达或任务状态。
- [x] Lain Task 与用户设立的 [[workspace/themes/个人全栈开发中的 UED 学习与设计判断|UED Theme]] 双向关联；只把相关练习/理解视为贡献，不创建额外学习 Task。
- [x] Daily、Tasks、Themes、Insights、Plans、Sessions 六个索引改为 `_Index.md`，更新导航、Canvas、模板、Skills 与 Git 白名单；Sessions 查询排除索引自身并兼容历史会话。
- [x] DIDA 统计保留当日映射与记录快照；同日冲突、多来源共享记录单列待归属，合计只算一次，任务小计不重复计入。
- [x] 默认重跑沿用已存映射，当前映射变化时明确警告；经确认以 `--refresh-mappings` 纠正，旧格式摘要不自动回填。

## 验证与保留

- 两套专注脚本各通过 8 项离线回归：重复 occurrence、跨日同来源不同 Task、同日共享、多来源同记录、历史快照、旧格式保护、无映射/直接链接、CLI 日期窗口与只读性。
- 98 份 YAML 解析、333 个范围内链接、六个索引类型/路径、Canvas 文件引用、Homepage JavaScript 语法及八份 Skill 校验通过，镜像一致；未做 Obsidian 界面运行态验证。
- 只用模拟 DIDA 返回值测试，没有调用真实 DIDA 或修改外部任务；周/月汇总由复盘 Skill 消费保存的每日快照，不新增独立统计服务。
- 原始 Raw、Wiki 正文和历史会话未改；原 Canvas 的末尾无换行格式保留，布局不变。
- 旧路径不保留 Theme 空壳；材料在上述草稿中完整保留来源与整理历史，可恢复到其他位置。
- 未调整其他既有 Theme 的状态，未改写旧周期草案的目标承诺，未批量升级历史专注区。
- 具体草稿/Task/Daily/Theme/Plan 继续 OneDrive-only；未 commit 或 push。
