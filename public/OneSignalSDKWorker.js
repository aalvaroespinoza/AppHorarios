try {
  importScripts('https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js');
} catch {
  // Push is optional. The local app remains available without its SDK.
}

const CACHE_PREFIX = 'app-horarios-';
const CACHE_NAME = `${CACHE_PREFIX}glass-v3`;
const DOCUMENT_CACHE = `${CACHE_NAME}-documents`;
const CORE_ROUTES = ['/', '/viajes', '/horarios', '/aulas', '/configuracion', '/configuracion/materias', '/offline'];
const PRE_CACHE = ['/manifest.json', '/icon', '/apple-icon', '/icons/icon-192.png', '/icons/icon-512.png', '/icons/apple-touch-icon.png'];

const OFFLINE_HTML = `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="theme-color" content="#0b1020"><title>Sin conexión — LifeOS</title><style>*{box-sizing:border-box}body{margin:0;min-height:100dvh;display:grid;place-items:center;padding:24px;background:#f4f6fc;color:#14213b;font:16px/1.5 system-ui,sans-serif}.card{max-width:360px;padding:32px;border:1px solid #dbe2f3;border-radius:32px;background:#ffffffd9;box-shadow:0 20px 70px #536cb31a}h1{font-size:26px;letter-spacing:-.04em}p{color:#56617a}a,button{display:inline-block;min-height:44px;padding:12px 20px;border:0;border-radius:24px;background:#465dde;color:white;font:inherit;text-decoration:none}button{margin-top:12px}@media(prefers-color-scheme:dark){body{background:#0b1020;color:#eef3ff}.card{background:#182239;border-color:#334366}p{color:#b6c2d9}}</style></head><body><main class="card"><h1>Sin conexión</h1><p>Esta pantalla todavía no está disponible sin internet. Tus datos guardados siguen en este dispositivo.</p><a href="/">Volver a Viajes</a><br><button onclick="location.reload()">Reintentar</button></main></body></html>`;

function canStore(response) {
  return response.ok && !response.redirected && !/no-store|private/i.test(response.headers.get('cache-control') || '');
}

async function warmShell() {
  const assets = await caches.open(CACHE_NAME);
  const documents = await caches.open(DOCUMENT_CACHE);
  await assets.addAll(PRE_CACHE);
  // Only public, locally populated screens belong to the offline shell.
  // Cache full HTML separately from Next's RSC/prefetch responses.
  await Promise.all(CORE_ROUTES.map(async (path) => {
    const request = new Request(new URL(path, self.location.origin), { headers: { Accept: 'text/html' } });
    const response = await fetch(request);
    if (!canStore(response) || !response.headers.get('content-type')?.includes('text/html')) {
      throw new Error(`Offline shell unavailable: ${path}`);
    }
    const html = await response.clone().text();
    await documents.put(request, response);
    const chunks = [...new Set(Array.from(html.matchAll(/(?:src|href)="([^"\s]*\/_next\/static\/[^"\s]+)"/g), match => match[1].replaceAll('&amp;', '&')))];
    await Promise.all(chunks.map(async (chunk) => {
      const url = new URL(chunk, self.location.origin);
      if (url.origin !== self.location.origin || await assets.match(url)) return;
      const asset = await fetch(url);
      if (!asset.ok) throw new Error(`Offline asset unavailable: ${url.pathname}`);
      await assets.put(url, asset);
    }));
  }));
}

self.addEventListener('install', event => {
  // A failed warm-up leaves the previous worker available instead of claiming
  // offline support with an incomplete shell.
  event.waitUntil(warmShell().then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys
    .filter(key => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME && key !== DOCUMENT_CACHE)
    .map(key => caches.delete(key))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin || request.headers.has('authorization')) return;
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/auth') || url.pathname.startsWith('/_next/webpack-hmr') || url.pathname.startsWith('/__nextjs')) return;

  const isRsc = request.headers.get('RSC') === '1' || url.searchParams.has('_rsc');
  if (isRsc) {
    // A 503 asks the App Router to fall back to full navigation. Never serve
    // cached HTML as an RSC stream (or reuse another router state's payload).
    event.respondWith(fetch(request).catch(() => new Response(null, { status: 503 })));
    return;
  }

  if (request.mode === 'navigate' && CORE_ROUTES.includes(url.pathname)) {
    event.respondWith((async () => {
      const cache = await caches.open(DOCUMENT_CACHE);
      try {
        const response = await fetch(request);
        if (canStore(response) && response.headers.get('content-type')?.includes('text/html')) {
          await cache.put(new URL(url.pathname, url.origin), response.clone());
        }
        if (response.ok) return response;
        const cached = await cache.match(new URL(url.pathname, url.origin), { ignoreVary: true });
        return cached || response;
      } catch {
        return await cache.match(new URL(url.pathname, url.origin), { ignoreVary: true }) ||
          new Response(OFFLINE_HTML, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
      }
    })());
    return;
  }

  const isAsset = url.pathname.startsWith('/_next/static/') || url.pathname.startsWith('/icons/') || PRE_CACHE.includes(url.pathname);
  if (!isAsset) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(request);
    if (cached) return cached;
    try {
      const response = await fetch(request);
      if (canStore(response)) await cache.put(request, response.clone());
      return response;
    } catch {
      return new Response(null, { status: 503 });
    }
  })());
});
