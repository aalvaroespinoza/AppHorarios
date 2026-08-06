import { SyncState } from './types';

type Listener = (state: SyncState, message?: string) => void;

/**
 * Patrón Observador para notificar a la UI el estado de la sincronización de fondo.
 */
export class SyncObserver {
  private listeners: Set<Listener> = new Set();
  private currentState: SyncState = 'idle';

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    listener(this.currentState);
    return () => this.listeners.delete(listener);
  }

  notify(state: SyncState, message?: string) {
    this.currentState = state;
    this.listeners.forEach(l => l(state, message));
  }

  getState(): SyncState {
    return this.currentState;
  }
}

export const syncObserver = new SyncObserver();
