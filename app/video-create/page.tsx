'use client';

import { ArrowLeft, CheckCircle2, FileText, Sparkles, Upload, Video } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import styles from './styles.module.css';

export default function VideoCreatePage() {
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [why, setWhy] = useState('');
  const [duration, setDuration] = useState('45 秒');
  const [style, setStyle] = useState('科技资讯');
  const [voice, setVoice] = useState('沉稳男声');
  const [file, setFile] = useState<File | null>(null);
  const [prepared, setPrepared] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setTitle(params.get('title') ?? '今日 AI 新闻解读');
    setSummary(params.get('summary') ?? '请补充需要转成视频的新闻内容。');
    setWhy(params.get('why') ?? '帮助观众快速理解这条新闻的影响。');
  }, []);

  const scenes = useMemo(() => [
    { label: '开场', copy: title || '新闻标题' },
    { label: '发生了什么', copy: summary || '新闻摘要' },
    { label: '为什么重要', copy: why || '价值解读' },
    { label: '结尾', copy: '关注 AI 日知，持续掌握行业变化。' },
  ], [summary, title, why]);

  function prepareVideo() {
    setPrepared(true);
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  }

  return (
    <main className={styles.shell}>
      <header className={styles.header}>
        <a href="/ai-news"><ArrowLeft size={17} /> 返回 AI 日知</a>
        <span><Video size={18} /> 新闻视频工坊</span>
        <small>MVP</small>
      </header>

      <div className={styles.layout}>
        <section className={styles.editor}>
          <div className={styles.eyebrow}><Sparkles size={15} /> CONTENT TO VIDEO</div>
          <h1>将这条新闻<br />转成一支短视频</h1>
          <p className={styles.lead}>新闻内容已自动带入。确认信息、选择表达方式，并补充参考资料即可生成视频项目。</p>

          <div className={styles.form}>
            <label><span>视频标题</span><input value={title} onChange={(event) => setTitle(event.target.value)} /></label>
            <label><span>新闻摘要</span><textarea value={summary} onChange={(event) => setSummary(event.target.value)} rows={4} /></label>
            <label><span>核心解读</span><textarea value={why} onChange={(event) => setWhy(event.target.value)} rows={3} /></label>

            <div className={styles.options}>
              <label><span>视频时长</span><select value={duration} onChange={(event) => setDuration(event.target.value)}><option>30 秒</option><option>45 秒</option><option>60 秒</option></select></label>
              <label><span>画面风格</span><select value={style} onChange={(event) => setStyle(event.target.value)}><option>科技资讯</option><option>简洁图文</option><option>未来电影感</option></select></label>
              <label><span>旁白声音</span><select value={voice} onChange={(event) => setVoice(event.target.value)}><option>沉稳男声</option><option>清晰女声</option><option>轻快青年声</option></select></label>
            </div>

            <label className={styles.upload}><Upload size={20} /><span><strong>{file ? file.name : '上传参考资料'}</strong><small>支持图片、PDF、文档或视频素材</small></span><input type="file" accept="image/*,video/*,.pdf,.txt,.doc,.docx" onChange={(event) => setFile(event.target.files?.[0] ?? null)} /></label>
            <button className={styles.primary} onClick={prepareVideo}><Sparkles size={18} /> 准备视频项目</button>
          </div>
        </section>

        <aside className={styles.storyboard}>
          <div className={styles.storyboardHead}><span>自动分镜草案</span><small>{duration} · {style}</small></div>
          <div className={styles.scenes}>{scenes.map((scene, index) => <article key={scene.label}><span>0{index + 1}</span><div><strong>{scene.label}</strong><p>{scene.copy}</p></div></article>)}</div>
          <div className={styles.voice}><FileText size={17} /><span><strong>旁白与字幕</strong><small>{voice} · 自动生成中文字幕</small></span></div>
        </aside>
      </div>

      {prepared && <section className={styles.ready}><CheckCircle2 /><div><strong>视频项目已准备完成</strong><p>新闻内容、视频参数和参考资料已整理好。接入视频生成模型后，即可在这里生成画面、旁白并导出 MP4。</p></div></section>}
    </main>
  );
}
