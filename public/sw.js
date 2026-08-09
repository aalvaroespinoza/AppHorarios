importScripts('https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js');

/**
 * AppHorarios — Service Worker
 *
 * Estrategia:
 *  - Estáticos (_next/static): Cache-first (son inmutables con hash)
 *  - Navegación (HTML):        Network-first → fallback offline inline
 *  - Resto:                    Network-first → fallback cache
 *
 * El SW nunca interfiere con el HMR ni las rutas internas de Next.js.
 */

const CACHE_NAME = 'app-horarios-v1';

// Assets garantizados en caché tras la instalación
const PRE_CACHE = [
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
];

// HTML de página offline (inline, no depende del servidor)
const OFFLINE_HTML = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
  <meta name="theme-color" content="#f5f5f7" />
  <title>Sin conexión — AppHorarios</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html, body { height: 100%; }
    body {
      min-height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f5f5f7;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      -webkit-font-smoothing: antialiased;
      padding: env(safe-area-inset-top) env(safe-area-inset-right)
               env(safe-area-inset-bottom) env(safe-area-inset-left);
    }
    .card {
      background: #fff;
      border: 1px solid #e5e5ea;
      border-radius: 20px;
      padding: 40px 32px;
      max-width: 360px;
      width: calc(100% - 32px);
      text-align: center;
      box-shadow: 0 1px 3px rgba(0,0,0,.06);
    }
    .icon { font-size: 48px; margin-bottom: 16px; display: block; }
    h1 { font-size: 20px; font-weight: 600; color: #1c1c1e; margin-bottom: 8px; }
    p  { font-size: 14px; color: #6e6e73; line-height: 1.5; }
    button {
      margin-top: 24px;
      padding: 10px 24px;
      background: #0071e3;
      color: #fff;
      border: none;
      border-radius: 20px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      font-family: inherit;
    }
    button:active { opacity: .8; }
  </style>
</head>
<body>
  <div class="card">
    <span class="icon" aria-hidden="true">🚌</span>
    <h1>Sin conexión</h1>
    <p>Revisá tu conexión a internet e intentá de nuevo.</p>
    <button onclick="location.reload()">Reintentar</button>
  </div>
</body>
</html>`;

// ─── Install ──────────────────────────────────────────────────────────────────

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRE_CACHE))
      .then(() => self.skipWaiting()),
  );
});

// ─── Activate ─────────────────────────────────────────────────────────────────

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

// ─── Fetch ────────────────────────────────────────────────────────────────────

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Solo manejar peticiones GET del mismo origen
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;

  // No interceptar HMR, webpack internal ni __nextjs
  if (
    url.pathname.startsWith('/_next/webpack-hmr') ||
    url.pathname.startsWith('/__nextjs') ||
    url.pathname.startsWith('/_next/data') // páginas con datos dinámicos SSR
  ) return;

  // ── Estáticos inmutables: cache-first ────────────────────────
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ??
          fetch(request).then((res) => {
            caches.open(CACHE_NAME).then((c) => c.put(request, res.clone()));
            return res;
          }),
      ),
    );
    return;
  }

  // ── Navegación HTML: network-first → offline fallback ────────
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((res) => {
          // Guardar copia en caché para uso offline futuro
          caches.open(CACHE_NAME).then((c) => c.put(request, res.clone()));
          return res;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          if (cached) return cached;
          // Página offline inline como último recurso
          return new Response(OFFLINE_HTML, {
            status: 200,
            headers: { 'Content-Type': 'text/html; charset=utf-8' },
          });
        }),
    );
    return;
  }

  // ── Resto (imágenes, fuentes, etc.): network-first ───────────
  event.respondWith(
    fetch(request)
      .then((res) => {
        if (res.ok) {
          caches.open(CACHE_NAME).then((c) => c.put(request, res.clone()));
        }
        return res;
      })
      .catch(() => caches.match(request)),
  );
});
