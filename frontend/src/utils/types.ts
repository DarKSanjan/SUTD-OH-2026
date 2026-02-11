/**
 * Type definitions for admin table enhancements
 */

/**
 * Extended student record with parsed organization details
 */
export interface StudentRecord {
  // Core fields from API
  studentId: string;
  name: string;
  tshirtSize: string;
  mealPreference: string;
  shirtCollected: boolean;
  mealCollected: boolean;
  consented: boolean;
  
  // Parsed fields (computed from organizationDetails)
  clubs: string[];           // Array of club names
  hasPerformance: boolean;   // True if "Performance" in involvement
  hasBooth: boolean;         // True if "Booth" in involvement
}

/**
 * Filter criteria for table filtering
 */
export interface FilterCriteria {
  clubs: string[];
  hasPerformance: boolean | null;
  hasBooth: boolean | null;
  shirtCollected: boolean | null;
  mealCollected: boolean | null;
}

/**
 * Sort direction
 */
export type SortDirection = 'asc' | 'desc' | null;

/**
 * Sortable column names
 */
export type SortableColumn = 'studentId' | 'name' | 'tshirtSize' | 'mealPreference' | 'shirtCollected' | 'mealCollected';

/**
 * Table state
 */
export interface TableState {
  data: StudentRecord[];
  filteredData: StudentRecord[];
  isLoading: boolean;
  error: string | null;
}
