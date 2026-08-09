import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // El SW nunca debe cachearse: el navegador siempre descarga
        // la versión más reciente para detectar actualizaciones.
        source: '/OneSignalSDKWorker.js',
        headers: [
          { key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate' },
          { key: 'Service-Worker-Allowed', value: '/' },
        ],
      },
      {
        // El manifest sí puede cachearse brevemente
        source: '/manifest.json',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=86400' }, // 1 día
        ],
      },
    ];
  },
};

export default nextConfig;
