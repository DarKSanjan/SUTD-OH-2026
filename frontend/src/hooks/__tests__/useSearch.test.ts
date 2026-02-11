import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSearch } from '../useSearch';

/**
 * Unit tests for useSearch hook
 * 
 * Tests:
 * - Search query updates
 * - Debouncing behavior
 * 
 * Requirements: 2.5
 */

describe('useSearch', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('search query updates', () => {
    it('should initialize with empty search query', () => {
      const { result } = renderHook(() => useSearch());

      expect(result.current.searchQuery).toBe('');
      expect(result.current.debouncedQuery).toBe('');
    });

    it('should update search query immediately', () => {
      const { result } = renderHook(() => useSearch());

      act(() => {
        result.current.setSearchQuery('test');
      });

      expect(result.current.searchQuery).toBe('test');
      // Debounced query should not update immediately
      expect(result.current.debouncedQuery).toBe('');
    });

    it('should allow multiple rapid updates to search query', () => {
      const { result } = renderHook(() => useSearch());

      act(() => {
        result.current.setSearchQuery('t');
      });
      expect(result.current.searchQuery).toBe('t');

      act(() => {
        result.current.setSearchQuery('te');
      });
      expect(result.current.searchQuery).toBe('te');

      act(() => {
        result.current.setSearchQuery('tes');
      });
      expect(result.current.searchQuery).toBe('tes');

      act(() => {
        result.current.setSearchQuery('test');
      });
      expect(result.current.searchQuery).toBe('test');

      // Debounced query should still be empty
      expect(result.current.debouncedQuery).toBe('');
    });
  });

  describe('debouncing behavior', () => {
    it('should debounce query updates with default 300ms delay', () => {
      const { result } = renderHook(() => useSearch());

      act(() => {
        result.current.setSearchQuery('test');
      });

      // Immediately after update
      expect(result.current.searchQuery).toBe('test');
      expect(result.current.debouncedQuery).toBe('');

      // After 299ms (just before debounce completes)
      act(() => {
        vi.advanceTimersByTime(299);
      });
      expect(result.current.debouncedQuery).toBe('');

      // After 300ms (debounce completes)
      act(() => {
        vi.advanceTimersByTime(1);
      });
      
      expect(result.current.debouncedQuery).toBe('test');
    });

    it('should debounce query updates with custom delay', () => {
      const { result } = renderHook(() => useSearch(500));

      act(() => {
        result.current.setSearchQuery('custom');
      });

      // After 300ms (should not update yet)
      act(() => {
        vi.advanceTimersByTime(300);
      });
      expect(result.current.debouncedQuery).toBe('');

      // After 500ms (debounce completes)
      act(() => {
        vi.advanceTimersByTime(200);
      });
      
      expect(result.current.debouncedQuery).toBe('custom');
    });

    it('should reset debounce timer on rapid updates', () => {
      const { result } = renderHook(() => useSearch(300));

      // First update
      act(() => {
        result.current.setSearchQuery('t');
      });

      // Wait 200ms
      act(() => {
        vi.advanceTimersByTime(200);
      });

      // Second update (resets timer)
      act(() => {
        result.current.setSearchQuery('te');
      });

      // Wait another 200ms (total 400ms from first update, but only 200ms from second)
      act(() => {
        vi.advanceTimersByTime(200);
      });

      // Debounced query should still be empty
      expect(result.current.debouncedQuery).toBe('');

      // Wait final 100ms (300ms from second update)
      act(() => {
        vi.advanceTimersByTime(100);
      });

      expect(result.current.debouncedQuery).toBe('te');
    });

    it('should only update debounced query once after rapid typing', () => {
      const { result } = renderHook(() => useSearch(300));

      // Simulate rapid typing
      act(() => {
        result.current.setSearchQuery('t');
      });
      act(() => {
        vi.advanceTimersByTime(50);
      });
      act(() => {
        result.current.setSearchQuery('te');
      });
      act(() => {
        vi.advanceTimersByTime(50);
      });
      act(() => {
        result.current.setSearchQuery('tes');
      });
      act(() => {
        vi.advanceTimersByTime(50);
      });
      act(() => {
        result.current.setSearchQuery('test');
      });

      // Debounced query should still be empty
      expect(result.current.debouncedQuery).toBe('');

      // Wait for debounce to complete (300ms from last update)
      act(() => {
        vi.advanceTimersByTime(300);
      });

      expect(result.current.debouncedQuery).toBe('test');

      // Should have only updated once to the final value
      expect(result.current.searchQuery).toBe('test');
    });

    it('should handle clearing search query', () => {
      const { result } = renderHook(() => useSearch(300));

      // Set initial query
      act(() => {
        result.current.setSearchQuery('test');
      });

      act(() => {
        vi.advanceTimersByTime(300);
      });

      expect(result.current.debouncedQuery).toBe('test');

      // Clear query
      act(() => {
        result.current.setSearchQuery('');
      });

      expect(result.current.searchQuery).toBe('');

      act(() => {
        vi.advanceTimersByTime(300);
      });

      expect(result.current.debouncedQuery).toBe('');
    });

    it('should cleanup timer on unmount', () => {
      const { result, unmount } = renderHook(() => useSearch(300));

      act(() => {
        result.current.setSearchQuery('test');
      });

      // Unmount before debounce completes
      unmount();

      // Advance timers
      act(() => {
        vi.advanceTimersByTime(300);
      });

      // Should not throw or cause issues
      expect(vi.getTimerCount()).toBe(0);
    });

    it('should update debounced query when delay changes', () => {
      const { result, rerender } = renderHook(
        ({ delay }) => useSearch(delay),
        { initialProps: { delay: 300 } }
      );

      act(() => {
        result.current.setSearchQuery('test');
      });

      // Change delay
      rerender({ delay: 500 });

      // Original 300ms should not trigger update
      act(() => {
        vi.advanceTimersByTime(300);
      });
      expect(result.current.debouncedQuery).toBe('');

      // New 500ms delay should trigger update
      act(() => {
        vi.advanceTimersByTime(200);
      });

      expect(result.current.debouncedQuery).toBe('test');
    });
  });

  describe('edge cases', () => {
    it('should handle empty string query', () => {
      const { result } = renderHook(() => useSearch());

      act(() => {
        result.current.setSearchQuery('');
      });

      act(() => {
        vi.advanceTimersByTime(300);
      });

      expect(result.current.debouncedQuery).toBe('');
    });

    it('should handle whitespace-only query', () => {
      const { result } = renderHook(() => useSearch());

      act(() => {
        result.current.setSearchQuery('   ');
      });

      act(() => {
        vi.advanceTimersByTime(300);
      });

      expect(result.current.debouncedQuery).toBe('   ');
    });

    it('should handle special characters in query', () => {
      const { result } = renderHook(() => useSearch());

      act(() => {
        result.current.setSearchQuery('test@#$%');
      });

      act(() => {
        vi.advanceTimersByTime(300);
      });

      expect(result.current.debouncedQuery).toBe('test@#$%');
    });

    it('should handle very long query strings', () => {
      const { result } = renderHook(() => useSearch());

      const longQuery = 'a'.repeat(1000);
      act(() => {
        result.current.setSearchQuery(longQuery);
      });

      act(() => {
        vi.advanceTimersByTime(300);
      });

      expect(result.current.debouncedQuery).toBe(longQuery);
    });

    it('should handle zero delay', () => {
      const { result } = renderHook(() => useSearch(0));

      act(() => {
        result.current.setSearchQuery('instant');
      });

      act(() => {
        vi.advanceTimersByTime(0);
      });

      expect(result.current.debouncedQuery).toBe('instant');
    });
  });
});
