const settings = input || {};
const panel = settings.panel || "today";
let root = dv.container;
const vault = dv.app?.vault || app.vault;
const now = window.moment();
const today = now.clone().startOf("day");
const todayKey = today.format("YYYY-MM-DD");
const dailyFolder = "workspace/daily";
const taskFolder = "workspace/tasks";
const taskSections = new Set([
  "大任务",
  "小任务",
  "1 高优先级",
  "2 低优先级",
  "1. 高优先级",
  "2. 低优先级",
]);

root.classList.add("homepage-panel", `homepage-panel-${panel}`);

function asArray(value) {
  if (value == null) return [];
  if (Array.isArray(value)) return value;
  if (typeof value.array === "function") return value.array();
  return [value];
}

function stringValue(value) {
  if (value == null) return "";
  if (value.path) return value.path;
  return String(value);
}

function dateKey(value) {
  if (!value) return "";
  if (typeof value.toFormat === "function") return value.toFormat("yyyy-MM-dd");
  if (typeof value.format === "function") return value.format("YYYY-MM-DD");
  return String(value).slice(0, 10);
}

function dateNumber(value) {
  if (!value) return 0;
  if (typeof value.toMillis === "function") return value.toMillis();
  if (typeof value.valueOf === "function") {
    const result = Number(value.valueOf());
    if (Number.isFinite(result)) return result;
  }
  const parsed = Date.parse(String(value));
  return Number.isFinite(parsed) ? parsed : 0;
}

function internalLink(parent, label, path, extraClass = "") {
  const anchor = document.createElement("a");
  anchor.className = `internal-link homepage-link ${extraClass}`.trim();
  anchor.dataset.href = path;
  anchor.href = path;
  anchor.textContent = label;
  parent.appendChild(anchor);
  return anchor;
}

function sectionTitle(text) {
  const heading = document.createElement("h3");
  heading.className = "homepage-section-title";
  heading.textContent = text;
  root.appendChild(heading);
  return heading;
}

function emptyState(text) {
  const empty = document.createElement("div");
  empty.className = "homepage-empty";
  empty.textContent = text;
  root.appendChild(empty);
  return empty;
}

function linkRow(links) {
  const row = document.createElement("div");
  row.className = "homepage-link-row";
  for (const link of links) internalLink(row, link.label, link.path, "homepage-pill-link");
  root.appendChild(row);
  return row;
}

function taskSection(task) {
  return task?.section?.subpath || task?.header?.subpath || "";
}

function isOpenTask(task) {
  return Boolean(task) && !task.completed && task.status !== "-" && task.status !== ">";
}

function isDailyTask(task) {
  return isOpenTask(task) && taskSections.has(taskSection(task));
}

function dailyPages() {
  return dv
    .pages(`"${dailyFolder}"`)
    .where((page) => stringValue(page.type) === "daily")
    .array();
}

function taskPages() {
  return dv
    .pages(`"${taskFolder}"`)
    .where((page) => stringValue(page.type) === "task")
    .array();
}

function taskPriorityNumber(page) {
  return page.priority === "high" ? 1 : page.priority === "normal" ? 2 : 3;
}

function renderTaskEntities(items, limit = 7) {
  const selected = items.slice(0, limit);
  if (!selected.length) return emptyState("当前没有活跃 Task。");

  const list = document.createElement("ul");
  list.className = "homepage-task-list";
  for (const page of selected) {
    const row = document.createElement("li");
    const marker = document.createElement("span");
    marker.className = `homepage-task-marker status-${page.status || "active"}`;
    marker.textContent = page.status === "blocked" ? "!" : page.status === "inbox" ? "◇" : "○";
    row.appendChild(marker);

    internalLink(
      row,
      stringValue(page.title) || page.file.name,
      page.file.path,
      "homepage-task-text",
    );
    const meta = document.createElement("span");
    meta.className = "homepage-task-source";
    const due = dateKey(page.due);
    meta.textContent = due ? `截止 ${due}` : stringValue(page.task_id);
    row.appendChild(meta);
    list.appendChild(row);
  }
  root.appendChild(list);

  if (items.length > selected.length) {
    const more = document.createElement("div");
    more.className = "homepage-more";
    more.textContent = `另有 ${items.length - selected.length} 项，进入 Tasks 查看`;
    root.appendChild(more);
  }
  return list;
}

function dailyPath(key) {
  const month = key.slice(0, 7);
  const year = key.slice(0, 4);
  return `${dailyFolder}/${year}/${month}/${key}.daily.md`;
}

function renderTaskList(items, limit = 8) {
  const selected = items.slice(0, limit);
  if (!selected.length) return emptyState("当前没有需要显示的任务。");

  const list = document.createElement("ul");
  list.className = "homepage-task-list";
  for (const item of selected) {
    const task = item.task || item;
    const row = document.createElement("li");
    const marker = document.createElement("span");
    marker.className = `homepage-task-marker status-${task.status || "open"}`;
    marker.textContent = task.status === "/" ? "◐" : task.status === ">" ? "→" : "○";

    const text = document.createElement("span");
    text.className = "homepage-task-text";
    text.textContent = stringValue(task.text).replace(/\s+/g, " ").trim();
    row.append(marker, text);

    const sourcePath = item.path || task.path;
    const sourceLabel = item.label || dateKey(item.date) || "来源";
    if (sourcePath) internalLink(row, sourceLabel, sourcePath, "homepage-task-source");
    list.appendChild(row);
  }
  root.appendChild(list);

  if (items.length > selected.length) {
    const more = document.createElement("div");
    more.className = "homepage-more";
    more.textContent = `另有 ${items.length - selected.length} 项，进入完整视图查看`;
    root.appendChild(more);
  }
  return list;
}

function renderCalendar() {
  const pages = dailyPages();
  const pagesByDate = new Map(pages.map((page) => [dateKey(page.date), page]));
  const first = today.clone().startOf("month");
  const daysInMonth = first.daysInMonth();
  const offset = (first.day() + 6) % 7;
  const cells = Math.ceil((offset + daysInMonth) / 7) * 7;

  const header = document.createElement("div");
  header.className = "homepage-calendar-header";
  const month = document.createElement("strong");
  month.textContent = first.format("YYYY 年 M 月");
  const legend = document.createElement("span");
  legend.innerHTML = '<i class="homepage-dot is-open"></i>待复盘 <i class="homepage-dot is-closed"></i>已复盘';
  header.append(month, legend);
  root.appendChild(header);

  const grid = document.createElement("div");
  grid.className = "homepage-calendar-grid";
  for (const weekday of ["一", "二", "三", "四", "五", "六", "日"]) {
    const cell = document.createElement("div");
    cell.className = "homepage-weekday";
    cell.textContent = weekday;
    grid.appendChild(cell);
  }

  for (let index = 0; index < cells; index += 1) {
    const day = index - offset + 1;
    const cell = document.createElement("div");
    cell.className = "homepage-calendar-day";
    if (day < 1 || day > daysInMonth) {
      cell.classList.add("is-outside");
      grid.appendChild(cell);
      continue;
    }

    const key = first.clone().date(day).format("YYYY-MM-DD");
    const page = pagesByDate.get(key);
    if (key === todayKey) cell.classList.add("is-today");
    if (page) {
      internalLink(cell, String(day), page.file.path, "homepage-day-link");
      const dot = document.createElement("span");
      dot.className = `homepage-dot ${stringValue(page.status) === "closed" ? "is-closed" : "is-open"}`;
      cell.appendChild(dot);

      const taskCount = asArray(page.file?.tasks).filter(isDailyTask).length;
      if (taskCount) {
        const count = document.createElement("span");
        count.className = "homepage-day-count";
        count.textContent = String(taskCount);
        count.title = `${taskCount} 项待收口 occurrence`;
        cell.appendChild(count);
      }
    } else {
      const label = document.createElement("span");
      label.className = "homepage-day-label";
      label.textContent = String(day);
      cell.appendChild(label);
    }
    grid.appendChild(cell);
  }
  root.appendChild(grid);

  const links = [{ label: "Daily 总览", path: "workspace/daily/index.md" }];
  const todayPage = pagesByDate.get(todayKey);
  if (todayPage) links.unshift({ label: "今日 Daily", path: todayPage.file.path });
  linkRow(links);
}

function renderToday() {
  const path = dailyPath(todayKey);
  const page = dailyPages().find((item) => dateKey(item.date) === todayKey);

  const summary = document.createElement("div");
  summary.className = "homepage-today-summary";
  const date = document.createElement("strong");
  date.textContent = today.format("M 月 D 日 · dddd");
  const badge = document.createElement("span");
  badge.className = `homepage-status ${page && stringValue(page.status) === "closed" ? "is-closed" : "is-open"}`;
  badge.textContent = page ? (stringValue(page.status) === "closed" ? "已复盘" : "进行中") : "尚未创建";
  summary.append(date, badge);
  root.appendChild(summary);

  if (!page) {
    emptyState("今天还没有 Daily。请使用 Obsidian 的“打开今天的日记”命令按模板创建。");
    linkRow([{ label: "Daily 总览", path: "workspace/daily/index.md" }]);
    return;
  }

  const tasks = asArray(page.file?.tasks);
  const open = tasks.filter(isDailyTask);
  const completed = tasks.filter((task) => task.completed && taskSections.has(taskSection(task)));

  const metrics = document.createElement("div");
  metrics.className = "homepage-metrics";
  for (const [label, value] of [["待收口", open.length], ["已完成", completed.length]]) {
    const metric = document.createElement("div");
    metric.innerHTML = `<strong>${value}</strong><span>${label}</span>`;
    metrics.appendChild(metric);
  }
  root.appendChild(metrics);

  sectionTitle("今天的任务切片");
  renderTaskList(open.map((task) => ({ task, path, label: "Today" })), 7);
  linkRow([
    { label: "打开今日 Daily", path },
    { label: "Tasks 总览", path: "workspace/tasks/index.md" },
  ]);
}

function renderMedia() {
  const configs = [
    { type: "book", label: "Books", icon: "📚", folder: "raws/Douban/book", path: "wiki/sources/books/index.md", note: "含 WeRead 分支" },
    { type: "movie", label: "Movies", icon: "🎬", folder: "raws/Douban/movie", path: "wiki/sources/movies/index.md", note: "电影目录" },
    { type: "teleplay", label: "Series", icon: "📺", folder: "raws/Douban/teleplay", path: "wiki/sources/series/index.md", note: "剧集目录" },
  ];

  const items = [];
  const cards = document.createElement("div");
  cards.className = "homepage-media-cards";
  for (const config of configs) {
    const pages = dv
      .pages(`"${config.folder}"`)
      .where((page) => stringValue(page.type) === config.type)
      .array();
    pages.forEach((page) => items.push({ page, config }));

    const card = document.createElement("div");
    card.className = "homepage-media-card";
    const icon = document.createElement("span");
    icon.className = "homepage-media-icon";
    icon.textContent = config.icon;
    const body = document.createElement("span");
    internalLink(body, config.label, config.path, "homepage-media-link");
    const meta = document.createElement("small");
    meta.textContent = `${pages.length} 项 · ${config.note}`;
    body.appendChild(meta);
    card.append(icon, body);
    cards.appendChild(card);
  }
  root.appendChild(cards);

  sectionTitle("最近记录");
  items.sort((left, right) => {
    const rightTime = dateNumber(right.page.collectionDate) || dateNumber(right.page.file?.mtime);
    const leftTime = dateNumber(left.page.collectionDate) || dateNumber(left.page.file?.mtime);
    return rightTime - leftTime;
  });

  const recent = document.createElement("ul");
  recent.className = "homepage-activity-list";
  for (const item of items.slice(0, 6)) {
    const row = document.createElement("li");
    const icon = document.createElement("span");
    icon.textContent = item.config.icon;
    row.appendChild(icon);
    internalLink(row, stringValue(item.page.title) || item.page.file.name, item.page.file.path, "homepage-activity-title");
    const when = document.createElement("time");
    when.textContent = dateKey(item.page.collectionDate) || dateKey(item.page.file?.mtime);
    row.appendChild(when);
    recent.appendChild(row);
  }
  root.appendChild(recent);
}

function renderKnowledge() {
  const candidateItems = [];
  for (const page of dailyPages()) {
    for (const task of asArray(page.file?.tasks)) {
      if (isOpenTask(task) && taskSection(task) === "Knowledge Candidates") {
        candidateItems.push({ task, path: page.file.path, date: page.date, label: dateKey(page.date) });
      }
    }
  }
  candidateItems.sort((left, right) => dateNumber(right.date) - dateNumber(left.date));

  sectionTitle(`Knowledge Candidates · ${candidateItems.length}`);
  renderTaskList(candidateItems, 4);

  const pages = dv
    .pages('"wiki"')
    .where((page) => {
      const path = page.file?.path || "";
      const name = page.file?.name || "";
      return name !== "AGENTS" && name !== "index" && !path.includes("/_meta/") && !path.includes("/_assets/");
    })
    .array()
    .sort((left, right) => dateNumber(right.file?.mtime) - dateNumber(left.file?.mtime));

  sectionTitle("Wiki 最近更新");
  const recent = document.createElement("ul");
  recent.className = "homepage-activity-list";
  for (const page of pages.slice(0, 6)) {
    const row = document.createElement("li");
    internalLink(row, stringValue(page.title) || page.file.name, page.file.path, "homepage-activity-title");
    const when = document.createElement("time");
    when.textContent = dateKey(page.file?.mtime);
    row.appendChild(when);
    recent.appendChild(row);
  }
  root.appendChild(recent);
  linkRow([{ label: "Wiki 首页", path: "wiki/index.md" }]);
}

function renderTodo() {
  const pages = taskPages();
  const active = pages.filter((page) => page.status === "active" || page.status === "blocked");
  const inbox = pages.filter((page) => page.status === "inbox");
  const visible = [...active, ...inbox].sort((left, right) => {
    const statusOrder = (page) => page.status === "blocked" ? 0 : page.status === "active" ? 1 : 2;
    return statusOrder(left) - statusOrder(right)
      || taskPriorityNumber(left) - taskPriorityNumber(right)
      || dateNumber(right.updated) - dateNumber(left.updated);
  });
  const backlog = dv.page("workspace/backlog");
  const backlogTasks = asArray(backlog?.file?.tasks).filter(isOpenTask);

  const summary = document.createElement("div");
  summary.className = "homepage-todo-summary";
  summary.innerHTML = `<span><strong>${active.length}</strong> 活跃 / 阻塞</span><span><strong>${inbox.length}</strong> Inbox</span><span><strong>${backlogTasks.length}</strong> System</span>`;
  root.appendChild(summary);

  sectionTitle("当前 Tasks");
  renderTaskEntities(visible, 7);

  linkRow([
    { label: "Tasks 总览", path: "workspace/tasks/index.md" },
    { label: "Daily 总览", path: "workspace/daily/index.md" },
    { label: "System Backlog", path: "workspace/backlog.md" },
  ]);
}

const renderers = {
  calendar: renderCalendar,
  today: renderToday,
  media: renderMedia,
  knowledge: renderKnowledge,
  todo: renderTodo,
};

function requiredDataviewFolders() {
  const markdownPaths = typeof vault.getMarkdownFiles === "function"
    ? vault.getMarkdownFiles().map((file) => file.path)
    : [];
  const requiredFolders = new Set();

  if (["home", "calendar", "today", "knowledge"].includes(panel)) {
    requiredFolders.add(dailyFolder);
  }
  if (["home", "todo"].includes(panel)) requiredFolders.add(taskFolder);
  if (["home", "media"].includes(panel)) {
    requiredFolders.add("raws/Douban/book");
    requiredFolders.add("raws/Douban/movie");
    requiredFolders.add("raws/Douban/teleplay");
  }
  if (["home", "knowledge"].includes(panel)) requiredFolders.add("wiki");

  return [...requiredFolders].filter((folder) =>
    markdownPaths.some((path) => path.startsWith(`${folder}/`))
  );
}

const dataviewFolders = requiredDataviewFolders();

function dataviewIndexReady() {
  return dataviewFolders.every((folder) => dv.pages(`"${folder}"`).length > 0);
}

function renderPanelView() {
  root = dv.container;
  root.replaceChildren();

  if (panel === "home") {
    const dashboardRoot = root;
    dashboardRoot.classList.add("homepage-dashboard");

    const grid = document.createElement("div");
    grid.className = "homepage-dashboard-grid";
    dashboardRoot.appendChild(grid);

    const panelConfigs = [
      { panel: "calendar", title: "Calendar" },
      { panel: "today", title: "Today" },
      { panel: "todo", title: "Todo" },
      { panel: "media", title: "Media" },
      { panel: "knowledge", title: "Knowledge" },
    ];

    for (const config of panelConfigs) {
      const card = document.createElement("section");
      card.className = `homepage-dashboard-card dashboard-${config.panel}`;
      const heading = document.createElement("h2");
      heading.textContent = config.title;
      card.appendChild(heading);
      grid.appendChild(card);

      root = card;
      renderers[config.panel]();
    }
    root = dashboardRoot;
  } else {
    const render = renderers[panel];
    if (!render) throw new Error(`Unsupported homepage panel: ${panel}`);
    render();
  }
}

if (dataviewIndexReady()) {
  renderPanelView();
} else {
  const loading = document.createElement("div");
  loading.className = "homepage-loading";
  loading.textContent = "正在载入工作区数据…";
  root.appendChild(loading);

  let attempts = 0;
  const timer = window.setInterval(() => {
    attempts += 1;
    if (dataviewIndexReady() || attempts >= 20) {
      window.clearInterval(timer);
      renderPanelView();
    }
  }, 250);
}
