import 'server-only';
import { createClient } from '@supabase/supabase-js';

// Cliente de Supabase con permisos elevados (Service Role)
// Exclusivo para operaciones backend (API Routes, Server Actions)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dummy.supabase.co';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'dummy_key';

export const supabaseServerAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});
