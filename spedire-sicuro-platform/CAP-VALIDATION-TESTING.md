# CAP Validation Testing Guide

## Setup Instructions

### 1. Database Migration

First, apply the CAP validation table migration:

```bash
# Navigate to project directory
cd /workspace/spedire-sicuro-platform

# Run the migration
psql -U postgres -d your_database < supabase/migrations/20251124_cap_validation.sql

# Or using Supabase CLI
supabase migration up
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Import Sample CAP Data

```bash
# Import the sample CAP data
npm run import-cap:sample

# Or with verbose output
node scripts/import-cap-data.js --file scripts/sample-cap-data.csv --verbose

# Dry run to preview what will be imported
node scripts/import-cap-data.js --file scripts/sample-cap-data.csv --dry-run
```

### 4. Configure Environment (Optional)

To enable Google Geocoding validation:

```bash
# Add to .env.local
GOOGLE_GEOCODING_API_KEY=your-api-key-here
```

## Test Cases

### Test Case 1: Valid CAP-City-Province Combination

**Input:**
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
  "usa_mittente_default": true
}
```

**Expected Result:**
- Status: 200 OK
- Shipment created successfully
- No validation errors

### Test Case 2: Wrong City for CAP

**Input:**
```json
{
  "destinatario": "Mario Rossi",
  "indirizzo": "Via Milano 45",
  "cap": "00185",
  "localita": "Milano",
  "provincia": "MI",
  "country": "IT",
  "peso": 1,
  "colli": 1,
  "contenuto": "Documenti",
  "telefono": "3331234567",
  "usa_mittente_default": true
}
```

**Expected Result:**
- Status: 400 Bad Request
- Error: "Destinatario: CAP '00185' appartiene a Roma (RM), non a Milano (MI)"
- Suggestion: city: "Roma", provincia: "RM"

### Test Case 3: Wrong Province for CAP

**Input:**
```json
{
  "destinatario": "Mario Rossi",
  "indirizzo": "Via Roma 123",
  "cap": "00185",
  "localita": "Roma",
  "provincia": "MI",
  "country": "IT",
  "peso": 1,
  "colli": 1,
  "contenuto": "Documenti",
  "telefono": "3331234567",
  "usa_mittente_default": true
}
```

**Expected Result:**
- Status: 400 Bad Request
- Error: "Destinatario: Provincia 'MI' non corrisponde al CAP 00185"
- Suggestion: provincia: "RM"

### Test Case 4: Non-existent CAP

**Input:**
```json
{
  "destinatario": "Mario Rossi",
  "indirizzo": "Via Test 1",
  "cap": "99999",
  "localita": "Roma",
  "provincia": "RM",
  "country": "IT",
  "peso": 1,
  "colli": 1,
  "contenuto": "Documenti",
  "telefono": "3331234567",
  "usa_mittente_default": true
}
```

**Expected Result:**
- Status: 400 Bad Request
- Error: "Destinatario: CAP '99999' non trovato nel database italiano"

### Test Case 5: Invalid CAP Format

**Input:**
```json
{
  "destinatario": "Mario Rossi",
  "indirizzo": "Via Test 1",
  "cap": "123",
  "localita": "Roma",
  "provincia": "RM",
  "country": "IT",
  "peso": 1,
  "colli": 1,
  "contenuto": "Documenti",
  "telefono": "3331234567",
  "usa_mittente_default": true
}
```

**Expected Result:**
- Status: 400 Bad Request
- Error: "CAP non valido (deve essere 5 cifre)"

### Test Case 6: Sender Address Validation

**Input:**
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
  "usa_mittente_default": false,
  "mittente_nome": "Azienda SRL",
  "mittente_indirizzo": "Via Milano 45",
  "mittente_cap": "20121",
  "mittente_citta": "Roma",
  "mittente_provincia": "RM"
}
```

**Expected Result:**
- Status: 400 Bad Request
- Error: "Mittente: Città 'Roma' non corrisponde al CAP 20121"
- Suggestion for sender: city: "Milano", provincia: "MI"

### Test Case 7: Both Addresses Invalid

**Input:**
```json
{
  "destinatario": "Mario Rossi",
  "indirizzo": "Via Test 1",
  "cap": "00185",
  "localita": "Milano",
  "provincia": "MI",
  "country": "IT",
  "peso": 1,
  "colli": 1,
  "contenuto": "Documenti",
  "telefono": "3331234567",
  "usa_mittente_default": false,
  "mittente_nome": "Azienda SRL",
  "mittente_indirizzo": "Via Test 2",
  "mittente_cap": "20121",
  "mittente_citta": "Roma",
  "mittente_provincia": "RM"
}
```

**Expected Result:**
- Status: 400 Bad Request
- Multiple validation errors:
  - "Destinatario: CAP '00185' appartiene a Roma (RM), non a Milano (MI)"
  - "Mittente: Città 'Roma' non corrisponde al CAP 20121"
- Suggestions for both addresses

## Manual Testing via cURL

### Basic Valid Request
```bash
curl -X POST http://localhost:3000/api/shipments \
  -H "Content-Type: application/json" \
  -H "Cookie: your-auth-cookie-here" \
  -d '{
    "destinatario": "Test User",
    "indirizzo": "Via Roma 1",
    "cap": "00185",
    "localita": "Roma",
    "provincia": "RM",
    "country": "IT",
    "peso": 1,
    "colli": 1,
    "contenuto": "Test",
    "telefono": "1234567890",
    "usa_mittente_default": true
  }'
```

### Invalid CAP Test
```bash
curl -X POST http://localhost:3000/api/shipments \
  -H "Content-Type: application/json" \
  -H "Cookie: your-auth-cookie-here" \
  -d '{
    "destinatario": "Test User",
    "indirizzo": "Via Test 1",
    "cap": "00185",
    "localita": "Milano",
    "provincia": "MI",
    "country": "IT",
    "peso": 1,
    "colli": 1,
    "contenuto": "Test",
    "telefono": "1234567890",
    "usa_mittente_default": true
  }'
```

## Frontend Testing

1. **Navigate to Create Shipment Page:**
   ```
   http://localhost:3000/dashboard/crea-spedizione
   ```

2. **Test Valid Input:**
   - Fill in all required fields with valid data
   - Use CAP: 00185, City: Roma, Province: RM
   - Click "Crea Spedizione"
   - Should see success message

3. **Test Invalid CAP-City Combination:**
   - Use CAP: 00185, City: Milano, Province: MI
   - Click "Crea Spedizione"
   - Should see validation error with suggestions

4. **Test Export CSV with Validation:**
   - Fill in data with invalid CAP combination
   - Click "Salva & Export CSV"
   - Should see validation error, CSV should not be generated

## Database Verification

### Check CAP Validation Table
```sql
-- Count total CAP entries
SELECT COUNT(*) FROM cap_validation;

-- Check specific CAP
SELECT * FROM cap_validation WHERE cap = '00185';

-- Check all CAPs for a city
SELECT * FROM cap_validation WHERE city_name = 'Roma' ORDER BY cap;

-- Find duplicate entries (should return empty)
SELECT cap, city_name, provincia, COUNT(*) 
FROM cap_validation 
GROUP BY cap, city_name, provincia 
HAVING COUNT(*) > 1;
```

### Check Shipments Created
```sql
-- View recent shipments
SELECT id, destinatario, cap, localita, provincia, created_at 
FROM spedizioni 
ORDER BY created_at DESC 
LIMIT 10;

-- Check validation logs
SELECT * FROM log_operazioni 
WHERE tipo = 'creazione_spedizione' 
ORDER BY timestamp DESC 
LIMIT 10;
```

## Performance Testing

### Load Test with Multiple Requests
```bash
# Create a test file with multiple shipments
cat > test-shipments.json << EOF
[
  {"destinatario": "Test 1", "cap": "00185", "localita": "Roma", "provincia": "RM"},
  {"destinatario": "Test 2", "cap": "20121", "localita": "Milano", "provincia": "MI"},
  {"destinatario": "Test 3", "cap": "80121", "localita": "Napoli", "provincia": "NA"}
]
EOF

# Send concurrent requests (requires GNU parallel)
cat test-shipments.json | jq -c '.[]' | parallel -j 10 \
  'curl -X POST http://localhost:3000/api/shipments \
   -H "Content-Type: application/json" \
   -H "Cookie: your-auth-cookie" \
   -d "$(echo {} | jq -c ". + {indirizzo: \"Via Test 1\", country: \"IT\", peso: 1, colli: 1, contenuto: \"Test\", telefono: \"123456789\", usa_mittente_default: true}")"'
```

## Edge Cases to Test

1. **Mixed Case Province Codes:**
   - Input: "rm" instead of "RM"
   - Should normalize and accept

2. **City Names with Apostrophes:**
   - Example: "Sant'Angelo"
   - Should handle special characters

3. **Multiple CAPs for Same City:**
   - Roma has many CAPs (00118-00199)
   - Each should validate correctly

4. **Empty Optional Fields:**
   - Test with minimal required fields only
   - Should create shipment successfully

5. **Very Long Addresses:**
   - Test with 200 character addresses
   - Should validate if within limits

## Debugging

### Enable Debug Logging

Add to `/app/api/shipments/route.ts`:

```typescript
const DEBUG = true // Set to true for debugging

if (DEBUG) {
  console.log('Request body:', JSON.stringify(body, null, 2))
  console.log('Validation result:', validationResult)
}
```

### Check API Logs
```bash
# In development
npm run dev
# Check terminal output for console.log statements

# In production
# Check your hosting platform's logs (Vercel, etc.)
```

### Common Issues and Solutions

| Issue | Possible Cause | Solution |
|-------|---------------|----------|
| "Non autenticato" | Missing authentication | Ensure user is logged in |
| "CAP non trovato" | CAP not in database | Import more CAP data |
| Slow validation | Large database queries | Add database indexes |
| Google API errors | Invalid API key | Check GOOGLE_GEOCODING_API_KEY |
| CORS errors | Frontend/backend mismatch | Check API endpoint URL |

## Validation Metrics

Track these metrics to measure validation effectiveness:

1. **Validation Success Rate:**
   - Percentage of shipments passing validation
   - Target: > 95%

2. **False Positive Rate:**
   - Valid addresses rejected
   - Target: < 1%

3. **Average Validation Time:**
   - Time to validate addresses
   - Target: < 500ms

4. **Suggestion Accuracy:**
   - Percentage of accepted suggestions
   - Target: > 80%

## Reporting Issues

When reporting validation issues, include:

1. Complete request payload
2. Exact error message received
3. Expected vs actual behavior
4. Browser/environment details
5. Screenshots if UI-related