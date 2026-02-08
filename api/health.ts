/**
 * Serverless function for /api/health endpoint
 * Simple health check endpoint
 */

import { VercelRequest, VercelResponse } from '@vercel/node';
import { withCors } from './_shared';

async function handler(req: VercelRequest, res: VercelResponse) {
  return res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
}

export default withCors(handler);
