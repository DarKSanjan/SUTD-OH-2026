import { VercelRequest, VercelResponse } from '@vercel/node';
import { withCors, getPool } from './_shared';

async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const db = getPool();
    await db.query('SELECT 1');
    return res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: 'Database connection failed',
    });
  }
}

export default withCors(handler);
