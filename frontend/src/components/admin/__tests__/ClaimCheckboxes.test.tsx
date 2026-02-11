import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ClaimCheckboxes from '../ClaimCheckboxes';

// Mock fetch globally
global.fetch = vi.fn();

describe('ClaimCheckboxes', () => {
  const mockStudentId = "1006001";
  const mockOnClaimUpdate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Rendering', () => {
    it('should render both checkboxes', () => {
      const claims = { tshirtClaimed: false, mealClaimed: false };
      render(
        <ClaimCheckboxes
          studentId="1006001"
          claims={claims}
          onClaimUpdate={mockOnClaimUpdate}
        />
      );

      expect(screen.getByLabelText(/t-shirt/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/meal coupon/i)).toBeInTheDocument();
    });

    it('should render title', () => {
      const claims = { tshirtClaimed: false, mealClaimed: false };
      render(
        <ClaimCheckboxes
          studentId="1006001"
          claims={claims}
          onClaimUpdate={mockOnClaimUpdate}
        />
      );

      expect(screen.getByText(/mark items as distributed/i)).toBeInTheDocument();
    });

    it('should show unchecked checkboxes when nothing is claimed', () => {
      const claims = { tshirtClaimed: false, mealClaimed: false };
      render(
        <ClaimCheckboxes
          studentId="1006001"
          claims={claims}
          onClaimUpdate={mockOnClaimUpdate}
        />
      );

      const tshirtCheckbox = screen.getByLabelText(/t-shirt/i) as HTMLInputElement;
      const mealCheckbox = screen.getByLabelText(/meal coupon/i) as HTMLInputElement;

      expect(tshirtCheckbox.checked).toBe(false);
      expect(mealCheckbox.checked).toBe(false);
    });

    it('should show checked checkbox when t-shirt is claimed', () => {
      const claims = { tshirtClaimed: true, mealClaimed: false };
      render(
        <ClaimCheckboxes
          studentId="1006001"
          claims={claims}
          onClaimUpdate={mockOnClaimUpdate}
        />
      );

      const tshirtCheckbox = screen.getByLabelText(/t-shirt/i) as HTMLInputElement;
      const mealCheckbox = screen.getByLabelText(/meal coupon/i) as HTMLInputElement;

      expect(tshirtCheckbox.checked).toBe(true);
      expect(mealCheckbox.checked).toBe(false);
    });

    it('should show both checkboxes checked when all items are claimed', () => {
      const claims = { tshirtClaimed: true, mealClaimed: true };
      render(
        <ClaimCheckboxes
          studentId="1006001"
          claims={claims}
          onClaimUpdate={mockOnClaimUpdate}
        />
      );

      const tshirtCheckbox = screen.getByLabelText(/t-shirt/i) as HTMLInputElement;
      const mealCheckbox = screen.getByLabelText(/meal coupon/i) as HTMLInputElement;

      expect(tshirtCheckbox.checked).toBe(true);
      expect(mealCheckbox.checked).toBe(true);
    });
  });

  describe('Disabled State', () => {
    it('should not disable t-shirt checkbox when already claimed (bidirectional)', () => {
      const claims = { tshirtClaimed: true, mealClaimed: false };
      render(
        <ClaimCheckboxes
          studentId="1006001"
          claims={claims}
          onClaimUpdate={mockOnClaimUpdate}
        />
      );

      const tshirtCheckbox = screen.getByLabelText(/t-shirt/i) as HTMLInputElement;
      expect(tshirtCheckbox.disabled).toBe(false);
    });

    it('should not disable meal checkbox when already claimed (bidirectional)', () => {
      const claims = { tshirtClaimed: false, mealClaimed: true };
      render(
        <ClaimCheckboxes
          studentId="1006001"
          claims={claims}
          onClaimUpdate={mockOnClaimUpdate}
        />
      );

      const mealCheckbox = screen.getByLabelText(/meal coupon/i) as HTMLInputElement;
      expect(mealCheckbox.disabled).toBe(false);
    });

    it('should enable all checkboxes regardless of claim status', () => {
      const claims = { tshirtClaimed: false, mealClaimed: false };
      render(
        <ClaimCheckboxes
          studentId="1006001"
          claims={claims}
          onClaimUpdate={mockOnClaimUpdate}
        />
      );

      const tshirtCheckbox = screen.getByLabelText(/t-shirt/i) as HTMLInputElement;
      const mealCheckbox = screen.getByLabelText(/meal coupon/i) as HTMLInputElement;

      expect(tshirtCheckbox.disabled).toBe(false);
      expect(mealCheckbox.disabled).toBe(false);
    });
  });

  describe('Claim Submission', () => {
    it('should call PATCH API when t-shirt checkbox is clicked to check', async () => {
      const claims = { tshirtClaimed: false, mealClaimed: false };
      const mockResponse = {
        success: true,
        updatedStatus: { tshirtClaimed: true, mealClaimed: false }
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse
      });

      render(
        <ClaimCheckboxes
          studentId="TEST001"
          claims={claims}
          onClaimUpdate={mockOnClaimUpdate}
        />
      );

      const tshirtCheckbox = screen.getByLabelText(/t-shirt/i);
      fireEvent.click(tshirtCheckbox);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/distribution-status', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            studentId: 'TEST001', 
            itemType: 'tshirt', 
            collected: true 
          })
        });
      });
    });

    it('should call PATCH API when meal checkbox is clicked to check', async () => {
      const claims = { tshirtClaimed: false, mealClaimed: false };
      const mockResponse = {
        success: true,
        updatedStatus: { tshirtClaimed: false, mealClaimed: true }
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse
      });

      render(
        <ClaimCheckboxes
          studentId="TEST001"
          claims={claims}
          onClaimUpdate={mockOnClaimUpdate}
        />
      );

      const mealCheckbox = screen.getByLabelText(/meal coupon/i);
      fireEvent.click(mealCheckbox);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/distribution-status', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            studentId: 'TEST001', 
            itemType: 'meal', 
            collected: true 
          })
        });
      });
    });

    it('should call PATCH API when t-shirt checkbox is clicked to uncheck', async () => {
      const claims = { tshirtClaimed: true, mealClaimed: false };
      const mockResponse = {
        success: true,
        updatedStatus: { tshirtClaimed: false, mealClaimed: false }
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse
      });

      render(
        <ClaimCheckboxes
          studentId="TEST001"
          claims={claims}
          onClaimUpdate={mockOnClaimUpdate}
        />
      );

      const tshirtCheckbox = screen.getByLabelText(/t-shirt/i);
      fireEvent.click(tshirtCheckbox);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/distribution-status', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            studentId: 'TEST001', 
            itemType: 'tshirt', 
            collected: false 
          })
        });
      });
    });

    it('should call PATCH API when meal checkbox is clicked to uncheck', async () => {
      const claims = { tshirtClaimed: false, mealClaimed: true };
      const mockResponse = {
        success: true,
        updatedStatus: { tshirtClaimed: false, mealClaimed: false }
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse
      });

      render(
        <ClaimCheckboxes
          studentId="TEST001"
          claims={claims}
          onClaimUpdate={mockOnClaimUpdate}
        />
      );

      const mealCheckbox = screen.getByLabelText(/meal coupon/i);
      fireEvent.click(mealCheckbox);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/distribution-status', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            studentId: 'TEST001', 
            itemType: 'meal', 
            collected: false 
          })
        });
      });
    });

    it('should call onClaimUpdate with updated claims on success', async () => {
      const claims = { tshirtClaimed: false, mealClaimed: false };
      const updatedClaims = { tshirtClaimed: true, mealClaimed: false };
      const mockResponse = {
        success: true,
        updatedStatus: updatedClaims
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse
      });

      render(
        <ClaimCheckboxes
          studentId="TEST001"
          claims={claims}
          onClaimUpdate={mockOnClaimUpdate}
        />
      );

      const tshirtCheckbox = screen.getByLabelText(/t-shirt/i);
      fireEvent.click(tshirtCheckbox);

      await waitFor(() => {
        expect(mockOnClaimUpdate).toHaveBeenCalledWith(updatedClaims);
      });
    });

    it('should show success message after successful check', async () => {
      const claims = { tshirtClaimed: false, mealClaimed: false };
      const mockResponse = {
        success: true,
        updatedStatus: { tshirtClaimed: true, mealClaimed: false }
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse
      });

      render(
        <ClaimCheckboxes
          studentId="TEST001"
          claims={claims}
          onClaimUpdate={mockOnClaimUpdate}
        />
      );

      const tshirtCheckbox = screen.getByLabelText(/t-shirt/i);
      fireEvent.click(tshirtCheckbox);

      await waitFor(() => {
        expect(screen.getByText(/t-shirt marked as collected successfully/i)).toBeInTheDocument();
      });
    });

    it('should show success message after successful uncheck', async () => {
      const claims = { tshirtClaimed: true, mealClaimed: false };
      const mockResponse = {
        success: true,
        updatedStatus: { tshirtClaimed: false, mealClaimed: false }
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse
      });

      render(
        <ClaimCheckboxes
          studentId="TEST001"
          claims={claims}
          onClaimUpdate={mockOnClaimUpdate}
        />
      );

      const tshirtCheckbox = screen.getByLabelText(/t-shirt/i);
      fireEvent.click(tshirtCheckbox);

      await waitFor(() => {
        expect(screen.getByText(/t-shirt unmarked successfully/i)).toBeInTheDocument();
      });
    });

    it('should update UI state immediately (optimistic update)', async () => {
      const claims = { tshirtClaimed: false, mealClaimed: false };
      
      // Create a delayed promise to test optimistic update
      let resolvePromise: any;
      const promise = new Promise((resolve) => {
        resolvePromise = resolve;
      });

      (global.fetch as any).mockReturnValueOnce(promise);

      render(
        <ClaimCheckboxes
          studentId="TEST001"
          claims={claims}
          onClaimUpdate={mockOnClaimUpdate}
        />
      );

      const tshirtCheckbox = screen.getByLabelText(/t-shirt/i);
      fireEvent.click(tshirtCheckbox);

      // Check that onClaimUpdate was called immediately (optimistic update)
      await waitFor(() => {
        expect(mockOnClaimUpdate).toHaveBeenCalledWith({
          tshirtClaimed: true,
          mealClaimed: false
        });
      });

      // Resolve the promise
      resolvePromise({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          updatedStatus: { tshirtClaimed: true, mealClaimed: false }
        })
      });
    });
  });

  describe('Error Handling', () => {
    it('should display error message on 404 not found', async () => {
      const claims = { tshirtClaimed: false, mealClaimed: false };
      const mockResponse = {
        success: false,
        error: 'Student not found'
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => mockResponse
      });

      render(
        <ClaimCheckboxes
          studentId="TEST001"
          claims={claims}
          onClaimUpdate={mockOnClaimUpdate}
        />
      );

      const tshirtCheckbox = screen.getByLabelText(/t-shirt/i);
      fireEvent.click(tshirtCheckbox);

      await waitFor(() => {
        expect(screen.getByText(/student not found/i)).toBeInTheDocument();
      });
    });

    it('should display generic error message on other errors', async () => {
      const claims = { tshirtClaimed: false, mealClaimed: false };
      const mockResponse = {
        success: false,
        error: 'Server error'
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => mockResponse
      });

      render(
        <ClaimCheckboxes
          studentId="TEST001"
          claims={claims}
          onClaimUpdate={mockOnClaimUpdate}
        />
      );

      const tshirtCheckbox = screen.getByLabelText(/t-shirt/i);
      fireEvent.click(tshirtCheckbox);

      await waitFor(() => {
        expect(screen.getByText(/server error/i)).toBeInTheDocument();
      });
    });

    it('should display network error on fetch failure', async () => {
      const claims = { tshirtClaimed: false, mealClaimed: false };

      (global.fetch as any).mockRejectedValue(new TypeError('fetch failed'));

      render(
        <ClaimCheckboxes
          studentId="TEST001"
          claims={claims}
          onClaimUpdate={mockOnClaimUpdate}
        />
      );

      const tshirtCheckbox = screen.getByLabelText(/t-shirt/i);
      fireEvent.click(tshirtCheckbox);

      await waitFor(() => {
        expect(screen.getByText(/network error/i)).toBeInTheDocument();
      });
    });

    it('should revert optimistic update on error', async () => {
      const claims = { tshirtClaimed: false, mealClaimed: false };

      (global.fetch as any).mockRejectedValue(new Error('Network error'));

      render(
        <ClaimCheckboxes
          studentId="TEST001"
          claims={claims}
          onClaimUpdate={mockOnClaimUpdate}
        />
      );

      const tshirtCheckbox = screen.getByLabelText(/t-shirt/i);
      fireEvent.click(tshirtCheckbox);

      // First call is optimistic update
      await waitFor(() => {
        expect(mockOnClaimUpdate).toHaveBeenCalledWith({
          tshirtClaimed: true,
          mealClaimed: false
        });
      });

      // Second call reverts on error
      await waitFor(() => {
        expect(mockOnClaimUpdate).toHaveBeenCalledWith(claims);
      });
    });

    it('should allow dismissing error messages', async () => {
      const claims = { tshirtClaimed: false, mealClaimed: false };
      const mockResponse = {
        success: false,
        error: 'Test error'
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => mockResponse
      });

      render(
        <ClaimCheckboxes
          studentId="TEST001"
          claims={claims}
          onClaimUpdate={mockOnClaimUpdate}
        />
      );

      const tshirtCheckbox = screen.getByLabelText(/t-shirt/i);
      fireEvent.click(tshirtCheckbox);

      await waitFor(() => {
        expect(screen.getByText(/test error/i)).toBeInTheDocument();
      });

      // Find and click dismiss button
      const dismissButton = screen.getByLabelText(/dismiss error/i);
      fireEvent.click(dismissButton);

      await waitFor(() => {
        expect(screen.queryByText(/test error/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Loading State', () => {
    it('should show loading spinner during API call', async () => {
      const claims = { tshirtClaimed: false, mealClaimed: false };
      
      // Create a promise that we can control
      let resolvePromise: any;
      const promise = new Promise((resolve) => {
        resolvePromise = resolve;
      });

      (global.fetch as any).mockReturnValueOnce(promise);

      render(
        <ClaimCheckboxes
          studentId="TEST001"
          claims={claims}
          onClaimUpdate={mockOnClaimUpdate}
        />
      );

      const tshirtCheckbox = screen.getByLabelText(/t-shirt/i);
      fireEvent.click(tshirtCheckbox);

      // Check for loading spinner
      await waitFor(() => {
        const loadingSpinner = document.querySelector('.loading-spinner');
        expect(loadingSpinner).toBeInTheDocument();
      });

      // Resolve the promise
      resolvePromise({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          updatedStatus: { tshirtClaimed: true, mealClaimed: false }
        })
      });
    });

    it('should disable checkbox during loading', async () => {
      const claims = { tshirtClaimed: false, mealClaimed: false };
      
      let resolvePromise: any;
      const promise = new Promise((resolve) => {
        resolvePromise = resolve;
      });

      (global.fetch as any).mockReturnValueOnce(promise);

      render(
        <ClaimCheckboxes
          studentId="TEST001"
          claims={claims}
          onClaimUpdate={mockOnClaimUpdate}
        />
      );

      const tshirtCheckbox = screen.getByLabelText(/t-shirt/i) as HTMLInputElement;
      fireEvent.click(tshirtCheckbox);

      await waitFor(() => {
        expect(tshirtCheckbox.disabled).toBe(true);
      });

      // Resolve the promise
      resolvePromise({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          updatedStatus: { tshirtClaimed: true, mealClaimed: false }
        })
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper labels for checkboxes', () => {
      const claims = { tshirtClaimed: false, mealClaimed: false };
      render(
        <ClaimCheckboxes
          studentId="TEST001"
          claims={claims}
          onClaimUpdate={mockOnClaimUpdate}
        />
      );

      expect(screen.getByLabelText(/t-shirt/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/meal coupon/i)).toBeInTheDocument();
    });

    it('should have proper ARIA attributes on success message', async () => {
      const claims = { tshirtClaimed: false, mealClaimed: false };
      const mockResponse = {
        success: true,
        updatedStatus: { tshirtClaimed: true, mealClaimed: false }
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse
      });

      render(
        <ClaimCheckboxes
          studentId="TEST001"
          claims={claims}
          onClaimUpdate={mockOnClaimUpdate}
        />
      );

      const tshirtCheckbox = screen.getByLabelText(/t-shirt/i);
      fireEvent.click(tshirtCheckbox);

      await waitFor(() => {
        const successMessage = screen.getByRole('status');
        expect(successMessage).toBeInTheDocument();
      });
    });
  });
});
