import { renderHook, act } from '@testing-library/react';
import { useFilter } from '../useFilter';
import { FilterCriteria } from '../../utils/types';

describe('useFilter', () => {
  describe('initialization', () => {
    it('should initialize with empty filters', () => {
      const { result } = renderHook(() => useFilter());

      expect(result.current.filters).toEqual({
        clubs: [],
        hasPerformance: null,
        hasBooth: null,
        shirtCollected: null,
        mealCollected: null
      });
    });

    it('should initialize with zero active filters', () => {
      const { result } = renderHook(() => useFilter());

      expect(result.current.activeFilterCount).toBe(0);
    });
  });

  describe('setFilter', () => {
    it('should update club filter', () => {
      const { result } = renderHook(() => useFilter());

      act(() => {
        result.current.setFilter('clubs', ['Chess Club', 'Drama Club']);
      });

      expect(result.current.filters.clubs).toEqual(['Chess Club', 'Drama Club']);
    });

    it('should update hasPerformance filter', () => {
      const { result } = renderHook(() => useFilter());

      act(() => {
        result.current.setFilter('hasPerformance', true);
      });

      expect(result.current.filters.hasPerformance).toBe(true);
    });

    it('should update hasBooth filter', () => {
      const { result } = renderHook(() => useFilter());

      act(() => {
        result.current.setFilter('hasBooth', false);
      });

      expect(result.current.filters.hasBooth).toBe(false);
    });

    it('should update shirtCollected filter', () => {
      const { result } = renderHook(() => useFilter());

      act(() => {
        result.current.setFilter('shirtCollected', true);
      });

      expect(result.current.filters.shirtCollected).toBe(true);
    });

    it('should update mealCollected filter', () => {
      const { result } = renderHook(() => useFilter());

      act(() => {
        result.current.setFilter('mealCollected', false);
      });

      expect(result.current.filters.mealCollected).toBe(false);
    });

    it('should preserve other filters when updating one filter', () => {
      const { result } = renderHook(() => useFilter());

      act(() => {
        result.current.setFilter('clubs', ['Chess Club']);
        result.current.setFilter('hasPerformance', true);
      });

      expect(result.current.filters.clubs).toEqual(['Chess Club']);
      expect(result.current.filters.hasPerformance).toBe(true);
      expect(result.current.filters.hasBooth).toBe(null);
    });

    it('should allow updating the same filter multiple times', () => {
      const { result } = renderHook(() => useFilter());

      act(() => {
        result.current.setFilter('clubs', ['Chess Club']);
      });

      expect(result.current.filters.clubs).toEqual(['Chess Club']);

      act(() => {
        result.current.setFilter('clubs', ['Drama Club', 'Music Club']);
      });

      expect(result.current.filters.clubs).toEqual(['Drama Club', 'Music Club']);
    });

    it('should allow setting boolean filter to null', () => {
      const { result } = renderHook(() => useFilter());

      act(() => {
        result.current.setFilter('hasPerformance', true);
      });

      expect(result.current.filters.hasPerformance).toBe(true);

      act(() => {
        result.current.setFilter('hasPerformance', null);
      });

      expect(result.current.filters.hasPerformance).toBe(null);
    });
  });

  describe('clearFilters', () => {
    it('should reset all filters to initial state', () => {
      const { result } = renderHook(() => useFilter());

      // Set multiple filters
      act(() => {
        result.current.setFilter('clubs', ['Chess Club']);
        result.current.setFilter('hasPerformance', true);
        result.current.setFilter('hasBooth', false);
        result.current.setFilter('shirtCollected', true);
        result.current.setFilter('mealCollected', false);
      });

      // Verify filters are set
      expect(result.current.filters.clubs).toEqual(['Chess Club']);
      expect(result.current.filters.hasPerformance).toBe(true);

      // Clear all filters
      act(() => {
        result.current.clearFilters();
      });

      // Verify all filters are reset
      expect(result.current.filters).toEqual({
        clubs: [],
        hasPerformance: null,
        hasBooth: null,
        shirtCollected: null,
        mealCollected: null
      });
    });

    it('should reset active filter count to zero', () => {
      const { result } = renderHook(() => useFilter());

      // Set multiple filters
      act(() => {
        result.current.setFilter('clubs', ['Chess Club']);
        result.current.setFilter('hasPerformance', true);
      });

      expect(result.current.activeFilterCount).toBe(2);

      // Clear all filters
      act(() => {
        result.current.clearFilters();
      });

      expect(result.current.activeFilterCount).toBe(0);
    });

    it('should be idempotent (safe to call multiple times)', () => {
      const { result } = renderHook(() => useFilter());

      act(() => {
        result.current.setFilter('clubs', ['Chess Club']);
      });

      act(() => {
        result.current.clearFilters();
        result.current.clearFilters();
        result.current.clearFilters();
      });

      expect(result.current.filters).toEqual({
        clubs: [],
        hasPerformance: null,
        hasBooth: null,
        shirtCollected: null,
        mealCollected: null
      });
    });
  });

  describe('activeFilterCount', () => {
    it('should count club filter as active when clubs array is not empty', () => {
      const { result } = renderHook(() => useFilter());

      act(() => {
        result.current.setFilter('clubs', ['Chess Club']);
      });

      expect(result.current.activeFilterCount).toBe(1);
    });

    it('should not count club filter as active when clubs array is empty', () => {
      const { result } = renderHook(() => useFilter());

      act(() => {
        result.current.setFilter('clubs', []);
      });

      expect(result.current.activeFilterCount).toBe(0);
    });

    it('should count boolean filter as active when set to true', () => {
      const { result } = renderHook(() => useFilter());

      act(() => {
        result.current.setFilter('hasPerformance', true);
      });

      expect(result.current.activeFilterCount).toBe(1);
    });

    it('should count boolean filter as active when set to false', () => {
      const { result } = renderHook(() => useFilter());

      act(() => {
        result.current.setFilter('hasBooth', false);
      });

      expect(result.current.activeFilterCount).toBe(1);
    });

    it('should not count boolean filter as active when set to null', () => {
      const { result } = renderHook(() => useFilter());

      act(() => {
        result.current.setFilter('hasPerformance', null);
      });

      expect(result.current.activeFilterCount).toBe(0);
    });

    it('should count multiple active filters correctly', () => {
      const { result } = renderHook(() => useFilter());

      act(() => {
        result.current.setFilter('clubs', ['Chess Club', 'Drama Club']);
        result.current.setFilter('hasPerformance', true);
        result.current.setFilter('shirtCollected', false);
      });

      expect(result.current.activeFilterCount).toBe(3);
    });

    it('should count all five filter types when all are active', () => {
      const { result } = renderHook(() => useFilter());

      act(() => {
        result.current.setFilter('clubs', ['Chess Club']);
        result.current.setFilter('hasPerformance', true);
        result.current.setFilter('hasBooth', false);
        result.current.setFilter('shirtCollected', true);
        result.current.setFilter('mealCollected', false);
      });

      expect(result.current.activeFilterCount).toBe(5);
    });

    it('should update count when filters are added', () => {
      const { result } = renderHook(() => useFilter());

      expect(result.current.activeFilterCount).toBe(0);

      act(() => {
        result.current.setFilter('clubs', ['Chess Club']);
      });

      expect(result.current.activeFilterCount).toBe(1);

      act(() => {
        result.current.setFilter('hasPerformance', true);
      });

      expect(result.current.activeFilterCount).toBe(2);
    });

    it('should update count when filters are removed', () => {
      const { result } = renderHook(() => useFilter());

      act(() => {
        result.current.setFilter('clubs', ['Chess Club']);
        result.current.setFilter('hasPerformance', true);
      });

      expect(result.current.activeFilterCount).toBe(2);

      act(() => {
        result.current.setFilter('clubs', []);
      });

      expect(result.current.activeFilterCount).toBe(1);

      act(() => {
        result.current.setFilter('hasPerformance', null);
      });

      expect(result.current.activeFilterCount).toBe(0);
    });
  });

  describe('edge cases', () => {
    it('should handle empty club array', () => {
      const { result } = renderHook(() => useFilter());

      act(() => {
        result.current.setFilter('clubs', []);
      });

      expect(result.current.filters.clubs).toEqual([]);
      expect(result.current.activeFilterCount).toBe(0);
    });

    it('should handle single club in array', () => {
      const { result } = renderHook(() => useFilter());

      act(() => {
        result.current.setFilter('clubs', ['Single Club']);
      });

      expect(result.current.filters.clubs).toEqual(['Single Club']);
      expect(result.current.activeFilterCount).toBe(1);
    });

    it('should handle many clubs in array', () => {
      const { result } = renderHook(() => useFilter());
      const manyClubs = Array.from({ length: 20 }, (_, i) => `Club ${i + 1}`);

      act(() => {
        result.current.setFilter('clubs', manyClubs);
      });

      expect(result.current.filters.clubs).toEqual(manyClubs);
      expect(result.current.activeFilterCount).toBe(1);
    });

    it('should handle rapid filter updates', () => {
      const { result } = renderHook(() => useFilter());

      act(() => {
        result.current.setFilter('hasPerformance', true);
        result.current.setFilter('hasPerformance', false);
        result.current.setFilter('hasPerformance', null);
        result.current.setFilter('hasPerformance', true);
      });

      expect(result.current.filters.hasPerformance).toBe(true);
      expect(result.current.activeFilterCount).toBe(1);
    });
  });
});
