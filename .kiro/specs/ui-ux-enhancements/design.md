# Design Document: UI/UX Enhancements

## Overview

This design document outlines the implementation approach for UI/UX enhancements to the existing event check-in system. The enhancements focus on visual branding updates, improved participant experience with PDPA consent, enhanced admin capabilities including reversible status updates and database viewing, and refined easter egg behavior.

The system architecture remains unchanged - a React + TypeScript frontend communicating with an Express backend that interfaces with PostgreSQL via Supabase. The enhancements are primarily frontend changes with supporting backend modifications for new data fields and API endpoints.

## Architecture

### System Layers

The existing three-tier architecture is maintained:

1. **Presentation Layer (Frontend)**
   - React components for participant and admin views
   - State management for UI interactions
   - QR code generation and display
   - Form validation and user input handling

2. **Application Layer (Backend)**
   - Express API endpoints for data operations
   - Authentication logic for admin access
   - Business logic for consent tracking and status updates

3. **Data Layer (Database)**
   - PostgreSQL via Supabase
   - Student records with extended schema for consent tracking
   - Distribution status (shirt, meal) with bidirectional updates

### Component Interaction Flow

**Participant Flow:**
```
Student ID Input → Validation → Consent Screen → QR Display (with status)
                                      ↓
                              Database: Store Consent
```

**Admin Flow:**
```
Password Login → Admin Dashboard → [QR Scanner | Database View]
                                           ↓
                                   Toggle Distribution Status
                                           ↓
                                   Database: Update Status
```

## Components and Interfaces

### Frontend Components

#### 1. Global Styling Updates

**Component:** `App.tsx` / Global CSS
- Apply background color #53001b to root element
- Set text color to white for elements directly on background
- Replace SUTD logo imports with ROOT logo

**Interface:**
```typescript
// CSS Variables
:root {
  --background-color: #53001b;
  --text-on-background: #ffffff;
}
```

#### 2. QR Display Screen Enhancement

**Component:** `QRDisplayScreen.tsx` (modified)

**Props:**
```typescript
interface QRDisplayScreenProps {
  studentId: string;
  qrCodeData: string;
  shirtCollected: boolean;
  mealCollected: boolean;
  onStartOver: () => void;
}
```

**Responsibilities:**
- Display QR code prominently
- Show collection status for shirt and meal
- Render "Start Over" button
- Handle navigation back to student ID form

**Layout Structure:**
```
┌─────────────────────────────┐
│      QR Code (centered)     │
├─────────────────────────────┤
│  Collection Status:         │
│  ✓/✗ Shirt Collected        │
│  ✓/✗ Meal Collected         │
├─────────────────────────────┤
│    [Start Over Button]      │
└─────────────────────────────┘
```

#### 3. PDPA Consent Component

**Component:** `PDPAConsent.tsx` (new)

**Props:**
```typescript
interface PDPAConsentProps {
  studentId: string;
  onConsentGiven: () => void;
  onBack: () => void;
}
```

**State:**
```typescript
interface PDPAConsentState {
  isChecked: boolean;
  isSubmitting: boolean;
  error: string | null;
}
```

**Responsibilities:**
- Display consent checkbox with required text
- Validate checkbox state before allowing progression
- Call backend API to store consent when checked
- Enable QR display only after consent is given

**API Call:**
```typescript
POST /api/consent
Body: { studentId: string, consented: boolean }
Response: { success: boolean, message: string }
```

#### 4. Easter Egg Logic Enhancement

**Component:** `EasterEgg.tsx` (modified)

**Logic:**
```typescript
function shouldShowEasterEgg(studentId: string): boolean {
  // Always show for special ID
  if (studentId === "1009104") {
    return true;
  }
  
  // 1 in 75 random chance for others
  return Math.random() < (1 / 75);
}
```

**Responsibilities:**
- Check student ID against special case
- Generate random probability for other IDs
- Trigger easter egg display based on logic
- Ensure randomization occurs per session

#### 5. Admin Login Component

**Component:** `AdminLogin.tsx` (new)

**Props:**
```typescript
interface AdminLoginProps {
  onLoginSuccess: () => void;
}
```

**State:**
```typescript
interface AdminLoginState {
  password: string;
  error: string | null;
  isSubmitting: boolean;
}
```

**Responsibilities:**
- Display password input form
- Validate password against hardcoded value "Linda47$2"
- Show error message on incorrect password
- Grant access to admin dashboard on success

**Validation Logic:**
```typescript
function validatePassword(input: string): boolean {
  return input === "Linda47$2";
}
```

#### 6. Distribution Checkboxes Enhancement

**Component:** `ClaimCheckboxes.tsx` (modified)

**Props:**
```typescript
interface ClaimCheckboxesProps {
  studentId: string;
  shirtCollected: boolean;
  mealCollected: boolean;
  onStatusChange: (type: 'shirt' | 'meal', collected: boolean) => void;
}
```

**Responsibilities:**
- Display checkboxes for shirt and meal
- Allow both checking and unchecking
- Call API to update status on change
- Reflect current status from database

**API Call:**
```typescript
PATCH /api/distribution-status
Body: { 
  studentId: string, 
  itemType: 'shirt' | 'meal', 
  collected: boolean 
}
Response: { success: boolean, updatedStatus: DistributionStatus }
```

#### 7. Database Table View Component

**Component:** `DatabaseTableView.tsx` (new)

**Props:**
```typescript
interface DatabaseTableViewProps {
  // No props - fetches data internally
}
```

**State:**
```typescript
interface DatabaseTableViewState {
  students: StudentRecord[];
  isLoading: boolean;
  error: string | null;
}

interface StudentRecord {
  studentId: string;
  name: string;
  shirtCollected: boolean;
  mealCollected: boolean;
  consented: boolean;
}
```

**Responsibilities:**
- Fetch all student records from database
- Display records in a table format
- Show student ID, name, shirt status, meal status, consent status
- Provide read-only view (no editing)
- Handle loading and error states

**API Call:**
```typescript
GET /api/students/all
Response: { 
  students: StudentRecord[], 
  total: number 
}
```

**Table Structure:**
```
| Student ID | Name | Shirt | Meal | Consent |
|------------|------|-------|------|---------|
| 1001234    | ...  | ✓     | ✗    | ✓       |
```

#### 8. Admin Dashboard Enhancement

**Component:** `AdminDashboard.tsx` (modified)

**State:**
```typescript
interface AdminDashboardState {
  activeTab: 'scanner' | 'database';
}
```

**Responsibilities:**
- Provide tab navigation between QR Scanner and Database View
- Render appropriate component based on active tab
- Maintain admin session state

**Tab Structure:**
```
┌─────────────────────────────┐
│ [Scanner] [Database View]   │
├─────────────────────────────┤
│                             │
│   Active Component Here     │
│                             │
└─────────────────────────────┘
```

#### 9. Remove Claim Status Display

**Component:** `ClaimStatusDisplay.tsx` (to be removed)

**Action:**
- Remove component file
- Remove all imports and references
- Ensure Distribution_Checkboxes remains functional
- Update admin view to not render this component

### Backend Components

#### 1. Database Schema Extension

**Table:** `students` (modified)

**New Column:**
```sql
ALTER TABLE students 
ADD COLUMN consented BOOLEAN DEFAULT FALSE;
```

**Complete Schema:**
```typescript
interface StudentRecord {
  id: number;
  student_id: string;
  name: string;
  shirt_collected: boolean;
  meal_collected: boolean;
  consented: boolean;  // NEW
  created_at: timestamp;
  updated_at: timestamp;
}
```

#### 2. Consent API Endpoint

**Endpoint:** `POST /api/consent`

**Request:**
```typescript
interface ConsentRequest {
  studentId: string;
  consented: boolean;
}
```

**Response:**
```typescript
interface ConsentResponse {
  success: boolean;
  message: string;
}
```

**Logic:**
```typescript
async function recordConsent(studentId: string, consented: boolean): Promise<void> {
  await db.query(
    'UPDATE students SET consented = $1, updated_at = NOW() WHERE student_id = $2',
    [consented, studentId]
  );
}
```

#### 3. Distribution Status Update Endpoint

**Endpoint:** `PATCH /api/distribution-status`

**Request:**
```typescript
interface DistributionStatusRequest {
  studentId: string;
  itemType: 'shirt' | 'meal';
  collected: boolean;
}
```

**Response:**
```typescript
interface DistributionStatusResponse {
  success: boolean;
  updatedStatus: {
    shirtCollected: boolean;
    mealCollected: boolean;
  };
}
```

**Logic:**
```typescript
async function updateDistributionStatus(
  studentId: string, 
  itemType: 'shirt' | 'meal', 
  collected: boolean
): Promise<DistributionStatus> {
  const column = itemType === 'shirt' ? 'shirt_collected' : 'meal_collected';
  
  const result = await db.query(
    `UPDATE students 
     SET ${column} = $1, updated_at = NOW() 
     WHERE student_id = $2 
     RETURNING shirt_collected, meal_collected`,
    [collected, studentId]
  );
  
  return {
    shirtCollected: result.rows[0].shirt_collected,
    mealCollected: result.rows[0].meal_collected
  };
}
```

#### 4. All Students Retrieval Endpoint

**Endpoint:** `GET /api/students/all`

**Response:**
```typescript
interface AllStudentsResponse {
  students: StudentRecord[];
  total: number;
}
```

**Logic:**
```typescript
async function getAllStudents(): Promise<StudentRecord[]> {
  const result = await db.query(
    `SELECT student_id, name, shirt_collected, meal_collected, consented 
     FROM students 
     ORDER BY student_id ASC`
  );
  
  return result.rows.map(row => ({
    studentId: row.student_id,
    name: row.name,
    shirtCollected: row.shirt_collected,
    mealCollected: row.meal_collected,
    consented: row.consented
  }));
}
```

## Data Models

### Student Record (Extended)

```typescript
interface Student {
  id: number;
  studentId: string;
  name: string;
  shirtCollected: boolean;
  mealCollected: boolean;
  consented: boolean;  // NEW FIELD
  createdAt: Date;
  updatedAt: Date;
}
```

**Validation Rules:**
- `studentId`: Required, non-empty string
- `name`: Required, non-empty string
- `shirtCollected`: Boolean, defaults to false
- `mealCollected`: Boolean, defaults to false
- `consented`: Boolean, defaults to false
- `createdAt`: Auto-generated timestamp
- `updatedAt`: Auto-updated on any change

### Distribution Status Update

```typescript
interface DistributionStatusUpdate {
  studentId: string;
  itemType: 'shirt' | 'meal';
  collected: boolean;
}
```

**Validation Rules:**
- `studentId`: Must exist in database
- `itemType`: Must be either 'shirt' or 'meal'
- `collected`: Boolean value

### Consent Record

```typescript
interface ConsentRecord {
  studentId: string;
  consented: boolean;
  timestamp: Date;
}
```

**Validation Rules:**
- `studentId`: Must exist in database
- `consented`: Boolean value
- `timestamp`: Auto-generated on consent action

## Correctness Properties


A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.

### Property 1: Consent Prevents QR Display

*For any* participant session where the PDPA consent checkbox is unchecked, the QR code should not be displayed in the UI.

**Validates: Requirements 4.3**

### Property 2: Consent Persistence Round Trip

*For any* student ID, when consent is recorded in the database, retrieving that student's record should return the same consent state.

**Validates: Requirements 4.5, 4.6**

### Property 3: Easter Egg Probability Distribution

*For any* non-special student ID (not 1009104), when tested over 1000 check-in sessions, the easter egg should appear approximately 1/75 of the time (within statistical variance).

**Validates: Requirements 5.2**

### Property 4: Easter Egg Session Independence

*For any* sequence of check-in sessions with the same student ID (excluding 1009104), the easter egg display results should vary independently across sessions.

**Validates: Requirements 5.3**

### Property 5: Invalid Password Rejection

*For any* password string that is not "Linda47$2", the admin authentication should deny access and display an error message.

**Validates: Requirements 6.3**

### Property 6: Distribution Status Consistency

*For any* distribution status change (shirt or meal, checked or unchecked), the database should be updated and the UI should reflect the new state immediately.

**Validates: Requirements 7.3, 7.4**

### Property 7: Complete Database Display

*For any* set of student records in the database, the Database Table View should display all records without omission.

**Validates: Requirements 8.2**

### Property 8: Complete Field Display

*For any* student record displayed in the Database Table View, the rendered row should contain student ID, name, shirt status, meal status, and consent status.

**Validates: Requirements 8.3**

## Error Handling

### Frontend Error Handling

**Network Errors:**
- Display user-friendly error messages when API calls fail
- Provide retry mechanisms for transient failures
- Maintain UI state during error conditions

**Validation Errors:**
- Prevent form submission with invalid data
- Display inline validation messages
- Clear error messages when user corrects input

**Authentication Errors:**
- Show clear error message for incorrect admin password
- Prevent access to admin features without authentication
- Handle session timeout gracefully

### Backend Error Handling

**Database Errors:**
- Log database connection failures
- Return appropriate HTTP status codes (500 for server errors)
- Rollback transactions on failure

**Validation Errors:**
- Return 400 Bad Request for invalid input
- Provide descriptive error messages
- Validate all input parameters before processing

**Not Found Errors:**
- Return 404 for non-existent student IDs
- Provide helpful error messages
- Log attempts to access non-existent resources

### Specific Error Scenarios

**Consent Recording Failure:**
```typescript
try {
  await recordConsent(studentId, true);
} catch (error) {
  // Show error to user
  // Allow retry
  // Log error for debugging
  throw new ConsentRecordingError("Failed to record consent", error);
}
```

**Distribution Status Update Failure:**
```typescript
try {
  await updateDistributionStatus(studentId, itemType, collected);
} catch (error) {
  // Revert UI state
  // Show error message
  // Log error
  throw new StatusUpdateError("Failed to update distribution status", error);
}
```

**Database Retrieval Failure:**
```typescript
try {
  const students = await getAllStudents();
} catch (error) {
  // Show error in table view
  // Provide refresh button
  // Log error
  throw new DataRetrievalError("Failed to fetch student records", error);
}
```

## Testing Strategy

### Dual Testing Approach

This feature requires both unit testing and property-based testing to ensure comprehensive coverage:

- **Unit tests**: Verify specific examples, edge cases, UI rendering, and error conditions
- **Property tests**: Verify universal properties across all inputs, especially for data persistence and probabilistic behavior

### Unit Testing

**Focus Areas:**
- Component rendering with specific props
- Button click handlers and navigation
- Form validation and submission
- Error message display
- Specific cases (e.g., student ID 1009104 always shows easter egg)
- Component removal verification (ClaimStatusDisplay)

**Example Unit Tests:**
- QR Display Screen shows "Start Over" button
- PDPA consent text is displayed correctly
- Admin login form appears on admin view access
- Correct password "Linda47$2" grants access
- Database Table View is accessible from admin interface
- Distribution checkboxes can be checked and unchecked
- ClaimStatusDisplay component is not rendered

### Property-Based Testing

**Testing Library:** fast-check (for TypeScript/JavaScript)

**Configuration:**
- Minimum 100 iterations per property test
- Each test tagged with feature name and property number
- Tag format: `Feature: ui-ux-enhancements, Property {N}: {property text}`

**Property Tests:**

1. **Consent Prevents QR Display** (Property 1)
   - Generate random consent states (checked/unchecked)
   - Verify QR code visibility matches consent state
   - Tag: `Feature: ui-ux-enhancements, Property 1: Consent Prevents QR Display`

2. **Consent Persistence Round Trip** (Property 2)
   - Generate random student IDs and consent states
   - Store consent, retrieve record, verify consent matches
   - Tag: `Feature: ui-ux-enhancements, Property 2: Consent Persistence Round Trip`

3. **Easter Egg Probability Distribution** (Property 3)
   - Generate random non-special student IDs
   - Run 1000 trials, verify ~1/75 success rate (within 2 standard deviations)
   - Tag: `Feature: ui-ux-enhancements, Property 3: Easter Egg Probability Distribution`

4. **Easter Egg Session Independence** (Property 4)
   - Generate random student IDs (excluding 1009104)
   - Run multiple sessions, verify results vary
   - Tag: `Feature: ui-ux-enhancements, Property 4: Easter Egg Session Independence`

5. **Invalid Password Rejection** (Property 5)
   - Generate random incorrect passwords
   - Verify all are rejected with error message
   - Tag: `Feature: ui-ux-enhancements, Property 5: Invalid Password Rejection`

6. **Distribution Status Consistency** (Property 6)
   - Generate random status changes (shirt/meal, check/uncheck)
   - Verify database and UI both reflect new state
   - Tag: `Feature: ui-ux-enhancements, Property 6: Distribution Status Consistency`

7. **Complete Database Display** (Property 7)
   - Generate random sets of student records
   - Verify all records appear in table view
   - Tag: `Feature: ui-ux-enhancements, Property 7: Complete Database Display`

8. **Complete Field Display** (Property 8)
   - Generate random student records
   - Verify all required fields present in rendered rows
   - Tag: `Feature: ui-ux-enhancements, Property 8: Complete Field Display`

### Integration Testing

**End-to-End Flows:**
- Complete participant flow: ID input → Consent → QR display with status
- Complete admin flow: Login → Scan QR → Update status → View database
- Status update flow: Admin changes status → Database updates → UI reflects change

**Cross-Component Testing:**
- Verify navigation between components works correctly
- Test data flow from backend to frontend
- Verify state management across component boundaries

### Manual Testing Checklist

**Visual Verification:**
- [ ] Background color is #53001b on all screens
- [ ] Text on background is white
- [ ] ROOT logo appears instead of SUTD logo
- [ ] QR Display Screen has clean layout
- [ ] Database Table View is readable and well-formatted

**Functional Verification:**
- [ ] Easter egg always shows for student ID 1009104
- [ ] Easter egg shows randomly for other IDs
- [ ] Admin password "Linda47$2" works
- [ ] Distribution checkboxes can be toggled both ways
- [ ] Database view shows all records
- [ ] ClaimStatusDisplay component is removed

### Test Data Requirements

**Student Records:**
- Include student ID 1009104 for easter egg testing
- Include various consent states (true/false)
- Include various distribution states (all combinations of shirt/meal)
- Include sufficient records to test database view pagination if implemented

**Password Test Cases:**
- Correct password: "Linda47$2"
- Incorrect passwords: empty string, wrong password, similar passwords, special characters

**Consent Test Cases:**
- Checked state
- Unchecked state
- State transitions (unchecked → checked)
