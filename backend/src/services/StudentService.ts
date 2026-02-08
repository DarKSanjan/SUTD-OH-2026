import StudentDAO from '../dao/StudentDAO';
import TokenDAO from '../dao/TokenDAO';
import { Student } from '../models/Student';

export class StudentService {
  /**
   * Validate a student ID with case-insensitive matching
   * Sanitizes input by trimming whitespace
   */
  async validateStudentId(studentId: string): Promise<Student | null> {
    // Sanitize input: trim whitespace
    const sanitizedId = studentId.trim();
    
    // Return null for empty strings
    if (!sanitizedId) {
      return null;
    }
    
    // Find student with case-insensitive matching (handled by DAO)
    return await StudentDAO.findByStudentId(sanitizedId);
  }

  /**
   * Get student information by token
   */
  async getStudentByToken(token: string): Promise<Student | null> {
    // Sanitize input: trim whitespace
    const sanitizedToken = token.trim();
    
    // Return null for empty strings
    if (!sanitizedToken) {
      return null;
    }
    
    // Find token
    const tokenRecord = await TokenDAO.findByToken(sanitizedToken);
    
    if (!tokenRecord) {
      return null;
    }
    
    // Get student by student ID from token
    return await StudentDAO.findByStudentId(tokenRecord.studentId);
  }
}

export default new StudentService();
