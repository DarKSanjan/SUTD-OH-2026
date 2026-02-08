# API Serverless Functions

This directory contains Vercel serverless functions that serve as the backend API for the Event Check-In System.

## Structure

```
api/
├── _shared.ts       # Shared utilities (CORS, error handling, data import)
├── validate.ts      # POST /api/validate - Validate student ID and generate QR code
├── scan.ts          # POST /api/scan - Validate QR token and get student info
├── claim.ts         # POST /api/claim - Record item distribution
├── health.ts        # GET /api/health - Health check endpoint
├── package.json     # Dependencies for serverless functions
└── tsconfig.json    # TypeScript configuration
```

## How It Works

Each file in this directory becomes a serverless function endpoint:
- `api/validate.ts` → `/api/validate`
- `api/scan.ts` → `/api/scan`
- `api/claim.ts` → `/api/claim`
- `api/health.ts` → `/api/health`

## Shared Utilities

The `_shared.ts` file provides:
- **CORS handling**: Configures cross-origin requests
- **Error/success helpers**: Consistent response formatting
- **Data import**: Ensures CSV data is loaded on cold start

## Cold Starts

Serverless functions have "cold starts" when they haven't been used recently:
1. First request after idle period takes longer (~2-3 seconds)
2. CSV data is imported on first cold start
3. Subsequent requests are fast (~100-500ms)
4. Functions stay "warm" for ~5-15 minutes after last use

## Environment Variables

Required environment variables (set in Vercel dashboard):
- `DATABASE_URL`: PostgreSQL connection string from Supabase
- `NODE_ENV`: Set to "production"
- `FRONTEND_URL`: Your Vercel deployment URL (for CORS)

## Local Development

These serverless functions are NOT used in local development. Instead:
- Use `backend/src/index.ts` for local Express server
- Run `npm run dev` in the backend directory
- The Express server provides the same API endpoints

## Deployment

Vercel automatically:
1. Detects TypeScript files in `/api` directory
2. Compiles them to JavaScript
3. Deploys each as a separate serverless function
4. Routes requests based on file names

## Testing

To test serverless functions locally:

```bash
# Install Vercel CLI
npm i -g vercel

# Run local development server
vercel dev
```

This will:
- Start a local server on port 3000
- Simulate Vercel's serverless environment
- Hot-reload on file changes

## Monitoring

View function logs in Vercel Dashboard:
1. Go to your project
2. Click "Deployments" → Select deployment
3. Click "Functions" tab
4. View logs for each function

## Limitations

Vercel Free Tier:
- **Timeout**: 10 seconds max per function
- **Memory**: 1024 MB per function
- **Execution**: 100 GB-hours per month
- **Bandwidth**: 100 GB per month

## Troubleshooting

**Function timeout**:
- Check database connection is fast
- Optimize queries with indexes
- Consider caching frequently accessed data

**Cold start too slow**:
- Reduce dependencies in serverless functions
- Use connection pooling for database
- Consider upgrading to Vercel Pro for faster cold starts

**CORS errors**:
- Verify `FRONTEND_URL` environment variable
- Check CORS configuration in `_shared.ts`
- Ensure both frontend and API use HTTPS in production

## Related Files

- `/backend/src/` - Original Express backend (used for local dev)
- `/vercel.json` - Vercel deployment configuration
- `/DEPLOYMENT.md` - Full deployment guide
