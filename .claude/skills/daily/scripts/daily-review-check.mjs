#!/usr/bin/env node

import { readFileSync } from "node:fs";

const SECTION_NAMES = new Set(["大任务", "小任务"]);
const TASK_ENTITY_RE = /\[\[workspace\/tasks\/TASK-\d{6}-\d{3}(?:\|[^\]]+)?\]\]/;

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

function taskLines(markdown) {
  const lines = markdown.split(/\r?\n/);
  const tasks = [];
  let section = "";
  let topLevelOwner = false;

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const heading = line.match(/^##\s+(.+?)\s*$/);
    if (heading) {
      section = SECTION_NAMES.has(heading[1]) ? heading[1] : "";
      topLevelOwner = false;
      continue;
    }
    if (!section) continue;

    const match = line.match(/^(\s*)-\s*\[([ xX\/\->])\]\s*(.*)$/);
    if (!match) continue;
    const indent = match[1].replaceAll("\t", "  ").length;
    const ownsTask = TASK_ENTITY_RE.test(match[3]);
    if (indent === 0) topLevelOwner = ownsTask;

    tasks.push({
      line: index + 1,
      section,
      status: match[2].toLowerCase(),
      text: match[3].trim(),
      owned: ownsTask || (indent > 0 && topLevelOwner),
    });
  }
  return tasks;
}

function buildReport(markdown) {
  const tasks = taskLines(markdown);
  const unresolved = tasks.filter((task) => task.status === " " || task.status === "/");
  const danglingHandoffs = tasks.filter((task) => task.status === ">" && !task.owned);
  return {
    closeable: unresolved.length === 0 && danglingHandoffs.length === 0,
    unresolved,
    danglingHandoffs,
  };
}

function renderMarkdown(report) {
  if (report.closeable) return "Daily occurrence 检查通过，可以关闭。";

  const lines = ["Daily 尚不能关闭："];
  if (report.unresolved.length) {
    lines.push("- 仍有 `[ ]` / `[/]`：");
    for (const task of report.unresolved) {
      lines.push(`  - L${task.line} ${task.owned ? "Task occurrence" : "inline task"}：${task.text}`);
    }
  }
  if (report.danglingHandoffs.length) {
    lines.push("- `[>]` 尚未交接给 Task Entity：");
    for (const task of report.danglingHandoffs) {
      lines.push(`  - L${task.line}：${task.text}`);
    }
  }
  return lines.join("\n");
}

try {
  const options = parseArgs(process.argv.slice(2));
  const report = buildReport(readFileSync(options.file, "utf8"));
  const output = options.format === "json" ? JSON.stringify(report, null, 2) : renderMarkdown(report);
  process.stdout.write(output + "\n");
  if (!report.closeable) process.exitCode = 2;
} catch (error) {
  process.stderr.write(error.message + "\n");
  process.exit(1);
}
