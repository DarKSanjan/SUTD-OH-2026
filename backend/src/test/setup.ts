import { beforeAll } from 'vitest';
import pool from '../db/config';
import fs from 'fs';
import path from 'path';

// Run database migration before all tests
beforeAll(async () => {
  console.log('Running database migration for tests...');
  
  try {
    // Read and execute the schema SQL file
    const schemaPath = path.join(__dirname, '../db/schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf-8');
    
    await pool.query(schemaSql);
    
    console.log('Database migration completed successfully!');
    console.log('Tables created: students, tokens, claims');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
});
