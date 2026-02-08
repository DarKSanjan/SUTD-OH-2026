import { describe, it, beforeAll, afterAll, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import { StudentDAO } from '../StudentDAO';
import { Student } from '../../models/Student';
import pool from '../../db/config';

/**
 * Feature: event-check-in-system
 * Property 2: Student Record Persistence
 * 
 * For any valid student record, after storing it in the database, 
 * retrieving it by student ID should return an equivalent record 
 * with all fields intact (Student_ID, name, t-shirt size, meal preference, organization details).
 * 
 * Validates: Requirements 1.4
 */

describe('Property 2: Student Record Persistence', () => {
  const studentDAO = new StudentDAO();

  beforeAll(async () => {
    // Tables should already exist from migration
    // Just ensure they're clean
  });

  beforeEach(async () => {
    // Clean up before each test
    await pool.query('DELETE FROM students');
  });

  afterAll(async () => {
    // Don't close pool - other tests might need it
  });

  it('should persist and retrieve student records with all fields intact', async () => {
    // Define arbitraries for generating random student data
    const studentArbitrary = fc.record({
      studentId: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
      name: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
      tshirtSize: fc.constantFrom('XS', 'S', 'M', 'L', 'XL', 'XXL'),
      mealPreference: fc.constantFrom('Vegetarian', 'Non-Vegetarian', 'Vegan', 'Halal'),
      organizationDetails: fc.option(fc.string({ maxLength: 200 }), { nil: undefined })
    });

    await fc.assert(
      fc.asyncProperty(studentArbitrary, async (student: Student) => {
        // Store the student
        await studentDAO.upsert(student);

        // Retrieve the student
        const retrieved = await studentDAO.findByStudentId(student.studentId);

        // Verify the student was retrieved
        if (!retrieved) {
          throw new Error(`Student with ID ${student.studentId} was not found after insertion`);
        }

        // Verify all fields match
        if (retrieved.studentId !== student.studentId) {
          throw new Error(`Student ID mismatch: expected ${student.studentId}, got ${retrieved.studentId}`);
        }
        if (retrieved.name !== student.name) {
          throw new Error(`Name mismatch: expected ${student.name}, got ${retrieved.name}`);
        }
        if (retrieved.tshirtSize !== student.tshirtSize) {
          throw new Error(`T-shirt size mismatch: expected ${student.tshirtSize}, got ${retrieved.tshirtSize}`);
        }
        if (retrieved.mealPreference !== student.mealPreference) {
          throw new Error(`Meal preference mismatch: expected ${student.mealPreference}, got ${retrieved.mealPreference}`);
        }
        
        // Handle optional organization details (null vs undefined vs empty string)
        const expectedOrgDetails = student.organizationDetails || null;
        const actualOrgDetails = retrieved.organizationDetails || null;
        if (actualOrgDetails !== expectedOrgDetails) {
          throw new Error(`Organization details mismatch: expected ${expectedOrgDetails}, got ${actualOrgDetails}`);
        }
      }),
      { numRuns: 20 }
    );
  });
});
