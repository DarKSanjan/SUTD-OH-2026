/**
 * Shared utilities for serverless functions
 * Self-contained - no imports from backend/
 */

import { VercelRequest, VercelResponse } from '@vercel/node';
import { Pool } from 'pg';
import cors from 'cors';

// Database pool (singleton for serverless)
let pool: Pool | null = null;

export function getPool(): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      max: 5,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });
  }
  return pool;
}

// CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

export function withCors(
  handler: (req: VercelRequest, res: VercelResponse) => Promise<any>
) {
  return async (req: VercelRequest, res: VercelResponse) => {
    const corsMiddleware = cors(corsOptions);
    return new Promise((resolve, reject) => {
      corsMiddleware(req as any, res as any, async (result: any) => {
        if (result instanceof Error) return reject(result);
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

export function sendError(res: VercelResponse, statusCode: number, message: string, code?: string) {
  return res.status(statusCode).json({ success: false, error: message, code: code || 'ERROR' });
}

export function sendSuccess(res: VercelResponse, data: any) {
  return res.status(200).json({ success: true, ...data });
}

// --- Models ---

export interface Student {
  id?: number;
  studentId: string;
  name: string;
  tshirtSize: string;
  mealPreference: string;
  organizationDetails?: string;
}

export interface StudentInvolvement {
  club: string;
  role: string;
}

export function parseOrganizationDetails(organizationDetails?: string): StudentInvolvement[] {
  if (!organizationDetails || organizationDetails.trim() === '') return [];
  const involvements: StudentInvolvement[] = [];
  const entries = organizationDetails.split(';').map(e => e.trim()).filter(e => e !== '');
  for (const entry of entries) {
    const clubMatch = entry.match(/Club:\s*([^,]+)/i);
    const roleMatch = entry.match(/Involvement:\s*(.+)/i);
    if (clubMatch && roleMatch) {
      involvements.push({ club: clubMatch[1].trim(), role: roleMatch[1].trim() });
    }
  }
  return involvements;
}

export interface Claim {
  studentId: string;
  tshirtClaimed: boolean;
  mealClaimed: boolean;
}

// --- Database queries ---

export async function findStudentById(studentId: string): Promise<Student | null> {
  const db = getPool();
  const result = await db.query(
    `SELECT id, student_id as "studentId", name, tshirt_size as "tshirtSize", 
     meal_preference as "mealPreference", organization_details as "organizationDetails"
     FROM students WHERE LOWER(student_id) = LOWER($1)`,
    [studentId]
  );
  return result.rows.length > 0 ? result.rows[0] : null;
}

export async function findStudentByToken(token: string): Promise<Student | null> {
  const db = getPool();
  const tokenResult = await db.query(
    `SELECT student_id as "studentId" FROM tokens WHERE token = $1`,
    [token]
  );
  if (tokenResult.rows.length === 0) return null;
  return findStudentById(tokenResult.rows[0].studentId);
}

export async function createToken(token: string, studentId: string): Promise<void> {
  const db = getPool();
  await db.query(`INSERT INTO tokens (token, student_id) VALUES ($1, $2)`, [token, studentId]);
}

export async function getClaimStatus(studentId: string): Promise<Claim | null> {
  const db = getPool();
  const result = await db.query(
    `SELECT student_id as "studentId", tshirt_claimed as "tshirtClaimed", meal_claimed as "mealClaimed"
     FROM claims WHERE student_id = $1`,
    [studentId]
  );
  return result.rows.length > 0 ? result.rows[0] : null;
}

export async function initializeClaim(studentId: string): Promise<void> {
  const db = getPool();
  await db.query(
    `INSERT INTO claims (student_id, tshirt_claimed, meal_claimed) VALUES ($1, false, false) ON CONFLICT (student_id) DO NOTHING`,
    [studentId]
  );
}

export async function updateClaim(studentId: string, itemType: 'tshirt' | 'meal'): Promise<boolean> {
  const db = getPool();
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    const check = await client.query(
      `SELECT tshirt_claimed as "tshirtClaimed", meal_claimed as "mealClaimed" FROM claims WHERE student_id = $1 FOR UPDATE`,
      [studentId]
    );
    if (check.rows.length === 0) {
      await client.query(`INSERT INTO claims (student_id, tshirt_claimed, meal_claimed) VALUES ($1, false, false)`, [studentId]);
    } else {
      const claim = check.rows[0];
      if (itemType === 'tshirt' && claim.tshirtClaimed) { await client.query('ROLLBACK'); return false; }
      if (itemType === 'meal' && claim.mealClaimed) { await client.query('ROLLBACK'); return false; }
    }
    const col = itemType === 'tshirt' ? 'tshirt_claimed' : 'meal_claimed';
    const atCol = itemType === 'tshirt' ? 'tshirt_claimed_at' : 'meal_claimed_at';
    await client.query(
      `UPDATE claims SET ${col} = true, ${atCol} = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE student_id = $1`,
      [studentId]
    );
    await client.query('COMMIT');
    return true;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
