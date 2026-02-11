import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import StudentApp from '../StudentApp';
import * as api from '../../../services/api';

// Mock the API module
vi.mock('../../../services/api', () => ({
  apiPost: vi.fn(),
  getErrorMessage: vi.fn((err) => err.message || 'An error occurred')
}));

// Mock EasterEgg component to avoid video playback issues in tests
vi.mock('../EasterEgg', () => ({
  default: ({ onComplete }: { onComplete: () => void }) => {
    // Store callback in window for test access
    (window as any).mockEasterEggComplete = onComplete;
    
    return (
      <div data-testid="easter-egg">
        <div>Easter Egg Animation</div>
      </div>
    );
  }
}));

describe('StudentApp Integration Tests - Participant Flow', () => {
  const mockApiPost = vi.mocked(api.apiPost);

  beforeEach(() => {
    vi.clearAllMocks();
    delete (window as any).mockEasterEggComplete;
    // Reset Math.random for predictable tests
    vi.spyOn(Math, 'random').mockReturnValue(0.5); // Will not trigger easter egg (0.5 > 1/75)
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Complete Participant Flow: ID Input → Consent → QR Display', () => {
    it('completes full flow: enter ID → validate → consent → view QR with collection status', async () => {
      const user = userEvent.setup();

      // Mock successful validation
      mockApiPost.mockResolvedValueOnce({
        success: true,
        student: {
          studentId: 'S12345',
          name: 'Alice Johnson',
          tshirtSize: 'M',
          mealPreference: 'Vegetarian',
          involvements: [{ club: 'Tech Club', role: 'Member' }]
        },
        qrCode: 'data:image/png;base64,mockqrcode',
        token: 'mock-token-123',
        collectionStatus: {
          shirtCollected: false,
          mealCollected: true
        }
      });

      // Mock successful consent recording
      mockApiPost.mockResolvedValueOnce({
        success: true,
        message: 'Consent recorded'
      });

      render(<StudentApp />);

      // Step 1: Initial state - ID form is visible
      expect(screen.getByLabelText(/student id/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();

      // Step 2: Enter student ID and submit
      const input = screen.getByLabelText(/student id/i);
      await user.type(input, 'S12345');
      await user.click(screen.getByRole('button', { name: /submit/i }));

      // Step 3: Verify validation API was called
      await waitFor(() => {
        expect(mockApiPost).toHaveBeenCalledWith('/api/validate', {
          studentId: 'S12345'
        });
      });

      // Step 4: Consent screen should appear
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /privacy consent/i })).toBeInTheDocument();
        expect(screen.getByRole('checkbox')).toBeInTheDocument();
        expect(screen.getByText(/I consent to my information being used properly/i)).toBeInTheDocument();
      });

      // Step 5: Check the consent checkbox
      const consentCheckbox = screen.getByRole('checkbox');
      await user.click(consentCheckbox);

      // Step 6: Verify consent API was called
      await waitFor(() => {
        expect(mockApiPost).toHaveBeenCalledWith('/api/consent', {
          studentId: 'S12345',
          consented: true
        });
      });

      // Step 7: QR code display should appear with collection status
      await waitFor(() => {
        expect(screen.getByText(/success/i)).toBeInTheDocument();
        expect(screen.getByText(/welcome, alice johnson/i)).toBeInTheDocument();
        expect(screen.getByAltText(/student qr code/i)).toBeInTheDocument();
      });

      // Step 8: Verify collection status is displayed
      expect(screen.getByText(/collection status/i)).toBeInTheDocument();
      expect(screen.getByText(/shirt collected/i)).toBeInTheDocument();
      expect(screen.getByText(/meal collected/i)).toBeInTheDocument();

      // Step 9: Verify "Start Over" button is present
      expect(screen.getByRole('button', { name: /start over/i })).toBeInTheDocument();
    });

    it('displays correct collection status icons (✓ for collected, ✗ for not collected)', async () => {
      const user = userEvent.setup();

      mockApiPost.mockResolvedValueOnce({
        success: true,
        student: {
          studentId: 'S67890',
          name: 'Bob Smith',
          tshirtSize: 'L',
          mealPreference: 'Non-Vegetarian'
        },
        qrCode: 'data:image/png;base64,mockqrcode',
        token: 'mock-token-456',
        collectionStatus: {
          shirtCollected: true,
          mealCollected: false
        }
      });

      mockApiPost.mockResolvedValueOnce({
        success: true,
        message: 'Consent recorded'
      });

      render(<StudentApp />);

      // Enter ID and submit
      await user.type(screen.getByLabelText(/student id/i), 'S67890');
      await user.click(screen.getByRole('button', { name: /submit/i }));

      // Give consent
      await waitFor(() => {
        expect(screen.getByRole('checkbox')).toBeInTheDocument();
      });
      await user.click(screen.getByRole('checkbox'));

      // Verify QR display with correct status
      await waitFor(() => {
        expect(screen.getByText(/welcome, bob smith/i)).toBeInTheDocument();
      });

      // Check that collection status section exists
      const collectionSection = screen.getByText(/collection status/i).closest('.collection-status');
      expect(collectionSection).toBeInTheDocument();

      // Verify status icons are present (✓ and ✗)
      const statusIcons = screen.getAllByText(/[✓✗]/);
      expect(statusIcons.length).toBeGreaterThanOrEqual(2);
    });

    it('allows starting over from QR display screen', async () => {
      const user = userEvent.setup();

      mockApiPost.mockResolvedValueOnce({
        success: true,
        student: {
          studentId: 'S11111',
          name: 'Charlie Brown',
          tshirtSize: 'XL',
          mealPreference: 'Vegan'
        },
        qrCode: 'data:image/png;base64,mockqrcode',
        token: 'mock-token-789',
        collectionStatus: {
          shirtCollected: false,
          mealCollected: false
        }
      });

      mockApiPost.mockResolvedValueOnce({
        success: true,
        message: 'Consent recorded'
      });

      render(<StudentApp />);

      // Complete the flow
      await user.type(screen.getByLabelText(/student id/i), 'S11111');
      await user.click(screen.getByRole('button', { name: /submit/i }));

      await waitFor(() => {
        expect(screen.getByRole('checkbox')).toBeInTheDocument();
      });
      await user.click(screen.getByRole('checkbox'));

      await waitFor(() => {
        expect(screen.getByText(/welcome, charlie brown/i)).toBeInTheDocument();
      });

      // Click "Start Over" button
      const startOverButton = screen.getByRole('button', { name: /start over/i });
      await user.click(startOverButton);

      // Should return to ID input form
      await waitFor(() => {
        expect(screen.getByLabelText(/student id/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
      });

      // QR display should be gone
      expect(screen.queryByText(/welcome, charlie brown/i)).not.toBeInTheDocument();
      expect(screen.queryByAltText(/student qr code/i)).not.toBeInTheDocument();
    });
  });

  describe('QR Code Blocked Without Consent', () => {
    it('does not display QR code when consent checkbox is not checked', async () => {
      const user = userEvent.setup();

      mockApiPost.mockResolvedValueOnce({
        success: true,
        student: {
          studentId: 'S99999',
          name: 'Diana Prince',
          tshirtSize: 'S',
          mealPreference: 'Vegetarian'
        },
        qrCode: 'data:image/png;base64,mockqrcode',
        token: 'mock-token-999',
        collectionStatus: {
          shirtCollected: false,
          mealCollected: false
        }
      });

      render(<StudentApp />);

      // Enter ID and submit
      await user.type(screen.getByLabelText(/student id/i), 'S99999');
      await user.click(screen.getByRole('button', { name: /submit/i }));

      // Wait for consent screen
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /privacy consent/i })).toBeInTheDocument();
      });

      // Verify QR code is NOT displayed
      expect(screen.queryByAltText(/student qr code/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/welcome, diana prince/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/collection status/i)).not.toBeInTheDocument();

      // Consent checkbox should be visible and unchecked
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeInTheDocument();
      expect(checkbox).not.toBeChecked();
    });

    it('blocks QR display if consent API call fails', async () => {
      const user = userEvent.setup();

      mockApiPost.mockResolvedValueOnce({
        success: true,
        student: {
          studentId: 'S88888',
          name: 'Error Test',
          tshirtSize: 'M',
          mealPreference: 'Vegetarian'
        },
        qrCode: 'data:image/png;base64,mockqrcode',
        token: 'mock-token-error',
        collectionStatus: {
          shirtCollected: false,
          mealCollected: false
        }
      });

      // Mock consent API failure
      mockApiPost.mockRejectedValueOnce(new Error('Network error'));

      render(<StudentApp />);

      // Enter ID and submit
      await user.type(screen.getByLabelText(/student id/i), 'S88888');
      await user.click(screen.getByRole('button', { name: /submit/i }));

      // Wait for consent screen
      await waitFor(() => {
        expect(screen.getByRole('checkbox')).toBeInTheDocument();
      });

      // Try to check consent
      await user.click(screen.getByRole('checkbox'));

      // Wait for error
      await waitFor(() => {
        expect(screen.getByText(/network error/i)).toBeInTheDocument();
      });

      // QR code should NOT be displayed
      expect(screen.queryByAltText(/student qr code/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/welcome, error test/i)).not.toBeInTheDocument();

      // Should still be on consent screen
      expect(screen.getByRole('heading', { name: /privacy consent/i })).toBeInTheDocument();
    });

    it('allows going back from consent screen without showing QR', async () => {
      const user = userEvent.setup();

      mockApiPost.mockResolvedValueOnce({
        success: true,
        student: {
          studentId: 'S77777',
          name: 'Back Test',
          tshirtSize: 'L',
          mealPreference: 'Non-Vegetarian'
        },
        qrCode: 'data:image/png;base64,mockqrcode',
        token: 'mock-token-back',
        collectionStatus: {
          shirtCollected: false,
          mealCollected: false
        }
      });

      render(<StudentApp />);

      // Enter ID and submit
      await user.type(screen.getByLabelText(/student id/i), 'S77777');
      await user.click(screen.getByRole('button', { name: /submit/i }));

      // Wait for consent screen
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /privacy consent/i })).toBeInTheDocument();
      });

      // Click back button
      const backButton = screen.getByRole('button', { name: /back/i });
      await user.click(backButton);

      // Should return to ID form
      await waitFor(() => {
        expect(screen.getByLabelText(/student id/i)).toBeInTheDocument();
      });

      // QR code should never have been displayed
      expect(screen.queryByAltText(/student qr code/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/welcome, back test/i)).not.toBeInTheDocument();
    });
  });

  describe('Easter Egg Integration', () => {
    it('completes flow with easter egg for special student ID 1009104', async () => {
      const user = userEvent.setup();

      mockApiPost.mockResolvedValueOnce({
        success: true,
        student: {
          studentId: '1009104',
          name: 'Special Student',
          tshirtSize: 'M',
          mealPreference: 'Vegetarian'
        },
        qrCode: 'data:image/png;base64,mockqrcode',
        token: 'mock-token-special',
        collectionStatus: {
          shirtCollected: true,
          mealCollected: true
        }
      });

      mockApiPost.mockResolvedValueOnce({
        success: true,
        message: 'Consent recorded'
      });

      render(<StudentApp />);

      // Enter special ID
      await user.type(screen.getByLabelText(/student id/i), '1009104');
      await user.click(screen.getByRole('button', { name: /submit/i }));

      // Easter egg should appear
      await waitFor(() => {
        expect(screen.getByTestId('easter-egg')).toBeInTheDocument();
      });

      // Validation API should NOT be called yet
      expect(mockApiPost).not.toHaveBeenCalled();

      // Simulate easter egg completion
      (window as any).mockEasterEggComplete();

      // Now validation API should be called
      await waitFor(() => {
        expect(mockApiPost).toHaveBeenCalledWith('/api/validate', {
          studentId: '1009104'
        });
      });

      // Consent screen should appear
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /privacy consent/i })).toBeInTheDocument();
      });

      // Complete consent
      await user.click(screen.getByRole('checkbox'));

      // QR display should appear with collection status
      await waitFor(() => {
        expect(screen.getByText(/welcome, special student/i)).toBeInTheDocument();
        expect(screen.getByText(/collection status/i)).toBeInTheDocument();
      });
    });

    it('completes flow with easter egg when randomly triggered', async () => {
      const user = userEvent.setup();

      // Mock Math.random to trigger easter egg (< 1/75)
      vi.spyOn(Math, 'random').mockReturnValue(0.01);

      mockApiPost.mockResolvedValueOnce({
        success: true,
        student: {
          studentId: 'S55555',
          name: 'Lucky Student',
          tshirtSize: 'L',
          mealPreference: 'Non-Vegetarian'
        },
        qrCode: 'data:image/png;base64,mockqrcode',
        token: 'mock-token-lucky',
        collectionStatus: {
          shirtCollected: false,
          mealCollected: false
        }
      });

      mockApiPost.mockResolvedValueOnce({
        success: true,
        message: 'Consent recorded'
      });

      render(<StudentApp />);

      // Enter regular ID
      await user.type(screen.getByLabelText(/student id/i), 'S55555');
      await user.click(screen.getByRole('button', { name: /submit/i }));

      // Easter egg should appear due to random chance
      await waitFor(() => {
        expect(screen.getByTestId('easter-egg')).toBeInTheDocument();
      });

      // Complete easter egg
      (window as any).mockEasterEggComplete();

      // Continue with normal flow
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /privacy consent/i })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('checkbox'));

      await waitFor(() => {
        expect(screen.getByText(/welcome, lucky student/i)).toBeInTheDocument();
      });
    });

    it('skips easter egg for regular student when random check fails', async () => {
      const user = userEvent.setup();

      // Mock Math.random to NOT trigger easter egg (> 1/75)
      vi.spyOn(Math, 'random').mockReturnValue(0.5);

      mockApiPost.mockResolvedValueOnce({
        success: true,
        student: {
          studentId: 'S44444',
          name: 'Regular Student',
          tshirtSize: 'S',
          mealPreference: 'Vegetarian'
        },
        qrCode: 'data:image/png;base64,mockqrcode',
        token: 'mock-token-regular',
        collectionStatus: {
          shirtCollected: false,
          mealCollected: false
        }
      });

      mockApiPost.mockResolvedValueOnce({
        success: true,
        message: 'Consent recorded'
      });

      render(<StudentApp />);

      // Enter regular ID
      await user.type(screen.getByLabelText(/student id/i), 'S44444');
      await user.click(screen.getByRole('button', { name: /submit/i }));

      // Easter egg should NOT appear
      expect(screen.queryByTestId('easter-egg')).not.toBeInTheDocument();

      // Should go directly to consent screen
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /privacy consent/i })).toBeInTheDocument();
      });

      // Complete flow normally
      await user.click(screen.getByRole('checkbox'));

      await waitFor(() => {
        expect(screen.getByText(/welcome, regular student/i)).toBeInTheDocument();
      });
    });
  });

  describe('Collection Status Display on QR Screen', () => {
    it('displays both items not collected', async () => {
      const user = userEvent.setup();

      mockApiPost.mockResolvedValueOnce({
        success: true,
        student: {
          studentId: 'S11111',
          name: 'Test Student 1',
          tshirtSize: 'M',
          mealPreference: 'Vegetarian'
        },
        qrCode: 'data:image/png;base64,mockqrcode',
        token: 'mock-token-1',
        collectionStatus: {
          shirtCollected: false,
          mealCollected: false
        }
      });

      mockApiPost.mockResolvedValueOnce({
        success: true,
        message: 'Consent recorded'
      });

      render(<StudentApp />);

      await user.type(screen.getByLabelText(/student id/i), 'S11111');
      await user.click(screen.getByRole('button', { name: /submit/i }));

      await waitFor(() => {
        expect(screen.getByRole('checkbox')).toBeInTheDocument();
      });
      await user.click(screen.getByRole('checkbox'));

      await waitFor(() => {
        expect(screen.getByText(/collection status/i)).toBeInTheDocument();
      });

      // Both should show as not collected (✗)
      const statusSection = screen.getByText(/collection status/i).closest('.collection-status');
      expect(statusSection).toHaveTextContent('Shirt Collected');
      expect(statusSection).toHaveTextContent('Meal Collected');
    });

    it('displays shirt collected, meal not collected', async () => {
      const user = userEvent.setup();

      mockApiPost.mockResolvedValueOnce({
        success: true,
        student: {
          studentId: 'S22222',
          name: 'Test Student 2',
          tshirtSize: 'L',
          mealPreference: 'Non-Vegetarian'
        },
        qrCode: 'data:image/png;base64,mockqrcode',
        token: 'mock-token-2',
        collectionStatus: {
          shirtCollected: true,
          mealCollected: false
        }
      });

      mockApiPost.mockResolvedValueOnce({
        success: true,
        message: 'Consent recorded'
      });

      render(<StudentApp />);

      await user.type(screen.getByLabelText(/student id/i), 'S22222');
      await user.click(screen.getByRole('button', { name: /submit/i }));

      await waitFor(() => {
        expect(screen.getByRole('checkbox')).toBeInTheDocument();
      });
      await user.click(screen.getByRole('checkbox'));

      await waitFor(() => {
        expect(screen.getByText(/collection status/i)).toBeInTheDocument();
      });

      const statusSection = screen.getByText(/collection status/i).closest('.collection-status');
      expect(statusSection).toHaveTextContent('Shirt Collected');
      expect(statusSection).toHaveTextContent('Meal Collected');
    });

    it('displays both items collected', async () => {
      const user = userEvent.setup();

      mockApiPost.mockResolvedValueOnce({
        success: true,
        student: {
          studentId: 'S33333',
          name: 'Test Student 3',
          tshirtSize: 'XL',
          mealPreference: 'Vegan'
        },
        qrCode: 'data:image/png;base64,mockqrcode',
        token: 'mock-token-3',
        collectionStatus: {
          shirtCollected: true,
          mealCollected: true
        }
      });

      mockApiPost.mockResolvedValueOnce({
        success: true,
        message: 'Consent recorded'
      });

      render(<StudentApp />);

      await user.type(screen.getByLabelText(/student id/i), 'S33333');
      await user.click(screen.getByRole('button', { name: /submit/i }));

      await waitFor(() => {
        expect(screen.getByRole('checkbox')).toBeInTheDocument();
      });
      await user.click(screen.getByRole('checkbox'));

      await waitFor(() => {
        expect(screen.getByText(/collection status/i)).toBeInTheDocument();
      });

      const statusSection = screen.getByText(/collection status/i).closest('.collection-status');
      expect(statusSection).toHaveTextContent('Shirt Collected');
      expect(statusSection).toHaveTextContent('Meal Collected');
    });

    it('handles missing collection status gracefully (defaults to false)', async () => {
      const user = userEvent.setup();

      mockApiPost.mockResolvedValueOnce({
        success: true,
        student: {
          studentId: 'S44444',
          name: 'Test Student 4',
          tshirtSize: 'S',
          mealPreference: 'Vegetarian'
        },
        qrCode: 'data:image/png;base64,mockqrcode',
        token: 'mock-token-4',
        // collectionStatus is missing
      });

      mockApiPost.mockResolvedValueOnce({
        success: true,
        message: 'Consent recorded'
      });

      render(<StudentApp />);

      await user.type(screen.getByLabelText(/student id/i), 'S44444');
      await user.click(screen.getByRole('button', { name: /submit/i }));

      await waitFor(() => {
        expect(screen.getByRole('checkbox')).toBeInTheDocument();
      });
      await user.click(screen.getByRole('checkbox'));

      await waitFor(() => {
        expect(screen.getByText(/collection status/i)).toBeInTheDocument();
      });

      // Should default to false (not collected) for both
      const statusSection = screen.getByText(/collection status/i).closest('.collection-status');
      expect(statusSection).toHaveTextContent('Shirt Collected');
      expect(statusSection).toHaveTextContent('Meal Collected');
    });
  });

  describe('Error Handling in Participant Flow', () => {
    it('handles validation API error gracefully', async () => {
      const user = userEvent.setup();

      mockApiPost.mockRejectedValueOnce(new Error('Student not found'));

      render(<StudentApp />);

      await user.type(screen.getByLabelText(/student id/i), 'INVALID');
      await user.click(screen.getByRole('button', { name: /submit/i }));

      // Should show error message
      await waitFor(() => {
        expect(screen.getByText(/student not found/i)).toBeInTheDocument();
      });

      // Should remain on ID form
      expect(screen.getByLabelText(/student id/i)).toBeInTheDocument();

      // Should not show consent or QR
      expect(screen.queryByRole('heading', { name: /privacy consent/i })).not.toBeInTheDocument();
      expect(screen.queryByAltText(/student qr code/i)).not.toBeInTheDocument();
    });

    it('allows retry after validation error', async () => {
      const user = userEvent.setup();

      // First attempt fails
      mockApiPost.mockRejectedValueOnce(new Error('Network error'));

      // Second attempt succeeds
      mockApiPost.mockResolvedValueOnce({
        success: true,
        student: {
          studentId: 'S66666',
          name: 'Retry Student',
          tshirtSize: 'M',
          mealPreference: 'Vegetarian'
        },
        qrCode: 'data:image/png;base64,mockqrcode',
        token: 'mock-token-retry',
        collectionStatus: {
          shirtCollected: false,
          mealCollected: false
        }
      });

      mockApiPost.mockResolvedValueOnce({
        success: true,
        message: 'Consent recorded'
      });

      render(<StudentApp />);

      // First attempt
      await user.type(screen.getByLabelText(/student id/i), 'S66666');
      await user.click(screen.getByRole('button', { name: /submit/i }));

      await waitFor(() => {
        expect(screen.getByText(/network error/i)).toBeInTheDocument();
      });

      // Clear input and retry
      const input = screen.getByLabelText(/student id/i);
      await user.clear(input);
      await user.type(input, 'S66666');
      await user.click(screen.getByRole('button', { name: /submit/i }));

      // Should proceed to consent
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /privacy consent/i })).toBeInTheDocument();
      });

      // Complete flow
      await user.click(screen.getByRole('checkbox'));

      await waitFor(() => {
        expect(screen.getByText(/welcome, retry student/i)).toBeInTheDocument();
      });
    });
  });
});
