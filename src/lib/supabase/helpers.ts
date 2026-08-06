import { createClient as createServerClient } from './server';
import { handleSupabaseError } from './errors';
import { SupabaseResponse } from './types';

/**
 * Helpers Reutilizables que abstraen la lógica repetitiva.
 * (Ejecutables desde Server Actions o API Routes).
 */
export class SupabaseHelpers {
  
  /**
   * Ejecuta una consulta genérica para obtener todos los registros de una tabla.
   * Útil para catálogos, sin lógica compleja.
   */
  static async fetchAll<T>(tableName: string): Promise<SupabaseResponse<T[]>> {
    try {
      const supabase = await createServerClient();
      const { data, error } = await supabase.from(tableName).select('*');

      if (error) throw error;

      return {
        success: true,
        data: data as T[],
        error: null
      };
    } catch (err) {
      return {
        success: false,
        data: null,
        error: handleSupabaseError(err)
      };
    }
  }

  /**
   * Consulta un único registro por ID.
   */
  static async fetchById<T>(tableName: string, id: string): Promise<SupabaseResponse<T>> {
    try {
      const supabase = await createServerClient();
      const { data, error } = await supabase.from(tableName).select('*').eq('id', id).single();

      if (error) throw error;

      return {
        success: true,
        data: data as T,
        error: null
      };
    } catch (err) {
      return {
        success: false,
        data: null,
        error: handleSupabaseError(err)
      };
    }
  }
}
