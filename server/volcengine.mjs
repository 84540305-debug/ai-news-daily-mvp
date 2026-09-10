const DEFAULT_BASE_URL = 'https://ark.cn-beijing.volces.com/api/v3';
const taskIdPattern = /^[A-Za-z0-9_-]{6,160}$/;

const json = (value, status = 200) =>
  Response.json(value, { status, headers: { 'cache-control': 'no-store' } });

const fail = (message, status = 400) => {
  throw Object.assign(new Error(message), { status });
};

function text(value, name, max) {
  if (typeof value !== 'string' || !value.trim()) fail(`请填写${name}`);
  if (value.length > max) fail(`${name}内容过长`);
  return value.trim();
}

export function buildVideoRequest(input, model) {
  const title = text(input.title, '视频标题', 160);
  const summary = text(input.summary, '新闻摘要', 3000);
  const why = text(input.why, '核心解读', 2000);
  const duration = Number(input.duration);
  if (![5, 10].includes(duration)) fail('视频时长只支持 5 秒或 10 秒');
  const ratio = ['16:9', '9:16', '1:1'].includes(input.ratio) ? input.ratio : '16:9';
  const style = ['科技资讯', '简洁图文', '未来电影感'].includes(input.style) ? input.style : '科技资讯';
  const audioMode = ['narration', 'ambience', 'mute'].includes(input.audioMode) ? input.audioMode : 'narration';
  const audioPrompt = audioMode === 'narration'
    ? '生成清晰自然的普通话女声旁白，并加入低音量科技感背景音乐；旁白内容准确概括新闻，不要念出网址。'
    : audioMode === 'ambience'
      ? '不要加入人物口播，只生成与画面同步的自然音效和低音量背景音乐。'
      : '不要生成旁白、音乐或环境音。';
  const prompt = [
    `制作一支${duration}秒的中文 AI 新闻短视频。`,
    `标题：${title}`,
    `新闻摘要：${summary}`,
    `核心解读：${why}`,
    `视觉风格：${style}。画面清晰、节奏紧凑、镜头连贯，避免出现无法辨认的文字和品牌商标。`,
    `声音要求：${audioPrompt}`,
  ].join('\n');
  const content = [{ type: 'text', text: prompt }];
  if (input.imageUrl) {
    let url;
    try { url = new URL(input.imageUrl); } catch { fail('参考图片链接无效'); }
    if (url.protocol !== 'https:') fail('参考图片必须使用 HTTPS 链接');
    content.push({ type: 'image_url', image_url: { url: url.href }, role: 'first_frame' });
  }
  return { model, content, duration, ratio, generate_audio: audioMode !== 'mute', watermark: true };
}

export function normalizeTask(raw) {
  const videoUrl = raw?.content?.video_url || raw?.output?.video_url || raw?.video_url || null;
  const state = String(raw?.status || raw?.state || 'unknown').toLowerCase();
  const progress = Number.isFinite(raw?.progress) ? Math.max(0, Math.min(100, raw.progress)) : null;
  return {
    id: raw?.id || raw?.task_id || null,
    status: state,
    progress,
    videoUrl: typeof videoUrl === 'string' && videoUrl.startsWith('https://') ? videoUrl : null,
    error: raw?.error?.message || raw?.message || null,
  };
}

async function arkFetch(path, init, env, fetchImpl) {
  const base = String(env.ARK_BASE_URL || DEFAULT_BASE_URL).replace(/\/$/, '');
  if (!base.startsWith('https://')) fail('火山方舟接口地址配置无效', 503);
  const response = await fetchImpl(`${base}${path}`, {
    ...init,
    redirect: 'error',
    headers: {
      authorization: `Bearer ${env.ARK_API_KEY}`,
      'content-type': 'application/json',
      ...(init.headers || {}),
    },
  });
  const rawText = await response.text();
  let data = {};
  try { data = rawText ? JSON.parse(rawText) : {}; } catch { fail('火山方舟返回了无法识别的数据', 502); }
  if (!response.ok) {
    const detail = data?.error?.message || data?.message || `HTTP ${response.status}`;
    fail(`火山方舟请求失败：${detail}`, response.status === 401 || response.status === 403 ? 503 : 502);
  }
  return data;
}

export async function videoApi(request, env, fetchImpl = fetch) {
  try {
    const url = new URL(request.url);
    if (request.method !== 'GET' && request.headers.get('origin') && request.headers.get('origin') !== url.origin) {
      fail('请求来源不允许', 403);
    }
    if (!request.headers.get('oai-authenticated-user-id')) fail('请先登录后使用视频生成', 401);
    const configured = Boolean(env.ARK_API_KEY && env.ARK_VIDEO_MODEL_ID);
    if (url.pathname === '/api/video/config' && request.method === 'GET') {
      return json({ configured, provider: '火山方舟 · Seedance' });
    }
    if (!configured) fail('视频服务尚未配置，请先添加 ARK_API_KEY 和 ARK_VIDEO_MODEL_ID', 503);

    if (url.pathname === '/api/video/tasks' && request.method === 'POST') {
      const raw = await request.text();
      if (raw.length > 12000) fail('请求内容过长', 413);
      let input;
      try { input = JSON.parse(raw); } catch { fail('请求格式错误'); }
      const payload = buildVideoRequest(input, env.ARK_VIDEO_MODEL_ID);
      const result = await arkFetch('/contents/generations/tasks', {
        method: 'POST',
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(30000),
      }, env, fetchImpl);
      const task = normalizeTask(result);
      if (!task.id || !taskIdPattern.test(task.id)) fail('火山方舟没有返回有效的任务编号', 502);
      return json(task, 201);
    }

    const match = url.pathname.match(/^\/api\/video\/tasks\/([A-Za-z0-9_-]{6,160})$/);
    if (match && request.method === 'GET') {
      const result = await arkFetch(`/contents/generations/tasks/${encodeURIComponent(match[1])}`, {
        method: 'GET',
        signal: AbortSignal.timeout(20000),
      }, env, fetchImpl);
      return json(normalizeTask(result));
    }
    fail('接口不存在', 404);
  } catch (error) {
    return json({ error: error?.status ? error.message : '视频服务暂时不可用，请稍后重试' }, error?.status || 502);
  }
}
