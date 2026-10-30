/*
 * Thinker — a minimal start page for Obsidian.
 *
 * One view holds everything: the clock, the note list, the focus timer and a month
 * calendar. The timer engine, the day store and the calendar shape are carried over
 * from Thinkers; the note index and the layout are new.
 *
 * Sections, in file order:
 *   1  i18n            2  date and text helpers      3  NoteIndex
 *   4  DayStore        5  TimerEngine + sound        6  NotePanel
 *   7  TimerPanel      8  CalendarPanel              9  HomeView
 *  10  Modals         11  SettingsTab               12  Open a note
 *  14  Plugin
 */

const obsidian = require("obsidian");
const { Plugin, ItemView, Modal, Setting, Notice, Menu, Platform, setIcon, getLanguage, PluginSettingTab } = obsidian;

const VIEW_TYPE = "thinker-home-view";
const STATS_VIEW_TYPE = "thinker-stats-view";
const BUILD = "3.4.3 · day grid, square cells";
const DATA_VERSION = 1;

/* ------------------------------------------------------------------ 1  i18n */

const EN = {
  "clock.focusToday": "Focused {duration}",
  "stats.title": "Focus",
  "stats.total": "This week",
  "stats.sessions": "Sessions",
  "stats.average": "Daily average",
  "stats.focus": "Focus",
  "stats.rest": "Break",
  "stats.longest": "Longest",
  "stats.day": "D",
  "stats.week": "W",
  "stats.month": "M",
  "stats.prev": "Previous period",
  "stats.next": "Next period",
  "stats.untagged": "Untagged",
  "stats.unit": "Switch between day, week and month",
  "stats.backToday": "Back to today",
  "stats.empty": "Nothing recorded here",
  "stats.numbers": "Numbers",
  "stats.shape": "Shape",
  "stats.share": "Where it went",
  "ribbon.home": "Thinker",
  "ribbon.stats": "Focus statistics",
  "ribbon.settings": "Thinker settings",
  "cmd.stats": "Open focus statistics",

  "notes.placeholder": "Search {count} notes",
  "notes.all": "All",
  "notes.recent": "Recent",
  "notes.pinned": "Pinned",
  "notes.root": "Root",
  "notes.direct": "Direct",
  "notes.new": "New note",
  "create.title": "New",
  "create.note": "Note",
  "create.folder": "Folder",
  "create.noteName": "Note name",
  "create.folderName": "Folder name",
  "create.where": "Place",
  "create.make": "Create",
  "create.exists": "That name is taken",
  "notes.empty": "No note matches",
  "notes.createNamed": "Create \"{name}\"",
  "notes.saveTo": "Saved to {folder}",
  "notes.openNewTab": "Open in new tab",
  "notes.rename": "Rename",
  "notes.delete": "Delete",
  "notes.copyPath": "Copy path",
  "notes.renameTitle": "Rename note",
  "notes.deleted": "Moved to trash",
  "notes.untitled": "Untitled",
  "notes.scanning": "Indexing notes…",
  "notes.reorder": "Reorder tabs",
  "notes.reorderDone": "Tab order saved",

  "timer.focus": "Focus",
  "timer.shortBreak": "Short break",
  "timer.longBreak": "Long break",
  "timer.pomodoro": "Pomodoro",
  "timer.stopwatch": "Stopwatch",
  "timer.pause": "Pause",
  "timer.resume": "Resume",
  "timer.stop": "End",
  "timer.start": "Start",

  "cal.title": "{year}-{month}",
  "cal.prev": "Previous month",
  "cal.next": "Next month",
  "cal.today": "Today",
  "cal.empty": "No session on this day",
  "cal.dayTotal": "{duration} focused",
  "cal.add": "Add focus",
  "cal.addRest": "Add break",
  "cal.openDiary": "Open diary",
  "cal.createDiary": "New diary",
  "cal.heat": "{count} sessions",

  "record.title": "Edit session",
  "record.type": "Type",
  "record.focus": "Focus",
  "record.rest": "Break",
  "record.start": "Start time",
  "record.minutes": "Minutes",
  "record.tag": "Label",
  "record.note": "Note",
  "record.deleteConfirm": "Delete this session?",

  "prompt.title": "What did you just do?",
  "prompt.what": "Label",
  "prompt.note": "Note",
  "prompt.notePlaceholder": "Optional",
  "prompt.skip": "Skip",
  "prompt.meta": "{range} · {duration}",

  "modal.save": "Save",
  "modal.cancel": "Cancel",
  "modal.delete": "Delete",

  "notice.saved": "Saved {duration}",
  "notice.tooShort": "Session shorter than {seconds}s was not saved",
  "notice.recovered": "A session that ended while Obsidian was closed was saved",
  "notice.resumed": "Timer kept running in the background · {duration} so far",
  "notice.breakDone": "Break is over",

  "cmd.home": "Open the Thinker home page",
  "cmd.startStop": "Start or end a session",
  "cmd.newNote": "New note from the home page",
  "cmd.addManual": "Add a session by hand",
  "cmd.diary": "Open today's diary",

  "status.idle": "Idle",

  "settings.general": "Home page",
  "settings.openOnStartup": "Open on startup",
  "settings.collapseLeft": "Collapse the left sidebar",
  "settings.openOnStartupDesc": "Opens this page when Obsidian starts and no note is open",
  "settings.side": "Column order",
  "settings.sideNotesLeft": "Notes on the left",
  "settings.sideNotesRight": "Notes on the right",
  "settings.showSeconds": "Show seconds in the clock",
  "settings.showSecondsDesc": "Off by default: a clock that ticks every second pulls the eye",

  "settings.notes": "Notes",
  "settings.roots": "Folders to index",
  "settings.rootsDesc": "One folder per line, empty means the whole vault",
  "settings.scope": "Search scope",
  "settings.scopeTitle": "Titles, aliases and headings",
  "settings.scopeFull": "Titles and full text",
  "settings.scopeDesc": "Full text builds a background cache and grows with the vault",
  "settings.listLimit": "Rows in the list",
  "settings.noteSort": "Note order",
  "settings.sortNameAsc": "Name, A to Z",
  "settings.sortNameDesc": "Name, Z to A",
  "settings.sortNewest": "Newest first",
  "settings.sortOldest": "Oldest first",
  "settings.showAll": "Show All",
  "settings.showAllDesc": "The whole vault as one flat list",
  "settings.showRecent": "Show Recent",
  "settings.showRecentDesc": "Everything edited in the last week, newest first",
  "settings.showPinned": "Show Pinned",
  "settings.showPinnedDesc": "The notes listed under Pinned below",
  "settings.pins": "Pinned notes",
  "settings.pinsNone": "Empty",
  "settings.hiddenFolders": "Hidden folders",
  "settings.hiddenFoldersHint": "One path per line, subfolders included, case ignored",

  "settings.timer": "Focus timer",
  "settings.focusLength": "Focus length",
  "settings.shortBreak": "Short break",
  "settings.longBreak": "Long break",
  "settings.longBreakInterval": "Long break every",
  "settings.autoCycle": "Run the cycle on its own",
  "settings.minSession": "Shortest saved session",
  "settings.minSessionDesc": "Seconds. Anything shorter is dropped",
  "settings.dailyGoal": "Daily goal",
  "settings.dailyGoalDesc": "Minutes, used to shade the calendar",
  "settings.defaultMode": "Default mode",
  "settings.sound": "Chime",
  "settings.vibrate": "Vibrate",
  "settings.notice": "Notices",
  "settings.promptFocus": "Ask what I did after a session",

  "settings.data": "Records",
  "settings.dataFolder": "Folder",
  "settings.dataFolderDesc": "Daily files land in <folder>/<year>/<date>.md",
  "settings.weekStart": "Week starts on",
  "settings.sunday": "Sunday",
  "settings.monday": "Monday",
  "settings.dataPath": "Today's file",
  "settings.dataPathDesc": "{path}",
  "settings.diaryFolder": "Diary folder",
  "settings.diaryFormat": "Diary date format",

  "settings.about": "About",
  "settings.aboutDesc": "Thinker {version}. The timer, the records and the calendar come from Thinkers; only one of the two should be enabled at a time, or both will write the same daily files."
};

const ZH = {
  "clock.focusToday": "今日专注 {duration}",
  "stats.title": "专注",
  "stats.total": "本周合计",
  "stats.sessions": "次数",
  "stats.average": "日均",
  "stats.focus": "专注",
  "stats.rest": "休息",
  "stats.longest": "最长一段",
  "stats.day": "日",
  "stats.week": "周",
  "stats.month": "月",
  "stats.prev": "上一段",
  "stats.next": "下一段",
  "stats.untagged": "未标记",
  "stats.unit": "在日 / 周 / 月之间切换",
  "stats.backToday": "回到今天",
  "stats.empty": "这一段时间没有记录",
  "stats.numbers": "数值",
  "stats.shape": "分布",
  "stats.share": "构成",
  "ribbon.home": "Thinker",
  "ribbon.stats": "专注统计",
  "ribbon.settings": "Thinker 设置",
  "cmd.stats": "打开专注统计",

  "notes.placeholder": "搜索 {count} 篇笔记",
  "notes.all": "全部",
  "notes.recent": "最近",
  "notes.pinned": "收藏",
  "notes.root": "根目录",
  "notes.direct": "顶层",
  "notes.new": "新建笔记",
  "create.title": "新建",
  "create.note": "笔记",
  "create.folder": "文件夹",
  "create.noteName": "笔记名称",
  "create.folderName": "文件夹名称",
  "create.where": "位置",
  "create.make": "创建",
  "create.exists": "已有同名项",
  "notes.empty": "没有匹配的笔记",
  "notes.createNamed": "新建「{name}」",
  "notes.saveTo": "保存到 {folder}",
  "notes.openNewTab": "在新标签页打开",
  "notes.rename": "重命名",
  "notes.delete": "删除",
  "notes.copyPath": "复制路径",
  "notes.renameTitle": "重命名笔记",
  "notes.deleted": "已移入回收站",
  "notes.untitled": "未命名",
  "notes.scanning": "正在索引笔记…",
  "notes.reorder": "调整标签顺序",
  "notes.reorderDone": "标签顺序已保存",

  "timer.focus": "专注",
  "timer.shortBreak": "短休息",
  "timer.longBreak": "长休息",
  "timer.pomodoro": "番茄钟",
  "timer.stopwatch": "正计时",
  "timer.pause": "暂停",
  "timer.resume": "继续",
  "timer.stop": "结束",
  "timer.start": "开始",

  "cal.title": "{year} 年 {month} 月",
  "cal.prev": "上个月",
  "cal.next": "下个月",
  "cal.today": "今天",
  "cal.empty": "这一天还没有记录",
  "cal.dayTotal": "专注 {duration}",
  "cal.add": "添加专注",
  "cal.addRest": "添加休息",
  "cal.openDiary": "打开日记",
  "cal.createDiary": "新建日记",
  "cal.heat": "{count} 次记录",

  "record.title": "编辑记录",
  "record.type": "类型",
  "record.focus": "专注",
  "record.rest": "休息",
  "record.start": "开始时间",
  "record.minutes": "时长（分钟）",
  "record.tag": "标签",
  "record.note": "备注",
  "record.deleteConfirm": "删除这条记录？",

  "prompt.title": "刚做完什么？",
  "prompt.what": "标签",
  "prompt.note": "备注",
  "prompt.notePlaceholder": "可以留空",
  "prompt.skip": "跳过",
  "prompt.meta": "{range} · {duration}",

  "modal.save": "保存",
  "modal.cancel": "取消",
  "modal.delete": "删除",

  "notice.saved": "已记录 {duration}",
  "notice.tooShort": "不足 {seconds} 秒，没有记录",
  "notice.recovered": "关闭 Obsidian 期间结束的那一段已经补记",
  "notice.resumed": "计时在后台继续 · 已计 {duration}",
  "notice.breakDone": "休息结束",

  "cmd.home": "打开 Thinker 主页",
  "cmd.startStop": "开始或结束一次专注",
  "cmd.newNote": "在主页新建笔记",
  "cmd.addManual": "手动添加一条记录",
  "cmd.diary": "打开今天的日记",

  "status.idle": "空闲",

  "settings.general": "主页",
  "settings.openOnStartup": "启动时打开",
  "settings.collapseLeft": "启动时收起左侧栏",
  "settings.openOnStartupDesc": "Obsidian 启动且没有打开任何笔记时打开这一页",
  "settings.side": "左右顺序",
  "settings.sideNotesLeft": "笔记在左",
  "settings.sideNotesRight": "笔记在右",
  "settings.showSeconds": "时钟显示秒",
  "settings.showSecondsDesc": "默认关闭：每秒跳动会不断把视线拉回去",

  "settings.notes": "笔记",
  "settings.roots": "索引范围",
  "settings.rootsDesc": "一行一个文件夹，留空表示整个库",
  "settings.scope": "搜索范围",
  "settings.scopeTitle": "标题、别名与标题层级",
  "settings.scopeFull": "标题与正文全文",
  "settings.scopeDesc": "全文模式会在后台建缓存，库越大越慢",
  "settings.listLimit": "列表条数",
  "settings.noteSort": "笔记排序",
  "settings.sortNameAsc": "名称 A → Z",
  "settings.sortNameDesc": "名称 Z → A",
  "settings.sortNewest": "时间 新 → 旧",
  "settings.sortOldest": "时间 旧 → 新",
  "settings.showAll": "显示 全部",
  "settings.showAllDesc": "整个库作为一张平铺列表",
  "settings.showRecent": "显示 最近",
  "settings.showRecentDesc": "最近七天改过的笔记，最新的在前",
  "settings.showPinned": "显示 收藏",
  "settings.showPinnedDesc": "下面「收藏的笔记」里列出的那几篇",
  "settings.pins": "收藏的笔记",
  "settings.pinsNone": "空",
  "settings.hiddenFolders": "隐藏的文件夹",
  "settings.hiddenFoldersHint": "一行一个路径，含子文件夹，不区分大小写",

  "settings.timer": "专注计时",
  "settings.focusLength": "专注时长",
  "settings.shortBreak": "短休息",
  "settings.longBreak": "长休息",
  "settings.longBreakInterval": "长休息间隔",
  "settings.autoCycle": "自动推进轮次",
  "settings.minSession": "最短记录时长",
  "settings.minSessionDesc": "单位秒，更短的会被丢弃",
  "settings.dailyGoal": "每日目标",
  "settings.dailyGoalDesc": "单位分钟，用于日历热力深浅",
  "settings.defaultMode": "默认模式",
  "settings.sound": "结束提示音",
  "settings.vibrate": "振动",
  "settings.notice": "气泡提示",
  "settings.promptFocus": "结束后问一句做了什么",

  "settings.data": "记录",
  "settings.dataFolder": "目录",
  "settings.dataFolderDesc": "每日文件写到 <目录>/<年>/<日期>.md",
  "settings.weekStart": "每周起始",
  "settings.sunday": "周日",
  "settings.monday": "周一",
  "settings.dataPath": "今天的文件",
  "settings.dataPathDesc": "{path}",
  "settings.diaryFolder": "日记目录",
  "settings.diaryFormat": "日记日期格式",

  "settings.about": "关于",
  "settings.aboutDesc": "Thinker {version}。计时、记录与日历来自 Thinkers，两者请只启用一个，否则会同时写同一批每日文件。"
};

let lang = "en";

function initLocale() {
  const raw = (getLanguage && getLanguage()) || window.navigator.language || "en";
  lang = String(raw).toLowerCase().startsWith("zh") ? "zh" : "en";
}

function t(key, vars) {
  const dict = lang === "zh" ? ZH : EN;
  let template = dict[key] != null ? dict[key] : EN[key] != null ? EN[key] : key;
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (match, name) => (vars[name] === undefined ? match : String(vars[name])));
}

/* --------------------------------------------------- 2  date and text helpers */

function pad2(n) {
  return n < 10 ? "0" + n : "" + n;
}

function dateKeyOfDate(d) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function todayKey() {
  return dateKeyOfDate(new Date());
}

function dateKeyOf(ts) {
  return dateKeyOfDate(new Date(ts));
}

function parseDateKey(key) {
  const parts = String(key).split("-");
  return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
}

function monthGrid(year, month, weekStart) {
  const first = new Date(year, month - 1, 1);
  const offset = (first.getDay() - weekStart + 7) % 7;
  const cells = [];
  for (let i = 0; i < offset; i++) cells.push(null);
  const days = new Date(year, month, 0).getDate();
  for (let d = 1; d <= days; d++) cells.push(`${year}-${pad2(month)}-${pad2(d)}`);
  while (cells.length % 7 !== 0) cells.push(null);
  while (cells.length < 42) cells.push(null);
  return cells;
}

/* The seven keys of the week that contains dayKey, starting on weekStart. */
function weekDays(dayKey, weekStart) {
  const date = parseDateKey(dayKey);
  const offset = (date.getDay() - weekStart + 7) % 7;
  const start = new Date(date.getFullYear(), date.getMonth(), date.getDate() - offset);
  const out = [];
  for (let i = 0; i < 7; i++) {
    out.push(dateKeyOfDate(new Date(start.getFullYear(), start.getMonth(), start.getDate() + i)));
  }
  return out;
}

function weekdayLabels(weekStart) {
  if (lang === "zh") {
    const zh = ["日", "一", "二", "三", "四", "五", "六"];
    return Array.from({ length: 7 }, (_, i) => zh[(weekStart + i) % 7]);
  }
  const en = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return Array.from({ length: 7 }, (_, i) => en[(weekStart + i) % 7]);
}

function formatDuration(sec) {
  const total = Math.max(0, Math.round(sec / 60));
  if (lang === "zh") {
    if (total < 60) return `${total} 分`;
    const h = Math.floor(total / 60);
    const m = total % 60;
    return m > 0 ? `${h} 小时 ${m} 分` : `${h} 小时`;
  }
  if (total < 60) return `${total}m`;
  const h = Math.floor(total / 60);
  const m = total % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function formatClock(sec) {
  const total = Math.max(0, Math.round(sec));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (h > 0) return `${h}:${pad2(m)}:${pad2(s)}`;
  return `${pad2(m)}:${pad2(s)}`;
}

/* The day's focus, including the session that is running right now.

   A record only exists once a session ends, so a ring fed from the log alone
   would sit still for two hours and then jump. The number on the page is the day,
   so it has to move while the day is being spent. A break is not focus and is
   never added. */
function dayFocusSec(todaySec, engine) {
  const base = Math.max(0, Number(todaySec) || 0);
  if (!engine || engine.state === "idle" || engine.phase !== "focus") return base;
  return base + Math.max(0, engine.elapsedSec());
}

/* A day against its goal, capped: over the goal is still a full ring, not a
   second lap and not an error colour. */
function dayRatio(daySec, goalSec) {
  return Math.max(0, Math.min(1, daySec / Math.max(1, goalSec)));
}

function clockOf(ts) {
  const d = new Date(ts);
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

function relativeTime(ts) {
  const now = Date.now();
  const diff = Math.max(0, now - ts);
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return lang === "zh" ? "刚刚" : "just now";
  if (minutes < 60) return lang === "zh" ? `${minutes} 分钟前` : `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  if (ts >= todayStart.getTime()) return lang === "zh" ? `${hours} 小时前` : `${hours}h ago`;
  const dayDiff = Math.floor((todayStart.getTime() - ts) / 86400000);
  if (dayDiff <= 1) return lang === "zh" ? "昨天" : "yesterday";
  if (dayDiff < 7) return lang === "zh" ? `${dayDiff} 天前` : `${dayDiff}d ago`;
  if (dayDiff < 30) {
    const weeks = Math.floor(dayDiff / 7);
    return lang === "zh" ? `${weeks} 周前` : `${weeks}w ago`;
  }
  return dateKeyOf(ts).slice(5).replace("-", "/");
}

function isIgnoredPath(path) {
  return path.split("/").some((part) => part.startsWith("."));
}

function normalizeFolder(value) {
  return String(value || "").replace(/\\/g, "/").replace(/^\/+/, "").replace(/\/+$/, "");
}

function parseLines(value) {
  return String(value || "")
    .split("\n")
    .map((line) => normalizeFolder(line.trim()))
    .filter((line) => line.length > 0);
}

function visibleRecords(records) {
  return (records || []).filter((r) => !r.deleted);
}

function sortRecords(records) {
  return records.slice().sort((a, b) => a.start - b.start);
}

function sumFocusDuration(records) {
  return visibleRecords(records)
    .filter((r) => r.kind !== "rest")
    .reduce((sum, r) => sum + (Number(r.durationSec) || 0), 0);
}

function sumRestDuration(records) {
  return visibleRecords(records)
    .filter((r) => r.kind === "rest")
    .reduce((sum, r) => sum + (Number(r.durationSec) || 0), 0);
}

function newId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/* Substring wins outright, a scattered subsequence still matches, and shorter
 * titles beat longer ones so that "math" prefers "Math.md" over "Math history.md". */
/* The four orders offered in the settings. Time compares the modified stamp; name
   compares the title, with the path as a tie-break so the result never shuffles
   between two notes that share a name. */
const NOTE_ORDERS = ["name-asc", "name-desc", "time-asc", "time-desc"];

function sorterFor(order) {
  const byName = (a, b) => a.title.localeCompare(b.title, "zh") || a.path.localeCompare(b.path, "zh");
  const byTime = (a, b) => a.mtime - b.mtime || byName(a, b);
  if (order === "name-desc") return (a, b) => byName(b, a);
  if (order === "time-asc") return byTime;
  if (order === "time-desc") return (a, b) => byTime(b, a);
  return byName;
}

function fuzzyScore(query, text) {
  if (!query) return 0;
  if (!text) return -1;
  const q = query.toLowerCase();
  const s = String(text).toLowerCase();
  const hit = s.indexOf(q);
  if (hit >= 0) {
    let score = 120 - Math.min(40, Math.floor(s.length / 3));
    if (hit === 0) score += 40;
    return score;
  }
  let qi = 0;
  let score = 0;
  let run = 0;
  let last = -2;
  for (let i = 0; i < s.length && qi < q.length; i++) {
    if (s[i] !== q[qi]) continue;
    const wordStart = i === 0 || /[\s\-_/·，。、,]/.test(s[i - 1]);
    run = i === last + 1 ? run + 1 : 0;
    score += 8 + (wordStart ? 6 : 0) + run * 2;
    last = i;
    qi++;
  }
  if (qi < q.length) return -1;
  return score - Math.min(24, Math.floor(s.length / 6));
}

function debounce(fn, ms) {
  let handle = null;
  return function debounced(...args) {
    if (handle) window.clearTimeout(handle);
    handle = window.setTimeout(() => {
      handle = null;
      fn.apply(this, args);
    }, ms);
  };
}

/* ----------------------------------------------------------- 3  NoteIndex */

/* The whole point of this index is that opening the page must not wait for the
 * vault. Files, mtimes and headings all come from caches Obsidian already keeps;
 * only the optional full-text pass reads file bodies, and it does so in chunks. */
class NoteIndex {
  constructor(app, getSettings, onProgress) {
    this.app = app;
    this.getSettings = getSettings;
    this.onProgress = onProgress;
    this.entries = [];
    this.byPath = new Map();
    this.text = new Map();
    this.built = false;
    this.textTimer = null;
  }

  destroy() {
    if (this.textTimer) {
      window.clearTimeout(this.textTimer);
      this.textTimer = null;
    }
  }

  /* A folder on the list, or anything inside it, stays out of the index. The
     compare ignores case: the folder on disk may be `Focuslog` while the line in
     the settings says `FocusLog`, and a case-sensitive test silently hides
     nothing, because Windows keeps the name the file system gave it. */
  hiddenFolders() {
    return parseLines(this.getSettings().hiddenFolders).map((line) => line.toLowerCase());
  }

  isHidden(dir) {
    if (!dir) return false;
    const lower = dir.toLowerCase();
    return this.hiddenFolders().some((skip) => lower === skip || lower.startsWith(skip + "/"));
  }

  rebuild() {
    const settings = this.getSettings();
    const roots = parseLines(settings.indexRoots);
    const lowerRoots = roots.map((r) => r.toLowerCase());
    const files = this.app.vault.getMarkdownFiles();
    const entries = [];
    for (const file of files) {
      if (isIgnoredPath(file.path)) continue;
      if (lowerRoots.length > 0) {
        const lower = file.path.toLowerCase();
        const inside = lowerRoots.some((root) => lower === root || lower.startsWith(root + "/"));
        if (!inside) continue;
      }
      const cache = this.app.metadataCache.getFileCache(file);
      const parentPath = file.parent && file.parent.path !== "/" ? file.parent.path : "";
      if (this.isHidden(parentPath)) continue;
      const parts = parentPath ? parentPath.split("/") : [];
      entries.push({
        file,
        path: file.path,
        title: file.basename,
        folder: parts.length > 0 ? parts[0] : "",
        sub: parts.length > 1 ? parts[1] : "",
        parent: parentPath,
        mtime: file.stat ? file.stat.mtime : 0,
        aliases: readAliases(cache),
        headings: readHeadings(cache)
      });
    }
    this.entries = entries;
    this.byPath = new Map(entries.map((entry) => [entry.path, entry]));
    this.built = true;
    if (settings.searchScope === "full") this.scheduleText();
  }

  updateOne(file) {
    if (!this.built) return;
    const lowerRoots = parseLines(this.getSettings().indexRoots).map((r) => r.toLowerCase());
    const lower = file.path.toLowerCase();
    const inside = lowerRoots.length === 0 || lowerRoots.some((root) => lower === root || lower.startsWith(root + "/"));
    if (!inside || isIgnoredPath(file.path) || !file.path.endsWith(".md")) {
      this.removeOne(file.path);
      return;
    }
    const cache = this.app.metadataCache.getFileCache(file);
    const parentPath = file.parent && file.parent.path !== "/" ? file.parent.path : "";
    if (this.isHidden(parentPath)) {
      this.removeOne(file.path);
      return;
    }
    const parts = parentPath ? parentPath.split("/") : [];
    const entry = {
      file,
      path: file.path,
      title: file.basename,
      folder: parts.length > 0 ? parts[0] : "",
      sub: parts.length > 1 ? parts[1] : "",
      parent: parentPath,
      mtime: file.stat ? file.stat.mtime : 0,
      aliases: readAliases(cache),
      headings: readHeadings(cache)
    };
    const at = this.entries.findIndex((item) => item.path === entry.path);
    if (at >= 0) this.entries[at] = entry;
    else this.entries.push(entry);
    this.byPath.set(entry.path, entry);
    this.text.delete(file.path);
  }

  removeOne(path) {
    this.entries = this.entries.filter((entry) => entry.path !== path);
    this.byPath.delete(path);
    this.text.delete(path);
  }

  renameOne(file, oldPath) {
    this.removeOne(oldPath);
    this.updateOne(file);
  }

  /* Every folder in the vault, empty ones included and counting everything filed
     below it. The new-item dialog has to offer a destination that holds nothing
     yet, so this reads the vault rather than the note list. */
  folders() {
    const hidden = this.hiddenFolders();
    const roots = parseLines(this.getSettings().indexRoots).map((root) => root.toLowerCase());
    const counts = new Map();
    for (const entry of this.entries) {
      const dir = entry.parent || "";
      if (!dir) continue;
      const parts = dir.split("/");
      for (let i = 1; i <= parts.length; i++) {
        const path = parts.slice(0, i).join("/");
        counts.set(path, (counts.get(path) || 0) + 1);
      }
    }

    const keep = (path) => {
      if (!path || path === "/" || isIgnoredPath(path)) return false;
      const lower = path.toLowerCase();
      if (hidden.some((skip) => lower === skip || lower.startsWith(skip + "/"))) return false;
      if (roots.length === 0) return true;
      return roots.some((root) => lower === root || lower.startsWith(root + "/"));
    };

    const out = [];
    const seen = new Set();
    const loaded = this.app.vault.getAllLoadedFiles ? this.app.vault.getAllLoadedFiles() : [];
    for (const item of loaded) {
      if (!item || !Array.isArray(item.children)) continue;
      if (!keep(item.path) || seen.has(item.path)) continue;
      seen.add(item.path);
      out.push({
        path: item.path,
        name: item.name || item.path.split("/").pop(),
        depth: item.path.split("/").length,
        count: counts.get(item.path) || 0
      });
    }
    for (const path of counts.keys()) {
      if (seen.has(path) || !keep(path)) continue;
      seen.add(path);
      out.push({ path, name: path.split("/").pop(), depth: path.split("/").length, count: counts.get(path) || 0 });
    }
    return out.sort((a, b) => a.path.localeCompare(b.path, "zh"));
  }

  pinnedPaths() {
    return parseLines(this.getSettings().pinnedNotes);
  }

  /* A query ranks by relevance; without one the order is the one chosen in the
     settings. Pinned notes are no longer hoisted above everything: 收藏 is its own
     range, and hoisting broke every order that could be picked. */
  list(category, sub, query, limit) {
    const pinnedSet = new Set(this.pinnedPaths());
    const recentCut = Date.now() - 7 * 86400000;
    let pool = this.entries;
    if (category === "pinned") pool = pool.filter((entry) => pinnedSet.has(entry.path));
    else if (category === "recent") pool = pool.filter((entry) => entry.mtime >= recentCut);
    else if (category && category !== "all") pool = pool.filter((entry) => (entry.folder || "") === category);
    if (sub != null) pool = pool.filter((entry) => (entry.sub || "") === sub);

    const q = String(query || "").trim();
    const scored = [];
    for (const entry of pool) {
      let score = 0;
      if (q) {
        score = Math.max(
          fuzzyScore(q, entry.title) * 3,
          fuzzyScore(q, entry.path),
          ...entry.aliases.map((alias) => fuzzyScore(q, alias) * 2),
          ...entry.headings.slice(0, 40).map((heading) => fuzzyScore(q, heading))
        );
        if (score < 0) continue;
      }
      scored.push({ entry, score });
    }
    /* 全部, a folder and 收藏 are read in the order chosen in the settings. 最近 is
       not: it is the last week's edits and its only useful order is the newest
       first, otherwise it is 全部 with rows missing. */
    const compare = category === "recent" ? sorterFor("time-desc") : sorterFor(this.getSettings().noteSort);
    scored.sort((a, b) => {
      if (q && b.score !== a.score) return b.score - a.score;
      return compare(a.entry, b.entry);
    });
    return scored.slice(0, limit).map((item) => item.entry);
  }

  /* Full text is a second pass: it never blocks a render, and a hit there ranks
   * below any hit in a title or a heading. */
  searchText(query) {
    const q = String(query || "").trim().toLowerCase();
    if (q.length < 2) return [];
    const out = [];
    for (const [path, record] of this.text) {
      if (!record || !record.lower) continue;
      const at = record.lower.indexOf(q);
      if (at < 0) continue;
      const entry = this.byPath.get(path);
      if (!entry) continue;
      out.push({ entry, snippet: makeSnippet(record.lower, at, q.length) });
    }
    return out;
  }

  get textReady() {
    return this.textTimer === null;
  }

  get textCount() {
    return this.text.size;
  }

  scheduleText() {
    if (this.textTimer !== null) return;
    this.textTimer = window.setTimeout(() => this.stepText(), 400);
  }

  async stepText() {
    this.textTimer = null;
    if (this.getSettings().searchScope !== "full") return;
    const pending = this.entries.filter((entry) => {
      const record = this.text.get(entry.path);
      return !record || record.mtime !== entry.mtime;
    });
    if (pending.length === 0) return;
    const batch = pending.slice(0, 60);
    for (const entry of batch) {
      let body = "";
      try {
        body = await this.app.vault.cachedRead(entry.file);
      } catch (e) {
        body = "";
      }
      this.text.set(entry.path, {
        mtime: entry.mtime,
        lower: body.length > 400000 ? "" : body.toLowerCase()
      });
    }
    if (this.onProgress) this.onProgress();
    const left = this.entries.some((entry) => {
      const record = this.text.get(entry.path);
      return !record || record.mtime !== entry.mtime;
    });
    if (left) this.textTimer = window.setTimeout(() => this.stepText(), 120);
  }
}

function makeSnippet(text, at, length) {
  const from = Math.max(0, at - 18);
  const to = Math.min(text.length, at + length + 26);
  const slice = text.slice(from, to).replace(/\s+/g, " ").trim();
  return (from > 0 ? "…" : "") + slice + (to < text.length ? "…" : "");
}

function readAliases(cache) {
  const fm = cache && cache.frontmatter ? cache.frontmatter : null;
  if (!fm) return [];
  const value = fm.aliases != null ? fm.aliases : fm.alias;
  if (Array.isArray(value)) return value.map((item) => String(item)).filter(Boolean);
  if (typeof value === "string") {
    return value
      .split(/[,，]/)
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
}

function readHeadings(cache) {
  if (!cache || !Array.isArray(cache.headings)) return [];
  return cache.headings.map((heading) => heading.heading).filter(Boolean);
}

/* ------------------------------------------------------------- 4  DayStore */

/* One markdown file per day, in the shape Thinkers already writes, so the history
 * on disk keeps working in both directions. */
class DayStore {
  constructor(app, getSettings) {
    this.app = app;
    this.getSettings = getSettings;
  }

  folder() {
    return normalizeFolder(this.getSettings().dataFolder) || "FocusLog";
  }

  pathFor(dayKey) {
    return `${this.folder()}/${dayKey.slice(0, 4)}/${dayKey}.md`;
  }

  samplePath() {
    return this.pathFor(todayKey());
  }

  async ensureFolder(path) {
    const parts = path.split("/");
    parts.pop();
    const target = parts.join("/");
    if (!target) return;
    let walked = "";
    for (const part of parts) {
      walked = walked ? `${walked}/${part}` : part;
      if (!this.app.vault.getAbstractFileByPath(walked)) {
        try {
          await this.app.vault.createFolder(walked);
        } catch (e) {
          /* a parallel write may have created it first */
        }
      }
    }
  }

  async getDay(dayKey) {
    const path = this.pathFor(dayKey);
    const file = this.app.vault.getAbstractFileByPath(path);
    if (!file) return [];
    try {
      const text = await this.app.vault.read(file);
      return parseDayFile(text);
    } catch (e) {
      return [];
    }
  }

  async getDays(dayKeys) {
    const map = new Map();
    const results = await Promise.all(dayKeys.map((key) => this.getDay(key)));
    dayKeys.forEach((key, i) => map.set(key, results[i]));
    return map;
  }

  async getMonth(year, month) {
    const days = new Date(year, month, 0).getDate();
    const keys = [];
    for (let d = 1; d <= days; d++) keys.push(`${year}-${pad2(month)}-${pad2(d)}`);
    const raw = await this.getDays(keys);
    const out = new Map();
    for (const key of keys) {
      const records = visibleRecords(raw.get(key));
      if (records.length === 0) continue;
      out.set(key, {
        focusSec: sumFocusDuration(records),
        restSec: sumRestDuration(records),
        count: records.filter((r) => r.kind !== "rest").length
      });
    }
    return out;
  }

  async writeDay(dayKey, records) {
    const path = this.pathFor(dayKey);
    const text = buildDayFile(dayKey, records);
    const file = this.app.vault.getAbstractFileByPath(path);
    if (file) {
      await this.app.vault.process(file, () => text);
      return;
    }
    await this.ensureFolder(path);
    await this.app.vault.create(path, text);
  }

  async addRecord(record) {
    const dayKey = dateKeyOf(record.start);
    const records = await this.getDay(dayKey);
    records.push(record);
    await this.writeDay(dayKey, records);
    return record;
  }

  async updateRecord(dayKey, record) {
    const records = await this.getDay(dayKey);
    const at = records.findIndex((item) => item.id === record.id);
    if (at < 0) return;
    records[at] = record;
    await this.writeDay(dayKey, records);
  }

  async deleteRecord(dayKey, id) {
    const records = await this.getDay(dayKey);
    const next = records.filter((item) => item.id !== id);
    await this.writeDay(dayKey, next);
  }
}

function parseDayFile(text) {
  const fence = /```json\s*([\s\S]*?)```/.exec(text);
  if (!fence) return [];
  try {
    const parsed = JSON.parse(fence[1]);
    return Array.isArray(parsed) ? parsed.filter((item) => item && item.start) : [];
  } catch (e) {
    return [];
  }
}

function buildDayFile(dayKey, records) {
  const list = sortRecords(records);
  const focus = visibleRecords(list).filter((r) => r.kind !== "rest");
  const rest = visibleRecords(list).filter((r) => r.kind === "rest");
  const body = list.map((record) => "\t" + JSON.stringify(record)).join(",\n");
  return [
    "---",
    "thinkers: log",
    `date: ${dayKey}`,
    `focus-minutes: ${Math.round(sumFocusDuration(list) / 60)}`,
    `session-count: ${focus.length}`,
    `rest-minutes: ${Math.round(sumRestDuration(list) / 60)}`,
    `rest-count: ${rest.length}`,
    "---",
    "",
    "```json",
    "[",
    body,
    "]",
    "```",
    ""
  ]
    .filter((line) => line !== undefined)
    .join("\n");
}

/* ------------------------------------------------- 5  TimerEngine and sound */

let audioCtx = null;

function playChime() {
  const Ctor = window.AudioContext || window.webkitAudioContext;
  if (!Ctor) return;
  if (!audioCtx) audioCtx = new Ctor();
  if (audioCtx.state === "suspended") void audioCtx.resume();
  const now = audioCtx.currentTime;
  [0, 0.18].forEach((offset, index) => {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = "sine";
    osc.frequency.value = index === 0 ? 660 : 880;
    gain.gain.setValueAtTime(0.0001, now + offset);
    gain.gain.exponentialRampToValueAtTime(0.12, now + offset + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + offset + 0.45);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(now + offset);
    osc.stop(now + offset + 0.5);
  });
}

function disposeAudio() {
  if (audioCtx) {
    try {
      void audioCtx.close();
    } catch (e) {
      /* already closed */
    }
    audioCtx = null;
  }
}

function vibrate() {
  if (navigator.vibrate) navigator.vibrate(90);
}

/* A session survives the window that was watching it. When Obsidian is closed,
 * minimised past the point of being counted, or the machine sleeps, the runtime on
 * disk keeps its last wall-clock reading; the gap is added back on the next load.
 * A gap beyond this limit is read as "the timer was left running overnight" and is
 * not counted, so a night away cannot become a nine hour record. */
const BACKGROUND_GAP_LIMIT_SEC = 12 * 3600;

/* Elapsed time is always derived from timestamps, never from a counter, so a
 * sleeping or throttled window cannot drift. */
class TimerEngine {
  constructor(getSettings, hooks) {
    this.getSettings = getSettings;
    this.hooks = hooks;
    const settings = getSettings();
    this.mode = settings.defaultMode === "stopwatch" ? "stopwatch" : "pomodoro";
    this.state = "idle";
    this.phase = "focus";
    this.round = 0;
    this.accumulatedSec = 0;
    this.runFrom = 0;
    this.sessionStart = 0;
    this.targetSec = 0;
    this.tag = "";
  }

  get isActive() {
    return this.state !== "idle";
  }

  elapsedSec() {
    if (this.state === "running") {
      return this.accumulatedSec + Math.max(0, (Date.now() - this.runFrom) / 1000);
    }
    return this.accumulatedSec;
  }

  remainingSec() {
    if (!this.targetSec) return 0;
    return Math.max(0, this.targetSec - this.elapsedSec());
  }

  start() {
    if (this.state !== "idle") return;
    const settings = this.getSettings();
    this.phase = "focus";
    this.accumulatedSec = 0;
    this.sessionStart = Date.now();
    this.runFrom = Date.now();
    this.targetSec = this.mode === "pomodoro" ? Math.max(1, settings.focusMinutes) * 60 : 0;
    this.tag = "";
    this.state = "running";
    this.hooks.onStateChange();
  }

  pause() {
    if (this.state !== "running") return;
    this.accumulatedSec = this.elapsedSec();
    this.state = "paused";
    this.hooks.onStateChange();
  }

  resume() {
    if (this.state !== "paused") return;
    this.runFrom = Date.now();
    this.state = "running";
    this.hooks.onStateChange();
  }

  /* Ends the current session by hand. */
  stop() {
    if (this.state === "idle") return;
    const elapsed = Math.round(this.elapsedSec());
    const settings = this.getSettings();
    if (elapsed >= Math.max(0, settings.minSessionSeconds)) {
      this.record({
        start: this.sessionStart,
        end: this.sessionStart + elapsed * 1000,
        durationSec: elapsed,
        kind: this.phase === "focus" ? "focus" : "rest",
        phase: this.phase,
        completed: this.mode === "pomodoro" ? this.remainingSec() <= 0 : true
      });
    } else {
      this.hooks.onSessionTooShort(elapsed);
    }
    this.reset();
  }

  /* Returns true when a phase ended during this tick. */
  tick() {
    if (this.state !== "running") return false;
    if (this.mode !== "pomodoro" || !this.targetSec) return false;
    if (this.elapsedSec() < this.targetSec) return false;
    this.completePhase();
    return true;
  }

  completePhase() {
    const settings = this.getSettings();
    const finished = this.phase;
    const durationSec = Math.round(this.targetSec);
    this.record({
      start: this.sessionStart,
      end: this.sessionStart + durationSec * 1000,
      durationSec,
      kind: finished === "focus" ? "focus" : "rest",
      phase: finished,
      completed: true
    });
    if (finished === "focus") {
      this.round += 1;
      const long = this.round % Math.max(1, settings.longBreakInterval) === 0;
      this.phase = long ? "longBreak" : "shortBreak";
      this.targetSec = Math.max(1, long ? settings.longBreakMinutes : settings.shortBreakMinutes) * 60;
    } else {
      this.phase = "focus";
      this.targetSec = Math.max(1, settings.focusMinutes) * 60;
    }
    this.accumulatedSec = 0;
    this.sessionStart = Date.now();
    this.runFrom = Date.now();
    this.hooks.onPhaseComplete(finished);
    if (settings.autoCycle) {
      this.state = "running";
    } else {
      this.state = "idle";
      this.accumulatedSec = 0;
    }
    this.hooks.onStateChange();
  }

  reset() {
    this.state = "idle";
    this.phase = "focus";
    this.accumulatedSec = 0;
    this.runFrom = 0;
    this.sessionStart = 0;
    this.targetSec = this.mode === "pomodoro" ? Math.max(1, this.getSettings().focusMinutes) * 60 : 0;
    this.hooks.onStateChange();
  }

  setMode(mode) {
    if (this.state !== "idle" || this.mode === mode) return;
    this.mode = mode === "stopwatch" ? "stopwatch" : "pomodoro";
    this.targetSec = this.mode === "pomodoro" ? Math.max(1, this.getSettings().focusMinutes) * 60 : 0;
    this.hooks.onStateChange();
  }

  record(fields) {
    const now = Date.now();
    this.hooks.onSessionRecorded({
      id: newId(),
      kind: fields.kind,
      mode: this.mode,
      phase: fields.phase,
      tag: this.tag || (fields.kind === "rest" ? t("record.rest") : ""),
      start: fields.start,
      end: fields.end,
      durationSec: fields.durationSec,
      completed: fields.completed,
      createdAt: now,
      updatedAt: now
    });
  }

  snapshot() {
    return {
      state: this.state,
      mode: this.mode,
      phase: this.phase,
      round: this.round,
      tag: this.tag,
      elapsedSec: Math.round(this.elapsedSec()),
      remainingSec: Math.round(this.remainingSec()),
      targetSec: this.targetSec
    };
  }

  exportRuntime() {
    return {
      mode: this.mode,
      state: this.state,
      phase: this.phase,
      round: this.round,
      accumulatedSec: this.elapsedSec(),
      targetSec: this.targetSec,
      sessionStart: this.sessionStart,
      tag: this.tag,
      savedAt: Date.now()
    };
  }

  /* A session survives the window that was watching it. A timer saved while running
   * is put back on the wall clock: the time Obsidian spent closed, minimised away or
   * asleep is added to what was already counted, and the session keeps running. Only
   * a gap past BACKGROUND_GAP_LIMIT_SEC is dropped, which is what keeps a night away
   * from turning into a nine hour record. */
  restore(runtime) {
    if (!runtime || typeof runtime !== "object") return "idle";
    const saved = Number(runtime.accumulatedSec) || 0;
    const savedAt = Number(runtime.savedAt) || 0;
    const wasRunning = runtime.state === "running";
    this.mode = runtime.mode === "stopwatch" ? "stopwatch" : "pomodoro";
    this.round = Math.max(0, Math.round(Number(runtime.round) || 0));
    this.tag = typeof runtime.tag === "string" ? runtime.tag : "";
    this.phase = runtime.phase === "shortBreak" || runtime.phase === "longBreak" ? runtime.phase : "focus";
    this.sessionStart = Number(runtime.sessionStart) || Date.now();
    this.targetSec = Math.max(0, Number(runtime.targetSec) || 0);
    if (runtime.state === "idle" || !runtime.state) {
      this.state = "idle";
      this.accumulatedSec = 0;
      this.targetSec = this.mode === "pomodoro" ? Math.max(1, this.getSettings().focusMinutes) * 60 : 0;
      return "idle";
    }
    /* The stretch that ran without a window in front of it. */
    let gapSec = 0;
    if (wasRunning && savedAt > 0) {
      const raw = Math.max(0, (Date.now() - savedAt) / 1000);
      if (raw <= BACKGROUND_GAP_LIMIT_SEC) gapSec = raw;
    }
    const carried = saved + gapSec;
    this.accumulatedSec = carried;
    if (this.mode === "pomodoro" && this.targetSec > 0 && carried >= this.targetSec) {
      this.record({
        start: this.sessionStart,
        end: this.sessionStart + Math.round(this.targetSec) * 1000,
        durationSec: Math.round(this.targetSec),
        kind: this.phase === "focus" ? "focus" : "rest",
        phase: this.phase,
        completed: true
      });
      if (this.phase === "focus") this.round += 1;
      this.phase = "focus";
      this.accumulatedSec = 0;
      this.state = "idle";
      this.targetSec = Math.max(1, this.getSettings().focusMinutes) * 60;
      return "completed";
    }
    if (wasRunning && gapSec > 0) {
      this.runFrom = Date.now();
      this.state = "running";
      return "resumed";
    }
    this.state = "paused";
    return "restored";
  }
}

function svgEl(name, attrs) {
  const el = document.createElementNS("http://www.w3.org/2000/svg", name);
  for (const key of Object.keys(attrs || {})) el.setAttribute(key, String(attrs[key]));
  return el;
}

/* ------------------------------------------------------------ 6  NotePanel */

class NotePanel {
  constructor(root, deps) {
    this.root = root;
    this.deps = deps;
    this.category = this.firstCategory();
    this.query = "";
    this.results = [];
    this.rows = [];
    /* The list is grouped by folder, so the row order is not the result order.
       A row carries its own entry instead of an index into `results`. */
    this.rowEntries = [];
    this.selected = 0;
    this.keyboardNav = false;
    this.pendingQuery = "";
    this.reordering = false;
    this.dragging = null;
  }

  /* The order of the range row is the user's, not the vault's. The pencil writes
     it into the settings and every later render reads it back through here. A
     key that is not in the stored order (a folder made after the last drag) keeps
     its default place at the end instead of jumping to the front. */
  orderKeys(items) {
    const order = parseLines(this.deps.getSettings().chipOrder || "");
    if (order.length === 0) return items;
    const rank = new Map();
    order.forEach((key, index) => rank.set(key, index));
    return items
      .map((item, index) => ({ item, index }))
      .sort((a, b) => {
        const ra = rank.has(a.item.key) ? rank.get(a.item.key) : Number.MAX_SAFE_INTEGER;
        const rb = rank.has(b.item.key) ? rank.get(b.item.key) : Number.MAX_SAFE_INTEGER;
        if (ra !== rb) return ra - rb;
        return a.index - b.index;
      })
      .map((slot) => slot.item);
  }

  /* The first folder in the row, in the order the settings ask for. 全部 stays one
     click away; it is the whole vault, which is rarely where a session starts. */
  firstCategory() {
    const folders = this.deps.index.folders().filter((folder) => folder.depth === 1);
    if (folders.length === 0) return "all";
    const descending = this.deps.getSettings().noteSort === "name-desc";
    const ordered = descending ? folders.slice().reverse() : folders;
    /* What sits first in the row is what the panel opens on, so a hand-made
       order decides the landing folder as well. */
    const byKey = new Map(ordered.map((folder) => [folder.path, folder]));
    const first = this.orderKeys(ordered.map((folder) => ({ key: folder.path, folder })))[0];
    return first && byKey.has(first.key) ? first.key : ordered[0].path;
  }

  render() {
    const root = this.root;
    root.empty();
    root.addClass("thinker-notes");

    const nav = root.createDiv({ cls: "thinker-nav" });
    this.chips = nav.createDiv({ cls: "thinker-chips" });
    this.chips.addEventListener("dragover", (evt) => this.onChipDragOver(evt));
    this.chips.addEventListener("drop", (evt) => evt.preventDefault());
    this.chips.addEventListener("click", (evt) => {
      const chip = evt.target && evt.target.closest ? evt.target.closest(".thinker-chip") : null;
      if (chip) this.pickChip(chip);
    });
    this.chips.addEventListener("keydown", (evt) => {
      const chip = evt.target && evt.target.closest ? evt.target.closest(".thinker-chip") : null;
      if (!chip) return;
      if (evt.key === "Enter" || evt.key === " ") {
        evt.preventDefault();
        this.pickChip(chip);
      }
    });
    this.list = root.createDiv({ cls: "thinker-list" });
    this.list.addEventListener("click", (evt) => {
      const row = evt.target && evt.target.closest ? evt.target.closest(".thinker-note") : null;
      if (!row) return;
      const index = Number(row.dataset.idx);
      const entry = this.rowEntries[index];
      if (!entry) return;
      this.selected = index;
      this.markSelection();
      this.openEntry(entry, evt.ctrlKey || evt.metaKey);
    });
    this.list.addEventListener("contextmenu", (evt) => {
      const row = evt.target && evt.target.closest ? evt.target.closest(".thinker-note") : null;
      if (!row) return;
      const entry = this.rowEntries[Number(row.dataset.idx)];
      if (!entry) return;
      evt.preventDefault();
      this.openMenu(entry, evt);
    });
    this.list.addEventListener("keydown", (evt) => {
      const row = evt.target && evt.target.closest ? evt.target.closest(".thinker-note") : null;
      if (!row) return;
      if (evt.key === "ArrowDown" || evt.key === "ArrowUp") {
        evt.preventDefault();
        this.move(evt.key === "ArrowDown" ? 1 : -1);
        this.focusRow();
        return;
      }
      if (evt.key === "Enter") {
        evt.preventDefault();
        this.selected = Number(row.dataset.idx);
        this.markSelection();
        const entry = this.rowEntries[this.selected];
        if (entry) this.openEntry(entry, evt.altKey);
        return;
      }
      if (evt.key === "Escape") row.blur();
    });

    /* The field sits under the list. Reading the list is the main act here;
       searching is what you do after scanning, so it belongs at the bottom. */
    const bar = root.createDiv({ cls: "thinker-search" });
    const icon = bar.createDiv({ cls: "thinker-search-icon" });
    setIcon(icon, "search");
    this.input = bar.createEl("input", {
      cls: "thinker-search-input",
      attr: { type: "text", spellcheck: "false", autocomplete: "off", placeholder: "" }
    });
    /* Rebuilt on every keystroke, on purpose. A debounce here looks like an
       optimisation and is a bug: Enter is handled on the same element, so a fast
       typist can press it while the list still belongs to the previous query and
       open the wrong note. The cost of six rebuilds of a forty-row list is smaller
       than the cost of that. */
    this.input.addEventListener("input", () => {
      this.pendingQuery = this.input.value;
      this.selected = 0;
      this.refreshRows();
    });
    this.input.addEventListener("keydown", (evt) => this.onKeyDown(evt));


    this.refresh();
  }

  refresh() {
    this.renderChips();
    this.refreshRows();
    const total = this.deps.index.entries.length;
    this.input.placeholder = t("notes.placeholder", { count: total.toLocaleString(lang === "zh" ? "zh-CN" : "en-US") });
  }

  /* One route for both a click and a keypress on a chip. While the row is being
     arranged a press is a miss, not a filter. */
  pickChip(chip) {
    if (this.reordering) return;
    const key = chip.dataset ? chip.dataset.key : chip.getAttribute("data-key");
    if (!key || key === this.category) return;
    this.category = key;
    this.selected = 0;
    this.renderChips();
    this.refreshRows();
  }

  /* The list has one tab stop, not one per row: a vault with two hundred notes
     would otherwise put two hundred stops between the page and the footer. */
  focusRow() {
    const row = this.rows[this.selected];
    if (row && row.focus) row.focus();
  }

  renderChips() {
    const chips = this.chips;
    chips.empty();
    /* A rebuild replaces the node the drag was moving; forgetting it keeps the
       next dragstart from pointing at something that is no longer in the page. */
    this.dragging = null;
    const total = this.deps.index.entries.length;
    const pinned = this.deps.index.pinnedPaths().length;
    /* The user's own folders come first: they are the places notes actually live.
       全部 / 最近 / 收藏 are ways of looking at the whole vault, so they close the
       row. Top-level folders include the empty ones, so a folder just made appears
       at once instead of waiting for a note to be filed in it. */
    const settings = this.deps.getSettings();
    const items = [];
    const folders = this.deps.index.folders().filter((folder) => folder.depth === 1);
    if (settings.noteSort === "name-desc") folders.reverse();
    for (const folder of folders) {
      items.push({ key: folder.path, label: folder.name, count: folder.count || null });
    }
    items.push(
      { key: "all", label: t("notes.all"), count: total },
      { key: "recent", label: t("notes.recent"), count: null },
      { key: "pinned", label: t("notes.pinned"), count: pinned || null }
    );
    /* A range the settings turned off is not built at all, so the row shrinks the way
       the user asked. Folders are never in this list — they have no switch. */
    const shown = items.filter((item) => {
      if (item.key === "all") return settings.showAll !== false;
      if (item.key === "recent") return settings.showRecent !== false;
      if (item.key === "pinned") return settings.showPinned !== false;
      return true;
    });
    /* Whatever was open may have just been switched off, or a folder it pointed at
       may have been renamed: land on the first thing still in the row. */
    if (!shown.some((item) => item.key === this.category)) {
      this.category = shown.length > 0 ? this.orderKeys(shown)[0].key : "all";
    }
    const ordered = this.orderKeys(shown);
    /* A chip is a button: it is the only way to change what the list shows, so it
       has to be reachable without a mouse. One listener on the row handles all of
       them — the row is rebuilt on every refresh and per-node listeners were being
       thrown away and re-made a dozen times a session. */
    const focused = document.activeElement;
    const focusedKey = focused && focused.dataset ? focused.dataset.key : null;
    for (const item of ordered) {
      const chip = chips.createEl("button", {
        cls: item.key === this.category ? "thinker-chip is-on" : "thinker-chip",
        text: item.label
      });
      chip.dataset.key = item.key;
      chip.draggable = this.reordering;
      if (this.reordering) chip.addClass("is-movable");
      if (item.count != null) chip.createSpan({ cls: "thinker-chip-count", text: String(item.count) });
      chip.addEventListener("dragstart", (evt) => {
        if (!this.reordering) {
          evt.preventDefault();
          return;
        }
        this.dragging = chip;
        chip.addClass("is-dragging");
        if (evt.dataTransfer) {
          evt.dataTransfer.effectAllowed = "move";
          try {
            evt.dataTransfer.setData("text/plain", item.key);
          } catch (e) {
            /* a browser without a data transfer is still draggable in place */
          }
        }
      });
      chip.addEventListener("dragend", () => {
        if (this.dragging) this.dragging.removeClass("is-dragging");
        this.dragging = null;
        this.persistChipOrder();
      });
    }

    /* The row was just rebuilt, so the focus that was on a chip is on a node that
       no longer exists. Put it back on the same chip by key: a keyboard user who
       changes category should not be dropped at the top of the document. */
    if (focusedKey) {
      const again = this.chips.querySelectorAll(".thinker-chip").find((node) => node.dataset.key === focusedKey);
      if (again && again.focus) again.focus();
    }

    /* The plus follows the last range instead of floating at the far right: with
       folders it ends up after the folders, without folders after 收藏. The pencil
       sits right beside it and turns the same row into something you can push
       around; the order it leaves behind is kept in the settings. */
    this.newBtn = chips.createEl("button", { cls: "thinker-new", text: "+" });
    this.newBtn.setAttribute("aria-label", t("create.title"));
    this.newBtn.setAttribute("title", t("create.title"));
    this.newBtn.addEventListener("click", () => this.openCreate());

    this.editBtn = chips.createEl("button", { cls: "thinker-new thinker-edit" });
    setIcon(this.editBtn, "pencil");
    this.editBtn.setAttribute("aria-label", t("notes.reorder"));
    this.editBtn.setAttribute("title", t("notes.reorder"));
    this.editBtn.toggleClass("is-on", this.reordering);
    this.editBtn.addEventListener("click", () => this.toggleReorder());

    chips.toggleClass("is-reordering", this.reordering);
  }

  /* Editing the row is a mode, not a gesture hidden behind a modifier: the pencil
     turns it on, the row says so, and the next click on the pencil puts it back.
     Nothing is written until a drag ends, so turning the mode on and off again
     leaves the settings untouched. */
  toggleReorder(force) {
    this.reordering = typeof force === "boolean" ? force : !this.reordering;
    if (this.dragging) {
      this.dragging.removeClass("is-dragging");
      this.dragging = null;
    }
    if (this.chips) {
      this.chips.toggleClass("is-reordering", this.reordering);
      for (const node of this.chips.querySelectorAll(".thinker-chip")) {
        node.draggable = this.reordering;
        node.toggleClass("is-movable", this.reordering);
      }
    }
    if (this.editBtn) this.editBtn.toggleClass("is-on", this.reordering);
    if (!this.reordering) this.persistChipOrder();
  }

  /* The nearest chip to the pointer wins the comparison, distance inside a row
     counted before distance between rows: with a wrapped row the drop target has
     to be the one under the cursor, not the one further along the current line. */
  chipAt(x, y) {
    if (!this.chips) return null;
    let best = null;
    let bestDist = Infinity;
    for (const node of this.chips.querySelectorAll(".thinker-chip")) {
      const rect = node.getBoundingClientRect();
      if (!rect.width && !rect.height) continue;
      const dx = x < rect.left ? rect.left - x : x > rect.right ? x - rect.right : 0;
      const dy = y < rect.top ? rect.top - y : y > rect.bottom ? y - rect.bottom : 0;
      const dist = dx + dy * 3;
      if (dist < bestDist) {
        bestDist = dist;
        best = node;
      }
    }
    return best;
  }

  onChipDragOver(evt) {
    if (!this.reordering || !this.dragging) return;
    const target = this.chipAt(evt.clientX, evt.clientY);
    if (!target || target === this.dragging) return;
    evt.preventDefault();
    if (evt.dataTransfer) evt.dataTransfer.dropEffect = "move";
    const rect = target.getBoundingClientRect();
    const before = evt.clientX < rect.left + rect.width / 2;
    if ((before ? target.previousSibling : target.nextSibling) === this.dragging) return;
    this.chips.insertBefore(this.dragging, before ? target : target.nextSibling);
  }

  persistChipOrder() {
    if (!this.chips) return;
    const keys = [];
    for (const node of this.chips.querySelectorAll(".thinker-chip")) {
      const key = node.dataset ? node.dataset.key : node.getAttribute("data-key");
      if (key) keys.push(key);
    }
    if (keys.length === 0) return;
    const settings = this.deps.getSettings();
    /* A range switched off is not in the row, but its place in the order is still
       worth keeping: written straight from the row it would be dropped here, and
       turning the range back on would then land it at the end instead of where the
       user had put it. Hidden keys hold their slot; visible ones fill the rest in the
       order the drag left them. */
    const previous = parseLines(settings.chipOrder);
    const live = new Set(keys);
    const merged = [];
    let at = 0;
    for (const key of previous) {
      if (live.has(key)) {
        if (at < keys.length) merged.push(keys[at++]);
      } else {
        merged.push(key);
      }
    }
    while (at < keys.length) merged.push(keys[at++]);
    const value = merged.join("\n");
    if (settings.chipOrder === value) return;
    settings.chipOrder = value;
    if (this.deps.saveSettings) void this.deps.saveSettings();
  }

  /* Only shown for a real folder, and only when there is something to choose
     between — a row of one option is just a second title. */
  refreshRows() {
    const settings = this.deps.getSettings();
    this.query = this.pendingQuery;
    const limit = Math.max(1, settings.listLimit || 40);
    let rows = this.deps.index.list(this.category, null, this.query, limit);
    if (settings.searchScope === "full" && this.query.trim().length >= 2) {
      const seen = new Set(rows.map((entry) => entry.path));
      const hits = this.deps.index.searchText(this.query).filter((hit) => !seen.has(hit.entry.path));
      for (const hit of hits.slice(0, 8)) rows.push({ ...hit.entry, snippet: hit.snippet });
    }
    this.results = rows;
    if (this.selected >= rows.length) this.selected = Math.max(0, rows.length - 1);
    /* A fresh list has no keyboard cursor: the tint only appears once a key moves it. */
    this.keyboardNav = false;
    this.renderList();
  }

  /* Folders are the headings of the list and notes sit under them. Level is a size,
     not a glyph: a top folder is the largest text on the panel, its child steps
     down, and every note keeps one column at the same left edge. */
  renderList() {
    const list = this.list;
    list.empty();
    this.rows = [];
    this.rowEntries = [];
    if (this.results.length === 0) {
      list.createDiv({ cls: "thinker-empty", text: t("notes.empty") });
      return;
    }

    const pinnedSet = new Set(this.deps.index.pinnedPaths());
    const byDir = new Map();
    for (const entry of this.results) {
      const key = entry.parent || "";
      const bucket = byDir.get(key) || [];
      bucket.push(entry);
      byDir.set(key, bucket);
    }

    const children = new Map();
    for (const dir of byDir.keys()) {
      if (!dir) continue;
      const parts = dir.split("/");
      for (let i = 1; i <= parts.length; i++) {
        const path = parts.slice(0, i).join("/");
        const parent = path.includes("/") ? path.slice(0, path.lastIndexOf("/")) : "";
        if (!children.has(parent)) children.set(parent, new Set());
        if (!children.has(path)) children.set(path, new Set());
        children.get(parent).add(path);
      }
    }

    const virtual = this.category === "all" || this.category === "recent" || this.category === "pinned";
    const base = virtual ? "" : this.category;
    /* In 全部 the list is just the files: no folder headings, no size ladder. The
       ladder belongs to a category, where it is the only thing carrying structure. */
    const showFolders = !virtual;
    /* 收藏 is flat like the other two, but it is a hand-picked shortlist: the note
       is there because it was chosen, not because it turned up in a sweep. */
    const showPath = this.category === "all" || this.category === "recent";
    /* A row that lost its second line has to lose the height that line was
       holding, or the list reads as gaps with names in them. The two ranges that
       keep the path, and any row that still carries a search snippet, keep the
       taller row. */
    list.toggleClass("is-compact", !showPath);

    const addRow = (entry) => {
      const row = list.createDiv({ cls: "thinker-note" });
      row.setAttribute("role", "button");
      row.setAttribute("tabindex", "-1");
      if (pinnedSet.has(entry.path)) row.addClass("is-pinned");
      const main = row.createDiv({ cls: "thinker-note-main" });
      main.createDiv({ cls: "thinker-note-title", text: entry.title || t("notes.untitled") });
      /* 全部 and 最近 are the two ranges whose rows have no folder heading above
         them, so there the row carries its own address. In a folder the heading
         already says where the note lives and a second line is noise. A full-text
         hit keeps its snippet: that is the note's own words, not its address. */
      const meta = entry.snippet ? entry.snippet : showPath ? entry.parent || t("notes.root") : "";
      if (meta) {
        main.createDiv({ cls: "thinker-note-meta", text: meta });
        row.addClass("is-two-line");
      }
      row.createSpan({ cls: "thinker-note-when", text: relativeTime(entry.mtime) });
      const index = this.rows.length;
      row.dataset.idx = String(index);
      this.rows.push(row);
      this.rowEntries.push(entry);
    };

    if (!showFolders) {
      for (const entry of this.results) addRow(entry);
      this.markSelection();
      return;
    }

    const emitNotes = (dir) => {
      for (const entry of byDir.get(dir) || []) addRow(entry);
    };

    const descending = this.deps.getSettings().noteSort === "name-desc";
    const walk = (dir, depth) => {
      emitNotes(dir);
      const kids = [...(children.get(dir) || [])].sort((a, b) =>
        descending ? b.localeCompare(a, "zh") : a.localeCompare(b, "zh")
      );
      for (const kid of kids) {
        const level = Math.min(4, depth + 1);
        const head = list.createDiv({ cls: "thinker-folder is-level-" + level });
        head.createSpan({ cls: "thinker-folder-name", text: kid.split("/").pop() });
        head.createSpan({ cls: "thinker-folder-count", text: String((byDir.get(kid) || []).length) });
        head.setAttribute("title", kid);
        walk(kid, depth + 1);
      }
    };
    walk(base, 0);
    this.markSelection();
  }

  /* The tint belongs to the arrow keys, not to the panel. A row is chosen before any
     key is pressed — the first one — and a list that opens with its top row filled in
     reads as a block of colour sitting above an otherwise empty column. Nothing is
     painted until the keyboard is actually used, and Enter still opens the first row
     because the index starts at zero either way. */
  markSelection() {
    (this.rows || []).forEach((row, index) => {
      if (!row || !row.toggleClass) return;
      row.toggleClass("is-selected", this.keyboardNav === true && index === this.selected);
      /* Roving tab stop: the whole list is one stop, and the arrow keys move it
         with the cursor. */
      row.setAttribute("tabindex", index === this.selected ? "0" : "-1");
    });
  }

  onKeyDown(evt) {
    if (evt.key === "ArrowDown") {
      evt.preventDefault();
      this.move(1);
    } else if (evt.key === "ArrowUp") {
      evt.preventDefault();
      this.move(-1);
    } else if (evt.key === "Enter") {
      evt.preventDefault();
      if (evt.ctrlKey || evt.metaKey) {
        void this.createFromQuery();
        return;
      }
      const entry = this.rowEntries[this.selected];
      if (entry) this.openEntry(entry, evt.altKey);
      else void this.createFromQuery();
    } else if (evt.key === "Escape") {
      this.input.value = "";
      this.pendingQuery = "";
      this.selected = 0;
      this.refreshRows();
    }
  }

  move(delta) {
    if (this.rows.length === 0) return;
    /* The cursor starts at zero so Enter opens the first row, which means the first
       arrow press has to land on a row rather than step off it: down from before the
       list lands on the first, up lands on the last. */
    const from = this.keyboardNav === true ? this.selected : delta > 0 ? -1 : 0;
    this.keyboardNav = true;
    this.selected = (from + delta + this.rows.length) % this.rows.length;
    this.markSelection();
    const node = this.rows[this.selected];
    if (node && node.scrollIntoView) node.scrollIntoView({ block: "nearest" });
  }

  openEntry(entry, newTab) {
    const file = entry.file || this.deps.app.vault.getAbstractFileByPath(entry.path);
    if (!file) return;
    void openNote(this.deps.app, file, { newTab: newTab === true });
  }

  openMenu(entry, evt) {
    const app = this.deps.app;
    const file = entry.file || app.vault.getAbstractFileByPath(entry.path);
    if (!file) return;
    const menu = new Menu();
    menu.addItem((item) =>
      item
        .setTitle(t("notes.openNewTab"))
        .setIcon("file-plus")
        .onClick(() => this.openEntry(entry, true))
    );
    menu.addItem((item) =>
      item
        .setTitle(t("notes.rename"))
        .setIcon("pencil")
        .onClick(() => {
          new RenameModal(app, file, () => this.refresh()).open();
        })
    );
    menu.addSeparator();
    menu.addItem((item) =>
      item
        .setTitle(t("notes.copyPath"))
        .setIcon("link")
        .onClick(() => void navigator.clipboard.writeText(entry.path))
    );
    menu.addItem((item) =>
      item
        .setTitle(t("notes.delete"))
        .setIcon("trash")
        .onClick(async () => {
          try {
            await app.fileManager.trashFile(file);
            new Notice(t("notes.deleted"));
          } catch (e) {
            new Notice(String(e && e.message ? e.message : e));
          }
        })
    );
    menu.showAtMouseEvent(evt);
  }

  /* The plus asks two things the search field cannot: which kind, and where. Both
     are answered in one dialog, so a new note does not land in the wrong place
     just because a filter happened to be on. */
  openCreate() {
    const virtual = this.category === "all" || this.category === "recent" || this.category === "pinned";
    const roots = parseLines(this.deps.getSettings().indexRoots);
    const dir = virtual ? roots[0] || "" : this.category;
    new CreateModal(
      { app: this.deps.app, index: this.deps.index },
      { name: (this.input.value || "").trim(), dir },
      (result) => {
        this.input.value = "";
        this.pendingQuery = "";
        if (result.kind === "folder") this.category = result.path;
        this.renderChips();
        this.refreshRows();
      }
    ).open();
  }

  async createFromQuery() {
    const app = this.deps.app;
    const name = (this.input.value || "").trim() || t("notes.untitled");
    const settings = this.deps.getSettings();
    const isVirtual = this.category === "all" || this.category === "recent" || this.category === "pinned";
    const roots = parseLines(settings.indexRoots);
    const folder = isVirtual ? roots[0] || "" : this.category;
    let path = folder ? `${folder}/${name}.md` : `${name}.md`;
    let counter = 2;
    while (app.vault.getAbstractFileByPath(path)) {
      path = folder ? `${folder}/${name} ${counter}.md` : `${name} ${counter}.md`;
      counter++;
    }
    try {
      if (folder && !app.vault.getAbstractFileByPath(folder)) await app.vault.createFolder(folder);
      const file = await app.vault.create(path, "");
      this.input.value = "";
      this.pendingQuery = "";
      await openNote(app, file);
    } catch (e) {
      new Notice(String(e && e.message ? e.message : e));
    }
  }
}

/* ----------------------------------------------------------- 7  TimerPanel */

const RING_RADIUS = 44;
const RING_LENGTH = 2 * Math.PI * RING_RADIUS;
/* The status line's meter, r=9 in a 24-unit box. */
const METER_RADIUS = 9;
const METER_LENGTH = 2 * Math.PI * METER_RADIUS;
/* One lap of the stopwatch ring is an hour. A day is six, so a ring drawn against
   the goal moves a degree every eight minutes and reads as stuck; an hour moves it
   a degree every ten seconds, which is the feedback a running timer owes you. */
const WATCH_LAP_SEC = 3600;

class TimerPanel {
  constructor(root, deps) {
    this.root = root;
    this.deps = deps;
    this.lastOffset = -1;
  }

  render() {
    const root = this.root;
    root.empty();
    root.addClass("thinker-timer");

    this.phaseEl = root.createEl("button", { cls: "thinker-phase" });
    this.phaseEl.addEventListener("click", () => {
      const engine = this.deps.engine;
      if (engine.state !== "idle") return;
      engine.setMode(engine.mode === "pomodoro" ? "stopwatch" : "pomodoro");
    });

    const gauge = root.createDiv({ cls: "thinker-gauge" });
    const svg = svgEl("svg", { viewBox: "0 0 100 100", class: "thinker-ring" });
    const track = svgEl("circle", { cx: 50, cy: 50, r: RING_RADIUS, class: "thinker-ring-track" });
    this.arc = svgEl("circle", {
      cx: 50,
      cy: 50,
      r: RING_RADIUS,
      class: "thinker-ring-arc",
      transform: "rotate(-90 50 50)"
    });
    this.arc.setAttribute("stroke-dasharray", String(RING_LENGTH));
    this.arc.setAttribute("stroke-dashoffset", String(RING_LENGTH));
    svg.appendChild(track);
    svg.appendChild(this.arc);
    gauge.appendChild(svg);

    /* The digits are the control, as they have always been: a press starts the
       session, the next press ends it. Pause and end sit under the dial and only
       exist while a session does. */
    this.timeEl = gauge.createDiv({ cls: "thinker-time", text: "00:00" });
    this.timeEl.setAttribute("role", "button");
    this.timeEl.setAttribute("tabindex", "0");
    this.timeEl.addEventListener("click", () => this.toggle());
    this.timeEl.addEventListener("keydown", (evt) => {
      if (evt.key === "Enter" || evt.key === " ") {
        evt.preventDefault();
        this.toggle();
      }
    });

    this.actions = root.createDiv({ cls: "thinker-timer-actions" });
    this.pauseBtn = this.actions.createEl("button", { cls: "thinker-mini" });
    this.pauseBtn.addEventListener("click", () => {
      const engine = this.deps.engine;
      if (engine.state === "running") engine.pause();
      else if (engine.state === "paused") engine.resume();
    });
    this.stopBtn = this.actions.createEl("button", { cls: "thinker-mini" });
    this.stopBtn.addEventListener("click", () => this.deps.engine.stop());

    this.refresh();
  }

  toggle() {
    const engine = this.deps.engine;
    if (engine.state === "idle") engine.start();
    else engine.stop();
  }

  refresh() {
    const engine = this.deps.engine;
    const phaseKey = engine.mode === "pomodoro" && engine.phase !== "focus" ? `timer.${engine.phase}` : `timer.${engine.mode}`;
    this.root.dataset.state = engine.state;
    this.root.dataset.phase = engine.phase;
    this.phaseEl.setText(t(phaseKey));
    this.phaseEl.toggleClass("is-switch", engine.state === "idle");
    const idle = engine.state === "idle";
    this.actions.toggleClass("is-off", idle);
    this.pauseBtn.setText(t(engine.state === "paused" ? "timer.resume" : "timer.pause"));
    this.stopBtn.setText(t("timer.stop"));
    this.timeEl.setAttribute("aria-label", t(idle ? "timer.start" : "timer.stop"));
    this.onTick();
  }

  /* Both modes draw one arc, and in both it is about the session, because that is
     the thing that is moving. Pomodoro counts the block down; the stopwatch laps
     every hour and starts a new lap, which is the only honest way to put an
     unbounded duration inside a circle. */
  onTick() {
    const engine = this.deps.engine;
    const settings = this.deps.getSettings();
    const snapshot = engine.snapshot();
    let value;
    let ratio;
    if (snapshot.mode === "pomodoro") {
      const target = snapshot.targetSec || Math.max(1, settings.focusMinutes) * 60;
      value = snapshot.state === "idle" ? target : snapshot.remainingSec;
      ratio = Math.max(0, Math.min(1, value / target));
    } else {
      value = snapshot.elapsedSec;
      ratio = (snapshot.elapsedSec % WATCH_LAP_SEC) / WATCH_LAP_SEC;
    }
    this.timeEl.setText(formatClock(value));
    const offset = RING_LENGTH * (1 - ratio);
    if (Math.abs(offset - this.lastOffset) > 0.05) {
      this.lastOffset = offset;
      this.arc.setAttribute("stroke-dashoffset", String(offset));
    }
  }
}

/* -------------------------------------------------------- 8  CalendarPanel */

class CalendarPanel {
  constructor(root, deps) {
    this.root = root;
    this.deps = deps;
    const today = new Date();
    this.year = today.getFullYear();
    this.month = today.getMonth() + 1;
    this.monthData = new Map();
    this.token = 0;
  }

  render() {
    this.renderShell();
    void this.refresh();
  }

  /* The shell is separate from the data so a host that rebuilds its own DOM can put
     the same calendar back on screen without reading a month of files again. */
  renderShell() {
    const root = this.root;
    root.empty();
    root.addClass("thinker-cal");

    const nav = root.createDiv({ cls: "thinker-cal-nav" });
    const prev = nav.createEl("button", { cls: "thinker-cal-btn", text: "‹" });
    prev.setAttribute("aria-label", t("cal.prev"));
    prev.addEventListener("click", () => this.shift(-1));
    this.label = nav.createSpan({ cls: "thinker-cal-label" });
    const next = nav.createEl("button", { cls: "thinker-cal-btn", text: "›" });
    next.setAttribute("aria-label", t("cal.next"));
    next.addEventListener("click", () => this.shift(1));

    const weekdays = root.createDiv({ cls: "thinker-cal-weekdays" });
    for (const name of weekdayLabels(this.deps.getSettings().weekStart)) {
      weekdays.createSpan({ cls: "thinker-cal-weekday", text: name });
    }
    this.grid = root.createDiv({ cls: "thinker-cal-grid" });
    this.label.setText(t("cal.title", { year: this.year, month: this.month }));
  }

  shift(delta) {
    this.month += delta;
    if (this.month < 1) {
      this.month = 12;
      this.year -= 1;
    } else if (this.month > 12) {
      this.month = 1;
      this.year += 1;
    }
    this.label.setText(t("cal.title", { year: this.year, month: this.month }));
    void this.refresh();
  }

  async refresh() {
    const token = ++this.token;
    this.label.setText(t("cal.title", { year: this.year, month: this.month }));
    this.monthData = await this.deps.storage.getMonth(this.year, this.month);
    if (token !== this.token) return;
    this.paint();
  }

  paint() {
    const grid = this.grid;
    grid.empty();
    const settings = this.deps.getSettings();
    const cells = monthGrid(this.year, this.month, settings.weekStart);
    const today = todayKey();
    const goalSec = Math.max(1, settings.dailyGoalMinutes) * 60;
    for (const key of cells) {
      if (!key) {
        grid.createDiv({ cls: "thinker-day is-blank" });
        continue;
      }
      const info = this.monthData.get(key);
      const day = grid.createEl("button", { cls: "thinker-day" });
      if (key === today) day.addClass("is-today");
      if (info && info.focusSec > 0) {
        /* The daily goal is the top of the scale, not the busiest day of the month.
           Anchored to the busiest day, one long session reset every other cell to
           its palest step; anchored to the goal, a full day always looks like a
           full day and anything past it keeps that strength. */
        const level = Math.max(1, Math.min(4, Math.ceil((info.focusSec / goalSec) * 4)));
        day.addClass("thinker-heat-" + level);
        day.setAttribute("aria-label", t("cal.heat", { count: info.count }));
        day.setAttribute("title", key + " · " + formatDuration(info.focusSec));
      }
      day.createSpan({ cls: "thinker-day-num", text: String(Number(key.slice(-2))) });
      day.addEventListener("click", () => {
        new DayModal(this.deps, key, () => {
          void this.refresh();
          this.deps.onRecordsChanged();
        }).open();
      });
    }
  }
}

/* -------------------------------------------------------------- 9  HomeView */

class HomeView extends ItemView {
  constructor(leaf, deps) {
    super(leaf);
    this.deps = deps;
    this.notes = null;
    this.timer = null;
    this.calendar = null;
    this.lastClock = "";
    this.todaySec = 0;
    this.dayKey = todayKey();
    this.lastMeterSec = -1;
  }

  getViewType() {
    return VIEW_TYPE;
  }

  getDisplayText() {
    return "Thinker";
  }

  getIcon() {
    return "square-chart-gantt";
  }

  async onOpen() {
    this.contentEl.addClass("thinker-home");
    this.contentEl.dataset.build = BUILD;
    this.build();
    await this.refreshToday();
  }

  async onClose() {
    this.contentEl.empty();
    this.notes = null;
    this.timer = null;
    this.calendar = null;
  }

  build() {
    const root = this.contentEl;
    root.empty();
    const page = root.createDiv({ cls: "thinker-page" });

    /* The status line answers one question in two halves: what time it is, and how
       much of the day has already gone into work. They used to live at opposite
       ends of the page, one as the largest type on screen and the other as a
       footnote under a circle. */
    const bar = page.createDiv({ cls: "thinker-statusbar" });
    const clock = bar.createDiv({ cls: "thinker-clock" });
    this.timeEl = clock.createDiv({ cls: "thinker-time-lg" });
    this.dateEl = clock.createSpan({ cls: "thinker-date" });

    const meter = bar.createDiv({ cls: "thinker-meter" });
    this.meterEl = meter;
    meter.setAttribute("role", "img");
    const meterSvg = svgEl("svg", { viewBox: "0 0 24 24", class: "thinker-meter-ring" });
    const meterTrack = svgEl("circle", { cx: 12, cy: 12, r: METER_RADIUS, class: "thinker-meter-track" });
    this.meterArc = svgEl("circle", {
      cx: 12,
      cy: 12,
      r: METER_RADIUS,
      class: "thinker-meter-arc",
      transform: "rotate(-90 12 12)"
    });
    this.meterArc.setAttribute("stroke-dasharray", String(METER_LENGTH));
    this.meterArc.setAttribute("stroke-dashoffset", String(METER_LENGTH));
    meterSvg.appendChild(meterTrack);
    meterSvg.appendChild(this.meterArc);
    meter.appendChild(meterSvg);
    const meterCopy = meter.createDiv({ cls: "thinker-meter-copy" });
    this.meterValue = meterCopy.createSpan({ cls: "thinker-meter-value" });
    this.meterLabel = meterCopy.createSpan({ cls: "thinker-meter-label" });

    const grid = page.createDiv({ cls: "thinker-grid" });
    this.grid = grid;
    this.applySide();

    const notesBox = grid.createDiv({ cls: "thinker-notes-box" });
    const aside = grid.createDiv({ cls: "thinker-aside" });
    const timerBox = aside.createDiv({ cls: "thinker-card thinker-timer-box" });
    const calBox = aside.createDiv({ cls: "thinker-card thinker-cal-box" });

    this.notes = new NotePanel(notesBox, {
      app: this.app,
      index: this.deps.index,
      getSettings: this.deps.getSettings,
      saveSettings: this.deps.saveSettings
    });
    this.notes.render();

    this.timer = new TimerPanel(timerBox, {
      engine: this.deps.engine,
      getSettings: this.deps.getSettings
    });
    this.timer.render();

    this.calendar = new CalendarPanel(calBox, {
      app: this.app,
      storage: this.deps.storage,
      getSettings: this.deps.getSettings,
      onRecordsChanged: () => {
        void this.refreshToday();
        this.deps.onRecordsChanged();
      }
    });
    this.calendar.render();

    this.updateClock();
    this.updateMeter(true);
  }

  applySide() {
    if (!this.grid) return;
    this.grid.toggleClass("is-swapped", this.deps.getSettings().side === "notes-right");
  }

  updateClock() {
    const now = new Date();
    const settings = this.deps.getSettings();
    /* Midnight is a data change, not just a text change: the day the page is
       reporting on has become a different day, so the total has to be re-read
       instead of carried over into the new date. */
    const key = todayKey();
    if (key !== this.dayKey) {
      this.dayKey = key;
      this.lastClock = "";
      void this.refreshToday();
    }
    const value = settings.showSeconds
      ? `${pad2(now.getHours())}:${pad2(now.getMinutes())}:${pad2(now.getSeconds())}`
      : `${pad2(now.getHours())}:${pad2(now.getMinutes())}`;
    if (value === this.lastClock) return;
    this.lastClock = value;
    if (this.timeEl) this.timeEl.setText(value);
    const weekday = weekdayLabels(1)[(now.getDay() + 6) % 7];
    if (this.dateEl) {
      this.dateEl.setText(
        lang === "zh"
          ? `周${weekday} · ${now.getMonth() + 1} 月 ${now.getDate()} 日`
          : `${weekday} · ${now.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
      );
    }
  }

  /* The meter is the same quantity as the ring, at one fifth the size: today
     against the goal, counting the session that is running. It repaints only when
     the second has actually moved. */
  updateMeter(force) {
    const settings = this.deps.getSettings();
    const goalSec = Math.max(1, settings.dailyGoalMinutes) * 60;
    const daySec = Math.round(dayFocusSec(this.todaySec, this.deps.engine));
    if (!force && daySec === this.lastMeterSec) return;
    this.lastMeterSec = daySec;
    const offset = METER_LENGTH * (1 - dayRatio(daySec, goalSec));
    if (this.meterArc) this.meterArc.setAttribute("stroke-dashoffset", String(offset));
    if (this.meterValue) this.meterValue.setText(formatDuration(daySec));
    if (this.meterLabel) this.meterLabel.setText(`/ ${formatDuration(goalSec)}`);
    if (this.meterEl) this.meterEl.setAttribute("aria-label", t("clock.focusToday", { duration: formatDuration(daySec) }));
  }

  async refreshToday() {
    const key = todayKey();
    this.dayKey = key;
    const records = await this.deps.storage.getDay(key);
    this.todaySec = sumFocusDuration(records);
    this.updateMeter(true);
  }

  onTick() {
    this.updateClock();
    this.updateMeter(false);
    if (this.timer) this.timer.onTick();
  }

  refreshAll() {
    this.applySide();
    if (this.notes) this.notes.refresh();
    if (this.timer) this.timer.refresh();
    if (this.calendar) void this.calendar.refresh();
  }

  refreshNotes() {
    if (this.notes) this.notes.refresh();
  }

  refreshTimer() {
    if (this.timer) this.timer.refresh();
    void this.refreshToday();
  }
}

/* ---------------------------------------------------------- 10  Diary files */

function diaryConfig(app, settings) {
  let folder = normalizeFolder(settings.dailyNotesFolder);
  let format = settings.dailyNotesFormat || "";
  let template = "";
  if (!folder || !format) {
    try {
      const core = app.internalPlugins && app.internalPlugins.getPluginById
        ? app.internalPlugins.getPluginById("daily-notes")
        : null;
      const options = core && core.instance && core.instance.options ? core.instance.options : null;
      if (options) {
        if (!folder && options.folder) folder = normalizeFolder(options.folder);
        if (!format && options.format) format = options.format;
        if (options.template) template = options.template;
      }
    } catch (e) {
      /* the core plugin may be off */
    }
  }
  return { folder, format: format || "YYYY-MM-DD", template };
}

function diaryPathFor(config, dayKey) {
  const date = parseDateKey(dayKey);
  const name = config.format
    .replace(/YYYY/g, String(date.getFullYear()))
    .replace(/MM/g, pad2(date.getMonth() + 1))
    .replace(/DD/g, pad2(date.getDate()));
  return config.folder ? `${config.folder}/${name}.md` : `${name}.md`;
}

async function openDiary(app, config, dayKey) {
  const path = diaryPathFor(config, dayKey);
  const existing = app.vault.getAbstractFileByPath(path);
  if (existing) {
    await openNote(app, existing);
    return;
  }
  let body = "";
  if (config.template) {
    const templateFile = app.vault.getAbstractFileByPath(config.template);
    if (templateFile) {
      try {
        body = await app.vault.read(templateFile);
      } catch (e) {
        body = "";
      }
    }
  }
  if (config.folder) {
    const parts = config.folder.split("/");
    let walked = "";
    for (const part of parts) {
      walked = walked ? `${walked}/${part}` : part;
      if (!app.vault.getAbstractFileByPath(walked)) {
        try {
          await app.vault.createFolder(walked);
        } catch (e) {
          /* created in parallel */
        }
      }
    }
  }
  const file = await app.vault.create(path, body);
  await openNote(app, file);
}

/* --------------------------------------------------------------- 11  Modals */

/* Creates every folder on the way to a path. vault.createFolder does not make the
   parents, and a nested destination is the ordinary case here. */
async function ensureFolder(app, path) {
  if (!path) return;
  const parts = path.split("/");
  for (let i = 1; i <= parts.length; i++) {
    const part = parts.slice(0, i).join("/");
    if (!app.vault.getAbstractFileByPath(part)) await app.vault.createFolder(part);
  }
}

/* One dialog for both new things. A note and a folder differ in one field, so the
   type is a two-word switch at the top; where it goes is picked from the vault's
   own outline, with the level carried by size instead of indentation. */
class CreateModal extends Modal {
  constructor(deps, options, onDone) {
    super(deps.app);
    this.deps = deps;
    this.kind = "note";
    this.name = (options && options.name) || "";
    this.dir = (options && options.dir) || "";
    this.onDone = onDone;
    this.picks = [];
  }

  onOpen() {
    this.contentEl.addClass("thinker-modal");
    this.modalEl.addClass("thinker-modal");
    this.modalEl.addClass("thinker-create-modal");
    this.titleEl.setText(t("create.title"));
    this.render();
  }

  onClose() {
    this.contentEl.empty();
  }

  render() {
    const content = this.contentEl;
    content.empty();
    this.picks = [];

    const kinds = content.createDiv({ cls: "thinker-create-kinds" });
    for (const kind of ["note", "folder"]) {
      const btn = kinds.createEl("button", {
        cls: kind === this.kind ? "thinker-create-kind is-on" : "thinker-create-kind",
        text: t(kind === "note" ? "create.note" : "create.folder")
      });
      btn.addEventListener("click", () => {
        if (this.kind === kind) return;
        this.kind = kind;
        this.render();
      });
    }

    const field = content.createDiv({ cls: "thinker-create-field" });
    const input = field.createEl("input", {
      cls: "thinker-create-name",
      attr: {
        type: "text",
        spellcheck: "false",
        autocomplete: "off",
        placeholder: this.kind === "note" ? t("create.noteName") : t("create.folderName")
      }
    });
    input.value = this.name;
    input.addEventListener("input", () => {
      this.name = input.value;
    });
    input.addEventListener("keydown", (evt) => {
      if (evt.key === "Enter") {
        evt.preventDefault();
        void this.submit();
      }
    });
    this.input = input;

    content.createDiv({ cls: "thinker-create-label", text: t("create.where") });
    const tree = content.createDiv({ cls: "thinker-pick" });
    let selected = null;
    const items = [{ path: "", name: t("notes.root"), depth: 1 }];
    for (const folder of this.deps.index.folders()) {
      items.push({ path: folder.path, name: folder.name, depth: folder.depth });
    }
    for (const item of items) {
      const level = Math.min(3, Math.max(1, item.depth));
      const row = tree.createDiv({
        cls: this.dir === item.path ? "thinker-pick-row is-on is-level-" + level : "thinker-pick-row is-level-" + level
      });
      row.setAttribute("title", item.path || t("notes.root"));
      const label = row.createSpan({ cls: "thinker-pick-name", text: item.name });
      row.addEventListener("click", () => this.selectDir(item.path));
      this.picks.push({ row, label, path: item.path });
      if (this.dir === item.path) selected = row;
    }

    const actions = content.createDiv({ cls: "thinker-create-actions" });
    const cancel = actions.createEl("button", { cls: "thinker-day-btn", text: t("modal.cancel") });
    cancel.addEventListener("click", () => this.close());
    const ok = actions.createEl("button", { cls: "thinker-day-btn is-accent", text: t("create.make") });
    ok.addEventListener("click", () => void this.submit());

    this.selectDir(this.dir);
    input.focus();
    const end = input.value.length;
    if (input.setSelectionRange) input.setSelectionRange(end, end);
    /* The chosen folder can sit far down a long outline; bring it into view so the
       dialog opens showing where the note is about to land. */
    if (selected && selected.scrollIntoView) selected.scrollIntoView({ block: "nearest" });
  }

  /* The chosen row is marked three ways on purpose: the class drives the shared
     look, the inline colour survives any selector a theme might throw at it, and
     the marker runs down the left edge so the state reads at a glance. Toggling
     through classList.add / remove rather than the Obsidian helper, because this
     ran as a silent no-op once already. */
  selectDir(path) {
    this.dir = path;
    for (const pick of this.picks) {
      const on = pick.path === path;
      if (pick.row && pick.row.classList) {
        if (on) pick.row.classList.add("is-on");
        else pick.row.classList.remove("is-on");
      }
    }
  }

  async submit() {
    const app = this.deps.app;
    const name = String(this.name || "").trim();
    if (!name) {
      if (this.input) this.input.focus();
      return;
    }
    const dir = this.dir;
    try {
      if (this.kind === "folder") {
        const path = dir ? dir + "/" + name : name;
        if (app.vault.getAbstractFileByPath(path)) {
          new Notice(t("create.exists"));
          return;
        }
        await ensureFolder(app, path);
        this.close();
        if (this.onDone) this.onDone({ kind: "folder", path });
        return;
      }

      await ensureFolder(app, dir);
      let path = dir ? dir + "/" + name + ".md" : name + ".md";
      let counter = 2;
      while (app.vault.getAbstractFileByPath(path)) {
        path = dir ? dir + "/" + name + " " + counter + ".md" : name + " " + counter + ".md";
        counter += 1;
      }
      const file = await app.vault.create(path, "");
      this.close();
      if (this.onDone) this.onDone({ kind: "note", path, file });
      await openNote(app, file);
    } catch (error) {
      new Notice(String(error && error.message ? error.message : error));
    }
  }
}



class RenameModal extends Modal {
  constructor(app, file, onDone) {
    super(app);
    this.file = file;
    this.onDone = onDone;
    this.value = file.basename;
  }

  onOpen() {
    this.contentEl.addClass("thinker-modal");
    this.titleEl.setText(t("notes.renameTitle"));
    new Setting(this.contentEl).setName(t("notes.rename")).addText((text) => {
      text.setValue(this.value);
      text.onChange((value) => {
        this.value = value;
      });
      text.inputEl.focus();
      text.inputEl.select();
    });
    new Setting(this.contentEl).addButton((btn) =>
      btn.setButtonText(t("modal.save")).setCta().onClick(() => void this.save())
    );
  }

  async save() {
    const name = this.value.trim();
    if (!name || name === this.file.basename) {
      this.close();
      return;
    }
    const folder = this.file.parent && this.file.parent.path !== "/" ? this.file.parent.path : "";
    const path = folder ? `${folder}/${name}.md` : `${name}.md`;
    try {
      await this.app.fileManager.renameFile(this.file, path);
      if (this.onDone) this.onDone();
    } catch (e) {
      new Notice(String(e && e.message ? e.message : e));
    }
    this.close();
  }

  onClose() {
    this.contentEl.empty();
  }
}

class DayModal extends Modal {
  constructor(deps, dayKey, onChanged) {
    super(deps.app);
    this.deps = deps;
    this.dayKey = dayKey;
    this.onChanged = onChanged;
  }

  async onOpen() {
    this.modalEl.addClass("thinker-day-modal");
    this.modalEl.addClass("thinker-modal");
    this.titleEl.setText(this.dayKey);
    await this.render();
  }

  async render() {
    const content = this.contentEl;
    content.empty();
    const actions = content.createDiv({ cls: "thinker-day-actions" });
    const addFocus = actions.createEl("button", { cls: "thinker-day-btn", text: t("cal.add") });
    addFocus.addEventListener("click", () => this.openRecord({ kind: "focus" }));
    const addRest = actions.createEl("button", { cls: "thinker-day-btn", text: t("cal.addRest") });
    addRest.addEventListener("click", () => this.openRecord({ kind: "rest" }));

    const config = diaryConfig(this.app, this.deps.getSettings());
    const diaryPath = diaryPathFor(config, this.dayKey);
    const exists = this.app.vault.getAbstractFileByPath(diaryPath) !== null;
    const diaryBtn = actions.createEl("button", {
      cls: "thinker-day-btn is-accent",
      text: exists ? t("cal.openDiary") : t("cal.createDiary")
    });
    diaryBtn.addEventListener("click", () => {
      void openDiary(this.app, config, this.dayKey);
      this.close();
    });

    const records = visibleRecords(await this.deps.storage.getDay(this.dayKey));
    if (records.length === 0) {
      content.createDiv({ cls: "thinker-empty", text: t("cal.empty") });
      return;
    }
    const focusSec = sumFocusDuration(records);
    const restSec = sumRestDuration(records);
    const total = content.createDiv({ cls: "thinker-day-total" });
    total.setText(t("cal.dayTotal", { duration: formatDuration(focusSec) }));
    if (restSec > 0) total.createSpan({ cls: "thinker-day-rest", text: ` · ${formatDuration(restSec)}` });

    const list = content.createDiv({ cls: "thinker-sessions" });
    for (const record of sortRecords(records)) this.renderRow(list, record);
  }

  renderRow(list, record) {
    const row = list.createDiv({ cls: record.kind === "rest" ? "thinker-session is-rest" : "thinker-session" });
    const info = row.createDiv({ cls: "thinker-session-info" });
    info.createSpan({ cls: "thinker-session-range", text: `${clockOf(record.start)} – ${clockOf(record.end)}` });
    const bits = [formatDuration(record.durationSec)];
    if (record.kind === "rest") bits.push(t("record.rest"));
    else if (record.mode === "stopwatch") bits.push(t("timer.stopwatch"));
    if (record.tag) bits.push(record.tag);
    if (record.kind !== "rest" && record.completed === false) bits.push("·");
    info.createSpan({ cls: "thinker-session-meta", text: bits.filter((bit) => bit !== "·").join(" · ") });

    const actions = row.createDiv({ cls: "thinker-session-actions" });
    const edit = actions.createEl("button", { cls: "thinker-icon-btn" });
    setIcon(edit, "pencil");
    edit.addEventListener("click", () => this.openRecord({ existing: record }));
    const del = actions.createEl("button", { cls: "thinker-icon-btn is-danger" });
    setIcon(del, "trash");
    let armed = false;
    del.addEventListener("click", async () => {
      if (!armed) {
        armed = true;
        del.addClass("is-armed");
        del.setText("?");
        window.setTimeout(() => {
          armed = false;
          del.removeClass("is-armed");
          del.setText("");
          setIcon(del, "trash");
        }, 3000);
        return;
      }
      await this.deps.storage.deleteRecord(this.dayKey, record.id);
      if (this.onChanged) this.onChanged();
      await this.render();
    });
  }

  openRecord(options) {
    new RecordModal(this.deps, {
      dayKey: this.dayKey,
      kind: options.kind,
      existing: options.existing,
      onChanged: () => {
        if (this.onChanged) this.onChanged();
        void this.render();
      }
    }).open();
  }

  onClose() {
    this.contentEl.empty();
  }
}

class RecordModal extends Modal {
  constructor(deps, options) {
    super(deps.app);
    this.deps = deps;
    this.dayKey = options.dayKey;
    this.kind = options.existing ? options.existing.kind : options.kind || "focus";
    this.existing = options.existing || null;
    this.onChanged = options.onChanged;
    const base = this.existing || null;
    const start = base ? new Date(base.start) : new Date();
    if (!base) start.setSeconds(0, 0);
    this.startTime = `${pad2(start.getHours())}:${pad2(start.getMinutes())}`;
    this.minutes = base ? Math.max(1, Math.round(base.durationSec / 60)) : 25;
    this.tag = base && base.tag ? base.tag : "";
    this.note = base && base.note ? base.note : "";
  }

  onOpen() {
    this.contentEl.addClass("thinker-modal");
    this.titleEl.setText(t("record.title"));

    new Setting(this.contentEl).setName(t("record.type")).addDropdown((drop) => {
      drop.addOption("focus", t("record.focus"));
      drop.addOption("rest", t("record.rest"));
      drop.setValue(this.kind);
      drop.onChange((value) => {
        this.kind = value;
      });
    });

    new Setting(this.contentEl).setName(t("record.start")).addText((text) => {
      text.setValue(this.startTime);
      text.setPlaceholder("09:30");
      text.onChange((value) => {
        this.startTime = value;
      });
    });

    new Setting(this.contentEl).setName(t("record.minutes")).addText((text) => {
      text.inputEl.type = "number";
      text.inputEl.min = "1";
      text.setValue(String(this.minutes));
      text.onChange((value) => {
        this.minutes = Math.max(1, Math.round(Number(value) || 1));
      });
    });

    new Setting(this.contentEl).setName(t("record.tag")).addText((text) => {
      text.setValue(this.tag);
      text.onChange((value) => {
        this.tag = value;
      });
    });

    new Setting(this.contentEl).setName(t("record.note")).addTextArea((area) => {
      area.setValue(this.note);
      area.inputEl.rows = 3;
      area.onChange((value) => {
        this.note = value;
      });
    });

    const footer = new Setting(this.contentEl);
    footer.addButton((btn) => btn.setButtonText(t("modal.cancel")).onClick(() => this.close()));
    footer.addButton((btn) =>
      btn
        .setButtonText(t("modal.save"))
        .setCta()
        .onClick(() => void this.save())
    );
  }

  async save() {
    const match = /^(\d{1,2}):(\d{2})$/.exec(this.startTime.trim());
    const hours = match ? Number(match[1]) : 9;
    const minutes = match ? Number(match[2]) : 0;
    const date = parseDateKey(this.dayKey);
    date.setHours(hours, minutes, 0, 0);
    const start = date.getTime();
    const durationSec = Math.max(60, Math.round(this.minutes * 60));
    const now = Date.now();
    const record = {
      id: this.existing ? this.existing.id : newId(),
      kind: this.kind,
      mode: this.existing && this.existing.mode ? this.existing.mode : "stopwatch",
      phase: this.kind === "rest" ? "shortBreak" : "focus",
      tag: this.tag.trim(),
      start,
      end: start + durationSec * 1000,
      durationSec,
      completed: true,
      note: this.note.trim() || undefined,
      createdAt: this.existing && this.existing.createdAt ? this.existing.createdAt : now,
      updatedAt: now
    };
    try {
      if (this.existing) {
        if (dateKeyOf(this.existing.start) !== this.dayKey) {
          await this.deps.storage.deleteRecord(dateKeyOf(this.existing.start), this.existing.id);
          await this.deps.storage.addRecord(record);
        } else {
          await this.deps.storage.updateRecord(this.dayKey, record);
        }
      } else {
        await this.deps.storage.addRecord(record);
      }
      if (this.onChanged) this.onChanged();
    } catch (e) {
      new Notice(String(e && e.message ? e.message : e));
    }
    this.close();
  }

  onClose() {
    this.contentEl.empty();
  }
}

class PostSessionPrompt extends Modal {
  constructor(deps, record) {
    super(deps.app);
    this.deps = deps;
    this.record = record;
    this.tag = record.tag || "";
    this.note = record.note || "";
  }

  onOpen() {
    this.contentEl.addClass("thinker-modal");
    this.titleEl.setText(t("prompt.title"));
    this.contentEl.createDiv({
      cls: "thinker-prompt-meta",
      text: t("prompt.meta", {
        range: `${clockOf(this.record.start)} – ${clockOf(this.record.end)}`,
        duration: formatDuration(this.record.durationSec)
      })
    });
    new Setting(this.contentEl).setName(t("prompt.what")).addText((text) => {
      text.setValue(this.tag);
      text.onChange((value) => {
        this.tag = value;
      });
      text.inputEl.focus();
      text.inputEl.select();
    });
    new Setting(this.contentEl).setName(t("prompt.note")).addTextArea((area) => {
      area.setPlaceholder(t("prompt.notePlaceholder"));
      area.setValue(this.note);
      area.inputEl.rows = 3;
      area.onChange((value) => {
        this.note = value;
      });
    });
    const footer = new Setting(this.contentEl);
    footer.addButton((btn) => btn.setButtonText(t("prompt.skip")).onClick(() => this.close()));
    footer.addButton((btn) =>
      btn
        .setButtonText(t("modal.save"))
        .setCta()
        .onClick(() => void this.save())
    );
  }

  async save() {
    const tag = this.tag.trim();
    const note = this.note.trim();
    if (tag || note) {
      try {
        await this.deps.storage.updateRecord(dateKeyOf(this.record.start), {
          ...this.record,
          tag: tag || this.record.tag,
          note: note || undefined,
          updatedAt: Date.now()
        });
        this.deps.onRecordsChanged();
      } catch (e) {
        /* the record is already saved; a failed label edit is not worth a notice */
      }
    }
    this.close();
  }

  onClose() {
    this.contentEl.empty();
  }
}

/* ------------------------------------------------- 9b  StatsView (sidebar)

   Four questions, in this order: which stretch of time, how much went in, what
   shape it made, and what it was spent on. One period control, three numbers, one
   chart that follows the granularity, one breakdown. Nothing else.

   The chart is the part that changes with the unit:
     日   the day as a 24-hour track, sessions drawn where they happened
     周   seven bars
     月   the month as a heat grid, clicking a cell drills into that day */

const STATS_MODES = ["day", "week", "month"];

class StatsView extends ItemView {
  constructor(leaf, deps) {
    super(leaf);
    this.deps = deps;
    this.mode = "week";
    this.anchor = todayKey();
    this.token = 0;
  }

  getViewType() {
    return STATS_VIEW_TYPE;
  }

  getDisplayText() {
    return t("stats.title");
  }

  getIcon() {
    return "bar-chart-2";
  }

  async onOpen() {
    this.contentEl.addClass("thinker-stats");
    await this.render();
  }

  async onClose() {
    this.contentEl.empty();
  }

  refresh() {
    void this.render();
  }

  periodInfo() {
    const weekStart = this.deps.getSettings().weekStart;
    const date = parseDateKey(this.anchor);
    if (this.mode === "day") {
      const weekday = weekdayLabels(1)[(date.getDay() + 6) % 7];
      const label =
        lang === "zh"
          ? `${date.getMonth() + 1} 月 ${date.getDate()} 日 · 周${weekday}`
          : `${date.toLocaleDateString("en-US", { month: "short", day: "numeric" })} · ${weekday}`;
      return { keys: [this.anchor], label };
    }
    if (this.mode === "week") {
      const keys = weekDays(this.anchor, weekStart);
      return { keys, label: `${shortDay(keys[0])} – ${shortDay(keys[6])}` };
    }
    const keys = monthGrid(date.getFullYear(), date.getMonth() + 1, weekStart).filter(Boolean);
    const label =
      lang === "zh"
        ? `${date.getFullYear()} 年 ${date.getMonth() + 1} 月`
        : date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    return { keys, label };
  }

  shift(step) {
    const date = parseDateKey(this.anchor);
    if (this.mode === "day") {
      date.setDate(date.getDate() + step);
    } else if (this.mode === "week") {
      date.setDate(date.getDate() + 7 * step);
    } else {
      const day = date.getDate();
      const target = new Date(date.getFullYear(), date.getMonth() + step, 1);
      const last = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
      target.setDate(Math.min(day, last));
      target.setHours(12, 0, 0, 0);
      date.setTime(target.getTime());
    }
    date.setHours(12, 0, 0, 0);
    this.anchor = dateKeyOfDate(date);
    void this.render();
  }

  async render() {
    const token = ++this.token;
    const root = this.contentEl;
    root.empty();
    root.addClass("thinker-stats");

    const period = this.periodInfo();
    const map = await this.deps.storage.getDays(period.keys);
    if (token !== this.token) return;

    const records = [];
    for (const key of period.keys) {
      for (const record of visibleRecords(map.get(key) || [])) records.push(record);
    }
    const focusRecords = records.filter((record) => record.kind !== "rest");
    const total = focusRecords.reduce((sum, record) => sum + (Number(record.durationSec) || 0), 0);
    const longest = focusRecords.reduce((max, record) => Math.max(max, Number(record.durationSec) || 0), 0);

    this.renderHead(root, period);
    root.createDiv({ cls: "thinker-stats-label", text: t("stats.numbers") });
    this.renderMetrics(root, {
      total,
      count: focusRecords.length,
      average: Math.round(total / Math.max(1, period.keys.length)),
      longest
    });

    root.createDiv({ cls: "thinker-stats-label", text: t("stats.shape") });
    if (this.mode === "day") this.renderDayChart(root, records);
    else if (this.mode === "week") this.renderWeekChart(root, period.keys, map);
    else this.renderMonthChart(root, period.keys, map);

    this.renderTags(root, records);
  }

  renderHead(root, period) {
    const head = root.createDiv({ cls: "thinker-stats-head" });

    const prev = head.createEl("button", { cls: "thinker-cal-btn", text: "‹" });
    prev.setAttribute("aria-label", t("stats.prev"));
    prev.addEventListener("click", () => this.shift(-1));

    const label = head.createEl("button", { cls: "thinker-stats-range", text: period.label });
    label.setAttribute("aria-label", t("stats.backToday"));
    label.addEventListener("click", () => {
      this.anchor = todayKey();
      void this.render();
    });

    const next = head.createEl("button", { cls: "thinker-cal-btn", text: "›" });
    next.setAttribute("aria-label", t("stats.next"));
    next.addEventListener("click", () => this.shift(1));

    const units = root.createDiv({ cls: "thinker-stats-units" });
    for (const mode of STATS_MODES) {
      const tab = units.createEl("button", {
        cls: mode === this.mode ? "thinker-unit-tab is-on" : "thinker-unit-tab",
        text: t(`stats.${mode}`)
      });
      tab.addEventListener("click", () => this.setMode(mode));
    }
  }

  setMode(mode) {
    if (this.mode === mode) return;
    this.mode = mode;
    void this.render();
  }

  renderMetrics(root, data) {
    const metrics = root.createDiv({ cls: "thinker-stats-metrics" });
    const rows =
      this.mode === "day"
        ? [
            { label: t("stats.total"), value: formatDuration(data.total) },
            { label: t("stats.sessions"), value: String(data.count) },
            { label: t("stats.longest"), value: formatDuration(data.longest) }
          ]
        : [
            { label: t("stats.total"), value: formatDuration(data.total) },
            { label: t("stats.sessions"), value: String(data.count) },
            { label: t("stats.average"), value: formatDuration(data.average) }
          ];
    for (const row of rows) {
      const line = metrics.createDiv({ cls: "thinker-stat" });
      line.createSpan({ cls: "thinker-stat-label", text: row.label });
      line.createSpan({ cls: "thinker-stat-value", text: row.value });
    }
  }

  renderDayChart(root, records) {
    const chart = root.createDiv({ cls: "thinker-day-chart" });
    const track = chart.createDiv({ cls: "thinker-day-track" });
    for (const record of sortRecords(records)) {
      const start = new Date(record.start);
      const startMin = start.getHours() * 60 + start.getMinutes();
      const lengthMin = Math.max(1, (Number(record.durationSec) || 0) / 60);
      const seg = track.createDiv({ cls: record.kind === "rest" ? "thinker-seg is-rest" : "thinker-seg" });
      seg.style.setProperty("--tk-left", `${(startMin / 1440) * 100}%`);
      seg.style.setProperty("--tk-width", `${Math.max(0.7, (lengthMin / 1440) * 100)}%`);
      seg.setAttribute("title", `${clockOf(record.start)} · ${formatDuration(record.durationSec)}`);
    }
    const scale = chart.createDiv({ cls: "thinker-day-scale" });
    for (const hour of ["0", "6", "12", "18", "24"]) {
      scale.createSpan({ cls: "thinker-day-tick", text: hour });
    }
  }

  renderWeekChart(root, keys, map) {
    const values = keys.map((key) => sumFocusDuration(map.get(key) || []));
    const max = Math.max(1, ...values);
    const today = todayKey();
    const names = weekdayLabels(this.deps.getSettings().weekStart);
    const chart = root.createDiv({ cls: "thinker-stats-chart" });

    keys.forEach((key, index) => {
      const col = chart.createDiv({ cls: "thinker-bar-col" });
      if (key === today) col.addClass("is-today");
      if (values[index] > 0) {
        col.setAttribute("title", formatDuration(values[index]));
        col.setAttribute("aria-label", `${key} ${formatDuration(values[index])}`);
      }
      const track = col.createDiv({ cls: "thinker-bar-track" });
      const bar = track.createDiv({ cls: "thinker-bar" });
      bar.style.setProperty("--tk-bar-h", `${values[index] > 0 ? Math.max(4, Math.round((values[index] / max) * 100)) : 0}%`);
      col.createDiv({ cls: "thinker-bar-day", text: names[index] });
      col.addEventListener("click", () => this.drill(key));
    });
  }

  renderMonthChart(root, keys, map) {
    const chart = root.createDiv({ cls: "thinker-month" });
    const week = chart.createDiv({ cls: "thinker-month-week" });
    for (const name of weekdayLabels(this.deps.getSettings().weekStart)) {
      week.createSpan({ text: name });
    }
    const grid = chart.createDiv({ cls: "thinker-month-grid" });
    const today = todayKey();
    const values = keys.map((key) => sumFocusDuration(map.get(key) || []));
    const max = Math.max(1, ...values);
    const date = parseDateKey(this.anchor);
    const cells = monthGrid(date.getFullYear(), date.getMonth() + 1, this.deps.getSettings().weekStart);

    for (const key of cells) {
      const cell = grid.createDiv({ cls: "thinker-mcell" });
      if (!key) {
        cell.addClass("is-blank");
        continue;
      }
      const index = keys.indexOf(key);
      const seconds = index >= 0 ? values[index] : 0;
      if (key === today) cell.addClass("is-today");
      if (seconds > 0) cell.addClass(`thinker-heat-${Math.max(1, Math.min(4, Math.ceil((seconds / max) * 4)))}`);
      cell.setText(String(Number(key.slice(-2))));
      cell.setAttribute("title", formatDuration(seconds));
      cell.addEventListener("click", () => this.drill(key));
    }
  }

  renderTags(root, records) {
    root.createDiv({ cls: "thinker-stats-label", text: t("stats.share") });
    const focus = new Map();
    let rest = 0;
    for (const record of records) {
      if (record.kind === "rest") {
        rest += Number(record.durationSec) || 0;
        continue;
      }
      const tag = String(record.tag || "").trim() || t("stats.untagged");
      focus.set(tag, (focus.get(tag) || 0) + (Number(record.durationSec) || 0));
    }
    const rows = [...focus.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
    if (rest > 0) rows.push([t("stats.rest"), rest]);
    if (rows.length === 0) {
      root.createDiv({ cls: "thinker-empty", text: t("stats.empty") });
      return;
    }
    const total = rows.reduce((sum, row) => sum + row[1], 0);
    const box = root.createDiv({ cls: "thinker-tags" });
    for (const [name, seconds] of rows) {
      const row = box.createDiv({ cls: name === t("stats.rest") ? "thinker-tag-row is-rest" : "thinker-tag-row" });
      const fill = row.createDiv({ cls: "thinker-tag-fill" });
      fill.style.setProperty("--tk-share", `${Math.max(2, Math.round((seconds / total) * 100))}%`);
      row.createSpan({ cls: "thinker-tag-name", text: name });
      row.createSpan({ cls: "thinker-tag-value", text: formatDuration(seconds) });
    }
  }

  drill(dayKey) {
    this.anchor = dayKey;
    this.mode = "day";
    void this.render();
  }
}

function shortDay(dayKey) {
  return dayKey.slice(5).replace("-", ".");
}

const DEFAULT_SETTINGS = {
  openOnStartup: true,
  collapseLeftSidebar: true,
  side: "notes-left",
  showSeconds: false,
  indexRoots: "",
  searchScope: "title",
  listLimit: 40,
  noteSort: "name-asc",
  /* The three vault-wide ranges are optional. Folders are not: they are the places
     notes actually live, and a notes panel with no folder in it has nothing to say
     about where anything is. */
  showAll: true,
  showRecent: true,
  showPinned: true,
  chipOrder: "",
  pinnedNotes: "",
  hiddenFolders: "",
  focusMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  longBreakInterval: 4,
  autoCycle: true,
  defaultMode: "pomodoro",
  minSessionSeconds: 60,
  dailyGoalMinutes: 120,
  playSound: true,
  vibrate: true,
  showNotice: true,
  promptAfterFocus: true,
  dataFolder: "FocusLog",
  weekStart: 1,
  dailyNotesFolder: "",
  dailyNotesFormat: "",
};

function readSettings(raw) {
  const source = raw && typeof raw === "object" ? raw : {};
  const num = (key, min, max) => {
    const value = Number(source[key]);
    if (!Number.isFinite(value)) return DEFAULT_SETTINGS[key];
    return Math.min(max, Math.max(min, Math.round(value)));
  };
  const flag = (key) => (typeof source[key] === "boolean" ? source[key] : DEFAULT_SETTINGS[key]);
  const text = (key) => (typeof source[key] === "string" ? source[key] : DEFAULT_SETTINGS[key]);
  return {
    openOnStartup: flag("openOnStartup"),
    collapseLeftSidebar: flag("collapseLeftSidebar"),
    side: source.side === "notes-right" ? "notes-right" : "notes-left",
    showSeconds: flag("showSeconds"),
    indexRoots: text("indexRoots"),
    searchScope: source.searchScope === "full" ? "full" : "title",
    listLimit: num("listLimit", 5, 400),
    noteSort: NOTE_ORDERS.indexOf(source.noteSort) >= 0 ? source.noteSort : "name-asc",
    showAll: flag("showAll"),
    showRecent: flag("showRecent"),
    showPinned: flag("showPinned"),
    chipOrder: text("chipOrder"),
    pinnedNotes: text("pinnedNotes"),
    hiddenFolders: text("hiddenFolders"),
    focusMinutes: num("focusMinutes", 1, 180),
    shortBreakMinutes: num("shortBreakMinutes", 1, 120),
    longBreakMinutes: num("longBreakMinutes", 1, 240),
    longBreakInterval: num("longBreakInterval", 1, 12),
    autoCycle: flag("autoCycle"),
    defaultMode: source.defaultMode === "stopwatch" ? "stopwatch" : "pomodoro",
    minSessionSeconds: num("minSessionSeconds", 0, 3600),
    dailyGoalMinutes: num("dailyGoalMinutes", 0, 1440),
    playSound: flag("playSound"),
    vibrate: flag("vibrate"),
    showNotice: flag("showNotice"),
    promptAfterFocus: flag("promptAfterFocus"),
    dataFolder: text("dataFolder") || "FocusLog",
    weekStart: Number(source.weekStart) === 0 ? 0 : 1,
    dailyNotesFolder: text("dailyNotesFolder"),
    dailyNotesFormat: text("dailyNotesFormat"),
  };
}

class ThinkerSettingTab extends PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display() {
    const { containerEl } = this;
    containerEl.empty();
    const settings = this.plugin.settings;
    const commit = () => void this.plugin.saveSettings();

    containerEl.createEl("h3", { text: t("settings.general") });
    new Setting(containerEl)
      .setName(t("settings.openOnStartup"))
      
      .addToggle((toggle) =>
        toggle.setValue(settings.openOnStartup).onChange((value) => {
          settings.openOnStartup = value;
          commit();
        })
      );

    new Setting(containerEl).setName(t("settings.collapseLeft")).addToggle((toggle) =>
      toggle.setValue(settings.collapseLeftSidebar).onChange((value) => {
        settings.collapseLeftSidebar = value;
        commit();
        if (value) this.plugin.collapseLeftSidebar();
      })
    );

    new Setting(containerEl).setName(t("settings.side")).addDropdown((drop) => {
      drop.addOption("notes-left", t("settings.sideNotesLeft"));
      drop.addOption("notes-right", t("settings.sideNotesRight"));
      drop.setValue(settings.side).onChange((value) => {
        settings.side = value === "notes-right" ? "notes-right" : "notes-left";
        commit();
        this.plugin.refreshAll();
      });
    });

    new Setting(containerEl)
      .setName(t("settings.showSeconds"))
      
      .addToggle((toggle) =>
        toggle.setValue(settings.showSeconds).onChange((value) => {
          settings.showSeconds = value;
          commit();
        })
      );

    containerEl.createEl("h3", { text: t("settings.notes") });
    new Setting(containerEl)
      .setName(t("settings.roots"))
      
      .addTextArea((area) => {
        area.setValue(settings.indexRoots);
        area.inputEl.rows = 3;
        area.onChange((value) => {
          settings.indexRoots = value;
          commit();
          this.plugin.rebuildIndex();
        });
      });

    new Setting(containerEl)
      .setName(t("settings.scope"))
      
      .addDropdown((drop) => {
        drop.addOption("title", t("settings.scopeTitle"));
        drop.addOption("full", t("settings.scopeFull"));
        drop.setValue(settings.searchScope).onChange((value) => {
          settings.searchScope = value === "full" ? "full" : "title";
          commit();
          this.plugin.rebuildIndex();
        });
      });

    new Setting(containerEl).setName(t("settings.listLimit")).addSlider((slider) =>
      slider
        .setLimits(10, 400, 10)
        .setValue(Math.min(400, Math.max(10, settings.listLimit)))
        .setDynamicTooltip()
        .onChange((value) => {
          settings.listLimit = value;
          commit();
          this.plugin.refreshNoteViews();
        })
    );

    new Setting(containerEl).setName(t("settings.noteSort")).addDropdown((drop) => {
      drop.addOption("name-asc", t("settings.sortNameAsc"));
      drop.addOption("name-desc", t("settings.sortNameDesc"));
      drop.addOption("time-desc", t("settings.sortNewest"));
      drop.addOption("time-asc", t("settings.sortOldest"));
      drop.setValue(settings.noteSort);
      drop.onChange((value) => {
        settings.noteSort = value;
        commit();
        this.plugin.refreshNoteViews();
      });
    });

    const rangeToggles = [
      ["settings.showAll", "settings.showAllDesc", "showAll"],
      ["settings.showRecent", "settings.showRecentDesc", "showRecent"],
      ["settings.showPinned", "settings.showPinnedDesc", "showPinned"]
    ];
    for (const [nameKey, descKey, field] of rangeToggles) {
      new Setting(containerEl)
        .setName(t(nameKey))
        .setDesc(t(descKey))
        .addToggle((toggle) =>
          toggle.setValue(settings[field] !== false).onChange((value) => {
            settings[field] = value;
            commit();
            this.plugin.refreshNoteViews();
          })
        );
    }

    new Setting(containerEl)
      .setName(t("settings.hiddenFolders"))
      .addTextArea((area) => {
        area.setPlaceholder(t("settings.hiddenFoldersHint"));
        area.setValue(settings.hiddenFolders);
        area.inputEl.rows = 3;
        area.onChange((value) => {
          settings.hiddenFolders = value;
          commit();
          this.plugin.rebuildIndex();
        });
      });

    new Setting(containerEl)
      .setName(t("settings.pins"))
      
      .addTextArea((area) => {
        area.setPlaceholder(t("settings.pinsNone"));
        area.setValue(settings.pinnedNotes);
        area.inputEl.rows = 4;
        area.onChange((value) => {
          settings.pinnedNotes = value;
          commit();
          this.plugin.refreshNoteViews();
        });
      });

    containerEl.createEl("h3", { text: t("settings.timer") });
    const numeric = [
      ["settings.focusLength", "focusMinutes", 1, 180],
      ["settings.shortBreak", "shortBreakMinutes", 1, 120],
      ["settings.longBreak", "longBreakMinutes", 1, 240],
      ["settings.longBreakInterval", "longBreakInterval", 1, 12],
      ["settings.minSession", "minSessionSeconds", 0, 3600],
      ["settings.dailyGoal", "dailyGoalMinutes", 0, 1440]
    ];
    for (const [labelKey, key, min, max] of numeric) {
      new Setting(containerEl)
        .setName(t(labelKey))
        
        .addText((text) => {
          text.inputEl.type = "number";
          text.inputEl.min = String(min);
          text.inputEl.max = String(max);
          text.setValue(String(settings[key]));
          text.onChange((value) => {
            const parsed = Number(value);
            if (!Number.isFinite(parsed)) return;
            settings[key] = Math.min(max, Math.max(min, Math.round(parsed)));
            commit();
          });
        });
    }

    new Setting(containerEl).setName(t("settings.defaultMode")).addDropdown((drop) => {
      drop.addOption("pomodoro", t("timer.pomodoro"));
      drop.addOption("stopwatch", t("timer.stopwatch"));
      drop.setValue(settings.defaultMode).onChange((value) => {
        settings.defaultMode = value === "stopwatch" ? "stopwatch" : "pomodoro";
        commit();
      });
    });

    const toggles = [
      ["settings.autoCycle", "autoCycle"],
      ["settings.promptFocus", "promptAfterFocus"],
      ["settings.sound", "playSound"],
      ["settings.vibrate", "vibrate"],
      ["settings.notice", "showNotice"]
    ];
    for (const [labelKey, key] of toggles) {
      new Setting(containerEl).setName(t(labelKey)).addToggle((toggle) =>
        toggle.setValue(settings[key]).onChange((value) => {
          settings[key] = value;
          commit();
        })
      );
    }

    containerEl.createEl("h3", { text: t("settings.data") });
    new Setting(containerEl)
      .setName(t("settings.dataFolder"))
      
      .addText((text) => {
        text.setValue(settings.dataFolder);
        text.onChange((value) => {
          settings.dataFolder = value.trim() || "FocusLog";
          commit();
        });
      });

    new Setting(containerEl).setName(t("settings.weekStart")).addDropdown((drop) => {
      drop.addOption("1", t("settings.monday"));
      drop.addOption("0", t("settings.sunday"));
      drop.setValue(String(settings.weekStart)).onChange((value) => {
        settings.weekStart = Number(value) === 0 ? 0 : 1;
        commit();
        this.plugin.refreshAll();
      });
    });

    new Setting(containerEl).setName(t("settings.diaryFolder")).addText((text) => {
      text.setPlaceholder("Life/Daily Notes");
      text.setValue(settings.dailyNotesFolder);
      text.onChange((value) => {
        settings.dailyNotesFolder = value.trim();
        commit();
      });
    });

    new Setting(containerEl).setName(t("settings.diaryFormat")).addText((text) => {
      text.setPlaceholder("YYYY-MM-DD");
      text.setValue(settings.dailyNotesFormat);
      text.onChange((value) => {
        settings.dailyNotesFormat = value.trim();
        commit();
      });
    });

    containerEl.createEl("h3", { text: t("settings.about") });
    containerEl.createEl("p", { text: `Thinker ${this.plugin.manifest.version}` });
  }
}

/* ------------------------------------------------------------ 12  Open a note */

/* The page is an ItemView, and Obsidian refuses to navigate a leaf away from a view
   that is not a file view. The click happens inside the page, so the page is the
   active leaf, so every request handed to getLeaf(false) made Obsidian build a new
   tab instead of using the one that was already there. A note now goes to the tab
   that already holds it, else to the note tab used last, and a new tab is made only
   when the main area has no note tab at all. */
let lastNoteLeaf = null;

function leafTypeOf(leaf) {
  try {
    const view = leaf && leaf.view;
    return view && typeof view.getViewType === "function" ? view.getViewType() : "";
  } catch (error) {
    return "";
  }
}

function isSidebarLeaf(workspace, leaf) {
  try {
    const root = leaf && typeof leaf.getRoot === "function" ? leaf.getRoot() : null;
    if (!root) return false;
    return root === workspace.leftSplit || root === workspace.rightSplit;
  } catch (error) {
    return false;
  }
}

/* A note tab: markdown, in the main area, still attached. getLeavesOfType drops a
   leaf as soon as it is closed, so membership doubles as the liveness test and a
   leaf held from an earlier session cannot be written into. */
function isNoteLeaf(app, leaf) {
  if (!leaf) return false;
  if (leafTypeOf(leaf) !== "markdown") return false;
  if (isSidebarLeaf(app.workspace, leaf)) return false;
  const leaves = app.workspace.getLeavesOfType("markdown") || [];
  return leaves.indexOf(leaf) >= 0;
}

function noteLeafShowing(app, file) {
  let hit = null;
  app.workspace.iterateAllLeaves((leaf) => {
    if (hit) return;
    if (!isNoteLeaf(app, leaf)) return;
    const open = leaf.view && leaf.view.file;
    if (open && open.path === file.path) hit = leaf;
  });
  return hit;
}

function reusableNoteLeaf(app) {
  if (isNoteLeaf(app, lastNoteLeaf)) return lastNoteLeaf;
  let recent = null;
  try {
    recent = typeof app.workspace.getMostRecentLeaf === "function" ? app.workspace.getMostRecentLeaf() : null;
  } catch (error) {
    recent = null;
  }
  if (isNoteLeaf(app, recent)) return recent;
  for (const leaf of app.workspace.getLeavesOfType("markdown") || []) {
    if (isNoteLeaf(app, leaf)) return leaf;
  }
  return null;
}

/* Notes opened from the file explorer, the quick switcher or a link are the same
   tabs this page hands files to, so the choice is remembered from the workspace
   rather than only from the clicks this plugin makes. */
function rememberNoteLeaf(app) {
  const leaf = app.workspace.activeLeaf;
  if (isNoteLeaf(app, leaf)) lastNoteLeaf = leaf;
}

/* newTab is the ctrl/cmd click and the "open in new tab" menu entry. Everything
   else replaces the content of the note tab that is already open. */
async function openNote(app, file, options) {
  if (!file) return null;
  const opts = options || {};
  const { workspace } = app;
  if (opts.newTab !== true) {
    const shown = noteLeafShowing(app, file);
    if (shown) {
      await workspace.revealLeaf(shown);
      lastNoteLeaf = shown;
      return shown;
    }
    const target = reusableNoteLeaf(app);
    if (target) {
      await target.openFile(file);
      lastNoteLeaf = target;
      return target;
    }
  }
  const leaf = workspace.getLeaf("tab");
  if (!leaf) return null;
  await leaf.openFile(file);
  lastNoteLeaf = leaf;
  return leaf;
}

/* --------------------------------------------------------------- 14  Plugin */

class ThinkerPlugin extends Plugin {
  constructor() {
    super(...arguments);
    this.settings = { ...DEFAULT_SETTINGS };
    this.statusBar = null;
    this.index = null;
    this.storage = null;
    this.engine = null;
    this.tdHandle = null;
    this.tdMirroring = false;
    this.tdRetryAfter = 0;
    this.tdNoticed = new Set();
    this.ready = false;
    this.lastPersistAt = 0;
  }

  async onload() {
    initLocale();
    const data = await this.loadData();
    this.settings = readSettings(data && data.settings);
    /* Out of the picture before the first paint, not after it: this is the earliest
       moment the plugin has a say, and the class comes off once the collapse has
       settled. */
    if (this.settings.collapseLeftSidebar) {
      this.hideLeftSplitForBoot();
      this.register(() => this.releaseLeftSplit());
    }
    this.storage = new DayStore(this.app, () => this.settings);
    this.index = new NoteIndex(
      this.app,
      () => this.settings,
      debounce(() => this.refreshNoteViews(), 400)
    );
    this.engine = new TimerEngine(() => this.settings, this.buildHooks());

    this.registerView(VIEW_TYPE, (leaf) => new HomeView(leaf, this.viewDeps()));
    this.registerView(STATS_VIEW_TYPE, (leaf) => new StatsView(leaf, this.statsDeps()));
    this.registerEvent(this.app.workspace.on("active-leaf-change", () => rememberNoteLeaf(this.app)));
    this.addSettingTab(new ThinkerSettingTab(this.app, this));
    this.addCommands();
    this.addRibbonIcon("square-chart-gantt", t("ribbon.home"), () => void this.openHome(false));
    this.addRibbonIcon("bar-chart-2", t("ribbon.stats"), () => void this.openStats());
    this.addRibbonIcon("settings", t("ribbon.settings"), () => this.openSettings());

    if (Platform.isDesktop) {
      this.statusBar = this.addStatusBarItem();
      this.statusBar.addClass("thinker-status");
      this.updateStatus();
    }

    const restored = this.engine.restore(data && data.runtime);
    if (restored === "completed") new Notice(t("notice.recovered"));
    else if (restored === "resumed") new Notice(t("notice.resumed", { duration: formatDuration(Math.round(this.engine.elapsedSec())) }));

    this.startClock();
    const wake = () => {
      this.tick();
    };
    window.addEventListener("visibilitychange", wake);
    window.addEventListener("focus", wake);
    this.register(() => {
      window.removeEventListener("visibilitychange", wake);
      window.removeEventListener("focus", wake);
    });

    this.app.workspace.onLayoutReady(() => this.onReady());
  }

  /* Blink slows DOM timers to about one tick a minute, and stops them outright, once
     the window is hidden — which is exactly when a focus session is being watched from
     the other side of the screen. Node's timers are driven by libuv and keep their
     cadence there, so the clock stays honest with the window minimised; a plain DOM
     timer is only the fallback for builds where require is out of reach. Both are
     wrapped: a throwing callback inside a Node timer would take the process down. */
  startClock() {
    let timers = null;
    try {
      if (typeof window !== "undefined" && typeof window.require === "function") {
        timers = window.require("timers");
      }
    } catch (error) {
      timers = null;
    }
    const beat = () => {
      try {
        this.tick();
      } catch (error) {
        console.error("Thinker: the clock tick failed", error);
      }
    };
    if (timers && typeof timers.setInterval === "function" && typeof timers.clearInterval === "function") {
      const handle = timers.setInterval(beat, 1000);
      this.register(() => {
        try {
          timers.clearInterval(handle);
        } catch (error) {
          /* the timer process is already gone */
        }
      });
      return;
    }
    this.registerInterval(window.setInterval(beat, 1000));
  }

  onunload() {
    if (this.tdHandle !== null) {
      window.clearInterval(this.tdHandle);
      this.tdHandle = null;
    }
    if (this.index) this.index.destroy();
    void this.saveSettings();
    disposeAudio();
  }

  /* The left sidebar is a file browser, and this page already lists the notes. On
     startup it is collapsed so the page starts wide; the ribbon stays one click
     away when it is needed.

     Two layers, because there are two ways to be seen. The boot class in
     styles.css keeps the split out of the picture until the collapse has settled:
     that is what covers the frames the window paints before this method is even
     called. The transition suppression below covers the rest — collapsing with the
     animation on reads as the drawer sliding shut, which is the one thing this
     setting exists to prevent.

     Both the class and the inline style are set there. The class is what a
     stylesheet says, and it is written deep enough to outrank a theme that restates
     the transition; the inline style is the same switch 3.3.2 used and does not
     depend on Obsidian having decorated this element with addClass. It is restored
     on a timer, not on the next frame: a frame can be delivered before the layout
     change it is meant to cover, and that is how the flash came back once. */
  collapseLeftSidebar(instant) {
    const split = this.app.workspace.leftSplit;
    /* Whatever happens below, the boot class comes off on a timer: an early return
       or an exception must not leave the sidebar hidden for the session. */
    if (instant) window.setTimeout(() => this.releaseLeftSplit(), 600);
    if (!split || split.collapsed) return;
    const el = split.containerEl;
    const suppress = () => {
      if (!el) return;
      if (el.classList) el.classList.add("is-no-transition");
      if (el.style) el.style.transition = "none";
    };
    const restore = () => {
      if (!el) return;
      if (el.classList) el.classList.remove("is-no-transition");
      if (el.style) el.style.transition = "";
    };
    if (instant) suppress();
    try {
      split.collapse();
    } catch (error) {
      console.error("Thinker: could not collapse the left sidebar", error);
    }
    /* 600ms is longer than the slowest sidebar animation a theme ships (Baseline
       runs the moderate step, 320ms). A collapse done by hand from the settings
       keeps its animation: only startup asks for instant. */
    if (instant && el) window.setTimeout(restore, 600);
  }

  /* The window paints the restored layout before onLayoutReady fires, so a collapse
     done there is always one frame late. Hiding the split for the length of startup
     is the only thing that covers a frame already drawn; see the startup block in
     styles.css. */
  hideLeftSplitForBoot() {
    const body = document.body;
    if (body && body.classList) body.classList.add("is-thinker-booting");
  }

  releaseLeftSplit() {
    const body = document.body;
    if (body && body.classList) body.classList.remove("is-thinker-booting");
  }

  onReady() {
    this.ready = true;
    /* Collapsed first, before the index and the first render: the work below takes
       long enough to be a frame or three, and every one of them paints the sidebar
       open. The setting is about not seeing it at all. */
    if (this.settings.collapseLeftSidebar) this.collapseLeftSidebar(true);
    this.index.rebuild();
    this.refreshAll();
    this.registerVaultEvents();
    if (this.settings.openOnStartup) void this.openHome(true);
  }

  viewDeps() {
    return {
      app: this.app,
      index: this.index,
      storage: this.storage,
      engine: this.engine,
      getSettings: () => this.settings,
      saveSettings: () => this.saveSettings(),
      onRecordsChanged: () => {
        this.refreshTimerViews();
        this.refreshCalendarViews();
        this.refreshStatsViews();
      }
    };
  }

  buildHooks() {
    return {
      onSessionRecorded: (record) => {
        void this.storage.addRecord(record).then(
          () => {
            this.refreshTimerViews();
            this.refreshCalendarViews();
            this.refreshStatsViews();
          },
          (error) => console.error("Thinker: could not save the session", error)
        );
        if (this.settings.showNotice) new Notice(t("notice.saved", { duration: formatDuration(record.durationSec) }));
        this.cue();
        if (this.ready && this.settings.promptAfterFocus && record.kind === "focus" && record.durationSec >= 60) {
          new PostSessionPrompt(this.viewDeps(), record).open();
        }
      },
      onSessionTooShort: (seconds) => new Notice(t("notice.tooShort", { seconds: this.settings.minSessionSeconds })),
      onPhaseComplete: (phase) => {
        this.cue();
        if (phase !== "focus" && this.settings.showNotice) new Notice(t("notice.breakDone"));
      },
      onStateChange: () => {
        this.refreshTimerViews();
        this.updateStatus();
        void this.saveSettings();
      }
    };
  }

  cue() {
    if (this.settings.playSound) {
      try {
        playChime();
      } catch (e) {
        /* audio is optional */
      }
    }
    if (this.settings.vibrate) {
      try {
        vibrate();
      } catch (e) {
        /* not every platform has a motor */
      }
    }
  }

  saveSettings() {
    return this.saveData({
      version: DATA_VERSION,
      settings: this.settings,
      runtime: this.engine ? this.engine.exportRuntime() : null
    });
  }

  tick() {
    const ended = this.engine.tick();
    for (const view of this.homeViews()) view.onTick();
    this.updateStatus();
    if (!ended) this.persistRuntime();
  }

  /* The runtime is written while it runs, not only when it changes. A phase that ends
     already goes through onStateChange, which saves; this is for the ordinary seconds
     in between, so a crash or a hard quit costs a few seconds instead of the whole
     session. Five seconds is under the shortest sleep anyone takes. */
  persistRuntime() {
    if (!this.engine || this.engine.state !== "running") return;
    const now = Date.now();
    if (now - this.lastPersistAt < 5000) return;
    this.lastPersistAt = now;
    try {
      const pending = this.saveSettings();
      if (pending && typeof pending.catch === "function") pending.catch(() => {});
    } catch (error) {
      console.error("Thinker: could not save the runtime", error);
    }
  }

  homeViews() {
    const out = [];
    for (const leaf of this.app.workspace.getLeavesOfType(VIEW_TYPE)) {
      if (leaf.view instanceof HomeView) out.push(leaf.view);
    }
    return out;
  }

  refreshAll() {
    for (const view of this.homeViews()) view.refreshAll();
  }

  refreshNoteViews() {
    for (const view of this.homeViews()) view.refreshNotes();
  }

  refreshTimerViews() {
    for (const view of this.homeViews()) view.refreshTimer();
  }

  statsDeps() {
    return {
      app: this.app,
      storage: this.storage,
      getSettings: () => this.settings,
      openDay: (dayKey, onChanged) => {
        new DayModal(this.viewDeps(), dayKey, () => {
          this.refreshStatsViews();
          this.refreshCalendarViews();
          this.refreshTimerViews();
          if (onChanged) onChanged();
        }).open();
      }
    };
  }

  statsViews() {
    const out = [];
    for (const leaf of this.app.workspace.getLeavesOfType(STATS_VIEW_TYPE)) {
      if (leaf.view instanceof StatsView) out.push(leaf.view);
    }
    return out;
  }

  refreshStatsViews() {
    for (const view of this.statsViews()) view.refresh();
  }

  /* The gear goes straight to this plugin's tab instead of the settings root:
     two clicks between the page and its options were one too many. */
  openSettings() {
    const setting = this.app.setting;
    if (!setting || typeof setting.open !== "function") {
      this.app.commands.executeCommandById("app:open-settings");
      return;
    }
    setting.open();
    if (typeof setting.openTabById === "function") setting.openTabById(this.manifest.id);
  }

  /* The most recent leaf in the main area, or a new tab when there is none. A
     sidebar leaf is never reused: the page would take the place of the file
     explorer. */
  reusableLeaf() {
    const { workspace } = this.app;
    let leaf = null;
    try {
      leaf = workspace.getMostRecentLeaf ? workspace.getMostRecentLeaf() : null;
    } catch (error) {
      leaf = null;
    }
    /* A sidebar leaf is rejected rather than compared against the main split: the
       page would otherwise take the place of the file explorer. */
    if (leaf && typeof leaf.getRoot === "function") {
      try {
        const root = leaf.getRoot();
        const sidebars = [workspace.leftSplit, workspace.rightSplit].filter(Boolean);
        if (sidebars.indexOf(root) >= 0) leaf = null;
      } catch (error) {
        leaf = null;
      }
    }
    return leaf || workspace.getLeaf("tab");
  }

  async openStats() {
    const { workspace } = this.app;
    const existing = workspace.getLeavesOfType(STATS_VIEW_TYPE);
    if (existing.length > 0) {
      await workspace.revealLeaf(existing[0]);
      return;
    }
    try {
      const leaf = workspace.getRightLeaf(false) || workspace.getRightLeaf(true);
      if (!leaf) return;
      await leaf.setViewState({ type: STATS_VIEW_TYPE, active: true });
      await workspace.revealLeaf(leaf);
    } catch (error) {
      console.error("Thinker: could not open the statistics panel", error);
    }
  }

  refreshCalendarViews() {
    for (const view of this.homeViews()) {
      if (view.calendar) void view.calendar.refresh();
    }
  }

  rebuildIndex() {
    this.index.rebuild();
    this.refreshNoteViews();
  }

  registerVaultEvents() {
    const changed = debounce(() => this.refreshNoteViews(), 250);
    this.registerEvent(
      this.app.vault.on("modify", (file) => {
        if (file && file.extension === "md") {
          this.index.updateOne(file);
          changed();
        }
      })
    );
    this.registerEvent(
      this.app.vault.on("create", (file) => {
        if (file && file.extension === "md") {
          this.index.updateOne(file);
          changed();
        }
      })
    );
    this.registerEvent(
      this.app.vault.on("delete", (file) => {
        this.index.removeOne(file.path);
        changed();
      })
    );
    this.registerEvent(
      this.app.vault.on("rename", (file, oldPath) => {
        this.index.renameOne(file, oldPath);
        changed();
      })
    );
    this.registerEvent(
      this.app.metadataCache.on("changed", (file) => {
        if (file && file.extension === "md") {
          this.index.updateOne(file);
          changed();
        }
      })
    );
  }

  /* Opening the page replaces the leaf the vault restored instead of adding a tab
     beside it: on startup that restored note is otherwise visible for a frame,
     which is the flicker. */
  async openHome(onlyIfEmpty) {
    const { workspace } = this.app;
    const existing = workspace.getLeavesOfType(VIEW_TYPE);
    if (existing.length > 0) {
      await workspace.revealLeaf(existing[0]);
      return;
    }
    try {
      const leaf = onlyIfEmpty ? this.reusableLeaf() : workspace.getLeaf("tab");
      if (!leaf) return;
      await leaf.setViewState({ type: VIEW_TYPE, active: true });
      await workspace.revealLeaf(leaf);
    } catch (error) {
      console.error("Thinker: could not open the home page", error);
    }
  }

  addCommands() {
    this.addCommand({ id: "open-home", name: t("cmd.home"), callback: () => void this.openHome(false) });
    this.addCommand({
      id: "start-stop",
      name: t("cmd.startStop"),
      callback: () => (this.engine.isActive ? this.engine.stop() : this.engine.start())
    });
    this.addCommand({
      id: "new-note",
      name: t("cmd.newNote"),
      callback: () => {
        const view = this.homeViews()[0];
        if (view && view.notes) {
          view.notes.input.focus();
          void view.notes.createFromQuery();
          return;
        }
        void this.openHome(false);
      }
    });
    this.addCommand({
      id: "add-session",
      name: t("cmd.addManual"),
      callback: () =>
        new DayModal(this.viewDeps(), todayKey(), () => {
          this.refreshCalendarViews();
          this.refreshTimerViews();
        }).open()
    });
    this.addCommand({
      id: "open-diary",
      name: t("cmd.diary"),
      callback: () => void openDiary(this.app, diaryConfig(this.app, this.settings), todayKey())
    });
    this.addCommand({ id: "open-stats", name: t("cmd.stats"), callback: () => void this.openStats() });
  }

  updateStatus() {
    if (!this.statusBar) return;
    const snapshot = this.engine.snapshot();
    if (snapshot.state === "idle") {
      this.statusBar.setText(t("status.idle"));
      return;
    }
    const value = snapshot.mode === "stopwatch" ? snapshot.elapsedSec : snapshot.remainingSec;
    const prefix = snapshot.mode === "stopwatch" ? "" : `${t(`timer.${snapshot.phase}`)} `;
    this.statusBar.setText(`${prefix}${formatClock(value)}`);
  }


}

module.exports = ThinkerPlugin;
module.exports.default = ThinkerPlugin;
module.exports.__esModule = true;
/* Exposed so the pure helpers can be exercised outside Obsidian. */
module.exports._internals = {
  fuzzyScore,
  initLocale,
  formatDuration,
  formatClock,
  monthGrid,
  parseDayFile,
  buildDayFile,
  readSettings,
  DEFAULT_SETTINGS,
  todayKey,
  dateKeyOf,
  weekdayLabels,
  NoteIndex,
  DayStore,
  TimerEngine,
  HomeView,
  StatsView,
  weekDays,
  NotePanel,
  TimerPanel,
  CalendarPanel,
  DayModal,
  CreateModal,
  ThinkerPlugin,
  RecordModal,
  openDiary,
  diaryPathFor,
  openNote,
  rememberNoteLeaf
};




