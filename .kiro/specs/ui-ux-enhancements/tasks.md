# Implementation Plan: UI/UX Enhancements

## Overview

This implementation plan breaks down the UI/UX enhancements into discrete coding tasks. The approach follows a logical sequence: database schema updates first, then backend API endpoints, followed by frontend components, and finally integration and testing. Each task builds incrementally to ensure the system remains functional throughout development.

## Tasks

- [ ] 1. Update database schema and backend infrastructure
  - [x] 1.1 Add consent column to students table
    - Create migration to add `consented BOOLEAN DEFAULT FALSE` column
    - Update Student model/interface to include consent field
    - _Requirements: 4.5, 4.6_
  
  - [x] 1.2 Write property test for consent persistence
    - **Property 2: Consent Persistence Round Trip**
    - **Validates: Requirements 4.5, 4.6**
  
  - [x] 1.3 Create consent recording API endpoint
    - Implement POST /api/consent endpoint
    - Add request validation for studentId and consented fields
    - Update database with consent state
    - _Requirements: 4.5, 4.6_
  
  - [x] 1.4 Write unit tests for consent API endpoint
    - Test successful consent recording
    - Test validation errors
    - Test database update
    - _Requirements: 4.5, 4.6_

- [ ] 2. Implement distribution status update functionality
  - [x] 2.1 Create bidirectional distribution status API endpoint
    - Implement PATCH /api/distribution-status endpoint
    - Support both checking and unchecking status
    - Return updated status in response
    - _Requirements: 7.1, 7.2, 7.3_
  
  - [x] 2.2 Write property test for distribution status consistency
    - **Property 6: Distribution Status Consistency**
    - **Validates: Requirements 7.3, 7.4**
  
  - [x] 2.3 Write unit tests for distribution status endpoint
    - Test checking shirt/meal status
    - Test unchecking shirt/meal status
    - Test invalid student ID handling
    - _Requirements: 7.1, 7.2, 7.3_

- [ ] 3. Implement database view functionality
  - [x] 3.1 Create all students retrieval API endpoint
    - Implement GET /api/students/all endpoint
    - Return all student records with all fields
    - Include studentId, name, shirt, meal, consent status
    - _Requirements: 8.2, 8.3_
  
  - [x] 3.2 Write property test for complete database display
    - **Property 7: Complete Database Display**
    - **Validates: Requirements 8.2**
  
  - [x] 3.3 Write property test for complete field display
    - **Property 8: Complete Field Display**
    - **Validates: Requirements 8.3**

- [ ] 4. Update global styling and branding
  - [x] 4.1 Update global CSS with new color scheme
    - Set background color to #53001b in root styles
    - Set text color to white for elements on background
    - Update CSS variables if used
    - _Requirements: 1.1, 1.2_
  
  - [x] 4.2 Replace SUTD logo with ROOT logo
    - Replace logo image files in assets directory
    - Update all logo imports and references
    - Verify logo appears in all locations (header, footer, etc.)
    - _Requirements: 1.3_

- [ ] 5. Implement PDPA consent component
  - [x] 5.1 Create PDPAConsent component
    - Create new component with checkbox and required text
    - Implement state management for checkbox
    - Add API call to record consent when checked
    - Emit event when consent is given
    - _Requirements: 4.1, 4.2, 4.4, 4.5_
  
  - [x] 5.2 Write property test for consent prevents QR display
    - **Property 1: Consent Prevents QR Display**
    - **Validates: Requirements 4.3**
  
  - [x] 5.3 Write unit tests for PDPAConsent component
    - Test checkbox renders with correct text
    - Test checkbox state changes
    - Test API call on consent
    - Test event emission
    - _Requirements: 4.1, 4.2, 4.4, 4.5_

- [ ] 6. Enhance QR Display Screen
  - [x] 6.1 Update QRDisplayScreen component
    - Add props for shirt and meal collection status
    - Display collection status in clean layout
    - Change button text from "Generate New QR Code" to "Start Over"
    - Update button handler to navigate to student ID form
    - Clear form state on navigation
    - _Requirements: 2.1, 2.2, 2.3, 3.1, 3.2, 3.3_
  
  - [x] 6.2 Write unit tests for QRDisplayScreen enhancements
    - Test collection status display
    - Test "Start Over" button text
    - Test navigation on button click
    - Test form state clearing
    - _Requirements: 2.1, 2.2, 3.1, 3.2, 3.3_

- [ ] 7. Update easter egg logic
  - [x] 7.1 Modify easter egg display logic
    - Update shouldShowEasterEgg function
    - Always return true for student ID "1009104"
    - Return true with 1/75 probability for other IDs
    - Ensure randomization per session
    - _Requirements: 5.1, 5.2, 5.3_
  
  - [x] 7.2 Write property test for easter egg probability
    - **Property 3: Easter Egg Probability Distribution**
    - **Validates: Requirements 5.2**
  
  - [x] 7.3 Write property test for easter egg independence
    - **Property 4: Easter Egg Session Independence**
    - **Validates: Requirements 5.3**
  
  - [x] 7.4 Write unit test for special student ID
    - Test student ID 1009104 always shows easter egg
    - _Requirements: 5.1_

- [ ] 8. Implement admin authentication
  - [x] 8.1 Create AdminLogin component
    - Create password input form
    - Implement hardcoded password validation ("Linda47$2")
    - Show error message on incorrect password
    - Emit success event on correct password
    - _Requirements: 6.1, 6.2, 6.3_
  
  - [x] 8.2 Write property test for invalid password rejection
    - **Property 5: Invalid Password Rejection**
    - **Validates: Requirements 6.3**
  
  - [x] 8.3 Write unit tests for AdminLogin component
    - Test form renders
    - Test correct password grants access
    - Test error message display
    - _Requirements: 6.1, 6.2, 6.3_

- [ ] 9. Update admin distribution checkboxes
  - [x] 9.1 Modify ClaimCheckboxes component
    - Ensure checkboxes support both checking and unchecking
    - Call PATCH /api/distribution-status on change
    - Update UI to reflect new state immediately
    - Handle API errors gracefully
    - _Requirements: 7.1, 7.2, 7.3, 7.4_
  
  - [x] 9.2 Write unit tests for bidirectional checkbox behavior
    - Test checking functionality
    - Test unchecking functionality
    - Test API call on change
    - Test UI state update
    - _Requirements: 7.1, 7.2, 7.3, 7.4_

- [ ] 10. Create database table view component
  - [x] 10.1 Create DatabaseTableView component
    - Fetch all students from GET /api/students/all
    - Display data in table format
    - Show columns: Student ID, Name, Shirt, Meal, Consent
    - Implement loading and error states
    - Make table read-only (no editing)
    - _Requirements: 8.1, 8.2, 8.3, 8.4_
  
  - [x] 10.2 Write unit tests for DatabaseTableView component
    - Test table renders with data
    - Test all columns present
    - Test loading state
    - Test error state
    - Test read-only behavior
    - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [ ] 11. Update admin dashboard with tabs
  - [x] 11.1 Modify AdminDashboard component
    - Add tab navigation (Scanner | Database View)
    - Render QRScanner in Scanner tab
    - Render DatabaseTableView in Database View tab
    - Manage active tab state
    - _Requirements: 8.5_
  
  - [x] 11.2 Write unit tests for admin dashboard tabs
    - Test tab navigation
    - Test correct component renders per tab
    - _Requirements: 8.5_

- [ ] 12. Remove ClaimStatusDisplay component
  - [x] 12.1 Remove ClaimStatusDisplay component and references
    - Delete ClaimStatusDisplay.tsx file
    - Delete ClaimStatusDisplay test files
    - Remove all imports of ClaimStatusDisplay
    - Remove component from admin view rendering
    - Verify ClaimCheckboxes still functions correctly
    - _Requirements: 9.1, 9.2, 9.3_
  
  - [x] 12.2 Write unit test to verify component removal
    - Test ClaimStatusDisplay does not render
    - Test ClaimCheckboxes still renders and functions
    - _Requirements: 9.1, 9.2_

- [ ] 13. Integrate participant flow with consent
  - [x] 13.1 Wire consent screen into participant flow
    - Update participant flow routing
    - Show PDPAConsent after student ID submission
    - Show QRDisplayScreen only after consent given
    - Pass collection status to QRDisplayScreen
    - _Requirements: 4.1, 4.3, 4.4_
  
  - [x] 13.2 Write integration test for participant flow
    - Test complete flow: ID input → Consent → QR display
    - Test QR blocked without consent
    - Test collection status appears on QR screen
    - _Requirements: 4.1, 4.3, 4.4, 2.1, 2.2_

- [ ] 14. Integrate admin flow with authentication
  - [x] 14.1 Wire admin login into admin flow
    - Show AdminLogin before admin dashboard
    - Grant access to dashboard on successful login
    - Maintain authentication state
    - _Requirements: 6.1, 6.2_
  
  - [x] 14.2 Write integration test for admin flow
    - Test login required for admin access
    - Test correct password grants access
    - Test admin features accessible after login
    - _Requirements: 6.1, 6.2_

- [x] 15. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 16. Final integration and verification
  - [x] 16.1 Test end-to-end participant flow
    - Manually verify complete participant journey
    - Test with student ID 1009104 (easter egg)
    - Test with random student IDs
    - Verify consent recording
    - Verify collection status display
    - _Requirements: All participant requirements_
  
  - [x] 16.2 Test end-to-end admin flow
    - Manually verify admin login
    - Test QR scanning and status updates
    - Test bidirectional checkbox toggling
    - Test database table view
    - Verify all data displays correctly
    - _Requirements: All admin requirements_
  
  - [x] 16.3 Verify visual branding updates
    - Check background color on all screens
    - Check text color on background
    - Verify ROOT logo appears everywhere
    - Check layout and styling
    - _Requirements: 1.1, 1.2, 1.3_

## Notes

- Each task references specific requirements for traceability
- Backend tasks (1-3) should be completed before frontend tasks (5-12)
- Global styling (task 4) can be done in parallel with backend work
- Integration tasks (13-14) require completion of their dependent components
- Property tests validate universal correctness properties with minimum 100 iterations
- Unit tests validate specific examples and edge cases
- The checkpoint (task 15) ensures incremental validation before final integration
