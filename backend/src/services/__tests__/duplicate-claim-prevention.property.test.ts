import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import * as fc from 'fast-check';
import pool from '../../db/config';
import StudentDAO from '../../dao/StudentDAO';
import ClaimService from '../ClaimService';

/**
 * Feature: event-check-in-system
 * Property 11: Duplicate Claim Prevention
 * 
 * Validates: Requirements 7.1, 7.2
 * 
 * For any student and item type, if an item is already claimed, attempting to claim 
 * it again should be rejected with an error, and the claim status should remain unchanged.
 */

describe('Property 11: Duplicate Claim Prevention', () => {
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

  it('should prevent duplicate claims for the same item', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          studentId: fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim().length > 0),
          name: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
          tshirtSize: fc.constantFrom('XS', 'S', 'M', 'L', 'XL', 'XXL'),
          mealPreference: fc.constantFrom('Vegetarian', 'Non-Vegetarian', 'Vegan'),
        }),
        fc.constantFrom('tshirt' as const, 'meal' as const),
        async (student, itemType) => {
          // Insert student
          await StudentDAO.upsert(student);

          // First claim should succeed
          const firstClaim = await ClaimService.recordClaim(student.studentId, itemType);
          expect(firstClaim).toBe(true);

          // Verify claim was recorded
          const claimStatus1 = await ClaimService.getClaimStatus(student.studentId);
          expect(claimStatus1).not.toBeNull();
          if (itemType === 'tshirt') {
            expect(claimStatus1?.tshirtClaimed).toBe(true);
          } else {
            expect(claimStatus1?.mealClaimed).toBe(true);
          }

          // Second claim should fail (duplicate)
          const secondClaim = await ClaimService.recordClaim(student.studentId, itemType);
          expect(secondClaim).toBe(false);

          // Verify claim status remains unchanged
          const claimStatus2 = await ClaimService.getClaimStatus(student.studentId);
          expect(claimStatus2).not.toBeNull();
          if (itemType === 'tshirt') {
            expect(claimStatus2?.tshirtClaimed).toBe(true);
          } else {
            expect(claimStatus2?.mealClaimed).toBe(true);
          }

          // Verify timestamps haven't changed (if they exist)
          if (itemType === 'tshirt') {
            expect(claimStatus2?.tshirtClaimedAt?.getTime()).toBe(
              claimStatus1?.tshirtClaimedAt?.getTime()
            );
          } else {
            expect(claimStatus2?.mealClaimedAt?.getTime()).toBe(
              claimStatus1?.mealClaimedAt?.getTime()
            );
          }

          // Clean up
          await pool.query('DELETE FROM claims WHERE student_id = $1', [student.studentId]);
          await pool.query('DELETE FROM students WHERE student_id = $1', [student.studentId]);
        }
      ),
      { numRuns: 20 }
    );
  }, 60000);

  it('should allow claiming different items independently', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          studentId: fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim().length > 0),
          name: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
          tshirtSize: fc.constantFrom('XS', 'S', 'M', 'L', 'XL', 'XXL'),
          mealPreference: fc.constantFrom('Vegetarian', 'Non-Vegetarian', 'Vegan'),
        }),
        async (student) => {
          // Insert student
          await StudentDAO.upsert(student);

          // Claim t-shirt
          const tshirtClaim = await ClaimService.recordClaim(student.studentId, 'tshirt');
          expect(tshirtClaim).toBe(true);

          // Claim meal
          const mealClaim = await ClaimService.recordClaim(student.studentId, 'meal');
          expect(mealClaim).toBe(true);

          // Verify both are claimed
          const claimStatus = await ClaimService.getClaimStatus(student.studentId);
          expect(claimStatus).not.toBeNull();
          expect(claimStatus?.tshirtClaimed).toBe(true);
          expect(claimStatus?.mealClaimed).toBe(true);

          // Try to claim t-shirt again - should fail
          const duplicateTshirt = await ClaimService.recordClaim(student.studentId, 'tshirt');
          expect(duplicateTshirt).toBe(false);

          // Try to claim meal again - should fail
          const duplicateMeal = await ClaimService.recordClaim(student.studentId, 'meal');
          expect(duplicateMeal).toBe(false);

          // Clean up
          await pool.query('DELETE FROM claims WHERE student_id = $1', [student.studentId]);
          await pool.query('DELETE FROM students WHERE student_id = $1', [student.studentId]);
        }
      ),
      { numRuns: 20 }
    );
  }, 60000);
});
