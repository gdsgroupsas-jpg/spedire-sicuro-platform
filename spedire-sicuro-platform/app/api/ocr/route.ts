import { NextRequest, NextResponse } from 'next/server';

// **NOTA:** La logica di chiamata all'AI Esterna (Claude/Gemini)
// è complessa (base64, gestione token) ed è simulata qui per focus sul workflow.
async function callExternalAI(imageBuffer: Buffer): Promise<any> {
    // Esempio fittizio di dati estratti dall'AI (JSON PURE)
    // In produzione, qui ci sarebbe la logica di chiamata ad Anthropic/Gemini.
    console.log("Simulazione: Estrazione dati con AI...");
    
    // Ritardiamo per simulare latenza
    await new Promise(resolve => setTimeout(resolve, 1500));

    return [
        {
            "destinatario": "Mario Rossi",
            "indirizzo": "Via Roma 123",
            "cap": "80100",
            "localita": "Napoli",
            "provincia": "NA",
            "telefono": "3331234567",
            "contrassegno": "49.90",
            "peso": 1.0, // Aggiungiamo il peso per il calcolo del prezzo
            "contenuto": "Merce varia",
            "colli": 1,
            "country": "IT"
        }
        // ... altre spedizioni estratte
    ];
}

export async function POST(req: NextRequest) {
    try {
        // 1. Gestione File Upload
        // Supporta sia FormData che JSON per flessibilità
        let buffer: Buffer;

        const contentType = req.headers.get('content-type') || '';
        if (contentType.includes('multipart/form-data')) {
             const formData = await req.formData();
             const file = formData.get('file') || formData.get('image'); // Supporta entrambi i nomi
             
             if (!file || !(file instanceof File)) {
                 return NextResponse.json({ error: 'Nessun file di immagine trovato.' }, { status: 400 });
             }
             buffer = Buffer.from(await file.arrayBuffer());
        } else if (contentType.includes('application/json')) {
             const body = await req.json();
             if (!body.image) {
                 return NextResponse.json({ error: 'Nessuna immagine trovata nel JSON.' }, { status: 400 });
             }
             // Gestione base64
             const base64Data = body.image.replace(/^data:image\/\w+;base64,/, '');
             buffer = Buffer.from(base64Data, 'base64');
        } else {
            return NextResponse.json({ error: 'Content-Type non supportato.' }, { status: 400 });
        }

        // 2. Chiamata Estrazione AI (Simulata)
        const extractedShipments = await callExternalAI(buffer);

        if (!extractedShipments || extractedShipments.length === 0) {
            return NextResponse.json({ error: 'No_shipping_data', details: 'AI non ha estratto spedizioni valide.' }, { status: 400 });
        }

        // 3. Chiamata Logica di Profitto (API Locale)
        // Usiamo un fetch interno al Route Handler per chiamare la nostra API locale /api/compare
        // Questo sposta il calcolo deterministico dal costoso LLM.
        const internalCompareUrl = new URL('/api/compare', req.url).toString();
        
        console.log(`[OCR] Calling internal price API: ${internalCompareUrl}`);

        const priceResponse = await fetch(internalCompareUrl, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                // Propaga i cookie per l'autenticazione se necessario
                'Cookie': req.headers.get('cookie') || ''
            },
            body: JSON.stringify(extractedShipments),
        });

        if (!priceResponse.ok) {
            const errorBody = await priceResponse.json();
            console.error("[OCR] Error from /api/compare:", errorBody);
            return NextResponse.json({ error: 'Errore nel calcolo prezzi', details: errorBody.error }, { status: 500 });
        }

        const finalShipments = await priceResponse.json();

        // 4. Risposta Finale con i dati estratti e i margini di profitto
        return NextResponse.json({ 
            success: true, 
            data: finalShipments 
        });

    } catch (error: any) {
        console.error("Errore fatale nella pipeline OCR:", error);
        return NextResponse.json({ error: 'Errore interno del server durante l\'elaborazione dell\'immagine.', details: error.message }, { status: 500 });
    }
}
