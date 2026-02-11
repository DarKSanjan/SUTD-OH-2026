import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useTableData } from '../useTableData';

/**
 * Unit tests for useTableData hook
 * 
 * Tests:
 * - Successful data fetch and parsing
 * - Error handling with retry
 * - API response validation
 * 
 * Requirements: 9.4, 9.5
 */

describe('useTableData', () => {
  // Store original fetch
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    // Reset fetch mock before each test
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Restore original fetch
    globalThis.fetch = originalFetch;
  });

  describe('successful data fetch and parsing', () => {
    it('should fetch and parse student data correctly', async () => {
      const mockStudents = [
        {
          studentId: 'TEST001',
          name: 'John Doe',
          shirtCollected: true,
          mealCollected: false,
          consented: true,
          organizationDetails: 'Club: Tech Club, Involvement: Performance'
        },
        {
          studentId: 'TEST002',
          name: 'Jane Smith',
          shirtCollected: false,
          mealCollected: true,
          consented: true,
          organizationDetails: 'Club: Art Club, Involvement: Booth'
        }
      ];

      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          students: mockStudents,
          total: 2
        })
      });

      const { result } = renderHook(() => useTableData());

      // Initially loading
      expect(result.current.isLoading).toBe(true);
      expect(result.current.students).toEqual([]);
      expect(result.current.error).toBeNull();

      // Wait for data to load
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Verify parsed data
      expect(result.current.students).toHaveLength(2);
      
      // First student
      expect(result.current.students[0]).toEqual({
        studentId: 'TEST001',
        name: 'John Doe',
        tshirtSize: '',
        mealPreference: '',
        shirtCollected: true,
        mealCollected: false,
        consented: true,
        clubs: ['Tech Club'],
        hasPerformance: true,
        hasBooth: false
      });

      // Second student
      expect(result.current.students[1]).toEqual({
        studentId: 'TEST002',
        name: 'Jane Smith',
        tshirtSize: '',
        mealPreference: '',
        shirtCollected: false,
        mealCollected: true,
        consented: true,
        clubs: ['Art Club'],
        hasPerformance: false,
        hasBooth: true
      });

      expect(result.current.error).toBeNull();
    });

    it('should handle students with no organization details', async () => {
      const mockStudents = [
        {
          studentId: 'TEST003',
          name: 'Bob Johnson',
          shirtCollected: false,
          mealCollected: false,
          consented: true,
          organizationDetails: undefined
        }
      ];

      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          students: mockStudents
        })
      });

      const { result } = renderHook(() => useTableData());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.students[0]).toEqual({
        studentId: 'TEST003',
        name: 'Bob Johnson',
        tshirtSize: '',
        mealPreference: '',
        shirtCollected: false,
        mealCollected: false,
        consented: true,
        clubs: [],
        hasPerformance: false,
        hasBooth: false
      });
    });

    it('should handle multiple clubs in organization details', async () => {
      const mockStudents = [
        {
          studentId: 'TEST004',
          name: 'Alice Brown',
          shirtCollected: true,
          mealCollected: true,
          consented: true,
          organizationDetails: 'Club: Tech Club, Involvement: Performance; Club: Music Club, Involvement: Booth'
        }
      ];

      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          students: mockStudents
        })
      });

      const { result } = renderHook(() => useTableData());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.students[0].clubs).toEqual(['Tech Club', 'Music Club']);
      expect(result.current.students[0].hasPerformance).toBe(true);
      expect(result.current.students[0].hasBooth).toBe(true);
    });
  });

  describe('error handling', () => {
    it('should handle network errors', async () => {
      globalThis.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useTableData());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBe('Network error');
      expect(result.current.students).toEqual([]);
    });

    it('should handle HTTP errors', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500
      });

      const { result } = renderHook(() => useTableData());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBe('HTTP error! status: 500');
      expect(result.current.students).toEqual([]);
    });

    it('should retry fetching data when refetch is called', async () => {
      // First call fails
      globalThis.fetch = vi.fn().mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useTableData());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBe('Network error');

      // Mock successful response for retry
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          students: [
            {
              studentId: 'TEST001',
              name: 'John Doe',
              shirtCollected: true,
              mealCollected: false,
              consented: true,
              organizationDetails: undefined
            }
          ]
        })
      });

      // Retry
      await result.current.refetch();

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBeNull();
      expect(result.current.students).toHaveLength(1);
    });
  });

  describe('API response validation', () => {
    it('should reject response with missing success field', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          students: []
        })
      });

      const { result } = renderHook(() => useTableData());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBe('Invalid response format from server');
      expect(result.current.students).toEqual([]);
    });

    it('should reject response with non-array students field', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          students: 'not an array'
        })
      });

      const { result } = renderHook(() => useTableData());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBe('Invalid response format from server');
    });

    it('should reject response with invalid student records', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          students: [
            {
              studentId: 'TEST001',
              // Missing required fields
              name: 'John Doe'
            }
          ]
        })
      });

      const { result } = renderHook(() => useTableData());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBe('Invalid response format from server');
    });

    it('should accept valid response with all required fields', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          students: [
            {
              studentId: 'TEST001',
              name: 'John Doe',
              shirtCollected: true,
              mealCollected: false,
              consented: true
            }
          ]
        })
      });

      const { result } = renderHook(() => useTableData());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBeNull();
      expect(result.current.students).toHaveLength(1);
    });
  });

  describe('loading states', () => {
    it('should set loading to true during fetch', async () => {
      let resolvePromise: (value: any) => void;
      const fetchPromise = new Promise((resolve) => {
        resolvePromise = resolve;
      });

      globalThis.fetch = vi.fn().mockReturnValue(fetchPromise);

      const { result } = renderHook(() => useTableData());

      // Should be loading immediately
      expect(result.current.isLoading).toBe(true);

      // Resolve the promise
      resolvePromise!({
        ok: true,
        json: async () => ({
          success: true,
          students: []
        })
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });

    it('should clear error when refetching', async () => {
      // First call fails
      globalThis.fetch = vi.fn().mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useTableData());

      await waitFor(() => {
        expect(result.current.error).toBe('Network error');
      });

      // Mock successful response
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          students: []
        })
      });

      // Refetch should clear error
      await result.current.refetch();

      await waitFor(() => {
        expect(result.current.error).toBeNull();
      });
    });
  });
});
