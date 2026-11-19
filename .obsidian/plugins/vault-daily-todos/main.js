const { Plugin, Notice } = require("obsidian");

module.exports = class VaultDailyTodos extends Plugin {
  async onload() {
    // Local desktop plugin: no network, no external account access.
    this.model = require(`${this.app.vault.adapter.getBasePath()}/${this.manifest.dir}/model.cjs`);
    const { TaskGroups } = require(`${this.app.vault.adapter.getBasePath()}/${this.manifest.dir}/task-groups.cjs`)(require("obsidian"));
    this.taskGroups = new TaskGroups(this).install();
    this.timers = new Map();
    this.running = new Set();
    this.stopped = false;
    const schedule = file => {
      if (!file || !/^workspace\/daily\/\d{4}\/\d{4}-\d{2}\/\d{4}-\d{2}-\d{2}\.daily\.md$/.test(file.path)) return;
      clearTimeout(this.timers.get(file.path));
      this.timers.set(file.path, setTimeout(() => {
        this.timers.delete(file.path);
        this.fill(file, false).catch(error => new Notice(`Task Todo 续入失败：${error.message}`));
      }, 700));
    };
    this.registerEvent(this.app.vault.on("create", schedule));
    this.registerEvent(this.app.vault.on("modify", schedule));
    // Recovery when the Daily was created while the plugin was disabled/offline.
    this.app.workspace.onLayoutReady(() => {
      if (this.stopped) return;
      const date = this.model.today();
      schedule(this.app.vault.getAbstractFileByPath(`workspace/daily/${date.slice(0, 4)}/${date.slice(0, 7)}/${date}.daily.md`));
    });
    this.addCommand({ id: "continue-task-todos", name: "续入今天尚未列出的 Task Todo", callback: async () => {
      try {
        const file = this.app.workspace.getActiveFile();
        if (!file) return;
        const count = await this.fill(file, true);
        new Notice(count === null ? "仅可续入今天未复盘的 Daily" : `已续入 ${count} 项；现有内容未改写`);
      } catch (error) { new Notice(`Task Todo 续入失败：${error.message}`); }
    } });
  }

  async fill(file, manual) {
    if (this.stopped || this.running.has(file.path)) return null;
    this.running.add(file.path);
    try {
      const date = this.model.today(), vault = this.app.vault;
      const before = await vault.read(file);
      if (!this.model.eligibleDaily(before, file.path, date) || (!manual && !before.includes(this.model.MARKER))) return null;
      const taskFiles = vault.getMarkdownFiles().filter(f => /^workspace\/tasks\/TASK-\d{6}-\d{3}\.md$/.test(f.path));
      const tasks = await Promise.all(taskFiles.map(async f => this.model.taskTodos(await vault.read(f), f.path)));
      const historyFiles = vault.getMarkdownFiles().filter(f => /^workspace\/daily\/\d{4}\/\d{4}-\d{2}\/\d{4}-\d{2}-\d{2}\.daily\.md$/.test(f.path) && f.path < file.path)
        .sort((a, b) => b.path.localeCompare(a.path)).slice(0, 45);
      const history = await Promise.all(historyFiles.map(async f => ({ markdown: await vault.read(f) })));
      if (this.stopped) return null;
      const plan = this.model.planDaily({ markdown: before, path: file.path, date, tasks, history, manual });
      if (plan.errors.length) throw new Error(plan.errors.join("；"));
      if (plan.markdown !== before) await vault.process(file, current => {
        if (current !== before) throw new Error("Daily 正在编辑，未覆盖。请稍后使用续入命令");
        return plan.markdown;
      });
      return plan.added.length;
    } finally { this.running.delete(file.path); }
  }

  onunload() {
    this.taskGroups?.stop();
    this.stopped = true;
    for (const timer of this.timers.values()) clearTimeout(timer);
  }
};
