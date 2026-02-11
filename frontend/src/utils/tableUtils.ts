/**
 * Utility functions for admin table enhancements
 * Provides parsing, filtering, searching, and sorting functionality
 */

import { StudentRecord, FilterCriteria, SortableColumn, SortDirection } from './types';

/**
 * Parse organization details string into structured data
 * Format: "Club: [name], Involvement: [role]; Club: [name], Involvement: [role]"
 * 
 * @param organizationDetails - Raw organization details string from API
 * @returns Parsed data with clubs array and involvement flags
 */
export function parseOrganizationDetails(organizationDetails?: string): {
  clubs: string[];
  hasPerformance: boolean;
  hasBooth: boolean;
} {
  if (!organizationDetails) {
    return { clubs: [], hasPerformance: false, hasBooth: false };
  }
  
  const clubs: string[] = [];
  let hasPerformance = false;
  let hasBooth = false;
  
  // Split by semicolon to get individual entries
  const entries = organizationDetails.split(';').map(e => e.trim());
  
  for (const entry of entries) {
    // Extract club name
    const clubMatch = entry.match(/Club:\s*([^,]+)/i);
    if (clubMatch) {
      clubs.push(clubMatch[1].trim());
    }
    
    // Check involvement type
    const involvementMatch = entry.match(/Involvement:\s*(.+)/i);
    if (involvementMatch) {
      const involvement = involvementMatch[1].trim().toLowerCase();
      if (involvement.includes('performance')) {
        hasPerformance = true;
      }
      if (involvement.includes('booth')) {
        hasBooth = true;
      }
    }
  }
  
  return { clubs, hasPerformance, hasBooth };
}

/**
 * Apply all active filters to student records
 * Filters are combined with AND logic
 * 
 * @param students - Array of student records to filter
 * @param filters - Filter criteria to apply
 * @returns Filtered array of student records
 */
export function applyFilters(
  students: StudentRecord[],
  filters: FilterCriteria
): StudentRecord[] {
  return students.filter(student => {
    // Club filter (OR logic - match any selected club)
    if (filters.clubs.length > 0) {
      const hasMatchingClub = student.clubs.some(club =>
        filters.clubs.includes(club)
      );
      if (!hasMatchingClub) return false;
    }
    
    // Performance filter
    if (filters.hasPerformance !== null) {
      if (student.hasPerformance !== filters.hasPerformance) return false;
    }
    
    // Booth filter
    if (filters.hasBooth !== null) {
      if (student.hasBooth !== filters.hasBooth) return false;
    }
    
    // Shirt collection filter
    if (filters.shirtCollected !== null) {
      if (student.shirtCollected !== filters.shirtCollected) return false;
    }
    
    // Meal collection filter
    if (filters.mealCollected !== null) {
      if (student.mealCollected !== filters.mealCollected) return false;
    }
    
    return true;
  });
}

/**
 * Filter students by search query (case-insensitive)
 * Searches across student ID and name fields
 * 
 * @param students - Array of student records to search
 * @param query - Search query string
 * @returns Filtered array of student records matching the query
 */
export function applySearch(
  students: StudentRecord[],
  query: string
): StudentRecord[] {
  if (!query.trim()) return students;
  
  const lowerQuery = query.toLowerCase();
  
  return students.filter(student =>
    student.studentId.toLowerCase().includes(lowerQuery) ||
    student.name.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Sort students by column and direction
 * 
 * @param students - Array of student records to sort
 * @param column - Column to sort by
 * @param direction - Sort direction (asc or desc)
 * @returns Sorted array of student records
 */
export function applySort(
  students: StudentRecord[],
  column: SortableColumn | null,
  direction: SortDirection
): StudentRecord[] {
  if (!column || !direction) return students;
  
  const sorted = [...students].sort((a, b) => {
    let aValue: any = a[column];
    let bValue: any = b[column];
    
    // Handle boolean values
    if (typeof aValue === 'boolean') {
      aValue = aValue ? 1 : 0;
      bValue = bValue ? 1 : 0;
    }
    
    // Handle string values (case-insensitive)
    if (typeof aValue === 'string') {
      // For tshirtSize and mealPreference, handle empty values specially
      if (column === 'tshirtSize' || column === 'mealPreference') {
        const aEmpty = aValue.trim() === '';
        const bEmpty = bValue.trim() === '';
        
        // If both are empty, they're equal
        if (aEmpty && bEmpty) return 0;
        
        // If only a is empty, it should come after b (regardless of direction)
        if (aEmpty) return 1;
        
        // If only b is empty, it should come after a (regardless of direction)
        if (bEmpty) return -1;
        
        // Neither is empty, do normal comparison
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      } else {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
    }
    
    if (aValue < bValue) return direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return direction === 'asc' ? 1 : -1;
    return 0;
  });
  
  return sorted;
}
