import { z } from 'zod'

/**
 * Schema per validare dati spedizione (usato in compare e OCR)
 */
export const ShipmentSchema = z.object({
  destinatario: z.string().min(1).max(100).optional(),
  indirizzo: z.string().min(1).max(200).optional(),
  cap: z.string().regex(/^\d{5}$/, 'CAP deve essere di 5 cifre').optional(),
  localita: z.string().min(1).max(100).optional(),
  provincia: z.string().length(2, 'Provincia deve essere 2 caratteri').toUpperCase().optional(),
  country: z.string().length(2).default('IT').optional(),
  peso: z.number().positive('Peso deve essere positivo').max(1000, 'Peso massimo 1000kg').optional(),
  colli: z.number().int().positive().max(100, 'Massimo 100 colli').default(1).optional(),
  contrassegno: z.union([
    z.number().nonnegative('Contrassegno non può essere negativo').max(50000),
    z.string().regex(/^\d+(\.\d{1,2})?$/, 'Formato contrassegno non valido')
  ]).optional(),
  telefono: z.string().regex(/^\d{10,15}$/, 'Telefono non valido').optional().or(z.literal('')),
  email_destinatario: z.string().email('Email non valida').optional().or(z.literal('')),
  contenuto: z.string().max(500).optional(),
  order_id: z.string().max(100).optional(),
  rif_mittente: z.string().max(100).optional(),
  rif_destinatario: z.string().max(100).optional(),
  note: z.string().max(1000).optional(),
  corriere_scelto: z.string().max(100).optional(),
  servizio_scelto: z.string().max(100).optional(),
  prezzo_finale: z.number().nonnegative().optional(),
})

/**
 * Schema per batch comparison
 */
export const BatchCompareSchema = z.array(ShipmentSchema).max(100, 'Massimo 100 spedizioni per richiesta')

/**
 * Schema per AI chat agent
 */
export const ChatAgentSchema = z.object({
  message: z.string()
    .min(1, 'Messaggio richiesto')
    .max(1000, 'Messaggio troppo lungo (max 1000 caratteri)')
    .regex(/^[a-zA-Z0-9\s.,!?àèéìòùÀÈÉÌÒÙ€$%&()[\]{}"':;/\-_+=*@#]+$/, 'Caratteri non permessi nel messaggio'),
  context: z.string()
    .max(2000, 'Contesto troppo lungo')
    .regex(/^[a-zA-Z0-9\s.,!?àèéìòùÀÈÉÌÒÙ€$%&()[\]{}"':;/\-_+=*@#]*$/, 'Caratteri non permessi nel contesto')
    .optional()
    .default('')
})

/**
 * Schema per webhook orders
 */
export const WebhookOrderSchema = z.object({
  id: z.string().max(100),
  order_id: z.string().max(100).optional(),
  total_price: z.number().nonnegative().optional(),
  total: z.number().nonnegative().optional(),
  customer: z.object({
    name: z.string().max(200).optional(),
    email: z.string().email().optional(),
    phone: z.string().max(20).optional(),
  }).optional(),
  items: z.array(z.object({
    name: z.string().max(200).optional(),
    quantity: z.number().int().positive().optional(),
    price: z.number().nonnegative().optional(),
  })).optional(),
  shipping_address: z.object({
    address: z.string().max(200).optional(),
    city: z.string().max(100).optional(),
    zip: z.string().max(10).optional(),
    province: z.string().max(10).optional(),
    country: z.string().max(10).optional(),
  }).optional(),
}).passthrough() // Permette campi extra da marketplace

/**
 * Schema per export CSV
 */
export const CsvExportSchema = z.object({
  shipments: z.array(z.object({
    id: z.string().optional(),
    destinatario: z.string().optional(),
    indirizzo: z.string().optional(),
    cap: z.string().optional(),
    localita: z.string().optional(),
    provincia: z.string().optional(),
    peso: z.number().optional(),
    contrassegno: z.number().optional(),
    corriere_scelto: z.string().optional(),
    servizio_scelto: z.string().optional(),
    prezzo_finale: z.number().optional(),
  }).passthrough()).max(10000, 'Massimo 10000 spedizioni per export')
})

/**
 * Schema per listino update
 */
export const ListinoUpdateSchema = z.object({
  id: z.string().uuid('ID non valido'),
  attivo: z.boolean().optional(),
  dati_listino: z.any().optional(), // JSONB, validazione interna
  regole_contrassegno: z.any().optional(), // JSONB
})

/**
 * Schema per listino delete
 */
export const ListinoDeleteSchema = z.object({
  id: z.string().uuid('ID non valido'),
})

/**
 * Helper per validare e restituire errori formattati
 */
export function validateInput<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; error: any } {
  const result = schema.safeParse(data)

  if (!result.success) {
    return {
      success: false,
      error: {
        message: 'Validazione fallita',
        details: result.error.flatten().fieldErrors
      }
    }
  }

  return {
    success: true,
    data: result.data
  }
}

/**
 * Sanitizza input per AI prompts
 * Rimuove caratteri pericolosi e keywords di injection
 */
export function sanitizeAIInput(input: string): string {
  if (!input) return ''

  // Rimuovi caratteri speciali pericolosi
  let sanitized = input
    .replace(/[<>{}]/g, '') // Rimuovi brackets
    .replace(/\\/g, '') // Rimuovi backslash
    .substring(0, 2000) // Limita lunghezza

  // Blocca keywords di injection comuni
  const blockedPatterns = [
    /ignore\s+(all\s+)?previous\s+instructions?/gi,
    /forget\s+(all\s+)?previous\s+instructions?/gi,
    /disregard\s+(all\s+)?previous\s+instructions?/gi,
    /new\s+instructions?/gi,
    /system\s+prompt/gi,
    /you\s+are\s+now/gi,
    /act\s+as/gi,
    /pretend\s+(you\s+are|to\s+be)/gi,
    /role\s*:\s*system/gi,
    /\[system\]/gi,
    /<\|system\|>/gi,
  ]

  for (const pattern of blockedPatterns) {
    sanitized = sanitized.replace(pattern, '[FILTERED]')
  }

  return sanitized.trim()
}

/**
 * Valida MIME type e estensione file
 */
export function validateFileType(
  file: File,
  allowedMimeTypes: string[],
  allowedExtensions: string[]
): { valid: true } | { valid: false; error: string } {
  // Controlla MIME type
  if (!allowedMimeTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Tipo file non supportato. Tipi permessi: ${allowedMimeTypes.join(', ')}`
    }
  }

  // Controlla estensione
  const extension = file.name.toLowerCase().match(/\.[^.]+$/)?.[0]
  if (!extension || !allowedExtensions.includes(extension)) {
    return {
      valid: false,
      error: `Estensione non valida. Estensioni permesse: ${allowedExtensions.join(', ')}`
    }
  }

  return { valid: true }
}

/**
 * Valida dimensione file
 */
export function validateFileSize(
  file: File,
  maxSizeBytes: number
): { valid: true } | { valid: false; error: string } {
  if (file.size > maxSizeBytes) {
    const maxSizeMB = (maxSizeBytes / 1024 / 1024).toFixed(1)
    return {
      valid: false,
      error: `File troppo grande. Dimensione massima: ${maxSizeMB}MB`
    }
  }

  return { valid: true }
}
