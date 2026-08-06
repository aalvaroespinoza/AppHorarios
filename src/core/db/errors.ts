export class LocalDatabaseError extends Error {
  constructor(message: string, public readonly originalError?: any) {
    super(message);
    this.name = 'LocalDatabaseError';
  }
}

export function handleDBError(context: string, error: any): never {
  console.error(`[LocalDB Error] ${context}:`, error);
  throw new LocalDatabaseError(`Error en operación local: ${context}`, error);
}
