import pool from '../db/config';
import { Token } from '../models/Token';

export class TokenDAO {
  /**
   * Create a new token associated with a student
   */
  async create(token: string, studentId: string): Promise<void> {
    const query = `
      INSERT INTO tokens (token, student_id)
      VALUES ($1, $2)
    `;
    
    await pool.query(query, [token, studentId]);
  }

  /**
   * Find a token by its value
   */
  async findByToken(token: string): Promise<Token | null> {
    const query = `
      SELECT 
        id, 
        token, 
        student_id as "studentId", 
        created_at as "createdAt"
      FROM tokens
      WHERE token = $1
    `;
    
    const result = await pool.query(query, [token]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return result.rows[0];
  }

  /**
   * Find all tokens for a specific student
   */
  async findByStudentId(studentId: string): Promise<Token[]> {
    const query = `
      SELECT 
        id, 
        token, 
        student_id as "studentId", 
        created_at as "createdAt"
      FROM tokens
      WHERE student_id = $1
      ORDER BY created_at DESC
    `;
    
    const result = await pool.query(query, [studentId]);
    
    return result.rows;
  }
}

export default new TokenDAO();
