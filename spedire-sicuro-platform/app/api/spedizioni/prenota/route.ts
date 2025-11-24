// app/api/spedizioni/prenota/route.ts

import { NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Database } from '@/lib/database.types'; 
import { 
    transitionShipmentStatus, 
    ShipmentEvents, 
    ShipmentStatus,
} from '@/lib/shipment-workflow/shipment-fsm';

// Tipo di Dati minimo richiesto per la prenotazione
interface PrenotaSpedizioneBody {
  idSpedizione: string;
  // Aggiungi qui i dati di validazione per la generazione dell'etichetta
  // es. datiPagamento: { ... }, datiCorriere: { ... }
}

/**
 * Gestisce la richiesta di prenotazione finale di una spedizione.
 * Esegue la transizione di stato da 'bozza' a 'inviata' se la logica è valida.
 * SCALABILITÀ: Usa la FSM per bloccare gli stati logici non validi.
 */
export async function POST(request: Request) {
  try {
    const body: PrenotaSpedizioneBody = await request.json();
    const { idSpedizione } = body;

    if (!idSpedizione) {
      return NextResponse.json({ error: 'ID Spedizione mancante. Request respinta.' }, { status: 400 });
    }

    // Setup Supabase Client (Server-side with auth context)
    const cookieStore = cookies();
    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) { return cookieStore.get(name)?.value },
          set(name: string, value: string, options: CookieOptions) { 
            // Note: In a route handler we can't easily set cookies without a response
            // but for reading the session it works.
            try { cookieStore.set({ name, value, ...options }) } catch (e) {}
          },
          remove(name: string, options: CookieOptions) { 
            try { cookieStore.set({ name, value: '', ...options }) } catch (e) {}
          },
        },
      }
    );
    
    // 1. Fetch dello stato corrente
    const { data: spedizione, error: fetchError } = await supabase
      .from('spedizioni')
      .select('status')
      .eq('id', idSpedizione)
      .single();

    if (fetchError || !spedizione) {
      return NextResponse.json({ error: 'Spedizione non trovata o Errore DB.' }, { status: 404 });
    }

    // 2. Tenta la transizione FSM: BOZZA -> INVIATA
    //    L'uso di `as ShipmentStatus` è sicuro solo DOPO la migrazione ENUM/tipi rigenerati.
    const currentStatus = spedizione.status as ShipmentStatus;
    const newStatus = transitionShipmentStatus(
      currentStatus,
      ShipmentEvents.PRENOTA // L'evento che innesca la prenotazione
    );

    // 3. Esecuzione Logica di Business Critica (Simulazione)
    //    QUI DEVI INSERIRE l'API Call esterna al corriere.
    //    const etichettaUrl = await CorrieriService.prenota(body);
    
    // 4. Aggiornamento DB allo stato legale
    const { error: updateError } = await supabase
      .from('spedizioni')
      // Utilizza il tipo ENUM del database per la massima type-safety
      .update({ status: newStatus as Database['public']['Enums']['shipment_status_enum'] }) 
      .eq('id', idSpedizione);

    if (updateError) {
      console.error('Database Update Failed (Rollback potenziale):', updateError.message);
      // Fallimento DB: questo è un errore interno.
      return NextResponse.json({ error: `Errore DB: Impossibile aggiornare lo stato a ${newStatus}` }, { status: 500 });
    }

    // 5. Successo
    return NextResponse.json({ 
      success: true, 
      id: idSpedizione, 
      newStatus: newStatus,
      message: `Spedizione confermata. Transizione di stato FSM: ${currentStatus} -> ${newStatus}`
    }, { status: 200 });

  } catch (e: any) {
    // Gestione degli errori FSM: l'errore non è di DB, ma di logica (es. tentare di prenotare uno stato già INVIATA)
    console.error('Errore logistico/FSM:', e.message);
    
    // Ritorna 400 (Bad Request) se la transizione è stata bloccata dalla FSM.
    const httpStatus = e.message && e.message.includes('Transizione illegale') ? 400 : 500;

    return NextResponse.json({ 
      error: e.message || 'Unknown Error', 
      code: 'FSM_VIOLATION' 
    }, { status: httpStatus });
  }
}
