import { Tables } from '@/lib/database.types'

type Spedizione = Tables<'spedizioni'>

/**
 * Genera una descrizione ottimizzata per i motori di ricerca (AEO) basata sui dati della spedizione.
 * Utile per pagine di tracking pubbliche o log arricchiti.
 */
export function generateSeoDescription(shipment: Spedizione): string {
  const { mittente_citta, localita, contenuto, peso, corriere_scelto } = shipment
  
  const from = mittente_citta ? `da ${mittente_citta}` : 'dal magazzino centrale'
  const to = localita ? `a ${localita}` : 'a destinazione'
  const content = contenuto ? `contenente ${contenuto}` : 'merce varia'
  const courier = corriere_scelto ? `tramite ${corriere_scelto}` : 'con corriere espresso'
  
  return `Spedizione express ${content} ${from} diretta ${to}. Peso tassabile ${peso}kg, gestita ${courier}. Tracciamento in tempo reale su Spedire Sicuro.`
}

/**
 * Suggerisce link interni per migliorare la navigazione e l'indicizzazione delle zone servite.
 */
export function generateInternalLinks(provincia: string) {
  const zonaName = getZonaName(provincia)
  return [
    { label: `Tariffe spedizioni per ${zonaName} (${provincia})`, href: `/listini?zona=${provincia}` },
    { label: `Analisi consegne in ${zonaName}`, href: `/dashboard/analytics?zona=${provincia}` },
    { label: `Corrieri attivi su ${provincia}`, href: `/dashboard/corrieri?filter=${provincia}` }
  ]
}

function getZonaName(provincia: string): string {
  // Stub: in futuro mappare sigle a nomi estesi
  const map: Record<string, string> = {
    'MI': 'Milano e provincia',
    'RM': 'Roma Capitale',
    'NA': 'Napoli e provincia',
    'TO': 'Torino',
  }
  return map[provincia] || `Provincia di ${provincia}`
}
