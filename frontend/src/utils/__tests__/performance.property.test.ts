/**
 * Property-Based Tests: Performance
 * 
 * Feature: admin-table-enhancements
 * Property 18: Filter and search operations are performant
 * 
 * For any dataset up to 1000 records, filtering or searching operations
 * should complete within 200ms from user input to UI update.
 * 
 * **Validates: Requirements 5.3**
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { applySearch, applyFilters, applySort } from '../tableUtils';
import { StudentRecord, FilterCriteria, SortableColumn, SortDirection } from '../types';

// Arbitrary for generating random student records
const studentArbitrary = fc.record({
  studentId: fc.string({ minLength: 5, maxLength: 10 }),
  name: fc.string({ minLength: 3, maxLength: 50 }),
  shirtCollected: fc.boolean(),
  mealCollected: fc.boolean(),
  consented: fc.boolean(),
  clubs: fc.array(fc.string({ minLength: 3, maxLength: 20 }), { maxLength: 5 }),
  hasPerformance: fc.boolean(),
  hasBooth: fc.boolean(),
}) as fc.Arbitrary<StudentRecord>;

// Arbitrary for filter criteria
const filterCriteriaArbitrary = fc.record({
  clubs: fc.array(fc.string({ minLength: 3, maxLength: 20 }), { maxLength: 3 }),
  hasPerformance: fc.option(fc.boolean(), { nil: null }),
  hasBooth: fc.option(fc.boolean(), { nil: null }),
  shirtCollected: fc.option(fc.boolean(), { nil: null }),
  mealCollected: fc.option(fc.boolean(), { nil: null }),
}) as fc.Arbitrary<FilterCriteria>;

// Arbitrary for sort configuration
const sortColumnArbitrary = fc.constantFrom<SortableColumn | null>(
  'studentId',
  'name',
  'shirtCollected',
  'mealCollected',
  null
);

const sortDirectionArbitrary = fc.constantFrom<SortDirection>(
  'asc',
  'desc',
  null
);

describe('Property: Performance', () => {
  describe('Property 18: Filter and search operations are performant', () => {
    it('should complete search operations within 200ms for datasets up to 1000 records', () => {
      fc.assert(
        fc.property(
          fc.array(studentArbitrary, { minLength: 100, maxLength: 1000 }),
          fc.string({ maxLength: 20 }),
          (students, query) => {
            const startTime = performance.now();
            const result = applySearch(students, query);
            const endTime = performance.now();
            const duration = endTime - startTime;

            // Verify operation completes within 200ms
            expect(duration).toBeLessThan(200);

            // Verify result is valid
            expect(Array.isArray(result)).toBe(true);
            expect(result.length).toBeLessThanOrEqual(students.length);
          }
        ),
        { numRuns: 20 } // Reduced runs for performance tests
      );
    });

    it('should complete filter operations within 200ms for datasets up to 1000 records', () => {
      fc.assert(
        fc.property(
          fc.array(studentArbitrary, { minLength: 100, maxLength: 1000 }),
          filterCriteriaArbitrary,
          (students, filters) => {
            const startTime = performance.now();
            const result = applyFilters(students, filters);
            const endTime = performance.now();
            const duration = endTime - startTime;

            // Verify operation completes within 200ms
            expect(duration).toBeLessThan(200);

            // Verify result is valid
            expect(Array.isArray(result)).toBe(true);
            expect(result.length).toBeLessThanOrEqual(students.length);
          }
        ),
        { numRuns: 20 }
      );
    });

    it('should complete sort operations within 200ms for datasets up to 1000 records', () => {
      fc.assert(
        fc.property(
          fc.array(studentArbitrary, { minLength: 100, maxLength: 1000 }),
          sortColumnArbitrary,
          sortDirectionArbitrary,
          (students, column, direction) => {
            const startTime = performance.now();
            const result = applySort(students, column, direction);
            const endTime = performance.now();
            const duration = endTime - startTime;

            // Verify operation completes within 200ms
            expect(duration).toBeLessThan(200);

            // Verify result is valid
            expect(Array.isArray(result)).toBe(true);
            expect(result.length).toBe(students.length);
          }
        ),
        { numRuns: 20 }
      );
    });

    it('should complete combined operations (search + filter + sort) within 200ms for datasets up to 1000 records', () => {
      fc.assert(
        fc.property(
          fc.array(studentArbitrary, { minLength: 100, maxLength: 1000 }),
          fc.string({ maxLength: 20 }),
          filterCriteriaArbitrary,
          sortColumnArbitrary,
          sortDirectionArbitrary,
          (students, query, filters, column, direction) => {
            const startTime = performance.now();
            
            // Apply all operations in sequence (as done in DatabaseTableView)
            let result = applySearch(students, query);
            result = applyFilters(result, filters);
            result = applySort(result, column, direction);
            
            const endTime = performance.now();
            const duration = endTime - startTime;

            // Verify combined operation completes within 200ms
            expect(duration).toBeLessThan(200);

            // Verify result is valid
            expect(Array.isArray(result)).toBe(true);
            expect(result.length).toBeLessThanOrEqual(students.length);
          }
        ),
        { numRuns: 20 }
      );
    });

    it('should maintain performance with maximum dataset size (1000 records)', () => {
      // Test specifically with 1000 records to verify upper bound
      const students = fc.sample(studentArbitrary, 1000);
      const query = 'test';
      const filters: FilterCriteria = {
        clubs: ['Club A'],
        hasPerformance: true,
        hasBooth: null,
        shirtCollected: null,
        mealCollected: null,
      };
      const column: SortableColumn = 'name';
      const direction: SortDirection = 'asc';

      const startTime = performance.now();
      
      let result = applySearch(students, query);
      result = applyFilters(result, filters);
      result = applySort(result, column, direction);
      
      const endTime = performance.now();
      const duration = endTime - startTime;

      // Verify operation completes within 200ms even at maximum size
      expect(duration).toBeLessThan(200);
      expect(Array.isArray(result)).toBe(true);
    });

    it('should handle empty datasets efficiently', () => {
      const students: StudentRecord[] = [];
      const query = 'test';
      const filters: FilterCriteria = {
        clubs: [],
        hasPerformance: null,
        hasBooth: null,
        shirtCollected: null,
        mealCollected: null,
      };

      const startTime = performance.now();
      
      let result = applySearch(students, query);
      result = applyFilters(result, filters);
      result = applySort(result, 'name', 'asc');
      
      const endTime = performance.now();
      const duration = endTime - startTime;

      // Empty datasets should be extremely fast (< 10ms)
      expect(duration).toBeLessThan(10);
      expect(result).toEqual([]);
    });

    it('should handle single record efficiently', () => {
      const students = fc.sample(studentArbitrary, 1);
      const query = students[0].name.substring(0, 3);
      const filters: FilterCriteria = {
        clubs: [],
        hasPerformance: null,
        hasBooth: null,
        shirtCollected: null,
        mealCollected: null,
      };

      const startTime = performance.now();
      
      let result = applySearch(students, query);
      result = applyFilters(result, filters);
      result = applySort(result, 'name', 'asc');
      
      const endTime = performance.now();
      const duration = endTime - startTime;

      // Single record should be very fast (< 10ms)
      expect(duration).toBeLessThan(10);
      expect(result.length).toBeLessThanOrEqual(1);
    });
  });
});
