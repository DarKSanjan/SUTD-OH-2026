import { useState, useMemo } from 'react';
import { FilterCriteria } from '../utils/types';

/**
 * Return type for useFilter hook
 */
export interface UseFilterReturn {
  filters: FilterCriteria;
  setFilter: <K extends keyof FilterCriteria>(
    key: K,
    value: FilterCriteria[K]
  ) => void;
  clearFilters: () => void;
  activeFilterCount: number;
}

/**
 * Initial filter state with all filters inactive
 */
const initialFilters: FilterCriteria = {
  clubs: [],
  hasPerformance: null,
  hasBooth: null,
  shirtCollected: null,
  mealCollected: null
};

/**
 * Custom hook for managing filter criteria
 * 
 * Manages multiple filter criteria for the admin table, provides methods
 * to update individual filters, clear all filters, and tracks the count
 * of active filters.
 * 
 * @returns Object containing filters, setFilter method, clearFilters method, and active filter count
 * 
 * @example
 * ```tsx
 * const { filters, setFilter, clearFilters, activeFilterCount } = useFilter();
 * 
 * // Set a club filter
 * setFilter('clubs', ['Chess Club', 'Drama Club']);
 * 
 * // Set a boolean filter
 * setFilter('hasPerformance', true);
 * 
 * // Clear all filters
 * clearFilters();
 * 
 * // Show active filter count
 * <span>Active filters: {activeFilterCount}</span>
 * ```
 */
export function useFilter(): UseFilterReturn {
  const [filters, setFilters] = useState<FilterCriteria>(initialFilters);

  /**
   * Update a specific filter criterion
   * 
   * @param key - The filter key to update
   * @param value - The new value for the filter
   */
  const setFilter = <K extends keyof FilterCriteria>(
    key: K,
    value: FilterCriteria[K]
  ) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  /**
   * Reset all filters to their initial state
   */
  const clearFilters = () => {
    setFilters(initialFilters);
  };

  /**
   * Calculate the number of active filters
   * 
   * A filter is considered active if:
   * - For array filters (clubs): length > 0
   * - For boolean filters: value is not null
   */
  const activeFilterCount = useMemo(() => {
    let count = 0;
    
    // Count club filters
    if (filters.clubs.length > 0) {
      count++;
    }
    
    // Count boolean filters
    if (filters.hasPerformance !== null) {
      count++;
    }
    
    if (filters.hasBooth !== null) {
      count++;
    }
    
    if (filters.shirtCollected !== null) {
      count++;
    }
    
    if (filters.mealCollected !== null) {
      count++;
    }
    
    return count;
  }, [filters]);

  return {
    filters,
    setFilter,
    clearFilters,
    activeFilterCount
  };
}
