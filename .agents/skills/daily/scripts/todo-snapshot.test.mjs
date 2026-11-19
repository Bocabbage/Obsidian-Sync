import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { mkdtempSync, mkdirSync, copyFileSync, writeFileSync, readFileSync, rmSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { execFileSync } from "node:child_process";
const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../../..");
const m = createRequire(import.meta.url)(root + "/agents/views/overview/_views/todo-pool/model.cjs");
const path = "workspace/todos/2026/2026-09.md";
const empty = "---\ntype: todo-log\nperiod: 2026-09\n---\n\n## WORK\n\n## LIFE\n";

test("later completion remains pending in earlier Daily; future additions stay absent", () => {
  const text = empty + "\n- [x] Earlier ➕ 2026-09-18 ✅ 2026-09-20 ^todo-20260918-01\n- [ ] Later ➕ 2026-09-21\n";
  const items = m.parseTodos(text, path);
  assert.equal(m.atDate(items, "2026-09-18").pending.length, 1);
  assert.equal(m.atDate(items, "2026-09-20").completed.length, 1);
  assert.equal(m.atDate(items, "2026-10-01").pending[0].label, "Later");
});

test("snapshot keeps labels and states after source edit or deletion", () => {
  const text = m.addTodo(empty, "Original wording", "WORK", "2026-09-18");
  const snapshot = m.makeSnapshot(m.parseTodos(text, path), "2026-09-18", "2026-09-18");
  const saved = m.renderSnapshot(snapshot);
  const edited = text.replace("Original wording", "Changed wording");
  assert.equal(m.atDate(m.parseTodos(edited, path), "2026-09-18").pending[0].label, "Changed wording");
  assert.equal(m.readSnapshot(saved, "2026-09-18").pending[0].label, "Original wording");
  assert.throws(() => m.readSnapshot(saved, "2026-09-19"));
});

test("add and check records exact dates, same-day undo preserves creation, stale clicks rejected", () => {
  let text = m.addTodo(empty, "A todo", "WORK", "2026-09-18");
  const original = m.parseTodos(text, path)[0];
  assert.equal(original.label, "A todo");
  assert.equal(original.group, "WORK");
  assert.match(text, /\^todo-20260918-01\n\n## LIFE/);
  text = m.toggleTodo(text, original, "2026-09-20", true);
  const done = m.parseTodos(text, path)[0];
  assert.equal(done.created, "2026-09-18");
  assert.equal(done.completed, "2026-09-20");
  assert.equal(done.id, original.id);
  assert.throws(() => m.toggleTodo(text, original, "2026-09-20", true));
  assert.throws(() => m.toggleTodo(text, done, "2026-09-21", false));
  assert.equal(m.parseTodos(m.toggleTodo(text, done, "2026-09-20", false), path)[0].completed, "");
});

test("missing dates are reported, not reconstructed from a month or current status", () => {
  const text = empty + "\n- [ ] Unknown creation\n- [x] Unknown completion ➕ 2026-09-18\n";
  const items = m.parseTodos(text, path);
  assert.equal(m.atDate(items, "2026-09-18").unknown.length, 2);
  assert.throws(() => m.makeSnapshot(items, "2026-09-18"), /日期不完整/);
});

test("cancel/transfer and month boundary retain earlier pending states", () => {
  const items = m.parseTodos(empty + "\n- [>] Promoted ➕ 2026-09-30 [closed:: 2026-10-02]\n- [-] Cancelled ➕ 2026-09-30 [closed:: 2026-10-01]\n", path);
  assert.equal(m.atDate(items, "2026-09-30").pending.length, 2);
  assert.equal(m.atDate(items, "2026-10-01").closed.length, 1);
  assert.equal(m.atDate(items, "2026-10-02").pending.length, 0);
});

test("Shanghai date and invalid dates are explicit", () => {
  assert.equal(m.shanghaiDate(new Date("2026-09-19T16:01:00Z")), "2026-09-20");
  for (const date of ["2026-02-30", "2026-99-99", "", "2026-9-1"]) assert.equal(m.validDate(date), false);
});

test("CLI reuses a saved snapshot; only explicit refresh reconstructs from edited sources", () => {
  const fixture = mkdtempSync(resolve(tmpdir(), "obsidian-todo-test-"));
  try {
    const date = "2020-09-18";
    const daily = resolve(fixture, "workspace/daily/2020/2020-09/2020-09-18.daily.md");
    const todo = resolve(fixture, "workspace/todos/2020/2020-09.md");
    const model = resolve(fixture, "agents/views/overview/_views/todo-pool/model.cjs");
    const snapshot = resolve(fixture, m.snapshotPath(date));
    for (const dir of [resolve(fixture, "agents/schema"), ...[daily, todo, model, snapshot].map(dirname)]) mkdirSync(dir, { recursive: true });
    assert.equal(existsSync(resolve(fixture, "schema")), false, "CLI must find a Vault without a root-level schema directory");
    copyFileSync(resolve(root, "agents/views/overview/_views/todo-pool/model.cjs"), model);
    writeFileSync(daily, `---\ntype: daily\ndate: ${date}\n---\n`);
    writeFileSync(todo, m.addTodo(empty, "Original wording", "LIFE", date));
    const run = (...args) => execFileSync(process.execPath, [resolve(dirname(fileURLToPath(import.meta.url)), "todo-snapshot.mjs"), "--file", daily, ...args], { encoding: "utf8" });
    const saved = run();
    writeFileSync(snapshot, saved);
    writeFileSync(todo, m.addTodo(empty, "Edited wording", "LIFE", date));
    assert.equal(run(), saved);
    assert.equal(m.readSnapshot(run("--refresh"), date).pending[0].label, "Edited wording");
    assert.equal(JSON.parse(run("--format", "json")).pending[0].label, "Original wording");
  } finally {
    rmSync(fixture, { recursive: true, force: true });
  }
});

test("creation dates and date-bound commitments form today, overdue and regular groups", () => {
  let text = m.addTodo(empty, "Routine", "WORK", "2026-09-18");
  text = m.addTodo(text, "Today", "WORK", "2026-09-18", "2026-09-20");
  text = m.addTodo(text, "Overdue", "LIFE", "2026-09-18", "2026-09-19");
  text = m.addTodo(text, "Future", "LIFE", "2026-09-18", "2026-10-01");
  const result = m.atDate(m.parseTodos(text, path), "2026-09-20");
  const groups = m.pendingGroups(result.pending, result.date);
  assert.deepEqual(groups.today.map(x => x.label), ["Today"]);
  assert.deepEqual(groups.overdue.map(x => x.label), ["Overdue"]);
  assert.deepEqual(groups.regular.map(x => x.label).sort(), ["Future", "Routine"]);
  assert.equal(groups.today[0].created, "2026-09-18");
  assert.throws(() => m.addTodo(empty, "Backdated", "WORK", "2026-09-18", "2026-09-17"));
});

test("rescheduling preserves identity, progress and earlier plans, including clearing a due date", () => {
  let text = m.addTodo(empty, "Keep working", "WORK", "2026-09-18").replace("- [ ]", "- [/]");
  const first = m.parseTodos(text, path)[0];
  text = m.scheduleTodo(text, first, "2026-09-20", "2026-09-20");
  let item = m.parseTodos(text, path)[0];
  assert.deepEqual(item.problems, []);
  assert.equal(item.status, "/");
  assert.equal(item.id, first.id);
  assert.equal(m.atDate([item], "2026-09-19").pending[0].due, "");
  text = m.scheduleTodo(text, item, "2026-09-21", "2026-09-23");
  item = m.parseTodos(text, path)[0];
  assert.equal(m.atDate([item], "2026-09-20").pending[0].due, "2026-09-20");
  text = m.scheduleTodo(text, item, "2026-09-21", "");
  item = m.parseTodos(text, path)[0];
  assert.deepEqual(item.problems, []);
  assert.equal(item.dueHistory.length, 3, "same-day edits share the final daily decision");
  assert.equal(m.atDate([item], "2026-09-21").pending[0].due, "");
  assert.equal(item.label, first.label);
  assert.throws(() => m.scheduleTodo(text, first, "2026-09-22", "2026-09-22"), /原条目已变化/);
  assert.throws(() => m.scheduleTodo(text, item, "2026-09-20", ""), /过去/);
  const done = m.toggleTodo(text, item, "2026-09-22", true);
  assert.throws(() => m.scheduleTodo(done, m.parseTodos(done, path)[0], "2026-09-22", ""), /未完成/);
});

test("malformed due dates and divergent plan histories cannot disappear into regular tasks", () => {
  for (const extra of ["📅 nope", "📅 2026-02-30", "📅", "📅 2026-09-19 📅 2026-09-20", "[due_history:: ]", "[due_history:: 2026-09-18=bad]", "[due_history:: 2026-09-18=2026-09-20]"]) {
    const items = m.parseTodos(empty + `\n- [ ] Invalid ➕ 2026-09-18 ${extra}\n`, path);
    assert.equal(m.atDate(items, "2026-09-20").unknown.length, 1, extra);
    assert.throws(() => m.makeSnapshot(items, "2026-09-20"), /日期不完整/);
  }
});

test("version 2 freezes plan dates while version 1 remains readable without inferred commitments", () => {
  let text = m.addTodo(empty, "Commitment", "WORK", "2026-09-18", "2026-09-20");
  const snapshot = m.makeSnapshot(m.parseTodos(text, path), "2026-09-20", "2026-09-20");
  assert.equal(snapshot.version, 2);
  const saved = m.renderSnapshot(snapshot);
  text = m.scheduleTodo(text, m.parseTodos(text, path)[0], "2026-09-21", "");
  assert.equal(m.readSnapshot(saved, "2026-09-20").pending[0].due, "2026-09-20");
  const legacy = { ...snapshot, version: 1, pending: snapshot.pending.map(({due, ...rest}) => rest) };
  const legacySaved = m.renderSnapshot(legacy);
  assert.equal(m.renderSnapshot(m.readSnapshot(legacySaved, legacy.date)), legacySaved);
  assert.equal(m.readSnapshot(legacySaved, legacy.date).pending[0].due, undefined);
});

test("schedule CLI outputs an inspectable change and never writes the original month", () => {
  const fixture = mkdtempSync(resolve(tmpdir(), "obsidian-schedule-test-"));
  try {
    const date = m.shanghaiDate();
    const folder = resolve(fixture, "workspace/todos", date.slice(0, 4));
    mkdirSync(folder, { recursive: true });
    const file = resolve(folder, date.slice(0, 7) + ".md");
    const original = m.addTodo(empty, "User's task", "LIFE", date);
    writeFileSync(file, original);
    const id = m.parseTodos(original, file)[0].id;
    const proposed = execFileSync(process.execPath, [resolve(dirname(fileURLToPath(import.meta.url)), "todo-schedule.mjs"), "--file", file, "--id", id, "--due", date], { encoding: "utf8" });
    assert.equal(m.parseTodos(proposed, file)[0].due, date);
    assert.equal(readFileSync(file, "utf8"), original);
  } finally { rmSync(fixture, { recursive: true, force: true }); }
});
