import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Inizializza Supabase client
let supabase: ReturnType<typeof createClient> | null = null

function getSupabaseClient() {
  if (!supabase) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    console.log('[UPLOAD] Inizializzazione Supabase client...')
    console.log('[UPLOAD] URL presente:', !!url)
    console.log('[UPLOAD] Key presente:', !!key)
    
    if (!url || !key) {
      throw new Error('Variabili ambiente Supabase mancanti')
    }
    
    supabase = createClient(url, key)
  }
  return supabase
}

// GET method per test
export async function GET() {
  console.log('[UPLOAD] GET request ricevuta - test endpoint')
  
  try {
    const client = getSupabaseClient()
    
    return NextResponse.json({
      success: true,
      message: 'API /api/listini/upload è attiva',
      timestamp: new Date().toISOString(),
      supabase_configured: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      environment: process.env.NODE_ENV
    })
  } catch (error: any) {
    console.error('[UPLOAD] Errore GET:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        message: 'Errore configurazione Supabase'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  console.log('[UPLOAD] POST request ricevuta')
  console.log('[UPLOAD] Content-Type:', request.headers.get('content-type'))
  
  try {
    // Verifica variabili ambiente
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.error('[UPLOAD] Variabili ambiente mancanti')
      return NextResponse.json(
        { 
          error: 'Configurazione mancante',
          details: 'Variabili ambiente Supabase non configurate'
        },
        { status: 500 }
      )
    }

    const formData = await request.formData()
    console.log('[UPLOAD] FormData ricevuto')
    
    const fornitore = formData.get('fornitore') as string
    const servizio = formData.get('servizio') as string
    const file = formData.get('file') as File

    console.log('[UPLOAD] Parametri:', {
      fornitore: fornitore || 'MISSING',
      servizio: servizio || 'MISSING',
      file: file ? { name: file.name, size: file.size, type: file.type } : 'MISSING'
    })

    if (!fornitore || !servizio || !file) {
      console.error('[UPLOAD] Parametri mancanti')
      return NextResponse.json(
        { error: 'Parametri mancanti: fornitore, servizio o file' },
        { status: 400 }
      )
    }

    // Leggi contenuto file
    console.log('[UPLOAD] Lettura file CSV...')
    const text = await file.text()
    console.log('[UPLOAD] File letto, dimensione:', text.length, 'caratteri')
    console.log('[UPLOAD] Prime 200 caratteri:', text.substring(0, 200))
    
    // Parse CSV (separatore ;)
    const lines = text.trim().split('\n').filter(line => line.trim())
    console.log('[UPLOAD] Righe CSV trovate:', lines.length)
    
    if (lines.length < 2) {
      console.error('[UPLOAD] CSV troppo corto, almeno 2 righe richieste')
      return NextResponse.json(
        { error: 'CSV deve contenere almeno header e una riga dati' },
        { status: 400 }
      )
    }
    
    const headers = lines[0].split(';').map(h => h.trim().toLowerCase())
    console.log('[UPLOAD] Headers trovati:', headers)
    
    // Verifica headers base (case insensitive)
    if (!headers.includes('peso_min') || !headers.includes('peso_max')) {
      console.error('[UPLOAD] Headers mancanti. Headers trovati:', headers)
      return NextResponse.json(
        { 
          error: 'CSV deve contenere almeno: peso_min;peso_max',
          headers_trovati: headers
        },
        { status: 400 }
      )
    }

    // Parse fasce peso
    console.log('[UPLOAD] Parsing fasce peso...')
    const fasce = []
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line) continue
      
      const values = line.split(';').map(v => v.trim().replace(',', '.'))
      const row: any = {}
      
      // Mappa valori agli headers (case insensitive)
      headers.forEach((header, index) => {
        row[header] = values[index] || ''
      })
      
      // Estrai peso min/max
      const pesoMin = parseFloat(row.peso_min || '0')
      const pesoMax = parseFloat(row.peso_max || '0')
      
      if (isNaN(pesoMin) || isNaN(pesoMax)) {
        console.warn(`[UPLOAD] Riga ${i} saltata: peso non valido`)
        continue
      }
      
      // Estrai prezzi per zone (tutto tranne peso_min e peso_max)
      const prezzi: any = {}
      
      headers.forEach(header => {
        if (header !== 'peso_min' && header !== 'peso_max') {
          const prezzo = parseFloat(row[header] || '0')
          if (!isNaN(prezzo) && prezzo > 0) {
            prezzi[header] = prezzo
          }
        }
      })
      
      fasce.push({
        peso_min: pesoMin,
        peso_max: pesoMax,
        prezzi: prezzi
      })
      
      console.log(`[UPLOAD] Fascia ${i}: ${pesoMin}-${pesoMax}kg, zone:`, Object.keys(prezzi))
    }
    
    console.log('[UPLOAD] Fasce totali parse:', fasce.length)

    // Crea oggetto listino
    const datiListino = {
      tipo_listino: 'fasce_peso',
      fasce: fasce,
      iva_inclusa: false,
      note: `Caricato il ${new Date().toLocaleDateString('it-IT')}`
    }

    // Zone coperte (dalle colonne del CSV)
    const zoneCoperte = headers.filter(
      h => h !== 'peso_min' && h !== 'peso_max'
    )

    // Peso min/max totale
    const pesoMin = Math.min(...fasce.map((f: any) => f.peso_min))
    const pesoMax = Math.max(...fasce.map((f: any) => f.peso_max))

    console.log('[UPLOAD] Dati listino preparati:', {
      tipo: datiListino.tipo_listino,
      fasce_count: fasce.length,
      zone: zoneCoperte,
      peso_range: `${pesoMin}-${pesoMax}kg`
    })

    // Inserisci su Supabase
    console.log('[UPLOAD] Inserimento in Supabase...')
    const client = getSupabaseClient()
    
    const { data, error } = await client
      .from('listini_corrieri')
      .insert([
        {
          fornitore,
          servizio,
          file_originale: file.name,
          dati_listino: datiListino,
          zone_coperte: zoneCoperte,
          peso_max: pesoMax,
          attivo: true
        }
      ])
      .select()
      .single()

    if (error) {
      console.error('[UPLOAD] Errore Supabase:', error)
      console.error('[UPLOAD] Dettagli errore:', JSON.stringify(error, null, 2))
      return NextResponse.json(
        { 
          error: `Errore database: ${error.message}`,
          code: error.code,
          details: error.details
        },
        { status: 500 }
      )
    }

    console.log('[UPLOAD] Listino inserito con successo, ID:', data.id)

    return NextResponse.json({
      success: true,
      message: 'Listino caricato con successo',
      data: {
        id: data.id,
        fornitore: data.fornitore,
        servizio: data.servizio,
        fasce_count: fasce.length,
        zone: zoneCoperte,
        peso_range: `${pesoMin}-${pesoMax}kg`
      }
    }, {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    })

  } catch (error: any) {
    console.error('[UPLOAD] Errore generale:', error)
    console.error('[UPLOAD] Stack trace:', error.stack)
    
    // Assicurati di restituire sempre JSON
    return NextResponse.json(
      { 
        error: `Errore durante upload: ${error.message}`,
        type: error.constructor.name,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
  }
}

