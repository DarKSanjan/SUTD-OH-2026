# 🚀 Deployment Quick Start

Deploy your Event Check-In System to Vercel + Supabase in 5 minutes.

## Prerequisites

- GitHub account
- Vercel account (free tier)
- Supabase account (free tier)
- Your student data CSV file

## Step 1: Set Up Database (2 minutes)

### 1.1 Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Click **"New Project"**
3. Fill in:
   - **Name**: `event-checkin-system`
   - **Database Password**: Generate a strong password (save it!)
   - **Region**: Choose closest to your users
4. Click **"Create new project"**
5. Wait for project to initialize (~1 minute)

### 1.2 Deploy Database Schema
1. In Supabase dashboard, click **"SQL Editor"**
2. Click **"New query"**
3. Copy the entire contents of `backend/src/db/schema.sql`
4. Paste into the SQL editor
5. Click **"Run"** (bottom right)
6. Verify tables created: `students`, `tokens`, `claims`

### 1.3 Import Student Data
1. Prepare your CSV file with these columns:
   ```
   Student ID, Name, Shirt Size, Food, Club, Involvement
   ```
2. In Supabase, go to **"Table Editor"** > **"students"**
3. Click **"Insert"** > **"Import data from CSV"**
4. Upload your CSV file
5. Map columns correctly
6. Click **"Import"**

### 1.4 Get Connection String
1. Go to **"Project Settings"** (gear icon)
2. Click **"Database"** in sidebar
3. Scroll to **"Connection string"**
4. Select **"URI"** tab
5. Copy the connection string
6. Replace `[YOUR-PASSWORD]` with your database password
7. **Save this string** - you'll need it for Vercel!

Example:
```
postgresql://postgres.abc123:YOUR_PASSWORD@aws-0-us-west-1.pooler.supabase.com:5432/postgres
```

## Step 2: Deploy to Vercel (2 minutes)

### 2.1 Push Code to GitHub
```bash
# If not already done
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

### 2.2 Import to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Click **"Add New..."** > **"Project"**
3. Click **"Import"** next to your GitHub repository
4. Configure project:
   - **Framework Preset**: Other
   - **Root Directory**: `./` (leave as is)
   - **Build Command**: `bash build.sh`
   - **Output Directory**: `frontend/dist`
   - **Install Command**: `true`

### 2.3 Add Environment Variables
Click **"Environment Variables"** and add these:

| Name | Value |
|------|-------|
| `DATABASE_URL` | Your Supabase connection string from Step 1.4 |
| `NODE_ENV` | `production` |
| `FRONTEND_URL` | Leave empty for now (we'll add after deployment) |
| `VITE_API_URL` | Leave empty for now (we'll add after deployment) |

### 2.4 Deploy
1. Click **"Deploy"**
2. Wait for build to complete (~2 minutes)
3. Note your deployment URL (e.g., `https://your-app.vercel.app`)

### 2.5 Update Environment Variables
1. Go to **"Settings"** > **"Environment Variables"**
2. Edit `FRONTEND_URL`:
   - Value: `https://your-app.vercel.app` (your actual URL)
3. Edit `VITE_API_URL`:
   - Value: `https://your-app.vercel.app` (your actual URL)
4. Click **"Save"**
5. Go to **"Deployments"** tab
6. Click **"..."** on latest deployment > **"Redeploy"**
7. Check **"Use existing Build Cache"**
8. Click **"Redeploy"**

## Step 3: Test Your Deployment (1 minute)

### 3.1 Test API Health
Open in browser:
```
https://your-app.vercel.app/api/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 3.2 Test Student App
1. Visit: `https://your-app.vercel.app/`
2. Enter a valid Student ID from your database
3. Accept PDPA consent
4. Verify QR code displays

### 3.3 Test Admin App
1. Visit: `https://your-app.vercel.app/admin`
2. Enter admin password (default: `admin123` - **change this!**)
3. Click **"Scanner"** tab
4. Use your phone to scan the student QR code
5. Verify student info displays
6. Test claim checkboxes
7. Click **"Database View"** tab to see all students

## 🎉 Success!

Your Event Check-In System is now live!

**URLs:**
- Student App: `https://your-app.vercel.app/`
- Admin App: `https://your-app.vercel.app/admin`
- API Health: `https://your-app.vercel.app/api/health`

## 🔒 Important Security Steps

### Change Admin Password
The default admin password is `admin123`. **Change it immediately!**

1. Open `frontend/src/components/admin/AdminLogin.tsx`
2. Find line: `const ADMIN_PASSWORD = 'admin123';`
3. Change to a strong password
4. Commit and push changes
5. Vercel will auto-deploy

### Secure Your Database
1. In Supabase, go to **"Database"** > **"Roles"**
2. Review permissions
3. Enable Row Level Security (RLS) if needed
4. Set up database backups

## 📱 Mobile Testing

Test on actual devices:
- **iOS**: Safari browser
- **Android**: Chrome browser

QR scanner requires:
- HTTPS (✅ Vercel provides this)
- Camera permissions (user must grant)
- Modern browser (Chrome/Safari)

## 🐛 Troubleshooting

### Build Failed
- Check Vercel build logs
- Verify `build.sh` has execute permissions
- Ensure all dependencies in `package.json`

### API Returns 500
- Check Vercel function logs
- Verify `DATABASE_URL` is correct
- Test database connection in Supabase

### QR Scanner Not Working
- Ensure HTTPS is enabled (Vercel does this automatically)
- Grant camera permissions in browser
- Try different browser (Chrome recommended)

### Database Connection Error
- Verify connection string format
- Check database password is correct
- Ensure Supabase project is active

## 📊 Monitoring

### Vercel Dashboard
- View deployment logs
- Monitor function invocations
- Check error rates

### Supabase Dashboard
- Monitor database queries
- Check connection pool
- View table data

## 🔄 Making Updates

After deployment, any push to `main` branch will trigger auto-deployment:

```bash
# Make changes
git add .
git commit -m "Update feature"
git push origin main

# Vercel automatically deploys
```

## 📞 Need Help?

1. Check [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) for detailed steps
2. Review [README.md](./README.md) for architecture overview
3. Check Vercel deployment logs for errors
4. Review Supabase database logs

## ✨ Next Steps

- [ ] Change admin password
- [ ] Set up custom domain
- [ ] Enable Vercel Analytics
- [ ] Configure database backups
- [ ] Add monitoring/alerts
- [ ] Test with real users

---

**Congratulations!** Your Event Check-In System is live and ready for SUTD Open House 2026! 🎊
