/*
 * Thinker — a minimal start page for Obsidian.
 *
 * One view holds everything: the clock, the note list, the focus timer and a month
 * calendar. The timer engine, the day store and the calendar shape are carried over
 * from Thinkers; the note index and the layout are new. The TomaTodo bridge is merged
 * in and stays switched off until it is enabled in the settings.
 *
 * Sections, in file order:
 *   1  i18n            2  date and text helpers      3  NoteIndex
 *   4  DayStore        5  TimerEngine + sound        6  NotePanel
 *   7  TimerPanel      8  CalendarPanel              9  HomeView
 *  10  Modals         11  TomaTodo bridge          12  SettingsTab
 *  13  Plugin
 */

const obsidian = require("obsidian");
const { Plugin, ItemView, Modal, Setting, Notice, Menu, Platform, setIcon, getLanguage, PluginSettingTab } = obsidian;

const VIEW_TYPE = "thinker-home-view";
const STATS_VIEW_TYPE = "thinker-stats-view";
const BUILD = "2.0.1028 · folders as headings";
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
  "cmd.stats": "Open focus statistics",

  "notes.placeholder": "Search {count} notes",
  "notes.all": "All",
  "notes.recent": "Recent",
  "notes.pinned": "Pinned",
  "notes.root": "Root",
  "notes.direct": "Direct",
  "notes.new": "New note",
  "notes.hint": "Up/Down to pick, Enter to open",
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

  "timer.focus": "Focus",
  "timer.shortBreak": "Short break",
  "timer.longBreak": "Long break",
  "timer.pomodoro": "Pomodoro",
  "timer.stopwatch": "Stopwatch",
  "timer.round": "Round {n}",
  "timer.pause": "Pause",
  "timer.resume": "Resume",
  "timer.stop": "End",
  "timer.idleHint": "Press the digits to start, again to end",
  "timer.today": "{duration} today",

  "cal.title": "{year}-{month}",
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
  "notice.breakDone": "Break is over",
  "notice.thinkersOn": "TomaTodo mirror is on",
  "notice.thinkersOff": "TomaTodo mirror is off",

  "cmd.home": "Open the Thinker home page",
  "cmd.startStop": "Start or end a session",
  "cmd.newNote": "New note from the home page",
  "cmd.addManual": "Add a session by hand",
  "cmd.diary": "Open today's diary",
  "cmd.checkLink": "Check the TomaTodo link",

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
  "settings.pins": "Pinned notes",
  "settings.pinsDesc": "One path per line. Pinned notes float to the top of every list",
  "settings.pinsNone": "Empty",
  "settings.hiddenFolders": "Hidden folders",
  "settings.hiddenFoldersHint": "One path per line, subfolders included",

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

  "settings.tomatodo": "TomaTodo",
  "settings.tomatodoIntro": "When a stopwatch session runs here, the same count-up starts inside the 番茄ToDo desktop app. Only the stopwatch is mirrored, and only while this is on.",
  "settings.tdEnabled": "Turn the mirror on",
  "settings.tdEnabledDesc": "Off by default. Nothing is launched or polled until this is on",
  "settings.tdExe": "TomaToDo path",
  "settings.tdExeDesc": "Full path to TomaToDo.exe. It is started with its DevTools port, which is the only way to drive it without the mouse",
  "settings.tdPort": "Debug port",
  "settings.tdPortDesc": "Local port used to talk to the app",
  "settings.tdTask": "Todo name",
  "settings.tdTaskDesc": "The count-up is started on the todo with exactly this name. Create it there once, with the timer set to count-up",
  "settings.tdRestart": "Restart 番茄ToDo when needed",
  "settings.tdRestartDesc": "It allows one copy at a time and drops the debug flag when one is already open",
  "settings.tdPoll": "Check every",
  "settings.tdPollDesc": "Milliseconds between two reads of the timer",
  "settings.tdTest": "Check the link now",
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
  "cmd.stats": "打开专注统计",

  "notes.placeholder": "搜索 {count} 篇笔记",
  "notes.all": "全部",
  "notes.recent": "最近",
  "notes.pinned": "收藏",
  "notes.root": "根目录",
  "notes.direct": "顶层",
  "notes.new": "新建笔记",
  "notes.hint": "↑↓ 选择 · Enter 打开",
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

  "timer.focus": "专注",
  "timer.shortBreak": "短休息",
  "timer.longBreak": "长休息",
  "timer.pomodoro": "番茄钟",
  "timer.stopwatch": "正计时",
  "timer.round": "第 {n} 轮",
  "timer.pause": "暂停",
  "timer.resume": "继续",
  "timer.stop": "结束",
  "timer.idleHint": "点数字开始 · 再点结束",
  "timer.today": "今日 {duration}",

  "cal.title": "{year} 年 {month} 月",
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
  "notice.breakDone": "休息结束",
  "notice.thinkersOn": "番茄ToDo 联动已开启",
  "notice.thinkersOff": "番茄ToDo 联动已关闭",

  "cmd.home": "打开 Thinker 主页",
  "cmd.startStop": "开始或结束一次专注",
  "cmd.newNote": "在主页新建笔记",
  "cmd.addManual": "手动添加一条记录",
  "cmd.diary": "打开今天的日记",
  "cmd.checkLink": "检查番茄ToDo 联动",

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
  "settings.pins": "收藏的笔记",
  "settings.pinsDesc": "一行一个路径。收藏的笔记会浮在所有列表最上面",
  "settings.pinsNone": "空",
  "settings.hiddenFolders": "隐藏的文件夹",
  "settings.hiddenFoldersHint": "一行一个路径，含子文件夹",

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

  "settings.tomatodo": "番茄ToDo",
  "settings.tomatodoIntro": "这里跑起一个正计时时，电脑端番茄ToDo 也同步开始一个正计时。只联动正计时，且只在开关打开时生效。",
  "settings.tdEnabled": "开启联动",
  "settings.tdEnabledDesc": "默认关闭。不打开这一项，插件不会启动、也不会访问任何外部进程",
  "settings.tdExe": "番茄ToDo 路径",
  "settings.tdExeDesc": "TomaToDo.exe 的完整路径。插件会带着调试端口启动它，这是唯一不动鼠标就能控制它的方式",
  "settings.tdPort": "调试端口",
  "settings.tdPortDesc": "和客户端通信的本地端口",
  "settings.tdTask": "待办名称",
  "settings.tdTaskDesc": "正计时会挂在这个名字的待办上。请先在番茄ToDo 里建好它，计时类型设为「正计时」",
  "settings.tdRestart": "需要时重启番茄ToDo",
  "settings.tdRestartDesc": "它同一时间只允许一个实例，已有的一份在跑时会丢掉调试端口参数",
  "settings.tdPoll": "检查间隔",
  "settings.tdPollDesc": "两次读取计时状态的间隔，单位毫秒",
  "settings.tdTest": "立即检查联动",
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

  /* A folder on the list, or anything inside it, stays out of the index. */
  hiddenFolders() {
    return parseLines(this.getSettings().hiddenFolders);
  }

  isHidden(dir) {
    if (!dir) return false;
    return this.hiddenFolders().some((skip) => dir === skip || dir.startsWith(skip + "/"));
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

  categories() {
    const counts = new Map();
    for (const entry of this.entries) {
      const key = entry.folder || "";
      counts.set(key, (counts.get(key) || 0) + 1);
    }
    const list = Array.from(counts.entries())
      .map(([key, count]) => ({ key, label: key || t("notes.root"), count }))
      .sort((a, b) => b.count - a.count);
    return list;
  }

  /* The folders one level down from a top category, empty string meaning "filed
     directly in the category". Only the buckets that exist are returned. */
  subcategories(category) {
    const counts = new Map();
    for (const entry of this.entries) {
      if ((entry.folder || "") !== category) continue;
      const key = entry.sub || "";
      counts.set(key, (counts.get(key) || 0) + 1);
    }
    return Array.from(counts.entries())
      .map(([key, count]) => ({ key, label: key || t("notes.direct"), count }))
      .sort((a, b) => (a.key === "" ? 1 : b.key === "" ? -1 : b.count - a.count));
  }

  pinnedPaths() {
    return parseLines(this.getSettings().pinnedNotes);
  }

  /* Pinned first, then whatever answers the query best, then the newest. */
  list(category, sub, query, limit) {
    const pinned = this.pinnedPaths();
    const pinnedSet = new Set(pinned);
    const recentCut = Date.now() - 7 * 86400000;
    let pool = this.entries;
    if (category === "pinned") pool = pool.filter((entry) => pinnedSet.has(entry.path));
    else if (category === "recent") pool = pool.filter((entry) => entry.mtime >= recentCut);
    else if (category && category !== "all") pool = pool.filter((entry) => (entry.folder || "") === category);
    if (sub != null) pool = pool.filter((entry) => (entry.sub || "") === sub);

    const q = String(query || "").trim();
    const scored = [];
    for (const entry of pool) {
      const pin = pinnedSet.has(entry.path) ? 1 : 0;
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
      scored.push({ entry, score, pin });
    }
    scored.sort((a, b) => {
      if (b.pin !== a.pin) return b.pin - a.pin;
      if (b.score !== a.score) return b.score - a.score;
      return b.entry.mtime - a.entry.mtime;
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
        end: Date.now(),
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

  tick() {
    if (this.state !== "running") return;
    if (this.mode !== "pomodoro" || !this.targetSec) return;
    if (this.elapsedSec() < this.targetSec) return;
    this.completePhase();
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

  /* A timer that spans a restart is closed at the moment Obsidian was saved, not
   * at the moment it is opened again, so a night away cannot become a 9 hour session. */
  restore(runtime) {
    if (!runtime || typeof runtime !== "object") return "idle";
    const saved = Number(runtime.accumulatedSec) || 0;
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
    this.accumulatedSec = saved;
    this.state = "paused";
    if (this.mode === "pomodoro" && this.targetSec > 0 && saved >= this.targetSec) {
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
    this.category = "all";
    this.query = "";
    this.results = [];
    this.rows = [];
    this.selected = 0;
    this.pendingQuery = "";
  }

  render() {
    const root = this.root;
    root.empty();
    root.addClass("thinker-notes");

    const nav = root.createDiv({ cls: "thinker-nav" });
    this.chips = nav.createDiv({ cls: "thinker-chips" });
    this.list = root.createDiv({ cls: "thinker-list" });

    /* The field sits under the list. Reading the list is the main act here;
       searching is what you do after scanning, so it belongs at the bottom. */
    const bar = root.createDiv({ cls: "thinker-search" });
    const icon = bar.createDiv({ cls: "thinker-search-icon" });
    setIcon(icon, "search");
    this.input = bar.createEl("input", {
      cls: "thinker-search-input",
      attr: { type: "text", spellcheck: "false", autocomplete: "off", placeholder: "" }
    });
    this.input.addEventListener("input", () => {
      this.pendingQuery = this.input.value;
      this.selected = 0;
      this.refreshRows();
    });
    this.input.addEventListener("keydown", (evt) => this.onKeyDown(evt));

    const foot = root.createDiv({ cls: "thinker-foot" });
    this.footHint = foot.createSpan({ cls: "thinker-foot-hint" });

    this.refresh();
  }

  refresh() {
    this.renderChips();
    this.refreshRows();
    const total = this.deps.index.entries.length;
    this.input.placeholder = t("notes.placeholder", { count: total.toLocaleString(lang === "zh" ? "zh-CN" : "en-US") });
    this.footHint.setText(t("notes.hint"));
  }

  renderChips() {
    const chips = this.chips;
    chips.empty();
    const total = this.deps.index.entries.length;
    const pinned = this.deps.index.pinnedPaths().length;
    const items = [
      { key: "all", label: t("notes.all"), count: total },
      { key: "recent", label: t("notes.recent"), count: null },
      { key: "pinned", label: t("notes.pinned"), count: pinned || null }
    ];
    for (const cat of this.deps.index.categories()) {
      items.push({ key: cat.key, label: cat.label, count: cat.count });
    }
    if (this.category !== "all" && this.category !== "recent" && this.category !== "pinned") {
      const known = items.some((item) => item.key === this.category);
      if (!known) {
        this.category = "all";
      }
    }
    for (const item of items) {
      const chip = chips.createSpan({
        cls: item.key === this.category ? "thinker-chip is-on" : "thinker-chip",
        text: item.label
      });
      if (item.count != null) chip.createSpan({ cls: "thinker-chip-count", text: String(item.count) });
      chip.addEventListener("click", () => {
        this.category = item.key;
        this.selected = 0;
        this.renderChips();
        this.refreshRows();
      });
    }

    /* The plus follows the last range instead of floating at the far right: with
       folders it ends up after the folders, without folders after 收藏. */
    this.newBtn = chips.createEl("button", { cls: "thinker-new", text: "+" });
    this.newBtn.setAttribute("aria-label", t("notes.new"));
    this.newBtn.setAttribute("title", t("notes.new"));
    this.newBtn.addEventListener("click", () => this.createFromQuery());
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
    this.renderList();
  }

  /* Folders are the headings of the list and notes sit under them. Level is a size,
     not a glyph: a top folder is the largest text on the panel, its child steps
     down, and every note keeps one column at the same left edge. */
  renderList() {
    const list = this.list;
    list.empty();
    this.rows = [];
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

    const addRow = (entry) => {
      const row = list.createDiv({ cls: "thinker-note" });
      if (pinnedSet.has(entry.path)) row.addClass("is-pinned");
      const main = row.createDiv({ cls: "thinker-note-main" });
      main.createDiv({ cls: "thinker-note-title", text: entry.title || t("notes.untitled") });
      const meta = entry.snippet ? entry.snippet : entry.parent || t("notes.root");
      main.createDiv({ cls: "thinker-note-meta", text: meta });
      row.createSpan({ cls: "thinker-note-when", text: relativeTime(entry.mtime) });
      const index = this.rows.length;
      this.rows.push(row);
      if (index === this.selected) row.addClass("is-selected");
      row.addEventListener("click", (evt) => {
        this.selected = index;
        this.markSelection();
        this.openEntry(entry, evt.ctrlKey || evt.metaKey);
      });
      row.addEventListener("contextmenu", (evt) => {
        evt.preventDefault();
        this.openMenu(entry, evt);
      });
    };

    if (!showFolders) {
      for (const entry of this.results) addRow(entry);
      this.markSelection();
      return;
    }

    const emitNotes = (dir) => {
      for (const entry of byDir.get(dir) || []) addRow(entry);
    };

    const walk = (dir, depth) => {
      emitNotes(dir);
      const kids = [...(children.get(dir) || [])].sort((a, b) => a.localeCompare(b, "zh"));
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

  markSelection() {
    (this.rows || []).forEach((row, index) => {
      if (row && row.toggleClass) row.toggleClass("is-selected", index === this.selected);
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
      const entry = this.results[this.selected];
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
    this.selected = (this.selected + delta + this.rows.length) % this.rows.length;
    this.markSelection();
    const node = this.rows[this.selected];
    if (node && node.scrollIntoView) node.scrollIntoView({ block: "nearest" });
  }

  openEntry(entry, newTab) {
    const file = entry.file || this.deps.app.vault.getAbstractFileByPath(entry.path);
    if (!file) return;
    const leaf = newTab ? this.deps.app.workspace.getLeaf("tab") : this.deps.app.workspace.getLeaf(false);
    void leaf.openFile(file);
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
      await app.workspace.getLeaf(false).openFile(file);
    } catch (e) {
      new Notice(String(e && e.message ? e.message : e));
    }
  }
}

/* ----------------------------------------------------------- 7  TimerPanel */

const RING_RADIUS = 44;
const RING_LENGTH = 2 * Math.PI * RING_RADIUS;

class TimerPanel {
  constructor(root, deps) {
    this.root = root;
    this.deps = deps;
    this.todaySec = 0;
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

    this.footEl = root.createDiv({ cls: "thinker-timer-foot" });
    this.refresh();
  }

  toggle() {
    const engine = this.deps.engine;
    if (engine.state === "idle") engine.start();
    else engine.stop();
  }

  setTodaySec(sec) {
    this.todaySec = sec;
    if (this.footEl && this.deps.engine.state === "idle") this.renderFoot();
  }

  renderFoot() {
    const engine = this.deps.engine;
    if (engine.state === "idle") {
      this.footEl.setText(t("timer.today", { duration: formatDuration(this.todaySec) }));
      return;
    }
    if (engine.mode === "pomodoro" && engine.round > 0) {
      this.footEl.setText(
        `${t("timer.round", { n: engine.round + 1 })} · ${t("timer.today", { duration: formatDuration(this.todaySec) })}`
      );
      return;
    }
    this.footEl.setText(t("timer.idleHint"));
  }

  refresh() {
    const engine = this.deps.engine;
    const phaseKey = engine.mode === "pomodoro" && engine.phase !== "focus" ? `timer.${engine.phase}` : `timer.${engine.mode}`;
    this.root.dataset.state = engine.state;
    this.root.dataset.phase = engine.phase;
    this.phaseEl.setText(t(phaseKey));
    this.phaseEl.toggleClass("is-switch", engine.state === "idle");
    this.actions.toggleClass("is-hidden", engine.state === "idle");
    this.pauseBtn.setText(t(engine.state === "paused" ? "timer.resume" : "timer.pause"));
    this.stopBtn.setText(t("timer.stop"));
    this.renderFoot();
    this.onTick();
  }

  onTick() {
    const engine = this.deps.engine;
    const snapshot = engine.snapshot();
    let value;
    let ratio;
    if (snapshot.mode === "pomodoro") {
      value = snapshot.state === "idle" ? Math.max(1, this.deps.getSettings().focusMinutes) * 60 : snapshot.remainingSec;
      const target = snapshot.targetSec || Math.max(1, this.deps.getSettings().focusMinutes) * 60;
      ratio = Math.max(0, Math.min(1, value / target));
    } else {
      value = snapshot.elapsedSec;
      ratio = (snapshot.elapsedSec % 3600) / 3600;
    }
    this.timeEl.setText(formatClock(value));
    this.arc.setAttribute("stroke-dashoffset", String(RING_LENGTH * (1 - ratio)));
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
    const root = this.root;
    root.empty();
    root.addClass("thinker-cal");

    const nav = root.createDiv({ cls: "thinker-cal-nav" });
    const prev = nav.createEl("button", { cls: "thinker-cal-btn", text: "‹" });
    prev.setAttribute("aria-label", "previous month");
    prev.addEventListener("click", () => this.shift(-1));
    this.label = nav.createSpan({ cls: "thinker-cal-label" });
    const next = nav.createEl("button", { cls: "thinker-cal-btn", text: "›" });
    next.setAttribute("aria-label", "next month");
    next.addEventListener("click", () => this.shift(1));

    const weekdays = root.createDiv({ cls: "thinker-cal-weekdays" });
    for (const name of weekdayLabels(this.deps.getSettings().weekStart)) {
      weekdays.createSpan({ cls: "thinker-cal-weekday", text: name });
    }
    this.grid = root.createDiv({ cls: "thinker-cal-grid" });
    void this.refresh();
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
    const maxSec = Math.max(goalSec, ...Array.from(this.monthData.values()).map((item) => item.focusSec || 0));
    for (const key of cells) {
      if (!key) {
        grid.createDiv({ cls: "thinker-day is-blank" });
        continue;
      }
      const info = this.monthData.get(key);
      const day = grid.createDiv({ cls: "thinker-day" });
      if (key === today) day.addClass("is-today");
      if (info && info.focusSec > 0) {
        const level = Math.max(1, Math.min(4, Math.ceil((info.focusSec / maxSec) * 4)));
        day.addClass(`thinker-heat-${level}`);
        day.setAttribute("aria-label", t("cal.heat", { count: info.count }));
      }
      day.createSpan({ cls: "thinker-day-num", text: String(Number(key.slice(-2))) });
      day.createSpan({ cls: "thinker-day-dot" });
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
  }

  getViewType() {
    return VIEW_TYPE;
  }

  getDisplayText() {
    return "Thinker";
  }

  getIcon() {
    return "home";
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

    const bar = page.createDiv({ cls: "thinker-clockbar" });
    const left = bar.createDiv({ cls: "thinker-clock" });
    this.timeEl = left.createDiv({ cls: "thinker-time-lg" });
    const right = bar.createDiv({ cls: "thinker-clock-right" });
    this.dateEl = right.createDiv({ cls: "thinker-date" });

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
      getSettings: this.deps.getSettings
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
  }

  applySide() {
    if (!this.grid) return;
    this.grid.toggleClass("is-swapped", this.deps.getSettings().side === "notes-right");
  }

  updateClock() {
    const now = new Date();
    const settings = this.deps.getSettings();
    const value = settings.showSeconds
      ? `${pad2(now.getHours())}:${pad2(now.getMinutes())}:${pad2(now.getSeconds())}`
      : `${pad2(now.getHours())}:${pad2(now.getMinutes())}`;
    if (value === this.lastClock) return;
    this.lastClock = value;
    this.timeEl.setText(value);
    const weekday = weekdayLabels(1)[(now.getDay() + 6) % 7];
    this.dateEl.setText(
      lang === "zh"
        ? `周${weekday} · ${now.getMonth() + 1} 月 ${now.getDate()} 日`
        : `${weekday} · ${now.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
    );
  }

  async refreshToday() {
    const records = await this.deps.storage.getDay(todayKey());
    const sec = sumFocusDuration(records);
    if (this.timer) this.timer.setTodaySec(sec);
  }

  onTick() {
    this.updateClock();
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
    await app.workspace.getLeaf(false).openFile(existing);
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
  await app.workspace.getLeaf(false).openFile(file);
}

/* --------------------------------------------------------------- 11  Modals */

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
      bar.style.setProperty("--thinker-bar", `${values[index] > 0 ? Math.max(4, Math.round((values[index] / max) * 100)) : 0}%`);
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

/* ------------------------------------------------ 12  TomaTodo (desktop only)

 * Driving the 番茄ToDo client needs its DevTools port: the app exposes no other
 * interface, and the alternative would be synthetic mouse events. Everything here
 * is inert until the setting is switched on. */

const TD_HELPERS = `
  var sleep = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };
  var q = function (sel) { return document.querySelector(sel); };
  var activeId = function () { var el = q('.page.active'); return el ? el.id : null; };
  var statusText = function () { var el = q('#timer-status'); return el ? (el.innerText || '').trim() : ''; };
  var taskName = function () { var el = q('#timer-task-name'); return el ? (el.innerText || '').trim() : ''; };
  var timerTime = function () { var el = q('#timer-time'); return el ? (el.innerText || '').trim() : ''; };
  var waitFor = async function (fn, ms) {
    var end = Date.now() + ms;
    while (Date.now() < end) { if (fn()) return true; await sleep(150); }
    return false;
  };
  var dialogOpen = function () { return !!q('#custom-dialog-overlay.show'); };
  var confirmDialog = async function () {
    if (!dialogOpen()) return false;
    var btn = q('#custom-dialog-overlay .custom-dialog-btn.primary');
    if (!btn) return false;
    btn.click();
    await waitFor(function () { return !dialogOpen(); }, 2000);
    return true;
  };
  var result = function (ok, state, extra) {
    var base = { ok: ok, state: state, page: activeId(), status: statusText(), name: taskName(), time: timerTime() };
    if (extra) { for (var key in extra) base[key] = extra[key]; }
    return base;
  };
`;

function buildStartScript(taskName) {
  return `(async function () {
    ${TD_HELPERS}
    var NAME = ${JSON.stringify(taskName)};
    if (activeId() === 'page-timer') {
      if (statusText().indexOf('\u4E13\u6CE8') >= 0) return result(true, 'already-running');
      if (q('#stop-btn')) q('#stop-btn').click();
      await sleep(400);
      await confirmDialog();
      await waitFor(function () { return activeId() === 'page-list'; }, 3000);
    }
    if (activeId() === 'page-not-synced' || activeId() === 'page-disconnect') return result(false, 'not-bound');
    if (!(await waitFor(function () { return activeId() === 'page-list'; }, 3000))) return result(false, 'unexpected-page');
    var items = Array.prototype.slice.call(document.querySelectorAll('#todo-list .todo-item'));
    var target = null;
    for (var i = 0; i < items.length; i++) {
      var label = items[i].querySelector('.todo-name');
      if (label && (label.innerText || '').trim() === NAME) { target = items[i]; break; }
    }
    if (!target) return result(false, 'task-not-found');
    var startBtn = target.querySelector('.todo-start-btn');
    if (!startBtn) return result(false, 'no-start-button');
    startBtn.click();
    var up = await waitFor(function () {
      return activeId() === 'page-timer' && statusText().indexOf('\u4E13\u6CE8') >= 0;
    }, 4000);
    return result(up, up ? 'started' : 'not-running');
  })()`;
}

function buildStopScript() {
  return `(async function () {
    ${TD_HELPERS}
    if (activeId() !== 'page-timer') return result(true, 'idle');
    if (statusText().indexOf('\u4E13\u6CE8') < 0) return result(true, 'not-focusing');
    if (q('#stop-btn')) q('#stop-btn').click();
    await sleep(400);
    var confirmed = await confirmDialog();
    if (!confirmed) return result(false, 'stop-failed');
    if (await waitFor(function () { return statusText().indexOf('\u4F11\u606F') >= 0; }, 3000)) {
      if (q('#stop-btn')) q('#stop-btn').click();
      await sleep(400);
      await confirmDialog();
      await waitFor(function () { return activeId() === 'page-list'; }, 3000);
    }
    return result(true, 'stopped');
  })()`;
}

function buildProbeScript() {
  return `(async function () { ${TD_HELPERS} return result(true, 'probe'); })()`;
}

/* A minimal websocket client. The client speaks CDP over one socket, and the only
 * frames this bridge sends are text frames. */
class CdpConnection {
  constructor(socket, onFail) {
    const { Buffer } = require("buffer");
    this.Buffer = Buffer;
    this.socket = socket;
    this.onFail = onFail;
    this.buffer = Buffer.alloc(0);
    this.upgradeBuffer = Buffer.alloc(0);
    this.fragments = [];
    this.pending = new Map();
    this.nextId = 0;
    this.closed = false;
    this.handshaken = false;
    this.onUpgraded = null;
    socket.on("data", (chunk) => this.onData(chunk));
    socket.on("close", () => this.fail(new Error("connection closed")));
    socket.on("error", (error) => this.fail(error));
  }

  static open(url, timeoutMs) {
    const net = require("net");
    const crypto = require("crypto");
    const match = /^ws:\/\/([^/:]+):(\d+)(\/.*)?$/.exec(url);
    if (!match) return Promise.reject(new Error("bad websocket url: " + url));
    const host = match[1];
    const port = Number(match[2]);
    const path = match[3] || "/";
    return new Promise((resolve, reject) => {
      const key = crypto.randomBytes(16).toString("base64");
      const socket = net.createConnection({ host, port });
      let settled = false;
      const timer = window.setTimeout(() => {
        if (settled) return;
        settled = true;
        socket.destroy();
        reject(new Error("websocket handshake timed out"));
      }, timeoutMs || 4000);
      const conn = new CdpConnection(socket, (error) => {
        if (settled) return;
        settled = true;
        window.clearTimeout(timer);
        reject(error);
      });
      socket.once("error", (error) => {
        if (settled) return;
        settled = true;
        window.clearTimeout(timer);
        reject(error);
      });
      socket.once("connect", () => {
        socket.write(
          "GET " + path + " HTTP/1.1\r\n" +
            "Host: " + host + ":" + port + "\r\n" +
            "Upgrade: websocket\r\n" +
            "Connection: Upgrade\r\n" +
            "Sec-WebSocket-Key: " + key + "\r\n" +
            "Sec-WebSocket-Version: 13\r\n\r\n"
        );
      });
      conn.onUpgraded = () => {
        if (settled) return;
        settled = true;
        window.clearTimeout(timer);
        resolve(conn);
      };
    });
  }

  call(method, params, timeoutMs) {
    if (this.closed) return Promise.reject(new Error("connection closed"));
    const id = ++this.nextId;
    return new Promise((resolve, reject) => {
      const timer = window.setTimeout(() => {
        this.pending.delete(id);
        reject(new Error(method + " timed out"));
      }, timeoutMs || 6000);
      this.pending.set(id, { resolve, reject, timer });
      try {
        this.socket.write(this.encodeFrame(JSON.stringify({ id, method, params }), 1));
      } catch (error) {
        window.clearTimeout(timer);
        this.pending.delete(id);
        reject(error);
      }
    });
  }

  close() {
    if (this.closed) return;
    this.closed = true;
    try {
      this.socket.write(this.encodeFrame("", 8));
    } catch (e) {
      /* already gone */
    }
    this.socket.destroy();
    this.rejectAll(new Error("connection closed"));
  }

  fail(error) {
    if (this.closed) return;
    this.closed = true;
    this.socket.destroy();
    if (this.onFail) this.onFail(error);
    this.rejectAll(error);
  }

  rejectAll(error) {
    for (const entry of this.pending.values()) {
      window.clearTimeout(entry.timer);
      entry.reject(error);
    }
    this.pending.clear();
  }

  onData(chunk) {
    if (!this.handshaken) {
      this.upgradeBuffer = this.Buffer.concat([this.upgradeBuffer, chunk]);
      const end = this.upgradeBuffer.indexOf("\r\n\r\n");
      if (end < 0) return;
      const head = this.upgradeBuffer.subarray(0, end).toString("latin1");
      const status = Number(head.split(" ")[1]);
      if (status !== 101) {
        this.fail(new Error("upgrade rejected with status " + status));
        return;
      }
      this.handshaken = true;
      const rest = this.upgradeBuffer.subarray(end + 4);
      this.upgradeBuffer = this.Buffer.alloc(0);
      if (this.onUpgraded) this.onUpgraded();
      if (rest.length > 0) this.onData(rest);
      return;
    }
    this.buffer = this.Buffer.concat([this.buffer, chunk]);
    while (this.readFrame()) {
      /* keep draining the socket */
    }
  }

  readFrame() {
    const buf = this.buffer;
    if (buf.length < 2) return false;
    const first = buf[0];
    const second = buf[1];
    const fin = (first & 128) !== 0;
    const opcode = first & 15;
    const masked = (second & 128) !== 0;
    let length = second & 127;
    let offset = 2;
    if (length === 126) {
      if (buf.length < 4) return false;
      length = buf.readUInt16BE(2);
      offset = 4;
    } else if (length === 127) {
      if (buf.length < 10) return false;
      length = buf.readUInt32BE(6);
      offset = 10;
    }
    let mask = null;
    if (masked) {
      if (buf.length < offset + 4) return false;
      mask = buf.subarray(offset, offset + 4);
      offset += 4;
    }
    if (buf.length < offset + length) return false;
    let payload = buf.subarray(offset, offset + length);
    if (mask) {
      const copy = this.Buffer.alloc(length);
      for (let i = 0; i < length; i++) copy[i] = payload[i] ^ mask[i & 3];
      payload = copy;
    }
    this.buffer = buf.subarray(offset + length);
    if (opcode === 9) {
      try {
        this.socket.write(this.encodeFrame("", 10, payload));
      } catch (e) {
        /* a ping is best effort */
      }
      return true;
    }
    if (opcode === 10) return true;
    if (opcode === 8) {
      this.fail(new Error("server closed the connection"));
      return false;
    }
    if (opcode === 1 || opcode === 0) {
      this.fragments.push(payload.toString("utf8"));
      if (fin) {
        const text = this.fragments.join("");
        this.fragments = [];
        this.dispatch(text);
      }
      return true;
    }
    return true;
  }

  dispatch(text) {
    let message;
    try {
      message = JSON.parse(text);
    } catch (e) {
      return;
    }
    if (typeof message.id !== "number") return;
    const entry = this.pending.get(message.id);
    if (!entry) return;
    this.pending.delete(message.id);
    window.clearTimeout(entry.timer);
    if (message.error) entry.reject(new Error(message.error.message || "protocol error"));
    else entry.resolve(message.result);
  }

  encodeFrame(text, opcode, rawPayload) {
    const crypto = require("crypto");
    const payload = rawPayload ? rawPayload : this.Buffer.from(text, "utf8");
    const length = payload.length;
    const head = [128 | (opcode || 1)];
    if (length < 126) head.push(128 | length);
    else if (length < 65536) head.push(128 | 126, (length >> 8) & 255, length & 255);
    else head.push(128 | 127, 0, 0, 0, 0, (length >>> 24) & 255, (length >>> 16) & 255, (length >>> 8) & 255, length & 255);
    const mask = crypto.randomBytes(4);
    const out = this.Buffer.alloc(head.length + 4 + length);
    this.Buffer.from(head).copy(out, 0);
    mask.copy(out, head.length);
    for (let i = 0; i < length; i++) out[head.length + 4 + i] = payload[i] ^ mask[i & 3];
    return out;
  }
}

const TD_BLOCKED = new Set(["not-installed", "needs-restart", "not-bound", "task-not-found", "unexpected-page"]);
const TD_TRANSIENT = /Target crashed|Execution context was destroyed|Cannot find context|no page target|connection closed|websocket/i;
const TD_SAFE_FLAGS = ["--disable-gpu", "--no-sandbox"];

class TomatodoBridge {
  constructor(getSettings) {
    this.getSettings = getSettings;
    this.queue = Promise.resolve();
    this.safeMode = false;
  }

  start() {
    return this.enqueue(() => this.attempt(() => this.doStart()));
  }

  stop() {
    return this.enqueue(() => this.attempt(() => this.doStop()));
  }

  check() {
    return this.enqueue(() => this.attempt(() => this.doCheck()));
  }

  enqueue(task) {
    const run = this.queue
      .then(task, task)
      .catch((error) => ({ ok: false, state: "error", code: "internal", detail: String(error && error.message ? error.message : error) }));
    this.queue = run;
    return run;
  }

  async attempt(task) {
    const run = async () => {
      try {
        return await task();
      } catch (error) {
        return { ok: false, state: "error", code: "internal", detail: String(error && error.message ? error.message : error) };
      }
    };
    const first = await run();
    if (first.ok || TD_BLOCKED.has(first.code || "internal") || this.safeMode) return first;
    this.safeMode = true;
    await this.quitRunning();
    await delay(600);
    return run();
  }

  port() {
    const value = Number(this.getSettings().tomatodoPort);
    return Number.isFinite(value) && value > 0 ? Math.round(value) : 9222;
  }

  exe() {
    return String(this.getSettings().tomatodoExe || "").trim();
  }

  doStart() {
    return this.ensureRunning().then(async (ready) => {
      if (ready !== "ready") return { ok: false, state: ready, code: ready };
      const raw = await this.evaluate(buildStartScript(this.getSettings().tomatodoTask), 25000);
      return normaliseTd(raw);
    });
  }

  doStop() {
    return this.portOpen().then(async (open) => {
      if (!open) return { ok: true, state: "not-running" };
      const raw = await this.evaluate(buildStopScript(), 20000);
      return normaliseTd(raw);
    });
  }

  doCheck() {
    return this.ensureRunning().then(async (ready) => {
      if (ready !== "ready") return { ok: false, state: ready, code: ready };
      const raw = await this.evaluate(buildProbeScript(), 8000);
      return normaliseTd(raw);
    });
  }

  async portOpen() {
    try {
      await this.getJson(`http://127.0.0.1:${this.port()}/json/version`, 800);
      return true;
    } catch (e) {
      return false;
    }
  }

  async ensureRunning() {
    if (await this.portOpen()) return "ready";
    const exe = this.exe();
    if (!exe) return "not-installed";
    if (await this.isRunning()) {
      if (!this.getSettings().tomatodoRestart) return "needs-restart";
      await this.quitRunning();
    }
    const first = await this.launch(exe, this.safeMode ? TD_SAFE_FLAGS : []);
    if (first === "missing") return "not-installed";
    if (await this.waitForPort(9000)) return "ready";
    const second = await this.launch(exe, TD_SAFE_FLAGS);
    if (second === "missing") return "not-installed";
    if (await this.waitForPort(9000)) return "ready";
    return "launch-failed";
  }

  isRunning() {
    const cp = require("child_process");
    const name = String(this.exe().split(/[\\/]/).pop() || "").replace(/\.exe$/i, "");
    if (!name) return Promise.resolve(false);
    return new Promise((resolve) => {
      cp.execFile("tasklist", ["/FI", `IMAGENAME eq ${name}.exe`, "/NH"], { windowsHide: true }, (error, stdout) => {
        if (error) {
          resolve(false);
          return;
        }
        resolve(String(stdout).toLowerCase().includes(name.toLowerCase() + ".exe"));
      });
    });
  }

  launch(exe, extra) {
    const cp = require("child_process");
    return new Promise((resolve) => {
      let settled = false;
      const done = (result) => {
        if (settled) return;
        settled = true;
        resolve(result);
      };
      const env = { ...process.env };
      delete env.ELECTRON_RUN_AS_NODE;
      delete env.NODE_OPTIONS;
      try {
        const child = cp.spawn(exe, [`--remote-debugging-port=${this.port()}`, ...extra], {
          cwd: exe.replace(/[\\/][^\\/]+$/, ""),
          detached: true,
          stdio: "ignore",
          env
        });
        child.once("error", (error) => done(error && error.code === "ENOENT" ? "missing" : "failed"));
        child.unref();
        window.setTimeout(() => done("ok"), 600);
      } catch (e) {
        done("failed");
      }
    });
  }

  async waitForPort(timeoutMs) {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
      if (await this.portOpen()) {
        await this.waitForTarget(6000);
        return true;
      }
      await delay(300);
    }
    return false;
  }

  async waitForTarget(timeoutMs) {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
      try {
        const list = await this.getJson(`http://127.0.0.1:${this.port()}/json/list`, 1500);
        const hasPage = Array.isArray(list) && list.some((item) => item.type === "page" && typeof item.webSocketDebuggerUrl === "string");
        if (hasPage) {
          await delay(700);
          return;
        }
      } catch (e) {
        /* the port answers before the renderer is ready */
      }
      await delay(250);
    }
  }

  async quitRunning() {
    await runTaskkill(["/IM", "TomaToDo.exe"]);
    await delay(1500);
    await runTaskkill(["/F", "/IM", "TomaToDo.exe"]);
    await delay(800);
  }

  async evaluate(expression, timeoutMs) {
    let lastError = new Error("evaluate failed");
    for (let attempt = 0; attempt < 4; attempt++) {
      try {
        return await this.evaluateOnce(expression, timeoutMs);
      } catch (error) {
        lastError = error;
        if (!TD_TRANSIENT.test(String(error && error.message ? error.message : error))) throw error;
        await delay(500 + attempt * 400);
      }
    }
    throw lastError;
  }

  async evaluateOnce(expression, timeoutMs) {
    const list = await this.getJson(`http://127.0.0.1:${this.port()}/json/list`, 2000);
    const page = Array.isArray(list)
      ? list.find((item) => item.type === "page" && typeof item.webSocketDebuggerUrl === "string")
      : null;
    if (!page) throw new Error("no page target on the debug port");
    const connection = await CdpConnection.open(String(page.webSocketDebuggerUrl), 4000);
    try {
      const reply = await connection.call("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true }, timeoutMs);
      if (reply && reply.exceptionDetails) throw new Error(reply.exceptionDetails.text || "script threw");
      return reply && reply.result ? reply.result.value : undefined;
    } finally {
      connection.close();
    }
  }

  getJson(url, timeoutMs) {
    const http = require("http");
    return new Promise((resolve, reject) => {
      const request = http.get(url, (response) => {
        let body = "";
        response.setEncoding("utf8");
        response.on("data", (chunk) => {
          body += chunk;
        });
        response.on("end", () => {
          try {
            resolve(JSON.parse(body));
          } catch (error) {
            reject(error);
          }
        });
      });
      request.on("error", reject);
      request.on("socket", (socket) => {
        socket.setTimeout(timeoutMs, () => request.destroy(new Error("timeout")));
      });
    });
  }
}

function normaliseTd(raw) {
  if (!raw || typeof raw !== "object") return { ok: false, state: "unknown", code: "protocol", detail: "empty reply" };
  const state = String(raw.state || "unknown");
  const detail = [raw.page, raw.status].filter(Boolean).join(" / ");
  if (raw.ok === true) return { ok: true, state, detail };
  const code = state === "not-bound" || state === "task-not-found" || state === "unexpected-page" ? state : "internal";
  return { ok: false, state, code, detail };
}

function runTaskkill(args) {
  const cp = require("child_process");
  return new Promise((resolve) => {
    try {
      cp.execFile("taskkill", args, { windowsHide: true }, () => resolve());
    } catch (e) {
      resolve();
    }
  });
}

function delay(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

/* ------------------------------------------------------------ 13  Settings */

const DEFAULT_SETTINGS = {
  openOnStartup: true,
  collapseLeftSidebar: true,
  side: "notes-left",
  showSeconds: false,
  indexRoots: "",
  searchScope: "title",
  listLimit: 40,
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
  tomatodoEnabled: false,
  tomatodoExe: "C:\\Program Files\\TomaToDo\\TomaToDo.exe",
  tomatodoPort: 9222,
  tomatodoTask: "专注",
  tomatodoRestart: true,
  tomatodoPollMs: 700
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
    tomatodoEnabled: flag("tomatodoEnabled"),
    tomatodoExe: text("tomatodoExe"),
    tomatodoPort: num("tomatodoPort", 1024, 65535),
    tomatodoTask: text("tomatodoTask"),
    tomatodoRestart: flag("tomatodoRestart"),
    tomatodoPollMs: num("tomatodoPollMs", 300, 5000)
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
        .setLimits(10, 200, 10)
        .setValue(Math.min(200, Math.max(10, settings.listLimit)))
        .setDynamicTooltip()
        .onChange((value) => {
          settings.listLimit = value;
          commit();
          this.plugin.refreshNoteViews();
        })
    );

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

    new Setting(containerEl)
      .setName(t("settings.dataPath"))
      ;

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

    containerEl.createEl("h3", { text: t("settings.tomatodo") });

    new Setting(containerEl)
      .setName(t("settings.tdEnabled"))
      
      .addToggle((toggle) =>
        toggle.setValue(settings.tomatodoEnabled).onChange((value) => {
          settings.tomatodoEnabled = value;
          commit();
          this.plugin.restartTomatodo();
          new Notice(t(value ? "notice.thinkersOn" : "notice.thinkersOff"));
        })
      );

    new Setting(containerEl)
      .setName(t("settings.tdExe"))
      
      .addText((text) => {
        text.setValue(settings.tomatodoExe);
        text.onChange((value) => {
          settings.tomatodoExe = value.trim();
          commit();
        });
      });

    new Setting(containerEl)
      .setName(t("settings.tdPort"))
      
      .addText((text) => {
        text.inputEl.type = "number";
        text.setValue(String(settings.tomatodoPort));
        text.onChange((value) => {
          const parsed = Number(value);
          if (!Number.isFinite(parsed)) return;
          settings.tomatodoPort = Math.min(65535, Math.max(1024, Math.round(parsed)));
          commit();
        });
      });

    new Setting(containerEl)
      .setName(t("settings.tdTask"))
      
      .addText((text) => {
        text.setValue(settings.tomatodoTask);
        text.onChange((value) => {
          settings.tomatodoTask = value.trim();
          commit();
        });
      });

    new Setting(containerEl)
      .setName(t("settings.tdRestart"))
      
      .addToggle((toggle) =>
        toggle.setValue(settings.tomatodoRestart).onChange((value) => {
          settings.tomatodoRestart = value;
          commit();
        })
      );

    new Setting(containerEl)
      .setName(t("settings.tdPoll"))
      
      .addText((text) => {
        text.inputEl.type = "number";
        text.setValue(String(settings.tomatodoPollMs));
        text.onChange((value) => {
          const parsed = Number(value);
          if (!Number.isFinite(parsed)) return;
          settings.tomatodoPollMs = Math.min(5000, Math.max(300, Math.round(parsed)));
          commit();
          this.plugin.restartTomatodo();
        });
      });

    new Setting(containerEl).addButton((btn) =>
      btn.setButtonText(t("settings.tdTest")).onClick(() => void this.plugin.checkTomatodo())
    );

    containerEl.createEl("h3", { text: t("settings.about") });
    containerEl.createEl("p", { text: `Thinker ${this.plugin.manifest.version}` });
  }
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
    this.bridge = null;
    this.tdHandle = null;
    this.tdMirroring = false;
    this.tdRetryAfter = 0;
    this.tdNoticed = new Set();
    this.ready = false;
  }

  async onload() {
    initLocale();
    const data = await this.loadData();
    this.settings = readSettings(data && data.settings);
    this.storage = new DayStore(this.app, () => this.settings);
    this.index = new NoteIndex(
      this.app,
      () => this.settings,
      debounce(() => this.refreshNoteViews(), 400)
    );
    this.bridge = new TomatodoBridge(() => this.settings);
    this.engine = new TimerEngine(() => this.settings, this.buildHooks());

    console.log("[Thinker] build " + BUILD);
    this.registerView(VIEW_TYPE, (leaf) => new HomeView(leaf, this.viewDeps()));
    this.registerView(STATS_VIEW_TYPE, (leaf) => new StatsView(leaf, this.statsDeps()));
    this.addSettingTab(new ThinkerSettingTab(this.app, this));
    this.addCommands();
    this.addRibbonIcon("home", t("ribbon.home"), () => void this.openHome(false));
    this.addRibbonIcon("bar-chart-2", t("ribbon.stats"), () => void this.openStats());

    if (Platform.isDesktop) {
      this.statusBar = this.addStatusBarItem();
      this.statusBar.addClass("thinker-status");
      this.updateStatus();
    }

    const restored = this.engine.restore(data && data.runtime);
    if (restored === "completed") new Notice(t("notice.recovered"));

    this.registerInterval(window.setInterval(() => this.tick(), 1000));
    const wake = () => {
      this.engine.tick();
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
     away when it is needed. */
  collapseLeftSidebar() {
    const split = this.app.workspace.leftSplit;
    if (!split || split.collapsed) return;
    try {
      split.collapse();
    } catch (error) {
      console.error("Thinker: could not collapse the left sidebar", error);
    }
  }

  onReady() {
    this.ready = true;
    this.index.rebuild();
    this.refreshAll();
    this.registerVaultEvents();
    this.restartTomatodo();
    if (this.settings.collapseLeftSidebar) this.collapseLeftSidebar();
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
    this.engine.tick();
    for (const view of this.homeViews()) view.onTick();
    this.updateStatus();
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

  async openHome(onlyIfEmpty) {
    const { workspace } = this.app;
    const existing = workspace.getLeavesOfType(VIEW_TYPE);
    if (existing.length > 0) {
      await workspace.revealLeaf(existing[0]);
      return;
    }
    if (onlyIfEmpty) {
      const openNotes = workspace.getLeavesOfType("markdown").filter((leaf) => leaf.view && leaf.view.file);
      if (openNotes.length > 0) return;
    }
    try {
      const leaf = workspace.getLeaf("tab");
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
    this.addCommand({ id: "check-tomatodo", name: t("cmd.checkLink"), callback: () => void this.checkTomatodo() });
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

  /* -------------------------------------------------- TomaTodo mirror loop */

  restartTomatodo() {
    if (this.tdHandle !== null) {
      window.clearInterval(this.tdHandle);
      this.tdHandle = null;
    }
    if (!this.settings.tomatodoEnabled || !Platform.isDesktop) {
      if (this.tdMirroring) {
        this.tdMirroring = false;
        void this.bridge.stop();
      }
      return;
    }
    const interval = Math.max(300, Math.round(this.settings.tomatodoPollMs));
    this.tdHandle = window.setInterval(() => this.pollTomatodo(), interval);
  }

  pollTomatodo() {
    if (!this.settings.tomatodoEnabled) return;
    const snapshot = this.engine.snapshot();
    const active = snapshot.state !== "idle" && snapshot.mode === "stopwatch";
    if (active === this.tdMirroring) return;
    if (active && Date.now() < this.tdRetryAfter) return;
    this.settleTomatodo(active);
  }

  settleTomatodo(active) {
    this.tdMirroring = active;
    const task = active ? this.bridge.start() : this.bridge.stop();
    void task.then((outcome) => {
      if (!outcome.ok) {
        if (active) {
          this.tdMirroring = false;
          this.tdRetryAfter = Date.now() + 30000;
        }
        if (!this.tdNoticed.has(outcome.state)) {
          this.tdNoticed.add(outcome.state);
          new Notice(`TomaTodo: ${outcome.state}`, 8000);
        }
      } else if (outcome.ok) {
        this.tdNoticed.clear();
      }
    });
  }

  async checkTomatodo() {
    if (!this.settings.tomatodoEnabled) {
      new Notice(t("notice.thinkersOff"));
      return;
    }
    const outcome = await this.bridge.check();
    new Notice(outcome.ok ? `TomaTodo: ok${outcome.detail ? " · " + outcome.detail : ""}` : `TomaTodo: ${outcome.state}`, 8000);
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
  RecordModal,
  openDiary,
  diaryPathFor
};




