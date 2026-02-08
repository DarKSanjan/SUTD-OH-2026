import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ClaimCheckboxes from '../ClaimCheckboxes';

// Mock fetch globally
global.fetch = vi.fn();

describe('ClaimCheckboxes', () => {
  const mockToken = 'test_token_123';
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
          token={mockToken}
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
          token={mockToken}
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
          token={mockToken}
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
          token={mockToken}
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
          token={mockToken}
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
    it('should disable t-shirt checkbox when already claimed', () => {
      const claims = { tshirtClaimed: true, mealClaimed: false };
      render(
        <ClaimCheckboxes
          token={mockToken}
          claims={claims}
          onClaimUpdate={mockOnClaimUpdate}
        />
      );

      const tshirtCheckbox = screen.getByLabelText(/t-shirt/i) as HTMLInputElement;
      expect(tshirtCheckbox.disabled).toBe(true);
    });

    it('should disable meal checkbox when already claimed', () => {
      const claims = { tshirtClaimed: false, mealClaimed: true };
      render(
        <ClaimCheckboxes
          token={mockToken}
          claims={claims}
          onClaimUpdate={mockOnClaimUpdate}
        />
      );

      const mealCheckbox = screen.getByLabelText(/meal coupon/i) as HTMLInputElement;
      expect(mealCheckbox.disabled).toBe(true);
    });

    it('should enable unclaimed checkboxes', () => {
      const claims = { tshirtClaimed: false, mealClaimed: false };
      render(
        <ClaimCheckboxes
          token={mockToken}
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
    it('should call API when t-shirt checkbox is clicked', async () => {
      const claims = { tshirtClaimed: false, mealClaimed: false };
      const mockResponse = {
        success: true,
        claims: { tshirtClaimed: true, mealClaimed: false }
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse
      });

      render(
        <ClaimCheckboxes
          token={mockToken}
          claims={claims}
          onClaimUpdate={mockOnClaimUpdate}
        />
      );

      const tshirtCheckbox = screen.getByLabelText(/t-shirt/i);
      fireEvent.click(tshirtCheckbox);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/claim', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token: mockToken, itemType: 'tshirt' })
        });
      });
    });

    it('should call API when meal checkbox is clicked', async () => {
      const claims = { tshirtClaimed: false, mealClaimed: false };
      const mockResponse = {
        success: true,
        claims: { tshirtClaimed: false, mealClaimed: true }
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse
      });

      render(
        <ClaimCheckboxes
          token={mockToken}
          claims={claims}
          onClaimUpdate={mockOnClaimUpdate}
        />
      );

      const mealCheckbox = screen.getByLabelText(/meal coupon/i);
      fireEvent.click(mealCheckbox);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/claim', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token: mockToken, itemType: 'meal' })
        });
      });
    });

    it('should call onClaimUpdate with updated claims on success', async () => {
      const claims = { tshirtClaimed: false, mealClaimed: false };
      const updatedClaims = { tshirtClaimed: true, mealClaimed: false };
      const mockResponse = {
        success: true,
        claims: updatedClaims
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse
      });

      render(
        <ClaimCheckboxes
          token={mockToken}
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

    it('should show success message after successful claim', async () => {
      const claims = { tshirtClaimed: false, mealClaimed: false };
      const mockResponse = {
        success: true,
        claims: { tshirtClaimed: true, mealClaimed: false }
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse
      });

      render(
        <ClaimCheckboxes
          token={mockToken}
          claims={claims}
          onClaimUpdate={mockOnClaimUpdate}
        />
      );

      const tshirtCheckbox = screen.getByLabelText(/t-shirt/i);
      fireEvent.click(tshirtCheckbox);

      await waitFor(() => {
        expect(screen.getByText(/t-shirt claimed successfully/i)).toBeInTheDocument();
      });
    });

    it('should not call API when clicking already claimed checkbox', async () => {
      const claims = { tshirtClaimed: true, mealClaimed: false };

      render(
        <ClaimCheckboxes
          token={mockToken}
          claims={claims}
          onClaimUpdate={mockOnClaimUpdate}
        />
      );

      const tshirtCheckbox = screen.getByLabelText(/t-shirt/i);
      fireEvent.click(tshirtCheckbox);

      // Wait a bit to ensure no API call is made
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(global.fetch).not.toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should display error message on 409 conflict', async () => {
      const claims = { tshirtClaimed: false, mealClaimed: false };
      const mockResponse = {
        success: false,
        error: 'Item already claimed'
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 409,
        json: async () => mockResponse
      });

      render(
        <ClaimCheckboxes
          token={mockToken}
          claims={claims}
          onClaimUpdate={mockOnClaimUpdate}
        />
      );

      const tshirtCheckbox = screen.getByLabelText(/t-shirt/i);
      fireEvent.click(tshirtCheckbox);

      await waitFor(() => {
        expect(screen.getByText(/this item has already been claimed/i)).toBeInTheDocument();
      });
    });

    it('should display error message on 404 not found', async () => {
      const claims = { tshirtClaimed: false, mealClaimed: false };
      const mockResponse = {
        success: false,
        error: 'Invalid QR code'
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => mockResponse
      });

      render(
        <ClaimCheckboxes
          token={mockToken}
          claims={claims}
          onClaimUpdate={mockOnClaimUpdate}
        />
      );

      const tshirtCheckbox = screen.getByLabelText(/t-shirt/i);
      fireEvent.click(tshirtCheckbox);

      await waitFor(() => {
        expect(screen.getByText(/invalid qr code/i)).toBeInTheDocument();
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
          token={mockToken}
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

      // Mock fetch to fail all retries
      (global.fetch as any).mockRejectedValue(new TypeError('fetch failed'));

      render(
        <ClaimCheckboxes
          token={mockToken}
          claims={claims}
          onClaimUpdate={mockOnClaimUpdate}
        />
      );

      const tshirtCheckbox = screen.getByLabelText(/t-shirt/i);
      fireEvent.click(tshirtCheckbox);

      // Wait for error to appear (after retries complete)
      await waitFor(() => {
        expect(screen.getByText(/network error/i)).toBeInTheDocument();
      }, { timeout: 10000 });
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
          token={mockToken}
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
          token={mockToken}
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
          claims: { tshirtClaimed: true, mealClaimed: false }
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
          token={mockToken}
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
          claims: { tshirtClaimed: true, mealClaimed: false }
        })
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper labels for checkboxes', () => {
      const claims = { tshirtClaimed: false, mealClaimed: false };
      render(
        <ClaimCheckboxes
          token={mockToken}
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
        claims: { tshirtClaimed: true, mealClaimed: false }
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse
      });

      render(
        <ClaimCheckboxes
          token={mockToken}
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
