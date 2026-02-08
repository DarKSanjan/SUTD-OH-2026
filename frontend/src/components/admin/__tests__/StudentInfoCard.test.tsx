import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import StudentInfoCard from '../StudentInfoCard';

describe('StudentInfoCard', () => {
  const mockStudent = {
    studentId: 'S12345',
    name: 'John Doe',
    tshirtSize: 'L',
    mealPreference: 'Vegetarian',
  };

  const mockStudentWithInvolvements = {
    studentId: 'S12345',
    name: 'John Doe',
    tshirtSize: 'L',
    mealPreference: 'Vegetarian',
    involvements: [
      { club: 'Tech Club', role: 'Member' },
      { club: 'Science Club', role: 'Volunteer' }
    ]
  };

  it('renders student name', () => {
    render(<StudentInfoCard student={mockStudent} />);
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('renders student ID', () => {
    render(<StudentInfoCard student={mockStudent} />);
    expect(screen.getByText('S12345')).toBeInTheDocument();
  });

  it('renders t-shirt size', () => {
    render(<StudentInfoCard student={mockStudent} />);
    expect(screen.getByText('T-Shirt Size')).toBeInTheDocument();
    expect(screen.getByText('L')).toBeInTheDocument();
  });

  it('renders meal preference', () => {
    render(<StudentInfoCard student={mockStudent} />);
    expect(screen.getByText('Meal Preference')).toBeInTheDocument();
    expect(screen.getByText('Vegetarian')).toBeInTheDocument();
  });

  it('renders all student information correctly', () => {
    render(<StudentInfoCard student={mockStudent} />);
    
    // Check all fields are present
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('S12345')).toBeInTheDocument();
    expect(screen.getByText('L')).toBeInTheDocument();
    expect(screen.getByText('Vegetarian')).toBeInTheDocument();
  });

  it('handles long student names', () => {
    const longNameStudent = {
      ...mockStudent,
      name: 'Christopher Alexander Montgomery-Wellington III',
    };
    render(<StudentInfoCard student={longNameStudent} />);
    expect(screen.getByText('Christopher Alexander Montgomery-Wellington III')).toBeInTheDocument();
  });

  it('handles different t-shirt sizes', () => {
    const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
    
    sizes.forEach(size => {
      const { unmount } = render(
        <StudentInfoCard student={{ ...mockStudent, tshirtSize: size }} />
      );
      expect(screen.getByText(size)).toBeInTheDocument();
      unmount();
    });
  });

  it('handles different meal preferences', () => {
    const preferences = ['Vegetarian', 'Vegan', 'Non-Vegetarian', 'Halal', 'Kosher'];
    
    preferences.forEach(preference => {
      const { unmount } = render(
        <StudentInfoCard student={{ ...mockStudent, mealPreference: preference }} />
      );
      expect(screen.getByText(preference)).toBeInTheDocument();
      unmount();
    });
  });

  it('renders with special characters in name', () => {
    const specialCharStudent = {
      ...mockStudent,
      name: "O'Brien-Smith, José María",
    };
    render(<StudentInfoCard student={specialCharStudent} />);
    expect(screen.getByText("O'Brien-Smith, José María")).toBeInTheDocument();
  });

  it('renders with alphanumeric student ID', () => {
    const alphanumericIdStudent = {
      ...mockStudent,
      studentId: 'ABC123XYZ',
    };
    render(<StudentInfoCard student={alphanumericIdStudent} />);
    expect(screen.getByText('ABC123XYZ')).toBeInTheDocument();
  });

  it('displays organization involvements when present', () => {
    render(<StudentInfoCard student={mockStudentWithInvolvements} />);

    expect(screen.getByText('Organization Involvements')).toBeInTheDocument();
    expect(screen.getByText('Tech Club')).toBeInTheDocument();
    expect(screen.getByText('Member')).toBeInTheDocument();
    expect(screen.getByText('Science Club')).toBeInTheDocument();
    expect(screen.getByText('Volunteer')).toBeInTheDocument();
  });

  it('does not display involvements section when involvements array is empty', () => {
    const studentWithEmptyInvolvements = {
      ...mockStudent,
      involvements: []
    };

    render(<StudentInfoCard student={studentWithEmptyInvolvements} />);

    expect(screen.queryByText('Organization Involvements')).not.toBeInTheDocument();
  });

  it('does not display involvements section when involvements is undefined', () => {
    render(<StudentInfoCard student={mockStudent} />);

    expect(screen.queryByText('Organization Involvements')).not.toBeInTheDocument();
  });

  it('displays multiple involvements correctly', () => {
    const studentWithManyInvolvements = {
      ...mockStudent,
      involvements: [
        { club: 'Tech Club', role: 'Member' },
        { club: 'Science Club', role: 'Volunteer' },
        { club: 'Math Society', role: 'President' },
        { club: 'Drama Club', role: 'Actor' }
      ]
    };

    render(<StudentInfoCard student={studentWithManyInvolvements} />);

    expect(screen.getByText('Tech Club')).toBeInTheDocument();
    expect(screen.getByText('Science Club')).toBeInTheDocument();
    expect(screen.getByText('Math Society')).toBeInTheDocument();
    expect(screen.getByText('Drama Club')).toBeInTheDocument();
  });
});
