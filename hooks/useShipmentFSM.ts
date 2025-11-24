// hooks/useShipmentFSM.ts

/**
 * Hook React per gestire la logica FSM nel frontend
 */

import { useState, useCallback, useMemo } from 'react';
import {
  ShipmentStatus,
  ShipmentEvents,
  ShipmentStates,
  transitionShipmentStatus,
} from '@/lib/shipment-workflow/shipment-fsm';
import { ShipmentOperations } from '@/lib/shipment-workflow/shipment-operations';

interface UseShipmentFSMProps {
  initialStatus: ShipmentStatus;
  shipmentId?: string;
}

interface UseShipmentFSMReturn {
  // Stato corrente
  currentStatus: ShipmentStatus;
  
  // Azioni disponibili basate sullo stato corrente
  availableActions: Array<{
    event: typeof ShipmentEvents[keyof typeof ShipmentEvents];
    label: string;
    icon: string;
    variant: 'default' | 'destructive' | 'outline';
  }>;
  
  // Funzioni per eseguire transizioni
  executeTransition: (event: typeof ShipmentEvents[keyof typeof ShipmentEvents]) => Promise<void>;
  
  // Stati UI
  isLoading: boolean;
  error: string | null;
  
  // Utility
  canExecute: (event: typeof ShipmentEvents[keyof typeof ShipmentEvents]) => boolean;
  getStatusColor: () => string;
  getStatusIcon: () => string;
  getStatusLabel: () => string;
}

export function useShipmentFSM({
  initialStatus,
  shipmentId,
}: UseShipmentFSMProps): UseShipmentFSMReturn {
  const [currentStatus, setCurrentStatus] = useState<ShipmentStatus>(initialStatus);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Determina le azioni disponibili basate sullo stato corrente
  const availableActions = useMemo(() => {
    const actions = [];

    switch (currentStatus) {
      case ShipmentStates.BOZZA:
        actions.push({
          event: ShipmentEvents.PRENOTA,
          label: 'Prenota Spedizione',
          icon: '📦',
          variant: 'default' as const,
        });
        actions.push({
          event: ShipmentEvents.CANCELLA,
          label: 'Cancella',
          icon: '❌',
          variant: 'destructive' as const,
        });
        break;

      case ShipmentStates.INVIATA:
        actions.push({
          event: ShipmentEvents.RITIRO_CORRIERE,
          label: 'Conferma Ritiro',
          icon: '🚚',
          variant: 'default' as const,
        });
        actions.push({
          event: ShipmentEvents.AGGIORNA_ECCEZIONE,
          label: 'Segnala Problema',
          icon: '⚠️',
          variant: 'outline' as const,
        });
        actions.push({
          event: ShipmentEvents.CANCELLA,
          label: 'Cancella',
          icon: '❌',
          variant: 'destructive' as const,
        });
        break;

      case ShipmentStates.IN_TRANSITO:
        actions.push({
          event: ShipmentEvents.CONFERMA_CONSEGNA,
          label: 'Conferma Consegna',
          icon: '✅',
          variant: 'default' as const,
        });
        actions.push({
          event: ShipmentEvents.AGGIORNA_ECCEZIONE,
          label: 'Segnala Problema',
          icon: '⚠️',
          variant: 'outline' as const,
        });
        break;

      case ShipmentStates.ECCEZIONE:
        actions.push({
          event: ShipmentEvents.RISOLVI_ECCEZIONE,
          label: 'Risolvi Problema',
          icon: '🔧',
          variant: 'default' as const,
        });
        actions.push({
          event: ShipmentEvents.CANCELLA,
          label: 'Cancella',
          icon: '❌',
          variant: 'destructive' as const,
        });
        break;

      // Stati terminali non hanno azioni
      case ShipmentStates.CONSEGNATA:
      case ShipmentStates.ANNULLATA:
      default:
        break;
    }

    return actions;
  }, [currentStatus]);

  // Verifica se una transizione è possibile
  const canExecute = useCallback(
    (event: typeof ShipmentEvents[keyof typeof ShipmentEvents]) => {
      return ShipmentOperations.canTransition(currentStatus, event);
    },
    [currentStatus]
  );

  // Esegue una transizione
  const executeTransition = useCallback(
    async (event: typeof ShipmentEvents[keyof typeof ShipmentEvents]) => {
      if (!canExecute(event)) {
        setError(`Transizione non valida: ${event} da stato ${currentStatus}`);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Se abbiamo un ID spedizione, esegui l'operazione sul backend
        if (shipmentId) {
          let result;
          
          switch (event) {
            case ShipmentEvents.PRENOTA:
              result = await ShipmentOperations.prenota(shipmentId, {});
              break;
            case ShipmentEvents.CANCELLA:
              result = await ShipmentOperations.cancella(shipmentId);
              break;
            case ShipmentEvents.RISOLVI_ECCEZIONE:
              result = await ShipmentOperations.risolviEccezione(
                shipmentId,
                'Problema risolto'
              );
              break;
            default:
              // Per altre transizioni, usa l'API generica
              const response = await fetch('/api/spedizioni/transizione', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ shipmentId, event }),
              });
              result = await response.json();
          }

          if (result?.success && result?.newStatus) {
            setCurrentStatus(result.newStatus);
          } else {
            throw new Error(result?.error || 'Errore durante la transizione');
          }
        } else {
          // Solo simulazione locale senza backend
          const newStatus = transitionShipmentStatus(currentStatus, event);
          setCurrentStatus(newStatus);
        }
      } catch (err: any) {
        setError(err.message || 'Errore durante la transizione');
        console.error('Errore transizione FSM:', err);
      } finally {
        setIsLoading(false);
      }
    },
    [currentStatus, shipmentId, canExecute]
  );

  // Utility per ottenere il colore dello stato
  const getStatusColor = useCallback(() => {
    switch (currentStatus) {
      case ShipmentStates.BOZZA:
        return 'gray';
      case ShipmentStates.INVIATA:
        return 'blue';
      case ShipmentStates.IN_TRANSITO:
        return 'orange';
      case ShipmentStates.ECCEZIONE:
        return 'red';
      case ShipmentStates.CONSEGNATA:
        return 'green';
      case ShipmentStates.ANNULLATA:
        return 'gray';
      default:
        return 'gray';
    }
  }, [currentStatus]);

  // Utility per ottenere l'icona dello stato
  const getStatusIcon = useCallback(() => {
    switch (currentStatus) {
      case ShipmentStates.BOZZA:
        return '📝';
      case ShipmentStates.INVIATA:
        return '📦';
      case ShipmentStates.IN_TRANSITO:
        return '🚚';
      case ShipmentStates.ECCEZIONE:
        return '⚠️';
      case ShipmentStates.CONSEGNATA:
        return '✅';
      case ShipmentStates.ANNULLATA:
        return '❌';
      default:
        return '❓';
    }
  }, [currentStatus]);

  // Utility per ottenere l'etichetta dello stato
  const getStatusLabel = useCallback(() => {
    switch (currentStatus) {
      case ShipmentStates.BOZZA:
        return 'Bozza';
      case ShipmentStates.INVIATA:
        return 'Inviata';
      case ShipmentStates.IN_TRANSITO:
        return 'In Transito';
      case ShipmentStates.ECCEZIONE:
        return 'Eccezione';
      case ShipmentStates.CONSEGNATA:
        return 'Consegnata';
      case ShipmentStates.ANNULLATA:
        return 'Annullata';
      default:
        return 'Sconosciuto';
    }
  }, [currentStatus]);

  return {
    currentStatus,
    availableActions,
    executeTransition,
    isLoading,
    error,
    canExecute,
    getStatusColor,
    getStatusIcon,
    getStatusLabel,
  };
}