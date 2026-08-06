export type SyncState = 'idle' | 'syncing' | 'error' | 'offline';

export interface SyncConfig {
  maxRetries: number;
  retryDelayMs: number;
}
