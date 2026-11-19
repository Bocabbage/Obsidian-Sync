const module = { exports: {} };
new Function("module", await dv.app.vault.adapter.read("agents/views/overview/_views/task-pool/model.cjs"))(module);
const model = module.exports;
const root = dv.container;
root.classList.add("task-group-pool");
const current = dv.current();
const manage = input?.mode === "manage";
const dateKey = v => v?.toFormat ? v.toFormat("yyyy-MM-dd") : String(v || "").slice(0, 10);
const date = manage ? model.today() : dateKey(current.date);
if (!model.validDate(date)) throw new Error("任务池缺少有效 Daily 日期");
const live = manage || (date === model.today() && current.status === "open");
const service = dv.app.plugins.getPlugin("vault-daily-todos")?.taskGroups;
function el(tag, text, parent = root) {
  const node = document.createElement(tag); if (text) node.textContent = text; parent.appendChild(node); return node;
}
function link(parent, label, path) {
  const a = el("a", label, parent); a.className = "internal-link"; a.href = path; a.dataset.href = path;
  a.addEventListener("click", e => { e.preventDefault(); dv.app.workspace.openLinkText(path, current.file.path, e.ctrlKey || e.metaKey); });
  return a;
}
function button(parent, label, fn) {
  const b = el("button", label, parent);
  b.addEventListener("click", async () => {
    b.disabled = true;
    try { await fn(); } catch (e) { el("p", e.message); }
    finally { b.disabled = false; }
  }); return b;
}
const tasks = [...dv.pages('"workspace/tasks"')].map(t => ({ path: t.file.path, type: t.type, title: t.title || t.file.name,
  created: dateKey(t.created), closed: dateKey(t.closed), updated: dateKey(t.updated), priority: t.priority, status: t.status }));
const pool = model.eligibleTasks(tasks, date);
const taskMap = new Map(tasks.map(t => [t.path, t]));
function table(items, parent) {
  if (!items.length) { el("p", "暂无截至本页日期未闭环的任务。", parent); return; }
  const table = el("table", "", parent), head = el("tr", "", el("thead", "", table));
  for (const title of ["任务", "优先级", "当前状态"]) el("th", title, head);
  const body = el("tbody", "", table);
  for (const task of items) {
    const row = el("tr", "", body); link(el("td", "", row), task.title, task.path);
    el("td", task.priority || "—", row); el("td", task.status || "—", row);
  }
}
const toolbar = el("div"); toolbar.className = "task-group-toolbar";
link(toolbar, "管理关注组", "workspace/task-groups/_Index.md");
link(toolbar, "全部 Tasks", "workspace/tasks/_Index.md");
if (live && service) button(toolbar, "创建关注组", () => service.openCreate());
if (live && !service) el("p", "创建与编辑关注组需启用新版 Vault Daily Todos 插件；更新后请重启 Obsidian 或重新启用插件。");
let groups = [];
try {
  if (live) {
    let all;
    if (service) all = (await service.readGroups()).map(r => r.group);
    else all = [...dv.pages('"workspace/task-groups"')].filter(g => g.type === "task-group").map(g => model.group({
      type: g.type, title: g.title, status: g.status, created: dateKey(g.created), start: dateKey(g.start), end: dateKey(g.end), closed: dateKey(g.closed),
      tasks: [...(g.tasks || [])].map(t => typeof t === "string" ? t : t.path)
    }, g.file.path));
    groups = manage ? all.sort((a, b) => a.path.localeCompare(b.path)) : model.activeGroups(all, date);
  } else {
    const path = model.snapshotPath(date), file = dv.app.vault.getAbstractFileByPath(path);
    if (file) { groups = model.readSnapshot(await dv.app.vault.read(file), date).groups; el("p", `${date} · 当日关注组记录（只读）`); }
    else el("p", "本日未保存关注组记录，仅显示全量任务池；不按当前分组重建历史。");
  }
} catch (error) { el("p", `关注组读取失败：${error.message}。全量任务仍可查看。`); }

function groupSection(group, parent) {
  const section = el("details", "", parent); section.open = group.status === "open";
  const members = new Set(group.tasks), visible = pool.filter(t => members.has(t.path));
  el("summary", `${group.title} · ${group.status === "closed" ? "已关闭" : group.start > date ? "未开始" : "关注中"} · ${group.tasks.length} 项`, section);
  const controls = el("div", "", section); controls.className = "task-group-toolbar";
  link(controls, "组记录", group.path);
  el("span", `${group.start}${group.end ? ` ～ ${group.end}` : "起"}${group.closed ? ` · ${group.closed} 关闭` : ""}`, controls);
  if (live && group.status === "open" && group.end && group.end < date) el("p", "已过预计结束日期，可继续关注或手动关闭。", section);
  if (live && service && group.status === "open") {
    button(controls, "编辑", () => service.openEdit(group.path));
    button(controls, "关闭组", () => service.closeGroup(group.path));
  }
  table(visible, section);
  // Preserve access to every original member even when it has since closed/disappeared.
  const hidden = group.tasks.filter(path => !visible.some(t => t.path === path));
  if (hidden.length) {
    const more = el("details", "", section); el("summary", `其他组内任务（${hidden.length}）`, more);
    const list = el("ul", "", more);
    for (const path of hidden) link(el("li", "", list), taskMap.get(path)?.title || `${path.split("/").pop()}（引用缺失）`, path);
  }
}
if (manage) {
  el("p", "多个关注组可以并行；关闭组不会完成或取消任务。已关闭组保留全部成员。需要继续关注时创建新组并选入原 Task。");
  if (!groups.length) el("p", "还没有关注组。可以创建季度 LIFE 或版本迭代组，再选择具体任务。");
  for (const group of groups) groupSection(group, root);
} else {
  for (const group of groups) groupSection(group, root);
  const all = el("details"); all.open = groups.length === 0;
  el("summary", `全部任务（${pool.length}）`, all);
  el("p", "包含已分组和未分组任务，均可正常安排进 Daily。", all);
  table(pool, all);
}
