const module = { exports: {} };
new Function("module", await dv.app.vault.adapter.read("agents/views/overview/_views/todo-pool/model.cjs"))(module);
const model = module.exports;
const vault = dv.app.vault;
const current = dv.current();
const key = (value) => value?.toFormat ? value.toFormat("yyyy-MM-dd") : String(value || "").slice(0, 10);
const daily = current?.type === "daily";
const date = daily ? key(current.date) : model.shanghaiDate();
if (!model.validDate(date)) throw new Error("Daily 缺少有效日期，无法显示待办历史。");
const root = dv.container;
root.classList.add("todo-pool");
// Dataview inserts view.css before executing this file; retain it on each render.
const styles = [...root.children].filter(node => node.tagName === "STYLE");

function el(tag, text, parent = root) {
  const node = document.createElement(tag);
  if (text) node.textContent = text;
  parent.appendChild(node);
  return node;
}
function link(parent, label, target) {
  const anchor = el("a", label, parent);
  anchor.className = "internal-link";
  anchor.href = target;
  anchor.dataset.href = target;
  return anchor;
}
function failure(error) { el("p", "未保存：" + error.message); }
async function refresh() { dv.app.workspace.trigger("dataview:refresh-views"); await render(); }
async function assertWritable() {
  if (date !== model.shanghaiDate()) throw new Error("日期已切换，请重新打开今日页面。");
  if (daily) {
    const file = vault.getAbstractFileByPath(current.file.path);
    if (!file || /^status:\s*["']?closed["']?\s*$/m.test(await vault.read(file)) || vault.getAbstractFileByPath(model.snapshotPath(date))) throw new Error("本页已复盘或保存快照，请从小任务总览处理当前任务。");
  }
}
const shortDate = value => value.slice(0, 4) === date.slice(0, 4) ? value.slice(5) : value;

function scheduleEditor(row, item, opener) {
  opener.disabled = true;
  const form = el("form", "", row); form.className = "todo-pool-schedule";
  const choice = el("select", "", form); choice.setAttribute("aria-label", item.label + "的完成安排");
  for (const [value, title] of [["regular", "常规任务"], ["today", "今日必做"], ["date", "指定日期"]]) {
    const option = el("option", title, choice); option.value = value;
  }
  choice.value = !item.due ? "regular" : item.due === date ? "today" : "date";
  const day = el("input", "", form); day.type = "date"; day.min = date; day.value = item.due || date; day.setAttribute("aria-label", "应完成日期");
  day.hidden = choice.value !== "date";
  day.disabled = day.hidden;
  choice.addEventListener("change", () => { day.hidden = choice.value !== "date"; day.disabled = day.hidden; });
  const save = el("button", "保存", form); save.type = "submit";
  const cancel = el("button", "取消", form); cancel.type = "button";
  cancel.addEventListener("click", () => { form.remove(); opener.disabled = false; });
  form.addEventListener("submit", async event => {
    event.preventDefault(); save.disabled = true;
    try {
      await assertWritable();
      const due = choice.value === "regular" ? "" : choice.value === "today" ? date : day.value;
      if (choice.value === "date" && !model.validDate(due)) throw new Error("请选择应完成日期");
      const file = vault.getAbstractFileByPath(item.path);
      if (!file) throw new Error("原条目文件不存在");
      await vault.process(file, data => model.scheduleTodo(data, item, date, due));
      await refresh();
    } catch (error) { failure(error); save.disabled = false; }
  });
  choice.focus();
}

async function render() {
  root.replaceChildren(...styles);
  const today = model.shanghaiDate();
  const snapshotFile = daily ? vault.getAbstractFileByPath(model.snapshotPath(date)) : null;
  const snapshot = snapshotFile ? model.readSnapshot(await vault.read(snapshotFile), date) : null;
  const writable = date === today && (!daily || current.status !== "closed") && !snapshot;
  let result;
  if (snapshot) result = { ...snapshot, unknown: [] };
  else {
    const paths = vault.getMarkdownFiles().filter((file) => /^workspace\/todos\/\d{4}\/\d{4}-\d{2}\.md$/.test(file.path));
    const items = (await Promise.all(paths.map(async (file) => model.parseTodos(await vault.read(file), file.path)))).flat();
    result = model.atDate(items, date);
  }
  if (!writable) {
    const note = snapshot
      ? `${date} · 已保存${snapshot.mode === "reconstructed" ? "事后重建" : "复盘"}快照（只读）`
      : `${date} · 按日期回看（尚无复盘快照，只读）`;
    el("p", note).className = "todo-pool-note";
  }
  if (writable) {
    const form = el("form"); form.className = "todo-pool-add";
    const group = el("select", "", form); group.setAttribute("aria-label", "待办分组");
    for (const value of ["WORK", "LIFE"]) { const option = el("option", value, group); option.value = value; }
    const text = el("input", "", form); text.type = "text"; text.placeholder = "记一件小事…"; text.setAttribute("aria-label", "新待办");
    const plan = el("select", "", form); plan.setAttribute("aria-label", "完成安排");
    for (const [value, title] of [["regular", "常规任务"], ["today", "今日必做"]]) { const option = el("option", title, plan); option.value = value; }
    const button = el("button", "添加", form); button.type = "submit";
    form.addEventListener("submit", async (event) => {
      event.preventDefault(); button.disabled = true;
      try {
        await assertWritable();
        const due = plan.value === "today" ? date : "";
        const path = `workspace/todos/${date.slice(0, 4)}/${date.slice(0, 7)}.md`;
        let file = vault.getAbstractFileByPath(path);
        if (!file) {
          const dir = path.slice(0, path.lastIndexOf("/"));
          if (!vault.getAbstractFileByPath(dir)) await vault.createFolder(dir);
          const initial = `---\ntype: todo-log\nperiod: "${date.slice(0, 7)}"\ncreated: ${date}\nupdated: ${date}\n---\n\n# ${date.slice(0, 7)} 待办\n\n## WORK\n\n## LIFE\n`;
          file = await vault.create(path, model.addTodo(initial, text.value, group.value, date, due));
        } else await vault.process(file, (data) => model.addTodo(data, text.value, group.value, date, due));
        await refresh();
      } catch (error) { failure(error); button.disabled = false; }
    });
  }
  const legacy = snapshot?.version === 1;
  const pending = model.pendingGroups(result.pending, date);
  const dayLabel = date === today ? "今日" : "当日";
  const sections = legacy ? [["pending", "仍待办"]] : [["today", dayLabel + "必做"], ["overdue", "逾期"], ["regular", "常规任务"]];
  for (const [field, title] of [...sections, ["completed", dayLabel + "完成"], ["closed", dayLabel + "取消 / 转 Task"]]) {
    const items = pending[field] || result[field];
    if (["overdue", "closed"].includes(field) && !items.length) continue;
    const heading = el("h4", title + " · " + items.length);
    if (field === "overdue") heading.className = "todo-pool-overdue-heading";
    if (!items.length) { el("p", "无。").className = "todo-pool-empty"; continue; }
    const list = el("ul"); list.className = "contains-task-list";
    for (const item of items) {
      const row = el("li", "", list); row.className = "task-list-item";
      const checked = ["completed", "closed"].includes(field);
      const checkbox = el("input", "", row); checkbox.type = "checkbox"; checkbox.className = "task-list-item-checkbox"; checkbox.checked = checked;
      checkbox.disabled = !writable || field === "closed";
      checkbox.setAttribute("aria-label", item.label);
      el("span", item.label, row);
      el("span", " · ", row);
      link(row, item.group || "原条目", item.path.replace(/\.md$/, "") + (item.id ? "#^" + item.id : ""));
      if (item.created) {
        const created = el("span", " · " + shortDate(item.created) + " 录入", row); created.className = "todo-pool-created"; created.title = item.created + " 录入";
      }
      if (item.due && item.due !== date) {
        const due = el("span", " · " + shortDate(item.due) + " 应完成", row); due.className = field === "overdue" ? "todo-pool-overdue" : "todo-pool-created";
      }
      if (writable && !checked) {
        const edit = el("button", item.due ? "改期" : "安排", row); edit.type = "button"; edit.className = "todo-pool-edit"; edit.setAttribute("aria-label", "调整安排：" + item.label);
        edit.addEventListener("click", () => scheduleEditor(row, item, edit));
      }
      checkbox.addEventListener("change", async () => {
        checkbox.disabled = true;
        try {
          await assertWritable();
          const file = vault.getAbstractFileByPath(item.path);
          if (!file) throw new Error("原条目文件不存在");
          await vault.process(file, (data) => model.toggleTodo(data, item, date, checkbox.checked));
          await refresh();
        } catch (error) { checkbox.checked = checked; checkbox.disabled = false; failure(error); }
      });
    }
  }
  if (result.unknown.length) {
    el("h4", "日期待补充 · " + result.unknown.length);
    for (const item of result.unknown) {
      const row = el("p", item.label + " · " + item.problems.join("；") + " · ");
      link(row, "补充原条目", item.path);
    }
  }
  const nav = el("p");
  link(nav, "小任务待办池总览", "workspace/todos/_Index");
  if (snapshotFile) { el("span", " · ", nav); link(nav, "查看快照", snapshotFile.path); }
}
await render();
