import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GOOGLE_API_KEY;

if (!apiKey) {
  console.warn("GOOGLE_API_KEY mancante nelle variabili d'ambiente. Le funzionalità AI non funzioneranno.");
}

const genAI = new GoogleGenerativeAI(apiKey || "dummy_key");

// Modello ottimizzato per velocità e costi (Flash è GRATIS nel tier base)
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function analyzeImage(base64Image: string, prompt: string) {
  try {
    if (!apiKey) throw new Error("API Key mancante");

    // Rimuovi header data:image se presente
    const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "");
    
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: cleanBase64,
          mimeType: "image/jpeg",
        },
      },
    ]);
    return result.response.text();
  } catch (error) {
    console.error("Gemini Vision Error:", error);
    throw error;
  }
}

export async function chatWithAgent(context: string, userMessage: string) {
  try {
    if (!apiKey) return "Configurazione AI incompleta. Contatta l'amministratore.";

    const result = await model.generateContent(`
      Sei "Logistic AI", un assistente esperto di logistica per la piattaforma "Spedire Sicuro".
      Il tuo obiettivo è massimizzare il profitto dell'utente e ottimizzare le operazioni.
      
      CONTESTO ATTUALE UTENTE: ${context}
      
      Rispondi in modo diretto, professionale ma proattivo (stile CFO/CTO).
      Usa formattazione Markdown per tabelle o liste se serve.
      
      DOMANDA UTENTE: ${userMessage}
    `);
    return result.response.text();
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    return "Il Neural Core è momentaneamente offline. Riprova tra poco.";
  }
}
