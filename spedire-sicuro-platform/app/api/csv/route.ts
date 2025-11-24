import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { shipments } = await req.json()
    
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
    console.error('CSV Error:', error)
    return NextResponse.json(
      { error: 'Errore generazione CSV', details: error.message },
      { status: 500 }
    )
  }
}
