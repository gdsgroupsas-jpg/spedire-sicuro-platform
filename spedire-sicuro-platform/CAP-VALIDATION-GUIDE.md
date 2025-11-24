# CAP-City Validation Guide

## Overview

The shipment creation API now includes comprehensive CAP (Codice di Avviamento Postale) validation for Italian postal codes. This ensures that the postal codes match exactly with the specified cities and provinces, reducing shipping errors and improving delivery reliability.

## Features

### 1. Database-Backed CAP Validation
- Validates CAP codes against a `cap_validation` table in the database
- Checks that the CAP exists in the Italian postal system
- Verifies exact matches between CAP, city name, and province code
- Provides helpful suggestions when mismatches are detected

### 2. Google Geocoding Integration (Optional)
- Ready for Google Maps Geocoding API integration
- Validates addresses and provides geocoding coordinates
- Requires `GOOGLE_GEOCODING_API_KEY` environment variable
- Falls back gracefully if API is not configured

### 3. Comprehensive Error Messages
- Clear, actionable error messages in Italian
- Specific guidance on what needs to be corrected
- Suggestions for correct values based on database data
- Separate handling of warnings vs errors

## API Endpoint

### POST /api/shipments

Creates a new shipment with full address validation.

**Request Body:**
```json
{
  "destinatario": "Mario Rossi",
  "indirizzo": "Via Roma 123",
  "cap": "00185",
  "localita": "Roma",
  "provincia": "RM",
  "country": "IT",
  "peso": 1,
  "colli": 1,
  "contenuto": "Documenti",
  "telefono": "3331234567",
  // Optional sender fields if not using default
  "usa_mittente_default": false,
  "mittente_nome": "Azienda SRL",
  "mittente_indirizzo": "Via Milano 45",
  "mittente_cap": "20121",
  "mittente_citta": "Milano",
  "mittente_provincia": "MI"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": { /* shipment object */ },
  "warnings": [],
  "message": "Spedizione creata con successo",
  "geocoding": {
    "recipient": { /* geocoding data if available */ },
    "sender": { /* geocoding data if available */ }
  }
}
```

**Validation Error Response (400):**
```json
{
  "error": "Validazione indirizzo fallita",
  "validationErrors": [
    "Destinatario: CAP '00185' appartiene a Roma (RM), non a Milano (MI)"
  ],
  "warnings": [],
  "suggestions": {
    "recipient": {
      "city": "Roma",
      "provincia": "RM"
    }
  },
  "message": "Controlla gli indirizzi inseriti. I CAP devono corrispondere esattamente alla città e provincia specificate."
}
```

## Database Schema

### cap_validation Table

```sql
CREATE TABLE cap_validation (
    id BIGSERIAL PRIMARY KEY,
    cap VARCHAR(5) NOT NULL,
    city_name VARCHAR(255) NOT NULL,
    provincia VARCHAR(2) NOT NULL,
    region VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    CONSTRAINT unique_cap_city UNIQUE (cap, city_name, provincia)
);
```

## Adding More CAP Data

### Method 1: Direct SQL Insert

```sql
INSERT INTO cap_validation (cap, city_name, provincia, region) VALUES
    ('00195', 'Roma', 'RM', 'Lazio'),
    ('20100', 'Milano', 'MI', 'Lombardia'),
    ('80100', 'Napoli', 'NA', 'Campania')
ON CONFLICT DO NOTHING;
```

### Method 2: Using the Import Script

A helper script is provided at `/workspace/spedire-sicuro-platform/scripts/import-cap-data.js` for bulk importing CAP data from CSV files.

```bash
# Import from CSV file
node scripts/import-cap-data.js --file cap-data.csv
```

CSV Format:
```csv
cap,city_name,provincia,region
00195,Roma,RM,Lazio
20100,Milano,MI,Lombardia
80100,Napoli,NA,Campania
```

### Method 3: Admin API (Future Enhancement)

An admin API endpoint can be created for managing CAP data through the UI.

## Configuration

### Environment Variables

```env
# Optional: Google Geocoding API for enhanced validation
GOOGLE_GEOCODING_API_KEY=your-api-key-here
```

## Validation Rules

1. **CAP Format**: Must be exactly 5 digits
2. **CAP Existence**: Must exist in the cap_validation table
3. **City Match**: City name must match exactly (case-insensitive)
4. **Province Match**: Province code must match exactly (case-insensitive)
5. **Active Status**: Only active CAPs are considered valid

## Error Handling

### Validation Failures (Blocking)
- CAP not found in database
- City doesn't match CAP
- Province doesn't match CAP
- Invalid CAP format

### Warnings (Non-Blocking)
- Google Geocoding API unavailable
- Database query issues (falls back gracefully)
- Address verification confidence low

## Testing

### Test Cases

1. **Valid Address**
   - CAP: 00185, City: Roma, Province: RM
   - Expected: Success

2. **Wrong City for CAP**
   - CAP: 00185, City: Milano, Province: MI
   - Expected: Error with suggestion

3. **Wrong Province for CAP**
   - CAP: 00185, City: Roma, Province: MI
   - Expected: Error with suggestion

4. **Non-existent CAP**
   - CAP: 99999, City: Roma, Province: RM
   - Expected: Error

### Manual Testing

```bash
# Test with curl
curl -X POST http://localhost:3000/api/shipments \
  -H "Content-Type: application/json" \
  -d '{
    "destinatario": "Test User",
    "indirizzo": "Via Test 1",
    "cap": "00185",
    "localita": "Roma",
    "provincia": "RM",
    "country": "IT",
    "peso": 1,
    "colli": 1,
    "contenuto": "Test",
    "telefono": "1234567890"
  }'
```

## Migration

To apply the CAP validation migration to your database:

```bash
# Using Supabase CLI
supabase migration up

# Or manually via SQL
psql -U postgres -d your_database < supabase/migrations/20251124_cap_validation.sql
```

## Troubleshooting

### Common Issues

1. **"CAP non trovato nel database italiano"**
   - The CAP doesn't exist in the cap_validation table
   - Solution: Add the CAP data or check for typos

2. **"Provincia non corrisponde al CAP"**
   - The province code doesn't match the CAP
   - Solution: Check the correct province for the CAP

3. **"Città non corrisponde al CAP"**
   - The city name doesn't match the CAP
   - Solution: Use the exact city name as registered for that CAP

### Debug Mode

Enable debug logging in the API:

```javascript
// In /api/shipments/route.ts
const DEBUG = process.env.NODE_ENV === 'development'

if (DEBUG) {
  console.log('Validation input:', { cap, city, provincia })
  console.log('Validation result:', validationResult)
}
```

## Data Sources

For comprehensive Italian CAP data, consider these sources:

1. **Poste Italiane**: Official Italian postal service
2. **ISTAT**: Italian National Institute of Statistics
3. **OpenStreetMap**: Community-maintained geographic data
4. **Comuni Italiani**: Database of Italian municipalities

## Security Considerations

- CAP validation data is public (read-only for all users)
- Only authenticated users can create shipments
- Admin access required to modify CAP data
- Rate limiting should be implemented for API endpoints
- Input sanitization is applied to all user inputs

## Future Enhancements

1. **Auto-completion**: Suggest cities/provinces as user types
2. **Bulk Validation**: Validate multiple addresses at once
3. **CAP Range Support**: Support CAP ranges for larger cities
4. **International Support**: Extend to other countries' postal codes
5. **Machine Learning**: Predict and correct common typos
6. **Caching Layer**: Redis cache for frequent CAP lookups
7. **Admin UI**: Web interface for managing CAP data
8. **Audit Trail**: Track validation failures for analysis