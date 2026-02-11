/**
 * Unit Tests: Edge Cases
 * 
 * Tests edge cases and boundary conditions for the admin table enhancements.
 * 
 * **Validates: Requirements 2.4, 6.6, 9.7, 5.1, 8.4**
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DatabaseTableView from '../DatabaseTableView';
import { StudentRecord } from '../../../utils/types';

// Mock fetch globally
global.fetch = vi.fn();

describe('Edge Cases', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Empty search query (Requirement 2.4)', () => {
    it('should display all records when search query is empty', async () => {
      const students: StudentRecord[] = [
        {
          studentId: 'A001',
          name: 'Alice Anderson',
          shirtCollected: false,
          mealCollected: false,
          consented: true,
          clubs: ['Drama Club'],
          hasPerformance: true,
          hasBooth: false,
        },
        {
          studentId: 'B002',
          name: 'Bob Brown',
          shirtCollected: false,
          mealCollected: false,
          consented: true,
          clubs: ['Chess Club'],
          hasPerformance: false,
          hasBooth: true,
        },
      ];

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          students: students.map(s => ({
            ...s,
            organizationDetails: s.clubs.map(club => `Club: ${club}, Involvement: Member`).join('; ')
          }))
        })
      });

      render(<DatabaseTableView />);

      await waitFor(() => {
        expect(screen.getByText('Alice Anderson')).toBeInTheDocument();
        expect(screen.getByText('Bob Brown')).toBeInTheDocument();
      });

      // Apply search
      const searchInput = screen.getByPlaceholderText('Search by ID or name');
      fireEvent.change(searchInput, { target: { value: 'Alice' } });

      await waitFor(() => {
        expect(screen.getByText('Alice Anderson')).toBeInTheDocument();
        expect(screen.queryByText('Bob Brown')).not.toBeInTheDocument();
      }, { timeout: 500 });

      // Clear search (empty query)
      fireEvent.change(searchInput, { target: { value: '' } });

      await waitFor(() => {
        expect(screen.getByText('Alice Anderson')).toBeInTheDocument();
        expect(screen.getByText('Bob Brown')).toBeInTheDocument();
      }, { timeout: 500 });
    });

    it('should handle whitespace-only search query', async () => {
      const students: StudentRecord[] = [
        {
          studentId: 'A001',
          name: 'Alice Anderson',
          shirtCollected: false,
          mealCollected: false,
          consented: true,
          clubs: ['Drama Club'],
          hasPerformance: true,
          hasBooth: false,
        },
      ];

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          students: students.map(s => ({
            ...s,
            organizationDetails: s.clubs.map(club => `Club: ${club}, Involvement: Member`).join('; ')
          }))
        })
      });

      render(<DatabaseTableView />);

      await waitFor(() => {
        expect(screen.getByText('Alice Anderson')).toBeInTheDocument();
      });

      // Search with whitespace only
      const searchInput = screen.getByPlaceholderText('Search by ID or name');
      fireEvent.change(searchInput, { target: { value: '   ' } });

      await waitFor(() => {
        // Should display all records (whitespace is treated as empty)
        expect(screen.getByText('Alice Anderson')).toBeInTheDocument();
      }, { timeout: 500 });
    });
  });

  describe('No organization details (Requirement 6.6)', () => {
    it('should handle students with no organization details gracefully', async () => {
      const students = [
        {
          studentId: 'A001',
          name: 'Alice Anderson',
          shirtCollected: false,
          mealCollected: false,
          consented: true,
          organizationDetails: '', // Empty organization details
        },
        {
          studentId: 'B002',
          name: 'Bob Brown',
          shirtCollected: false,
          mealCollected: false,
          consented: true,
          // No organizationDetails field at all
        },
      ];

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          students: students
        })
      });

      render(<DatabaseTableView />);

      await waitFor(() => {
        expect(screen.getByText('Alice Anderson')).toBeInTheDocument();
        expect(screen.getByText('Bob Brown')).toBeInTheDocument();
      });

      // Both students should display N/A for clubs and involvement
      const rows = screen.getAllByRole('row');
      expect(rows[1]).toHaveTextContent('N/A'); // Alice's clubs
      expect(rows[2]).toHaveTextContent('N/A'); // Bob's clubs
    });

    it('should handle malformed organization details', async () => {
      const students = [
        {
          studentId: 'A001',
          name: 'Alice Anderson',
          shirtCollected: false,
          mealCollected: false,
          consented: true,
          organizationDetails: 'Invalid format without proper structure',
        },
      ];

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          students: students
        })
      });

      render(<DatabaseTableView />);

      await waitFor(() => {
        expect(screen.getByText('Alice Anderson')).toBeInTheDocument();
      });

      // Should not crash and should display the student
      expect(screen.getByText('Alice Anderson')).toBeInTheDocument();
    });
  });

  describe('Student not found during update (Requirement 9.7)', () => {
    it('should display error message when student is not found', async () => {
      const students: StudentRecord[] = [
        {
          studentId: 'A001',
          name: 'Alice Anderson',
          shirtCollected: false,
          mealCollected: false,
          consented: true,
          clubs: ['Drama Club'],
          hasPerformance: true,
          hasBooth: false,
        },
      ];

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          students: students.map(s => ({
            ...s,
            organizationDetails: s.clubs.map(club => `Club: ${club}, Involvement: Member`).join('; ')
          }))
        })
      });

      render(<DatabaseTableView />);

      await waitFor(() => {
        expect(screen.getByText('Alice Anderson')).toBeInTheDocument();
      });

      // Mock 404 response
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 404,
        text: async () => 'Student not found',
        json: async () => { throw new Error('Not JSON'); }
      });

      // Try to update checkbox
      const checkbox = screen.getByLabelText('Shirt collected for A001');
      fireEvent.click(checkbox);

      // Should show error message
      await waitFor(() => {
        expect(screen.getByText(/student not found/i)).toBeInTheDocument();
      });

      // Checkbox should be reverted
      expect((checkbox as HTMLInputElement).checked).toBe(false);
    });
  });

  describe('Virtualization threshold (Requirement 5.1)', () => {
    it('should not use virtualization for datasets with 100 or fewer records', async () => {
      const students: StudentRecord[] = Array.from({ length: 100 }, (_, i) => ({
        studentId: `S${String(i).padStart(3, '0')}`,
        name: `Student ${i}`,
        shirtCollected: false,
        mealCollected: false,
        consented: true,
        clubs: ['Club A'],
        hasPerformance: false,
        hasBooth: false,
      }));

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          students: students.map(s => ({
            ...s,
            organizationDetails: 'Club: Club A, Involvement: Member'
          }))
        })
      });

      const { container } = render(<DatabaseTableView />);

      await waitFor(() => {
        expect(screen.getByText('Student 0')).toBeInTheDocument();
      });

      // Should not have virtualized class
      const tableContainer = container.querySelector('.table-container.virtualized');
      expect(tableContainer).not.toBeInTheDocument();
    });

    it('should use virtualization for datasets with more than 100 records', async () => {
      const students: StudentRecord[] = Array.from({ length: 101 }, (_, i) => ({
        studentId: `S${String(i).padStart(3, '0')}`,
        name: `Student ${i}`,
        shirtCollected: false,
        mealCollected: false,
        consented: true,
        clubs: ['Club A'],
        hasPerformance: false,
        hasBooth: false,
      }));

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          students: students.map(s => ({
            ...s,
            organizationDetails: 'Club: Club A, Involvement: Member'
          }))
        })
      });

      const { container } = render(<DatabaseTableView />);

      await waitFor(() => {
        expect(screen.getByText('Student 0')).toBeInTheDocument();
      });

      // Should have virtualized class
      const tableContainer = container.querySelector('.table-container.virtualized');
      expect(tableContainer).toBeInTheDocument();
    });
  });

  describe('Empty state display (Requirement 8.4)', () => {
    it('should display empty state when no students in database', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          students: []
        })
      });

      render(<DatabaseTableView />);

      await waitFor(() => {
        expect(screen.getByText(/no student records found/i)).toBeInTheDocument();
      });
    });

    it('should display empty state when no results match filters', async () => {
      const students: StudentRecord[] = [
        {
          studentId: 'A001',
          name: 'Alice Anderson',
          shirtCollected: false,
          mealCollected: false,
          consented: true,
          clubs: ['Drama Club'],
          hasPerformance: true,
          hasBooth: false,
        },
      ];

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          students: students.map(s => ({
            ...s,
            organizationDetails: s.clubs.map(club => `Club: ${club}, Involvement: Member`).join('; ')
          }))
        })
      });

      render(<DatabaseTableView />);

      await waitFor(() => {
        expect(screen.getByText('Alice Anderson')).toBeInTheDocument();
      });

      // Apply search that matches nothing
      const searchInput = screen.getByPlaceholderText('Search by ID or name');
      fireEvent.change(searchInput, { target: { value: 'NonexistentStudent' } });

      await waitFor(() => {
        expect(screen.getByText(/no students match your search/i)).toBeInTheDocument();
      }, { timeout: 500 });
    });

    it('should provide clear filters button in empty state', async () => {
      const students: StudentRecord[] = [
        {
          studentId: 'A001',
          name: 'Alice Anderson',
          shirtCollected: false,
          mealCollected: false,
          consented: true,
          clubs: ['Drama Club'],
          hasPerformance: true,
          hasBooth: false,
        },
      ];

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          students: students.map(s => ({
            ...s,
            organizationDetails: s.clubs.map(club => `Club: ${club}, Involvement: Member`).join('; ')
          }))
        })
      });

      render(<DatabaseTableView />);

      await waitFor(() => {
        expect(screen.getByText('Alice Anderson')).toBeInTheDocument();
      });

      // Apply search that matches nothing
      const searchInput = screen.getByPlaceholderText('Search by ID or name');
      fireEvent.change(searchInput, { target: { value: 'NonexistentStudent' } });

      await waitFor(() => {
        expect(screen.getByText(/no students match your search/i)).toBeInTheDocument();
      }, { timeout: 500 });

      // Should have clear filters button in empty state
      const clearButton = screen.getByRole('button', { name: /clear filters/i });
      expect(clearButton).toBeInTheDocument();

      // Click clear filters (this only clears filters, not search)
      fireEvent.click(clearButton);

      // Clear search manually
      fireEvent.change(searchInput, { target: { value: '' } });

      await waitFor(() => {
        expect(screen.getByText('Alice Anderson')).toBeInTheDocument();
      }, { timeout: 500 });
    });
  });

  describe('Special characters and edge cases', () => {
    it('should handle special characters in search query', async () => {
      const students: StudentRecord[] = [
        {
          studentId: 'A001',
          name: "O'Brien",
          shirtCollected: false,
          mealCollected: false,
          consented: true,
          clubs: ['Drama Club'],
          hasPerformance: true,
          hasBooth: false,
        },
      ];

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          students: students.map(s => ({
            ...s,
            organizationDetails: s.clubs.map(club => `Club: ${club}, Involvement: Member`).join('; ')
          }))
        })
      });

      render(<DatabaseTableView />);

      await waitFor(() => {
        expect(screen.getByText("O'Brien")).toBeInTheDocument();
      });

      // Search with apostrophe
      const searchInput = screen.getByPlaceholderText('Search by ID or name');
      fireEvent.change(searchInput, { target: { value: "O'Brien" } });

      await waitFor(() => {
        expect(screen.getByText("O'Brien")).toBeInTheDocument();
      }, { timeout: 500 });
    });

    it('should handle very long student names', async () => {
      const students: StudentRecord[] = [
        {
          studentId: 'A001',
          name: 'A'.repeat(100), // Very long name
          shirtCollected: false,
          mealCollected: false,
          consented: true,
          clubs: ['Drama Club'],
          hasPerformance: true,
          hasBooth: false,
        },
      ];

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          students: students.map(s => ({
            ...s,
            organizationDetails: s.clubs.map(club => `Club: ${club}, Involvement: Member`).join('; ')
          }))
        })
      });

      render(<DatabaseTableView />);

      await waitFor(() => {
        expect(screen.getByText('A'.repeat(100))).toBeInTheDocument();
      });
    });

    it('should handle students with many clubs', async () => {
      const students: StudentRecord[] = [
        {
          studentId: 'A001',
          name: 'Alice Anderson',
          shirtCollected: false,
          mealCollected: false,
          consented: true,
          clubs: ['Club 1', 'Club 2', 'Club 3', 'Club 4', 'Club 5'],
          hasPerformance: true,
          hasBooth: false,
        },
      ];

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          students: students.map(s => ({
            ...s,
            organizationDetails: s.clubs.map(club => `Club: ${club}, Involvement: Member`).join('; ')
          }))
        })
      });

      render(<DatabaseTableView />);

      await waitFor(() => {
        expect(screen.getByText('Alice Anderson')).toBeInTheDocument();
      });

      // All clubs should be displayed
      expect(screen.getByText(/Club 1, Club 2, Club 3, Club 4, Club 5/)).toBeInTheDocument();
    });
  });
});
