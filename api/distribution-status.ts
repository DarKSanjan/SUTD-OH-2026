import { VercelRequest, VercelResponse } from '@vercel/node';
import { withCors, sendError, sendSuccess, getPool } from './_shared';

async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'PATCH') {
    return sendError(res, 405, 'Method not allowed', 'METHOD_NOT_ALLOWED');
  }

  try {
    const { studentId, itemType, collected } = req.body;

    // Validate inputs
    if (!studentId || typeof studentId !== 'string' || studentId.trim() === '') {
      return sendError(res, 400, 'Student ID is required', 'VALIDATION_ERROR');
    }

    if (!itemType || !['tshirt', 'meal'].includes(itemType)) {
      return sendError(res, 400, 'Item type must be "tshirt" or "meal"', 'VALIDATION_ERROR');
    }

    if (typeof collected !== 'boolean') {
      return sendError(res, 400, 'Collected must be a boolean', 'VALIDATION_ERROR');
    }

    const db = getPool();
    const client = await db.connect();

    try {
      await client.query('BEGIN');

      // Check if student exists
      const studentCheck = await client.query(
        'SELECT student_id FROM students WHERE LOWER(student_id) = LOWER($1)',
        [studentId.trim()]
      );

      if (studentCheck.rows.length === 0) {
        await client.query('ROLLBACK');
        return sendError(res, 404, 'Student not found', 'STUDENT_NOT_FOUND');
      }

      const actualStudentId = studentCheck.rows[0].student_id;

      // Initialize claim record if it doesn't exist
      await client.query(
        `INSERT INTO claims (student_id, tshirt_claimed, meal_claimed) 
         VALUES ($1, false, false) 
         ON CONFLICT (student_id) DO NOTHING`,
        [actualStudentId]
      );

      // Update the claim status
      const column = itemType === 'tshirt' ? 'tshirt_claimed' : 'meal_claimed';
      const timestampColumn = itemType === 'tshirt' ? 'tshirt_claimed_at' : 'meal_claimed_at';

      if (collected) {
        // Mark as collected
        await client.query(
          `UPDATE claims 
           SET ${column} = true, 
               ${timestampColumn} = CURRENT_TIMESTAMP, 
               updated_at = CURRENT_TIMESTAMP 
           WHERE student_id = $1`,
          [actualStudentId]
        );
      } else {
        // Unmark (set to false and clear timestamp)
        await client.query(
          `UPDATE claims 
           SET ${column} = false, 
               ${timestampColumn} = NULL, 
               updated_at = CURRENT_TIMESTAMP 
           WHERE student_id = $1`,
          [actualStudentId]
        );
      }

      // Get updated claim status
      const result = await client.query(
        `SELECT tshirt_claimed as "tshirtClaimed", 
                meal_claimed as "mealClaimed"
         FROM claims 
         WHERE student_id = $1`,
        [actualStudentId]
      );

      await client.query('COMMIT');

      return sendSuccess(res, {
        updatedStatus: {
          tshirtClaimed: result.rows[0].tshirtClaimed,
          mealClaimed: result.rows[0].mealClaimed,
        },
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error in /api/distribution-status:', error);
    return sendError(res, 500, 'Internal server error', 'INTERNAL_SERVER_ERROR');
  }
}

export default withCors(handler);
