# Event Check-In System - Deployment Guide

This guide walks you through deploying the Event Check-In System to production using Vercel and Supabase.

## Architecture Overview

- **Frontend**: React + Vite deployed as static assets on Vercel
- **Backend**: Node.js + Express deployed as Vercel serverless functions
- **Database**: PostgreSQL hosted on Supabase (free tier)

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Supabase Account**: Sign up at [supabase.com](https://supabase.com)
3. **GitHub Repository**: Your code should be in a GitHub repository
4. **Node.js**: Version 18+ installed locally

## Step 1: Set Up Supabase Database

### 1.1 Create a New Supabase Project

1. Log in to [Supabase Dashboard](https://app.supabase.com)
2. Click "New Project"
3. Fill in the project details:
   - **Name**: event-checkin-system
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Choose the closest region to your users
4. Click "Create new project" and wait for provisioning (~2 minutes)

### 1.2 Run Database Migrations

1. In your Supabase project dashboard, go to **SQL Editor**
2. Click "New Query"
3. Copy the contents of `backend/src/db/schema.sql` and paste it into the editor
4. Click "Run" to execute the migration
5. Verify that the tables were created:
   - Go to **Table Editor** in the sidebar
   - You should see: `students`, `tokens`, and `claims` tables

### 1.3 Get Your Database Connection String

1. In your Supabase project, go to **Settings** → **Database**
2. Scroll down to **Connection string** section
3. Select **URI** tab
4. Copy the connection string (it looks like: `postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:5432/postgres`)
5. Replace `[YOUR-PASSWORD]` with your actual database password
6. **Save this connection string** - you'll need it for Vercel

### 1.4 Import CSV Data

**IMPORTANT**: You must import the CSV data to Supabase BEFORE deploying to Vercel. The serverless functions do NOT import CSV data on every request - they expect the data to already be in the database.

You have two options to import the student data:

**Option A: Using Local Script (Recommended)**

1. Create a `.env` file in the `backend` directory:
   ```bash
   DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:5432/postgres
   NODE_ENV=production
   ```

2. Run the migration script:
   ```bash
   cd backend
   npm install
   npm run migrate
   ```

3. The script will import data from `Open House 2026 Student Organisations Involvement 1.csv`

**Option B: Manual Import via Supabase Dashboard**

1. Go to **Table Editor** → **students** table
2. Click "Insert" → "Import data from CSV"
3. Upload your CSV file
4. Map the columns correctly:
   - `Student_ID` → `student_id`
   - `Name` → `name`
   - `T-shirt Size` → `tshirt_size`
   - `Meal Preference` → `meal_preference`
   - Organization details → `organization_details`

## Step 2: Deploy to Vercel

### 2.1 Connect GitHub Repository

1. Log in to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Vercel will auto-detect the configuration from `vercel.json`

### 2.2 Configure Build Settings

Vercel should auto-detect these settings, but verify:

- **Framework Preset**: Vite
- **Root Directory**: `./` (project root)
- **Build Command**: `cd frontend && npm install && npm run build`
- **Output Directory**: `frontend/dist`

### 2.3 Configure Environment Variables

In the Vercel project settings, add these environment variables:

1. Click on your project → **Settings** → **Environment Variables**

2. Add the following variables:

   | Name | Value | Environment |
   |------|-------|-------------|
   | `DATABASE_URL` | Your Supabase connection string | Production, Preview, Development |
   | `NODE_ENV` | `production` | Production |
   | `FRONTEND_URL` | Your Vercel deployment URL (e.g., `https://your-app.vercel.app`) | Production |
   | `VITE_API_URL` | Your Vercel deployment URL (same as above) | Production |

   **Important**: 
   - For `FRONTEND_URL` and `VITE_API_URL`, you can initially use a placeholder
   - After first deployment, update these with your actual Vercel URL
   - Redeploy after updating

### 2.4 Deploy

1. Click "Deploy"
2. Vercel will:
   - Install dependencies
   - Build the frontend
   - Deploy serverless functions from `/api` directory
   - Deploy static assets from `frontend/dist`
3. Wait for deployment to complete (~2-3 minutes)
4. You'll get a deployment URL like: `https://your-app-xxx.vercel.app`

### 2.5 Update Environment Variables with Deployment URL

1. Go back to **Settings** → **Environment Variables**
2. Update `FRONTEND_URL` and `VITE_API_URL` with your actual deployment URL
3. Go to **Deployments** tab
4. Click "..." on the latest deployment → "Redeploy"

## Step 3: Verify Deployment

### 3.1 Test Health Endpoint

Open your browser and navigate to:
```
https://your-app.vercel.app/api/health
```

You should see:
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "environment": "production"
}
```

### 3.2 Test Student App

1. Navigate to: `https://your-app.vercel.app/`
2. Enter a valid student ID from your CSV
3. Verify that:
   - Student information is displayed correctly
   - QR code is generated
   - Organization involvements are shown

### 3.3 Test Admin App

1. Navigate to: `https://your-app.vercel.app/admin`
2. Allow camera permissions
3. Scan the QR code from the Student App
4. Verify that:
   - Student information is displayed
   - Claim checkboxes work
   - Claim status updates correctly

### 3.4 Test End-to-End Flow

1. **Student validates ID** → Gets QR code
2. **Admin scans QR code** → Sees student info
3. **Admin marks t-shirt claimed** → Status updates
4. **Admin tries to claim again** → Gets error "Item already claimed"
5. **Admin marks meal claimed** → Status updates
6. **Verify both items are marked as claimed**

## Step 4: Monitor and Troubleshoot

### 4.1 View Logs

1. In Vercel Dashboard, go to your project
2. Click **Deployments** → Select latest deployment
3. Click **Functions** tab to see serverless function logs
4. Check for errors in:
   - `/api/validate`
   - `/api/scan`
   - `/api/claim`

### 4.2 Common Issues

**Issue: "Student ID not found"**
- Verify CSV data was imported correctly to Supabase
- Check the `students` table in Supabase Table Editor
- Ensure student IDs match exactly (case-insensitive)

**Issue: "Database connection error"**
- Verify `DATABASE_URL` environment variable is set correctly
- Check Supabase project is active (not paused)
- Verify connection string includes correct password

**Issue: "CORS error"**
- Verify `FRONTEND_URL` environment variable matches your Vercel URL
- Check that both URLs use HTTPS in production
- Redeploy after updating environment variables

**Issue: "QR code not scanning"**
- Ensure camera permissions are granted
- Try a different device or browser
- Check that QR code is displayed clearly (not too small)

**Issue: "Serverless function timeout"**
- Check Vercel function logs for errors
- Verify database connection is working
- Consider increasing function timeout in `vercel.json` (max 10s on free tier)

### 4.3 Performance Monitoring

Monitor these metrics in Vercel Dashboard:

- **Function Execution Time**: Should be < 500ms for all endpoints
- **Function Invocations**: Track usage patterns
- **Error Rate**: Should be < 1%
- **Bandwidth**: Monitor data transfer

## Step 5: Custom Domain (Optional)

### 5.1 Add Custom Domain

1. In Vercel project settings, go to **Domains**
2. Click "Add Domain"
3. Enter your domain (e.g., `checkin.yourdomain.com`)
4. Follow DNS configuration instructions
5. Wait for DNS propagation (~24 hours)

### 5.2 Update Environment Variables

After adding custom domain:

1. Update `FRONTEND_URL` to your custom domain
2. Update `VITE_API_URL` to your custom domain
3. Redeploy

## Step 6: Maintenance

### 6.1 Update Student Data

To update student data after initial deployment:

1. **Option A**: Run migration script locally with updated CSV
   ```bash
   cd backend
   npm run migrate
   ```

2. **Option B**: Use Supabase SQL Editor to update records
   ```sql
   UPDATE students 
   SET name = 'New Name', tshirt_size = 'L'
   WHERE student_id = 'ABC123';
   ```

### 6.2 Database Backups

Supabase automatically backs up your database:
- **Free tier**: Daily backups, 7-day retention
- **Pro tier**: Point-in-time recovery

To manually backup:
1. Go to Supabase Dashboard → **Database** → **Backups**
2. Click "Create backup"

### 6.3 Monitoring

Set up monitoring for:
- **Uptime**: Use Vercel's built-in monitoring
- **Error tracking**: Check Vercel function logs regularly
- **Database health**: Monitor Supabase dashboard

## Troubleshooting Checklist

Before contacting support, verify:

- [ ] Supabase database is active and accessible
- [ ] All environment variables are set correctly in Vercel
- [ ] CSV data is imported to Supabase
- [ ] Latest code is deployed (check git commit hash)
- [ ] No errors in Vercel function logs
- [ ] Browser console shows no errors
- [ ] Camera permissions granted (for Admin App)
- [ ] Using HTTPS in production (not HTTP)

## Cost Estimates

### Free Tier Limits

**Vercel (Hobby Plan - Free)**:
- 100 GB bandwidth/month
- Unlimited deployments
- 100 GB-hours serverless function execution
- Sufficient for events with < 1000 attendees

**Supabase (Free Tier)**:
- 500 MB database storage
- 2 GB bandwidth/month
- 50,000 monthly active users
- Sufficient for events with < 5000 students

### Scaling Considerations

If you exceed free tier limits:
- **Vercel Pro**: $20/month (1 TB bandwidth, 1000 GB-hours)
- **Supabase Pro**: $25/month (8 GB storage, 50 GB bandwidth)

## Security Best Practices

1. **Environment Variables**: Never commit `.env` files to git
2. **Database Password**: Use strong, unique password
3. **HTTPS Only**: Always use HTTPS in production
4. **CORS**: Restrict to your domain only
5. **Rate Limiting**: Consider adding rate limiting for production
6. **Monitoring**: Set up alerts for unusual activity

## Support

For issues:
1. Check Vercel function logs
2. Check Supabase database logs
3. Review this deployment guide
4. Check GitHub issues
5. Contact system administrator

## Rollback Procedure

If deployment fails:

1. Go to Vercel Dashboard → **Deployments**
2. Find the last working deployment
3. Click "..." → "Promote to Production"
4. Verify the rollback worked

## Next Steps

After successful deployment:

1. Test all functionality thoroughly
2. Train event staff on using the Admin App
3. Prepare backup devices (tablets/phones)
4. Print QR codes for students without devices
5. Set up monitoring and alerts
6. Document any custom configurations

---

**Deployment Date**: _____________

**Deployed By**: _____________

**Vercel URL**: _____________

**Supabase Project**: _____________

**Notes**: _____________
