# 📸 Guida Creazione Immagine Test

## Metodo 1: Screenshot WhatsApp Reale

1. Apri WhatsApp
2. Trova una conversazione con un ordine/spedizione
3. Fai screenshot (Windows: `Win + Shift + S`)
4. Salva come `test-spedizione.jpg`
5. Carica su `/dashboard`

## Metodo 2: Crea Immagine Test con Paint/Photoshop

Crea un'immagine (800x600px) con questo testo:

```
═══════════════════════════════════
   ORDINE SPEDIZIONE
═══════════════════════════════════

Destinatario:
Mario Rossi

Indirizzo:
Via Roma, 20
58100 Grosseto (GR)

Telefono:
333 555 6666

Peso: 2kg
Colli: 1

Contrassegno: 25,50€

Contenuto:
Scarpe sportive nere taglia 42

Note:
Consegna entro le 18:00
```

## Metodo 3: Usa Tool Online

1. Vai su: https://www.canva.com o https://www.figma.com
2. Crea un'immagine 800x600px
3. Aggiungi il testo sopra
4. Esporta come JPG
5. Salva come `test-spedizione.jpg`

## Metodo 4: Genera con AI

Puoi anche chiedere a ChatGPT/DALL-E di creare un'immagine che simuli uno screenshot WhatsApp con un ordine di spedizione.

## ✅ Formato Immagine

- **Formato**: JPG o PNG
- **Dimensione**: Max 10MB
- **Risoluzione**: Minimo 400x300px
- **Contenuto**: Deve contenere almeno:
  - Nome destinatario
  - Indirizzo completo
  - CAP e città
  - Provincia (sigla 2 lettere)
  - Peso (opzionale, default 1kg)
  - Contrassegno (opzionale)

## 🎯 Test OCR

Dopo aver creato l'immagine:

1. Vai su http://localhost:3000/dashboard
2. Trascina l'immagine nell'area upload
3. Attendi elaborazione (5-10 secondi)
4. Verifica che i dati siano estratti correttamente
5. Controlla la comparazione prezzi (se hai caricato listini)

---

**Nota:** L'OCR funziona meglio con immagini chiare e testo leggibile.

