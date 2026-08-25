# Wiki Agent 规则

进入本目录前先阅读根目录 `AGENTS.md`、`schema/ownership.md`、`schema/properties.md` 和 `schema/linking.md`。

- Wiki 是 compiled knowledge，页面应能被人和 Agent 直接阅读并保留来源链。
- 处理领域内容时读取对应 `schema/domains/<domain>.md` 和领域本地 `AGENTS.md`。
- `wiki/**/legacy-*` 是 provisional 知识，可查询和逐步编译，但不要假定其字段与来源完整。
- 普通知识页不写入 `_meta/`；操作记录和 lint 结果分别写入 `_meta/log.md` 与 `_meta/lint-report.md`。
- 不把 Workspace 过程记录或 Raw 全文原样搬进 Wiki。
