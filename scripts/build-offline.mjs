import { readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';
const dist = path.resolve('dist');
const files = [];
function walk(dir) {
  for (const name of readdirSync(dir)) {
    const file = path.join(dir, name);
    if (statSync(file).isDirectory()) walk(file);
    else if (!name.startsWith('_') && name !== 'sw.js') files.push('/' + path.relative(dist, file).replaceAll('\\', '/'));
  }
}
walk(dist);
const version = createHash('sha256');
for (const file of files.sort()) version.update(readFileSync(path.join(dist, file)));
const cache = `omnisticky-${version.digest('hex').slice(0, 16)}`;
writeFileSync(path.join(dist, 'sw.js'), `const CACHE=${JSON.stringify(cache)}, FILES=${JSON.stringify(['/', ...files])};
self.addEventListener('install', event => event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(FILES))));
// Updates activate after existing app tabs close, keeping open workspaces on one version.
self.addEventListener('activate', event => event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('omnisticky-') && key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim())));
self.addEventListener('fetch', event => {
 const url = new URL(event.request.url);
 if (event.request.method !== 'GET' || url.origin !== self.location.origin || (!FILES.includes(url.pathname) && event.request.mode !== 'navigate')) return;
 event.respondWith(caches.open(CACHE).then(async cache => {
   if (event.request.mode === 'navigate') { try { const response = await fetch(event.request); if(response.ok) return response; } catch {} return await cache.match(url.pathname) || cache.match('/'); }
   return await cache.match(url.pathname) || fetch(event.request);
 }));
});\n`);
console.log(`Offline shell prepared (${files.length} assets).`);
