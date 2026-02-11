import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import TableRow from '../TableRow';
import { StudentRecord } from '../../../utils/types';

describe('TableRow', () => {
  const mockOnCheckboxChange = vi.fn().mockResolvedValue(undefined);

  const createMockStudent = (overrides?: Partial<StudentRecord>): StudentRecord => ({
    studentId: 'TEST001',
    name: 'John Doe',
    shirtCollected: false,
    mealCollected: false,
    consented: true,
    clubs: ['Drama Club'],
    hasPerformance: true,
    hasBooth: false,
    ...overrides,
  });

  beforeEach(() => {
    mockOnCheckboxChange.mockClear();
  });

  describe('Student Data Rendering', () => {
    it('should render student ID', () => {
      const student = createMockStudent();
      render(
        <table>
          <tbody>
            <TableRow
              student={student}
              onCheckboxChange={mockOnCheckboxChange}
              isPending={false}
            />
          </tbody>
        </table>
      );

      expect(screen.getByText('TEST001')).toBeInTheDocument();
    });

    it('should render student name', () => {
      const student = createMockStudent();
      render(
        <table>
          <tbody>
            <TableRow
              student={student}
              onCheckboxChange={mockOnCheckboxChange}
              isPending={false}
            />
          </tbody>
        </table>
      );

      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    it('should render single club', () => {
      const student = createMockStudent({ clubs: ['Drama Club'] });
      render(
        <table>
          <tbody>
            <TableRow
              student={student}
              onCheckboxChange={mockOnCheckboxChange}
              isPending={false}
            />
          </tbody>
        </table>
      );

      expect(screen.getByText('Drama Club')).toBeInTheDocument();
    });

    it('should render multiple clubs separated by commas', () => {
      const student = createMockStudent({ 
        clubs: ['Drama Club', 'Chess Club', 'Debate Club'] 
      });
      render(
        <table>
          <tbody>
            <TableRow
              student={student}
              onCheckboxChange={mockOnCheckboxChange}
              isPending={false}
            />
          </tbody>
        </table>
      );

      expect(screen.getByText('Drama Club, Chess Club, Debate Club')).toBeInTheDocument();
    });

    it('should display N/A when student has no clubs', () => {
      const student = createMockStudent({ clubs: [] });
      render(
        <table>
          <tbody>
            <TableRow
              student={student}
              onCheckboxChange={mockOnCheckboxChange}
              isPending={false}
            />
          </tbody>
        </table>
      );

      const cells = screen.getAllByText('N/A');
      expect(cells.length).toBeGreaterThan(0);
    });

    it('should display performance involvement', () => {
      const student = createMockStudent({ 
        hasPerformance: true, 
        hasBooth: false 
      });
      render(
        <table>
          <tbody>
            <TableRow
              student={student}
              onCheckboxChange={mockOnCheckboxChange}
              isPending={false}
            />
          </tbody>
        </table>
      );

      expect(screen.getByText('Performance')).toBeInTheDocument();
    });

    it('should display booth involvement', () => {
      const student = createMockStudent({ 
        hasPerformance: false, 
        hasBooth: true 
      });
      render(
        <table>
          <tbody>
            <TableRow
              student={student}
              onCheckboxChange={mockOnCheckboxChange}
              isPending={false}
            />
          </tbody>
        </table>
      );

      expect(screen.getByText('Booth')).toBeInTheDocument();
    });

    it('should display both performance and booth involvement', () => {
      const student = createMockStudent({ 
        hasPerformance: true, 
        hasBooth: true 
      });
      render(
        <table>
          <tbody>
            <TableRow
              student={student}
              onCheckboxChange={mockOnCheckboxChange}
              isPending={false}
            />
          </tbody>
        </table>
      );

      expect(screen.getByText('Performance, Booth')).toBeInTheDocument();
    });

    it('should display N/A when student has no involvement', () => {
      const student = createMockStudent({ 
        hasPerformance: false, 
        hasBooth: false 
      });
      render(
        <table>
          <tbody>
            <TableRow
              student={student}
              onCheckboxChange={mockOnCheckboxChange}
              isPending={false}
            />
          </tbody>
        </table>
      );

      const cells = screen.getAllByText('N/A');
      expect(cells.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Checkbox Integration', () => {
    it('should render shirt checkbox with correct checked state', () => {
      const student = createMockStudent({ shirtCollected: true });
      render(
        <table>
          <tbody>
            <TableRow
              student={student}
              onCheckboxChange={mockOnCheckboxChange}
              isPending={false}
            />
          </tbody>
        </table>
      );

      const checkbox = screen.getByLabelText('Shirt collected for TEST001');
      expect(checkbox).toBeChecked();
    });

    it('should render meal checkbox with correct checked state', () => {
      const student = createMockStudent({ mealCollected: true });
      render(
        <table>
          <tbody>
            <TableRow
              student={student}
              onCheckboxChange={mockOnCheckboxChange}
              isPending={false}
            />
          </tbody>
        </table>
      );

      const checkbox = screen.getByLabelText('Meal collected for TEST001');
      expect(checkbox).toBeChecked();
    });

    it('should disable checkboxes when isPending is true', () => {
      const student = createMockStudent();
      render(
        <table>
          <tbody>
            <TableRow
              student={student}
              onCheckboxChange={mockOnCheckboxChange}
              isPending={true}
            />
          </tbody>
        </table>
      );

      const shirtCheckbox = screen.getByLabelText('Shirt collected for TEST001');
      const mealCheckbox = screen.getByLabelText('Meal collected for TEST001');
      
      expect(shirtCheckbox).toBeDisabled();
      expect(mealCheckbox).toBeDisabled();
    });

    it('should enable checkboxes when isPending is false', () => {
      const student = createMockStudent();
      render(
        <table>
          <tbody>
            <TableRow
              student={student}
              onCheckboxChange={mockOnCheckboxChange}
              isPending={false}
            />
          </tbody>
        </table>
      );

      const shirtCheckbox = screen.getByLabelText('Shirt collected for TEST001');
      const mealCheckbox = screen.getByLabelText('Meal collected for TEST001');
      
      expect(shirtCheckbox).not.toBeDisabled();
      expect(mealCheckbox).not.toBeDisabled();
    });
  });

  describe('Memoization Behavior', () => {
    it('should not re-render when unrelated props change', () => {
      const student = createMockStudent();
      const { rerender } = render(
        <table>
          <tbody>
            <TableRow
              student={student}
              onCheckboxChange={mockOnCheckboxChange}
              isPending={false}
            />
          </tbody>
        </table>
      );

      // Create a new callback function (different reference)
      const newCallback = vi.fn().mockResolvedValue(undefined);
      
      rerender(
        <table>
          <tbody>
            <TableRow
              student={student}
              onCheckboxChange={newCallback}
              isPending={false}
            />
          </tbody>
        </table>
      );

      // Component should still render correctly
      expect(screen.getByText('TEST001')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    it('should re-render when student data changes', () => {
      const student = createMockStudent();
      const { rerender } = render(
        <table>
          <tbody>
            <TableRow
              student={student}
              onCheckboxChange={mockOnCheckboxChange}
              isPending={false}
            />
          </tbody>
        </table>
      );

      expect(screen.getByText('John Doe')).toBeInTheDocument();

      // Update student name
      const updatedStudent = { ...student, name: 'Jane Smith' };
      rerender(
        <table>
          <tbody>
            <TableRow
              student={updatedStudent}
              onCheckboxChange={mockOnCheckboxChange}
              isPending={false}
            />
          </tbody>
        </table>
      );

      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
    });

    it('should re-render when checkbox state changes', () => {
      const student = createMockStudent({ shirtCollected: false });
      const { rerender } = render(
        <table>
          <tbody>
            <TableRow
              student={student}
              onCheckboxChange={mockOnCheckboxChange}
              isPending={false}
            />
          </tbody>
        </table>
      );

      const checkbox = screen.getByLabelText('Shirt collected for TEST001');
      expect(checkbox).not.toBeChecked();

      // Update shirt collected status
      const updatedStudent = { ...student, shirtCollected: true };
      rerender(
        <table>
          <tbody>
            <TableRow
              student={updatedStudent}
              onCheckboxChange={mockOnCheckboxChange}
              isPending={false}
            />
          </tbody>
        </table>
      );

      const updatedCheckbox = screen.getByLabelText('Shirt collected for TEST001');
      expect(updatedCheckbox).toBeChecked();
    });

    it('should re-render when isPending changes', () => {
      const student = createMockStudent();
      const { rerender } = render(
        <table>
          <tbody>
            <TableRow
              student={student}
              onCheckboxChange={mockOnCheckboxChange}
              isPending={false}
            />
          </tbody>
        </table>
      );

      const checkbox = screen.getByLabelText('Shirt collected for TEST001');
      expect(checkbox).not.toBeDisabled();

      // Update isPending
      rerender(
        <table>
          <tbody>
            <TableRow
              student={student}
              onCheckboxChange={mockOnCheckboxChange}
              isPending={true}
            />
          </tbody>
        </table>
      );

      const updatedCheckbox = screen.getByLabelText('Shirt collected for TEST001');
      expect(updatedCheckbox).toBeDisabled();
    });
  });

  describe('Involvement Data Display', () => {
    it('should display all club memberships', () => {
      const student = createMockStudent({ 
        clubs: ['Drama Club', 'Chess Club', 'Science Club'] 
      });
      render(
        <table>
          <tbody>
            <TableRow
              student={student}
              onCheckboxChange={mockOnCheckboxChange}
              isPending={false}
            />
          </tbody>
        </table>
      );

      expect(screen.getByText('Drama Club, Chess Club, Science Club')).toBeInTheDocument();
    });

    it('should display complete involvement information', () => {
      const student = createMockStudent({ 
        clubs: ['Drama Club', 'Music Club'],
        hasPerformance: true,
        hasBooth: true
      });
      render(
        <table>
          <tbody>
            <TableRow
              student={student}
              onCheckboxChange={mockOnCheckboxChange}
              isPending={false}
            />
          </tbody>
        </table>
      );

      expect(screen.getByText('Drama Club, Music Club')).toBeInTheDocument();
      expect(screen.getByText('Performance, Booth')).toBeInTheDocument();
    });

    it('should handle empty involvement gracefully', () => {
      const student = createMockStudent({ 
        clubs: [],
        hasPerformance: false,
        hasBooth: false
      });
      render(
        <table>
          <tbody>
            <TableRow
              student={student}
              onCheckboxChange={mockOnCheckboxChange}
              isPending={false}
            />
          </tbody>
        </table>
      );

      const naCells = screen.getAllByText('N/A');
      expect(naCells.length).toBeGreaterThanOrEqual(2);
    });
  });
});
