import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import PDPAConsent from '../PDPAConsent';
import * as api from '../../../services/api';

// Mock the API module
vi.mock('../../../services/api', () => ({
  apiPost: vi.fn(),
  getErrorMessage: vi.fn((err) => err.message || 'An error occurred')
}));

describe('PDPAConsent', () => {
  const mockOnConsentGiven = vi.fn();
  const mockOnBack = vi.fn();
  const testStudentId = 'TEST123';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders checkbox with correct consent text', () => {
    render(
      <PDPAConsent 
        studentId={testStudentId}
        onConsentGiven={mockOnConsentGiven}
      />
    );
    
    expect(screen.getByRole('checkbox')).toBeInTheDocument();
    expect(screen.getByText(/I consent to my information being used properly and it will be properly disposed after the event/i)).toBeInTheDocument();
  });

  it('renders privacy consent heading', () => {
    render(
      <PDPAConsent 
        studentId={testStudentId}
        onConsentGiven={mockOnConsentGiven}
      />
    );
    
    expect(screen.getByRole('heading', { name: /privacy consent/i })).toBeInTheDocument();
  });

  it('checkbox is initially unchecked', () => {
    render(
      <PDPAConsent 
        studentId={testStudentId}
        onConsentGiven={mockOnConsentGiven}
      />
    );
    
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).not.toBeChecked();
  });

  it('calls API and emits event when checkbox is checked', async () => {
    const mockApiPost = vi.mocked(api.apiPost);
    mockApiPost.mockResolvedValue({ success: true, message: 'Consent recorded' });

    render(
      <PDPAConsent 
        studentId={testStudentId}
        onConsentGiven={mockOnConsentGiven}
      />
    );
    
    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);
    
    // Checkbox should be checked immediately
    expect(checkbox).toBeChecked();
    
    // API should be called with correct parameters
    await waitFor(() => {
      expect(mockApiPost).toHaveBeenCalledWith('/api/consent', {
        studentId: testStudentId,
        consented: true
      });
    });
    
    // Event should be emitted after successful API call
    await waitFor(() => {
      expect(mockOnConsentGiven).toHaveBeenCalled();
    });
  });

  it('shows submitting message while API call is in progress', async () => {
    const mockApiPost = vi.mocked(api.apiPost);
    // Create a promise that we can control
    let resolvePromise: (value: any) => void;
    const promise = new Promise((resolve) => {
      resolvePromise = resolve;
    });
    mockApiPost.mockReturnValue(promise as any);

    render(
      <PDPAConsent 
        studentId={testStudentId}
        onConsentGiven={mockOnConsentGiven}
      />
    );
    
    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);
    
    // Should show submitting message
    await waitFor(() => {
      expect(screen.getByText(/recording consent/i)).toBeInTheDocument();
    });
    
    // Checkbox should be disabled during submission
    expect(checkbox).toBeDisabled();
    
    // Resolve the promise
    resolvePromise!({ success: true, message: 'Consent recorded' });
    
    // Wait for submission to complete
    await waitFor(() => {
      expect(screen.queryByText(/recording consent/i)).not.toBeInTheDocument();
    });
  });

  it('displays error message when API call fails', async () => {
    const mockApiPost = vi.mocked(api.apiPost);
    const mockGetErrorMessage = vi.mocked(api.getErrorMessage);
    const errorMessage = 'Network error occurred';
    
    mockApiPost.mockRejectedValue(new Error(errorMessage));
    mockGetErrorMessage.mockReturnValue(errorMessage);

    render(
      <PDPAConsent 
        studentId={testStudentId}
        onConsentGiven={mockOnConsentGiven}
      />
    );
    
    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);
    
    // Wait for error to appear
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
    
    // Checkbox should be unchecked after error
    expect(checkbox).not.toBeChecked();
    
    // Event should not be emitted
    expect(mockOnConsentGiven).not.toHaveBeenCalled();
  });

  it('unchecks checkbox when API call fails', async () => {
    const mockApiPost = vi.mocked(api.apiPost);
    mockApiPost.mockRejectedValue(new Error('API Error'));

    render(
      <PDPAConsent 
        studentId={testStudentId}
        onConsentGiven={mockOnConsentGiven}
      />
    );
    
    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);
    
    // Initially checked
    expect(checkbox).toBeChecked();
    
    // Wait for API call to fail and checkbox to be unchecked
    await waitFor(() => {
      expect(checkbox).not.toBeChecked();
    });
  });

  it('renders back button when onBack prop is provided', () => {
    render(
      <PDPAConsent 
        studentId={testStudentId}
        onConsentGiven={mockOnConsentGiven}
        onBack={mockOnBack}
      />
    );
    
    const backButton = screen.getByRole('button', { name: /back/i });
    expect(backButton).toBeInTheDocument();
  });

  it('does not render back button when onBack prop is not provided', () => {
    render(
      <PDPAConsent 
        studentId={testStudentId}
        onConsentGiven={mockOnConsentGiven}
      />
    );
    
    const backButton = screen.queryByRole('button', { name: /back/i });
    expect(backButton).not.toBeInTheDocument();
  });

  it('calls onBack when back button is clicked', () => {
    render(
      <PDPAConsent 
        studentId={testStudentId}
        onConsentGiven={mockOnConsentGiven}
        onBack={mockOnBack}
      />
    );
    
    const backButton = screen.getByRole('button', { name: /back/i });
    fireEvent.click(backButton);
    
    expect(mockOnBack).toHaveBeenCalled();
  });

  it('disables back button while submitting', async () => {
    const mockApiPost = vi.mocked(api.apiPost);
    // Create a promise that we can control
    let resolvePromise: (value: any) => void;
    const promise = new Promise((resolve) => {
      resolvePromise = resolve;
    });
    mockApiPost.mockReturnValue(promise as any);

    render(
      <PDPAConsent 
        studentId={testStudentId}
        onConsentGiven={mockOnConsentGiven}
        onBack={mockOnBack}
      />
    );
    
    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);
    
    // Back button should be disabled during submission
    await waitFor(() => {
      const backButton = screen.getByRole('button', { name: /back/i });
      expect(backButton).toBeDisabled();
    });
    
    // Resolve the promise
    resolvePromise!({ success: true, message: 'Consent recorded' });
  });

  it('clears error when checkbox is checked again after failure', async () => {
    const mockApiPost = vi.mocked(api.apiPost);
    const mockGetErrorMessage = vi.mocked(api.getErrorMessage);
    
    // First call fails
    mockApiPost.mockRejectedValueOnce(new Error('Network error'));
    mockGetErrorMessage.mockReturnValue('Network error');
    
    // Second call succeeds
    mockApiPost.mockResolvedValueOnce({ success: true, message: 'Consent recorded' });

    render(
      <PDPAConsent 
        studentId={testStudentId}
        onConsentGiven={mockOnConsentGiven}
      />
    );
    
    const checkbox = screen.getByRole('checkbox');
    
    // First attempt - fails
    fireEvent.click(checkbox);
    
    await waitFor(() => {
      expect(screen.getByText(/network error/i)).toBeInTheDocument();
    });
    
    // Second attempt - succeeds
    fireEvent.click(checkbox);
    
    // Error should be cleared
    await waitFor(() => {
      expect(screen.queryByText(/network error/i)).not.toBeInTheDocument();
    });
  });

  it('does not call API when checkbox is unchecked', () => {
    const mockApiPost = vi.mocked(api.apiPost);

    render(
      <PDPAConsent 
        studentId={testStudentId}
        onConsentGiven={mockOnConsentGiven}
      />
    );
    
    const checkbox = screen.getByRole('checkbox');
    
    // Check the checkbox
    fireEvent.click(checkbox);
    
    // Clear the mock
    mockApiPost.mockClear();
    
    // Uncheck the checkbox (though this won't happen in normal flow since it auto-proceeds)
    fireEvent.click(checkbox);
    
    // API should not be called for unchecking
    expect(mockApiPost).not.toHaveBeenCalled();
  });
});
