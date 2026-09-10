import assert from 'node:assert/strict';
import test from 'node:test';

import worker from '../server/worker.mjs';

test('worker forwards page requests to static assets', async () => {
  let received;
  const request = new Request('https://example.com/video-create');
  const response = await worker.fetch(request, {
    ASSETS: {
      fetch(assetRequest) {
        received = assetRequest;
        return new Response('page');
      },
    },
  });

  assert.equal(received, request);
  assert.equal(await response.text(), 'page');
});

test('worker keeps video API requests on the server', async () => {
  let assetsCalled = false;
  const response = await worker.fetch(new Request('https://example.com/api/video/config', {
    headers: { 'oai-authenticated-user-id': 'test-user' },
  }), {
    ASSETS: {
      fetch() {
        assetsCalled = true;
        return new Response('page');
      },
    },
  });

  assert.equal(assetsCalled, false);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), {
    configured: false,
    provider: '火山方舟 · Seedance',
  });
});

test('worker keeps content API requests on the server', async () => {
  let assetsCalled = false;
  const response = await worker.fetch(new Request('https://example.com/api/content/config', {
    headers: { 'oai-authenticated-user-id': 'test-user' },
  }), { ASSETS: { fetch() { assetsCalled = true; } } });
  assert.equal(assetsCalled, false);
  assert.equal(response.status, 200);
});

test('worker reports a missing static asset binding', async () => {
  const response = await worker.fetch(new Request('https://example.com/'));
  assert.equal(response.status, 503);
});
