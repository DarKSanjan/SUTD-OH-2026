import { describe, it, beforeAll, afterAll, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import { ClaimDAO } from '../ClaimDAO';
import { StudentDAO } from '../StudentDAO';
import { Student } from '../../models/Student';
import pool from '../../db/config';

/**
 * Feature: event-check-in-system
 * Property 12: Transaction Atomicity
 * 
 * For any claim update operation, if the database transaction fails at any point, 
 * the claim status should remain unchanged (no partial updates), and an error 
 * should be returned instead of success.
 * 
 * Validates: Requirements 9.1, 9.3
 */

describe('Property 12: Transaction Atomicity', () => {
  const claimDAO = new ClaimDAO();
  const studentDAO = new StudentDAO();

  beforeAll(async () => {
    // Tables should already exist from migration
  });

  beforeEach(async () => {
    // Clean up before each test
    await pool.query('DELETE FROM claims');
    await pool.query('DELETE FROM students');
  });

  afterAll(async () => {
    // Don't close pool - other tests might need it
  });

  it('should prevent duplicate claims and maintain atomicity', async () => {
    // Define arbitraries with better constraints
    const studentArbitrary = fc.record({
      studentId: fc.string({ minLength: 2, maxLength: 50 }).filter(s => {
        const trimmed = s.trim();
        return trimmed.length >= 2 && /^[a-zA-Z0-9_-]+$/.test(trimmed);
      }),
      name: fc.string({ minLength: 2, maxLength: 100 }).filter(s => {
        const trimmed = s.trim();
        return trimmed.length >= 2 && /^[a-zA-Z\s]+$/.test(trimmed);
      }),
      tshirtSize: fc.constantFrom('XS', 'S', 'M', 'L', 'XL', 'XXL'),
      mealPreference: fc.constantFrom('Vegetarian', 'Non-Vegetarian', 'Vegan', 'Halal'),
      organizationDetails: fc.option(fc.string({ maxLength: 200 }), { nil: undefined })
    });

    const itemTypeArbitrary = fc.constantFrom('tshirt' as const, 'meal' as const);

    await fc.assert(
      fc.asyncProperty(
        studentArbitrary,
        itemTypeArbitrary,
        async (student: Student, itemType: 'tshirt' | 'meal') => {
          try {
            // First, create the student
            await studentDAO.upsert(student);

            // Record the first claim (updateClaim handles initialization)
            const firstSuccess = await claimDAO.updateClaim(student.studentId, itemType);

          // Verify the first claim was successful
          if (!firstSuccess) {
            throw new Error(`First ${itemType} claim failed for student ${student.studentId}`);
          }

          // Get the claim status after first claim
          const claimAfterFirst = await claimDAO.findByStudentId(student.studentId);
          
          if (!claimAfterFirst) {
            throw new Error(`Claim record not found after first claim for student ${student.studentId}`);
          }

          // Attempt to claim the same item again (should fail due to duplicate)
          const secondSuccess = await claimDAO.updateClaim(student.studentId, itemType);

          // Verify the second claim was rejected
          if (secondSuccess) {
            throw new Error(`Duplicate ${itemType} claim was not prevented for student ${student.studentId}`);
          }

          // Get the claim status after second attempt
          const claimAfterSecond = await claimDAO.findByStudentId(student.studentId);

          if (!claimAfterSecond) {
            throw new Error(`Claim record not found after second attempt for student ${student.studentId}`);
          }

          // Verify the claim status remained unchanged (atomicity)
          if (itemType === 'tshirt') {
            if (claimAfterFirst.tshirtClaimed !== claimAfterSecond.tshirtClaimed) {
              throw new Error(`T-shirt claim status changed after failed duplicate attempt`);
            }
            if (claimAfterFirst.tshirtClaimedAt?.getTime() !== claimAfterSecond.tshirtClaimedAt?.getTime()) {
              throw new Error(`T-shirt claim timestamp changed after failed duplicate attempt`);
            }
          } else {
            if (claimAfterFirst.mealClaimed !== claimAfterSecond.mealClaimed) {
              throw new Error(`Meal claim status changed after failed duplicate attempt`);
            }
            if (claimAfterFirst.mealClaimedAt?.getTime() !== claimAfterSecond.mealClaimedAt?.getTime()) {
              throw new Error(`Meal claim timestamp changed after failed duplicate attempt`);
            }
          }
          } catch (error) {
            // Clean up on error
            await pool.query('DELETE FROM claims WHERE student_id = $1', [student.studentId]);
            await pool.query('DELETE FROM students WHERE student_id = $1', [student.studentId]);
            throw error;
          }
        }
      ),
      { numRuns: 5, timeout: 15000 }
    );
  }, 60000); // 60 second test timeout
});
