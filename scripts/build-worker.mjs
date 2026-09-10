import { copyFile, writeFile } from 'node:fs/promises';

await copyFile('dist/server/index.js', 'dist/server/application.js');
await copyFile('server/volcengine.mjs', 'dist/server/volcengine.mjs');
await writeFile(
  'dist/server/index.js',
  `import render from './application.js';
import { videoApi } from './volcengine.mjs';
export * from './application.js';
export default {async fetch(request,env,ctx){
 const pathname=new URL(request.url).pathname;
 if(pathname.startsWith('/api/video/'))return videoApi(request,env);
 const response=await render(request);
 const signal=response.headers.get('x-vinext-static-file');
 if(signal&&env.ASSETS)return env.ASSETS.fetch(new Request(new URL(decodeURIComponent(signal),request.url),request));
 return response;
}};
`,
);
console.log('Worker entrypoint generated.');
