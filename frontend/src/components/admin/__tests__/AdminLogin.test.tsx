import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import AdminLogin from '../AdminLogin';

describe('AdminLogin', () => {
  const mockOnLoginSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders login form with password input', () => {
    render(<AdminLogin onLoginSuccess={mockOnLoginSuccess} />);
    
    expect(screen.getByText('Admin Access')).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  it('renders ROOT logo', () => {
    render(<AdminLogin onLoginSuccess={mockOnLoginSuccess} />);
    
    const logo = screen.getByAltText('ROOT Logo');
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute('src', '/ROOT_logo_white-03.png');
  });

  it('displays subtitle text', () => {
    render(<AdminLogin onLoginSuccess={mockOnLoginSuccess} />);
    
    expect(screen.getByText('Enter password to continue')).toBeInTheDocument();
  });

  it('updates password input value when typing', () => {
    render(<AdminLogin onLoginSuccess={mockOnLoginSuccess} />);
    
    const passwordInput = screen.getByLabelText(/password/i) as HTMLInputElement;
    fireEvent.change(passwordInput, { target: { value: 'test123' } });
    
    expect(passwordInput.value).toBe('test123');
  });

  it('grants access with correct password "Linda47$"', () => {
    render(<AdminLogin onLoginSuccess={mockOnLoginSuccess} />);
    
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /login/i });
    
    fireEvent.change(passwordInput, { target: { value: 'Linda47$' } });
    fireEvent.click(submitButton);
    
    expect(mockOnLoginSuccess).toHaveBeenCalledTimes(1);
  });

  it('shows error message with incorrect password', () => {
    render(<AdminLogin onLoginSuccess={mockOnLoginSuccess} />);
    
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /login/i });
    
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
    fireEvent.click(submitButton);
    
    expect(screen.getByText('Incorrect password. Please try again.')).toBeInTheDocument();
    expect(mockOnLoginSuccess).not.toHaveBeenCalled();
  });

  it('does not grant access with empty password', () => {
    render(<AdminLogin onLoginSuccess={mockOnLoginSuccess} />);
    
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /login/i });
    
    fireEvent.change(passwordInput, { target: { value: '' } });
    fireEvent.click(submitButton);
    
    expect(mockOnLoginSuccess).not.toHaveBeenCalled();
  });

  it('does not grant access with similar but incorrect password', () => {
    render(<AdminLogin onLoginSuccess={mockOnLoginSuccess} />);
    
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /login/i });
    
    // Test variations that are close but not exact
    const incorrectPasswords = [
      'linda47$',       // lowercase L
      'Linda47$2',      // extra 2
      'Linda47$22',     // extra 22
      ' Linda47$',      // leading space
      'Linda47$ ',      // trailing space
    ];
    
    incorrectPasswords.forEach(password => {
      fireEvent.change(passwordInput, { target: { value: password } });
      fireEvent.click(submitButton);
      
      expect(mockOnLoginSuccess).not.toHaveBeenCalled();
      expect(screen.getByText('Incorrect password. Please try again.')).toBeInTheDocument();
      
      vi.clearAllMocks();
    });
  });

  it('disables submit button when password is empty', () => {
    render(<AdminLogin onLoginSuccess={mockOnLoginSuccess} />);
    
    const submitButton = screen.getByRole('button', { name: /login/i }) as HTMLButtonElement;
    
    expect(submitButton).toBeDisabled();
  });

  it('enables submit button when password is entered', () => {
    render(<AdminLogin onLoginSuccess={mockOnLoginSuccess} />);
    
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /login/i }) as HTMLButtonElement;
    
    fireEvent.change(passwordInput, { target: { value: 'anypassword' } });
    
    expect(submitButton).not.toBeDisabled();
  });

  it('clears error message when submitting again', () => {
    render(<AdminLogin onLoginSuccess={mockOnLoginSuccess} />);
    
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /login/i });
    
    // First attempt - wrong password
    fireEvent.change(passwordInput, { target: { value: 'wrong' } });
    fireEvent.click(submitButton);
    expect(screen.getByText('Incorrect password. Please try again.')).toBeInTheDocument();
    
    // Second attempt - correct password
    fireEvent.change(passwordInput, { target: { value: 'Linda47$' } });
    fireEvent.click(submitButton);
    
    expect(screen.queryByText('Incorrect password. Please try again.')).not.toBeInTheDocument();
    expect(mockOnLoginSuccess).toHaveBeenCalledTimes(1);
  });

  it('has password input type for security', () => {
    render(<AdminLogin onLoginSuccess={mockOnLoginSuccess} />);
    
    const passwordInput = screen.getByLabelText(/password/i);
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  it('has autofocus on password input', () => {
    render(<AdminLogin onLoginSuccess={mockOnLoginSuccess} />);
    
    const passwordInput = screen.getByLabelText(/password/i);
    // Check that autofocus prop is set (React uses autoFocus camelCase)
    expect(passwordInput).toHaveFocus();
  });

  it('displays error with role alert for accessibility', () => {
    render(<AdminLogin onLoginSuccess={mockOnLoginSuccess} />);
    
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /login/i });
    
    fireEvent.change(passwordInput, { target: { value: 'wrong' } });
    fireEvent.click(submitButton);
    
    const errorMessage = screen.getByRole('alert');
    expect(errorMessage).toBeInTheDocument();
    expect(errorMessage).toHaveTextContent('Incorrect password. Please try again.');
  });

  it('prevents form submission with enter key when password is empty', () => {
    render(<AdminLogin onLoginSuccess={mockOnLoginSuccess} />);
    
    const form = screen.getByRole('button', { name: /login/i }).closest('form');
    
    if (form) {
      fireEvent.submit(form);
    }
    
    expect(mockOnLoginSuccess).not.toHaveBeenCalled();
  });

  it('allows form submission with enter key when password is entered', () => {
    render(<AdminLogin onLoginSuccess={mockOnLoginSuccess} />);
    
    const passwordInput = screen.getByLabelText(/password/i);
    const form = screen.getByRole('button', { name: /login/i }).closest('form');
    
    fireEvent.change(passwordInput, { target: { value: 'Linda47$' } });
    
    if (form) {
      fireEvent.submit(form);
    }
    
    expect(mockOnLoginSuccess).toHaveBeenCalledTimes(1);
  });

  it('includes proper styling for mobile optimization', () => {
    const { container } = render(<AdminLogin onLoginSuccess={mockOnLoginSuccess} />);
    
    // Check that style tag exists (component includes inline styles)
    const styles = container.querySelector('style');
    expect(styles).toBeInTheDocument();
    
    // Verify mobile-specific styles are present
    const styleContent = styles?.textContent || '';
    expect(styleContent).toContain('@media');
    expect(styleContent).toContain('admin-login');
  });

  it('has correct background color matching design spec', () => {
    const { container } = render(<AdminLogin onLoginSuccess={mockOnLoginSuccess} />);
    
    const styles = container.querySelector('style');
    const styleContent = styles?.textContent || '';
    
    // Verify #53001b background color is used
    expect(styleContent).toContain('#53001b');
  });
});
