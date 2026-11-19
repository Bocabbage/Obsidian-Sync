// Shared by the Obsidian view and the read-only Daily snapshot command.
function validDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || "")) return false;
  const parsed = new Date(value + "T00:00:00Z");
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

function shanghaiDate(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Shanghai", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(now);
  const get = (type) => parts.find((part) => part.type === type).value;
  return `${get("year")}-${get("month")}-${get("day")}`;
}

function parseTodos(markdown, path) {
  if (!/^type: todo-log\s*$/m.test(markdown.split(/^---\s*$/m)[1] || "")) return [];
  let group = "", fence = false;
  const items = [];
  for (const [line, raw] of markdown.split(/\r?\n/).entries()) {
    if (/^\s*(```|~~~)/.test(raw)) { fence = !fence; continue; }
    if (fence) continue;
    const heading = raw.match(/^##\s+(.+?)\s*$/);
    if (heading) group = heading[1];
    const task = raw.match(/^- \[([ xX/\->])\] (.+)$/);
    if (!task) continue;
    const text = task[2];
    const created = text.match(/➕\s*(\d{4}-\d{2}-\d{2})/)?.[1] || "";
    const completed = text.match(/✅\s*(\d{4}-\d{2}-\d{2})/)?.[1] || "";
    const closed = text.match(/\[closed::\s*(\d{4}-\d{2}-\d{2})\s*\]/)?.[1] || "";
    const dueFields = [...text.matchAll(/📅\s*([^\s]+)/g)];
    const due = dueFields[0]?.[1] || "";
    const historyFields = [...text.matchAll(/\[due_history::\s*([^\]]*)\]/g)];
    const dueHistory = historyFields.length ? historyFields[0][1].split(";").map(entry => {
      const [on, value, extra] = entry.trim().split("=");
      return { on, due: value === "none" ? "" : value, extra };
    }) : [];
    const id = text.match(/\s\^(todo-[a-zA-Z0-9-]+)\s*$/)?.[1] || "";
    const status = task[1].toLowerCase();
    const problems = [];
    if (!validDate(created)) problems.push("缺少有效录入日期 ➕");
    if (status === "x" && !validDate(completed)) problems.push("缺少有效完成日期 ✅");
    if (["-", ">"].includes(status) && !validDate(closed)) problems.push("缺少有效结束日期 closed");
    if (completed && status !== "x") problems.push("完成日期与 Checkbox 状态不一致");
    if (closed && !["-", ">"].includes(status)) problems.push("结束日期与 Checkbox 状态不一致");
    if ((completed || closed) && (completed || closed) < created) problems.push("结束日期早于录入日期");
    if (dueFields.length > 1 || (text.includes("📅") && !validDate(due)) || (due && due < created)) problems.push("截止日期 📅 无效或早于录入日期");
    if (historyFields.length > 1 || (text.includes("[due_history::") && !historyFields.length) || dueHistory.some((entry, index) =>
      !validDate(entry.on) || entry.on < created || entry.extra !== undefined || typeof entry.due !== "string" ||
      (entry.due !== "" && (!validDate(entry.due) || entry.due < created)) ||
      (index > 0 && entry.on <= dueHistory[index - 1].on)) ||
      (dueHistory.length && (dueHistory[0].on !== created || dueHistory.at(-1).due !== due))) problems.push("安排历史 due_history 无效或与截止日期不一致");
    const label = todoLabel(text);
    items.push({ path, line, raw, id, group, label, status, created, completed, closed, due, dueHistory, problems });
  }
  return items;
}

function todoLabel(text) {
  return text.replace(/(?:➕|✅|📅)\s*[^\s]+/g, "").replace(/\[(?:closed|due_history)::[^\]]*\]/g, "").replace(/\s\^todo-[a-zA-Z0-9-]+\s*$/, "").trim();
}

function dueAtDate(item, date) {
  if (!item.dueHistory?.length) return item.due || "";
  return item.dueHistory.filter(entry => entry.on <= date).at(-1)?.due || "";
}

function pendingGroups(items, date) {
  const result = { today: [], overdue: [], regular: [] };
  for (const item of items) result[item.due === date ? "today" : item.due && item.due < date ? "overdue" : "regular"].push(item);
  result.overdue.sort((a, b) => a.due.localeCompare(b.due));
  return result;
}

function atDate(items, date) {
  if (!validDate(date)) throw new Error("Invalid Todo date: " + date);
  const result = { date, pending: [], completed: [], closed: [], unknown: [] };
  for (const item of items) {
    if (item.created && validDate(item.created) && item.created > date) continue;
    if (item.problems.length) { result.unknown.push(item); continue; }
    const end = item.completed || item.closed;
    const dated = { ...item, due: dueAtDate(item, date) };
    if (!end || end > date) result.pending.push({ ...dated, status: !end ? item.status : " " });
    else if (end === date) (item.completed ? result.completed : result.closed).push(dated);
  }
  return result;
}

function nextId(markdown, date) {
  const prefix = "todo-" + date.replaceAll("-", "") + "-";
  const used = [...markdown.matchAll(new RegExp("\\^" + prefix + "(\\d+)", "g"))].map((match) => Number(match[1]));
  return prefix + String(Math.max(0, ...used) + 1).padStart(2, "0");
}

function toggleTodo(markdown, item, date, done) {
  if (!validDate(date)) throw new Error("日期无效");
  const lines = markdown.split(/\r?\n/);
  const index = item.id ? lines.findIndex((line) => line.endsWith(" ^" + item.id)) : item.line;
  if (index < 0 || lines[index] !== item.raw) throw new Error("原条目已变化，请刷新后再操作。");
  if (item.problems.length) throw new Error("请先在原条目补齐日期：" + item.problems.join("；"));
  if (item.created > date) throw new Error("尚未到录入日期");
  if (done ? ![" ", "/"].includes(item.status) : item.status !== "x" || item.completed !== date) throw new Error("只能完成未完成项，或撤销今天的误勾选。");
  let line = lines[index].replace(/^- \[[^\]]\]/, done ? "- [x]" : "- [ ]").replace(/\s*✅\s*\d{4}-\d{2}-\d{2}/g, "").replace(/\s\^todo-[a-zA-Z0-9-]+\s*$/, "").trimEnd();
  if (done) line += " ✅ " + date;
  line += " ^" + (item.id || nextId(markdown, date));
  lines[index] = line;
  return lines.join(markdown.includes("\r\n") ? "\r\n" : "\n");
}

function addTodo(markdown, label, group, date, due = "") {
  if (!validDate(date) || !["WORK", "LIFE"].includes(group)) throw new Error("日期或分组无效");
  if (due && (!validDate(due) || due < date)) throw new Error("截止日期不能早于录入日期");
  label = label.trim();
  if (!label || /[\r\n]/.test(label) || /(?:➕|✅|📅|\^todo-|\[(?:closed|due_history)::)/.test(label)) throw new Error("请填写一行待办正文，日期和安排由入口自动记录。");
  const row = `- [ ] ${label} ➕ ${date}${due ? " 📅 " + due : ""} ^${nextId(markdown, date)}`;
  const heading = new RegExp("^## " + group + "[ \\t]*$", "m");
  const match = markdown.match(heading);
  if (!match) return markdown.trimEnd() + "\n\n## " + group + "\n\n" + row + "\n";
  const offset = match.index + match[0].length;
  return markdown.slice(0, offset) + "\n\n" + row + "\n\n" + markdown.slice(offset).replace(/^\s*\n/, "");
}

function scheduleTodo(markdown, item, date, due = "") {
  if (!validDate(date) || (due && (!validDate(due) || due < date))) throw new Error("请选择今天或以后的日期，或转为常规任务");
  const lines = markdown.split(/\r?\n/);
  const index = item.id ? lines.findIndex(line => line.endsWith(" ^" + item.id)) : item.line;
  if (index < 0 || lines[index] !== item.raw) throw new Error("原条目已变化，请刷新后再操作。");
  // Reparse current facts: a dated view may have projected an earlier schedule.
  const current = parseTodos(markdown, item.path).find(entry => entry.line === index);
  if (!current || current.problems.length || ![" ", "/"].includes(current.status)) throw new Error("只能调整日期完整的未完成项");
  if (date < current.created || current.dueHistory.some(entry => entry.on > date)) throw new Error("不能反向改写过去的安排");
  if (current.due === due) return markdown;
  const history = current.dueHistory.length ? current.dueHistory : [{ on: current.created, due: current.due }];
  const next = [...history.filter(entry => entry.on < date), { on: date, due }];
  let row = lines[index].replace(/\s*📅\s*[^\s]+/g, "").replace(/\s*\[due_history::[^\]]*\]/g, "").replace(/\s\^todo-[a-zA-Z0-9-]+\s*$/, "").trimEnd();
  if (due) row += " 📅 " + due;
  row += " [due_history:: " + next.map(entry => entry.on + "=" + (entry.due || "none")).join("; ") + "]";
  lines[index] = row + " ^" + (current.id || nextId(markdown, date));
  return lines.join(markdown.includes("\r\n") ? "\r\n" : "\n");
}

function snapshotPath(date) {
  return `workspace/daily/_meta/todos/${date.slice(0, 4)}/${date.slice(0, 7)}/${date}.todos.md`;
}

function makeSnapshot(items, date, captured = shanghaiDate()) {
  const result = atDate(items, date);
  if (result.unknown.length) throw new Error("Todo 日期不完整，无法冻结：" + result.unknown.map((item) => `${item.path}:${item.line + 1} ${item.problems.join("、")}`).join("；"));
  const clean = (item) => ({ path: item.path, id: item.id, label: item.label, group: item.group, created: item.created, status: item.status, due: item.due });
  return { version: 2, date, captured, mode: captured === date ? "review" : "reconstructed", pending: result.pending.map(clean), completed: result.completed.map(clean), closed: result.closed.map(clean) };
}

function renderSnapshot(snapshot) {
  const lines = ["---", "type: daily-todo-snapshot", "date: " + snapshot.date, "captured: " + snapshot.captured, "---", "", "# " + snapshot.date + " 待办快照", "", snapshot.mode === "review" ? "复盘时保存。" : "事后按原条目日期重建。", ""];
  const groups = snapshot.version === 1 ? { pending: snapshot.pending } : pendingGroups(snapshot.pending, snapshot.date);
  const sections = snapshot.version === 1 ? [["pending", "当日仍待办"]] : [["today", "当日必做"], ["overdue", "逾期"], ["regular", "常规任务"]];
  for (const [key, title] of [...sections, ["completed", "当日完成"], ["closed", "当日取消 / 转 Task"]]) {
    const items = groups[key] || snapshot[key];
    lines.push("## " + title, "");
    for (const item of items) lines.push("- " + item.label + " · [[" + item.path.replace(/\.md$/, "") + (item.id ? "#^" + item.id : "") + "|原条目]]" + (snapshot.version === 2 ? ` · ${item.created} 录入${item.due ? " · " + item.due + " 应完成" : ""}` : ""));
    if (!items.length) lines.push("无。");
    lines.push("");
  }
  lines.push("<!-- todo-snapshot " + JSON.stringify(snapshot).replaceAll("<", "\\u003c").replaceAll(">", "\\u003e") + " -->");
  return lines.join("\n") + "\n";
}

function readSnapshot(markdown, date) {
  const match = markdown.match(/<!-- todo-snapshot (.*?) -->/);
  if (!match) throw new Error("Todo 快照缺少数据");
  const snapshot = JSON.parse(match[1]);
  if (![1, 2].includes(snapshot.version) || snapshot.date !== date || !["pending", "completed", "closed"].every((key) => Array.isArray(snapshot[key]) && snapshot[key].every((item) => typeof item.label === "string" && typeof item.path === "string" && (snapshot.version === 1 || (validDate(item.created) && typeof item.due === "string" && (!item.due || validDate(item.due))))))) throw new Error("Todo 快照版本、日期或条目不符");
  return snapshot;
}

module.exports = { validDate, shanghaiDate, parseTodos, atDate, dueAtDate, pendingGroups, todoLabel, nextId, toggleTodo, addTodo, scheduleTodo, snapshotPath, makeSnapshot, renderSnapshot, readSnapshot };
