-- Migration: Add support for additional postal services cost
-- Date: 2025-11-25
-- Description: Adds servizi_aggiuntivi_costo column to tariffe_postali table
--              to support additional services like insurance, tracking, registered mail extras, etc.

-- Add column for additional services cost (nullable - not all tariffs have additional services)
ALTER TABLE public.tariffe_postali
ADD COLUMN IF NOT EXISTS servizi_aggiuntivi_costo NUMERIC(10, 2) DEFAULT 0.00;

-- Add comment to explain the column
COMMENT ON COLUMN public.tariffe_postali.servizi_aggiuntivi_costo IS
'Costo dei servizi aggiuntivi opzionali (es: assicurazione, tracciatura avanzata, ricevuta di ritorno)';

-- Add constraint to ensure non-negative values
ALTER TABLE public.tariffe_postali
ADD CONSTRAINT check_servizi_aggiuntivi_non_negativo
CHECK (servizi_aggiuntivi_costo >= 0);
