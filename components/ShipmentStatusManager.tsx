// components/ShipmentStatusManager.tsx

'use client';

import React from 'react';
import { useShipmentFSM } from '@/hooks/useShipmentFSM';
import { ShipmentStatus } from '@/lib/shipment-workflow/shipment-fsm';

interface ShipmentStatusManagerProps {
  shipmentId: string;
  initialStatus: ShipmentStatus;
}

/**
 * Componente per gestire lo stato delle spedizioni con FSM
 * Mostra lo stato corrente e le azioni disponibili
 */
export function ShipmentStatusManager({
  shipmentId,
  initialStatus,
}: ShipmentStatusManagerProps) {
  const {
    currentStatus,
    availableActions,
    executeTransition,
    isLoading,
    error,
    getStatusColor,
    getStatusIcon,
    getStatusLabel,
  } = useShipmentFSM({
    initialStatus,
    shipmentId,
  });

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
      {/* Header con stato corrente */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Stato Spedizione</h2>
        <div className="flex items-center space-x-3">
          <span className="text-3xl">{getStatusIcon()}</span>
          <div>
            <p className="text-lg font-semibold">{getStatusLabel()}</p>
            <p className="text-sm text-gray-500">ID: {shipmentId}</p>
          </div>
          <div
            className={`ml-auto px-3 py-1 rounded-full text-white text-sm font-medium bg-${getStatusColor()}-500`}
          >
            {currentStatus.toUpperCase()}
          </div>
        </div>
      </div>

      {/* Divider */}
      <hr className="my-6 border-gray-200" />

      {/* Azioni disponibili */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold mb-3">Azioni Disponibili</h3>
        
        {availableActions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {availableActions.map((action) => (
              <button
                key={action.event}
                onClick={() => executeTransition(action.event)}
                disabled={isLoading}
                className={`
                  flex items-center justify-center space-x-2 px-4 py-3 rounded-lg
                  font-medium transition-all duration-200
                  ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}
                  ${
                    action.variant === 'destructive'
                      ? 'bg-red-500 text-white hover:bg-red-600'
                      : action.variant === 'outline'
                      ? 'bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-50'
                      : 'bg-blue-500 text-white hover:bg-blue-600'
                  }
                `}
              >
                <span className="text-xl">{action.icon}</span>
                <span>{action.label}</span>
                {isLoading && (
                  <svg
                    className="animate-spin h-5 w-5 ml-2"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                )}
              </button>
            ))}
          </div>
        ) : (
          <div className="bg-gray-100 rounded-lg p-4 text-center text-gray-600">
            <p>Nessuna azione disponibile per questo stato.</p>
            <p className="text-sm mt-2">
              La spedizione è in uno stato finale e non può essere modificata.
            </p>
          </div>
        )}
      </div>

      {/* Messaggi di errore */}
      {error && (
        <div className="mt-6 bg-red-50 border-l-4 border-red-400 p-4 rounded">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Errore durante l'operazione
              </h3>
              <p className="mt-1 text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Timeline degli stati (opzionale) */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <h3 className="text-lg font-semibold mb-4">Timeline Stati</h3>
        <div className="relative">
          <div className="absolute top-0 bottom-0 left-4 w-0.5 bg-gray-300"></div>
          {getTimelineSteps().map((step, index) => (
            <div key={step.state} className="relative flex items-center mb-6">
              <div
                className={`
                  absolute left-0 w-8 h-8 rounded-full flex items-center justify-center
                  ${
                    isStatePassed(step.state, currentStatus)
                      ? 'bg-green-500 text-white'
                      : step.state === currentStatus
                      ? 'bg-blue-500 text-white animate-pulse'
                      : 'bg-gray-300 text-gray-600'
                  }
                `}
              >
                {isStatePassed(step.state, currentStatus) ? '✓' : index + 1}
              </div>
              <div className="ml-12">
                <p
                  className={`
                    font-medium
                    ${
                      step.state === currentStatus
                        ? 'text-blue-600'
                        : isStatePassed(step.state, currentStatus)
                        ? 'text-gray-700'
                        : 'text-gray-400'
                    }
                  `}
                >
                  {step.label}
                </p>
                <p className="text-sm text-gray-500">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Helper functions
  function getTimelineSteps() {
    return [
      {
        state: 'bozza',
        label: 'Bozza',
        description: 'Creazione e inserimento dati spedizione',
      },
      {
        state: 'inviata',
        label: 'Inviata',
        description: 'Spedizione prenotata e etichetta generata',
      },
      {
        state: 'in_transito',
        label: 'In Transito',
        description: 'Pacco ritirato e in viaggio',
      },
      {
        state: 'consegnata',
        label: 'Consegnata',
        description: 'Consegna completata con successo',
      },
    ];
  }

  function isStatePassed(state: string, current: string): boolean {
    const stateOrder = ['bozza', 'inviata', 'in_transito', 'consegnata'];
    const stateIndex = stateOrder.indexOf(state);
    const currentIndex = stateOrder.indexOf(current);
    return stateIndex < currentIndex;
  }
}