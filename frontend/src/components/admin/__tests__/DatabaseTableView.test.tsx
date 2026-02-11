import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import DatabaseTableView from '../DatabaseTableView';

// Mock fetch globally
global.fetch = vi.fn();

describe('DatabaseTableView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Rendering with Data', () => {
    it('should render table with student data', async () => {
      const mockStudents = [
        {
          studentId: 'TEST001',
          name: 'John Doe',
          shirtCollected: true,
          mealCollected: false,
          consented: true,
          organizationDetails: ''
        },
        {
          studentId: 'TEST002',
          name: 'Jane Smith',
          shirtCollected: false,
          mealCollected: true,
          consented: false,
          organizationDetails: ''
        }
      ];

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          students: mockStudents,
          total: 2
        })
      });

      render(<DatabaseTableView />);

      await waitFor(() => {
        expect(screen.getByText('TEST001')).toBeInTheDocument();
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('TEST002')).toBeInTheDocument();
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      });
    });

    it('should display all required columns', async () => {
      const mockStudents = [
        {
          studentId: 'TEST001',
          name: 'John Doe',
          shirtCollected: true,
          mealCollected: false,
          consented: true,
          organizationDetails: ''
        }
      ];

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          students: mockStudents,
          total: 1
        })
      });

      render(<DatabaseTableView />);

      await waitFor(() => {
        expect(screen.getByText('Student ID')).toBeInTheDocument();
        expect(screen.getByText('Name')).toBeInTheDocument();
        expect(screen.getByText('Clubs')).toBeInTheDocument();
        expect(screen.getByText('Involvement')).toBeInTheDocument();
        expect(screen.getByText('T-shirt Size')).toBeInTheDocument();
        expect(screen.getByText('Meal Preference')).toBeInTheDocument();
        expect(screen.getByText('Shirt Collected')).toBeInTheDocument();
        expect(screen.getByText('Meal Collected')).toBeInTheDocument();
        expect(screen.getByText('Consent')).toBeInTheDocument();
      });
    });

    it('should display record count', async () => {
      const mockStudents = [
        {
          studentId: 'TEST001',
          name: 'John Doe',
          shirtCollected: true,
          mealCollected: false,
          consented: true,
          organizationDetails: ''
        },
        {
          studentId: 'TEST002',
          name: 'Jane Smith',
          shirtCollected: false,
          mealCollected: true,
          consented: false,
          organizationDetails: ''
        }
      ];

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          students: mockStudents,
          total: 2
        })
      });

      render(<DatabaseTableView />);

      await waitFor(() => {
        expect(screen.getByText(/2 of 2 students/i)).toBeInTheDocument();
      });
    });

    it('should display singular form for one student', async () => {
      const mockStudents = [
        {
          studentId: 'TEST001',
          name: 'John Doe',
          shirtCollected: true,
          mealCollected: false,
          consented: true,
          organizationDetails: ''
        }
      ];

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          students: mockStudents,
          total: 1
        })
      });

      render(<DatabaseTableView />);

      await waitFor(() => {
        expect(screen.getByText(/1 of 1 student/i)).toBeInTheDocument();
      });
    });

    it('should render multiple students correctly', async () => {
      const mockStudents = [
        {
          studentId: 'TEST001',
          name: 'Student One',
          shirtCollected: true,
          mealCollected: true,
          consented: true,
          organizationDetails: ''
        },
        {
          studentId: 'TEST002',
          name: 'Student Two',
          shirtCollected: false,
          mealCollected: false,
          consented: false,
          organizationDetails: ''
        },
        {
          studentId: 'TEST003',
          name: 'Student Three',
          shirtCollected: true,
          mealCollected: false,
          consented: true,
          organizationDetails: ''
        }
      ];

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          students: mockStudents,
          total: 3
        })
      });

      render(<DatabaseTableView />);

      await waitFor(() => {
        expect(screen.getByText('TEST001')).toBeInTheDocument();
        expect(screen.getByText('TEST002')).toBeInTheDocument();
        expect(screen.getByText('TEST003')).toBeInTheDocument();
      });
    });
  });

  describe('Loading State', () => {
    it('should show loading spinner initially', () => {
      // Create a promise that never resolves to keep loading state
      (global.fetch as any).mockReturnValueOnce(new Promise(() => {}));

      render(<DatabaseTableView />);

      expect(screen.getByText('Loading student records...')).toBeInTheDocument();
      expect(document.querySelector('.loading-spinner-large')).toBeInTheDocument();
    });

    it('should hide loading state after data loads', async () => {
      const mockStudents = [
        {
          studentId: 'TEST001',
          name: 'John Doe',
          shirtCollected: true,
          mealCollected: false,
          consented: true,
          organizationDetails: 'Club: Chess Club, Involvement: Performance'
        }
      ];

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          students: mockStudents,
          total: 1
        })
      });

      render(<DatabaseTableView />);

      await waitFor(() => {
        expect(screen.queryByText('Loading student records...')).not.toBeInTheDocument();
      });
    });
  });

  describe('Error State', () => {
    it('should display error message on fetch failure', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

      render(<DatabaseTableView />);

      await waitFor(() => {
        expect(screen.getByText(/network error/i)).toBeInTheDocument();
      });
    });

    it('should display error message on HTTP error', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({})
      });

      render(<DatabaseTableView />);

      await waitFor(() => {
        expect(screen.getByText(/http error/i)).toBeInTheDocument();
      });
    });

    it('should show retry button on error', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

      render(<DatabaseTableView />);

      await waitFor(() => {
        expect(screen.getByText('Retry')).toBeInTheDocument();
      });
    });

    it('should retry fetch when retry button is clicked', async () => {
      // First call fails
      (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

      render(<DatabaseTableView />);

      await waitFor(() => {
        expect(screen.getByText('Retry')).toBeInTheDocument();
      });

      // Second call succeeds
      const mockStudents = [
        {
          studentId: 'TEST001',
          name: 'John Doe',
          shirtCollected: true,
          mealCollected: false,
          consented: true
        }
      ];

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          students: mockStudents,
          total: 1
        })
      });

      const retryButton = screen.getByText('Retry');
      fireEvent.click(retryButton);

      await waitFor(() => {
        expect(screen.getByText('TEST001')).toBeInTheDocument();
      });
    });

    it('should handle invalid response format', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          success: false
        })
      });

      render(<DatabaseTableView />);

      await waitFor(() => {
        expect(screen.getByText(/invalid response format/i)).toBeInTheDocument();
      });
    });
  });

  describe('Empty State', () => {
    it('should display empty state when no students exist', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          students: [],
          total: 0
        })
      });

      render(<DatabaseTableView />);

      await waitFor(() => {
        expect(screen.getByText('No student records found in the database.')).toBeInTheDocument();
      });
    });

    it('should display empty state when search/filter returns no results', async () => {
      const mockStudents = [
        {
          studentId: 'TEST001',
          name: 'John Doe',
          shirtCollected: true,
          mealCollected: false,
          consented: true,
          organizationDetails: 'Club: Chess Club, Involvement: Performance'
        }
      ];

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          students: mockStudents,
          total: 1
        })
      });

      render(<DatabaseTableView />);

      await waitFor(() => {
        expect(screen.getByText('TEST001')).toBeInTheDocument();
      });

      // Search for non-existent student
      const searchInput = screen.getByRole('searchbox');
      fireEvent.change(searchInput, { target: { value: 'NonExistent' } });

      await waitFor(() => {
        expect(screen.getByText('No students match your search or filter criteria.')).toBeInTheDocument();
      });
    });
  });

  describe('API Integration', () => {
    it('should call correct API endpoint', async () => {
      const mockStudents = [
        {
          studentId: 'TEST001',
          name: 'John Doe',
          shirtCollected: true,
          mealCollected: false,
          consented: true,
          organizationDetails: ''
        }
      ];

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          students: mockStudents,
          total: 1
        })
      });

      render(<DatabaseTableView />);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/students/all');
      });
    });

    it('should fetch data on component mount', async () => {
      const mockStudents = [
        {
          studentId: 'TEST001',
          name: 'John Doe',
          shirtCollected: true,
          mealCollected: false,
          consented: true,
          organizationDetails: ''
        }
      ];

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          students: mockStudents,
          total: 1
        })
      });

      render(<DatabaseTableView />);

      expect(global.fetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('Enhanced Features', () => {
    it('should render search bar', async () => {
      const mockStudents = [
        {
          studentId: 'TEST001',
          name: 'John Doe',
          shirtCollected: true,
          mealCollected: false,
          consented: true,
          organizationDetails: ''
        }
      ];

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          students: mockStudents,
          total: 1
        })
      });

      render(<DatabaseTableView />);

      await waitFor(() => {
        expect(screen.getByRole('searchbox')).toBeInTheDocument();
      });
    });

    it('should render filter panel', async () => {
      const mockStudents = [
        {
          studentId: 'TEST001',
          name: 'John Doe',
          shirtCollected: true,
          mealCollected: false,
          consented: true,
          organizationDetails: ''
        }
      ];

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          students: mockStudents,
          total: 1
        })
      });

      render(<DatabaseTableView />);

      await waitFor(() => {
        expect(screen.getByText('Filters')).toBeInTheDocument();
      });
    });

    it('should render sortable column headers', async () => {
      const mockStudents = [
        {
          studentId: 'TEST001',
          name: 'John Doe',
          shirtCollected: true,
          mealCollected: false,
          consented: true,
          organizationDetails: ''
        }
      ];

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          students: mockStudents,
          total: 1
        })
      });

      render(<DatabaseTableView />);

      await waitFor(() => {
        expect(screen.getByLabelText(/Sort by Student ID/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Sort by Name/i)).toBeInTheDocument();
      });
    });

    it('should render interactive checkboxes', async () => {
      const mockStudents = [
        {
          studentId: 'TEST001',
          name: 'John Doe',
          shirtCollected: true,
          mealCollected: false,
          consented: true,
          organizationDetails: ''
        }
      ];

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          students: mockStudents,
          total: 1
        })
      });

      render(<DatabaseTableView />);

      await waitFor(() => {
        expect(screen.getByLabelText('Shirt collected for TEST001')).toBeInTheDocument();
        expect(screen.getByLabelText('Meal collected for TEST001')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper table structure', async () => {
      const mockStudents = [
        {
          studentId: 'TEST001',
          name: 'John Doe',
          shirtCollected: true,
          mealCollected: false,
          consented: true,
          organizationDetails: ''
        }
      ];

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          students: mockStudents,
          total: 1
        })
      });

      render(<DatabaseTableView />);

      await waitFor(() => {
        const table = document.querySelector('table');
        expect(table).toBeInTheDocument();
        
        const thead = table?.querySelector('thead');
        expect(thead).toBeInTheDocument();
        
        const tbody = table?.querySelector('tbody');
        expect(tbody).toBeInTheDocument();
      });
    });

    it('should have aria-labels on interactive elements', async () => {
      const mockStudents = [
        {
          studentId: 'TEST001',
          name: 'John Doe',
          shirtCollected: true,
          mealCollected: false,
          consented: true,
          organizationDetails: ''
        }
      ];

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          students: mockStudents,
          total: 1
        })
      });

      render(<DatabaseTableView />);

      await waitFor(() => {
        expect(screen.getByLabelText('Search students by ID or name')).toBeInTheDocument();
        expect(screen.getByLabelText('Shirt collected for TEST001')).toBeInTheDocument();
        expect(screen.getByLabelText('Meal collected for TEST001')).toBeInTheDocument();
      });
    });
  });
});
