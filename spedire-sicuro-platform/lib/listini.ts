/**
 * Helpers legacy components still rely on to map province → zone and peso → fascia.
 * Pricing logic now lives in Supabase listini + compare-prices utilities.
 */

export function getZona(provincia: string): string {
  const scs = ['CA', 'NU', 'SS', 'OR', 'SU', 'RC', 'CS', 'CZ', 'KR', 'VV'] // Sardegna + Calabria
  const sicilia = ['AG', 'CL', 'CT', 'EN', 'ME', 'PA', 'RG', 'SR', 'TP']
  const campania = ['NA', 'SA', 'AV', 'CE', 'BN']
  const lazio = ['RM', 'LT', 'FR', 'VT', 'RI']
  
  if (scs.includes(provincia)) return 'scs'
  if (sicilia.includes(provincia)) return 'sicilia'
  if (campania.includes(provincia)) return 'campania'
  if (lazio.includes(provincia)) return 'lazio'
  if (provincia === 'CA' || provincia === 'NU' || provincia === 'SS' || provincia === 'OR') return 'sardegna'
  if (provincia === 'RC' || provincia === 'CS' || provincia === 'CZ' || provincia === 'KR' || provincia === 'VV') return 'calabria'
  
  return 'italia'
}

// Fascia peso
export function getFasciaPeso(peso: number, listino: string): string {
  if (listino === 'speedgo_gls_ba') {
    if (peso <= 3) return '0-3'
    if (peso <= 5) return '3-5'
    if (peso <= 12) return '5-12'
    if (peso <= 18) return '12-18'
    return '18-30'
  }
  
  if (listino === 'speedgo_sda' || listino === 'prime_pd1' || listino === 'prime_campania') {
    if (peso <= 2) return '0-2'
    if (peso <= 5) return '2-5'
    if (peso <= 10) return '5-10'
    if (peso <= 20) return '10-20'
    if (peso <= 30) return '20-30'
    if (peso <= 50) return '30-50'
    if (peso <= 70) return '50-70'
    return '70-100'
  }
  return '0-2'
}
