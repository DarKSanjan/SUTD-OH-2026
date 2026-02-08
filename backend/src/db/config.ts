import { Pool } from 'pg';
import dotenv from 'dotenv';

// Load environment-specific .env file
const envFile = process.env.NODE_ENV === 'test' ? '.env.test' : '.env';
dotenv.config({ path: envFile });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20, // Maximum number of clients in the pool
  min: 2, // Minimum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 5000, // Increased to 5 seconds for better reliability
  maxUses: 7500, // Close and replace clients after 7500 uses
  allowExitOnIdle: false, // Keep pool alive
});

// Handle pool errors gracefully
pool.on('error', (err) => {
  console.error('Unexpected database error:', err);
  // Don't exit process in production, just log the error
  if (process.env.NODE_ENV !== 'production') {
    process.exit(-1);
  }
});

// Handle connection events for monitoring
pool.on('connect', () => {
  console.log('Database client connected');
});

pool.on('remove', () => {
  console.log('Database client removed from pool');
});

export default pool;
