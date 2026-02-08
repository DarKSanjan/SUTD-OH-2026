#!/usr/bin/env ts-node

/**
 * Script to import CSV data to Supabase database
 * 
 * Usage:
 *   1. Set DATABASE_URL environment variable to your Supabase connection string
 *   2. Run: npx ts-node scripts/import-csv-to-supabase.ts
 * 
 * Or create a .env file in the backend directory with:
 *   DATABASE_URL=postgresql://postgres:[password]@db.xxx.supabase.co:5432/postgres
 */

import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', 'backend', '.env') });

async function importCSV() {
  console.log('='.repeat(60));
  console.log('CSV Import to Supabase');
  console.log('='.repeat(60));
  console.log();

  // Check DATABASE_URL
  if (!process.env.DATABASE_URL) {
    console.error('❌ ERROR: DATABASE_URL environment variable not set');
    console.error();
    console.error('Please set DATABASE_URL to your Supabase connection string:');
    console.error('  export DATABASE_URL="postgresql://postgres:[password]@db.xxx.supabase.co:5432/postgres"');
    console.error();
    console.error('Or create a .env file in the backend directory with:');
    console.error('  DATABASE_URL=postgresql://postgres:[password]@db.xxx.supabase.co:5432/postgres');
    process.exit(1);
  }

  // Check CSV file exists
  const csvPath = path.join(__dirname, '..', 'backend', 'Open House 2026 Student Organisations Involvement 1.csv');
  if (!fs.existsSync(csvPath)) {
    console.error(`❌ ERROR: CSV file not found at: ${csvPath}`);
    process.exit(1);
  }

  console.log('✓ DATABASE_URL found');
  console.log('✓ CSV file found');
  console.log();

  try {
    // Import StudentDAO
    const StudentDAO = (await import('../backend/src/dao/StudentDAO')).default;

    console.log('Starting import...');
    console.log();

    const importedCount = await StudentDAO.importFromCSV(csvPath);

    console.log();
    console.log('='.repeat(60));
    console.log(`✓ SUCCESS: Imported ${importedCount} student records`);
    console.log('='.repeat(60));
    console.log();
    console.log('Next steps:');
    console.log('  1. Verify data in Supabase dashboard (Table Editor → students)');
    console.log('  2. Deploy to Vercel');
    console.log('  3. Test the deployment');
    console.log();

    process.exit(0);
  } catch (error) {
    console.error();
    console.error('='.repeat(60));
    console.error('❌ IMPORT FAILED');
    console.error('='.repeat(60));
    console.error();
    console.error('Error:', error instanceof Error ? error.message : error);
    console.error();
    console.error('Troubleshooting:');
    console.error('  1. Check DATABASE_URL is correct');
    console.error('  2. Verify Supabase project is active');
    console.error('  3. Ensure database schema is created (run schema.sql)');
    console.error('  4. Check network connection');
    console.error();
    process.exit(1);
  }
}

// Run the import
importCSV();
