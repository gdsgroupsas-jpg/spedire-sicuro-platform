// Listini completi Speedgo e Spedizioni Prime

export const LISTINI = {
  speedgo_gls_ba: {
    name: 'GLS BA (Speedgo)',
    fuel: 0,
    rates: {
      '0-3': { italia: 3.50, sardegna: 4.26, sicilia: 3.50, calabria: 3.61 },
      '3-5': { italia: 3.50, sardegna: 4.26, sicilia: 3.50, calabria: 3.61 },
      '5-12': { italia: 6.82, sardegna: 9.50, sicilia: 8.90, calabria: 8.90 },
      '12-18': { italia: 9.40, sardegna: 12.29, sicilia: 11.59, calabria: 11.59 },
      '18-30': { italia: 16.70, sardegna: 21.41, sicilia: 20.81, calabria: 20.81 },
    },
    contrassegno: (amount: number) => {
      if (amount <= 100) return 1.56
      if (amount <= 499) return 1.56 + (amount * 0.03)
      if (amount <= 699) return 1.56 + (amount * 0.055)
      if (amount <= 999) return 1.56 + (amount * 0.08)
      return 1.56 + (amount * 0.10)
    },
    assicurazione: 3.28,
    tempiConsegna: '24-48h',
    affidabilita: 4.5
  },
  
  speedgo_sda: {
    name: 'SDA H24+ (Speedgo)',
    fuel: 0,
    rates: {
      '0-2': { italia: 3.61, sardegna: 5.30, calabria: 5.30, sicilia: 5.30, disagiate: 9.20 },
      '2-5': { italia: 4.40, sardegna: 5.50, calabria: 5.50, sicilia: 5.50, disagiate: 9.40 },
      '5-10': { italia: 5.40, sardegna: 6.50, calabria: 6.50, sicilia: 6.50, disagiate: 10.40 },
      '10-20': { italia: 6.50, sardegna: 8.10, calabria: 8.10, sicilia: 8.10, disagiate: 11.50 },
      '20-30': { italia: 7.40, sardegna: 9.30, calabria: 9.30, sicilia: 9.30, disagiate: 12.50 },
      '30-50': { italia: 14.50, sardegna: 17.20, calabria: 17.20, sicilia: 17.20, disagiate: 19.50 },
      '50-70': { italia: 17.20, sardegna: 19.80, calabria: 19.80, sicilia: 19.80, disagiate: 22.50 },
      '70-100': { italia: 18.20, sardegna: 23.60, calabria: 23.60, sicilia: 23.60, disagiate: 23.50 },
    },
    contrassegno: (amount: number) => {
      if (amount <= 200) return 1.56
      return 1.56 + (amount * 0.02)
    },
    assicurazione: 3.28,
    tempiConsegna: '24-48h',
    affidabilita: 4.7
  },
  
  prime_pd1: {
    name: 'PD1 (Spedizioni Prime)',
    fuel: 0,
    rates: {
      '0-2': { italia: 3.60, scs: 0.55, disagiate: 2.00, periferiche: 0.50 },
      '2-5': { italia: 4.20, scs: 0.65, disagiate: 2.00, periferiche: 0.50 },
      '5-10': { italia: 5.30, scs: 0.70, disagiate: 2.00, periferiche: 0.50 },
      '10-20': { italia: 7.40, scs: 2.50, disagiate: 2.00, periferiche: 0.50 },
      '20-30': { italia: 9.00, scs: 4.15, disagiate: 2.00, periferiche: 0.50 },
      '30-50': { italia: 14.50, scs: 8.70, disagiate: 2.00, periferiche: 0.50 },
      '50-70': { italia: 18.50, scs: 16.50, disagiate: 2.00, periferiche: 0.50 },
      '70-100': { italia: 24.50, scs: 23.30, disagiate: 2.00, periferiche: 0.50 },
    },
    notaCredito: -0.40, // per 0-2kg
    contrassegno: 1.60, // incluso
    assicurazione: (value: number) => {
      if (value <= 100) return 1.50
      if (value <= 500) return 3.00
      return 4.00
    },
    tempiConsegna: '24-48h',
    affidabilita: 4.3
  },
  
  prime_campania: {
    name: 'PRIME Campania/Lazio',
    fuel: 0,
    rates: {
      '0-2': { campania_lazio: 3.60 },
      '2-5': { campania_lazio: 4.20 },
      '5-10': { campania_lazio: 5.30 },
      '10-20': { campania_lazio: 7.40 },
    },
    contrassegno: 1.60, // incluso fino 999€
    tempiConsegna: '24-48h',
    affidabilita: 4.5
  }
}

// Zona detection
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

// Calcola costo base
export function calcolaCosto(
  listino: keyof typeof LISTINI,
  peso: number,
  provincia: string,
  contrassegno: number = 0
): number {
  const list = LISTINI[listino]
  const fascia = getFasciaPeso(peso, listino)
  const zona = getZona(provincia)
  
  // @ts-ignore
  const rates = list.rates[fascia] || list.rates['0-2']
  let costoBase = rates[zona] || rates.italia || Object.values(rates)[0]
  
  // Nota credito PD1
  if (listino === 'prime_pd1' && peso <= 2) {
    costoBase += LISTINI.prime_pd1.notaCredito
  }
  
  // Contrassegno
  let costoCA = 0
  if (contrassegno > 0) {
    if (typeof list.contrassegno === 'function') {
      costoCA = list.contrassegno(contrassegno)
    } else {
      costoCA = list.contrassegno
    }
  }
  
  return Number((costoBase + costoCA).toFixed(2))
}

// Comparatore completo
export function comparaPrezzi(input: {
  peso: number
  provincia: string
  contrassegno: number
}) {
  const results = []
  
  // GLS BA
  const glsBa = calcolaCosto('speedgo_gls_ba', input.peso, input.provincia, input.contrassegno)
  results.push({
    corriere: 'speedgo_gls_ba',
    nome: LISTINI.speedgo_gls_ba.name,
    costo: glsBa,
    tempi: LISTINI.speedgo_gls_ba.tempiConsegna,
    affidabilita: LISTINI.speedgo_gls_ba.affidabilita
  })
  
  // SDA
  const sda = calcolaCosto('speedgo_sda', input.peso, input.provincia, input.contrassegno)
  results.push({
    corriere: 'speedgo_sda',
    nome: LISTINI.speedgo_sda.name,
    costo: sda,
    tempi: LISTINI.speedgo_sda.tempiConsegna,
    affidabilita: LISTINI.speedgo_sda.affidabilita
  })
  
  // PRIME PD1
  const pd1 = calcolaCosto('prime_pd1', input.peso, input.provincia, input.contrassegno)
  results.push({
    corriere: 'prime_pd1',
    nome: LISTINI.prime_pd1.name,
    costo: pd1,
    tempi: LISTINI.prime_pd1.tempiConsegna,
    affidabilita: LISTINI.prime_pd1.affidabilita
  })
  
  // PRIME Campania/Lazio
  const zona = getZona(input.provincia)
  if (zona === 'campania' || zona === 'lazio') {
    const primeCamp = calcolaCosto('prime_campania', input.peso, input.provincia, input.contrassegno)
    results.push({
      corriere: 'prime_campania',
      nome: LISTINI.prime_campania.name,
      costo: primeCamp,
      tempi: LISTINI.prime_campania.tempiConsegna,
      affidabilita: LISTINI.prime_campania.affidabilita
    })
  }
  
  // Sort per costo
  results.sort((a, b) => a.costo - b.costo)
  
  // Aggiungi prezzo consigliato e margine
  return results.map((r, i) => ({
    ...r,
    posizione: i + 1,
    prezzoConsigliato: Number((r.costo * 1.35).toFixed(2)), // 35% markup
    margine: Number((r.costo * 0.35).toFixed(2)),
    marginePerc: 26.0
  }))
}
