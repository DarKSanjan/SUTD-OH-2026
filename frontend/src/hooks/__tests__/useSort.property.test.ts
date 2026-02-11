/**
 * Property-based tests for useSort hook
 * 
 * Feature: admin-table-enhancements
 * Property 14: Sort direction toggles on repeated clicks
 * Property 15: Sort column switch resets to ascending
 * 
 * **Validates: Requirements 4.3, 4.4**
 * 
 * Property 14: For any column, clicking the column header once should sort ascending,
 * clicking again should sort descending, and clicking a third time should remove sorting.
 * 
 * Property 15: For any two different sortable columns, if column A is currently sorted,
 * clicking column B should sort by column B in ascending order (not descending).
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { renderHook, act } from '@testing-library/react';
import { useSort } from '../useSort';
import { SortableColumn } from '../../utils/types';

describe('Property 14: Sort direction toggles on repeated clicks', () => {
  const sortableColumnArbitrary = fc.constantFrom<SortableColumn>(
    'studentId',
    'name',
    'shirtCollected',
    'mealCollected'
  );

  it('should cycle through asc -> desc -> null on repeated clicks of same column', () => {
    fc.assert(
      fc.property(
        sortableColumnArbitrary,
        (column) => {
          const { result } = renderHook(() => useSort());

          // Initial state: no sorting
          expect(result.current.sortColumn).toBe(null);
          expect(result.current.sortDirection).toBe(null);

          // First click: ascending
          act(() => {
            result.current.handleSort(column);
          });

          expect(result.current.sortColumn).toBe(column);
          expect(result.current.sortDirection).toBe('asc');

          // Second click: descending
          act(() => {
            result.current.handleSort(column);
          });

          expect(result.current.sortColumn).toBe(column);
          expect(result.current.sortDirection).toBe('desc');

          // Third click: remove sorting
          act(() => {
            result.current.handleSort(column);
          });

          expect(result.current.sortColumn).toBe(null);
          expect(result.current.sortDirection).toBe(null);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should maintain cycle pattern across multiple iterations', () => {
    fc.assert(
      fc.property(
        sortableColumnArbitrary,
        fc.integer({ min: 1, max: 10 }),
        (column, iterations) => {
          const { result } = renderHook(() => useSort());

          for (let i = 0; i < iterations; i++) {
            // First click: ascending
            act(() => {
              result.current.handleSort(column);
            });
            expect(result.current.sortDirection).toBe('asc');

            // Second click: descending
            act(() => {
              result.current.handleSort(column);
            });
            expect(result.current.sortDirection).toBe('desc');

            // Third click: null
            act(() => {
              result.current.handleSort(column);
            });
            expect(result.current.sortDirection).toBe(null);
          }
        }
      ),
      { numRuns: 50 }
    );
  });

  it('should toggle correctly after any number of clicks', () => {
    fc.assert(
      fc.property(
        sortableColumnArbitrary,
        fc.integer({ min: 1, max: 20 }),
        (column, clickCount) => {
          const { result } = renderHook(() => useSort());

          // Click the column multiple times
          for (let i = 0; i < clickCount; i++) {
            act(() => {
              result.current.handleSort(column);
            });
          }

          // Verify the state matches the expected cycle position
          const position = clickCount % 3;
          
          if (position === 1) {
            // After 1, 4, 7, ... clicks: ascending
            expect(result.current.sortColumn).toBe(column);
            expect(result.current.sortDirection).toBe('asc');
          } else if (position === 2) {
            // After 2, 5, 8, ... clicks: descending
            expect(result.current.sortColumn).toBe(column);
            expect(result.current.sortDirection).toBe('desc');
          } else {
            // After 3, 6, 9, ... clicks: null
            expect(result.current.sortColumn).toBe(null);
            expect(result.current.sortDirection).toBe(null);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should always start with ascending on first click from null state', () => {
    fc.assert(
      fc.property(
        sortableColumnArbitrary,
        (column) => {
          const { result } = renderHook(() => useSort());

          // Ensure we're in null state
          expect(result.current.sortColumn).toBe(null);

          // First click should always be ascending
          act(() => {
            result.current.handleSort(column);
          });

          expect(result.current.sortDirection).toBe('asc');
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should transition from asc to desc on second click', () => {
    fc.assert(
      fc.property(
        sortableColumnArbitrary,
        (column) => {
          const { result } = renderHook(() => useSort());

          // First click
          act(() => {
            result.current.handleSort(column);
          });

          expect(result.current.sortDirection).toBe('asc');

          // Second click should always be descending
          act(() => {
            result.current.handleSort(column);
          });

          expect(result.current.sortDirection).toBe('desc');
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should transition from desc to null on third click', () => {
    fc.assert(
      fc.property(
        sortableColumnArbitrary,
        (column) => {
          const { result } = renderHook(() => useSort());

          // First click: asc
          act(() => {
            result.current.handleSort(column);
          });

          // Second click: desc
          act(() => {
            result.current.handleSort(column);
          });

          expect(result.current.sortDirection).toBe('desc');

          // Third click should always be null
          act(() => {
            result.current.handleSort(column);
          });

          expect(result.current.sortColumn).toBe(null);
          expect(result.current.sortDirection).toBe(null);
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe('Property 15: Sort column switch resets to ascending', () => {
  const sortableColumnArbitrary = fc.constantFrom<SortableColumn>(
    'studentId',
    'name',
    'shirtCollected',
    'mealCollected'
  );

  // Generate two different columns
  const twoDifferentColumnsArbitrary = sortableColumnArbitrary
    .chain(col1 => 
      sortableColumnArbitrary
        .filter(col2 => col2 !== col1)
        .map(col2 => [col1, col2] as const)
    );

  it('should reset to ascending when switching from any column to a different column', () => {
    fc.assert(
      fc.property(
        twoDifferentColumnsArbitrary,
        ([column1, column2]) => {
          const { result } = renderHook(() => useSort());

          // Click first column to set it to ascending
          act(() => {
            result.current.handleSort(column1);
          });

          expect(result.current.sortColumn).toBe(column1);
          expect(result.current.sortDirection).toBe('asc');

          // Click second column - should reset to ascending
          act(() => {
            result.current.handleSort(column2);
          });

          expect(result.current.sortColumn).toBe(column2);
          expect(result.current.sortDirection).toBe('asc');
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should reset to ascending when switching from descending sort', () => {
    fc.assert(
      fc.property(
        twoDifferentColumnsArbitrary,
        ([column1, column2]) => {
          const { result } = renderHook(() => useSort());

          // Click first column twice to set it to descending
          act(() => {
            result.current.handleSort(column1);
          });
          act(() => {
            result.current.handleSort(column1);
          });

          expect(result.current.sortColumn).toBe(column1);
          expect(result.current.sortDirection).toBe('desc');

          // Click second column - should reset to ascending
          act(() => {
            result.current.handleSort(column2);
          });

          expect(result.current.sortColumn).toBe(column2);
          expect(result.current.sortDirection).toBe('asc');
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should reset to ascending when switching from null sort', () => {
    fc.assert(
      fc.property(
        twoDifferentColumnsArbitrary,
        ([column1, column2]) => {
          const { result } = renderHook(() => useSort());

          // Click first column three times to remove sorting
          act(() => {
            result.current.handleSort(column1);
          });
          act(() => {
            result.current.handleSort(column1);
          });
          act(() => {
            result.current.handleSort(column1);
          });

          expect(result.current.sortColumn).toBe(null);
          expect(result.current.sortDirection).toBe(null);

          // Click second column - should be ascending
          act(() => {
            result.current.handleSort(column2);
          });

          expect(result.current.sortColumn).toBe(column2);
          expect(result.current.sortDirection).toBe('asc');
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should always reset to ascending regardless of previous column state', () => {
    fc.assert(
      fc.property(
        twoDifferentColumnsArbitrary,
        fc.integer({ min: 1, max: 10 }),
        ([column1, column2], clicksOnFirstColumn) => {
          const { result } = renderHook(() => useSort());

          // Click first column arbitrary number of times
          for (let i = 0; i < clicksOnFirstColumn; i++) {
            act(() => {
              result.current.handleSort(column1);
            });
          }

          // Click second column - should always be ascending
          act(() => {
            result.current.handleSort(column2);
          });

          expect(result.current.sortColumn).toBe(column2);
          expect(result.current.sortDirection).toBe('asc');
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should maintain ascending when switching between multiple different columns', () => {
    fc.assert(
      fc.property(
        fc.array(sortableColumnArbitrary, { minLength: 2, maxLength: 4 }),
        (columns) => {
          // Ensure we have at least 2 different columns
          const uniqueColumns = Array.from(new Set(columns));
          if (uniqueColumns.length < 2) return; // Skip if not enough unique columns

          const { result } = renderHook(() => useSort());

          // Click through each column
          for (const column of uniqueColumns) {
            act(() => {
              result.current.handleSort(column);
            });

            // Each new column should be ascending
            expect(result.current.sortColumn).toBe(column);
            expect(result.current.sortDirection).toBe('asc');
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should not inherit direction from previous column', () => {
    fc.assert(
      fc.property(
        twoDifferentColumnsArbitrary,
        ([ column1, column2]) => {
          const { result } = renderHook(() => useSort());

          // Set first column to descending
          act(() => {
            result.current.handleSort(column1);
          });
          act(() => {
            result.current.handleSort(column1);
          });

          const previousDirection = result.current.sortDirection;
          expect(previousDirection).toBe('desc');

          // Switch to second column
          act(() => {
            result.current.handleSort(column2);
          });

          // Should be ascending, not inheriting descending from previous column
          expect(result.current.sortDirection).toBe('asc');
          expect(result.current.sortDirection).not.toBe(previousDirection);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should allow toggling new column after switch', () => {
    fc.assert(
      fc.property(
        twoDifferentColumnsArbitrary,
        ([column1, column2]) => {
          const { result } = renderHook(() => useSort());

          // Click first column
          act(() => {
            result.current.handleSort(column1);
          });

          // Switch to second column (should be ascending)
          act(() => {
            result.current.handleSort(column2);
          });

          expect(result.current.sortDirection).toBe('asc');

          // Click second column again (should toggle to descending)
          act(() => {
            result.current.handleSort(column2);
          });

          expect(result.current.sortColumn).toBe(column2);
          expect(result.current.sortDirection).toBe('desc');
        }
      ),
      { numRuns: 100 }
    );
  });
});
