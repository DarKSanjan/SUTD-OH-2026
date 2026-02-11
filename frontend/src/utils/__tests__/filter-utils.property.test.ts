/**
 * Property-based tests for filter utility functions
 * 
 * Feature: admin-table-enhancements
 * Property 8: Club filter shows only matching students
 * Property 9: Involvement filters show only matching students
 * Property 10: Collection status filters show only matching students
 * Property 11: Multiple filters combine with AND logic
 * 
 * **Validates: Requirements 3.2, 3.3, 3.4, 3.5, 3.6, 3.7**
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { applyFilters } from '../tableUtils';
import { StudentRecord, FilterCriteria } from '../types';

describe('Property: Filter utility functions', () => {
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
  
  // Arbitrary for generating filter criteria
  const filterCriteriaArbitrary = fc.record({
    clubs: fc.array(fc.stringMatching(/^[A-Za-z ]{3,20}$/), { maxLength: 3 }),
    hasPerformance: fc.option(fc.boolean(), { nil: null }),
    hasBooth: fc.option(fc.boolean(), { nil: null }),
    shirtCollected: fc.option(fc.boolean(), { nil: null }),
    mealCollected: fc.option(fc.boolean(), { nil: null })
  }) as fc.Arbitrary<FilterCriteria>;
  
  it('Property 8: Club filter shows only matching students', () => {
    fc.assert(
      fc.property(
        fc.array(studentRecordArbitrary, { minLength: 5, maxLength: 50 }),
        fc.stringMatching(/^[A-Za-z ]{3,20}$/),
        (students, clubFilter) => {
          const filters: FilterCriteria = {
            clubs: [clubFilter],
            hasPerformance: null,
            hasBooth: null,
            shirtCollected: null,
            mealCollected: null
          };
          
          const filtered = applyFilters(students, filters);
          
          // All filtered students must have the club
          filtered.forEach(student => {
            expect(student.clubs).toContain(clubFilter);
          });
          
          // No student with the club should be excluded
          students.forEach(student => {
            if (student.clubs.includes(clubFilter)) {
              expect(filtered).toContainEqual(student);
            }
          });
        }
      ),
      { numRuns: 100 }
    );
  });
  
  it('Property 9: Involvement filters show only matching students (performance)', () => {
    fc.assert(
      fc.property(
        fc.array(studentRecordArbitrary, { minLength: 5, maxLength: 50 }),
        fc.boolean(),
        (students, performanceFilter) => {
          const filters: FilterCriteria = {
            clubs: [],
            hasPerformance: performanceFilter,
            hasBooth: null,
            shirtCollected: null,
            mealCollected: null
          };
          
          const filtered = applyFilters(students, filters);
          
          // All filtered students must match the performance filter
          filtered.forEach(student => {
            expect(student.hasPerformance).toBe(performanceFilter);
          });
          
          // No student matching the filter should be excluded
          students.forEach(student => {
            if (student.hasPerformance === performanceFilter) {
              expect(filtered).toContainEqual(student);
            }
          });
        }
      ),
      { numRuns: 100 }
    );
  });
  
  it('Property 9: Involvement filters show only matching students (booth)', () => {
    fc.assert(
      fc.property(
        fc.array(studentRecordArbitrary, { minLength: 5, maxLength: 50 }),
        fc.boolean(),
        (students, boothFilter) => {
          const filters: FilterCriteria = {
            clubs: [],
            hasPerformance: null,
            hasBooth: boothFilter,
            shirtCollected: null,
            mealCollected: null
          };
          
          const filtered = applyFilters(students, filters);
          
          // All filtered students must match the booth filter
          filtered.forEach(student => {
            expect(student.hasBooth).toBe(boothFilter);
          });
          
          // No student matching the filter should be excluded
          students.forEach(student => {
            if (student.hasBooth === boothFilter) {
              expect(filtered).toContainEqual(student);
            }
          });
        }
      ),
      { numRuns: 100 }
    );
  });
  
  it('Property 10: Collection status filters show only matching students (shirt)', () => {
    fc.assert(
      fc.property(
        fc.array(studentRecordArbitrary, { minLength: 5, maxLength: 50 }),
        fc.boolean(),
        (students, shirtFilter) => {
          const filters: FilterCriteria = {
            clubs: [],
            hasPerformance: null,
            hasBooth: null,
            shirtCollected: shirtFilter,
            mealCollected: null
          };
          
          const filtered = applyFilters(students, filters);
          
          // All filtered students must match the shirt filter
          filtered.forEach(student => {
            expect(student.shirtCollected).toBe(shirtFilter);
          });
          
          // No student matching the filter should be excluded
          students.forEach(student => {
            if (student.shirtCollected === shirtFilter) {
              expect(filtered).toContainEqual(student);
            }
          });
        }
      ),
      { numRuns: 100 }
    );
  });
  
  it('Property 10: Collection status filters show only matching students (meal)', () => {
    fc.assert(
      fc.property(
        fc.array(studentRecordArbitrary, { minLength: 5, maxLength: 50 }),
        fc.boolean(),
        (students, mealFilter) => {
          const filters: FilterCriteria = {
            clubs: [],
            hasPerformance: null,
            hasBooth: null,
            shirtCollected: null,
            mealCollected: mealFilter
          };
          
          const filtered = applyFilters(students, filters);
          
          // All filtered students must match the meal filter
          filtered.forEach(student => {
            expect(student.mealCollected).toBe(mealFilter);
          });
          
          // No student matching the filter should be excluded
          students.forEach(student => {
            if (student.mealCollected === mealFilter) {
              expect(filtered).toContainEqual(student);
            }
          });
        }
      ),
      { numRuns: 100 }
    );
  });
  
  it('Property 11: Multiple filters combine with AND logic', () => {
    fc.assert(
      fc.property(
        fc.array(studentRecordArbitrary, { minLength: 10, maxLength: 100 }),
        filterCriteriaArbitrary,
        (students, filters) => {
          const filtered = applyFilters(students, filters);
          
          // Every filtered student must match ALL active criteria
          filtered.forEach(student => {
            // Club filter (OR logic within clubs)
            if (filters.clubs.length > 0) {
              const hasMatchingClub = student.clubs.some(club =>
                filters.clubs.includes(club)
              );
              expect(hasMatchingClub).toBe(true);
            }
            
            // Performance filter
            if (filters.hasPerformance !== null) {
              expect(student.hasPerformance).toBe(filters.hasPerformance);
            }
            
            // Booth filter
            if (filters.hasBooth !== null) {
              expect(student.hasBooth).toBe(filters.hasBooth);
            }
            
            // Shirt collection filter
            if (filters.shirtCollected !== null) {
              expect(student.shirtCollected).toBe(filters.shirtCollected);
            }
            
            // Meal collection filter
            if (filters.mealCollected !== null) {
              expect(student.mealCollected).toBe(filters.mealCollected);
            }
          });
          
          // No student matching all criteria should be excluded
          students.forEach(student => {
            const matchesClub = filters.clubs.length === 0 || 
              student.clubs.some(club => filters.clubs.includes(club));
            const matchesPerformance = filters.hasPerformance === null || 
              student.hasPerformance === filters.hasPerformance;
            const matchesBooth = filters.hasBooth === null || 
              student.hasBooth === filters.hasBooth;
            const matchesShirt = filters.shirtCollected === null || 
              student.shirtCollected === filters.shirtCollected;
            const matchesMeal = filters.mealCollected === null || 
              student.mealCollected === filters.mealCollected;
            
            if (matchesClub && matchesPerformance && matchesBooth && matchesShirt && matchesMeal) {
              expect(filtered).toContainEqual(student);
            }
          });
        }
      ),
      { numRuns: 100 }
    );
  });
  
  it('should return all students when no filters are active', () => {
    fc.assert(
      fc.property(
        fc.array(studentRecordArbitrary, { minLength: 1, maxLength: 50 }),
        (students) => {
          const filters: FilterCriteria = {
            clubs: [],
            hasPerformance: null,
            hasBooth: null,
            shirtCollected: null,
            mealCollected: null
          };
          
          const filtered = applyFilters(students, filters);
          
          expect(filtered).toEqual(students);
        }
      ),
      { numRuns: 50 }
    );
  });
  
  it('should not mutate the original array', () => {
    fc.assert(
      fc.property(
        fc.array(studentRecordArbitrary, { minLength: 1, maxLength: 50 }),
        filterCriteriaArbitrary,
        (students, filters) => {
          const original = JSON.parse(JSON.stringify(students));
          
          applyFilters(students, filters);
          
          expect(students).toEqual(original);
        }
      ),
      { numRuns: 50 }
    );
  });
});
