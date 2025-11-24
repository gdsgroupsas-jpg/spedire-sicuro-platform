-- Create cap_validation table
CREATE TABLE IF NOT EXISTS cap_validation (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cap TEXT NOT NULL,
  citta TEXT NOT NULL,
  provincia TEXT NOT NULL,
  regione TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(cap, citta)
);

-- Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_cap_validation_cap ON cap_validation(cap);
CREATE INDEX IF NOT EXISTS idx_cap_validation_citta ON cap_validation(citta);

-- Enable RLS
ALTER TABLE cap_validation ENABLE ROW LEVEL SECURITY;

-- Allow read access to everyone (or authenticated users)
CREATE POLICY "Allow read access to cap_validation" ON cap_validation FOR SELECT USING (true);
