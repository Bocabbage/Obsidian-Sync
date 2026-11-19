"use strict";

const GROUP_DIR = "workspace/task-groups";
const TASK = /^workspace\/tasks\/TASK-\d{6}-\d{3}\.md$/;
const GROUP = /^workspace\/task-groups\/GROUP-[\w-]+\.md$/;
function today(now = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Shanghai", year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
}
function validDate(s) {
  return typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s) && !isNaN(Date.parse(s)) && new Date(s).toISOString().slice(0, 10) === s;
}
function taskPath(value) {
  if (typeof value !== "string") throw new Error("成员必须是 Task wikilink");
  const path = value.replace(/^\[\[|\]\]$/g, "").split("|")[0].replace(/\.md$/, "") + ".md";
  if (!TASK.test(path)) throw new Error(`无效 Task 引用：${value}`);
  return path;
}
function group(data, path) {
  if (!GROUP.test(path) || data.type !== "task-group") throw new Error(`无效关注组：${path}`);
  if (typeof data.title !== "string" || !data.title.trim()) throw new Error(`关注组缺少名称：${path}`);
  if (!["open", "closed"].includes(data.status)) throw new Error(`关注组状态无效：${path}`);
  for (const field of ["created", "start"]) if (!validDate(data[field])) throw new Error(`${path} 缺少有效 ${field}`);
  for (const field of ["end", "closed"]) if (data[field] && !validDate(data[field])) throw new Error(`${path} 的 ${field} 日期无效`);
  if (data.end && data.end < data.start) throw new Error("预计结束日期不能早于开始日期");
  if ((data.status === "closed") !== Boolean(data.closed)) throw new Error("关闭组须同时保存 status: closed 和 closed 日期");
  if (data.closed && data.closed < data.created) throw new Error("关闭日期不能早于创建日期");
  if (!Array.isArray(data.tasks)) throw new Error("tasks 必须为 Task 链接列表");
  return { path, title: data.title.trim(), status: data.status, created: data.created, start: data.start,
    end: data.end || "", closed: data.closed || "", tasks: [...new Set(data.tasks.map(taskPath))] };
}
function activeGroups(groups, date) {
  return groups.filter(g => g.status === "open" && g.created <= date && g.start <= date)
    .sort((a, b) => a.start.localeCompare(b.start) || a.path.localeCompare(b.path));
}
function eligibleTasks(tasks, date) {
  return tasks.filter(t => t.type === "task" && validDate(t.created) && t.created <= date && (!t.closed || t.closed > date))
    .sort((a, b) => ({ high: 0, normal: 1, low: 2 }[a.priority] ?? 2) - ({ high: 0, normal: 1, low: 2 }[b.priority] ?? 2)
      || String(b.updated || "").localeCompare(String(a.updated || "")) || a.path.localeCompare(b.path));
}
function snapshotPath(date) {
  if (!validDate(date)) throw new Error("快照日期无效");
  return `workspace/daily/_meta/task-groups/${date.slice(0, 4)}/${date.slice(0, 7)}/${date}.task-groups.md`;
}
function makeSnapshot(groups, date) {
  if (!validDate(date)) throw new Error("快照日期无效");
  return { version: 1, date, groups: activeGroups(groups, date) };
}
function renderSnapshot(value) {
  return `---\ntype: task-group-snapshot\ndate: "${value.date}"\n---\n\n# 当日关注组\n\n组名和成员保存于当天；不会随后续组调整而变化。\n\n\`\`\`json\n${JSON.stringify(value, null, 2)}\n\`\`\`\n`;
}
function readSnapshot(text, date) {
  if (!validDate(date)) throw new Error("快照日期无效");
  const match = text.match(/```json\r?\n([\s\S]*?)\r?\n```/);
  if (!match) throw new Error("关注组快照缺少数据");
  const value = JSON.parse(match[1]);
  if (value.version !== 1 || value.date !== date || !Array.isArray(value.groups)) throw new Error("关注组快照版本或日期无效");
  const groups = value.groups.map(g => group({ ...g, type: "task-group" }, g.path));
  if (new Set(groups.map(g => g.path)).size !== groups.length || activeGroups(groups, date).length !== groups.length) throw new Error("关注组快照包含重复或非当日组");
  return { version: 1, date, groups };
}
function canSnapshot(data, path, date) {
  return validDate(date) && data.type === "daily" && data.date === date && data.status === "open"
    && path === `workspace/daily/${date.slice(0, 4)}/${date.slice(0, 7)}/${date}.daily.md`;
}
module.exports = { GROUP_DIR, GROUP, TASK, today, validDate, taskPath, group, activeGroups, eligibleTasks, snapshotPath, makeSnapshot, renderSnapshot, readSnapshot, canSnapshot };
