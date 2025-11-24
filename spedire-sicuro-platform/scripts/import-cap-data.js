#!/usr/bin/env node

/**
 * Script to import Italian CAP (postal code) data into the cap_validation table
 * Usage: node scripts/import-cap-data.js --file cap-data.csv [--dry-run]
 * 
 * CSV Format:
 * cap,city_name,provincia,region
 * 00195,Roma,RM,Lazio
 * 20100,Milano,MI,Lombardia
 */

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')
const readline = require('readline')
const { parse } = require('csv-parse')

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') })

// Parse command line arguments
const args = process.argv.slice(2)
const fileIndex = args.indexOf('--file')
const dryRun = args.includes('--dry-run')
const verbose = args.includes('--verbose')

if (fileIndex === -1 || !args[fileIndex + 1]) {
  console.error('Usage: node import-cap-data.js --file <csv-file> [--dry-run] [--verbose]')
  process.exit(1)
}

const csvFile = args[fileIndex + 1]

if (!fs.existsSync(csvFile)) {
  console.error(`File not found: ${csvFile}`)
  process.exit(1)
}

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in environment variables')
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY)')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// Statistics
let stats = {
  total: 0,
  inserted: 0,
  skipped: 0,
  errors: 0,
  duplicates: 0
}

// Validate CAP format
function validateCAP(cap) {
  return /^\d{5}$/.test(cap)
}

// Validate province code format
function validateProvincia(provincia) {
  return /^[A-Z]{2}$/i.test(provincia)
}

// Process a batch of records
async function processBatch(batch) {
  if (batch.length === 0) return

  if (verbose) {
    console.log(`Processing batch of ${batch.length} records...`)
  }

  // Prepare data for insertion
  const validRecords = batch.filter(record => {
    if (!validateCAP(record.cap)) {
      console.error(`Invalid CAP format: ${record.cap}`)
      stats.errors++
      return false
    }
    if (!validateProvincia(record.provincia)) {
      console.error(`Invalid provincia format: ${record.provincia} for CAP ${record.cap}`)
      stats.errors++
      return false
    }
    if (!record.city_name || record.city_name.trim() === '') {
      console.error(`Missing city_name for CAP ${record.cap}`)
      stats.errors++
      return false
    }
    return true
  }).map(record => ({
    cap: record.cap,
    city_name: record.city_name.trim(),
    provincia: record.provincia.toUpperCase(),
    region: record.region ? record.region.trim() : null,
    is_active: true
  }))

  if (validRecords.length === 0) return

  if (dryRun) {
    console.log('DRY RUN - Would insert:')
    validRecords.forEach(record => {
      console.log(`  ${record.cap} - ${record.city_name} (${record.provincia}) - ${record.region || 'N/A'}`)
    })
    stats.inserted += validRecords.length
    return
  }

  try {
    // Insert records with conflict handling
    const { data, error } = await supabase
      .from('cap_validation')
      .upsert(validRecords, {
        onConflict: 'cap,city_name,provincia',
        ignoreDuplicates: true
      })
      .select()

    if (error) {
      console.error('Database error:', error.message)
      stats.errors += validRecords.length
    } else {
      const insertedCount = data ? data.length : 0
      stats.inserted += insertedCount
      stats.duplicates += validRecords.length - insertedCount
      
      if (verbose && insertedCount > 0) {
        console.log(`✓ Inserted ${insertedCount} records`)
      }
      if (verbose && validRecords.length - insertedCount > 0) {
        console.log(`○ Skipped ${validRecords.length - insertedCount} duplicates`)
      }
    }
  } catch (error) {
    console.error('Unexpected error:', error.message)
    stats.errors += validRecords.length
  }
}

// Main import function
async function importData() {
  console.log(`Starting CAP data import from ${csvFile}`)
  if (dryRun) {
    console.log('🔍 DRY RUN MODE - No data will be inserted')
  }

  const fileStream = fs.createReadStream(csvFile)
  const parser = parse({
    columns: true,
    skip_empty_lines: true,
    trim: true,
    skip_records_with_error: true,
    on_record: (record) => {
      stats.total++
      return record
    }
  })

  let batch = []
  const BATCH_SIZE = 100

  return new Promise((resolve, reject) => {
    fileStream
      .pipe(parser)
      .on('data', async (row) => {
        batch.push(row)
        
        // Process batch when it reaches the size limit
        if (batch.length >= BATCH_SIZE) {
          parser.pause()
          await processBatch(batch)
          batch = []
          parser.resume()
        }
      })
      .on('end', async () => {
        // Process remaining records
        if (batch.length > 0) {
          await processBatch(batch)
        }
        resolve()
      })
      .on('error', (error) => {
        console.error('CSV parsing error:', error.message)
        reject(error)
      })
  })
}

// Verify database connection
async function verifyConnection() {
  try {
    const { count, error } = await supabase
      .from('cap_validation')
      .select('*', { count: 'exact', head: true })

    if (error) {
      console.error('Failed to connect to database:', error.message)
      return false
    }

    console.log(`✓ Connected to database (current records: ${count || 0})`)
    return true
  } catch (error) {
    console.error('Connection error:', error.message)
    return false
  }
}

// Main execution
async function main() {
  console.log('====================================')
  console.log('   CAP Data Import Tool')
  console.log('====================================\n')

  // Verify database connection
  if (!await verifyConnection()) {
    console.error('\n❌ Failed to connect to database')
    process.exit(1)
  }

  // Start import
  const startTime = Date.now()
  
  try {
    await importData()
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2)
    
    console.log('\n====================================')
    console.log('   Import Complete')
    console.log('====================================')
    console.log(`Total records processed: ${stats.total}`)
    console.log(`✓ Inserted: ${stats.inserted}`)
    console.log(`○ Duplicates skipped: ${stats.duplicates}`)
    console.log(`✗ Errors: ${stats.errors}`)
    console.log(`Time: ${duration} seconds`)
    
    if (dryRun) {
      console.log('\n📝 This was a DRY RUN - no data was actually inserted')
    }
    
    process.exit(stats.errors > 0 ? 1 : 0)
    
  } catch (error) {
    console.error('\n❌ Import failed:', error.message)
    process.exit(1)
  }
}

// Handle uncaught errors
process.on('unhandledRejection', (error) => {
  console.error('Unhandled error:', error)
  process.exit(1)
})

// Run the import
main()