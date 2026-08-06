import { syncObserver } from './observer';
import { SyncQueue } from './queue';
// import { ConflictResolver } from './conflict';

/**
 * Motor Central de Sincronización.
 * Orquesta la persistencia local (IndexedDB) con la nube (Supabase).
 */
export class SyncEngine {
  private queue = new SyncQueue();

  /**
   * Registra el Service Worker con la API nativa de Background Sync (si está soportada).
   * Permite que el SO ejecute el sync incluso con la PWA cerrada.
   */
  async registerBackgroundSync() {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator && 'SyncManager' in window) {
      try {
        const registration = await navigator.serviceWorker.ready;
        // @ts-ignore - TS a veces no reconoce SyncManager en lib estándar antigua
        await registration.sync.register('lifeos-sync');
        console.log('[SyncEngine] Background Sync registrado exitosamente.');
      } catch (error) {
        console.error('[SyncEngine] Fallo al registrar Background Sync:', error);
      }
    }
  }

  /**
   * Gatilla el ciclo completo de sincronización bidireccional (Push/Pull).
   */
  async triggerSync() {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      syncObserver.notify('offline', 'Sin red. Sincronización pausada.');
      return;
    }

    syncObserver.notify('syncing', 'Sincronizando...');

    const success = await this.queue.processWithRetries(async () => {
      // 1. PULL: Bajar cambios de Supabase (Infraestructura Futura)
      await this.pullFromCloud();

      // 2. PUSH: Subir mutaciones de IndexedDB (Infraestructura Futura)
      await this.pushToCloud();
    });

    if (success) {
      syncObserver.notify('idle', 'Datos sincronizados.');
    } else {
      syncObserver.notify('error', 'Error al sincronizar.');
    }
  }

  // --- Capas a implementar con datos y SDK real en el futuro ---

  private async pullFromCloud() {
    // Aquí se consultará a Supabase y se llamará a ConflictResolver.resolveLWW()
  }

  private async pushToCloud() {
    // Aquí se extraerá la cola del Outbox local usando BaseRepository.getPendingSync()
  }
}

export const syncEngine = new SyncEngine();
