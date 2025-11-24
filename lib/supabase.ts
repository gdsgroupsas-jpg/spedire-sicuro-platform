// lib/supabase.ts
// Factory per creare il client Supabase server-side

import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

/**
 * Crea un'istanza del client Supabase per utilizzo server-side
 * Nota: In produzione, usa le variabili d'ambiente per le chiavi
 */
export function createSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables');
  }

  return createClient<Database>(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false
    }
  });
}

/**
 * Crea un'istanza del client Supabase con service role key
 * Da usare solo in ambiente server sicuro
 */
export function createSupabaseServiceClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase service environment variables');
  }

  return createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      persistSession: false
    }
  });
}