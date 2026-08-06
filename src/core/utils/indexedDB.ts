export const idb = {
  dbPromise: null as Promise<IDBDatabase> | null,

  init() {
    if (typeof window === 'undefined') return null;
    if (!this.dbPromise) {
      this.dbPromise = new Promise((resolve, reject) => {
        const request = indexedDB.open('LifeOS-LocalDB', 1);
        request.onupgradeneeded = () => {
          request.result.createObjectStore('keyval');
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
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
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('keyval', 'readwrite');
      const store = transaction.objectStore('keyval');
      const request = store.put(value, key);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
};
