import { useState, useEffect } from 'react';

/**
 * Return type for useSearch hook
 */
export interface UseSearchReturn {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  debouncedQuery: string;
}

/**
 * Custom hook for managing search query with debouncing
 * 
 * Manages search input state and provides a debounced version of the query
 * to prevent excessive filtering operations while the user is typing.
 * 
 * @param debounceMs - Debounce delay in milliseconds (default: 300ms)
 * @returns Object containing current search query, setter function, and debounced query
 * 
 * @example
 * ```tsx
 * const { searchQuery, setSearchQuery, debouncedQuery } = useSearch(300);
 * 
 * // Use searchQuery for the input value (immediate updates)
 * <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
 * 
 * // Use debouncedQuery for filtering (delayed updates)
 * const filtered = students.filter(s => 
 *   s.name.toLowerCase().includes(debouncedQuery.toLowerCase())
 * );
 * ```
 */
export function useSearch(debounceMs: number = 300): UseSearchReturn {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [debouncedQuery, setDebouncedQuery] = useState<string>('');

  useEffect(() => {
    // Set up a timer to update the debounced query after the delay
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, debounceMs);

    // Clean up the timer if searchQuery changes before the delay completes
    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery, debounceMs]);

  return {
    searchQuery,
    setSearchQuery,
    debouncedQuery
  };
}
