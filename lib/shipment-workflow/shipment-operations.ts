// lib/shipment-workflow/shipment-operations.ts

/**
 * Operazioni di alto livello per la gestione delle spedizioni
 * Combina FSM + Database + Servizi esterni
 */

import { createSupabaseClient } from '@/lib/supabase';
import { Database } from '@/lib/database.types';
import { CorrieriService } from '@/lib/services/corrieri-service';
import {
  transitionShipmentStatus,
  ShipmentEvents,
  ShipmentStatus,
  ShipmentStates,
} from './shipment-fsm';

export interface OperationResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  newStatus?: ShipmentStatus;
}

/**
 * Classe per gestire tutte le operazioni sulle spedizioni
 * con validazione FSM integrata
 */
export class ShipmentOperations {
  /**
   * Prenota una spedizione (BOZZA -> INVIATA)
   */
  static async prenota(
    idSpedizione: string,
    datiSpedizione: any
  ): Promise<OperationResult> {
    const supabase = createSupabaseClient();
    
    try {
      // 1. Fetch stato corrente
      const { data: spedizione, error: fetchError } = await supabase
        .from('spedizioni')
        .select('*')
        .eq('id', idSpedizione)
        .single();

      if (fetchError || !spedizione) {
        return { success: false, error: 'Spedizione non trovata' };
      }

      // 2. Valida transizione FSM
      const currentStatus = spedizione.status as ShipmentStatus;
      const newStatus = transitionShipmentStatus(
        currentStatus,
        ShipmentEvents.PRENOTA
      );

      // 3. Chiama servizio corriere
      const prenotazione = await CorrieriService.prenota({
        mittente: spedizione.mittente,
        destinatario: spedizione.destinatario,
        colli: spedizione.colli || [],
        servizio: 'standard',
      });

      // 4. Aggiorna database con nuovo stato e dati prenotazione
      const { error: updateError } = await supabase
        .from('spedizioni')
        .update({
          status: newStatus as Database['public']['Enums']['shipment_status_enum'],
          tracking_number: prenotazione.trackingNumber,
          etichetta_url: prenotazione.etichettaUrl,
          costo_totale: prenotazione.costoTotale,
          data_ritiro: prenotazione.dataRitiroPrevista,
          data_consegna_prevista: prenotazione.dataConsegnaPrevista,
          updated_at: new Date().toISOString(),
        })
        .eq('id', idSpedizione);

      if (updateError) {
        // Tentare rollback con corriere se possibile
        await CorrieriService.cancella(prenotazione.trackingNumber);
        return { success: false, error: 'Errore aggiornamento database' };
      }

      return {
        success: true,
        data: prenotazione,
        newStatus,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Errore durante la prenotazione',
      };
    }
  }

  /**
   * Aggiorna lo stato di una spedizione con tracking
   */
  static async aggiornaTracking(
    idSpedizione: string,
    trackingNumber: string
  ): Promise<OperationResult> {
    const supabase = createSupabaseClient();
    
    try {
      // 1. Ottieni stato tracking dal corriere
      const tracking = await CorrieriService.getTracking(trackingNumber);
      
      // 2. Fetch stato corrente spedizione
      const { data: spedizione, error: fetchError } = await supabase
        .from('spedizioni')
        .select('status')
        .eq('id', idSpedizione)
        .single();

      if (fetchError || !spedizione) {
        return { success: false, error: 'Spedizione non trovata' };
      }

      const currentStatus = spedizione.status as ShipmentStatus;
      let newStatus: ShipmentStatus | null = null;
      let evento: typeof ShipmentEvents[keyof typeof ShipmentEvents] | null = null;

      // 3. Mappa stato tracking a evento FSM
      switch (tracking.stato) {
        case 'ritirata':
          if (currentStatus === ShipmentStates.INVIATA) {
            evento = ShipmentEvents.RITIRO_CORRIERE;
          }
          break;
        case 'consegnata':
          if (currentStatus === ShipmentStates.IN_TRANSITO) {
            evento = ShipmentEvents.CONFERMA_CONSEGNA;
          }
          break;
        case 'eccezione':
        case 'ritorno_mittente':
          if (currentStatus !== ShipmentStates.ECCEZIONE) {
            evento = ShipmentEvents.AGGIORNA_ECCEZIONE;
          }
          break;
      }

      // 4. Esegui transizione se necessaria
      if (evento) {
        newStatus = transitionShipmentStatus(currentStatus, evento);
        
        const updateData: any = {
          status: newStatus as Database['public']['Enums']['shipment_status_enum'],
          updated_at: new Date().toISOString(),
        };

        // Aggiungi data consegna effettiva se consegnata
        if (newStatus === ShipmentStates.CONSEGNATA) {
          updateData.data_consegna_effettiva = tracking.ultimoAggiornamento;
        }

        const { error: updateError } = await supabase
          .from('spedizioni')
          .update(updateData)
          .eq('id', idSpedizione);

        if (updateError) {
          return { success: false, error: 'Errore aggiornamento stato' };
        }
      }

      return {
        success: true,
        data: tracking,
        newStatus: newStatus || currentStatus,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Errore durante aggiornamento tracking',
      };
    }
  }

  /**
   * Cancella una spedizione
   */
  static async cancella(idSpedizione: string): Promise<OperationResult> {
    const supabase = createSupabaseClient();
    
    try {
      // 1. Fetch spedizione corrente
      const { data: spedizione, error: fetchError } = await supabase
        .from('spedizioni')
        .select('status, tracking_number')
        .eq('id', idSpedizione)
        .single();

      if (fetchError || !spedizione) {
        return { success: false, error: 'Spedizione non trovata' };
      }

      // 2. Valida transizione FSM
      const currentStatus = spedizione.status as ShipmentStatus;
      const newStatus = transitionShipmentStatus(
        currentStatus,
        ShipmentEvents.CANCELLA
      );

      // 3. Se ha tracking, cancella con corriere
      if (spedizione.tracking_number) {
        const cancellato = await CorrieriService.cancella(spedizione.tracking_number);
        if (!cancellato) {
          return { 
            success: false, 
            error: 'Impossibile cancellare la spedizione con il corriere' 
          };
        }
      }

      // 4. Aggiorna stato in database
      const { error: updateError } = await supabase
        .from('spedizioni')
        .update({
          status: newStatus as Database['public']['Enums']['shipment_status_enum'],
          updated_at: new Date().toISOString(),
          note: `Cancellata il ${new Date().toLocaleDateString('it-IT')}`,
        })
        .eq('id', idSpedizione);

      if (updateError) {
        return { success: false, error: 'Errore cancellazione database' };
      }

      return {
        success: true,
        newStatus,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Errore durante la cancellazione',
      };
    }
  }

  /**
   * Risolvi un'eccezione e riporta la spedizione in transito
   */
  static async risolviEccezione(
    idSpedizione: string,
    note: string
  ): Promise<OperationResult> {
    const supabase = createSupabaseClient();
    
    try {
      // 1. Fetch stato corrente
      const { data: spedizione, error: fetchError } = await supabase
        .from('spedizioni')
        .select('status')
        .eq('id', idSpedizione)
        .single();

      if (fetchError || !spedizione) {
        return { success: false, error: 'Spedizione non trovata' };
      }

      // 2. Valida che sia in eccezione
      const currentStatus = spedizione.status as ShipmentStatus;
      if (currentStatus !== ShipmentStates.ECCEZIONE) {
        return {
          success: false,
          error: 'La spedizione non è in stato di eccezione',
        };
      }

      // 3. Transizione a IN_TRANSITO
      const newStatus = transitionShipmentStatus(
        currentStatus,
        ShipmentEvents.RISOLVI_ECCEZIONE
      );

      // 4. Aggiorna database
      const { error: updateError } = await supabase
        .from('spedizioni')
        .update({
          status: newStatus as Database['public']['Enums']['shipment_status_enum'],
          updated_at: new Date().toISOString(),
          note: `Eccezione risolta: ${note}`,
        })
        .eq('id', idSpedizione);

      if (updateError) {
        return { success: false, error: 'Errore risoluzione eccezione' };
      }

      return {
        success: true,
        newStatus,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Errore durante risoluzione eccezione',
      };
    }
  }

  /**
   * Verifica se una transizione è valida senza eseguirla
   */
  static canTransition(
    currentStatus: ShipmentStatus,
    event: typeof ShipmentEvents[keyof typeof ShipmentEvents]
  ): boolean {
    try {
      transitionShipmentStatus(currentStatus, event);
      return true;
    } catch {
      return false;
    }
  }
}