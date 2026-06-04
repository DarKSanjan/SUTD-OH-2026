# SUTD Open House 2026 — Volunteer Management System

This is the volunteer management system used during SUTD's Open House 2026. It was built over a weekend to handle check-ins, t-shirt and meal coupon distribution, and give admins a live view of what's been claimed.

## What it does

Volunteers register with their student ID, which generates a personal QR code. At distribution points, admins scan the QR code to mark a t-shirt or meal coupon as collected. The admin panel shows a table of all registered students and their claim status in real time.

- Student ID entry and QR code generation
- QR code scanning for admins (mobile-friendly)
- Claim tracking for t-shirts and meal coupons, with duplicate prevention
- Admin dashboard with a live table of all students and their status
- Simple admin authentication

## Tech stack

- **Frontend**: React 18, TypeScript, Vite
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL on Supabase
- **Deployment**: Vercel (serverless functions + static hosting)
- **QR codes**: `qrcode` for generation, `html5-qrcode` for scanning

## Running locally

You need both the backend and frontend running at the same time.

```bash
# Terminal 1 — backend (runs on :3000)
cd backend
npm install
npm run dev

# Terminal 2 — frontend (runs on :5173)
cd frontend
npm install
npm run dev
```

Then open `http://localhost:5173`.

## Deployment

Hosted on Vercel with Supabase as the database. The `/api` directory contains the serverless functions that replace the Express backend in production.

Environment variables needed:

- `DATABASE_URL` — Supabase connection string
- `VITE_API_URL` — the Vercel deployment URL

## Honest caveats

This was built over a weekend for a one-time event, so corners were cut:

- Auth is minimal — the admin password is an environment variable, not a proper auth system
- No role management; it's just admin or not
- Error handling is functional but not polished
- The local dev setup (Express) and production setup (Vercel serverless) are two different backends kept in sync by hand, which is a bit fragile

It did the job on the day. If you're repurposing this for something more serious, the auth and the dev/prod backend split are the two things most worth rethinking.

## License

MIT
