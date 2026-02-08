import pool from './config';

async function checkConnection() {
  try {
    console.log('Checking database connection...');
    console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');
    
    const result = await pool.query('SELECT NOW()');
    console.log('✓ Database connection successful!');
    console.log('Current time from database:', result.rows[0].now);
    
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('✗ Database connection failed:');
    console.error(error);
    process.exit(1);
  }
}

checkConnection();
