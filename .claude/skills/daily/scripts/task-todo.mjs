#!/usr/bin/env node
// Read-only counterpart of the local Obsidian creation hook. Prints a proposed Daily.
import { readFileSync, readdirSync, realpathSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../../..");
const model = require(join(root, ".obsidian/plugins/vault-daily-todos/model.cjs"));
const walk = dir => readdirSync(dir, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)]);
try {
  const args = process.argv.slice(2);
  if (args.length !== 2 || args[0] !== "--file") throw new Error("Usage: node task-todo.mjs --file <today.daily.md> (只读输出；不改写文件)");
  const file = realpathSync(resolve(args[1]));
  const path = relative(root, file).split(sep).join("/");
  const markdown = readFileSync(file, "utf8"), date = model.today();
  if (!model.eligibleDaily(markdown, path, date)) throw new Error("只允许今天未复盘的 Daily；不会重建历史");
  const tasks = readdirSync(join(root, "workspace/tasks")).filter(n => /^TASK-\d{6}-\d{3}\.md$/.test(n))
    .map(n => model.taskTodos(readFileSync(join(root, "workspace/tasks", n), "utf8"), `workspace/tasks/${n}`));
  const history = walk(join(root, "workspace/daily")).filter(p => /\d{4}-\d{2}-\d{2}\.daily\.md$/.test(p) && p < file)
    .sort().slice(-45).map(p => ({ markdown: readFileSync(p, "utf8") }));
  const plan = model.planDaily({ markdown, path, date, tasks, history, manual: true });
  if (plan.errors.length) throw new Error(plan.errors.join("\n"));
  process.stdout.write(plan.markdown);
} catch (error) { process.stderr.write(error.message + "\n"); process.exitCode = 1; }
