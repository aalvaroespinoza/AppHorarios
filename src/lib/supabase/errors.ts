export class SupabaseAPIError extends Error {
  constructor(message: string, public readonly code?: string, public readonly details?: string) {
    super(message);
    this.name = 'SupabaseAPIError';
  }
}

export function handleSupabaseError(error: any): string {
  if (error instanceof SupabaseAPIError) {
    return error.message;
  }
  
  if (error && typeof error === 'object' && 'message' in error) {
    return error.message;
  }

  return 'Error desconocido al comunicarse con Supabase.';
}
