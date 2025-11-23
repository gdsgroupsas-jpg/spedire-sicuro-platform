import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'

// Inizializza client con controllo variabili
let anthropic: Anthropic | null = null
if (process.env.ANTHROPIC_API_KEY) {
  anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  })
}

let supabase: ReturnType<typeof createClient> | null = null
if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
}

export async function POST(req: NextRequest) {
  console.log('[OCR] POST request ricevuta')
  console.log('[OCR] Content-Type:', req.headers.get('content-type'))
  
  try {
    // Verifica variabili ambiente
    if (!process.env.ANTHROPIC_API_KEY) {
      console.error('[OCR] ANTHROPIC_API_KEY mancante')
      return NextResponse.json(
        { error: 'Configurazione API mancante' },
        { status: 500 }
      )
    }

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.error('[OCR] Variabili Supabase mancanti')
      return NextResponse.json(
        { error: 'Configurazione database mancante' },
        { status: 500 }
      )
    }

    let base64Image: string
    let imageSize: number = 0

    // Supporta sia FormData che JSON
    const contentType = req.headers.get('content-type') || ''
    
    if (contentType.includes('multipart/form-data')) {
      console.log('[OCR] Ricevuto FormData')
      const formData = await req.formData()
      const imageFile = formData.get('image') as File
      
      if (!imageFile) {
        console.error('[OCR] File immagine mancante in FormData')
        return NextResponse.json(
          { error: 'Immagine mancante nel FormData' },
          { status: 400 }
        )
      }
      
      imageSize = imageFile.size
      console.log('[OCR] File ricevuto:', {
        name: imageFile.name,
        size: imageSize,
        type: imageFile.type
      })
      
      // Converti File a base64
      const arrayBuffer = await imageFile.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      base64Image = buffer.toString('base64')
      
      // Determina media type
      const mediaType = imageFile.type || 'image/jpeg'
      console.log('[OCR] Immagine convertita, dimensione base64:', base64Image.length, 'caratteri')
      
    } else {
      console.log('[OCR] Ricevuto JSON')
      const body = await req.json()
      const { image } = body
      
      if (!image) {
        console.error('[OCR] Campo image mancante in JSON')
        return NextResponse.json(
          { error: 'Immagine mancante' },
          { status: 400 }
        )
      }
      
      // Remove data URL prefix if present
      base64Image = image.replace(/^data:image\/\w+;base64,/, '')
      imageSize = Math.round((base64Image.length * 3) / 4) // Stima dimensione
      console.log('[OCR] Base64 ricevuto, dimensione stimata:', imageSize, 'bytes')
    }
    
    if (!base64Image || base64Image.length === 0) {
      console.error('[OCR] Base64 immagine vuoto')
      return NextResponse.json(
        { error: 'Immagine non valida' },
        { status: 400 }
      )
    }
    
    // Call Claude Vision API
    console.log('[OCR] Chiamata a Claude Vision API...')
    
    if (!anthropic) {
      console.error('[OCR] Anthropic client non inizializzato')
      return NextResponse.json(
        { error: 'API Anthropic non configurata' },
        { status: 500 }
      )
    }
    
    const message = await (anthropic as any).messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: 'image/jpeg',
                data: base64Image,
              },
            },
            {
              type: 'text',
              text: `Estrai TUTTI i dati da questo screenshot WhatsApp di una richiesta spedizione.

CERCA E RESTITUISCI (formato JSON):

{
  "destinatario": "nome completo",
  "indirizzo": "via e numero civico",
  "cap": "codice postale",
  "localita": "città",
  "provincia": "sigla provincia (ES: NA, RM, MI)",
  "country": "IT",
  "peso": numero_decimale_kg,
  "colli": numero_intero,
  "contrassegno": numero_decimale_euro (0 se non presente),
  "telefono": "numero telefono",
  "email_destinatario": "email se presente",
  "contenuto": "descrizione merce",
  "order_id": "codice ordine se presente",
  "rif_mittente": "riferimento mittente",
  "rif_destinatario": "riferimento destinatario",
  "note": "eventuali note"
}

REGOLE:
- Peso: converti in kg decimale (es: 1.5 per 1,5kg)
- Contrassegno: solo numero (es: 25.5 non "25,50€")
- Provincia: SEMPRE sigla 2 lettere maiuscole
- Se campo non presente: null
- Rispondi SOLO con JSON valido, nessun testo aggiuntivo`,
            },
          ],
        },
      ],
    })
    
    console.log('[OCR] Risposta Claude ricevuta')
    console.log('[OCR] Tipo contenuto:', message.content[0].type)
    
    // Parse response
    const responseText = message.content[0].type === 'text' 
      ? message.content[0].text 
      : ''
    
    console.log('[OCR] Testo risposta lunghezza:', responseText.length)
    console.log('[OCR] Prime 200 caratteri:', responseText.substring(0, 200))
    
    // Extract JSON from response (remove markdown if present)
    let jsonText = responseText.trim()
    jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    
    console.log('[OCR] Parsing JSON...')
    let extracted: any
    try {
      extracted = JSON.parse(jsonText)
      console.log('[OCR] JSON parsato con successo')
      console.log('[OCR] Campi estratti:', Object.keys(extracted))
    } catch (parseError: any) {
      console.error('[OCR] Errore parsing JSON:', parseError.message)
      console.error('[OCR] Testo da parsare:', jsonText.substring(0, 500))
      throw new Error(`Errore parsing risposta Claude: ${parseError.message}`)
    }
    
    // Validate and normalize required fields
    console.log('[OCR] Validazione e normalizzazione campi...')
    
    if (!extracted.provincia || extracted.provincia.length !== 2) {
      console.warn('[OCR] Provincia non valida, uso default: NA')
      extracted.provincia = 'NA'
    } else {
      extracted.provincia = extracted.provincia.toUpperCase().substring(0, 2)
    }
    
    if (!extracted.cap || extracted.cap.length !== 5) {
      console.warn('[OCR] CAP non valido, uso default: 80100')
      extracted.cap = '80100'
    } else {
      extracted.cap = String(extracted.cap).padStart(5, '0').substring(0, 5)
    }
    
    if (!extracted.peso || extracted.peso === 0) {
      console.warn('[OCR] Peso non valido, uso default: 1.0')
      extracted.peso = 1.0
    }
    
    if (!extracted.colli) {
      extracted.colli = 1
    }
    
    if (!extracted.contrassegno) {
      extracted.contrassegno = 0
    }
    
    if (!extracted.country) {
      extracted.country = 'IT'
    }
    
    console.log('[OCR] Dati normalizzati:', {
      provincia: extracted.provincia,
      cap: extracted.cap,
      peso: extracted.peso,
      contrassegno: extracted.contrassegno
    })
    
    // Call compare API to get prices
    console.log('[OCR] Chiamata API compare prezzi...')
    let comparison = []
    try {
      const compareResponse = await fetch(`${req.nextUrl.origin}/api/compare`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          peso: Number(extracted.peso),
          provincia: extracted.provincia,
          contrassegno: Number(extracted.contrassegno || 0),
        }),
      })
      
      if (compareResponse.ok) {
        const compareData = await compareResponse.json()
        comparison = compareData.opzioni || []
        console.log('[OCR] Comparazione prezzi:', comparison.length, 'opzioni trovate')
      } else {
        console.warn('[OCR] Errore chiamata compare API:', compareResponse.status)
      }
    } catch (compareError: any) {
      console.warn('[OCR] Errore compare API (non bloccante):', compareError.message)
    }
    
    // Salva su Supabase
    console.log('[OCR] Salvataggio su Supabase...')
    
    let spedizione: any = null
    let dbError: any = null
    
    if (supabase) {
      const result = await supabase
        .from('spedizioni')
        .insert([
          {
            ...extracted,
            dati_ocr: extracted,
            confronto_prezzi: comparison,
            peso: Number(extracted.peso),
            colli: Number(extracted.colli || 1),
            contrassegno: Number(extracted.contrassegno || 0),
          },
        ] as any)
        .select()
        .single()
      
      spedizione = result.data
      dbError = result.error
    } else {
      console.warn('[OCR] Supabase non configurato, salto salvataggio')
    }
    
    if (dbError) {
      console.error('[OCR] Errore Supabase:', dbError)
      console.error('[OCR] Dettagli errore:', JSON.stringify(dbError, null, 2))
    } else {
      console.log('[OCR] Spedizione salvata con ID:', spedizione?.id)
    }
    
    // Log operazione
    try {
      if (supabase) {
        await supabase.from('log_operazioni').insert([
        {
          tipo: 'OCR',
          dettagli: {
            provincia: extracted.provincia,
            peso: extracted.peso,
            contrassegno: extracted.contrassegno,
            image_size: imageSize,
          },
          esito: dbError ? 'error' : 'success',
        },
      ] as any)
      }
    } catch (logError) {
      console.warn('[OCR] Errore log operazione (non bloccante):', logError)
    }
    
    console.log('[OCR] Risposta inviata con successo')
    
    return NextResponse.json({
      success: true,
      extracted,
      comparison,
      spedizione_id: spedizione?.id,
      confidence: 95,
    }, {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
  } catch (error: any) {
    console.error('[OCR] Errore generale:', error)
    console.error('[OCR] Stack trace:', error.stack)
    
    return NextResponse.json(
      { 
        error: 'Errore elaborazione immagine', 
        details: error.message,
        type: error.constructor.name
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
