import { ListinoCorriere, OpzioneCorriere } from '../types'

/**
 * Determina la zona geografica dalla provincia
 */
export function getZonaFromProvincia(provincia: string): string {
  const provincieSCS = ['CA', 'SS', 'NU', 'OR', 'SU'] // Sardegna
  const provincieSicilia = ['CT', 'PA', 'ME', 'AG', 'CL', 'EN', 'RG', 'SR', 'TP']
  const provincieCalabria = ['RC', 'VV', 'CS', 'KR', 'CZ']
  const provincieCampania = ['NA', 'SA', 'AV', 'CE', 'BN']
  const provincieLazio = ['RM', 'LT', 'FR', 'VT', 'RI']

  if (provincieSCS.includes(provincia)) return 'sardegna'
  if (provincieSicilia.includes(provincia)) return 'sicilia'
  if (provincieCalabria.includes(provincia)) return 'calabria'
  if (provincieCampania.includes(provincia) || provincieLazio.includes(provincia)) {
    return 'campania_lazio'
  }

  return 'italia'
}

/**
 * Calcola il prezzo base da un listino in base a peso e zona
 */
export function calcolaPrezzoBase(
  listino: ListinoCorriere,
  peso: number,
  provincia: string
): number {
  const datiListino = listino.dati_listino

  if (datiListino.tipo_listino === 'kg_unitario') {
    // Calcolo per kg unitario (se implementato in futuro)
    return 0
  }

  // Trova la fascia peso corretta
  const fascia = datiListino.fasce.find(
    f => peso >= f.peso_min && peso <= f.peso_max
  )

  if (!fascia) {
    // Se non trova fascia, usa l'ultima disponibile
    const ultimaFascia = datiListino.fasce[datiListino.fasce.length - 1]
    if (!ultimaFascia) return 0
    return ultimaFascia.prezzi.italia || Object.values(ultimaFascia.prezzi)[0] || 0
  }

  // Determina zona
  const zona = getZonaFromProvincia(provincia)
  
  // Cerca prezzo per zona specifica, altrimenti usa italia
  let prezzo = fascia.prezzi[zona]
  
  if (!prezzo) {
    // Fallback: prova varianti
    if (zona === 'sardegna' && fascia.prezzi.scs) prezzo = fascia.prezzi.scs
    else if (zona === 'sicilia' && fascia.prezzi.scs) prezzo = fascia.prezzi.scs
    else if (zona === 'calabria' && fascia.prezzi.scs) prezzo = fascia.prezzi.scs
    else prezzo = fascia.prezzi.italia || Object.values(fascia.prezzi)[0] || 0
  }

  return Number(prezzo.toFixed(2))
}

/**
 * Calcola costo contrassegno in base alle regole
 */
export function calcolaContrassegno(
  regole: any,
  importo: number
): number {
  if (!regole || importo === 0) return 0

  if (regole.tipo === 'fisso') {
    return regole.costo || 0
  }

  if (regole.tipo === 'percentuale') {
    return Number(((importo * (regole.percentuale || 0)) / 100).toFixed(2))
  }

  if (regole.tipo === 'scaglioni' && regole.regole) {
    // Trova la regola corretta per l'importo
    const regolaApplicabile = regole.regole.find(
      (r: any) => importo <= r.fino_a
    )

    if (!regolaApplicabile) {
      // Usa l'ultima regola disponibile
      const ultimaRegola = regole.regole[regole.regole.length - 1]
      if (!ultimaRegola) return 0

      if (ultimaRegola.percentuale) {
        return Number(
          (
            (ultimaRegola.costo_fisso || 0) +
            (importo * ultimaRegola.percentuale) / 100
          ).toFixed(2)
        )
      }
      return ultimaRegola.costo || 0
    }

    // Applica regola
    if (regolaApplicabile.percentuale) {
      return Number(
        (
          (regolaApplicabile.costo_fisso || 0) +
          (importo * regolaApplicabile.percentuale) / 100
        ).toFixed(2)
      )
    }

    return regolaApplicabile.costo || 0
  }

  return 0
}

/**
 * Compara prezzi tra tutti i listini attivi
 */
export function comparaPrezzi(
  listini: ListinoCorriere[],
  peso: number,
  provincia: string,
  contrassegno: number
): OpzioneCorriere[] {
  const opzioni: OpzioneCorriere[] = []

  for (const listino of listini) {
    if (!listino.attivo) continue

    const prezzoBase = calcolaPrezzoBase(listino, peso, provincia)
    const costoContrassegno = calcolaContrassegno(
      listino.regole_contrassegno,
      contrassegno
    )

    opzioni.push({
      id: listino.id,
      fornitore: listino.fornitore,
      servizio: listino.servizio,
      prezzo_base: prezzoBase,
      contrassegno: costoContrassegno,
      totale: Number((prezzoBase + costoContrassegno).toFixed(2)),
      dettagli: listino.dati_listino,
    })
  }

  // Ordina per totale crescente
  opzioni.sort((a, b) => a.totale - b.totale)

  return opzioni
}

