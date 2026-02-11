# Deployment Checklist

This checklist ensures your Event Check-In System is fully polished and ready for deployment to Vercel.

## ✅ Pre-Deployment Checklist

### 1. Code Quality & Testing
- [x] All frontend tests passing (285/285 tests)
- [x] Backend tests optimized and passing
- [x] Property-based tests configured correctly
- [x] No console errors in development mode
- [x] TypeScript compilation successful
- [x] ESLint/code quality checks passed

### 2. Environment Configuration
- [ ] `frontend/.env.example` documented
- [ ] `backend/.env.example` documented
- [ ] Vercel environment variables prepared
- [ ] Database connection string ready (Supabase)
- [ ] CORS origins configured correctly

### 3. Database Setup
- [ ] Supabase project created
- [ ] Database schema deployed (`backend/src/db/schema.sql`)
- [ ] CSV data imported
- [ ] Database connection tested
- [ ] Migrations documented

### 4. Build Configuration
- [x] `vercel.json` configured correctly
- [x] `build.sh` script working
- [x] Frontend builds successfully (`npm run build`)
- [x] API functions structured correctly
- [x] Static assets optimized

### 5. Security & Performance
- [x] Admin password authentication implemented
- [x] CORS configured properly
- [x] SQL injection prevention (parameterized queries)
- [x] XSS prevention (React escaping)
- [x] Rate limiting considered
- [ ] HTTPS enforced in production

### 6. User Experience
- [x] Mobile-responsive design
- [x] Loading states implemented
- [x] Error messages user-friendly
- [x] Success feedback provided
- [x] Offline handling graceful
- [x] QR scanner works on mobile

### 7. Documentation
- [x] README.md comprehensive
- [x] API documentation complete
- [x] Deployment guide written
- [x] Environment variables documented
- [x] Troubleshooting guide included

## 🚀 Deployment Steps

### Step 1: Prepare Supabase Database

1. **Create Supabase Project**
   ```
   - Go to https://supabase.com
   - Click "New Project"
   - Name: "event-checkin-system"
   - Database Password: [Generate strong password]
   - Region: [Choose closest to users]
   ```

2. **Run Database Schema**
   ```sql
   -- Copy contents of backend/src/db/schema.sql
   -- Paste into Supabase SQL Editor
   -- Click "Run"
   ```

3. **Import CSV Data**
   ```
   - Prepare your CSV file with columns:
     Student ID, Name, Shirt Size, Food, Club, Involvement
   - Use Supabase Table Editor to import
   - Or use backend/src/scripts/reimport-csv.ts
   ```

4. **Get Connection String**
   ```
   - Go to Project Settings > Database
   - Copy "Connection string" (URI format)
   - Save for Vercel environment variables
   ```

### Step 2: Deploy to Vercel

1. **Connect GitHub Repository**
   ```
   - Go to https://vercel.com
   - Click "New Project"
   - Import your GitHub repository
   - Select root directory
   ```

2. **Configure Build Settings**
   ```
   Framework Preset: Other
   Build Command: bash build.sh
   Output Directory: frontend/dist
   Install Command: true
   ```

3. **Add Environment Variables**
   ```
   DATABASE_URL=postgresql://[your-supabase-connection-string]
   NODE_ENV=production
   FRONTEND_URL=https://[your-vercel-url].vercel.app
   VITE_API_URL=https://[your-vercel-url].vercel.app
   ```

4. **Deploy**
   ```
   - Click "Deploy"
   - Wait for build to complete
   - Note your deployment URL
   ```

### Step 3: Post-Deployment Testing

1. **Test API Health**
   ```bash
   curl https://your-app.vercel.app/api/health
   # Expected: {"status":"ok","timestamp":"..."}
   ```

2. **Test Student Flow**
   ```
   - Visit https://your-app.vercel.app/
   - Enter a valid Student ID
   - Accept PDPA consent
   - Verify QR code displays
   ```

3. **Test Admin Flow**
   ```
   - Visit https://your-app.vercel.app/admin
   - Enter admin password
   - Test QR scanner (use student QR code)
   - Verify claim checkboxes work
   - Check database view
   ```

4. **Test Mobile Devices**
   ```
   - Test on iOS Safari
   - Test on Android Chrome
   - Verify QR scanner works
   - Check responsive design
   ```

## 🔧 Configuration Files Ready for Deployment

### vercel.json ✅
```json
{
  "installCommand": "true",
  "buildCommand": "bash build.sh",
  "outputDirectory": "frontend/dist",
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/$1"
    },
    {
      "handle": "filesystem"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

### build.sh ✅
```bash
#!/bin/bash
set -e

echo "=== Installing API deps ==="
(cd api && npm install)

echo "=== Installing Frontend deps ==="
(cd frontend && rm -rf node_modules && npm install --include=dev)

echo "=== Building Frontend ==="
(cd frontend && npm run build)

echo "=== Build complete ==="
```

## 📋 Environment Variables Reference

### Required for Vercel Deployment

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string from Supabase | `postgresql://user:pass@host:5432/db` |
| `NODE_ENV` | Environment mode | `production` |
| `FRONTEND_URL` | Your Vercel deployment URL | `https://your-app.vercel.app` |
| `VITE_API_URL` | API base URL (same as FRONTEND_URL) | `https://your-app.vercel.app` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port (not used in Vercel) | `3000` |

## 🐛 Troubleshooting

### Build Fails
```bash
# Check build logs in Vercel dashboard
# Common issues:
# - Missing dependencies in package.json
# - TypeScript errors
# - Environment variables not set
```

### API Returns 500 Error
```bash
# Check Vercel function logs
# Common issues:
# - DATABASE_URL not set or incorrect
# - Database schema not deployed
# - CORS configuration issue
```

### QR Scanner Not Working
```bash
# Common issues:
# - Camera permissions not granted
# - HTTPS required for camera access
# - Browser compatibility (use Chrome/Safari)
```

### Database Connection Fails
```bash
# Verify connection string format:
postgresql://[user]:[password]@[host]:[port]/[database]

# Test connection:
psql "postgresql://..."
```

## ✨ Post-Deployment Optimization

### Performance
- [ ] Enable Vercel Analytics
- [ ] Configure caching headers
- [ ] Optimize images and assets
- [ ] Enable compression

### Monitoring
- [ ] Set up error tracking (Sentry)
- [ ] Configure uptime monitoring
- [ ] Set up database backups
- [ ] Monitor API usage

### Security
- [ ] Review CORS settings
- [ ] Implement rate limiting
- [ ] Add request validation
- [ ] Enable security headers

## 📞 Support

If you encounter issues:
1. Check Vercel deployment logs
2. Review Supabase database logs
3. Test API endpoints individually
4. Verify environment variables
5. Check browser console for errors

## 🎉 Success Criteria

Your deployment is successful when:
- ✅ Health endpoint returns 200 OK
- ✅ Student can validate ID and get QR code
- ✅ Admin can scan QR codes
- ✅ Claims are recorded in database
- ✅ Database view shows all students
- ✅ Mobile devices work correctly
- ✅ No console errors in production

---

**Ready to deploy?** Follow the steps above and you'll have your Event Check-In System live in minutes!
