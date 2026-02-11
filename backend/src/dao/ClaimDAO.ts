import pool from '../db/config';
import { Claim } from '../models/Claim';

export class ClaimDAO {
  /**
   * Find claim record by student ID
   */
  async findByStudentId(studentId: string): Promise<Claim | null> {
    const query = `
      SELECT 
        id, 
        student_id as "studentId", 
        tshirt_claimed as "tshirtClaimed", 
        meal_claimed as "mealClaimed",
        tshirt_claimed_at as "tshirtClaimedAt",
        meal_claimed_at as "mealClaimedAt",
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM claims
      WHERE student_id = $1
    `;
    
    const result = await pool.query(query, [studentId]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return result.rows[0];
  }

  /**
   * Initialize a claim record for a student
   */
  async initializeForStudent(studentId: string): Promise<void> {
    const query = `
      INSERT INTO claims (student_id, tshirt_claimed, meal_claimed)
      VALUES ($1, false, false)
      ON CONFLICT (student_id) DO NOTHING
    `;
    
    await pool.query(query, [studentId]);
  }

  /**
   * Update a claim for a specific item type
   * Uses transaction to ensure atomicity
   */
  async updateClaim(studentId: string, itemType: 'tshirt' | 'meal'): Promise<boolean> {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // Check if already claimed
      const checkQuery = `
        SELECT 
          tshirt_claimed as "tshirtClaimed", 
          meal_claimed as "mealClaimed"
        FROM claims
        WHERE student_id = $1
        FOR UPDATE
      `;
      
      const checkResult = await client.query(checkQuery, [studentId]);
      
      if (checkResult.rows.length === 0) {
        // Initialize if doesn't exist
        await client.query(`
          INSERT INTO claims (student_id, tshirt_claimed, meal_claimed)
          VALUES ($1, false, false)
        `, [studentId]);
      } else {
        // Check if already claimed
        const claim = checkResult.rows[0];
        if (itemType === 'tshirt' && claim.tshirtClaimed) {
          await client.query('ROLLBACK');
          return false;
        }
        if (itemType === 'meal' && claim.mealClaimed) {
          await client.query('ROLLBACK');
          return false;
        }
      }

      // Update the claim
      const updateQuery = itemType === 'tshirt'
        ? `
          UPDATE claims
          SET tshirt_claimed = true, 
              tshirt_claimed_at = CURRENT_TIMESTAMP,
              updated_at = CURRENT_TIMESTAMP
          WHERE student_id = $1
        `
        : `
          UPDATE claims
          SET meal_claimed = true, 
              meal_claimed_at = CURRENT_TIMESTAMP,
              updated_at = CURRENT_TIMESTAMP
          WHERE student_id = $1
        `;
      
      await client.query(updateQuery, [studentId]);
      
      await client.query('COMMIT');
      return true;
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Update distribution status for a specific item type (bidirectional)
   * Supports both checking and unchecking status
   * Returns the updated claim status
   */
  async updateDistributionStatus(
    studentId: string, 
    itemType: 'tshirt' | 'meal', 
    collected: boolean
  ): Promise<Claim> {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // Check if claim record exists
      const checkQuery = `
        SELECT id
        FROM claims
        WHERE student_id = $1
        FOR UPDATE
      `;
      
      const checkResult = await client.query(checkQuery, [studentId]);
      
      if (checkResult.rows.length === 0) {
        // Initialize if doesn't exist
        await client.query(`
          INSERT INTO claims (student_id, tshirt_claimed, meal_claimed)
          VALUES ($1, false, false)
        `, [studentId]);
      }

      // Update the claim status
      const updateQuery = itemType === 'tshirt'
        ? `
          UPDATE claims
          SET tshirt_claimed = $1, 
              tshirt_claimed_at = CASE WHEN $1 = true THEN CURRENT_TIMESTAMP ELSE tshirt_claimed_at END,
              updated_at = CURRENT_TIMESTAMP
          WHERE student_id = $2
          RETURNING 
            id, 
            student_id as "studentId", 
            tshirt_claimed as "tshirtClaimed", 
            meal_claimed as "mealClaimed",
            tshirt_claimed_at as "tshirtClaimedAt",
            meal_claimed_at as "mealClaimedAt",
            created_at as "createdAt",
            updated_at as "updatedAt"
        `
        : `
          UPDATE claims
          SET meal_claimed = $1, 
              meal_claimed_at = CASE WHEN $1 = true THEN CURRENT_TIMESTAMP ELSE meal_claimed_at END,
              updated_at = CURRENT_TIMESTAMP
          WHERE student_id = $2
          RETURNING 
            id, 
            student_id as "studentId", 
            tshirt_claimed as "tshirtClaimed", 
            meal_claimed as "mealClaimed",
            tshirt_claimed_at as "tshirtClaimedAt",
            meal_claimed_at as "mealClaimedAt",
            created_at as "createdAt",
            updated_at as "updatedAt"
        `;
      
      const result = await client.query(updateQuery, [collected, studentId]);
      
      await client.query('COMMIT');
      return result.rows[0];
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}

export default new ClaimDAO();
