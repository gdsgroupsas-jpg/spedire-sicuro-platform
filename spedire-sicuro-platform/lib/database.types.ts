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
      cap_validation: {
        Row: {
          id: string
          cap: string
          citta: string
          provincia: string
          regione: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          cap: string
          citta: string
          provincia: string
          regione?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          cap?: string
          citta?: string
          provincia?: string
          regione?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      listini_corrieri: {
        Row: {
          id: string
          created_at: string | null
          updated_at: string | null
          fornitore: string
          servizio: string
          attivo: boolean
          file_originale: string | null
          dati_listino: Json
          regole_contrassegno: Json | null
          zone_coperte: string[] | null
          peso_min: number | null
          peso_max: number | null
          note: string | null
        }
        Insert: {
          id?: string
          created_at?: string | null
          updated_at?: string | null
          fornitore: string
          servizio: string
          attivo?: boolean
          file_originale?: string | null
          dati_listino: Json
          regole_contrassegno?: Json | null
          zone_coperte?: string[] | null
          peso_min?: number | null
          peso_max?: number | null
          note?: string | null
        }
        Update: {
          id?: string
          created_at?: string | null
          updated_at?: string | null
          fornitore?: string
          servizio?: string
          attivo?: boolean
          file_originale?: string | null
          dati_listino?: Json
          regole_contrassegno?: Json | null
          zone_coperte?: string[] | null
          peso_min?: number | null
          peso_max?: number | null
          note?: string | null
        }
        Relationships: []
      }
      spedizioni: {
        Row: {
          id: string
          created_at: string | null
          user_id: string | null // FK auth.users
          destinatario: string
          indirizzo: string
          cap: string
          localita: string
          provincia: string
          country: string | null
          peso: number
          colli: number | null
          contrassegno: number | null
          telefono: string | null
          email_destinatario: string | null
          contenuto: string | null
          order_id: string | null
          rif_mittente: string | null
          rif_destinatario: string | null
          note: string | null
          corriere_scelto: string | null
          servizio_scelto: string | null
          prezzo_finale: number | null
          immagine_url: string | null
          dati_ocr: Json | null
          confronto_prezzi: Json | null
          mittente_nome: string | null
          mittente_indirizzo: string | null
          mittente_cap: string | null
          mittente_citta: string | null
          mittente_provincia: string | null
          mittente_telefono: string | null
          mittente_email: string | null
          status: string
        }
        Insert: {
          id?: string
          created_at?: string | null
          user_id?: string | null
          destinatario: string
          indirizzo: string
          cap: string
          localita: string
          provincia: string
          country?: string | null
          peso: number
          colli?: number | null
          contrassegno?: number | null
          telefono?: string | null
          email_destinatario?: string | null
          contenuto?: string | null
          order_id?: string | null
          rif_mittente?: string | null
          rif_destinatario?: string | null
          note?: string | null
          corriere_scelto?: string | null
          servizio_scelto?: string | null
          prezzo_finale?: number | null
          immagine_url?: string | null
          dati_ocr?: Json | null
          confronto_prezzi?: Json | null
          mittente_nome?: string | null
          mittente_indirizzo?: string | null
          mittente_cap?: string | null
          mittente_citta?: string | null
          mittente_provincia?: string | null
          mittente_telefono?: string | null
          mittente_email?: string | null
          status?: string
        }
        Update: {
          id?: string
          created_at?: string | null
          user_id?: string | null
          destinatario?: string
          indirizzo?: string
          cap?: string
          localita?: string
          provincia?: string
          country?: string | null
          peso?: number
          colli?: number | null
          contrassegno?: number | null
          telefono?: string | null
          email_destinatario?: string | null
          contenuto?: string | null
          order_id?: string | null
          rif_mittente?: string | null
          rif_destinatario?: string | null
          note?: string | null
          corriere_scelto?: string | null
          servizio_scelto?: string | null
          prezzo_finale?: number | null
          immagine_url?: string | null
          dati_ocr?: Json | null
          confronto_prezzi?: Json | null
          mittente_nome?: string | null
          mittente_indirizzo?: string | null
          mittente_cap?: string | null
          mittente_citta?: string | null
          mittente_provincia?: string | null
          mittente_telefono?: string | null
          mittente_email?: string | null
          status?: string
        }
        Relationships: []
      }
      log_operazioni: {
        Row: {
          id: string
          timestamp: string | null
          tipo: string | null
          dettagli: Json | null
          esito: string | null
        }
        Insert: {
          id?: string
          timestamp?: string | null
          tipo?: string | null
          dettagli?: Json | null
          esito?: string | null
        }
        Update: {
          id?: string
          timestamp?: string | null
          tipo?: string | null
          dettagli?: Json | null
          esito?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      client_shipments_view: {
        Row: {
          id: string
          created_at: string | null
          user_id: string | null
          tenant_id: string | null
          destinatario: string
          indirizzo: string
          cap: string
          localita: string
          provincia: string
          country: string | null
          peso: number
          colli: number | null
          contrassegno: number | null
          telefono: string | null
          email_destinatario: string | null
          contenuto: string | null
          order_id: string | null
          rif_mittente: string | null
          rif_destinatario: string | null
          note: string | null
          corriere_scelto: string | null
          servizio_scelto: string | null
          prezzo_finale: number | null
          immagine_url: string | null
          mittente_nome: string | null
          mittente_citta: string | null
          status: string
        }
      }
    }
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

type PublicTables = keyof Database['public']['Tables']

export type Tables<TableName extends PublicTables> =
  Database['public']['Tables'][TableName]['Row']

export type TablesInsert<TableName extends PublicTables> =
  Database['public']['Tables'][TableName]['Insert']

export type TablesUpdate<TableName extends PublicTables> =
  Database['public']['Tables'][TableName]['Update']
