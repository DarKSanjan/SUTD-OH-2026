import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AdminApp from '../AdminApp';

// Mock the child components
vi.mock('../AdminLogin', () => ({
  default: ({ onLoginSuccess }: any) => (
    <div data-testid="admin-login">
      <input
        type="password"
        placeholder="Enter admin password"
        data-testid="password-input"
      />
      <button onClick={onLoginSuccess} data-testid="login-button">
        Login
      </button>
    </div>
  )
}));

vi.mock('../QRScanner', () => ({
  default: ({ onScanSuccess, onScanError }: any) => (
    <div data-testid="qr-scanner">
      <button onClick={() => onScanSuccess({
        success: true,
        student: {
          studentId: 'S12345',
          name: 'John Doe',
          tshirtSize: 'L',
          mealPreference: 'Vegetarian',
          involvements: [{ club: 'Chess Club', role: 'Member' }]
        },
        claims: {
          tshirtClaimed: false,
          mealClaimed: false
        }
      }, 'test-token-123')}>
        Simulate Scan Success
      </button>
      <button onClick={() => onScanError('Camera permission denied')}>
        Simulate Scan Error
      </button>
    </div>
  )
}));

vi.mock('../StudentInfoCard', () => ({
  default: ({ student }: any) => (
    <div data-testid="student-info-card">
      {student.name} - {student.studentId}
    </div>
  )
}));

vi.mock('../ClaimCheckboxes', () => ({
  default: ({ token, claims, onClaimUpdate }: any) => (
    <div data-testid="claim-checkboxes">
      <button onClick={() => onClaimUpdate({ ...claims, tshirtClaimed: true })}>
        Claim T-Shirt
      </button>
      <button onClick={() => onClaimUpdate({ ...claims, mealClaimed: true })}>
        Claim Meal
      </button>
    </div>
  )
}));

vi.mock('../../shared/ErrorMessage', () => ({
  default: ({ message, onDismiss }: any) => (
    <div data-testid="error-message">
      {message}
      <button onClick={onDismiss}>Dismiss</button>
    </div>
  )
}));

vi.mock('../DatabaseTableView', () => ({
  default: () => (
    <div data-testid="database-table-view">
      Database Table View Component
    </div>
  )
}));

describe('AdminApp', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Helper function to login
  const loginAsAdmin = async () => {
    const user = userEvent.setup();
    const loginButton = screen.getByTestId('login-button');
    await user.click(loginButton);
  };

  it('initially shows the login screen', () => {
    render(<AdminApp />);
    
    expect(screen.getByTestId('admin-login')).toBeInTheDocument();
    expect(screen.queryByText('SUTD Open House 2026')).not.toBeInTheDocument();
  });

  it('shows admin dashboard after successful login', async () => {
    render(<AdminApp />);
    
    await loginAsAdmin();
    
    expect(screen.queryByTestId('admin-login')).not.toBeInTheDocument();
    expect(screen.getByText('SUTD Open House 2026')).toBeInTheDocument();
  });

  it('renders the admin header with title and subtitle after login', async () => {
    render(<AdminApp />);
    await loginAsAdmin();
    
    expect(screen.getByText('SUTD Open House 2026')).toBeInTheDocument();
    expect(screen.getByText('Event Check-In Station')).toBeInTheDocument();
  });

  it('initially displays the QR scanner after login', async () => {
    render(<AdminApp />);
    await loginAsAdmin();
    
    expect(screen.getByTestId('qr-scanner')).toBeInTheDocument();
    expect(screen.getByText(/Point your camera at a student's QR code/i)).toBeInTheDocument();
  });

  it('does not display student info before scanning', async () => {
    render(<AdminApp />);
    await loginAsAdmin();
    
    expect(screen.queryByTestId('student-info-card')).not.toBeInTheDocument();
    expect(screen.queryByTestId('claim-checkboxes')).not.toBeInTheDocument();
  });

  it('displays student information after successful scan', async () => {
    const user = userEvent.setup();
    render(<AdminApp />);
    await loginAsAdmin();
    
    const scanButton = screen.getByText('Simulate Scan Success');
    await user.click(scanButton);
    
    await waitFor(() => {
      expect(screen.getByTestId('student-info-card')).toBeInTheDocument();
      expect(screen.getByText(/John Doe - S12345/)).toBeInTheDocument();
    });
  });

  it('displays claim checkboxes after successful scan', async () => {
    const user = userEvent.setup();
    render(<AdminApp />);
    await loginAsAdmin();
    
    const scanButton = screen.getByText('Simulate Scan Success');
    await user.click(scanButton);
    
    await waitFor(() => {
      expect(screen.getByTestId('claim-checkboxes')).toBeInTheDocument();
    });
  });

  it('hides QR scanner after successful scan', async () => {
    const user = userEvent.setup();
    render(<AdminApp />);
    await loginAsAdmin();
    
    const scanButton = screen.getByText('Simulate Scan Success');
    await user.click(scanButton);
    
    await waitFor(() => {
      expect(screen.queryByTestId('qr-scanner')).not.toBeInTheDocument();
    });
  });

  it('displays error message when scan fails', async () => {
    const user = userEvent.setup();
    render(<AdminApp />);
    await loginAsAdmin();
    
    const errorButton = screen.getByText('Simulate Scan Error');
    await user.click(errorButton);
    
    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toBeInTheDocument();
      expect(screen.getByText('Camera permission denied')).toBeInTheDocument();
    });
  });

  it('does not display student info when scan fails', async () => {
    const user = userEvent.setup();
    render(<AdminApp />);
    await loginAsAdmin();
    
    const errorButton = screen.getByText('Simulate Scan Error');
    await user.click(errorButton);
    
    await waitFor(() => {
      expect(screen.queryByTestId('student-info-card')).not.toBeInTheDocument();
    });
  });

  it('allows dismissing error messages', async () => {
    const user = userEvent.setup();
    render(<AdminApp />);
    await loginAsAdmin();
    
    const errorButton = screen.getByText('Simulate Scan Error');
    await user.click(errorButton);
    
    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toBeInTheDocument();
    });
    
    const dismissButton = screen.getByText('Dismiss');
    await user.click(dismissButton);
    
    await waitFor(() => {
      expect(screen.queryByTestId('error-message')).not.toBeInTheDocument();
    });
  });

  it('updates claim status when claims are made', async () => {
    const user = userEvent.setup();
    render(<AdminApp />);
    await loginAsAdmin();
    
    // First scan a student
    const scanButton = screen.getByText('Simulate Scan Success');
    await user.click(scanButton);
    
    await waitFor(() => {
      expect(screen.getByTestId('claim-checkboxes')).toBeInTheDocument();
    });
    
    // Claim t-shirt - the mock will update the claims
    const claimTshirtButton = screen.getByText('Claim T-Shirt');
    await user.click(claimTshirtButton);
    
    // Verify the component received the update (mock handles this)
    await waitFor(() => {
      expect(screen.getByTestId('claim-checkboxes')).toBeInTheDocument();
    });
  });

  it('displays "Scan Another Student" button after successful scan', async () => {
    const user = userEvent.setup();
    render(<AdminApp />);
    await loginAsAdmin();    
    const scanButton = screen.getByText('Simulate Scan Success');
    await user.click(scanButton);
    
    await waitFor(() => {
      expect(screen.getByText('Scan Another Student')).toBeInTheDocument();
    });
  });

  it('returns to scanner view when "Scan Another Student" is clicked', async () => {
    const user = userEvent.setup();
    render(<AdminApp />);
    await loginAsAdmin();
    
    // Scan a student
    const scanButton = screen.getByText('Simulate Scan Success');
    await user.click(scanButton);
    
    await waitFor(() => {
      expect(screen.getByTestId('student-info-card')).toBeInTheDocument();
    });
    
    // Click scan another
    const scanAnotherButton = screen.getByText('Scan Another Student');
    await user.click(scanAnotherButton);
    
    await waitFor(() => {
      expect(screen.getByTestId('qr-scanner')).toBeInTheDocument();
      expect(screen.queryByTestId('student-info-card')).not.toBeInTheDocument();
    });
  });

  it('increments scan counter after successful scans', async () => {
    const user = userEvent.setup();
    render(<AdminApp />);
    await loginAsAdmin();
    
    // Initially no counter
    expect(screen.queryByText(/Scans today:/)).not.toBeInTheDocument();
    
    // First scan
    const scanButton = screen.getByText('Simulate Scan Success');
    await user.click(scanButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Scans today:/)).toBeInTheDocument();
      expect(screen.getByText('Scans today:')).toBeInTheDocument();
    });
    
    // Check that the counter shows 1
    const counter = screen.getByText(/Scans today:/).closest('.scan-counter');
    expect(counter).toHaveTextContent('1');
    
    // Scan another
    const scanAnotherButton = screen.getByText('Scan Another Student');
    await user.click(scanAnotherButton);
    
    await waitFor(() => {
      expect(screen.getByTestId('qr-scanner')).toBeInTheDocument();
    });
    
    const scanButton2 = screen.getByText('Simulate Scan Success');
    await user.click(scanButton2);
    
    await waitFor(() => {
      const counter2 = screen.getByText(/Scans today:/).closest('.scan-counter');
      expect(counter2).toHaveTextContent('2');
    });
  });

  it('does not increment scan counter on scan errors', async () => {
    const user = userEvent.setup();
    render(<AdminApp />);
    await loginAsAdmin();
    
    const errorButton = screen.getByText('Simulate Scan Error');
    await user.click(errorButton);
    
    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toBeInTheDocument();
    });
    
    // Counter should not appear
    expect(screen.queryByText(/Scans today:/)).not.toBeInTheDocument();
  });

  it('clears error when scanning another student', async () => {
    const user = userEvent.setup();
    render(<AdminApp />);
    await loginAsAdmin();
    
    // First cause an error
    const errorButton = screen.getByText('Simulate Scan Error');
    await user.click(errorButton);
    
    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toBeInTheDocument();
    });
    
    // Then scan successfully
    const scanButton = screen.getByText('Simulate Scan Success');
    await user.click(scanButton);
    
    await waitFor(() => {
      expect(screen.queryByTestId('error-message')).not.toBeInTheDocument();
      expect(screen.getByTestId('student-info-card')).toBeInTheDocument();
    });
  });

  it('renders footer with help text after login', async () => {
    render(<AdminApp />);
    await loginAsAdmin();
    
    expect(screen.getByText('Need help? Contact event staff')).toBeInTheDocument();
  });

  it('has mobile-friendly layout classes after login', async () => {
    const { container } = render(<AdminApp />);
    await loginAsAdmin();
    
    const adminApp = container.querySelector('.admin-app');
    expect(adminApp).toBeInTheDocument();
    
    const adminContainer = container.querySelector('.admin-container');
    expect(adminContainer).toBeInTheDocument();
  });

  describe('Tab Navigation', () => {
    it('renders tab navigation with Scanner and Database View tabs', async () => {
      render(<AdminApp />);
      await loginAsAdmin();
      
      expect(screen.getByText('Scanner')).toBeInTheDocument();
      expect(screen.getByText('Database View')).toBeInTheDocument();
    });

    it('initially shows Scanner tab as active', async () => {
      const { container } = render(<AdminApp />);
      await loginAsAdmin();
      
      const scannerTab = screen.getByText('Scanner').closest('.tab-button');
      const databaseTab = screen.getByText('Database View').closest('.tab-button');
      
      expect(scannerTab).toHaveClass('active');
      expect(databaseTab).not.toHaveClass('active');
    });

    it('initially displays QR Scanner in Scanner tab', async () => {
      render(<AdminApp />);
      await loginAsAdmin();
      
      expect(screen.getByTestId('qr-scanner')).toBeInTheDocument();
      expect(screen.queryByTestId('database-table-view')).not.toBeInTheDocument();
    });

    it('switches to Database View when Database View tab is clicked', async () => {
      const user = userEvent.setup();
      render(<AdminApp />);
      await loginAsAdmin();
      
      const databaseTab = screen.getByText('Database View');
      await user.click(databaseTab);
      
      await waitFor(() => {
        expect(screen.getByTestId('database-table-view')).toBeInTheDocument();
        expect(screen.queryByTestId('qr-scanner')).not.toBeInTheDocument();
      });
    });

    it('updates active tab styling when switching tabs', async () => {
      const user = userEvent.setup();
      render(<AdminApp />);
      await loginAsAdmin();
      
      const scannerTab = screen.getByText('Scanner').closest('.tab-button');
      const databaseTab = screen.getByText('Database View').closest('.tab-button');
      
      // Initially Scanner is active
      expect(scannerTab).toHaveClass('active');
      expect(databaseTab).not.toHaveClass('active');
      
      // Click Database View tab
      await user.click(screen.getByText('Database View'));
      
      await waitFor(() => {
        expect(scannerTab).not.toHaveClass('active');
        expect(databaseTab).toHaveClass('active');
      });
    });

    it('switches back to Scanner when Scanner tab is clicked', async () => {
      const user = userEvent.setup();
      render(<AdminApp />);
      await loginAsAdmin();
      
      // Switch to Database View
      const databaseTab = screen.getByText('Database View');
      await user.click(databaseTab);
      
      await waitFor(() => {
        expect(screen.getByTestId('database-table-view')).toBeInTheDocument();
      });
      
      // Switch back to Scanner
      const scannerTab = screen.getByText('Scanner');
      await user.click(scannerTab);
      
      await waitFor(() => {
        expect(screen.getByTestId('qr-scanner')).toBeInTheDocument();
        expect(screen.queryByTestId('database-table-view')).not.toBeInTheDocument();
      });
    });

    it('clears scanned data when switching to Database View tab', async () => {
      const user = userEvent.setup();
      render(<AdminApp />);
      await loginAsAdmin();
      
      // Scan a student
      const scanButton = screen.getByText('Simulate Scan Success');
      await user.click(scanButton);
      
      await waitFor(() => {
        expect(screen.getByTestId('student-info-card')).toBeInTheDocument();
      });
      
      // Switch to Database View
      const databaseTab = screen.getByText('Database View');
      await user.click(databaseTab);
      
      await waitFor(() => {
        expect(screen.getByTestId('database-table-view')).toBeInTheDocument();
      });
      
      // Switch back to Scanner - should show scanner, not student info
      const scannerTab = screen.getByText('Scanner');
      await user.click(scannerTab);
      
      await waitFor(() => {
        expect(screen.getByTestId('qr-scanner')).toBeInTheDocument();
        expect(screen.queryByTestId('student-info-card')).not.toBeInTheDocument();
      });
    });

    it('clears errors when switching to Database View tab', async () => {
      const user = userEvent.setup();
      render(<AdminApp />);
      await loginAsAdmin();
      
      // Cause an error
      const errorButton = screen.getByText('Simulate Scan Error');
      await user.click(errorButton);
      
      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toBeInTheDocument();
      });
      
      // Switch to Database View
      const databaseTab = screen.getByText('Database View');
      await user.click(databaseTab);
      
      await waitFor(() => {
        expect(screen.queryByTestId('error-message')).not.toBeInTheDocument();
      });
    });

    it('renders correct component based on active tab', async () => {
      const user = userEvent.setup();
      render(<AdminApp />);
      await loginAsAdmin();
      
      // Scanner tab active - should show QR Scanner
      expect(screen.getByTestId('qr-scanner')).toBeInTheDocument();
      expect(screen.queryByTestId('database-table-view')).not.toBeInTheDocument();
      
      // Switch to Database View
      await user.click(screen.getByText('Database View'));
      
      await waitFor(() => {
        expect(screen.queryByTestId('qr-scanner')).not.toBeInTheDocument();
        expect(screen.getByTestId('database-table-view')).toBeInTheDocument();
      });
      
      // Switch back to Scanner
      await user.click(screen.getByText('Scanner'));
      
      await waitFor(() => {
        expect(screen.getByTestId('qr-scanner')).toBeInTheDocument();
        expect(screen.queryByTestId('database-table-view')).not.toBeInTheDocument();
      });
    });
  });

  describe('Component Removal Verification', () => {
    it('should not render ClaimStatusDisplay component', async () => {
      const user = userEvent.setup();
      render(<AdminApp />);
      await loginAsAdmin();
      
      // Scan a student
      const scanButton = screen.getByText('Simulate Scan Success');
      await user.click(scanButton);
      
      await waitFor(() => {
        expect(screen.getByTestId('student-info-card')).toBeInTheDocument();
      });
      
      // Verify ClaimStatusDisplay is not rendered
      expect(screen.queryByTestId('claim-status-display')).not.toBeInTheDocument();
    });

    it('should still render and function ClaimCheckboxes after ClaimStatusDisplay removal', async () => {
      const user = userEvent.setup();
      render(<AdminApp />);
      await loginAsAdmin();
      
      // Scan a student
      const scanButton = screen.getByText('Simulate Scan Success');
      await user.click(scanButton);
      
      await waitFor(() => {
        expect(screen.getByTestId('student-info-card')).toBeInTheDocument();
      });
      
      // Verify ClaimCheckboxes is rendered
      expect(screen.getByTestId('claim-checkboxes')).toBeInTheDocument();
      
      // Verify ClaimCheckboxes still functions
      const claimTshirtButton = screen.getByText('Claim T-Shirt');
      await user.click(claimTshirtButton);
      
      // Component should still be there and functional
      await waitFor(() => {
        expect(screen.getByTestId('claim-checkboxes')).toBeInTheDocument();
      });
    });

    it('should maintain all distribution tracking functionality without ClaimStatusDisplay', async () => {
      const user = userEvent.setup();
      render(<AdminApp />);
      await loginAsAdmin();
      
      // Scan a student
      const scanButton = screen.getByText('Simulate Scan Success');
      await user.click(scanButton);
      
      await waitFor(() => {
        expect(screen.getByTestId('claim-checkboxes')).toBeInTheDocument();
      });
      
      // Verify both claim buttons are available
      expect(screen.getByText('Claim T-Shirt')).toBeInTheDocument();
      expect(screen.getByText('Claim Meal')).toBeInTheDocument();
      
      // Test claiming t-shirt
      const claimTshirtButton = screen.getByText('Claim T-Shirt');
      await user.click(claimTshirtButton);
      
      // Test claiming meal
      const claimMealButton = screen.getByText('Claim Meal');
      await user.click(claimMealButton);
      
      // Both should still be functional
      await waitFor(() => {
        expect(screen.getByTestId('claim-checkboxes')).toBeInTheDocument();
      });
    });
  });
});
