import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import StudentApp from '../StudentApp';

// Mock fetch
global.fetch = vi.fn();

describe('StudentApp', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
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
      expect(global.fetch).toHaveBeenCalledWith('/api/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ studentId: 'ABC123' }),
      });
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
    // Mock fetch to fail twice, then succeed
    let callCount = 0;
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
    };

    (global.fetch as any).mockImplementation(() => {
      callCount++;
      if (callCount < 3) {
        return Promise.reject(new Error('Network error'));
      }
      return Promise.resolve({
        ok: true,
        json: async () => mockResponse,
      });
    });

    render(<StudentApp />);
    
    const input = screen.getByLabelText(/student id/i);
    fireEvent.change(input, { target: { value: 'ABC123' } });
    
    const submitButton = screen.getByRole('button', { name: /submit/i });
    fireEvent.click(submitButton);

    // Should eventually succeed after retries
    await waitFor(() => {
      expect(screen.getByText(/welcome, john doe!/i)).toBeInTheDocument();
    }, { timeout: 15000 });

    // Verify fetch was called multiple times (initial + retries)
    expect(callCount).toBeGreaterThan(1);
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
      expect(screen.getByText(/welcome, john doe!/i)).toBeInTheDocument();
    });

    // Click reset button
    const resetButton = screen.getByRole('button', { name: /generate new qr code/i });
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

    // Wait for completion
    await waitFor(() => {
      expect(screen.getByText(/welcome, john doe!/i)).toBeInTheDocument();
    });
  });
});
