import { copyFile, mkdir, rm } from 'node:fs/promises';

await rm('dist/server', { recursive: true, force: true });
await mkdir('dist/server', { recursive: true });
await copyFile('server/worker.mjs', 'dist/server/index.js');
await copyFile('server/volcengine.mjs', 'dist/server/volcengine.mjs');
await copyFile('server/content.mjs', 'dist/server/content.mjs');
console.log('Static asset and video API worker generated.');
