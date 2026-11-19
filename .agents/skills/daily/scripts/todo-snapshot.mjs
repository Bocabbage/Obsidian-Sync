#!/usr/bin/env node
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { createRequire } from "node:module";
const args = process.argv.slice(2);
try {
  const options = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--refresh") options.refresh = true;
    else if (["--file", "--format"].includes(args[i]) && args[i + 1]) options[args[i].slice(2)] = args[++i];
    else throw new Error("Usage: todo-snapshot.mjs --file <daily.md> [--format snapshot|json] [--refresh]");
  }
  if (!options.file || ![undefined, "snapshot", "json"].includes(options.format)) throw new Error("--file required; --format snapshot|json");
  const dailyFile = resolve(options.file);
  let root = dirname(dailyFile);
  while (!existsSync(join(root, "agents", "schema")) || !existsSync(join(root, "workspace"))) {
    if (root === dirname(root)) throw new Error("Cannot locate Vault root");
    root = dirname(root);
  }
  const model = createRequire(import.meta.url)(join(root, "agents/views/overview/_views/todo-pool/model.cjs"));
  const daily = readFileSync(dailyFile, "utf8");
  const date = daily.match(/^date:\s*["']?(\d{4}-\d{2}-\d{2})["']?\s*$/m)?.[1];
  if (!model.validDate(date) || date > model.shanghaiDate()) throw new Error("Cannot snapshot missing, invalid or future Daily date");
  const path = join(root, model.snapshotPath(date));
  let snapshot;
  if (existsSync(path) && !options.refresh) snapshot = model.readSnapshot(readFileSync(path, "utf8"), date);
  else {
    const items = [];
    function visit(folder) {
      if (!existsSync(folder)) return;
      for (const file of readdirSync(folder, { withFileTypes: true })) {
        const path = join(folder, file.name);
        if (file.isDirectory()) visit(path);
        else if (file.isFile() && /^\d{4}-\d{2}\.md$/.test(file.name)) items.push(...model.parseTodos(readFileSync(path, "utf8"), path.slice(root.length + 1).replaceAll("\\", "/")));
      }
    }
    visit(join(root, "workspace/todos"));
    snapshot = model.makeSnapshot(items, date);
  }
  process.stdout.write(options.format === "json" ? JSON.stringify(snapshot, null, 2) + "\n" : model.renderSnapshot(snapshot));
} catch (error) { process.stderr.write(error.message + "\n"); process.exitCode = 1; }
