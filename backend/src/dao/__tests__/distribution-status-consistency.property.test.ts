import { describe, it, beforeAll, afterAll, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import { StudentDAO } from '../StudentDAO';
import { Student } from '../../models/Student';
import pool from '../../db/config';

/**
 * Feature: ui-ux-enhancements
 * Property 6: Distribution Status Consistency
 * 
 * For any student ID, when consent is recorded in the database, 
 * retrieving that student's record should return the same consent state.
 * 
 * **Validates: Requirements 4.5, 4.6**
 */

describe('Property 6: Distribution Status Consistency', () => {
  const studentDAO = new StudentDAO();

  beforeAll(async () => {
    // Tables should already exist from migration
  });

  beforeEach(async () => {
    // Clean up before each test - use TRUNCATE for complete cleanup
    await pool.query('TRUNCATE TABLE claims, students RESTART IDENTITY CASCADE');
  });

  afterAll(async () => {
    // Don't close pool - other tests might need it
  });

  it('should persist any distribution status change to database', async () => {
    // Define arbitraries for student data with consent
    const studentArbitrary = fc.record({
      studentId: fc.string({ minLength: 1, maxLength: 40 })
        .filter(s => s.trim().length > 0)
        .map(s => `consent-test-${s}`.toLowerCase()), // Add unique prefix and lowercase
      name: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
      tshirtSize: fc.constantFrom('XS', 'S', 'M', 'L', 'XL', 'XXL'),
      mealPreference: fc.constantFrom('Vegetarian', 'Non-Vegetarian', 'Vegan', 'Halal'),
      organizationDetails: fc.option(fc.string({ maxLength: 200 }), { nil: undefined }),
      consented: fc.boolean()
    });

    await fc.assert(
      fc.asyncProperty(
        studentArbitrary,
        async (student: Student) => {
          // Record consent by upserting the student with consent state
          await studentDAO.upsert(student);

          // Retrieve the student record
          const retrievedStudent = await studentDAO.findByStudentId(student.studentId);

          // Verify the student was found
          if (!retrievedStudent) {
            throw new Error(`Student ${student.studentId} was not found after insertion`);
          }

          // Verify the consent state matches what was stored
          if (retrievedStudent.consented !== student.consented) {
            throw new Error(
              `Consent state mismatch for student ${student.studentId}: ` +
              `expected ${student.consented}, got ${retrievedStudent.consented}`
            );
          }

          // Verify consent is a boolean value
          if (typeof retrievedStudent.consented !== 'boolean') {
            throw new Error(
              `Consent state is not a boolean for student ${student.studentId}: ` +
              `got type ${typeof retrievedStudent.consented}`
            );
          }
        }
      ),
      { numRuns: 100 }
    );
  }, 60000);

});
