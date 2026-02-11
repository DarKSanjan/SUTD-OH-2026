/**
 * Property-based tests for TableHeader component
 * 
 * Feature: admin-table-enhancements
 * Property 16: Sort indicator reflects actual sort state
 * 
 * **Validates: Requirements 4.6**
 * 
 * Property 16: For any sort state (column and direction), the visual indicator
 * (arrow icon) should accurately show which column is sorted and in which direction.
 */

import { describe, it, expect, vi } from 'vitest';
import * as fc from 'fast-check';
import { render } from '@testing-library/react';
import TableHeader from '../TableHeader';
import { SortableColumn, SortDirection } from '../../../utils/types';

describe('Property 16: Sort indicator reflects actual sort state', () => {
  const sortableColumnArbitrary = fc.constantFrom<SortableColumn>(
    'studentId',
    'name',
    'shirtCollected',
    'mealCollected'
  );

  const sortDirectionArbitrary = fc.constantFrom<SortDirection>(
    'asc',
    'desc',
    null
  );

  const mockOnSort = vi.fn();

  it('should display correct indicator for any column and direction combination', () => {
    fc.assert(
      fc.property(
        sortableColumnArbitrary,
        sortDirectionArbitrary,
        (column, direction) => {
          const { container } = render(
            <table>
              <TableHeader
                sortColumn={direction === null ? null : column}
                sortDirection={direction}
                onSort={mockOnSort}
              />
            </table>
          );

          const indicator = container.querySelector('.sort-indicator');

          if (direction === null) {
            // No sort: no indicator should be present
            expect(indicator).toBeNull();
          } else if (direction === 'asc') {
            // Ascending: should show up arrow
            expect(indicator).not.toBeNull();
            expect(indicator?.textContent).toBe('↑');
          } else if (direction === 'desc') {
            // Descending: should show down arrow
            expect(indicator).not.toBeNull();
            expect(indicator?.textContent).toBe('↓');
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should show indicator only on the sorted column', () => {
    fc.assert(
      fc.property(
        sortableColumnArbitrary,
        fc.constantFrom<'asc' | 'desc'>('asc', 'desc'),
        (sortedColumn, direction) => {
          const { container } = render(
            <table>
              <TableHeader
                sortColumn={sortedColumn}
                sortDirection={direction}
                onSort={mockOnSort}
              />
            </table>
          );

          const indicators = container.querySelectorAll('.sort-indicator');
          
          // Should have exactly one indicator
          expect(indicators.length).toBe(1);

          // Get all column headers
          const allColumns: SortableColumn[] = ['studentId', 'name', 'shirtCollected', 'mealCollected'];
          const columnLabels = ['Student ID', 'Name', 'Shirt', 'Meal'];
          
          // Find which column has the indicator
          allColumns.forEach((column, index) => {
            const buttons = container.querySelectorAll('button');
            const button = buttons[index];
            const hasIndicator = button?.querySelector('.sort-indicator') !== null;

            if (column === sortedColumn) {
              // Sorted column should have indicator
              expect(hasIndicator).toBe(true);
            } else {
              // Other columns should not have indicator
              expect(hasIndicator).toBe(false);
            }
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should have aria-sort attribute matching the visual indicator', () => {
    fc.assert(
      fc.property(
        sortableColumnArbitrary,
        sortDirectionArbitrary,
        (column, direction) => {
          const { container } = render(
            <table>
              <TableHeader
                sortColumn={direction === null ? null : column}
                sortDirection={direction}
                onSort={mockOnSort}
              />
            </table>
          );

          const headers = container.querySelectorAll('th');
          const allColumns: SortableColumn[] = ['studentId', 'name', 'shirtCollected', 'mealCollected'];

          allColumns.forEach((col, index) => {
            const header = headers[index];
            const ariaSort = header.getAttribute('aria-sort');
            const indicator = header.querySelector('.sort-indicator');

            if (direction === null || col !== column) {
              // Unsorted column
              expect(ariaSort).toBe('none');
              expect(indicator).toBeNull();
            } else if (direction === 'asc') {
              // Ascending sort
              expect(ariaSort).toBe('ascending');
              expect(indicator?.textContent).toBe('↑');
            } else if (direction === 'desc') {
              // Descending sort
              expect(ariaSort).toBe('descending');
              expect(indicator?.textContent).toBe('↓');
            }
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should have aria-label matching the visual indicator state', () => {
    fc.assert(
      fc.property(
        sortableColumnArbitrary,
        sortDirectionArbitrary,
        (column, direction) => {
          const { container } = render(
            <table>
              <TableHeader
                sortColumn={direction === null ? null : column}
                sortDirection={direction}
                onSort={mockOnSort}
              />
            </table>
          );

          const buttons = container.querySelectorAll('button');
          const allColumns: SortableColumn[] = ['studentId', 'name', 'shirtCollected', 'mealCollected'];
          const columnLabels = ['Student ID', 'Name', 'Shirt', 'Meal'];

          allColumns.forEach((col, index) => {
            const button = buttons[index];
            const ariaLabel = button.getAttribute('aria-label');
            const indicator = button.querySelector('.sort-indicator');
            const label = columnLabels[index];

            if (direction === null || col !== column) {
              // Unsorted column
              expect(ariaLabel).toBe(`Sort by ${label}`);
              expect(indicator).toBeNull();
            } else if (direction === 'asc') {
              // Ascending sort
              expect(ariaLabel).toBe(`Sort by ${label} ascending`);
              expect(indicator?.textContent).toBe('↑');
            } else if (direction === 'desc') {
              // Descending sort
              expect(ariaLabel).toBe(`Sort by ${label} descending`);
              expect(indicator?.textContent).toBe('↓');
            }
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should have active class matching the visual indicator presence', () => {
    fc.assert(
      fc.property(
        sortableColumnArbitrary,
        sortDirectionArbitrary,
        (column, direction) => {
          const { container } = render(
            <table>
              <TableHeader
                sortColumn={direction === null ? null : column}
                sortDirection={direction}
                onSort={mockOnSort}
              />
            </table>
          );

          const buttons = container.querySelectorAll('button');
          const allColumns: SortableColumn[] = ['studentId', 'name', 'shirtCollected', 'mealCollected'];

          allColumns.forEach((col, index) => {
            const button = buttons[index];
            const hasActiveClass = button.classList.contains('active');
            const indicator = button.querySelector('.sort-indicator');

            if (direction === null || col !== column) {
              // Unsorted column
              expect(hasActiveClass).toBe(false);
              expect(indicator).toBeNull();
            } else {
              // Sorted column
              expect(hasActiveClass).toBe(true);
              expect(indicator).not.toBeNull();
            }
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should maintain indicator consistency across re-renders', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            column: fc.option(sortableColumnArbitrary, { nil: null }),
            direction: sortDirectionArbitrary
          }),
          { minLength: 1, maxLength: 10 }
        ),
        (states) => {
          const { container, rerender } = render(
            <table>
              <TableHeader
                sortColumn={null}
                sortDirection={null}
                onSort={mockOnSort}
              />
            </table>
          );

          // Apply each state and verify indicator matches
          for (const state of states) {
            const sortColumn = state.direction === null ? null : state.column;
            
            rerender(
              <table>
                <TableHeader
                  sortColumn={sortColumn}
                  sortDirection={state.direction}
                  onSort={mockOnSort}
                />
              </table>
            );

            const indicator = container.querySelector('.sort-indicator');

            if (state.direction === null || sortColumn === null) {
              expect(indicator).toBeNull();
            } else if (state.direction === 'asc') {
              expect(indicator?.textContent).toBe('↑');
            } else if (state.direction === 'desc') {
              expect(indicator?.textContent).toBe('↓');
            }
          }
        }
      ),
      { numRuns: 50 }
    );
  });

  it('should hide indicator from screen readers with aria-hidden when present', () => {
    fc.assert(
      fc.property(
        sortableColumnArbitrary,
        fc.constantFrom<'asc' | 'desc'>('asc', 'desc'),
        (column, direction) => {
          const { container } = render(
            <table>
              <TableHeader
                sortColumn={column}
                sortDirection={direction}
                onSort={mockOnSort}
              />
            </table>
          );

          const indicator = container.querySelector('.sort-indicator');
          
          // Indicator should exist
          expect(indicator).not.toBeNull();
          
          // Should be hidden from screen readers
          expect(indicator?.getAttribute('aria-hidden')).toBe('true');
          
          // Should have correct visual content
          if (direction === 'asc') {
            expect(indicator?.textContent).toBe('↑');
          } else {
            expect(indicator?.textContent).toBe('↓');
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should never show conflicting indicators (both up and down)', () => {
    fc.assert(
      fc.property(
        sortableColumnArbitrary,
        sortDirectionArbitrary,
        (column, direction) => {
          const { container } = render(
            <table>
              <TableHeader
                sortColumn={direction === null ? null : column}
                sortDirection={direction}
                onSort={mockOnSort}
              />
            </table>
          );

          const indicators = container.querySelectorAll('.sort-indicator');
          const indicatorTexts = Array.from(indicators).map(ind => ind.textContent);

          // Should never have both up and down arrows
          const hasUpArrow = indicatorTexts.includes('↑');
          const hasDownArrow = indicatorTexts.includes('↓');

          if (hasUpArrow) {
            expect(hasDownArrow).toBe(false);
          }
          if (hasDownArrow) {
            expect(hasUpArrow).toBe(false);
          }

          // Should have at most one indicator
          expect(indicators.length).toBeLessThanOrEqual(1);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should reflect state changes immediately without delay', () => {
    fc.assert(
      fc.property(
        sortableColumnArbitrary,
        sortableColumnArbitrary,
        (column1, column2) => {
          const { container, rerender } = render(
            <table>
              <TableHeader
                sortColumn={column1}
                sortDirection="asc"
                onSort={mockOnSort}
              />
            </table>
          );

          // Initial state
          let indicator = container.querySelector('.sort-indicator');
          expect(indicator?.textContent).toBe('↑');

          // Change to descending
          rerender(
            <table>
              <TableHeader
                sortColumn={column1}
                sortDirection="desc"
                onSort={mockOnSort}
              />
            </table>
          );

          indicator = container.querySelector('.sort-indicator');
          expect(indicator?.textContent).toBe('↓');

          // Change to different column
          rerender(
            <table>
              <TableHeader
                sortColumn={column2}
                sortDirection="asc"
                onSort={mockOnSort}
              />
            </table>
          );

          indicator = container.querySelector('.sort-indicator');
          expect(indicator?.textContent).toBe('↑');

          // Remove sort
          rerender(
            <table>
              <TableHeader
                sortColumn={null}
                sortDirection={null}
                onSort={mockOnSort}
              />
            </table>
          );

          indicator = container.querySelector('.sort-indicator');
          expect(indicator).toBeNull();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should maintain indicator accuracy for all possible column combinations', () => {
    fc.assert(
      fc.property(
        fc.constantFrom<'asc' | 'desc'>('asc', 'desc'),
        (direction) => {
          const allColumns: SortableColumn[] = ['studentId', 'name', 'shirtCollected', 'mealCollected'];

          // Test each column
          for (const column of allColumns) {
            const { container } = render(
              <table>
                <TableHeader
                  sortColumn={column}
                  sortDirection={direction}
                  onSort={mockOnSort}
                />
              </table>
            );

            const indicators = container.querySelectorAll('.sort-indicator');
            
            // Should have exactly one indicator
            expect(indicators.length).toBe(1);
            
            // Should show correct direction
            const expectedIndicator = direction === 'asc' ? '↑' : '↓';
            expect(indicators[0].textContent).toBe(expectedIndicator);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
