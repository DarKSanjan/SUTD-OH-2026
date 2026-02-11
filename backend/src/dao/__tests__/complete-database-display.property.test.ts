import { describe, it, beforeAll, afterAll, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import { StudentDAO } from '../StudentDAO';
import { Student } from '../../models/Student';
import pool from '../../db/config';

/**
 * Feature: ui-ux-enhancements
 * Property 7: Complete Database Display
 * 
 * For any set of student records in the database, the Database Table View 
 * should display all records without omission.
 * 
 * **Validates: Requirements 8.2**
 */

describe('Property 7: Complete Database Display', () => {
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

  it('should display all student records without omission', async () => {
    // Define arbitrary for generating a set of students
    // Use a counter to ensure unique student IDs across all iterations
    let testCounter = 0;
    
    const studentArbitrary = fc.record({
      studentId: fc.constant('').map(() => `display-test-${Date.now()}-${testCounter++}`),
      name: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
      tshirtSize: fc.constantFrom('XS', 'S', 'M', 'L', 'XL', 'XXL'),
      mealPreference: fc.constantFrom('Vegetarian', 'Non-Vegetarian', 'Vegan', 'Halal'),
      organizationDetails: fc.option(fc.string({ maxLength: 200 }), { nil: undefined }),
      consented: fc.boolean()
    });

    // Generate an array of unique students (1 to 10 students)
    const studentsArrayArbitrary = fc.array(
      studentArbitrary,
      {
        minLength: 1,
        maxLength: 10
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

          // Retrieve all students using getAllStudents
          const retrievedStudents = await studentDAO.getAllStudents();

          // Verify the count matches
          if (retrievedStudents.length !== students.length) {
            throw new Error(
              `Expected ${students.length} students, but got ${retrievedStudents.length}. ` +
              `Some records may have been omitted.`
            );
          }

          // Verify each inserted student is present in the retrieved list
          for (const insertedStudent of students) {
            const found = retrievedStudents.find(
              retrieved => retrieved.studentId === insertedStudent.studentId
            );

            if (!found) {
              throw new Error(
                `Student ${insertedStudent.studentId} was inserted but not found in getAllStudents() result. ` +
                `This indicates records are being omitted from the database display.`
              );
            }

            // Verify the student data is correct
            if (found.name !== insertedStudent.name) {
              throw new Error(
                `Student ${insertedStudent.studentId} has incorrect name: ` +
                `expected "${insertedStudent.name}", got "${found.name}"`
              );
            }

            if (found.consented !== (insertedStudent.consented ?? false)) {
              throw new Error(
                `Student ${insertedStudent.studentId} has incorrect consent status: ` +
                `expected ${insertedStudent.consented ?? false}, got ${found.consented}`
              );
            }
          }

          // Verify no extra students are returned
          for (const retrieved of retrievedStudents) {
            const found = students.find(
              inserted => inserted.studentId === retrieved.studentId
            );

            if (!found) {
              throw new Error(
                `Student ${retrieved.studentId} was returned by getAllStudents() ` +
                `but was not inserted in this test. This indicates data leakage between tests.`
              );
            }
          }

          // Clean up after this iteration
          await pool.query('DELETE FROM claims');
          await pool.query('DELETE FROM students');
        }
      ),
      { numRuns: 50 } // Reduced to 50 for reasonable test time
    );
  }, 90000); // Increased timeout

  it('should display all students with empty database returning empty array', async () => {
    // Edge case: empty database should return empty array, not error
    const retrievedStudents = await studentDAO.getAllStudents();

    if (retrievedStudents.length !== 0) {
      throw new Error(
        `Expected empty array for empty database, but got ${retrievedStudents.length} students`
      );
    }

    if (!Array.isArray(retrievedStudents)) {
      throw new Error(
        `getAllStudents() should return an array, but got ${typeof retrievedStudents}`
      );
    }
  });

  it('should display single student correctly', async () => {
    // Edge case: single student should be displayed
    let testCounter = 0;
    
    const studentArbitrary = fc.record({
      studentId: fc.constant('').map(() => `display-single-${Date.now()}-${testCounter++}`),
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

          // Verify exactly one student is returned
          if (retrievedStudents.length !== 1) {
            throw new Error(
              `Expected 1 student, but got ${retrievedStudents.length}`
            );
          }

          // Verify it's the correct student
          if (retrievedStudents[0].studentId !== student.studentId) {
            throw new Error(
              `Expected student ${student.studentId}, but got ${retrievedStudents[0].studentId}`
            );
          }

          // Clean up after this iteration
          await pool.query('DELETE FROM claims');
          await pool.query('DELETE FROM students');
        }
      ),
      { numRuns: 50 } // Reduced to 50 for reasonable test time
    );
  }, 90000); // Increased timeout
});

