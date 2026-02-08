import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import QRCodeDisplay from '../QRCodeDisplay';

describe('QRCodeDisplay', () => {
  const mockStudent = {
    studentId: 'S12345',
    name: 'John Doe',
    tshirtSize: 'M',
    mealPreference: 'Vegetarian',
  };

  const mockStudentWithInvolvements = {
    studentId: 'S12345',
    name: 'John Doe',
    tshirtSize: 'M',
    mealPreference: 'Vegetarian',
    involvements: [
      { club: 'Tech Club', role: 'Member' },
      { club: 'Science Club', role: 'Volunteer' }
    ]
  };

  const mockQRCode = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

  it('should render student information correctly', () => {
    render(
      <QRCodeDisplay
        qrCode={mockQRCode}
        student={mockStudent}
      />
    );

    // Check if student name is displayed in success message
    expect(screen.getByText(/Welcome, John Doe!/i)).toBeInTheDocument();

    // Check if all student information is displayed
    expect(screen.getByText('S12345')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('M')).toBeInTheDocument();
    expect(screen.getByText('Vegetarian')).toBeInTheDocument();
  });

  it('should display QR code image with correct src', () => {
    render(
      <QRCodeDisplay
        qrCode={mockQRCode}
        student={mockStudent}
      />
    );

    const qrImage = screen.getByAltText('Student QR Code');
    expect(qrImage).toBeInTheDocument();
    expect(qrImage).toHaveAttribute('src', mockQRCode);
  });

  it('should display success message', () => {
    render(
      <QRCodeDisplay
        qrCode={mockQRCode}
        student={mockStudent}
      />
    );

    expect(screen.getByText('✓ Success!')).toBeInTheDocument();
  });

  it('should display QR code instructions', () => {
    render(
      <QRCodeDisplay
        qrCode={mockQRCode}
        student={mockStudent}
      />
    );

    expect(screen.getByText(/Show this QR code at the event to claim your items/i)).toBeInTheDocument();
  });

  it('should render "Generate New QR Code" button when onGenerateNew is provided', () => {
    const mockOnGenerateNew = vi.fn();

    render(
      <QRCodeDisplay
        qrCode={mockQRCode}
        student={mockStudent}
        onGenerateNew={mockOnGenerateNew}
      />
    );

    const button = screen.getByRole('button', { name: /Generate New QR Code/i });
    expect(button).toBeInTheDocument();
  });

  it('should not render "Generate New QR Code" button when onGenerateNew is not provided', () => {
    render(
      <QRCodeDisplay
        qrCode={mockQRCode}
        student={mockStudent}
      />
    );

    const button = screen.queryByRole('button', { name: /Generate New QR Code/i });
    expect(button).not.toBeInTheDocument();
  });

  it('should call onGenerateNew when button is clicked', () => {
    const mockOnGenerateNew = vi.fn();

    render(
      <QRCodeDisplay
        qrCode={mockQRCode}
        student={mockStudent}
        onGenerateNew={mockOnGenerateNew}
      />
    );

    const button = screen.getByRole('button', { name: /Generate New QR Code/i });
    fireEvent.click(button);

    expect(mockOnGenerateNew).toHaveBeenCalledTimes(1);
  });

  it('should display all student info labels correctly', () => {
    render(
      <QRCodeDisplay
        qrCode={mockQRCode}
        student={mockStudent}
      />
    );

    expect(screen.getByText('Student ID:')).toBeInTheDocument();
    expect(screen.getByText('Name:')).toBeInTheDocument();
    expect(screen.getByText('T-Shirt Size:')).toBeInTheDocument();
    expect(screen.getByText('Meal Preference:')).toBeInTheDocument();
  });

  it('should render with different student data', () => {
    const differentStudent = {
      studentId: 'S99999',
      name: 'Jane Smith',
      tshirtSize: 'L',
      mealPreference: 'Non-Vegetarian',
    };

    render(
      <QRCodeDisplay
        qrCode={mockQRCode}
        student={differentStudent}
      />
    );

    expect(screen.getByText(/Welcome, Jane Smith!/i)).toBeInTheDocument();
    expect(screen.getByText('S99999')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('L')).toBeInTheDocument();
    expect(screen.getByText('Non-Vegetarian')).toBeInTheDocument();
  });

  it('should have proper structure with headings', () => {
    render(
      <QRCodeDisplay
        qrCode={mockQRCode}
        student={mockStudent}
      />
    );

    expect(screen.getByRole('heading', { name: /✓ Success!/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Student Information/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Your QR Code/i })).toBeInTheDocument();
  });

  it('should display organization involvements when present', () => {
    render(
      <QRCodeDisplay
        qrCode={mockQRCode}
        student={mockStudentWithInvolvements}
      />
    );

    expect(screen.getByText('Organization Involvements')).toBeInTheDocument();
    expect(screen.getByText('Tech Club')).toBeInTheDocument();
    expect(screen.getByText('Member')).toBeInTheDocument();
    expect(screen.getByText('Science Club')).toBeInTheDocument();
    expect(screen.getByText('Volunteer')).toBeInTheDocument();
  });

  it('should not display involvements section when involvements array is empty', () => {
    const studentWithEmptyInvolvements = {
      ...mockStudent,
      involvements: []
    };

    render(
      <QRCodeDisplay
        qrCode={mockQRCode}
        student={studentWithEmptyInvolvements}
      />
    );

    expect(screen.queryByText('Organization Involvements')).not.toBeInTheDocument();
  });

  it('should not display involvements section when involvements is undefined', () => {
    render(
      <QRCodeDisplay
        qrCode={mockQRCode}
        student={mockStudent}
      />
    );

    expect(screen.queryByText('Organization Involvements')).not.toBeInTheDocument();
  });
});
