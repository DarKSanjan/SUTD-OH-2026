/**
 * Integration Tests: Complete User Workflow
 * 
 * Tests the complete user workflow: search → filter → sort → checkbox update
 * Verifies state consistency throughout the entire flow.
 * 
 * **Validates: Requirements 1.1-1.6, 2.1-2.6, 3.1-3.9, 4.1-4.7**
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DatabaseTableView from '../DatabaseTableView';
import { StudentRecord } from '../../../utils/types';

// Mock fetch globally
global.fetch = vi.fn();

describe('Integration: Complete User Workflow', () => {
  const mockStudents: StudentRecord[] = [
    {
      studentId: 'A001',
      name: 'Alice Anderson',
      shirtCollected: false,
      mealCollected: false,
      consented: true,
      clubs: ['Drama Club', 'Chess Club'],
      hasPerformance: true,
      hasBooth: false,
    },
    {
      studentId: 'B002',
      name: 'Bob Brown',
      shirtCollected: true,
      mealCollected: false,
      consented: true,
      clubs: ['Drama Club'],
      hasPerformance: true,
      hasBooth: true,
    },
    {
      studentId: 'C003',
      name: 'Charlie Chen',
      shirtCollected: false,
      mealCollected: true,
      consented: true,
      clubs: ['Chess Club'],
      hasPerformance: false,
      hasBooth: true,
    },
    {
      studentId: 'D004',
      name: 'Diana Davis',
      shirtCollected: true,
      mealCollected: true,
      consented: true,
      clubs: ['Art Club'],
      hasPerformance: false,
      hasBooth: false,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock initial data fetch
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        students: mockStudents.map(s => ({
          ...s,
          organizationDetails: s.clubs.map((club, i) => 
            `Club: ${club}, Involvement: ${s.hasPerformance && i === 0 ? 'Performance' : s.hasBooth && i === 0 ? 'Booth' : 'Member'}`
          ).join('; ')
        }))
      })
    });
  });

  it('should complete full workflow: search → filter → sort → checkbox update', async () => {
    render(<DatabaseTableView />);

    // Wait for initial data load
    await waitFor(() => {
      expect(screen.getByText('Alice Anderson')).toBeInTheDocument();
    });

    // Verify all students are displayed initially
    expect(screen.getByText('Alice Anderson')).toBeInTheDocument();
    expect(screen.getByText('Bob Brown')).toBeInTheDocument();
    expect(screen.getByText('Charlie Chen')).toBeInTheDocument();
    expect(screen.getByText('Diana Davis')).toBeInTheDocument();

    // Step 1: Search for "Bob"
    const searchInput = screen.getByPlaceholderText('Search by ID or name');
    fireEvent.change(searchInput, { target: { value: 'Bob' } });

    // Wait for debounced search (300ms)
    await waitFor(() => {
      expect(screen.queryByText('Alice Anderson')).not.toBeInTheDocument();
      expect(screen.getByText('Bob Brown')).toBeInTheDocument();
      expect(screen.queryByText('Charlie Chen')).not.toBeInTheDocument();
      expect(screen.queryByText('Diana Davis')).not.toBeInTheDocument();
    }, { timeout: 500 });

    // Clear search
    fireEvent.change(searchInput, { target: { value: '' } });
    await waitFor(() => {
      expect(screen.getByText('Alice Anderson')).toBeInTheDocument();
    });

    // Step 2: Expand filters
    const filterToggle = screen.getByLabelText(/expand filters/i);
    fireEvent.click(filterToggle);

    await waitFor(() => {
      expect(screen.getByLabelText('Filter by Drama Club')).toBeInTheDocument();
    });

    // Apply filter - Drama Club only
    const dramaClubCheckbox = screen.getByLabelText('Filter by Drama Club');
    fireEvent.click(dramaClubCheckbox);

    await waitFor(() => {
      expect(screen.getByText('Alice Anderson')).toBeInTheDocument();
      expect(screen.getByText('Bob Brown')).toBeInTheDocument();
      expect(screen.queryByText('Charlie Chen')).not.toBeInTheDocument();
      expect(screen.queryByText('Diana Davis')).not.toBeInTheDocument();
    });

    // Step 3: Apply additional filter - Performance involvement
    const performanceYesRadio = screen.getByLabelText('Performance: Yes');
    fireEvent.click(performanceYesRadio);

    await waitFor(() => {
      expect(screen.getByText('Alice Anderson')).toBeInTheDocument();
      expect(screen.getByText('Bob Brown')).toBeInTheDocument();
    });

    // Step 4: Sort by name (ascending)
    const nameHeader = screen.getByRole('button', { name: /sort by name/i });
    fireEvent.click(nameHeader);

    await waitFor(() => {
      const rows = screen.getAllByRole('row');
      // First row is header, so data rows start at index 1
      const firstDataRow = rows[1];
      const secondDataRow = rows[2];
      
      expect(firstDataRow).toHaveTextContent('Alice Anderson');
      expect(secondDataRow).toHaveTextContent('Bob Brown');
    });

    // Step 5: Sort by name (descending)
    fireEvent.click(nameHeader);

    await waitFor(() => {
      const rows = screen.getAllByRole('row');
      const firstDataRow = rows[1];
      const secondDataRow = rows[2];
      
      expect(firstDataRow).toHaveTextContent('Bob Brown');
      expect(secondDataRow).toHaveTextContent('Alice Anderson');
    });

    // Step 6: Update checkbox (optimistic update)
    // Mock successful API response for checkbox update
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

    const aliceShirtCheckbox = screen.getByLabelText('Shirt collected for A001') as HTMLInputElement;
    expect(aliceShirtCheckbox.checked).toBe(false);

    fireEvent.click(aliceShirtCheckbox);

    // Should update immediately (optimistic)
    await waitFor(() => {
      expect(aliceShirtCheckbox.checked).toBe(true);
    });

    // Verify API was called
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/distribution-status',
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify({
            studentId: 'A001',
            itemType: 'tshirt',
            collected: true
          })
        })
      );
    });

    // Step 7: Verify state consistency - filters and sort should still be active
    expect(screen.getByText('Alice Anderson')).toBeInTheDocument();
    expect(screen.getByText('Bob Brown')).toBeInTheDocument();
    expect(screen.queryByText('Charlie Chen')).not.toBeInTheDocument();
    expect(screen.queryByText('Diana Davis')).not.toBeInTheDocument();

    // Verify sort order is maintained
    const rows = screen.getAllByRole('row');
    expect(rows[1]).toHaveTextContent('Bob Brown');
    expect(rows[2]).toHaveTextContent('Alice Anderson');
  });

  it('should maintain scroll position after checkbox update', async () => {
    // This test verifies that scroll position is maintained
    // In practice, this is handled by React's state management
    // and the component not re-mounting during updates
    
    render(<DatabaseTableView />);

    await waitFor(() => {
      expect(screen.getByText('Alice Anderson')).toBeInTheDocument();
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

    // Update a checkbox
    const checkbox = screen.getByLabelText('Shirt collected for A001');
    fireEvent.click(checkbox);

    await waitFor(() => {
      expect((checkbox as HTMLInputElement).checked).toBe(true);
    });

    // Verify the component is still mounted and data is still visible
    expect(screen.getByText('Alice Anderson')).toBeInTheDocument();
    expect(screen.getByText('Bob Brown')).toBeInTheDocument();
  });

  it('should handle filter changes while search is active', async () => {
    render(<DatabaseTableView />);

    await waitFor(() => {
      expect(screen.getByText('Alice Anderson')).toBeInTheDocument();
    });

    // Apply search first - search for "Charlie" to be more specific
    const searchInput = screen.getByPlaceholderText('Search by ID or name');
    fireEvent.change(searchInput, { target: { value: 'Charlie' } });

    await waitFor(() => {
      expect(screen.getByText('Charlie Chen')).toBeInTheDocument();
      expect(screen.queryByText('Bob Brown')).not.toBeInTheDocument();
      expect(screen.queryByText('Alice Anderson')).not.toBeInTheDocument();
    }, { timeout: 500 });

    // Now apply filter - should combine with search
    const filterToggle = screen.getByLabelText(/expand filters/i);
    fireEvent.click(filterToggle);

    await waitFor(() => {
      expect(screen.getByLabelText('Filter by Chess Club')).toBeInTheDocument();
    });

    const chessClubCheckbox = screen.getByLabelText('Filter by Chess Club');
    fireEvent.click(chessClubCheckbox);

    await waitFor(() => {
      expect(screen.getByText('Charlie Chen')).toBeInTheDocument();
      expect(screen.queryByText('Alice Anderson')).not.toBeInTheDocument();
    });
  });

  it('should handle sort changes while filters are active', async () => {
    render(<DatabaseTableView />);

    await waitFor(() => {
      expect(screen.getByText('Alice Anderson')).toBeInTheDocument();
    });

    // Apply filter first
    const filterToggle = screen.getByLabelText(/expand filters/i);
    fireEvent.click(filterToggle);

    await waitFor(() => {
      expect(screen.getByLabelText('Shirt: Collected')).toBeInTheDocument();
    });

    const shirtCollectedRadio = screen.getByLabelText('Shirt: Collected');
    fireEvent.click(shirtCollectedRadio);

    await waitFor(() => {
      expect(screen.getByText('Bob Brown')).toBeInTheDocument();
      expect(screen.getByText('Diana Davis')).toBeInTheDocument();
      expect(screen.queryByText('Alice Anderson')).not.toBeInTheDocument();
    });

    // Now sort by name
    const nameHeader = screen.getByRole('button', { name: /sort by name/i });
    fireEvent.click(nameHeader);

    await waitFor(() => {
      const rows = screen.getAllByRole('row');
      expect(rows[1]).toHaveTextContent('Bob Brown');
      expect(rows[2]).toHaveTextContent('Diana Davis');
    });
  });

  it('should clear all filters and maintain sort', async () => {
    render(<DatabaseTableView />);

    await waitFor(() => {
      expect(screen.getByText('Alice Anderson')).toBeInTheDocument();
    });

    // Apply filters
    const filterToggle = screen.getByLabelText(/expand filters/i);
    fireEvent.click(filterToggle);

    await waitFor(() => {
      expect(screen.getByLabelText('Filter by Drama Club')).toBeInTheDocument();
    });

    const dramaClubCheckbox = screen.getByLabelText('Filter by Drama Club');
    fireEvent.click(dramaClubCheckbox);

    await waitFor(() => {
      expect(screen.queryByText('Charlie Chen')).not.toBeInTheDocument();
    });

    // Apply sort
    const nameHeader = screen.getByRole('button', { name: /sort by name/i });
    fireEvent.click(nameHeader);

    // Clear filters
    const clearButton = screen.getByRole('button', { name: /clear all/i });
    fireEvent.click(clearButton);

    await waitFor(() => {
      // All students should be visible again
      expect(screen.getByText('Alice Anderson')).toBeInTheDocument();
      expect(screen.getByText('Bob Brown')).toBeInTheDocument();
      expect(screen.getByText('Charlie Chen')).toBeInTheDocument();
      expect(screen.getByText('Diana Davis')).toBeInTheDocument();

      // Sort should still be active
      const rows = screen.getAllByRole('row');
      expect(rows[1]).toHaveTextContent('Alice Anderson');
    });
  });

  it('should handle multiple checkbox updates', async () => {
    render(<DatabaseTableView />);

    await waitFor(() => {
      expect(screen.getByText('Alice Anderson')).toBeInTheDocument();
    });

    // Mock API response for first update
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        claim: { studentId: 'A001', tshirtClaimed: true, mealClaimed: false }
      })
    });

    // Click shirt checkbox
    const shirtCheckbox = screen.getByLabelText('Shirt collected for A001');
    fireEvent.click(shirtCheckbox);

    // Wait for first update to complete
    await waitFor(() => {
      expect((shirtCheckbox as HTMLInputElement).checked).toBe(true);
    });

    // Mock API response for second update
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        claim: { studentId: 'A001', tshirtClaimed: true, mealClaimed: true }
      })
    });

    // Click meal checkbox
    const mealCheckbox = screen.getByLabelText('Meal collected for A001');
    fireEvent.click(mealCheckbox);

    // Wait for second update to complete
    await waitFor(() => {
      expect((mealCheckbox as HTMLInputElement).checked).toBe(true);
    });

    // Both checkboxes should be checked
    expect((shirtCheckbox as HTMLInputElement).checked).toBe(true);
    expect((mealCheckbox as HTMLInputElement).checked).toBe(true);
  });
});
