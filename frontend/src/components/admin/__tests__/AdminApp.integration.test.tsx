import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AdminApp from '../AdminApp';

// Mock AdminLogin component
vi.mock('../AdminLogin', () => ({
  default: ({ onLoginSuccess }: any) => {
    // Store callback in window for test access
    (window as any).mockLoginSuccess = onLoginSuccess;
    
    return (
      <div data-testid="admin-login">
        <button onClick={onLoginSuccess} data-testid="login-button">
          Login
        </button>
      </div>
    );
  }
}));

// Mock DatabaseTableView component
vi.mock('../DatabaseTableView', () => ({
  default: () => (
    <div data-testid="database-table-view">
      Database View
    </div>
  )
}));

// Mock the child components with more realistic behavior
vi.mock('../QRScanner', () => ({
  default: ({ onScanSuccess, onScanError }: any) => {
    // Store callbacks in window for test access
    (window as any).mockScanSuccess = onScanSuccess;
    (window as any).mockScanError = onScanError;
    
    return (
      <div data-testid="qr-scanner">
        <div>QR Scanner Active</div>
      </div>
    );
  }
}));

vi.mock('../StudentInfoCard', () => ({
  default: ({ student }: any) => (
    <div data-testid="student-info-card">
      <div>{student.name}</div>
      <div>{student.studentId}</div>
      <div>{student.tshirtSize}</div>
      <div>{student.mealPreference}</div>
    </div>
  )
}));

vi.mock('../ClaimCheckboxes', () => ({
  default: ({ claims, onClaimUpdate }: any) => {
    // Store callback in window for test access
    (window as any).mockClaimUpdate = onClaimUpdate;
    
    return (
      <div data-testid="claim-checkboxes">
        <div data-testid="claim-status">
          <div data-testid="tshirt-status">
            {claims.tshirtClaimed ? 'T-Shirt Claimed' : 'T-Shirt Available'}
          </div>
          <div data-testid="meal-status">
            {claims.mealClaimed ? 'Meal Claimed' : 'Meal Available'}
          </div>
        </div>
        <label>
          <input
            type="checkbox"
            checked={claims.tshirtClaimed}
            disabled={claims.tshirtClaimed}
            data-testid="tshirt-checkbox"
            readOnly
          />
          T-Shirt
        </label>
        <label>
          <input
            type="checkbox"
            checked={claims.mealClaimed}
            disabled={claims.mealClaimed}
            data-testid="meal-checkbox"
            readOnly
          />
          Meal
        </label>
      </div>
    );
  }
}));

vi.mock('../../shared/ErrorMessage', () => ({
  default: ({ message, onDismiss }: any) => (
    <div data-testid="error-message" role="alert">
      <div>{message}</div>
      <button onClick={onDismiss} aria-label="dismiss error">Dismiss</button>
    </div>
  )
}));

describe('AdminApp Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Clear window callbacks
    delete (window as any).mockScanSuccess;
    delete (window as any).mockScanError;
    delete (window as any).mockClaimUpdate;
    delete (window as any).mockLoginSuccess;
  });

  // Helper function to login before each test
  const loginAsAdmin = async () => {
    const user = userEvent.setup();
    
    // Click login button
    const loginButton = screen.getByTestId('login-button');
    await user.click(loginButton);
    
    // Wait for login to complete
    await waitFor(() => {
      expect(screen.queryByTestId('admin-login')).not.toBeInTheDocument();
    });
  };

  describe('Complete Check-in Flow', () => {
    it('completes full check-in flow: scan -> view info -> claim items -> scan another', async () => {
      const user = userEvent.setup();
      render(<AdminApp />);

      // Step 0: Login first
      await loginAsAdmin();

      // Step 1: Initial state - scanner is visible
      expect(screen.getByTestId('qr-scanner')).toBeInTheDocument();
      expect(screen.queryByTestId('student-info-card')).not.toBeInTheDocument();

      // Step 2: Scan a student
      const mockScanData = {
        success: true,
        student: {
          studentId: 'S12345',
          name: 'Alice Johnson',
          tshirtSize: 'M',
          mealPreference: 'Vegetarian',
          involvements: [{ club: 'Tech Club', role: 'Member' }]
        },
        claims: {
          tshirtClaimed: false,
          mealClaimed: false
        }
      };

      (window as any).mockScanSuccess(mockScanData, 'token-123');

      // Step 3: Verify student info is displayed
      await waitFor(() => {
        expect(screen.getByTestId('student-info-card')).toBeInTheDocument();
        expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
        expect(screen.getByText('S12345')).toBeInTheDocument();
      });

      // Step 4: Verify claim status shows both items available
      expect(screen.getByText('T-Shirt Available')).toBeInTheDocument();
      expect(screen.getByText('Meal Available')).toBeInTheDocument();

      // Step 5: Claim t-shirt
      (window as any).mockClaimUpdate({
        tshirtClaimed: true,
        mealClaimed: false
      });

      await waitFor(() => {
        expect(screen.getByText('T-Shirt Claimed')).toBeInTheDocument();
        expect(screen.getByText('Meal Available')).toBeInTheDocument();
      });

      // Step 6: Claim meal
      (window as any).mockClaimUpdate({
        tshirtClaimed: true,
        mealClaimed: true
      });

      await waitFor(() => {
        expect(screen.getByText('T-Shirt Claimed')).toBeInTheDocument();
        expect(screen.getByText('Meal Claimed')).toBeInTheDocument();
      });

      // Step 7: Scan another student
      const scanAnotherButton = screen.getByText('Scan Another Student');
      await user.click(scanAnotherButton);

      await waitFor(() => {
        expect(screen.getByTestId('qr-scanner')).toBeInTheDocument();
        expect(screen.queryByTestId('student-info-card')).not.toBeInTheDocument();
      });
    });

    it('handles student with partial claims correctly', async () => {
      render(<AdminApp />);

      // Login first
      await loginAsAdmin();

      // Scan a student who already claimed t-shirt
      const mockScanData = {
        success: true,
        student: {
          studentId: 'S67890',
          name: 'Bob Smith',
          tshirtSize: 'L',
          mealPreference: 'Non-Vegetarian'
        },
        claims: {
          tshirtClaimed: true,
          mealClaimed: false
        }
      };

      (window as any).mockScanSuccess(mockScanData, 'token-456');

      await waitFor(() => {
        expect(screen.getByText('Bob Smith')).toBeInTheDocument();
      });

      // Verify t-shirt is already claimed
      expect(screen.getByText('T-Shirt Claimed')).toBeInTheDocument();
      expect(screen.getByText('Meal Available')).toBeInTheDocument();

      // Verify t-shirt checkbox is disabled
      const tshirtCheckbox = screen.getByTestId('tshirt-checkbox') as HTMLInputElement;
      expect(tshirtCheckbox.checked).toBe(true);
      expect(tshirtCheckbox.disabled).toBe(true);

      // Meal checkbox should be enabled
      const mealCheckbox = screen.getByTestId('meal-checkbox') as HTMLInputElement;
      expect(mealCheckbox.checked).toBe(false);
      expect(mealCheckbox.disabled).toBe(false);
    });

    it('handles student with all items already claimed', async () => {
      render(<AdminApp />);

      // Login first
      await loginAsAdmin();

      // Scan a student who already claimed everything
      const mockScanData = {
        success: true,
        student: {
          studentId: 'S11111',
          name: 'Charlie Brown',
          tshirtSize: 'XL',
          mealPreference: 'Vegan'
        },
        claims: {
          tshirtClaimed: true,
          mealClaimed: true
        }
      };

      (window as any).mockScanSuccess(mockScanData, 'token-789');

      await waitFor(() => {
        expect(screen.getByText('Charlie Brown')).toBeInTheDocument();
      });

      // Verify both items are claimed
      expect(screen.getByText('T-Shirt Claimed')).toBeInTheDocument();
      expect(screen.getByText('Meal Claimed')).toBeInTheDocument();

      // Verify both checkboxes are disabled
      const tshirtCheckbox = screen.getByTestId('tshirt-checkbox') as HTMLInputElement;
      const mealCheckbox = screen.getByTestId('meal-checkbox') as HTMLInputElement;
      
      expect(tshirtCheckbox.checked).toBe(true);
      expect(tshirtCheckbox.disabled).toBe(true);
      expect(mealCheckbox.checked).toBe(true);
      expect(mealCheckbox.disabled).toBe(true);
    });
  });

  describe('Error Handling Scenarios', () => {
    it('handles invalid QR code scan gracefully', async () => {
      render(<AdminApp />);

      // Login first
      await loginAsAdmin();

      // Simulate invalid QR code
      (window as any).mockScanError('Invalid QR code');

      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toBeInTheDocument();
        expect(screen.getByText('Invalid QR code')).toBeInTheDocument();
      });

      // Scanner should still be visible
      expect(screen.getByTestId('qr-scanner')).toBeInTheDocument();
      expect(screen.queryByTestId('student-info-card')).not.toBeInTheDocument();
    });

    it('handles camera permission denied error', async () => {
      render(<AdminApp />);

      // Login first
      await loginAsAdmin();

      // Simulate camera permission error
      (window as any).mockScanError('Camera permission denied. Please enable camera access to scan QR codes.');

      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toBeInTheDocument();
        expect(screen.getByText(/camera permission denied/i)).toBeInTheDocument();
      });
    });

    it('allows recovery from error by scanning successfully', async () => {
      render(<AdminApp />);

      // Login first
      await loginAsAdmin();

      // First, trigger an error
      (window as any).mockScanError('Network error');

      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toBeInTheDocument();
      });

      // Then scan successfully
      const mockScanData = {
        success: true,
        student: {
          studentId: 'S99999',
          name: 'Diana Prince',
          tshirtSize: 'S',
          mealPreference: 'Vegetarian'
        },
        claims: {
          tshirtClaimed: false,
          mealClaimed: false
        }
      };

      (window as any).mockScanSuccess(mockScanData, 'token-recovery');

      await waitFor(() => {
        expect(screen.queryByTestId('error-message')).not.toBeInTheDocument();
        expect(screen.getByText('Diana Prince')).toBeInTheDocument();
      });
    });

    it('allows dismissing error messages', async () => {
      const user = userEvent.setup();
      render(<AdminApp />);

      // Login first
      await loginAsAdmin();

      // Trigger an error
      (window as any).mockScanError('Test error message');

      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toBeInTheDocument();
      });

      // Dismiss the error
      const dismissButton = screen.getByLabelText('dismiss error');
      await user.click(dismissButton);

      await waitFor(() => {
        expect(screen.queryByTestId('error-message')).not.toBeInTheDocument();
      });
    });

    it('clears previous errors when scanning new student', async () => {
      render(<AdminApp />);

      // Login first
      await loginAsAdmin();

      // First scan with error
      (window as any).mockScanError('First error');

      await waitFor(() => {
        expect(screen.getByText('First error')).toBeInTheDocument();
      });

      // Second scan with different error
      (window as any).mockScanError('Second error');

      await waitFor(() => {
        expect(screen.getByText('Second error')).toBeInTheDocument();
        expect(screen.queryByText('First error')).not.toBeInTheDocument();
      });
    });
  });

  describe('Scan Counter', () => {
    it('increments counter for each successful scan', async () => {
      render(<AdminApp />);

      // Login first
      await loginAsAdmin();

      // Initially no counter
      expect(screen.queryByText(/scans today/i)).not.toBeInTheDocument();

      // First scan
      (window as any).mockScanSuccess({
        success: true,
        student: {
          studentId: 'S1',
          name: 'Student 1',
          tshirtSize: 'M',
          mealPreference: 'Vegetarian'
        },
        claims: { tshirtClaimed: false, mealClaimed: false }
      }, 'token-1');

      await waitFor(() => {
        const counter = screen.getByText(/scans today/i).closest('.scan-counter');
        expect(counter).toHaveTextContent('1');
      });
    });

    it('does not increment counter for failed scans', async () => {
      render(<AdminApp />);

      // Login first
      await loginAsAdmin();

      // Trigger error
      (window as any).mockScanError('Scan failed');

      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toBeInTheDocument();
      });

      // Counter should not appear
      expect(screen.queryByText(/scans today/i)).not.toBeInTheDocument();
    });

    it('maintains counter across multiple scan sessions', async () => {
      const user = userEvent.setup();
      render(<AdminApp />);

      // Login first
      await loginAsAdmin();

      // First scan
      (window as any).mockScanSuccess({
        success: true,
        student: {
          studentId: 'S1',
          name: 'Student 1',
          tshirtSize: 'M',
          mealPreference: 'Vegetarian'
        },
        claims: { tshirtClaimed: false, mealClaimed: false }
      }, 'token-1');

      await waitFor(() => {
        expect(screen.getByText(/scans today/i)).toBeInTheDocument();
      });

      // Scan another
      const scanAnotherButton = screen.getByText('Scan Another Student');
      await user.click(scanAnotherButton);

      // Second scan
      (window as any).mockScanSuccess({
        success: true,
        student: {
          studentId: 'S2',
          name: 'Student 2',
          tshirtSize: 'L',
          mealPreference: 'Non-Vegetarian'
        },
        claims: { tshirtClaimed: false, mealClaimed: false }
      }, 'token-2');

      await waitFor(() => {
        const counter = screen.getByText(/scans today/i).closest('.scan-counter');
        expect(counter).toHaveTextContent('2');
      });
    });
  });

  describe('UI State Management', () => {
    it('shows correct UI elements in scanner mode', async () => {
      render(<AdminApp />);

      // Login first
      await loginAsAdmin();

      expect(screen.getByText('SUTD Open House 2026')).toBeInTheDocument();
      expect(screen.getByTestId('qr-scanner')).toBeInTheDocument();
      expect(screen.getByText('Need help? Contact event staff')).toBeInTheDocument();
    });

    it('shows correct UI elements in student info mode', async () => {
      render(<AdminApp />);

      // Login first
      await loginAsAdmin();

      (window as any).mockScanSuccess({
        success: true,
        student: {
          studentId: 'S123',
          name: 'Test Student',
          tshirtSize: 'M',
          mealPreference: 'Vegetarian'
        },
        claims: { tshirtClaimed: false, mealClaimed: false }
      }, 'token-test');

      await waitFor(() => {
        expect(screen.getByTestId('student-info-card')).toBeInTheDocument();
        expect(screen.getByTestId('claim-checkboxes')).toBeInTheDocument();
        expect(screen.getByText('Scan Another Student')).toBeInTheDocument();
      });

      // Scanner should be hidden
      expect(screen.queryByTestId('qr-scanner')).not.toBeInTheDocument();
    });

    it('maintains header and footer across all states', async () => {
      const user = userEvent.setup();
      render(<AdminApp />);

      // Login first
      await loginAsAdmin();

      // Check in scanner mode
      expect(screen.getByText('SUTD Open House 2026')).toBeInTheDocument();
      expect(screen.getByText('Need help? Contact event staff')).toBeInTheDocument();

      // Scan a student
      (window as any).mockScanSuccess({
        success: true,
        student: {
          studentId: 'S123',
          name: 'Test Student',
          tshirtSize: 'M',
          mealPreference: 'Vegetarian'
        },
        claims: { tshirtClaimed: false, mealClaimed: false }
      }, 'token-test');

      await waitFor(() => {
        expect(screen.getByTestId('student-info-card')).toBeInTheDocument();
      });

      // Check in student info mode
      expect(screen.getByText('SUTD Open House 2026')).toBeInTheDocument();
      expect(screen.getByText('Need help? Contact event staff')).toBeInTheDocument();

      // Go back to scanner
      await user.click(screen.getByText('Scan Another Student'));

      await waitFor(() => {
        expect(screen.getByTestId('qr-scanner')).toBeInTheDocument();
      });

      // Check header and footer still present
      expect(screen.getByText('SUTD Open House 2026')).toBeInTheDocument();
      expect(screen.getByText('Need help? Contact event staff')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles rapid successive scans', async () => {
      render(<AdminApp />);

      // Login first
      await loginAsAdmin();

      // Scan first student
      (window as any).mockScanSuccess({
        success: true,
        student: {
          studentId: 'S1',
          name: 'Student 1',
          tshirtSize: 'M',
          mealPreference: 'Vegetarian'
        },
        claims: { tshirtClaimed: false, mealClaimed: false }
      }, 'token-1');

      await waitFor(() => {
        expect(screen.getByText('Student 1')).toBeInTheDocument();
      });

      // Immediately scan second student (simulating rapid scanning)
      (window as any).mockScanSuccess({
        success: true,
        student: {
          studentId: 'S2',
          name: 'Student 2',
          tshirtSize: 'L',
          mealPreference: 'Non-Vegetarian'
        },
        claims: { tshirtClaimed: false, mealClaimed: false }
      }, 'token-2');

      // Should show second student
      await waitFor(() => {
        expect(screen.getByText('Student 2')).toBeInTheDocument();
        expect(screen.queryByText('Student 1')).not.toBeInTheDocument();
      });
    });

    it('handles scan with missing optional fields', async () => {
      render(<AdminApp />);

      // Login first
      await loginAsAdmin();

      // Scan with minimal data (no involvements)
      (window as any).mockScanSuccess({
        success: true,
        student: {
          studentId: 'S999',
          name: 'Minimal Student',
          tshirtSize: 'S',
          mealPreference: 'Vegetarian'
        },
        claims: { tshirtClaimed: false, mealClaimed: false }
      }, 'token-minimal');

      await waitFor(() => {
        expect(screen.getByText('Minimal Student')).toBeInTheDocument();
        expect(screen.getByText('S999')).toBeInTheDocument();
      });
    });

    it('handles empty error message gracefully', async () => {
      render(<AdminApp />);

      // Login first
      await loginAsAdmin();

      // Trigger error with empty message - AdminApp should still handle it
      (window as any).mockScanError('');

      // Wait a bit to ensure state updates
      await new Promise(resolve => setTimeout(resolve, 100));

      // Empty error messages should not display error component
      // This is correct behavior - no error message means no error display
      expect(screen.queryByTestId('error-message')).not.toBeInTheDocument();
      
      // Scanner should still be visible
      expect(screen.getByTestId('qr-scanner')).toBeInTheDocument();
    });
  });
});
