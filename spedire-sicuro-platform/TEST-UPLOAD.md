# 🧪 Test Upload Listino - Guida Debug

## ✅ File Aggiornato

Il file `/app/api/listini/upload/route.ts` è stato aggiornato con il nuovo codice semplificato.

## 🔄 Riavvio Server

Se il server non si è ricaricato automaticamente:

```powershell
# Nel terminale dove gira npm run dev:
# Premi CTRL+C per fermare
# Poi riavvia:
cd spedire-sicuro-platform
npm run dev
```

## 🧹 Svuota Cache Browser

1. Apri la pagina `/listini` nel browser
2. Premi `CTRL + SHIFT + R` (Windows) o `CMD + SHIFT + R` (Mac)
3. Questo forza il reload senza cache

## 📝 Test Manuale da Console Browser

Apri la console del browser (F12) e incolla questo codice:

```javascript
// Test upload listino
const formData = new FormData();
formData.append('fornitore', 'Speedgo');
formData.append('servizio', 'GLS BA');

// Seleziona il file dall'input
const fileInput = document.querySelector('input[type="file"]');
if (!fileInput || !fileInput.files[0]) {
  console.error('❌ Nessun file selezionato');
} else {
  const file = fileInput.files[0];
  formData.append('file', file);
  
  console.log('📤 Upload in corso...');
  console.log('File:', file.name);
  console.log('Dimensione:', file.size, 'bytes');
  
  fetch('/api/listini/upload', {
    method: 'POST',
    body: formData
  })
  .then(async r => {
    const text = await r.text();
    console.log('📥 Risposta raw:', text);
    try {
      const json = JSON.parse(text);
      console.log('✅ RISULTATO JSON:', json);
      return json;
    } catch (e) {
      console.error('❌ Errore parsing JSON:', e);
      console.error('Risposta non-JSON:', text.substring(0, 200));
      throw new Error('Risposta non è JSON valido');
    }
  })
  .then(d => {
    if (d.success) {
      console.log('🎉 SUCCESSO!', d);
      alert('✅ Listino caricato con successo!');
    } else {
      console.error('❌ Errore:', d.error);
      alert('❌ Errore: ' + d.error);
    }
  })
  .catch(e => {
    console.error('❌ ERRORE FETCH:', e);
    alert('❌ Errore: ' + e.message);
  });
}
```

## 📋 Formato CSV Richiesto

Crea un file CSV con questo formato:

```csv
peso_min;peso_max;italia;sardegna;sicilia;calabria
0;3;3.50;4.26;3.50;3.61
3;5;3.50;4.26;3.50;3.61
5;12;6.82;9.50;8.90;8.90
12;18;9.40;12.29;11.59;11.59
18;30;16.70;21.41;20.81;20.81
```

**Importante:**
- Separatore: `;` (punto e virgola)
- Prima riga: header con colonne
- Encoding: UTF-8
- Nome file: es. `listino-speedgo.csv`

## 🔍 Debug Checklist

- [ ] File `route.ts` aggiornato ✅
- [ ] Server riavviato (se necessario)
- [ ] Cache browser svuotata (CTRL+SHIFT+R)
- [ ] File CSV preparato con formato corretto
- [ ] Console browser aperta (F12)
- [ ] Test manuale eseguito
- [ ] Errori verificati in console

## 🐛 Problemi Comuni

### Errore: "Unexpected token '<'"
**Causa:** L'API restituisce HTML invece di JSON
**Soluzione:** 
- Verifica che il server sia in esecuzione
- Controlla che la route `/api/listini/upload` esista
- Riavvia il server

### Errore: "Parametri mancanti"
**Causa:** FormData non contiene tutti i campi
**Soluzione:**
- Verifica che fornitore, servizio e file siano tutti presenti
- Controlla il nome dei campi nel FormData

### Errore: "CSV deve contenere almeno: peso_min;peso_max"
**Causa:** Header CSV non corretti
**Soluzione:**
- Verifica che la prima riga del CSV contenga `peso_min` e `peso_max`
- Controlla che il separatore sia `;` (punto e virgola)

### Errore: "Errore database"
**Causa:** Problema con Supabase
**Soluzione:**
- Verifica `.env.local` con chiavi corrette
- Controlla che le tabelle siano create (esegui schema SQL)
- Verifica connessione a Supabase

## ✅ Test Completato

Dopo il test, verifica:
1. Listino appare in `/listini`
2. Status: "ATTIVO"
3. Nessun errore in console
4. Messaggio di successo

---

**Pronto per il test!** 🚀

