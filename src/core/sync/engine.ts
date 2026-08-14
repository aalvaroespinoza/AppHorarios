import { syncObserver } from './observer';
import { SyncQueue, syncQueue } from './queue';

/**
 * Motor Central de Sincronización Local-First.
 * Orquesta la persistencia local (IndexedDB) con la nube (Supabase / Backend).
 */
export class SyncEngine {
  private queue: SyncQueue = syncQueue;

  /**
   * Registra el Service Worker con la API nativa de Background Sync (si está soportada).
   * Permite que el SO ejecute el sync incluso con la PWA cerrada.
   */
  async registerBackgroundSync() {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator && 'SyncManager' in window) {
      try {
        const registration = (await navigator.serviceWorker.ready) as any;
        if (registration && registration.sync && typeof registration.sync.register === 'function') {
          await registration.sync.register('lifeos-sync');
          console.log('[SyncEngine] Background Sync registrado exitosamente.');
        }
      } catch (error) {
        console.error('[SyncEngine] Fallo al registrar Background Sync:', error);
      }
    }
  }

  /**
   * Encola una mutación para sincronización offline en IndexedDB o la envía inmediatamente.
   */
  async addToQueue(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' = 'POST',
    body?: any,
    metadata?: Record<string, any>
  ) {
    return this.queue.addToQueue(endpoint, method, body, metadata);
  }

  /**
   * Procesa la cola de mutaciones acumuladas en IndexedDB.
   */
  async processQueue(): Promise<boolean> {
    return this.queue.processQueue();
  }

  /**
   * Gatilla el ciclo completo de sincronización bidireccional.
   */
  async triggerSync() {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      syncObserver.notify('offline', 'Sin red. Sincronización pausada.');
      return;
    }

    return this.processQueue();
  }
}

export const syncEngine = new SyncEngine();
