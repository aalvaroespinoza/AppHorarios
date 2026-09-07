export const DB_NAME = 'LifeOS-LocalDB';
export const DB_VERSION = 2;

// A successful request can still be rolled back. Only transaction completion
// confirms durable storage (including quota failures and explicit aborts).
function transactionDone(transaction: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error ?? new Error('No se pudo guardar en el dispositivo.'));
    transaction.onabort = () => reject(transaction.error ?? new Error('Se canceló el guardado en el dispositivo.'));
  });
}

export interface QueuedMutation {
  id: string;
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: any;
  headers?: Record<string, string>;
  timestamp: number;
  retryCount: number;
  metadata?: Record<string, any>;
}

export const idb = {
  dbPromise: null as Promise<IDBDatabase> | null,

  init(): Promise<IDBDatabase> | null {
    if (typeof window === 'undefined') return null;
    if (!this.dbPromise) {
      this.dbPromise = new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onupgradeneeded = () => {
          const db = request.result;
          if (!db.objectStoreNames.contains('keyval')) {
            db.createObjectStore('keyval');
          }
          if (!db.objectStoreNames.contains('sync-queue')) {
            db.createObjectStore('sync-queue', { keyPath: 'id' });
          }
        };
        request.onsuccess = () => {
          request.result.onversionchange = () => {
            request.result.close();
            this.dbPromise = null;
          };
          resolve(request.result);
        };
        request.onerror = () => {
          this.dbPromise = null;
          reject(request.error);
        };
      });
    }
    return this.dbPromise;
  },

  async get<T>(key: string): Promise<T | null> {
    const db = await this.init();
    if (!db) return null;
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('keyval', 'readonly');
      const store = transaction.objectStore('keyval');
      const request = store.get(key);
      request.onsuccess = () => resolve(request.result === undefined ? null : request.result);
      request.onerror = () => reject(request.error);
    });
  },

  async set<T>(key: string, value: T): Promise<void> {
    const db = await this.init();
    if (!db) return;
    const transaction = db.transaction('keyval', 'readwrite');
    const done = transactionDone(transaction);
    transaction.objectStore('keyval').put(value, key);
    return done;
  }
};

/**
 * Guarda una mutación en la cola de IndexedDB para sincronizarla cuando haya conexión
 */
export async function saveToQueue(mutation: QueuedMutation): Promise<void> {
  const db = await idb.init();
  if (!db) return;
  const transaction = db.transaction('sync-queue', 'readwrite');
  const done = transactionDone(transaction);
  transaction.objectStore('sync-queue').put(mutation);
  return done;
}

/**
 * Obtiene todas las mutaciones pendientes en la cola de IndexedDB
 */
export async function getQueue(): Promise<QueuedMutation[]> {
  const db = await idb.init();
  if (!db) return [];
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('sync-queue', 'readonly');
    const store = transaction.objectStore('sync-queue');
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Elimina una mutación de la cola de IndexedDB una vez sincronizada
 */
export async function removeFromQueue(id: string): Promise<void> {
  const db = await idb.init();
  if (!db) return;
  const transaction = db.transaction('sync-queue', 'readwrite');
  const done = transactionDone(transaction);
  transaction.objectStore('sync-queue').delete(id);
  return done;
}

/**
 * Limpia todas las mutaciones de la cola
 */
export async function clearQueue(): Promise<void> {
  const db = await idb.init();
  if (!db) return;
  const transaction = db.transaction('sync-queue', 'readwrite');
  const done = transactionDone(transaction);
  transaction.objectStore('sync-queue').clear();
  return done;
}
