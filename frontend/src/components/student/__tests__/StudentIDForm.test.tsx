import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import StudentIDForm from '../StudentIDForm';

describe('StudentIDForm', () => {
  it('renders input field and submit button', () => {
    const mockOnSubmit = vi.fn();
    render(<StudentIDForm onSubmit={mockOnSubmit} />);
    
    expect(screen.getByLabelText(/student id/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
  });

  it('shows validation error when submitting empty input', async () => {
    const mockOnSubmit = vi.fn();
    render(<StudentIDForm onSubmit={mockOnSubmit} />);
    
    const submitButton = screen.getByRole('button', { name: /submit/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/student id is required/i)).toBeInTheDocument();
    });
    
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('shows validation error when submitting whitespace-only input', async () => {
    const mockOnSubmit = vi.fn();
    render(<StudentIDForm onSubmit={mockOnSubmit} />);
    
    const input = screen.getByLabelText(/student id/i);
    fireEvent.change(input, { target: { value: '   ' } });
    
    const submitButton = screen.getByRole('button', { name: /submit/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/student id is required/i)).toBeInTheDocument();
    });
    
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('trims input and calls onSubmit with valid student ID', async () => {
    const mockOnSubmit = vi.fn().mockResolvedValue(undefined);
    render(<StudentIDForm onSubmit={mockOnSubmit} />);
    
    const input = screen.getByLabelText(/student id/i);
    fireEvent.change(input, { target: { value: '  ABC123  ' } });
    
    const submitButton = screen.getByRole('button', { name: /submit/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith('ABC123');
    });
  });

  it('displays loading state when isLoading is true', () => {
    const mockOnSubmit = vi.fn();
    render(<StudentIDForm onSubmit={mockOnSubmit} isLoading={true} />);
    
    const submitButton = screen.getByRole('button', { name: /validating/i });
    expect(submitButton).toBeDisabled();
    
    const input = screen.getByLabelText(/student id/i);
    expect(input).toBeDisabled();
  });

  it('displays error message from props', () => {
    const mockOnSubmit = vi.fn();
    const errorMessage = 'Student ID not found';
    render(<StudentIDForm onSubmit={mockOnSubmit} error={errorMessage} />);
    
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('clears validation error when user starts typing', async () => {
    const mockOnSubmit = vi.fn();
    render(<StudentIDForm onSubmit={mockOnSubmit} />);
    
    // Submit empty form to trigger validation error
    const submitButton = screen.getByRole('button', { name: /submit/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/student id is required/i)).toBeInTheDocument();
    });
    
    // Start typing
    const input = screen.getByLabelText(/student id/i);
    fireEvent.change(input, { target: { value: 'A' } });
    
    // Validation error should be cleared
    expect(screen.queryByText(/student id is required/i)).not.toBeInTheDocument();
  });

  it('prevents form submission when loading', async () => {
    const mockOnSubmit = vi.fn();
    render(<StudentIDForm onSubmit={mockOnSubmit} isLoading={true} />);
    
    const submitButton = screen.getByRole('button', { name: /validating/i });
    fireEvent.click(submitButton);
    
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('handles form submission with Enter key', async () => {
    const mockOnSubmit = vi.fn().mockResolvedValue(undefined);
    render(<StudentIDForm onSubmit={mockOnSubmit} />);
    
    const input = screen.getByLabelText(/student id/i);
    fireEvent.change(input, { target: { value: 'TEST123' } });
    fireEvent.submit(input.closest('form')!);
    
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith('TEST123');
    });
  });
});
