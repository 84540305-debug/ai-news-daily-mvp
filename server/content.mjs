const DEFAULT_BASE_URL = 'https://ark.cn-beijing.volces.com/api/v3';
const MAX_SOURCE_LENGTH = 60000;
const MAX_REMOTE_BYTES = 1024 * 1024;

export const timeoutSignal = (milliseconds) =>
  typeof AbortSignal !== 'undefined' && typeof AbortSignal.timeout === 'function'
    ? AbortSignal.timeout(milliseconds)
    : undefined;

const json = (value, status = 200) =>
  Response.json(value, { status, headers: { 'cache-control': 'no-store' } });

const fail = (message, status = 400) => {
  throw Object.assign(new Error(message), { status });
};

function cleanText(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function decodeHtml(value) {
  return value
    .replace(/&nbsp;|&#160;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;|&#34;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)));
}

export function assertSafeSourceUrl(value) {
  let url;
  try { url = new URL(value); } catch { fail('内容链接无效'); }
  const host = url.hostname.toLowerCase().replace(/^\[|\]$/g, '');
  if (url.protocol !== 'https:' || url.username || url.password || (url.port && url.port !== '443')) {
    fail('内容链接必须是公开可访问的 HTTPS 地址');
  }
  if (
    host === 'localhost' || host === '0.0.0.0' || host === '::1' ||
    host.endsWith('.local') || host.endsWith('.internal') ||
    /^127\./.test(host) || /^10\./.test(host) || /^192\.168\./.test(host) ||
    /^169\.254\./.test(host) || /^172\.(1[6-9]|2\d|3[01])\./.test(host) ||
    /^fc/i.test(host) || /^fd/i.test(host) || /^fe8/i.test(host)
  ) fail('不允许读取本地或内网地址');
  return url;
}

async function readLimitedBody(response) {
  const announced = Number(response.headers.get('content-length'));
  if (Number.isFinite(announced) && announced > MAX_REMOTE_BYTES) fail('链接内容超过 1 MB 限制', 413);
  if (!response.body?.getReader) {
    const text = await response.text();
    if (text.length > MAX_REMOTE_BYTES) fail('链接内容超过 1 MB 限制', 413);
    return text;
  }
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let total = 0;
  let result = '';
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > MAX_REMOTE_BYTES) {
      await reader.cancel();
      fail('链接内容超过 1 MB 限制', 413);
    }
    result += decoder.decode(value, { stream: true });
  }
  return result + decoder.decode();
}

export function extractArticle(html) {
  const title = decodeHtml(
    html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)/i)?.[1] ||
    html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || '',
  );
  const description = decodeHtml(
    html.match(/<meta[^>]+(?:name|property)=["'](?:description|og:description)["'][^>]+content=["']([^"']+)/i)?.[1] || '',
  );
  const body = decodeHtml(html
    .replace(/<(script|style|svg|noscript|template)[^>]*>[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<[^>]+>/g, ' '));
  return { title: cleanText(title), text: cleanText(`${description} ${body}`).slice(0, 30000) };
}

async function fetchArticle(sourceUrl, fetchImpl) {
  let url = assertSafeSourceUrl(sourceUrl);
  for (let redirects = 0; redirects <= 3; redirects += 1) {
    const response = await fetchImpl(url, {
      method: 'GET', redirect: 'manual', signal: timeoutSignal(15000),
      headers: { accept: 'text/html,text/plain;q=0.9', 'user-agent': 'FrameFlow/1.0 content importer' },
    });
    if ([301, 302, 303, 307, 308].includes(response.status)) {
      const location = response.headers.get('location');
      if (!location || redirects === 3) fail('内容链接跳转次数过多', 422);
      url = assertSafeSourceUrl(new URL(location, url).href);
      continue;
    }
    if (!response.ok) fail(`无法读取链接内容（HTTP ${response.status}）`, 422);
    const type = response.headers.get('content-type') || '';
    if (!/text\/(html|plain)/i.test(type)) fail('当前链接不是可读取的网页或纯文本', 415);
    return { ...extractArticle(await readLimitedBody(response)), url: url.href };
  }
  fail('无法读取链接内容', 422);
}

function localDraft(source, preferredTitle = '') {
  const compact = cleanText(source);
  const firstSentence = compact.split(/(?<=[。！？.!?])\s*/)[0] || compact;
  const title = cleanText(preferredTitle || firstSentence).slice(0, 70) || '内容视频解读';
  const summary = compact.slice(0, 420);
  return {
    title,
    summary,
    why: `这段内容值得关注，因为它可能影响相关行业的产品方向、用户体验与后续决策。建议结合原始来源继续核实关键数据和时间信息。`,
    generatedBy: 'local',
  };
}

function parseModelJson(value) {
  const cleaned = String(value || '').replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
  let data;
  try { data = JSON.parse(cleaned); } catch { fail('文字模型返回格式异常，请重试', 502); }
  const title = cleanText(data.title).slice(0, 160);
  const summary = cleanText(data.summary).slice(0, 1200);
  const why = cleanText(data.why).slice(0, 800);
  if (!title || !summary || !why) fail('文字模型没有生成完整内容，请重试', 502);
  return { title, summary, why, generatedBy: 'ark' };
}

async function generateDraft(source, preferredTitle, env, fetchImpl) {
  if (!env.ARK_API_KEY || !env.ARK_TEXT_MODEL_ID) return localDraft(source, preferredTitle);
  const base = String(env.ARK_BASE_URL || DEFAULT_BASE_URL).replace(/\/$/, '');
  if (!base.startsWith('https://')) fail('火山方舟接口地址配置无效', 503);
  const response = await fetchImpl(`${base}/chat/completions`, {
    method: 'POST', redirect: 'manual', signal: timeoutSignal(30000),
    headers: { authorization: `Bearer ${env.ARK_API_KEY}`, 'content-type': 'application/json' },
    body: JSON.stringify({
      model: env.ARK_TEXT_MODEL_ID,
      temperature: 0.3,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: '你是中文新闻视频编辑。只输出 JSON，字段为 title、summary、why。标题简洁准确；摘要保留事实；核心解读说明影响，不编造数据。' },
        { role: 'user', content: `候选标题：${preferredTitle || '无'}\n原始内容：${source.slice(0, 18000)}` },
      ],
    }),
  });
  const raw = await response.text();
  let data;
  try { data = raw ? JSON.parse(raw) : {}; } catch { fail('火山方舟返回了无法识别的数据', 502); }
  if (!response.ok) {
    const detail = data?.error?.message || data?.message || `HTTP ${response.status}`;
    fail(`火山方舟文字生成失败：${detail}`, response.status === 401 || response.status === 403 ? 503 : 502);
  }
  return parseModelJson(data?.choices?.[0]?.message?.content);
}

export async function contentApi(request, env = {}, fetchImpl = fetch) {
  try {
    const url = new URL(request.url);
    if (!request.headers.get('oai-authenticated-user-id')) fail('请先登录后使用内容生成', 401);
    if (url.pathname === '/api/content/config' && request.method === 'GET') {
      return json({ textModelConfigured: Boolean(env.ARK_API_KEY && env.ARK_TEXT_MODEL_ID) });
    }
    if (url.pathname !== '/api/content/analyze' || request.method !== 'POST') fail('接口不存在', 404);
    if (request.headers.get('origin') && request.headers.get('origin') !== url.origin) fail('请求来源不允许', 403);
    const raw = await request.text();
    if (raw.length > MAX_SOURCE_LENGTH + 2000) fail('提交内容过长', 413);
    let input;
    try { input = JSON.parse(raw); } catch { fail('请求格式错误'); }
    const sourceText = typeof input.sourceText === 'string' ? input.sourceText.trim() : '';
    const sourceUrl = typeof input.sourceUrl === 'string' ? input.sourceUrl.trim() : '';
    if (!sourceText && !sourceUrl) fail('请粘贴文字、上传 TXT/MD，或填写内容链接');
    if (sourceText.length > MAX_SOURCE_LENGTH) fail('文字内容不能超过 60000 字符', 413);
    const article = sourceUrl ? await fetchArticle(sourceUrl, fetchImpl) : null;
    const combined = cleanText(`${sourceText} ${article?.text || ''}`);
    if (combined.length < 20) fail('可读取的内容太少，请补充更完整的文字', 422);
    const draft = await generateDraft(combined, article?.title || '', env, fetchImpl);
    return json({ ...draft, importedUrl: article?.url || null });
  } catch (error) {
    console.error('content_api_failure', {
      name: error instanceof Error ? error.name : typeof error,
      message: error instanceof Error ? error.message : 'unknown error',
      status: error?.status || null,
    });
    return json({ error: error?.status ? error.message : '内容生成暂时不可用，请稍后重试' }, error?.status || 502);
  }
}
