#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const DIDA_URL_RE =
  /https:\/\/(?:www\.)?dida365\.com\/webapp\/#p\/([0-9a-f]{24})\/tasks\/([0-9a-f]{24})/gi;
const DIDA_URL_SINGLE_RE =
  /https:\/\/(?:www\.)?dida365\.com\/webapp\/#p\/([0-9a-f]{24})\/tasks\/([0-9a-f]{24})/i;
const TASK_LINK_RE =
  /\[\[(workspace\/tasks\/TASK-\d{6}-\d{3})(?:\.md)?(?:#[^\]|]*)?(?:\|([^\]]+))?\]\]/g;
const SECTION_NAMES = new Set(["跨日任务", "当日任务"]);

function usage() {
  return [
    "Usage:",
    "  node dida-focus-summary.mjs --file <daily.md> [--date YYYY-MM-DD]",
    "       [--format markdown|json|snapshot] [--dida-bin <path>] [--refresh-mappings]",
    "       [--assign <focus-type:record-id>=workspace/tasks/TASK-YYYYMM-NNN]",
  ].join("\n");
}

function parseArgs(argv) {
  const options = { file: "", date: "", format: "markdown", didaBin: "dida", assignments: [] };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const value = argv[index + 1];

    if (arg === "--refresh-mappings") {
      options.refreshMappings = true;
    } else if (arg === "--assign" && value) {
      const separator = value.lastIndexOf("=");
      const key = separator > 0 ? value.slice(0, separator) : "";
      const localPath = separator > 0 ? value.slice(separator + 1) : "";
      if (!/^(pomodoro|timing):.+$/.test(key) || !/^workspace\/tasks\/TASK-\d{6}-\d{3}$/.test(localPath)) {
        throw new Error("Invalid --assign; expected <focus-type:record-id>=workspace/tasks/TASK-YYYYMM-NNN");
      }
      options.assignments.push([key, localPath]);
      index += 1;
    } else if (arg === "--file" && value) {
      options.file = value;
      index += 1;
    } else if (arg === "--date" && value) {
      options.date = value;
      index += 1;
    } else if (arg === "--format" && value) {
      options.format = value;
      index += 1;
    } else if (arg === "--dida-bin" && value) {
      options.didaBin = value;
      index += 1;
    } else if (arg === "--help" || arg === "-h") {
      process.stdout.write(usage() + "\n");
      process.exit(0);
    } else {
      throw new Error("Unknown or incomplete argument: " + arg);
    }
  }

  if (!options.file) {
    throw new Error("--file is required");
  }
  if (!["markdown", "json", "snapshot"].includes(options.format)) {
    throw new Error("--format must be markdown, json, or snapshot");
  }
  return options;
}

function extractDate(markdown, explicitDate, filePath) {
  if (explicitDate) {
    return validateDate(explicitDate);
  }

  const frontmatter = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  const propertyDate = frontmatter?.[1].match(
    /^date:\s*["']?(\d{4}-\d{2}-\d{2})["']?\s*$/m,
  )?.[1];
  if (propertyDate) {
    return validateDate(propertyDate);
  }

  const filenameDate = filePath.match(/(\d{4}-\d{2}-\d{2})\.daily\.md$/)?.[1];
  if (filenameDate) {
    return validateDate(filenameDate);
  }

  throw new Error("Cannot determine Daily date from YAML, filename, or --date");
}

function validateDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error("Invalid date: " + value);
  }

  const parts = value.split("-").map(Number);
  const parsed = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]));
  if (
    parsed.getUTCFullYear() !== parts[0] ||
    parsed.getUTCMonth() !== parts[1] - 1 ||
    parsed.getUTCDate() !== parts[2]
  ) {
    throw new Error("Invalid calendar date: " + value);
  }
  return value;
}

function nextDate(value) {
  const parts = value.split("-").map(Number);
  const parsed = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]) + 86_400_000);
  return [
    parsed.getUTCFullYear(),
    String(parsed.getUTCMonth() + 1).padStart(2, "0"),
    String(parsed.getUTCDate()).padStart(2, "0"),
  ].join("-");
}

function extractTaskSections(markdown) {
  const lines = markdown.split(/\r?\n/);
  const selected = [];
  let active = false, pool = false, fence = "";

  for (const line of lines) {
    const token = line.match(/^\s*(`{3,}|~{3,})/)?.[1];
    if (token) {
      if (!fence) fence = token;
      else if (token[0] === fence[0] && token.length >= fence.length) fence = "";
      continue;
    }
    if (fence) continue;
    const heading = line.match(/^##\s+(.+?)\s*$/);
    if (heading) {
      active = SECTION_NAMES.has(heading[1]);
      pool = false;
      continue;
    }
    if (/^###\s+/.test(line)) pool = /^###\s+小任务待办池/.test(line);
    if (active && !pool) {
      selected.push(line);
    }
  }
  return selected.join("\n");
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^$(){}|[\]\\]/g, "\\$&");
}

function fallbackTitleForUrl(sectionText, url) {
  const line = sectionText.split(/\r?\n/).find((candidate) => candidate.includes(url)) ?? "";
  const pattern = new RegExp("\\[([^\\]]+)\\]\\(" + escapeRegExp(url) + "\\)");
  const markdownLabel = line.match(pattern)?.[1];

  if (markdownLabel && !/^dida$/i.test(markdownLabel.trim())) {
    return markdownLabel.trim();
  }

  return line
    .replace(/^\s*-\s*\[[^\]]\]\s*/, "")
    .replace(pattern, "")
    .replace(url, "")
    .replace(/[—｜|·]\s*$/, "")
    .trim();
}

function vaultRootFor(filePath) {
  let current = dirname(resolve(filePath));
  while (true) {
    if (existsSync(join(current, "workspace")) && existsSync(join(current, "agents", "schema"))) {
      return current;
    }
    const parent = dirname(current);
    if (parent === current) break;
    current = parent;
  }
  throw new Error("Cannot locate Vault root for " + filePath);
}

function frontmatter(markdown) {
  return markdown.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/)?.[1] ?? "";
}

function scalarProperty(yaml, key) {
  const escaped = escapeRegExp(key);
  const raw = yaml.match(new RegExp("^" + escaped + ":[ \\t]*(.*?)[ \\t]*$", "m"))?.[1] ?? "";
  if (!raw || raw === "null" || raw === "~") return "";
  if ((raw.startsWith('"') && raw.endsWith('"')) || (raw.startsWith("'") && raw.endsWith("'"))) {
    return raw.slice(1, -1).trim();
  }
  return raw.trim();
}

// The only collection field is a YAML list of URL strings, not parallel ID lists.
function didaUrlList(yaml) {
  const header = yaml.match(/^dida_urls:[ \t]*(.*)$/m);
  if (!header) return null;
  let values;
  const inline = header[1].replace(/\s+#.*$/, "").trim();
  if (inline) {
    if (!inline.startsWith("[") || !inline.endsWith("]")) throw new Error("dida_urls must be a list");
    values = inline.slice(1, -1).trim() ? inline.slice(1, -1).split(",") : [];
  } else {
    const tail = yaml.slice(header.index + header[0].length).split(/\r?\n/);
    values = [];
    for (const line of tail) {
      if (/^[^\s#-][^:]*:/.test(line)) break;
      if (!line.trim() || /^\s*#/.test(line)) continue;
      const item = line.match(/^\s*-\s+(.+?)\s*$/);
      if (!item) throw new Error("dida_urls accepts URL strings only");
      values.push(item[1]);
    }
  }
  return values.map((value) => {
    let url = value.trim().replace(/\s+#.*$/, "");
    if ((url.startsWith('"') && url.endsWith('"')) || (url.startsWith("'") && url.endsWith("'"))) url = url.slice(1, -1);
    const match = url.match(DIDA_URL_SINGLE_RE);
    if (!match || match[0] !== url) throw new Error("Invalid DIDA URL in dida_urls: " + url);
    return { projectId: match[1].toLowerCase(), taskId: match[2].toLowerCase(), url: "https://dida365.com/webapp/#p/" + match[1].toLowerCase() + "/tasks/" + match[2].toLowerCase() };
  });
}

function taskEntityDidaTasks(sectionText, dailyFile) {
  const root = vaultRootFor(dailyFile);
  const tasks = [];
  const seenPaths = new Set();

  for (const match of sectionText.matchAll(TASK_LINK_RE)) {
    const localPath = match[1];
    if (seenPaths.has(localPath)) continue;
    seenPaths.add(localPath);

    const absolutePath = join(root, localPath + ".md");
    if (!existsSync(absolutePath)) {
      throw new Error("Task Entity not found: " + localPath);
    }

    const yaml = frontmatter(readFileSync(absolutePath, "utf8"));
    if (scalarProperty(yaml, "type") !== "task") {
      throw new Error("Linked page is not type: task: " + localPath);
    }

    const localTaskId = scalarProperty(yaml, "task_id");
    const title = scalarProperty(yaml, "title") || match[2] || localTaskId;
    const urls = didaUrlList(yaml);
    const configuredUrl = scalarProperty(yaml, "dida_url");
    const configuredProjectId = scalarProperty(yaml, "dida_project_id").toLowerCase();
    const configuredTaskId = scalarProperty(yaml, "dida_task_id").toLowerCase();
    if (urls !== null) {
      if (configuredUrl || configuredProjectId || configuredTaskId) throw new Error("Use dida_urls OR legacy DIDA fields, not both: " + localPath);
      const seen = new Map();
      for (const source of urls) {
        if (seen.has(source.taskId) && seen.get(source.taskId) !== source.projectId) throw new Error("Conflicting DIDA project IDs on " + localPath);
        if (!seen.has(source.taskId)) tasks.push({ ...source, fallbackTitle: title, localPath, localTaskId });
        seen.set(source.taskId, source.projectId);
      }
      continue;
    }
    const urlMatch = configuredUrl.match(DIDA_URL_SINGLE_RE);

    if (!configuredUrl && !configuredProjectId && !configuredTaskId) continue;
    if (!urlMatch && !(configuredProjectId && configuredTaskId)) {
      throw new Error("Incomplete DIDA mapping on " + localPath);
    }

    const projectId = (urlMatch?.[1] ?? configuredProjectId).toLowerCase();
    const taskId = (urlMatch?.[2] ?? configuredTaskId).toLowerCase();
    if (
      (configuredProjectId && configuredProjectId !== projectId) ||
      (configuredTaskId && configuredTaskId !== taskId)
    ) {
      throw new Error("DIDA URL and ID fields disagree on " + localPath);
    }

    tasks.push({
      projectId,
      taskId,
      url: "https://dida365.com/webapp/#p/" + projectId + "/tasks/" + taskId,
      fallbackTitle: title,
      localPath,
      localTaskId,
    });
  }
  return tasks;
}

function directDidaTasks(sectionText) {
  const tasks = [];
  const seen = new Set();

  for (const match of sectionText.matchAll(DIDA_URL_RE)) {
    const projectId = match[1].toLowerCase();
    const taskId = match[2].toLowerCase();
    if (seen.has(taskId)) {
      continue;
    }
    seen.add(taskId);

    tasks.push({
      projectId,
      taskId,
      url: "https://dida365.com/webapp/#p/" + projectId + "/tasks/" + taskId,
      fallbackTitle: fallbackTitleForUrl(sectionText, match[0]),
    });
  }
  return tasks;
}

export function extractDidaTasks(markdown, dailyFile) {
  const sectionText = extractTaskSections(markdown);
  const byTaskId = new Map();

  for (const task of taskEntityDidaTasks(sectionText, dailyFile)) {
    const existing = byTaskId.get(task.taskId);
    if (existing) {
      if (existing.projectId !== task.projectId) throw new Error("Conflicting DIDA project IDs for " + task.taskId);
      if (!existing.candidates.some((item) => item.localPath === task.localPath)) existing.candidates.push(task);
    }
    else byTaskId.set(task.taskId, { ...task, candidates: [task] });
  }
  for (const task of directDidaTasks(sectionText)) {
    if (!byTaskId.has(task.taskId)) byTaskId.set(task.taskId, { ...task, candidates: [] });
  }
  return [...byTaskId.values()].map((task) => {
    if (task.candidates.length <= 1) return task;
    const { localPath, localTaskId, ...shared } = task;
    return { ...shared, fallbackTitle: "共享 DIDA 来源（待归属）" };
  });
}

export function savedMappings(markdown, date, refresh = false) {
  const blocks = [...markdown.matchAll(/<!-- dida-focus:start -->([\s\S]*?)<!-- dida-focus:end -->/g)];
  const starts = (markdown.match(/<!-- dida-focus:start -->/g) ?? []).length;
  const ends = (markdown.match(/<!-- dida-focus:end -->/g) ?? []).length;
  if (starts !== ends || starts > 1 || blocks.length !== starts) {
    throw new Error("Invalid or duplicate dida-focus markers; preserve the existing summary");
  }
  if (refresh) return null;
  const body = blocks[0]?.[1]?.trim() ?? "";
  const snapshots = [
    ...body.matchAll(/%% dida-focus:snapshot (.*?) %%/g),
    ...body.matchAll(/<!-- dida-focus:snapshot (.*?) -->/g),
  ];
  if (snapshots.length > 1) throw new Error("Duplicate focus snapshots");
  if (!snapshots.length) {
    if (body.replace(/<!--[\s\S]*?-->|%%[\s\S]*?%%/g, "").trim()) {
      throw new Error("Legacy focus summary has no mapping snapshot; review it before using --refresh-mappings");
    }
    return null;
  }
  const saved = JSON.parse(snapshots[0][1]);
  if (saved.version !== 1 || saved.date !== date || !Array.isArray(saved.mappings)) {
    throw new Error("Focus snapshot version/date/mappings mismatch");
  }
  if (!saved.mappings.every((task) => /^[0-9a-f]{24}$/.test(task.taskId) &&
      Array.isArray(task.candidates) && task.candidates.every((candidate) =>
        candidate.taskId === task.taskId && /^workspace\/tasks\/TASK-\d{6}-\d{3}$/.test(candidate.localPath)))) {
    throw new Error("Invalid saved DIDA mapping");
  }
  return saved.mappings;
}

export function snapshotPathFor(dailyFile, date) {
  const root = vaultRootFor(dailyFile);
  return join(
    root,
    "workspace/daily/_meta/focus",
    date.slice(0, 4),
    date.slice(0, 7),
    date + ".dida-focus.md",
  );
}

function parseSnapshotMarkdown(markdown, date) {
  const codeBlocks = [...markdown.matchAll(/```json\r?\n([\s\S]*?)\r?\n```/g)];
  if (codeBlocks.length !== 1) {
    throw new Error("Daily focus snapshot must contain exactly one JSON code block");
  }
  const saved = JSON.parse(codeBlocks[0][1]);
  if (saved.version !== 1 || saved.date !== date || !Array.isArray(saved.mappings)) {
    throw new Error("Focus snapshot version/date/mappings mismatch");
  }
  saved.manualAttributions = normalizeManualAttributions(saved.manualAttributions);
  return saved;
}

function normalizeManualAttributions(value) {
  if (value === undefined) return {};
  if (!value || Array.isArray(value) || typeof value !== "object") {
    throw new Error("Invalid manual focus attributions");
  }
  const normalized = {};
  for (const [key, item] of Object.entries(value)) {
    const localPath = typeof item === "string" ? item : item?.localPath;
    if (!/^(pomodoro|timing):.+$/.test(key) || !/^workspace\/tasks\/TASK-\d{6}-\d{3}$/.test(localPath ?? "")) {
      throw new Error("Invalid manual focus attribution");
    }
    normalized[key] = {
      localPath,
      source: typeof item === "object" && typeof item.source === "string" ? item.source : "user_confirmed",
    };
  }
  return normalized;
}

function assignmentMap(assignments) {
  return Object.fromEntries(assignments.map(([key, localPath]) => [key, {
    localPath,
    source: "user_confirmed",
  }]));
}

export function savedFocusSnapshot(dailyFile, date, refresh = false) {
  if (refresh) return null;
  const path = snapshotPathFor(dailyFile, date);
  if (!existsSync(path)) return null;
  return parseSnapshotMarkdown(readFileSync(path, "utf8"), date);
}

export function savedSnapshotMappings(dailyFile, date, refresh = false) {
  return savedFocusSnapshot(dailyFile, date, refresh)?.mappings ?? null;
}

function runDidaJson(binary, args) {
  try {
    const stdout = execFileSync(binary, args, {
      encoding: "utf8",
      maxBuffer: 32 * 1024 * 1024,
      stdio: ["ignore", "pipe", "pipe"],
    });
    return JSON.parse(stdout);
  } catch (error) {
    const stderr = error?.stderr?.toString?.().trim();
    const stdout = error?.stdout?.toString?.().trim();
    const detail = stderr || stdout || error.message;
    throw new Error(
      "DIDA command failed: " + binary + " " + args.join(" ") + "\n" + detail,
    );
  }
}

function associatedTaskIds(record) {
  const ids = [];

  for (const task of record.tasks ?? []) {
    if (typeof task === "string") {
      ids.push(task.toLowerCase());
    } else {
      const id = task?.taskId ?? task?.id;
      if (typeof id === "string") {
        ids.push(id.toLowerCase());
      }
    }
  }

  if (ids.length === 0 && typeof record.taskId === "string") {
    ids.push(record.taskId.toLowerCase());
  }
  return new Set(ids);
}

function durationSeconds(record) {
  const raw = Number(record.duration ?? 0);
  if (!Number.isFinite(raw) || raw <= 0) {
    return 0;
  }

  // The focus contract uses milliseconds, including short records without timestamps.
  return raw / 1000;
}

export function uniqueRecords(records, focusType) {
  const unique = new Map();
  for (const record of records) {
    const key = focusType + ":" + (record.id ?? JSON.stringify(record));
    if (!unique.has(key)) {
      unique.set(key, { ...record, _focusType: focusType, _recordKey: key });
    }
  }
  return [...unique.values()];
}

function focusTaskTitle(record, taskId) {
  for (const task of record.tasks ?? []) {
    const id = typeof task === "object" ? task.taskId ?? task.id : "";
    if (
      typeof id === "string" &&
      id.toLowerCase() === taskId &&
      typeof task.title === "string" &&
      task.title.trim()
    ) {
      return task.title.trim();
    }
  }
  return "";
}

function formatDuration(seconds) {
  const rounded = Math.max(0, Math.round(seconds));
  if (rounded === 0) {
    return "0m";
  }

  const hours = Math.floor(rounded / 3600);
  const minutes = Math.floor((rounded % 3600) / 60);
  const remainingSeconds = rounded % 60;

  if (hours > 0) {
    return minutes > 0 ? hours + "h" + minutes + "m" : hours + "h";
  }
  if (minutes > 0) {
    return minutes + "m";
  }
  return remainingSeconds + "s";
}

function markdownEscape(value) {
  return value.replaceAll("\\", "\\\\").replaceAll("]", "\\]");
}

function taskIdentity(task) {
  const title = markdownEscape(task.title);
  if (task.localPath) return "[[" + task.localPath + "|" + title + "]]";
  return "[" + title + "](" + task.url + ")";
}

function sumDuration(records) {
  return records.reduce((total, record) => total + durationSeconds(record), 0);
}

function taskMatches(record, taskId) {
  return associatedTaskIds(record).has(taskId);
}

export function buildSummary(tasks, pomodoroRecords, timingRecords, binary, manualAttributions = {}) {
  const linkedIds = new Set(tasks.map((task) => task.taskId));
  const matchedUnion = new Map();

  for (const record of [...pomodoroRecords, ...timingRecords]) {
    const matches = [...associatedTaskIds(record)].some((id) => linkedIds.has(id));
    if (matches) {
      matchedUnion.set(record._recordKey, record);
    }
  }

  const matchedPomodoro = pomodoroRecords.filter((record) =>
    [...associatedTaskIds(record)].some((id) => linkedIds.has(id)),
  );
  const matchedTiming = timingRecords.filter((record) =>
    [...associatedTaskIds(record)].some((id) => linkedIds.has(id)),
  );

  // Count every record once. Ambiguous sources stay visible but have no Task owner.
  const records = [...matchedUnion.values()].map((record) => {
    const sources = tasks.filter((task) => taskMatches(record, task.taskId));
    const candidateLocalPaths = [...new Set(sources.flatMap((task) => task.candidates.map((item) => item.localPath)))];
    const localOwner = candidateLocalPaths.length === 1 && sources.every((task) => task.candidates.length > 0);
    const externalOwner = candidateLocalPaths.length === 0 && sources.length === 1;
    const assignment = manualAttributions[record._recordKey];
    if (assignment && !candidateLocalPaths.includes(assignment.localPath)) {
      throw new Error("Manual focus attribution is not a candidate for " + record._recordKey);
    }
    return {
      key: record._recordKey,
      focusType: record._focusType,
      seconds: durationSeconds(record),
      didaTaskIds: sources.map((task) => task.taskId),
      localPaths: assignment ? [assignment.localPath] : candidateLocalPaths,
      attribution: assignment || localOwner ? "local" : (externalOwner ? "external" : "unallocated"),
      manualAttribution: Boolean(assignment),
    };
  });
  const groups = new Map();
  for (const source of tasks) {
    for (const candidate of source.candidates.length ? source.candidates : [source]) {
      const key = candidate.localPath || "external:" + source.taskId;
      if (!groups.has(key)) groups.set(key, { ...candidate, candidates: candidate.localPath ? [candidate] : [], sources: [] });
      const group = groups.get(key);
      if (!group.sources.some((item) => item.taskId === source.taskId)) group.sources.push({ taskId: source.taskId, projectId: source.projectId, url: source.url });
    }
  }
  const taskSummaries = [...groups.values()].map((task) => {
    const owned = records.filter((record) => task.localPath
      ? record.attribution === "local" && record.localPaths.includes(task.localPath)
      : record.attribution === "external" && record.didaTaskIds.includes(task.taskId));
    const ownedKeys = new Set(owned.map((record) => record.key));
    const taskPomodoro = [...matchedUnion.values()].filter((record) => record._focusType === "pomodoro" && ownedKeys.has(record._recordKey));
    const taskTiming = [...matchedUnion.values()].filter((record) => record._focusType === "timing" && ownedKeys.has(record._recordKey));
    const focusTitle =
      [...taskPomodoro, ...taskTiming]
        .map((record) => focusTaskTitle(record, task.taskId))
        .find(Boolean) ?? "";

    let title = task.localPath ? task.fallbackTitle : focusTitle;
    if (!task.localPath && task.candidates.length === 0) {
      try {
        const detail = runDidaJson(binary, [
          "task",
          "get",
          task.projectId,
          task.taskId,
          "--json",
        ]);
        if (typeof detail.title === "string" && detail.title.trim()) {
          title = detail.title.trim();
        }
      } catch {
        // Focus aggregation remains useful when task metadata is unavailable.
      }
    }

    title = title || task.fallbackTitle || task.taskId;
    return {
      ...task,
      title,
      pomodoroCount: taskPomodoro.length,
      pomodoroSeconds: sumDuration(taskPomodoro),
      timingSeconds: sumDuration(taskTiming),
      totalSeconds: sumDuration([...taskPomodoro, ...taskTiming]),
      unallocatedSeconds: records.filter((record) => record.attribution === "unallocated" && (task.localPath ? record.localPaths.includes(task.localPath) : record.didaTaskIds.includes(task.taskId))).reduce((sum, record) => sum + record.seconds, 0),
    };
  });

  return {
    linkedTaskCount: tasks.length,
    totalSeconds: sumDuration([...matchedUnion.values()]),
    pomodoroCount: matchedPomodoro.length,
    pomodoroSeconds: sumDuration(matchedPomodoro),
    timingSeconds: sumDuration(matchedTiming),
    tasks: taskSummaries,
    records,
    manualAttributions,
    unallocatedSeconds: records.filter((record) => record.attribution === "unallocated").reduce((sum, record) => sum + record.seconds, 0),
  };
}

export function renderMarkdown(summary) {
  const warnings = (summary.mappingWarnings ?? []).map((warning) => "- ⚠️ " + warning);
  if (summary.linkedTaskCount === 0) {
    return [
      "- 关联任务合计：0m",
      "- 未找到 Task Entity 上的 DIDA 映射或 Daily 直接 DIDA 链接。",
      ...warnings,
    ].join("\n");
  }

  const lines = [
    ...warnings,
    "- 统计日期：" + summary.date + "（Asia/Shanghai；当日归属快照）",
    "- 关联任务合计：" + formatDuration(summary.totalSeconds),
    "- 番茄钟：" +
      summary.pomodoroCount +
      " 次 · " +
      formatDuration(summary.pomodoroSeconds),
    "- 正计时：" + formatDuration(summary.timingSeconds),
    "- 按任务：",
  ];

  for (const task of summary.tasks) {
    const details = [];
    if (task.pomodoroCount > 0) {
      details.push(
        "番茄 " +
          task.pomodoroCount +
          " 次 · " +
          formatDuration(task.pomodoroSeconds),
      );
    }
    if (task.timingSeconds > 0) {
      details.push("正计时 " + formatDuration(task.timingSeconds));
    }

    const suffix = details.length > 0 ? "（" + details.join("；") + "）" : "";
    const source = task.localPath ? " · " + task.sources.map((item, index) => "[DIDA" + (task.sources.length > 1 ? " " + (index + 1) : "") + "](" + item.url + ")").join(" · ") : "";
    if (task.candidates.length > 1) {
      const candidates = task.candidates.map((item) => "[[" + item.localPath + "|" + item.localTaskId + "]]").join("、");
      lines.push("  - [共享 DIDA 来源](" + task.url + ")：待归属 · 候选 " + candidates);
    } else {
      lines.push("  - " + taskIdentity(task) + "：" + formatDuration(task.totalSeconds) + suffix + source +
        (task.unallocatedSeconds > 0 ? "（另有共享记录，未计入本任务）" : ""));
    }
  }

  if (summary.unallocatedSeconds > 0 || summary.tasks.some((task) => task.candidates.length > 1)) {
    lines.push("- 待归属：" + formatDuration(summary.unallocatedSeconds) + "（已计入合计一次，未计入任何任务小计；不自动平分）");
    for (const record of summary.records.filter((item) => item.attribution === "unallocated")) {
      lines.push("  - `" + record.key + "`：" + formatDuration(record.seconds) + " · DIDA " + record.didaTaskIds.join("、"));
    }
  }
  return lines.join("\n");
}

export function renderSnapshotMarkdown(summary, dailyFile) {
  const root = vaultRootFor(dailyFile);
  const dailyPath = relative(root, resolve(dailyFile)).replaceAll("\\", "/").replace(/\.md$/, "");
  const snapshot = JSON.stringify({
    version: 1,
    date: summary.date,
    timeZone: "Asia/Shanghai",
    mappings: summary.mappings,
    manualAttributions: summary.manualAttributions,
    records: summary.records,
  }, null, 2).replaceAll("<", "\\u003c").replaceAll(">", "\\u003e");
  return [
    "---",
    "type: daily-focus-snapshot",
    "date: " + summary.date,
    'daily: "[[' + dailyPath + ']]"',
    "---",
    "",
    "# DIDA Focus Snapshot",
    "",
    "```json",
    snapshot,
    "```",
  ].join("\n");
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  const markdown = readFileSync(options.file, "utf8");
  const date = extractDate(markdown, options.date, options.file);
  const savedSnapshot = savedFocusSnapshot(options.file, date, options.refreshMappings);
  const saved = savedSnapshot?.mappings ??
    savedMappings(markdown, date, options.refreshMappings);
  const manualAttributions = {
    ...(savedSnapshot?.manualAttributions ?? {}),
    ...assignmentMap(options.assignments),
  };
  const tasks = saved || extractDidaTasks(markdown, options.file);
  const mappingWarnings = [];
  if (saved) {
    const identity = (items) => JSON.stringify(items.map((item) => [item.taskId, item.candidates.map((candidate) => candidate.localPath).sort()]).sort());
    try {
      if (identity(saved) !== identity(extractDidaTasks(markdown, options.file))) {
        mappingWarnings.push("当前任务区或 DIDA 映射与已存快照不同；本次保留原归属。请核对新增/移除任务后明确使用 --refresh-mappings，勿直接认作本日完整归属。");
      }
    } catch {
      mappingWarnings.push("无法核验当前 Task 映射；本次沿用 Daily 已存归属，请复核后再纠正。");
    }
  }
  const from = date + "T00:00:00+08:00";
  const to = nextDate(date) + "T00:00:00+08:00";

  let pomodoroRecords = [];
  let timingRecords = [];

  if (tasks.length > 0) {
    pomodoroRecords = uniqueRecords(
      runDidaJson(options.didaBin, [
        "focus",
        "list",
        "--from",
        from,
        "--to",
        to,
        "--type",
        "pomodoro",
        "--json",
      ]),
      "pomodoro",
    );
    timingRecords = uniqueRecords(
      runDidaJson(options.didaBin, [
        "focus",
        "list",
        "--from",
        from,
        "--to",
        to,
        "--type",
        "timing",
        "--json",
      ]),
      "timing",
    );
  }

  const summary = buildSummary(
    tasks,
    pomodoroRecords,
    timingRecords,
    options.didaBin,
    manualAttributions,
  );
  const output = {
    date,
    timeZone: "Asia/Shanghai",
    from,
    to,
    mappings: tasks,
    mappingWarnings,
    ...summary,
  };

  if (options.format === "json") {
    process.stdout.write(JSON.stringify(output, null, 2) + "\n");
  } else if (options.format === "snapshot") {
    process.stdout.write(renderSnapshotMarkdown(output, options.file) + "\n");
  } else {
    process.stdout.write(renderMarkdown(output) + "\n");
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try {
    main();
  } catch (error) {
    process.stderr.write(error.message + "\n");
    process.exit(1);
  }
}
