-- Ensure shipments (spedizioni) table exposes a status column used by the app and views
ALTER TABLE public.spedizioni
ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'bozza';

-- Backfill any NULL values that may exist (older rows when column was missing)
UPDATE public.spedizioni
SET status = 'bozza'
WHERE status IS NULL;
