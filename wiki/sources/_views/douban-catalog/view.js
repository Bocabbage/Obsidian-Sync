const settings = input || {};
const mediaType = settings.mediaType || "book";
const configByType = {
  book: {
    folder: "raws/Douban/book",
    manualFolder: "workspace/reading/books",
    manualType: "reading-note",
    creatorField: "author",
    manualLabel: "阅读笔记",
    emptyLabel: "仅 Douban",
  },
  movie: {
    folder: "raws/Douban/movie",
    manualFolder: "workspace/viewing/movies",
    manualType: "viewing-note",
    creatorField: "director",
    manualLabel: "观影记录",
    emptyLabel: "仅 Douban",
  },
  teleplay: {
    folder: "raws/Douban/teleplay",
    manualFolder: "workspace/viewing/series",
    manualType: "viewing-note",
    creatorField: "director",
    manualLabel: "观看记录",
    emptyLabel: "仅 Douban",
  },
};

const config = configByType[mediaType];
if (!config) throw new Error(`Unsupported Douban catalog type: ${mediaType}`);

const root = dv.container;
root.classList.add("douban-catalog");
const vault = dv.app?.vault || app.vault;
const catalogAssetFolder = "raws/Douban/_assets";
const catalogAssets = typeof vault.getFiles === "function"
  ? vault.getFiles().filter((file) => file.path.startsWith(`${catalogAssetFolder}/`))
  : [];

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

function linkPath(value) {
  const first = asArray(value)[0];
  if (!first) return "";
  if (first.path) return first.path;
  return String(first)
    .replace(/^\[\[/, "")
    .replace(/\]\]$/, "")
    .split("|")[0];
}

function pathKey(value) {
  return linkPath(value).replace(/\.md$/i, "");
}

function idValue(value) {
  const raw = stringValue(value).trim();
  return raw && raw !== "null" ? raw : "";
}

function dateText(value) {
  if (!value) return "";
  if (typeof value.toFormat === "function") return value.toFormat("yyyy-MM-dd");
  return String(value).slice(0, 10);
}

function dateNumber(value) {
  if (!value) return 0;
  if (typeof value.toMillis === "function") return value.toMillis();
  const parsed = Date.parse(String(value));
  return Number.isFinite(parsed) ? parsed : 0;
}

function yearText(value) {
  const date = dateText(value);
  return /^\d{4}/.test(date) ? date.slice(0, 4) : "";
}

function creatorText(page) {
  return asArray(page[config.creatorField])
    .map((item) => stringValue(item).replace(/^[^/]{1,4}\/[ ]*/, "").trim())
    .filter(Boolean)
    .join(" · ");
}

function internalLink(parent, label, path, extraClass = "") {
  const anchor = document.createElement("a");
  anchor.className = `internal-link catalog-action ${extraClass}`.trim();
  anchor.dataset.href = path;
  anchor.href = path;
  anchor.textContent = label;
  parent.appendChild(anchor);
  return anchor;
}

function externalLink(parent, label, href, extraClass = "") {
  const anchor = document.createElement("a");
  anchor.className = `external-link catalog-action ${extraClass}`.trim();
  anchor.href = href;
  anchor.textContent = label;
  if (/^https?:/i.test(href)) {
    anchor.target = "_blank";
    anchor.rel = "noopener";
  }
  parent.appendChild(anchor);
  return anchor;
}

function addBadge(parent, text, kind = "") {
  if (!text) return;
  const badge = document.createElement("span");
  badge.className = `catalog-badge ${kind}`.trim();
  badge.textContent = text;
  parent.appendChild(badge);
}

async function coverUrl(page) {
  const extensions = mediaType === "book" ? ["jpg", "webp", "png"] : ["webp", "jpg", "png"];
  for (const extension of extensions) {
    const path = `${catalogAssetFolder}/${page.file.name}.${extension}`;
    const file = vault.getAbstractFileByPath(path);
    if (file) return vault.getResourcePath(file);
  }

  const rawFile = vault.getAbstractFileByPath(page.file.path);
  if (rawFile && typeof vault.cachedRead === "function") {
    const source = await vault.cachedRead(rawFile);
    const match = source.match(/!\[[^\]]*\]\(<?(raws\/Douban\/_assets\/[^)>\n]+)>?\)/i);
    const referenced = match?.[1]?.trim();
    const file = referenced ? vault.getAbstractFileByPath(referenced) : null;
    if (file) return vault.getResourcePath(file);
  }

  for (const extension of extensions) {
    const candidates = catalogAssets.filter((file) =>
      file.extension?.toLocaleLowerCase() === extension &&
      (page.file.name.startsWith(file.basename) || file.basename.startsWith(page.file.name))
    );
    if (candidates.length === 1) return vault.getResourcePath(candidates[0]);
  }
  return "";
}

const doubanPages = dv
  .pages(`"${config.folder}"`)
  .where((page) => stringValue(page.type) === mediaType)
  .array();

const wereadPages = mediaType === "book"
  ? dv.pages('"raws/WeRead"').where((page) => idValue(page.bookId)).array()
  : [];

const manualPages = dv
  .pages(`"${config.manualFolder}"`)
  .where((page) => stringValue(page.type) === config.manualType)
  .array();

const overridePages = mediaType === "book"
  ? dv.pages('"wiki/sources/link-overrides"').where((page) => stringValue(page.type) === "source-link").array()
  : [];

const wereadByIsbn = new Map();
const wereadByPath = new Map();
for (const page of wereadPages) {
  const isbn = idValue(page.isbn);
  if (isbn) {
    const existing = wereadByIsbn.get(isbn) || [];
    existing.push(page);
    wereadByIsbn.set(isbn, existing);
  }
  wereadByPath.set(pathKey(page.file.path), page);
}

const manualByDouban = new Map();
for (const page of manualPages) {
  const id = idValue(page.douban_id);
  if (!id) continue;
  const existing = manualByDouban.get(id) || [];
  existing.push(page);
  manualByDouban.set(id, existing);
}

const overrideByDouban = new Map();
for (const page of overridePages) {
  const id = idValue(page.douban_id);
  if (id) overrideByDouban.set(id, page);
}

function wereadMatch(page) {
  if (mediaType !== "book") return null;
  const doubanId = idValue(page.doubanId);
  const override = overrideByDouban.get(doubanId);
  if (override) {
    const identityStatus = stringValue(override.identity_status);
    const relation = stringValue(override.relation);
    if (identityStatus === "rejected" || relation === "not_same") {
      return { page: null, override, identityStatus, relation };
    }
    const target = wereadByPath.get(pathKey(override.weread_source));
    return { page: target || null, override, identityStatus, relation };
  }

  const isbn = idValue(page.isbn);
  const candidates = isbn ? wereadByIsbn.get(isbn) || [] : [];
  if (candidates.length === 1) {
    return { page: candidates[0], override: null, identityStatus: "automatic", relation: "same_edition" };
  }
  if (candidates.length > 1) {
    return { page: candidates[0], override: null, identityStatus: "conflict", relation: "same_edition" };
  }
  return null;
}

const items = await Promise.all(doubanPages.map(async (page) => {
  const doubanId = idValue(page.doubanId);
  const match = wereadMatch(page);
  const notes = manualByDouban.get(doubanId) || [];
  const title = stringValue(page.title) || page.file.name;
  return {
    page,
    doubanId,
    title,
    creators: creatorText(page),
    state: stringValue(page.state),
    score: Number(page.score) || 0,
    year: yearText(page.datePublished),
    collectionDate: page.collectionDate,
    match,
    notes,
    cover: await coverUrl(page),
    searchText: `${title} ${creatorText(page)} ${stringValue(page.originalTitle)} ${doubanId}`.toLocaleLowerCase(),
  };
}));

const toolbar = document.createElement("div");
toolbar.className = "catalog-toolbar";
root.appendChild(toolbar);

function control(labelText, element) {
  const label = document.createElement("label");
  label.className = "catalog-control";
  const caption = document.createElement("span");
  caption.textContent = labelText;
  label.append(caption, element);
  toolbar.appendChild(label);
}

const search = document.createElement("input");
search.type = "search";
search.placeholder = "搜索标题、作者/导演或 Douban ID";
control("搜索", search);

const stateSelect = document.createElement("select");
stateSelect.appendChild(new Option("全部状态", ""));
for (const state of [...new Set(items.map((item) => item.state).filter(Boolean))].sort()) {
  stateSelect.appendChild(new Option(state, state));
}
control("状态", stateSelect);

const branchSelect = document.createElement("select");
branchSelect.appendChild(new Option("全部分支", ""));
if (mediaType === "book") branchSelect.appendChild(new Option("有 WeRead", "weread"));
branchSelect.appendChild(new Option(`有${config.manualLabel}`, "manual"));
branchSelect.appendChild(new Option(config.emptyLabel, "catalog-only"));
if (mediaType === "book") branchSelect.appendChild(new Option("身份待复核", "conflict"));
control("关联", branchSelect);

const sortSelect = document.createElement("select");
sortSelect.appendChild(new Option("最近记录", "recent"));
sortSelect.appendChild(new Option("标题", "title"));
sortSelect.appendChild(new Option("平台评分", "score"));
control("排序", sortSelect);

const summary = document.createElement("div");
summary.className = "catalog-summary";
root.appendChild(summary);

const grid = document.createElement("div");
grid.className = "catalog-grid";
root.appendChild(grid);

function wereadStatusText(page) {
  if (!page) return "";
  const status = idValue(page.readingStatus);
  const statusLabel = status === "4" ? "读完" : status === "2" ? "在读" : status === "3" ? "读过" : "";
  const progress = stringValue(page.progress);
  return [statusLabel, progress && progress !== "-1%" ? progress : ""].filter(Boolean).join(" · ");
}

function manualBadgeTexts(notes) {
  const labels = [];
  const mediumLabels = {
    weread: "WeRead 人工笔记",
    print: "纸质书",
    other: "其他载体",
    unknown: "载体待确认",
  };
  const statusLabels = {
    planned: "计划阅读",
    reading: "阅读中",
    finished: "已读完",
    paused: "暂停",
    abandoned: "放弃",
  };

  for (const note of notes) {
    if (mediaType === "book") {
      const medium = stringValue(note.medium);
      const status = stringValue(note.status);
      if (mediumLabels[medium]) labels.push(mediumLabels[medium]);
      if (statusLabels[status]) labels.push(`笔记：${statusLabels[status]}`);
    }
    const rating = Number(note.rating);
    if (Number.isFinite(rating) && rating > 0) labels.push(`我的评分 ${rating}`);
  }
  return [...new Set(labels)];
}

function renderCard(item) {
  const card = document.createElement("article");
  card.className = "catalog-card";

  const media = document.createElement("div");
  media.className = "catalog-cover";
  if (item.cover) {
    const image = document.createElement("img");
    image.src = item.cover;
    image.alt = `${item.title} 封面`;
    image.loading = "lazy";
    media.appendChild(image);
  } else {
    const placeholder = document.createElement("span");
    placeholder.textContent = "无封面";
    media.appendChild(placeholder);
  }
  card.appendChild(media);

  const body = document.createElement("div");
  body.className = "catalog-card-body";
  card.appendChild(body);

  const heading = document.createElement("h3");
  internalLink(heading, item.title, item.page.file.path, "catalog-title-link");
  body.appendChild(heading);

  const metadata = document.createElement("div");
  metadata.className = "catalog-metadata";
  const primary = [item.creators, item.year].filter(Boolean).join(" · ");
  if (primary) {
    const line = document.createElement("div");
    line.textContent = primary;
    metadata.appendChild(line);
  }
  const recorded = dateText(item.collectionDate);
  if (recorded) {
    const line = document.createElement("div");
    line.textContent = `记录于 ${recorded}`;
    metadata.appendChild(line);
  }
  body.appendChild(metadata);

  const badges = document.createElement("div");
  badges.className = "catalog-badges";
  addBadge(badges, item.state);
  if (item.score) addBadge(badges, `豆瓣 ${item.score}`, "score");
  if (item.match?.page) addBadge(badges, wereadStatusText(item.match.page), "weread");
  if (item.match?.identityStatus === "conflict") addBadge(badges, "身份待复核", "conflict");
  if (item.match?.relation === "same_work" && item.match?.identityStatus === "confirmed") {
    addBadge(badges, "相关版本", "related");
  }
  for (const text of manualBadgeTexts(item.notes)) addBadge(badges, text, "manual");
  body.appendChild(badges);

  const actions = document.createElement("div");
  actions.className = "catalog-actions";
  internalLink(actions, "Douban 条目", item.page.file.path);
  const doubanUrl = stringValue(item.page.url);
  if (doubanUrl) externalLink(actions, "豆瓣网页", doubanUrl);

  if (item.match?.page) {
    internalLink(actions, "WeRead 笔记", item.match.page.file.path, "weread-action");
    const bookId = idValue(item.match.page.bookId);
    if (bookId) externalLink(actions, "打开微信读书", `weread://reading?bId=${encodeURIComponent(bookId)}`, "weread-action");
  }

  for (const note of item.notes) {
    internalLink(actions, config.manualLabel, note.file.path, "manual-action");
  }

  if (!item.match?.page && item.notes.length === 0) {
    const empty = document.createElement("span");
    empty.className = "catalog-empty-branch";
    empty.textContent = config.emptyLabel;
    actions.appendChild(empty);
  }
  body.appendChild(actions);
  return card;
}

function render() {
  const query = search.value.trim().toLocaleLowerCase();
  const state = stateSelect.value;
  const branch = branchSelect.value;
  let filtered = items.filter((item) => {
    if (query && !item.searchText.includes(query)) return false;
    if (state && item.state !== state) return false;
    if (branch === "weread" && !item.match?.page) return false;
    if (branch === "manual" && item.notes.length === 0) return false;
    if (branch === "catalog-only" && (item.match?.page || item.notes.length > 0)) return false;
    if (branch === "conflict" && item.match?.identityStatus !== "conflict") return false;
    return true;
  });

  const sort = sortSelect.value;
  filtered = [...filtered].sort((left, right) => {
    if (sort === "title") return left.title.localeCompare(right.title, "zh-CN");
    if (sort === "score") return right.score - left.score || left.title.localeCompare(right.title, "zh-CN");
    return dateNumber(right.collectionDate) - dateNumber(left.collectionDate) || left.title.localeCompare(right.title, "zh-CN");
  });

  summary.textContent = `显示 ${filtered.length} / ${items.length}`;
  grid.replaceChildren(...filtered.map(renderCard));
}

for (const element of [search, stateSelect, branchSelect, sortSelect]) {
  element.addEventListener(element === search ? "input" : "change", render);
}

render();
