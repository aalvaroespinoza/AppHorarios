import { createBrowserClient } from '@supabase/ssr';

/**
 * Cliente de Supabase para su uso exclusivo en Client Components (React).
 * Reutiliza una única instancia (Singleton) por ventana de navegador.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dummy.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'dummy_key'
  );
}
