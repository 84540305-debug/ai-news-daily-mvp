'use client';

import { AlertCircle, ArrowLeft, CheckCircle2, ExternalLink, LoaderCircle, Play, Sparkles, Video } from 'lucide-react';
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
  const [imageUrl, setImageUrl] = useState('');
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
        body: JSON.stringify({ title, summary, why, duration: Number(duration), style, ratio, imageUrl: imageUrl.trim() || undefined }),
      }));
      setTask(created);
      if (!terminalStates.has(created.status)) polling.current = window.setTimeout(() => pollTask(created.id), 3000);
    } catch (cause) {
      setTask(null);
      setError(cause instanceof Error ? cause.message : '创建视频任务失败');
    }
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
          <p className={styles.lead}>新闻内容已自动带入。第一版直接生成 5–10 秒 Seedance 画面样片，确认风格后再扩展为多镜头长视频。</p>

          <div className={`${styles.service} ${styles[service]}`}>
            {service === 'checking' && <><LoaderCircle className={styles.spin} size={17} /> 正在检查视频服务</>}
            {service === 'ready' && <><CheckCircle2 size={17} /> 火山方舟已连接，可以提交真实生成任务</>}
            {service === 'missing' && <><AlertCircle size={17} /> 代码已接入，配置 API Key 和 Seedance 模型后即可生成</>}
            {service === 'error' && <><AlertCircle size={17} /> 暂时无法连接视频服务，请稍后刷新</>}
          </div>

          <div className={styles.form}>
            <label><span>视频标题</span><input value={title} onChange={(event) => setTitle(event.target.value)} maxLength={160} /></label>
            <label><span>新闻摘要</span><textarea value={summary} onChange={(event) => setSummary(event.target.value)} rows={4} maxLength={3000} /></label>
            <label><span>核心解读</span><textarea value={why} onChange={(event) => setWhy(event.target.value)} rows={3} maxLength={2000} /></label>
            <div className={styles.options}>
              <label><span>样片时长</span><select value={duration} onChange={(event) => setDuration(event.target.value)}><option value="5">5 秒</option><option value="10">10 秒</option></select></label>
              <label><span>画面风格</span><select value={style} onChange={(event) => setStyle(event.target.value)}><option>科技资讯</option><option>简洁图文</option><option>未来电影感</option></select></label>
              <label><span>画面比例</span><select value={ratio} onChange={(event) => setRatio(event.target.value)}><option>16:9</option><option>9:16</option><option>1:1</option></select></label>
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
          <div className={styles.voice}><Video size={17} /><span><strong>Seedance 画面样片</strong><small>带平台水印 · 完成后可在线播放</small></span></div>
        </aside>
      </div>

      {(task || error) && <section className={`${styles.result} ${error ? styles.resultError : ''}`} aria-live="polite">
        {error ? <><AlertCircle /><div><strong>生成没有开始</strong><p>{error}</p></div></> : busy ? <><LoaderCircle className={styles.spin} /><div><strong>火山方舟正在生成</strong><p>任务已提交，请保持页面开启。{task?.progress !== null ? ` 当前进度 ${task?.progress}%` : '通常需要等待一段时间。'}</p></div></> : succeeded && task?.videoUrl ? <><CheckCircle2 /><div className={styles.videoResult}><strong>视频生成完成</strong><video src={task.videoUrl} controls playsInline /><a href={task.videoUrl} target="_blank" rel="noreferrer">打开原视频 <ExternalLink size={14} /></a></div></> : <><AlertCircle /><div><strong>视频生成未完成</strong><p>{task?.error || `任务状态：${task?.status}`}</p></div></>}
      </section>}
    </main>
  );
}
