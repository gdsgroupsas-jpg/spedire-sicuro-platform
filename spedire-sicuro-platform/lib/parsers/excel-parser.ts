import * as XLSX from 'xlsx'
import { ParsedListino } from './csv-parser'
import { parseCSVListino } from './csv-parser'

/**
 * Parser per file Excel (XLSX, XLS)
 */
export function parseExcelListino(
  buffer: ArrayBuffer,
  sheetIndex: number = 0
): ParsedListino {
  const workbook = XLSX.read(buffer, { type: 'array' })
  
  if (workbook.SheetNames.length === 0) {
    throw new Error('File Excel vuoto')
  }

  const sheetName = workbook.SheetNames[sheetIndex]
  const sheet = workbook.Sheets[sheetName]

  // Converti sheet in JSON
  const records = XLSX.utils.sheet_to_json(sheet, {
    defval: '',
    raw: false,
  })

  if (records.length === 0) {
    throw new Error('Foglio Excel vuoto')
  }

  // Converti in formato CSV-like per riutilizzare il parser CSV
  const firstRow = records[0] as any
  const columns = Object.keys(firstRow)
  
  // Crea header CSV
  const header = columns.join(';')
  
  // Crea righe CSV
  const rows = records.map((row: any) => 
    columns.map(col => {
      const value = row[col]
      // Gestisci valori con virgole (numeri italiani)
      return String(value || '').replace(/;/g, ',')
    }).join(';')
  )

  const csvContent = [header, ...rows].join('\n')

  // Usa il parser CSV
  return parseCSVListino(csvContent, ';')
}

