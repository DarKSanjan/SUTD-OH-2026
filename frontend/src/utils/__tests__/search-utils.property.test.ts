/**
 * Property-based tests for search utility function
 * 
 * Feature: admin-table-enhancements
 * Property 6: Search filters by ID and name (case-insensitive)
 * 
 * **Validates: Requirements 2.2, 2.3**
 * 
 * For any search query, the filtered results should include only students
 * whose ID or name contains the query string (case-insensitive matching).
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { applySearch } from '../tableUtils';
import { StudentRecord } from '../types';

describe('Property: Search filters by ID and name (case-insensitive)', () => {
  // Arbitrary for generating student records
  const studentRecordArbitrary = fc.record({
    studentId: fc.stringMatching(/^S[0-9]{3,6}$/),
    name: fc.stringMatching(/^[A-Za-z ]{3,30}$/),
    shirtCollected: fc.boolean(),
    mealCollected: fc.boolean(),
    consented: fc.boolean(),
    clubs: fc.array(fc.stringMatching(/^[A-Za-z ]{3,20}$/), { maxLength: 3 }),
    hasPerformance: fc.boolean(),
    hasBooth: fc.boolean()
  }) as fc.Arbitrary<StudentRecord>;
  
  it('should only return students whose ID or name contains the query', () => {
    fc.assert(
      fc.property(
        fc.array(studentRecordArbitrary, { minLength: 5, maxLength: 50 }),
        fc.string({ minLength: 1, maxLength: 10 }),
        (students, query) => {
          // Skip whitespace-only queries as they're treated as empty
          if (query.trim() === '') return;
          
          const filtered = applySearch(students, query);
          
          const lowerQuery = query.toLowerCase();
          
          // All filtered students must match the query
          filtered.forEach(student => {
            const matchesId = student.studentId.toLowerCase().includes(lowerQuery);
            const matchesName = student.name.toLowerCase().includes(lowerQuery);
            expect(matchesId || matchesName).toBe(true);
          });
        }
      ),
      { numRuns: 100 }
    );
  });
  
  it('should not exclude any students whose ID or name contains the query', () => {
    fc.assert(
      fc.property(
        fc.array(studentRecordArbitrary, { minLength: 5, maxLength: 50 }),
        fc.string({ minLength: 1, maxLength: 10 }),
        (students, query) => {
          // Skip whitespace-only queries as they're treated as empty
          if (query.trim() === '') return;
          
          const filtered = applySearch(students, query);
          
          const lowerQuery = query.toLowerCase();
          
          // No matching student should be excluded
          students.forEach(student => {
            const matchesId = student.studentId.toLowerCase().includes(lowerQuery);
            const matchesName = student.name.toLowerCase().includes(lowerQuery);
            
            if (matchesId || matchesName) {
              expect(filtered).toContainEqual(student);
            }
          });
        }
      ),
      { numRuns: 100 }
    );
  });
  
  it('should be case-insensitive', () => {
    fc.assert(
      fc.property(
        fc.array(studentRecordArbitrary, { minLength: 5, maxLength: 50 }),
        fc.string({ minLength: 1, maxLength: 10 }),
        (students, query) => {
          const lowerCaseResult = applySearch(students, query.toLowerCase());
          const upperCaseResult = applySearch(students, query.toUpperCase());
          const mixedCaseResult = applySearch(students, query);
          
          // All three should return the same results
          expect(lowerCaseResult).toEqual(upperCaseResult);
          expect(lowerCaseResult).toEqual(mixedCaseResult);
        }
      ),
      { numRuns: 100 }
    );
  });
  
  it('should return all students for empty query', () => {
    fc.assert(
      fc.property(
        fc.array(studentRecordArbitrary, { minLength: 1, maxLength: 50 }),
        (students) => {
          const filtered = applySearch(students, '');
          expect(filtered).toEqual(students);
        }
      ),
      { numRuns: 50 }
    );
  });
  
  it('should return all students for whitespace-only query', () => {
    fc.assert(
      fc.property(
        fc.array(studentRecordArbitrary, { minLength: 1, maxLength: 50 }),
        fc.constantFrom('   ', '\t', '\n', '  \t  '),
        (students, whitespace) => {
          const filtered = applySearch(students, whitespace);
          expect(filtered).toEqual(students);
        }
      ),
      { numRuns: 50 }
    );
  });
  
  it('should handle partial matches', () => {
    fc.assert(
      fc.property(
        fc.array(studentRecordArbitrary, { minLength: 5, maxLength: 50 }),
        (students) => {
          // Pick a random student and search for part of their ID
          if (students.length === 0) return;
          
          const randomStudent = students[Math.floor(Math.random() * students.length)];
          const partialId = randomStudent.studentId.substring(0, 3);
          
          const filtered = applySearch(students, partialId);
          
          // The random student should be in the results
          expect(filtered).toContainEqual(randomStudent);
        }
      ),
      { numRuns: 100 }
    );
  });
  
  it('should not mutate the original array', () => {
    fc.assert(
      fc.property(
        fc.array(studentRecordArbitrary, { minLength: 1, maxLength: 50 }),
        fc.string({ maxLength: 10 }),
        (students, query) => {
          const original = JSON.parse(JSON.stringify(students));
          
          applySearch(students, query);
          
          expect(students).toEqual(original);
        }
      ),
      { numRuns: 50 }
    );
  });
  
  it('should return empty array when no students match', () => {
    fc.assert(
      fc.property(
        fc.array(studentRecordArbitrary, { minLength: 1, maxLength: 50 }),
        (students) => {
          // Use a query that's unlikely to match
          const unlikelyQuery = 'ZZZZZZZZZZZZZ';
          
          const filtered = applySearch(students, unlikelyQuery);
          
          // Verify that indeed no student matches
          const hasMatch = students.some(s => 
            s.studentId.toLowerCase().includes(unlikelyQuery.toLowerCase()) ||
            s.name.toLowerCase().includes(unlikelyQuery.toLowerCase())
          );
          
          if (!hasMatch) {
            expect(filtered).toEqual([]);
          }
        }
      ),
      { numRuns: 50 }
    );
  });
});
