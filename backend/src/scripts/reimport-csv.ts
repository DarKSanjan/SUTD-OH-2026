/**
 * Script to re-import CSV data with updated parser logic
 * Run with: npx ts-node src/scripts/reimport-csv.ts
 */

import pool from '../db/config';
import StudentDAO from '../dao/StudentDAO';
import path from 'path';

async function reimportCSV() {
  try {
    console.log('🔄 Starting CSV re-import...');
    
    // Clear existing student data
    console.log('🗑️  Clearing existing student data...');
    await pool.query('DELETE FROM students');
    console.log('✓ Cleared students table');
    
    // Import CSV with new logic
    const csvPath = path.join(__dirname, '../../Open House 2026 Student Organisations Involvement 1.csv');
    console.log(`📂 Importing from: ${csvPath}`);
    
    const count = await StudentDAO.importFromCSV(csvPath);
    
    console.log(`✅ Successfully imported ${count} students`);
    
    // Verify import
    const result = await pool.query('SELECT COUNT(*) as count FROM students');
    console.log(`✓ Database now contains ${result.rows[0].count} student records`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during re-import:', error);
    process.exit(1);
  }
}

reimportCSV();
