# Event Check-In System - Backend

Backend API for the Event Check-In System built with Node.js, Express, and PostgreSQL.

## Prerequisites

- Node.js 18+ 
- PostgreSQL database (local or Supabase)
- npm or yarn

## Installation

```bash
npm install
```

## Database Setup

### Option 1: Supabase (Recommended for Production)

1. Create a free account at [Supabase](https://supabase.com)
2. Create a new project
3. Get your connection string from Project Settings > Database
4. Create a `.env` file in the backend directory:

```env
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@[YOUR-PROJECT-REF].supabase.co:5432/postgres
NODE_ENV=development
PORT=3000
```

5. Run migrations to create tables:

```bash
npm run migrate
```

6. Import CSV data (one-time setup):

```bash
npm run import-csv
```

### Option 2: Local PostgreSQL

1. Install PostgreSQL
2. Create a database:

```bash
createdb event_checkin
```

3. Create a `.env` file:

```env
DATABASE_URL=postgresql://localhost:5432/event_checkin
NODE_ENV=development
PORT=3000
```

4. Run migrations:

```bash
npm run migrate
```

5. Import CSV data:

```bash
npm run import-csv
```

## Running the Server

### Development Mode

```bash
npm run dev
```

The server will start on http://localhost:3000 with hot reloading.

### Production Mode

```bash
npm run build
npm start
```

## Testing

### Setup Test Database

See [TEST_SETUP.md](./TEST_SETUP.md) for detailed instructions on setting up the test database.

Quick setup:
1. Create `.env.test` file with your test database URL
2. Run `npm run db:check` to verify connection
3. Run tests with `npm test`

### Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test -- student-persistence.property.test.ts

# Check database connection
npm run db:check
```

## Project Structure

```
backend/
├── src/
│   ├── dao/              # Data Access Objects
│   │   ├── StudentDAO.ts
│   │   ├── TokenDAO.ts
│   │   ├── ClaimDAO.ts
│   │   └── __tests__/    # Property-based tests
│   ├── db/               # Database configuration
│   │   ├── config.ts     # Connection pool
│   │   ├── schema.sql    # Database schema
│   │   └── migrate.ts    # Migration script
│   ├── models/           # TypeScript interfaces
│   │   ├── Student.ts
│   │   ├── Token.ts
│   │   └── Claim.ts
│   ├── routes/           # API routes (to be implemented)
│   ├── services/         # Business logic (to be implemented)
│   └── index.ts          # Express app entry point
├── .env                  # Development environment variables
├── .env.test             # Test environment variables
├── .env.example          # Example environment variables
├── package.json
└── tsconfig.json
```

## API Endpoints (To Be Implemented)

- `POST /api/validate` - Validate student ID and generate QR code
- `POST /api/scan` - Validate scanned QR code token
- `POST /api/claim` - Record item distribution

## Database Schema

### Students Table
- `id` - Primary key
- `student_id` - Unique student identifier
- `name` - Student name
- `tshirt_size` - T-shirt size
- `meal_preference` - Meal preference
- `organization_details` - Organization involvement details

### Tokens Table
- `id` - Primary key
- `token` - Unique token (64-character hex string)
- `student_id` - Foreign key to students
- `created_at` - Timestamp

### Claims Table
- `id` - Primary key
- `student_id` - Foreign key to students (unique)
- `tshirt_claimed` - Boolean
- `meal_claimed` - Boolean
- `tshirt_claimed_at` - Timestamp
- `meal_claimed_at` - Timestamp

## Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm test` - Run all tests
- `npm run migrate` - Run database migrations (creates tables)
- `npm run import-csv` - Import student data from CSV file
- `npm run db:check` - Check database connection

## Environment Variables

- `DATABASE_URL` - PostgreSQL connection string (required)
- `NODE_ENV` - Environment (development/test/production)
- `PORT` - Server port (default: 3000)

## Troubleshooting

### Database Connection Issues

1. Verify `DATABASE_URL` is correct in `.env`
2. Check PostgreSQL is running
3. Test connection: `npm run db:check`
4. For Supabase, verify your IP is allowed in project settings

### Test Failures

1. Ensure `.env.test` is configured
2. Verify test database exists and is accessible
3. Run migrations on test database
4. Check [TEST_SETUP.md](./TEST_SETUP.md) for detailed troubleshooting

## Next Steps

1. Implement business logic services (Task 5)
2. Implement API endpoints (Task 6)
3. Add CSV import functionality (Task 3)
4. Implement error handling middleware (Task 7)
