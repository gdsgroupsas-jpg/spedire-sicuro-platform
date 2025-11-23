ALTER TABLE spedizioni
ADD COLUMN IF NOT EXISTS mittente_nome text,
ADD COLUMN IF NOT EXISTS mittente_indirizzo text,
ADD COLUMN IF NOT EXISTS mittente_cap text,
ADD COLUMN IF NOT EXISTS mittente_citta text,
ADD COLUMN IF NOT EXISTS mittente_provincia text,
ADD COLUMN IF NOT EXISTS mittente_telefono text,
ADD COLUMN IF NOT EXISTS mittente_email text;
