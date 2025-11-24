// lib/database.types.ts
// Tipi generati da Supabase - Struttura di esempio per il progetto

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      spedizioni: {
        Row: {
          id: string
          status: Database['public']['Enums']['shipment_status_enum']
          created_at: string
          updated_at: string
          mittente: Json | null
          destinatario: Json | null
          colli: Json[] | null
          tracking_number: string | null
          etichetta_url: string | null
          costo_totale: number | null
          servizio_corriere: string | null
          data_ritiro: string | null
          data_consegna_prevista: string | null
          data_consegna_effettiva: string | null
          note: string | null
        }
        Insert: {
          id?: string
          status?: Database['public']['Enums']['shipment_status_enum']
          created_at?: string
          updated_at?: string
          mittente?: Json | null
          destinatario?: Json | null
          colli?: Json[] | null
          tracking_number?: string | null
          etichetta_url?: string | null
          costo_totale?: number | null
          servizio_corriere?: string | null
          data_ritiro?: string | null
          data_consegna_prevista?: string | null
          data_consegna_effettiva?: string | null
          note?: string | null
        }
        Update: {
          id?: string
          status?: Database['public']['Enums']['shipment_status_enum']
          created_at?: string
          updated_at?: string
          mittente?: Json | null
          destinatario?: Json | null
          colli?: Json[] | null
          tracking_number?: string | null
          etichetta_url?: string | null
          costo_totale?: number | null
          servizio_corriere?: string | null
          data_ritiro?: string | null
          data_consegna_prevista?: string | null
          data_consegna_effettiva?: string | null
          note?: string | null
        }
        Relationships: []
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