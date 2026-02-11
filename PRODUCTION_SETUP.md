# Production Setup Guide

Complete guide for setting up the Event Check-In System in production.

## Architecture Overview

```
┌─────────────────┐
│   Vercel CDN    │  Static Assets (React App)
└────────┬────────┘
         │
         ├─────────────────────────────────────┐
         │                                     │
┌────────▼────────┐                  ┌────────▼────────┐
│  Student App    │                  │   Admin App     │
│  (React SPA)    │                  │  (React SPA)    │
└────────┬────────┘                  └────────┬────────┘
         │                                     │
         └─────────────────┬───────────────────┘
                           │
                  ┌────────▼────────┐
                  │  Vercel Edge    │
                  │   Functions     │
                  │   (/api/*)      │
                  └────────┬────────┘
                           │
                  ┌────────▼────────┐
                  │   Supabase      │
                  │  PostgreSQL DB  │
                  └─────────────────┘
```

## Production Components

### 1. Frontend (Vercel CDN)
- **Technology**: React 18 + Vite + TypeScript
- **Hosting**: Vercel Edge Network
- **Build**: Static assets in `frontend/dist`
- **Routing**: Client-side routing with fallback to `index.html`

### 2. API (Vercel Serverless Functions)
- **Technology**: Node.js + TypeScript
- **Location**: `/api` directory
- **Runtime**: Node.js 18.x
- **Auto-scaling**: Handled by Vercel

### 3. Database (Supabase PostgreSQL)
- **Technology**: PostgreSQL 15
- **Hosting**: Supabase (AWS)
- **Connection**: Connection pooling enabled
- **Backup**: Automatic daily backups

## Environment Configuration

### Development vs Production

| Aspect | Development | Production |
|--------|-------------|------------|
| Frontend | `localhost:5173` | Vercel CDN |
| Backend | Express on `localhost:3000` | Vercel Functions |
| Database | Local PostgreSQL/SQLite | Supabase PostgreSQL |
| HTTPS | Not required | Required (auto) |
| CORS | Permissive | Restricted |

### Environment Variables

#### Vercel (Production)
```bash
# Required
DATABASE_URL=postgresql://user:pass@host:5432/db
NODE_ENV=production
FRONTEND_URL=https://your-app.vercel.app
VITE_API_URL=https://your-app.vercel.app

# Optional
LOG_LEVEL=info
MAX_CONNECTIONS=10
```

#### Local Development
```bash
# backend/.env
DATABASE_URL=postgresql://localhost:5432/event_checkin
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:5173

# frontend/.env.development
VITE_API_URL=http://localhost:3000
```

## Database Setup

### Schema Deployment

```sql
-- Run in Supabase SQL Editor
-- File: backend/src/db/schema.sql

-- Students table
CREATE TABLE IF NOT EXISTS students (
  id SERIAL PRIMARY KEY,
  student_id VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  tshirt_size VARCHAR(10) NOT NULL,
  meal_preference VARCHAR(50) NOT NULL,
  organization_details TEXT,
  consented BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tokens table
CREATE TABLE IF NOT EXISTS tokens (
  id SERIAL PRIMARY KEY,
  student_id VARCHAR(50) UNIQUE NOT NULL,
  token VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE
);

-- Claims table
CREATE TABLE IF NOT EXISTS claims (
  id SERIAL PRIMARY KEY,
  student_id VARCHAR(50) UNIQUE NOT NULL,
  tshirt_claimed BOOLEAN DEFAULT FALSE,
  meal_claimed BOOLEAN DEFAULT FALSE,
  tshirt_claimed_at TIMESTAMP,
  meal_claimed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX idx_students_student_id ON students(student_id);
CREATE INDEX idx_tokens_student_id ON tokens(student_id);
CREATE INDEX idx_tokens_token ON tokens(token);
CREATE INDEX idx_claims_student_id ON claims(student_id);
```

### Data Import

#### Option 1: Supabase UI
1. Go to Table Editor
2. Select `students` table
3. Click "Insert" > "Import from CSV"
4. Upload your CSV file
5. Map columns correctly

#### Option 2: SQL Import
```sql
-- Copy data from CSV
COPY students(student_id, name, tshirt_size, meal_preference, organization_details)
FROM '/path/to/your/data.csv'
DELIMITER ','
CSV HEADER;
```

#### Option 3: Programmatic Import
```bash
# Use the reimport script
cd backend
npm run migrate
ts-node src/scripts/reimport-csv.ts
```

## Security Configuration

### 1. CORS Setup

The API automatically configures CORS based on environment:

```typescript
// api/_shared.ts
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? [process.env.FRONTEND_URL]
  : ['http://localhost:5173', 'http://localhost:3000'];
```

### 2. Admin Authentication

**⚠️ IMPORTANT: Change the default password!**

```typescript
// frontend/src/components/admin/AdminLogin.tsx
const ADMIN_PASSWORD = 'admin123'; // CHANGE THIS!
```

Recommended: Use environment variable:
```typescript
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'admin123';
```

Then add to Vercel:
```bash
VITE_ADMIN_PASSWORD=your-secure-password-here
```

### 3. Database Security

```sql
-- Enable Row Level Security (optional)
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE claims ENABLE ROW LEVEL SECURITY;

-- Create policies as needed
CREATE POLICY "Allow read access" ON students
  FOR SELECT USING (true);
```

### 4. Rate Limiting

Consider adding rate limiting to API functions:

```typescript
// api/_shared.ts
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
```

## Performance Optimization

### 1. Database Connection Pooling

```typescript
// api/_shared.ts
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10, // Maximum connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

### 2. Frontend Optimization

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'qr-vendor': ['html5-qrcode', 'qrcode']
        }
      }
    }
  }
});
```

### 3. Caching Headers

```json
// vercel.json
{
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

## Monitoring & Logging

### 1. Vercel Analytics

Enable in Vercel dashboard:
- Go to your project
- Click "Analytics" tab
- Enable Web Analytics

### 2. Function Logs

View in Vercel dashboard:
- Go to "Deployments"
- Click on a deployment
- Click "Functions" tab
- View logs for each function

### 3. Database Monitoring

In Supabase dashboard:
- Go to "Database" > "Query Performance"
- Monitor slow queries
- Check connection pool usage

### 4. Error Tracking

Consider integrating Sentry:

```bash
npm install @sentry/react @sentry/node
```

```typescript
// frontend/src/main.tsx
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "your-sentry-dsn",
  environment: import.meta.env.MODE,
});
```

## Backup & Recovery

### 1. Database Backups

Supabase provides automatic daily backups:
- Go to "Database" > "Backups"
- Download backups as needed
- Restore from backup if needed

### 2. Manual Backup

```bash
# Export database
pg_dump $DATABASE_URL > backup.sql

# Restore database
psql $DATABASE_URL < backup.sql
```

### 3. Code Backups

- GitHub repository (primary)
- Vercel deployment history
- Local development copies

## Scaling Considerations

### Current Limits (Free Tier)

| Resource | Vercel Free | Supabase Free |
|----------|-------------|---------------|
| Bandwidth | 100 GB/month | 2 GB/month |
| Functions | 100 GB-hours | N/A |
| Database | N/A | 500 MB |
| Connections | N/A | 60 concurrent |

### Scaling Strategy

1. **Horizontal Scaling**: Vercel auto-scales functions
2. **Database**: Upgrade Supabase plan if needed
3. **CDN**: Vercel Edge Network handles traffic
4. **Caching**: Implement Redis for session data

## Deployment Workflow

### Continuous Deployment

```bash
# Development
git checkout develop
git add .
git commit -m "Feature: Add new functionality"
git push origin develop

# Production
git checkout main
git merge develop
git push origin main
# Vercel auto-deploys
```

### Manual Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Rollback

```bash
# In Vercel dashboard
1. Go to "Deployments"
2. Find previous working deployment
3. Click "..." > "Promote to Production"
```

## Health Checks

### API Health Endpoint

```bash
curl https://your-app.vercel.app/api/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "database": "connected"
}
```

### Database Health

```sql
-- Check connection
SELECT 1;

-- Check table counts
SELECT 
  (SELECT COUNT(*) FROM students) as students,
  (SELECT COUNT(*) FROM tokens) as tokens,
  (SELECT COUNT(*) FROM claims) as claims;
```

## Troubleshooting

### Common Issues

#### 1. Build Fails
```bash
# Check build logs in Vercel
# Common causes:
# - Missing dependencies
# - TypeScript errors
# - Environment variables not set
```

#### 2. API 500 Errors
```bash
# Check function logs
# Common causes:
# - Database connection failed
# - Missing environment variables
# - SQL syntax errors
```

#### 3. CORS Errors
```bash
# Verify FRONTEND_URL matches your domain
# Check browser console for exact error
# Ensure credentials are included in requests
```

#### 4. Database Connection Timeout
```bash
# Check connection string format
# Verify Supabase project is active
# Check connection pool settings
```

## Maintenance

### Regular Tasks

- [ ] Weekly: Review error logs
- [ ] Weekly: Check database performance
- [ ] Monthly: Review and rotate credentials
- [ ] Monthly: Update dependencies
- [ ] Quarterly: Review and optimize queries
- [ ] Yearly: Audit security settings

### Updates

```bash
# Update dependencies
npm update

# Check for security vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix
```

## Support & Resources

- **Vercel Docs**: https://vercel.com/docs
- **Supabase Docs**: https://supabase.com/docs
- **React Docs**: https://react.dev
- **PostgreSQL Docs**: https://www.postgresql.org/docs/

---

**Production Checklist**: See [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)
**Quick Start**: See [DEPLOYMENT_QUICKSTART.md](./DEPLOYMENT_QUICKSTART.md)
