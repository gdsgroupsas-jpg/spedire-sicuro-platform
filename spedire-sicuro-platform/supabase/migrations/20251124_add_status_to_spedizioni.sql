-- Add missing columns to 'spedizioni' table
-- Based on FIX-ERRORI.md and error report

ALTER TABLE spedizioni ADD COLUMN IF NOT EXISTS status text DEFAULT 'bozza';
ALTER TABLE spedizioni ADD COLUMN IF NOT EXISTS colli integer DEFAULT 1;
ALTER TABLE spedizioni ADD COLUMN IF NOT EXISTS rif_mittente text;
ALTER TABLE spedizioni ADD COLUMN IF NOT EXISTS rif_destinatario text;
ALTER TABLE spedizioni ADD COLUMN IF NOT EXISTS note text;
ALTER TABLE spedizioni ADD COLUMN IF NOT EXISTS telefono text;
ALTER TABLE spedizioni ADD COLUMN IF NOT EXISTS email_destinatario text;
ALTER TABLE spedizioni ADD COLUMN IF NOT EXISTS contenuto text;
ALTER TABLE spedizioni ADD COLUMN IF NOT EXISTS order_id text;

-- Add indexes for common query filters
CREATE INDEX IF NOT EXISTS idx_spedizioni_status ON spedizioni(status);
CREATE INDEX IF NOT EXISTS idx_spedizioni_order_id ON spedizioni(order_id);

-- Ensure RLS policies allow insert (Optional, if not already set)
-- DO NOT CREATE DUPLICATE POLICIES if they exist with different names, but this is safe if names match
-- Skipping policy creation to avoid conflicts, assuming only schema was missing.
