// lib/shipment-workflow/shipment-fsm.test.ts

/**
 * Test suite per validare la logica FSM
 * Esegui con: npm test
 */

import {
  transitionShipmentStatus,
  ShipmentStates,
  ShipmentEvents,
  ShipmentStatus,
} from './shipment-fsm';

// Helper per test
function testTransition(
  from: ShipmentStatus,
  event: typeof ShipmentEvents[keyof typeof ShipmentEvents],
  expectedTo: ShipmentStatus | 'ERROR'
): boolean {
  try {
    const result = transitionShipmentStatus(from, event);
    if (expectedTo === 'ERROR') {
      console.error(`❌ Test fallito: Transizione ${from} -> ${event} dovrebbe fallire ma ha prodotto ${result}`);
      return false;
    }
    if (result !== expectedTo) {
      console.error(`❌ Test fallito: ${from} -> ${event} atteso ${expectedTo}, ottenuto ${result}`);
      return false;
    }
    console.log(`✅ Test passato: ${from} -> ${event} = ${result}`);
    return true;
  } catch (error) {
    if (expectedTo === 'ERROR') {
      console.log(`✅ Test passato: ${from} -> ${event} ha giustamente generato errore`);
      return true;
    }
    console.error(`❌ Test fallito: ${from} -> ${event} ha generato errore non atteso:`, error.message);
    return false;
  }
}

// Esegui test suite
export function runFSMTests() {
  console.log('🧪 Inizio test FSM per spedizioni\n');
  
  let testsPassed = 0;
  let totalTests = 0;

  // Test transizioni valide da BOZZA
  console.log('📝 Test stato BOZZA:');
  totalTests++;
  if (testTransition(ShipmentStates.BOZZA, ShipmentEvents.PRENOTA, ShipmentStates.INVIATA)) testsPassed++;
  totalTests++;
  if (testTransition(ShipmentStates.BOZZA, ShipmentEvents.CANCELLA, ShipmentStates.ANNULLATA)) testsPassed++;
  totalTests++;
  if (testTransition(ShipmentStates.BOZZA, ShipmentEvents.AGGIORNA_ECCEZIONE, ShipmentStates.ECCEZIONE)) testsPassed++;
  
  // Test transizioni invalide da BOZZA
  totalTests++;
  if (testTransition(ShipmentStates.BOZZA, ShipmentEvents.RITIRO_CORRIERE, 'ERROR')) testsPassed++;
  totalTests++;
  if (testTransition(ShipmentStates.BOZZA, ShipmentEvents.CONFERMA_CONSEGNA, 'ERROR')) testsPassed++;

  // Test transizioni valide da INVIATA
  console.log('\n📦 Test stato INVIATA:');
  totalTests++;
  if (testTransition(ShipmentStates.INVIATA, ShipmentEvents.RITIRO_CORRIERE, ShipmentStates.IN_TRANSITO)) testsPassed++;
  totalTests++;
  if (testTransition(ShipmentStates.INVIATA, ShipmentEvents.AGGIORNA_ECCEZIONE, ShipmentStates.ECCEZIONE)) testsPassed++;
  totalTests++;
  if (testTransition(ShipmentStates.INVIATA, ShipmentEvents.CANCELLA, ShipmentStates.ANNULLATA)) testsPassed++;
  
  // Test transizioni invalide da INVIATA
  totalTests++;
  if (testTransition(ShipmentStates.INVIATA, ShipmentEvents.PRENOTA, 'ERROR')) testsPassed++;
  totalTests++;
  if (testTransition(ShipmentStates.INVIATA, ShipmentEvents.CONFERMA_CONSEGNA, 'ERROR')) testsPassed++;

  // Test transizioni valide da IN_TRANSITO
  console.log('\n🚚 Test stato IN_TRANSITO:');
  totalTests++;
  if (testTransition(ShipmentStates.IN_TRANSITO, ShipmentEvents.CONFERMA_CONSEGNA, ShipmentStates.CONSEGNATA)) testsPassed++;
  totalTests++;
  if (testTransition(ShipmentStates.IN_TRANSITO, ShipmentEvents.AGGIORNA_ECCEZIONE, ShipmentStates.ECCEZIONE)) testsPassed++;
  
  // Test transizioni invalide da IN_TRANSITO
  totalTests++;
  if (testTransition(ShipmentStates.IN_TRANSITO, ShipmentEvents.CANCELLA, 'ERROR')) testsPassed++;
  totalTests++;
  if (testTransition(ShipmentStates.IN_TRANSITO, ShipmentEvents.PRENOTA, 'ERROR')) testsPassed++;

  // Test transizioni da ECCEZIONE
  console.log('\n⚠️ Test stato ECCEZIONE:');
  totalTests++;
  if (testTransition(ShipmentStates.ECCEZIONE, ShipmentEvents.RISOLVI_ECCEZIONE, ShipmentStates.IN_TRANSITO)) testsPassed++;
  totalTests++;
  if (testTransition(ShipmentStates.ECCEZIONE, ShipmentEvents.CANCELLA, ShipmentStates.ANNULLATA)) testsPassed++;
  
  // Test stati terminali (nessuna transizione permessa)
  console.log('\n🏁 Test stati terminali:');
  totalTests++;
  if (testTransition(ShipmentStates.CONSEGNATA, ShipmentEvents.CANCELLA, 'ERROR')) testsPassed++;
  totalTests++;
  if (testTransition(ShipmentStates.CONSEGNATA, ShipmentEvents.PRENOTA, 'ERROR')) testsPassed++;
  totalTests++;
  if (testTransition(ShipmentStates.ANNULLATA, ShipmentEvents.PRENOTA, 'ERROR')) testsPassed++;
  totalTests++;
  if (testTransition(ShipmentStates.ANNULLATA, ShipmentEvents.RITIRO_CORRIERE, 'ERROR')) testsPassed++;

  // Report finale
  console.log('\n' + '='.repeat(50));
  console.log(`📊 REPORT FINALE: ${testsPassed}/${totalTests} test passati`);
  
  if (testsPassed === totalTests) {
    console.log('🎉 TUTTI I TEST PASSATI! FSM funziona correttamente.');
  } else {
    console.log(`⚠️ ${totalTests - testsPassed} test falliti. Verificare la logica FSM.`);
  }
  console.log('='.repeat(50));

  return testsPassed === totalTests;
}

// Esegui i test se il file viene eseguito direttamente
if (require.main === module) {
  runFSMTests();
}