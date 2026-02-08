# Implementation Plan: Event Check-In System

## Overview

This implementation plan breaks down the Event Check-In System into discrete coding tasks. The system will be built incrementally, starting with the backend data layer, then business logic, API endpoints, and finally the frontend applications. Each task builds on previous work, with testing integrated throughout to catch errors early.

## Tasks

- [x] 1. Set up project structure and dependencies
  - Create backend directory with Express + TypeScript setup
  - Create frontend directory with React + Vite + TypeScript setup
  - Install dependencies: express, pg, qrcode, crypto, cors, dotenv
  - Install frontend dependencies: react, react-router-dom, html5-qrcode
  - Set up TypeScript configurations for both projects
  - Create directory structure for services, DAOs, routes, and components
  - Configure for Vercel deployment (vercel.json, api directory structure)
  - _Requirements: All (foundation)_

- [x] 2. Implement database schema and DAOs
  - [x] 2.1 Create database initialization script
    - Write PostgreSQL schema for students, tokens, and claims tables
    - Add indexes on student_id and token fields
    - Create database connection pool using pg
    - Create migration script to set up tables in Supabase
    - _Requirements: 1.1, 9.4, 10.5_
  
  - [x] 2.2 Implement StudentDAO
    - Write findByStudentId method with case-insensitive search
    - Write upsert method for inserting or updating student records
    - Write importFromCSV method to parse and import CSV data
    - _Requirements: 1.1, 1.4, 1.5, 2.5_
  
  - [x] 2.3 Write property test for student persistence
    - **Property 2: Student Record Persistence**
    - **Validates: Requirements 1.4**
  
  - [x] 2.4 Write property test for student upsert
    - **Property 3: Student Record Upsert**
    - **Validates: Requirements 1.5**
  
  - [x] 2.4.1 Implement duplicate student consolidation logic
    - Add consolidateDuplicates method to StudentDAO
    - Implement t-shirt size comparison logic (XS < S < M < L < XL < XXL)
    - Update importFromCSV to detect and consolidate duplicate Student_IDs
    - Preserve all organization involvement details when consolidating
    - _Requirements: 1.6, 1.7, 1.8_
  
  - [x] 2.4.2 Write property test for duplicate student consolidation
    - **Property 3.1: Duplicate Student Consolidation**
    - **Validates: Requirements 1.6, 1.7, 1.8**
  
  - [x] 2.5 Implement TokenDAO
    - Write create method to store tokens with student associations
    - Write findByToken method for token lookup
    - Write findByStudentId method to get tokens for a student
    - _Requirements: 3.4, 3.6_

  - [x] 2.6 Write property test for token persistence
    - **Property 7: Token Persistence and Association**
    - **Validates: Requirements 3.4, 3.6**

  - [x] 2.7 Implement ClaimDAO
    - Write findByStudentId method to get claim status
    - Write initializeForStudent method to create initial claim record
    - Write updateClaim method with transaction support for atomic updates
    - _Requirements: 5.1, 5.2, 6.4, 9.1, 9.3_

  - [x] 2.8 Write property test for claim recording
    - **Property 10: Claim Recording**
    - **Validates: Requirements 6.4, 6.5**

  - [x] 2.9 Write property test for transaction atomicity
    - **Property 12: Transaction Atomicity**
    - **Validates: Requirements 9.1, 9.3**

- [x] 3. Implement CSV import with validation
  - [x] 3.1 Create CSV parser and validator
    - Write function to parse CSV file
    - Validate required fields (Student_ID, name, t-shirt size, meal preference)
    - Return detailed error messages for missing fields
    - _Requirements: 1.2_
  
  - [x] 3.2 Write property test for CSV validation
    - **Property 1: CSV Field Validation**
    - **Validates: Requirements 1.2**
  
  - [x] 3.3 Implement startup import process
    - Create startup script that imports CSV on system start
    - Handle missing or corrupted CSV files with error logging
    - Prevent system startup if CSV import fails
    - _Requirements: 1.1, 1.3_
  
  - [x] 3.4 Write unit tests for CSV import edge cases
    - Test with missing CSV file
    - Test with corrupted CSV file
    - Test with valid CSV file
    - _Requirements: 1.3_

- [x] 4. Checkpoint - Verify database layer
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Implement business logic services
  - [x] 5.1 Implement StudentService
    - Write validateStudentId method with case-insensitive matching
    - Write getStudentByToken method
    - Add input sanitization for student IDs
    - _Requirements: 2.1, 2.2, 2.3, 2.5_
  
  - [x] 5.2 Write property test for student ID validation
    - **Property 4: Student ID Validation**
    - **Validates: Requirements 2.1, 2.2, 2.3, 2.5**
  
  - [x] 5.3 Implement TokenService
    - Write generateToken method using crypto.randomBytes (32 bytes)
    - Write storeToken method to persist tokens
    - Write validateToken method to check token existence
    - Ensure token uniqueness with collision detection
    - _Requirements: 3.1, 3.2_
  
  - [x] 5.4 Write property test for token uniqueness
    - **Property 5: Token Uniqueness**
    - **Validates: Requirements 3.1, 3.2**
  
  - [x] 5.5 Implement QRCodeService
    - Write generateQRCode method using qrcode library
    - Encode token and student ID into QR code data
    - Return base64 data URL for display
    - Set error correction level to M
    - _Requirements: 3.3_
  
  - [x] 5.6 Write property test for QR code round trip
    - **Property 6: QR Code Round Trip**
    - **Validates: Requirements 3.3**
  
  - [x] 5.7 Implement ClaimService
    - Write getClaimStatus method
    - Write recordClaim method with duplicate checking
    - Write isAlreadyClaimed method
    - Ensure atomic transaction handling
    - _Requirements: 5.1, 6.4, 7.1, 7.2, 9.1_
  
  - [x] 5.8 Write property test for duplicate claim prevention
    - **Property 11: Duplicate Claim Prevention**
    - **Validates: Requirements 7.1, 7.2**

- [x] 6. Implement API endpoints
  - [x] 6.1 Create POST /api/validate endpoint
    - Accept studentId in request body
    - Call StudentService to validate ID
    - Generate token and QR code for valid students
    - Return student info and QR code or error
    - _Requirements: 2.1, 2.2, 2.3, 3.1, 3.3, 3.5_
  
  - [x] 6.2 Create POST /api/scan endpoint
    - Accept token in request body
    - Call TokenService to validate token
    - Retrieve student info and claim status
    - Return student data and claims or error
    - _Requirements: 4.2, 4.3, 4.4, 4.5, 5.1_
  
  - [x] 6.3 Create POST /api/claim endpoint
    - Accept token and itemType in request body
    - Validate token and check for duplicate claims
    - Record claim using ClaimService
    - Return updated claim status or error (409 for duplicates)
    - _Requirements: 6.2, 6.3, 6.4, 6.5, 7.1, 7.2_
  
  - [x] 6.4 Write property test for token validation
    - **Property 8: Token Validation**
    - **Validates: Requirements 4.3, 4.4, 4.5**
  
  - [x] 6.5 Write unit tests for API endpoints
    - Test each endpoint with valid and invalid inputs
    - Test error responses (400, 404, 409, 500)
    - Test response formats match specifications
    - _Requirements: 2.1, 2.2, 2.3, 4.3, 4.4, 4.5, 7.1, 7.2_
  
  - [x] 6.6 Update API responses to include parsed organization involvements
    - Parse organizationDetails string into structured array
    - Return involvements as array of {club, role} objects
    - Update /api/validate and /api/scan endpoints
    - _Requirements: 2.6, 4.7_

- [x] 7. Implement error handling middleware
  - Create global error handler for Express
  - Implement consistent error response format
  - Add request validation middleware
  - Add logging for all errors with timestamps
  - _Requirements: All error handling requirements_

- [x] 8. Checkpoint - Verify backend functionality
  - Ensure all tests pass, ask the user if questions arise.

- [x] 9. Implement Student App frontend
  - [x] 9.1 Create StudentIDForm component
    - Input field for student ID with validation
    - Submit button with loading state
    - Client-side validation (non-empty, trimmed)
    - Call /api/validate endpoint on submit
    - _Requirements: 2.1, 8.1_
  
  - [x] 9.2 Create QRCodeDisplay component
    - Display QR code image from base64 data URL
    - Show student information (name, t-shirt size, meal preference)
    - Display organization involvements in a structured list (club and role)
    - Success message and styling
    - Option to generate new QR code
    - _Requirements: 3.5, 8.3_
  
  - [x] 9.3 Create ErrorMessage component
    - Reusable error display component
    - Clear styling for visibility
    - Display validation errors
    - _Requirements: 8.2_
  
  - [x] 9.4 Wire Student App components together
    - Create main App component with state management
    - Handle form submission and API calls
    - Display appropriate component based on state
    - Add error handling and retry logic
    - _Requirements: 2.1, 2.2, 2.3, 3.5, 8.1, 8.2, 8.3_
  
  - [x] 9.5 Write unit tests for Student App components
    - Test StudentIDForm rendering and submission
    - Test QRCodeDisplay with mock data
    - Test ErrorMessage display
    - _Requirements: 8.1, 8.2, 8.3_

- [x] 10. Implement Admin App frontend
  - [x] 10.1 Create QRScanner component
    - Integrate html5-qrcode library
    - Request camera permissions
    - Continuous scanning mode
    - Extract token from scanned QR code
    - Call /api/scan endpoint with token
    - _Requirements: 4.1, 4.2, 8.6_
  
  - [x] 10.2 Create StudentInfoCard component
    - Display student name, ID, t-shirt size, meal preference
    - Display organization involvements in a structured list (club and role)
    - Visual layout optimized for mobile
    - Clear typography and spacing
    - _Requirements: 4.4, 8.4_
  
  - [x] 10.3 Create ClaimStatusDisplay component
    - Show claim status for t-shirt and meal coupon
    - Visual indicators (checkmarks, colors) for claimed items
    - Clear distinction between claimed and unclaimed
    - _Requirements: 5.1, 5.3, 5.4, 5.5_
  
  - [x] 10.3.1 Add involvement display component
    - Parse organization_details string to extract club and role information
    - Display each club/role combination as a separate item
    - Use clear visual formatting (badges, cards, or list items)
    - Show on both Student App (QRCodeDisplay) and Admin App (StudentInfoCard)
    - _Requirements: 2.6, 2.7, 4.7, 4.8, 8.7, 8.8_
  
  - [x] 10.4 Create ClaimCheckboxes component
    - Two checkboxes for t-shirt and meal coupon
    - Disable checkboxes for already-claimed items
    - Loading state during claim submission
    - Call /api/claim endpoint on checkbox change
    - Display confirmation or error messages
    - _Requirements: 6.1, 6.2, 6.3, 7.3, 7.4, 7.5, 8.5_
  
  - [x] 10.5 Wire Admin App components together
    - Create main App component with state management
    - Handle QR scan results and display student info
    - Manage claim status updates
    - Add error handling for invalid QR codes and duplicate claims
    - Implement mobile-friendly layout
    - _Requirements: 4.1, 4.2, 4.4, 5.1, 6.1, 6.2, 6.3, 7.3, 8.4, 8.6_
  
  - [x] 10.6 Write unit tests for Admin App components
    - Test QRScanner with mock camera
    - Test StudentInfoCard rendering
    - Test ClaimCheckboxes interaction
    - Test error handling
    - _Requirements: 4.1, 5.1, 6.1, 7.3_

- [x] 11. Implement frontend-backend integration
  - Configure CORS for API access
  - Set up proxy for development (Vite proxy to Express)
  - Add retry logic for network failures
  - Implement loading states for all API calls
  - _Requirements: 2.4, 4.6, 10.1, 10.2, 10.3_

- [x] 12. Checkpoint - Verify end-to-end functionality
  - Ensure all tests pass, ask the user if questions arise.

- [x] 13. Write integration tests
  - Test complete student validation flow
  - Test complete QR scan and claim flow
  - Test CSV import to database to API
  - Test error scenarios end-to-end
  - _Requirements: All_

- [x] 14. Write property test for claim status retrieval
  - **Property 9: Claim Status Retrieval**
  - **Validates: Requirements 5.1, 5.2**

- [x] 15. Write property test for database constraints
  - **Property 13: Database Constraint Enforcement**
  - **Validates: Requirements 9.4**

- [x] 16. Configure production build and deployment
  - Create vercel.json configuration for serverless functions
  - Set up Supabase project and run migrations
  - Configure environment variables in Vercel (DATABASE_URL)
  - Structure backend as serverless functions in /api directory
  - Build and deploy frontend to Vercel
  - Test production deployment end-to-end
  - _Requirements: All (deployment)_

## Notes

- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at key milestones
- Property tests validate universal correctness properties with 100+ iterations
- Unit tests validate specific examples, edge cases, and error conditions
- The implementation follows a bottom-up approach: data layer → business logic → API → frontend
- All database operations use transactions to ensure atomicity
- Frontend components are designed mobile-first for the Admin App
