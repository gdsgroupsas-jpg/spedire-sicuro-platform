// lib/services/corrieri-service.ts

/**
 * Servizio per l'integrazione con i corrieri
 * SCALABILITÀ: Centralizza tutte le integrazioni esterne
 */

interface DatiSpedizione {
  mittente: {
    nome: string;
    indirizzo: string;
    citta: string;
    provincia: string;
    cap: string;
    paese: string;
    telefono?: string;
    email?: string;
  };
  destinatario: {
    nome: string;
    indirizzo: string;
    citta: string;
    provincia: string;
    cap: string;
    paese: string;
    telefono?: string;
    email?: string;
  };
  colli: Array<{
    peso: number;
    lunghezza: number;
    larghezza: number;
    altezza: number;
    valore?: number;
  }>;
  servizio: 'standard' | 'express' | 'priority';
}

interface RispostaPrenotazione {
  trackingNumber: string;
  etichettaUrl: string;
  costoTotale: number;
  dataRitiroPrevista: string;
  dataConsegnaPrevista: string;
}

export class CorrieriService {
  /**
   * Prenota una spedizione con il corriere
   * @param datiSpedizione I dati completi della spedizione
   * @returns I dettagli della prenotazione confermata
   */
  static async prenota(datiSpedizione: DatiSpedizione): Promise<RispostaPrenotazione> {
    // SIMULAZIONE: In produzione, qui ci sarebbe la chiamata API al corriere
    console.log('🚚 Prenotazione spedizione in corso...', datiSpedizione);
    
    // Simula un ritardo per l'API esterna
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Genera dati simulati
    const trackingNumber = `IT${Date.now()}${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    const dataRitiro = new Date();
    dataRitiro.setDate(dataRitiro.getDate() + 1);
    const dataConsegna = new Date();
    dataConsegna.setDate(dataConsegna.getDate() + 3);
    
    return {
      trackingNumber,
      etichettaUrl: `https://etichette.corriere.it/${trackingNumber}.pdf`,
      costoTotale: this.calcolaCosto(datiSpedizione),
      dataRitiroPrevista: dataRitiro.toISOString(),
      dataConsegnaPrevista: dataConsegna.toISOString(),
    };
  }

  /**
   * Cancella una prenotazione esistente
   * @param trackingNumber Il numero di tracking della spedizione
   * @returns true se la cancellazione è riuscita
   */
  static async cancella(trackingNumber: string): Promise<boolean> {
    console.log('❌ Cancellazione spedizione:', trackingNumber);
    
    // SIMULAZIONE: In produzione, chiamata API per cancellare
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Simula successo/fallimento (90% successo)
    return Math.random() > 0.1;
  }

  /**
   * Ottieni lo stato di tracking aggiornato
   * @param trackingNumber Il numero di tracking
   * @returns Lo stato attuale della spedizione
   */
  static async getTracking(trackingNumber: string): Promise<{
    stato: string;
    ultimoAggiornamento: string;
    posizione?: string;
  }> {
    console.log('📍 Richiesta tracking:', trackingNumber);
    
    // SIMULAZIONE: In produzione, chiamata API per tracking
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const stati = ['ritirata', 'in_transito', 'hub_smistamento', 'in_consegna', 'consegnata'];
    const statoRandom = stati[Math.floor(Math.random() * stati.length)];
    
    return {
      stato: statoRandom,
      ultimoAggiornamento: new Date().toISOString(),
      posizione: statoRandom === 'in_transito' ? 'Milano Hub' : undefined,
    };
  }

  /**
   * Calcola il costo della spedizione
   * @param datiSpedizione I dati della spedizione
   * @returns Il costo totale in euro
   */
  private static calcolaCosto(datiSpedizione: DatiSpedizione): number {
    let costoBase = 8.50;
    
    // Calcola peso volumetrico totale
    const pesoTotale = datiSpedizione.colli.reduce((acc, collo) => {
      const pesoVolumetrico = (collo.lunghezza * collo.larghezza * collo.altezza) / 5000;
      return acc + Math.max(collo.peso, pesoVolumetrico);
    }, 0);
    
    // Aggiungi costo per peso
    costoBase += pesoTotale * 0.5;
    
    // Aggiungi costo per servizio
    switch (datiSpedizione.servizio) {
      case 'express':
        costoBase *= 1.5;
        break;
      case 'priority':
        costoBase *= 2;
        break;
    }
    
    // Arrotonda a 2 decimali
    return Math.round(costoBase * 100) / 100;
  }
}