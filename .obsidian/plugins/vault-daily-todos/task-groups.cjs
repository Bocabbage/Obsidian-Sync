"use strict";
// Obsidian's plugin loader supplies its API; native child-module require cannot resolve it.
module.exports = function createTaskGroups({ Modal, Notice, parseYaml, stringifyYaml }) {

function frontmatter(text) {
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!match) throw new Error("缺少 YAML Properties");
  return { data: parseYaml(match[1]) || {}, body: text.slice(match[0].length) };
}

class GroupEditor extends Modal {
  constructor(service, record) { super(service.app); this.service = service; this.record = record; }
  async onOpen() {
    const s = this.service, m = s.model, root = this.contentEl;
    root.createEl("h2", { text: this.record ? "编辑关注组" : "创建关注组" });
    const field = (name, type, value) => {
      const label = root.createEl("label", { text: name });
      const input = label.createEl("input", { type, value });
      input.style.display = "block"; input.style.width = "100%"; input.style.marginBottom = "12px";
      return input;
    };
    const data = this.record?.data || {};
    const name = field("名称", "text", data.title || "");
    name.placeholder = "例如：2026 Q4 · LIFE / 版本 2.8 · 核心任务";
    const start = field("开始日期", "date", data.start || m.today());
    const end = field("预计结束日期（可选，不会自动关闭）", "date", data.end || "");
    const search = field("筛选任务", "search", "");
    root.createEl("p", { text: "勾选关注的任务。未选中的任务仍可正常安排和自动续入 Daily。" });
    const list = root.createDiv(); list.style.maxHeight = "320px"; list.style.overflowY = "auto";
    const selected = new Set((data.tasks || []).map(m.taskPath));
    const choices = [];
    try {
      const tasks = await s.readTasks();
      const known = new Set(tasks.map(t => t.path));
      for (const path of selected) if (!known.has(path)) tasks.push({ path, title: path, status: "引用失效" });
      tasks.sort((a, b) => Number(selected.has(b.path)) - Number(selected.has(a.path)) || a.path.localeCompare(b.path));
      for (const task of tasks.filter(t => selected.has(t.path) || !["done", "cancelled"].includes(t.status))) {
        const label = list.createEl("label"); label.style.display = "block";
        const check = label.createEl("input", { type: "checkbox" }); check.checked = selected.has(task.path);
        label.appendText(` ${task.title || task.path} · ${task.status || "未设状态"}`);
        check.addEventListener("change", () => check.checked ? selected.add(task.path) : selected.delete(task.path));
        choices.push({ label, text: `${task.title} ${task.path}`.toLowerCase() });
      }
      search.addEventListener("input", () => choices.forEach(c => c.label.hidden = !c.text.includes(search.value.toLowerCase())));
    } catch (error) { root.createEl("p", { text: error.message }); return; }
    const actions = root.createDiv(); actions.style.marginTop = "16px";
    const errorEl = root.createEl("p");
    const save = actions.createEl("button", { text: "保存", cls: "mod-cta" });
    save.addEventListener("click", async () => {
      save.disabled = true;
      try {
        await s.save(this.record, { title: name.value.trim(), start: start.value, end: end.value, tasks: [...selected].map(p => `[[${p.slice(0, -3)}]]`) });
        this.close();
      } catch (error) { errorEl.textContent = error.message; save.disabled = false; }
    });
    actions.createEl("button", { text: "取消" }).addEventListener("click", () => this.close());
  }
  onClose() { this.contentEl.empty(); }
}

class TaskGroups {
  constructor(plugin) {
    this.plugin = plugin; this.app = plugin.app; this.vault = this.app.vault;
    this.model = require(`${this.vault.adapter.getBasePath()}/agents/views/overview/_views/task-pool/model.cjs`);
    this.queue = Promise.resolve(); this.stopped = false;
  }
  run(fn) {
    const result = this.queue.then(() => { if (this.stopped) return; return fn(); });
    this.queue = result.catch(() => {}); return result;
  }
  refresh() { this.app.workspace.trigger("dataview:refresh-views"); }
  async readGroups() {
    const files = this.vault.getMarkdownFiles().filter(f => this.model.GROUP.test(f.path)).sort((a, b) => a.path.localeCompare(b.path));
    return Promise.all(files.map(async file => {
      const text = await this.vault.read(file), { data } = frontmatter(text);
      return { file, text, data, group: this.model.group(data, file.path) };
    }));
  }
  async readTasks() {
    return Promise.all(this.vault.getMarkdownFiles().filter(f => this.model.TASK.test(f.path)).map(async f => ({ ...frontmatter(await this.vault.read(f)).data, path: f.path })));
  }
  async mkdir(path) {
    let dir = "";
    for (const part of path.split("/")) {
      dir = dir ? `${dir}/${part}` : part;
      if (!this.vault.getAbstractFileByPath(dir)) await this.vault.createFolder(dir);
    }
  }
  async snapshot() {
    const m = this.model, date = m.today();
    const dailyPath = `workspace/daily/${date.slice(0, 4)}/${date.slice(0, 7)}/${date}.daily.md`;
    const daily = this.vault.getAbstractFileByPath(dailyPath);
    if (!daily) return false;
    const before = await this.vault.read(daily);
    if (!m.canSnapshot(frontmatter(before).data, dailyPath, date)) return false;
    const records = await this.readGroups();
    const snapshot = m.renderSnapshot(m.makeSnapshot(records.map(r => r.group), date));
    const path = m.snapshotPath(date), file = this.vault.getAbstractFileByPath(path);
    const old = file ? await this.vault.read(file) : null;
    if (old !== null) m.readSnapshot(old, date); // Never overwrite a corrupt record silently.
    if (old === snapshot) return true;
    await this.mkdir(path.slice(0, path.lastIndexOf("/")));
    // Recheck every source after async IO; a later event retries concurrent edits.
    if (m.today() !== date || await this.vault.read(daily) !== before) throw new Error("Daily 正在变化，未覆盖关注组快照，请重试");
    const again = await this.readGroups();
    if (JSON.stringify(again.map(r => [r.file.path, r.text])) !== JSON.stringify(records.map(r => [r.file.path, r.text]))) throw new Error("关注组正在变化，未覆盖快照，请重试");
    if (file) await this.vault.process(file, current => {
      if (current !== old) throw new Error("关注组快照正在变化，未覆盖");
      return snapshot;
    });
    else await this.vault.create(path, snapshot);
    this.refresh(); return true;
  }
  async afterSave() {
    try { await this.snapshot(); }
    catch (error) { new Notice(`关注组已保存，但当天快照未更新：${error.message}。请运行“保存今日关注组快照”。`, 10000); }
    this.refresh();
  }
  save(record, values) {
    return this.run(async () => {
      const m = this.model, date = m.today();
      if (record && record.data.status !== "open") throw new Error("已关闭组保留历史，请创建新组");
      const path = record?.file.path || `${m.GROUP_DIR}/GROUP-${date.replaceAll("-", "")}-${globalThis.crypto.randomUUID()}.md`;
      const data = { ...(record?.data || { type: "task-group", status: "open", created: date }), ...values, updated: date };
      const parsed = m.group(data, path);
      for (const member of parsed.tasks) {
        const file = this.vault.getAbstractFileByPath(member);
        if (!file || frontmatter(await this.vault.read(file)).data.type !== "task") throw new Error(`任务引用失效：${member}`);
      }
      const body = record ? frontmatter(record.text).body : "\n# 关注组\n\n这里的任务是这段时间的关注重点；具体推进记录在 Daily。\n";
      const output = `---\n${stringifyYaml(data)}---\n${body}`;
      if (record) await this.vault.process(record.file, current => {
        if (current !== record.text) throw new Error("关注组已被修改，请重新打开编辑框");
        return output;
      });
      else { await this.mkdir(m.GROUP_DIR); await this.vault.create(path, output); }
      await this.afterSave();
    });
  }
  closeGroup(path) {
    return this.run(async () => {
      if (!this.model.GROUP.test(path)) throw new Error("无效关注组路径");
      const file = this.vault.getAbstractFileByPath(path);
      if (!file) throw new Error("关注组不存在");
      await this.vault.process(file, text => {
        const { data, body } = frontmatter(text);
        this.model.group(data, path);
        if (data.status === "closed") return text;
        data.status = "closed"; data.closed = this.model.today(); data.updated = data.closed;
        this.model.group(data, path);
        return `---\n${stringifyYaml(data)}---\n${body}`;
      });
      await this.afterSave();
    });
  }
  async openEdit(path) {
    const record = (await this.readGroups()).find(r => r.file.path === path);
    if (!record || record.data.status !== "open") throw new Error("组不存在或已关闭");
    new GroupEditor(this, record).open();
  }
  openCreate() { new GroupEditor(this).open(); }
  install() {
    const p = this.plugin, m = this.model;
    const schedule = (file, oldPath) => {
      const relevant = path => m.GROUP.test(path || "") || /^workspace\/daily\/\d{4}\/\d{4}-\d{2}\/\d{4}-\d{2}-\d{2}\.daily\.md$/.test(path || "");
      if (!relevant(file?.path) && !relevant(oldPath)) return;
      clearTimeout(this.timer);
      this.timer = setTimeout(() => this.run(() => this.snapshot()).catch(e => new Notice(`关注组快照未保存：${e.message}`)), 750);
    };
    for (const event of ["create", "modify", "delete", "rename"]) p.registerEvent(this.vault.on(event, schedule));
    p.registerEvent(this.app.workspace.on("file-open", schedule));
    this.app.workspace.onLayoutReady(() => {
      if (!this.stopped) this.run(() => this.snapshot()).catch(e => new Notice(`关注组快照未保存：${e.message}`));
    });
    p.addCommand({ id: "create-task-group", name: "创建任务关注组", callback: () => this.openCreate() });
    p.addCommand({ id: "manage-task-groups", name: "管理任务关注组", callback: () => this.app.workspace.openLinkText(`${m.GROUP_DIR}/_Index`, "", false) });
    p.addCommand({ id: "snapshot-task-groups", name: "保存今日关注组快照", callback: () => this.run(() => this.snapshot())
      .then(saved => new Notice(saved ? "今日关注组快照已保存" : "仅保存今天开放的 Daily；历史记录保持不变"))
      .catch(e => new Notice(`关注组快照未保存：${e.message}`)) });
    return this;
  }
  stop() { this.stopped = true; clearTimeout(this.timer); }
}
return { TaskGroups, frontmatter };
};
