import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// 1. Configurazione Sicura (Supporta entrambi i nomi)
const API_KEY = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;

export async function POST(req: NextRequest) {
  try {
    // Check Preliminare
    if (!API_KEY) {
      console.error("❌ CRITICAL: Nessuna API Key Google trovata.");
      return NextResponse.json(
        { error: 'Configurazione Server Errata: API Key mancante' },
        { status: 500 }
      );
    }

    // 2. Parsing Request
    const formData = await req.formData();
    const file = formData.get('image') as File;

    if (!file) {
      return NextResponse.json({ error: 'Nessuna immagine caricata' }, { status: 400 });
    }

    // 3. Preparazione Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Image = buffer.toString('base64');

    // 4. Inizializzazione Gemini (Standard SDK)
    const genAI = new GoogleGenerativeAI(API_KEY);
    // Usa 'gemini-1.5-flash' per velocità/costi o 'gemini-1.5-pro' per precisione
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      Analizza questa etichetta di spedizione o documento logistico.
      Estrai ESATTAMENTE questi dati in formato JSON puro:
      {
        "mittente": { "nome": "", "indirizzo": "", "citta": "", "cap": "", "nazione": "" },
        "destinatario": { "nome": "", "indirizzo": "", "citta": "", "cap": "", "nazione": "", "telefono": "", "email": "" },
        "spedizione": { "peso_kg": 0, "dimensioni_cm": { "lunghezza": 0, "larghezza": 0, "altezza": 0 } }
      }
      Se un dato non è visibile, usa null o 0. NON aggiungere markdown. Solo il JSON puro senza blocchi di codice.
    `;

    // 5. Chiamata AI
    console.log("🚀 Avvio OCR con Gemini...");
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Image,
          mimeType: file.type || 'image/jpeg',
        },
      },
    ]);

  let text = result.response.text(); 
    
    // Pulizia Output (rimozione markdown se presente)
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();

    console.log("✅ OCR Completato. Parsing JSON...");
    const data = JSON.parse(text);

    return NextResponse.json({ success: true, data });

  } catch (error: any) {
    console.error("🔥 ERRORE OCR:", error);
    return NextResponse.json(
      { error: error.message || 'Errore interno durante l\'OCR' },
      { status: 500 }
    );
  }
}
