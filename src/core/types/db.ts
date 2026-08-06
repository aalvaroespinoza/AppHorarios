export type SyncStatus = 'synced' | 'pending_insert' | 'pending_update' | 'pending_delete';

export interface BaseEntity {
  id: string;
  created_at: string;
  updated_at: string;
  sync_status: SyncStatus;
}
