import { parse } from 'csv-parse/sync'

export interface ParsedListino {
  tipo_listino: 'fasce_peso' | 'kg_unitario'
  fasce: Array<{
    peso_min: number
    peso_max: number
    prezzi: Record<string, number>
  }>
  regole_contrassegno?: any
}

/**
 * Parser intelligente per CSV listini corrieri
 * Supporta varie strutture di input
 */
export function parseCSVListino(
  csvContent: string,
  delimiter: string = ';'
): ParsedListino {
  const records = parse(csvContent, {
    columns: true,
    delimiter,
    skip_empty_lines: true,
    trim: true,
  })

  if (records.length === 0) {
    throw new Error('CSV vuoto o formato non valido')
  }

  // Analizza la struttura del CSV
  const firstRow = records[0]
  const columns = Object.keys(firstRow)

  // Cerca colonne peso
  const pesoMinCol = findColumn(columns, ['peso_min', 'peso min', 'peso minimo', 'min', 'da'])
  const pesoMaxCol = findColumn(columns, ['peso_max', 'peso max', 'peso massimo', 'max', 'a', 'fino a'])

  // Cerca colonne zone
  const zoneCols = findZoneColumns(columns)

  if (!pesoMinCol || !pesoMaxCol) {
    throw new Error('Colonne peso non trovate nel CSV')
  }

  // Costruisci fasce
  const fasce = records.map((row: any) => {
    const pesoMin = parseFloat(row[pesoMinCol] || row[pesoMinCol.toLowerCase()] || '0')
    const pesoMax = parseFloat(row[pesoMaxCol] || row[pesoMaxCol.toLowerCase()] || '999')

    const prezzi: Record<string, number> = {}
    
    // Estrai prezzi per ogni zona trovata
    zoneCols.forEach(zone => {
      const value = row[zone] || row[zone.toLowerCase()]
      if (value) {
        const prezzo = parseFloat(String(value).replace(',', '.'))
        if (!isNaN(prezzo)) {
          // Normalizza nome zona
          const zonaNormalizzata = normalizeZona(zone)
          prezzi[zonaNormalizzata] = prezzo
        }
      }
    })

    return {
      peso_min: pesoMin,
      peso_max: pesoMax,
      prezzi,
    }
  })

  return {
    tipo_listino: 'fasce_peso',
    fasce,
  }
}

function findColumn(columns: string[], keywords: string[]): string | null {
  for (const col of columns) {
    const colLower = col.toLowerCase().trim()
    for (const keyword of keywords) {
      if (colLower.includes(keyword.toLowerCase())) {
        return col
      }
    }
  }
  return null
}

function findZoneColumns(columns: string[]): string[] {
  const zoneKeywords = [
    'italia', 'italy', 'nazionale',
    'sardegna', 'sardinia', 'sard',
    'sicilia', 'sicily', 'sic',
    'calabria', 'calab',
    'scs', 'sardegna calabria sicilia',
    'disagiate', 'periferiche',
    'campania', 'lazio'
  ]

  return columns.filter(col => {
    const colLower = col.toLowerCase().trim()
    return zoneKeywords.some(keyword => colLower.includes(keyword.toLowerCase()))
  })
}

function normalizeZona(zoneName: string): string {
  const z = zoneName.toLowerCase().trim()
  
  if (z.includes('italia') || z.includes('italy') || z.includes('nazionale')) return 'italia'
  if (z.includes('sardegna') || z.includes('sardinia') || z.includes('sard')) return 'sardegna'
  if (z.includes('sicilia') || z.includes('sicily') || z.includes('sic')) return 'sicilia'
  if (z.includes('calabria') || z.includes('calab')) return 'calabria'
  if (z.includes('scs')) return 'scs'
  if (z.includes('disagiate')) return 'disagiate'
  if (z.includes('periferiche')) return 'periferiche'
  if (z.includes('campania') || z.includes('lazio')) return 'campania_lazio'
  
  return z // fallback
}

