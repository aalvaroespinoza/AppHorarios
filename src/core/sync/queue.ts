import { 
  saveToQueue, 
  getQueue, 
  removeFromQueue, 
  QueuedMutation 
} from '@/core/utils/indexedDB';
import { syncObserver } from './observer';

/**
 * Gestor de la cola de sincronización offline con IndexedDB y reintentos automáticos.
 */
export class SyncQueue {
  private isProcessing = false;

  /**
   * Añade una mutación a la cola o la ejecuta directamente si hay internet.
   */
  async addToQueue(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' = 'POST',
    body?: any,
    metadata?: Record<string, any>
  ): Promise<QueuedMutation | null> {
    const mutation: QueuedMutation = {
      id: 'mut-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      endpoint,
      method,
      body,
      timestamp: Date.now(),
      retryCount: 0,
      metadata
    };

    // Si no hay conexión, guardar directamente en IndexedDB
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      await saveToQueue(mutation);
      syncObserver.notify('offline', 'Guardado localmente. Se sincronizará al volver la conexión.');
      return mutation;
    }

    // Si hay conexión, intentar enviar
    try {
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: body ? JSON.stringify(body) : undefined
      });

      if (!response.ok) {
        throw new Error(`HTTP Error ${response.status}`);
      }

      return null; // Enviado exitosamente
    } catch (error) {
      console.warn('[SyncQueue] Fallo al enviar mutación online, encolando en IndexedDB:', error);
      await saveToQueue(mutation);
      syncObserver.notify('offline', 'Error de red. Guardado en cola local.');
      return mutation;
    }
  }

  /**
   * Procesa todas las mutaciones pendientes en IndexedDB cuando se recupera la conexión.
   */
  async processQueue(): Promise<boolean> {
    if (this.isProcessing) return false;
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      syncObserver.notify('offline', 'Sin conexión. Esperando red...');
      return false;
    }

    this.isProcessing = true;
    syncObserver.notify('syncing', 'Sincronizando cambios locales...');

    try {
      const queue = await getQueue();
      if (queue.length === 0) {
        this.isProcessing = false;
        syncObserver.notify('idle', 'Todo sincronizado.');
        return true;
      }

      console.log(`[SyncQueue] Procesando ${queue.length} mutaciones pendientes...`);

      for (const mutation of queue) {
        // Detener si perdimos conexión a mitad del proceso
        if (typeof navigator !== 'undefined' && !navigator.onLine) {
          this.isProcessing = false;
          syncObserver.notify('offline', 'Conexión perdida durante sincronización.');
          return false;
        }

        try {
          const response = await fetch(mutation.endpoint, {
            method: mutation.method,
            headers: {
              'Content-Type': 'application/json',
              ...mutation.headers
            },
            body: mutation.body ? JSON.stringify(mutation.body) : undefined
          });

          if (response.ok || response.status === 404) {
            // Éxito o recurso no aplicable: quitar de la cola
            await removeFromQueue(mutation.id);
          } else {
            console.warn(`[SyncQueue] Error al procesar mutación ${mutation.id}: ${response.status}`);
            mutation.retryCount += 1;
            if (mutation.retryCount > 5) {
              // Descartar tras 5 intentos fallidos para evitar bloqueo
              await removeFromQueue(mutation.id);
            } else {
              await saveToQueue(mutation);
            }
          }
        } catch (err) {
          console.error(`[SyncQueue] Error de red en mutación ${mutation.id}:`, err);
          mutation.retryCount += 1;
          await saveToQueue(mutation);
        }
      }

      this.isProcessing = false;
      const remaining = await getQueue();
      if (remaining.length === 0) {
        syncObserver.notify('idle', 'Sincronización completada.');
        return true;
      } else {
        syncObserver.notify('error', `${remaining.length} cambios pendientes.`);
        return false;
      }
    } catch (e) {
      console.error('[SyncQueue] Error al procesar cola:', e);
      this.isProcessing = false;
      syncObserver.notify('error', 'Error al procesar cola de sincronización.');
      return false;
    }
  }
}

export const syncQueue = new SyncQueue();
