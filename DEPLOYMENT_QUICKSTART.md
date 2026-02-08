# Deployment Quick Start Guide

This is a condensed version of the full deployment guide. For detailed instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md).

## Prerequisites

- [ ] Vercel account ([vercel.com](https://vercel.com))
- [ ] Supabase account ([supabase.com](https://supabase.com))
- [ ] GitHub repository with your code

## 5-Minute Deployment

### 1. Set Up Supabase (2 minutes)

1. Create new project at [app.supabase.com](https://app.supabase.com)
2. Go to **SQL Editor** → **New Query**
3. Copy/paste contents of `backend/src/db/schema.sql`
4. Click **Run**
5. Go to **Settings** → **Database** → Copy connection string
6. Save connection string (you'll need it for Vercel)

### 2. Import Student Data (1 minute)

**IMPORTANT**: Import CSV data BEFORE deploying to Vercel!

**Option A: Using Import Script (Recommended)**
```bash
# Set your Supabase connection string
export DATABASE_URL="postgresql://postgres:[password]@db.xxx.supabase.co:5432/postgres"

# Run import script
cd backend
npm install
npm run migrate
```

**Option B: Supabase Dashboard**
- Go to **Table Editor** → **students** → **Insert** → **Import CSV**
- Upload `Open House 2026 Student Organisations Involvement 1.csv`

### 3. Deploy to Vercel (2 minutes)

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Add environment variables:
   - `DATABASE_URL`: Your Supabase connection string
   - `NODE_ENV`: `production`
4. Click **Deploy**
5. Wait for deployment to complete

### 4. Update Environment Variables

After first deployment:
1. Copy your Vercel URL (e.g., `https://your-app.vercel.app`)
2. Go to **Settings** → **Environment Variables**
3. Add:
   - `FRONTEND_URL`: Your Vercel URL
   - `VITE_API_URL`: Your Vercel URL
4. Go to **Deployments** → Redeploy latest

## Test Your Deployment

1. **Health Check**: Visit `https://your-app.vercel.app/api/health`
   - Should return: `{"status": "ok"}`

2. **Student App**: Visit `https://your-app.vercel.app/`
   - Enter a student ID
   - Verify QR code is generated

3. **Admin App**: Visit `https://your-app.vercel.app/admin`
   - Scan the QR code
   - Mark items as claimed

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Student ID not found" | Verify CSV data imported to Supabase |
| "Database connection error" | Check `DATABASE_URL` in Vercel settings |
| "CORS error" | Update `FRONTEND_URL` and redeploy |
| Function timeout | Check Vercel function logs |

## Environment Variables Checklist

In Vercel project settings, you should have:

- [x] `DATABASE_URL` - Supabase connection string
- [x] `NODE_ENV` - Set to `production`
- [x] `FRONTEND_URL` - Your Vercel deployment URL
- [x] `VITE_API_URL` - Your Vercel deployment URL

## Project Structure

```
/
├── api/                    # Serverless functions (deployed to Vercel)
│   ├── validate.ts        # POST /api/validate
│   ├── scan.ts            # POST /api/scan
│   ├── claim.ts           # POST /api/claim
│   └── health.ts          # GET /api/health
├── backend/               # Original Express backend (local dev only)
│   └── src/
│       └── db/
│           └── schema.sql # Database schema
├── frontend/              # React app (deployed as static assets)
│   └── dist/             # Build output
└── vercel.json           # Vercel configuration
```

## What Gets Deployed

**To Vercel**:
- ✅ Frontend static assets (from `frontend/dist/`)
- ✅ Serverless functions (from `api/`)
- ❌ Backend Express server (only for local dev)

**To Supabase**:
- ✅ PostgreSQL database
- ✅ Student data from CSV

## Cost

Both services have generous free tiers:
- **Vercel**: 100 GB bandwidth/month (enough for ~1000 attendees)
- **Supabase**: 500 MB storage, 2 GB bandwidth/month

## Next Steps

1. ✅ Deploy to production
2. ✅ Test all functionality
3. ⬜ Train event staff
4. ⬜ Prepare backup devices
5. ⬜ Set up monitoring

## Need Help?

- **Full Guide**: See [DEPLOYMENT.md](./DEPLOYMENT.md)
- **API Docs**: See [api/README.md](./api/README.md)
- **Backend Docs**: See [backend/README.md](./backend/README.md)

---

**Quick Links**:
- [Vercel Dashboard](https://vercel.com/dashboard)
- [Supabase Dashboard](https://app.supabase.com)
- [Full Deployment Guide](./DEPLOYMENT.md)
