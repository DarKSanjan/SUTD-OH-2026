import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AdminApp from '../AdminApp';

// Mock the child components
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

vi.mock('../ClaimStatusDisplay', () => ({
  default: ({ claims }: any) => (
    <div data-testid="claim-status-display">
      T-Shirt: {claims.tshirtClaimed ? 'Claimed' : 'Available'}
      Meal: {claims.mealClaimed ? 'Claimed' : 'Available'}
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

describe('AdminApp', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the admin header with title and subtitle', () => {
    render(<AdminApp />);
    
    expect(screen.getByText('Event Check-In')).toBeInTheDocument();
    expect(screen.getByText('Open House 2026')).toBeInTheDocument();
  });

  it('initially displays the QR scanner', () => {
    render(<AdminApp />);
    
    expect(screen.getByTestId('qr-scanner')).toBeInTheDocument();
    expect(screen.getByText(/Point your camera at a student's QR code/i)).toBeInTheDocument();
  });

  it('does not display student info before scanning', () => {
    render(<AdminApp />);
    
    expect(screen.queryByTestId('student-info-card')).not.toBeInTheDocument();
    expect(screen.queryByTestId('claim-status-display')).not.toBeInTheDocument();
    expect(screen.queryByTestId('claim-checkboxes')).not.toBeInTheDocument();
  });

  it('displays student information after successful scan', async () => {
    const user = userEvent.setup();
    render(<AdminApp />);
    
    const scanButton = screen.getByText('Simulate Scan Success');
    await user.click(scanButton);
    
    await waitFor(() => {
      expect(screen.getByTestId('student-info-card')).toBeInTheDocument();
      expect(screen.getByText(/John Doe - S12345/)).toBeInTheDocument();
    });
  });

  it('displays claim status and checkboxes after successful scan', async () => {
    const user = userEvent.setup();
    render(<AdminApp />);
    
    const scanButton = screen.getByText('Simulate Scan Success');
    await user.click(scanButton);
    
    await waitFor(() => {
      expect(screen.getByTestId('claim-status-display')).toBeInTheDocument();
      expect(screen.getByTestId('claim-checkboxes')).toBeInTheDocument();
    });
  });

  it('hides QR scanner after successful scan', async () => {
    const user = userEvent.setup();
    render(<AdminApp />);
    
    const scanButton = screen.getByText('Simulate Scan Success');
    await user.click(scanButton);
    
    await waitFor(() => {
      expect(screen.queryByTestId('qr-scanner')).not.toBeInTheDocument();
    });
  });

  it('displays error message when scan fails', async () => {
    const user = userEvent.setup();
    render(<AdminApp />);
    
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
    
    const errorButton = screen.getByText('Simulate Scan Error');
    await user.click(errorButton);
    
    await waitFor(() => {
      expect(screen.queryByTestId('student-info-card')).not.toBeInTheDocument();
    });
  });

  it('allows dismissing error messages', async () => {
    const user = userEvent.setup();
    render(<AdminApp />);
    
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
    
    // First scan a student
    const scanButton = screen.getByText('Simulate Scan Success');
    await user.click(scanButton);
    
    await waitFor(() => {
      expect(screen.getByTestId('claim-status-display')).toBeInTheDocument();
    });
    
    // Claim t-shirt
    const claimTshirtButton = screen.getByText('Claim T-Shirt');
    await user.click(claimTshirtButton);
    
    await waitFor(() => {
      expect(screen.getByText(/T-Shirt: Claimed/)).toBeInTheDocument();
    });
  });

  it('displays "Scan Another Student" button after successful scan', async () => {
    const user = userEvent.setup();
    render(<AdminApp />);
    
    const scanButton = screen.getByText('Simulate Scan Success');
    await user.click(scanButton);
    
    await waitFor(() => {
      expect(screen.getByText('Scan Another Student')).toBeInTheDocument();
    });
  });

  it('returns to scanner view when "Scan Another Student" is clicked', async () => {
    const user = userEvent.setup();
    render(<AdminApp />);
    
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

  it('renders footer with help text', () => {
    render(<AdminApp />);
    
    expect(screen.getByText('Need help? Contact event staff')).toBeInTheDocument();
  });

  it('has mobile-friendly layout classes', () => {
    const { container } = render(<AdminApp />);
    
    const adminApp = container.querySelector('.admin-app');
    expect(adminApp).toBeInTheDocument();
    
    const adminContainer = container.querySelector('.admin-container');
    expect(adminContainer).toBeInTheDocument();
  });
});
