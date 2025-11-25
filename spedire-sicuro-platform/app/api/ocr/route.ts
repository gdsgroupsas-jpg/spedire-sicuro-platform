import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenAI } from '@google/genai'
import { getSupabaseServerClient, type SupabaseServerClient } from '@/lib/supabase'
import { comparaPrezzi } from '@/lib/utils/compare-prices'
import type { ListinoCorriere, OpzioneCorriere } from '@/lib/types'
import type { TablesInsert } from '@/lib/database.types'

const GEMINI_API_KEY = process.env.GEMINI_API_KEY
const GEMINI_MODEL = process.env.GEMINI_OCR_MODEL ?? 'gemini-2.0-flash-exp'
const geminiClient = GEMINI_API_KEY ? new GoogleGenAI({ apiKey: GEMINI_API_KEY }) : null

const OCR_SYSTEM_PROMPT = `Sei un assistente OCR logistico per Spedire Sicuro. Devi estrarre dati di spedizioni da screenshot WhatsApp o PDF. 
Le regole sono:
1. Rispondi SOLO con JSON valido (nessun testo extra, niente markdown).
2. Se un campo non è presente, restituisci null oppure un valore di default ragionevole (contrassegno=0, colli=1, peso=1.0).
3. Normalizza i valori (provincia in maiuscolo, CAP a 5 cifre, peso numerico).
4. Non inventare dati palesemente errati. Usa null se il dato non esiste.`

const OCR_RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    destinatario: { type: 'string' },
    indirizzo: { type: 'string' },
    cap: { type: 'string' },
    localita: { type: 'string' },
    provincia: { type: 'string' },
    country: { type: 'string' },
    peso: { type: 'number' },
    colli: { type: 'integer' },
    contrassegno: { type: 'number' },
    telefono: { type: 'string' },
    email_destinatario: { type: 'string' },
    contenuto: { type: 'string' },
    order_id: { type: 'string' },
    rif_mittente: { type: 'string' },
    rif_destinatario: { type: 'string' },
    note: { type: 'string' },
  },
  required: [
    'destinatario',
    'indirizzo',
    'cap',
    'localita',
    'provincia',
    'peso',
    'colli',
    'contrassegno',
  ],
} as const

type GeminiExtraction = Partial<{
  destinatario: string | null
  indirizzo: string | null
  cap: string | null
  localita: string | null
  provincia: string | null
  country: string | null
  peso: number | string | null
  colli: number | string | null
  contrassegno: number | string | null
  telefono: string | null
  email_destinatario: string | null
  contenuto: string | null
  order_id: string | null
  rif_mittente: string | null
  rif_destinatario: string | null
  note: string | null
}>

type NormalizedShipmentData = {
  destinatario: string
  indirizzo: string
  cap: string
  localita: string
  provincia: string
  country: string
  peso: number
  colli: number
  contrassegno: number
  telefono: string | null
  email_destinatario: string | null
  contenuto: string | null
  order_id: string | null
  rif_mittente: string | null
  rif_destinatario: string | null
  note: string | null
}

type ComparisonEntry = OpzioneCorriere & {
  posizione: number
  prezzoConsigliato: number
  margine: number
  marginePerc: number
  nome: string
  tempi: string
  affidabilita: number
}

async function callGeminiVision(base64Image: string, mediaType: string): Promise<GeminiExtraction> {
  if (!GEMINI_API_KEY || !geminiClient) {
    throw new Error('GEMINI_API_KEY non configurata. Verificare le variabili di ambiente.')
  }

  console.log('[OCR-GEMINI] Invocazione modello tramite SDK:', GEMINI_MODEL)

  const response = await geminiClient.models.generateContent({
    model: GEMINI_MODEL,
    contents: [
      {
        role: 'user',
        parts: [
          { text: 'Analizza lo screenshot e restituisci i dati spedizione in JSON valido.' },
          {
            inlineData: {
              mimeType: mediaType,
              data: base64Image,
            },
          },
        ],
      },
    ],
    config: {
      systemInstruction: {
        role: 'system',
        parts: [{ text: OCR_SYSTEM_PROMPT }],
      },
      temperature: 0,
      maxOutputTokens: 2048,
      responseMimeType: 'application/json',
      responseSchema: OCR_RESPONSE_SCHEMA as any,
    },
  })

  const textResponse = response.text

  if (!textResponse) {
    throw new Error('Risposta Gemini vuota o non valida')
  }

  try {
    return JSON.parse(textResponse)
  } catch (error: any) {
    console.error('[OCR] Errore parsing JSON Gemini:', error.message)
    console.error('[OCR] Payload ricevuto:', textResponse.substring(0, 400))
    throw new Error(`JSON Gemini non valido: ${error.message}`)
  }
}

function normalizeExtraction(raw: GeminiExtraction): NormalizedShipmentData {
  const sanitizeString = (value: unknown) =>
    typeof value === 'string' ? value.trim() : value ? String(value) : ''

  const provincia = (sanitizeString(raw.provincia) || 'NA').toUpperCase().substring(0, 2)
  const capOnlyDigits = sanitizeString(raw.cap).replace(/\D/g, '')
  const cap = capOnlyDigits ? capOnlyDigits.padStart(5, '0').substring(0, 5) : '80100'

  const peso = Number(raw.peso)
  const colli = Number(raw.colli)
  const contrassegno = Number(raw.contrassegno)

  return {
    destinatario: sanitizeString(raw.destinatario) || 'Destinatario non disponibile',
    indirizzo: sanitizeString(raw.indirizzo) || 'Indirizzo non disponibile',
    cap,
    localita: sanitizeString(raw.localita) || 'Napoli',
    provincia,
    country: (sanitizeString(raw.country) || 'IT').toUpperCase().substring(0, 2),
    peso: Number.isFinite(peso) && peso > 0 ? Number(peso.toFixed(2)) : 1,
    colli: Number.isFinite(colli) && colli > 0 ? Math.round(colli) : 1,
    contrassegno: Number.isFinite(contrassegno) && contrassegno > 0 ? Number(contrassegno.toFixed(2)) : 0,
    telefono: raw.telefono ? sanitizeString(raw.telefono) : null,
    email_destinatario: raw.email_destinatario ? sanitizeString(raw.email_destinatario) : null,
    contenuto: raw.contenuto ? sanitizeString(raw.contenuto) : null,
    order_id: raw.order_id ? sanitizeString(raw.order_id) : null,
    rif_mittente: raw.rif_mittente ? sanitizeString(raw.rif_mittente) : null,
    rif_destinatario: raw.rif_destinatario ? sanitizeString(raw.rif_destinatario) : null,
    note: raw.note ? sanitizeString(raw.note) : null,
  }
}

function enrichComparison(opzioni: OpzioneCorriere[]): ComparisonEntry[] {
  return opzioni.map((opzione, index) => {
    const prezzoConsigliato = Number((opzione.totale * 1.35).toFixed(2))
    const margine = Number((prezzoConsigliato - opzione.totale).toFixed(2))
    return {
      ...opzione,
      posizione: index + 1,
      prezzoConsigliato,
      margine,
      marginePerc: 26.0,
      nome: `${opzione.fornitore} - ${opzione.servizio}`,
      tempi: '24-48h',
      affidabilita: 4.5,
    }
  })
}

async function fetchActiveListini(client: SupabaseServerClient): Promise<ListinoCorriere[]> {
  const { data, error } = await client.from('listini_corrieri').select('*').eq('attivo', true)

  if (error) {
    throw new Error(error.message)
  }

  return (data ?? []).map((listino: any) => ({
    id: listino.id,
    created_at: listino.created_at ?? new Date().toISOString(),
    updated_at: listino.updated_at ?? new Date().toISOString(),
    fornitore: listino.fornitore,
    servizio: listino.servizio,
    attivo: listino.attivo,
    file_originale: listino.file_originale,
    dati_listino: listino.dati_listino,
    regole_contrassegno: listino.regole_contrassegno,
    zone_coperte: listino.zone_coperte || [],
    peso_max: listino.peso_max,
    note: listino.note,
  }))
}

async function persistShipment(
  client: SupabaseServerClient,
  extracted: NormalizedShipmentData,
  comparison: ComparisonEntry[]
) {
  const payload: TablesInsert<'spedizioni'> = {
    destinatario: extracted.destinatario,
    indirizzo: extracted.indirizzo,
    cap: extracted.cap,
    localita: extracted.localita,
    provincia: extracted.provincia,
    country: extracted.country,
    peso: extracted.peso,
    colli: extracted.colli,
    contrassegno: extracted.contrassegno,
    telefono: extracted.telefono,
    email_destinatario: extracted.email_destinatario,
    contenuto: extracted.contenuto,
    order_id: extracted.order_id,
    rif_mittente: extracted.rif_mittente,
    rif_destinatario: extracted.rif_destinatario,
    note: extracted.note,
    dati_ocr: extracted,
    confronto_prezzi: comparison,
  }

  const { data, error } = await (client.from('spedizioni') as any).insert([payload]).select().single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}

async function extractImagePayload(req: NextRequest) {
  const contentType = req.headers.get('content-type') || ''

  if (contentType.includes('multipart/form-data')) {
    const formData = await req.formData()
    const imageFile = formData.get('image') as File | null

    if (!imageFile) {
      throw new Error('Immagine mancante nel FormData')
    }

    const arrayBuffer = await imageFile.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    console.log(`[OCR] File ricevuto: ${imageFile.name}, ${imageFile.size} bytes, ${imageFile.type}`)

    return {
      base64Image: buffer.toString('base64'),
      mediaType: imageFile.type || 'image/jpeg',
    }
  }

  const body = await req.json()
  const { image, mimeType } = body

  if (!image) {
    throw new Error('Immagine Base64 mancante nel body JSON')
  }

  const sanitized = image.replace(/^data:image\/\w+;base64,/, '')
  console.log('[OCR] Payload JSON ricevuto, dimensione stimata:', sanitized.length)

  return {
    base64Image: sanitized,
    mediaType: mimeType || 'image/jpeg',
  }
}

export async function POST(req: NextRequest) {
  console.log('[OCR] POST request ricevuta')

  try {
    if (!GEMINI_API_KEY) {
      console.error('[OCR] GEMINI_API_KEY mancante')
      return NextResponse.json(
        { error: 'Configurazione API Gemini mancante. Controllare Vercel ENV vars.' },
        { status: 500 }
      )
    }

    const supabase = getSupabaseServerClient()
    const { base64Image, mediaType } = await extractImagePayload(req)

    const rawExtraction = await callGeminiVision(base64Image, mediaType)
    const extracted = normalizeExtraction(rawExtraction)

    console.log('[OCR] Dati normalizzati:', {
      destinatario: extracted.destinatario,
      provincia: extracted.provincia,
      cap: extracted.cap,
      peso: extracted.peso,
      colli: extracted.colli,
      contrassegno: extracted.contrassegno,
    })

    let comparison: ComparisonEntry[] = []

    try {
      const listini = await fetchActiveListini(supabase)
      if (listini.length > 0) {
        console.log('[OCR] Listini attivi trovati:', listini.length)
        const opzioni = comparaPrezzi(
          listini,
          extracted.peso,
          extracted.provincia,
          extracted.contrassegno
        )
        comparison = enrichComparison(opzioni)
      } else {
        console.warn('[OCR] Nessun listino attivo disponibile')
      }
    } catch (compareError: any) {
      console.warn('[OCR] Errore comparazione (non bloccante):', compareError.message)
    }

    let spedizioneId: string | null = null
    try {
      const spedizione = await persistShipment(supabase, extracted, comparison)
      spedizioneId = spedizione?.id ?? null
      console.log('[OCR] Spedizione salvata con ID:', spedizioneId)
    } catch (dbError: any) {
      console.error('[OCR] Salvataggio spedizione fallito:', dbError.message)
    }

    return NextResponse.json(
      {
        success: true,
        extracted,
        comparison,
        spedizione_id: spedizioneId,
        confidence: 95,
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('[OCR] Errore generale:', error.message)

    return NextResponse.json(
      {
        error: 'Errore elaborazione immagine',
        details: error.message,
        type: error.constructor?.name ?? 'Error',
      },
      { status: 500 }
    )
  }
}
