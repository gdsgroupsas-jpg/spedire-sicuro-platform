import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

let supabaseServerClient: SupabaseClient<Database> | null = null

export type SupabaseServerClient = SupabaseClient<Database>

/**
 * Returns a singleton Supabase client that uses the service role key.
 * This must only be imported from server environments (API routes, server actions).
 */
export function getSupabaseServerClient(): SupabaseServerClient {
  if (!supabaseServerClient) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error(
        'Supabase server client misconfigured. Ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set.'
      )
    }

    supabaseServerClient = createClient<Database>(supabaseUrl, serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    })
  }

  return supabaseServerClient
}

// Database Types
export type Tenant = {
  id: string
  name: string
  slug: string
  logo_url: string | null
  primary_color: string
  secondary_color: string
  created_at: string
}

export type User = {
  id: string
  tenant_id: string
  email: string
  password_hash: string
  role: 'admin' | 'client'
  created_at: string
}

export type Shipment = {
  id: string
  tenant_id: string
  destinatario: string
  indirizzo: string
  cap: string
  localita: string
  provincia: string
  telefono: string | null
  email: string | null
  contenuto: string | null
  peso: number
  colli: number
  contrassegno: number
  corriere: string | null
  costo_fornitore: number | null
  prezzo_cliente: number | null
  margine: number | null
  tracking_code: string | null
  stato: string
  screenshot_url: string | null
  created_at: string
}
