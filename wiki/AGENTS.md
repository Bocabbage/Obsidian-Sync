# Wiki Agent 规则

进入本目录前先阅读根目录 `AGENTS.md`、`agents/README.md`、`agents/schema/ownership.md`、`agents/schema/properties.md` 和 `agents/schema/linking.md`。

- Wiki 是 compiled knowledge，页面应能被人和 Agent 直接阅读并保留来源链。
- 新建或修改正文时同时使用`agents/README.md` 路由的 `human-writing` Skill；可以充分解释原理与例子，不能为追求简短或口语化删掉来源、技术条件和不确定性。
- 处理领域内容时读取对应 `agents/schema/domains/<domain>.md` 和领域本地 `AGENTS.md`。
- `wiki/**/legacy-*` 是 provisional 知识，可查询和逐步编译，但不要假定其字段与来源完整。
- 普通知识页不写入 `_meta/`；操作记录和 lint 结果分别写入 `_meta/log.md` 与 `_meta/lint-report.md`。
- 不把 Workspace 过程记录或 Raw 全文原样搬进 Wiki。
