---
type: schema
schema: version-control
updated: 2026-08-28
---

# Git 与 OneDrive

## 职责

- OneDrive 是整个 Vault 的内容同步与多设备分发机制，负责普通笔记、Raw、附件、Workspace 记录和 Wiki 正文。
- Git 只保存知识库“开发资产”的变更历史，不作为 Vault 内容同步或完整备份。
- `.gitignore` 使用默认忽略、显式白名单模式；未列入白名单的新内容默认由 OneDrive 管理。

## Git 白名单

| 类型 | 路径 |
|---|---|
| Agent 入口 | 根 `AGENTS.md`、`CLAUDE.md` |
| Skills | `.agents/`、`.claude/skills/`，排除本地权限文件 |
| 生效契约 | `schema/` |
| 系统设计 | `workspace/specs/`、`workspace/migrations/`、Workspace 路由与占位 README |
| Daily 视图 | `workspace/daily/index.md`；具体每日记录仍由 OneDrive 管理 |
| Task 视图 | `workspace/tasks/index.md`；具体 Task Entity 仍由 OneDrive 管理 |
| Homepage 视图 | `workspace/overview.canvas` 与 `workspace/overview/` 下的可复现查询组件 |
| Wiki 骨架 | Wiki 根/领域 `AGENTS.md`、`index.md`、来源入口、可复现来源视图代码和附件说明 |
| 可复现视图 | 明确列入白名单的根视图入口 |
| 格式代码 | `.obsidian/snippets/` |

## OneDrive-only 内容

- `raws/`、根 `assets/`、`archived/` 和 `.trash/`。
- Root Legacy 正文和附件、`wiki/**/legacy-*`。
- Workspace 的具体 Daily、Task Entity、Quarterly、Sessions、Reading / Viewing Note、草稿正文和附件；白名单中的入口 README、Daily 总览与 Tasks 总览除外。
- 编译后的 Wiki 普通知识正文；Git 只跟踪它的 Agent/索引骨架。
- `.obsidian/workspace*.json`、插件数据、主题文件、缓存和用户界面状态。
- `.claude/settings.local.json` 及任何本地权限、令牌或个人连接配置。

## 提交规则

- 不使用 `git add .`；按当前任务的白名单路径显式暂存。
- 提交前查看 `git status --short`、`git diff --cached --stat` 和 staged diff。
- 缩小 Git 范围时只解除索引跟踪，不删除 Vault 或 OneDrive 中的文件。
- OneDrive 与 Git 并存时尽量只在一台主设备执行 commit、pull 和 push。
- 不把 Git ignore 当作隐私边界；敏感信息不得写入曾被 Git 跟踪的文件。
