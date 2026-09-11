import assert from 'node:assert/strict';
import test from 'node:test';

import { assertSafeSourceUrl, contentApi, extractArticle, timeoutSignal } from '../server/content.mjs';

const auth = { 'oai-authenticated-user-id': 'user-1', origin: 'https://site.test' };

test('timeout helper remains compatible with runtimes that support timeout signals', () => {
  const signal = timeoutSignal(1000);
  assert.ok(signal === undefined || typeof signal.aborted === 'boolean');
});

test('extractArticle removes scripts and keeps useful text', () => {
  const result = extractArticle('<html><head><title>AI 发布新模型</title><meta name="description" content="重要更新"></head><body><script>bad()</script><article>模型今天发布，面向开发者。</article></body></html>');
  assert.equal(result.title, 'AI 发布新模型');
  assert.match(result.text, /重要更新/);
  assert.doesNotMatch(result.text, /bad/);
});

test('source URL validation blocks internal targets', () => {
  assert.throws(() => assertSafeSourceUrl('http://example.com/news'), /HTTPS/);
  assert.throws(() => assertSafeSourceUrl('https://127.0.0.1/admin'), /内网/);
  assert.equal(assertSafeSourceUrl('https://news.example.com/a').hostname, 'news.example.com');
});

test('content endpoint creates a local draft from pasted text', async () => {
  const response = await contentApi(new Request('https://site.test/api/content/analyze', {
    method: 'POST', headers: { ...auth, 'content-type': 'application/json' },
    body: JSON.stringify({ sourceText: '某实验室今天发布新的多模态模型。该模型支持语音、图像和实时交互，开发者将在下月获得测试权限。' }),
  }));
  const data = await response.json();
  assert.equal(response.status, 200);
  assert.equal(data.generatedBy, 'local');
  assert.match(data.summary, /多模态模型/);
});

test('content endpoint imports a public article and calls Ark text generation', async () => {
  const calls = [];
  const fakeFetch = async (url, init) => {
    calls.push({ url: String(url), init });
    if (String(url).includes('news.example.com')) {
      return new Response('<title>模型新闻</title><p>一家实验室发布新模型，推理速度提升。</p>', { headers: { 'content-type': 'text/html' } });
    }
    return new Response(JSON.stringify({ choices: [{ message: { content: '{"title":"新模型发布","summary":"实验室发布了新模型。","why":"这将影响开发者的模型选型。"}' } }] }), { headers: { 'content-type': 'application/json' } });
  };
  const response = await contentApi(new Request('https://site.test/api/content/analyze', {
    method: 'POST', headers: { ...auth, 'content-type': 'application/json' },
    body: JSON.stringify({ sourceUrl: 'https://news.example.com/story' }),
  }), { ARK_API_KEY: 'secret', ARK_TEXT_MODEL_ID: 'text-model' }, fakeFetch);
  const data = await response.json();
  assert.equal(response.status, 200);
  assert.equal(data.generatedBy, 'ark');
  assert.equal(data.title, '新模型发布');
  assert.equal(calls[1].url, 'https://ark.cn-beijing.volces.com/api/v3/chat/completions');
  assert.equal(calls[1].init.redirect, 'manual');
  assert.equal(calls[1].init.headers.authorization, 'Bearer secret');
  assert.deepEqual(JSON.parse(calls[1].init.body).thinking, { type: 'disabled' });
});
