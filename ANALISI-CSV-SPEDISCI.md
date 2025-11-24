# Analisi Formato CSV Spedisci.online

## Data: 24 Novembre 2025

---

## 📋 Formato CSV Richiesto da Spedisci.online

### Header Obbligatori
```
destinatario;indirizzo;cap;localita;provincia;country;peso;colli;contrassegno;rif_mittente;rif_destinatario;note;telefono;email_destinatario;contenuto;order_id;totale_ordine;
```

### Esempio Riga Dati
```
Mario Rossi;"Via Roma, n 20";58100;Grosseto;GR;IT;1;1;25.5;Amazon;Mario Rossi;343555666;Fragile;mario.rossi@gmail.com;frame 20x20;21545-45454-5454;25.5
```

---

## 🔍 Analisi Campi

| Campo | Obbligatorio | Tipo | Esempio | Note |
|-------|--------------|------|---------|------|
| `destinatario` | ✅ Sì | String | "Mario Rossi" | Nome e cognome o ragione sociale |
| `indirizzo` | ✅ Sì | String | "Via Roma, n 20" | Indirizzo completo con numero civico |
| `cap` | ✅ Sì | String | "58100" | CAP a 5 cifre |
| `localita` | ✅ Sì | String | "Grosseto" | Città/Località |
| `provincia` | ✅ Sì | String | "GR" | Sigla provincia (2 lettere maiuscole) |
| `country` | ✅ Sì | String | "IT" | Codice ISO paese (2 lettere) |
| `peso` | ✅ Sì | Number | "1" | Peso in kg (numero intero o decimale) |
| `colli` | ✅ Sì | Number | "1" | Numero colli (intero) |
| `contrassegno` | ⚠️ Opzionale | Number | "25.5" | Importo contrassegno (decimale con punto) |
| `rif_mittente` | ⚠️ Opzionale | String | "Amazon" | Riferimento mittente |
| `rif_destinatario` | ⚠️ Opzionale | String | "Mario Rossi" | Riferimento destinatario |
| `note` | ⚠️ Opzionale | String | "343555666" | Note per corriere (spesso telefono) |
| `telefono` | ⚠️ Opzionale | String | "Fragile" | Telefono destinatario |
| `email_destinatario` | ⚠️ Opzionale | String | "mario.rossi@gmail.com" | Email destinatario |
| `contenuto` | ⚠️ Opzionale | String | "frame 20x20" | Descrizione contenuto |
| `order_id` | ⚠️ Opzionale | String | "21545-45454-5454" | ID ordine |
| `totale_ordine` | ⚠️ Opzionale | Number | "25.5" | Totale ordine (decimale con punto) |

---

## ⚠️ Problemi Identificati nel Codice Attuale

### 1. **Ordine Campi Errato**
**File:** `lib/adapters/spedisci-csv-adapter.ts`

**Problema:** L'ordine dei campi `note` e `telefono` è invertito rispetto al CSV di esempio.

**CSV Spedisci.online:**
```
...;rif_destinatario;note;telefono;email_destinatario;...
```

**Codice Attuale (ERRATO):**
```typescript
const rows = spedizioni.map(s => {
  return [
    // ...
    cleanString(s.rif_destinatario),  // Campo 11
    cleanString(s.note),              // Campo 12 ❌ ERRATO
    cleanString(s.telefono),          // Campo 13 ❌ ERRATO
    cleanString(s.email_destinatario),// Campo 14
    // ...
  ]
})
```

**Nel CSV di esempio:**
- Campo 12 = `343555666` (telefono)
- Campo 13 = `Fragile` (note)

**Ma nel codice:**
- Campo 12 = `note`
- Campo 13 = `telefono`

### 2. **Formato Numeri Decimali**
**Problema:** Il codice usa virgola (`,`) per i decimali, ma il CSV di esempio usa punto (`.`)

**CSV Esempio:**
```
...;25.5;...;25.5
```

**Codice Attuale:**
```typescript
const formatNumber = (num: number | string) => {
  if (!num) return '0'
  return String(num).replace('.', ',')  // ❌ Converte punto in virgola
}
```

**Risultato:** `25.5` diventa `25,5` (potrebbe causare problemi di import)

### 3. **Gestione Indirizzo con Virgolette**
**Osservazione:** Nel CSV di esempio, l'indirizzo è racchiuso tra virgolette:
```
"Via Roma, n 20"
```

**Motivo:** L'indirizzo contiene una virgola, quindi deve essere quotato per non rompere il separatore `;`

**Codice Attuale:** Non aggiunge virgolette agli indirizzi con virgole

---

## ✅ Correzioni da Implementare

### Correzione 1: Invertire Ordine `note` e `telefono`

**Prima:**
```typescript
return [
  // ...
  cleanString(s.rif_destinatario),  // 11
  cleanString(s.note),              // 12 ❌
  cleanString(s.telefono),          // 13 ❌
  cleanString(s.email_destinatario),// 14
  // ...
]
```

**Dopo:**
```typescript
return [
  // ...
  cleanString(s.rif_destinatario),  // 11
  cleanString(s.telefono),          // 12 ✅ CORRETTO
  cleanString(s.note),              // 13 ✅ CORRETTO
  cleanString(s.email_destinatario),// 14
  // ...
]
```

### Correzione 2: Usare Punto per Decimali

**Prima:**
```typescript
const formatNumber = (num: number | string) => {
  if (!num) return '0'
  return String(num).replace('.', ',')  // ❌
}
```

**Dopo:**
```typescript
const formatNumber = (num: number | string) => {
  if (!num) return '0'
  return String(num)  // ✅ Mantiene il punto
}
```

### Correzione 3: Aggiungere Virgolette ai Campi con Virgole

**Funzione Helper:**
```typescript
const escapeCSVField = (str: string) => {
  if (!str) return ''
  // Rimuovi punto e virgola, sostituisci con virgola
  const cleaned = str.replace(/;/g, ',').replace(/(\r\n|\n|\r)/gm, " ").trim()
  
  // Se contiene virgole, racchiudi tra virgolette
  if (cleaned.includes(',')) {
    return `"${cleaned.replace(/"/g, '""')}"` // Escape virgolette doppie
  }
  return cleaned
}
```

**Applicazione:**
```typescript
return [
  cleanString(s.destinatario),
  escapeCSVField(s.indirizzo),  // ✅ Usa escapeCSVField per indirizzo
  cleanString(s.cap),
  // ...
]
```

---

## 📊 Confronto Header

### Header CSV Spedisci.online (da file esempio)
```
destinatario;indirizzo;cap;localita;provincia;country;peso;colli;contrassegno;rif_mittente;rif_destinatario;note;telefono;email_destinatario;contenuto;order_id;totale_ordine;
```

### Header Codice Attuale
```typescript
const headers = [
  'destinatario',          // 1 ✅
  'indirizzo',             // 2 ✅
  'cap',                   // 3 ✅
  'localita',              // 4 ✅
  'provincia',             // 5 ✅
  'country',               // 6 ✅
  'peso',                  // 7 ✅
  'colli',                 // 8 ✅
  'contrassegno',          // 9 ✅
  'rif_mittente',          // 10 ✅
  'rif_destinatario',      // 11 ✅
  'note',                  // 12 ❌ Dovrebbe essere 'telefono'
  'telefono',              // 13 ❌ Dovrebbe essere 'note'
  'email_destinatario',    // 14 ✅
  'contenuto',             // 15 ✅
  'order_id',              // 16 ✅
  'totale_ordine',         // 17 ✅
]
```

**Conclusione:** Gli header sono corretti, ma l'ordine dei valori nelle righe è sbagliato!

---

## 🎯 Piano di Correzione

### Step 1: Correggere `spedisci-csv-adapter.ts`
- ✅ Invertire ordine `telefono` e `note` nelle righe
- ✅ Rimuovere conversione punto→virgola per numeri decimali
- ✅ Aggiungere funzione `escapeCSVField` per gestire virgole negli indirizzi
- ✅ Applicare `escapeCSVField` al campo `indirizzo`

### Step 2: Testare con Dati Reali
- ✅ Creare spedizione di test
- ✅ Generare CSV
- ✅ Verificare formato identico al CSV di esempio

### Step 3: Integrare con OCR
- ✅ Verificare che i dati estratti dall'OCR siano compatibili
- ✅ Testare flusso completo: OCR → Salva → Esporta CSV

### Step 4: Deploy
- ✅ Commit e push su GitHub
- ✅ Deploy automatico su Vercel
- ✅ Test finale su production

---

## 📝 Note Aggiuntive

### Separatore CSV
- **Separatore:** `;` (punto e virgola)
- **Encoding:** UTF-8
- **Line Ending:** `\n` (LF)

### Gestione Campi Vuoti
- Campi opzionali vuoti: lasciare vuoto tra i separatori
- Esempio: `Mario Rossi;Via Roma;00100;Roma;RM;IT;1;1;;;;;;`

### Formato Numeri
- **Decimali:** Punto (`.`) non virgola (`,`)
- **Esempio:** `25.5` non `25,5`

### Caratteri Speciali
- **Virgole negli indirizzi:** Racchiudere tra virgolette `"Via Roma, n 20"`
- **Virgolette nei testi:** Escape con doppia virgoletta `"Testo con ""virgolette"""`
- **Punto e virgola:** Sostituire con virgola o rimuovere

---

## ✅ Checklist Completamento

- [ ] Correggere ordine `telefono` e `note`
- [ ] Rimuovere conversione decimali
- [ ] Aggiungere `escapeCSVField`
- [ ] Testare generazione CSV
- [ ] Verificare compatibilità con spedisci.online
- [ ] Commit e deploy
- [ ] Test finale

---

**Prossimo Step:** Implementare le correzioni in `spedisci-csv-adapter.ts`
