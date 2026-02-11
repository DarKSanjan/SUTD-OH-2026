import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import * as fc from 'fast-check';
import PDPAConsent from '../PDPAConsent';
import * as api from '../../../services/api';

/**
 * Feature: ui-ux-enhancements
 * Property 1: Consent Prevents QR Display
 * 
 * **Validates: Requirements 4.3**
 * 
 * For any participant session where the PDPA consent checkbox is unchecked,
 * the QR code should not be displayed in the UI.
 * 
 * This property test verifies that:
 * 1. When the consent checkbox is unchecked, the onConsentGiven callback is NOT called
 * 2. When the consent checkbox is checked and API succeeds, the onConsentGiven callback IS called
 * 3. This behavior holds for any valid student ID
 */

// Mock the API module
vi.mock('../../../services/api', () => ({
  apiPost: vi.fn(),
  getErrorMessage: vi.fn((err) => err.message || 'An error occurred')
}));

describe('Property 1: Consent Prevents QR Display', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should never call onConsentGiven when checkbox is unchecked for any student ID', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate arbitrary student IDs
        fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim().length > 0),
        async (studentId) => {
          const mockOnConsentGiven = vi.fn();
          const mockApiPost = vi.mocked(api.apiPost);
          
          // Render the component
          const { unmount } = render(
            <PDPAConsent 
              studentId={studentId}
              onConsentGiven={mockOnConsentGiven}
            />
          );
          
          // Verify checkbox is initially unchecked
          const checkbox = screen.getByRole('checkbox');
          expect(checkbox).not.toBeChecked();
          
          // Wait a bit to ensure no async operations trigger
          await new Promise(resolve => setTimeout(resolve, 50));
          
          // Verify onConsentGiven was never called when checkbox is unchecked
          expect(mockOnConsentGiven).not.toHaveBeenCalled();
          
          // Verify API was never called when checkbox is unchecked
          expect(mockApiPost).not.toHaveBeenCalled();
          
          // Clean up
          unmount();
        }
      ),
      { numRuns: 50, endOnFailure: true }
    );
  }, 30000);

  it('should call onConsentGiven only when checkbox is checked and API succeeds for any student ID', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate arbitrary student IDs
        fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim().length > 0),
        async (studentId) => {
          const mockOnConsentGiven = vi.fn();
          const mockApiPost = vi.mocked(api.apiPost);
          
          // Mock successful API response
          mockApiPost.mockResolvedValue({ success: true, message: 'Consent recorded' });
          
          // Render the component
          const { unmount } = render(
            <PDPAConsent 
              studentId={studentId}
              onConsentGiven={mockOnConsentGiven}
            />
          );
          
          const checkbox = screen.getByRole('checkbox');
          
          // Initially unchecked - onConsentGiven should not be called
          expect(mockOnConsentGiven).not.toHaveBeenCalled();
          
          // Check the checkbox
          fireEvent.click(checkbox);
          
          // Wait for API call and callback
          await waitFor(() => {
            expect(mockApiPost).toHaveBeenCalledWith('/api/consent', {
              studentId: studentId,
              consented: true
            });
          });
          
          // Verify onConsentGiven was called after successful consent
          await waitFor(() => {
            expect(mockOnConsentGiven).toHaveBeenCalledTimes(1);
          });
          
          // Clean up
          unmount();
        }
      ),
      { numRuns: 50, endOnFailure: true }
    );
  }, 30000);

  it('should not call onConsentGiven when API fails for any student ID', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate arbitrary student IDs and error messages
        fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim().length > 0),
        fc.string({ minLength: 1, maxLength: 100 }),
        async (studentId, errorMessage) => {
          const mockOnConsentGiven = vi.fn();
          const mockApiPost = vi.mocked(api.apiPost);
          const mockGetErrorMessage = vi.mocked(api.getErrorMessage);
          
          // Mock API failure
          mockApiPost.mockRejectedValue(new Error(errorMessage));
          mockGetErrorMessage.mockReturnValue(errorMessage);
          
          // Render the component
          const { unmount } = render(
            <PDPAConsent 
              studentId={studentId}
              onConsentGiven={mockOnConsentGiven}
            />
          );
          
          const checkbox = screen.getByRole('checkbox');
          
          // Check the checkbox
          fireEvent.click(checkbox);
          
          // Wait for API call to fail
          await waitFor(() => {
            expect(mockApiPost).toHaveBeenCalled();
          });
          
          // Wait a bit more to ensure callback is not called
          await new Promise(resolve => setTimeout(resolve, 100));
          
          // Verify onConsentGiven was NOT called when API fails
          expect(mockOnConsentGiven).not.toHaveBeenCalled();
          
          // Verify checkbox is unchecked after failure
          expect(checkbox).not.toBeChecked();
          
          // Clean up
          unmount();
        }
      ),
      { numRuns: 50, endOnFailure: true }
    );
  }, 30000);

  it('should maintain consent prevention across multiple unchecked states', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim().length > 0),
        fc.integer({ min: 1, max: 5 }), // Number of times to verify unchecked state
        async (studentId, checkCount) => {
          const mockOnConsentGiven = vi.fn();
          const mockApiPost = vi.mocked(api.apiPost);
          
          // Render the component
          const { unmount } = render(
            <PDPAConsent 
              studentId={studentId}
              onConsentGiven={mockOnConsentGiven}
            />
          );
          
          const checkbox = screen.getByRole('checkbox');
          
          // Verify multiple times that unchecked state prevents consent
          for (let i = 0; i < checkCount; i++) {
            expect(checkbox).not.toBeChecked();
            expect(mockOnConsentGiven).not.toHaveBeenCalled();
            expect(mockApiPost).not.toHaveBeenCalled();
            
            // Wait a bit between checks
            await new Promise(resolve => setTimeout(resolve, 20));
          }
          
          // Clean up
          unmount();
        }
      ),
      { numRuns: 30, endOnFailure: true }
    );
  }, 30000);
});
