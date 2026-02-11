import pool from '../db/config';
import { Student } from '../models/Student';
import CSVParser from '../services/CSVParser';

export class StudentDAO {
  /**
   * T-shirt size order for comparison (smaller to larger)
   */
  private static readonly TSHIRT_SIZE_ORDER = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '2XL', '3XL', '4XL', '5XL'];

  /**
   * Compare two t-shirt sizes and return the larger one
   * @param size1 First t-shirt size
   * @param size2 Second t-shirt size
   * @returns The larger t-shirt size
   */
  private compareTshirtSizes(size1: string, size2: string): string {
    const index1 = StudentDAO.TSHIRT_SIZE_ORDER.indexOf(size1.toUpperCase());
    const index2 = StudentDAO.TSHIRT_SIZE_ORDER.indexOf(size2.toUpperCase());
    
    // If either size is not found, prefer the one that is found
    if (index1 === -1) return size2;
    if (index2 === -1) return size1;
    
    // Return the larger size
    return index1 > index2 ? size1 : size2;
  }

  /**
   * Consolidate duplicate student records into a single record
   * - Selects the largest t-shirt size among all entries
   * - Preserves all organization involvement details
   * - Uses the first non-empty value for other fields
   * @param students Array of student records with the same Student_ID
   * @returns Consolidated student record
   */
  consolidateDuplicates(students: Student[]): Student {
    if (students.length === 0) {
      throw new Error('Cannot consolidate empty array of students');
    }
    
    if (students.length === 1) {
      return students[0];
    }
    
    // Collect all organization details
    const allOrganizationDetails: string[] = [];
    let largestTshirtSize = '';
    let mealPreference = '';
    
    // Process all students to find the largest t-shirt size and collect all involvements
    for (const student of students) {
      // Collect organization details
      if (student.organizationDetails && student.organizationDetails.trim() !== '') {
        allOrganizationDetails.push(student.organizationDetails);
      }
      
      // Find largest t-shirt size
      if (student.tshirtSize && student.tshirtSize.trim() !== '') {
        if (largestTshirtSize === '') {
          largestTshirtSize = student.tshirtSize;
        } else {
          largestTshirtSize = this.compareTshirtSizes(largestTshirtSize, student.tshirtSize);
        }
      }
      
      // Use first non-empty meal preference
      if (!mealPreference && student.mealPreference && student.mealPreference.trim() !== '') {
        mealPreference = student.mealPreference;
      }
    }
    
    // Create consolidated record
    const consolidated: Student = {
      studentId: students[0].studentId,
      name: students[0].name,
      tshirtSize: largestTshirtSize,
      mealPreference: mealPreference,
      organizationDetails: allOrganizationDetails.join('; ')
    };
    
    return consolidated;
  }

  /**
   * Find a student by their student ID (case-insensitive)
   */
  async findByStudentId(studentId: string): Promise<Student | null> {
    const query = `
      SELECT 
        id, 
        student_id as "studentId", 
        name, 
        tshirt_size as "tshirtSize", 
        meal_preference as "mealPreference", 
        organization_details as "organizationDetails",
        consented,
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM students
      WHERE LOWER(student_id) = LOWER($1)
    `;
    
    const result = await pool.query(query, [studentId]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return result.rows[0];
  }

  /**
   * Get the total count of students in the database
   * Used to check if initial CSV import is needed
   */
  async getStudentCount(): Promise<number> {
    const query = 'SELECT COUNT(*) as count FROM students';
    const result = await pool.query(query);
    return parseInt(result.rows[0].count, 10);
  }

  /**
   * Insert or update a student record
   */
  async upsert(student: Student): Promise<void> {
    const query = `
      INSERT INTO students (student_id, name, tshirt_size, meal_preference, organization_details, consented, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
      ON CONFLICT (student_id) 
      DO UPDATE SET
        name = EXCLUDED.name,
        tshirt_size = EXCLUDED.tshirt_size,
        meal_preference = EXCLUDED.meal_preference,
        organization_details = EXCLUDED.organization_details,
        consented = EXCLUDED.consented,
        updated_at = CURRENT_TIMESTAMP
    `;
    
    await pool.query(query, [
      student.studentId,
      student.name,
      student.tshirtSize,
      student.mealPreference,
      student.organizationDetails || null,
      student.consented ?? false
    ]);
  }

  /**
   * Update consent status for a student
   */
  async updateConsent(studentId: string, consented: boolean): Promise<void> {
    const query = `
      UPDATE students
      SET consented = $1, updated_at = CURRENT_TIMESTAMP
      WHERE LOWER(student_id) = LOWER($2)
    `;
    
    await pool.query(query, [consented, studentId]);
  }

  /**
   * Get all students with their claim status
   * Returns all student records with consent and distribution status
   */
  async getAllStudents(): Promise<Array<{
    studentId: string;
    name: string;
    tshirtSize: string;
    mealPreference: string;
    shirtCollected: boolean;
    mealCollected: boolean;
    consented: boolean;
    organizationDetails?: string;
  }>> {
    const query = `
      SELECT 
        s.student_id as "studentId",
        s.name,
        COALESCE(s.tshirt_size, '') as "tshirtSize",
        COALESCE(s.meal_preference, '') as "mealPreference",
        COALESCE(c.tshirt_claimed, false) as "shirtCollected",
        COALESCE(c.meal_claimed, false) as "mealCollected",
        s.consented,
        s.organization_details as "organizationDetails"
      FROM students s
      LEFT JOIN claims c ON s.student_id = c.student_id
      ORDER BY s.student_id ASC
    `;
    
    const result = await pool.query(query);
    return result.rows;
  }

  /**
   * Import students from a CSV file
   * Detects and consolidates duplicate Student_IDs
   */
  async importFromCSV(filePath: string): Promise<number> {
    // Parse and validate CSV
    const parseResult = CSVParser.parseCSV(filePath);
    
    // Log validation errors as warnings, but continue with valid students
    if (parseResult.errors.length > 0) {
      console.warn(`⚠ CSV validation warnings (${parseResult.errors.length} rows skipped):`);
      parseResult.errors.forEach(error => {
        console.warn(`  Row ${error.row}: Missing ${error.missingFields.join(', ')}`);
      });
    }

    // Group students by Student_ID to detect duplicates
    const studentGroups = new Map<string, Student[]>();
    
    for (const student of parseResult.students) {
      const studentId = student.studentId.toLowerCase(); // Case-insensitive grouping
      
      if (!studentGroups.has(studentId)) {
        studentGroups.set(studentId, []);
      }
      
      studentGroups.get(studentId)!.push(student);
    }

    let importedCount = 0;

    // Consolidate duplicates and import
    for (const [studentId, students] of studentGroups.entries()) {
      let studentToImport: Student;
      
      if (students.length > 1) {
        // Consolidate duplicate records
        studentToImport = this.consolidateDuplicates(students);
        console.log(`✓ Consolidated ${students.length} records for student ${studentId}`);
      } else {
        // Single record, no consolidation needed
        studentToImport = students[0];
      }
      
      await this.upsert(studentToImport);
      importedCount++;
    }

    return importedCount;
  }
}

export default new StudentDAO();
