const DB_NAME = 'LifeOS_DB';
const DB_VERSION = 1;

export const STORES = {
  AGENDA: 'agenda',
  GASTOS: 'gastos',
  TAREAS: 'tareas',
  COMPRAS: 'compras',
  DOCUMENTOS: 'documentos',
  EVENTS: 'system_events',
} as const;

export class DBClient {
  private static instance: DBClient;
  private dbPromise: Promise<IDBDatabase> | null = null;

  private constructor() {}

  static getInstance(): DBClient {
    if (!DBClient.instance) {
      DBClient.instance = new DBClient();
    }
    return DBClient.instance;
  }

  async getDB(): Promise<IDBDatabase> {
    if (typeof window === 'undefined') {
      throw new Error('IndexedDB no está disponible en el servidor.');
    }
    
    if (!this.dbPromise) {
      this.dbPromise = new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
          const db = request.result;
          
          Object.values(STORES).forEach((storeName) => {
            if (!db.objectStoreNames.contains(storeName)) {
              const store = db.createObjectStore(storeName, { keyPath: 'id' });
              // Índices obligatorios para soportar offline-first y resolución de conflictos
              store.createIndex('sync_status', 'sync_status', { unique: false });
              store.createIndex('updated_at', 'updated_at', { unique: false });
            }
          });
        };

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    }

    return this.dbPromise;
  }
}

export const dbClient = DBClient.getInstance();
