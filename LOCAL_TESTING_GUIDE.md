# Local Testing Guide

Complete guide for testing the Event Check-In System locally before deployment.

## Prerequisites

- Node.js 18+ installed
- PostgreSQL installed (or use Supabase for testing)
- Git installed
- Modern web browser (Chrome/Firefox/Safari)
- Mobile device for QR scanner testing (optional)

## Setup Instructions

### 1. Clone and Install

```bash
# Clone repository
git clone <your-repo-url>
cd event-checkin-system

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Install API dependencies (for Vercel testing)
cd ../api
npm install
```

### 2. Database Setup

#### Option A: Local PostgreSQL

```bash
# Create database
createdb event_checkin

# Run schema
cd backend
psql event_checkin < src/db/schema.sql

# Or use migration script
npm run migrate
```

#### Option B: Supabase (Recommended)

1. Create free Supabase project at [supabase.com](https://supabase.com)
2. Run `backend/src/db/schema.sql` in SQL Editor
3. Get connection string from Project Settings > Database

### 3. Environment Configuration

#### Backend Environment

Create `backend/.env`:
```bash
DATABASE_URL=postgresql://localhost:5432/event_checkin
# Or use Supabase connection string:
# DATABASE_URL=postgresql://user:pass@host:5432/db

NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:5173
```

#### Frontend Environment

Create `frontend/.env.development`:
```bash
VITE_API_URL=http://localhost:3000
```

### 4. Import Test Data

Create a test CSV file `test-data.csv`:
```csv
Student ID,Name,Shirt Size,Food,Club,Involvement
1006001,Alice Johnson,M,Vegetarian,Tech Club,Member
1006002,Bob Smith,L,Non-Vegetarian,Sports Club,Captain
1006003,Charlie Brown,S,Vegan,Arts Club,Member
1006004,Diana Prince,M,Halal,Music Club,President
1006005,Eve Wilson,XL,Vegetarian,Drama Club,Member
```

Import the data:
```bash
cd backend
# Option 1: Use import script
ts-node src/scripts/reimport-csv.ts

# Option 2: Use Supabase UI
# Go to Table Editor > students > Insert > Import from CSV
```

## Running the Application

### Start Backend Server

```bash
cd backend
npm run dev

# Server starts on http://localhost:3000
# You should see:
# ✓ Database connected
# ✓ Server running on port 3000
```

### Start Frontend Server

```bash
# In a new terminal
cd frontend
npm run dev

# Server starts on http://localhost:5173
# Open browser to http://localhost:5173
```

## Testing Checklist

### ✅ Backend API Tests

#### 1. Health Check
```bash
curl http://localhost:3000/api/health

# Expected response:
# {"status":"ok","timestamp":"2024-01-15T10:30:00.000Z"}
```

#### 2. Validate Student
```bash
curl -X POST http://localhost:3000/api/validate \
  -H "Content-Type: application/json" \
  -d '{"studentId":"1006001"}'

# Expected: Student data with QR code token
```

#### 3. Scan QR Code
```bash
# First get a token from validate endpoint
TOKEN="<token-from-validate>"

curl -X POST http://localhost:3000/api/scan \
  -H "Content-Type: application/json" \
  -d "{\"token\":\"$TOKEN\"}"

# Expected: Student data with claim status
```

#### 4. Update Claim
```bash
curl -X POST http://localhost:3000/api/claim \
  -H "Content-Type: application/json" \
  -d '{"token":"<token>","itemType":"tshirt","collected":true}'

# Expected: Updated claim status
```

### ✅ Frontend Tests

#### Student App Flow

1. **Open Student App**
   ```
   http://localhost:5173/
   ```

2. **Enter Student ID**
   - Enter: `1006001`
   - Click "Validate"
   - Should show student info

3. **Accept PDPA Consent**
   - Check the consent checkbox
   - Click "Generate QR Code"
   - QR code should display

4. **Test Easter Egg** (Optional)
   - Enter Student ID: `1006969`
   - Should trigger John Cena video

5. **Test Error Handling**
   - Enter invalid ID: `9999999`
   - Should show error message
   - Enter empty ID
   - Should show validation error

#### Admin App Flow

1. **Open Admin App**
   ```
   http://localhost:5173/admin
   ```

2. **Login**
   - Enter password: `admin123`
   - Click "Login"
   - Should show scanner interface

3. **Test Scanner Tab**
   - Click "Scanner" tab
   - Should show QR scanner
   - Note: Camera access required

4. **Test Database View**
   - Click "Database View" tab
   - Should show all students
   - Test search functionality
   - Test claim status toggles

5. **Test QR Scanning** (Requires mobile device or QR code image)
   - Generate QR code from student app
   - Scan with admin scanner
   - Verify student info displays
   - Test claim checkboxes
   - Click "Scan Another Student"

### ✅ Automated Tests

#### Run All Tests

```bash
# Backend tests
cd backend
npm test

# Expected: All tests passing
# Test Files: 31 passed
# Tests: 200+ passed

# Frontend tests
cd frontend
npm test

# Expected: All tests passing
# Test Files: 22 passed
# Tests: 285 passed
```

#### Run Specific Test Suites

```bash
# Backend - Unit tests
npm test -- StudentDAO.test.ts

# Backend - Integration tests
npm test -- end-to-end.integration.test.ts

# Backend - Property-based tests
npm test -- --grep "property"

# Frontend - Component tests
npm test -- AdminApp.test.tsx

# Frontend - Integration tests
npm test -- admin-flow.integration.test.tsx
```

### ✅ Mobile Testing

#### Test on Mobile Device

1. **Find your local IP address**
   ```bash
   # macOS/Linux
   ifconfig | grep "inet "
   
   # Windows
   ipconfig
   ```

2. **Update frontend dev server**
   ```bash
   # In frontend/vite.config.ts, add:
   server: {
     host: '0.0.0.0',
     port: 5173
   }
   ```

3. **Access from mobile**
   ```
   http://YOUR_IP:5173
   ```

4. **Test QR Scanner**
   - Open admin app on mobile
   - Login
   - Test camera permissions
   - Scan QR code from another device

### ✅ Browser Compatibility

Test in multiple browsers:
- [ ] Chrome/Chromium
- [ ] Firefox
- [ ] Safari (macOS/iOS)
- [ ] Edge

### ✅ Performance Testing

#### Load Testing

```bash
# Install Apache Bench
# macOS: brew install httpd
# Linux: apt-get install apache2-utils

# Test API endpoint
ab -n 1000 -c 10 http://localhost:3000/api/health

# Expected: 
# - Requests per second: >100
# - Failed requests: 0
```

#### Frontend Performance

1. Open Chrome DevTools
2. Go to Lighthouse tab
3. Run audit
4. Check scores:
   - Performance: >90
   - Accessibility: >90
   - Best Practices: >90
   - SEO: >80

## Common Issues & Solutions

### Backend Won't Start

```bash
# Check if port 3000 is in use
lsof -i :3000

# Kill process if needed
kill -9 <PID>

# Check database connection
npm run db:check
```

### Frontend Won't Start

```bash
# Check if port 5173 is in use
lsof -i :5173

# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Database Connection Error

```bash
# Verify PostgreSQL is running
pg_isready

# Test connection string
psql "$DATABASE_URL"

# Check environment variables
echo $DATABASE_URL
```

### QR Scanner Not Working

- **Camera permissions**: Grant in browser settings
- **HTTPS required**: Use `ngrok` for HTTPS locally
  ```bash
  ngrok http 5173
  ```
- **Browser compatibility**: Use Chrome or Safari

### Tests Failing

```bash
# Clear test cache
npm test -- --clearCache

# Run tests in watch mode
npm test -- --watch

# Run specific test file
npm test -- StudentDAO.test.ts
```

## Pre-Deployment Verification

Before deploying to production, verify:

### ✅ Code Quality
- [ ] All tests passing
- [ ] No TypeScript errors
- [ ] No console errors in browser
- [ ] Code formatted and linted

### ✅ Functionality
- [ ] Student can validate ID
- [ ] QR code generates correctly
- [ ] Admin can scan QR codes
- [ ] Claims are recorded
- [ ] Database view works
- [ ] Error handling works

### ✅ Security
- [ ] Admin password changed from default
- [ ] CORS configured correctly
- [ ] SQL injection prevented (parameterized queries)
- [ ] XSS prevented (React escaping)

### ✅ Performance
- [ ] Page load time <3 seconds
- [ ] API response time <500ms
- [ ] No memory leaks
- [ ] Database queries optimized

### ✅ Mobile
- [ ] Responsive design works
- [ ] QR scanner works on mobile
- [ ] Touch interactions work
- [ ] Camera permissions handled

## Next Steps

Once local testing is complete:

1. **Review Deployment Checklist**
   - See [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)

2. **Deploy to Staging**
   - Create staging branch
   - Deploy to Vercel preview

3. **Deploy to Production**
   - Follow [DEPLOYMENT_QUICKSTART.md](./DEPLOYMENT_QUICKSTART.md)
   - Monitor deployment
   - Test production environment

## Testing Tools

### Recommended Tools

- **API Testing**: Postman, Insomnia, or curl
- **Database**: pgAdmin, DBeaver, or Supabase UI
- **Performance**: Chrome DevTools, Lighthouse
- **Mobile Testing**: BrowserStack, real devices
- **Load Testing**: Apache Bench, k6, Artillery

### Useful Commands

```bash
# Watch backend logs
cd backend && npm run dev | tee backend.log

# Watch frontend logs
cd frontend && npm run dev | tee frontend.log

# Monitor database
watch -n 1 'psql $DATABASE_URL -c "SELECT COUNT(*) FROM students"'

# Check API health continuously
watch -n 5 'curl -s http://localhost:3000/api/health | jq'
```

## Support

If you encounter issues during local testing:

1. Check this guide for solutions
2. Review error messages carefully
3. Check browser console for errors
4. Review server logs
5. Verify environment variables
6. Test database connection

---

**Ready for deployment?** See [DEPLOYMENT_QUICKSTART.md](./DEPLOYMENT_QUICKSTART.md)
