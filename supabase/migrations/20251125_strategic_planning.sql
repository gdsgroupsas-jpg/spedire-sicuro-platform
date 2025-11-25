-- Strategic Planning System for Spedire Sicuro Platform
-- Created: 2025-11-25
-- Features: Mission/Vision, SWOT Analysis, Business Model Canvas, Media Budget

-- ============================================
-- 1. COMPANY STRATEGY (Mission, Vision, Values)
-- ============================================

CREATE TABLE IF NOT EXISTS company_strategy (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mission TEXT,
  vision TEXT,
  values JSONB DEFAULT '[]'::jsonb, -- Array of company values
  elevator_pitch TEXT,
  tagline TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE company_strategy ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Allow authenticated users to read company_strategy"
  ON company_strategy FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert company_strategy"
  ON company_strategy FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update company_strategy"
  ON company_strategy FOR UPDATE
  TO authenticated
  USING (true);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_company_strategy_updated_at
  BEFORE UPDATE ON company_strategy
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 2. SWOT ANALYSIS
-- ============================================

CREATE TYPE swot_category AS ENUM ('strengths', 'weaknesses', 'opportunities', 'threats');

CREATE TABLE IF NOT EXISTS swot_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category swot_category NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  impact_score INTEGER CHECK (impact_score >= 1 AND impact_score <= 5),
  probability_score INTEGER CHECK (probability_score >= 1 AND probability_score <= 5),
  priority INTEGER DEFAULT 0, -- For ordering items
  action_items JSONB DEFAULT '[]'::jsonb, -- Related actions to take
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE swot_analysis ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Allow authenticated users to read swot_analysis"
  ON swot_analysis FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert swot_analysis"
  ON swot_analysis FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update swot_analysis"
  ON swot_analysis FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to delete swot_analysis"
  ON swot_analysis FOR DELETE
  TO authenticated
  USING (true);

-- Trigger for updated_at
CREATE TRIGGER update_swot_analysis_updated_at
  BEFORE UPDATE ON swot_analysis
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Index for faster category queries
CREATE INDEX idx_swot_category ON swot_analysis(category);

-- ============================================
-- 3. BUSINESS MODEL CANVAS
-- ============================================

CREATE TYPE canvas_segment AS ENUM (
  'key_partners',
  'key_activities',
  'key_resources',
  'value_propositions',
  'customer_relationships',
  'channels',
  'customer_segments',
  'cost_structure',
  'revenue_streams'
);

CREATE TABLE IF NOT EXISTS business_canvas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  segment canvas_segment NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  details JSONB DEFAULT '{}'::jsonb, -- Additional structured data
  priority INTEGER DEFAULT 0, -- For ordering items within segment
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE business_canvas ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Allow authenticated users to read business_canvas"
  ON business_canvas FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert business_canvas"
  ON business_canvas FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update business_canvas"
  ON business_canvas FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to delete business_canvas"
  ON business_canvas FOR DELETE
  TO authenticated
  USING (true);

-- Trigger for updated_at
CREATE TRIGGER update_business_canvas_updated_at
  BEFORE UPDATE ON business_canvas
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Index for faster segment queries
CREATE INDEX idx_canvas_segment ON business_canvas(segment);

-- ============================================
-- 4. MEDIA BUDGET TRACKING
-- ============================================

CREATE TABLE IF NOT EXISTS media_budget (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  year INTEGER NOT NULL,
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
  planned_budget DECIMAL(10, 2) DEFAULT 0.00,
  actual_spent DECIMAL(10, 2) DEFAULT 0.00,
  variance DECIMAL(10, 2) GENERATED ALWAYS AS (actual_spent - planned_budget) STORED,
  variance_percentage DECIMAL(5, 2) GENERATED ALWAYS AS (
    CASE
      WHEN planned_budget = 0 AND actual_spent = 0 THEN 0
      WHEN planned_budget = 0 AND actual_spent != 0 THEN 100
      ELSE ((actual_spent - planned_budget) / NULLIF(ABS(planned_budget), 0) * 100)
    END
  ) STORED,
  expenses JSONB DEFAULT '[]'::jsonb, -- Array of expense items
  notes TEXT,
  alert_threshold DECIMAL(10, 2) DEFAULT 100.00, -- Alert when spending exceeds this
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  UNIQUE(year, month)
);

-- Enable RLS
ALTER TABLE media_budget ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Allow authenticated users to read media_budget"
  ON media_budget FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert media_budget"
  ON media_budget FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update media_budget"
  ON media_budget FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to delete media_budget"
  ON media_budget FOR DELETE
  TO authenticated
  USING (true);

-- Trigger for updated_at
CREATE TRIGGER update_media_budget_updated_at
  BEFORE UPDATE ON media_budget
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Index for faster date queries
CREATE INDEX idx_media_budget_year_month ON media_budget(year, month);

-- ============================================
-- 5. BUDGET ALERTS
-- ============================================

CREATE TABLE IF NOT EXISTS budget_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  media_budget_id UUID REFERENCES media_budget(id) ON DELETE CASCADE,
  alert_type VARCHAR(50) NOT NULL, -- 'threshold_exceeded', 'approaching_zero', etc.
  alert_message TEXT NOT NULL,
  severity VARCHAR(20) DEFAULT 'warning', -- 'info', 'warning', 'critical'
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  read_at TIMESTAMP WITH TIME ZONE,
  read_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE budget_alerts ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Allow authenticated users to read budget_alerts"
  ON budget_alerts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to update budget_alerts"
  ON budget_alerts FOR UPDATE
  TO authenticated
  USING (true);

-- Index for faster unread alerts queries
CREATE INDEX idx_budget_alerts_unread ON budget_alerts(is_read) WHERE is_read = false;

-- ============================================
-- 6. HELPER FUNCTIONS
-- ============================================

-- Function to check budget variance and create alerts
CREATE OR REPLACE FUNCTION check_media_budget_variance()
RETURNS TRIGGER AS $$
DECLARE
  v_variance DECIMAL(10, 2);
  v_alert_exists BOOLEAN;
BEGIN
  v_variance := ABS(NEW.actual_spent - NEW.planned_budget);

  -- Check if spending exceeds alert threshold
  IF v_variance > NEW.alert_threshold THEN
    -- Check if alert already exists for this budget
    SELECT EXISTS(
      SELECT 1 FROM budget_alerts
      WHERE media_budget_id = NEW.id
      AND alert_type = 'threshold_exceeded'
      AND is_read = false
    ) INTO v_alert_exists;

    -- Create alert if it doesn't exist
    IF NOT v_alert_exists THEN
      INSERT INTO budget_alerts (media_budget_id, alert_type, alert_message, severity)
      VALUES (
        NEW.id,
        'threshold_exceeded',
        FORMAT('Budget variance for %s/%s exceeds threshold: €%.2f (%.2f%%)',
               NEW.month, NEW.year, NEW.variance, NEW.variance_percentage),
        CASE
          WHEN ABS(NEW.variance_percentage) > 50 THEN 'critical'
          WHEN ABS(NEW.variance_percentage) > 25 THEN 'warning'
          ELSE 'info'
        END
      );
    END IF;
  END IF;

  -- Check if budget is near zero (goal achieved)
  IF NEW.actual_spent >= 0 AND NEW.actual_spent <= 10 AND NEW.planned_budget <= 10 THEN
    SELECT EXISTS(
      SELECT 1 FROM budget_alerts
      WHERE media_budget_id = NEW.id
      AND alert_type = 'near_zero_achieved'
      AND is_read = false
    ) INTO v_alert_exists;

    IF NOT v_alert_exists THEN
      INSERT INTO budget_alerts (media_budget_id, alert_type, alert_message, severity)
      VALUES (
        NEW.id,
        'near_zero_achieved',
        FORMAT('✅ Media budget for %s/%s is near zero: €%.2f - Goal achieved!',
               NEW.month, NEW.year, NEW.actual_spent),
        'info'
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to check variance after insert/update
CREATE TRIGGER check_budget_variance_trigger
  AFTER INSERT OR UPDATE ON media_budget
  FOR EACH ROW
  EXECUTE FUNCTION check_media_budget_variance();

-- ============================================
-- 7. VIEWS FOR REPORTING
-- ============================================

-- View for SWOT summary statistics
CREATE OR REPLACE VIEW swot_summary AS
SELECT
  category,
  COUNT(*) as total_items,
  AVG(impact_score) as avg_impact,
  AVG(probability_score) as avg_probability,
  MAX(updated_at) as last_updated
FROM swot_analysis
GROUP BY category;

-- View for Business Canvas completeness
CREATE OR REPLACE VIEW canvas_completeness AS
SELECT
  segment,
  COUNT(*) as items_count,
  MAX(updated_at) as last_updated
FROM business_canvas
GROUP BY segment;

-- View for media budget yearly summary
CREATE OR REPLACE VIEW media_budget_yearly AS
SELECT
  year,
  SUM(planned_budget) as total_planned,
  SUM(actual_spent) as total_spent,
  SUM(variance) as total_variance,
  AVG(variance_percentage) as avg_variance_percentage,
  COUNT(*) as months_tracked
FROM media_budget
GROUP BY year
ORDER BY year DESC;

-- ============================================
-- 8. INITIAL DATA
-- ============================================

-- Insert default company strategy (empty template)
INSERT INTO company_strategy (mission, vision, values)
VALUES (
  'Definisci qui la mission aziendale',
  'Definisci qui la vision aziendale',
  '["Valore 1", "Valore 2", "Valore 3"]'::jsonb
)
ON CONFLICT DO NOTHING;

-- Insert current month media budget with goal of staying near zero
INSERT INTO media_budget (year, month, planned_budget, actual_spent, alert_threshold, notes)
VALUES (
  EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER,
  EXTRACT(MONTH FROM CURRENT_DATE)::INTEGER,
  0.00,
  0.00,
  100.00,
  'Budget media - Obiettivo: mantenere vicino allo 0'
)
ON CONFLICT (year, month) DO NOTHING;

-- Add some example SWOT items to get started
INSERT INTO swot_analysis (category, title, description, impact_score, probability_score) VALUES
('strengths', 'Piattaforma di confronto prezzi automatizzata', 'Sistema OCR con AI per estrazione dati da WhatsApp', 5, 5),
('strengths', 'Integrazione multi-corriere', 'Supporto per gestione listini multipli con aggiornamento dinamico', 4, 5),
('weaknesses', 'Brand awareness limitata', 'Necessità di aumentare la visibilità sul mercato', 3, 4),
('opportunities', 'Espansione geografica', 'Possibilità di espandere il servizio in nuove regioni italiane', 4, 3),
('threats', 'Concorrenza da grandi player', 'Presenza di competitor con maggiori risorse finanziarie', 4, 4)
ON CONFLICT DO NOTHING;

-- Add example Business Canvas items
INSERT INTO business_canvas (segment, title, description) VALUES
('value_propositions', 'Risparmio sui costi di spedizione', 'Confronto automatico prezzi per trovare la migliore tariffa'),
('customer_segments', 'PMI con alto volume spedizioni', 'Piccole e medie imprese che effettuano molte spedizioni'),
('key_activities', 'Gestione listini corrieri', 'Mantenimento e aggiornamento database tariffe'),
('revenue_streams', 'Margine su spedizioni', 'Differenza tra prezzo utente e costo effettivo corriere'),
('cost_structure', 'Infrastruttura cloud', 'Costi per hosting, database e servizi AI'),
('channels', 'Piattaforma web', 'Dashboard online per gestione spedizioni'),
('key_partners', 'Corrieri nazionali', 'Partnership con corrieri per accesso a tariffe preferenziali'),
('key_resources', 'Database listini', 'Sistema di gestione listini e confronto prezzi'),
('customer_relationships', 'Self-service assistito', 'Piattaforma autonoma con supporto quando necessario')
ON CONFLICT DO NOTHING;

-- ============================================
-- MIGRATION COMPLETE
-- ============================================

COMMENT ON TABLE company_strategy IS 'Stores company mission, vision, and values';
COMMENT ON TABLE swot_analysis IS 'SWOT analysis items (Strengths, Weaknesses, Opportunities, Threats)';
COMMENT ON TABLE business_canvas IS 'Business Model Canvas segments and items';
COMMENT ON TABLE media_budget IS 'Media budget tracking with variance analysis - Goal: stay near zero';
COMMENT ON TABLE budget_alerts IS 'Automated alerts for budget variance and goals';
