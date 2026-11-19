import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const script = fileURLToPath(new URL("./daily-review-check.mjs", import.meta.url));
const header = "---\ntype: daily\ndate: 2026-10-03\nstatus: open\n---\n\n# 2026-10-03\n\n";
const done = "\n\n## 跨日任务\n- [x] 已办好\n\n## 碎碎念\n今天过得还不错。\n";

function check(t, markdown, format = "json") {
  const root = mkdtempSync(join(tmpdir(), "daily-mood-check-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  mkdirSync(join(root, "workspace"));
  const file = join(root, "workspace", "daily.md");
  writeFileSync(file, markdown);
  const result = spawnSync(process.execPath, [script, "--file", file, "--format", format], { encoding: "utf8" });
  assert.equal(result.stderr, "");
  assert.equal(readFileSync(file, "utf8"), markdown, "check must never write a Daily, including a closed historical page");
  return { ...result, report: format === "json" ? JSON.parse(result.stdout) : null };
}

for (const [name, entry] of [
  ["missing callout", ""],
  ["heading only", "> [!note] 今日心情"],
  ["blank lines and invisible whitespace", "> [!note] 今日心情\n>  \t\u200B\u2060\n>"],
  ["comment only", "> [!note] 今日心情\n> <!-- 今天的心情\n> 还未填写 -->"],
  ["empty Markdown markers", "> [!note] 今日心情\n> - [ ]\n> - [x]\n> ** **"],
  ["following navigation is outside the mood", "> [!note] 今日心情\n>\n\n> [[workspace/daily/_Index|Daily 总览]]"],
  ["next callout is not mood content", "> [!note] 今日心情\n>\n> [!tip] 提醒\n> 今天要做的事"],
  ["code example outside the callout", "```md\n> [!note] 今日心情\n> 很开心\n```"],
  ["quoted code example", "> ```md\n> [!note] 今日心情\n> 很开心\n> ```"],
  ["code example inside the callout", "> [!note] 今日心情\n> ```md\n> 示例\n> ```"],
]) {
  test(`finished tasks still cannot close with ${name}`, t => {
    const { status, report } = check(t, header + entry + done);
    assert.equal(status, 2);
    assert.equal(report.closeable, false);
    assert.equal(report.moodIssues.length, 1);
    assert.deepEqual(report.unresolved, []);
  });
}

for (const entry of [
  "> [!note] 今日心情\n> 有点累，整体还好。",
  "> [!note]- 今日心情\n> 🙂",
  "> [!note]+ 今日心情\n>\n> - **平静**",
  "> [!note] 今日心情\r\n> <!-- 注释不算 -->\r\n> 还不错。",
]) {
  test(`filled mood permits closing: ${entry.split(/\r?\n/).at(-1)}`, t => {
    const { status, report } = check(t, header + entry + done);
    assert.equal(status, 0);
    assert.equal(report.closeable, true);
    assert.deepEqual(report.moodIssues, []);
  });
}

test("filled mood does not bypass unfinished tasks", t => {
  const { status, report } = check(t, header + "> [!note] 今日心情\n> 平静" + done.replace("[x]", "[ ]"));
  assert.equal(status, 2);
  assert.equal(report.closeable, false);
  assert.equal(report.unresolved.length, 1);
  assert.deepEqual(report.moodIssues, []);
});

test("actual empty template gives an actionable Markdown message", t => {
  const template = readFileSync(new URL("../../../../agents/schema/templates/daily-template.md", import.meta.url), "utf8")
    .replaceAll("{{date:YYYY-MM-DD}}", "2026-10-03");
  const { status, stdout } = check(t, template, "markdown");
  assert.equal(status, 2);
  assert.match(stdout, /今日心情.*尚未填写.*补写/);
});

test("closed historical Daily is reported without mutation", t => {
  const { status, report } = check(t, header.replace("status: open", "status: closed") + done);
  assert.equal(status, 2);
  assert.equal(report.closeable, false);
  assert.match(report.moodIssues[0].reason, /缺少/);
});

function checkPool(t, sources, { date = "2026-10-03", snapshot = "", closed = false } = {}) {
  const root = mkdtempSync(join(tmpdir(), "daily-pool-check-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  mkdirSync(join(root, "workspace/todos/2026"), { recursive: true });
  const file = join(root, "workspace", "daily.md");
  const markdown = header.replaceAll("2026-10-03", date).replace("status: open", closed ? "status: closed" : "status: open") + "> [!note] 今日心情\n> 平静" + done;
  writeFileSync(file, markdown);
  for (const [month, rows] of Object.entries(sources)) writeFileSync(join(root, "workspace/todos/2026", month + ".md"), "---\ntype: todo-log\n---\n## WORK\n" + rows);
  if (snapshot) {
    const folder = join(root, "workspace/daily/_meta/todos", date.slice(0, 4), date.slice(0, 7));
    mkdirSync(folder, { recursive: true });
    writeFileSync(join(folder, date + ".todos.md"), snapshot);
  }
  const result = spawnSync(process.execPath, [script, "--file", file, "--format", "json"], { encoding: "utf8" });
  assert.equal(result.stderr, "");
  assert.equal(readFileSync(file, "utf8"), markdown);
  for (const [month, rows] of Object.entries(sources)) assert.equal(readFileSync(join(root, "workspace/todos/2026", month + ".md"), "utf8"), "---\ntype: todo-log\n---\n## WORK\n" + rows);
  return { ...result, report: JSON.parse(result.stdout) };
}

test("review blocks today and overdue across months, without counting regular or future commitments", t => {
  const { status, report } = checkPool(t, {
    "2026-09": "- [/] Overdue ➕ 2026-09-30 📅 2026-10-02 ^todo-20260930-01\n",
    "2026-10": "- [ ] Today ➕ 2026-10-03 📅 2026-10-03\n- [ ] Regular ➕ 2026-10-03\n- [ ] Future ➕ 2026-10-03 📅 2026-10-04\n",
  });
  assert.equal(status, 2);
  assert.deepEqual(report.smallTaskIssues.map(x => x.text), ["Overdue", "Today"]);
  assert.deepEqual(report.unresolved, [], "pool items are not duplicated as occurrences");
});

test("completed, cancelled, transferred and explicitly rescheduled commitments allow closing", t => {
  const { status, report } = checkPool(t, { "2026-10": [
    "- [x] Done ➕ 2026-10-01 📅 2026-10-03 ✅ 2026-10-03",
    "- [-] Cancelled ➕ 2026-10-01 📅 2026-10-03 [closed:: 2026-10-03]",
    "- [>] Transferred ➕ 2026-10-01 📅 2026-10-03 [closed:: 2026-10-03]",
    "- [ ] Moved ➕ 2026-10-01 📅 2026-10-04 [due_history:: 2026-10-01=2026-10-03; 2026-10-03=2026-10-04]",
    "- [ ] Cleared ➕ 2026-10-01 [due_history:: 2026-10-01=2026-10-03; 2026-10-03=none]",
  ].join("\n") });
  assert.equal(status, 0);
  assert.deepEqual(report.smallTaskIssues, []);
});

test("invalid commitment metadata fails review rather than being treated as regular", t => {
  const { status, report } = checkPool(t, { "2026-10": "- [ ] Invalid ➕ 2026-10-03 📅 2026-02-30\n" });
  assert.equal(status, 2);
  assert.equal(report.smallTaskIssues.length, 1);
  assert.match(report.smallTaskIssues[0].reason, /截止日期/);
});

test("past review does not accept a later completion or a later reschedule as the earlier day's decision", t => {
  const { status, report } = checkPool(t, { "2026-09": [
    "- [x] Later completion ➕ 2026-09-18 📅 2026-09-20 ✅ 2026-09-21",
    "- [ ] Later decision ➕ 2026-09-18 [due_history:: 2026-09-18=2026-09-20; 2026-09-21=none]",
  ].join("\n") }, { date: "2026-09-20" });
  assert.equal(status, 2);
  assert.equal(report.smallTaskIssues.length, 2);
});

test("saved historical plans win over later source edits; old snapshots get no invented obligations", t => {
  const base = { version: 2, date: "2026-09-20", captured: "2026-09-20", mode: "review", pending: [{ path: "workspace/todos/2026/2026-09.md", label: "Saved", created: "2026-09-18", due: "2026-09-20" }], completed: [], closed: [] };
  const rows = { "2026-09": "- [ ] Now regular ➕ 2026-09-18\n" };
  const result = checkPool(t, rows, { date: base.date, closed: true, snapshot: "<!-- todo-snapshot " + JSON.stringify(base) + " -->" });
  assert.equal(result.status, 2);
  assert.equal(result.report.smallTaskIssues[0].text, "Saved");
  const legacy = { ...base, version: 1, pending: base.pending.map(({due, ...item}) => item) };
  const old = checkPool(t, rows, { date: base.date, closed: true, snapshot: "<!-- todo-snapshot " + JSON.stringify(legacy) + " -->" });
  assert.equal(old.status, 0);
});

test("DDL review finds unplanned and paused deadlines, skips finished/future, preserves closed history", t => {
  const root = mkdtempSync(join(tmpdir(), "task-ddl-review-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  mkdirSync(join(root, "workspace/tasks"), { recursive: true });
  const file = join(root, "workspace/daily.md");
  const task = join(root, "workspace/tasks/TASK-202609-001.md");
  writeFileSync(task, [
    "---", "type: task", "status: blocked", "created: 2026-09-01", "---", "## Todo",
    "- [ ] 到期 ➕ 2026-09-01 📅 2026-10-03 ^step-001",
    "- [/] 暂停逾期 ➕ 2026-09-01 [carry:: paused] 📅 2026-10-02 ^step-002",
    "- [x] 完成 ➕ 2026-09-01 📅 2026-10-02 ✅ 2026-10-02 ^step-003",
    "- [ ] 未来 ➕ 2026-09-01 📅 2026-10-04 ^step-004",
  ].join("\n"));
  const run = markdown => {
    writeFileSync(file, markdown);
    const result = spawnSync(process.execPath, [script, "--file", file, "--format", "json"], { encoding: "utf8" });
    assert.equal(result.stderr, "");
    assert.equal(readFileSync(file, "utf8"), markdown);
    return JSON.parse(result.stdout);
  };
  const markdown = header + "> [!note] 今日心情\n> 🙂" + done;
  const report = run(markdown);
  assert.equal(report.closeable, true);
  assert.deepEqual(report.taskDeadlines.map(item => [item.id, item.state]), [
    ["step-001", "今日到期"], ["step-002", "已逾期"],
  ]);
  assert.deepEqual(run(markdown.replace("status: open", "status: closed")).taskDeadlines, []);
  writeFileSync(task, readFileSync(task, "utf8").replace("📅 2026-10-03", "📅 2026-02-30"));
  assert.equal(run(markdown).closeable, false);
  assert.equal(run(markdown).taskDeadlineIssues.length, 1);
});
