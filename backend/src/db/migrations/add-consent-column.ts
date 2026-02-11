import pool from '../config';
import fs from 'fs';
import path from 'path';

/**
 * Migration: Add consent column to students table
 * This migration adds a consented boolean column to track PDPA consent
 */
async function addConsentColumn() {
  const client = await pool.connect();
  
  try {
    console.log('Starting migration: Add consent column...');
    
    // Read the migration SQL file
    const migrationPath = path.join(__dirname, 'add-consent-column.sql');
    const migrationSql = fs.readFileSync(migrationPath, 'utf-8');
    
    // Execute the migration
    await client.query(migrationSql);
    
    console.log('✓ Migration completed successfully!');
    console.log('✓ Added consented column to students table');
    
  } catch (error) {
    console.error('✗ Migration failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  addConsentColumn()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export default addConsentColumn;
