const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

async function verify() {
  console.log('\x1b[33m%s\x1b[0m', '🔍 Avvio verifica configurazione Supabase...');

  // 1. Carica .env.local
  const envPath = path.join(__dirname, '..', '.env.local');
  let loaded = false;
  
  if (fs.existsSync(envPath)) {
    console.log('📄 File .env.local trovato.');
    const envConfig = fs.readFileSync(envPath, 'utf8');
    envConfig.split('\n').forEach(line => {
      const parts = line.split('=');
      if (parts.length >= 2) {
        const key = parts[0].trim();
        const value = parts.slice(1).join('=').trim().replace(/^["']|["']$/g, ''); // remove quotes
        if (key && value) {
          process.env[key] = value;
        }
      }
    });
    loaded = true;
  } else {
    console.log('\x1b[31m%s\x1b[0m', '❌ File .env.local NON trovato!');
    console.log('   Assicurati di crearlo nella root del progetto.');
  }

  // 2. Verifica Variabili
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    console.error('\x1b[31m%s\x1b[0m', '❌ ERRORE: Variabili d\'ambiente mancanti.');
    if (!url) console.error('   - NEXT_PUBLIC_SUPABASE_URL mancante');
    if (!key) console.error('   - NEXT_PUBLIC_SUPABASE_ANON_KEY mancante');
    process.exit(1);
  }

  console.log('✅ Variabili d\'ambiente presenti.');
  console.log(`   URL: ${url.substring(0, 20)}...`);

  // 3. Verifica Connessione
  console.log('📡 Tentativo di connessione...');
  try {
    const supabase = createClient(url, key);
    
    // Prova una query semplice che non richiede auth (o auth anonima)
    // Verifichiamo se possiamo connetterci (es. health check o query su tabella pubblica)
    // In mancanza di tabelle pubbliche note, proviamo getSession (check auth service)
    const { data, error } = await supabase.auth.getSession();
    
    if (error) throw error;

    console.log('\x1b[32m%s\x1b[0m', '✅ Connessione a Supabase riuscita!');
    console.log('   Auth Service risponde correttamente.');
    
  } catch (e) {
    console.error('\x1b[31m%s\x1b[0m', '❌ ERRORE CONNESSIONE:', e.message);
    console.error('   Verifica che le credenziali siano corrette e il progetto Supabase sia attivo.');
    process.exit(1);
  }
}

verify();
