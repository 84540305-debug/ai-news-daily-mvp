'use client';

import { AlertCircle, ArrowLeft, CheckCircle2, ExternalLink, FileText, Link2, LoaderCircle, Play, Sparkles, Video } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import styles from './styles.module.css';

type ServiceState = 'checking' | 'ready' | 'missing' | 'error';
type VideoTask = { id: string; status: string; progress: number | null; videoUrl: string | null; error: string | null };
const terminalStates = new Set(['succeeded', 'completed', 'failed', 'cancelled', 'canceled']);

export default function VideoCreatePage() {
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [why, setWhy] = useState('');
  const [duration, setDuration] = useState('5');
  const [style, setStyle] = useState('科技资讯');
  const [ratio, setRatio] = useState('16:9');
  const [audioMode, setAudioMode] = useState('narration');
  const [imageUrl, setImageUrl] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [sourceText, setSourceText] = useState('');
  const [sourceFile, setSourceFile] = useState('');
  const [contentBusy, setContentBusy] = useState(false);
  const [contentNotice, setContentNotice] = useState('');
  const [service, setService] = useState<ServiceState>('checking');
  const [task, setTask] = useState<VideoTask | null>(null);
  const [error, setError] = useState('');
  const polling = useRef<number | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setTitle(params.get('title') ?? '今日 AI 新闻解读');
    setSummary(params.get('summary') ?? '请补充需要转成视频的新闻内容。');
    setWhy(params.get('why') ?? '帮助观众快速理解这条新闻的影响。');
    fetch('/api/video/config', { cache: 'no-store' })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || '无法检查视频服务');
        setService(data.configured ? 'ready' : 'missing');
      })
      .catch(() => setService('error'));
    return () => { if (polling.current) window.clearTimeout(polling.current); };
  }, []);

  const scenes = useMemo(() => [
    { label: '新闻钩子', copy: title || '新闻标题' },
    { label: '核心信息', copy: summary || '新闻摘要' },
    { label: '行业影响', copy: why || '价值解读' },
  ], [summary, title, why]);

  async function readJson(response: Response) {
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || '请求失败，请稍后重试');
    return data;
  }

  async function pollTask(id: string) {
    try {
      const next = await readJson(await fetch(`/api/video/tasks/${encodeURIComponent(id)}`, { cache: 'no-store' }));
      setTask(next);
      if (!terminalStates.has(next.status)) polling.current = window.setTimeout(() => pollTask(id), 5000);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : '查询生成进度失败');
    }
  }

  async function generateVideo() {
    setError('');
    setTask({ id: '', status: 'submitting', progress: null, videoUrl: null, error: null });
    try {
      const created = await readJson(await fetch('/api/video/tasks', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ title, summary, why, duration: Number(duration), style, ratio, audioMode, imageUrl: imageUrl.trim() || undefined }),
      }));
      setTask(created);
      if (!terminalStates.has(created.status)) polling.current = window.setTimeout(() => pollTask(created.id), 3000);
    } catch (cause) {
      setTask(null);
      setError(cause instanceof Error ? cause.message : '创建视频任务失败');
    }
  }

  async function analyzeContent() {
    setError('');
    setContentNotice('');
    setContentBusy(true);
    try {
      const draft = await readJson(await fetch('/api/content/analyze', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ sourceUrl: sourceUrl.trim() || undefined, sourceText: sourceText.trim() || undefined }),
      }));
      setTitle(draft.title);
      setSummary(draft.summary);
      setWhy(draft.why);
      setContentNotice(draft.generatedBy === 'ark' ? '火山方舟已生成文案，可继续修改后生成视频。' : '已生成基础文案；配置文字模型后可获得更深入的 AI 解读。');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : '内容解析失败');
    } finally {
      setContentBusy(false);
    }
  }

  async function loadTextFile(file?: File) {
    if (!file) return;
    setError('');
    if (file.size > 100_000) {
      setError('文字文件不能超过 100 KB');
      return;
    }
    if (!/\.(txt|md|markdown)$/i.test(file.name)) {
      setError('目前支持 TXT、MD 和 Markdown 文字文件');
      return;
    }
    setSourceText(await file.text());
    setSourceFile(file.name);
    setContentNotice('文字文件已读取，点击“自动生成文案”继续。');
  }

  const busy = Boolean(task && !terminalStates.has(task.status));
  const succeeded = task?.status === 'succeeded' || task?.status === 'completed';

  return (
    <main className={styles.shell}>
      <header className={styles.header}>
        <a href="/ai-news"><ArrowLeft size={17} /> 返回 AI 日知</a>
        <span><Video size={18} /> 新闻视频工坊</span>
        <small>SEEDANCE</small>
      </header>

      <div className={styles.layout}>
        <section className={styles.editor}>
          <div className={styles.eyebrow}><Sparkles size={15} /> VOLCENGINE VIDEO</div>
          <h1>把新闻变成<br />可播放的视频</h1>
          <p className={styles.lead}>粘贴文字、上传文字文件或输入网页链接，系统会先整理成标题、摘要和解读，再生成带旁白与音乐的视频。</p>

          <div className={`${styles.service} ${styles[service]}`}>
            {service === 'checking' && <><LoaderCircle className={styles.spin} size={17} /> 正在检查视频服务</>}
            {service === 'ready' && <><CheckCircle2 size={17} /> 火山方舟已连接，可以提交真实生成任务</>}
            {service === 'missing' && <><AlertCircle size={17} /> 代码已接入，配置 API Key 和 Seedance 模型后即可生成</>}
            {service === 'error' && <><AlertCircle size={17} /> 暂时无法连接视频服务，请稍后刷新</>}
          </div>

          <section className={styles.sourcePanel} aria-labelledby="source-heading">
            <div className={styles.sourceHead}>
              <div><small>STEP 01</small><h2 id="source-heading">导入内容并生成文案</h2></div>
              <span>文字 / 链接 / TXT / MD</span>
            </div>
            <label><span><Link2 size={15} /> 内容链接（可选）</span><input type="url" value={sourceUrl} onChange={(event) => setSourceUrl(event.target.value)} placeholder="https://example.com/article" /></label>
            <label><span><FileText size={15} /> 粘贴原始文字</span><textarea value={sourceText} onChange={(event) => setSourceText(event.target.value)} rows={6} maxLength={60000} placeholder="粘贴新闻、报告或视频素材说明……" /></label>
            <label className={styles.upload}>
              <FileText size={19} />
              <span><strong>{sourceFile || '上传文字文件'}</strong><small>支持 TXT、MD，最大 100 KB；文件只在当前页面读取</small></span>
              <input type="file" accept=".txt,.md,.markdown,text/plain,text/markdown" onChange={(event) => loadTextFile(event.target.files?.[0])} />
            </label>
            <button className={styles.secondary} onClick={analyzeContent} disabled={contentBusy || (!sourceUrl.trim() && !sourceText.trim())}>
              {contentBusy ? <><LoaderCircle className={styles.spin} size={18} /> 正在读取并生成</> : <><Sparkles size={18} /> 自动生成文案</>}
            </button>
            {contentNotice && <p className={styles.contentNotice}><CheckCircle2 size={15} /> {contentNotice}</p>}
          </section>

          <div className={styles.form}>
            <div className={styles.stepTitle}><small>STEP 02</small><h2>确认文案与视频设置</h2></div>
            <label><span>视频标题</span><input value={title} onChange={(event) => setTitle(event.target.value)} maxLength={160} /></label>
            <label><span>新闻摘要</span><textarea value={summary} onChange={(event) => setSummary(event.target.value)} rows={4} maxLength={3000} /></label>
            <label><span>核心解读</span><textarea value={why} onChange={(event) => setWhy(event.target.value)} rows={3} maxLength={2000} /></label>
            <div className={styles.options}>
              <label><span>样片时长</span><select value={duration} onChange={(event) => setDuration(event.target.value)}><option value="5">5 秒</option><option value="10">10 秒</option><option value="30">30 秒</option></select></label>
              <label><span>画面风格</span><select value={style} onChange={(event) => setStyle(event.target.value)}><option>科技资讯</option><option>简洁图文</option><option>未来电影感</option></select></label>
              <label><span>画面比例</span><select value={ratio} onChange={(event) => setRatio(event.target.value)}><option>16:9</option><option>9:16</option><option>1:1</option></select></label>
              <label><span>视频声音</span><select value={audioMode} onChange={(event) => setAudioMode(event.target.value)}><option value="narration">中文旁白＋音乐</option><option value="ambience">音效＋音乐</option><option value="mute">静音</option></select></label>
            </div>
            <label><span>参考图片链接（可选）</span><input type="url" value={imageUrl} onChange={(event) => setImageUrl(event.target.value)} placeholder="https://…  请使用可公开访问的 HTTPS 图片" /></label>
            <button className={styles.primary} onClick={generateVideo} disabled={service !== 'ready' || busy || !title.trim() || !summary.trim() || !why.trim()}>
              {busy ? <><LoaderCircle className={styles.spin} size={18} /> 视频生成中</> : <><Play size={18} /> 提交 Seedance 生成</>}
            </button>
            <p className={styles.costNote}>提交后会使用你的火山方舟余额。每次只生成一支样片，避免自动重复扣费。</p>
          </div>
        </section>

        <aside className={styles.storyboard}>
          <div className={styles.storyboardHead}><span>生成提示预览</span><small>{duration} 秒 · {style} · {ratio}</small></div>
          <div className={styles.scenes}>{scenes.map((scene, index) => <article key={scene.label}><span>0{index + 1}</span><div><strong>{scene.label}</strong><p>{scene.copy}</p></div></article>)}</div>
          <div className={styles.voice}><Video size={17} /><span><strong>Seedance 有声样片</strong><small>{audioMode === 'narration' ? '普通话旁白＋背景音乐' : audioMode === 'ambience' ? '环境音效＋背景音乐' : '静音视频'} · 带平台水印</small></span></div>
        </aside>
      </div>

      {(task || error) && <section className={`${styles.result} ${error ? styles.resultError : ''}`} aria-live="polite">
        {error ? <><AlertCircle /><div><strong>生成没有开始</strong><p>{error}</p></div></> : busy ? <><LoaderCircle className={styles.spin} /><div><strong>火山方舟正在生成</strong><p>任务已提交，请保持页面开启。{task?.progress !== null ? ` 当前进度 ${task?.progress}%` : '通常需要等待一段时间。'}</p></div></> : succeeded && task?.videoUrl ? <><CheckCircle2 /><div className={styles.videoResult}><strong>视频生成完成</strong><video src={task.videoUrl} controls playsInline /><a href={task.videoUrl} target="_blank" rel="noreferrer">打开原视频 <ExternalLink size={14} /></a></div></> : <><AlertCircle /><div><strong>视频生成未完成</strong><p>{task?.error || `任务状态：${task?.status}`}</p></div></>}
      </section>}
    </main>
  );
}
