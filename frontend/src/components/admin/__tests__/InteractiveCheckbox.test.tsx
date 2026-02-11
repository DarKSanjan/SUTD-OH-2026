import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import InteractiveCheckbox from '../InteractiveCheckbox';

describe('InteractiveCheckbox', () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render checkbox with label', () => {
      render(
        <InteractiveCheckbox
          checked={false}
          onChange={mockOnChange}
          label="Test checkbox"
        />
      );

      const checkbox = screen.getByRole('checkbox', { name: 'Test checkbox' });
      expect(checkbox).toBeInTheDocument();
    });

    it('should render unchecked checkbox when checked is false', () => {
      render(
        <InteractiveCheckbox
          checked={false}
          onChange={mockOnChange}
          label="Test checkbox"
        />
      );

      const checkbox = screen.getByRole('checkbox') as HTMLInputElement;
      expect(checkbox.checked).toBe(false);
    });

    it('should render checked checkbox when checked is true', () => {
      render(
        <InteractiveCheckbox
          checked={true}
          onChange={mockOnChange}
          label="Test checkbox"
        />
      );

      const checkbox = screen.getByRole('checkbox') as HTMLInputElement;
      expect(checkbox.checked).toBe(true);
    });

    it('should apply custom className', () => {
      const { container } = render(
        <InteractiveCheckbox
          checked={false}
          onChange={mockOnChange}
          label="Test checkbox"
          className="custom-class"
        />
      );

      const label = container.querySelector('.interactive-checkbox');
      expect(label).toHaveClass('custom-class');
    });
  });

  describe('Click Handling', () => {
    it('should call onChange with true when unchecked checkbox is clicked', async () => {
      mockOnChange.mockResolvedValue(undefined);

      render(
        <InteractiveCheckbox
          checked={false}
          onChange={mockOnChange}
          label="Test checkbox"
        />
      );

      const checkbox = screen.getByRole('checkbox');
      fireEvent.click(checkbox);

      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith(true);
      });
    });

    it('should call onChange with false when checked checkbox is clicked', async () => {
      mockOnChange.mockResolvedValue(undefined);

      render(
        <InteractiveCheckbox
          checked={true}
          onChange={mockOnChange}
          label="Test checkbox"
        />
      );

      const checkbox = screen.getByRole('checkbox');
      fireEvent.click(checkbox);

      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith(false);
      });
    });

    it('should handle async onChange successfully', async () => {
      const asyncOnChange = vi.fn().mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      render(
        <InteractiveCheckbox
          checked={false}
          onChange={asyncOnChange}
          label="Test checkbox"
        />
      );

      const checkbox = screen.getByRole('checkbox');
      fireEvent.click(checkbox);

      await waitFor(() => {
        expect(asyncOnChange).toHaveBeenCalledWith(true);
      });
    });
  });

  describe('Loading State', () => {
    it('should show loading spinner during async operation', async () => {
      let resolvePromise: any;
      const promise = new Promise<void>((resolve) => {
        resolvePromise = resolve;
      });

      mockOnChange.mockReturnValue(promise);

      const { container } = render(
        <InteractiveCheckbox
          checked={false}
          onChange={mockOnChange}
          label="Test checkbox"
        />
      );

      const checkbox = screen.getByRole('checkbox');
      fireEvent.click(checkbox);

      // Check for loading spinner
      await waitFor(() => {
        const spinner = container.querySelector('.loading-spinner');
        expect(spinner).toBeInTheDocument();
      });

      // Resolve the promise
      resolvePromise();

      // Spinner should disappear
      await waitFor(() => {
        const spinner = container.querySelector('.loading-spinner');
        expect(spinner).not.toBeInTheDocument();
      });
    });

    it('should disable checkbox during loading', async () => {
      let resolvePromise: any;
      const promise = new Promise<void>((resolve) => {
        resolvePromise = resolve;
      });

      mockOnChange.mockReturnValue(promise);

      render(
        <InteractiveCheckbox
          checked={false}
          onChange={mockOnChange}
          label="Test checkbox"
        />
      );

      const checkbox = screen.getByRole('checkbox') as HTMLInputElement;
      fireEvent.click(checkbox);

      await waitFor(() => {
        expect(checkbox.disabled).toBe(true);
      });

      // Resolve the promise
      resolvePromise();

      // Checkbox should be enabled again
      await waitFor(() => {
        expect(checkbox.disabled).toBe(false);
      });
    });

    it('should add loading class to label during async operation', async () => {
      let resolvePromise: any;
      const promise = new Promise<void>((resolve) => {
        resolvePromise = resolve;
      });

      mockOnChange.mockReturnValue(promise);

      const { container } = render(
        <InteractiveCheckbox
          checked={false}
          onChange={mockOnChange}
          label="Test checkbox"
        />
      );

      const checkbox = screen.getByRole('checkbox');
      fireEvent.click(checkbox);

      await waitFor(() => {
        const label = container.querySelector('.interactive-checkbox');
        expect(label).toHaveClass('loading');
      });

      // Resolve the promise
      resolvePromise();

      // Loading class should be removed
      await waitFor(() => {
        const label = container.querySelector('.interactive-checkbox');
        expect(label).not.toHaveClass('loading');
      });
    });

    it('should clear loading state even if onChange fails', async () => {
      mockOnChange.mockRejectedValue(new Error('Test error'));

      render(
        <InteractiveCheckbox
          checked={false}
          onChange={mockOnChange}
          label="Test checkbox"
        />
      );

      const checkbox = screen.getByRole('checkbox') as HTMLInputElement;
      fireEvent.click(checkbox);

      // Should be disabled during loading
      await waitFor(() => {
        expect(checkbox.disabled).toBe(true);
      });

      // Should be enabled again after error
      await waitFor(() => {
        expect(checkbox.disabled).toBe(false);
      });
    });
  });

  describe('Disabled State', () => {
    it('should disable checkbox when disabled prop is true', () => {
      render(
        <InteractiveCheckbox
          checked={false}
          onChange={mockOnChange}
          label="Test checkbox"
          disabled={true}
        />
      );

      const checkbox = screen.getByRole('checkbox') as HTMLInputElement;
      expect(checkbox.disabled).toBe(true);
    });

    it('should not call onChange when disabled checkbox is clicked', () => {
      render(
        <InteractiveCheckbox
          checked={false}
          onChange={mockOnChange}
          label="Test checkbox"
          disabled={true}
        />
      );

      const checkbox = screen.getByRole('checkbox');
      fireEvent.click(checkbox);

      expect(mockOnChange).not.toHaveBeenCalled();
    });

    it('should remain disabled during loading when disabled prop is true', async () => {
      let resolvePromise: any;
      const promise = new Promise<void>((resolve) => {
        resolvePromise = resolve;
      });

      mockOnChange.mockReturnValue(promise);

      render(
        <InteractiveCheckbox
          checked={false}
          onChange={mockOnChange}
          label="Test checkbox"
          disabled={true}
        />
      );

      const checkbox = screen.getByRole('checkbox') as HTMLInputElement;
      
      // Should be disabled initially
      expect(checkbox.disabled).toBe(true);

      // Try to click (should not work)
      fireEvent.click(checkbox);

      // Should still be disabled
      expect(checkbox.disabled).toBe(true);
      expect(mockOnChange).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have aria-label attribute', () => {
      render(
        <InteractiveCheckbox
          checked={false}
          onChange={mockOnChange}
          label="Accessible checkbox label"
        />
      );

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveAttribute('aria-label', 'Accessible checkbox label');
    });

    it('should set aria-busy to false when not loading', () => {
      render(
        <InteractiveCheckbox
          checked={false}
          onChange={mockOnChange}
          label="Test checkbox"
        />
      );

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveAttribute('aria-busy', 'false');
    });

    it('should set aria-busy to true during loading', async () => {
      let resolvePromise: any;
      const promise = new Promise<void>((resolve) => {
        resolvePromise = resolve;
      });

      mockOnChange.mockReturnValue(promise);

      render(
        <InteractiveCheckbox
          checked={false}
          onChange={mockOnChange}
          label="Test checkbox"
        />
      );

      const checkbox = screen.getByRole('checkbox');
      fireEvent.click(checkbox);

      await waitFor(() => {
        expect(checkbox).toHaveAttribute('aria-busy', 'true');
      });

      // Resolve the promise
      resolvePromise();

      await waitFor(() => {
        expect(checkbox).toHaveAttribute('aria-busy', 'false');
      });
    });

    it('should have focus outline when focused', () => {
      render(
        <InteractiveCheckbox
          checked={false}
          onChange={mockOnChange}
          label="Test checkbox"
        />
      );

      const checkbox = screen.getByRole('checkbox');
      checkbox.focus();

      expect(checkbox).toHaveFocus();
    });

    it('should be keyboard accessible', async () => {
      mockOnChange.mockResolvedValue(undefined);

      render(
        <InteractiveCheckbox
          checked={false}
          onChange={mockOnChange}
          label="Test checkbox"
        />
      );

      const checkbox = screen.getByRole('checkbox');
      checkbox.focus();

      // Simulate space key press
      fireEvent.keyDown(checkbox, { key: ' ', code: 'Space' });
      fireEvent.click(checkbox); // Space triggers click

      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith(true);
      });
    });

    it('should have sr-only text for screen readers', () => {
      const { container } = render(
        <InteractiveCheckbox
          checked={false}
          onChange={mockOnChange}
          label="Screen reader text"
        />
      );

      const srOnlyText = container.querySelector('.sr-only');
      expect(srOnlyText).toBeInTheDocument();
      expect(srOnlyText).toHaveTextContent('Screen reader text');
    });

    it('should hide loading spinner from screen readers', async () => {
      let resolvePromise: any;
      const promise = new Promise<void>((resolve) => {
        resolvePromise = resolve;
      });

      mockOnChange.mockReturnValue(promise);

      const { container } = render(
        <InteractiveCheckbox
          checked={false}
          onChange={mockOnChange}
          label="Test checkbox"
        />
      );

      const checkbox = screen.getByRole('checkbox');
      fireEvent.click(checkbox);

      await waitFor(() => {
        const spinner = container.querySelector('.loading-spinner');
        expect(spinner).toHaveAttribute('aria-hidden', 'true');
      });

      resolvePromise();
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid clicks gracefully', async () => {
      let resolvePromise: any;
      const promise = new Promise<void>((resolve) => {
        resolvePromise = resolve;
      });

      mockOnChange.mockReturnValue(promise);

      render(
        <InteractiveCheckbox
          checked={false}
          onChange={mockOnChange}
          label="Test checkbox"
        />
      );

      const checkbox = screen.getByRole('checkbox');
      
      // Click once
      fireEvent.click(checkbox);
      
      // Try to click again while loading (should be ignored)
      fireEvent.click(checkbox);
      fireEvent.click(checkbox);

      // Should only process the first click (checkbox is disabled during loading)
      expect(mockOnChange).toHaveBeenCalledTimes(1);
      
      // Resolve the promise
      resolvePromise();
      
      await waitFor(() => {
        const cb = screen.getByRole('checkbox') as HTMLInputElement;
        expect(cb.disabled).toBe(false);
      });
    });

    it('should handle onChange that returns undefined', async () => {
      const onChangeNoReturn = vi.fn().mockImplementation(() => {
        // Returns undefined (no explicit return)
      });

      render(
        <InteractiveCheckbox
          checked={false}
          onChange={onChangeNoReturn}
          label="Test checkbox"
        />
      );

      const checkbox = screen.getByRole('checkbox');
      fireEvent.click(checkbox);

      await waitFor(() => {
        expect(onChangeNoReturn).toHaveBeenCalledWith(true);
      });
    });

    it('should maintain checked state through loading', async () => {
      let resolvePromise: any;
      const promise = new Promise<void>((resolve) => {
        resolvePromise = resolve;
      });

      mockOnChange.mockReturnValue(promise);

      const { rerender } = render(
        <InteractiveCheckbox
          checked={false}
          onChange={mockOnChange}
          label="Test checkbox"
        />
      );

      const checkbox = screen.getByRole('checkbox') as HTMLInputElement;
      
      // Initial state
      expect(checkbox.checked).toBe(false);

      fireEvent.click(checkbox);

      // Parent component would update checked prop after optimistic update
      rerender(
        <InteractiveCheckbox
          checked={true}
          onChange={mockOnChange}
          label="Test checkbox"
        />
      );

      // During loading, checked state should reflect the parent's update
      await waitFor(() => {
        expect(checkbox.checked).toBe(true);
      });

      resolvePromise();

      // After loading, checked state should still be true
      await waitFor(() => {
        expect(checkbox.checked).toBe(true);
      });
    });
  });
});
