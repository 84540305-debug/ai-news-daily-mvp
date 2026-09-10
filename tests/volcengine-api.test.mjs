import assert from 'node:assert/strict';
import test from 'node:test';
import { buildVideoRequest, normalizeTask, videoApi } from '../server/volcengine.mjs';

const authHeaders = { 'oai-authenticated-user-id': 'user-1' };

test('buildVideoRequest creates a Seedance request with narration audio', () => {
  const payload = buildVideoRequest({ title: 'AI 新闻', summary: '模型发布', why: '影响开发者', duration: 5, ratio: '16:9', style: '科技资讯', audioMode: 'narration' }, 'seedance-model');
  assert.equal(payload.model, 'seedance-model');
  assert.equal(payload.duration, 5);
  assert.equal(payload.generate_audio, true);
  assert.match(payload.content[0].text, /AI 新闻/);
  assert.match(payload.content[0].text, /普通话女声旁白/);
});

test('buildVideoRequest can explicitly create a silent video', () => {
  const payload = buildVideoRequest({ title: '标题', summary: '摘要', why: '解读', duration: 5, audioMode: 'mute' }, 'model');
  assert.equal(payload.generate_audio, false);
});

test('buildVideoRequest rejects insecure reference URLs', () => {
  assert.throws(() => buildVideoRequest({ title: '标题', summary: '摘要', why: '解读', duration: 5, imageUrl: 'http://example.com/a.jpg' }, 'model'), /HTTPS/);
});

test('normalizeTask exposes a safe video result', () => {
  assert.deepEqual(normalizeTask({ id: 'task_123456', status: 'succeeded', content: { video_url: 'https://cdn.example.com/video.mp4' } }), {
    id: 'task_123456', status: 'succeeded', progress: null, videoUrl: 'https://cdn.example.com/video.mp4', error: null,
  });
});

test('config endpoint reports missing credentials', async () => {
  const response = await videoApi(new Request('https://site.test/api/video/config', { headers: authHeaders }), {});
  assert.equal(response.status, 200);
  assert.equal((await response.json()).configured, false);
});

test('create endpoint forwards request without exposing credentials', async () => {
  let received;
  const fakeFetch = async (url, init) => {
    received = { url, init };
    return new Response(JSON.stringify({ id: 'task_123456', status: 'queued' }), { status: 200 });
  };
  const request = new Request('https://site.test/api/video/tasks', {
    method: 'POST', headers: { ...authHeaders, origin: 'https://site.test' },
    body: JSON.stringify({ title: '标题', summary: '摘要', why: '解读', duration: 5, ratio: '9:16', style: '科技资讯', audioMode: 'narration' }),
  });
  const response = await videoApi(request, { ARK_API_KEY: 'secret', ARK_VIDEO_MODEL_ID: 'model' }, fakeFetch);
  assert.equal(response.status, 201);
  assert.equal(received.url, 'https://ark.cn-beijing.volces.com/api/v3/contents/generations/tasks');
  assert.equal(received.init.headers.authorization, 'Bearer secret');
});
