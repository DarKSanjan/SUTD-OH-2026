# Test Setup Instructions

## Database Setup for Tests

The property-based tests require a PostgreSQL database connection. Follow these steps to set up your test environment:

### Option 1: Local PostgreSQL

1. Install PostgreSQL on your machine if not already installed
2. Create a test database:
   ```bash
   createdb event_checkin_test
   ```

3. Update the `DATABASE_URL` in `.env.test`:
   ```
   DATABASE_URL=postgresql://localhost:5432/event_checkin_test
   ```

4. Run migrations to set up the schema:
   ```bash
   npm run migrate
   ```

### Option 2: Supabase (Recommended)

1. Create a free Supabase project at https://supabase.com
2. Get your connection string from Project Settings > Database
3. Update the `DATABASE_URL` in `.env.test` with your Supabase connection string
4. Run migrations:
   ```bash
   npm run migrate
   ```

### Running Tests

Once the database is configured:

```bash
# Run all tests
npm test

# Run specific property test
npm test -- student-persistence.property.test.ts
```

### Test Database Notes

- Tests will create and drop tables as needed
- Each test cleans up its data in `beforeEach` hooks
- The test database should be separate from your development database
- All property-based tests run 100 iterations by default

### Troubleshooting

If tests fail with "database does not exist":
1. Verify your `DATABASE_URL` is correct in `.env.test`
2. Ensure the database exists and is accessible
3. Check that PostgreSQL is running
4. Verify network connectivity if using a remote database

If tests fail with connection errors:
1. Check your PostgreSQL credentials
2. Verify the database server is running
3. Ensure firewall rules allow connections
4. For Supabase, check that your IP is allowed
