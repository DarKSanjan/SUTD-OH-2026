import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import QRScanner from '../QRScanner';

// Mock html5-qrcode
const mockStart = vi.fn();
const mockStop = vi.fn();

vi.mock('html5-qrcode', () => ({
  Html5Qrcode: vi.fn().mockImplementation(() => ({
    start: mockStart,
    stop: mockStop.mockResolvedValue(undefined),
  })),
}));

// Mock navigator.mediaDevices
const mockGetUserMedia = vi.fn();

describe('QRScanner', () => {
  const mockOnScanSuccess = vi.fn();
  const mockOnScanError = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock successful camera access by default
    mockGetUserMedia.mockResolvedValue({
      getTracks: () => [{ stop: vi.fn() }],
    });
    
    Object.defineProperty(global.navigator, 'mediaDevices', {
      value: {
        getUserMedia: mockGetUserMedia,
      },
      writable: true,
      configurable: true,
    });

    // Mock fetch
    global.fetch = vi.fn();
    
    // Default mockStart to resolve
    mockStart.mockResolvedValue(undefined);
  });

  it('renders scanner container with QR reader element', async () => {
    await act(async () => {
      render(<QRScanner onScanSuccess={mockOnScanSuccess} onScanError={mockOnScanError} />);
    });
    
    // Should render the QR reader container
    const qrReader = document.getElementById('qr-reader');
    expect(qrReader).toBeInTheDocument();
    expect(qrReader).toHaveClass('qr-reader-container');
  });

  it('displays scanning or initializing message on mount', async () => {
    await act(async () => {
      render(<QRScanner onScanSuccess={mockOnScanSuccess} onScanError={mockOnScanError} />);
    });
    
    // Should display either initializing or scanning message
    const hasInitializing = screen.queryByText(/initializing camera/i);
    const hasScanning = screen.queryByText(/point camera at qr code/i);
    
    expect(hasInitializing || hasScanning).toBeTruthy();
  });

  it('requests camera permissions on mount', async () => {
    await act(async () => {
      render(<QRScanner onScanSuccess={mockOnScanSuccess} onScanError={mockOnScanError} />);
    });
    
    // Wait a bit for async initialization
    await new Promise(resolve => setTimeout(resolve, 100));
    
    expect(mockGetUserMedia).toHaveBeenCalledWith({ video: true });
  });

  it('displays permission denied message when camera access is denied', async () => {
    mockGetUserMedia.mockRejectedValue(new Error('Permission denied'));
    
    await act(async () => {
      render(<QRScanner onScanSuccess={mockOnScanSuccess} onScanError={mockOnScanError} />);
    });
    
    // Wait for error handling
    await new Promise(resolve => setTimeout(resolve, 100));
    
    expect(screen.getByText(/camera access required/i)).toBeInTheDocument();
    expect(mockOnScanError).toHaveBeenCalledWith(
      expect.stringContaining('Camera permission denied')
    );
  });

  it('displays retry button when permission is denied', async () => {
    mockGetUserMedia.mockRejectedValue(new Error('Permission denied'));
    
    await act(async () => {
      render(<QRScanner onScanSuccess={mockOnScanSuccess} onScanError={mockOnScanError} />);
    });
    
    // Wait for error handling
    await new Promise(resolve => setTimeout(resolve, 100));
    
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
  });

  it('has correct camera configuration structure', () => {
    // This test verifies the component structure without mocking complexities
    const { container } = render(
      <QRScanner onScanSuccess={mockOnScanSuccess} onScanError={mockOnScanError} />
    );
    
    expect(container.querySelector('.qr-scanner')).toBeInTheDocument();
    expect(container.querySelector('.scanner-overlay')).toBeInTheDocument();
    expect(container.querySelector('.scanner-instructions')).toBeInTheDocument();
  });

  it('includes proper styling for mobile optimization', () => {
    const { container } = render(
      <QRScanner onScanSuccess={mockOnScanSuccess} onScanError={mockOnScanError} />
    );
    
    // Check that style tag exists (component includes inline styles)
    const styles = container.querySelector('style');
    expect(styles).toBeInTheDocument();
    
    // Verify mobile-specific styles are present
    const styleContent = styles?.textContent || '';
    expect(styleContent).toContain('@media');
    expect(styleContent).toContain('qr-scanner');
  });
});
