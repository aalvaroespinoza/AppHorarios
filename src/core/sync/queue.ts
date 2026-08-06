/**
 * Gestor de la cola de sincronización y reintentos (Exponential Backoff).
 */
export class SyncQueue {
  private isProcessing = false;

  async processWithRetries(
    task: () => Promise<void>,
    maxRetries: number = 3,
    delayMs: number = 1000
  ): Promise<boolean> {
    if (this.isProcessing) return false;
    this.isProcessing = true;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await task();
        this.isProcessing = false;
        return true;
      } catch (error) {
        console.warn(`[SyncQueue] Intento ${attempt} fallido.`, error);
        if (attempt < maxRetries) {
          // Exponential backoff
          await new Promise(res => setTimeout(res, delayMs * attempt));
        }
      }
    }

    this.isProcessing = false;
    return false; // Falló tras agotar intentos
  }
}
