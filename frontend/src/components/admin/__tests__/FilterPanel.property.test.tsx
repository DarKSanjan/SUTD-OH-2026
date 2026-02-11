/**
 * Property-based tests for FilterPanel component
 * 
 * Feature: admin-table-enhancements
 * Property 22: Active filters display badges
 * 
 * **Validates: Requirements 8.1**
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import * as fc from 'fast-check';
import FilterPanel from '../FilterPanel';
import { FilterCriteria } from '../../../utils/types';

describe('Property: FilterPanel active filter badges', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  // Arbitrary for generating random filter criteria
  const filterCriteriaArbitrary = fc.record({
    clubs: fc.array(
      fc.stringMatching(/^[A-Za-z ]{3,20}$/).filter(s => s.trim().length > 0),
      { maxLength: 5 }
    ),
    hasPerformance: fc.option(fc.boolean(), { nil: null }),
    hasBooth: fc.option(fc.boolean(), { nil: null }),
    shirtCollected: fc.option(fc.boolean(), { nil: null }),
    mealCollected: fc.option(fc.boolean(), { nil: null }),
  });

  // Arbitrary for available clubs
  const availableClubsArbitrary = fc.array(
    fc.stringMatching(/^[A-Za-z ]{3,20}$/).filter(s => s.trim().length > 0),
    { minLength: 0, maxLength: 10 }
  );

  /**
   * Property 22: Active filters display badges
   * 
   * For any active filter, a badge should be visible in the UI showing
   * the filter type and value.
   * 
   * This property ensures that users can always see which filters are currently
   * applied, providing transparency and allowing them to understand why certain
   * records are visible.
   * 
   * **Validates: Requirements 8.1**
   */
  it('Property 22: Active filters display badges', () => {
    fc.assert(
      fc.property(
        filterCriteriaArbitrary,
        availableClubsArbitrary,
        (filters, availableClubs) => {
          const mockOnFilterChange = vi.fn();
          const mockOnClearFilters = vi.fn();

          // Calculate expected active filter count
          let expectedActiveCount = filters.clubs.length;
          if (filters.hasPerformance !== null) expectedActiveCount++;
          if (filters.hasBooth !== null) expectedActiveCount++;
          if (filters.shirtCollected !== null) expectedActiveCount++;
          if (filters.mealCollected !== null) expectedActiveCount++;

          const { unmount } = render(
            <FilterPanel
              filters={filters}
              onFilterChange={mockOnFilterChange}
              onClearFilters={mockOnClearFilters}
              availableClubs={availableClubs}
              activeFilterCount={expectedActiveCount}
            />
          );

          try {
            if (expectedActiveCount === 0) {
              // When no filters are active, badges region should not exist
              const badgesRegion = screen.queryByRole('region', { name: 'Active filters' });
              expect(badgesRegion).toBeNull();
            } else {
              // When filters are active, badges region should exist
              const badgesRegion = screen.getByRole('region', { name: 'Active filters' });
              expect(badgesRegion).toBeDefined();

              // Verify each club filter has a badge
              filters.clubs.forEach(club => {
                const badgeText = `Club: ${club}`;
                // Use a function matcher to handle whitespace normalization
                const badge = screen.getByText((content, element) => {
                  return element?.classList.contains('badge-label') && 
                         content.replace(/\s+/g, ' ').trim() === badgeText.replace(/\s+/g, ' ').trim();
                });
                expect(badge).toBeDefined();

                // Verify the badge has a remove button
                // Use a function matcher to handle whitespace in aria-label
                const removeButton = screen.getByRole('button', {
                  name: (accessibleName) => {
                    const normalizedName = accessibleName.replace(/\s+/g, ' ').trim();
                    const expectedPattern = `Remove Club: ${club.replace(/\s+/g, ' ').trim()} filter`;
                    return normalizedName === expectedPattern;
                  },
                });
                expect(removeButton).toBeDefined();
              });

              // Verify performance filter badge
              if (filters.hasPerformance !== null) {
                const badgeText = `Performance: ${filters.hasPerformance ? 'Yes' : 'No'}`;
                const badge = screen.getByText(badgeText);
                expect(badge).toBeDefined();

                const removeButton = screen.getByRole('button', {
                  name: `Remove ${badgeText} filter`,
                });
                expect(removeButton).toBeDefined();
              }

              // Verify booth filter badge
              if (filters.hasBooth !== null) {
                const badgeText = `Booth: ${filters.hasBooth ? 'Yes' : 'No'}`;
                const badge = screen.getByText(badgeText);
                expect(badge).toBeDefined();

                const removeButton = screen.getByRole('button', {
                  name: `Remove ${badgeText} filter`,
                });
                expect(removeButton).toBeDefined();
              }

              // Verify shirt collection filter badge
              if (filters.shirtCollected !== null) {
                const badgeText = `Shirt: ${filters.shirtCollected ? 'Collected' : 'Not Collected'}`;
                const badge = screen.getByText(badgeText);
                expect(badge).toBeDefined();

                const removeButton = screen.getByRole('button', {
                  name: `Remove ${badgeText} filter`,
                });
                expect(removeButton).toBeDefined();
              }

              // Verify meal collection filter badge
              if (filters.mealCollected !== null) {
                const badgeText = `Meal: ${filters.mealCollected ? 'Collected' : 'Not Collected'}`;
                const badge = screen.getByText(badgeText);
                expect(badge).toBeDefined();

                const removeButton = screen.getByRole('button', {
                  name: `Remove ${badgeText} filter`,
                });
                expect(removeButton).toBeDefined();
              }

              // Verify total number of badges matches active filter count
              const allBadges = badgesRegion.querySelectorAll('.filter-badge');
              expect(allBadges.length).toBe(expectedActiveCount);
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
   * Property: Badge count matches active filter count
   * 
   * For any combination of filters, the number of visible badges should
   * exactly match the activeFilterCount prop.
   */
  it('Property: Badge count matches active filter count', () => {
    fc.assert(
      fc.property(
        filterCriteriaArbitrary,
        availableClubsArbitrary,
        (filters, availableClubs) => {
          const mockOnFilterChange = vi.fn();
          const mockOnClearFilters = vi.fn();

          // Calculate active filter count
          let activeCount = filters.clubs.length;
          if (filters.hasPerformance !== null) activeCount++;
          if (filters.hasBooth !== null) activeCount++;
          if (filters.shirtCollected !== null) activeCount++;
          if (filters.mealCollected !== null) activeCount++;

          const { unmount, container } = render(
            <FilterPanel
              filters={filters}
              onFilterChange={mockOnFilterChange}
              onClearFilters={mockOnClearFilters}
              availableClubs={availableClubs}
              activeFilterCount={activeCount}
            />
          );

          try {
            const badges = container.querySelectorAll('.filter-badge');
            expect(badges.length).toBe(activeCount);
          } finally {
            unmount();
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Each badge has a remove button
   * 
   * For any active filter badge, there should be a corresponding remove button
   * that allows users to clear that specific filter.
   */
  it('Property: Each badge has a remove button', () => {
    fc.assert(
      fc.property(
        filterCriteriaArbitrary,
        availableClubsArbitrary,
        (filters, availableClubs) => {
          const mockOnFilterChange = vi.fn();
          const mockOnClearFilters = vi.fn();

          let activeCount = filters.clubs.length;
          if (filters.hasPerformance !== null) activeCount++;
          if (filters.hasBooth !== null) activeCount++;
          if (filters.shirtCollected !== null) activeCount++;
          if (filters.mealCollected !== null) activeCount++;

          const { unmount, container } = render(
            <FilterPanel
              filters={filters}
              onFilterChange={mockOnFilterChange}
              onClearFilters={mockOnClearFilters}
              availableClubs={availableClubs}
              activeFilterCount={activeCount}
            />
          );

          try {
            if (activeCount > 0) {
              const badges = container.querySelectorAll('.filter-badge');
              const removeButtons = container.querySelectorAll('.badge-remove');

              // Each badge should have exactly one remove button
              expect(removeButtons.length).toBe(badges.length);
              expect(removeButtons.length).toBe(activeCount);

              // Each remove button should have an aria-label
              removeButtons.forEach(button => {
                expect(button.getAttribute('aria-label')).toBeTruthy();
                expect(button.getAttribute('aria-label')).toContain('Remove');
                expect(button.getAttribute('aria-label')).toContain('filter');
              });
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
   * Property: Badge labels are descriptive and unique
   * 
   * For any set of active filters, each badge should have a unique,
   * descriptive label that clearly identifies the filter type and value.
   */
  it('Property: Badge labels are descriptive and unique', () => {
    fc.assert(
      fc.property(
        filterCriteriaArbitrary,
        availableClubsArbitrary,
        (filters, availableClubs) => {
          const mockOnFilterChange = vi.fn();
          const mockOnClearFilters = vi.fn();

          let activeCount = filters.clubs.length;
          if (filters.hasPerformance !== null) activeCount++;
          if (filters.hasBooth !== null) activeCount++;
          if (filters.shirtCollected !== null) activeCount++;
          if (filters.mealCollected !== null) activeCount++;

          const { unmount, container } = render(
            <FilterPanel
              filters={filters}
              onFilterChange={mockOnFilterChange}
              onClearFilters={mockOnClearFilters}
              availableClubs={availableClubs}
              activeFilterCount={activeCount}
            />
          );

          try {
            if (activeCount > 0) {
              const badgeLabels = Array.from(
                container.querySelectorAll('.badge-label')
              ).map(el => el.textContent);

              // All labels should be non-empty
              badgeLabels.forEach(label => {
                expect(label).toBeTruthy();
                expect(label!.length).toBeGreaterThan(0);
              });

              // All labels should be unique
              const uniqueLabels = new Set(badgeLabels);
              expect(uniqueLabels.size).toBe(badgeLabels.length);

              // Each label should contain a colon (format: "Type: Value")
              badgeLabels.forEach(label => {
                expect(label).toContain(':');
              });

              // Verify label formats
              filters.clubs.forEach(club => {
                expect(badgeLabels).toContain(`Club: ${club}`);
              });

              if (filters.hasPerformance !== null) {
                const expectedLabel = `Performance: ${filters.hasPerformance ? 'Yes' : 'No'}`;
                expect(badgeLabels).toContain(expectedLabel);
              }

              if (filters.hasBooth !== null) {
                const expectedLabel = `Booth: ${filters.hasBooth ? 'Yes' : 'No'}`;
                expect(badgeLabels).toContain(expectedLabel);
              }

              if (filters.shirtCollected !== null) {
                const expectedLabel = `Shirt: ${filters.shirtCollected ? 'Collected' : 'Not Collected'}`;
                expect(badgeLabels).toContain(expectedLabel);
              }

              if (filters.mealCollected !== null) {
                const expectedLabel = `Meal: ${filters.mealCollected ? 'Collected' : 'Not Collected'}`;
                expect(badgeLabels).toContain(expectedLabel);
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
   * Property: Clear all button visibility matches filter state
   * 
   * For any filter state, the "Clear All" button should be visible if and only if
   * there are active filters (activeFilterCount > 0).
   */
  it('Property: Clear all button visibility matches filter state', () => {
    fc.assert(
      fc.property(
        filterCriteriaArbitrary,
        availableClubsArbitrary,
        (filters, availableClubs) => {
          const mockOnFilterChange = vi.fn();
          const mockOnClearFilters = vi.fn();

          let activeCount = filters.clubs.length;
          if (filters.hasPerformance !== null) activeCount++;
          if (filters.hasBooth !== null) activeCount++;
          if (filters.shirtCollected !== null) activeCount++;
          if (filters.mealCollected !== null) activeCount++;

          const { unmount } = render(
            <FilterPanel
              filters={filters}
              onFilterChange={mockOnFilterChange}
              onClearFilters={mockOnClearFilters}
              availableClubs={availableClubs}
              activeFilterCount={activeCount}
            />
          );

          try {
            const clearButton = screen.queryByRole('button', { name: 'Clear all filters' });

            if (activeCount > 0) {
              // Clear button should be visible when filters are active
              expect(clearButton).not.toBeNull();
            } else {
              // Clear button should not be visible when no filters are active
              expect(clearButton).toBeNull();
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
   * Property: Filter count display matches active filters
   * 
   * For any filter state, the displayed filter count should match the
   * number of active filters.
   */
  it('Property: Filter count display matches active filters', () => {
    fc.assert(
      fc.property(
        filterCriteriaArbitrary,
        availableClubsArbitrary,
        (filters, availableClubs) => {
          const mockOnFilterChange = vi.fn();
          const mockOnClearFilters = vi.fn();

          let activeCount = filters.clubs.length;
          if (filters.hasPerformance !== null) activeCount++;
          if (filters.hasBooth !== null) activeCount++;
          if (filters.shirtCollected !== null) activeCount++;
          if (filters.mealCollected !== null) activeCount++;

          const { unmount } = render(
            <FilterPanel
              filters={filters}
              onFilterChange={mockOnFilterChange}
              onClearFilters={mockOnClearFilters}
              availableClubs={availableClubs}
              activeFilterCount={activeCount}
            />
          );

          try {
            if (activeCount > 0) {
              // Filter count should be displayed
              const filterCountElement = screen.getByLabelText(`${activeCount} active filters`);
              expect(filterCountElement).toBeDefined();
              expect(filterCountElement.textContent).toBe(`(${activeCount})`);
            } else {
              // Filter count should not be displayed when no filters are active
              const filterCountElement = screen.queryByText(/\(\d+\)/);
              expect(filterCountElement).toBeNull();
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
   * Property: Badges region has proper accessibility attributes
   * 
   * For any active filter state, if badges are displayed, the badges region
   * should have proper accessibility attributes (role="region", aria-label).
   */
  it('Property: Badges region has proper accessibility attributes', () => {
    fc.assert(
      fc.property(
        filterCriteriaArbitrary,
        availableClubsArbitrary,
        (filters, availableClubs) => {
          const mockOnFilterChange = vi.fn();
          const mockOnClearFilters = vi.fn();

          let activeCount = filters.clubs.length;
          if (filters.hasPerformance !== null) activeCount++;
          if (filters.hasBooth !== null) activeCount++;
          if (filters.shirtCollected !== null) activeCount++;
          if (filters.mealCollected !== null) activeCount++;

          const { unmount } = render(
            <FilterPanel
              filters={filters}
              onFilterChange={mockOnFilterChange}
              onClearFilters={mockOnClearFilters}
              availableClubs={availableClubs}
              activeFilterCount={activeCount}
            />
          );

          try {
            if (activeCount > 0) {
              const badgesRegion = screen.getByRole('region', { name: 'Active filters' });
              
              // Should have role="region"
              expect(badgesRegion.getAttribute('role')).toBe('region');
              
              // Should have aria-label
              expect(badgesRegion.getAttribute('aria-label')).toBe('Active filters');
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
   * Property: No duplicate badges for same filter
   * 
   * For any filter state, there should never be duplicate badges for the same filter.
   * Each active filter should have exactly one badge.
   */
  it('Property: No duplicate badges for same filter', () => {
    fc.assert(
      fc.property(
        filterCriteriaArbitrary,
        availableClubsArbitrary,
        (filters, availableClubs) => {
          const mockOnFilterChange = vi.fn();
          const mockOnClearFilters = vi.fn();

          let activeCount = filters.clubs.length;
          if (filters.hasPerformance !== null) activeCount++;
          if (filters.hasBooth !== null) activeCount++;
          if (filters.shirtCollected !== null) activeCount++;
          if (filters.mealCollected !== null) activeCount++;

          const { unmount, container } = render(
            <FilterPanel
              filters={filters}
              onFilterChange={mockOnFilterChange}
              onClearFilters={mockOnClearFilters}
              availableClubs={availableClubs}
              activeFilterCount={activeCount}
            />
          );

          try {
            if (activeCount > 0) {
              const badgeLabels = Array.from(
                container.querySelectorAll('.badge-label')
              ).map(el => el.textContent);

              // Check for duplicates
              const labelCounts = new Map<string, number>();
              badgeLabels.forEach(label => {
                const count = labelCounts.get(label!) || 0;
                labelCounts.set(label!, count + 1);
              });

              // Each label should appear exactly once
              labelCounts.forEach((count, label) => {
                expect(count).toBe(1);
              });
            }
          } finally {
            unmount();
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
