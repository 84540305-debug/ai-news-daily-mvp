'use client';

import {
  ArrowUpRight,
  Bookmark,
  CalendarDays,
  Check,
  ChevronRight,
  Flame,
  Gauge,
  Menu,
  Search,
  Sparkles,
  TrendingUp,
  Video,
  X,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import styles from './styles.module.css';

type Article = {
  id: number;
  category: string;
  title: string;
  summary: string;
  why: string;
  source: string;
  time: string;
  featured?: boolean;
};

const editions = [
  {
    date: '09.10',
    weekday: '星期四',
    fullDate: '2026 年 9 月 10 日',
    intro: '模型能力继续向多模态与智能体推进，企业开始把关注点从“能不能用”转向“如何稳定落地”。',
    articles: [
      {
        id: 1,
        category: '大模型与技术',
        title: '多模态模型进入实时交互阶段，语音与视觉成为新入口',
        summary: '头部实验室正把语音、图像和视频理解整合进统一模型。产品形态从“输入问题、等待回答”逐渐转向连续、自然的实时协作。',
        why: '这会改变 AI 产品的交互范式，也会重新定义客服、教育和内容创作工具的体验门槛。',
        source: 'OpenAI · Google DeepMind',
        time: '08:40 · 3 分钟',
        featured: true,
      },
      {
        id: 2,
        category: 'AI 产品与应用',
        title: '企业级 AI 助手从聊天窗口走向完整工作流',
        summary: '越来越多的产品开始让 AI 直接处理检索、文档生成、数据整理和任务流转，而不只是提供对话式建议。',
        why: '衡量 AI 产品价值的指标正在从回答质量转向任务完成率和可控性。',
        source: 'Microsoft AI Blog',
        time: '10:15 · 4 分钟',
      },
      {
        id: 3,
        category: '公司与融资',
        title: 'AI 基础设施融资升温，推理成本成为投资关注重点',
        summary: '资本继续流向推理芯片、模型压缩和算力调度公司。相比单纯扩大训练规模，降低上线后的持续成本受到更多关注。',
        why: '推理成本将直接决定 AI 应用能否从试点进入大规模商业化。',
        source: 'TechCrunch · Reuters',
        time: '11:30 · 3 分钟',
      },
      {
        id: 4,
        category: '政策与行业',
        title: 'AI 内容标识规则加速落地，平台责任进一步明确',
        summary: '新的行业实践要求平台更清晰地标注合成内容，并为高风险场景保留审核和追踪机制。',
        why: '合规能力会从后台要求变成 AI 产品必须直接呈现给用户的功能。',
        source: 'MIT Technology Review',
        time: '13:05 · 5 分钟',
      },
      {
        id: 5,
        category: '大模型与技术',
        title: '小模型在端侧设备上的表现持续提升',
        summary: '经过蒸馏和量化的小型模型在常见任务上接近云端模型，同时减少延迟与数据外传。',
        why: '端侧 AI 有望让更多隐私敏感和离线场景真正可用。',
        source: 'Hugging Face',
        time: '14:20 · 4 分钟',
      },
      {
        id: 10,
        category: 'AI 产品与应用',
        title: '代码智能体开始承担跨文件修改与测试验证',
        summary: '新一代开发工具不再局限于补全代码，而是能够理解仓库结构、修改多个文件，并根据测试结果继续迭代。',
        why: '开发者的核心工作将更多转向任务拆解、结果审核和工程约束设计。',
        source: 'GitHub · Anthropic',
        time: '15:10 · 4 分钟',
      },
      {
        id: 11,
        category: '公司与融资',
        title: '企业 AI 预算从试验项目转向可复用平台能力',
        summary: '大型组织正在合并分散的 AI 试点，把模型接入、权限、评估和成本监控建设为统一平台。',
        why: 'AI 采购的竞争焦点正从单点能力转向长期运维效率和组织复用率。',
        source: 'The Information',
        time: '16:00 · 3 分钟',
      },
      {
        id: 12,
        category: '政策与行业',
        title: '教育机构更新生成式 AI 使用与引用规范',
        summary: '多所高校开始区分可辅助使用、必须披露和明确禁止的场景，并要求保留关键生成过程。',
        why: '透明披露和过程可追溯将成为教育类 AI 产品的重要设计要求。',
        source: 'Nature · UNESCO',
        time: '17:25 · 4 分钟',
      },
    ] as Article[],
  },
  {
    date: '09.09',
    weekday: '星期三',
    fullDate: '2026 年 9 月 9 日',
    intro: '开源模型生态持续完善，开发工具开始围绕智能体评估、权限和可观察性构建新的基础设施。',
    articles: [
      {
        id: 6,
        category: '大模型与技术',
        title: '开源模型缩小复杂推理任务差距',
        summary: '新的开源权重模型在代码与数学任务上取得明显进展，并提供更灵活的本地部署选项。',
        why: '团队有了更多成本、隐私与可控性之间的选择空间。',
        source: 'Hugging Face · GitHub',
        time: '09:20 · 4 分钟',
        featured: true,
      },
      {
        id: 7,
        category: 'AI 产品与应用',
        title: '智能体评估工具成为开发团队的新需求',
        summary: '围绕任务轨迹、工具调用和失败恢复的评估产品增多，帮助团队定位智能体在真实工作流中的问题。',
        why: '可靠性评估是智能体从演示走向生产环境的关键环节。',
        source: 'VentureBeat',
        time: '12:10 · 3 分钟',
      },
      {
        id: 13,
        category: '政策与行业',
        title: '模型透明度报告逐渐形成标准化结构',
        summary: '更多模型发布开始同步披露评测范围、已知限制、安全测试和适用边界。',
        why: '结构化披露能帮助采购方更快判断模型是否适合真实业务。',
        source: 'Stanford HAI',
        time: '15:45 · 4 分钟',
      },
    ] as Article[],
  },
  {
    date: '09.08',
    weekday: '星期二',
    fullDate: '2026 年 9 月 8 日',
    intro: '更低成本的推理方案正在帮助 AI 功能进入高频、低客单价的产品场景。',
    articles: [
      {
        id: 8,
        category: '公司与融资',
        title: '推理优化创业公司获得新一轮融资',
        summary: '该公司通过模型路由与缓存技术降低大规模应用的推理成本，客户主要来自客服和内容平台。',
        why: '模型之上的效率层正在形成独立且清晰的商业市场。',
        source: 'Bloomberg',
        time: '08:55 · 3 分钟',
        featured: true,
      },
      {
        id: 9,
        category: '政策与行业',
        title: '企业更新生成式 AI 数据使用规范',
        summary: '更多组织开始明确敏感信息边界、供应商审核标准和员工使用生成式 AI 的责任。',
        why: '内部治理正在成为企业扩大 AI 使用范围的前置条件。',
        source: 'Financial Times',
        time: '16:35 · 5 分钟',
      },
      {
        id: 14,
        category: 'AI 产品与应用',
        title: '客服 AI 开始引入实时质量评分与人工接管',
        summary: '企业将置信度、敏感意图和用户情绪纳入实时监控，在高风险回答前自动转交人工。',
        why: '人机协作机制比单纯追求自动化比例更能决定服务质量。',
        source: 'Harvard Business Review',
        time: '18:05 · 4 分钟',
      },
    ] as Article[],
  },
];

const categories = ['全部', '大模型与技术', 'AI 产品与应用', '公司与融资', '政策与行业'];

export default function AiNewsPage() {
  const [editionIndex, setEditionIndex] = useState(0);
  const [category, setCategory] = useState('全部');
  const [saved, setSaved] = useState<number[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const edition = editions[editionIndex];

  const visible = useMemo(
    () => edition.articles.filter((item) => {
      const categoryMatch = category === '全部' || item.category === category;
      const keyword = query.trim().toLowerCase();
      const queryMatch = !keyword || `${item.title}${item.summary}${item.why}${item.source}`.toLowerCase().includes(keyword);
      return categoryMatch && queryMatch;
    }),
    [category, edition, query],
  );

  function selectEdition(index: number) {
    setEditionIndex(index);
    setCategory('全部');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function toggleSaved(id: number) {
    setSaved((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  }

  return (
    <main className={styles.shell}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <a className={styles.brand} href="#top" aria-label="AI 日知首页">
            <span className={styles.logo}><Sparkles size={18} /></span>
            <strong>AI 日知</strong>
          </a>
          <nav className={styles.nav} aria-label="主导航">
            <a href="#today">今日</a>
            <a href="#history">往期</a>
            <a href="#sources">来源</a>
          </nav>
          <div className={styles.headerTools}>
            <button aria-label="搜索" aria-pressed={searchOpen} onClick={() => setSearchOpen(!searchOpen)}>{searchOpen ? <X size={18} /> : <Search size={18} />}</button>
            <button className={styles.menuButton} onClick={() => setMenuOpen(!menuOpen)} aria-label="打开菜单">
              {menuOpen ? <X size={19} /> : <Menu size={19} />}
            </button>
          </div>
        </div>
        {menuOpen && (
          <nav className={styles.mobileNav}>
            <a href="#today" onClick={() => setMenuOpen(false)}>今日</a>
            <a href="#history" onClick={() => setMenuOpen(false)}>往期</a>
            <a href="#sources" onClick={() => setMenuOpen(false)}>来源</a>
          </nav>
        )}
      </header>

      <div id="top" className={styles.container}>
        {searchOpen && <div className={styles.searchBar}><Search size={18} /><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索标题、摘要或来源" /><span>{visible.length} 条结果</span></div>}
        <section id="today" className={styles.layout}>
          <div className={styles.content}>
            <div className={styles.hero}>
              <div>
                <p className={styles.date}><CalendarDays size={16} /> {edition.fullDate} · {edition.weekday} <i /> 已更新</p>
                <h1>今天的 AI，<br /><span>值得看这些。</span></h1>
              </div>
              <div className={styles.count}><small>过去 24 小时</small><strong>{edition.articles.length} 条精选</strong><small>从 43 条候选中筛选</small></div>
            </div>
            <p className={styles.intro}>{edition.intro}</p>

            <section className={styles.briefing} aria-label="今日速览">
              <div className={styles.briefingTitle}><span><Flame size={17} /> 今日速览</span><small>2 分钟掌握核心变化</small></div>
              <div className={styles.briefingGrid}>
                <article><span>01</span><p><strong>交互入口变化</strong>实时语音与视觉理解，正在把 AI 从工具变成持续协作者。</p></article>
                <article><span>02</span><p><strong>商业化重点</strong>推理成本、任务完成率和平台复用率成为企业关注指标。</p></article>
                <article><span>03</span><p><strong>治理要求前移</strong>内容标识、使用披露和人工接管开始进入产品界面。</p></article>
              </div>
            </section>

            <div className={styles.tabs} role="tablist" aria-label="按主题筛选">
              {categories.map((item) => (
                <button key={item} role="tab" aria-selected={category === item} className={category === item ? styles.activeTab : ''} onClick={() => setCategory(item)}>
                  {item}
                </button>
              ))}
            </div>

            <div className={styles.newsList} aria-live="polite">
              {visible.length ? visible.map((article, index) => (
                <article key={article.id} className={`${styles.card} ${article.featured ? styles.featured : ''}`}>
                  {article.featured && <span className={styles.featuredLabel}>今日重点</span>}
                  <span className={styles.index}>{String(index + 1).padStart(2, '0')}</span>
                  <div>
                    <div className={styles.meta}><span data-category={article.category}>{article.category}</span><small>{article.time}</small></div>
                    <h2>{article.title}</h2>
                    <p className={styles.summary}>{article.summary}</p>
                    <p className={styles.why}><Sparkles size={16} /><span><strong>为什么重要：</strong>{article.why}</span></p>
                    <div className={styles.cardFooter}>
                      <span className={styles.source}><i>{article.source.charAt(0)}</i>{article.source}</span>
                      <div>
                        <button className={saved.includes(article.id) ? styles.saved : ''} onClick={() => toggleSaved(article.id)}>
                          {saved.includes(article.id) ? <Check size={16} /> : <Bookmark size={16} />}
                          {saved.includes(article.id) ? '已收藏' : '收藏'}
                        </button>
                        <a className={styles.video} href={`/video-create?title=${encodeURIComponent(article.title)}&summary=${encodeURIComponent(article.summary)}&why=${encodeURIComponent(article.why)}`}><Video size={16} /> 生成视频</a>
                        <button className={styles.read}>阅读原文 <ArrowUpRight size={16} /></button>
                      </div>
                    </div>
                  </div>
                </article>
              )) : <div className={styles.empty}>本期暂无该分类内容</div>}
            </div>
          </div>

          <aside className={styles.sidebar}>
            <section id="history">
              <h2 className={styles.eyebrow}>近期日报</h2>
              <div className={styles.editions}>
                {editions.map((item, index) => (
                  <button key={item.date} aria-pressed={editionIndex === index} className={editionIndex === index ? styles.currentEdition : ''} onClick={() => selectEdition(index)}>
                    <span><strong>{item.date}</strong><small>{item.weekday}</small></span>
                    <span><b>{item.articles.length} 条精选</b><small>{index === 0 ? '今天' : index === 1 ? '昨天' : '2 天前'}</small></span>
                    <ChevronRight size={16} />
                  </button>
                ))}
              </div>
            </section>
            <section className={styles.signal}>
              <span>今日信号</span>
              <p>“AI 能否稳定完成工作”，正在取代“AI 能否给出惊艳回答”。</p>
              <small>编辑观察</small>
            </section>
            <section className={styles.pulse}>
              <h2 className={styles.eyebrow}>今日脉搏</h2>
              <div className={styles.pulseRow}><span><TrendingUp size={15} /> 智能体落地</span><b>高关注</b></div>
              <div className={styles.meter}><i style={{ width: '88%' }} /></div>
              <div className={styles.pulseRow}><span><Gauge size={15} /> 推理效率</span><b>持续升温</b></div>
              <div className={styles.meter}><i style={{ width: '74%' }} /></div>
              <div className={styles.pulseRow}><span><Sparkles size={15} /> 多模态交互</span><b>加速演进</b></div>
              <div className={styles.meter}><i style={{ width: '81%' }} /></div>
            </section>
            <section className={styles.topicWatch}>
              <h2 className={styles.eyebrow}>持续关注</h2>
              <div>{['实时多模态', '代码智能体', '端侧模型', 'AI 治理', '推理成本', '企业工作流'].map((item) => <span key={item}>{item}</span>)}</div>
            </section>
            <section id="sources" className={styles.sources}>
              <h2 className={styles.eyebrow}>本期来源</h2>
              <div>{['OpenAI', 'DeepMind', 'Reuters', 'Hugging Face', 'MIT Tech Review', 'GitHub', 'Nature', 'UNESCO'].map((item) => <span key={item}>{item}</span>)}</div>
              <button>查看全部来源 <ArrowUpRight size={14} /></button>
            </section>
          </aside>
        </section>
      </div>
      <footer className={styles.footer}><strong>AI 日知</strong><span>每天帮你读懂真正重要的 AI 新闻</span><small>原型内容仅供产品演示</small></footer>
    </main>
  );
}
