import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AdminApp from '../AdminApp';

/**
 * Integration Test for Admin Flow
 * 
 * **Validates: Requirements 6.1, 6.2**
 * 
 * This test suite verifies the complete admin authentication and access flow:
 * 1. AdminLogin is shown before admin dashboard
 * 2. Correct password "Linda47$" grants access to dashboard
 * 3. Admin features (QR scanner, database view, tabs) are accessible after login
 * 4. Incorrect password is rejected
 */

// Mock the child components to focus on integration flow
vi.mock('../QRScanner', () => ({
  default: () => (
    <div data-testid="qr-scanner">
      <div>QR Scanner Component</div>
    </div>
  )
}));

vi.mock('../DatabaseTableView', () => ({
  default: () => (
    <div data-testid="database-table-view">
      <div>Database Table View Component</div>
    </div>
  )
}));

vi.mock('../StudentInfoCard', () => ({
  default: () => <div data-testid="student-info-card">Student Info</div>
}));

vi.mock('../ClaimCheckboxes', () => ({
  default: () => <div data-testid="claim-checkboxes">Claim Checkboxes</div>
}));

vi.mock('../../shared/ErrorMessage', () => ({
  default: () => <div data-testid="error-message">Error Message</div>
}));

describe('Admin Flow Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Login Required for Admin Access', () => {
    it('shows AdminLogin screen before admin dashboard', () => {
      render(<AdminApp />);

      // Verify login screen is displayed
      expect(screen.getByText('Admin Access')).toBeInTheDocument();
      expect(screen.getByText('Enter password to continue')).toBeInTheDocument();
      expect(screen.getByLabelText('Password')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();

      // Verify admin dashboard is NOT displayed
      expect(screen.queryByText('SUTD Open House 2026')).not.toBeInTheDocument();
      expect(screen.queryByTestId('qr-scanner')).not.toBeInTheDocument();
      expect(screen.queryByText('Scanner')).not.toBeInTheDocument();
      expect(screen.queryByText('Database View')).not.toBeInTheDocument();
    });

    it('does not show admin features before authentication', () => {
      render(<AdminApp />);

      // Verify no admin features are accessible
      expect(screen.queryByTestId('qr-scanner')).not.toBeInTheDocument();
      expect(screen.queryByTestId('database-table-view')).not.toBeInTheDocument();
      expect(screen.queryByText('Event Check-In Station')).not.toBeInTheDocument();
      expect(screen.queryByText('Scanner')).not.toBeInTheDocument();
      expect(screen.queryByText('Database View')).not.toBeInTheDocument();
    });
  });

  describe('Correct Password Grants Access', () => {
    it('grants access to admin dashboard with correct password "Linda47$"', async () => {
      const user = userEvent.setup();
      render(<AdminApp />);

      // Enter correct password
      const passwordInput = screen.getByLabelText('Password');
      await user.type(passwordInput, 'Linda47$');

      // Submit form
      const loginButton = screen.getByRole('button', { name: /login/i });
      await user.click(loginButton);

      // Verify admin dashboard is now displayed
      await waitFor(() => {
        expect(screen.getByText('SUTD Open House 2026')).toBeInTheDocument();
        expect(screen.getByText('Event Check-In Station')).toBeInTheDocument();
      });

      // Verify login screen is no longer displayed
      expect(screen.queryByText('Admin Access')).not.toBeInTheDocument();
      expect(screen.queryByText('Enter password to continue')).not.toBeInTheDocument();
    });

    it('shows admin header and branding after successful login', async () => {
      const user = userEvent.setup();
      render(<AdminApp />);

      // Login with correct password
      await user.type(screen.getByLabelText('Password'), 'Linda47$');
      await user.click(screen.getByRole('button', { name: /login/i }));

      // Verify admin header elements
      await waitFor(() => {
        expect(screen.getByText('SUTD Open House 2026')).toBeInTheDocument();
        expect(screen.getByText('Event Check-In Station')).toBeInTheDocument();
        expect(screen.getByAltText('ROOT Logo')).toBeInTheDocument();
      });
    });

    it('maintains authentication state after login', async () => {
      const user = userEvent.setup();
      render(<AdminApp />);

      // Login
      await user.type(screen.getByLabelText('Password'), 'Linda47$');
      await user.click(screen.getByRole('button', { name: /login/i }));

      // Wait for dashboard
      await waitFor(() => {
        expect(screen.getByText('SUTD Open House 2026')).toBeInTheDocument();
      });

      // Switch tabs to verify authentication persists
      const databaseTab = screen.getByRole('button', { name: /database view/i });
      await user.click(databaseTab);

      await waitFor(() => {
        expect(screen.getByTestId('database-table-view')).toBeInTheDocument();
      });

      // Verify still authenticated (no login screen)
      expect(screen.queryByText('Admin Access')).not.toBeInTheDocument();
      expect(screen.getByText('SUTD Open House 2026')).toBeInTheDocument();
    });
  });

  describe('Incorrect Password Rejection', () => {
    it('rejects incorrect password and shows error message', async () => {
      const user = userEvent.setup();
      render(<AdminApp />);

      // Enter incorrect password
      const passwordInput = screen.getByLabelText('Password');
      await user.type(passwordInput, 'WrongPassword123');

      // Submit form
      const loginButton = screen.getByRole('button', { name: /login/i });
      await user.click(loginButton);

      // Verify error message is displayed
      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
        expect(screen.getByText('Incorrect password. Please try again.')).toBeInTheDocument();
      });

      // Verify still on login screen
      expect(screen.getByText('Admin Access')).toBeInTheDocument();
      expect(screen.queryByText('SUTD Open House 2026')).not.toBeInTheDocument();
    });

    it('rejects empty password', async () => {
      const user = userEvent.setup();
      render(<AdminApp />);

      // Try to submit without entering password
      const loginButton = screen.getByRole('button', { name: /login/i });
      
      // Button should be disabled when password is empty
      expect(loginButton).toBeDisabled();
    });

    it('rejects password with similar but incorrect value', async () => {
      const user = userEvent.setup();
      render(<AdminApp />);

      // Try variations of the correct password
      const incorrectPasswords = [
        'linda47$',       // lowercase L
        'Linda47$2',      // extra 2
        'Linda47$22',     // extra 22
        'Linda47$ ',      // trailing space
        ' Linda47$',      // leading space
      ];

      for (const password of incorrectPasswords) {
        // Clear any previous input
        const passwordInput = screen.getByLabelText('Password');
        await user.clear(passwordInput);
        
        // Enter incorrect password
        await user.type(passwordInput, password);
        await user.click(screen.getByRole('button', { name: /login/i }));

        // Verify error is shown
        await waitFor(() => {
          expect(screen.getByText('Incorrect password. Please try again.')).toBeInTheDocument();
        });

        // Verify still on login screen
        expect(screen.queryByText('SUTD Open House 2026')).not.toBeInTheDocument();
      }
    });

    it('allows retry after incorrect password', async () => {
      const user = userEvent.setup();
      render(<AdminApp />);

      // First attempt with wrong password
      await user.type(screen.getByLabelText('Password'), 'WrongPassword');
      await user.click(screen.getByRole('button', { name: /login/i }));

      // Verify error
      await waitFor(() => {
        expect(screen.getByText('Incorrect password. Please try again.')).toBeInTheDocument();
      });

      // Clear and try again with correct password
      const passwordInput = screen.getByLabelText('Password');
      await user.clear(passwordInput);
      await user.type(passwordInput, 'Linda47$');
      await user.click(screen.getByRole('button', { name: /login/i }));

      // Verify successful login
      await waitFor(() => {
        expect(screen.getByText('SUTD Open House 2026')).toBeInTheDocument();
      });

      // Verify error is gone
      expect(screen.queryByText('Incorrect password. Please try again.')).not.toBeInTheDocument();
    });
  });

  describe('Admin Features Accessible After Login', () => {
    it('shows QR scanner tab after successful login', async () => {
      const user = userEvent.setup();
      render(<AdminApp />);

      // Login
      await user.type(screen.getByLabelText('Password'), 'Linda47$');
      await user.click(screen.getByRole('button', { name: /login/i }));

      // Verify Scanner tab is visible and active
      await waitFor(() => {
        const scannerTab = screen.getByRole('button', { name: /scanner/i });
        expect(scannerTab).toBeInTheDocument();
        expect(scannerTab).toHaveClass('active');
      });

      // Verify QR scanner component is displayed
      expect(screen.getByTestId('qr-scanner')).toBeInTheDocument();
    });

    it('shows database view tab after successful login', async () => {
      const user = userEvent.setup();
      render(<AdminApp />);

      // Login
      await user.type(screen.getByLabelText('Password'), 'Linda47$');
      await user.click(screen.getByRole('button', { name: /login/i }));

      // Verify Database View tab is visible
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /database view/i })).toBeInTheDocument();
      });
    });

    it('allows switching between scanner and database view tabs', async () => {
      const user = userEvent.setup();
      render(<AdminApp />);

      // Login
      await user.type(screen.getByLabelText('Password'), 'Linda47$');
      await user.click(screen.getByRole('button', { name: /login/i }));

      // Wait for dashboard
      await waitFor(() => {
        expect(screen.getByText('SUTD Open House 2026')).toBeInTheDocument();
      });

      // Initially on Scanner tab
      expect(screen.getByTestId('qr-scanner')).toBeInTheDocument();
      expect(screen.queryByTestId('database-table-view')).not.toBeInTheDocument();

      // Switch to Database View tab
      const databaseTab = screen.getByRole('button', { name: /database view/i });
      await user.click(databaseTab);

      // Verify Database View is shown
      await waitFor(() => {
        expect(screen.getByTestId('database-table-view')).toBeInTheDocument();
      });
      expect(screen.queryByTestId('qr-scanner')).not.toBeInTheDocument();

      // Switch back to Scanner tab
      const scannerTab = screen.getByRole('button', { name: /scanner/i });
      await user.click(scannerTab);

      // Verify Scanner is shown again
      await waitFor(() => {
        expect(screen.getByTestId('qr-scanner')).toBeInTheDocument();
      });
      expect(screen.queryByTestId('database-table-view')).not.toBeInTheDocument();
    });

    it('shows tab navigation controls after login', async () => {
      const user = userEvent.setup();
      render(<AdminApp />);

      // Login
      await user.type(screen.getByLabelText('Password'), 'Linda47$');
      await user.click(screen.getByRole('button', { name: /login/i }));

      // Verify both tabs are present
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /scanner/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /database view/i })).toBeInTheDocument();
      });
    });

    it('shows admin footer after login', async () => {
      const user = userEvent.setup();
      render(<AdminApp />);

      // Login
      await user.type(screen.getByLabelText('Password'), 'Linda47$');
      await user.click(screen.getByRole('button', { name: /login/i }));

      // Verify footer is displayed
      await waitFor(() => {
        expect(screen.getByText('Need help? Contact event staff')).toBeInTheDocument();
      });
    });
  });

  describe('Complete Admin Flow', () => {
    it('completes full admin flow: login -> scanner -> database view', async () => {
      const user = userEvent.setup();
      render(<AdminApp />);

      // Step 1: Verify login screen
      expect(screen.getByText('Admin Access')).toBeInTheDocument();

      // Step 2: Login with correct password
      await user.type(screen.getByLabelText('Password'), 'Linda47$');
      await user.click(screen.getByRole('button', { name: /login/i }));

      // Step 3: Verify admin dashboard with scanner
      await waitFor(() => {
        expect(screen.getByText('SUTD Open House 2026')).toBeInTheDocument();
        expect(screen.getByTestId('qr-scanner')).toBeInTheDocument();
      });

      // Step 4: Switch to database view
      await user.click(screen.getByRole('button', { name: /database view/i }));

      // Step 5: Verify database view is displayed
      await waitFor(() => {
        expect(screen.getByTestId('database-table-view')).toBeInTheDocument();
      });

      // Step 6: Switch back to scanner
      await user.click(screen.getByRole('button', { name: /scanner/i }));

      // Step 7: Verify scanner is displayed again
      await waitFor(() => {
        expect(screen.getByTestId('qr-scanner')).toBeInTheDocument();
      });

      // Verify no login screen throughout
      expect(screen.queryByText('Admin Access')).not.toBeInTheDocument();
    });

    it('shows all admin features are accessible after authentication', async () => {
      const user = userEvent.setup();
      render(<AdminApp />);

      // Login
      await user.type(screen.getByLabelText('Password'), 'Linda47$');
      await user.click(screen.getByRole('button', { name: /login/i }));

      // Verify all admin features are present
      await waitFor(() => {
        // Header
        expect(screen.getByText('SUTD Open House 2026')).toBeInTheDocument();
        expect(screen.getByText('Event Check-In Station')).toBeInTheDocument();
        expect(screen.getByAltText('ROOT Logo')).toBeInTheDocument();

        // Tab navigation
        expect(screen.getByRole('button', { name: /scanner/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /database view/i })).toBeInTheDocument();

        // Scanner (default tab)
        expect(screen.getByTestId('qr-scanner')).toBeInTheDocument();

        // Footer
        expect(screen.getByText('Need help? Contact event staff')).toBeInTheDocument();
      });
    });
  });

  describe('UI State and Styling', () => {
    it('displays login screen with correct styling and branding', () => {
      render(<AdminApp />);

      // Verify ROOT logo is present on login screen
      expect(screen.getByAltText('ROOT Logo')).toBeInTheDocument();

      // Verify login form elements
      expect(screen.getByText('Admin Access')).toBeInTheDocument();
      expect(screen.getByText('Enter password to continue')).toBeInTheDocument();
      expect(screen.getByLabelText('Password')).toBeInTheDocument();
    });

    it('displays admin dashboard with correct styling after login', async () => {
      const user = userEvent.setup();
      render(<AdminApp />);

      // Login
      await user.type(screen.getByLabelText('Password'), 'Linda47$');
      await user.click(screen.getByRole('button', { name: /login/i }));

      // Verify dashboard styling elements
      await waitFor(() => {
        expect(screen.getByAltText('ROOT Logo')).toBeInTheDocument();
        expect(screen.getByText('SUTD Open House 2026')).toBeInTheDocument();
        expect(screen.getByText('Event Check-In Station')).toBeInTheDocument();
      });
    });

    it('shows active tab styling correctly', async () => {
      const user = userEvent.setup();
      render(<AdminApp />);

      // Login
      await user.type(screen.getByLabelText('Password'), 'Linda47$');
      await user.click(screen.getByRole('button', { name: /login/i }));

      await waitFor(() => {
        expect(screen.getByText('SUTD Open House 2026')).toBeInTheDocument();
      });

      // Scanner tab should be active initially
      const scannerTab = screen.getByRole('button', { name: /scanner/i });
      const databaseTab = screen.getByRole('button', { name: /database view/i });
      
      expect(scannerTab).toHaveClass('active');
      expect(databaseTab).not.toHaveClass('active');

      // Switch to database view
      await user.click(databaseTab);

      await waitFor(() => {
        expect(databaseTab).toHaveClass('active');
        expect(scannerTab).not.toHaveClass('active');
      });
    });
  });
});
