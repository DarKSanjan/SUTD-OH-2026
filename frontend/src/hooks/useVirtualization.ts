import { useState, useEffect, useRef, RefObject } from 'react';

/**
 * Return type for useVirtualization hook
 */
export interface UseVirtualizationReturn {
  visibleRange: { start: number; end: number };
  totalHeight: number;
  offsetY: number;
  containerRef: RefObject<HTMLDivElement>;
}

/**
 * Custom hook for implementing virtual scrolling for large datasets
 * 
 * Calculates which rows should be visible based on scroll position,
 * reducing DOM nodes and improving performance for large tables.
 * 
 * Only activates when itemCount > 100 (returns full range otherwise).
 * 
 * @param itemCount - Total number of items in the list
 * @param itemHeight - Height of each item in pixels
 * @param overscan - Number of extra items to render above/below visible area (default: 5)
 * @returns Object containing visibleRange, totalHeight, offsetY, and containerRef
 * 
 * @example
 * ```tsx
 * const { visibleRange, totalHeight, offsetY, containerRef } = useVirtualization(
 *   students.length,
 *   50, // row height
 *   5   // overscan
 * );
 * 
 * const visibleStudents = students.slice(visibleRange.start, visibleRange.end);
 * 
 * return (
 *   <div ref={containerRef} style={{ height: '600px', overflow: 'auto' }}>
 *     <div style={{ height: totalHeight, position: 'relative' }}>
 *       <div style={{ transform: `translateY(${offsetY}px)` }}>
 *         {visibleStudents.map(student => <TableRow key={student.id} student={student} />)}
 *       </div>
 *     </div>
 *   </div>
 * );
 * ```
 */
export function useVirtualization(
  itemCount: number,
  itemHeight: number,
  overscan: number = 5
): UseVirtualizationReturn {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);

  // Set up scroll listener
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Initialize container height
    setContainerHeight(container.clientHeight);

    const handleScroll = () => {
      setScrollTop(container.scrollTop);
    };

    // Handle resize to update container height
    const handleResize = () => {
      setContainerHeight(container.clientHeight);
    };

    container.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize);

    return () => {
      container.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Calculate total height of all items
  const totalHeight = itemCount * itemHeight;

  // Only activate virtualization when itemCount > 100
  if (itemCount <= 100) {
    return {
      visibleRange: { start: 0, end: itemCount },
      totalHeight,
      offsetY: 0,
      containerRef
    };
  }

  // If container height is not yet known, return a reasonable default
  if (containerHeight === 0) {
    return {
      visibleRange: { start: 0, end: Math.min(itemCount, 20) },
      totalHeight,
      offsetY: 0,
      containerRef
    };
  }

  // Calculate visible range with overscan
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const visibleCount = Math.ceil(containerHeight / itemHeight);
  const endIndex = Math.min(
    itemCount,
    startIndex + visibleCount + overscan * 2
  );

  // Calculate offset for positioning
  const offsetY = startIndex * itemHeight;

  return {
    visibleRange: { start: startIndex, end: endIndex },
    totalHeight,
    offsetY,
    containerRef
  };
}
