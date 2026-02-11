# Design Document: Admin Table Enhancements

## Overview

This design enhances the admin database table view with interactive features, search/filter capabilities, sorting, and performance optimizations. The solution follows React best practices by extracting reusable logic into custom hooks, implementing optimistic UI updates for responsive interactions, and using memoization to prevent unnecessary re-renders.

The enhanced table will handle datasets efficiently through virtual scrolling (for large datasets), debounced search, and optimized filtering. All interactive features maintain data consistency through proper error handling and state management.

## Architecture

### Component Structure

```
DatabaseTableView (Main Container)
├── SearchBar (Search input with debouncing)
├── FilterPanel (Multi-select filters)
│   ├── ClubFilter
│   ├── InvolvementFilter (Performance/Booth)
│   └── CollectionStatusFilter (Shirt/Meal)
├── TableControls (Clear filters, record count)
├── VirtualizedTable (Performance-optimized table)
│   ├── TableHeader (Sortable column headers)
│   └── TableBody
│       └── TableRow[] (Memoized rows with interactive checkboxes)
└── EmptyState (No results message)
```

### Custom Hooks

1. **useTableData**: Manages data fetching and state
2. **useSearch**: Handles search query and debouncing
3. **useFilter**: Manages multiple filter criteria
4. **useSort**: Handles column sorting logic
5. **useOptimisticUpdate**: Manages optimistic checkbox updates with rollback
6. **useVirtualization**: Implements virtual scrolling for large datasets

### Data Flow

```
User Action → Custom Hook → State Update → Memoized Component Re-render
                ↓
         API Call (async)
                ↓
    Success: Confirm state | Failure: Rollback state
```

## Components and Interfaces

### Main Component: DatabaseTableView

```typescript
interface DatabaseTableViewProps {
  // No props - self-contained component
}

interface StudentRecord {
  studentId: string;
  name: string;
  shirtCollected: boolean;
  mealCollected: boolean;
  consented: boolean;
  clubs: string[];           // Parsed from organizationDetails
  hasPerformance: boolean;   // Parsed from organizationDetails
  hasBooth: boolean;         // Parsed from organizationDetails
}

interface TableState {
  data: StudentRecord[];
  filteredData: StudentRecord[];
  isLoading: boolean;
  error: string | null;
}
```

### Custom Hook: useTableData

```typescript
interface UseTableDataReturn {
  students: StudentRecord[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

function useTableData(): UseTableDataReturn {
  // Fetches data from /api/students/all
  // Parses organizationDetails into structured fields
  // Returns memoized student records
}
```

### Custom Hook: useSearch

```typescript
interface UseSearchReturn {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  debouncedQuery: string;
}

function useSearch(debounceMs: number = 300): UseSearchReturn {
  // Manages search input state
  // Debounces search query to prevent excessive filtering
  // Returns current and debounced query values
}
```

### Custom Hook: useFilter

```typescript
interface FilterCriteria {
  clubs: string[];
  hasPerformance: boolean | null;
  hasBooth: boolean | null;
  shirtCollected: boolean | null;
  mealCollected: boolean | null;
}

interface UseFilterReturn {
  filters: FilterCriteria;
  setFilter: <K extends keyof FilterCriteria>(
    key: K,
    value: FilterCriteria[K]
  ) => void;
  clearFilters: () => void;
  activeFilterCount: number;
}

function useFilter(): UseFilterReturn {
  // Manages multiple filter criteria
  // Provides methods to update individual filters
  // Tracks count of active filters
}
```

### Custom Hook: useSort

```typescript
type SortDirection = 'asc' | 'desc' | null;
type SortableColumn = 'studentId' | 'name' | 'shirtCollected' | 'mealCollected';

interface UseSortReturn {
  sortColumn: SortableColumn | null;
  sortDirection: SortDirection;
  handleSort: (column: SortableColumn) => void;
}

function useSort(): UseSortReturn {
  // Manages sort column and direction
  // Toggles direction on repeated clicks
  // Returns sort handler for column headers
}
```

### Custom Hook: useOptimisticUpdate

```typescript
interface UseOptimisticUpdateReturn {
  updateClaimStatus: (
    studentId: string,
    itemType: 'tshirt' | 'meal',
    collected: boolean
  ) => Promise<void>;
  pendingUpdates: Set<string>; // Track in-progress updates
}

function useOptimisticUpdate(
  students: StudentRecord[],
  setStudents: React.Dispatch<React.SetStateAction<StudentRecord[]>>
): UseOptimisticUpdateReturn {
  // Implements optimistic UI pattern
  // Updates UI immediately, then calls API
  // Rolls back on failure with error notification
}
```

### Custom Hook: useVirtualization

```typescript
interface UseVirtualizationReturn {
  visibleRange: { start: number; end: number };
  totalHeight: number;
  offsetY: number;
  containerRef: React.RefObject<HTMLDivElement>;
}

function useVirtualization(
  itemCount: number,
  itemHeight: number,
  overscan: number = 5
): UseVirtualizationReturn {
  // Calculates visible row range based on scroll position
  // Returns container ref and positioning values
  // Only used when itemCount > 100
}
```

### Sub-Component: SearchBar

```typescript
interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  resultCount?: number;
}

function SearchBar({ value, onChange, placeholder, resultCount }: SearchBarProps) {
  // Renders search input with icon
  // Shows result count when search is active
  // Provides clear button when query exists
}
```

### Sub-Component: FilterPanel

```typescript
interface FilterPanelProps {
  filters: FilterCriteria;
  onFilterChange: <K extends keyof FilterCriteria>(
    key: K,
    value: FilterCriteria[K]
  ) => void;
  onClearFilters: () => void;
  availableClubs: string[];
  activeFilterCount: number;
}

function FilterPanel(props: FilterPanelProps) {
  // Renders filter controls in a collapsible panel
  // Shows active filter badges
  // Provides clear all button
}
```

### Sub-Component: TableRow

```typescript
interface TableRowProps {
  student: StudentRecord;
  onCheckboxChange: (
    studentId: string,
    itemType: 'tshirt' | 'meal',
    collected: boolean
  ) => Promise<void>;
  isPending: boolean;
}

const TableRow = React.memo(({ student, onCheckboxChange, isPending }: TableRowProps) => {
  // Memoized row component to prevent unnecessary re-renders
  // Renders student data with interactive checkboxes
  // Shows loading state during updates
});
```

### Sub-Component: InteractiveCheckbox

```typescript
interface InteractiveCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => Promise<void>;
  disabled: boolean;
  label: string;
}

function InteractiveCheckbox({ checked, onChange, disabled, label }: InteractiveCheckboxProps) {
  // Renders checkbox with loading spinner
  // Handles click events with optimistic updates
  // Provides accessible labels and ARIA attributes
}
```

## Data Models

### Extended Student Record

```typescript
interface StudentRecord {
  // Core fields from API
  studentId: string;
  name: string;
  shirtCollected: boolean;
  mealCollected: boolean;
  consented: boolean;
  
  // Parsed fields (computed from organizationDetails)
  clubs: string[];           // Array of club names
  hasPerformance: boolean;   // True if "Performance" in involvement
  hasBooth: boolean;         // True if "Booth" in involvement
}
```

### Organization Details Parser

```typescript
/**
 * Parse organization details string into structured data
 * Format: "Club: [name], Involvement: [role]; Club: [name], Involvement: [role]"
 */
function parseOrganizationDetails(organizationDetails?: string): {
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
```

### Filter Logic

```typescript
/**
 * Apply all active filters to student records
 */
function applyFilters(
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
```

### Search Logic

```typescript
/**
 * Filter students by search query (case-insensitive)
 */
function applySearch(
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
```

### Sort Logic

```typescript
/**
 * Sort students by column and direction
 */
function applySort(
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
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }
    
    if (aValue < bValue) return direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return direction === 'asc' ? 1 : -1;
    return 0;
  });
  
  return sorted;
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*


### Property Reflection

After analyzing all acceptance criteria, I identified the following redundancies and consolidations:

**Redundant Properties:**
- 1.2 (meal checkbox) can be combined with 1.1 (shirt checkbox) into a single property for all checkbox types
- 3.4 (booth filter) can be combined with 3.3 (performance filter) into a single property for involvement filters
- 3.6 (meal collection filter) can be combined with 3.5 (shirt collection filter) into a single property for collection status filters
- 3.9 (filtered record count) is the same as 2.6 (search record count) - both test that displayed count matches visible records
- 4.5 (sortable columns) is covered by 4.2 (sort by column)
- 6.2 and 6.3 (performance/booth display) can be combined with 6.1 into a single property for involvement data display
- 7.6 (error handling) is covered by 1.4
- 8.5 (checkbox loading indicator) is the same as 1.5
- 9.1 (network error handling) is the same as 1.4
- 9.3 (optimistic updates) is covered by 1.3 and 1.4 combined

**Properties to Keep:**
After consolidation, we have the following unique, non-redundant properties:

1. Checkbox updates trigger API calls and UI updates (combines 1.1, 1.2)
2. Successful updates persist in UI (1.3)
3. Failed updates rollback with error message (1.4, 9.1)
4. Checkbox shows loading state during update (1.5)
5. Checkbox updates preserve scroll and filter state (1.6)
6. Search filters records by ID and name (2.2, 2.3)
7. Record count matches visible records (2.6, 3.9)
8. Club filter shows only matching students (3.2)
9. Involvement filters show only matching students (3.3, 3.4)
10. Collection status filters show only matching students (3.5, 3.6)
11. Multiple filters combine with AND logic (3.7)
12. Clear filters returns to unfiltered state (3.8)
13. Sort by column orders records correctly (4.2)
14. Sort direction toggles on repeated clicks (4.3)
15. Sort column switch resets to ascending (4.4)
16. Sort indicator matches actual sort state (4.6)
17. Sort persists across filter/search changes (4.7)
18. Filter/search operations complete within 200ms for 1000 records (5.3)
19. Involvement data is displayed for all students (6.1, 6.2, 6.3)
20. Multiple clubs are all displayed (6.4)
21. Organization details parser extracts correct information (6.5)
22. Active filters show badges (8.1)
23. Server error messages are displayed (9.2)
24. API responses are validated (9.5)
25. Concurrent updates don't cause inconsistent state (9.6)
26. Keyboard navigation works for all features (10.3)
27. Focus remains on checkbox after update (10.5)

### Correctness Properties

Property 1: Checkbox updates trigger API calls and toggle UI state
*For any* student record and item type (shirt or meal), when an admin clicks the checkbox, the system should send an update request to the Distribution_API with the correct parameters (studentId, itemType, new collected status) and toggle the checkbox state in the UI.
**Validates: Requirements 1.1, 1.2**

Property 2: Successful updates persist in UI without reload
*For any* successful claim status update, the checkbox state should remain in its new state after the API call completes, without requiring a page reload.
**Validates: Requirements 1.3**

Property 3: Failed updates rollback with error notification
*For any* claim status update that fails (network error or server error), the checkbox should revert to its previous state and an error message should be displayed to the user.
**Validates: Requirements 1.4, 9.1**

Property 4: Checkbox shows loading state during async operations
*For any* checkbox update in progress, the checkbox should be disabled and display a loading indicator until the operation completes (success or failure).
**Validates: Requirements 1.5, 8.5**

Property 5: Checkbox updates preserve view state
*For any* checkbox update, the current scroll position, active filters, search query, and sort state should remain unchanged after the update completes.
**Validates: Requirements 1.6**

Property 6: Search filters by ID and name (case-insensitive)
*For any* search query, the filtered results should include only students whose ID or name contains the query string (case-insensitive matching).
**Validates: Requirements 2.2, 2.3**

Property 7: Displayed count matches visible records
*For any* combination of search query and filters, the displayed record count should equal the number of visible table rows.
**Validates: Requirements 2.6, 3.9**

Property 8: Club filter shows only matching students
*For any* selected club filter, the filtered results should include only students who are involved in that club (based on parsed organization details).
**Validates: Requirements 3.2**

Property 9: Involvement filters show only matching students
*For any* involvement filter selection (performance or booth), the filtered results should include only students whose involvement matches the selected criteria.
**Validates: Requirements 3.3, 3.4**

Property 10: Collection status filters show only matching students
*For any* collection status filter (shirt or meal, collected or not collected), the filtered results should include only students whose collection status matches the selected criteria.
**Validates: Requirements 3.5, 3.6**

Property 11: Multiple filters combine with AND logic
*For any* combination of active filters (club, involvement, collection status), a student should appear in the results only if they match ALL active filter criteria.
**Validates: Requirements 3.7**

Property 12: Clear filters returns to unfiltered state
*For any* set of active filters, clicking "Clear Filters" should remove all filters and display all students (subject to search query).
**Validates: Requirements 3.8**

Property 13: Sort orders records correctly
*For any* sortable column and sort direction (ascending or descending), the table rows should be ordered according to the values in that column, with the correct comparison logic (alphabetical for strings, numerical for booleans).
**Validates: Requirements 4.2, 4.5**

Property 14: Sort direction toggles on repeated clicks
*For any* column, clicking the column header once should sort ascending, clicking again should sort descending, and clicking a third time should remove sorting.
**Validates: Requirements 4.3**

Property 15: Sort column switch resets to ascending
*For any* two different sortable columns, if column A is currently sorted, clicking column B should sort by column B in ascending order (not descending).
**Validates: Requirements 4.4**

Property 16: Sort indicator reflects actual sort state
*For any* sort state (column and direction), the visual indicator (arrow icon) should accurately show which column is sorted and in which direction.
**Validates: Requirements 4.6**

Property 17: Sort persists across filter and search changes
*For any* active sort state, applying or changing filters or search query should maintain the same sort column and direction on the filtered results.
**Validates: Requirements 4.7**

Property 18: Filter and search operations are performant
*For any* dataset up to 1000 records, filtering or searching operations should complete within 200ms from user input to UI update.
**Validates: Requirements 5.3**

Property 19: Involvement data is displayed for all students
*For any* student record, the table should display their club involvement, performance status, and booth status (parsed from organization details).
**Validates: Requirements 6.1, 6.2, 6.3**

Property 20: Multiple clubs are all displayed
*For any* student with multiple club involvements, all clubs should be visible in the table (not truncated or hidden).
**Validates: Requirements 6.4**

Property 21: Organization details parser extracts correct information
*For any* valid organization details string, the parser should correctly extract all club names, performance involvement status, and booth involvement status.
**Validates: Requirements 6.5**

Property 22: Active filters display badges
*For any* active filter, a badge should be visible in the UI showing the filter type and value.
**Validates: Requirements 8.1**

Property 23: Server error messages are displayed
*For any* API error response containing an error message, that message should be displayed to the user.
**Validates: Requirements 9.2**

Property 24: API responses are validated before state updates
*For any* API response, if the response format is invalid or missing required fields, the state should not be updated and an error should be shown.
**Validates: Requirements 9.5**

Property 25: Concurrent updates maintain consistency
*For any* set of concurrent checkbox updates on different students, all updates should complete successfully without race conditions or inconsistent state.
**Validates: Requirements 9.6**

Property 26: Keyboard navigation works for all interactive features
*For any* interactive element (checkbox, sort header, filter control, search input), keyboard events (Enter, Space, Tab) should trigger the same actions as mouse clicks.
**Validates: Requirements 10.3**

Property 27: Focus remains on checkbox after update
*For any* checkbox update, keyboard focus should remain on that checkbox after the update completes (not lost or moved elsewhere).
**Validates: Requirements 10.5**

## Error Handling

### API Error Handling

1. **Network Errors**: Display user-friendly message "Unable to connect to server. Please check your connection and try again."
2. **Server Errors (5xx)**: Display message from server response or generic "Server error occurred. Please try again later."
3. **Client Errors (4xx)**: Display specific error message from server (e.g., "Student not found")
4. **Timeout Errors**: Display "Request timed out. Please try again."

### Optimistic Update Rollback

```typescript
async function handleCheckboxUpdate(
  studentId: string,
  itemType: 'tshirt' | 'meal',
  newValue: boolean
) {
  // Store previous state for rollback
  const previousState = students.find(s => s.studentId === studentId);
  
  try {
    // Optimistic update
    updateStudentInState(studentId, itemType, newValue);
    
    // API call
    const response = await fetch('/api/distribution-status', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId, itemType, collected: newValue })
    });
    
    if (!response.ok) {
      throw new Error(await response.text());
    }
    
    // Validate response
    const data = await response.json();
    if (!data.success || !data.claim) {
      throw new Error('Invalid response format');
    }
    
  } catch (error) {
    // Rollback on failure
    if (previousState) {
      updateStudentInState(
        studentId,
        itemType,
        itemType === 'tshirt' ? previousState.shirtCollected : previousState.mealCollected
      );
    }
    
    // Show error notification
    showErrorNotification(error.message);
  }
}
```

### Data Validation

```typescript
function validateStudentRecord(record: any): record is StudentRecord {
  return (
    typeof record.studentId === 'string' &&
    typeof record.name === 'string' &&
    typeof record.shirtCollected === 'boolean' &&
    typeof record.mealCollected === 'boolean' &&
    typeof record.consented === 'boolean'
  );
}

function validateAPIResponse(response: any): boolean {
  if (!response.success) return false;
  if (!Array.isArray(response.students)) return false;
  return response.students.every(validateStudentRecord);
}
```

### Concurrent Update Handling

```typescript
// Use a Set to track in-progress updates
const pendingUpdates = new Set<string>();

async function handleCheckboxUpdate(
  studentId: string,
  itemType: 'tshirt' | 'meal',
  newValue: boolean
) {
  const updateKey = `${studentId}-${itemType}`;
  
  // Prevent concurrent updates to the same checkbox
  if (pendingUpdates.has(updateKey)) {
    return; // Silently ignore duplicate clicks
  }
  
  pendingUpdates.add(updateKey);
  
  try {
    await performUpdate(studentId, itemType, newValue);
  } finally {
    pendingUpdates.delete(updateKey);
  }
}
```

## Testing Strategy

### Dual Testing Approach

This feature requires both unit tests and property-based tests for comprehensive coverage:

**Unit Tests** focus on:
- Specific examples of search, filter, and sort operations
- Edge cases (empty search, no results, single record)
- Error conditions (API failures, invalid responses)
- UI component rendering and interactions
- Integration between components

**Property-Based Tests** focus on:
- Universal properties across all inputs (search, filter, sort correctness)
- Optimistic update behavior with random data
- Performance characteristics with large datasets
- Concurrent update handling
- State consistency across operations

### Property-Based Testing Configuration

- **Library**: Use `@fast-check/jest` for TypeScript/React property-based testing
- **Iterations**: Minimum 100 iterations per property test
- **Tagging**: Each property test must reference its design document property

Example tag format:
```typescript
/**
 * Feature: admin-table-enhancements
 * Property 6: Search filters by ID and name (case-insensitive)
 * 
 * For any search query, the filtered results should include only students
 * whose ID or name contains the query string (case-insensitive matching).
 */
test('property: search filters correctly', () => {
  fc.assert(
    fc.property(
      fc.array(studentArbitrary),
      fc.string(),
      (students, query) => {
        const filtered = applySearch(students, query);
        // Verify all results match query
        // Verify no matching students were excluded
      }
    ),
    { numRuns: 100 }
  );
});
```

### Test Coverage Requirements

1. **Interactive Checkboxes**: Unit tests for click handling, optimistic updates, error rollback
2. **Search**: Property tests for correctness, unit tests for debouncing and UI
3. **Filters**: Property tests for each filter type and combinations, unit tests for UI
4. **Sorting**: Property tests for sort correctness, unit tests for direction toggle
5. **Performance**: Property tests with large datasets (100-1000 records)
6. **Error Handling**: Unit tests for all error scenarios
7. **Accessibility**: Unit tests for keyboard navigation and ARIA attributes
8. **Integration**: End-to-end tests for complete user workflows

### Example Property Test Structure

```typescript
import fc from '@fast-check/jest';

// Arbitrary for generating random student records
const studentArbitrary = fc.record({
  studentId: fc.string({ minLength: 1, maxLength: 10 }),
  name: fc.string({ minLength: 1, maxLength: 50 }),
  shirtCollected: fc.boolean(),
  mealCollected: fc.boolean(),
  consented: fc.boolean(),
  clubs: fc.array(fc.string(), { maxLength: 5 }),
  hasPerformance: fc.boolean(),
  hasBooth: fc.boolean()
});

/**
 * Feature: admin-table-enhancements
 * Property 11: Multiple filters combine with AND logic
 */
test('property: multiple filters use AND logic', () => {
  fc.assert(
    fc.property(
      fc.array(studentArbitrary, { minLength: 10, maxLength: 100 }),
      fc.array(fc.string(), { maxLength: 3 }), // club filters
      fc.boolean(), // performance filter
      fc.boolean(), // shirt collected filter
      (students, clubFilters, perfFilter, shirtFilter) => {
        const filters: FilterCriteria = {
          clubs: clubFilters,
          hasPerformance: perfFilter,
          hasBooth: null,
          shirtCollected: shirtFilter,
          mealCollected: null
        };
        
        const filtered = applyFilters(students, filters);
        
        // Every filtered student must match ALL criteria
        filtered.forEach(student => {
          if (clubFilters.length > 0) {
            expect(student.clubs.some(c => clubFilters.includes(c))).toBe(true);
          }
          expect(student.hasPerformance).toBe(perfFilter);
          expect(student.shirtCollected).toBe(shirtFilter);
        });
        
        // No student matching all criteria should be excluded
        students.forEach(student => {
          const matchesClub = clubFilters.length === 0 || 
            student.clubs.some(c => clubFilters.includes(c));
          const matchesPerf = student.hasPerformance === perfFilter;
          const matchesShirt = student.shirtCollected === shirtFilter;
          
          if (matchesClub && matchesPerf && matchesShirt) {
            expect(filtered).toContainEqual(student);
          }
        });
      }
    ),
    { numRuns: 100 }
  );
});
```

### Unit Test Examples

```typescript
describe('DatabaseTableView', () => {
  describe('Interactive Checkboxes', () => {
    it('should update shirt checkbox optimistically', async () => {
      const { getByLabelText } = render(<DatabaseTableView />);
      const checkbox = getByLabelText('Shirt collected for TEST001');
      
      fireEvent.click(checkbox);
      
      // Should update immediately (optimistic)
      expect(checkbox).toBeChecked();
      
      // Should call API
      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith('/api/distribution-status', {
          method: 'PATCH',
          body: JSON.stringify({
            studentId: 'TEST001',
            itemType: 'tshirt',
            collected: true
          })
        });
      });
    });
    
    it('should rollback checkbox on API failure', async () => {
      // Mock API failure
      global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));
      
      const { getByLabelText, getByText } = render(<DatabaseTableView />);
      const checkbox = getByLabelText('Shirt collected for TEST001');
      
      fireEvent.click(checkbox);
      
      // Should rollback to unchecked
      await waitFor(() => {
        expect(checkbox).not.toBeChecked();
      });
      
      // Should show error message
      expect(getByText(/network error/i)).toBeInTheDocument();
    });
  });
  
  describe('Search', () => {
    it('should filter by student ID', () => {
      const { getByPlaceholderText, queryByText } = render(<DatabaseTableView />);
      const searchInput = getByPlaceholderText('Search by ID or name');
      
      fireEvent.change(searchInput, { target: { value: 'TEST001' } });
      
      expect(queryByText('TEST001')).toBeInTheDocument();
      expect(queryByText('TEST002')).not.toBeInTheDocument();
    });
    
    it('should be case-insensitive', () => {
      const { getByPlaceholderText, queryByText } = render(<DatabaseTableView />);
      const searchInput = getByPlaceholderText('Search by ID or name');
      
      fireEvent.change(searchInput, { target: { value: 'john' } });
      
      expect(queryByText('John Doe')).toBeInTheDocument();
      expect(queryByText('JOHN SMITH')).toBeInTheDocument();
    });
  });
});
```

## Performance Considerations

### Virtual Scrolling Implementation

For datasets larger than 100 records, implement virtual scrolling using the `useVirtualization` hook:

```typescript
function VirtualizedTable({ students }: { students: StudentRecord[] }) {
  const ROW_HEIGHT = 50; // pixels
  const { visibleRange, totalHeight, offsetY, containerRef } = useVirtualization(
    students.length,
    ROW_HEIGHT,
    5 // overscan
  );
  
  const visibleStudents = students.slice(visibleRange.start, visibleRange.end);
  
  return (
    <div ref={containerRef} style={{ height: '600px', overflow: 'auto' }}>
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {visibleStudents.map((student, index) => (
            <TableRow
              key={student.studentId}
              student={student}
              style={{ height: ROW_HEIGHT }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
```

### Memoization Strategy

```typescript
// Memoize expensive computations
const filteredAndSortedStudents = useMemo(() => {
  let result = students;
  
  // Apply search
  result = applySearch(result, debouncedQuery);
  
  // Apply filters
  result = applyFilters(result, filters);
  
  // Apply sort
  result = applySort(result, sortColumn, sortDirection);
  
  return result;
}, [students, debouncedQuery, filters, sortColumn, sortDirection]);

// Memoize table rows
const TableRow = React.memo(({ student, onCheckboxChange, isPending }: TableRowProps) => {
  return (
    <tr>
      <td>{student.studentId}</td>
      <td>{student.name}</td>
      <td>
        <InteractiveCheckbox
          checked={student.shirtCollected}
          onChange={(checked) => onCheckboxChange(student.studentId, 'tshirt', checked)}
          disabled={isPending}
          label={`Shirt collected for ${student.studentId}`}
        />
      </td>
      {/* ... */}
    </tr>
  );
}, (prevProps, nextProps) => {
  // Custom comparison to prevent unnecessary re-renders
  return (
    prevProps.student.studentId === nextProps.student.studentId &&
    prevProps.student.shirtCollected === nextProps.student.shirtCollected &&
    prevProps.student.mealCollected === nextProps.student.mealCollected &&
    prevProps.isPending === nextProps.isPending
  );
});
```

### Debouncing Implementation

```typescript
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  
  return debouncedValue;
}

// Usage in search
function useSearch(debounceMs: number = 300): UseSearchReturn {
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedQuery = useDebounce(searchQuery, debounceMs);
  
  return { searchQuery, setSearchQuery, debouncedQuery };
}
```

## Accessibility Implementation

### ARIA Attributes

```typescript
// Search input
<input
  type="text"
  role="searchbox"
  aria-label="Search students by ID or name"
  aria-describedby="search-results-count"
  value={searchQuery}
  onChange={(e) => setSearchQuery(e.target.value)}
/>
<div id="search-results-count" role="status" aria-live="polite">
  {filteredStudents.length} students found
</div>

// Sort headers
<th>
  <button
    onClick={() => handleSort('name')}
    aria-label={`Sort by name ${sortColumn === 'name' ? sortDirection : ''}`}
    aria-sort={sortColumn === 'name' ? sortDirection : 'none'}
  >
    Name
    {sortColumn === 'name' && (
      <span aria-hidden="true">
        {sortDirection === 'asc' ? '↑' : '↓'}
      </span>
    )}
  </button>
</th>

// Interactive checkbox
<input
  type="checkbox"
  checked={checked}
  onChange={(e) => onChange(e.target.checked)}
  disabled={disabled}
  aria-label={label}
  aria-busy={disabled}
/>
```

### Keyboard Navigation

```typescript
function TableHeader({ column, onSort }: TableHeaderProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSort(column);
    }
  };
  
  return (
    <th>
      <button
        onClick={() => onSort(column)}
        onKeyDown={handleKeyDown}
        tabIndex={0}
      >
        {column}
      </button>
    </th>
  );
}
```

## Migration and Deployment

### Backward Compatibility

The enhanced table component is a drop-in replacement for the existing `DatabaseTableView`. No changes to parent components or API endpoints are required.

### Feature Flags (Optional)

For gradual rollout, consider feature flags:

```typescript
const ENABLE_VIRTUAL_SCROLLING = process.env.REACT_APP_ENABLE_VIRTUAL_SCROLLING === 'true';
const ENABLE_ADVANCED_FILTERS = process.env.REACT_APP_ENABLE_ADVANCED_FILTERS === 'true';
```

### Performance Monitoring

Add performance monitoring to track real-world performance:

```typescript
useEffect(() => {
  const startTime = performance.now();
  
  // Perform filtering/sorting
  const result = applyFiltersAndSort(students, filters, sort);
  
  const endTime = performance.now();
  const duration = endTime - startTime;
  
  if (duration > 200) {
    console.warn(`Slow filter/sort operation: ${duration}ms`);
    // Send to monitoring service
  }
}, [students, filters, sort]);
```
