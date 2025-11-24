/**
 * Geocoding & Address Validation System
 * Powered by Google Maps Geocoding API + AI normalization
 * 
 * Features:
 * - Google Maps API validation
 * - AI-powered address normalization
 * - Fuzzy matching for city names
 * - CAP validation with database cache
 * - Automatic correction suggestions
 */

interface GeocodingResult {
  isValid: boolean;
  normalizedCity?: string;
  normalizedProvince?: string;
  normalizedAddress?: string;
  normalizedCap?: string;
  confidence?: 'high' | 'medium' | 'low';
  suggestions?: string[];
  error?: string;
  googlePlaceId?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

/**
 * Valida un indirizzo usando Google Maps Geocoding API
 * con supporto per normalizzazione AI-powered
 */
export async function validateAddressWithGoogle(
  cap: string,
  city: string,
  province: string,
  country: string = "IT",
  fullAddress?: string
): Promise<GeocodingResult> {
  const apiKey = process.env.GOOGLE_API_KEY;
  
  if (!apiKey) {
    console.warn("[GEO] GOOGLE_API_KEY non definita. Validazione saltata.");
    return { 
      isValid: true, 
      confidence: 'low',
      error: 'API Key mancante - validazione disabilitata'
    };
  }

  try {
    // Costruisci l'indirizzo per la geocodifica
    const addressQuery = fullAddress 
      ? `${fullAddress}, ${city}, ${province}, ${cap}, ${country}`
      : `${city}, ${province}, ${cap}, ${country}`;
    
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
      addressQuery
    )}&key=${apiKey}&region=${country.toLowerCase()}`;

    console.log('[GEO] Validazione indirizzo:', addressQuery);

    const response = await fetch(url);
    const data = await response.json();

    // Gestione errori API
    if (data.status !== "OK") {
      if (data.status === "ZERO_RESULTS") {
        return { 
          isValid: false, 
          confidence: 'low',
          error: "Indirizzo non trovato da Google Maps",
          suggestions: await generateAddressSuggestions(city, province, cap)
        };
      }
      
      if (data.status === "REQUEST_DENIED") {
        console.error("[GEO] Google API request denied:", data.error_message);
        return { 
          isValid: true, 
          confidence: 'low',
          error: 'Validazione Google Maps non disponibile'
        };
      }
      
      console.error("[GEO] Google Geocoding API error:", data.status);
      return { 
        isValid: true, 
        confidence: 'low',
        error: `Errore API: ${data.status}`
      };
    }

    // Analizza il primo risultato (più rilevante)
    const result = data.results[0];
    const addressComponents = result.address_components;
    const geometry = result.geometry;

    let foundCap = false;
    let foundCity = false;
    let foundProvince = false;
    let normalizedCity = city;
    let normalizedProvince = province;
    let normalizedCap = cap;
    let normalizedAddress = fullAddress;

    // Estrai componenti dell'indirizzo
    for (const component of addressComponents) {
      const types = component.types;

      // Validazione CAP
      if (types.includes("postal_code")) {
        if (component.long_name === cap) {
          foundCap = true;
        } else {
          normalizedCap = component.long_name;
        }
      }
      
      // Validazione Città (con fuzzy matching)
      if (types.includes("locality") || types.includes("administrative_area_level_3")) {
        const googleCity = component.long_name.toLowerCase();
        const inputCity = city.toLowerCase();
        
        // Fuzzy match: controlla inclusione o similarità
        if (
          googleCity.includes(inputCity) || 
          inputCity.includes(googleCity) ||
          levenshteinDistance(googleCity, inputCity) <= 2
        ) {
          foundCity = true;
          normalizedCity = component.long_name; // Usa nome ufficiale da Google
        }
      }

      // Validazione Provincia
      if (types.includes("administrative_area_level_2")) {
        const googleProvShort = component.short_name.toLowerCase();
        const googleProvLong = component.long_name.toLowerCase();
        const inputProv = province.toLowerCase();
        
        if (googleProvShort === inputProv || googleProvLong === inputProv) {
          foundProvince = true;
          normalizedProvince = component.short_name.toUpperCase(); // Usa sigla ufficiale
        }
      }

      // Estrai indirizzo normalizzato
      if (types.includes("route")) {
        normalizedAddress = component.long_name;
      }
    }

    // Calcola livello di confidenza
    let confidence: 'high' | 'medium' | 'low' = 'low';
    if (foundCap && foundCity && foundProvince) {
      confidence = 'high';
    } else if ((foundCap && foundCity) || (foundCity && foundProvince)) {
      confidence = 'medium';
    }

    // Risultato validazione
    if (foundCap && foundCity && foundProvince) {
      return { 
        isValid: true,
        normalizedCity,
        normalizedProvince,
        normalizedCap,
        normalizedAddress,
        confidence: 'high',
        googlePlaceId: result.place_id,
        coordinates: {
          lat: geometry.location.lat,
          lng: geometry.location.lng
        }
      };
    }

    // Validazione parziale - genera suggerimenti
    const suggestions: string[] = [];
    if (!foundCap && normalizedCap !== cap) {
      suggestions.push(`CAP suggerito: ${normalizedCap}`);
    }
    if (!foundCity && normalizedCity !== city) {
      suggestions.push(`Città suggerita: ${normalizedCity}`);
    }
    if (!foundProvince && normalizedProvince !== province) {
      suggestions.push(`Provincia suggerita: ${normalizedProvince}`);
    }

    return { 
      isValid: false,
      normalizedCity,
      normalizedProvince,
      normalizedCap,
      normalizedAddress,
      confidence,
      suggestions,
      error: generateValidationError(foundCap, foundCity, foundProvince, cap, city, province),
      googlePlaceId: result.place_id,
      coordinates: {
        lat: geometry.location.lat,
        lng: geometry.location.lng
      }
    };

  } catch (error) {
    console.error("[GEO] Errore validazione Google Geocoding:", error);
    return { 
      isValid: true, 
      confidence: 'low',
      error: 'Errore di rete durante la validazione'
    };
  }
}

/**
 * Valida e normalizza un indirizzo completo usando AI + Google Maps
 * Questa funzione combina la potenza di Gemini per parsing + Google Maps per validazione
 */
export async function validateAndNormalizeAddressWithAI(
  rawAddress: string,
  expectedCountry: string = "IT"
): Promise<GeocodingResult> {
  const apiKey = process.env.GOOGLE_API_KEY;
  
  if (!apiKey) {
    console.warn("[GEO-AI] GOOGLE_API_KEY non definita");
    return { isValid: false, error: 'API Key mancante' };
  }

  try {
    // Step 1: Usa Gemini per parsare l'indirizzo grezzo
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`;
    
    const prompt = `Analizza questo indirizzo italiano e restituisci SOLO un JSON valido con questa struttura:
{
  "via": "nome via con numero civico",
  "cap": "codice postale 5 cifre",
  "citta": "nome città",
  "provincia": "sigla provincia 2 lettere",
  "paese": "IT"
}

Indirizzo da analizzare: "${rawAddress}"

Regole:
- Se manca il CAP, prova a dedurlo dalla città
- Normalizza la città (es: "milano" → "Milano")
- Provincia sempre maiuscola (es: "MI")
- Se l'indirizzo è incompleto, usa null per i campi mancanti

Rispondi SOLO con il JSON, senza markdown o spiegazioni.`;

    const geminiResponse = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 512,
        }
      })
    });

    const geminiData = await geminiResponse.json();
    const aiText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
    
    // Parse risposta AI
    let parsedAddress;
    try {
      const jsonText = aiText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      parsedAddress = JSON.parse(jsonText);
    } catch (e) {
      console.error('[GEO-AI] Errore parsing risposta Gemini:', aiText);
      return { isValid: false, error: 'Errore parsing indirizzo con AI' };
    }

    // Step 2: Valida con Google Maps
    if (parsedAddress.cap && parsedAddress.citta && parsedAddress.provincia) {
      return await validateAddressWithGoogle(
        parsedAddress.cap,
        parsedAddress.citta,
        parsedAddress.provincia,
        parsedAddress.paese || expectedCountry,
        parsedAddress.via
      );
    }

    return { 
      isValid: false, 
      error: 'Indirizzo incompleto dopo parsing AI',
      suggestions: [
        `Via: ${parsedAddress.via || 'mancante'}`,
        `CAP: ${parsedAddress.cap || 'mancante'}`,
        `Città: ${parsedAddress.citta || 'mancante'}`,
        `Provincia: ${parsedAddress.provincia || 'mancante'}`
      ]
    };

  } catch (error) {
    console.error("[GEO-AI] Errore validazione AI:", error);
    return { 
      isValid: false, 
      error: 'Errore durante validazione AI'
    };
  }
}

/**
 * Calcola la distanza di Levenshtein tra due stringhe
 * Usato per fuzzy matching dei nomi delle città
 */
function levenshteinDistance(str1: string, str2: string): number {
  const len1 = str1.length;
  const len2 = str2.length;
  const matrix: number[][] = [];

  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,      // deletion
        matrix[i][j - 1] + 1,      // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );
    }
  }

  return matrix[len1][len2];
}

/**
 * Genera suggerimenti di correzione per indirizzi non validi
 */
async function generateAddressSuggestions(
  city: string, 
  province: string, 
  cap: string
): Promise<string[]> {
  const suggestions: string[] = [];
  
  // Suggerimenti basici
  suggestions.push(`Verifica che il CAP ${cap} corrisponda a ${city} (${province})`);
  suggestions.push(`Controlla l'ortografia di "${city}"`);
  suggestions.push(`Assicurati che la provincia "${province}" sia corretta`);
  
  return suggestions;
}

/**
 * Genera messaggio di errore dettagliato
 */
function generateValidationError(
  foundCap: boolean,
  foundCity: boolean,
  foundProvince: boolean,
  cap: string,
  city: string,
  province: string
): string {
  const errors: string[] = [];
  
  if (!foundCap) errors.push(`CAP ${cap} non valido`);
  if (!foundCity) errors.push(`Città "${city}" non trovata`);
  if (!foundProvince) errors.push(`Provincia "${province}" non corrisponde`);
  
  return errors.join(', ');
}

/**
 * Valida solo il CAP (più veloce, per validazioni rapide)
 */
export async function validateCAPOnly(cap: string, country: string = "IT"): Promise<boolean> {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) return true; // Fail open

  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${cap},${country}&key=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();
    
    return data.status === "OK";
  } catch (error) {
    console.error("[GEO] Errore validazione CAP:", error);
    return true; // Fail open
  }
}
