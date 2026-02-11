import { VercelRequest, VercelResponse } from '@vercel/node';
import { withCors, sendError, sendSuccess, getPool, parseOrganizationDetails } from './_shared';

async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return sendError(res, 405, 'Method not allowed', 'METHOD_NOT_ALLOWED');
  }

  try {
    const db = getPool();
    
    // Fetch all students with their claim status
    const result = await db.query(`
      SELECT 
        s.student_id as "studentId",
        s.name,
        s.tshirt_size as "tshirtSize",
        s.meal_preference as "mealPreference",
        s.organization_details as "organizationDetails",
        s.consented,
        COALESCE(c.tshirt_claimed, false) as "tshirtClaimed",
        COALESCE(c.meal_claimed, false) as "mealClaimed"
      FROM students s
      LEFT JOIN claims c ON s.student_id = c.student_id
      ORDER BY s.name ASC
    `);

    const students = result.rows.map(row => ({
      studentId: row.studentId,
      name: row.name,
      tshirtSize: row.tshirtSize,
      mealPreference: row.mealPreference,
      involvements: parseOrganizationDetails(row.organizationDetails),
      consented: row.consented,
      tshirtClaimed: row.tshirtClaimed,
      mealClaimed: row.mealClaimed,
    }));

    return sendSuccess(res, { students });
  } catch (error) {
    console.error('Error in /api/students:', error);
    return sendError(res, 500, 'Internal server error', 'INTERNAL_SERVER_ERROR');
  }
}

export default withCors(handler);
