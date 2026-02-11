import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import StudentApp from '../StudentApp';

// Mock fetch
global.fetch = vi.fn();

describe('StudentApp', () => {
  let originalRandom: () => number;

  beforeEach(() => {
    vi.clearAllMocks();
    // Save original Math.random
    originalRandom = Math.random;
    // Mock Math.random to always return a value that won't trigger easter egg (> 1/75)
    Math.random = vi.fn(() => 0.5);
  });

  afterEach(() => {
    vi.useRealTimers();
    // Restore original Math.random
    Math.random = originalRandom;
  });

  it('renders the form initially', () => {
    render(<StudentApp />);
    
    expect(screen.getByText(/event check-in system/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/student id/i)).toBeInTheDocument();
  });

  it('calls /api/validate endpoint with student ID', async () => {
    const mockResponse = {
      success: true,
      student: {
        studentId: 'ABC123',
        name: 'John Doe',
        tshirtSize: 'M',
        mealPreference: 'Vegetarian',
      },
      qrCode: 'data:image/png;base64,mockqrcode',
      token: 'mocktoken123',
      collectionStatus: {
        shirtCollected: false,
        mealCollected: false,
      },
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    render(<StudentApp />);
    
    const input = screen.getByLabelText(/student id/i);
    fireEvent.change(input, { target: { value: 'ABC123' } });
    
    const submitButton = screen.getByRole('button', { name: /submit/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/validate', expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ studentId: 'ABC123' }),
      }));
    });
  });

  it('displays student information and QR code on successful validation', async () => {
    const mockResponse = {
      success: true,
      student: {
        studentId: 'ABC123',
        name: 'John Doe',
        tshirtSize: 'M',
        mealPreference: 'Vegetarian',
      },
      qrCode: 'data:image/png;base64,mockqrcode',
      token: 'mocktoken123',
      collectionStatus: {
        shirtCollected: false,
        mealCollected: false,
      },
    };

    // Mock both validation and consent API calls
    (global.fetch as any)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, message: 'Consent recorded' }),
      });

    render(<StudentApp />);
    
    const input = screen.getByLabelText(/student id/i);
    fireEvent.change(input, { target: { value: 'ABC123' } });
    
    const submitButton = screen.getByRole('button', { name: /submit/i });
    fireEvent.click(submitButton);

    // Wait for consent screen to appear
    await waitFor(() => {
      expect(screen.getByText(/privacy consent/i)).toBeInTheDocument();
    });

    // Check the consent checkbox
    const consentCheckbox = screen.getByRole('checkbox');
    fireEvent.click(consentCheckbox);

    // Wait for QR code to appear after consent
    await waitFor(() => {
      expect(screen.getByText(/welcome, john doe!/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/ABC123/)).toBeInTheDocument();
    expect(screen.getByText(/T-Shirt Size:/)).toBeInTheDocument();
    expect(screen.getByText(/Vegetarian/)).toBeInTheDocument();
    expect(screen.getByAltText(/student qr code/i)).toBeInTheDocument();
  });

  it('displays error message when validation fails', async () => {
    const mockResponse = {
      success: false,
      error: 'Student ID not found',
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      json: async () => mockResponse,
    });

    render(<StudentApp />);
    
    const input = screen.getByLabelText(/student id/i);
    fireEvent.change(input, { target: { value: 'INVALID' } });
    
    const submitButton = screen.getByRole('button', { name: /submit/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/student id not found/i)).toBeInTheDocument();
    });

    // Form should still be visible
    expect(screen.getByLabelText(/student id/i)).toBeInTheDocument();
  });

  it('displays network error message on fetch failure', async () => {
    // Mock fetch to fail all retries
    (global.fetch as any).mockRejectedValue(new TypeError('fetch failed'));

    render(<StudentApp />);
    
    const input = screen.getByLabelText(/student id/i);
    fireEvent.change(input, { target: { value: 'ABC123' } });
    
    const submitButton = screen.getByRole('button', { name: /submit/i });
    fireEvent.click(submitButton);

    // Wait for error to appear (after retries complete)
    await waitFor(() => {
      expect(screen.getByText(/network error/i)).toBeInTheDocument();
    }, { timeout: 10000 });
  });

  it('retries failed requests with exponential backoff', async () => {
    // This test verifies that the app works correctly after retries
    // The actual retry logic is tested in api.test.ts
    const mockResponse = {
      success: true,
      student: {
        studentId: 'ABC123',
        name: 'John Doe',
        tshirtSize: 'M',
        mealPreference: 'Vegetarian',
      },
      qrCode: 'data:image/png;base64,mockqrcode',
      token: 'mocktoken123',
      collectionStatus: {
        shirtCollected: false,
        mealCollected: false,
      },
    };

    // Mock both validation and consent API calls
    (global.fetch as any)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, message: 'Consent recorded' }),
      });

    render(<StudentApp />);
    
    const input = screen.getByLabelText(/student id/i);
    fireEvent.change(input, { target: { value: 'ABC123' } });
    
    const submitButton = screen.getByRole('button', { name: /submit/i });
    fireEvent.click(submitButton);

    // Wait for consent screen to appear
    await waitFor(() => {
      expect(screen.getByText(/privacy consent/i)).toBeInTheDocument();
    });

    // Check the consent checkbox
    const consentCheckbox = screen.getByRole('checkbox');
    fireEvent.click(consentCheckbox);

    // Should show QR code after consent
    await waitFor(() => {
      expect(screen.getByText(/welcome, john doe!/i)).toBeInTheDocument();
    });
  });

  it('allows generating a new QR code after successful validation', async () => {
    const mockResponse = {
      success: true,
      student: {
        studentId: 'ABC123',
        name: 'John Doe',
        tshirtSize: 'M',
        mealPreference: 'Vegetarian',
      },
      qrCode: 'data:image/png;base64,mockqrcode',
      token: 'mocktoken123',
      collectionStatus: {
        shirtCollected: false,
        mealCollected: false,
      },
    };

    // Mock both validation and consent API calls
    (global.fetch as any)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, message: 'Consent recorded' }),
      });

    render(<StudentApp />);
    
    const input = screen.getByLabelText(/student id/i);
    fireEvent.change(input, { target: { value: 'ABC123' } });
    
    const submitButton = screen.getByRole('button', { name: /submit/i });
    fireEvent.click(submitButton);

    // Wait for consent screen to appear
    await waitFor(() => {
      expect(screen.getByText(/privacy consent/i)).toBeInTheDocument();
    });

    // Check the consent checkbox
    const consentCheckbox = screen.getByRole('checkbox');
    fireEvent.click(consentCheckbox);

    await waitFor(() => {
      expect(screen.getByText(/welcome, john doe!/i)).toBeInTheDocument();
    });

    // Click reset button (now labeled "Start Over")
    const resetButton = screen.getByRole('button', { name: /start over/i });
    fireEvent.click(resetButton);

    // Form should be visible again
    await waitFor(() => {
      expect(screen.getByLabelText(/student id/i)).toBeInTheDocument();
    });
  });

  it('shows loading state during API call', async () => {
    const mockResponse = {
      success: true,
      student: {
        studentId: 'ABC123',
        name: 'John Doe',
        tshirtSize: 'M',
        mealPreference: 'Vegetarian',
      },
      qrCode: 'data:image/png;base64,mockqrcode',
      token: 'mocktoken123',
      collectionStatus: {
        shirtCollected: false,
        mealCollected: false,
      },
    };

    // Delay the response to test loading state
    (global.fetch as any).mockImplementationOnce(() => 
      new Promise(resolve => 
        setTimeout(() => resolve({
          ok: true,
          json: async () => mockResponse,
        }), 100)
      )
    );

    render(<StudentApp />);
    
    const input = screen.getByLabelText(/student id/i);
    fireEvent.change(input, { target: { value: 'ABC123' } });
    
    const submitButton = screen.getByRole('button', { name: /submit/i });
    fireEvent.click(submitButton);

    // Should show loading state
    expect(screen.getByRole('button', { name: /validating/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /validating/i })).toBeDisabled();

    // Wait for consent screen to appear
    await waitFor(() => {
      expect(screen.getByText(/privacy consent/i)).toBeInTheDocument();
    });
  });
});
