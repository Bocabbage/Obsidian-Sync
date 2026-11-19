# Learning Agent 规则

进入本目录前先阅读根 `AGENTS.md`、`agents/README.md`、`workspace/AGENTS.md`，再阅读 `agents/schema/page-types/learning-note.md` 与 `agents/schema/workflows/learning.md`。

- 本目录保存与用户已确认的 Theme roadmap 对应的个人学习记录，使用 `type: learning-note`；目录说明和索引使用 `type: workspace-index`。
- 用户明确创建学习 Theme 并确认 roadmap 后，同次生成主学习笔记和阶段入口；仅讨论或读取不触发生成。初期每个 Theme 一份主笔记，内容明显增多后再按需拆页。
- 笔记用 `themes` 列表回链完整 Theme 路径，阶段二级标题与 roadmap 一致。Theme 的“记录入口”使用完整笔记路径和标题链接；个人笔记不加入 `materials`。
- 重复生成先查找并复用已有页；路线调整只补缺失阶段、更新相关入口。标题改动先查引用并同步修复，已有听课记录和整理内容完整保留。
- 给人读的正文沿用 `human-writing` Skill，不把 Agent 操作要求、虚构的听课内容或完成状态写入个人笔记。
- 原始资料按来源契约保存；外部 PDF 可留在 Zotero。Reading Note 与 `raws/Notes/` 不因新增目录迁移。
- 本目录只有 `AGENTS.md`、`README.md`、`_Index.md` 进入 Git 白名单，具体学习笔记和拆分页仍由 OneDrive 管理。
