# 🔄 Riavvio Server Next.js

## ✅ Server Attivo

Il server Next.js è già in esecuzione sulla porta 3000.

## 🔄 Se hai modificato .env.local

Se hai appena modificato il file `.env.local`, **riavvia il server** per caricare le nuove variabili ambiente:

### Metodo 1: Dal terminale dove gira il server

1. Vai al terminale dove hai eseguito `npm run dev`
2. Premi `CTRL + C` per fermare il server
3. Riavvia con:
   ```powershell
   npm run dev
   ```

### Metodo 2: Nuovo terminale

Se non trovi il terminale originale:

1. Apri un nuovo terminale PowerShell
2. Vai alla directory:
   ```powershell
   cd spedire-sicuro-platform
   ```
3. Ferma eventuali processi sulla porta 3000 (se necessario):
   ```powershell
   # Trova processo
   Get-NetTCPConnection -LocalPort 3000 | Select-Object -ExpandProperty OwningProcess
   
   # Ferma processo (sostituisci PID con il numero trovato)
   # Stop-Process -Id [PID] -Force
   ```
4. Avvia server:
   ```powershell
   npm run dev
   ```

## ✅ Verifica Server

Dopo il riavvio, verifica che funzioni:

1. **Test homepage:**
   ```
   http://localhost:3000
   ```

2. **Test API endpoint:**
   ```
   http://localhost:3000/api/listini/upload
   ```
   
   Dovresti vedere JSON con `supabase_configured: true`

3. **Test dashboard:**
   ```
   http://localhost:3000/dashboard
   ```

## 🐛 Se il server non parte

**Errore: "Port 3000 already in use"**
- Un altro processo usa la porta 3000
- Ferma il processo o usa una porta diversa: `npm run dev -- -p 3001`

**Errore: "Missing environment variables"**
- Verifica che `.env.local` esista e contenga tutte le chiavi
- Riavvia il server dopo aver modificato `.env.local`

**Errore: "Cannot find module"**
- Esegui: `npm install`
- Poi riavvia: `npm run dev`

## 📋 Checklist

- [ ] Server fermato (CTRL+C)
- [ ] File .env.local verificato e completo
- [ ] Server riavviato (npm run dev)
- [ ] Output mostra "✓ Ready in X.Xs"
- [ ] Test endpoint GET funziona
- [ ] supabase_configured: true

---

**Server pronto quando vedi:** `✓ Ready in X.Xs` 🚀

