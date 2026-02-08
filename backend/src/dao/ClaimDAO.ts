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
}

export default new ClaimDAO();
