import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { execFileSync, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { extractDidaTasks, uniqueRecords, buildSummary, renderMarkdown, renderSnapshotMarkdown, savedMappings, savedSnapshotMappings, snapshotPathFor } from "./dida-focus-summary.mjs";

const sourceA = "aaaaaaaaaaaaaaaaaaaaaaaa";
const sourceB = "bbbbbbbbbbbbbbbbbbbbbbbb";
const project = "cccccccccccccccccccccccc";
const local = (n) => `workspace/tasks/TASK-202609-00${n}`;
const url = (id) => `https://dida365.com/webapp/#p/${project}/tasks/${id}`;
const filledMood = "> [!note] 今日心情\n> 平静。\n\n";

function fixture(t) {
  const root = mkdtempSync(join(tmpdir(), "obsidian-focus-test-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  mkdirSync(join(root, "agents/schema"), { recursive: true });
  assert.equal(existsSync(join(root, "schema")), false, "fixture must use only the migrated schema location");
  mkdirSync(join(root, "workspace/tasks"), { recursive: true });
  const daily = join(root, "workspace/daily/2026/2026-09/2026-09-14.daily.md");
  mkdirSync(dirname(daily), { recursive: true });
  const writeTask = (n, id = sourceA) => writeFileSync(join(root, local(n) + ".md"),
    `---\ntype: task\ntask_id: TASK-202609-00${n}\ntitle: Task ${n}\ndida_url: ${url(id)}\n---\n`);
  writeTask(1); writeTask(2); writeTask(3, sourceB);
  return { root, daily, writeTask };
}

function dailyText(...numbers) {
  return `---\ntype: daily\ndate: 2026-09-14\n---\n## 跨日任务\n${numbers.map((n) => `- [x] [[${local(n)}|Task ${n}]]`).join("\n")}\n## 产生的材料\n`;
}

const timing = (ids, duration = 60000, id = "r1") => ({ id, duration, tasks: ids.map((taskId) => ({ taskId })) });
const summary = (tasks, records) => buildSummary(tasks, [], uniqueRecords(records, "timing"), "/nonexistent-dida");
const persisted = (text, result, mappings, date = "2026-09-14") => text +
  `\n<!-- dida-focus:start -->\n${renderMarkdown({ ...result, mappings, date })}\n<!-- dida-focus:end -->\n`;

test("WORK/LIFE subheadings preserve all task-section mappings and exclude materials", (t) => {
  const f = fixture(t);
  const text = `## 跨日任务\n### 1. 高优先级\n#### WORK\n- [x] [[${local(1)}]]\n#### LIFE\n- [x] [[${local(3)}]]\n### 2. 低优先级\n#### WORK\n#### LIFE\n- [>] [[${local(1)}]]\n## 当日任务\n### WORK\n- [x] [DIDA](${url(sourceA)})\n### LIFE\n- [x] [DIDA](${url(sourceB)})\n## 产生的材料\n- [ ] [[${local(2)}]]\n`;
  const tasks = extractDidaTasks(text, f.daily);
  assert.deepEqual(tasks.map((task) => task.localPath).sort(), [local(1), local(3)]);
  assert.equal(tasks.every((task) => task.candidates.length === 1), true);
});

test("nested candidate pool is excluded from review and focus attribution", (t) => {
  const f = fixture(t);
  const text = `## 跨日任务\n- [[${local(1)}|Task 1]]\n  - [x] 执行 ↪ [[${local(1)}#^step-001|待办]]\n## 当日任务\n### 今日安排\n#### WORK\n- [x] 已办好\n#### LIFE\n### 小任务待办池\n- [ ] [[${local(3)}|只是候选]]\n- [>] 无需收口的候选\n`;
  assert.deepEqual(extractDidaTasks(text, f.daily).map(task => task.localPath), [local(1)]);
  // This legacy fixture has no Task Todo: keep its historical entity-level link for the CLI closure check.
  const legacy = text.replace(` ↪ [[${local(1)}#^step-001|待办]]`, "");
  writeFileSync(f.daily, filledMood + legacy);
  const result = spawnSync(process.execPath, [fileURLToPath(new URL("./daily-review-check.mjs", import.meta.url)), "--file", f.daily, "--format", "json"], { encoding: "utf8" });
  assert.equal(result.status, 0);
  assert.equal(JSON.parse(result.stdout).closeable, true);
});

test("review checks WORK and LIFE; Task ownership does not cross a subgroup heading", (t) => {
  const f = fixture(t);
  const script = fileURLToPath(new URL("./daily-review-check.mjs", import.meta.url));
  const text = `## 跨日任务\n### 1. 高优先级\n#### WORK\n- [x] [[${local(1)}]]\n  - [>] Valid child\n#### LIFE\n  - [>] Orphan child\n### 2. 低优先级\n#### WORK\n- [ ] Work pending\n#### LIFE\n- [/] Life pending\n## 当日任务\n### WORK\n- [ ] Work inline\n### LIFE\n- [ ] Life inline\n## 待分流\n- [ ] Not a scheduled task\n`;
  writeFileSync(f.daily, filledMood + text);
  const result = spawnSync(process.execPath, [script, "--file", f.daily, "--format", "json"], { encoding: "utf8" });
  assert.equal(result.status, 2);
  const report = JSON.parse(result.stdout);
  assert.equal(report.unresolved.length, 4);
  assert.deepEqual(report.danglingHandoffs.map((item) => item.text), ["Orphan child"]);
  assert.equal(readFileSync(f.daily, "utf8"), filledMood + text);
});

test("non-checkbox Task list title owns its indented handoffs", (t) => {
  const f = fixture(t);
  const script = fileURLToPath(new URL("./daily-review-check.mjs", import.meta.url));
  const text = [
    "## 跨日任务",
    "- [[workspace/tasks/TASK-202609-001|Task 1]]",
    "  - [>] Continue tomorrow",
    "## 当日任务",
  ].join("\n");
  writeFileSync(f.daily, filledMood + text);
  const result = spawnSync(process.execPath, [script, "--file", f.daily, "--format", "json"], { encoding: "utf8" });
  assert.equal(result.status, 0);
  assert.equal(JSON.parse(result.stdout).closeable, true);
});

test("inline handoff accepts an exact Todo block link but rejects a page-only Todo link", (t) => {
  const f = fixture(t);
  const script = fileURLToPath(new URL("./daily-review-check.mjs", import.meta.url));
  const valid = [
    "## 当日任务",
    "- [>] 预约检查 → [[workspace/todos/2026/2026-09#^todo-20260918-01|待办池]]",
  ].join("\n");
  writeFileSync(f.daily, filledMood + valid);
  const accepted = spawnSync(process.execPath, [script, "--file", f.daily, "--format", "json"], { encoding: "utf8" });
  assert.equal(accepted.status, 0);
  assert.equal(JSON.parse(accepted.stdout).closeable, true);

  const pageOnly = "## 当日任务\n- [>] 预约检查 → [[workspace/todos/2026/2026-09|待办池]]\n";
  writeFileSync(f.daily, filledMood + pageOnly);
  const rejected = spawnSync(process.execPath, [script, "--file", f.daily, "--format", "json"], { encoding: "utf8" });
  assert.equal(rejected.status, 2);
  assert.equal(JSON.parse(rejected.stdout).danglingHandoffs.length, 1);
});

test("one local Task: repeated occurrences and direct source deduplicate; only task sections count", (t) => {
  const f = fixture(t);
  const text = dailyText(1, 1).replace("## 产生的材料", `- [x] [DIDA](${url(sourceA)})\n## 产生的材料`) + `[[${local(2)}]] ${url(sourceB)}`;
  const tasks = extractDidaTasks(text, f.daily);
  assert.equal(tasks.length, 1);
  assert.equal(tasks[0].candidates.length, 1);
  const record = timing([sourceA]);
  const s = summary(tasks, [record, record]);
  assert.equal(s.totalSeconds, 60); // Short durations are milliseconds, not seconds.
  assert.equal(s.tasks[0].totalSeconds, 60);
  assert.equal(s.records.length, 1);
});

test("parent and child sources on one local Task aggregate once per focus record", (t) => {
  const f = fixture(t);
  writeFileSync(join(f.root, local(1) + ".md"), `---\ntype: task\ntask_id: TASK-202609-001\ntitle: One local task\ndida_urls:\n  - "${url(sourceA)}"\n  - "${url(sourceB)}"\n  - "${url(sourceB)}"\n---\n`);
  const mappings = extractDidaTasks(dailyText(1), f.daily);
  assert.equal(mappings.length, 2);
  const records = [timing([sourceA], 60000, "parent"), timing([sourceB], 120000, "child"), timing([sourceA, sourceB], 180000, "both")];
  const s = summary(mappings, records);
  assert.equal(s.tasks.length, 1);
  assert.equal(s.totalSeconds, 360);
  assert.equal(s.tasks[0].totalSeconds, 360);
  assert.equal(s.unallocatedSeconds, 0);
  assert.equal(s.tasks[0].sources.length, 2);
  assert.equal(s.records.every((record) => record.attribution === "local"), true);
  assert.ok(renderMarkdown({ ...s, date: "2026-09-14" }).includes(url(sourceB)));
});

test("many-to-many shared child retains ambiguity and manual assignment is added once", (t) => {
  const f = fixture(t);
  writeFileSync(join(f.root, local(1) + ".md"), `---\ntype: task\ntask_id: TASK-202609-001\ndida_urls: ["${url(sourceA)}", "${url(sourceB)}"]\n---\n`);
  const mappings = extractDidaTasks(dailyText(1, 3), f.daily);
  const records = uniqueRecords([timing([sourceA], 60000, "a"), timing([sourceB], 120000, "b"), timing([sourceA, sourceB], 180000, "both")], "timing");
  const s = buildSummary(mappings, [], records, "/nonexistent-dida");
  assert.equal(s.totalSeconds, 360);
  assert.equal(s.unallocatedSeconds, 300);
  const assigned = buildSummary(mappings, [], records, "/nonexistent-dida", { "timing:b": { localPath: local(3), source: "user_confirmed" }, "timing:both": { localPath: local(1), source: "user_confirmed" } });
  assert.equal(assigned.tasks.find((task) => task.localPath === local(1)).totalSeconds, 240);
  assert.equal(assigned.tasks.find((task) => task.localPath === local(3)).totalSeconds, 120);
  assert.equal(assigned.tasks.reduce((sum, task) => sum + task.totalSeconds, 0), assigned.totalSeconds);
  assert.equal(assigned.unallocatedSeconds, 0);
});

test("malformed or mixed mapping fields fail explicitly instead of omitting sources", (t) => {
  const f = fixture(t);
  for (const fields of [`dida_urls: not-a-list`, `dida_urls:\n  - bogus`, `dida_urls: []\ndida_url: ${url(sourceA)}`]) {
    writeFileSync(join(f.root, local(1) + ".md"), `---\ntype: task\n${fields}\n---\n`);
    assert.throws(() => extractDidaTasks(dailyText(1), f.daily));
  }
});

test("same source on different days belongs to different local Tasks, not duplicated quarter totals", (t) => {
  const f = fixture(t);
  const a = extractDidaTasks(dailyText(1), f.daily);
  const b = extractDidaTasks(dailyText(2), f.daily);
  const first = summary(a, [timing([sourceA], 60000, "day1")]);
  const second = summary(b, [timing([sourceA], 120000, "day2")]);
  assert.deepEqual(first.records[0].localPaths, [local(1)]);
  assert.deepEqual(second.records[0].localPaths, [local(2)]);
  assert.equal(first.tasks[0].totalSeconds, 60);
  assert.equal(second.tasks[0].totalSeconds, 120);
  assert.equal(first.totalSeconds + second.totalSeconds, 180);
});

test("same-day shared source preserves both candidates and has no silent owner", (t) => {
  const f = fixture(t);
  const tasks = extractDidaTasks(dailyText(1, 2), f.daily);
  assert.equal(tasks.length, 1);
  assert.equal(tasks[0].localPath, undefined);
  assert.equal(tasks[0].candidates.length, 2);
  const s = summary(tasks, [timing([sourceA])]);
  assert.equal(s.totalSeconds, 60);
  assert.equal(s.tasks[0].totalSeconds, 0);
  assert.equal(s.unallocatedSeconds, 60);
  const output = renderMarkdown({ ...s, mappings: tasks, date: "2026-09-14" });
  assert.ok(output.includes(local(1)) && output.includes(local(2)) && output.includes("待归属"));
});

test("one record referencing multiple sources is counted once and remains unallocated", (t) => {
  const f = fixture(t);
  const tasks = extractDidaTasks(dailyText(1, 3), f.daily);
  const s = summary(tasks, [timing([sourceA, sourceB])]);
  assert.equal(s.totalSeconds, 60);
  assert.equal(s.unallocatedSeconds, 60);
  assert.equal(s.tasks.reduce((sum, task) => sum + task.totalSeconds, 0), 0);
});

test("user-confirmed attribution assigns a shared record to one candidate exactly once", (t) => {
  const f = fixture(t);
  const tasks = extractDidaTasks(dailyText(1, 3), f.daily);
  const s = buildSummary(
    tasks,
    [],
    uniqueRecords([timing([sourceA, sourceB])], "timing"),
    "/nonexistent-dida",
    { "timing:r1": { localPath: local(1), source: "user_confirmed" } },
  );
  assert.equal(s.totalSeconds, 60);
  assert.equal(s.unallocatedSeconds, 0);
  assert.equal(s.tasks.find((task) => task.localPath === local(1)).totalSeconds, 60);
  assert.equal(s.tasks.find((task) => task.localPath === local(3)).totalSeconds, 0);
  assert.deepEqual(s.records[0].localPaths, [local(1)]);
  assert.equal(s.records[0].manualAttribution, true);
  assert.match(renderSnapshotMarkdown({ ...s, mappings: tasks, date: "2026-09-14" }, f.daily), /manualAttributions/);
});

test("sidecar snapshot roundtrip retains historical mapping despite current entity edits", (t) => {
  const f = fixture(t);
  const text = dailyText(1);
  const tasks = extractDidaTasks(text, f.daily);
  const result = { ...summary(tasks, [timing([sourceA])]), mappings: tasks, date: "2026-09-14" };
  const snapshotPath = snapshotPathFor(f.daily, "2026-09-14");
  mkdirSync(dirname(snapshotPath), { recursive: true });
  writeFileSync(snapshotPath, renderSnapshotMarkdown(result, f.daily));
  f.writeTask(1, sourceB);
  assert.equal(savedSnapshotMappings(f.daily, "2026-09-14")[0].taskId, sourceA);
  assert.equal(extractDidaTasks(text, f.daily)[0].taskId, sourceB);
  assert.equal(savedSnapshotMappings(f.daily, "2026-09-15"), null);
  assert.equal(renderMarkdown(result).includes("snapshot"), false);
});

test("legacy inline HTML snapshots still parse", (t) => {
  const f = fixture(t);
  const text = dailyText(1);
  const tasks = extractDidaTasks(text, f.daily);
  const rendered = renderMarkdown({ ...summary(tasks, [timing([sourceA])]), mappings: tasks, date: "2026-09-14" });
  const snapshot = JSON.stringify({ version: 1, date: "2026-09-14", timeZone: "Asia/Shanghai", mappings: tasks, records: [] });
  const legacy = `<!-- dida-focus:start -->\n${rendered}\n<!-- dida-focus:snapshot ${snapshot} -->\n<!-- dida-focus:end -->`;
  assert.equal(savedMappings(legacy, "2026-09-14")[0].taskId, sourceA);
});

test("legacy summaries require explicit migration; empty template is accepted", () => {
  assert.throws(() => savedMappings("<!-- dida-focus:start -->\n- 合计：1h\n<!-- dida-focus:end -->", "2026-09-14"), /Legacy/);
  assert.equal(savedMappings("<!-- dida-focus:start -->\n<!-- template -->\n<!-- dida-focus:end -->", "2026-09-14"), null);
});

test("direct DIDA, no mapping, zero focus and separate focus types remain supported", (t) => {
  const f = fixture(t);
  const direct = extractDidaTasks(`## 当日任务\n- [x] [Example](${url(sourceA)})\n`, f.daily);
  const s = summary(direct, []);
  assert.equal(s.tasks[0].totalSeconds, 0);
  assert.equal(s.tasks[0].title, "Example");
  const both = buildSummary(direct, uniqueRecords([timing([sourceA])], "pomodoro"), uniqueRecords([timing([sourceA])], "timing"), "/nonexistent-dida");
  assert.equal(both.totalSeconds, 120);
  assert.equal(both.pomodoroCount, 1);
  writeFileSync(join(f.root, local(1) + ".md"), "---\ntype: task\ntask_id: TASK-202609-001\n---\n");
  assert.equal(extractDidaTasks(dailyText(1), f.daily).length, 0);
  assert.match(renderSnapshotMarkdown({ ...summary([], []), mappings: [], date: "2026-09-14" }, f.daily), /DIDA Focus Snapshot/);
});

test("CLI roundtrip queries one-day window, persists ownership, and leaves Daily untouched", (t) => {
  const f = fixture(t);
  const binary = join(f.root, "mock-dida");
  writeFileSync(binary, `#!${process.execPath}\nconst args=process.argv.slice(2); if(args[0]!=="focus" || args[args.indexOf("--from")+1]!=="2026-09-14T00:00:00+08:00" || args[args.indexOf("--to")+1]!=="2026-09-15T00:00:00+08:00") process.exit(2); console.log(JSON.stringify(args.includes("timing") ? [${JSON.stringify(timing([sourceA]))}] : []));\n`, { mode: 0o700 });
  const script = fileURLToPath(new URL("./dida-focus-summary.mjs", import.meta.url));
  const args = [script, "--file", f.daily, "--dida-bin", binary];
  const text = dailyText(1);
  writeFileSync(f.daily, text);
  const out = execFileSync(process.execPath, args, { encoding: "utf8" });
  const snapshotPath = snapshotPathFor(f.daily, "2026-09-14");
  mkdirSync(dirname(snapshotPath), { recursive: true });
  writeFileSync(snapshotPath, execFileSync(process.execPath, [...args, "--format", "snapshot"], { encoding: "utf8" }));
  assert.equal(readFileSync(f.daily, "utf8"), text);
  writeFileSync(f.daily, text + `\n<!-- dida-focus:start -->\n${out}<!-- dida-focus:end -->`);
  f.writeTask(1, sourceB);
  const repeated = JSON.parse(execFileSync(process.execPath, [...args, "--format", "json"], { encoding: "utf8" }));
  assert.equal(repeated.tasks[0].taskId, sourceA);
  assert.equal(repeated.totalSeconds, 60);
  assert.equal(repeated.mappingWarnings.length, 1);
  const refreshed = JSON.parse(execFileSync(process.execPath, [...args, "--refresh-mappings", "--format", "json"], { encoding: "utf8" }));
  assert.equal(refreshed.tasks[0].taskId, sourceB);
  assert.equal(refreshed.mappingWarnings.length, 0);
  const noLogin = spawnSync(process.execPath, [script, "--file", f.daily, "--dida-bin", "/nonexistent-dida"], { encoding: "utf8" });
  assert.equal(noLogin.status, 1);
  assert.equal(noLogin.stdout, "");
  assert.match(noLogin.stderr, /DIDA command failed/);
});
