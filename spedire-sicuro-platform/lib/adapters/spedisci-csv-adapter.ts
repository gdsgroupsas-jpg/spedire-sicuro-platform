import { ShipmentFormValues } from '@/lib/schemas/shipment'

/**
 * Genera CSV formattato specificamente per l'import massivo di Spedisci.online
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
    'note',
    'telefono',
    'email_destinatario',
    'contenuto',
    'order_id',
    'totale_ordine',
  ]

  const rows = spedizioni.map(s => {
    // Helper per formattare numeri con virgola (standard italiano/excel)
    const formatNumber = (num: number | string) => {
      if (!num) return '0'
      return String(num).replace('.', ',')
    }

    // Helper per pulire stringhe (rimuove punto e virgola che romperebbe il CSV)
    const cleanString = (str: string) => {
      if (!str) return ''
      return str.replace(/;/g, ',').replace(/(\r\n|\n|\r)/gm, " ").trim()
    }

    return [
      cleanString(s.destinatario),
      cleanString(s.indirizzo),
      cleanString(s.cap),
      cleanString(s.localita),
      cleanString(s.provincia).toUpperCase(),
      'IT', // Country fisso IT per ora
      formatNumber(s.peso),
      s.colli || 1,
      formatNumber(s.contrassegno || 0),
      cleanString(s.rif_mittente),
      cleanString(s.rif_destinatario),
      cleanString(s.note),
      cleanString(s.telefono),
      cleanString(s.email_destinatario),
      cleanString(s.contenuto),
      cleanString(s.order_id),
      formatNumber(s.contrassegno || 0), // Totale ordine = contrassegno se non spec.
    ]
  })

  // Costruisci il CSV con separatore ;
  const csvContent = [
    headers.join(';'),
    ...rows.map(r => r.join(';'))
  ].join('\n')

  return csvContent
}

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
