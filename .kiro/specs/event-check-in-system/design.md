# Design Document: Event Check-In System

## Overview

The Event Check-In System is a full-stack web application built with React + Vite for the frontend, Node.js + Express for the backend, and SQLite for data persistence. The system consists of two user-facing applications: a Student App for ID validation and QR code generation, and an Admin App for QR code scanning and item distribution tracking.

The architecture prioritizes simplicity, performance, and reliability. The system uses a RESTful API design with clear separation between frontend and backend concerns. SQLite provides lightweight, reliable data persistence with ACID guarantees. QR codes contain encrypted tokens that prevent tampering while enabling fast validation.

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Layer                          │
├──────────────────────────┬──────────────────────────────────┤
│   Student App (React)    │    Admin App (React)             │
│   - ID Input Form        │    - QR Scanner                  │
│   - QR Display           │    - Student Info Display        │
│                          │    - Claim Checkboxes            │
└──────────────┬───────────┴──────────────┬───────────────────┘
               │                          │
               │      HTTPS/REST API      │
               │                          │
┌──────────────┴──────────────────────────┴───────────────────┐
│                    Backend Layer (Express)                   │
├──────────────────────────────────────────────────────────────┤
│  API Routes          │  Business Logic    │  Data Access     │
│  - /api/validate     │  - ID Validation   │  - Student DAO   │
│  - /api/scan         │  - Token Gen       │  - Claim DAO     │
│  - /api/claim        │  - QR Generation   │  - Token DAO     │
│                      │  - Claim Logic     │                  │
└──────────────────────┴────────────┬───────┴──────────────────┘
                                    │
                                    │
┌───────────────────────────────────┴───────────────────────────┐
│                Data Layer (PostgreSQL/Supabase)               │
├───────────────────────────────────────────────────────────────┤
│  Tables: students, tokens, claims                             │
│  Indexes: student_id, token                                   │
└───────────────────────────────────────────────────────────────┘
```

### Technology Stack

- **Frontend**: React 18+ with Vite for fast builds and HMR
- **Backend**: Node.js 18+ with Express 4.x
- **Database**: PostgreSQL (Supabase) with pg driver
- **QR Code**: qrcode library for generation, html5-qrcode for scanning
- **Token Generation**: crypto.randomBytes for cryptographically secure tokens
- **API Communication**: fetch API with JSON payloads

### Deployment Model

- **Frontend**: Deployed to Vercel as static assets
- **Backend**: Deployed to Vercel as serverless functions
- **Database**: PostgreSQL hosted on Supabase (free tier)
- **Connection**: Backend connects to Supabase via connection string (environment variable)
- **Scalability**: Serverless architecture auto-scales with traffic

## Components and Interfaces

### Frontend Components

#### Student App Components

**1. StudentIDForm**
- Input field for student ID entry
- Submit button
- Client-side validation (non-empty, trimmed)
- Loading state during API call
- Error message display

**2. QRCodeDisplay**
- Displays generated QR code image
- Shows student information (name, t-shirt size, meal preference)
- Displays organization involvements in a structured list format (club name and role)
- Success message
- Option to generate new QR code

**3. ErrorMessage**
- Reusable component for displaying validation errors
- Styled for visibility
- Auto-dismiss option

#### Admin App Components

**1. QRScanner**
- Camera access and QR code scanning
- Uses html5-qrcode library
- Continuous scanning mode
- Visual feedback for successful scans
- Error handling for camera permissions

**2. StudentInfoCard**
- Displays scanned student information
- Shows name, ID, t-shirt size, meal preference
- Displays organization involvements in a structured list format (club name and role)
- Visual status indicators for claims

**3. ClaimCheckboxes**
- Two checkboxes: T-shirt and Meal Coupon
- Disabled state for already-claimed items
- Loading state during claim submission
- Confirmation feedback

**4. ClaimStatusDisplay**
- Visual indicators (checkmarks, colors) for claim status
- Clear distinction between claimed/unclaimed
- Warning messages for duplicate attempts

### Backend API Endpoints

#### POST /api/validate
**Purpose**: Validate student ID and generate QR code

**Request**:
```json
{
  "studentId": "string"
}
```

**Response (Success - 200)**:
```json
{
  "success": true,
  "student": {
    "studentId": "string",
    "name": "string",
    "tshirtSize": "string",
    "mealPreference": "string",
    "involvements": [
      {
        "club": "string",
        "role": "string"
      }
    ]
  },
  "qrCode": "data:image/png;base64,...",
  "token": "string"
}
```

**Response (Not Found - 404)**:
```json
{
  "success": false,
  "error": "Student ID not found"
}
```

#### POST /api/scan
**Purpose**: Validate scanned QR code token

**Request**:
```json
{
  "token": "string"
}
```

**Response (Success - 200)**:
```json
{
  "success": true,
  "student": {
    "studentId": "string",
    "name": "string",
    "tshirtSize": "string",
    "mealPreference": "string",
    "involvements": [
      {
        "club": "string",
        "role": "string"
      }
    ]
  },
  "claims": {
    "tshirtClaimed": boolean,
    "mealClaimed": boolean
  }
}
```

**Response (Invalid Token - 404)**:
```json
{
  "success": false,
  "error": "Invalid QR code"
}
```

#### POST /api/claim
**Purpose**: Record item distribution

**Request**:
```json
{
  "token": "string",
  "itemType": "tshirt" | "meal"
}
```

**Response (Success - 200)**:
```json
{
  "success": true,
  "claims": {
    "tshirtClaimed": boolean,
    "mealClaimed": boolean
  }
}
```

**Response (Already Claimed - 409)**:
```json
{
  "success": false,
  "error": "Item already claimed"
}
```

### Backend Service Layer

#### StudentService
- `validateStudentId(studentId: string): Student | null`
- `getStudentByToken(token: string): Student | null`
- Case-insensitive ID matching
- Data sanitization

#### TokenService
- `generateToken(): string` - Creates cryptographically secure random token
- `storeToken(studentId: string, token: string): void`
- `validateToken(token: string): boolean`
- Token format: 32-byte hex string (64 characters)

#### QRCodeService
- `generateQRCode(data: object): Promise<string>` - Returns base64 data URL
- QR code contains: `{ token: string, studentId: string }`
- Error correction level: M (15% recovery)

#### ClaimService
- `getClaimStatus(studentId: string): ClaimStatus`
- `recordClaim(studentId: string, itemType: string): boolean`
- `isAlreadyClaimed(studentId: string, itemType: string): boolean`
- Atomic transaction handling

### Data Access Layer

#### Database Schema

**students table**:
```sql
CREATE TABLE students (
  id SERIAL PRIMARY KEY,
  student_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  tshirt_size TEXT NOT NULL,
  meal_preference TEXT NOT NULL,
  organization_details TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_student_id ON students(LOWER(student_id));
```

**tokens table**:
```sql
CREATE TABLE tokens (
  id SERIAL PRIMARY KEY,
  token TEXT UNIQUE NOT NULL,
  student_id TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(student_id)
);

CREATE INDEX idx_token ON tokens(token);
CREATE INDEX idx_token_student ON tokens(student_id);
```

**claims table**:
```sql
CREATE TABLE claims (
  id SERIAL PRIMARY KEY,
  student_id TEXT NOT NULL,
  tshirt_claimed BOOLEAN DEFAULT FALSE,
  meal_claimed BOOLEAN DEFAULT FALSE,
  tshirt_claimed_at TIMESTAMP,
  meal_claimed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(student_id),
  UNIQUE(student_id)
);

CREATE INDEX idx_claims_student ON claims(student_id);
```

#### Data Access Objects (DAOs)

**StudentDAO**:
- `importFromCSV(filePath: string): number` - Returns count of imported records
- `findByStudentId(studentId: string): Student | null`
- `upsert(student: Student): void`
- `consolidateDuplicates(students: Student[]): Student` - Merges duplicate student records, selecting largest t-shirt size

**TokenDAO**:
- `create(token: string, studentId: string): void`
- `findByToken(token: string): Token | null`
- `findByStudentId(studentId: string): Token[]`

**ClaimDAO**:
- `findByStudentId(studentId: string): Claim | null`
- `initializeForStudent(studentId: string): void`
- `updateClaim(studentId: string, itemType: string): boolean`
- Uses transactions for atomic updates

## Data Models

### Student
```typescript
interface Student {
  id?: number;
  studentId: string;
  name: string;
  tshirtSize: string;
  mealPreference: string;
  organizationDetails?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface StudentInvolvement {
  club: string;
  role: string;
}

interface StudentWithInvolvements extends Omit<Student, 'organizationDetails'> {
  involvements: StudentInvolvement[];
}
```

### Token
```typescript
interface Token {
  id?: number;
  token: string;
  studentId: string;
  createdAt?: Date;
}
```

### Claim
```typescript
interface Claim {
  id?: number;
  studentId: string;
  tshirtClaimed: boolean;
  mealClaimed: boolean;
  tshirtClaimedAt?: Date;
  mealClaimedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}
```

### QRCodeData
```typescript
interface QRCodeData {
  token: string;
  studentId: string;
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*


### Property 1: CSV Field Validation
*For any* CSV file input, if required fields (Student_ID, name, t-shirt size, meal preference) are missing, the import process should reject the file and report which fields are missing.

**Validates: Requirements 1.2**

### Property 2: Student Record Persistence
*For any* valid student record, after storing it in the database, retrieving it by student ID should return an equivalent record with all fields intact (Student_ID, name, t-shirt size, meal preference, organization details).

**Validates: Requirements 1.4**

### Property 3: Student Record Upsert
*For any* existing student record in the database, importing CSV data with the same Student_ID should update the existing record rather than creating a duplicate, and the updated record should reflect the new CSV data.

**Validates: Requirements 1.5**

### Property 3.1: Duplicate Student Consolidation
*For any* set of student records with the same Student_ID but different t-shirt sizes, consolidating the records should produce a single student record with the largest t-shirt size (following order: XS < S < M < L < XL < XXL) and preserve all organization involvement details.

**Validates: Requirements 1.6, 1.7, 1.8**

### Property 4: Student ID Validation
*For any* student ID input, the validation process should return student information if the ID exists in the database, or return an error if it doesn't exist, and the validation should be case-insensitive (e.g., "ABC123" matches "abc123").

**Validates: Requirements 2.1, 2.2, 2.3, 2.5**

### Property 5: Token Uniqueness
*For any* set of token generation requests, all generated tokens should be unique (no duplicates), even when generating tokens for the same student multiple times.

**Validates: Requirements 3.1, 3.2**

### Property 6: QR Code Round Trip
*For any* valid student with a generated token, encoding the student data and token into a QR code and then decoding it should produce equivalent data containing the token, student ID, name, t-shirt size, and meal preference.

**Validates: Requirements 3.3**

### Property 7: Token Persistence and Association
*For any* generated token, after storing it in the database with its associated student ID, retrieving the token should return the correct student association, and the token should remain valid indefinitely.

**Validates: Requirements 3.4, 3.6**

### Property 8: Token Validation
*For any* token input, the validation process should return the associated student information (name, Student_ID, t-shirt size, meal preference) if the token exists in the database, or return an error if the token is invalid.

**Validates: Requirements 4.3, 4.4, 4.5**

### Property 9: Claim Status Retrieval
*For any* student in the database, querying their claim status should return both t-shirt and meal coupon claim statuses (true/false for each).

**Validates: Requirements 5.1, 5.2**

### Property 10: Claim Recording
*For any* valid token and item type (tshirt or meal), recording a claim should persist the claim to the database and return confirmation, and subsequent queries should reflect the updated claim status.

**Validates: Requirements 6.4, 6.5**

### Property 11: Duplicate Claim Prevention
*For any* student and item type, if an item is already claimed, attempting to claim it again should be rejected with an error, and the claim status should remain unchanged. This applies even if the student is volunteering for multiple organizations.

**Validates: Requirements 7.1, 7.2, 7.6**

### Property 12: Transaction Atomicity
*For any* claim update operation, if the database transaction fails at any point, the claim status should remain unchanged (no partial updates), and an error should be returned instead of success.

**Validates: Requirements 9.1, 9.3**

### Property 13: Database Constraint Enforcement
*For any* attempt to insert duplicate Student_IDs or duplicate Tokens into the database, the database should reject the insertion and enforce uniqueness constraints.

**Validates: Requirements 9.4**

## Error Handling

### Error Categories

**1. Validation Errors (400 Bad Request)**
- Missing required fields in requests
- Invalid data formats
- Empty or whitespace-only student IDs

**2. Not Found Errors (404 Not Found)**
- Student ID not found in database
- Token not found in database
- Invalid QR code scans

**3. Conflict Errors (409 Conflict)**
- Duplicate claim attempts
- Attempting to claim already-claimed items

**4. Server Errors (500 Internal Server Error)**
- Database connection failures
- File system errors (CSV import)
- Unexpected exceptions

### Error Response Format

All error responses follow a consistent structure:

```json
{
  "success": false,
  "error": "Human-readable error message",
  "code": "ERROR_CODE",
  "details": {} // Optional additional context
}
```

### Error Handling Strategies

**Frontend Error Handling**:
- Display user-friendly error messages
- Retry logic for network failures (exponential backoff)
- Graceful degradation when camera access is denied
- Clear visual feedback for all error states

**Backend Error Handling**:
- Comprehensive try-catch blocks around database operations
- Transaction rollback on failures
- Detailed error logging with timestamps and context
- Input sanitization to prevent injection attacks

**Database Error Handling**:
- Constraint violation handling (unique, foreign key)
- Connection pool management
- Automatic retry for transient failures
- Graceful shutdown with connection cleanup

### Specific Error Scenarios

**CSV Import Failures**:
- Log specific line numbers and validation errors
- Prevent system startup if CSV is invalid
- Provide clear error messages about missing fields

**Token Generation Failures**:
- Retry token generation if collision detected (extremely rare)
- Log cryptographic errors
- Fail gracefully and return error to user

**Claim Recording Failures**:
- Roll back transaction on any failure
- Return specific error for duplicate claims
- Log all claim attempts (success and failure)

**QR Code Scanning Failures**:
- Handle malformed QR codes gracefully
- Provide feedback for unreadable codes
- Allow retry without page refresh

## Testing Strategy

### Dual Testing Approach

The system will use both unit tests and property-based tests to ensure comprehensive coverage:

- **Unit tests**: Verify specific examples, edge cases, and error conditions
- **Property tests**: Verify universal properties across all inputs using randomized testing

Unit tests focus on concrete scenarios and integration points, while property tests validate that correctness properties hold across a wide range of generated inputs. Together, they provide confidence in both specific behaviors and general correctness.

### Property-Based Testing

**Library**: fast-check (for JavaScript/TypeScript)

**Configuration**:
- Minimum 100 iterations per property test
- Each test tagged with feature name and property number
- Tag format: `Feature: event-check-in-system, Property N: [property text]`

**Property Test Coverage**:
- Each correctness property from the design document will be implemented as a single property-based test
- Tests will generate random inputs (student IDs, tokens, claim data) to verify properties hold universally
- Focus on invariants, round-trip properties, and error conditions

### Unit Testing

**Library**: Vitest (for Vite/React projects)

**Unit Test Focus**:
- CSV import with specific valid and invalid files
- API endpoint integration tests
- React component rendering and interaction
- Specific edge cases (empty strings, special characters, boundary values)
- Error handling paths
- Database constraint violations

### Test Organization

```
tests/
├── unit/
│   ├── api/
│   │   ├── validate.test.ts
│   │   ├── scan.test.ts
│   │   └── claim.test.ts
│   ├── services/
│   │   ├── student.test.ts
│   │   ├── token.test.ts
│   │   ├── qrcode.test.ts
│   │   └── claim.test.ts
│   ├── dao/
│   │   ├── student-dao.test.ts
│   │   ├── token-dao.test.ts
│   │   └── claim-dao.test.ts
│   └── components/
│       ├── StudentIDForm.test.tsx
│       ├── QRCodeDisplay.test.tsx
│       └── ClaimCheckboxes.test.tsx
├── property/
│   ├── csv-validation.property.test.ts
│   ├── student-persistence.property.test.ts
│   ├── token-uniqueness.property.test.ts
│   ├── qrcode-roundtrip.property.test.ts
│   ├── claim-prevention.property.test.ts
│   └── transaction-atomicity.property.test.ts
└── integration/
    ├── csv-import.integration.test.ts
    └── end-to-end-flow.integration.test.ts
```

### Testing Priorities

**High Priority** (Must test):
1. Token uniqueness and validation
2. Duplicate claim prevention
3. Database transaction atomicity
4. Student ID validation (case-insensitive)
5. QR code generation and decoding

**Medium Priority** (Should test):
1. CSV import validation
2. Error handling paths
3. API endpoint responses
4. Component rendering

**Low Priority** (Nice to have):
1. Performance benchmarks
2. UI interaction flows
3. Camera permission handling

### Test Data Management

- Use separate test database or in-memory PostgreSQL for tests
- Generate test CSV files programmatically
- Create test fixtures for common student records
- Use fast-check arbitraries for property test data generation
- Clean up test data between test runs
- Mock database connections for unit tests where appropriate

### Continuous Integration

- Run all tests on every commit
- Fail build if any test fails
- Generate coverage reports (target: >80% coverage)
- Run property tests with increased iterations in CI (500+)

## Implementation Notes

### Data Flow

**CSV Import Process:**
1. On system startup, the backend reads the CSV file once
2. All student data is imported into the PostgreSQL database
3. The CSV file is not used again after startup
4. All API endpoints fetch data from the database, not the CSV
5. Organization details are parsed and stored in the database for each student

**Organization Details Storage:**
- Multiple involvements are stored as a semicolon-separated string in the database
- Format: "Club: [name], Involvement: [role]; Club: [name], Involvement: [role]"
- API responses parse this string and return structured JSON arrays
- Frontend displays involvements as a formatted list

### Performance Optimizations

1. **Database Indexes**: Create indexes on frequently queried fields (student_id, token)
2. **Connection Pooling**: Use pg connection pool for efficient database connections
3. **Caching**: Consider in-memory cache for frequently accessed student data
4. **QR Code Generation**: Generate QR codes server-side to reduce client load
5. **Batch Operations**: Use batch inserts for CSV import
6. **Serverless Optimization**: Keep database connections warm to reduce cold start latency

### Security Considerations

1. **Input Sanitization**: Sanitize all user inputs to prevent SQL injection
2. **Token Security**: Use cryptographically secure random tokens (crypto.randomBytes)
3. **HTTPS**: Serve application over HTTPS in production
4. **CORS**: Configure CORS to allow only trusted origins
5. **Rate Limiting**: Implement rate limiting on API endpoints to prevent abuse

### Scalability Considerations

The Vercel + Supabase architecture provides built-in scalability:
- **Automatic scaling**: Vercel serverless functions scale automatically with traffic
- **Database connection pooling**: Supabase handles connection pooling efficiently
- **CDN distribution**: Vercel serves static assets via global CDN
- **Future enhancements**: Redis caching layer for high-traffic scenarios, read replicas for reporting

### Deployment Checklist

1. **Supabase Setup**:
   - Create Supabase project
   - Run database schema migrations
   - Import CSV data to database
   - Get connection string from Supabase dashboard

2. **Vercel Setup**:
   - Connect GitHub repository to Vercel
   - Configure build settings (frontend: `npm run build`, output: `dist`)
   - Set environment variables: `DATABASE_URL` (Supabase connection string)
   - Deploy backend as serverless functions in `/api` directory

3. **Testing**:
   - Test all endpoints with production data
   - Verify CORS configuration
   - Test QR code generation and scanning
   - Monitor Vercel logs for errors

### Development Workflow

1. **Local Development**: Use Vite dev server for frontend, nodemon for backend
2. **Database Migrations**: Use SQL scripts for schema changes
3. **Code Style**: ESLint + Prettier for consistent formatting
4. **Git Workflow**: Feature branches with pull request reviews
5. **Documentation**: Keep API documentation up to date with changes
