'use client';

import {
  ArrowUpRight,
  Bookmark,
  CalendarDays,
  Check,
  ChevronRight,
  Menu,
  Search,
  Sparkles,
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
    ] as Article[],
  },
];

const categories = ['全部', '大模型与技术', 'AI 产品与应用', '公司与融资', '政策与行业'];

export default function AiNewsPage() {
  const [editionIndex, setEditionIndex] = useState(0);
  const [category, setCategory] = useState('全部');
  const [saved, setSaved] = useState<number[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const edition = editions[editionIndex];

  const visible = useMemo(
    () => category === '全部' ? edition.articles : edition.articles.filter((item) => item.category === category),
    [category, edition],
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
            <button aria-label="搜索"><Search size={18} /></button>
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
            <section id="sources" className={styles.sources}>
              <h2 className={styles.eyebrow}>本期来源</h2>
              <div>{['OpenAI', 'DeepMind', 'Reuters', 'Hugging Face', 'MIT Tech Review'].map((item) => <span key={item}>{item}</span>)}</div>
              <button>查看全部来源 <ArrowUpRight size={14} /></button>
            </section>
          </aside>
        </section>
      </div>
      <footer className={styles.footer}><strong>AI 日知</strong><span>每天帮你读懂真正重要的 AI 新闻</span><small>原型内容仅供产品演示</small></footer>
    </main>
  );
}
