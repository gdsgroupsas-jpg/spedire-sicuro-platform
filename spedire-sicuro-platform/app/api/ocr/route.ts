import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { comparaPrezzi } from '@/lib/listini'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

export async function POST(req: NextRequest) {
  try {
    const { image } = await req.json()
    
    if (!image) {
      return NextResponse.json(
        { error: 'Immagine mancante' },
        { status: 400 }
      )
    }
    
    // Remove data URL prefix if present
    const base64Image = image.replace(/^data:image\/\w+;base64,/, '')
    
    // Call Claude Vision API
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
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
              text: `Analizza questo screenshot di un ordine WhatsApp e estrai TUTTI i dati possibili.

Restituisci SOLO un oggetto JSON valido con questa struttura:

{
  "destinatario": "Nome e Cognome completo",
  "indirizzo": "Via/Corso Nome, numero civico",
  "cap": "00000",
  "localita": "Nome città",
  "provincia": "XX",
  "telefono": "3331234567",
  "contenuto": "Descrizione prodotto/contenuto",
  "contrassegno": 0.00,
  "peso": 1.0
}

REGOLE IMPORTANTI:
- destinatario: nome completo, NO abbreviazioni
- indirizzo: formato completo con numero civico
- cap: SEMPRE 5 cifre numeriche
- provincia: SEMPRE sigla 2 lettere maiuscole (es: NA, MI, RM)
- telefono: solo numeri, NO spazi o trattini
- contenuto: descrizione dettagliata di cosa contiene il pacco
- contrassegno: SOLO se menzionato, altrimenti 0
- peso: stima in kg (default 1.0 se non specificato)

Se un campo non è presente, usa:
- "" per stringhe
- 0 per numeri
- 1.0 per peso

RISPOSTA: Solo JSON, niente testo aggiuntivo.`,
            },
          ],
        },
      ],
    })
    
    // Parse response
    const responseText = message.content[0].type === 'text' 
      ? message.content[0].text 
      : ''
    
    // Extract JSON from response (remove markdown if present)
    let jsonText = responseText.trim()
    jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    
    const extracted = JSON.parse(jsonText)
    
    // Validate required fields
    if (!extracted.provincia || extracted.provincia.length !== 2) {
      extracted.provincia = 'NA' // default
    }
    
    if (!extracted.cap || extracted.cap.length !== 5) {
      extracted.cap = '80100' // default
    }
    
    if (!extracted.peso || extracted.peso === 0) {
      extracted.peso = 1.0
    }
    
    // Calculate best carrier
    const comparison = comparaPrezzi({
      peso: Number(extracted.peso),
      provincia: extracted.provincia,
      contrassegno: Number(extracted.contrassegno || 0),
    })
    
    return NextResponse.json({
      success: true,
      extracted,
      comparison,
      confidence: 95,
    })
    
  } catch (error: any) {
    console.error('OCR Error:', error)
    return NextResponse.json(
      { 
        error: 'Errore elaborazione immagine', 
        details: error.message 
      },
      { status: 500 }
    )
  }
}
