/**
 * Property-based tests for InteractiveCheckbox component
 * 
 * Feature: admin-table-enhancements
 * Property 4: Checkbox shows loading state during async operations
 * 
 * **Validates: Requirements 1.5, 8.5**
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import * as fc from 'fast-check';
import InteractiveCheckbox from '../InteractiveCheckbox';

describe('Property: InteractiveCheckbox loading state', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  /**
   * Property 4: Checkbox shows loading state during async operations
   * 
   * For any checkbox update in progress, the checkbox should be disabled and
   * display a loading indicator until the operation completes (success or failure).
   * 
   * **Validates: Requirements 1.5, 8.5**
   */
  it('Property 4: Checkbox shows loading state during async operations', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.boolean(), // initial checked state
        fc.boolean(), // new checked state after click
        fc.nat({ max: 500 }), // delay in ms
        fc.boolean(), // whether operation succeeds or fails
        fc.stringMatching(/^[A-Za-z0-9 ]{5,50}$/), // label text (alphanumeric with spaces)
        async (initialChecked, newChecked, delay, shouldSucceed, label) => {
          // Create a controlled promise for the onChange handler
          let resolvePromise: any;
          let rejectPromise: any;
          const promise = new Promise<void>((resolve, reject) => {
            resolvePromise = resolve;
            rejectPromise = reject;
          });

          const mockOnChange = vi.fn().mockReturnValue(promise);

          const { container, unmount } = render(
            <InteractiveCheckbox
              checked={initialChecked}
              onChange={mockOnChange}
              label={label}
            />
          );

          try {
            const checkbox = screen.getByRole('checkbox') as HTMLInputElement;

            // Verify initial state
            expect(checkbox.checked).toBe(initialChecked);
            expect(checkbox.disabled).toBe(false);
            expect(checkbox).toHaveAttribute('aria-busy', 'false');
            expect(checkbox).toHaveAttribute('aria-label', label);

            // Click the checkbox
            fireEvent.click(checkbox);

            // Verify onChange was called with the new value
            expect(mockOnChange).toHaveBeenCalledWith(!initialChecked);

            // During async operation, checkbox should be disabled and show loading state
            await waitFor(() => {
              expect(checkbox.disabled).toBe(true);
              expect(checkbox).toHaveAttribute('aria-busy', 'true');
            });

            // Loading spinner should be visible
            const spinner = container.querySelector('.loading-spinner');
            expect(spinner).toBeInTheDocument();

            // Loading class should be applied
            const label_element = container.querySelector('.interactive-checkbox');
            expect(label_element).toHaveClass('loading');

            // Simulate async operation completion
            await new Promise(resolve => setTimeout(resolve, delay));

            if (shouldSucceed) {
              resolvePromise();
            } else {
              rejectPromise(new Error('Test error'));
            }

            // After operation completes, checkbox should be enabled again
            await waitFor(() => {
              expect(checkbox.disabled).toBe(false);
              expect(checkbox).toHaveAttribute('aria-busy', 'false');
            });

            // Loading spinner should be removed
            await waitFor(() => {
              const spinnerAfter = container.querySelector('.loading-spinner');
              expect(spinnerAfter).not.toBeInTheDocument();
            });

            // Loading class should be removed
            await waitFor(() => {
              expect(label_element).not.toHaveClass('loading');
            });
          } finally {
            unmount();
          }
        }
      ),
      { numRuns: 50 } // Run 50 iterations
    );
  });

  /**
   * Property: Checkbox prevents concurrent updates
   * 
   * For any checkbox that is currently processing an update, additional clicks
   * should be ignored until the current operation completes.
   * 
   * This ensures data consistency and prevents race conditions.
   */
  it('Property: Checkbox prevents concurrent updates', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.boolean(), // initial checked state
        fc.integer({ min: 2, max: 5 }), // number of rapid clicks (at least 2)
        fc.stringMatching(/^[A-Za-z0-9 ]{5,50}$/), // label text (alphanumeric with spaces)
        async (initialChecked, clickCount, label) => {
          let resolvePromise: any;
          const promise = new Promise<void>((resolve) => {
            resolvePromise = resolve;
          });

          const mockOnChange = vi.fn().mockReturnValue(promise);

          const { unmount } = render(
            <InteractiveCheckbox
              checked={initialChecked}
              onChange={mockOnChange}
              label={label}
            />
          );

          try {
            const checkbox = screen.getByRole('checkbox');

            // Perform multiple rapid clicks
            for (let i = 0; i < clickCount; i++) {
              fireEvent.click(checkbox);
            }

            // Only the first click should trigger onChange
            expect(mockOnChange).toHaveBeenCalledTimes(1);
            expect(mockOnChange).toHaveBeenCalledWith(!initialChecked);

            // Resolve the promise
            resolvePromise();

            // Wait for state to settle
            await waitFor(() => {
              const cb = screen.getByRole('checkbox') as HTMLInputElement;
              expect(cb.disabled).toBe(false);
            });
          } finally {
            unmount();
          }
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Property: Disabled checkbox never triggers onChange
   * 
   * For any checkbox with disabled=true, clicking should never trigger the
   * onChange callback, regardless of the current checked state.
   */
  it('Property: Disabled checkbox never triggers onChange', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.boolean(), // checked state
        fc.stringMatching(/^[A-Za-z0-9 ]{5,50}$/), // label text (alphanumeric with spaces)
        fc.nat({ min: 1, max: 5 }), // number of clicks
        async (checked, label, clickCount) => {
          const mockOnChange = vi.fn().mockResolvedValue(undefined);

          const { unmount } = render(
            <InteractiveCheckbox
              checked={checked}
              onChange={mockOnChange}
              label={label}
              disabled={true}
            />
          );

          try {
            const checkbox = screen.getByRole('checkbox') as HTMLInputElement;

            // Verify checkbox is disabled
            expect(checkbox.disabled).toBe(true);
            expect(checkbox).toHaveAttribute('aria-label', label);

            // Try to click multiple times
            for (let i = 0; i < clickCount; i++) {
              fireEvent.click(checkbox);
            }

            // onChange should never be called
            expect(mockOnChange).not.toHaveBeenCalled();

            // Checkbox should remain disabled
            expect(checkbox.disabled).toBe(true);
          } finally {
            unmount();
          }
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Property: Checkbox maintains accessibility attributes
   * 
   * For any checkbox state (checked, loading, disabled), the component should
   * maintain proper ARIA attributes for screen reader accessibility.
   */
  it('Property: Checkbox maintains accessibility attributes', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.boolean(), // checked state
        fc.boolean(), // disabled state
        fc.stringMatching(/^[A-Za-z0-9 ]{5,50}$/), // label text (alphanumeric with spaces)
        async (checked, disabled, label) => {
          const mockOnChange = vi.fn().mockResolvedValue(undefined);

          const { unmount } = render(
            <InteractiveCheckbox
              checked={checked}
              onChange={mockOnChange}
              label={label}
              disabled={disabled}
            />
          );

          try {
            const checkbox = screen.getByRole('checkbox');

            // Should have aria-label
            expect(checkbox).toHaveAttribute('aria-label', label);

            // Should have aria-busy attribute
            expect(checkbox).toHaveAttribute('aria-busy');

            // If not disabled, should be able to receive focus
            if (!disabled) {
              checkbox.focus();
              expect(checkbox).toHaveFocus();
            }
          } finally {
            unmount();
          }
        }
      ),
      { numRuns: 50 }
    );
  });
});
