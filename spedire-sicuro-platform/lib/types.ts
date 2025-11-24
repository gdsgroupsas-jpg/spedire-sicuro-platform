
export type FondoCassaPostale = {
  id: number
  nome: string
  saldo_attuale: number
  ultima_ricarica: string
}

export type SpedizionePostale = {
  id: string
  created_at: string
  servizio_selezionato: string
  destinazione: string
  peso_gr: number
  costo_utente_finale: number
  dati_destinatario: any
  costo_effettivo_spedire_sicuro: number
  margine_lordo: number
  codice_affrancatrice: string
  user_id: string
  is_agency_operation: boolean
}
