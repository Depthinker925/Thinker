# Thinker

Obsidian 起始页插件：一个视图里放着时钟、笔记清单、专注计时器和一张月历。仅桌面端。

A start page for Obsidian: a clock, the vault's notes as an outline, a focus timer, and a month of focus history. Desktop only.

![Thinker 界面预览](assets/Thinker.png)

| 项 / Item | 内容 / Value |
| --- | --- |
| 插件 id / Plugin id | `thinker` |
| 版本 / Version | 3.3.2 |
| 最低版本 / Minimum Obsidian | 1.13.0 |
| 平台 / Platform | 仅桌面端 / Desktop only |
| 作者 / Author | Depthinker |
| 数据目录 / Data folder | `FocusLog` |

---

## 中文

### 安装

下载 `main.js`、`manifest.json`、`styles.css` 三个文件，放进 `<库>/.obsidian/plugins/thinker/`，在第三方插件里启用 Thinker。升级时覆盖这三个文件并重新加载插件，设置和记录仍从 `data.json` 读。

### 页面

Thinker 只注册一个视图。它随 Obsidian 启动打开，打开时收起左侧边栏让页面占满窗口，也可以像普通标签页一样关掉；启动打开与收起边栏各有一个开关。

页面分两栏，笔记在左或在右。时钟默认不显示秒，因为每秒跳动的数字会把视线不断拉回去。

### 笔记清单

清单由库内的 markdown 文件按文件夹分层。索引范围可以限定到几个目录，留空则覆盖全库。

顶部一行是分类：文件夹分类对应真实目录，另外三个跨目录，分别是全部、最近、收藏。收藏来自设置里手填的路径列表。

搜索可在标题与全文之间切换，全文命中会带出片段。排序有名称与修改时间，各自可升可降；最近一栏固定按时间倒序。列表有条数上限，隐藏目录不进清单，每行右侧是相对修改时间。右键菜单可以新标签页打开、重命名、复制路径、删除。

### 计时器

两种模式，番茄钟与正计时，默认番茄钟。番茄钟默认 25 分钟专注、5 分钟短休、15 分钟长休，每 4 轮进一次长休，自动循环可关。

一轮结束播放提示音，震动与系统通知是两个独立开关。短于设定秒数的会话不写进记录。每轮结束弹出记录窗口，补标签或直接略过。

### 日历

月历按天显示专注时长，分四档深浅。点开某一天看当天逐条记录，漏掉的会话可以手动补记，当天的日记也从这里打开。

### 统计

右侧栏另有一个统计视图，按日、周、月切换，显示本期合计、会话数、日均、专注与休息时长，以及最长的一次。

### 日记

日记的目录、日期格式和模板跟随 Obsidian 核心日记插件。核心插件没配时，文件落在库根目录，以 `YYYY-MM-DD` 命名；文件不存在就按模板新建。

### 数据

专注记录写在 `FocusLog` 目录，一天一个 markdown 文件。文件头带总数，正文是 json 数组，一条记录一行。一个示例：

```yaml
---
thinkers: log
date: 2026-10-30
focus-minutes: 95
session-count: 3
rest-minutes: 20
rest-count: 3
---
```

```json
{"id":"m4t8x1","kind":"focus","mode":"pomodoro","phase":"focus","tag":"","start":1793340000000,"end":1793341500000,"durationSec":1500,"completed":true,"createdAt":1793340000000,"updatedAt":1793341500000}
```

`kind` 为 `focus` 或 `rest`，`mode` 为 `pomodoro` 或 `stopwatch`，`start` 与 `end` 是毫秒时间戳。删掉的记录留在文件里，标 `deleted: true`，统计时跳过。

### 命令

| 命令 id | 名称 |
| --- | --- |
| `open-home` | 打开 Thinker 主页 |
| `start-stop` | 开始或结束一次专注 |
| `new-note` | 在主页新建笔记 |
| `add-session` | 手动添加一条记录 |
| `open-diary` | 打开今天的日记 |
| `open-stats` | 打开专注统计 |

### 更新日志

#### 3.3.2

这一版只改笔记的打开方式，别的没动。

3.3.1 里点一条笔记，主区域就多一页。主页是 `ItemView`，Obsidian 不会把非文件视图的标签页交给笔记，于是每次对当前标签页调 `openFile` 都新建一页，而不是复用已有的那一页。

现在笔记先找已经打开它的标签页，找到就跳过去；没开过，替换当前笔记页的内容；主区域一个笔记页都没有，才新建一页。Ctrl 点击与右键的新标签页打开保持原样。

### 兼容

`data.json` 的格式与 3.3.1 相同，原地升级不需要迁移。插件要求 Obsidian 1.13.0 以上，不支持移动端。

---

## English

### Install

Download `main.js`, `manifest.json` and `styles.css`, put them in `<vault>/.obsidian/plugins/thinker/`, then enable Thinker under Community plugins. After an update, reload the plugin; settings and records are read from `data.json` as before.

### Page

Thinker registers one view. It opens with Obsidian and collapses the left sidebar so the page fills the window. It closes like any other tab. Both come with their own switch.

The page has two columns, notes on the left or on the right. The clock hides seconds by default, since a digit that moves every second pulls the eye back.

### Notes

The list is built from markdown files in the vault, grouped by folder. The index can be limited to a few roots; leave it empty to index everything.

Chips along the top are the folders themselves plus three ranges that cross folders: All, Recent, Pinned. Pinned notes come from a path list typed into the settings.

Search runs over titles or over full text, and full-text hits show a snippet. Order is by name or by modified time, each ascending or descending; Recent stays on newest first. A cap keeps the list short, hidden folders stay out, and every row carries its relative modified time. The context menu opens a note in a new tab, renames it, copies its path, or deletes it.

### Timer

Two modes: pomodoro and stopwatch. Pomodoro is the default, with 25 minutes of focus, a 5 minute short break and a 15 minute long break, plus a long break every four rounds. Auto cycle can be turned off.

A session ends with a chime. Vibration and system notices are switches of their own. Sessions shorter than the configured floor are not written. A record dialog opens after each round, for a tag or for skipping it.

### Calendar

A month grid colours each day by focus time, in four steps. Opening a day lists its records one by one, and a session that was missed can be added by hand. The diary for that day opens from the same panel.

### Statistics

The statistics view lives in the right sidebar and switches between day, week and month. It shows the total for the period, session count, daily average, focus and rest time, and the longest session.

### Daily notes

Folder, date format and template come from the core Daily notes plugin. With nothing configured, the file lands in the vault root named `YYYY-MM-DD`, and a missing file is created from the template.

### Data

One markdown file per day under `FocusLog`. The frontmatter carries the totals, the body is a json array with one record per line. An example:

```yaml
---
thinkers: log
date: 2026-10-30
focus-minutes: 95
session-count: 3
rest-minutes: 20
rest-count: 3
---
```

```json
{"id":"m4t8x1","kind":"focus","mode":"pomodoro","phase":"focus","tag":"","start":1793340000000,"end":1793341500000,"durationSec":1500,"completed":true,"createdAt":1793340000000,"updatedAt":1793341500000}
```

`kind` is `focus` or `rest`, `mode` is `pomodoro` or `stopwatch`, and `start` and `end` are epoch milliseconds. Deleted records stay in the file marked `deleted: true` and are skipped in every total.

### Commands

| Id | Name |
| --- | --- |
| `open-home` | Open the Thinker home page |
| `start-stop` | Start or end a session |
| `new-note` | New note from the home page |
| `add-session` | Add a session by hand |
| `open-diary` | Open today's diary |
| `open-stats` | Open focus statistics |

### Changelog

#### 3.3.2

This release changes how a note is opened, and nothing else.

In 3.3.1 every click on a note added a tab in the main area. The page is an `ItemView`, and Obsidian will not navigate a leaf away from a view that is not a file view, so each `openFile` on the active leaf produced a new tab instead of reusing the one already there.

A note now goes to the tab that already holds it. If it is not open anywhere, the note replaces the content of the current note tab. A new tab appears only when the main area has no note tab at all. Ctrl click and the "open in new tab" menu entry behave as before.

### Compatibility

`data.json` keeps the same shape as 3.3.1, so an in-place upgrade needs no migration. The plugin needs Obsidian 1.13.0 or newer and does not run on mobile.

---

## 请我喝咖啡（可选）/ Buy me a coffee

这个插件免费，功能不设限。如果它替你省了时间，可以请我喝杯咖啡，金额随意。

This plugin is free and nothing is gated. If it saves you time, you can buy me a coffee. Any amount, entirely optional.

| 支付宝 Alipay | 微信 WeChat Pay |
| --- | --- |
| <img src="assets/AliPay.jpg" width="200" alt="支付宝收款码"> | <img src="assets/WeChat.jpg" width="200" alt="微信收款码"> |
