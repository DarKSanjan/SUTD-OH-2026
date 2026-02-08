# Requirements Document: Event Check-In System

## Introduction

The Event Check-In System is a web-based application for managing student check-ins at Open House 2026. The system validates student IDs against organization involvement data, generates unique QR codes for validated students, and provides an admin interface for scanning QR codes and tracking item distribution (t-shirts and meal coupons).

## Glossary

- **Student**: A person attending Open House 2026 who is registered in the organization involvement data
- **Student_ID**: A unique identifier for each student in the system
- **User_App**: The web application where students enter their ID and receive a QR code
- **Admin_App**: The mobile-friendly web application where administrators scan QR codes and mark claims
- **QR_Code**: A machine-readable code containing encrypted student information and a unique token
- **Backend**: The Node.js + Express server that manages data and business logic
- **Database**: The SQLite database storing student data and claim records
- **CSV_File**: The source data file "Open House 2026 Student Organisations Involvement 1.csv"
- **Claim**: A record indicating that a student has received a t-shirt or meal coupon
- **Token**: A unique identifier embedded in the QR code for validation

## Requirements

### Requirement 1: Data Import and Storage

**User Story:** As a system administrator, I want to import student organization involvement data from a CSV file into the database, so that the system has the necessary data to validate students.

#### Acceptance Criteria

1. WHEN the system starts, THE Backend SHALL import data from the CSV_File into the Database
2. WHEN importing CSV data, THE Backend SHALL validate that required fields are present (Student_ID, name, t-shirt size, meal preference)
3. IF the CSV_File is missing or corrupted, THEN THE Backend SHALL log an error and prevent system startup
4. THE Backend SHALL store student records with fields: Student_ID, name, t-shirt size, meal preference, and organization involvement details
5. WHEN a student record already exists in the Database, THE Backend SHALL update it with new CSV data
6. WHEN a student appears multiple times in the CSV (volunteering for multiple organizations), THE Backend SHALL consolidate records into a single student entry
7. WHEN consolidating duplicate student records, THE Backend SHALL select the largest t-shirt size among all entries (size order: XS < S < M < L < XL < XXL)
8. WHEN consolidating duplicate student records, THE Backend SHALL preserve all organization involvement details

### Requirement 2: Student ID Validation

**User Story:** As a student, I want to enter my student ID and have it validated, so that I can receive a QR code for check-in.

#### Acceptance Criteria

1. WHEN a student submits a Student_ID through the User_App, THE Backend SHALL validate it against the Database
2. WHEN a valid Student_ID is submitted, THE Backend SHALL return the student's information (name, t-shirt size, meal preference, organization involvements)
3. WHEN an invalid Student_ID is submitted, THE Backend SHALL return an error message indicating the ID was not found
4. THE User_App SHALL display validation results to the student within 2 seconds
5. WHEN validating a Student_ID, THE Backend SHALL perform case-insensitive matching
6. WHEN displaying student information, THE User_App SHALL show all clubs the student is volunteering for and their roles in each club
7. THE organization involvement details SHALL be parsed and displayed in a structured format showing club name and role/involvement separately for each entry

### Requirement 3: QR Code Generation

**User Story:** As a student, I want to receive a unique QR code after validation, so that I can use it for check-in at the event.

#### Acceptance Criteria

1. WHEN a Student_ID is validated successfully, THE Backend SHALL generate a unique Token for that student
2. WHEN generating a Token, THE Backend SHALL ensure it is cryptographically unique and not previously used
3. THE Backend SHALL create a QR_Code containing the Token, Student_ID, name, t-shirt size, and meal preference
4. THE Backend SHALL store the Token in the Database associated with the student record
5. THE User_App SHALL display the QR_Code to the student immediately after validation
6. THE QR_Code SHALL remain valid for the duration of the event

### Requirement 4: QR Code Scanning

**User Story:** As an event administrator, I want to scan student QR codes using my mobile device, so that I can verify their identity and see what items they should receive.

#### Acceptance Criteria

1. THE Admin_App SHALL provide a mobile-friendly QR code scanner interface
2. WHEN a QR_Code is scanned, THE Admin_App SHALL extract the Token and send it to the Backend for validation
3. WHEN the Backend receives a Token, THE Backend SHALL validate it against stored tokens in the Database
4. WHEN a valid Token is received, THE Backend SHALL return the associated student information (name, Student_ID, t-shirt size, meal preference, organization involvements)
5. WHEN an invalid Token is received, THE Backend SHALL return an error message indicating the QR code is not valid
6. THE Admin_App SHALL display validation results within 2 seconds of scanning
7. WHEN displaying student information, THE Admin_App SHALL show all clubs the student is volunteering for and their roles in each club in a clear, organized format
8. THE organization involvement details SHALL be parsed and displayed in a structured format showing club name and role/involvement separately for each entry

### Requirement 5: Claim Status Display

**User Story:** As an event administrator, I want to see what items a student has already claimed, so that I can prevent duplicate distributions.

#### Acceptance Criteria

1. WHEN displaying student information after a QR scan, THE Admin_App SHALL show the current claim status for t-shirt and meal coupon
2. THE Backend SHALL track claim status with two boolean fields: t_shirt_claimed and meal_claimed
3. WHEN a student has not claimed an item, THE Admin_App SHALL display the item as available
4. WHEN a student has already claimed an item, THE Admin_App SHALL display the item as already claimed
5. THE Admin_App SHALL visually distinguish between claimed and unclaimed items

### Requirement 6: Item Distribution Tracking

**User Story:** As an event administrator, I want to mark which items I distribute to a student, so that the system prevents duplicate claims.

#### Acceptance Criteria

1. THE Admin_App SHALL provide checkboxes for marking t-shirt distribution and meal coupon distribution
2. WHEN an administrator checks a t-shirt checkbox, THE Admin_App SHALL send an update request to the Backend
3. WHEN an administrator checks a meal coupon checkbox, THE Admin_App SHALL send an update request to the Backend
4. WHEN the Backend receives a claim update, THE Backend SHALL update the corresponding claim status in the Database
5. WHEN a claim is successfully recorded, THE Backend SHALL return confirmation to the Admin_App
6. THE Admin_App SHALL update the display to reflect the new claim status immediately

### Requirement 7: Duplicate Claim Prevention

**User Story:** As an event administrator, I want the system to prevent duplicate claims, so that students cannot receive multiple t-shirts or meal coupons, even if they are volunteering for multiple organizations.

#### Acceptance Criteria

1. WHEN an administrator attempts to mark an item as claimed, THE Backend SHALL check if it was already claimed
2. WHEN an item is already claimed, THE Backend SHALL reject the claim request and return an error message
3. WHEN an item is already claimed, THE Admin_App SHALL display a warning message to the administrator
4. THE Admin_App SHALL disable checkboxes for items that are already claimed
5. WHEN both items are already claimed, THE Admin_App SHALL display a message indicating the student has received all items
6. WHEN a student volunteers for multiple organizations, THE Backend SHALL ensure they can only claim one t-shirt and one meal coupon total (not per organization)

### Requirement 8: User Interface Requirements

**User Story:** As a user of the system, I want a simple and functional interface, so that I can complete tasks quickly without confusion.

#### Acceptance Criteria

1. THE User_App SHALL display a single input field for Student_ID entry with a submit button
2. THE User_App SHALL display clear error messages when validation fails
3. THE User_App SHALL display the QR_Code prominently when validation succeeds
4. THE Admin_App SHALL be optimized for mobile device screens
5. THE Admin_App SHALL use large touch targets for buttons and checkboxes (minimum 44x44 pixels)
6. WHEN the Admin_App is loaded, THE Admin_App SHALL immediately activate the QR scanner
7. WHEN displaying organization involvements, BOTH User_App and Admin_App SHALL show each club and role as separate, clearly labeled items
8. THE involvement display SHALL be easy to scan visually, with clear separation between different clubs

### Requirement 9: Data Persistence and Integrity

**User Story:** As a system administrator, I want all claim data to be persisted reliably, so that no distribution records are lost.

#### Acceptance Criteria

1. WHEN a claim is recorded, THE Backend SHALL commit the transaction to the Database before returning success
2. IF a database write fails, THEN THE Backend SHALL return an error and not confirm the claim
3. THE Backend SHALL use database transactions to ensure atomic updates
4. THE Database SHALL enforce uniqueness constraints on Student_ID and Token fields
5. WHEN the system restarts, THE Backend SHALL preserve all existing claim data

### Requirement 10: System Performance

**User Story:** As a user of the system, I want fast response times, so that check-in processing does not create bottlenecks at the event.

#### Acceptance Criteria

1. WHEN a Student_ID validation request is received, THE Backend SHALL respond within 500 milliseconds
2. WHEN a QR_Code scan validation request is received, THE Backend SHALL respond within 500 milliseconds
3. WHEN a claim update request is received, THE Backend SHALL respond within 500 milliseconds
4. THE Backend SHALL handle at least 10 concurrent requests without performance degradation
5. THE Database SHALL use indexes on Student_ID and Token fields for fast lookups
