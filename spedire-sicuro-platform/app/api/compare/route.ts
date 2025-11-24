import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { comparaPrezzi } from '@/lib/utils/compare-prices'
import { ListinoCorriere } from '@/lib/types'

type PriceCheckInput = {
  cap: string
  provincia: string
  peso: number
  contrassegno: string // XX.XX come stringa
  destinatario?: string
  indirizzo?: string
  localita?: string
  telefono?: string
  contenuto?: string
  colli?: number
  note?: string
  country?: string
  email_destinatario?: string
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    
    // Support single object or array
    const items: PriceCheckInput[] = Array.isArray(body) ? body : [body]

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Nessun dato di spedizione fornito.' }, { status: 400 })
    }

    // Initialize Supabase client
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) { return cookieStore.get(name)?.value },
          set(name: string, value: string, options: CookieOptions) { cookieStore.set({ name, value, ...options }) },
          remove(name: string, options: CookieOptions) { cookieStore.set({ name, value: '', ...options }) },
        },
      }
    )

    // Recupera tutti i listini attivi
    const { data: listini, error } = await supabase
      .from('listini_corrieri')
      .select('*')
      .eq('attivo', true)

    if (error) {
      console.error('Errore recupero listini:', error)
      return NextResponse.json({ error: 'Errore recupero listini' }, { status: 500 })
    }

    if (!listini || listini.length === 0) {
      return NextResponse.json({ error: 'Nessun listino attivo trovato.' }, { status: 404 })
    }

    // Converti in formato tipizzato
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

    const results = await Promise.all(items.map(async (item) => {
      // Esegue il calcolo del prezzo
      const opzioni = comparaPrezzi(
        listiniTipizzati,
        Number(item.peso || 1),
        item.provincia,
        Number(item.contrassegno || 0)
      )

      // Seleziona la migliore opzione (la prima perché sorted) o formatta le opzioni
      const opzioniConInfo = opzioni.map((opzione, index) => ({
        ...opzione,
        posizione: index + 1,
        prezzoConsigliato: Number((opzione.totale * 1.35).toFixed(2)), // 35% markup
        margine: Number((opzione.totale * 0.35).toFixed(2)),
        marginePerc: 26.0,
        nome: `${opzione.fornitore} - ${opzione.servizio}`,
        tempi: '24-48h', 
        affidabilita: 4.5,
      }))

      const miglior_prezzo = opzioniConInfo[0] || null

      return {
        ...item,
        opzioni: opzioniConInfo,
        miglior_prezzo: miglior_prezzo,
        // Flattened fields for easier UI consumption and CSV export
        corriere_ottimale: miglior_prezzo ? miglior_prezzo.nome : 'N/A',
        costo_corriere: miglior_prezzo ? miglior_prezzo.totale : 0,
        margine: miglior_prezzo ? miglior_prezzo.margine : 0
      }
    }))

    // Log operazione (opzionale, ma utile)
    try {
        await (supabase.from('log_operazioni') as any).insert([
            {
                tipo: 'COMPARE_BATCH',
                dettagli: {
                    items_count: items.length,
                    success: true
                },
                esito: 'success',
            },
        ])
    } catch (e) {
        console.warn('Log failed', e)
    }

    return NextResponse.json(results)

  } catch (error: any) {
    console.error("Errore nel calcolo dei prezzi:", error)
    return NextResponse.json({ error: 'Errore interno nel calcolo dei prezzi.', details: error.message }, { status: 500 })
  }
}
