#!/usr/bin/env node
// Read-only fallback. Requires python3 + PyYAML; output is saved by the Agent after review.
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";
import { createRequire } from "node:module";
import { execFileSync } from "node:child_process";
try {
  const args = process.argv.slice(2);
  if (args.length !== 2 || args[0] !== "--file") throw new Error("Usage: task-group-snapshot.mjs --file <daily.md>");
  const file = resolve(args[1]);
  let root = dirname(file);
  while (!existsSync(join(root, "agents/schema")) || !existsSync(join(root, "workspace"))) {
    if (root === dirname(root)) throw new Error("Cannot locate Vault root");
    root = dirname(root);
  }
  const model = createRequire(import.meta.url)(join(root, "agents/views/overview/_views/task-pool/model.cjs"));
  const parseFiles = paths => JSON.parse(execFileSync("python3", ["-c", `
import sys, json, re, yaml
result = []
for path in sys.argv[1:]:
    with open(path, encoding='utf-8') as f: text = f.read()
    match = re.match(r'^---\\r?\\n([\\s\\S]*?)\\r?\\n---(?:\\r?\\n|$)', text)
    if not match: raise ValueError('Missing YAML: ' + path)
    result.append(yaml.load(match.group(1), Loader=yaml.BaseLoader))
print(json.dumps(result, ensure_ascii=False))
`, ...paths], { encoding: "utf8" }));
  const [daily] = parseFiles([file]), date = daily.date;
  const path = join(root, model.snapshotPath(date));
  if (!model.canSnapshot(daily, relative(root, file).split(sep).join("/"), model.today())) {
    if (!existsSync(path)) throw new Error("历史或已关闭 Daily 没有关注组快照；不能用当前分组补造历史");
    const text = readFileSync(path, "utf8"); model.readSnapshot(text, date); process.stdout.write(text);
  } else {
    if (existsSync(path)) model.readSnapshot(readFileSync(path, "utf8"), date);
    const folder = join(root, model.GROUP_DIR);
    const files = existsSync(folder) ? readdirSync(folder).map(name => `${model.GROUP_DIR}/${name}`).filter(p => model.GROUP.test(p)).sort() : [];
    const data = files.length ? parseFiles(files.map(p => join(root, p))) : [];
    process.stdout.write(model.renderSnapshot(model.makeSnapshot(data.map((d, i) => model.group(d, files[i])), date)));
  }
} catch (error) { process.stderr.write(error.message + "\n"); process.exitCode = 1; }
