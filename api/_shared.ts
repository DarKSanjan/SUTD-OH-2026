/**
 * Shared utilities for serverless functions
 * This file contains common setup code used by all API endpoints
 */

import { VercelRequest, VercelResponse } from '@vercel/node';
import cors from 'cors';

// CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

/**
 * Wrapper to handle CORS for serverless functions
 */
export function withCors(
  handler: (req: VercelRequest, res: VercelResponse) => Promise<void>
) {
  return async (req: VercelRequest, res: VercelResponse) => {
    // Handle CORS
    const corsMiddleware = cors(corsOptions);
    
    return new Promise((resolve, reject) => {
      corsMiddleware(req as any, res as any, async (result: any) => {
        if (result instanceof Error) {
          return reject(result);
        }

        // Handle OPTIONS request
        if (req.method === 'OPTIONS') {
          res.status(200).end();
          return resolve(undefined);
        }

        try {
          await handler(req, res);
          resolve(undefined);
        } catch (error) {
          reject(error);
        }
      });
    });
  };
}

/**
 * Error response helper
 */
export function sendError(
  res: VercelResponse,
  statusCode: number,
  message: string,
  code?: string
) {
  return res.status(statusCode).json({
    success: false,
    error: message,
    code: code || 'ERROR',
  });
}

/**
 * Success response helper
 */
export function sendSuccess(res: VercelResponse, data: any) {
  return res.status(200).json({
    success: true,
    ...data,
  });
}

/**
 * Ensure database connection is ready
 * In serverless context, data should already be in the database from initial setup
 * This function is kept for compatibility but doesn't import CSV data
 */
let isInitialized = false;

export async function ensureDataImported() {
  if (!isInitialized) {
    try {
      // In production, data is already in the database from initial setup
      // We just verify the database connection works
      const pool = (await import('../backend/src/db/config')).default;
      await pool.query('SELECT 1');
      isInitialized = true;
      console.log('Database connection verified');
    } catch (error) {
      console.error('Database connection failed:', error);
      throw new Error('Database connection failed');
    }
  }
}
