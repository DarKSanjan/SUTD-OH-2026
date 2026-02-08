import { describe, it, beforeAll, afterAll, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import { ClaimDAO } from '../ClaimDAO';
import { StudentDAO } from '../StudentDAO';
import { Student } from '../../models/Student';
import pool from '../../db/config';

/**
 * Feature: event-check-in-system
 * Property 9: Claim Status Retrieval
 * 
 * For any student in the database, querying their claim status should return 
 * both t-shirt and meal coupon claim statuses (true/false for each).
 * 
 * **Validates: Requirements 5.1, 5.2**
 */

describe('Property 9: Claim Status Retrieval', () => {
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

  it('should return both t-shirt and meal claim statuses for any student', async () => {
    // Define arbitraries
    const studentArbitrary = fc.record({
      studentId: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
      name: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
      tshirtSize: fc.constantFrom('XS', 'S', 'M', 'L', 'XL', 'XXL'),
      mealPreference: fc.constantFrom('Vegetarian', 'Non-Vegetarian', 'Vegan', 'Halal'),
      organizationDetails: fc.option(fc.string({ maxLength: 200 }), { nil: undefined })
    });

    // Generate random claim states
    const claimStateArbitrary = fc.record({
      tshirtClaimed: fc.boolean(),
      mealClaimed: fc.boolean()
    });

    await fc.assert(
      fc.asyncProperty(
        studentArbitrary,
        claimStateArbitrary,
        async (student: Student, claimState: { tshirtClaimed: boolean; mealClaimed: boolean }) => {
          // First, create the student
          await studentDAO.upsert(student);

          // Initialize claim record for the student
          await claimDAO.initializeForStudent(student.studentId);

          // Set the claim states based on the generated values
          if (claimState.tshirtClaimed) {
            await claimDAO.updateClaim(student.studentId, 'tshirt');
          }
          if (claimState.mealClaimed) {
            await claimDAO.updateClaim(student.studentId, 'meal');
          }

          // Query the claim status
          const claim = await claimDAO.findByStudentId(student.studentId);

          // Verify the claim record exists
          if (!claim) {
            throw new Error(`Claim record not found for student ${student.studentId}`);
          }

          // Verify both claim statuses are present and have boolean values
          if (typeof claim.tshirtClaimed !== 'boolean') {
            throw new Error(`T-shirt claim status is not a boolean for student ${student.studentId}: ${typeof claim.tshirtClaimed}`);
          }

          if (typeof claim.mealClaimed !== 'boolean') {
            throw new Error(`Meal claim status is not a boolean for student ${student.studentId}: ${typeof claim.mealClaimed}`);
          }

          // Verify the claim statuses match what we set
          if (claim.tshirtClaimed !== claimState.tshirtClaimed) {
            throw new Error(
              `T-shirt claim status mismatch for student ${student.studentId}: ` +
              `expected ${claimState.tshirtClaimed}, got ${claim.tshirtClaimed}`
            );
          }

          if (claim.mealClaimed !== claimState.mealClaimed) {
            throw new Error(
              `Meal claim status mismatch for student ${student.studentId}: ` +
              `expected ${claimState.mealClaimed}, got ${claim.mealClaimed}`
            );
          }
        }
      ),
      { numRuns: 20 }
    );
  }, 60000);

  it('should return false for both claims when no claims have been made', async () => {
    // Test the specific case where a student has no claims
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
          // Create the student
          await studentDAO.upsert(student);

          // Initialize claim record (no claims made)
          await claimDAO.initializeForStudent(student.studentId);

          // Query the claim status
          const claim = await claimDAO.findByStudentId(student.studentId);

          // Verify the claim record exists
          if (!claim) {
            throw new Error(`Claim record not found for student ${student.studentId}`);
          }

          // Verify both claims are false
          if (claim.tshirtClaimed !== false) {
            throw new Error(`T-shirt should not be claimed for student ${student.studentId}`);
          }

          if (claim.mealClaimed !== false) {
            throw new Error(`Meal should not be claimed for student ${student.studentId}`);
          }
        }
      ),
      { numRuns: 20 }
    );
  }, 60000);

  it('should handle students with only one item claimed', async () => {
    // Test cases where only one item is claimed
    const studentArbitrary = fc.record({
      studentId: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
      name: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
      tshirtSize: fc.constantFrom('XS', 'S', 'M', 'L', 'XL', 'XXL'),
      mealPreference: fc.constantFrom('Vegetarian', 'Non-Vegetarian', 'Vegan', 'Halal'),
      organizationDetails: fc.option(fc.string({ maxLength: 200 }), { nil: undefined })
    });

    const singleItemArbitrary = fc.constantFrom('tshirt' as const, 'meal' as const);

    await fc.assert(
      fc.asyncProperty(
        studentArbitrary,
        singleItemArbitrary,
        async (student: Student, itemType: 'tshirt' | 'meal') => {
          // Create the student
          await studentDAO.upsert(student);

          // Initialize claim record
          await claimDAO.initializeForStudent(student.studentId);

          // Claim only one item
          await claimDAO.updateClaim(student.studentId, itemType);

          // Query the claim status
          const claim = await claimDAO.findByStudentId(student.studentId);

          // Verify the claim record exists
          if (!claim) {
            throw new Error(`Claim record not found for student ${student.studentId}`);
          }

          // Verify the correct item is claimed and the other is not
          if (itemType === 'tshirt') {
            if (claim.tshirtClaimed !== true) {
              throw new Error(`T-shirt should be claimed for student ${student.studentId}`);
            }
            if (claim.mealClaimed !== false) {
              throw new Error(`Meal should not be claimed for student ${student.studentId}`);
            }
          } else {
            if (claim.mealClaimed !== true) {
              throw new Error(`Meal should be claimed for student ${student.studentId}`);
            }
            if (claim.tshirtClaimed !== false) {
              throw new Error(`T-shirt should not be claimed for student ${student.studentId}`);
            }
          }
        }
      ),
      { numRuns: 20 }
    );
  }, 60000);
});
