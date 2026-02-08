import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import * as fc from 'fast-check';
import pool from '../../db/config';
import StudentDAO from '../../dao/StudentDAO';
import TokenService from '../TokenService';
import StudentService from '../StudentService';

/**
 * Feature: event-check-in-system
 * Property 8: Token Validation
 * 
 * Validates: Requirements 4.3, 4.4, 4.5
 * 
 * For any token input, the validation process should return the associated student 
 * information (name, Student_ID, t-shirt size, meal preference) if the token exists 
 * in the database, or return an error if the token is invalid.
 */

describe('Property 8: Token Validation', () => {
  beforeAll(async () => {
    // Clean up test data
    await pool.query('DELETE FROM claims');
    await pool.query('DELETE FROM tokens');
    await pool.query('DELETE FROM students');
  });

  afterAll(async () => {
    // Clean up test data
    await pool.query('DELETE FROM claims');
    await pool.query('DELETE FROM tokens');
    await pool.query('DELETE FROM students');
    await pool.end();
  });

  it('should return student info for valid tokens and null for invalid tokens', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          studentId: fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim().length > 0).map(s => s.trim()),
          name: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0).map(s => s.trim()),
          tshirtSize: fc.constantFrom('XS', 'S', 'M', 'L', 'XL', 'XXL'),
          mealPreference: fc.constantFrom('Vegetarian', 'Non-Vegetarian', 'Vegan'),
        }),
        fc.hexaString({ minLength: 64, maxLength: 64 }),
        async (student, invalidToken) => {
          // Clean up any existing data first to avoid conflicts
          await pool.query('DELETE FROM tokens WHERE student_id = $1', [student.studentId]);
          await pool.query('DELETE FROM students WHERE student_id = $1', [student.studentId]);
          
          try {
            // Insert student
            await StudentDAO.upsert(student);

            // Generate and store a valid token
            const validToken = await TokenService.storeToken(student.studentId);

            // Test 1: Valid token should return true
            const isValid = await TokenService.validateToken(validToken);
            expect(isValid).toBe(true);

            // Test 2: Valid token should return associated student info
            const studentInfo = await StudentService.getStudentByToken(validToken);
            expect(studentInfo).not.toBeNull();
            expect(studentInfo?.studentId).toBe(student.studentId);
            expect(studentInfo?.name).toBe(student.name);
            expect(studentInfo?.tshirtSize).toBe(student.tshirtSize);
            expect(studentInfo?.mealPreference).toBe(student.mealPreference);

            // Test 3: Invalid token should return false
            // Make sure invalidToken is different from validToken
            if (invalidToken !== validToken) {
              const isInvalid = await TokenService.validateToken(invalidToken);
              expect(isInvalid).toBe(false);

              // Test 4: Invalid token should return null for student info
              const noStudent = await StudentService.getStudentByToken(invalidToken);
              expect(noStudent).toBeNull();
            }
          } finally {
            // Clean up - always execute even if test fails
            await pool.query('DELETE FROM tokens WHERE student_id = $1', [student.studentId]);
            await pool.query('DELETE FROM students WHERE student_id = $1', [student.studentId]);
          }
        }
      ),
      { numRuns: 10, endOnFailure: true }
    );
  }, 60000);

  it('should handle whitespace in token validation', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          studentId: fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim().length > 0).map(s => s.trim()),
          name: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0).map(s => s.trim()),
          tshirtSize: fc.constantFrom('XS', 'S', 'M', 'L', 'XL', 'XXL'),
          mealPreference: fc.constantFrom('Vegetarian', 'Non-Vegetarian', 'Vegan'),
        }),
        async (student) => {
          // Clean up any existing data first to avoid conflicts
          await pool.query('DELETE FROM tokens WHERE student_id = $1', [student.studentId]);
          await pool.query('DELETE FROM students WHERE student_id = $1', [student.studentId]);
          
          try {
            // Insert student
            await StudentDAO.upsert(student);

            // Generate and store a valid token
            const validToken = await TokenService.storeToken(student.studentId);

            // Test with leading/trailing whitespace
            const withWhitespace = `  ${validToken}  `;
            const studentInfo = await StudentService.getStudentByToken(withWhitespace);

            expect(studentInfo).not.toBeNull();
            expect(studentInfo?.studentId).toBe(student.studentId);
            expect(studentInfo?.name).toBe(student.name);
          } finally {
            // Clean up - always execute even if test fails
            await pool.query('DELETE FROM tokens WHERE student_id = $1', [student.studentId]);
            await pool.query('DELETE FROM students WHERE student_id = $1', [student.studentId]);
          }
        }
      ),
      { numRuns: 10, endOnFailure: true }
    );
  }, 60000);

  it('should return null for empty or whitespace-only tokens', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom('', '   ', '\t', '\n', '  \t  '),
        async (emptyToken) => {
          const result = await StudentService.getStudentByToken(emptyToken);
          expect(result).toBeNull();
        }
      ),
      { numRuns: 5, endOnFailure: true }
    );
  }, 30000);
});
