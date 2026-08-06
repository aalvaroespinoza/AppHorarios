import { BaseEntity, SyncStatus } from '../types/db';

/**
 * Helpers puros para la base de datos local.
 */
export class DBHelpers {
  
  /**
   * Genera un identificador único seguro (UUID v4) para uso Offline.
   * Al estar offline, no podemos delegar el ID a Supabase, debemos generarlo localmente.
   */
  static generateId(): string {
    return crypto.randomUUID();
  }

  /**
   * Crea el payload base requerido para que cualquier entidad soporte sincronización.
   */
  static buildSyncMeta(isNew: boolean, existingStatus?: SyncStatus): Pick<BaseEntity, 'created_at' | 'updated_at' | 'sync_status'> {
    const now = new Date().toISOString();
    
    if (isNew) {
      return {
        created_at: now,
        updated_at: now,
        sync_status: 'pending_insert'
      };
    }

    return {
      created_at: '', // Se omitirá al hacer spread para no pisar el original
      updated_at: now,
      sync_status: existingStatus === 'synced' ? 'pending_update' : (existingStatus || 'pending_update')
    };
  }
}
