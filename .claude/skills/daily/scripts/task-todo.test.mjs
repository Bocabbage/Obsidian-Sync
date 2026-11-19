import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import vm from "node:vm";
const require = createRequire(import.meta.url);
const model = require("../../../../.obsidian/plugins/vault-daily-todos/model.cjs");
const date = "2026-09-20", path = "workspace/daily/2026/2026-09/2026-09-20.daily.md";
const taskPath = "workspace/tasks/TASK-202609-001";
const template = readFileSync(new URL("../../../../agents/schema/templates/daily-template.md", import.meta.url), "utf8").replaceAll("{{date:YYYY-MM-DD}}", date);
const raw = (body, status = "active") => `---\ntype: task\ntitle: 样例\nstatus: ${status}\npriority: high\ncreated: 2026-09-01\n---\n## Todo\n${body}\n## Daily 时间线\n`;
const parse = (body, status) => model.taskTodos(raw(body, status), taskPath + ".md");
const step = "- [ ] 确认范围 ➕ 2026-09-18 ^step-001";
const plan = (tasks, extra = {}) => model.planDaily({ markdown: template, path, date, tasks, ...extra });

test("generation writes editable snapshot + exact anchor once, preserves manual prose", () => {
  const first = plan([parse(step)], { markdown: template + "\n用户原文\n" });
  assert.equal(first.added.length, 1);
  assert.match(first.markdown, /  - \[ \] 确认范围 ↪ \[\[workspace\/tasks\/TASK-202609-001#\^step-001\|待办\]\]/);
  assert.ok(first.markdown.endsWith("用户原文\n"));
  assert.equal(plan([parse(step)], { markdown: first.markdown }).markdown, first.markdown);
  assert.equal(plan([parse(step)], { markdown: first.markdown, manual: true }).added.length, 0);
});

test("only active eligible steps carry, defer until resume and pause explicitly", () => {
  const body = [step,
    "- [/] 进行中 ➕ 2026-09-18 ^step-002",
    "- [ ] 未来 ➕ 2026-09-18 [resume:: 2026-09-21] ^step-003",
    "- [ ] 暂停 ➕ 2026-09-18 [carry:: paused] ^step-004",
    "- [x] 完成 ➕ 2026-09-18 ✅ 2026-09-19 ^step-005",
    "- [-] 取消 ➕ 2026-09-18 [closed:: 2026-09-19] ^step-006",
    "- [ ] 今日恢复 ➕ 2026-09-18 [resume:: 2026-09-20] ^step-007"].join("\n");
  assert.deepEqual(plan([parse(body)]).added.map(x => x.id), ["step-001", "step-002", "step-007"]);
  for (const status of ["inbox", "blocked", "done", "cancelled"]) assert.equal(plan([parse(body, status)]).added.length, 0);
});

test("history supplies last priority and WORK/LIFE only, never its stale checks", () => {
  const history = [{ markdown: `---\ndate: 2026-09-18\n---\n## 跨日任务\n### 2. 低优先级\n#### LIFE\n- [[${taskPath}|样例]]\n  - [ ] 历史遗留未交接，不应续入\n` }];
  const result = plan([parse(step)], { history });
  assert.ok(result.markdown.indexOf("确认范围") > result.markdown.indexOf("### 2. 低优先级"));
  assert.match(result.markdown, /#### LIFE\s+- \[\[workspace\/tasks\/TASK-202609-001/);
  assert.ok(!result.markdown.includes("历史遗留"));
});

test("skip same-day existing step, including done occurrence; append under owner without duplicate header", () => {
  const markdown = template.replace("#### WORK", `#### WORK\n- [[${taskPath}|样例]]\n  - [x] 已完成 ↪ [[${taskPath}#^step-001|待办]]`);
  const result = plan([parse(step + "\n- [ ] 另一项 ➕ 2026-09-20 ^step-002")], { markdown });
  assert.equal(result.added.length, 1);
  assert.equal(result.markdown.split(`- [[${taskPath}|样例]]`).length - 1, 1);
  assert.match(result.markdown, /\[x\] 已完成/);
});

test("no historical/closed/non-daily mutation and invalid input is atomic", () => {
  assert.equal(plan([parse(step)], { date: "2026-09-21" }).markdown, template);
  const closed = template.replace("status: open", "status: closed");
  assert.equal(plan([parse(step)], { markdown: closed, manual: true }).markdown, closed);
  assert.equal(plan([parse(step)], { path: "raws/Web/example.md", manual: true }).added.length, 0);
  for (const bad of ["- [ ] 无标识", step + "\n" + step, "- [ ] 无效日期 ➕ 2026-02-30 ^step-001"]) {
    const result = plan([parse(bad)]);
    assert.ok(result.errors.length);
    assert.equal(result.markdown, template);
  }
});

test("review requires exact valid Task Todo ownership; small pool and code examples ignored", () => {
  const text = `<!-- task-todo:managed -->\n## 跨日任务\n#### WORK\n- [[${taskPath}|任务]]\n  - [>] 已交接\n## 当日任务\n### 今日安排\n#### WORK\n- [x] 一次性事项\n### 小任务待办池\n- [ ] 候选不要求今天完成\n\n~~~md\n## 跨日任务\n- [>] 示例\n~~~`;
  assert.equal(model.occurrences(text).items.length, 2);
  assert.equal(model.reviewLinks(text, [parse(step)]).length, 1);
  const linked = text.replace("已交接", `已交接 ↪ [[${taskPath}#^step-001|待办]]`);
  assert.equal(model.reviewLinks(linked, [parse(step)]).length, 0);
  assert.equal(model.reviewLinks(linked, []).length, 1);
  assert.equal(model.reviewLinks(linked, [parse(step.replace("[ ]", "[x]"))]).length, 1);
});

test("later completion does not invalidate a historical handoff", () => {
  const text = `---\ndate: 2026-09-20\n---\n<!-- task-todo:managed -->\n## 跨日任务\n- [[${taskPath}|任务]]\n  - [>] 留待明天 ↪ [[${taskPath}#^step-001|待办]]`;
  const completedLater = parse("- [x] 确认范围 ➕ 2026-09-18 ✅ 2026-09-21 ^step-001");
  assert.equal(model.reviewLinks(text, [completedLater]).length, 0);
  const duplicated = parse(step + "\n" + step);
  assert.equal(model.reviewLinks(text, [duplicated]).length, 1);
});

test("plugin uses real event hook, idempotent write, no Task or historical mutation", async () => {
  const callbacks = {}, files = new Map([[path, template], [taskPath + ".md", raw(step)]]), writes = [];
  let timer, command;
  const fakeModel = { ...model, today: () => date };
  class Plugin { registerEvent() {} addCommand(value) { command = value; } }
  const sandbox = { module: { exports: {} }, require: name => name === "obsidian" ? { Plugin, Notice: class {} } : name.endsWith("task-groups.cjs") ? () => ({ TaskGroups: class { install() { return this; } stop() {} } }) : fakeModel,
    setTimeout: fn => { timer = fn; return 1; }, clearTimeout() {}, console };
  vm.runInNewContext(readFileSync(new URL("../../../../.obsidian/plugins/vault-daily-todos/main.js", import.meta.url), "utf8"), sandbox);
  const plugin = new sandbox.module.exports();
  plugin.manifest = { dir: ".obsidian/plugins/vault-daily-todos" };
  plugin.app = { vault: {
    adapter: { getBasePath: () => "/vault" }, on: (name, fn) => { callbacks[name] = fn; },
    getMarkdownFiles: () => [...files.keys()].map(path => ({ path })), getAbstractFileByPath: path => files.has(path) ? { path } : null,
    read: async f => files.get(f.path), process: async (f, fn) => { writes.push(f.path); files.set(f.path, fn(files.get(f.path))); }
  }, workspace: { onLayoutReady: fn => fn(), getActiveFile: () => ({ path }) } };
  await plugin.onload();
  assert.equal(typeof callbacks.create, "function");
  assert.equal(typeof timer, "function");
  callbacks.create({ path });
  timer();
  for (let tries = 0; tries < 100 && plugin.running.size; tries++) await new Promise(resolve => setTimeout(resolve, 1));
  assert.deepEqual(writes, [path]);
  await plugin.fill({ path }, false);
  await command.callback();
  assert.deepEqual(writes, [path]);
  assert.equal(files.get(taskPath + ".md"), raw(step));
  plugin.onunload();
  assert.equal(await plugin.fill({ path }, true), null);
});

test("complete-detail review includes same-day done and cancelled items, preserving legacy pages", () => {
  const daily = (row, state = "open", day = "2026-10-14") => `---\ndate: ${day}\nstatus: ${state}\n---\n## 跨日任务\n- [[${taskPath}|Task]]\n  - ${row}`;
  for (const status of ["x", "-", ">", "/", " "]) {
    assert.ok(model.reviewLinks(daily(`[${status}] unlinked`), []).length);
  }
  assert.equal(model.reviewLinks(daily("[x] historical", "closed"), []).length, 0);
  assert.equal(model.reviewLinks(daily("[x] historical", "open", "2026-10-13"), []).length, 0);
  const done = parse("- [x] Done ➕ 2026-10-14 ✅ 2026-10-14 ^step-001");
  const linked = `[x] Done [action:: completed] ↪ [[${taskPath}#^step-001|明细]]`;
  assert.equal(model.reviewLinks(daily(linked), [done]).length, 0);
  assert.ok(model.reviewLinks(daily(linked), [parse(step)]).length);
  assert.ok(model.reviewLinks(daily(linked.replace("completed", "wrong")), [done]).length);
  assert.ok(model.reviewLinks(daily(linked + ` [[${taskPath}#^step-001|重复]]`), [done]).length);
  assert.equal(model.reviewLinks(daily(linked.replace("completed", "transferred")), [parse(step)]).length, 0);
  assert.ok(model.reviewLinks(daily(linked.replace("TASK-202609-001#", "TASK-202609-002#")), [done]).length);
});

test("historical backfill keeps recording date and actual completion, never carries completed or paused details", () => {
  const body = "- [x] Backfilled ➕ 2026-10-14 [occurred:: 2026-10-09] ✅ 2026-10-09 ^step-001\n- [/] External ➕ 2026-10-14 [occurred:: 2026-10-12] [carry:: paused] ^step-002";
  const task = parse(body);
  assert.deepEqual(task.errors, []);
  assert.equal(task.steps[0].created, "2026-10-14");
  assert.equal(task.steps[0].completed, "2026-10-09");
  assert.equal(task.steps[0].label, "Backfilled");
  assert.ok(parse(body.replace("occurred:: 2026-10-09", "occurred:: 2026-10-15")).errors.length);
  assert.ok(parse(body.replace("occurred:: 2026-10-09", "occurred:: 2026-10-10")).errors.length);
  const day = "2026-10-14";
  const result = model.planDaily({ markdown: template.replaceAll(date, day), path: `workspace/daily/2026/2026-10/${day}.daily.md`, date: day, tasks: [task] });
  assert.deepEqual(result.errors, []);
  assert.deepEqual(result.added, []);
});

const tableRow = ({ id = "step-001", state = "待办", finish = "—", meta = {}, label = "确认范围", note = "来源：[[workspace/daily/2026/2026-09/2026-09-20.daily\\|Daily]]" } = {}) => `| 001 · ${label} <!-- task-step ${JSON.stringify({id, created: "2026-09-18", ...meta})} --> | ${state} | ${finish} | ${note} |`;
const table = (rows, anchors = ["step-001"]) => parse(`| 事项 | 状态 | 完成时间 | 备注 |\n|---|---|---|---|\n${rows}\n\n> [!info]- 历史回链兼容\n${anchors.map(id => `> ${id.slice(5)} ^${id}`).join("\n>\n")}`);
const finishLink = d => `[[workspace/daily/${d.slice(0,4)}/${d.slice(0,7)}/${d}.daily#收尾\\|${d}]]`;

test("four-column table and legacy list yield the same canonical step and preserve escaped pipes", () => {
  const t = table(tableRow());
  assert.deepEqual(t.errors, []);
  assert.deepEqual(t.steps, parse(step).steps);
  assert.equal(table(tableRow({label: "A \\| B"})).steps[0].label, "A | B");
  const generated = plan([t]);
  assert.equal(generated.added.length, 1);
  assert.match(generated.markdown, /确认范围 ↪/);
  assert.ok(!generated.markdown.includes("action::"));
});

test("table completion links, backfill, cancellation and external handoffs preserve date and carry semantics", () => {
  const rows = [
    tableRow({state: "已完成", finish: finishLink("2026-09-19"), meta: {created: "2026-09-20", occurred: "2026-09-18"}}),
    tableRow({id: "step-002", state: "已转交"}),
    tableRow({id: "step-003", state: "暂停"}),
    tableRow({id: "step-004", state: "已取消", meta: {closed: "2026-09-19"}}),
    tableRow({id: "step-005", state: "进行中", meta: {resume: "2026-09-21"}}),
  ].join("\n");
  const t = table(rows, [1,2,3,4,5].map(n => `step-00${n}`));
  assert.deepEqual(t.errors, []);
  assert.equal(t.steps[0].completed, "2026-09-19");
  assert.equal(t.steps[1].paused, true);
  assert.deepEqual(plan([t]).added, []);
});

test("malformed tables reject atomically instead of silently losing work", () => {
  for (const row of [
    tableRow().replace(/ <!-- task-step .*? -->/, ""),
    tableRow({state: "unknown"}),
    tableRow({state: "已完成"}),
    tableRow({state: "已完成", finish: finishLink("2026-09-19").replace("#收尾", "#不存在")}),
    tableRow({state: "已完成", finish: finishLink("2026-09-19").replace("2026-09-19]]", "2026-09-20]]")}),
    tableRow({finish: finishLink("2026-09-19")}),
    tableRow({meta: {created: "2026-02-30"}}),
    tableRow({meta: {state: "x"}}),
    tableRow({label: "unescaped | column"}),
    tableRow() + "\n" + tableRow(),
  ]) {
    const t = table(row);
    assert.ok(t.errors.length, row);
    const result = plan([t]);
    assert.ok(result.errors.length);
    assert.equal(result.markdown, template);
  }
  assert.ok(table(tableRow(), []).errors.length);
  assert.ok(table(tableRow(), ["step-001", "step-001"]).errors.length);
});

test("handwritten review is completed by adding a link, without requiring action syntax", () => {
  const hand = `---\ndate: 2026-10-14\nstatus: open\n---\n## 跨日任务\n- [[${taskPath}|任务]]\n  - [x] 今天完成的局部排查`;
  assert.match(model.reviewLinks(hand, [parse(step)])[0].reason, /Agent/);
  const linked = hand + ` ↪ [[${taskPath}#^step-001|明细]]`;
  assert.deepEqual(model.reviewLinks(linked, [parse(step)]), []);
  assert.equal(model.occurrences(hand).items[0].text, "今天完成的局部排查");
});

test("Daily header freezes today's unfinished deadlines once, including blocked and paused tasks", () => {
  const ddlDate = "2026-09-20";
  const active = parse([
    "- [ ] 到期 ➕ 2026-09-18 📅 2026-09-20 ^step-001",
    "- [x] 已完成 ➕ 2026-09-18 📅 2026-09-20 ✅ 2026-09-19 ^step-002",
    "- [ ] 逾期 ➕ 2026-09-18 📅 2026-09-19 ^step-003",
    "- [ ] 未来 ➕ 2026-09-18 📅 2026-09-21 ^step-004",
    "- [-] 已取消 ➕ 2026-09-18 📅 2026-09-20 [closed:: 2026-09-19] ^step-005",
  ].join("\n"));
  const blocked = { ...parse("- [/] 暂停到期 ➕ 2026-09-18 📅 2026-09-20 [carry:: paused] ^step-006", "blocked"),
    path: "workspace/tasks/TASK-202609-002" };
  const result = plan([active, blocked]);
  assert.deepEqual(result.errors, []);
  const header = result.markdown.split("## 任务池")[0];
  assert.match(header, /今日 DDL/);
  assert.match(header, /到期 ↪/);
  assert.match(header, /暂停到期 ↪/);
  assert.doesNotMatch(header, /已完成|已取消|逾期|未来/);
  assert.doesNotMatch(header, /\[ \]/);
  assert.ok(!result.added.some(item => item.path === blocked.path));
  const frozen = plan([], { markdown: result.markdown, manual: true });
  assert.equal(frozen.markdown, result.markdown);
  const empty = plan([]).markdown;
  assert.match(empty, /今天没有到期的未完成 Task Todo/);
  assert.equal(plan([active], { markdown: result.markdown, date: "2026-09-21", manual: true }).markdown, result.markdown);
  assert.equal(plan([active], { markdown: template.replace("status: open", "status: closed") }).markdown, template.replace("status: open", "status: closed"));
  const bad = plan([parse("- [ ] 日期非法 ➕ 2026-09-18 📅 2026-02-30 ^step-001")]);
  assert.ok(bad.errors.length);
  assert.equal(bad.markdown, template);
  const duplicate = template.replace("<!-- task-ddl:pending -->", "<!-- task-ddl:pending -->\n<!-- task-ddl:pending -->");
  assert.equal(plan([active], { markdown: duplicate }).markdown, duplicate);
});
