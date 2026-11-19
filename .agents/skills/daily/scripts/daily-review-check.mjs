#!/usr/bin/env node

import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { execFileSync } from "node:child_process";
const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../../..");
const model = createRequire(import.meta.url)(join(root, ".obsidian/plugins/vault-daily-todos/model.cjs"));
const todoModel = createRequire(import.meta.url)(join(root, "agents/views/overview/_views/todo-pool/model.cjs"));
const groupModel = createRequire(import.meta.url)(join(root, "agents/views/overview/_views/task-pool/model.cjs"));
const exerciseModel = createRequire(import.meta.url)(join(root, "agents/views/overview/_views/exercise-history/model.cjs"));

const TASK_ENTITY_RE = /\[\[workspace\/tasks\/TASK-\d{6}-\d{3}(?:\|[^\]]+)?\]\]/;
const TODO_ITEM_RE = /\[\[workspace\/todos\/\d{4}\/\d{4}-\d{2}(?:\.md)?#\^todo-\d{8}-\d{2,}(?:\|[^\]]+)?\]\]/;

function usage() {
  return [
    "Usage:",
    "  node daily-review-check.mjs --file <daily.md> [--format markdown|json]",
  ].join("\n");
}

function parseArgs(argv) {
  const options = { file: "", format: "markdown" };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const value = argv[index + 1];
    if (arg === "--file" && value) {
      options.file = value;
      index += 1;
    } else if (arg === "--format" && value) {
      options.format = value;
      index += 1;
    } else if (arg === "--help" || arg === "-h") {
      process.stdout.write(usage() + "\n");
      process.exit(0);
    } else {
      throw new Error("Unknown or incomplete argument: " + arg);
    }
  }
  if (!options.file) throw new Error("--file is required");
  if (!["markdown", "json"].includes(options.format)) {
    throw new Error("--format must be markdown or json");
  }
  return options;
}

function checkMood(markdown) {
  // Keep line numbers, but do not treat YAML, comments or code examples as an entry.
  const body = markdown.replace(/^---\r?\n[\s\S]*?\r?\n---(?:\r?\n|$)/,
    frontmatter => frontmatter.replace(/[^\r\n]/g, ""));
  let inMood = false, firstLine = null, quotedFence = "";
  for (const { raw, text, index } of model.bodyLines(body)) {
    if (!/^ {0,3}>/.test(raw)) { inMood = false; quotedFence = ""; continue; }
    const quote = text.match(/^ {0,3}>[ \t]?(.*)$/);
    if (!quote) continue;
    const content = quote[1].trim();
    const token = content.match(/^(`{3,}|~{3,})/)?.[1];
    if (token) {
      if (!quotedFence) quotedFence = token;
      else if (token[0] === quotedFence[0] && token.length >= quotedFence.length) quotedFence = "";
      continue;
    }
    if (quotedFence) continue;
    if (/^\[![^\]]+\][+-]?\s+今日心情\s*$/.test(content)) {
      inMood = true;
      firstLine ??= index + 1;
      continue;
    }
    if (/^\[!/.test(content)) { inMood = false; continue; }
    // Empty list/checkbox/formatting markers and invisible whitespace are not a mood.
    const value = content.replace(/^(?:[-+*]\s+|\d+[.)]\s+)(?:\[[ xX/>-]\]\s*)?/, "");
    if (inMood && value.replace(/[\s\u200B-\u200D\u2060\uFEFF*_`~#\[\]()>+\-]/g, "")) return [];
  }
  return [{ line: firstLine, reason: firstLine === null
    ? "缺少“今日心情” Callout，请补写后再完成复盘。"
    : "“今日心情”尚未填写，请补写后再完成复盘。" }];
}

function checkSmallTasks(markdown, file, vaultRoot) {
  const frontmatter = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/)?.[1] || "";
  const date = frontmatter.match(/^date:\s*["']?(\d{4}-\d{2}-\d{2})["']?\s*$/m)?.[1] || file.match(/(\d{4}-\d{2}-\d{2})\.daily\.md$/)?.[1];
  if (!todoModel.validDate(date)) return [{ reason: "Daily 日期缺失或无效，无法检查今日必做。" }];
  const snapshotFile = join(vaultRoot, todoModel.snapshotPath(date));
  let result;
  if (existsSync(snapshotFile) && (date < todoModel.shanghaiDate() || /^status:\s*["']?closed["']?\s*$/m.test(frontmatter))) {
    result = { ...todoModel.readSnapshot(readFileSync(snapshotFile, "utf8"), date), unknown: [] };
  } else {
    const items = [], folder = join(vaultRoot, "workspace/todos");
    if (existsSync(folder)) for (const year of readdirSync(folder, { withFileTypes: true })) {
      if (!year.isDirectory() || !/^\d{4}$/.test(year.name)) continue;
      for (const month of readdirSync(join(folder, year.name), { withFileTypes: true })) {
        if (!month.isFile() || !/^\d{4}-\d{2}\.md$/.test(month.name)) continue;
        const path = `workspace/todos/${year.name}/${month.name}`;
        items.push(...todoModel.parseTodos(readFileSync(join(vaultRoot, path), "utf8"), path));
      }
    }
    result = todoModel.atDate(items, date);
  }
  return [
    ...result.unknown.map(item => ({ path: item.path, line: item.line + 1, text: item.label, reason: item.problems.join("；") })),
    ...result.pending.filter(item => item.due && item.due <= date).map(item => ({
      path: item.path, line: item.line === undefined ? null : item.line + 1, id: item.id, text: item.label, due: item.due,
      reason: `${item.due === date ? "今日必做" : "逾期"}尚未处理（${item.due} 应完成）；请完成、取消，或明确改期 / 转为常规任务。`,
    })),
  ];
}

function buildReport(markdown, file) {
  const moodIssues = checkMood(markdown);
  const items = model.occurrences(markdown).items;
  const tasks = items.map(item => ({
    line: item.index + 1, section: item.section, status: item.status, text: item.text,
    owned: Boolean(item.owner || item.links.length || TASK_ENTITY_RE.test(item.text) || TODO_ITEM_RE.test(item.text)),
  }));
  const unresolved = tasks.filter(task => task.status === " " || task.status === "/");
  const danglingHandoffs = tasks.filter(task => task.status === ">" && !task.owned);
  let vaultRoot = dirname(resolve(file));
  while (!existsSync(join(vaultRoot, "workspace")) && dirname(vaultRoot) !== vaultRoot) vaultRoot = dirname(vaultRoot);
  const linkedTasks = [...new Set(items.flatMap(item => item.links.map(link => link.path)))].map(path => {
    const filename = join(vaultRoot, path + ".md");
    return existsSync(filename) ? model.taskTodos(readFileSync(filename, "utf8"), path + ".md") : null;
  }).filter(Boolean);
  const taskTodoIssues = model.reviewLinks(markdown, linkedTasks);
  const smallTaskIssues = checkSmallTasks(markdown, file, vaultRoot);
  const taskGroupIssues = [];
  if (markdown.includes('dv.view("agents/views/overview/_views/task-pool"')) {
    try {
      const date = model.scalar(markdown, "date");
      const snapshot = join(vaultRoot, groupModel.snapshotPath(date));
      if (!existsSync(snapshot)) throw new Error("缺少当天关注组快照；请先保存快照，不能用当前分组补造历史");
      const saved = groupModel.readSnapshot(readFileSync(snapshot, "utf8"), date);
      if (date === groupModel.today() && model.scalar(markdown, "status") === "open") {
        const latest = execFileSync(process.execPath, [join(root, ".agents/skills/daily/scripts/task-group-snapshot.mjs"), "--file", resolve(file)], { encoding: "utf8" });
        if (JSON.stringify(saved) !== JSON.stringify(groupModel.readSnapshot(latest, date))) throw new Error("关注组已变化，请更新今日快照后再收口");
      }
    } catch (error) { taskGroupIssues.push({ reason: error.message }); }
  }
  const exerciseParsed = exerciseModel.parse(markdown);
  const exerciseIssues = exerciseParsed.issues.map(reason => ({ reason }));
  if (exerciseParsed.rows.length && !exerciseIssues.length) {
    try {
      const output = execFileSync(process.execPath, [join(root, ".agents/skills/daily/scripts/exercise-review.mjs"), "--file", resolve(file)], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
      const plan = JSON.parse(output);
      if (plan.creates.length || plan.markdown !== markdown) exerciseIssues.push({ reason: "锻炼记录尚未整理：请先创建动作页并补齐链接，再关闭 Daily" });
    } catch (error) {
      let reason = error.stderr?.toString().trim() || error.message;
      try { reason = JSON.parse(error.stdout.toString()).issues.join("；"); } catch {}
      exerciseIssues.push({ reason });
    }
  }
  return {
    closeable: moodIssues.length === 0 && unresolved.length === 0 && danglingHandoffs.length === 0 && taskTodoIssues.length === 0 && smallTaskIssues.length === 0 && taskGroupIssues.length === 0 && exerciseIssues.length === 0,
    moodIssues, unresolved, danglingHandoffs, taskTodoIssues, smallTaskIssues, taskGroupIssues, exerciseIssues,
  };
}

function renderMarkdown(report) {
  if (report.closeable) return "Daily 收口检查通过，可以关闭。";

  const lines = ["Daily 尚不能关闭："];
  for (const issue of report.moodIssues) lines.push(`- ${issue.line ? `L${issue.line} ` : ""}${issue.reason}`);
  if (report.unresolved.length) {
    lines.push("- 仍有 `[ ]` / `[/]`：");
    for (const task of report.unresolved) {
      lines.push(`  - L${task.line} ${task.owned ? "Task occurrence" : "inline task"}：${task.text}`);
    }
  }
  if (report.danglingHandoffs.length) {
    lines.push("- `[>]` 尚未交接给 Task Entity 或 Todo 原条目：");
    for (const task of report.danglingHandoffs) {
      lines.push(`  - L${task.line}：${task.text}`);
    }
  }
  for (const issue of report.taskTodoIssues) lines.push(`- L${issue.line} ${issue.reason}：${issue.text}`);
  for (const issue of report.smallTaskIssues) lines.push(`- ${issue.path || "小任务"}${issue.line ? ":" + issue.line : ""} ${issue.reason}${issue.text ? "：" + issue.text : ""}`);
  for (const issue of report.taskGroupIssues) lines.push(`- 关注组：${issue.reason}`);
  for (const issue of report.exerciseIssues) lines.push(`- 锻炼：${issue.reason}`);
  return lines.join("\n");
}

try {
  const options = parseArgs(process.argv.slice(2));
  const report = buildReport(readFileSync(options.file, "utf8"), options.file);
  const output = options.format === "json" ? JSON.stringify(report, null, 2) : renderMarkdown(report);
  process.stdout.write(output + "\n");
  if (!report.closeable) process.exitCode = 2;
} catch (error) {
  process.stderr.write(error.message + "\n");
  process.exit(1);
}
