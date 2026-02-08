import { describe, it, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import { StudentDAO } from '../StudentDAO';
import { Student } from '../../models/Student';

/**
 * Feature: event-check-in-system
 * Property 3.1: Duplicate Student Consolidation
 * 
 * For any set of student records with the same Student_ID but different t-shirt sizes, 
 * consolidating the records should produce a single student record with the largest 
 * t-shirt size (following order: XS < S < M < L < XL < XXL) and preserve all 
 * organization involvement details.
 * 
 * **Validates: Requirements 1.6, 1.7, 1.8**
 */

describe('Property 3.1: Duplicate Student Consolidation', () => {
  const studentDAO = new StudentDAO();

  // T-shirt size order for validation
  const TSHIRT_SIZE_ORDER = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

  /**
   * Get the index of a t-shirt size in the order
   */
  const getSizeIndex = (size: string): number => {
    return TSHIRT_SIZE_ORDER.indexOf(size.toUpperCase());
  };

  /**
   * Find the largest t-shirt size in an array
   */
  const findLargestSize = (sizes: string[]): string => {
    return sizes.reduce((largest, current) => {
      const largestIndex = getSizeIndex(largest);
      const currentIndex = getSizeIndex(current);
      return currentIndex > largestIndex ? current : largest;
    });
  };

  it('should select the largest t-shirt size when consolidating duplicates', async () => {
    // Define arbitraries
    const studentIdArbitrary = fc.string({ minLength: 1, maxLength: 50 })
      .filter(s => s.trim().length > 0)
      .map(s => s.trim());

    const nameArbitrary = fc.string({ minLength: 1, maxLength: 100 })
      .filter(s => s.trim().length > 0)
      .map(s => s.trim());

    const tshirtSizeArbitrary = fc.constantFrom('XS', 'S', 'M', 'L', 'XL', 'XXL');

    const mealPreferenceArbitrary = fc.constantFrom(
      'Vegetarian',
      'Non-Vegetarian',
      'Vegan',
      'Halal'
    );

    const organizationDetailsArbitrary = fc.option(
      fc.string({ minLength: 1, maxLength: 200 })
        .filter(s => s.trim().length > 0)
        .map(s => s.trim()),
      { nil: undefined }
    );

    // Generate an array of 2-5 duplicate students with different t-shirt sizes
    const duplicateStudentsArbitrary = fc.tuple(
      studentIdArbitrary,
      nameArbitrary,
      mealPreferenceArbitrary,
      fc.array(tshirtSizeArbitrary, { minLength: 2, maxLength: 5 }),
      fc.array(organizationDetailsArbitrary, { minLength: 2, maxLength: 5 })
    ).map(([studentId, name, mealPreference, tshirtSizes, orgDetails]) => {
      // Create duplicate students with the same ID but different t-shirt sizes
      return tshirtSizes.map((size, index) => ({
        studentId,
        name,
        tshirtSize: size,
        mealPreference,
        organizationDetails: orgDetails[index % orgDetails.length]
      }));
    });

    await fc.assert(
      fc.asyncProperty(
        duplicateStudentsArbitrary,
        async (students: Student[]) => {
          // Consolidate the duplicate students
          const consolidated = studentDAO.consolidateDuplicates(students);

          // Property 1: The consolidated record should have the same student ID
          if (consolidated.studentId !== students[0].studentId) {
            throw new Error(
              `Student ID mismatch: expected ${students[0].studentId}, got ${consolidated.studentId}`
            );
          }

          // Property 2: The consolidated record should have the largest t-shirt size
          const expectedLargestSize = findLargestSize(students.map(s => s.tshirtSize));
          if (consolidated.tshirtSize !== expectedLargestSize) {
            throw new Error(
              `T-shirt size mismatch: expected ${expectedLargestSize}, got ${consolidated.tshirtSize}. ` +
              `Sizes in input: ${students.map(s => s.tshirtSize).join(', ')}`
            );
          }

          // Property 3: All organization involvement details should be preserved
          const allOrgDetails = students
            .map(s => s.organizationDetails)
            .filter(details => details && details.trim().length > 0);

          if (allOrgDetails.length > 0) {
            // Check that consolidated organization details contains all individual details
            for (const detail of allOrgDetails) {
              if (!consolidated.organizationDetails?.includes(detail!)) {
                throw new Error(
                  `Organization detail "${detail}" was not preserved in consolidated record. ` +
                  `Consolidated details: "${consolidated.organizationDetails}"`
                );
              }
            }
          }

          // Property 4: The consolidated record should have a valid name
          if (!consolidated.name || consolidated.name.trim().length === 0) {
            throw new Error('Consolidated record has empty name');
          }

          // Property 5: The consolidated record should have a valid meal preference
          if (!consolidated.mealPreference || consolidated.mealPreference.trim().length === 0) {
            throw new Error('Consolidated record has empty meal preference');
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle single student (no consolidation needed)', async () => {
    const studentArbitrary = fc.record({
      studentId: fc.string({ minLength: 1, maxLength: 50 })
        .filter(s => s.trim().length > 0)
        .map(s => s.trim()),
      name: fc.string({ minLength: 1, maxLength: 100 })
        .filter(s => s.trim().length > 0)
        .map(s => s.trim()),
      tshirtSize: fc.constantFrom('XS', 'S', 'M', 'L', 'XL', 'XXL'),
      mealPreference: fc.constantFrom('Vegetarian', 'Non-Vegetarian', 'Vegan', 'Halal'),
      organizationDetails: fc.option(
        fc.string({ minLength: 1, maxLength: 200 })
          .filter(s => s.trim().length > 0)
          .map(s => s.trim()),
        { nil: undefined }
      )
    });

    await fc.assert(
      fc.asyncProperty(
        studentArbitrary,
        async (student: Student) => {
          // Consolidate a single student (should return the same student)
          const consolidated = studentDAO.consolidateDuplicates([student]);

          // All fields should match exactly
          if (consolidated.studentId !== student.studentId) {
            throw new Error('Student ID changed after consolidation');
          }
          if (consolidated.name !== student.name) {
            throw new Error('Name changed after consolidation');
          }
          if (consolidated.tshirtSize !== student.tshirtSize) {
            throw new Error('T-shirt size changed after consolidation');
          }
          if (consolidated.mealPreference !== student.mealPreference) {
            throw new Error('Meal preference changed after consolidation');
          }
          // When there's only one student, the method returns it as-is
          // So organizationDetails should be exactly the same (including undefined)
          if (consolidated.organizationDetails !== student.organizationDetails) {
            throw new Error(
              `Organization details changed after consolidation: ` +
              `expected "${student.organizationDetails}", got "${consolidated.organizationDetails}"`
            );
          }
        }
      ),
      { numRuns: 50 }
    );
  });

  it('should preserve organization details in correct order', async () => {
    // Test that organization details are concatenated with semicolons
    const studentIdArbitrary = fc.string({ minLength: 1, maxLength: 50 })
      .filter(s => s.trim().length > 0)
      .map(s => s.trim());

    const nameArbitrary = fc.string({ minLength: 1, maxLength: 100 })
      .filter(s => s.trim().length > 0)
      .map(s => s.trim());

    const orgDetailsArbitrary = fc.array(
      fc.string({ minLength: 1, maxLength: 50 })
        .filter(s => s.trim().length > 0)
        .map(s => s.trim()),
      { minLength: 2, maxLength: 4 }
    );

    await fc.assert(
      fc.asyncProperty(
        studentIdArbitrary,
        nameArbitrary,
        orgDetailsArbitrary,
        async (studentId: string, name: string, orgDetails: string[]) => {
          // Create duplicate students with different organization details
          const students: Student[] = orgDetails.map((detail, index) => ({
            studentId,
            name,
            tshirtSize: 'M',
            mealPreference: 'Vegetarian',
            organizationDetails: detail
          }));

          // Consolidate
          const consolidated = studentDAO.consolidateDuplicates(students);

          // Check that all organization details are present in the consolidated string
          for (const detail of orgDetails) {
            if (!consolidated.organizationDetails?.includes(detail)) {
              throw new Error(
                `Organization detail "${detail}" was not preserved. ` +
                `Consolidated: "${consolidated.organizationDetails}"`
              );
            }
          }

          // Check that the consolidated string contains the separator when there are multiple details
          if (orgDetails.length > 1) {
            if (!consolidated.organizationDetails?.includes('; ')) {
              throw new Error(
                `Expected semicolon separator in consolidated organization details. ` +
                `Consolidated: "${consolidated.organizationDetails}"`
              );
            }
          }
        }
      ),
      { numRuns: 50 }
    );
  });

  it('should handle empty organization details correctly', async () => {
    const studentArbitrary = fc.record({
      studentId: fc.string({ minLength: 1, maxLength: 50 })
        .filter(s => s.trim().length > 0)
        .map(s => s.trim()),
      name: fc.string({ minLength: 1, maxLength: 100 })
        .filter(s => s.trim().length > 0)
        .map(s => s.trim()),
      tshirtSize: fc.constantFrom('XS', 'S', 'M', 'L', 'XL', 'XXL'),
      mealPreference: fc.constantFrom('Vegetarian', 'Non-Vegetarian', 'Vegan', 'Halal')
    });

    await fc.assert(
      fc.asyncProperty(
        studentArbitrary,
        fc.nat({ max: 3 }),
        async (baseStudent: Student, numDuplicates: number) => {
          // Create duplicates with no organization details
          const students: Student[] = Array(numDuplicates + 1).fill(null).map(() => ({
            ...baseStudent,
            organizationDetails: undefined
          }));

          // Consolidate
          const consolidated = studentDAO.consolidateDuplicates(students);

          // When consolidating multiple students with no org details, 
          // the result should have empty string (from initialization)
          // When consolidating a single student, it returns as-is (undefined)
          const expectedOrgDetails = students.length === 1 ? undefined : '';
          
          if (consolidated.organizationDetails !== expectedOrgDetails) {
            throw new Error(
              `Expected organization details to be ${expectedOrgDetails === undefined ? 'undefined' : '""'}, ` +
              `got "${consolidated.organizationDetails}"`
            );
          }
        }
      ),
      { numRuns: 30 }
    );
  });
});
