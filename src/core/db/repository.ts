import { dbClient } from './client';
import { BaseEntity } from '../types/db';

export class BaseRepository<T extends BaseEntity> {
  private storeName: string;

  constructor(storeName: string) {
    this.storeName = storeName;
  }

  private async getStore(mode: IDBTransactionMode): Promise<IDBObjectStore> {
    const db = await dbClient.getDB();
    const tx = db.transaction(this.storeName, mode);
    return tx.objectStore(this.storeName);
  }

  private async executeRequest<R>(request: IDBRequest<R>): Promise<R> {
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getById(id: string): Promise<T | null> {
    const store = await this.getStore('readonly');
    const result = await this.executeRequest<T>(store.get(id));
    return result || null;
  }

  async getAll(): Promise<T[]> {
    const store = await this.getStore('readonly');
    return this.executeRequest<T[]>(store.getAll());
  }

  async save(entity: Omit<T, 'sync_status' | 'created_at' | 'updated_at'> & Partial<BaseEntity>): Promise<T> {
    const store = await this.getStore('readwrite');
    const now = new Date().toISOString();
    
    const record: T = {
      ...entity,
      sync_status: entity.sync_status || 'pending_insert',
      created_at: entity.created_at || now,
      updated_at: now,
    } as T;

    await this.executeRequest(store.put(record));
    return record;
  }

  async update(id: string, updates: Partial<Omit<T, 'id' | 'created_at'>>): Promise<T | null> {
    const store = await this.getStore('readwrite');
    const existing = await this.executeRequest<T>(store.get(id));
    
    if (!existing) return null;

    const record: T = {
      ...existing,
      ...updates,
      sync_status: existing.sync_status === 'synced' ? 'pending_update' : existing.sync_status,
      updated_at: new Date().toISOString(),
    };

    await this.executeRequest(store.put(record));
    return record;
  }

  async delete(id: string, hardDelete = false): Promise<void> {
    const store = await this.getStore('readwrite');
    
    if (hardDelete) {
      await this.executeRequest(store.delete(id));
      return;
    }

    // Soft delete / Tombstone pattern para permitir sincronización
    const existing = await this.executeRequest<T>(store.get(id));
    if (existing) {
      existing.sync_status = 'pending_delete';
      existing.updated_at = new Date().toISOString();
      await this.executeRequest(store.put(existing));
    }
  }

  // --- Capa de Sincronización Futura (Outbox Pattern) ---
  
  async getPendingSync(): Promise<T[]> {
    const store = await this.getStore('readonly');
    const index = store.index('sync_status');
    // Para simplificar sin usar cursores avanzados, traemos todo y filtramos.
    const all = await this.executeRequest<T[]>(index.getAll());
    return all.filter(item => item.sync_status !== 'synced');
  }

  async markAsSynced(id: string): Promise<void> {
    await this.update(id, { sync_status: 'synced' } as any);
  }
}
