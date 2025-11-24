-- Create cap_validation table for Italian postal code validation
CREATE TABLE IF NOT EXISTS public.cap_validation (
    id BIGSERIAL PRIMARY KEY,
    cap VARCHAR(5) NOT NULL,
    city_name VARCHAR(255) NOT NULL,
    provincia VARCHAR(2) NOT NULL,
    region VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    
    -- Create unique constraint to prevent duplicate CAP-city combinations
    CONSTRAINT unique_cap_city UNIQUE (cap, city_name, provincia)
);

-- Create indexes for faster lookups
CREATE INDEX idx_cap_validation_cap ON public.cap_validation(cap);
CREATE INDEX idx_cap_validation_city ON public.cap_validation(city_name);
CREATE INDEX idx_cap_validation_provincia ON public.cap_validation(provincia);
CREATE INDEX idx_cap_validation_active ON public.cap_validation(is_active) WHERE is_active = true;

-- Create a composite index for the most common query pattern
CREATE INDEX idx_cap_validation_composite ON public.cap_validation(cap, city_name, provincia) WHERE is_active = true;

-- Enable RLS
ALTER TABLE public.cap_validation ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access (validation is public)
CREATE POLICY "Public read access for CAP validation" ON public.cap_validation
    FOR SELECT USING (true);

-- Create policy for admin write access
CREATE POLICY "Admin write access for CAP validation" ON public.cap_validation
    FOR INSERT USING (auth.role() = 'authenticated');

CREATE POLICY "Admin update access for CAP validation" ON public.cap_validation
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Admin delete access for CAP validation" ON public.cap_validation
    FOR DELETE USING (auth.role() = 'authenticated');

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_cap_validation_updated_at 
    BEFORE UPDATE ON public.cap_validation
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data for major Italian cities (you can expand this)
INSERT INTO public.cap_validation (cap, city_name, provincia, region) VALUES
    ('00118', 'Roma', 'RM', 'Lazio'),
    ('00119', 'Roma', 'RM', 'Lazio'),
    ('00120', 'Roma', 'RM', 'Lazio'),
    ('00121', 'Roma', 'RM', 'Lazio'),
    ('00122', 'Roma', 'RM', 'Lazio'),
    ('00123', 'Roma', 'RM', 'Lazio'),
    ('00124', 'Roma', 'RM', 'Lazio'),
    ('00125', 'Roma', 'RM', 'Lazio'),
    ('00126', 'Roma', 'RM', 'Lazio'),
    ('00127', 'Roma', 'RM', 'Lazio'),
    ('00128', 'Roma', 'RM', 'Lazio'),
    ('00131', 'Roma', 'RM', 'Lazio'),
    ('00132', 'Roma', 'RM', 'Lazio'),
    ('00133', 'Roma', 'RM', 'Lazio'),
    ('00134', 'Roma', 'RM', 'Lazio'),
    ('00135', 'Roma', 'RM', 'Lazio'),
    ('00136', 'Roma', 'RM', 'Lazio'),
    ('00137', 'Roma', 'RM', 'Lazio'),
    ('00138', 'Roma', 'RM', 'Lazio'),
    ('00139', 'Roma', 'RM', 'Lazio'),
    ('00141', 'Roma', 'RM', 'Lazio'),
    ('00142', 'Roma', 'RM', 'Lazio'),
    ('00143', 'Roma', 'RM', 'Lazio'),
    ('00144', 'Roma', 'RM', 'Lazio'),
    ('00145', 'Roma', 'RM', 'Lazio'),
    ('00146', 'Roma', 'RM', 'Lazio'),
    ('00147', 'Roma', 'RM', 'Lazio'),
    ('00148', 'Roma', 'RM', 'Lazio'),
    ('00149', 'Roma', 'RM', 'Lazio'),
    ('00151', 'Roma', 'RM', 'Lazio'),
    ('00152', 'Roma', 'RM', 'Lazio'),
    ('00153', 'Roma', 'RM', 'Lazio'),
    ('00154', 'Roma', 'RM', 'Lazio'),
    ('00155', 'Roma', 'RM', 'Lazio'),
    ('00156', 'Roma', 'RM', 'Lazio'),
    ('00157', 'Roma', 'RM', 'Lazio'),
    ('00158', 'Roma', 'RM', 'Lazio'),
    ('00159', 'Roma', 'RM', 'Lazio'),
    ('00161', 'Roma', 'RM', 'Lazio'),
    ('00162', 'Roma', 'RM', 'Lazio'),
    ('00163', 'Roma', 'RM', 'Lazio'),
    ('00164', 'Roma', 'RM', 'Lazio'),
    ('00165', 'Roma', 'RM', 'Lazio'),
    ('00166', 'Roma', 'RM', 'Lazio'),
    ('00167', 'Roma', 'RM', 'Lazio'),
    ('00168', 'Roma', 'RM', 'Lazio'),
    ('00169', 'Roma', 'RM', 'Lazio'),
    ('00171', 'Roma', 'RM', 'Lazio'),
    ('00172', 'Roma', 'RM', 'Lazio'),
    ('00173', 'Roma', 'RM', 'Lazio'),
    ('00174', 'Roma', 'RM', 'Lazio'),
    ('00175', 'Roma', 'RM', 'Lazio'),
    ('00176', 'Roma', 'RM', 'Lazio'),
    ('00177', 'Roma', 'RM', 'Lazio'),
    ('00178', 'Roma', 'RM', 'Lazio'),
    ('00179', 'Roma', 'RM', 'Lazio'),
    ('00181', 'Roma', 'RM', 'Lazio'),
    ('00182', 'Roma', 'RM', 'Lazio'),
    ('00183', 'Roma', 'RM', 'Lazio'),
    ('00184', 'Roma', 'RM', 'Lazio'),
    ('00185', 'Roma', 'RM', 'Lazio'),
    ('00186', 'Roma', 'RM', 'Lazio'),
    ('00187', 'Roma', 'RM', 'Lazio'),
    ('00188', 'Roma', 'RM', 'Lazio'),
    ('00189', 'Roma', 'RM', 'Lazio'),
    ('00191', 'Roma', 'RM', 'Lazio'),
    ('00192', 'Roma', 'RM', 'Lazio'),
    ('00193', 'Roma', 'RM', 'Lazio'),
    ('00194', 'Roma', 'RM', 'Lazio'),
    ('00195', 'Roma', 'RM', 'Lazio'),
    ('00196', 'Roma', 'RM', 'Lazio'),
    ('00197', 'Roma', 'RM', 'Lazio'),
    ('00198', 'Roma', 'RM', 'Lazio'),
    ('00199', 'Roma', 'RM', 'Lazio'),
    ('20121', 'Milano', 'MI', 'Lombardia'),
    ('20122', 'Milano', 'MI', 'Lombardia'),
    ('20123', 'Milano', 'MI', 'Lombardia'),
    ('20124', 'Milano', 'MI', 'Lombardia'),
    ('20125', 'Milano', 'MI', 'Lombardia'),
    ('20126', 'Milano', 'MI', 'Lombardia'),
    ('20127', 'Milano', 'MI', 'Lombardia'),
    ('20128', 'Milano', 'MI', 'Lombardia'),
    ('20129', 'Milano', 'MI', 'Lombardia'),
    ('20131', 'Milano', 'MI', 'Lombardia'),
    ('20132', 'Milano', 'MI', 'Lombardia'),
    ('20133', 'Milano', 'MI', 'Lombardia'),
    ('20134', 'Milano', 'MI', 'Lombardia'),
    ('20135', 'Milano', 'MI', 'Lombardia'),
    ('20136', 'Milano', 'MI', 'Lombardia'),
    ('20137', 'Milano', 'MI', 'Lombardia'),
    ('20138', 'Milano', 'MI', 'Lombardia'),
    ('20139', 'Milano', 'MI', 'Lombardia'),
    ('20141', 'Milano', 'MI', 'Lombardia'),
    ('20142', 'Milano', 'MI', 'Lombardia'),
    ('20143', 'Milano', 'MI', 'Lombardia'),
    ('20144', 'Milano', 'MI', 'Lombardia'),
    ('20145', 'Milano', 'MI', 'Lombardia'),
    ('20146', 'Milano', 'MI', 'Lombardia'),
    ('20147', 'Milano', 'MI', 'Lombardia'),
    ('20148', 'Milano', 'MI', 'Lombardia'),
    ('20149', 'Milano', 'MI', 'Lombardia'),
    ('20151', 'Milano', 'MI', 'Lombardia'),
    ('20152', 'Milano', 'MI', 'Lombardia'),
    ('20153', 'Milano', 'MI', 'Lombardia'),
    ('20154', 'Milano', 'MI', 'Lombardia'),
    ('20155', 'Milano', 'MI', 'Lombardia'),
    ('20156', 'Milano', 'MI', 'Lombardia'),
    ('20157', 'Milano', 'MI', 'Lombardia'),
    ('20158', 'Milano', 'MI', 'Lombardia'),
    ('20159', 'Milano', 'MI', 'Lombardia'),
    ('20161', 'Milano', 'MI', 'Lombardia'),
    ('20162', 'Milano', 'MI', 'Lombardia'),
    ('80121', 'Napoli', 'NA', 'Campania'),
    ('80122', 'Napoli', 'NA', 'Campania'),
    ('80123', 'Napoli', 'NA', 'Campania'),
    ('80124', 'Napoli', 'NA', 'Campania'),
    ('80125', 'Napoli', 'NA', 'Campania'),
    ('80126', 'Napoli', 'NA', 'Campania'),
    ('80127', 'Napoli', 'NA', 'Campania'),
    ('80128', 'Napoli', 'NA', 'Campania'),
    ('80129', 'Napoli', 'NA', 'Campania'),
    ('80131', 'Napoli', 'NA', 'Campania'),
    ('80132', 'Napoli', 'NA', 'Campania'),
    ('80133', 'Napoli', 'NA', 'Campania'),
    ('80134', 'Napoli', 'NA', 'Campania'),
    ('80135', 'Napoli', 'NA', 'Campania'),
    ('80136', 'Napoli', 'NA', 'Campania'),
    ('80137', 'Napoli', 'NA', 'Campania'),
    ('80138', 'Napoli', 'NA', 'Campania'),
    ('80139', 'Napoli', 'NA', 'Campania'),
    ('80141', 'Napoli', 'NA', 'Campania'),
    ('80142', 'Napoli', 'NA', 'Campania'),
    ('80143', 'Napoli', 'NA', 'Campania'),
    ('80144', 'Napoli', 'NA', 'Campania'),
    ('80145', 'Napoli', 'NA', 'Campania'),
    ('80146', 'Napoli', 'NA', 'Campania'),
    ('80147', 'Napoli', 'NA', 'Campania'),
    ('10121', 'Torino', 'TO', 'Piemonte'),
    ('10122', 'Torino', 'TO', 'Piemonte'),
    ('10123', 'Torino', 'TO', 'Piemonte'),
    ('10124', 'Torino', 'TO', 'Piemonte'),
    ('10125', 'Torino', 'TO', 'Piemonte'),
    ('10126', 'Torino', 'TO', 'Piemonte'),
    ('10127', 'Torino', 'TO', 'Piemonte'),
    ('10128', 'Torino', 'TO', 'Piemonte'),
    ('10129', 'Torino', 'TO', 'Piemonte'),
    ('10131', 'Torino', 'TO', 'Piemonte'),
    ('10132', 'Torino', 'TO', 'Piemonte'),
    ('10133', 'Torino', 'TO', 'Piemonte'),
    ('10134', 'Torino', 'TO', 'Piemonte'),
    ('10135', 'Torino', 'TO', 'Piemonte'),
    ('10136', 'Torino', 'TO', 'Piemonte'),
    ('10137', 'Torino', 'TO', 'Piemonte'),
    ('10138', 'Torino', 'TO', 'Piemonte'),
    ('10139', 'Torino', 'TO', 'Piemonte'),
    ('10141', 'Torino', 'TO', 'Piemonte'),
    ('10142', 'Torino', 'TO', 'Piemonte'),
    ('10143', 'Torino', 'TO', 'Piemonte'),
    ('10144', 'Torino', 'TO', 'Piemonte'),
    ('10145', 'Torino', 'TO', 'Piemonte'),
    ('10146', 'Torino', 'TO', 'Piemonte'),
    ('10147', 'Torino', 'TO', 'Piemonte'),
    ('10148', 'Torino', 'TO', 'Piemonte'),
    ('10149', 'Torino', 'TO', 'Piemonte'),
    ('10151', 'Torino', 'TO', 'Piemonte'),
    ('10152', 'Torino', 'TO', 'Piemonte'),
    ('10153', 'Torino', 'TO', 'Piemonte'),
    ('10154', 'Torino', 'TO', 'Piemonte'),
    ('10155', 'Torino', 'TO', 'Piemonte'),
    ('10156', 'Torino', 'TO', 'Piemonte'),
    ('50121', 'Firenze', 'FI', 'Toscana'),
    ('50122', 'Firenze', 'FI', 'Toscana'),
    ('50123', 'Firenze', 'FI', 'Toscana'),
    ('50124', 'Firenze', 'FI', 'Toscana'),
    ('50125', 'Firenze', 'FI', 'Toscana'),
    ('50126', 'Firenze', 'FI', 'Toscana'),
    ('50127', 'Firenze', 'FI', 'Toscana'),
    ('50128', 'Firenze', 'FI', 'Toscana'),
    ('50129', 'Firenze', 'FI', 'Toscana'),
    ('50131', 'Firenze', 'FI', 'Toscana'),
    ('50132', 'Firenze', 'FI', 'Toscana'),
    ('50133', 'Firenze', 'FI', 'Toscana'),
    ('50134', 'Firenze', 'FI', 'Toscana'),
    ('50135', 'Firenze', 'FI', 'Toscana'),
    ('50136', 'Firenze', 'FI', 'Toscana'),
    ('50137', 'Firenze', 'FI', 'Toscana'),
    ('50138', 'Firenze', 'FI', 'Toscana'),
    ('50139', 'Firenze', 'FI', 'Toscana'),
    ('50141', 'Firenze', 'FI', 'Toscana'),
    ('50142', 'Firenze', 'FI', 'Toscana'),
    ('50143', 'Firenze', 'FI', 'Toscana'),
    ('50144', 'Firenze', 'FI', 'Toscana'),
    ('50145', 'Firenze', 'FI', 'Toscana'),
    ('40121', 'Bologna', 'BO', 'Emilia-Romagna'),
    ('40122', 'Bologna', 'BO', 'Emilia-Romagna'),
    ('40123', 'Bologna', 'BO', 'Emilia-Romagna'),
    ('40124', 'Bologna', 'BO', 'Emilia-Romagna'),
    ('40125', 'Bologna', 'BO', 'Emilia-Romagna'),
    ('40126', 'Bologna', 'BO', 'Emilia-Romagna'),
    ('40127', 'Bologna', 'BO', 'Emilia-Romagna'),
    ('40128', 'Bologna', 'BO', 'Emilia-Romagna'),
    ('40129', 'Bologna', 'BO', 'Emilia-Romagna'),
    ('40131', 'Bologna', 'BO', 'Emilia-Romagna'),
    ('40132', 'Bologna', 'BO', 'Emilia-Romagna'),
    ('40133', 'Bologna', 'BO', 'Emilia-Romagna'),
    ('40134', 'Bologna', 'BO', 'Emilia-Romagna'),
    ('40135', 'Bologna', 'BO', 'Emilia-Romagna'),
    ('40136', 'Bologna', 'BO', 'Emilia-Romagna'),
    ('40137', 'Bologna', 'BO', 'Emilia-Romagna'),
    ('40138', 'Bologna', 'BO', 'Emilia-Romagna'),
    ('40139', 'Bologna', 'BO', 'Emilia-Romagna'),
    ('40141', 'Bologna', 'BO', 'Emilia-Romagna')
ON CONFLICT DO NOTHING;

-- Add comment to table
COMMENT ON TABLE public.cap_validation IS 'Table for validating Italian postal codes (CAP) with city and province information';
COMMENT ON COLUMN public.cap_validation.cap IS 'Italian postal code (5 digits)';
COMMENT ON COLUMN public.cap_validation.city_name IS 'City name in Italian';
COMMENT ON COLUMN public.cap_validation.provincia IS 'Province code (2 letters)';
COMMENT ON COLUMN public.cap_validation.region IS 'Italian region name';
COMMENT ON COLUMN public.cap_validation.is_active IS 'Whether this CAP is currently active/valid';