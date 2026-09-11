from pathlib import Path

from docx import Document
from docx.enum.section import WD_SECTION
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Inches, Pt, RGBColor


ROOT = Path(__file__).resolve().parent
OUTPUT = ROOT / "AI新闻日报与视频工作台5分钟汇报稿.docx"

slides = [
    (
        "第1页  封面",
        "约20秒",
        "各位好，今天向大家汇报的是 AI 新闻日报与视频工作台项目。这个项目从 MVP 版本开始，目标是先完成一套能够实际使用和验证的基础产品，建立从 AI 新闻整理、内容加工，到有声视频生成和线上发布的完整流程。接下来，我将从产品结构、功能流程、技术架构、部署方式和测试结果几个方面进行介绍。",
    ),
    (
        "第2页  MVP整体成果",
        "约35秒",
        "首先解释一下 MVP。MVP 是 Minimum Viable Product 的缩写，中文通常称为最小可行产品。它不是质量较低的临时产品，而是在保证核心功能可以正常使用的前提下，先做出范围最小、能够交给用户体验的版本。MVP 主要用于验证用户是否需要这个产品、核心流程是否有效，以及后续是否值得继续投入。本项目目前已经打通阅读 AI 新闻、生成视频文案、制作有声视频和发布导出成果四个环节。",
    ),
    (
        "第3页  产品结构",
        "约25秒",
        "网站包含三个相互衔接的模块。AI 新闻日报帮助用户浏览精选资讯、中文摘要和重要性解读。内容解析负责接收新闻和非新闻材料，统一入口是视频创作页面，也就是网站的 video-create 页面。用户可以直接粘贴文字、输入公开 HTTPS 链接，或者上传 TXT、Markdown 文件。视频工作台负责设置参数、提交任务、查询状态和下载结果。",
    ),
    (
        "第4页  视觉设计",
        "约20秒",
        "网站采用暗色创作工作台风格，以黑色和深绿色为主要背景，通过荧光绿色突出按钮、状态和关键操作。这样的设计可以减少视觉干扰，让用户把注意力放在材料输入、视频设置和生成结果上。首页负责功能入口，新闻页面聚焦阅读，视频页面聚焦创作，同时适配桌面端和移动端。",
    ),
    (
        "第5页  核心流程",
        "约30秒",
        "把材料转换成视频主要分为四步。第一步是输入材料，除了新闻，还可以输入产品介绍、活动方案、课程内容、企业介绍和故事脚本等文字材料。第二步是生成标题、摘要和核心解读，并由用户继续修改。第三步是设置视频时长、画幅、风格和声音。第四步是确认费用、提交任务、预览结果并下载视频。系统不会自动重复提交真实任务，避免产生额外费用。",
    ),
    (
        "第6页  技术架构",
        "约25秒",
        "在技术架构上，浏览器不会直接调用火山引擎，也不会接触 API Key。网站前端负责用户交互，Sites Worker 负责验证输入、抓取公开网页、执行安全检查并调用火山方舟。文本模型生成标题、摘要和核心解读，Doubao-Seedance-2.5 负责生成视频画面、普通话旁白和背景音乐。任务完成后，服务端把状态和结果返回给用户。",
    ),
    (
        "第7页  关键代码",
        "约25秒",
        "这一页展示的是项目中的关键代码。左侧代码设置了视频时长白名单，只允许生成 5 秒、10 秒或 30 秒的视频。generate_audio 参数负责控制是否生成声音。右侧代码检查服务端是否已经配置 API Key 和视频模型。只有配置完整，服务端才会向火山方舟提交任务，从而避免密钥暴露在网页或浏览器中。",
    ),
    (
        "第8页  部署流程",
        "约25秒",
        "项目使用 Git 进行版本管理。每次修改完成后，先运行自动测试和生产构建，验证通过后创建对应的 Git commit，再推送到 GitHub 的 main 分支。网站由 Sites 托管发布，API Key 只保存在托管环境的 Secret 中。这样可以让每一次变更都有记录，便于问题定位、审计和版本回滚。",
    ),
    (
        "第9页  材料入口与视频操作",
        "约45秒",
        "非新闻材料统一从视频创作页面进入，网址路径是 video-create。用户可以直接粘贴产品介绍、活动方案、课程材料、企业介绍或故事文字，也可以输入公开 HTTPS 网页链接，或者上传 TXT 和 Markdown 文件。系统会生成标题、摘要和核心解读，用户确认文案后再设置时长、画幅、风格和声音。目前网站不直接解析 PDF、Word、Excel、PPT、音频和视频文件，这些文件需要先转换或复制成文字，再导入视频创作页面。",
    ),
    (
        "第10页  30秒成片演示",
        "约30秒",
        "这一页展示项目实际生成的 30 秒视频。视频准确时长为 30.08 秒，分辨率是 1280 乘 720，文件大小约为 47.36 MB，并且同时包含视频轨和音频轨。视频由 Doubao-Seedance-2.5 生成，已经内嵌到 PPT 中。汇报时可以在桌面版 Microsoft PowerPoint 中单击播放，建议展示大约 10 到 15 秒。",
    ),
    (
        "第11页  测试与验收",
        "约25秒",
        "交付前，项目完成了多层验证。17 项自动测试全部通过，覆盖内容解析、网页链接安全校验、视频请求构造、任务提交和状态查询。前端和 Worker 的生产构建成功。视频文件也确认包含画面和声音。PPT 完成结构完整性、页面边界、字体、文字适配和逐页渲染检查。",
    ),
    (
        "第12页  发布链接与注意事项",
        "约35秒",
        "最后一页列出了线上网站、视频工作台、GitHub 仓库、30 秒视频和汇报 PPT 的发布链接。链接下方展示网站页面截图和真实视频画面截图。上线后需要注意：API Key 不能写入前端、截图、PPT 或 GitHub；真实生成会产生费用，确认后只提交一次；模型返回的临时视频地址可能过期，应及时下载；字幕、事实内容、旁白和音乐音量需要人工复核。项目目前已经具备可访问、可操作、可生成、可下载和可回滚的演示能力。我的汇报完毕，谢谢大家。",
    ),
]


def set_run_font(run, name="Microsoft YaHei", size=11, bold=False, color="000000"):
    run.font.name = name
    run._element.get_or_add_rPr().rFonts.set(qn("w:eastAsia"), name)
    run._element.get_or_add_rPr().rFonts.set(qn("w:ascii"), name)
    run._element.get_or_add_rPr().rFonts.set(qn("w:hAnsi"), name)
    run.font.size = Pt(size)
    run.font.bold = bold
    run.font.color.rgb = RGBColor.from_string(color)


def add_page_number(paragraph):
    paragraph.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = paragraph.add_run("第 ")
    set_run_font(run, size=9, color="666666")
    fld = OxmlElement("w:fldSimple")
    fld.set(qn("w:instr"), "PAGE")
    paragraph._p.append(fld)
    run = paragraph.add_run(" 页")
    set_run_font(run, size=9, color="666666")


doc = Document()
section = doc.sections[0]
section.page_width = Inches(8.5)
section.page_height = Inches(11)
section.top_margin = Inches(0.72)
section.bottom_margin = Inches(0.68)
section.left_margin = Inches(0.85)
section.right_margin = Inches(0.85)

styles = doc.styles
normal = styles["Normal"]
normal.font.name = "Microsoft YaHei"
normal._element.rPr.rFonts.set(qn("w:eastAsia"), "Microsoft YaHei")
normal.font.size = Pt(11)
normal.paragraph_format.line_spacing = 1.35
normal.paragraph_format.space_after = Pt(7)

title_style = styles["Title"]
title_style.font.name = "Microsoft YaHei"
title_style._element.rPr.rFonts.set(qn("w:eastAsia"), "Microsoft YaHei")
title_style.font.size = Pt(25)
title_style.font.bold = True
title_style.font.color.rgb = RGBColor(0, 0, 0)

for style_name in ["Heading 1", "Heading 2"]:
    style = styles[style_name]
    style.font.name = "Microsoft YaHei"
    style._element.rPr.rFonts.set(qn("w:eastAsia"), "Microsoft YaHei")
    style.font.color.rgb = RGBColor(0, 0, 0)
    style.font.bold = True
styles["Heading 1"].font.size = Pt(17)
styles["Heading 2"].font.size = Pt(14)

doc.core_properties.title = "AI新闻日报与视频工作台5分钟汇报稿"
doc.core_properties.subject = "与12页项目汇报PPT同步的逐页讲稿"
doc.core_properties.author = "FrameFlow"

title = doc.add_paragraph(style="Title")
title.alignment = WD_ALIGN_PARAGRAPH.CENTER
title_run = title.add_run("AI新闻日报与视频工作台\n5分钟汇报稿")
set_run_font(title_run, size=25, bold=True)

subtitle = doc.add_paragraph()
subtitle.alignment = WD_ALIGN_PARAGRAPH.CENTER
sub_run = subtitle.add_run("严格对应12页PPT  含MVP解释与材料导入说明")
set_run_font(sub_run, size=11, color="555555")
subtitle.paragraph_format.space_after = Pt(18)

intro = doc.add_paragraph()
intro_run = intro.add_run("使用说明  ")
set_run_font(intro_run, bold=True)
intro_run = intro.add_run("全文按正常语速约5分钟。第10页可以播放10到15秒视频片段；如完整播放30秒，总时长约增加15秒。")
set_run_font(intro_run)
intro.paragraph_format.space_after = Pt(16)

for index, (heading, timing, body) in enumerate(slides):
    if index > 0 and index % 2 == 0:
        doc.add_page_break()

    heading_p = doc.add_paragraph(style="Heading 1")
    heading_p.paragraph_format.keep_with_next = True
    heading_run = heading_p.add_run(heading)
    set_run_font(heading_run, size=17, bold=True)

    time_p = doc.add_paragraph()
    time_p.paragraph_format.keep_with_next = True
    time_p.paragraph_format.space_after = Pt(4)
    time_run = time_p.add_run(f"建议用时  {timing}")
    set_run_font(time_run, size=9.5, color="34705D")

    body_p = doc.add_paragraph()
    body_p.paragraph_format.line_spacing = 1.35
    body_p.paragraph_format.space_after = Pt(13)
    body_run = body_p.add_run(body)
    set_run_font(body_run, size=11)

footer = section.footer.paragraphs[0]
add_page_number(footer)

doc.save(OUTPUT)
print(OUTPUT)
