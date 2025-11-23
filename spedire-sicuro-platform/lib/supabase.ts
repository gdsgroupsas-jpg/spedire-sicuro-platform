import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Crea client solo se le variabili sono configurate
let supabaseClient: ReturnType<typeof createClient<Database>> | null = null

if (supabaseUrl && supabaseAnonKey) {
  supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey)
}

// Export con fallback per evitare errori a build time
export const supabase = supabaseClient || ({} as ReturnType<typeof createClient<Database>>)

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
