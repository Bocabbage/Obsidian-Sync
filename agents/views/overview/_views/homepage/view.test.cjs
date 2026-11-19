const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const test = require("node:test");

const source = fs.readFileSync(path.join(__dirname, "view.js"), "utf8");
const modelSource = fs.readFileSync(path.join(__dirname, "../todo-pool/model.cjs"), "utf8");

// Dataview 0.5.68 patches Array.isArray and projects unknown properties through
// a Proxy. Native flatMap still does not flatten these non-native arrays.
class DataArray {
  constructor(values) {
    this.values = values;
    return new Proxy(this, {
      get(target, key) {
        if (typeof key === "symbol" || key in target) return Reflect.get(target, key);
        if (/^\d+$/.test(key)) return target.values[Number(key)];
        return new DataArray(target.values.flatMap((value) => {
          const field = value?.[key];
          return field == null ? [] : field instanceof DataArray ? field.array() : field;
        }));
      },
    });
  }
  get length() { return this.values.length; }
  array() { return this.values.slice(); }
  where(predicate) { return new DataArray(this.values.filter(predicate)); }
  filter(predicate) { return this.where(predicate); }
  map(callback) { return new DataArray(this.values.map(callback)); }
  slice(start, end) { return new DataArray(this.values.slice(start, end)); }
  [Symbol.iterator]() { return this.values[Symbol.iterator](); }
  toString() { return `[${this.values.join(", ")}]`; }
}

class Element {
  constructor(tag) {
    this.tagName = tag;
    this.children = [];
    this.className = "";
    this.dataset = {};
    this.textContent = "";
    this.innerHTML = "";
    this.classList = { add: (...names) => { this.className += ` ${names.join(" ")}`; } };
  }
  appendChild(child) { this.children.push(child); return child; }
  append(...children) { this.children.push(...children); }
  replaceChildren(...children) { this.children = children; }
}

class Moment {
  constructor(value = "2026-09-21T00:00:00Z") { this.value = new Date(value); }
  clone() { return new Moment(this.value); }
  startOf(unit) {
    this.value.setUTCHours(0, 0, 0, 0);
    if (unit === "month") this.value.setUTCDate(1);
    return this;
  }
  date(day) { this.value.setUTCDate(day); return this; }
  day() { return this.value.getUTCDay(); }
  daysInMonth() {
    return new Date(Date.UTC(this.value.getUTCFullYear(), this.value.getUTCMonth() + 1, 0)).getUTCDate();
  }
  format(pattern) {
    if (pattern === "YYYY 年 M 月") return "2026 年 9 月";
    if (pattern === "M 月 D 日 · dddd") return "9 月 21 日 · 星期一";
    return this.value.toISOString().slice(0, 10);
  }
}

function checkbox(text, status = " ", line = 1) {
  return { text, status, line, task: true, completed: status === "x", section: { subpath: "WORK" } };
}

function todoPage(period, tasks, wrap = true) {
  return {
    type: "todo-log", period,
    file: {
      path: `workspace/todos/2026/${period}.md`, name: period,
      tasks: wrap ? new DataArray(tasks) : tasks,
    },
  };
}

async function render(panel, pages = {}, otherPages = {}) {
  const container = new Element("div");
  const context = vm.createContext({
    input: { panel }, DataArray,
    document: { createElement: (tag) => new Element(tag) },
    window: { moment: () => new Moment() },
    dv: {
      container,
      app: {
        vault: {
          getMarkdownFiles: () => [],
          adapter: {
            read: async (file) => {
              assert.equal(file, "agents/views/overview/_views/todo-pool/model.cjs");
              return modelSource;
            },
          },
        },
      },
      pages: (query) => new DataArray(pages[query.replace(/^"|"$/g, "")] || []),
      page: (name) => otherPages[name],
    },
  });
  // Keep the patched global inside this VM, not in Node's test runner.
  vm.runInContext("const nativeIsArray = Array.isArray; Array.isArray = value => nativeIsArray(value) || value instanceof DataArray;", context);
  const wrapped = `(async () => {
    ${source}
    globalThis.stringValue = stringValue;
  })()`;
  await vm.runInContext(wrapped, context, { filename: "homepage/view.js" });
  return { container, context };
}

function descendants(element) {
  return [element, ...element.children.flatMap(descendants)];
}

function byClass(container, name) {
  return descendants(container).filter((element) => element.className.split(/\s+/).includes(name));
}

test("Dataview Todo collections flatten across months, filter and count individual tasks", async () => {
  const september = todoPage("2026-09", [
    checkbox("第二条 ➕ 2026-09-21 ^todo-20260921-02", " ", 20),
    checkbox("第一条 ➕ 2026-09-21 ^todo-20260921-01", "/", 10),
    checkbox("已完成", "x"), checkbox("已取消", "-"), checkbox("已转 Task", ">"),
  ]);
  const august = todoPage("2026-08", [checkbox("跨月待办 ➕ 2026-08-31 ^todo-20260831-01")]);
  const original = JSON.stringify([september, august]);
  const { container } = await render("todo", { "workspace/todos": [september, august] });
  assert.match(byClass(container, "homepage-todo-summary")[0].innerHTML, /<strong>3<\/strong> 待办/);
  assert.deepEqual(byClass(container, "homepage-task-text").map((el) => el.textContent), [
    "跨月待办 · 2026-08-31 录入",
    "第一条 · 2026-09-21 录入",
    "第二条 · 2026-09-21 录入",
  ]);
  assert.deepEqual(byClass(container, "homepage-task-source").map((el) => el.dataset.href), [august.file.path, september.file.path, september.file.path]);
  assert.equal(JSON.stringify([september, august]), original, "rendering must not mutate task data");
});

test("empty or entirely closed Todo collections show the empty state and zero count", async () => {
  for (const pages of [[], [todoPage("2026-09", [])], [todoPage("2026-09", [checkbox("完成", "x")])]]) {
    const { container } = await render("todo", { "workspace/todos": pages });
    assert.match(byClass(container, "homepage-todo-summary")[0].innerHTML, /<strong>0<\/strong> 待办/);
    assert(descendants(container).some((el) => el.textContent === "当前没有待办的小任务。"));
  }
});

test("System Backlog counts and opens the migrated Agent maintenance page", async () => {
  const { container } = await render("todo", {}, {
    "agents/backlog": { file: { tasks: new DataArray([checkbox("维护一"), checkbox("维护二"), checkbox("已完成", "x")]) } },
    "workspace/backlog": { file: { tasks: new DataArray([checkbox("旧路径不能再被读取")]) } },
  });
  assert.match(byClass(container, "homepage-todo-summary")[0].innerHTML, /<strong>2<\/strong> System/);
  const link = byClass(container, "homepage-link").find(el => el.textContent === "System Backlog");
  assert.equal(link.dataset.href, "agents/backlog.md");
});

test("native arrays still render normally and compact lists count their remaining items", async () => {
  const tasks = Array.from({ length: 8 }, (_, index) => checkbox(`待办 ${index}`, " ", index));
  const { container } = await render("todo", { "workspace/todos": [todoPage("2026-09", tasks, false)] });
  assert.equal(byClass(container, "homepage-task-text").length, 7);
  assert(byClass(container, "homepage-more").some((el) => el.textContent.includes("另有 1 项")));
});

test("Todo summaries display the due group across Dataview date representations", async () => {
  for (const period of ["2026-09", { toFormat: () => "2026-09-01", toString: () => "2026-09-01T00:00:00.000+08:00" }, undefined]) {
    const page = todoPage("2026-09", [checkbox("以后做")]);
    page.period = period;
    const { container } = await render("todo", { "workspace/todos": [page] });
    const sourceLink = byClass(container, "homepage-task-source")[0];
    assert.equal(sourceLink.textContent, "常规任务");
    assert.equal(sourceLink.dataset.href, page.file.path);
  }
});

test("full homepage renders the panels after Todos and preserves Today counts", async () => {
  const { container } = await render("home", {
    "workspace/todos": [todoPage("2026-09", [checkbox("以后做的事")])],
    "workspace/daily": [{
      type: "daily", date: "2026-09-21", status: "closed",
      file: { path: "workspace/daily/2026/2026-09/2026-09-21.daily.md", tasks: new DataArray([checkbox("今日完成", "x")]), lists: new DataArray([]) },
    }],
  });
  assert.deepEqual(byClass(container, "homepage-dashboard-card").map((el) => el.children[0].textContent), ["Today", "Calendar", "Tasks & Todos", "Recent Activity", "Focus", "Explore"]);
  assert.equal(byClass(container, "homepage-task-text")[0].textContent, "以后做的事");
  const metrics = byClass(container, "homepage-metrics")[0].children.map((el) => el.innerHTML);
  assert.deepEqual(metrics, ["<strong>0</strong><span>待收口</span>", "<strong>1</strong><span>已完成</span>"]);
});

test("text conversion returns strings even for projected collection paths", async () => {
  const { context } = await render("todo");
  context.samples = [null, undefined, "text", 0, false, { path: "wiki/example.md" }, new DataArray([{ path: "one.md" }, { path: "two.md" }])];
  const output = vm.runInContext("samples.map(value => stringValue(value))", context);
  assert(output.every((value) => typeof value === "string"));
  assert.deepEqual(Array.from(output).slice(0, 6), ["", "", "text", "0", "false", "wiki/example.md"]);
});
