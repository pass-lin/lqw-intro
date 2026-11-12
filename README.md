# 林庆文 · 个人学术主页

纯静态单页：`index.html` + `style.css` + `main.js` + `i18n.js`，没有构建步骤，没有外部依赖（字体、图标、图示全部本地或内联）。双击 `index.html` 即可打开，右上角的 `EN` 可以切到英文版。

## 文件

| 文件 | 作用 |
| --- | --- |
| `index.html` | 页面的结构与中文文案，单页三节：研究 / 论文 / 关于 |
| `style.css` | 设计 token、版式、响应式；中文排版在文件末尾的「中文排版」段 |
| `main.js` | 滚动揭示、导航状态、阅读进度、论文筛选、BibTeX 展开与复制、中英切换 |
| `i18n.js` | 英文文案，键与 `index.html` 里的 `data-i18n` 一一对应 |
| `preview.png` / `preview-full.png` | 首屏与整页截图，仅用于预览 |

## 本地预览

直接双击 `index.html`。若想用本地服务器（复制 BibTeX 在 `file://` 下会被浏览器拦截，`http://` 下正常）：

```powershell
cd homepage
python -m http.server 8000
# 打开 http://localhost:8000
```

## 内容结构

1. **hero**：姓名、一句定位（推理开销分三处）、三个数字、三个按钮。
2. **01 研究**：三张卡对应三份开销，顺序是显存（SANE）、前向次数（HART）、参数（CMCTS）。每张卡有正文、一句结论、一行数字、一个锚点链接。
3. **02 论文**：同样顺序排三篇（SANE、HART、CMCTS），最后附较早的 ICIC 2024 蒸馏工作。每篇 = 断言一句 + 展开一段 + 侧栏（关键数字或论文信息）+ arXiv/PDF/DOI/BibTeX。顶部可按开销筛选。
4. **03 关于**：身份、三次取舍、方向与联系方式。

没有页脚。

## 中英切换

右上角的 `EN` 按钮切换语言，`中文` 按钮切回来，选择记在 `localStorage` 里，下次打开保持。也可以用 `index.html?lang=en` 直接进英文版。

- 中文文案写在 `index.html` 里，是默认语言，也是 JS 不执行时的兜底。
- 英文文案写在 `i18n.js` 的 `en` 对象里，键名与 HTML 上的 `data-i18n` 对应。改英文只改这一个文件。
- 切换时脚本把中文原文存在 `data-zh-*` 里，切回来是原文恢复，不是翻译回中文。
- 加新文案：HTML 上加 `data-i18n="新键"`，`i18n.js` 里加同名键。属性类文案用 `data-i18n-aria`（aria-label）或 `data-i18n-content`（meta content）。

## 文案规范

- 不用破折号，不用「不是 A 而是 B」句式，不用抬高动词（demonstrate / serves as），不用主观副词（clearly / directly）。
- 数字必须能在原文找到；没有实测过的对比不写。
- 每篇论文只留一句断言，断言后面必须有数字支撑。

## 再加一篇论文

1. 在 `#papers` 里复制一个 `<article class="paper paper--mem reveal" id="新id" data-thread="mem">`（`data-thread` 决定筛选归类：`mem` / `fwd` / `param`）。英文版需要在 `i18n.js` 里补同一篇的键。
2. 改标题、作者、`paper__claim`、`paper__body`、`stats` 三行数字、按钮链接。
3. BibTeX 面板 id 改成 `bib-新id`、`code-新id`，按钮 `data-bib` / `data-copy` 同步。
4. 若要在研究区也加卡，复制一个 `<article class="thread thread--mem reveal">`，`thread__key` 改成下一个编号。

## 发布到 GitHub Pages

```powershell
git init
git add .
git commit -m "personal homepage"
git branch -M main
git remote add origin https://github.com/<用户名>/<仓库名>.git
git push -u origin main
```

仓库 Settings → Pages → Source 选 `Deploy from a branch`，分支 `main`，目录 `/ (root)`。几十秒后访问 `https://<用户名>.github.io/<仓库名>/`。

想用根域名（如 `qingwenlin.com`）：在仓库根目录加 `CNAME` 文件，内容一行域名；DNS 加 CNAME 指向 `<用户名>.github.io`；Pages 里填 Custom domain 并勾选 Enforce HTTPS。

## 设计

- 纸色 `#faf8f4`、墨色 `#1a1710`、砖红 `#8a2b1f`、藏蓝 `#26456e`、金 `#a67c2e`。
- 标题衬线（Iowan / Palatino / 宋体），正文无衬线，标签与数字等宽。
- 版心 1080px，正文行长按 `em` 控制（中文约 22–36 字/行）。
- 三张研究卡在桌面端等高，链接贴底；900px 以下单列。

## 待做

- 英文版文案已就位，正式发表前需要再校对一遍术语。
- 论文页链接：HART、SANE 的 arXiv 号在正式发表后需要换成 DOI。
- 若学校邮箱可用，把 hero 的「邮件」指向学校邮箱。
