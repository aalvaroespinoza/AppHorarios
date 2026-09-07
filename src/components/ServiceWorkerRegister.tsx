"use client";

import { useEffect } from 'react';

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production' || !('serviceWorker' in navigator)) return;
    const register = () => {
        navigator.serviceWorker
          .register('/OneSignalSDKWorker.js', { updateViaCache: 'none' })
          .catch((error) => {
            console.error('Service Worker registration failed:', error);
          });
    };
    if (document.readyState === 'complete') register();
    else window.addEventListener('load', register, { once: true });
    return () => window.removeEventListener('load', register);
  }, []);

  return null;
}
