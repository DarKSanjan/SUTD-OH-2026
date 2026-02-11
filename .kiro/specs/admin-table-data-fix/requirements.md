# Requirements Document: Admin Table Data Fix

## Introduction

The admin table view currently has critical data display issues where important student information (t-shirt size and meal preference) is not being shown. The backend API endpoint `/api/students/all` does not return the `tshirt_size` and `meal_preference` fields even though they exist in the database. Additionally, the frontend table structure is inconsistent - the header columns don't match the actual data being displayed in the rows, creating a confusing user experience.

This feature will fix the backend API to include all necessary student data fields and update the frontend table to properly display t-shirt sizes and meal preferences in dedicated columns, while ensuring the table header accurately reflects the displayed data.

## Glossary

- **Admin_Table**: The database view component in the admin interface that displays all student records
- **Backend_API**: The Express.js server endpoint `/api/students/all` that retrieves student data
- **Student_DAO**: The Data Access Object responsible for querying student records from the database
- **Table_Header**: The header row of the admin table showing column names
- **Table_Row**: Individual rows in the admin table displaying student data
- **T-shirt_Size**: The size of t-shirt requested by a student (e.g., XS, S, M, L, XL, XXL)
- **Meal_Preference**: The type of meal requested by a student (e.g., Vegetarian, Non-Vegetarian, Halal)

## Requirements

### Requirement 1: Backend API Data Completeness

**User Story:** As an admin, I want the backend API to return complete student information including t-shirt size and meal preference, so that I can view all relevant data in the admin table.

#### Acceptance Criteria

1. WHEN the Backend_API endpoint `/api/students/all` is called, THE Backend_API SHALL include the `tshirtSize` field in each student record
2. WHEN the Backend_API endpoint `/api/students/all` is called, THE Backend_API SHALL include the `mealPreference` field in each student record
3. WHEN a student record has a null or empty t-shirt size in the database, THE Backend_API SHALL return an empty string for the `tshirtSize` field
4. WHEN a student record has a null or empty meal preference in the database, THE Backend_API SHALL return an empty string for the `mealPreference` field
5. WHEN the Student_DAO queries student records, THE Student_DAO SHALL retrieve `tshirt_size` and `meal_preference` columns from the database

### Requirement 2: Frontend Table Column Display

**User Story:** As an admin, I want to see t-shirt size and meal preference columns in the admin table, so that I can quickly view this information for all students.

#### Acceptance Criteria

1. WHEN the Admin_Table is rendered, THE Admin_Table SHALL display a "T-shirt Size" column
2. WHEN the Admin_Table is rendered, THE Admin_Table SHALL display a "Meal Preference" column
3. WHEN a student has a t-shirt size, THE Table_Row SHALL display the t-shirt size value in the "T-shirt Size" column
4. WHEN a student has a meal preference, THE Table_Row SHALL display the meal preference value in the "Meal Preference" column
5. WHEN a student has no t-shirt size, THE Table_Row SHALL display "N/A" in the "T-shirt Size" column
6. WHEN a student has no meal preference, THE Table_Row SHALL display "N/A" in the "Meal Preference" column

### Requirement 3: Table Header Consistency

**User Story:** As an admin, I want the table header columns to match the actual data displayed in the rows, so that I can easily understand what information each column contains.

#### Acceptance Criteria

1. WHEN the Table_Header is rendered, THE Table_Header SHALL display column names that exactly match the data shown in Table_Row components
2. WHEN the Admin_Table displays student ID, THE Table_Header SHALL show "Student ID" as the first column
3. WHEN the Admin_Table displays student name, THE Table_Header SHALL show "Name" as the second column
4. WHEN the Admin_Table displays clubs, THE Table_Header SHALL show "Clubs" as the third column
5. WHEN the Admin_Table displays involvement, THE Table_Header SHALL show "Involvement" as the fourth column
6. WHEN the Admin_Table displays t-shirt size, THE Table_Header SHALL show "T-shirt Size" as the fifth column
7. WHEN the Admin_Table displays meal preference, THE Table_Header SHALL show "Meal Preference" as the sixth column
8. WHEN the Admin_Table displays shirt collection status, THE Table_Header SHALL show "Shirt Collected" as the seventh column
9. WHEN the Admin_Table displays meal collection status, THE Table_Header SHALL show "Meal Collected" as the eighth column
10. WHEN the Admin_Table displays consent status, THE Table_Header SHALL show "Consent" as the ninth column

### Requirement 4: Data Type Extension

**User Story:** As a developer, I want the frontend TypeScript types to include t-shirt size and meal preference fields, so that the type system accurately reflects the data structure.

#### Acceptance Criteria

1. WHEN the StudentRecord interface is defined, THE StudentRecord SHALL include a `tshirtSize` field of type string
2. WHEN the StudentRecord interface is defined, THE StudentRecord SHALL include a `mealPreference` field of type string
3. WHEN student data is fetched from the API, THE frontend SHALL map the `tshirtSize` field from the API response to the StudentRecord
4. WHEN student data is fetched from the API, THE frontend SHALL map the `mealPreference` field from the API response to the StudentRecord

### Requirement 5: Sorting Functionality Preservation

**User Story:** As an admin, I want to be able to sort by the new t-shirt size and meal preference columns, so that I can organize student data by these fields.

#### Acceptance Criteria

1. WHEN the "T-shirt Size" column header is clicked, THE Admin_Table SHALL sort students by t-shirt size in ascending order
2. WHEN the "T-shirt Size" column header is clicked again, THE Admin_Table SHALL sort students by t-shirt size in descending order
3. WHEN the "Meal Preference" column header is clicked, THE Admin_Table SHALL sort students by meal preference in ascending order
4. WHEN the "Meal Preference" column header is clicked again, THE Admin_Table SHALL sort students by meal preference in descending order
5. WHEN sorting by t-shirt size, THE Admin_Table SHALL treat empty values as coming after all non-empty values
6. WHEN sorting by meal preference, THE Admin_Table SHALL treat empty values as coming after all non-empty values

### Requirement 6: Existing Functionality Preservation

**User Story:** As an admin, I want all existing table features to continue working after the fix, so that I don't lose any functionality.

#### Acceptance Criteria

1. WHEN the Admin_Table is updated with new columns, THE Admin_Table SHALL preserve the existing search functionality
2. WHEN the Admin_Table is updated with new columns, THE Admin_Table SHALL preserve the existing filter functionality
3. WHEN the Admin_Table is updated with new columns, THE Admin_Table SHALL preserve the existing sort functionality for all original columns
4. WHEN the Admin_Table is updated with new columns, THE Admin_Table SHALL preserve the interactive checkbox functionality for shirt and meal collection
5. WHEN the Admin_Table is updated with new columns, THE Admin_Table SHALL preserve the virtualization functionality for large datasets
6. WHEN the Admin_Table is updated with new columns, THE Admin_Table SHALL preserve the optimistic update functionality for checkboxes
