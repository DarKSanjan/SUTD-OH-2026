import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import * as fc from 'fast-check';
import pool from '../../db/config';
import StudentDAO from '../../dao/StudentDAO';
import TokenService from '../TokenService';

/**
 * Feature: event-check-in-system
 * Property 5: Token Uniqueness
 * 
 * Validates: Requirements 3.1, 3.2
 * 
 * For any set of token generation requests, all generated tokens should be unique 
 * (no duplicates), even when generating tokens for the same student multiple times.
 */

describe('Property 5: Token Uniqueness', () => {
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

  it('should generate unique tokens for multiple requests', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.record({
            studentId: fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim().length > 0),
            name: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
            tshirtSize: fc.constantFrom('XS', 'S', 'M', 'L', 'XL', 'XXL'),
            mealPreference: fc.constantFrom('Vegetarian', 'Non-Vegetarian', 'Vegan'),
          }),
          { minLength: 2, maxLength: 5 }
        ),
        async (students) => {
          const tokens: string[] = [];

          // Insert students and generate tokens
          for (const student of students) {
            await StudentDAO.upsert(student);
            const token = await TokenService.storeToken(student.studentId);
            tokens.push(token);
          }

          // Verify all tokens are unique
          const uniqueTokens = new Set(tokens);
          expect(uniqueTokens.size).toBe(tokens.length);

          // Verify all tokens are 64 characters (32 bytes in hex)
          for (const token of tokens) {
            expect(token).toHaveLength(64);
            expect(/^[0-9a-f]{64}$/.test(token)).toBe(true);
          }

          // Clean up
          for (const student of students) {
            await pool.query('DELETE FROM tokens WHERE student_id = $1', [student.studentId]);
            await pool.query('DELETE FROM students WHERE student_id = $1', [student.studentId]);
          }
        }
      ),
      { numRuns: 20 }
    );
  }, 60000);

  it('should generate unique tokens even for the same student', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          studentId: fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim().length > 0),
          name: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
          tshirtSize: fc.constantFrom('XS', 'S', 'M', 'L', 'XL', 'XXL'),
          mealPreference: fc.constantFrom('Vegetarian', 'Non-Vegetarian', 'Vegan'),
        }),
        fc.integer({ min: 2, max: 3 }),
        async (student, tokenCount) => {
          // Insert student
          await StudentDAO.upsert(student);

          const tokens: string[] = [];

          // Generate multiple tokens for the same student
          for (let i = 0; i < tokenCount; i++) {
            const token = await TokenService.storeToken(student.studentId);
            tokens.push(token);
          }

          // Verify all tokens are unique
          const uniqueTokens = new Set(tokens);
          expect(uniqueTokens.size).toBe(tokens.length);

          // Clean up
          await pool.query('DELETE FROM tokens WHERE student_id = $1', [student.studentId]);
          await pool.query('DELETE FROM students WHERE student_id = $1', [student.studentId]);
        }
      ),
      { numRuns: 20 }
    );
  }, 60000);
});
