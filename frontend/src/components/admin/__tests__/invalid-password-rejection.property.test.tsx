import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import * as fc from 'fast-check';
import AdminLogin from '../AdminLogin';

/**
 * Feature: ui-ux-enhancements
 * Property 5: Invalid Password Rejection
 * 
 * **Validates: Requirements 6.3**
 * 
 * For any password string that is not "Linda47$2", the admin authentication
 * should deny access and display an error message.
 * 
 * This property test verifies that:
 * 1. Any password other than the correct one is rejected
 * 2. An error message is displayed for invalid passwords
 * 3. The onLoginSuccess callback is never called for invalid passwords
 */

describe('Property 5: Invalid Password Rejection', () => {
  it('should reject all passwords that are not exactly "Linda47$"', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate arbitrary strings that are NOT the correct password
        fc.string().filter(s => s !== 'Linda47$'),
        async (invalidPassword) => {
          const mockOnLoginSuccess = vi.fn();
          
          // Render the component
          const { unmount } = render(<AdminLogin onLoginSuccess={mockOnLoginSuccess} />);
          
          // Get form elements
          const passwordInput = screen.getByLabelText(/password/i);
          const submitButton = screen.getByRole('button', { name: /login/i });
          
          // Enter the invalid password
          fireEvent.change(passwordInput, { target: { value: invalidPassword } });
          
          // Submit the form
          fireEvent.click(submitButton);
          
          // Verify that login was NOT successful
          expect(mockOnLoginSuccess).not.toHaveBeenCalled();
          
          // Verify that an error message is displayed
          // (only if password is non-empty, as empty passwords disable the button)
          if (invalidPassword.length > 0) {
            const errorMessage = screen.getByRole('alert');
            expect(errorMessage).toBeInTheDocument();
            expect(errorMessage).toHaveTextContent(/incorrect password/i);
          }
          
          // Clean up
          unmount();
          vi.clearAllMocks();
        }
      ),
      { numRuns: 100, endOnFailure: true }
    );
  }, 60000); // 1 minute timeout

  it('should display error message for passwords similar to correct password', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate strings that are variations of the correct password
        fc.constantFrom(
          'linda47$',       // lowercase
          'LINDA47$',       // uppercase
          'Linda47',        // missing $
          'Linda47$2',      // extra character
          ' Linda47$',      // leading space
          'Linda47$ ',      // trailing space
          '\tLinda47$',     // leading tab
          'Linda 47$',      // space in middle
          'Linda47$3',      // different number
          'Linda47!',       // different special char
          'Linda48$',       // different digit
          'Lynda47$',       // different letter
          'Linda47$0',      // extra digit
          'inda47$',        // missing first char
        ),
        async (similarPassword) => {
          const mockOnLoginSuccess = vi.fn();
          
          const { unmount } = render(<AdminLogin onLoginSuccess={mockOnLoginSuccess} />);
          
          const passwordInput = screen.getByLabelText(/password/i);
          const submitButton = screen.getByRole('button', { name: /login/i });
          
          // Enter the similar but incorrect password
          fireEvent.change(passwordInput, { target: { value: similarPassword } });
          fireEvent.click(submitButton);
          
          // Verify rejection
          expect(mockOnLoginSuccess).not.toHaveBeenCalled();
          
          // Verify error message is displayed
          const errorMessage = screen.getByRole('alert');
          expect(errorMessage).toBeInTheDocument();
          expect(errorMessage).toHaveTextContent(/incorrect password/i);
          
          unmount();
          vi.clearAllMocks();
        }
      ),
      { numRuns: 14, endOnFailure: true }
    );
  }, 30000);

  it('should reject passwords with different character encodings', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate strings with various Unicode characters
        fc.string({ minLength: 1, maxLength: 50 })
          .filter(s => s !== 'Linda47$'),
        async (unicodePassword) => {
          const mockOnLoginSuccess = vi.fn();
          
          const { unmount } = render(<AdminLogin onLoginSuccess={mockOnLoginSuccess} />);
          
          const passwordInput = screen.getByLabelText(/password/i);
          const submitButton = screen.getByRole('button', { name: /login/i });
          
          fireEvent.change(passwordInput, { target: { value: unicodePassword } });
          fireEvent.click(submitButton);
          
          // Should always reject
          expect(mockOnLoginSuccess).not.toHaveBeenCalled();
          
          // Should show error message
          const errorMessage = screen.getByRole('alert');
          expect(errorMessage).toBeInTheDocument();
          
          unmount();
          vi.clearAllMocks();
        }
      ),
      { numRuns: 100, endOnFailure: true }
    );
  }, 60000);

  it('should reject passwords of various lengths', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate strings of different lengths (excluding correct password)
        fc.string({ minLength: 1, maxLength: 100 })
          .filter(s => s !== 'Linda47$'),
        async (password) => {
          const mockOnLoginSuccess = vi.fn();
          
          const { unmount } = render(<AdminLogin onLoginSuccess={mockOnLoginSuccess} />);
          
          const passwordInput = screen.getByLabelText(/password/i);
          const submitButton = screen.getByRole('button', { name: /login/i });
          
          fireEvent.change(passwordInput, { target: { value: password } });
          fireEvent.click(submitButton);
          
          // Verify rejection regardless of length
          expect(mockOnLoginSuccess).not.toHaveBeenCalled();
          
          // Verify error message
          const errorMessage = screen.getByRole('alert');
          expect(errorMessage).toBeInTheDocument();
          expect(errorMessage.textContent).toContain('Incorrect password');
          
          unmount();
          vi.clearAllMocks();
        }
      ),
      { numRuns: 100, endOnFailure: true }
    );
  }, 60000);

  it('should consistently reject the same invalid password across multiple attempts', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 50 })
          .filter(s => s !== 'Linda47$'),
        async (invalidPassword) => {
          const mockOnLoginSuccess = vi.fn();
          
          const { unmount } = render(<AdminLogin onLoginSuccess={mockOnLoginSuccess} />);
          
          const passwordInput = screen.getByLabelText(/password/i);
          const submitButton = screen.getByRole('button', { name: /login/i });
          
          // Try the same invalid password multiple times
          for (let attempt = 0; attempt < 3; attempt++) {
            fireEvent.change(passwordInput, { target: { value: invalidPassword } });
            fireEvent.click(submitButton);
            
            // Should be rejected every time
            expect(mockOnLoginSuccess).not.toHaveBeenCalled();
            
            // Error message should appear every time
            const errorMessage = screen.getByRole('alert');
            expect(errorMessage).toBeInTheDocument();
          }
          
          // Verify callback was never called across all attempts
          expect(mockOnLoginSuccess).toHaveBeenCalledTimes(0);
          
          unmount();
          vi.clearAllMocks();
        }
      ),
      { numRuns: 50, endOnFailure: true }
    );
  }, 60000);

  it('should reject passwords with special characters and numbers', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate strings with alphanumeric and special characters
        fc.array(
          fc.constantFrom(
            ...'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?/~`'.split('')
          ),
          { minLength: 1, maxLength: 30 }
        ).map(arr => arr.join(''))
        .filter(s => s !== 'Linda47$'),
        async (complexPassword) => {
          const mockOnLoginSuccess = vi.fn();
          
          const { unmount } = render(<AdminLogin onLoginSuccess={mockOnLoginSuccess} />);
          
          const passwordInput = screen.getByLabelText(/password/i);
          const submitButton = screen.getByRole('button', { name: /login/i });
          
          fireEvent.change(passwordInput, { target: { value: complexPassword } });
          fireEvent.click(submitButton);
          
          // Should reject complex passwords that aren't the correct one
          expect(mockOnLoginSuccess).not.toHaveBeenCalled();
          
          // Should display error
          const errorMessage = screen.getByRole('alert');
          expect(errorMessage).toBeInTheDocument();
          
          unmount();
          vi.clearAllMocks();
        }
      ),
      { numRuns: 100, endOnFailure: true }
    );
  }, 60000);

  it('should never grant access without the exact correct password', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate any string except the correct password
        fc.oneof(
          fc.string({ minLength: 1, maxLength: 20 }),
          fc.string({ minLength: 1, maxLength: 100 })
        ).filter(s => s !== 'Linda47$'),
        async (anyPassword) => {
          const mockOnLoginSuccess = vi.fn();
          
          const { unmount } = render(<AdminLogin onLoginSuccess={mockOnLoginSuccess} />);
          
          const passwordInput = screen.getByLabelText(/password/i);
          const submitButton = screen.getByRole('button', { name: /login/i });
          
          // Try to login with any password that's not correct
          fireEvent.change(passwordInput, { target: { value: anyPassword } });
          fireEvent.click(submitButton);
          
          // Must never grant access
          expect(mockOnLoginSuccess).not.toHaveBeenCalled();
          
          // Must show error
          expect(screen.getByRole('alert')).toBeInTheDocument();
          
          unmount();
          vi.clearAllMocks();
        }
      ),
      { numRuns: 100, endOnFailure: true }
    );
  }, 60000);
});
