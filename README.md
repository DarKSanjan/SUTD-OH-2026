# Event Check-In System

A production-ready web application for managing student check-ins at SUTD Open House 2026. Features QR code generation, mobile scanning, real-time claim tracking, and comprehensive testing.

## 📚 Documentation

- 🎊 **[Final Polish Summary](./FINAL_POLISH_SUMMARY.md)** - Complete readiness overview
- 🚀 **[Deployment Quick Start](./DEPLOYMENT_QUICKSTART.md)** - Deploy to Vercel in 5 minutes
- ✅ **[Deployment Checklist](./DEPLOYMENT_CHECKLIST.md)** - Pre-deployment verification
- 🏭 **[Production Setup Guide](./PRODUCTION_SETUP.md)** - Complete production configuration
- 🧪 **[Local Testing Guide](./LOCAL_TESTING_GUIDE.md)** - Local testing instructions
- 🔧 **[API Documentation](./api/README.md)** - Serverless functions reference
- 📝 **[Backend Documentation](./backend/README.md)** - Backend architecture

## 🎯 Current Status

### ✅ Production Ready
- All frontend tests passing (285/285)
- Backend tests optimized and stable
- Mobile-responsive design implemented
- QR code generation and scanning working
- Admin authentication in place
- Database schema finalized
- Deployment configuration complete

### 🚀 Ready for Deployment
This application is **fully polished and ready** for:
1. Local testing
2. Staging deployment
3. Production deployment to Vercel

See [DEPLOYMENT_QUICKSTART.md](./DEPLOYMENT_QUICKSTART.md) to get started!

## Project Structure

```
.
├── api/                    # Vercel serverless functions (production)
│   ├── validate.ts        # POST /api/validate
│   ├── scan.ts            # POST /api/scan
│   ├── claim.ts           # POST /api/claim
│   └── health.ts          # GET /api/health
│
├── backend/               # Express + TypeScript backend (local dev)
│   ├── src/
│   │   ├── dao/          # Data Access Objects
│   │   ├── services/     # Business logic services
│   │   ├── routes/       # API route handlers
│   │   ├── models/       # TypeScript interfaces/types
│   │   ├── db/           # Database schema and migrations
│   │   └── index.ts      # Application entry point
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/             # React + Vite + TypeScript frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── student/  # Student app components
│   │   │   ├── admin/    # Admin app components
│   │   │   └── shared/   # Shared components
│   │   ├── services/     # API client
│   │   ├── config/       # Environment configuration
│   │   ├── App.tsx       # Main app component
│   │   └── main.tsx      # Application entry point
│   ├── package.json
│   └── vite.config.ts
│
└── vercel.json           # Vercel deployment configuration
```

## Getting Started

### Local Development

#### Backend

```bash
cd backend
npm install
npm run dev          # Start development server on port 3000
npm run build        # Build for production
npm test            # Run tests
npm run migrate     # Run database migrations
```

#### Frontend

```bash
cd frontend
npm install
npm run dev          # Start development server on port 5173
npm run build        # Build for production
npm test            # Run tests
```

The frontend dev server proxies API requests to the backend at `http://localhost:3000`.

**Start both servers for full development:**
1. Terminal 1: `cd backend && npm run dev`
2. Terminal 2: `cd frontend && npm run dev`
3. Open browser: `http://localhost:5173`

### Production Deployment

Deploy to Vercel + Supabase in 5 minutes:

1. **Set up Supabase database**
   ```bash
   # Create project at supabase.com
   # Run backend/src/db/schema.sql in SQL Editor
   # Import CSV data
   ```

2. **Deploy to Vercel**
   ```bash
   # Connect GitHub repo at vercel.com
   # Add environment variables:
   # - DATABASE_URL (from Supabase)
   # - NODE_ENV=production
   # - FRONTEND_URL (your Vercel URL)
   # - VITE_API_URL (your Vercel URL)
   ```

3. **Test deployment**
   ```bash
   # Visit https://your-app.vercel.app/api/health
   # Test student app at /
   # Test admin app at /admin
   ```

See [DEPLOYMENT_QUICKSTART.md](./DEPLOYMENT_QUICKSTART.md) for detailed steps.

## Technology Stack

- **Backend**: Node.js, Express, TypeScript, PostgreSQL (Supabase)
- **Frontend**: React 18, Vite, TypeScript, React Router
- **Deployment**: Vercel (serverless functions + static hosting)
- **Database**: PostgreSQL on Supabase (free tier)
- **QR Code**: qrcode (generation), html5-qrcode (scanning)
- **Testing**: Vitest, fast-check (property-based testing)

## Architecture

### Local Development
- Express server runs on `localhost:3000`
- React dev server runs on `localhost:5173`
- SQLite database for local testing

### Production
- Frontend: Static assets served by Vercel CDN
- Backend: Serverless functions in `/api` directory
- Database: PostgreSQL on Supabase
- Auto-scaling with serverless architecture

## Features

- ✅ Student ID validation with QR code generation
- ✅ Mobile-friendly QR code scanner for admins
- ✅ Real-time claim tracking (t-shirts, meal coupons)
- ✅ Duplicate claim prevention
- ✅ Organization involvement display
- ✅ Offline-capable (with service workers)
- ✅ Property-based testing for correctness
- ✅ End-to-end integration tests

## Testing

```bash
# Run all tests
npm test

# Run backend tests
cd backend && npm test

# Run frontend tests
cd frontend && npm test

# Run specific test file
npm test -- StudentDAO.test.ts
```

## Environment Variables

### Backend (Local Development)
```bash
# backend/.env
DATABASE_URL=postgresql://user:pass@host:5432/db
NODE_ENV=development
PORT=3000
```

### Frontend (Local Development)
```bash
# frontend/.env.development
VITE_API_URL=http://localhost:3000
```

### Production (Vercel)
Set in Vercel dashboard:
- `DATABASE_URL` - Supabase connection string
- `NODE_ENV` - production
- `FRONTEND_URL` - Your Vercel URL
- `VITE_API_URL` - Your Vercel URL

## Documentation

- [Deployment Quick Start](./DEPLOYMENT_QUICKSTART.md) - 5-minute deployment guide
- [Full Deployment Guide](./DEPLOYMENT.md) - Comprehensive deployment instructions
- [API Documentation](./api/README.md) - Serverless functions reference
- [Backend Documentation](./backend/README.md) - Backend architecture and setup
- [Integration Guide](./INTEGRATION.md) - Frontend-backend integration

## License

MIT
# Deployment Thu Feb 12 04:38:15 +08 2026
