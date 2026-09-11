import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { Presentation, PresentationFile } from "@oai/artifact-tool";

const workspaceDir = path.resolve(".");
const skillDir = "C:/Users/86158/.codex/plugins/cache/openai-primary-runtime/presentations/26.909.12148/skills/presentations";
const buildDir = path.join(workspaceDir, ".ppt-build");
const outputDir = path.join(workspaceDir, "reports");
const finalPptx = path.join(outputDir, "AI新闻日报网站设计与部署汇报-基础版-v4.pptx");
const screenshotPath = path.join(outputDir, "assets", "site-overview.png");
const screenshot = new Uint8Array(await fs.readFile(screenshotPath));
const videoFramePath = path.join(outputDir, "assets", "video-frame.png");
const videoFrame = new Uint8Array(await fs.readFile(videoFramePath));
const { makeNativeBulletParagraphs, finalizePresentation } = await import(
  pathToFileURL(path.join(skillDir, "container_tools/artifact_tool_utils.mjs")).href,
);

await fs.mkdir(buildDir, { recursive: true });
await fs.mkdir(outputDir, { recursive: true });

const W = 1280;
const H = 720;
const FONT = "Microsoft YaHei";
const MONO = "Consolas";
const C = {
  bg: "#07110F",
  panel: "#0E1B18",
  panel2: "#132520",
  text: "#F4F7F6",
  muted: "#9BB0A9",
  green: "#67E8B8",
  cyan: "#6AD7E5",
  line: "#28433A",
  white: "#FFFFFF",
  ink: "#10211C",
  pale: "#EAF8F3",
  amber: "#F5C66A",
  red: "#FF8B7A",
};

const deck = Presentation.create({ slideSize: { width: W, height: H } });

function box(slide, x, y, w, h, fill = C.panel, radius = 18, line = C.line) {
  return slide.shapes.add({
    geometry: radius ? "roundRect" : "rect",
    position: { left: x, top: y, width: w, height: h },
    fill,
    line: { fill: line, width: line === "none" ? 0 : 1 },
  });
}

function text(slide, value, x, y, w, h, size = 24, color = C.text, options = {}) {
  const shape = slide.shapes.add({
    geometry: "textbox",
    position: { left: x, top: y, width: w, height: h },
    fill: "none",
    line: { fill: "none", width: 0 },
  });
  shape.text = value;
  shape.text.style = {
    typeface: options.mono ? MONO : FONT,
    fontSize: size,
    bold: options.bold ?? false,
    color,
    alignment: options.align ?? "left",
    verticalAlignment: options.vAlign ?? "top",
    autoFit: options.autoFit ?? "none",
    insets: { left: 0, right: 0, top: 0, bottom: 0 },
  };
  return shape;
}

function title(slide, heading, sub = "") {
  text(slide, heading, 64, 44, 1110, 58, 37, C.text, { bold: true });
  if (sub) text(slide, sub, 66, 104, 1080, 32, 17, C.muted);
  box(slide, 64, 144, 84, 5, C.green, 0, "none");
}

function footer(slide, n) {
  text(slide, `FRAMEFLOW  ·  项目汇报  ·  ${String(n).padStart(2, "0")}`, 64, 680, 500, 20, 12, C.muted);
}

function addBullets(slide, items, x, y, w, h, size = 22, color = C.text) {
  const shape = text(slide, "", x, y, w, h, size, color);
  shape.text = makeNativeBulletParagraphs(items, {
    marginLeftPoints: 18,
    hangingPoints: 9,
    spaceAfterPoints: 10,
  });
  shape.text.style = {
    typeface: FONT,
    fontSize: size,
    color,
    autoFit: "none",
    insets: { left: 0, right: 0, top: 0, bottom: 0 },
  };
  return shape;
}

function pill(slide, label, x, y, w, fill = C.panel2, color = C.green) {
  box(slide, x, y, w, 34, fill, 17, "none");
  text(slide, label, x, y + 6, w, 22, 14, color, { align: "center", bold: true });
}

function note(slide, value) {
  slide.speakerNotes.textFrame.setText(value);
}

// 01 Cover
{
  const s = deck.slides.add(); s.background.fill = C.bg;
  box(s, 0, 0, W, H, C.bg, 0, "none");
  box(s, 842, 18, 430, 430, "#0E3027", 215, "none");
  box(s, 930, 25, 250, 250, "#15513F", 125, "none");
  box(s, 1010, 100, 95, 95, C.green, 48, "none");
  pill(s, "AI NEWS  ×  VIDEO", 72, 92, 208);
  text(s, "AI 新闻日报与\n视频工作台", 72, 170, 720, 190, 58, C.text, { bold: true });
  text(s, "MVP 产品设计、火山方舟接入、部署与操作汇报", 76, 390, 760, 40, 24, C.muted);
  text(s, "从资讯整理到有声视频导出的完整闭环", 76, 450, 720, 32, 19, C.green);
  text(s, "2026.09  ·  FrameFlow 帧语", 76, 620, 500, 26, 15, C.muted);
  note(s, "本汇报基于项目当前源码、已发布网站和真实生成的 30 秒视频整理。所有外部链接见末页。 ");
}

// 02 Executive overview
{
  const s = deck.slides.add(); s.background.fill = C.bg; title(s, "一页看懂：MVP 已形成可演示闭环", "内容输入、AI 文案、视频生成、结果导出与线上发布已贯通");
  const items = [
    ["01", "读新闻", "每日精选 AI 动态，强调来源透明与重要性解读"],
    ["02", "转脚本", "支持粘贴文字、公开链接和 TXT/MD 文本生成标题、摘要与核心解读"],
    ["03", "生成视频", "可选 5、10、30 秒，调用 Doubao-Seedance-2.5 并生成有声视频"],
    ["04", "发布交付", "源码进入 GitHub，网站由 Sites 托管，视频与汇报材料可下载"],
  ];
  items.forEach((it, i) => {
    const y = 185 + i * 104;
    text(s, it[0], 74, y, 58, 40, 25, C.green, { bold: true });
    text(s, it[1], 155, y, 150, 38, 25, C.text, { bold: true });
    text(s, it[2], 330, y + 1, 815, 58, 18, C.muted);
    box(s, 155, y + 72, 990, 1, C.line, 0, "none");
  });
  pill(s, "线上可访问", 958, 612, 144, "#12362C", C.green);
  footer(s, 2);
}

// 03 Product IA
{
  const s = deck.slides.add(); s.background.fill = C.bg; title(s, "产品结构：同一站点承载两种核心任务", "资讯消费与内容生产相互衔接，但页面职责清晰分离");
  const cols = [
    { x: 75, label: "AI 新闻日报", num: "01", body: ["浏览当日与历史精选", "查看摘要与为什么重要", "进入原文继续核实"] },
    { x: 455, label: "内容解析", num: "02", body: ["统一入口 /video-create", "文字、HTTPS 链接、TXT / MD", "新闻和非新闻材料均可处理"] },
    { x: 835, label: "视频工作台", num: "03", body: ["配置时长、画幅与风格", "确认费用后提交任务", "预览并下载有声视频"] },
  ];
  cols.forEach((c, i) => {
    box(s, c.x, 190, 330, 350, i === 1 ? "#10251F" : C.panel, 22, C.line);
    text(s, c.num, c.x + 28, 220, 60, 42, 30, C.green, { bold: true });
    text(s, c.label, c.x + 28, 282, 270, 42, 26, C.text, { bold: true });
    addBullets(s, c.body, c.x + 28, 350, 270, 145, 18, C.muted);
  });
  text(s, "阅读", 365, 352, 70, 26, 15, C.green, { align: "center", bold: true });
  text(s, "创作", 745, 352, 70, 26, 15, C.green, { align: "center", bold: true });
  footer(s, 3);
}

// 04 Visual design
{
  const s = deck.slides.add(); s.background.fill = C.bg; title(s, "视觉方向：暗色创作工作台，降低干扰并突出行动", "黑绿科技感延续 FrameFlow 品牌，桌面端与移动端均可使用");
  s.images.add({ blob: screenshot, contentType: "image/png", alt: "FrameFlow 网站首页截图", fit: "contain", position: { left: 72, top: 176, width: 720, height: 450 }, geometry: "roundRect", borderRadius: 18 });
  pill(s, "品牌色", 845, 195, 110); box(s, 980, 198, 42, 28, C.green, 14, "none");
  text(s, "深色画布 + 荧光绿强调", 845, 248, 340, 30, 20, C.text, { bold: true });
  text(s, "用高对比度突出主操作，弱化次级信息，适合长时间创作。", 845, 292, 330, 74, 17, C.muted);
  pill(s, "布局", 845, 405, 90);
  text(s, "信息分区，首屏可行动", 845, 458, 340, 30, 20, C.text, { bold: true });
  text(s, "首页负责入口选择；新闻页与视频页分别聚焦阅读和生成任务。", 845, 502, 330, 74, 17, C.muted);
  footer(s, 4);
  note(s, "网站截图来自当前已发布的 Sites 项目。生产地址：https://wildpath-notes.berry-clove-3018.chatgpt.site");
}

// 05 Function flow
{
  const s = deck.slides.add(); s.background.fill = C.bg; title(s, "核心流程：四步把材料变成可下载视频", "每一步都有明确输入、状态反馈和人工确认点");
  const steps = [
    ["1", "输入材料", "新闻、产品介绍、活动方案、课程内容等文字材料"],
    ["2", "生成文案", "标题、摘要、核心解读，可人工调整"],
    ["3", "设置视频", "5 / 10 / 30 秒、比例、风格、声音"],
    ["4", "确认并导出", "确认扣费、等待生成、预览和下载"],
  ];
  steps.forEach((it, i) => {
    const x = 70 + i * 300;
    box(s, x, 215, 255, 285, i === 2 ? "#123027" : C.panel, 22, C.line);
    box(s, x + 24, 240, 48, 48, C.green, 24, "none");
    text(s, it[0], x + 24, 249, 48, 30, 19, C.ink, { align: "center", bold: true });
    text(s, it[1], x + 24, 320, 205, 36, 24, C.text, { bold: true });
    text(s, it[2], x + 24, 380, 205, 82, 17, C.muted);
  });
  text(s, "人工确认点", 500, 552, 130, 28, 16, C.amber, { bold: true });
  text(s, "真实任务只在用户明确确认费用后提交，不自动重试。", 645, 552, 490, 28, 16, C.muted);
  footer(s, 5);
}

// 06 Architecture
{
  const s = deck.slides.add(); s.background.fill = C.bg; title(s, "技术架构：密钥留在服务端，浏览器只调用本站 API", "前端负责交互，Worker 负责安全校验、模型调用和任务状态转发");
  const nodes = [
    { x: 65, y: 260, w: 210, title: "浏览器", sub: "Vinext / React\n新闻页与视频工作台" },
    { x: 360, y: 220, w: 260, title: "Sites Worker", sub: "输入校验\n链接抓取与 SSRF 防护\n火山方舟请求代理" },
    { x: 715, y: 175, w: 220, title: "文本模型", sub: "生成标题、摘要\n与核心解读" },
    { x: 715, y: 370, w: 220, title: "Seedance 2.5", sub: "异步生成 5 / 10 / 30 秒\n视频与音频" },
    { x: 1020, y: 270, w: 190, title: "结果交付", sub: "状态查询\n视频预览与下载" },
  ];
  nodes.forEach((n, i) => {
    box(s, n.x, n.y, n.w, 130, i === 1 ? "#113228" : C.panel, 20, i === 1 ? C.green : C.line);
    text(s, n.title, n.x + 20, n.y + 20, n.w - 40, 34, 22, C.text, { bold: true });
    text(s, n.sub, n.x + 20, n.y + 62, n.w - 40, 58, 15, C.muted);
  });
  [[275,325,360,285],[620,285,715,240],[620,335,715,435],[935,240,1020,320],[935,435,1020,350]].forEach((a) => {
    box(s, a[0], a[1], a[2]-a[0], 3, C.green, 0, "none");
  });
  pill(s, "ARK_API_KEY 仅作为托管 Secret 保存", 382, 545, 345, "#2B2615", C.amber);
  footer(s, 6);
}

// 07 Code excerpts
{
  const s = deck.slides.add(); s.background.fill = C.bg; title(s, "关键代码：时长白名单、声音开关与服务端密钥", "以下为当前仓库中的真实实现摘录");
  box(s, 68, 180, 560, 410, "#0B1513", 18, C.line);
  text(s, "server/volcengine.mjs", 94, 202, 470, 28, 15, C.green, { mono: true, bold: true });
  const code1 = `const duration = Number(input.duration);\nif (![5, 10, 30].includes(duration)) {\n  fail('视频时长只支持 5 秒、10 秒或 30 秒');\n}\n\nreturn {\n  model,\n  content,\n  generate_audio: audioMode !== 'mute',\n};`;
  text(s, code1, 94, 250, 505, 300, 17, "#D8E7E2", { mono: true });
  box(s, 652, 180, 560, 410, "#0B1513", 18, C.line);
  text(s, "server/volcengine.mjs", 678, 202, 470, 28, 15, C.cyan, { mono: true, bold: true });
  const code2 = `const configured = Boolean(\n  env.ARK_API_KEY && env.ARK_VIDEO_MODEL_ID\n);\n\nconst result = await arkFetch(\n  '/contents/generations/tasks',\n  { method: 'POST', body: JSON.stringify(payload) },\n  env\n);`;
  text(s, code2, 678, 250, 505, 300, 17, "#D8E7E2", { mono: true });
  footer(s, 7);
  note(s, "代码来源：GitHub 仓库 main 分支的 server/volcengine.mjs 与 app/video-create/page.tsx。链接见末页。 ");
}

// 08 Deployment
{
  const s = deck.slides.add(); s.background.fill = C.bg; title(s, "部署链路：一次提交对应一套可回滚交付物", "源码、测试、构建、托管版本和演示材料保持同一版本语义");
  const flow = ["本地改动", "自动测试", "生产构建", "Git 提交", "GitHub main", "Sites 发布"];
  flow.forEach((label, i) => {
    const x = 60 + i * 200;
    box(s, x, 250, 160, 110, i === 5 ? "#12382D" : C.panel, 18, i === 5 ? C.green : C.line);
    text(s, String(i + 1).padStart(2, "0"), x + 18, 268, 45, 26, 16, C.green, { bold: true });
    text(s, label, x + 18, 310, 125, 28, 19, C.text, { bold: true });
    if (i < flow.length - 1) box(s, x + 160, 304, 40, 3, C.green, 0, "none");
  });
  addBullets(s, [
    "ARK_API_KEY 只写入 Sites Secret，不进入代码与 Git 历史",
    "环境变量变更后需要重新部署已保存版本才能生效",
    "每次功能或材料变更均创建独立 Git commit，便于审计和回滚",
  ], 130, 430, 1000, 150, 19, C.muted);
  footer(s, 8);
}

// 09 Operation
{
  const s = deck.slides.add(); s.background.fill = C.bg; title(s, "材料入口与视频操作", "新闻和非新闻材料统一从 /video-create 进入，当前优先处理可提取的文字内容");
  const left = ["打开“视频创作”页面", "直接粘贴产品、活动、课程、企业或故事文字", "输入公开 HTTPS 网页链接，或上传 TXT / MD", "生成标题、摘要和核心解读，再人工修改"];
  const right = ["选择 5 / 10 / 30 秒、画幅、风格和声音", "确认费用后只提交一次生成任务", "播放检查字幕、旁白和音乐，再下载 MP4", "PDF、Word、Excel、PPT、音视频需先转成文字"];
  box(s, 70, 190, 545, 410, C.panel, 22, C.line);
  box(s, 665, 190, 545, 410, C.panel, 22, C.line);
  text(s, "导入入口", 100, 220, 200, 32, 24, C.green, { bold: true });
  addBullets(s, left, 100, 280, 465, 260, 18, C.text);
  text(s, "生成与限制", 695, 220, 200, 32, 24, C.green, { bold: true });
  addBullets(s, right, 695, 280, 465, 260, 18, C.text);
  footer(s, 9);
}

// 10 Embedded video target
{
  const s = deck.slides.add(); s.background.fill = C.bg; title(s, "成片演示：30 秒有声视频已导出", "在 Microsoft PowerPoint 中单击视频即可播放，文件同时提供 GitHub 下载链接");
  box(s, 68, 178, 320, 430, C.panel, 22, C.line);
  text(s, "已验收参数", 96, 210, 240, 34, 25, C.text, { bold: true });
  const facts = ["时长 30.08 秒", "分辨率 1280 × 720", "包含视频轨与音频轨", "文件约 47.36 MB", "模型 Doubao-Seedance-2.5"];
  addBullets(s, facts, 96, 280, 260, 230, 18, C.muted);
  pill(s, "可播放内嵌视频", 96, 540, 210, "#12382D", C.green);
  s.images.add({ blob: screenshot, contentType: "image/png", alt: "30 秒视频播放区域封面", fit: "cover", position: { left: 410, top: 178, width: 800, height: 450 }, geometry: "roundRect", borderRadius: 18, crop: { left: 0.05, top: 0.10, right: 0.05, bottom: 0.10 } });
  box(s, 748, 345, 110, 110, C.green, 55, "none");
  text(s, "▶", 748, 365, 110, 58, 44, C.ink, { align: "center", bold: true });
  footer(s, 10);
  note(s, "本页将在导出后写入 media/ai-news-video-30s.mp4。若在线预览器不支持内嵌媒体，请使用末页 GitHub 视频链接下载播放。 ");
}

// 11 Validation
{
  const s = deck.slides.add(); s.background.fill = C.bg; title(s, "测试与验收：代码、构建、视频和交付物逐层验证", "交付前不只检查页面可打开，还确认真实视频文件包含声音轨");
  const rows = [
    ["自动测试", "17 / 17", "请求构造、内容解析、任务提交与状态查询"],
    ["生产构建", "通过", "前端与 Worker 构建成功"],
    ["线上部署", "版本 12", "生产 URL 可用，火山方舟模型已切换至 Seedance 2.5"],
    ["视频文件", "通过", "30.08 秒、1280×720，同时包含 video / audio track"],
    ["PPT 结构", "通过", "完整性、版式、字体与逐页渲染检查"],
  ];
  text(s, "检查项", 82, 190, 220, 30, 16, C.muted, { bold: true });
  text(s, "结果", 380, 190, 180, 30, 16, C.muted, { bold: true });
  text(s, "验收范围", 620, 190, 500, 30, 16, C.muted, { bold: true });
  rows.forEach((r, i) => {
    const y = 238 + i * 76;
    box(s, 70, y - 10, 1140, 62, i % 2 ? "#0B1714" : C.panel, 12, "none");
    text(s, r[0], 82, y + 7, 250, 28, 18, C.text, { bold: true });
    pill(s, r[1], 372, y, 160, r[1].includes("通过") || r[1].includes("17") ? "#12382D" : C.panel2, C.green);
    text(s, r[2], 620, y + 6, 540, 40, 16, C.muted);
  });
  footer(s, 11);
}

// 12 Risks and links
{
  const s = deck.slides.add(); s.background.fill = C.bg; title(s, "发布链接与注意事项", "建议优先使用线上网站，视频与 PPT 通过 GitHub 下载后本地播放");
  text(s, "发布链接", 70, 176, 180, 32, 24, C.green, { bold: true });
  const links = [
    ["线上网站", "https://wildpath-notes.berry-clove-3018.chatgpt.site"],
    ["视频工作台", "https://wildpath-notes.berry-clove-3018.chatgpt.site/video-create"],
    ["GitHub 仓库", "https://github.com/84540305-debug/ai-news-daily-mvp"],
    ["30 秒视频", "https://github.com/84540305-debug/ai-news-daily-mvp/blob/main/media/ai-news-video-30s.mp4"],
    ["汇报 PPT", "https://github.com/84540305-debug/ai-news-daily-mvp/blob/main/reports/AI新闻日报网站设计与部署汇报.pptx"],
  ];
  let y = 222;
  for (const [label, uri] of links) {
    text(s, label, 70, y, 105, 22, 14, C.text, { bold: true });
    const linkShape = text(s, uri.replace("https://", ""), 178, y, 585, 25, 12, C.cyan, { autoFit: "shrinkText" });
    linkShape.text.get(uri.replace("https://", "")).link = { uri, isExternal: true };
    y += 31;
  }
  text(s, "网站页面", 70, 398, 180, 24, 15, C.muted, { bold: true });
  text(s, "视频画面", 426, 398, 180, 24, 15, C.muted, { bold: true });
  s.images.add({ blob: screenshot, contentType: "image/png", alt: "FrameFlow 已发布网站页面", fit: "cover", position: { left: 70, top: 430, width: 330, height: 186 }, geometry: "roundRect", borderRadius: 14 });
  s.images.add({ blob: videoFrame, contentType: "image/png", alt: "30 秒视频内容截图", fit: "cover", position: { left: 426, top: 430, width: 330, height: 186 }, geometry: "roundRect", borderRadius: 14 });
  box(s, 800, 176, 410, 440, "#101B19", 22, C.line);
  text(s, "上线注意事项", 830, 208, 260, 34, 24, C.amber, { bold: true });
  addBullets(s, [
    "任何 API Key 都不得写入前端、截图、PPT 或 Git 仓库",
    "真实视频会产生费用，确认后只提交一次，不自动重试",
    "模型结果链接可能过期，完成后应及时下载并归档",
    "字幕、事实准确性、旁白和背景音乐音量需人工复核",
    "内嵌视频建议使用桌面版 Microsoft PowerPoint 播放",
  ], 830, 270, 330, 280, 16, C.text);
  footer(s, 12);
  note(s, "链接均为项目正式交付地址。GitHub 大文件在线预览能力有限，下载后播放或打开 PPT 更稳定。 ");
}

// Export previews and validated PPTX.
for (let i = 0; i < deck.slides.items.length; i += 1) {
  const slide = deck.slides.items[i];
  const png = await deck.export({ slide, format: "png", scale: 1 });
  await fs.writeFile(path.join(buildDir, `slide-${String(i + 1).padStart(2, "0")}.png`), new Uint8Array(await png.arrayBuffer()));
  const layout = await slide.export({ format: "layout" });
  await fs.writeFile(path.join(buildDir, `slide-${String(i + 1).padStart(2, "0")}.layout.json`), await layout.text());
}
const montage = await deck.export({ format: "webp", montage: true, scale: 0.5 });
await fs.writeFile(path.join(buildDir, "montage.webp"), new Uint8Array(await montage.arrayBuffer()));

const candidatePath = path.join(buildDir, "candidate.pptx");
await (await PresentationFile.exportPptx(deck)).save(candidatePath);

await finalizePresentation({
  explicitTotalSlideCount: 12,
  requiredNativeTableOwnerSlides: [],
  requiredNativeChartOwnerSlides: [],
  workspaceDir,
  candidatePath,
  finalPath: finalPptx,
  pythonExecutable: "C:/Users/86158/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe",
  integrityValidatorPath: path.join(skillDir, "container_tools/inspect_presentation_package_integrity.py"),
  layoutValidatorPath: path.join(skillDir, "container_tools/inspect_presentation_layout_geometry.py"),
  layoutArgs: ["--expected-slide-size-emu", "12192000,6858000", "--validate-bullet-geometry", "--validate-heading-fit"],
  fontPolicy: { basis: "design", families: [FONT, MONO] },
  verifyArtifactToolImport: true,
  receiptPath: path.join(buildDir, "presentation-v4.validation.json"),
});

console.log(finalPptx);
