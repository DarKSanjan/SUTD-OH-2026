import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useOptimisticUpdate } from '../useOptimisticUpdate';
import { StudentRecord } from '../../utils/types';

describe('useOptimisticUpdate', () => {
  let mockStudents: StudentRecord[];
  let mockSetStudents: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    // Reset mocks
    mockSetStudents = vi.fn((updater) => {
      if (typeof updater === 'function') {
        mockStudents = updater(mockStudents);
      }
    });

    // Mock student data
    mockStudents = [
      {
        studentId: 'TEST001',
        name: 'John Doe',
        shirtCollected: false,
        mealCollected: false,
        consented: true,
        clubs: ['Drama Club'],
        hasPerformance: true,
        hasBooth: false
      },
      {
        studentId: 'TEST002',
        name: 'Jane Smith',
        shirtCollected: true,
        mealCollected: false,
        consented: true,
        clubs: ['Music Club'],
        hasPerformance: false,
        hasBooth: true
      }
    ];

    // Mock fetch
    globalThis.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Successful Updates', () => {
    it('should update shirt status optimistically and confirm on success', async () => {
      // Mock successful API response
      (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          claim: {
            studentId: 'TEST001',
            tshirtClaimed: true,
            mealClaimed: false
          }
        })
      });

      const { result } = renderHook(() => 
        useOptimisticUpdate(mockStudents, mockSetStudents)
      );

      // Call update
      await act(async () => {
        await result.current.updateClaimStatus('TEST001', 'tshirt', true);
      });

      // Verify API was called with correct parameters
      expect(globalThis.fetch).toHaveBeenCalledWith('/api/distribution-status', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentId: 'TEST001',
          itemType: 'tshirt',
          collected: true
        })
      });

      // Verify state was updated (optimistically and confirmed)
      expect(mockSetStudents).toHaveBeenCalled();
      
      // Verify no error
      expect(result.current.error).toBeNull();
      
      // Verify pending updates cleared
      expect(result.current.pendingUpdates.size).toBe(0);
    });

    it('should update meal status optimistically and confirm on success', async () => {
      // Mock successful API response
      (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          claim: {
            studentId: 'TEST002',
            tshirtClaimed: true,
            mealClaimed: true
          }
        })
      });

      const { result } = renderHook(() => 
        useOptimisticUpdate(mockStudents, mockSetStudents)
      );

      await act(async () => {
        await result.current.updateClaimStatus('TEST002', 'meal', true);
      });

      expect(globalThis.fetch).toHaveBeenCalledWith('/api/distribution-status', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentId: 'TEST002',
          itemType: 'meal',
          collected: true
        })
      });

      expect(result.current.error).toBeNull();
      expect(result.current.pendingUpdates.size).toBe(0);
    });

    it('should handle unchecking (setting to false)', async () => {
      // Mock successful API response
      (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          claim: {
            studentId: 'TEST002',
            tshirtClaimed: false,
            mealClaimed: false
          }
        })
      });

      const { result } = renderHook(() => 
        useOptimisticUpdate(mockStudents, mockSetStudents)
      );

      await act(async () => {
        await result.current.updateClaimStatus('TEST002', 'tshirt', false);
      });

      expect(globalThis.fetch).toHaveBeenCalledWith('/api/distribution-status', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentId: 'TEST002',
          itemType: 'tshirt',
          collected: false
        })
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('Error Handling and Rollback', () => {
    it('should rollback on network error', async () => {
      // Mock network error
      (globalThis.fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
        new Error('Failed to fetch')
      );

      const { result } = renderHook(() => 
        useOptimisticUpdate(mockStudents, mockSetStudents)
      );

      await act(async () => {
        await result.current.updateClaimStatus('TEST001', 'tshirt', true);
      });

      // Verify error message
      expect(result.current.error).toContain('Unable to connect to server');
      
      // Verify state was rolled back (called twice: optimistic + rollback)
      expect(mockSetStudents).toHaveBeenCalledTimes(2);
      
      // Verify pending updates cleared
      expect(result.current.pendingUpdates.size).toBe(0);
    });

    it('should rollback on HTTP error', async () => {
      // Mock HTTP error
      (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({
          error: 'Internal server error'
        })
      });

      const { result } = renderHook(() => 
        useOptimisticUpdate(mockStudents, mockSetStudents)
      );

      await act(async () => {
        await result.current.updateClaimStatus('TEST001', 'meal', true);
      });

      expect(result.current.error).toBe('Internal server error');
      expect(mockSetStudents).toHaveBeenCalledTimes(2); // optimistic + rollback
    });

    it('should rollback on invalid response format', async () => {
      // Mock invalid response
      (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: false // Missing claim data
        })
      });

      const { result } = renderHook(() => 
        useOptimisticUpdate(mockStudents, mockSetStudents)
      );

      await act(async () => {
        await result.current.updateClaimStatus('TEST001', 'tshirt', true);
      });

      expect(result.current.error).toBe('Invalid response format from server');
      expect(mockSetStudents).toHaveBeenCalledTimes(2);
    });

    it('should handle 404 student not found error', async () => {
      // Mock 404 error
      (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({
          error: 'Student not found'
        })
      });

      const { result } = renderHook(() => 
        useOptimisticUpdate(mockStudents, mockSetStudents)
      );

      await act(async () => {
        await result.current.updateClaimStatus('TEST001', 'tshirt', true);
      });

      expect(result.current.error).toContain('Student not found');
    });

    it('should handle student not in local state', async () => {
      const { result } = renderHook(() => 
        useOptimisticUpdate(mockStudents, mockSetStudents)
      );

      await act(async () => {
        await result.current.updateClaimStatus('NONEXISTENT', 'tshirt', true);
      });

      expect(result.current.error).toBe('Student not found');
      expect(globalThis.fetch).not.toHaveBeenCalled(); // Should not call API
    });
  });

  describe('Race Condition Prevention', () => {
    it('should prevent concurrent updates to the same checkbox', async () => {
      // Mock slow API response
      (globalThis.fetch as ReturnType<typeof vi.fn>).mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({
          ok: true,
          json: async () => ({
            success: true,
            claim: {
              studentId: 'TEST001',
              tshirtClaimed: true,
              mealClaimed: false
            }
          })
        }), 100))
      );

      const { result } = renderHook(() => 
        useOptimisticUpdate(mockStudents, mockSetStudents)
      );

      // Start first update
      act(() => {
        result.current.updateClaimStatus('TEST001', 'tshirt', true);
      });

      // Verify update is pending
      expect(result.current.pendingUpdates.has('TEST001-tshirt')).toBe(true);

      // Try to start second update (should be ignored)
      await act(async () => {
        await result.current.updateClaimStatus('TEST001', 'tshirt', false);
      });

      // Should only call API once
      await waitFor(() => {
        expect(globalThis.fetch).toHaveBeenCalledTimes(1);
      });
    });

    it('should allow concurrent updates to different checkboxes', async () => {
      // Mock API responses
      (globalThis.fetch as ReturnType<typeof vi.fn>)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            success: true,
            claim: {
              studentId: 'TEST001',
              tshirtClaimed: true,
              mealClaimed: false
            }
          })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            success: true,
            claim: {
              studentId: 'TEST001',
              tshirtClaimed: true,
              mealClaimed: true
            }
          })
        });

      const { result } = renderHook(() => 
        useOptimisticUpdate(mockStudents, mockSetStudents)
      );

      // Start both updates
      await act(async () => {
        await Promise.all([
          result.current.updateClaimStatus('TEST001', 'tshirt', true),
          result.current.updateClaimStatus('TEST001', 'meal', true)
        ]);
      });

      // Should call API twice (different checkboxes)
      expect(globalThis.fetch).toHaveBeenCalledTimes(2);
      expect(result.current.error).toBeNull();
    });

    it('should track pending updates correctly', async () => {
      // Mock slow API
      let resolvePromise: any;
      (globalThis.fetch as ReturnType<typeof vi.fn>).mockImplementation(() => 
        new Promise(resolve => {
          resolvePromise = resolve;
        })
      );

      const { result } = renderHook(() => 
        useOptimisticUpdate(mockStudents, mockSetStudents)
      );

      // Start update
      act(() => {
        result.current.updateClaimStatus('TEST001', 'tshirt', true);
      });

      // Check pending state
      await waitFor(() => {
        expect(result.current.pendingUpdates.has('TEST001-tshirt')).toBe(true);
      });

      // Resolve API call
      await act(async () => {
        resolvePromise({
          ok: true,
          json: async () => ({
            success: true,
            claim: {
              studentId: 'TEST001',
              tshirtClaimed: true,
              mealClaimed: false
            }
          })
        });
      });

      // Check pending state cleared
      await waitFor(() => {
        expect(result.current.pendingUpdates.has('TEST001-tshirt')).toBe(false);
      });
    });
  });

  describe('Error Management', () => {
    it('should clear error when clearError is called', async () => {
      // Mock error
      (globalThis.fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
        new Error('Network error')
      );

      const { result } = renderHook(() => 
        useOptimisticUpdate(mockStudents, mockSetStudents)
      );

      // Trigger error
      await act(async () => {
        await result.current.updateClaimStatus('TEST001', 'tshirt', true);
      });

      expect(result.current.error).not.toBeNull();

      // Clear error
      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });

    it('should clear previous error on new update', async () => {
      // Mock first error
      (globalThis.fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
        new Error('Failed to fetch')
      );

      const { result } = renderHook(() => 
        useOptimisticUpdate(mockStudents, mockSetStudents)
      );

      // Trigger first error
      await act(async () => {
        await result.current.updateClaimStatus('TEST001', 'tshirt', true);
      });

      expect(result.current.error).toContain('Unable to connect to server');

      // Mock successful second update
      (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          claim: {
            studentId: 'TEST001',
            tshirtClaimed: true,
            mealClaimed: false
          }
        })
      });

      // Trigger second update
      await act(async () => {
        await result.current.updateClaimStatus('TEST001', 'tshirt', true);
      });

      // Error should be cleared
      expect(result.current.error).toBeNull();
    });
  });

  describe('State Updates', () => {
    it('should update only the target student', async () => {
      (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          claim: {
            studentId: 'TEST001',
            tshirtClaimed: true,
            mealClaimed: false
          }
        })
      });

      const { result } = renderHook(() => 
        useOptimisticUpdate(mockStudents, mockSetStudents)
      );

      await act(async () => {
        await result.current.updateClaimStatus('TEST001', 'tshirt', true);
      });

      // Verify setStudents was called with updater function
      expect(mockSetStudents).toHaveBeenCalled();
      
      // The updater function should only modify TEST001
      const updaterFn = mockSetStudents.mock.calls[0][0];
      const updatedStudents = updaterFn(mockStudents);
      
      expect(updatedStudents[0].shirtCollected).toBe(true);
      expect(updatedStudents[1].shirtCollected).toBe(true); // Unchanged
    });

    it('should not affect other fields when updating shirt', async () => {
      (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          claim: {
            studentId: 'TEST001',
            tshirtClaimed: true,
            mealClaimed: false
          }
        })
      });

      const { result } = renderHook(() => 
        useOptimisticUpdate(mockStudents, mockSetStudents)
      );

      await act(async () => {
        await result.current.updateClaimStatus('TEST001', 'tshirt', true);
      });

      const updaterFn = mockSetStudents.mock.calls[0][0];
      const updatedStudents = updaterFn(mockStudents);
      
      // Other fields should remain unchanged
      expect(updatedStudents[0].mealCollected).toBe(false);
      expect(updatedStudents[0].name).toBe('John Doe');
      expect(updatedStudents[0].clubs).toEqual(['Drama Club']);
    });

    it('should not affect other fields when updating meal', async () => {
      (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          claim: {
            studentId: 'TEST002',
            tshirtClaimed: true,
            mealClaimed: true
          }
        })
      });

      const { result } = renderHook(() => 
        useOptimisticUpdate(mockStudents, mockSetStudents)
      );

      await act(async () => {
        await result.current.updateClaimStatus('TEST002', 'meal', true);
      });

      const updaterFn = mockSetStudents.mock.calls[0][0];
      const updatedStudents = updaterFn(mockStudents);
      
      // Other fields should remain unchanged
      expect(updatedStudents[1].shirtCollected).toBe(true);
      expect(updatedStudents[1].name).toBe('Jane Smith');
      expect(updatedStudents[1].hasBooth).toBe(true);
    });
  });
});
