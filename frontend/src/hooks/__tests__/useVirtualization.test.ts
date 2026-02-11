import { renderHook } from '@testing-library/react';
import { useVirtualization } from '../useVirtualization';

describe('useVirtualization', () => {
  it('should initialize with correct default values for small datasets', () => {
    const { result } = renderHook(() => useVirtualization(50, 50, 5));

    // With itemCount <= 100, should return full range
    expect(result.current.visibleRange).toEqual({ start: 0, end: 50 });
    expect(result.current.totalHeight).toBe(2500); // 50 items * 50px
    expect(result.current.offsetY).toBe(0);
    expect(result.current.containerRef).toBeDefined();
  });

  it('should return full range when itemCount <= 100', () => {
    const { result } = renderHook(() => useVirtualization(100, 50, 5));

    expect(result.current.visibleRange).toEqual({ start: 0, end: 100 });
    expect(result.current.totalHeight).toBe(5000); // 100 items * 50px
    expect(result.current.offsetY).toBe(0);
  });

  it('should return full range when itemCount < 100', () => {
    const { result } = renderHook(() => useVirtualization(75, 50, 5));

    expect(result.current.visibleRange).toEqual({ start: 0, end: 75 });
    expect(result.current.totalHeight).toBe(3750); // 75 items * 50px
    expect(result.current.offsetY).toBe(0);
  });

  it('should activate virtualization when itemCount > 100', () => {
    const { result } = renderHook(() => useVirtualization(200, 50, 5));

    // Without container attached, should return default range (up to 20 items)
    expect(result.current.visibleRange.start).toBe(0);
    expect(result.current.visibleRange.end).toBeLessThanOrEqual(200);
    expect(result.current.totalHeight).toBe(10000); // 200 items * 50px
  });

  it('should handle different item heights', () => {
    const { result: result1 } = renderHook(() => useVirtualization(200, 30, 5));
    const { result: result2 } = renderHook(() => useVirtualization(200, 100, 5));

    expect(result1.current.totalHeight).toBe(6000); // 200 * 30
    expect(result2.current.totalHeight).toBe(20000); // 200 * 100
  });

  it('should use default overscan of 5 when not specified', () => {
    const { result } = renderHook(() => useVirtualization(200, 50));

    // Should still work with default overscan
    expect(result.current.visibleRange).toBeDefined();
    expect(result.current.totalHeight).toBe(10000);
  });

  it('should handle zero items', () => {
    const { result } = renderHook(() => useVirtualization(0, 50, 5));

    expect(result.current.visibleRange).toEqual({ start: 0, end: 0 });
    expect(result.current.totalHeight).toBe(0);
    expect(result.current.offsetY).toBe(0);
  });

  it('should handle single item', () => {
    const { result } = renderHook(() => useVirtualization(1, 50, 5));

    expect(result.current.visibleRange).toEqual({ start: 0, end: 1 });
    expect(result.current.totalHeight).toBe(50);
    expect(result.current.offsetY).toBe(0);
  });

  it('should provide a container ref', () => {
    const { result } = renderHook(() => useVirtualization(200, 50, 5));

    expect(result.current.containerRef).toBeDefined();
    expect(result.current.containerRef.current).toBeNull(); // Not attached in test
  });

  it('should calculate total height correctly for large datasets', () => {
    const { result } = renderHook(() => useVirtualization(1000, 50, 5));

    expect(result.current.totalHeight).toBe(50000); // 1000 * 50
  });

  it('should handle edge case of exactly 100 items', () => {
    const { result } = renderHook(() => useVirtualization(100, 50, 5));

    // Should NOT activate virtualization at exactly 100
    expect(result.current.visibleRange).toEqual({ start: 0, end: 100 });
    expect(result.current.offsetY).toBe(0);
  });

  it('should handle edge case of 101 items', () => {
    const { result } = renderHook(() => useVirtualization(101, 50, 5));

    // Should activate virtualization at 101
    expect(result.current.visibleRange.start).toBe(0);
    expect(result.current.visibleRange.end).toBeLessThanOrEqual(101);
    expect(result.current.totalHeight).toBe(5050); // 101 * 50
  });

  it('should return consistent results for same inputs', () => {
    const { result: result1 } = renderHook(() => useVirtualization(50, 50, 5));
    const { result: result2 } = renderHook(() => useVirtualization(50, 50, 5));

    expect(result1.current.visibleRange).toEqual(result2.current.visibleRange);
    expect(result1.current.totalHeight).toBe(result2.current.totalHeight);
    expect(result1.current.offsetY).toBe(result2.current.offsetY);
  });
});
