# Obsidian 知识库 Agent 入口

这是以 Markdown、YAML Properties、wikilinks 和附件为事实载体的个人知识库。

## 必读顺序

1. 阅读本文件，再阅读 `agents/README.md`；其中的全库操作规范适用于所有目录。
2. 阅读 `agents/schema/README.md` 和 `agents/schema/ownership.md`。
3. 进入具体目录时阅读该目录最近的 `AGENTS.md`。
4. 按 `agents/README.md` 的工作流路由读取相关 Schema、source adapter、domain schema 和 Skill。

`CLAUDE.md` 仅为兼容入口。详细操作要求以 `agents/README.md` 为准，结构与行为契约以 `agents/schema/` 为准；发生冲突先停止批量修改并修正规则来源。

## 关键限制

- `workspace/` 保存个人工作内容；规范、系统设计、展示组件和 Agent 运行记录集中到 `agents/`。
- Raw 默认只读；授权捕获、用户维护的 `raws/Notes/` 及插件文件的具体边界见所有权与来源适配。
- Theme 由用户设立或明确确认；Agent 不自动创建或激活。
- 用户明确创建学习类 Theme 并确认 roadmap 后，按 `agents/schema/workflows/learning.md` 同次生成 `workspace/learning/` 主学习笔记和阶段入口；仅讨论或读取不触发创建。
- 历史 Daily 保留当时事实，不因后来完成或新增事项重写；结构迁移只修复实际链接目标。
- Archived 默认不读取、不修改；Root Legacy 只在明确迁移范围内处理。
- 移动前检查所有引用，保留用户已有改动；不修改 `.obsidian/workspace*.json` 调整内容结构。
- 给人读的正文按 `agents/README.md` 路由使用 human-writing Skill；不借润色改变事实或安排。
- Git 采用开发资产白名单；具体会话仍由 OneDrive 管理。不使用 `git add .`，未经明确要求不 commit 或 push。
