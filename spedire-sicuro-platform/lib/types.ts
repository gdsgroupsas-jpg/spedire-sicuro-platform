// Types per la piattaforma Spedire Sicuro

export type ListinoCorriere = {
  id: string
  created_at: string
  updated_at: string
  fornitore: string
  servizio: string
  attivo: boolean
  file_originale: string | null
  dati_listino: DatiListino
  regole_contrassegno: RegoleContrassegno | null
  zone_coperte: string[]
  peso_max: number | null
  note: string | null
}

export type DatiListino = {
  tipo_listino: 'fasce_peso' | 'kg_unitario'
  fasce: FasciaPeso[]
  contrassegno?: RegoleContrassegno
  iva_inclusa?: boolean
  assicurazione?: Record<string, number>
}

export type FasciaPeso = {
  peso_min: number
  peso_max: number
  prezzi: Record<string, number> // es: { italia: 3.50, sardegna: 4.26, ... }
}

export type RegoleContrassegno = {
  tipo: 'fisso' | 'scaglioni' | 'percentuale'
  costo?: number // per tipo 'fisso'
  percentuale?: number // per tipo 'percentuale'
  regole?: Array<{
    fino_a: number
    costo?: number
    costo_fisso?: number
    percentuale?: number
  }>
}

export type Spedizione = {
  id: string
  created_at: string
  destinatario: string
  indirizzo: string
  cap: string
  localita: string
  provincia: string
  country: string
  peso: number
  colli: number
  contrassegno: number
  telefono?: string
  email_destinatario?: string
  contenuto?: string
  order_id?: string
  rif_mittente?: string
  rif_destinatario?: string
  note?: string
  corriere_scelto?: string
  servizio_scelto?: string
  prezzo_finale?: number
  immagine_url?: string
  dati_ocr?: any
  confronto_prezzi?: any
}

export type OpzioneCorriere = {
  id: string
  fornitore: string
  servizio: string
  prezzo_base: number
  contrassegno: number
  totale: number
  dettagli: DatiListino
}

export type ConfrontoPrezzi = {
  opzioni: OpzioneCorriere[]
  peso: number
  provincia: string
  contrassegno: number
}

