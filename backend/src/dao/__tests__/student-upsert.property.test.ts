import { describe, it, beforeAll, afterAll, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import { StudentDAO } from '../StudentDAO';
import { Student } from '../../models/Student';
import pool from '../../db/config';

/**
 * Feature: event-check-in-system
 * Property 3: Student Record Upsert
 * 
 * For any existing student record in the database, importing CSV data with the same Student_ID 
 * should update the existing record rather than creating a duplicate, and the updated record 
 * should reflect the new CSV data.
 * 
 * Validates: Requirements 1.5
 */

describe('Property 3: Student Record Upsert', () => {
  const studentDAO = new StudentDAO();

  beforeAll(async () => {
    // Tables should already exist from migration
  });

  beforeEach(async () => {
    // Clean up before each test
    await pool.query('DELETE FROM students');
  });

  afterAll(async () => {
    // Don't close pool - other tests might need it
  });

  it('should update existing records instead of creating duplicates', async () => {
    // Define arbitraries for generating random student data
    const studentArbitrary = fc.record({
      studentId: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
      name: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
      tshirtSize: fc.constantFrom('XS', 'S', 'M', 'L', 'XL', 'XXL'),
      mealPreference: fc.constantFrom('Vegetarian', 'Non-Vegetarian', 'Vegan', 'Halal'),
      organizationDetails: fc.option(fc.string({ maxLength: 200 }), { nil: undefined })
    });

    await fc.assert(
      fc.asyncProperty(
        studentArbitrary,
        studentArbitrary,
        async (initialStudent: Student, updatedData: Student) => {
          // Use the same student ID for both records
          const updatedStudent = { ...updatedData, studentId: initialStudent.studentId };

          // Insert the initial student
          await studentDAO.upsert(initialStudent);

          // Count records before update
          const countBefore = await pool.query(
            'SELECT COUNT(*) FROM students WHERE LOWER(student_id) = LOWER($1)',
            [initialStudent.studentId]
          );

          // Update the student with new data
          await studentDAO.upsert(updatedStudent);

          // Count records after update
          const countAfter = await pool.query(
            'SELECT COUNT(*) FROM students WHERE LOWER(student_id) = LOWER($1)',
            [initialStudent.studentId]
          );

          // Verify no duplicate was created
          if (parseInt(countBefore.rows[0].count) !== 1) {
            throw new Error(`Expected 1 record before update, got ${countBefore.rows[0].count}`);
          }
          if (parseInt(countAfter.rows[0].count) !== 1) {
            throw new Error(`Expected 1 record after update, got ${countAfter.rows[0].count}`);
          }

          // Retrieve the updated student
          const retrieved = await studentDAO.findByStudentId(initialStudent.studentId);

          if (!retrieved) {
            throw new Error(`Student with ID ${initialStudent.studentId} was not found after update`);
          }

          // Verify the record was updated with new data
          if (retrieved.name !== updatedStudent.name) {
            throw new Error(`Name was not updated: expected ${updatedStudent.name}, got ${retrieved.name}`);
          }
          if (retrieved.tshirtSize !== updatedStudent.tshirtSize) {
            throw new Error(`T-shirt size was not updated: expected ${updatedStudent.tshirtSize}, got ${retrieved.tshirtSize}`);
          }
          if (retrieved.mealPreference !== updatedStudent.mealPreference) {
            throw new Error(`Meal preference was not updated: expected ${updatedStudent.mealPreference}, got ${retrieved.mealPreference}`);
          }
        }
      ),
      { numRuns: 20 }
    );
  });
});
