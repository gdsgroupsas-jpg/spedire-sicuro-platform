import { z } from 'zod'

export const shipmentSchema = z.object({
  // Destinatario
  destinatario: z.string().min(3, "Nome destinatario troppo corto").max(100),
  indirizzo: z.string().min(5, "Indirizzo incompleto").max(200),
  cap: z.string().regex(/^\d{5}$/, "CAP non valido (deve essere 5 cifre)"),
  localita: z.string().min(2, "Località mancante"),
  provincia: z.string().length(2, "Provincia deve essere di 2 lettere (es. RM)").toUpperCase(),
  country: z.string().min(2, "Paese mancante"), // Rimosso default, gestito da React Hook Form
  telefono: z.string().min(6, "Telefono non valido"),
  email_destinatario: z.string().email("Email non valida").optional().or(z.literal('')),
  
  // Dati Pacco
  peso: z.coerce.number().min(0.1, "Peso minimo 0.1 kg").max(1000, "Peso massimo superato"),
  colli: z.coerce.number().int().min(1), // Rimosso default
  contenuto: z.string().min(3, "Descrizione contenuto obbligatoria"),
  
  // Opzioni
  contrassegno: z.coerce.number().min(0), // Rimosso default
  note: z.string().max(500).optional().nullable(),
  
  // Riferimenti
  order_id: z.string().optional().nullable(),
  rif_mittente: z.string().optional().nullable(),
  rif_destinatario: z.string().optional().nullable(),
  
  // Selezione Corriere (opzionale in fase di bozza, obbligatorio per conferma)
  corriere_scelto: z.string().optional().nullable(),
  servizio_scelto: z.string().optional().nullable(),
  prezzo_finale: z.number().optional().nullable(),
})

export type ShipmentFormValues = z.infer<typeof shipmentSchema>
