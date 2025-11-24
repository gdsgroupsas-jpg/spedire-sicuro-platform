import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-helpers'
import { handleAPIError, handleValidationError } from '@/lib/error-handler'
import { CsvExportSchema, validateInput } from '@/lib/validation-schemas'

export async function POST(req: NextRequest) {
  // SECURITY: Verifica autenticazione
  const authError = await requireAuth(req)
  if (authError) {
    return authError
  }

  try {
    const body = await req.json()

    // SECURITY: Validazione input
    const validation = validateInput(CsvExportSchema, body)
    if (!validation.success) {
      return handleValidationError(validation.error, 'CSV_EXPORT')
    }

    const { shipments } = validation.data

    if (!shipments || !Array.isArray(shipments)) {
      return NextResponse.json(
        { error: 'Dati spedizioni mancanti' },
        { status: 400 }
      )
    }
    
    // Headers CSV Spedisci.online format
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
    
    // Generate rows
    const rows = shipments.map((s: any) => [
      s.destinatario || '',
      s.indirizzo || '',
      s.cap || '',
      s.localita || '',
      s.provincia || '',
      'IT',
      s.peso || 1,
      s.colli || 1,
      s.contrassegno || 0,
      '', // rif_mittente
      s.destinatario || '',
      s.note || '',
      s.telefono || '',
      s.email_destinatario || s.email || '',
      s.contenuto || '',
      s.order_id || `ORD-${Date.now()}`,
      s.contrassegno || 0,
    ])
    
    // Build CSV
    const csv = [
      headers.join(';'),
      ...rows.map(row => 
        row.map(cell => `"${cell}"`).join(';')
      )
    ].join('\n')
    
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="spedizioni-${Date.now()}.csv"`,
      },
    })
    
  } catch (error: any) {
    // SECURITY: Gestione sicura errori
    return handleAPIError(error, 'CSV_EXPORT', 'Errore generazione CSV')
  }
}
