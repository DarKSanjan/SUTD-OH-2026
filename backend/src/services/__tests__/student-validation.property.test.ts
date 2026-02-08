import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import * as fc from 'fast-check';
import pool from '../../db/config';
import StudentDAO from '../../dao/StudentDAO';
import StudentService from '../StudentService';

/**
 * Feature: event-check-in-system
 * Property 4: Student ID Validation
 * 
 * Validates: Requirements 2.1, 2.2, 2.3, 2.5
 * 
 * For any student ID input, the validation process should return student information 
 * if the ID exists in the database, or return an error if it doesn't exist, 
 * and the validation should be case-insensitive (e.g., "ABC123" matches "abc123").
 */

describe('Property 4: Student ID Validation', () => {
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

  it('should return student info for valid IDs and null for invalid IDs', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          studentId: fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim().length > 0).map(s => s.trim()),
          name: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0).map(s => s.trim()),
          tshirtSize: fc.constantFrom('XS', 'S', 'M', 'L', 'XL', 'XXL'),
          mealPreference: fc.constantFrom('Vegetarian', 'Non-Vegetarian', 'Vegan'),
        }),
        fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim().length > 0).map(s => s.trim()),
        async (validStudent, invalidId) => {
          // Insert a valid student
          await StudentDAO.upsert(validStudent);

          // Test 1: Valid student ID should return student info
          const result1 = await StudentService.validateStudentId(validStudent.studentId);
          expect(result1).not.toBeNull();
          expect(result1?.studentId).toBe(validStudent.studentId);
          expect(result1?.name).toBe(validStudent.name);
          expect(result1?.tshirtSize).toBe(validStudent.tshirtSize);
          expect(result1?.mealPreference).toBe(validStudent.mealPreference);

          // Test 2: Case-insensitive matching
          const upperCaseId = validStudent.studentId.toUpperCase();
          const lowerCaseId = validStudent.studentId.toLowerCase();
          const mixedCaseId = validStudent.studentId
            .split('')
            .map((c, i) => (i % 2 === 0 ? c.toUpperCase() : c.toLowerCase()))
            .join('');

          const result2 = await StudentService.validateStudentId(upperCaseId);
          const result3 = await StudentService.validateStudentId(lowerCaseId);
          const result4 = await StudentService.validateStudentId(mixedCaseId);

          expect(result2).not.toBeNull();
          expect(result3).not.toBeNull();
          expect(result4).not.toBeNull();
          expect(result2?.studentId).toBe(validStudent.studentId);
          expect(result3?.studentId).toBe(validStudent.studentId);
          expect(result4?.studentId).toBe(validStudent.studentId);

          // Test 3: Invalid student ID should return null
          // Make sure invalidId is different from validStudent.studentId (case-insensitive)
          if (invalidId.toLowerCase() !== validStudent.studentId.toLowerCase()) {
            const result5 = await StudentService.validateStudentId(invalidId);
            expect(result5).toBeNull();
          }

          // Clean up
          await pool.query('DELETE FROM students WHERE student_id = $1', [validStudent.studentId]);
        }
      ),
      { numRuns: 20 }
    );
  }, 60000);

  it('should handle whitespace trimming in student IDs', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          studentId: fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim().length > 0).map(s => s.trim()),
          name: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0).map(s => s.trim()),
          tshirtSize: fc.constantFrom('XS', 'S', 'M', 'L', 'XL', 'XXL'),
          mealPreference: fc.constantFrom('Vegetarian', 'Non-Vegetarian', 'Vegan'),
        }),
        async (student) => {
          // Insert student
          await StudentDAO.upsert(student);

          // Test with leading/trailing whitespace
          const withWhitespace = `  ${student.studentId}  `;
          const result = await StudentService.validateStudentId(withWhitespace);

          expect(result).not.toBeNull();
          expect(result?.studentId).toBe(student.studentId);

          // Clean up
          await pool.query('DELETE FROM students WHERE student_id = $1', [student.studentId]);
        }
      ),
      { numRuns: 20 }
    );
  }, 60000);
});
