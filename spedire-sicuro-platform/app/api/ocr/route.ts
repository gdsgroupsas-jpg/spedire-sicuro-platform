import { NextResponse } from 'next/server';
import { analyzeImage } from '@/lib/gemini';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    // Support both direct image property and nested structure from previous implementation
    const image = body.image || body.file;

    if (!image) {
      return NextResponse.json({ error: "Immagine mancante" }, { status: 400 });
    }

    const prompt = `
      Sei un esperto di logistica e data entry. 
      Analizza questa immagine (etichetta di spedizione o documento di trasporto).
      
      Estrai SOLO i seguenti dati in formato JSON valido (senza markdown):
      {
        "mittente": { "nome": "...", "indirizzo": "...", "citta": "...", "cap": "..." },
        "destinatario": "...",
        "indirizzo": "...",
        "localita": "...",
        "provincia": "...",
        "cap": "...",
        "telefono": "...",
        "email_destinatario": "...",
        "contenuto": "...",
        "peso": numero o null,
        "colli": numero o null,
        "contrassegno": "0.00",
        "note": "..."
      }
      
      Regole:
      1. Provincia deve essere 2 lettere maiuscole.
      2. Contrassegno deve essere stringa numerica con punto decimale.
      3. Se un dato non è leggibile, metti null o stringa vuota. Non inventare dati.
    `;

    const textResponse = await analyzeImage(image, prompt);
    
    // Pulizia del JSON response (Gemini a volte mette markdown ```json ... ```)
    const cleanedText = textResponse.replace(/```json|```/g, '').trim();
    let data;
    try {
        data = JSON.parse(cleanedText);
    } catch (e) {
        console.error("JSON Parse Error:", cleanedText);
        throw new Error("Errore nel parsing della risposta AI");
    }

    // Normalizzazione per compatibilità col resto del sistema
    // Il sistema si aspetta un oggetto piatto per il destinatario in molti casi, 
    // ma il prompt sopra chiede struttura mista. Adattiamo.
    
    // Chiamata interna per calcolo prezzi (come da Phase 2 precedente)
    const internalCompareUrl = new URL('/api/compare', req.url).toString();
    
    // Prepara payload per compare
    const comparePayload = {
        ...data,
        peso: data.peso || 1,
        provincia: data.provincia || 'NA', // Fallback
        contrassegno: data.contrassegno || '0.00'
    };

    // Se volessimo mantenere la logica di "Profit Logic" integrata:
    /*
    const priceResponse = await fetch(internalCompareUrl, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Cookie': req.headers.get('cookie') || ''
        },
        body: JSON.stringify([comparePayload]), // Array per batch support
    });

    if (priceResponse.ok) {
        const priceData = await priceResponse.json();
        // priceData è un array, prendiamo il primo
        const enrichedData = priceData[0];
        return NextResponse.json({ 
            success: true, 
            data: [enrichedData] // Il frontend si aspetta array in data? Verifica dashboard/ocr/page.tsx
            // dashboard/ocr/page.tsx usa result.data che è array di SpedizioneArricchita
        });
    }
    */
   
   // Per ora ritorniamo il dato estratto in un formato compatibile con l'API precedente
   // che arricchiva i dati internamente nel route handler OCR precedente?
   // Nel route precedente facevamo la chiamata interna. Facciamola anche qui per coerenza.
   
   try {
        const priceResponse = await fetch(internalCompareUrl, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Cookie': req.headers.get('cookie') || ''
            },
            body: JSON.stringify([comparePayload]),
        });
        
        if (priceResponse.ok) {
             const priceData = await priceResponse.json();
             return NextResponse.json({ success: true, data: priceData });
        }
   } catch (e) {
       console.warn("Internal price check failed", e);
   }

    return NextResponse.json({ success: true, data: [comparePayload] });

  } catch (error: any) {
    console.error("OCR Route Error:", error);
    return NextResponse.json(
      { error: "Errore durante l'elaborazione AI", details: String(error) }, 
      { status: 500 }
    );
  }
}
