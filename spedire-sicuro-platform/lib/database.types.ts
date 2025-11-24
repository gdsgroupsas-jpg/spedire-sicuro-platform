export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Enums: {
      shipment_status_enum: 'bozza' | 'inviata' | 'in_transito' | 'eccezione' | 'consegnata' | 'annullata'
    }
    Tables: {
      spedizioni: {
        Row: {
          id: string
          created_at: string | null
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
          status: Database['public']['Enums']['shipment_status_enum'] | null
        }
        Insert: {
          id?: string
          created_at?: string | null
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
          status?: Database['public']['Enums']['shipment_status_enum'] | null
        }
        Update: {
          id?: string
          created_at?: string | null
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
          status?: Database['public']['Enums']['shipment_status_enum'] | null
        }
        Relationships: []
      }
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
          peso_max?: number | null
          note?: string | null
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
  }
}

// ⚠️ NOTA IMPORTANTE: Questo file è una struttura base temporanea.
// Per ottenere i tipi completi e aggiornati dal database Supabase, esegui:
// 
// supabase gen types typescript --project-id mckroxzkwagtmtmvhvvq --schema public > lib/database.types.ts
//
// Questo comando rigenererà automaticamente tutti i tipi TypeScript dal tuo schema database.
