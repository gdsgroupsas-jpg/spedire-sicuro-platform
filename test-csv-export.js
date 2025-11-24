/**
 * Script di Test per Validazione CSV Export
 * 
 * Questo script testa che il CSV generato sia compatibile con spedisci.online
 * 
 * Esegui con: node test-csv-export.js
 */

// Dati di test che simulano una spedizione
const testSpedizione = {
  destinatario: "Mario Rossi",
  indirizzo: "Via Roma, n 20",  // Nota: contiene virgola
  cap: "58100",
  localita: "Grosseto",
  provincia: "GR",
  country: "IT",
  peso: 1,
  colli: 1,
  contrassegno: 25.5,
  rif_mittente: "Amazon",
  rif_destinatario: "Mario Rossi",
  telefono: "343555666",
  note: "Fragile",
  email_destinatario: "mario.rossi@gmail.com",
  contenuto: "frame 20x20",
  order_id: "21545-45454-5454",
  totale_ordine: 25.5
};

// Funzione per generare CSV (copia della logica TypeScript)
function generateSpedisciCSV(spedizioni) {
  const headers = [
    'destinatario',
    'indirizzo',
    'cap',
    'localita',
    'provincia',
    'country',
    'peso',
    'colli',
    'contrassegno',
    'rif_mittente',
    'rif_destinatario',
    'telefono',
    'note',
    'email_destinatario',
    'contenuto',
    'order_id',
    'totale_ordine',
  ];

  const formatNumber = (num) => {
    if (!num) return '0';
    return String(num);
  };

  const cleanString = (str) => {
    if (!str) return '';
    return str.replace(/;/g, ',').replace(/(\r\n|\n|\r)/gm, " ").trim();
  };

  const escapeCSVField = (str) => {
    if (!str) return '';
    const cleaned = str.replace(/;/g, ',').replace(/(\r\n|\n|\r)/gm, " ").trim();
    
    if (cleaned.includes(',')) {
      return `"${cleaned.replace(/"/g, '""')}"`;
    }
    return cleaned;
  };

  const rows = spedizioni.map(s => {
    return [
      cleanString(s.destinatario),
      escapeCSVField(s.indirizzo),
      cleanString(s.cap),
      cleanString(s.localita),
      cleanString(s.provincia).toUpperCase(),
      s.country || 'IT',
      formatNumber(s.peso),
      s.colli || 1,
      formatNumber(s.contrassegno || 0),
      cleanString(s.rif_mittente || ''),
      cleanString(s.rif_destinatario || ''),
      cleanString(s.telefono || ''),
      escapeCSVField(s.note || ''),
      cleanString(s.email_destinatario || ''),
      cleanString(s.contenuto || ''),
      cleanString(s.order_id || ''),
      formatNumber(s.totale_ordine || s.contrassegno || 0),
    ];
  });

  const csvContent = [
    headers.join(';') + ';',
    ...rows.map(r => r.join(';'))
  ].join('\n');

  return csvContent;
}

// CSV Atteso da spedisci.online (dal file di esempio)
const expectedCSV = `destinatario;indirizzo;cap;localita;provincia;country;peso;colli;contrassegno;rif_mittente;rif_destinatario;telefono;note;email_destinatario;contenuto;order_id;totale_ordine;
Mario Rossi;"Via Roma, n 20";58100;Grosseto;GR;IT;1;1;25.5;Amazon;Mario Rossi;343555666;Fragile;mario.rossi@gmail.com;frame 20x20;21545-45454-5454;25.5`;

// Genera CSV di test
const generatedCSV = generateSpedisciCSV([testSpedizione]);

console.log('='.repeat(80));
console.log('TEST CSV EXPORT - VALIDAZIONE FORMATO SPEDISCI.ONLINE');
console.log('='.repeat(80));
console.log('');

console.log('📋 CSV ATTESO (da file esempio):');
console.log('-'.repeat(80));
console.log(expectedCSV);
console.log('');

console.log('📋 CSV GENERATO (dal codice):');
console.log('-'.repeat(80));
console.log(generatedCSV);
console.log('');

// Validazione
const expectedLines = expectedCSV.split('\n');
const generatedLines = generatedCSV.split('\n');

let allTestsPassed = true;

// Test 1: Numero di righe
console.log('🧪 TEST 1: Numero di righe');
if (expectedLines.length === generatedLines.length) {
  console.log('✅ PASS - Numero di righe corretto:', generatedLines.length);
} else {
  console.log('❌ FAIL - Numero di righe errato');
  console.log('   Atteso:', expectedLines.length);
  console.log('   Generato:', generatedLines.length);
  allTestsPassed = false;
}
console.log('');

// Test 2: Header
console.log('🧪 TEST 2: Header CSV');
if (expectedLines[0] === generatedLines[0]) {
  console.log('✅ PASS - Header corretto');
} else {
  console.log('❌ FAIL - Header non corrisponde');
  console.log('   Atteso:', expectedLines[0]);
  console.log('   Generato:', generatedLines[0]);
  allTestsPassed = false;
}
console.log('');

// Test 3: Dati riga
console.log('🧪 TEST 3: Dati riga spedizione');
if (expectedLines[1] === generatedLines[1]) {
  console.log('✅ PASS - Dati riga corretti');
} else {
  console.log('❌ FAIL - Dati riga non corrispondono');
  console.log('   Atteso:', expectedLines[1]);
  console.log('   Generato:', generatedLines[1]);
  
  // Analisi campo per campo
  const expectedFields = expectedLines[1].split(';');
  const generatedFields = generatedLines[1].split(';');
  
  console.log('');
  console.log('   Analisi campo per campo:');
  const fieldNames = [
    'destinatario', 'indirizzo', 'cap', 'localita', 'provincia', 'country',
    'peso', 'colli', 'contrassegno', 'rif_mittente', 'rif_destinatario',
    'telefono', 'note', 'email_destinatario', 'contenuto', 'order_id', 'totale_ordine'
  ];
  
  for (let i = 0; i < Math.max(expectedFields.length, generatedFields.length); i++) {
    const fieldName = fieldNames[i] || `campo_${i + 1}`;
    const expected = expectedFields[i] || '(mancante)';
    const generated = generatedFields[i] || '(mancante)';
    
    if (expected === generated) {
      console.log(`   ✅ ${fieldName}: "${generated}"`);
    } else {
      console.log(`   ❌ ${fieldName}:`);
      console.log(`      Atteso:   "${expected}"`);
      console.log(`      Generato: "${generated}"`);
    }
  }
  
  allTestsPassed = false;
}
console.log('');

// Test 4: Formato numeri decimali
console.log('🧪 TEST 4: Formato numeri decimali');
const hasCorrectDecimalFormat = generatedCSV.includes('25.5') && !generatedCSV.includes('25,5');
if (hasCorrectDecimalFormat) {
  console.log('✅ PASS - Formato decimali corretto (punto, non virgola)');
} else {
  console.log('❌ FAIL - Formato decimali errato');
  allTestsPassed = false;
}
console.log('');

// Test 5: Gestione virgole negli indirizzi
console.log('🧪 TEST 5: Gestione virgole negli indirizzi');
const hasQuotedAddress = generatedCSV.includes('"Via Roma, n 20"');
if (hasQuotedAddress) {
  console.log('✅ PASS - Indirizzo con virgola correttamente quotato');
} else {
  console.log('❌ FAIL - Indirizzo con virgola non quotato');
  allTestsPassed = false;
}
console.log('');

// Test 6: Ordine campi telefono/note
console.log('🧪 TEST 6: Ordine campi telefono/note');
const fields = generatedLines[1].split(';');
const telefonoIndex = 11; // Campo 12 (index 11)
const noteIndex = 12;     // Campo 13 (index 12)
const telefonoValue = fields[telefonoIndex];
const noteValue = fields[noteIndex];

if (telefonoValue === '343555666' && noteValue === 'Fragile') {
  console.log('✅ PASS - Ordine telefono/note corretto');
  console.log(`   Campo 12 (telefono): "${telefonoValue}"`);
  console.log(`   Campo 13 (note): "${noteValue}"`);
} else {
  console.log('❌ FAIL - Ordine telefono/note errato');
  console.log(`   Campo 12: "${telefonoValue}" (atteso: "343555666")`);
  console.log(`   Campo 13: "${noteValue}" (atteso: "Fragile")`);
  allTestsPassed = false;
}
console.log('');

// Risultato finale
console.log('='.repeat(80));
if (allTestsPassed) {
  console.log('✅ TUTTI I TEST SUPERATI!');
  console.log('');
  console.log('Il CSV generato è compatibile al 100% con spedisci.online');
  console.log('Puoi procedere con l\'import su https://www.spedisci.online');
} else {
  console.log('❌ ALCUNI TEST FALLITI');
  console.log('');
  console.log('Rivedi il codice in lib/adapters/spedisci-csv-adapter.ts');
}
console.log('='.repeat(80));

// Exit code
process.exit(allTestsPassed ? 0 : 1);
