/**
 * 💻 DEFINIZIONE FINITE STATE MACHINE (FSM) PER LA SCALABILITÀ
 * Stato di Lavoro: Gestisce tutte le transizioni legali per una spedizione.
 * - Garantisce Type Safety e centralizza la logica di business.
 */

export const ShipmentStates = {
  BOZZA: 'bozza', // Inserimento dati, non pagata o confermata
  INVIATA: 'inviata', // Prenotata, etichetta generata (o in attesa)
  IN_TRANSITO: 'in_transito', // Ritirata dal corriere o in viaggio
  ECCEZIONE: 'eccezione', // Stato di errore logistico (Indirizzo errato, Ritorno al mittente, Fermo doganale)
  CONSEGNATA: 'consegnata', // Prova di consegna completata
  ANNULLATA: 'annullata', // Spedizione cancellata
} as const;

export type ShipmentStatus = typeof ShipmentStates[keyof typeof ShipmentStates];

// Definisce gli "Eventi" (le Azioni) che causano un cambiamento di stato
export const ShipmentEvents = {
  PRENOTA: 'PRENOTA', // Da BOZZA
  RITIRO_CORRIERE: 'RITIRO_CORRIERE', // Da INVIATA
  AGGIORNA_ECCEZIONE: 'AGGIORNA_ECCEZIONE', // Da INVIATA, IN_TRANSITO, BOZZA
  RISOLVI_ECCEZIONE: 'RISOLVI_ECCEZIONE', // Da ECCEZIONE
  CONFERMA_CONSEGNA: 'CONFERMA_CONSEGNA', // Da IN_TRANSITO
  CANCELLA: 'CANCELLA', // Da BOZZA, INVIATA, ECCEZIONE
} as const;

export type ShipmentEvent = typeof ShipmentEvents[keyof typeof ShipmentEvents];

// Mappa delle transizioni legali: Stato Corrente -> Evento -> Nuovo Stato
export const ShipmentFSM: Record<ShipmentStatus, Partial<Record<ShipmentEvent, ShipmentStatus>>> = {
  [ShipmentStates.BOZZA]: {
    [ShipmentEvents.PRENOTA]: ShipmentStates.INVIATA,
    [ShipmentEvents.CANCELLA]: ShipmentStates.ANNULLATA,
    [ShipmentEvents.AGGIORNA_ECCEZIONE]: ShipmentStates.ECCEZIONE, 
  },
  [ShipmentStates.INVIATA]: {
    [ShipmentEvents.RITIRO_CORRIERE]: ShipmentStates.IN_TRANSITO,
    [ShipmentEvents.AGGIORNA_ECCEZIONE]: ShipmentStates.ECCEZIONE,
    [ShipmentEvents.CANCELLA]: ShipmentStates.ANNULLATA,
  },
  [ShipmentStates.IN_TRANSITO]: {
    [ShipmentEvents.CONFERMA_CONSEGNA]: ShipmentStates.CONSEGNATA,
    [ShipmentEvents.AGGIORNA_ECCEZIONE]: ShipmentStates.ECCEZIONE,
  },
  [ShipmentStates.ECCEZIONE]: {
    [ShipmentEvents.RISOLVI_ECCEZIONE]: ShipmentStates.IN_TRANSITO,
    [ShipmentEvents.CANCELLA]: ShipmentStates.ANNULLATA,
  },
  // Stati terminali: nessuna transizione legale definita (implica null/undefined)
  [ShipmentStates.CONSEGNATA]: {},
  [ShipmentStates.ANNULLATA]: {},
};

/**
 * Funzione d'Elite: Esegue la transizione di stato FSM.
 * @param currentStatus Lo stato attuale della spedizione.
 * @param event L'evento che si è verificato.
 * @returns Il nuovo stato se la transizione è legale.
 * @throws {Error} Se la transizione è illegale (RED ALERT).
 */
export function transitionShipmentStatus(
  currentStatus: ShipmentStatus,
  event: ShipmentEvent
): ShipmentStatus {
  // 1. Verifica che lo stato iniziale sia gestito
  const currentTransitions = ShipmentFSM[currentStatus];
  if (!currentTransitions) {
    // Questo non dovrebbe mai accadere con i tipi corretti, ma è una difesa.
    throw new Error(`RED ALERT: Stato non gestito FSM: ${currentStatus}`);
  }

  // 2. Tenta la transizione
  const nextStatus = currentTransitions[event];

  // 3. Verifica la legalità della transizione (Zero errori logici)
  if (!nextStatus) {
    throw new Error(
      `RED ALERT: Transizione illegale non permessa: da ${currentStatus} con evento ${event}. Logica di business violata.`
    );
  }

  return nextStatus;
}
