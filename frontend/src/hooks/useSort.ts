import { useState } from 'react';
import { SortDirection, SortableColumn } from '../utils/types';

/**
 * Return type for useSort hook
 */
export interface UseSortReturn {
  sortColumn: SortableColumn | null;
  sortDirection: SortDirection;
  handleSort: (column: SortableColumn) => void;
}

/**
 * Custom hook for managing column sorting logic
 * 
 * Manages sort column and direction state with the following behavior:
 * - First click on a column: sort ascending
 * - Second click on same column: sort descending
 * - Third click on same column: remove sorting (null)
 * - Click on different column: sort by new column in ascending order
 * 
 * @returns Object containing sortColumn, sortDirection, and handleSort function
 * 
 * @example
 * ```tsx
 * const { sortColumn, sortDirection, handleSort } = useSort();
 * 
 * // Handle column header click
 * <th onClick={() => handleSort('name')}>
 *   Name {sortColumn === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
 * </th>
 * ```
 */
export function useSort(): UseSortReturn {
  const [sortColumn, setSortColumn] = useState<SortableColumn | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  /**
   * Handle sort column click
   * 
   * Behavior:
   * - If clicking a new column: set to ascending
   * - If clicking same column: toggle asc -> desc -> null
   * 
   * @param column - The column to sort by
   */
  const handleSort = (column: SortableColumn) => {
    if (sortColumn === column) {
      // Same column: toggle direction
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        // Third click: remove sorting
        setSortColumn(null);
        setSortDirection(null);
      } else {
        // Should not happen, but handle it
        setSortDirection('asc');
      }
    } else {
      // Different column: reset to ascending
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  return {
    sortColumn,
    sortDirection,
    handleSort
  };
}
