import { renderHook, act } from '@testing-library/react';
import { useSort } from '../useSort';
import { SortableColumn } from '../../utils/types';

describe('useSort', () => {
  it('should initialize with no sorting', () => {
    const { result } = renderHook(() => useSort());

    expect(result.current.sortColumn).toBeNull();
    expect(result.current.sortDirection).toBeNull();
  });

  it('should sort ascending on first click', () => {
    const { result } = renderHook(() => useSort());

    act(() => {
      result.current.handleSort('name');
    });

    expect(result.current.sortColumn).toBe('name');
    expect(result.current.sortDirection).toBe('asc');
  });

  it('should toggle to descending on second click of same column', () => {
    const { result } = renderHook(() => useSort());

    act(() => {
      result.current.handleSort('name');
    });

    act(() => {
      result.current.handleSort('name');
    });

    expect(result.current.sortColumn).toBe('name');
    expect(result.current.sortDirection).toBe('desc');
  });

  it('should remove sorting on third click of same column', () => {
    const { result } = renderHook(() => useSort());

    act(() => {
      result.current.handleSort('name');
    });

    act(() => {
      result.current.handleSort('name');
    });

    act(() => {
      result.current.handleSort('name');
    });

    expect(result.current.sortColumn).toBeNull();
    expect(result.current.sortDirection).toBeNull();
  });

  it('should reset to ascending when switching to a different column', () => {
    const { result } = renderHook(() => useSort());

    // Sort by name descending
    act(() => {
      result.current.handleSort('name');
    });

    act(() => {
      result.current.handleSort('name');
    });

    expect(result.current.sortColumn).toBe('name');
    expect(result.current.sortDirection).toBe('desc');

    // Switch to studentId
    act(() => {
      result.current.handleSort('studentId');
    });

    expect(result.current.sortColumn).toBe('studentId');
    expect(result.current.sortDirection).toBe('asc');
  });

  it('should handle all sortable columns', () => {
    const { result } = renderHook(() => useSort());
    const columns: SortableColumn[] = ['studentId', 'name', 'shirtCollected', 'mealCollected'];

    columns.forEach(column => {
      act(() => {
        result.current.handleSort(column);
      });

      expect(result.current.sortColumn).toBe(column);
      expect(result.current.sortDirection).toBe('asc');
    });
  });

  it('should maintain independent state across multiple hook instances', () => {
    const { result: result1 } = renderHook(() => useSort());
    const { result: result2 } = renderHook(() => useSort());

    act(() => {
      result1.current.handleSort('name');
    });

    expect(result1.current.sortColumn).toBe('name');
    expect(result1.current.sortDirection).toBe('asc');
    expect(result2.current.sortColumn).toBeNull();
    expect(result2.current.sortDirection).toBeNull();
  });

  it('should cycle through sort states correctly', () => {
    const { result } = renderHook(() => useSort());

    // First click: asc
    act(() => {
      result.current.handleSort('studentId');
    });
    expect(result.current.sortDirection).toBe('asc');

    // Second click: desc
    act(() => {
      result.current.handleSort('studentId');
    });
    expect(result.current.sortDirection).toBe('desc');

    // Third click: null
    act(() => {
      result.current.handleSort('studentId');
    });
    expect(result.current.sortDirection).toBeNull();

    // Fourth click: back to asc
    act(() => {
      result.current.handleSort('studentId');
    });
    expect(result.current.sortDirection).toBe('asc');
  });
});
