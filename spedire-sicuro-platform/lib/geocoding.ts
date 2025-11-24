
interface GeocodingResult {
  isValid: boolean;
  normalizedCity?: string;
  normalizedProvince?: string;
  error?: string;
}

export async function validateAddressWithGoogle(
  cap: string,
  city: string,
  province: string,
  country: string = "IT"
): Promise<GeocodingResult> {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    console.warn("GOOGLE_API_KEY is not defined. Skipping Google Geocoding validation.");
    return { isValid: true }; // Fail open if API key is missing, or fail closed? Usually fail open for 3rd party deps unless strict.
  }

  try {
    const address = `${city}, ${province}, ${cap}, ${country}`;
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
      address
    )}&key=${apiKey}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== "OK") {
        if (data.status === "ZERO_RESULTS") {
             return { isValid: false, error: "Indirizzo non trovato da Google Maps" };
        }
        console.error("Google Geocoding API error:", data.status);
        return { isValid: true }; // Skip validation on API error
    }

    const result = data.results[0];
    const addressComponents = result.address_components;

    let foundCap = false;
    let foundCity = false; // loose match
    let foundProvince = false;

    // Iterate components to verify
    for (const component of addressComponents) {
      const types = component.types;

      if (types.includes("postal_code")) {
        if (component.long_name === cap) foundCap = true;
      }
      
      if (types.includes("locality") || types.includes("administrative_area_level_3")) {
         // Simple case-insensitive partial match or Levenshtein could be better, but let's start with inclusion
         if (component.long_name.toLowerCase().includes(city.toLowerCase()) || city.toLowerCase().includes(component.long_name.toLowerCase())) {
             foundCity = true;
         }
      }

      if (types.includes("administrative_area_level_2")) {
          // Province usually matches short_name (e.g. RM) or long_name (Roma)
          if (component.short_name.toLowerCase() === province.toLowerCase() || component.long_name.toLowerCase() === province.toLowerCase()) {
              foundProvince = true;
          }
      }
    }

    if (foundCap && foundCity && foundProvince) {
        return { isValid: true };
    }

    // If strict validation fails, return details
    if (!foundCap) return { isValid: false, error: `Il CAP ${cap} non corrisponde all'indirizzo geolocalizzato` };
    if (!foundCity) return { isValid: false, error: `La città ${city} non corrisponde al CAP ${cap}` };
    if (!foundProvince) return { isValid: false, error: `La provincia ${province} non corrisponde` };

    return { isValid: false, error: "Dati indirizzo incongruenti" };

  } catch (error) {
    console.error("Error validating with Google Geocoding:", error);
    return { isValid: true }; // Fail open
  }
}
