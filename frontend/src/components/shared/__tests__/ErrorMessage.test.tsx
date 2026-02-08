import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ErrorMessage from '../ErrorMessage';

describe('ErrorMessage', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders error message when message is provided', () => {
    render(<ErrorMessage message="Test error message" />);
    
    expect(screen.getByText('Test error message')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('does not render when message is null', () => {
    const { container } = render(<ErrorMessage message={null} />);
    
    expect(container.firstChild).toBeNull();
  });

  it('does not render when message is empty string', () => {
    const { container } = render(<ErrorMessage message="" />);
    
    expect(container.firstChild).toBeNull();
  });

  it('displays error icon', () => {
    render(<ErrorMessage message="Error occurred" />);
    
    expect(screen.getByText('⚠')).toBeInTheDocument();
  });

  it('renders dismiss button when onDismiss is provided', () => {
    const mockOnDismiss = vi.fn();
    render(<ErrorMessage message="Error" onDismiss={mockOnDismiss} />);
    
    const dismissButton = screen.getByRole('button', { name: /dismiss error/i });
    expect(dismissButton).toBeInTheDocument();
  });

  it('does not render dismiss button when onDismiss is not provided', () => {
    render(<ErrorMessage message="Error" />);
    
    const dismissButton = screen.queryByRole('button', { name: /dismiss error/i });
    expect(dismissButton).not.toBeInTheDocument();
  });

  it('calls onDismiss when dismiss button is clicked', () => {
    const mockOnDismiss = vi.fn();
    render(<ErrorMessage message="Error" onDismiss={mockOnDismiss} />);
    
    const dismissButton = screen.getByRole('button', { name: /dismiss error/i });
    fireEvent.click(dismissButton);
    
    expect(mockOnDismiss).toHaveBeenCalledTimes(1);
  });

  it('auto-dismisses after specified delay when autoDismiss is true', () => {
    const mockOnDismiss = vi.fn();
    render(
      <ErrorMessage 
        message="Error" 
        onDismiss={mockOnDismiss} 
        autoDismiss={true}
        autoDismissDelay={3000}
      />
    );
    
    expect(mockOnDismiss).not.toHaveBeenCalled();
    
    // Fast-forward time by 3000ms
    vi.advanceTimersByTime(3000);
    
    expect(mockOnDismiss).toHaveBeenCalledTimes(1);
  });

  it('uses default auto-dismiss delay of 5000ms when not specified', () => {
    const mockOnDismiss = vi.fn();
    render(
      <ErrorMessage 
        message="Error" 
        onDismiss={mockOnDismiss} 
        autoDismiss={true}
      />
    );
    
    // Fast-forward by 4999ms - should not dismiss yet
    vi.advanceTimersByTime(4999);
    expect(mockOnDismiss).not.toHaveBeenCalled();
    
    // Fast-forward by 1ms more - should dismiss
    vi.advanceTimersByTime(1);
    expect(mockOnDismiss).toHaveBeenCalledTimes(1);
  });

  it('does not auto-dismiss when autoDismiss is false', () => {
    const mockOnDismiss = vi.fn();
    render(
      <ErrorMessage 
        message="Error" 
        onDismiss={mockOnDismiss} 
        autoDismiss={false}
        autoDismissDelay={1000}
      />
    );
    
    vi.advanceTimersByTime(10000);
    
    expect(mockOnDismiss).not.toHaveBeenCalled();
  });

  it('does not auto-dismiss when onDismiss is not provided', () => {
    const { container } = render(
      <ErrorMessage 
        message="Error" 
        autoDismiss={true}
        autoDismissDelay={1000}
      />
    );
    
    vi.advanceTimersByTime(2000);
    
    // Component should still be rendered
    expect(container.firstChild).toBeInTheDocument();
  });

  it('displays long error messages correctly', () => {
    const longMessage = 'This is a very long error message that should wrap properly and display all the content without any issues even on smaller screens';
    render(<ErrorMessage message={longMessage} />);
    
    expect(screen.getByText(longMessage)).toBeInTheDocument();
  });

  it('has proper ARIA attributes for accessibility', () => {
    render(<ErrorMessage message="Error" />);
    
    const alert = screen.getByRole('alert');
    expect(alert).toHaveAttribute('aria-live', 'assertive');
  });

  it('dismiss button has proper ARIA label', () => {
    const mockOnDismiss = vi.fn();
    render(<ErrorMessage message="Error" onDismiss={mockOnDismiss} />);
    
    const dismissButton = screen.getByRole('button', { name: /dismiss error/i });
    expect(dismissButton).toHaveAttribute('aria-label', 'Dismiss error');
  });

  it('handles special characters in error message', () => {
    const specialMessage = 'Error: <script>alert("test")</script> & "quotes"';
    render(<ErrorMessage message={specialMessage} />);
    
    expect(screen.getByText(specialMessage)).toBeInTheDocument();
  });

  it('renders multiple error messages independently', () => {
    const { rerender } = render(<ErrorMessage message="First error" />);
    expect(screen.getByText('First error')).toBeInTheDocument();
    
    rerender(<ErrorMessage message="Second error" />);
    expect(screen.getByText('Second error')).toBeInTheDocument();
    expect(screen.queryByText('First error')).not.toBeInTheDocument();
  });
});
