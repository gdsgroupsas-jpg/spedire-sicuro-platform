import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { comparaPrezzi } from '@/lib/utils/compare-prices'
import { ListinoCorriere } from '@/lib/types'

// **********************************************
// 1. INIZIALIZZAZIONE (GOOGLE GEMINI API)
// **********************************************

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Funzione per chiamare Google Gemini Vision API
async function callGeminiVision(base64Image: string, mediaType: string): Promise<string> {
    if (!GOOGLE_API_KEY) {
        throw new Error('GOOGLE_API_KEY non configurata. Verificare le variabili d\'ambiente su Vercel.');
    }
    
    console.log('[OCR-GEMINI] Chiamata a Google Gemini Vision API in corso...');

    // Endpoint API Google Gemini
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GOOGLE_API_KEY}`;

    // Prompt ottimizzato per l'estrazione dati da screenshot WhatsApp
    const prompt = `Analizza questo screenshot di un ordine di spedizione WhatsApp ed estrai TUTTI i dati in formato JSON puro (senza markdown).

IMPORTANTE: Restituisci SOLO il JSON, senza testo aggiuntivo, senza \`\`\`json, senza spiegazioni.

Campi da estrarre:
- destinatario: nome completo del destinatario
- indirizzo: via e numero civico
- cap: codice postale (5 cifre)
- localita: città
- provincia: sigla provincia (2 lettere maiuscole)
- country: codice paese (default "IT")
- peso: peso in kg (numero decimale)
- colli: numero di colli (intero)
- contrassegno: importo contrassegno in euro (0 se non presente)
- telefono: numero di telefono (10 cifre senza prefisso)
- email_destinatario: email se presente, altrimenti null
- contenuto: descrizione del contenuto
- order_id: ID ordine se presente
- rif_mittente: riferimento mittente se presente
- rif_destinatario: riferimento destinatario se presente
- note: eventuali note

Esempio formato risposta:
{
  "destinatario": "Mario Rossi",
  "indirizzo": "Via Roma 123",
  "cap": "20100",
  "localita": "Milano",
  "provincia": "MI",
  "country": "IT",
  "peso": 2.5,
  "colli": 1,
  "contrassegno": 150.00,
  "telefono": "3331234567",
  "email_destinatario": null,
  "contenuto": "Abbigliamento",
  "order_id": "ORD-12345",
  "rif_mittente": null,
  "rif_destinatario": null,
  "note": "Consegnare in orario mattutino"
}`;

    const requestBody = {
        contents: [{
            parts: [
                { text: prompt },
                {
                    inline_data: {
                        mime_type: mediaType,
                        data: base64Image
                    }
                }
            ]
        }],
        generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 2048,
        }
    };

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('[OCR-GEMINI] Errore API:', response.status, errorText);
            throw new Error(`Errore API Gemini: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        
        if (!data.candidates || data.candidates.length === 0) {
            throw new Error('Nessuna risposta valida da Gemini API');
        }

        const textResponse = data.candidates[0].content.parts[0].text;
        console.log('[OCR-GEMINI] Risposta ricevuta da Gemini');
        
        return textResponse;

    } catch (error: any) {
        console.error('[OCR-GEMINI] Errore nella chiamata API:', error.message);
        throw error;
    }
}

export async function POST(req: NextRequest) {
  console.log('[OCR] POST request ricevuta')
  
  try {
    // 2. VERIFICA VARIABILE AMBIENTE GOOGLE API
    if (!GOOGLE_API_KEY) {
      console.error('[OCR] GOOGLE_API_KEY mancante')
      return NextResponse.json(
        { error: 'Configurazione API Google mancante. Controllare Vercel ENV vars.' },
        { status: 500 }
      )
    }

    // Verifica Supabase
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.error('[OCR] Variabili Supabase mancanti')
      return NextResponse.json(
        { error: 'Configurazione database mancante' },
        { status: 500 }
      )
    }

    let base64Image: string
    let imageSize: number = 0
    let mediaType: string = 'image/jpeg' 

    // 3. GESTIONE UPLOAD
    const contentType = req.headers.get('content-type') || ''
    
    if (contentType.includes('multipart/form-data')) {
      // Metodo preferito (FormData)
      const formData = await req.formData()
      const imageFile = formData.get('image') as File

      if (!imageFile) {
        return NextResponse.json(
          { error: 'Immagine mancante nel FormData' },
          { status: 400 }
        )
      }
      
      imageSize = imageFile.size
      mediaType = imageFile.type || 'image/jpeg'
      const arrayBuffer = await imageFile.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      base64Image = buffer.toString('base64')
      
      console.log(`[OCR] File ricevuto: ${imageFile.name}, ${imageSize} bytes, ${mediaType}`)
      
    } else {
      // Supporto per il vecchio metodo JSON (Base64)
      const body = await req.json()
      const { image, mimeType } = body 
      
      if (!image) {
        return NextResponse.json(
          { error: 'Immagine Base64 mancante nel body JSON' },
          { status: 400 }
        )
      }
      
      base64Image = image.replace(/^data:image\/\w+;base64,/, '')
      imageSize = Math.round((base64Image.length * 3) / 4) 
      mediaType = mimeType || 'image/jpeg'
      
      console.log(`[OCR] JSON ricevuto, dimensione stimata: ${imageSize} bytes`)
    }
    
    if (!base64Image || base64Image.length === 0) {
      return NextResponse.json(
        { error: 'Immagine non valida' },
        { status: 400 }
      )
    }
    
    // 4. ESECUZIONE AI (Chiamata reale a Google Gemini)
    const responseText = await callGeminiVision(base64Image, mediaType);
    
    // 5. PARSING E NORMALIZZAZIONE
    let jsonText = responseText.trim()
    // Rimuovi eventuali markdown
    jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    
    let extracted: any
    try {
      extracted = JSON.parse(jsonText)
      console.log('[OCR] JSON parsato con successo')
    } catch (parseError: any) {
      console.error('[OCR] Errore parsing JSON:', parseError.message)
      console.error('[OCR] Testo ricevuto:', jsonText.substring(0, 500))
      throw new Error(`Errore parsing risposta AI: ${parseError.message}`)
    }
    
    // NORMALIZZAZIONE DATI
    if (!extracted.provincia || extracted.provincia.length !== 2) {
      extracted.provincia = 'NA'
    } else {
      extracted.provincia = extracted.provincia.toUpperCase().substring(0, 2)
    }
    
    if (!extracted.cap || extracted.cap.length !== 5) {
      extracted.cap = '80100'
    } else {
      extracted.cap = String(extracted.cap).padStart(5, '0').substring(0, 5)
    }
    
    if (!extracted.peso || extracted.peso === 0) {
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
      destinatario: extracted.destinatario,
      provincia: extracted.provincia,
      cap: extracted.cap,
      peso: extracted.peso,
      colli: extracted.colli,
      contrassegno: extracted.contrassegno
    })
    
    // 6. COMPARAZIONE PREZZI
    console.log('[OCR] Avvio comparazione prezzi...')
    let comparison: any[] = []
    
    try {
      const { data: listini, error: listiniError } = await supabase
        .from('listini_corrieri')
        .select('*')
        .eq('attivo', true)

      if (listiniError) {
        console.warn('[OCR] Errore recupero listini:', listiniError.message)
      }

      if (listini && listini.length > 0) {
        console.log(`[OCR] Trovati ${listini.length} listini attivi`)
        
        const listiniTipizzati: ListinoCorriere[] = listini.map((l: any) => ({
          id: l.id, 
          created_at: l.created_at, 
          updated_at: l.updated_at, 
          fornitore: l.fornitore, 
          servizio: l.servizio, 
          attivo: l.attivo, 
          file_originale: l.file_originale, 
          dati_listino: l.dati_listino, 
          regole_contrassegno: l.regole_contrassegno, 
          zone_coperte: l.zone_coperte || [], 
          peso_max: l.peso_max, 
          note: l.note,
        }))

        const opzioni = comparaPrezzi(
          listiniTipizzati,
          Number(extracted.peso),
          extracted.provincia,
          Number(extracted.contrassegno || 0)
        )

        // Calcolo Margine (Markup del 35%)
        comparison = opzioni.map((opzione, index) => ({
          ...opzione,
          posizione: index + 1,
          prezzoConsigliato: Number((opzione.totale * 1.35).toFixed(2)),
          margine: Number(((opzione.totale * 1.35) - opzione.totale).toFixed(2)),
          marginePerc: 26.0,
          nome: `${opzione.fornitore} - ${opzione.servizio}`,
          tempi: '24-48h',
          affidabilita: 4.5,
        }))
        
        console.log(`[OCR] Comparazione completata: ${comparison.length} opzioni trovate`)
      } else {
        console.log('[OCR] Nessun listino attivo trovato')
      }
    } catch (compareError: any) {
      console.warn('[OCR] Errore comparazione (non bloccante):', compareError.message)
    }
    
    // 7. SALVATAGGIO SU SUPABASE
    let spedizione: any = null
    try {
      const { data, error: dbError } = await supabase
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
        ])
        .select()
        .single()
      
      if (dbError) {
        console.error('[OCR] Errore Supabase:', dbError.message)
        // Non blocchiamo l'utente, l'estrazione è comunque riuscita
      } else {
        spedizione = data
        console.log(`[OCR] Spedizione salvata con ID: ${spedizione?.id}`)
      }
    } catch (dbError: any) {
      console.error('[OCR] Errore salvataggio database:', dbError.message)
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
    console.error('[OCR] Errore generale:', error.message)
    
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
