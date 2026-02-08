import { describe, it, beforeAll, afterAll, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import { ClaimDAO } from '../ClaimDAO';
import { StudentDAO } from '../StudentDAO';
import { Student } from '../../models/Student';
import pool from '../../db/config';

/**
 * Feature: event-check-in-system
 * Property 10: Claim Recording
 * 
 * For any valid token and item type (tshirt or meal), recording a claim should persist 
 * the claim to the database and return confirmation, and subsequent queries should 
 * reflect the updated claim status.
 * 
 * Validates: Requirements 6.4, 6.5
 */

describe('Property 10: Claim Recording', () => {
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

  it('should persist claims and reflect updated status in subsequent queries', async () => {
    // Define arbitraries
    const studentArbitrary = fc.record({
      studentId: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
      name: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
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
          // First, create the student
          await studentDAO.upsert(student);

          // Record the claim
          const success = await claimDAO.updateClaim(student.studentId, itemType);

          // Verify the claim was successful
          if (!success) {
            throw new Error(`Failed to record ${itemType} claim for student ${student.studentId}`);
          }

          // Query the claim status
          const claim = await claimDAO.findByStudentId(student.studentId);

          // Verify the claim was persisted
          if (!claim) {
            throw new Error(`Claim record not found for student ${student.studentId}`);
          }

          // Verify the correct item was claimed
          if (itemType === 'tshirt') {
            if (!claim.tshirtClaimed) {
              throw new Error(`T-shirt claim was not persisted for student ${student.studentId}`);
            }
            if (claim.mealClaimed) {
              throw new Error(`Meal claim was incorrectly set for student ${student.studentId}`);
            }
          } else {
            if (!claim.mealClaimed) {
              throw new Error(`Meal claim was not persisted for student ${student.studentId}`);
            }
            if (claim.tshirtClaimed) {
              throw new Error(`T-shirt claim was incorrectly set for student ${student.studentId}`);
            }
          }

          // Verify the claim timestamp was set
          if (itemType === 'tshirt' && !claim.tshirtClaimedAt) {
            throw new Error(`T-shirt claim timestamp was not set for student ${student.studentId}`);
          }
          if (itemType === 'meal' && !claim.mealClaimedAt) {
            throw new Error(`Meal claim timestamp was not set for student ${student.studentId}`);
          }
        }
      ),
      { numRuns: 20 }
    );
  });
});
