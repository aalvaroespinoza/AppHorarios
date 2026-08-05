'use client';

import { useEffect } from 'react';

/**
 * ServiceWorkerRegistration
 *
 * Client Component invisible que registra el Service Worker
 * una sola vez al montar el layout raíz.
 *
 * Solo actúa en producción o cuando el navegador soporta SW.
 * No renderiza nada en la UI.
 */
export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .then((reg) => {
        console.log('[SW] Registrado. Scope:', reg.scope);
      })
      .catch((err) => {
        console.warn('[SW] Error al registrar:', err);
      });
  }, []);

  return null;
}
