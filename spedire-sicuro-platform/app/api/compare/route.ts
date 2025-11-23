import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { comparaPrezzi } from '@/lib/utils/compare-prices'
import { ListinoCorriere } from '@/lib/types'

export async function POST(req: NextRequest) {
  try {
    const { peso, provincia, contrassegno } = await req.json()

    if (!peso || !provincia) {
      return NextResponse.json(
        { error: 'Peso e provincia sono obbligatori' },
        { status: 400 }
      )
    }

    // Recupera tutti i listini attivi
    const { data: listini, error } = await supabase
      .from('listini_corrieri')
      .select('*')
      .eq('attivo', true)

    if (error) {
      return NextResponse.json(
        { error: 'Errore recupero listini', details: error.message },
        { status: 500 }
      )
    }

    if (!listini || listini.length === 0) {
      console.warn('[COMPARE] Nessun listino attivo trovato: ritorno risposta vuota')
      return NextResponse.json(
        {
          success: false,
          opzioni: [],
          message: 'Nessun listino attivo trovato. Carica prima un listino.',
          code: 'NO_ACTIVE_LISTINI',
        },
        { status: 200 }
      )
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

    // Calcola opzioni
    const opzioni = comparaPrezzi(
      listiniTipizzati,
      Number(peso),
      provincia,
      Number(contrassegno || 0)
    )

    // Aggiungi informazioni aggiuntive per UI
    const opzioniConInfo = opzioni.map((opzione, index) => ({
      ...opzione,
      posizione: index + 1,
      prezzoConsigliato: Number((opzione.totale * 1.35).toFixed(2)), // 35% markup
      margine: Number((opzione.totale * 0.35).toFixed(2)),
      marginePerc: 26.0,
      nome: `${opzione.fornitore} - ${opzione.servizio}`,
      tempi: '24-48h', // TODO: estrai da listino se disponibile
      affidabilita: 4.5, // TODO: estrai da listino se disponibile
    }))

    // Log operazione
    await supabase.from('log_operazioni').insert([
      {
        tipo: 'COMPARE',
        dettagli: {
          peso,
          provincia,
          contrassegno,
          opzioni_trovate: opzioni.length,
        },
        esito: 'success',
      },
    ])

    return NextResponse.json({
      success: true,
      opzioni: opzioniConInfo,
    })
  } catch (error: any) {
    console.error('Compare error:', error)
    return NextResponse.json(
      {
        error: 'Errore confronto prezzi',
        details: error.message,
      },
      { status: 500 }
    )
  }
}

