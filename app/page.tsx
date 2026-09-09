'use client';

import {
  ArrowLeft, Captions, Check, ChevronRight, Clapperboard, Clock3, Download,
  Expand, Image as ImageIcon, LayoutTemplate, MoreHorizontal, Music2, Pause,
  Play, Plus, Send, Sparkles, Volume2, WandSparkles,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';

type Mode = 'slideshow' | 'html';

const projects = [
  { name: '城市夜行者', type: '图片轮播', time: '刚刚' },
  { name: '咖啡豆的一生', type: 'HTML 视频', time: '昨天' },
  { name: '夏日旅行日记', type: '图片轮播', time: '9月 6日' },
  { name: 'AI 产品发布会', type: 'HTML 视频', time: '9月 2日' },
];

const scenes = [
  { id: 1, title: '序章 · 城市苏醒', duration: '00:06', color: 'cyan', caption: '当最后一束日光隐入地平线，城市开始了另一种呼吸。' },
  { id: 2, title: '霓虹街巷', duration: '00:08', color: 'violet', caption: '霓虹点亮街巷，每一扇窗，都藏着一个未完的故事。' },
  { id: 3, title: '穿行的人群', duration: '00:07', color: 'amber', caption: '人们穿过光影，在熟悉的路上寻找新的方向。' },
  { id: 4, title: '午夜列车', duration: '00:09', color: 'blue', caption: '末班列车划过夜色，把远方带到我们身边。' },
  { id: 5, title: '尾声 · 黎明', duration: '00:06', color: 'rose', caption: '而黎明之前，城市从未真正睡去。' },
];

const modeDetails = {
  slideshow: { label: '图片轮播', icon: ImageIcon, description: 'AI 生成电影感分镜画面，配合运镜、旁白与音乐，快速完成叙事视频。', tag: '快速出片', action: '开始图片创作' },
  html: { label: 'HTML 视频', icon: LayoutTemplate, description: 'AI 编写可播放的网页动画，组合动态排版、图形与转场，画面完全可编辑。', tag: '动态表达', action: '开始 HTML 创作' },
} as const;

function BrandMark() {
  return <div className="brand" aria-label="帧语 FrameFlow"><span className="brand-mark"><span /><span /><span /></span><b>帧语</b><em>FRAMEFLOW</em></div>;
}

function Home({ onSelect }: { onSelect: (mode: Mode) => void }) {
  return (
    <main className="home-shell">
      <nav className="home-nav"><BrandMark /><div className="nav-actions"><button>作品空间</button><button>帮助中心</button><span className="avatar">LY</span></div></nav>
      <section className="mode-hero">
        <div className="hero-kicker"><Sparkles size={15} /> AI VIDEO STUDIO</div>
        <h1>一个想法，<span>即刻成片。</span></h1>
        <p>从脚本、分镜到声音与画面，交给 AI 完成。<br />选择一种创作方式，开始你的故事。</p>
        <div className="mode-grid">
          {(Object.entries(modeDetails) as [Mode, typeof modeDetails[Mode]][]).map(([key, item], index) => {
            const Icon = item.icon;
            return (
              <button className={`mode-card mode-card-${index + 1}`} key={key} onClick={() => onSelect(key)}>
                <span className="mode-topline"><span className="mode-icon"><Icon size={25} /></span><small>{item.tag}</small></span>
                <span className="mode-copy"><strong>{item.label}</strong><span>{item.description}</span></span>
                <span className="mode-action">{item.action}<ChevronRight size={18} /></span>
                <span className="card-visual" aria-hidden="true">{key === 'slideshow' ? <><i /><i /><i /></> : <><code>&lt;div&gt;</code><i /><code>animate()</code></>}</span>
              </button>
            );
          })}
        </div>
      </section>
      <footer className="home-footer"><span>脚本生成</span><i /><span>智能分镜</span><i /><span>画面创作</span><i /><span>旁白配乐</span><i /><span>一键导出</span></footer>
    </main>
  );
}

function SceneArtwork({ scene, mode, playing }: { scene: typeof scenes[number]; mode: Mode; playing: boolean }) {
  return (
    <div className={`scene-art scene-${scene.color} ${playing ? 'is-playing' : ''}`}>
      <div className="scene-grid" /><div className="scene-orb orb-one" /><div className="scene-orb orb-two" />
      {mode === 'html' && <div className="html-motion"><span>THE CITY</span><b>NEVER<br />SLEEPS</b><i>SCENE 0{scene.id}</i></div>}
      {mode === 'slideshow' && <div className="city-silhouette"><span /><span /><span /><span /><span /><span /></div>}
      <div className="scene-index">0{scene.id}</div>
    </div>
  );
}

function Sidebar({ mode, onBack }: { mode: Mode; onBack: () => void }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-head"><BrandMark /><Button aria-label="返回首页" variant="ghost" onClick={onBack} className="back-button"><ArrowLeft /></Button></div>
      <Button className="new-project"><Plus /> 新建视频</Button>
      <div className="project-label"><span>最近项目</span><MoreHorizontal size={17} /></div>
      <div className="project-list">{projects.map((project, index) => (
        <button key={project.name} className={index === 0 ? 'active' : ''}><span className="project-thumb"><Clapperboard size={15} /></span><span><b>{index === 0 ? (mode === 'html' ? '城市脉动' : project.name) : project.name}</b><small>{index === 0 ? modeDetails[mode].label : project.type} · {project.time}</small></span>{index === 0 && <span className="active-dot" />}</button>
      ))}</div>
      <div className="usage-card"><span><Sparkles size={14} /> 本月生成额度</span><div><i /></div><small>已使用 38 / 100 分钟</small></div>
      <div className="user-row"><span className="avatar">LY</span><span><b>林屿</b><small>创作者计划</small></span><MoreHorizontal size={18} /></div>
    </aside>
  );
}

function Timeline({ active, setActive, mode }: { active: number; setActive: (id: number) => void; mode: Mode }) {
  return <div className="timeline-wrap"><div className="timeline-header"><span>分镜时间线 <small>5 个场景 · 00:36</small></span><Button variant="ghost" size="sm"><Plus /> 添加分镜</Button></div><div className="timeline">
    {scenes.map((scene) => <button key={scene.id} className={active === scene.id ? 'active' : ''} onClick={() => setActive(scene.id)}><div className="thumb-art"><SceneArtwork scene={scene} mode={mode} playing={false} /><span>{scene.duration}</span></div><b>0{scene.id} {scene.title}</b></button>)}
    <button className="add-scene"><Plus /><span>新分镜</span></button>
  </div></div>;
}

function ChatPanel({ mode }: { mode: Mode }) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<string[]>([]);
  const send = () => { if (message.trim()) { setMessages([...messages, message.trim()]); setMessage(''); } };
  return (
    <aside className="chat-panel">
      <div className="chat-head"><span><WandSparkles size={18} /> AI 导演</span><button aria-label="更多选项"><MoreHorizontal size={19} /></button></div>
      <div className="chat-body">
        <div className="ai-message"><span className="ai-avatar"><Sparkles size={15} /></span><div><p>视频初稿已经准备好了。</p><p>我根据“赛博朋克城市夜景”的主题，生成了 <b>5 个分镜</b>，并完成旁白与配乐匹配。</p></div></div>
        <div className="process-card">{[['脚本与分镜','5 个场景'],[mode === 'html' ? '网页动画' : '画面生成',mode === 'html' ? '5 组动效' : '5 张图片'],['旁白语音','沉稳男声'],['背景音乐','Neon Drift']].map(([label,result]) => <div key={label}><span><Check size={13} /> {label}</span><small>{result}</small></div>)}</div>
        <div className="ai-message compact"><span className="ai-avatar"><Sparkles size={15} /></span><div><p>点击下方分镜可以逐段预览，也可以直接告诉我你想调整什么。</p></div></div>
        <div className="quick-actions"><button onClick={() => setMessage('让整体节奏更紧凑')}><Clock3 size={14} /> 节奏更紧凑</button><button onClick={() => setMessage('把画面调得更有电影感')}><Sparkles size={14} /> 更有电影感</button><button onClick={() => setMessage('更换旁白声音')}><Volume2 size={14} /> 更换旁白</button></div>
        {messages.map((item, index) => <div className="user-message" key={`${item}-${index}`}>{item}</div>)}
      </div>
      <div className="chat-compose"><textarea value={message} onChange={(e) => setMessage(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }} placeholder="告诉 AI 你想怎么调整…" /><div><span>按 Enter 发送</span><Button aria-label="发送消息" size="icon" onClick={send} disabled={!message.trim()}><Send /></Button></div></div>
    </aside>
  );
}

function Studio({ mode, onBack }: { mode: Mode; onBack: () => void }) {
  const [active, setActive] = useState(2);
  const [captions, setCaptions] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [exporting, setExporting] = useState(false);
  const scene = useMemo(() => scenes.find((item) => item.id === active) ?? scenes[0], [active]);
  const exportVideo = () => { setExporting(true); window.setTimeout(() => setExporting(false), 1800); };
  return (
    <main className="studio-shell">
      <Sidebar mode={mode} onBack={onBack} />
      <section className="editor">
        <header className="editor-toolbar"><div><h1>{mode === 'html' ? '城市脉动' : '城市夜行者'}</h1><span><i /> 已自动保存</span></div><div className="toolbar-actions"><label><Captions size={16} /> 字幕 <Switch checked={captions} onCheckedChange={setCaptions} size="sm" /></label><Button variant="ghost" size="icon" aria-label="全屏预览" onClick={() => document.querySelector('.preview-stage')?.requestFullscreen?.()}><Expand /></Button><Button className="export-button" onClick={exportVideo} disabled={exporting}><Download /> {exporting ? '正在导出…' : '录屏导出'}</Button></div></header>
        <div className="preview-area"><div className="preview-stage"><SceneArtwork scene={scene} mode={mode} playing={playing} /><div className="preview-badge">{modeDetails[mode].label}</div>{captions && <div className="caption">{scene.caption}</div>}<button className="play-button" aria-label={playing ? '暂停' : '播放'} onClick={() => setPlaying(!playing)}>{playing ? <Pause /> : <Play fill="currentColor" />}</button><div className="player-bar"><button onClick={() => setPlaying(!playing)}>{playing ? <Pause size={15} /> : <Play size={15} fill="currentColor" />}</button><span>00:{String((active - 1) * 7 + 3).padStart(2, '0')}</span><div className="progress"><i style={{ width: `${active * 18}%` }} /></div><span>00:36</span><Volume2 size={16} /></div></div></div>
        <Timeline active={active} setActive={setActive} mode={mode} />
      </section>
      <ChatPanel mode={mode} />
      {exporting && <div className="export-toast"><span className="spinner" /> 正在录制并合成视频，请稍候…</div>}
    </main>
  );
}

export default function HomePage() {
  const [mode, setMode] = useState<Mode | null>(null);

  useEffect(() => {
    const context = (document as Document & {
      modelContext?: {
        registerTool: (tool: {
          name: string;
          description: string;
          inputSchema: object;
          execute: (input: unknown) => { ok: boolean; mode?: Mode };
        }) => void;
      };
    }).modelContext;
    if (!context) return;
    context.registerTool({
      name: 'start_video_creation',
      description: '选择图片轮播或 HTML 视频模式并进入创作工作台。',
      inputSchema: {
        type: 'object',
        properties: { mode: { type: 'string', enum: ['slideshow', 'html'] } },
        required: ['mode'],
      },
      execute: (input: unknown) => {
        const selected = (input as { mode?: Mode }).mode;
        if (selected !== 'slideshow' && selected !== 'html') return { ok: false };
        setMode(selected);
        return { ok: true, mode: selected };
      },
    });
  }, []);

  return mode ? <Studio mode={mode} onBack={() => setMode(null)} /> : <Home onSelect={setMode} />;
}
