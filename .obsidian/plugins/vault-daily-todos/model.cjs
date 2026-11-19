"use strict";

const MARKER = "<!-- task-todo:pending -->";
const TASK_PATH = "workspace/tasks/TASK-\\d{6}-\\d{3}";
const OWNER = new RegExp(`^\\s*(?:-\\s+)?\\[\\[(${TASK_PATH})(?:\\|[^\\]]+)?\\]\\]`);
const STEP = new RegExp(`\\[\\[(${TASK_PATH})(?:\\.md)?#\\^(step-\\d{3,})(?:\\|[^\\]]+)?\\]\\]`, "g");

function validDate(date) {
  return /^\d{4}-\d{2}-\d{2}$/.test(date || "") &&
    !Number.isNaN(Date.parse(date)) && new Date(date).toISOString().slice(0, 10) === date;
}

function today(now = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Shanghai", year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
}

function scalar(markdown, field) {
  const yaml = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/)?.[1] || "";
  const value = yaml.match(new RegExp(`^${field}:\\s*(.*?)\\s*$`, "m"))?.[1] || "";
  return value.replace(/^(["'])(.*)\1$/, "$2");
}

// Keep original line indexes; never interpret examples inside fences/comments.
function bodyLines(markdown) {
  let fence = "", comment = false;
  return markdown.split(/\r?\n/).map((raw, index) => {
    const token = raw.match(/^\s*(`{3,}|~{3,})/)?.[1];
    if (token) {
      if (!fence) fence = token;
      else if (token[0] === fence[0] && token.length >= fence.length) fence = "";
      return { raw, index, text: "" };
    }
    if (fence) return { raw, index, text: "" };
    let text = raw;
    if (comment) {
      const end = text.indexOf("-->");
      if (end < 0) return { raw, index, text: "" };
      text = text.slice(end + 3); comment = false;
    }
    text = text.replace(/<!--[\s\S]*?-->/g, "");
    const start = text.indexOf("<!--");
    if (start >= 0) { comment = true; text = text.slice(0, start); }
    return { raw, index, text };
  });
}

function tableStep(raw) {
  const meta = raw.match(/<!-- task-step (.*?) -->/);
  if (!meta) throw new Error("表格明细缺 task-step 元数据");
  const data = JSON.parse(meta[1]);
  if (!data || typeof data !== "object" || Array.isArray(data) ||
      Object.keys(data).some(key => !["id", "created", "occurred", "resume", "paused", "closed"].includes(key)) ||
      Object.values(data).some(value => typeof value !== "string" && typeof value !== "boolean")) throw new Error("表格元数据字段无效");
  const cells = raw.replace(meta[0], "").trim().replace(/^\||\|$/g, "").split(/(?<!\\)\|/).map(cell => cell.trim().replace(/\\\|/g, "|"));
  if (cells.length !== 4) throw new Error("明细表必须为事项、状态、完成时间、备注四列");
  const states = { "待办": " ", "进行中": "/", "已完成": "x", "已取消": "-", "已转交": "/", "暂停": "/" };
  const status = states[cells[1]];
  if (status === undefined) throw new Error("明细表状态无效");
  const completedLink = cells[2].match(/^\[\[workspace\/daily\/(\d{4})\/(\d{4}-\d{2})\/(\d{4}-\d{2}-\d{2})\.daily#收尾\|(\d{4}-\d{2}-\d{2})\]\]$/);
  const completed = completedLink?.[3];
  if (status === "x" ? (!completedLink || completedLink[1] !== completed.slice(0, 4) || completedLink[2] !== completed.slice(0, 7) || completedLink[4] !== completed) : !["", "—", "-"].includes(cells[2])) throw new Error("完成时间须为当天 Daily 收尾链接；未完成项留空");
  if (!["已取消"].includes(cells[1]) && data.closed) throw new Error("只有取消项可保存 closed");
  if (data.paused !== undefined && typeof data.paused !== "boolean") throw new Error("paused 必须是布尔值");
  const label = cells[0].replace(/^\d+\s*·\s*/, "");
  if (!label) throw new Error("明细事项不能为空");
  const flags = `${data.occurred ? ` [occurred:: ${data.occurred}]` : ""}${data.resume ? ` [resume:: ${data.resume}]` : ""}${data.closed ? ` [closed:: ${data.closed}]` : ""}${data.paused || cells[1] === "已转交" || cells[1] === "暂停" ? " [carry:: paused]" : ""}`;
  return `- [${status}] ${label} ➕ ${data.created}${flags}${completed ? ` ✅ ${completed}` : ""} ^${data.id}`;
}

function taskTodos(markdown, path) {
  if (!new RegExp(`^${TASK_PATH}\\.md$`).test(path) || scalar(markdown, "type") !== "task") return null;
  let inTodo = false;
  const steps = [], errors = [], ids = new Set();
  const anchors = bodyLines(markdown).map(line => line.text.match(/^(?:> ?)*\d+ \^(step-\d{3,})\s*$/)?.[1]).filter(Boolean);
  for (const { raw, text, index } of bodyLines(markdown)) {
    if (/^##\s/.test(text)) { inTodo = /^## Todo\s*$/.test(text); continue; }
    if (!inTodo) continue;
    let row = text;
    if (/^\s*\|/.test(text)) {
      if (/^\s*\|\s*事项\s*\|/.test(text) || /^\s*\|[\s:|\-]+$/.test(text)) continue;
      try { row = tableStep(raw); }
      catch (error) { errors.push(`${path}:${index + 1} ${error.message}`); continue; }
    }
    const match = row.match(/^- \[([ xX/\->])\] (.+)$/);
    if (!match) continue;
    const body = match[2];
    const id = body.match(/\^(step-\d{3,})\s*$/)?.[1];
    const created = body.match(/➕\s*(\d{4}-\d{2}-\d{2})/)?.[1];
    const resume = body.match(/\[resume::\s*([^\]]+)\]/)?.[1]?.trim();
    const completed = body.match(/✅\s*(\d{4}-\d{2}-\d{2})/)?.[1];
    const closed = body.match(/\[closed::\s*([^\]]+)\]/)?.[1]?.trim();
    const status = match[1].toLowerCase();
    const occurred = body.match(/\[occurred::\s*([^\]]+)\]/)?.[1]?.trim();
    const earliest = occurred || created;
    if (!id || ids.has(id) || !validDate(created) || (resume !== undefined && !validDate(resume)) ||
      (occurred !== undefined && (!validDate(occurred) || occurred > created)) ||
      (status === "x" && (!validDate(completed) || completed < earliest)) ||
      (status === "-" && (!validDate(closed) || closed < earliest)) || status === ">" ||
      ([" ", "/"].includes(status) && (completed || closed))) {
      errors.push(`${path}:${index + 1} Todo 缺唯一 step 锚点或有效日期`); continue;
    }
    if (/^\s*\|/.test(text) && anchors.filter(anchor => anchor === id).length !== 1) {
      errors.push(`${path}:${index + 1} 表格明细缺唯一兼容 block 锚点`); continue;
    }
    ids.add(id);
    steps.push({ id, status, created, occurred, resume, completed, closed,
      paused: /\[carry::\s*paused\s*\]/.test(body),
      label: body.replace(/\s+\^step-\d{3,}\s*$/, "").replace(/(?:➕|✅|⏳)\s*\d{4}-\d{2}-\d{2}/g, "")
        .replace(/\[(?:resume|carry|closed|occurred)::[^\]]*\]/g, "").trim(),
    });
  }
  return { path: path.replace(/\.md$/, ""), title: scalar(markdown, "title") || path.split("/").pop().replace(/\.md$/, ""),
    status: scalar(markdown, "status"), priority: scalar(markdown, "priority"), created: scalar(markdown, "created"), steps, errors };
}

function occurrences(markdown) {
  let section = "", priority = "high", group = "WORK", owner = "", pool = false;
  const result = [], locations = new Map();
  for (const { text, index } of bodyLines(markdown)) {
    const h2 = text.match(/^##\s+(.+)$/);
    if (h2) { section = h2[1].trim(); owner = ""; pool = false; continue; }
    if (!["跨日任务", "当日任务"].includes(section)) continue;
    const h3 = text.match(/^###\s+(.+)$/);
    if (h3) pool = h3[1].includes("小任务待办池");
    if (pool) continue;
    if (/^#{3,6}\s/.test(text)) {
      owner = "";
      if (/高优先级/.test(text)) priority = "high";
      if (/低优先级/.test(text)) priority = "low";
      if (/\bWORK\s*$/.test(text)) group = "WORK";
      if (/\bLIFE\s*$/.test(text)) group = "LIFE";
      continue;
    }
    const owning = text.match(OWNER);
    if (owning) {
      owner = owning[1];
      locations.set(owner, { index, priority, group });
      continue;
    }
    const check = text.match(/^(\s*)-\s*\[([ xX/\->])\]\s*(.*)$/);
    if (!check) { if (/^\S/.test(text) && text.trim()) owner = ""; continue; }
    const links = [...check[3].matchAll(STEP)].map(m => ({ path: m[1], id: m[2] }));
    const directOwner = check[3].match(new RegExp(`\\[\\[(${TASK_PATH})(?:\\|[^\\]]+)?\\]\\]`))?.[1];
    if (!check[1]) owner = directOwner || "";
    result.push({ index, section, owner, priority, group, status: check[2].toLowerCase(), text: check[3], links });
  }
  return { items: result, locations };
}

function eligibleDaily(markdown, path, date) {
  return validDate(date) && path === `workspace/daily/${date.slice(0, 4)}/${date.slice(0, 7)}/${date}.daily.md` &&
    scalar(markdown, "type") === "daily" && scalar(markdown, "date") === date && scalar(markdown, "status") === "open";
}

function planDaily({ markdown, path, date, tasks, history = [], manual = false }) {
  if (!eligibleDaily(markdown, path, date) || (!manual && !markdown.includes(MARKER))) return { markdown, added: [], errors: [] };
  const current = occurrences(markdown), prefs = new Map();
  for (const page of [...history].filter(p => validDate(scalar(p.markdown, "date")) && scalar(p.markdown, "date") < date)
    .sort((a, b) => scalar(a.markdown, "date").localeCompare(scalar(b.markdown, "date")))) {
    for (const [key, value] of occurrences(page.markdown).locations) prefs.set(key, value);
  }
  const added = [], errors = [], insertions = new Map();
  const lines = markdown.split(/\r?\n/);
  const addAt = (index, text) => insertions.set(index, [...(insertions.get(index) || []), text]);
  const sectionStart = lines.indexOf("## 跨日任务");
  const sectionEnd = lines.findIndex((line, i) => i > sectionStart && /^## /.test(line));
  if (sectionStart < 0 || sectionEnd < 0) return { markdown, added: [], errors: ["跨日任务区结构不完整"] };
  for (const task of tasks.filter(Boolean)) {
    if (task.status !== "active" || !validDate(task.created) || task.created > date) continue;
    errors.push(...task.errors);
    const steps = task.steps.filter(step => [" ", "/"].includes(step.status) && step.created <= date && !step.paused && (!step.resume || step.resume <= date));
    const remaining = steps.filter(step => !current.items.some(item =>
      item.links.some(link => link.path === task.path && link.id === step.id) ||
      (item.owner === task.path && item.text.replace(/<mark class="hltr-red">([^<]*)<\/mark>/g, "$1")
        .replace(/(?:✅)\s*\d{4}-\d{2}-\d{2}/g, "").trim() === step.label)));
    if (!remaining.length) continue;
    const existing = current.locations.get(task.path);
    const preference = existing || prefs.get(task.path) || { priority: task.priority === "high" ? "high" : "low", group: "WORK" };
    let at;
    if (existing) {
      at = existing.index + 1;
      while (at < sectionEnd && (!lines[at].trim() || /^\s/.test(lines[at]))) at++;
    } else {
      let priority = "";
      for (let i = sectionStart + 1; i < sectionEnd; i++) {
        if (/^### .*高优先级/.test(lines[i])) priority = "high";
        if (/^### .*低优先级/.test(lines[i])) priority = "low";
        if (priority === preference.priority && lines[i] === `#### ${preference.group}`) {
          at = i + 1;
          while (at < sectionEnd && !/^#{2,4} /.test(lines[at])) at++;
          break;
        }
      }
      if (at === undefined) { errors.push(`${task.path} 缺 ${preference.priority}/${preference.group} 分组，未写入`); continue; }
      addAt(at, `- [[${task.path}|${task.title.replaceAll("|", "／")}]]`);
    }
    for (const step of remaining) {
      addAt(at, `  - [ ] ${step.label} ↪ [[${task.path}#^${step.id}|待办]]`);
      added.push({ path: task.path, id: step.id });
    }
    addAt(at, "");
  }
  // Fail atomically: missing/ambiguous anchors must not silently drop a step.
  if (errors.length) return { markdown, added: [], errors };
  for (const [at, content] of [...insertions].sort((a, b) => b[0] - a[0])) lines.splice(at, 0, ...content);
  return { markdown: lines.join("\n").replace(MARKER, `<!-- task-todo:generated ${date} -->`), added, errors };
}

function reviewLinks(markdown, tasks) {
  const strict = /<!-- task-todo:(?:pending|generated|managed)/.test(markdown);
  const date = scalar(markdown, "date");
  // Apply complete-detail recording prospectively; historical closed pages remain compatible.
  const details = scalar(markdown, "status") === "open" && validDate(date) && date >= "2026-10-14";
  const problems = [];
  for (const item of occurrences(markdown).items) {
    if (strict && item.section === "跨日任务" && item.owner && item.status === ">" && !item.links.length) {
      problems.push({ line: item.index + 1, text: item.text, reason: "跨日交接缺 Task Todo 精确锚点" });
    }
    const action = item.text.match(/\[action::\s*([^\]]+)\]/)?.[1]?.trim();
    if (details && item.owner) {
      if (item.links.length !== 1) problems.push({ line: item.index + 1, text: item.text, reason: "Review 尚未整理：请由 Agent 补录或匹配 Task 明细并添加唯一 step 链接" });
      const allowed = { " ": ["planned"], "/": ["progress"], x: ["completed", "progress", "transferred"], ">": ["progress", "transferred", "deferred"], "-": ["cancelled"] };
      if (action && !allowed[item.status]?.includes(action)) problems.push({ line: item.index + 1, text: item.text, reason: "不匹配的旧 action：planned / progress / completed / transferred / deferred / cancelled" });
    }
    for (const link of item.links) {
      const task = tasks.find(t => t?.path === link.path);
      const step = task?.steps.find(s => s.id === link.id);
      const reason = item.owner && link.path !== item.owner ? "Todo 不属于当前 Task" :
        task?.errors.length ? "Task Todo 格式有误或锚点重复" :
        !step ? "Todo 原条目不存在或格式无效" :
        details && (step.occurred || step.created) > date ? "明细在该日尚未发生" :
        details && action === "completed" && (step.status !== "x" || step.completed !== date) ? "完成明细须同步原条目状态及当天完成日期" :
        item.status === ">" && ![" ", "/"].includes(step.status) &&
          !(validDate(date) && (step.completed || step.closed) > date) ? "交接日的 Todo 必须仍待办" : "";
      if (reason) problems.push({ line: item.index + 1, text: item.text, reason });
    }
  }
  return problems;
}

module.exports = { tableStep, MARKER, validDate, today, scalar, bodyLines, taskTodos, occurrences, eligibleDaily, planDaily, reviewLinks };
