import { describe, it, beforeAll, afterAll, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import { StudentDAO } from '../StudentDAO';
import { Student } from '../../models/Student';
import pool from '../../db/config';

/**
 * Feature: ui-ux-enhancements
 * Property 8: Complete Field Display
 * 
 * For any student record displayed in the Database Table View, the rendered row 
 * should contain student ID, name, shirt status, meal status, and consent status.
 * 
 * **Validates: Requirements 8.3**
 */

describe('Property 8: Complete Field Display', () => {
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
    // Final cleanup
    await pool.query('DELETE FROM claims');
    await pool.query('DELETE FROM students');
  });

  it('should include all required fields for each student record', async () => {
    // Define arbitrary for generating a student with all possible field values
    let testCounter = 0;
    
    const studentArbitrary = fc.record({
      studentId: fc.constant('').map(() => `field-test-${Date.now()}-${testCounter++}`),
      name: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
      tshirtSize: fc.constantFrom('XS', 'S', 'M', 'L', 'XL', 'XXL'),
      mealPreference: fc.constantFrom('Vegetarian', 'Non-Vegetarian', 'Vegan', 'Halal'),
      organizationDetails: fc.option(fc.string({ maxLength: 200 }), { nil: undefined }),
      consented: fc.boolean()
    });

    // Generate an array of students (1 to 5 students per test)
    const studentsArrayArbitrary = fc.array(
      studentArbitrary,
      {
        minLength: 1,
        maxLength: 5
      }
    );

    await fc.assert(
      fc.asyncProperty(
        studentsArrayArbitrary,
        async (students: Student[]) => {
          // Clean up before this iteration
          await pool.query('DELETE FROM claims');
          await pool.query('DELETE FROM students');

          // Insert all students into the database
          for (const student of students) {
            await studentDAO.upsert(student);
          }

          // Optionally set some claim statuses to test shirt and meal fields
          // Randomly claim shirts and meals for some students
          for (const student of students) {
            const shouldClaimShirt = Math.random() > 0.5;
            const shouldClaimMeal = Math.random() > 0.5;
            
            if (shouldClaimShirt || shouldClaimMeal) {
              await pool.query(
                `INSERT INTO claims (student_id, tshirt_claimed, meal_claimed)
                 VALUES ($1, $2, $3)
                 ON CONFLICT (student_id) 
                 DO UPDATE SET tshirt_claimed = $2, meal_claimed = $3`,
                [student.studentId, shouldClaimShirt, shouldClaimMeal]
              );
            }
          }

          // Retrieve all students using getAllStudents
          const retrievedStudents = await studentDAO.getAllStudents();

          // Verify each retrieved student has all required fields
          for (const retrieved of retrievedStudents) {
            // Check that all required fields exist
            const requiredFields = [
              'studentId',
              'name',
              'shirtCollected',
              'mealCollected',
              'consented'
            ];

            for (const field of requiredFields) {
              if (!(field in retrieved)) {
                throw new Error(
                  `Student record is missing required field "${field}". ` +
                  `Retrieved record: ${JSON.stringify(retrieved)}. ` +
                  `This violates Requirement 8.3: Database Table View must show ` +
                  `student ID, name, shirt status, meal status, and consent status.`
                );
              }
            }

            // Verify field types are correct
            if (typeof retrieved.studentId !== 'string') {
              throw new Error(
                `Field "studentId" must be a string, but got ${typeof retrieved.studentId}. ` +
                `Value: ${retrieved.studentId}`
              );
            }

            if (typeof retrieved.name !== 'string') {
              throw new Error(
                `Field "name" must be a string, but got ${typeof retrieved.name}. ` +
                `Value: ${retrieved.name}`
              );
            }

            if (typeof retrieved.shirtCollected !== 'boolean') {
              throw new Error(
                `Field "shirtCollected" must be a boolean, but got ${typeof retrieved.shirtCollected}. ` +
                `Value: ${retrieved.shirtCollected}`
              );
            }

            if (typeof retrieved.mealCollected !== 'boolean') {
              throw new Error(
                `Field "mealCollected" must be a boolean, but got ${typeof retrieved.mealCollected}. ` +
                `Value: ${retrieved.mealCollected}`
              );
            }

            if (typeof retrieved.consented !== 'boolean') {
              throw new Error(
                `Field "consented" must be a boolean, but got ${typeof retrieved.consented}. ` +
                `Value: ${retrieved.consented}`
              );
            }

            // Verify field values are not null or undefined
            if (retrieved.studentId === null || retrieved.studentId === undefined) {
              throw new Error(
                `Field "studentId" cannot be null or undefined. ` +
                `This field is required for display in the Database Table View.`
              );
            }

            if (retrieved.name === null || retrieved.name === undefined) {
              throw new Error(
                `Field "name" cannot be null or undefined. ` +
                `This field is required for display in the Database Table View.`
              );
            }

            // Boolean fields can be false, but not null or undefined
            if (retrieved.shirtCollected === null || retrieved.shirtCollected === undefined) {
              throw new Error(
                `Field "shirtCollected" cannot be null or undefined. ` +
                `It must be a boolean value (true or false).`
              );
            }

            if (retrieved.mealCollected === null || retrieved.mealCollected === undefined) {
              throw new Error(
                `Field "mealCollected" cannot be null or undefined. ` +
                `It must be a boolean value (true or false).`
              );
            }

            if (retrieved.consented === null || retrieved.consented === undefined) {
              throw new Error(
                `Field "consented" cannot be null or undefined. ` +
                `It must be a boolean value (true or false).`
              );
            }

            // Verify string fields are not empty
            if (retrieved.studentId.trim().length === 0) {
              throw new Error(
                `Field "studentId" cannot be an empty string. ` +
                `Student records must have a valid student ID for display.`
              );
            }

            if (retrieved.name.trim().length === 0) {
              throw new Error(
                `Field "name" cannot be an empty string. ` +
                `Student records must have a valid name for display.`
              );
            }
          }

          // Clean up after this iteration
          await pool.query('DELETE FROM claims');
          await pool.query('DELETE FROM students');
        }
      ),
      { numRuns: 50 } // 50 iterations for reasonable test time
    );
  }, 90000); // Increased timeout for property test

  it('should include all required fields for a single student', async () => {
    // Edge case: test with a single student to ensure fields are present
    let testCounter = 0;
    
    const studentArbitrary = fc.record({
      studentId: fc.constant('').map(() => `field-single-${Date.now()}-${testCounter++}`),
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
          // Clean up before this iteration
          await pool.query('DELETE FROM claims');
          await pool.query('DELETE FROM students');

          // Insert single student
          await studentDAO.upsert(student);

          // Retrieve all students
          const retrievedStudents = await studentDAO.getAllStudents();

          // Should have exactly one student
          if (retrievedStudents.length !== 1) {
            throw new Error(
              `Expected 1 student, but got ${retrievedStudents.length}`
            );
          }

          const retrieved = retrievedStudents[0];

          // Verify all required fields are present
          const requiredFields = [
            'studentId',
            'name',
            'shirtCollected',
            'mealCollected',
            'consented'
          ];

          for (const field of requiredFields) {
            if (!(field in retrieved)) {
              throw new Error(
                `Student record is missing required field "${field}". ` +
                `This violates Requirement 8.3.`
              );
            }
          }

          // Verify the values match what was inserted
          if (retrieved.studentId !== student.studentId) {
            throw new Error(
              `Student ID mismatch: expected "${student.studentId}", got "${retrieved.studentId}"`
            );
          }

          if (retrieved.name !== student.name) {
            throw new Error(
              `Name mismatch: expected "${student.name}", got "${retrieved.name}"`
            );
          }

          if (retrieved.consented !== (student.consented ?? false)) {
            throw new Error(
              `Consent status mismatch: expected ${student.consented ?? false}, got ${retrieved.consented}`
            );
          }

          // Clean up after this iteration
          await pool.query('DELETE FROM claims');
          await pool.query('DELETE FROM students');
        }
      ),
      { numRuns: 50 }
    );
  }, 90000);

  it('should handle students with no claims (default false values)', async () => {
    // Edge case: students with no claims should have shirtCollected and mealCollected as false
    let testCounter = 0;
    
    const studentArbitrary = fc.record({
      studentId: fc.constant('').map(() => `field-noclaim-${Date.now()}-${testCounter++}`),
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
          // Clean up before this iteration
          await pool.query('DELETE FROM claims');
          await pool.query('DELETE FROM students');

          // Insert student WITHOUT recording any claims
          await studentDAO.upsert(student);

          // Retrieve the student
          const retrievedStudents = await studentDAO.getAllStudents();
          const retrieved = retrievedStudents[0];

          // Verify shirt and meal fields are present and false
          if (retrieved.shirtCollected !== false) {
            throw new Error(
              `Student with no claims should have shirtCollected=false, but got ${retrieved.shirtCollected}`
            );
          }

          if (retrieved.mealCollected !== false) {
            throw new Error(
              `Student with no claims should have mealCollected=false, but got ${retrieved.mealCollected}`
            );
          }

          // Clean up after this iteration
          await pool.query('DELETE FROM claims');
          await pool.query('DELETE FROM students');
        }
      ),
      { numRuns: 50 }
    );
  }, 90000);

  it('should handle students with claims (true values)', async () => {
    // Edge case: students with claims should have correct true values
    let testCounter = 0;
    
    const studentArbitrary = fc.record({
      studentId: fc.constant('').map(() => `field-claim-${Date.now()}-${testCounter++}`),
      name: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
      tshirtSize: fc.constantFrom('XS', 'S', 'M', 'L', 'XL', 'XXL'),
      mealPreference: fc.constantFrom('Vegetarian', 'Non-Vegetarian', 'Vegan', 'Halal'),
      organizationDetails: fc.option(fc.string({ maxLength: 200 }), { nil: undefined }),
      consented: fc.boolean()
    });

    const claimArbitrary = fc.record({
      claimShirt: fc.boolean(),
      claimMeal: fc.boolean()
    });

    await fc.assert(
      fc.asyncProperty(
        studentArbitrary,
        claimArbitrary,
        async (student: Student, claims: { claimShirt: boolean; claimMeal: boolean }) => {
          // Clean up before this iteration
          await pool.query('DELETE FROM claims');
          await pool.query('DELETE FROM students');

          // Insert student and record claims
          await studentDAO.upsert(student);
          await pool.query(
            `INSERT INTO claims (student_id, tshirt_claimed, meal_claimed)
             VALUES ($1, $2, $3)
             ON CONFLICT (student_id) 
             DO UPDATE SET tshirt_claimed = $2, meal_claimed = $3`,
            [student.studentId, claims.claimShirt, claims.claimMeal]
          );

          // Retrieve the student
          const retrievedStudents = await studentDAO.getAllStudents();
          const retrieved = retrievedStudents[0];

          // Verify shirt and meal fields match what was claimed
          if (retrieved.shirtCollected !== claims.claimShirt) {
            throw new Error(
              `Shirt claim mismatch: expected ${claims.claimShirt}, got ${retrieved.shirtCollected}`
            );
          }

          if (retrieved.mealCollected !== claims.claimMeal) {
            throw new Error(
              `Meal claim mismatch: expected ${claims.claimMeal}, got ${retrieved.mealCollected}`
            );
          }

          // Clean up after this iteration
          await pool.query('DELETE FROM claims');
          await pool.query('DELETE FROM students');
        }
      ),
      { numRuns: 50 }
    );
  }, 90000);
});
