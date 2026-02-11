import { describe, it, beforeAll, afterAll, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import { StudentDAO } from '../StudentDAO';
import { Student } from '../../models/Student';
import pool from '../../db/config';

/**
 * Feature: ui-ux-enhancements
 * Property 2: Consent Persistence Round Trip
 * 
 * For any student ID, when consent is recorded in the database, 
 * retrieving that student's record should return the same consent state.
 * 
 * **Validates: Requirements 4.5, 4.6**
 */

describe('Property 2: Consent Persistence Round Trip', () => {
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

  it('should persist and retrieve consent state for any student', async () => {
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

  it('should handle consent state updates (false to true)', async () => {
    // Test that consent state can be updated from false to true
    const studentArbitrary = fc.record({
      studentId: fc.string({ minLength: 1, maxLength: 40 })
        .filter(s => s.trim().length > 0)
        .map(s => `consent-update-ft-${s}`.toLowerCase()), // Add unique prefix and lowercase
      name: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
      tshirtSize: fc.constantFrom('XS', 'S', 'M', 'L', 'XL', 'XXL'),
      mealPreference: fc.constantFrom('Vegetarian', 'Non-Vegetarian', 'Vegan', 'Halal'),
      organizationDetails: fc.option(fc.string({ maxLength: 200 }), { nil: undefined })
    });

    await fc.assert(
      fc.asyncProperty(
        studentArbitrary,
        async (student: Student) => {
          // First, insert student with consented = false
          const studentWithoutConsent = { ...student, consented: false };
          await studentDAO.upsert(studentWithoutConsent);

          // Verify initial state
          const initialStudent = await studentDAO.findByStudentId(student.studentId);
          if (!initialStudent) {
            throw new Error(`Student ${student.studentId} was not found after initial insertion`);
          }
          if (initialStudent.consented !== false) {
            throw new Error(
              `Initial consent state should be false for student ${student.studentId}, ` +
              `got ${initialStudent.consented}`
            );
          }

          // Update consent to true
          const studentWithConsent = { ...student, consented: true };
          await studentDAO.upsert(studentWithConsent);

          // Retrieve and verify updated state
          const updatedStudent = await studentDAO.findByStudentId(student.studentId);
          if (!updatedStudent) {
            throw new Error(`Student ${student.studentId} was not found after update`);
          }
          if (updatedStudent.consented !== true) {
            throw new Error(
              `Updated consent state should be true for student ${student.studentId}, ` +
              `got ${updatedStudent.consented}`
            );
          }
        }
      ),
      { numRuns: 100 }
    );
  }, 60000);

  it('should handle consent state updates (true to false)', async () => {
    // Test that consent state can be updated from true to false
    const studentArbitrary = fc.record({
      studentId: fc.string({ minLength: 1, maxLength: 40 })
        .filter(s => s.trim().length > 0)
        .map(s => `consent-update-tf-${s}`.toLowerCase()), // Add unique prefix and lowercase
      name: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
      tshirtSize: fc.constantFrom('XS', 'S', 'M', 'L', 'XL', 'XXL'),
      mealPreference: fc.constantFrom('Vegetarian', 'Non-Vegetarian', 'Vegan', 'Halal'),
      organizationDetails: fc.option(fc.string({ maxLength: 200 }), { nil: undefined })
    });

    await fc.assert(
      fc.asyncProperty(
        studentArbitrary,
        async (student: Student) => {
          // First, insert student with consented = true
          const studentWithConsent = { ...student, consented: true };
          await studentDAO.upsert(studentWithConsent);

          // Verify initial state
          const initialStudent = await studentDAO.findByStudentId(student.studentId);
          if (!initialStudent) {
            throw new Error(`Student ${student.studentId} was not found after initial insertion`);
          }
          if (initialStudent.consented !== true) {
            throw new Error(
              `Initial consent state should be true for student ${student.studentId}, ` +
              `got ${initialStudent.consented}`
            );
          }

          // Update consent to false
          const studentWithoutConsent = { ...student, consented: false };
          await studentDAO.upsert(studentWithoutConsent);

          // Retrieve and verify updated state
          const updatedStudent = await studentDAO.findByStudentId(student.studentId);
          if (!updatedStudent) {
            throw new Error(`Student ${student.studentId} was not found after update`);
          }
          if (updatedStudent.consented !== false) {
            throw new Error(
              `Updated consent state should be false for student ${student.studentId}, ` +
              `got ${updatedStudent.consented}`
            );
          }
        }
      ),
      { numRuns: 100 }
    );
  }, 60000);

  it('should default to false when consent is not specified', async () => {
    // Test that consent defaults to false when not explicitly set
    const studentArbitrary = fc.record({
      studentId: fc.string({ minLength: 1, maxLength: 40 })
        .filter(s => s.trim().length > 0)
        .map(s => `consent-default-${s}`.toLowerCase()), // Add unique prefix and lowercase
      name: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
      tshirtSize: fc.constantFrom('XS', 'S', 'M', 'L', 'XL', 'XXL'),
      mealPreference: fc.constantFrom('Vegetarian', 'Non-Vegetarian', 'Vegan', 'Halal'),
      organizationDetails: fc.option(fc.string({ maxLength: 200 }), { nil: undefined })
    });

    await fc.assert(
      fc.asyncProperty(
        studentArbitrary,
        async (student: Student) => {
          // Insert student without specifying consent (undefined)
          const studentWithoutConsentField = { ...student };
          delete studentWithoutConsentField.consented;
          
          await studentDAO.upsert(studentWithoutConsentField);

          // Retrieve the student record
          const retrievedStudent = await studentDAO.findByStudentId(student.studentId);

          // Verify the student was found
          if (!retrievedStudent) {
            throw new Error(`Student ${student.studentId} was not found after insertion`);
          }

          // Verify consent defaults to false
          if (retrievedStudent.consented !== false) {
            throw new Error(
              `Consent should default to false for student ${student.studentId}, ` +
              `got ${retrievedStudent.consented}`
            );
          }
        }
      ),
      { numRuns: 100 }
    );
  }, 60000);

  it('should preserve consent state across other field updates', async () => {
    // Test that consent state is preserved when other fields are updated
    const studentArbitrary = fc.record({
      studentId: fc.string({ minLength: 1, maxLength: 40 })
        .filter(s => s.trim().length > 0)
        .map(s => `consent-preserve-${s}`.toLowerCase()), // Add unique prefix and lowercase
      name: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
      tshirtSize: fc.constantFrom('XS', 'S', 'M', 'L', 'XL', 'XXL'),
      mealPreference: fc.constantFrom('Vegetarian', 'Non-Vegetarian', 'Vegan', 'Halal'),
      organizationDetails: fc.option(fc.string({ maxLength: 200 }), { nil: undefined }),
      consented: fc.boolean()
    });

    const updatedFieldsArbitrary = fc.record({
      name: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
      tshirtSize: fc.constantFrom('XS', 'S', 'M', 'L', 'XL', 'XXL'),
      mealPreference: fc.constantFrom('Vegetarian', 'Non-Vegetarian', 'Vegan', 'Halal')
    });

    await fc.assert(
      fc.asyncProperty(
        studentArbitrary,
        updatedFieldsArbitrary,
        async (student: Student, updatedFields: { name: string; tshirtSize: string; mealPreference: string }) => {
          // Insert student with initial consent state
          await studentDAO.upsert(student);

          // Verify initial consent state
          const initialStudent = await studentDAO.findByStudentId(student.studentId);
          if (!initialStudent) {
            throw new Error(`Student ${student.studentId} was not found after initial insertion`);
          }
          const originalConsentState = initialStudent.consented;

          // Update other fields while preserving consent
          const updatedStudent = {
            ...student,
            name: updatedFields.name,
            tshirtSize: updatedFields.tshirtSize,
            mealPreference: updatedFields.mealPreference,
            consented: originalConsentState
          };
          await studentDAO.upsert(updatedStudent);

          // Retrieve and verify consent state is preserved
          const finalStudent = await studentDAO.findByStudentId(student.studentId);
          if (!finalStudent) {
            throw new Error(`Student ${student.studentId} was not found after update`);
          }
          if (finalStudent.consented !== originalConsentState) {
            throw new Error(
              `Consent state should be preserved for student ${student.studentId}: ` +
              `expected ${originalConsentState}, got ${finalStudent.consented}`
            );
          }

          // Verify other fields were updated
          if (finalStudent.name !== updatedFields.name) {
            throw new Error(`Name was not updated for student ${student.studentId}`);
          }
          if (finalStudent.tshirtSize !== updatedFields.tshirtSize) {
            throw new Error(`T-shirt size was not updated for student ${student.studentId}`);
          }
          if (finalStudent.mealPreference !== updatedFields.mealPreference) {
            throw new Error(`Meal preference was not updated for student ${student.studentId}`);
          }
        }
      ),
      { numRuns: 100 }
    );
  }, 60000);
});
