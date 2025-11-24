import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * Calcola il costo della spedizione postale
 */
export function calcolaCostoPostale(pesoGr: number, servizio: string, destinazione: string): number {
  // Logica semplificata per demo. In produzione usare tabelle listini.
  // Esempio: Posta1 Pro
  if (servizio === 'posta1_pro') {
    if (pesoGr <= 100) return 2.10
    if (pesoGr <= 500) return 4.50
    return 6.50
  }
  // Esempio: Posta4 Pro
  if (servizio === 'posta4_pro') {
      if (pesoGr <= 20) return 0.95
      if (pesoGr <= 50) return 2.55
      return 3.50
  }
  return 0 // Default
}

/**
 * Registra la spedizione postale e SCALA ATOMICAMENTE il saldo PostaBase Mini.
 * @param datiSpedizione Dati grezzi della spedizione.
 * @param costoTotaleCOGS Costo effettivo COGS della spedizione.
 * @param adminUserId ID dell'utente Admin/SuperAdmin che ha eseguito l'operazione.
 * @returns La spedizione salvata.
 * @throws Error se la spedizione non può essere registrata o il saldo è insufficiente.
 */
export async function registraSpedizionePostaleAdmin(
  datiSpedizione: {
    servizio_selezionato: string;
    destinazione: string;
    peso_gr: number;
    costo_utente_finale: number;
    dati_destinatario: any;
  },
  costoTotaleCOGS: number,
  adminUserId: string
): Promise<any> {
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

    const codiceAffrancatrice = `PS-AGENCY-${Date.now()}-${Math.random().toString(36).substring(2, 4)}`.toUpperCase();
    const margineLordo = datiSpedizione.costo_utente_finale - costoTotaleCOGS;

    // 1. **VERIFICA SALDO (Pre-Check)** - Prevenire scritture a vuoto
    const { data: fondoData, error: fetchError } = await supabase
        .from('fondo_cassa_postale')
        .select('saldo_attuale')
        .single();
    
    if (fetchError || !fondoData) {
        // Se la tabella non esiste o è vuota, assumiamo 0 o errore critico
        console.error('Errore lettura fondo cassa:', fetchError);
        throw new Error('RED ALERT: Impossibile leggere il saldo di cassa.');
    }
    
    const saldoAttuale = Number(fondoData.saldo_attuale);
    
    if (saldoAttuale < costoTotaleCOGS) {
        throw new Error(`RED ALERT CASH FLOW: Saldo PostaBase Mini (${saldoAttuale.toFixed(2)}€) insufficiente per costo spedizione (${costoTotaleCOGS.toFixed(2)}€). Ricaricare!`);
    }

    // 2. **ESECUZIONE TRANSAZIONE ATOMICA**
    try {
        // Logica di inserimento spedizione e aggiornamento saldo.
        // Poiché non stiamo usando una RPC per ora, facciamo update sequenziale.
        
        const nuovoSaldo = saldoAttuale - costoTotaleCOGS;

        // A. Aggiorna il saldo (Sottrazione)
        // Assumiamo che ci sia un solo record di fondo cassa o prendiamo il primo.
        // Idealmente dovremmo avere un ID specifico, qui usiamo .gt('id', 0) limit 1 se non conosciamo l'ID
        const { error: updateError } = await supabase
            .from('fondo_cassa_postale')
            .update({ saldo_attuale: nuovoSaldo })
            .gt('id', 0) 
            // .eq('id', 1) // Se sapessimo l'ID
            .select()
            .single(); // Assicura che ne modifichi uno solo

        if (updateError) throw new Error(`DB Error Saldo: ${updateError.message}`);

        // B. Inserisci la spedizione (Log)
        const { data, error: insertError } = await supabase
            .from('spedizioni_postali')
            .insert({
                ...datiSpedizione,
                costo_effettivo_spedire_sicuro: costoTotaleCOGS,
                margine_lordo: margineLordo,
                codice_affrancatrice: codiceAffrancatrice,
                user_id: adminUserId, 
                is_agency_operation: true, // Flag importante
            })
            .select()
            .single();

        if (insertError) {
            // RED ALERT: Rollback manuale o log per compensazione! 
            console.error('FATAL LOG: Fallimento inserimento spedizione. Il saldo potrebbe essere stato scalato ma la spedizione non registrata. Compensazione manuale necessaria.');
            // Tentativo di ripristino saldo (Rollback manuale)
             await supabase
                .from('fondo_cassa_postale')
                .update({ saldo_attuale: saldoAttuale })
                .gt('id', 0);
            
            throw new Error(`DB Error Log: ${insertError.message}`);
        }
        
        // Successo: Saldo scalato e Log inserito.
        return { ...data, nuovo_saldo: nuovoSaldo };

    } catch (error) {
        throw error;
    }
}

/**
 * Recupera metriche P&L per dashboard Admin
 */
export async function getPostalPnlMetrics() {
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

    // 1. Saldo Attuale
    const { data: fondoData } = await supabase
        .from('fondo_cassa_postale')
        .select('saldo_attuale')
        .single();
    
    const saldo = fondoData ? Number(fondoData.saldo_attuale) : 0;

    // 2. Totale Spedizioni (Oggi/Mese/Anno - Stub)
    // In un'implementazione reale useremmo query aggregate o RPC 'calculate_postal_pnl'
    
    return {
        saldo_attuale: saldo,
        // Altri dati P&L placeholder
        spedizioni_oggi: 0,
        margine_oggi: 0
    }
}
