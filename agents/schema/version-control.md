---
type: schema
schema: version-control
updated: 2026-10-08
---

# Git 与 OneDrive

## 职责

- OneDrive 是整个 Vault 的内容同步与多设备分发机制，负责普通笔记、Raw、附件、Workspace 记录、Agent 会话和 Wiki 正文。
- Git 只保存知识库“开发资产”的变更历史，不作为 Vault 内容同步或完整备份。
- `.gitignore` 使用默认忽略、显式白名单模式；未列入白名单的新内容默认由 OneDrive 管理。

## Git 白名单

| 类型 | 路径 |
|---|---|
| Agent 入口与总览 | 根 `AGENTS.md`、`CLAUDE.md`、`agents/README.md` 与 `raws/AGENTS.md`；后者只保存来源捕获规则 |
| 面向人的使用说明 | 根 `README.md`、`agents/docs/vault-guide.md`，以及 `agents/docs/_assets/vault-guide/` 下 directory-map、task-relations、knowledge-flow 三组 SVG / PNG；仅这些明确列出的文档与插图进入白名单 |
| Skills | `.agents/`、`.claude/skills/`，排除本地权限文件 |
| 生效契约 | `agents/schema/` |
| 系统设计与维护 | `agents/specs/`、`agents/migrations/`、`agents/backlog.md`、Workspace 路由与占位 README |
| Agent 会话入口 | `agents/sessions/_Index.md`；具体会话正文仍由 OneDrive 管理 |
| Agent 草稿入口 | `agents/drafts/README.md`；具体分析与试写仍由 OneDrive 管理 |
| Daily 视图 | `workspace/daily/_Index.md`；具体每日记录仍由 OneDrive 管理 |
| Todo 视图 | `workspace/todos/_Index.md`；具体月度 Todo Log 仍由 OneDrive 管理 |
| Task 视图 | `workspace/tasks/_Index.md`；具体 Task Entity 仍由 OneDrive 管理 |
| Workspace 新模型入口 | `workspace/themes/_Index.md`、`workspace/insights/_Index.md`、`workspace/plans/_Index.md`；具体正文仍由 OneDrive 管理 |
| 学习记录入口 | `workspace/learning/AGENTS.md`、`workspace/learning/README.md`、`workspace/learning/_Index.md`；具体 Learning Note 及拆分页仍由 OneDrive 管理 |
| Homepage 视图 | `agents/views/overview/overview.canvas` 与 `agents/views/overview/` 下的可复现查询组件 |
| Wiki 骨架 | Wiki 根/领域 `AGENTS.md`、`index.md`、来源入口、可复现来源视图代码和附件说明 |
| 可复现视图 | 明确列入白名单的根视图入口 |
| 格式代码 | `.obsidian/snippets/` |
| 本地 Daily 自动化 | `.obsidian/plugins/vault-daily-todos/` 中的 `manifest.json`、`main.js`、`model.cjs`；仅自维护源码 |

## OneDrive-only 内容

- `raws/` 的来源正文与附件（仅 `raws/AGENTS.md` 规则文件进入白名单）、`archived/` 和 `.trash/`。
- Root Legacy 正文和附件、`wiki/**/legacy-*`。
- Workspace 的具体 Daily、Todo Log、Task Entity、Theme、Learning Note、Insight Log、Period Plan、Reading / Viewing Note、草稿正文和附件；白名单中的入口与总览除外。
- `agents/sessions/` 中的具体会话正文；只有 `_Index.md` 进入 Git，移入 Agent 目录不改变个人运行记录的同步边界。
- `agents/drafts/` 中的具体分析与试写正文；只有 `README.md` 进入 Git。
- `agents/migrations/` 中的 `*.inventory.json` 和 `*.verification.json` 是本地运行产物，可能含笔记和会话路径。迁移说明 Markdown 属于开发资产。
- `workspace/daily/_meta/focus/` 和 `workspace/daily/_meta/todos/` 的每日专注归属与待办快照也是个人记录，不进入 Git。
- 编译后的 Wiki 普通知识正文；Git 只跟踪它的 Agent/索引骨架。
- `.obsidian/workspace*.json`、第三方插件代码与插件数据、主题文件、缓存和用户界面状态。
- `.claude/settings.local.json` 及任何本地权限、令牌或个人连接配置。

## 提交规则

- 不使用 `git add .`；按当前任务的白名单路径显式暂存。
- 提交前查看 `git status --short`、`git diff --cached --stat` 和 staged diff。
- 缩小 Git 范围时只解除索引跟踪，不删除 Vault 或 OneDrive 中的文件。
- OneDrive 与 Git 并存时尽量只在一台主设备执行 commit、pull 和 push。
- 不把 Git ignore 当作隐私边界；敏感信息不得写入曾被 Git 跟踪的文件。

## 关注组开发资产

`workspace/task-groups/_Index.md`、`agents/views/overview/_views/task-pool/` 和本地 Daily 插件的 `task-groups.cjs` 属于开发资产。具体 Group 文件及 `workspace/daily/_meta/task-groups/` 每日快照为 OneDrive-only 个人记录，不进入 Git。

## 锻炼开发资产

`workspace/exercises/_Index.md` 与 `agents/views/overview/_views/exercise-history/` 为开发资产。具体动作页及 Daily 训练正文由 OneDrive 管理，不进入 Git。
