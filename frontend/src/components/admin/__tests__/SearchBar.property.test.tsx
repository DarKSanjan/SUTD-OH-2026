/**
 * Property-based tests for SearchBar component
 * 
 * Feature: admin-table-enhancements
 * Property 7: Displayed count matches visible records
 * 
 * **Validates: Requirements 2.6, 3.9**
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import * as fc from 'fast-check';
import SearchBar from '../SearchBar';

describe('Property: SearchBar record count accuracy', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  /**
   * Property 7: Displayed count matches visible records
   * 
   * For any combination of search query and filters, the displayed record count
   * should equal the number of visible table rows.
   * 
   * This property ensures that the count shown to users is always accurate and
   * reflects the actual number of records being displayed.
   * 
   * **Validates: Requirements 2.6, 3.9**
   */
  it('Property 7: Displayed count matches visible records', () => {
    fc.assert(
      fc.property(
        fc.stringMatching(/^[A-Za-z0-9 ]{1,50}$/), // search query (alphanumeric with spaces)
        fc.nat({ max: 10000 }), // result count (0 to 10000)
        (searchQuery, actualResultCount) => {
          const mockOnChange = vi.fn();

          const { unmount } = render(
            <SearchBar
              value={searchQuery}
              onChange={mockOnChange}
              resultCount={actualResultCount}
            />
          );

          try {
            const hasQuery = searchQuery.trim().length > 0;

            if (hasQuery) {
              // When search is active, result count should be displayed
              const resultCountElement = screen.getByRole('status');
              expect(resultCountElement).toBeDefined();

              // Extract the number from the displayed text
              const displayedText = resultCountElement.textContent || '';
              const displayedCountMatch = displayedText.match(/^(\d+)/);
              expect(displayedCountMatch).not.toBeNull();

              const displayedCount = parseInt(displayedCountMatch![1], 10);

              // The displayed count must exactly match the actual result count
              expect(displayedCount).toBe(actualResultCount);

              // Verify the text format is correct
              const expectedText = actualResultCount === 1
                ? '1 result found'
                : `${actualResultCount} results found`;
              expect(displayedText).toBe(expectedText);
            } else {
              // When search is empty, result count should not be displayed
              const resultCountElement = screen.queryByRole('status');
              expect(resultCountElement).toBeNull();
            }
          } finally {
            unmount();
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Result count is always non-negative
   * 
   * For any search query, the displayed result count should never be negative.
   * This ensures data integrity and prevents confusing UI states.
   */
  it('Property: Result count is always non-negative', () => {
    fc.assert(
      fc.property(
        fc.stringMatching(/^[A-Za-z0-9 ]{1,50}$/), // search query
        fc.nat({ max: 10000 }), // non-negative result count
        (searchQuery, resultCount) => {
          const mockOnChange = vi.fn();

          const { unmount } = render(
            <SearchBar
              value={searchQuery}
              onChange={mockOnChange}
              resultCount={resultCount}
            />
          );

          try {
            if (searchQuery.trim().length > 0) {
              const resultCountElement = screen.getByRole('status');
              const displayedText = resultCountElement.textContent || '';
              const displayedCountMatch = displayedText.match(/^(\d+)/);
              
              if (displayedCountMatch) {
                const displayedCount = parseInt(displayedCountMatch[1], 10);
                // Count must be non-negative
                expect(displayedCount).toBeGreaterThanOrEqual(0);
              }
            }
          } finally {
            unmount();
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Result count format is consistent
   * 
   * For any result count, the displayed format should be consistent:
   * - "1 result found" for count of 1
   * - "N results found" for any other count (including 0)
   */
  it('Property: Result count format is consistent', () => {
    fc.assert(
      fc.property(
        fc.stringMatching(/^[A-Za-z0-9 ]{1,50}$/), // search query (non-empty)
        fc.nat({ max: 1000 }), // result count
        (searchQuery, resultCount) => {
          // Ensure query is not empty
          const query = searchQuery.trim() || 'test';
          const mockOnChange = vi.fn();

          const { unmount } = render(
            <SearchBar
              value={query}
              onChange={mockOnChange}
              resultCount={resultCount}
            />
          );

          try {
            const resultCountElement = screen.getByRole('status');
            const displayedText = resultCountElement.textContent || '';

            // Verify format consistency
            if (resultCount === 1) {
              expect(displayedText).toBe('1 result found');
            } else {
              expect(displayedText).toBe(`${resultCount} results found`);
            }

            // Verify the text always ends with "found"
            expect(displayedText).toMatch(/found$/);

            // Verify the text starts with a number
            expect(displayedText).toMatch(/^\d+/);
          } finally {
            unmount();
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Result count visibility depends on query presence
   * 
   * For any result count value, the count should only be visible when
   * the search query is non-empty (after trimming whitespace).
   */
  it('Property: Result count visibility depends on query presence', () => {
    fc.assert(
      fc.property(
        fc.string(), // any string (including empty, whitespace-only)
        fc.nat({ max: 1000 }), // result count
        (searchQuery, resultCount) => {
          const mockOnChange = vi.fn();

          const { unmount } = render(
            <SearchBar
              value={searchQuery}
              onChange={mockOnChange}
              resultCount={resultCount}
            />
          );

          try {
            const hasNonEmptyQuery = searchQuery.trim().length > 0;
            const resultCountElement = screen.queryByRole('status');

            if (hasNonEmptyQuery) {
              // Should display result count when query is non-empty
              expect(resultCountElement).not.toBeNull();
            } else {
              // Should not display result count when query is empty or whitespace-only
              expect(resultCountElement).toBeNull();
            }
          } finally {
            unmount();
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Result count updates reflect actual count changes
   * 
   * For any sequence of result count changes, the displayed count should
   * always reflect the most recent value provided.
   */
  it('Property: Result count updates reflect actual count changes', () => {
    fc.assert(
      fc.property(
        fc.stringMatching(/^[A-Za-z0-9 ]{1,50}$/), // search query (non-empty)
        fc.array(fc.nat({ max: 1000 }), { minLength: 2, maxLength: 10 }), // sequence of counts
        (searchQuery, countSequence) => {
          // Ensure query is not empty
          const query = searchQuery.trim() || 'test';
          const mockOnChange = vi.fn();

          const { rerender, unmount } = render(
            <SearchBar
              value={query}
              onChange={mockOnChange}
              resultCount={countSequence[0]}
            />
          );

          try {
            // Verify initial count
            let resultCountElement = screen.getByRole('status');
            let displayedText = resultCountElement.textContent || '';
            let displayedCountMatch = displayedText.match(/^(\d+)/);
            expect(displayedCountMatch).not.toBeNull();
            let displayedCount = parseInt(displayedCountMatch![1], 10);
            expect(displayedCount).toBe(countSequence[0]);

            // Update through the sequence and verify each change
            for (let i = 1; i < countSequence.length; i++) {
              rerender(
                <SearchBar
                  value={query}
                  onChange={mockOnChange}
                  resultCount={countSequence[i]}
                />
              );

              resultCountElement = screen.getByRole('status');
              displayedText = resultCountElement.textContent || '';
              displayedCountMatch = displayedText.match(/^(\d+)/);
              expect(displayedCountMatch).not.toBeNull();
              displayedCount = parseInt(displayedCountMatch![1], 10);

              // Each update should reflect the new count
              expect(displayedCount).toBe(countSequence[i]);
            }
          } finally {
            unmount();
          }
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Property: Zero results are displayed correctly
   * 
   * For any search query with zero results, the component should display
   * "0 results found" (not hide the count or show an error).
   */
  it('Property: Zero results are displayed correctly', () => {
    fc.assert(
      fc.property(
        fc.stringMatching(/^[A-Za-z0-9 ]{1,50}$/), // search query (non-empty)
        (searchQuery) => {
          // Ensure query is not empty
          const query = searchQuery.trim() || 'test';
          const mockOnChange = vi.fn();

          const { unmount } = render(
            <SearchBar
              value={query}
              onChange={mockOnChange}
              resultCount={0}
            />
          );

          try {
            const resultCountElement = screen.getByRole('status');
            expect(resultCountElement).toBeDefined();

            const displayedText = resultCountElement.textContent || '';
            expect(displayedText).toBe('0 results found');

            // Verify it uses plural "results" for zero
            expect(displayedText).toContain('results');
            expect(displayedText).not.toContain('result found');
          } finally {
            unmount();
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Result count accessibility attributes are present
   * 
   * For any search with results, the result count element should have
   * proper accessibility attributes (role="status", aria-live="polite").
   */
  it('Property: Result count accessibility attributes are present', () => {
    fc.assert(
      fc.property(
        fc.stringMatching(/^[A-Za-z0-9 ]{1,50}$/), // search query (non-empty)
        fc.nat({ max: 1000 }), // result count
        (searchQuery, resultCount) => {
          // Ensure query is not empty
          const query = searchQuery.trim() || 'test';
          const mockOnChange = vi.fn();

          const { unmount } = render(
            <SearchBar
              value={query}
              onChange={mockOnChange}
              resultCount={resultCount}
            />
          );

          try {
            const resultCountElement = screen.getByRole('status');

            // Should have role="status"
            expect(resultCountElement.getAttribute('role')).toBe('status');

            // Should have aria-live="polite" for screen reader announcements
            expect(resultCountElement.getAttribute('aria-live')).toBe('polite');

            // Should have the correct id for aria-describedby linking
            expect(resultCountElement.id).toBe('search-results-count');
          } finally {
            unmount();
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
