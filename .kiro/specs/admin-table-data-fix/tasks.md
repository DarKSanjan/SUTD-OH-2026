# Implementation Plan: Admin Table Data Fix

## Overview

This implementation plan fixes the admin table data display issues by adding t-shirt size and meal preference columns. The work is divided into backend changes (updating the DAO and API), frontend type updates, UI component modifications, and comprehensive testing. Each task builds incrementally to ensure the table displays complete student information with proper header-to-data alignment.

## Tasks

- [ ] 1. Update backend to include tshirt_size and meal_preference in API response
  - [x] 1.1 Modify StudentDAO.getAllStudents() SQL query
    - Update the SELECT statement to include `COALESCE(s.tshirt_size, '') as "tshirtSize"`
    - Update the SELECT statement to include `COALESCE(s.meal_preference, '') as "mealPreference"`
    - Update the TypeScript return type to include these fields
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

  - [ ]* 1.2 Write unit tests for DAO changes
    - Test that getAllStudents() returns tshirtSize and mealPreference fields
    - Test that null database values are converted to empty strings
    - Test with various tshirt sizes (XS, S, M, L, XL, XXL)
    - Test with various meal preferences (Vegetarian, Non-Vegetarian, Halal)
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

  - [ ]* 1.3 Write property test for API response completeness
    - **Property 1: API Response Completeness**
    - **Validates: Requirements 1.1, 1.2, 1.5**
    - For any call to `/api/students/all`, verify all records have tshirtSize and mealPreference fields
    - _Requirements: 1.1, 1.2, 1.5_
  
  - [ ]* 1.4 Write property test for DAO field retrieval
    - **Property 2: DAO Query Field Retrieval**
    - **Validates: Requirements 1.5**
    - For any student record from DAO, verify tshirtSize and mealPreference are populated
    - _Requirements: 1.5_

- [ ] 2. Update frontend TypeScript types
  - [x] 2.1 Extend StudentRecord interface in types.ts
    - Add `tshirtSize: string` field
    - Add `mealPreference: string` field
    - Update SortableColumn type to include 'tshirtSize' and 'mealPreference'
    - _Requirements: 4.1, 4.2_
  
  - [ ]* 2.2 Write unit tests for type definitions
    - Test that StudentRecord objects can have tshirtSize and mealPreference properties
    - Test that SortableColumn type accepts 'tshirtSize' and 'mealPreference'
    - _Requirements: 4.1, 4.2_

- [ ] 3. Update data transformation in useTableData hook
  - [x] 3.1 Modify transformStudent function
    - Add mapping for `tshirtSize: apiStudent.tshirtSize || ''`
    - Add mapping for `mealPreference: apiStudent.mealPreference || ''`
    - Ensure defensive programming with fallback to empty string
    - _Requirements: 4.3, 4.4_
  
  - [ ]* 3.2 Write property test for API to StudentRecord mapping
    - **Property 3: API to StudentRecord Mapping**
    - **Validates: Requirements 4.3, 4.4**
    - For any API response, verify transformation preserves tshirtSize and mealPreference
    - _Requirements: 4.3, 4.4_

- [ ] 4. Update TableHeader component
  - [x] 4.1 Fix column headers to match actual row data
    - Replace incorrect headers with: Student ID, Name, Clubs, Involvement, T-shirt Size, Meal Preference, Shirt Collected, Meal Collected, Consent
    - Make "T-shirt Size" and "Meal Preference" sortable headers
    - Keep "Clubs" and "Involvement" as non-sortable headers
    - Update "Shirt" to "Shirt Collected" and "Meal" to "Meal Collected" for clarity
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 3.10_
  
  - [ ]* 4.2 Write unit tests for TableHeader
    - Test that all 9 column headers are rendered
    - Test that column headers match the order: Student ID, Name, Clubs, Involvement, T-shirt Size, Meal Preference, Shirt Collected, Meal Collected, Consent
    - Test that T-shirt Size and Meal Preference headers are sortable
    - Test that Clubs, Involvement, and Consent headers are not sortable
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 3.10_
  
  - [ ]* 4.3 Write property test for header-row consistency
    - **Property 5: Table Header-Row Consistency**
    - **Validates: Requirements 3.1**
    - For any rendered table, verify header column count equals row cell count
    - _Requirements: 3.1_

- [ ] 5. Update TableRow component
  - [x] 5.1 Add T-shirt Size and Meal Preference columns to row
    - Add `<td className="tshirt-size">{tshirtDisplay}</td>` after involvement column
    - Add `<td className="meal-preference">{mealDisplay}</td>` after tshirt-size column
    - Add `<td className="consent-status">{consentDisplay}</td>` at the end
    - Implement display logic: show value if non-empty, otherwise show "N/A"
    - Implement consent display logic: show '✓' if consented, '✗' if not
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_
  
  - [ ]* 5.2 Write unit tests for TableRow display
    - Test that tshirt size displays correctly when present
    - Test that "N/A" displays when tshirt size is empty
    - Test that meal preference displays correctly when present
    - Test that "N/A" displays when meal preference is empty
    - Test that consent status displays '✓' or '✗' correctly
    - _Requirements: 2.3, 2.4, 2.5, 2.6_
  
  - [ ]* 5.3 Write property test for non-empty value display
    - **Property 4: Non-Empty Value Display**
    - **Validates: Requirements 2.3, 2.4**
    - For any student with non-empty tshirtSize or mealPreference, verify the rendered row displays those values
    - _Requirements: 2.3, 2.4_
  
  - [ ]* 5.4 Update TableRow memoization comparison
    - Add tshirtSize and mealPreference to the custom comparison function
    - Ensure re-renders only happen when these fields change
    - _Requirements: 2.3, 2.4_

- [x] 6. Checkpoint - Ensure basic display works
  - Manually test that the table displays all columns correctly
  - Verify tshirt sizes and meal preferences show up (or "N/A")
  - Ensure all tests pass, ask the user if questions arise

- [ ] 7. Implement sorting for new columns
  - [x] 7.1 Update sort utility functions
    - Add 'tshirtSize' case to compareValues function
    - Add 'mealPreference' case to compareValues function
    - Implement empty value handling: map empty strings to '\uffff' to sort last
    - Ensure stable sort behavior for duplicate values
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_
  
  - [ ]* 7.2 Write unit tests for sort functionality
    - Test ascending sort for tshirtSize
    - Test descending sort for tshirtSize
    - Test ascending sort for mealPreference
    - Test descending sort for mealPreference
    - Test that empty values sort last in both directions
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_
  
  - [ ]* 7.3 Write property test for ascending sort correctness
    - **Property 6: Ascending Sort Correctness**
    - **Validates: Requirements 5.1, 5.3**
    - For any dataset, verify ascending sort produces correctly ordered results
    - _Requirements: 5.1, 5.3_
  
  - [ ]* 7.4 Write property test for descending sort correctness
    - **Property 7: Descending Sort Correctness**
    - **Validates: Requirements 5.2, 5.4**
    - For any dataset, verify descending sort produces correctly ordered results
    - _Requirements: 5.2, 5.4_
  
  - [ ]* 7.5 Write property test for empty values sort last
    - **Property 8: Empty Values Sort Last**
    - **Validates: Requirements 5.5, 5.6**
    - For any dataset with empty and non-empty values, verify empty values sort last
    - _Requirements: 5.5, 5.6_
  
  - [ ]* 7.6 Write property test for sort stability
    - **Property 9: Sort Stability**
    - **Validates: Requirements 5.1, 5.2, 5.3, 5.4**
    - For any dataset with duplicate sort keys, verify relative order is preserved
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [ ] 8. Regression testing for existing functionality
  - [ ]* 8.1 Write property test for data processing pipeline preservation
    - **Property 10: Data Processing Pipeline Preservation**
    - **Validates: Requirements 6.1, 6.2, 6.3**
    - For any search/filter/sort configuration, verify results match pre-change behavior
    - _Requirements: 6.1, 6.2, 6.3_
  
  - [ ]* 8.2 Write property test for checkbox preservation
    - **Property 11: Interactive Checkbox Preservation**
    - **Validates: Requirements 6.4, 6.6**
    - For any student, verify checkbox clicks update claim status correctly
    - _Requirements: 6.4, 6.6_
  
  - [ ]* 8.3 Write property test for virtualization preservation
    - **Property 12: Virtualization Threshold Preservation**
    - **Validates: Requirements 6.5**
    - For any dataset > 100 records, verify virtualization activates
    - _Requirements: 6.5_
  
  - [ ]* 8.4 Write integration tests for existing features
    - Test search functionality with new columns present
    - Test filter functionality with new columns present
    - Test sort functionality for original columns (studentId, name, shirtCollected, mealCollected)
    - Test checkbox functionality for shirt and meal collection
    - Test optimistic updates still work correctly
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.6_

- [x] 9. Final checkpoint - Comprehensive testing
  - Run all unit tests and property tests
  - Manually test the admin table with real data
  - Verify all 9 columns display correctly
  - Test sorting on all sortable columns
  - Test search and filter functionality
  - Test checkbox interactions
  - Ensure no console errors or warnings
  - Ensure all tests pass, ask the user if questions arise

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- The implementation is incremental: backend → types → data transformation → UI components → sorting → regression testing
- Property tests validate universal correctness properties across all possible inputs
- Unit tests validate specific examples and edge cases
- Integration tests ensure existing functionality continues to work
- Two checkpoints ensure validation at key milestones
