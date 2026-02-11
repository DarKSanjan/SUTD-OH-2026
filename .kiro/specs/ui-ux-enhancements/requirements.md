# Requirements Document: UI/UX Enhancements

## Introduction

This document specifies UI/UX enhancements for an existing event check-in system. The enhancements include visual branding updates, improved user experience for participants, enhanced admin functionality, and refined easter egg behavior. The system is built with React + TypeScript frontend, Express backend, and PostgreSQL via Supabase.

## Glossary

- **System**: The event check-in web application
- **Participant**: A student or attendee using the check-in system
- **Admin**: An authorized user managing check-ins and viewing data
- **QR_Display_Screen**: The screen showing the participant's QR code for scanning
- **Student_ID_Form**: The input form where participants enter their student ID
- **Distribution_Checkboxes**: UI controls for marking shirt/meal as collected
- **Database_Table_View**: Read-only display of all student records
- **Easter_Egg**: Special visual effect shown under certain conditions
- **PDPA_Consent**: Privacy consent checkbox for data usage
- **Consent_State**: Boolean flag indicating whether participant has consented

## Requirements

### Requirement 1: Visual Branding Updates

**User Story:** As a system administrator, I want to update the visual branding, so that the application reflects the correct organization identity.

#### Acceptance Criteria

1. THE System SHALL set the background color to #53001b for all screens
2. WHEN text is displayed directly on the background, THE System SHALL render it in white color
3. THE System SHALL replace all SUTD logo instances with ROOT logo throughout the application

### Requirement 2: Collection Status Display

**User Story:** As a participant, I want to see my shirt and meal collection status on the QR code screen, so that I know what items I have already collected.

#### Acceptance Criteria

1. WHEN the QR_Display_Screen is shown, THE System SHALL display the participant's shirt collection status
2. WHEN the QR_Display_Screen is shown, THE System SHALL display the participant's meal collection status
3. THE System SHALL present the collection status information in a clean layout alongside the QR code

### Requirement 3: Navigation Button Enhancement

**User Story:** As a participant, I want a clear way to start over, so that I can return to the beginning if I need to check in again or made a mistake.

#### Acceptance Criteria

1. THE System SHALL display a button labeled "Start Over" on the QR_Display_Screen
2. WHEN the "Start Over" button is clicked, THE System SHALL navigate to the Student_ID_Form
3. WHEN the "Start Over" button is clicked, THE System SHALL clear any previous form state

### Requirement 4: PDPA Consent Collection

**User Story:** As a system administrator, I want to collect PDPA consent from participants, so that we comply with data protection regulations.

#### Acceptance Criteria

1. WHEN a participant submits their student ID, THE System SHALL display a PDPA_Consent checkbox before showing the QR code
2. THE PDPA_Consent checkbox SHALL display the text: "I consent to my information being used properly and it will be properly disposed after the event"
3. WHEN the PDPA_Consent checkbox is unchecked, THE System SHALL prevent the QR code from being displayed
4. WHEN the PDPA_Consent checkbox is checked, THE System SHALL display the QR code
5. WHEN a participant checks the PDPA_Consent checkbox, THE System SHALL store the Consent_State in the database
6. THE System SHALL persist the Consent_State for each participant record

### Requirement 5: Easter Egg Behavior

**User Story:** As a system designer, I want to control easter egg display logic, so that it appears consistently for specific users and randomly for others.

#### Acceptance Criteria

1. WHEN student ID 1009104 is entered, THE System SHALL always display the Easter_Egg
2. WHEN any other student ID is entered, THE System SHALL display the Easter_Egg with a 1 in 75 probability
3. THE System SHALL generate the random probability independently for each check-in session

### Requirement 6: Admin Authentication

**User Story:** As a system administrator, I want password-protected admin access, so that only authorized users can manage check-ins.

#### Acceptance Criteria

1. WHEN accessing the admin view, THE System SHALL display a password login form
2. WHEN the password "Linda47$2" is entered, THE System SHALL grant access to the admin view
3. WHEN an incorrect password is entered, THE System SHALL deny access and display an error message
4. THE System SHALL implement the password check as a hardcoded comparison

### Requirement 7: Reversible Distribution Status

**User Story:** As an admin, I want to uncheck shirt and meal distribution status, so that I can correct mistakes or handle item returns.

#### Acceptance Criteria

1. WHEN an admin views the Distribution_Checkboxes, THE System SHALL allow checking to mark items as collected
2. WHEN an admin views the Distribution_Checkboxes, THE System SHALL allow unchecking to mark items as not collected
3. WHEN a Distribution_Checkboxes state changes, THE System SHALL update the database immediately
4. WHEN a Distribution_Checkboxes state changes, THE System SHALL reflect the new state in the UI

### Requirement 8: Database Table View

**User Story:** As an admin, I want to view all student records in a table, so that I can see the complete database at a glance.

#### Acceptance Criteria

1. THE System SHALL provide a Database_Table_View accessible from the admin interface
2. THE Database_Table_View SHALL display all student records from the database
3. THE Database_Table_View SHALL show student ID, name, shirt status, meal status, and consent status for each record
4. THE Database_Table_View SHALL be read-only with no editing capabilities
5. THE System SHALL organize the Database_Table_View as a separate tab or view in the admin interface

### Requirement 9: Remove Redundant UI Component

**User Story:** As a system maintainer, I want to remove duplicate functionality, so that the interface is cleaner and easier to maintain.

#### Acceptance Criteria

1. THE System SHALL remove the "Claim Status" display component from the admin view
2. WHEN the "Claim Status" display component is removed, THE Distribution_Checkboxes SHALL remain functional
3. THE System SHALL maintain all existing distribution tracking functionality after component removal
