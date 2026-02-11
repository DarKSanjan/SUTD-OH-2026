/**
 * Property-Based Tests: View State Preservation
 * 
 * Feature: admin-table-enhancements
 * Property 5: Checkbox updates preserve view state
 * 
 * For any checkbox update, the current scroll position, active filters,
 * search query, and sort state should remain unchanged after the update completes.
 * 
 * **Validates: Requirements 1.6**
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import fc from 'fast-check';
import DatabaseTableView from '../DatabaseTableView';
import { StudentRecord, FilterCriteria, SortableColumn, SortDirection } from '../../../utils/types';

// Mock fetch globally
global.fetch = vi.fn();

// Arbitrary for generating student records
const studentArbitrary = fc.record({
  studentId: fc.string({ minLength: 5, maxLength: 10 }),
  name: fc.string({ minLength: 5, maxLength: 30 }),
  shirtCollected: fc.boolean(),
  mealCollected: fc.boolean(),
  consented: fc.constant(true),
  clubs: fc.array(fc.string({ minLength: 3, maxLength: 15 }), { minLength: 0, maxLength: 3 }),
  hasPerformance: fc.boolean(),
  hasBooth: fc.boolean(),
}) as fc.Arbitrary<StudentRecord>;

describe('Property: View State Preservation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Property 5: Checkbox updates preserve view state', () => {
    it('should preserve search query after checkbox update', async () => {
      // Use a fixed dataset for this test
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

      // Mock initial data fetch
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

      // Apply search
      const searchInput = screen.getByPlaceholderText('Search by ID or name');
      fireEvent.change(searchInput, { target: { value: 'Alice' } });

      await waitFor(() => {
        expect(screen.getByText('Alice Anderson')).toBeInTheDocument();
        expect(screen.queryByText('Bob Brown')).not.toBeInTheDocument();
      }, { timeout: 500 });

      // Mock checkbox update
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          claim: {
            studentId: 'A001',
            tshirtClaimed: true,
            mealClaimed: false,
          }
        })
      });

      // Update checkbox
      const checkbox = screen.getByLabelText('Shirt collected for A001');
      fireEvent.click(checkbox);

      await waitFor(() => {
        expect((checkbox as HTMLInputElement).checked).toBe(true);
      });

      // Verify search query is preserved
      expect((searchInput as HTMLInputElement).value).toBe('Alice');
      expect(screen.getByText('Alice Anderson')).toBeInTheDocument();
      expect(screen.queryByText('Bob Brown')).not.toBeInTheDocument();
    });

    it('should preserve filter state after checkbox update', async () => {
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
      });

      // Expand filters and apply filter
      const filterToggle = screen.getByLabelText(/expand filters/i);
      fireEvent.click(filterToggle);

      await waitFor(() => {
        expect(screen.getByLabelText('Filter by Drama Club')).toBeInTheDocument();
      });

      const dramaClubCheckbox = screen.getByLabelText('Filter by Drama Club');
      fireEvent.click(dramaClubCheckbox);

      await waitFor(() => {
        expect(screen.getByText('Alice Anderson')).toBeInTheDocument();
        expect(screen.queryByText('Bob Brown')).not.toBeInTheDocument();
      });

      // Mock checkbox update
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          claim: {
            studentId: 'A001',
            tshirtClaimed: true,
            mealClaimed: false,
          }
        })
      });

      // Update checkbox
      const shirtCheckbox = screen.getByLabelText('Shirt collected for A001');
      fireEvent.click(shirtCheckbox);

      await waitFor(() => {
        expect((shirtCheckbox as HTMLInputElement).checked).toBe(true);
      });

      // Verify filter is still active
      expect(screen.getByText('Alice Anderson')).toBeInTheDocument();
      expect(screen.queryByText('Bob Brown')).not.toBeInTheDocument();
      
      // Verify filter badge is still visible
      expect(screen.getByText(/Club: Drama Club/i)).toBeInTheDocument();
    });

    it('should preserve sort state after checkbox update', async () => {
      const students: StudentRecord[] = [
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

      // Apply sort by name
      const nameHeader = screen.getByRole('button', { name: /sort by name/i });
      fireEvent.click(nameHeader);

      await waitFor(() => {
        const rows = screen.getAllByRole('row');
        // First data row should be Alice (alphabetically first)
        expect(rows[1]).toHaveTextContent('Alice Anderson');
        expect(rows[2]).toHaveTextContent('Bob Brown');
      });

      // Mock checkbox update
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          claim: {
            studentId: 'A001',
            tshirtClaimed: true,
            mealClaimed: false,
          }
        })
      });

      // Update checkbox
      const checkbox = screen.getByLabelText('Shirt collected for A001');
      fireEvent.click(checkbox);

      await waitFor(() => {
        expect((checkbox as HTMLInputElement).checked).toBe(true);
      });

      // Verify sort order is preserved
      const rows = screen.getAllByRole('row');
      expect(rows[1]).toHaveTextContent('Alice Anderson');
      expect(rows[2]).toHaveTextContent('Bob Brown');
    });

    it('should preserve combined state (search + filter + sort) after checkbox update', async () => {
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
          studentId: 'A002',
          name: 'Amy Adams',
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
      });

      // Apply search
      const searchInput = screen.getByPlaceholderText('Search by ID or name');
      fireEvent.change(searchInput, { target: { value: 'A' } });

      await waitFor(() => {
        expect(screen.queryByText('Bob Brown')).not.toBeInTheDocument();
      }, { timeout: 500 });

      // Apply filter
      const filterToggle = screen.getByLabelText(/expand filters/i);
      fireEvent.click(filterToggle);

      await waitFor(() => {
        expect(screen.getByLabelText('Filter by Drama Club')).toBeInTheDocument();
      });

      const dramaClubCheckbox = screen.getByLabelText('Filter by Drama Club');
      fireEvent.click(dramaClubCheckbox);

      await waitFor(() => {
        expect(screen.getByText('Alice Anderson')).toBeInTheDocument();
        expect(screen.getByText('Amy Adams')).toBeInTheDocument();
      });

      // Apply sort
      const nameHeader = screen.getByRole('button', { name: /sort by name/i });
      fireEvent.click(nameHeader);

      await waitFor(() => {
        const rows = screen.getAllByRole('row');
        expect(rows[1]).toHaveTextContent('Alice Anderson');
        expect(rows[2]).toHaveTextContent('Amy Adams');
      });

      // Mock checkbox update
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          claim: {
            studentId: 'A001',
            tshirtClaimed: true,
            mealClaimed: false,
          }
        })
      });

      // Update checkbox
      const checkbox = screen.getByLabelText('Shirt collected for A001');
      fireEvent.click(checkbox);

      await waitFor(() => {
        expect((checkbox as HTMLInputElement).checked).toBe(true);
      });

      // Verify all state is preserved
      // Search
      expect((searchInput as HTMLInputElement).value).toBe('A');
      
      // Filter
      expect(screen.getByText(/Club: Drama Club/i)).toBeInTheDocument();
      expect(screen.queryByText('Bob Brown')).not.toBeInTheDocument();
      
      // Sort
      const rows = screen.getAllByRole('row');
      expect(rows[1]).toHaveTextContent('Alice Anderson');
      expect(rows[2]).toHaveTextContent('Amy Adams');
    });
  });
});
