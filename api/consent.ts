import { VercelRequest, VercelResponse } from '@vercel/node';
import { withCors, sendError, sendSuccess, getPool } from './_shared';

async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return sendError(res, 405, 'Method not allowed', 'METHOD_NOT_ALLOWED');
  }

  try {
    const { studentId, consented } = req.body;

    if (!studentId || typeof studentId !== 'string' || studentId.trim() === '') {
      return sendError(res, 400, 'Student ID is required', 'VALIDATION_ERROR');
    }

    if (typeof consented !== 'boolean') {
      return sendError(res, 400, 'Consent value must be a boolean', 'VALIDATION_ERROR');
    }

    const db = getPool();
    const result = await db.query(
      `UPDATE students SET consented = $1, updated_at = CURRENT_TIMESTAMP 
       WHERE LOWER(student_id) = LOWER($2) 
       RETURNING student_id as "studentId", consented`,
      [consented, studentId.trim()]
    );

    if (result.rows.length === 0) {
      return sendError(res, 404, 'Student not found', 'STUDENT_NOT_FOUND');
    }

    return sendSuccess(res, {
      studentId: result.rows[0].studentId,
      consented: result.rows[0].consented,
    });
  } catch (error) {
    console.error('Error in /api/consent:', error);
    return sendError(res, 500, 'Internal server error', 'INTERNAL_SERVER_ERROR');
  }
}

export default withCors(handler);
