/**
 * Property-based tests for useFilter hook
 * 
 * Feature: admin-table-enhancements
 * Property 12: Clear filters returns to unfiltered state
 * 
 * **Validates: Requirements 3.8**
 */

import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import * as fc from 'fast-check';
import { useFilter } from '../useFilter';
import { FilterCriteria } from '../../utils/types';

describe('Property: useFilter clear filters', () => {
  // Arbitrary for generating filter criteria with at least one active filter
  const activeFilterCriteriaArbitrary = fc.record({
    clubs: fc.array(fc.stringMatching(/^[A-Za-z ]{3,20}$/), { minLength: 0, maxLength: 5 }),
    hasPerformance: fc.option(fc.boolean(), { nil: null }),
    hasBooth: fc.option(fc.boolean(), { nil: null }),
    shirtCollected: fc.option(fc.boolean(), { nil: null }),
    mealCollected: fc.option(fc.boolean(), { nil: null })
  }) as fc.Arbitrary<FilterCriteria>;

  it('Property 12: Clear filters returns to unfiltered state', () => {
    fc.assert(
      fc.property(
        activeFilterCriteriaArbitrary,
        (filterCriteria) => {
          const { result } = renderHook(() => useFilter());

          // Apply the generated filters
          act(() => {
            if (filterCriteria.clubs.length > 0) {
              result.current.setFilter('clubs', filterCriteria.clubs);
            }
            if (filterCriteria.hasPerformance !== null) {
              result.current.setFilter('hasPerformance', filterCriteria.hasPerformance);
            }
            if (filterCriteria.hasBooth !== null) {
              result.current.setFilter('hasBooth', filterCriteria.hasBooth);
            }
            if (filterCriteria.shirtCollected !== null) {
              result.current.setFilter('shirtCollected', filterCriteria.shirtCollected);
            }
            if (filterCriteria.mealCollected !== null) {
              result.current.setFilter('mealCollected', filterCriteria.mealCollected);
            }
          });

          // Clear all filters
          act(() => {
            result.current.clearFilters();
          });

          // Verify all filters are reset to initial state
          expect(result.current.filters).toEqual({
            clubs: [],
            hasPerformance: null,
            hasBooth: null,
            shirtCollected: null,
            mealCollected: null
          });

          // Verify active filter count is zero
          expect(result.current.activeFilterCount).toBe(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should return to unfiltered state regardless of filter combination', () => {
    fc.assert(
      fc.property(
        fc.array(fc.stringMatching(/^[A-Za-z ]{3,20}$/), { minLength: 1, maxLength: 5 }),
        fc.boolean(),
        fc.boolean(),
        fc.boolean(),
        fc.boolean(),
        (clubs, hasPerformance, hasBooth, shirtCollected, mealCollected) => {
          const { result } = renderHook(() => useFilter());

          // Set all filters to specific values
          act(() => {
            result.current.setFilter('clubs', clubs);
            result.current.setFilter('hasPerformance', hasPerformance);
            result.current.setFilter('hasBooth', hasBooth);
            result.current.setFilter('shirtCollected', shirtCollected);
            result.current.setFilter('mealCollected', mealCollected);
          });

          // Verify filters are set
          expect(result.current.filters.clubs).toEqual(clubs);
          expect(result.current.filters.hasPerformance).toBe(hasPerformance);
          expect(result.current.filters.hasBooth).toBe(hasBooth);
          expect(result.current.filters.shirtCollected).toBe(shirtCollected);
          expect(result.current.filters.mealCollected).toBe(mealCollected);
          expect(result.current.activeFilterCount).toBe(5);

          // Clear filters
          act(() => {
            result.current.clearFilters();
          });

          // Verify complete reset
          expect(result.current.filters).toEqual({
            clubs: [],
            hasPerformance: null,
            hasBooth: null,
            shirtCollected: null,
            mealCollected: null
          });
          expect(result.current.activeFilterCount).toBe(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should be idempotent - multiple clearFilters calls produce same result', () => {
    fc.assert(
      fc.property(
        activeFilterCriteriaArbitrary,
        fc.integer({ min: 1, max: 5 }),
        (filterCriteria, clearCount) => {
          const { result } = renderHook(() => useFilter());

          // Apply filters
          act(() => {
            if (filterCriteria.clubs.length > 0) {
              result.current.setFilter('clubs', filterCriteria.clubs);
            }
            if (filterCriteria.hasPerformance !== null) {
              result.current.setFilter('hasPerformance', filterCriteria.hasPerformance);
            }
            if (filterCriteria.hasBooth !== null) {
              result.current.setFilter('hasBooth', filterCriteria.hasBooth);
            }
            if (filterCriteria.shirtCollected !== null) {
              result.current.setFilter('shirtCollected', filterCriteria.shirtCollected);
            }
            if (filterCriteria.mealCollected !== null) {
              result.current.setFilter('mealCollected', filterCriteria.mealCollected);
            }
          });

          // Call clearFilters multiple times
          act(() => {
            for (let i = 0; i < clearCount; i++) {
              result.current.clearFilters();
            }
          });

          // Result should be the same regardless of how many times we called clearFilters
          expect(result.current.filters).toEqual({
            clubs: [],
            hasPerformance: null,
            hasBooth: null,
            shirtCollected: null,
            mealCollected: null
          });
          expect(result.current.activeFilterCount).toBe(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should allow setting filters again after clearing', () => {
    fc.assert(
      fc.property(
        activeFilterCriteriaArbitrary,
        activeFilterCriteriaArbitrary,
        (firstFilters, secondFilters) => {
          const { result } = renderHook(() => useFilter());

          // Apply first set of filters
          act(() => {
            if (firstFilters.clubs.length > 0) {
              result.current.setFilter('clubs', firstFilters.clubs);
            }
            if (firstFilters.hasPerformance !== null) {
              result.current.setFilter('hasPerformance', firstFilters.hasPerformance);
            }
            if (firstFilters.hasBooth !== null) {
              result.current.setFilter('hasBooth', firstFilters.hasBooth);
            }
          });

          // Clear filters
          act(() => {
            result.current.clearFilters();
          });

          // Verify filters are cleared
          expect(result.current.filters).toEqual({
            clubs: [],
            hasPerformance: null,
            hasBooth: null,
            shirtCollected: null,
            mealCollected: null
          });

          // Apply second set of filters
          act(() => {
            if (secondFilters.clubs.length > 0) {
              result.current.setFilter('clubs', secondFilters.clubs);
            }
            if (secondFilters.hasPerformance !== null) {
              result.current.setFilter('hasPerformance', secondFilters.hasPerformance);
            }
            if (secondFilters.hasBooth !== null) {
              result.current.setFilter('hasBooth', secondFilters.hasBooth);
            }
            if (secondFilters.shirtCollected !== null) {
              result.current.setFilter('shirtCollected', secondFilters.shirtCollected);
            }
            if (secondFilters.mealCollected !== null) {
              result.current.setFilter('mealCollected', secondFilters.mealCollected);
            }
          });

          // Verify second filters are applied correctly (only check what was set)
          if (secondFilters.clubs.length > 0) {
            expect(result.current.filters.clubs).toEqual(secondFilters.clubs);
          } else {
            expect(result.current.filters.clubs).toEqual([]);
          }
          
          if (secondFilters.hasPerformance !== null) {
            expect(result.current.filters.hasPerformance).toBe(secondFilters.hasPerformance);
          } else {
            expect(result.current.filters.hasPerformance).toBe(null);
          }
          
          if (secondFilters.hasBooth !== null) {
            expect(result.current.filters.hasBooth).toBe(secondFilters.hasBooth);
          } else {
            expect(result.current.filters.hasBooth).toBe(null);
          }
          
          if (secondFilters.shirtCollected !== null) {
            expect(result.current.filters.shirtCollected).toBe(secondFilters.shirtCollected);
          } else {
            expect(result.current.filters.shirtCollected).toBe(null);
          }
          
          if (secondFilters.mealCollected !== null) {
            expect(result.current.filters.mealCollected).toBe(secondFilters.mealCollected);
          } else {
            expect(result.current.filters.mealCollected).toBe(null);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
