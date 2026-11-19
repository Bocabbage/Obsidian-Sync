#!/usr/bin/env node
// Read-only: output the proposed month file, for the Agent to inspect and apply.
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname, join, relative } from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
const model = createRequire(import.meta.url)(fileURLToPath(new URL("../../../../agents/views/overview/_views/todo-pool/model.cjs", import.meta.url)));
try {
  const options = {}, args = process.argv.slice(2);
  for (let i = 0; i < args.length; i++) {
    if (!["--file", "--id", "--due"].includes(args[i]) || !args[i + 1]) throw new Error("Usage: todo-schedule.mjs --file <month.md> --id <todo-ID> --due YYYY-MM-DD|none");
    options[args[i].slice(2)] = args[++i];
  }
  if (!options.file || !options.id || !options.due) throw new Error("--file, --id and --due are required");
  const file = resolve(options.file);
  let root = dirname(file);
  while (!existsSync(join(root, "workspace")) && dirname(root) !== root) root = dirname(root);
  const path = relative(root, file).replaceAll("\\", "/");
  if (!/^workspace\/todos\/\d{4}\/\d{4}-\d{2}\.md$/.test(path)) throw new Error("只能调整月度 Todo 原文件");
  const text = readFileSync(file, "utf8");
  const matches = model.parseTodos(text, path).filter(item => item.id === options.id);
  if (matches.length !== 1) throw new Error("Todo ID 不存在或不唯一");
  process.stdout.write(model.scheduleTodo(text, matches[0], model.shanghaiDate(), options.due === "none" ? "" : options.due));
} catch (error) { process.stderr.write(error.message + "\n"); process.exitCode = 1; }
