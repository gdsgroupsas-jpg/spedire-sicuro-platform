import { ShipmentFormValues } from '@/lib/schemas/shipment'

/**
 * Genera CSV formattato specificamente per l'import massivo di Spedisci.online
 * 
 * Formato CSV richiesto da Spedisci.online:
 * destinatario;indirizzo;cap;localita;provincia;country;peso;colli;contrassegno;rif_mittente;rif_destinatario;telefono;note;email_destinatario;contenuto;order_id;totale_ordine;
 * 
 * Nota: L'ordine dei campi è critico per l'import su Spedisci.online
 */
export function generateSpedisciCSV(spedizioni: any[]): string {
  // Header esatto richiesto da Spedisci.online
  const headers = [
    'destinatario',
    'indirizzo',
    'cap',
    'localita',
    'provincia',
    'country',
    'peso',
    'colli',
    'contrassegno',
    'rif_mittente',
    'rif_destinatario',
    'telefono',           // Campo 12 (CORRETTO)
    'note',               // Campo 13 (CORRETTO)
    'email_destinatario',
    'contenuto',
    'order_id',
    'totale_ordine',
  ]

  const rows = spedizioni.map(s => {
    // Helper per formattare numeri mantenendo il punto decimale (standard CSV)
    const formatNumber = (num: number | string) => {
      if (!num) return '0'
      return String(num) // Mantiene il punto decimale (es: 25.5)
    }

    // Helper per pulire stringhe base (rimuove punto e virgola che romperebbe il CSV)
    const cleanString = (str: string) => {
      if (!str) return ''
      return str.replace(/;/g, ',').replace(/(\r\n|\n|\r)/gm, " ").trim()
    }

    // Helper per campi che possono contenere virgole (es: indirizzi)
    // Racchiude tra virgolette se contiene virgole, come richiesto da CSV standard
    const escapeCSVField = (str: string) => {
      if (!str) return ''
      // Rimuovi punto e virgola, sostituisci con virgola
      const cleaned = str.replace(/;/g, ',').replace(/(\r\n|\n|\r)/gm, " ").trim()
      
      // Se contiene virgole, racchiudi tra virgolette
      if (cleaned.includes(',')) {
        // Escape virgolette doppie esistenti
        return `"${cleaned.replace(/"/g, '""')}"`
      }
      return cleaned
    }

    return [
      cleanString(s.destinatario),
      escapeCSVField(s.indirizzo),  // Usa escapeCSVField per gestire virgole negli indirizzi
      cleanString(s.cap),
      cleanString(s.localita),
      cleanString(s.provincia).toUpperCase(),
      s.country || 'IT', // Country default IT
      formatNumber(s.peso),
      s.colli || 1,
      formatNumber(s.contrassegno || 0),
      cleanString(s.rif_mittente || ''),
      cleanString(s.rif_destinatario || ''),
      cleanString(s.telefono || ''),        // Campo 12 (CORRETTO)
      escapeCSVField(s.note || ''),         // Campo 13 (CORRETTO) - usa escapeCSVField per note lunghe
      cleanString(s.email_destinatario || ''),
      cleanString(s.contenuto || ''),
      cleanString(s.order_id || ''),
      formatNumber(s.totale_ordine || s.contrassegno || 0), // Totale ordine = contrassegno se non specificato
    ]
  })

  // Costruisci il CSV con separatore ;
  const csvContent = [
    headers.join(';'),
    ...rows.map(r => r.join(';'))
  ].join('\n')

  return csvContent
}

/**
 * Scarica il CSV generato come file
 */
export function downloadCSV(content: string, filename: string = 'spedizioni-export.csv') {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
}

/**
 * Genera CSV per spedisci.online da una singola spedizione
 * Utile per export rapido dopo OCR
 */
export function generateSingleShipmentCSV(spedizione: any): string {
  return generateSpedisciCSV([spedizione])
}

/**
 * Genera CSV per spedisci.online da multiple spedizioni
 * Utile per export batch dalla lista spedizioni
 */
export function generateBatchShipmentsCSV(spedizioni: any[]): string {
  return generateSpedisciCSV(spedizioni)
}
