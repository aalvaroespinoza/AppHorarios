export interface SupabaseResponse<T> {
  data: T | null;
  error: string | null;
  success: boolean;
}

export interface SupabasePaginationOptions {
  limit?: number;
  offset?: number;
}
