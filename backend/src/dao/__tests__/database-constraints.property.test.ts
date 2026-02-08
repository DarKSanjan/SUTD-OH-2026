import { describe, it, beforeAll, afterAll, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import { StudentDAO } from '../StudentDAO';
import { TokenDAO } from '../TokenDAO';
import { Student } from '../../models/Student';
import pool from '../../db/config';

/**
 * Feature: event-check-in-system
 * Property 13: Database Constraint Enforcement
 * 
 * For any attempt to insert duplicate Student_IDs or duplicate Tokens into the database, 
 * the database should reject the insertion and enforce uniqueness constraints.
 * 
 * **Validates: Requirements 9.4**
 */

describe('Property 13: Database Constraint Enforcement', () => {
  const studentDAO = new StudentDAO();
  const tokenDAO = new TokenDAO();

  beforeAll(async () => {
    // Tables should already exist from migration
  });

  beforeEach(async () => {
    // Clean up before each test
    await pool.query('DELETE FROM claims');
    await pool.query('DELETE FROM tokens');
    await pool.query('DELETE FROM students');
  });

  afterAll(async () => {
    // Don't close pool - other tests might need it
  });

  it('should reject duplicate Student_IDs and enforce uniqueness', async () => {
    // Define arbitraries for student data
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
        async (student: Student) => {
          // Insert the student for the first time
          await studentDAO.upsert(student);

          // Verify the student was inserted
          const retrievedStudent = await studentDAO.findByStudentId(student.studentId);
          if (!retrievedStudent) {
            throw new Error(`Student ${student.studentId} was not inserted`);
          }

          // Create a different student with the same student_id
          const duplicateStudent: Student = {
            studentId: student.studentId, // Same ID
            name: student.name + ' DUPLICATE', // Different name
            tshirtSize: 'XXL', // Different size
            mealPreference: 'Vegan', // Different preference
            organizationDetails: 'Different org details'
          };

          // Attempt to insert the duplicate using raw SQL (bypassing upsert logic)
          // This tests the database constraint directly
          let constraintViolated = false;
          try {
            await pool.query(
              `INSERT INTO students (student_id, name, tshirt_size, meal_preference, organization_details)
               VALUES ($1, $2, $3, $4, $5)`,
              [
                duplicateStudent.studentId,
                duplicateStudent.name,
                duplicateStudent.tshirtSize,
                duplicateStudent.mealPreference,
                duplicateStudent.organizationDetails
              ]
            );
          } catch (error: any) {
            // Check that the error is a unique constraint violation
            if (error.code === '23505' && error.constraint === 'students_student_id_key') {
              constraintViolated = true;
            } else {
              throw new Error(
                `Expected unique constraint violation, but got different error: ${error.message}`
              );
            }
          }

          // Verify that the constraint was enforced
          if (!constraintViolated) {
            throw new Error(
              `Database allowed duplicate Student_ID ${student.studentId} to be inserted`
            );
          }

          // Verify that the original student data is unchanged
          const finalStudent = await studentDAO.findByStudentId(student.studentId);
          if (!finalStudent) {
            throw new Error(`Student ${student.studentId} was deleted or lost`);
          }

          // Verify the original data is intact (not overwritten by duplicate attempt)
          if (finalStudent.name !== student.name) {
            throw new Error(
              `Student name was changed: expected "${student.name}", got "${finalStudent.name}"`
            );
          }
        }
      ),
      { numRuns: 20 }
    );
  });

  it('should reject duplicate Tokens and enforce uniqueness', async () => {
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

          // Create the first token
          await tokenDAO.create(token, student.studentId);

          // Verify the token was created
          const retrievedToken = await tokenDAO.findByToken(token);
          if (!retrievedToken) {
            throw new Error(`Token ${token} was not created`);
          }

          // Attempt to create a duplicate token with a different student
          // (or same student - either way should fail due to unique constraint)
          let constraintViolated = false;
          try {
            await pool.query(
              `INSERT INTO tokens (token, student_id) VALUES ($1, $2)`,
              [token, student.studentId + '_different']
            );
          } catch (error: any) {
            // Check that the error is a unique constraint violation
            if (error.code === '23505' && error.constraint === 'tokens_token_key') {
              constraintViolated = true;
            } else {
              throw new Error(
                `Expected unique constraint violation, but got different error: ${error.message}`
              );
            }
          }

          // Verify that the constraint was enforced
          if (!constraintViolated) {
            throw new Error(`Database allowed duplicate Token ${token} to be inserted`);
          }

          // Verify that the original token association is unchanged
          const finalToken = await tokenDAO.findByToken(token);
          if (!finalToken) {
            throw new Error(`Token ${token} was deleted or lost`);
          }

          // Verify the original student association is intact
          if (finalToken.studentId !== student.studentId) {
            throw new Error(
              `Token student association was changed: expected "${student.studentId}", got "${finalToken.studentId}"`
            );
          }
        }
      ),
      { numRuns: 20 }
    );
  });

  it('should enforce exact match uniqueness for Student_IDs', async () => {
    // Test that the database enforces uniqueness on the exact student_id value
    // Note: PostgreSQL UNIQUE constraint on TEXT is case-sensitive,
    // so "ABC123" and "abc123" are considered different values
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
        async (student: Student) => {
          // Insert the student
          await studentDAO.upsert(student);

          // Attempt to insert the exact same student_id again
          let constraintViolated = false;
          try {
            await pool.query(
              `INSERT INTO students (student_id, name, tshirt_size, meal_preference, organization_details)
               VALUES ($1, $2, $3, $4, $5)`,
              [
                student.studentId, // Exact same ID
                student.name + ' DUPLICATE',
                'XXL',
                'Vegan',
                'Different org'
              ]
            );
          } catch (error: any) {
            // Check if it's a unique constraint violation
            if (error.code === '23505' && error.constraint === 'students_student_id_key') {
              constraintViolated = true;
            } else {
              throw new Error(
                `Expected unique constraint violation, but got different error: ${error.message}`
              );
            }
          }

          // The constraint should be violated
          if (!constraintViolated) {
            throw new Error(
              `Database allowed duplicate Student_ID: "${student.studentId}"`
            );
          }
        }
      ),
      { numRuns: 20 }
    );
  });

  it('should allow multiple tokens for the same student', async () => {
    // This test verifies that while tokens must be unique,
    // a single student can have multiple different tokens
    const studentArbitrary = fc.record({
      studentId: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
      name: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
      tshirtSize: fc.constantFrom('XS', 'S', 'M', 'L', 'XL', 'XXL'),
      mealPreference: fc.constantFrom('Vegetarian', 'Non-Vegetarian', 'Vegan', 'Halal'),
      organizationDetails: fc.option(fc.string({ maxLength: 200 }), { nil: undefined })
    });

    const tokensArbitrary = fc.array(
      fc.hexaString({ minLength: 64, maxLength: 64 }),
      { minLength: 2, maxLength: 5 }
    ).filter(tokens => {
      // Ensure all tokens are unique
      const uniqueTokens = new Set(tokens);
      return uniqueTokens.size === tokens.length;
    });

    await fc.assert(
      fc.asyncProperty(
        studentArbitrary,
        tokensArbitrary,
        async (student: Student, tokens: string[]) => {
          // Create the student
          await studentDAO.upsert(student);

          // Create multiple tokens for the same student
          for (const token of tokens) {
            await tokenDAO.create(token, student.studentId);
          }

          // Verify all tokens were created
          const studentTokens = await tokenDAO.findByStudentId(student.studentId);
          
          if (studentTokens.length !== tokens.length) {
            throw new Error(
              `Expected ${tokens.length} tokens for student ${student.studentId}, got ${studentTokens.length}`
            );
          }

          // Verify each token is associated with the correct student
          for (const token of tokens) {
            const retrievedToken = await tokenDAO.findByToken(token);
            if (!retrievedToken) {
              throw new Error(`Token ${token} was not found`);
            }
            if (retrievedToken.studentId !== student.studentId) {
              throw new Error(
                `Token ${token} has wrong student association: expected "${student.studentId}", got "${retrievedToken.studentId}"`
              );
            }
          }
        }
      ),
      { numRuns: 20 }
    );
  });
});
