/**
 * Database Types - Generato da Supabase
 * 
 * NOTA: Questo file dovrebbe essere rigenerato usando:
 * supabase gen types typescript --project-id mckroxzkwagtmtmvhvvq --schema public > lib/database.types.ts
 * 
 * Per installare Supabase CLI: https://supabase.com/docs/guides/cli/getting-started
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      spedizioni: {
        Row: {
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
          status: string
          stato: string
          screenshot_url: string | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          tenant_id: string
          destinatario: string
          indirizzo: string
          cap: string
          localita: string
          provincia: string
          telefono?: string | null
          email?: string | null
          contenuto?: string | null
          peso: number
          colli: number
          contrassegno?: number
          corriere?: string | null
          costo_fornitore?: number | null
          prezzo_cliente?: number | null
          margine?: number | null
          tracking_code?: string | null
          status?: string
          stato?: string
          screenshot_url?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          tenant_id?: string
          destinatario?: string
          indirizzo?: string
          cap?: string
          localita?: string
          provincia?: string
          telefono?: string | null
          email?: string | null
          contenuto?: string | null
          peso?: number
          colli?: number
          contrassegno?: number
          corriere?: string | null
          costo_fornitore?: number | null
          prezzo_cliente?: number | null
          margine?: number | null
          tracking_code?: string | null
          status?: string
          stato?: string
          screenshot_url?: string | null
          created_at?: string
          updated_at?: string | null
        }
      }
      tenants: {
        Row: {
          id: string
          name: string
          slug: string
          logo_url: string | null
          primary_color: string
          secondary_color: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          logo_url?: string | null
          primary_color?: string
          secondary_color?: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          logo_url?: string | null
          primary_color?: string
          secondary_color?: string
          created_at?: string
        }
      }
      users: {
        Row: {
          id: string
          tenant_id: string
          email: string
          password_hash: string
          role: 'admin' | 'client'
          created_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          email: string
          password_hash: string
          role?: 'admin' | 'client'
          created_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          email?: string
          password_hash?: string
          role?: 'admin' | 'client'
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      shipment_status_enum: 'bozza' | 'inviata' | 'in_transito' | 'eccezione' | 'consegnata' | 'annullata'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
