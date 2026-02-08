import { describe, it, beforeAll, afterAll, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import { TokenDAO } from '../TokenDAO';
import { StudentDAO } from '../StudentDAO';
import { Student } from '../../models/Student';
import pool from '../../db/config';

/**
 * Feature: event-check-in-system
 * Property 7: Token Persistence and Association
 * 
 * For any generated token, after storing it in the database with its associated student ID, 
 * retrieving the token should return the correct student association, and the token should 
 * remain valid indefinitely.
 * 
 * Validates: Requirements 3.4, 3.6
 */

describe('Property 7: Token Persistence and Association', () => {
  const tokenDAO = new TokenDAO();
  const studentDAO = new StudentDAO();

  beforeAll(async () => {
    // Tables should already exist from migration
  });

  beforeEach(async () => {
    // Clean up before each test
    await pool.query('DELETE FROM tokens');
    await pool.query('DELETE FROM students');
  });

  afterAll(async () => {
    // Don't close pool - other tests might need it
  });

  it('should persist tokens and maintain correct student associations', async () => {
    // Define arbitraries
    const studentArbitrary = fc.record({
      studentId: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
      name: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
      tshirtSize: fc.constantFrom('XS', 'S', 'M', 'L', 'XL', 'XXL'),
      mealPreference: fc.constantFrom('Vegetarian', 'Non-Vegetarian', 'Vegan', 'Halal'),
      organizationDetails: fc.option(fc.string({ maxLength: 200 }), { nil: undefined })
    });

    const tokenArbitrary = fc.hexaString({ minLength: 64, maxLength: 64 });

    await fc.assert(
      fc.asyncProperty(
        studentArbitrary,
        tokenArbitrary,
        async (student: Student, token: string) => {
          // First, create the student
          await studentDAO.upsert(student);

          // Store the token with student association
          await tokenDAO.create(token, student.studentId);

          // Retrieve the token
          const retrievedToken = await tokenDAO.findByToken(token);

          // Verify the token was retrieved
          if (!retrievedToken) {
            throw new Error(`Token ${token} was not found after insertion`);
          }

          // Verify the student association is correct
          if (retrievedToken.studentId !== student.studentId) {
            throw new Error(
              `Token student association mismatch: expected ${student.studentId}, got ${retrievedToken.studentId}`
            );
          }

          // Verify the token value is correct
          if (retrievedToken.token !== token) {
            throw new Error(`Token value mismatch: expected ${token}, got ${retrievedToken.token}`);
          }

          // Verify we can find tokens by student ID
          const studentTokens = await tokenDAO.findByStudentId(student.studentId);
          
          if (studentTokens.length === 0) {
            throw new Error(`No tokens found for student ${student.studentId}`);
          }

          const foundToken = studentTokens.find(t => t.token === token);
          if (!foundToken) {
            throw new Error(`Token ${token} not found in student's token list`);
          }
        }
      ),
      { numRuns: 20 }
    );
  });
});
