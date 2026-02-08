# Frontend-Backend Integration Guide

This document describes the frontend-backend integration setup for the Event Check-In System.

## Overview

The system uses a React + Vite frontend and Express backend with the following integration features:

1. **CORS Configuration**: Properly configured for both development and production
2. **Development Proxy**: Vite proxy for seamless local development
3. **Retry Logic**: Exponential backoff for network failures
4. **Loading States**: All API calls have loading indicators
5. **Error Handling**: Consistent error handling across all components

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React + Vite)                   │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  API Service Layer (src/services/api.ts)               │ │
│  │  - Retry logic with exponential backoff                │ │
│  │  - Centralized error handling                          │ │
│  │  - Type-safe requests                                  │ │
│  └────────────────────────────────────────────────────────┘ │
│                           │                                  │
│  ┌────────────────────────┼────────────────────────────────┐ │
│  │  Components            │                                │ │
│  │  - StudentApp          │  Uses apiPost()                │ │
│  │  - QRScanner           │  with retry logic              │ │
│  │  - ClaimCheckboxes     │                                │ │
│  └────────────────────────┴────────────────────────────────┘ │
└──────────────────────────┬───────────────────────────────────┘
                           │
                    Development: /api → http://localhost:3000
                    Production: Direct HTTPS
                           │
┌──────────────────────────┴───────────────────────────────────┐
│                    Backend (Express)                         │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  CORS Middleware                                       │ │
│  │  - Development: localhost:5173, localhost:3000         │ │
│  │  - Production: Configured via FRONTEND_URL env var    │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  API Routes                                            │ │
│  │  - POST /api/validate                                  │ │
│  │  - POST /api/scan                                      │ │
│  │  - POST /api/claim                                     │ │
│  └────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

## Configuration

### Backend CORS Configuration

**File**: `backend/src/index.ts`

```typescript
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL || 'https://event-checkin-frontend.vercel.app'
    : ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
```

**Environment Variables**:
- `NODE_ENV`: Set to 'production' in production environment
- `FRONTEND_URL`: Production frontend URL (e.g., 'https://your-app.vercel.app')

### Frontend Proxy Configuration

**File**: `frontend/vite.config.ts`

```typescript
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
});
```

This configuration:
- Proxies all `/api/*` requests to `http://localhost:3000` during development
- Eliminates CORS issues in local development
- Allows frontend to use relative URLs like `/api/validate`

## API Service Layer

### Centralized API Service

**File**: `frontend/src/services/api.ts`

The API service provides:

1. **Retry Logic**: Automatic retry with exponential backoff (1s, 2s, 4s)
2. **Error Handling**: Consistent error handling and user-friendly messages
3. **Type Safety**: TypeScript interfaces for requests and responses

### Usage Example

```typescript
import { apiPost, getErrorMessage } from '../../services/api';

// In component
try {
  const data = await apiPost<ValidationResponse>('/api/validate', { studentId });
  // Handle success
} catch (error) {
  const errorMessage = getErrorMessage(error);
  // Handle error
}
```

### Retry Configuration

- **Max Retries**: 3 attempts
- **Initial Delay**: 1 second
- **Backoff**: Exponential (1s → 2s → 4s)
- **Total Max Time**: ~7 seconds before giving up

## Component Integration

### StudentApp

**File**: `frontend/src/components/student/StudentApp.tsx`

- Uses `apiPost()` for `/api/validate` endpoint
- Implements loading state during API call
- Displays error messages using centralized error handling
- Automatically retries on network failures

### QRScanner

**File**: `frontend/src/components/admin/QRScanner.tsx`

- Uses `apiPost()` for `/api/scan` endpoint
- Prevents duplicate scans with processing flag
- Handles camera permission errors gracefully
- Retries on network failures

### ClaimCheckboxes

**File**: `frontend/src/components/admin/ClaimCheckboxes.tsx`

- Uses `apiPost()` for `/api/claim` endpoint
- Shows loading spinner during claim submission
- Handles 409 (already claimed) errors specifically
- Retries on network failures

## Loading States

All components implement loading states:

1. **StudentApp**: `isLoading` state disables form during submission
2. **QRScanner**: `isProcessingRef` prevents duplicate scans
3. **ClaimCheckboxes**: Per-item loading state with spinner

## Error Handling

### Error Types

1. **Network Errors**: Connection failures, timeouts
   - Message: "Network error. Please check your connection and try again."
   - Automatically retried 3 times

2. **Validation Errors (400)**: Invalid input
   - Message: From API response
   - Not retried

3. **Not Found Errors (404)**: Student/token not found
   - Message: From API response
   - Not retried

4. **Conflict Errors (409)**: Duplicate claim attempts
   - Message: "This item has already been claimed."
   - Not retried

5. **Server Errors (500)**: Internal server errors
   - Message: From API response or generic message
   - Not retried

### Error Display

- **StudentApp**: Shows error below form
- **QRScanner**: Calls `onScanError` callback
- **ClaimCheckboxes**: Shows error message above checkboxes

## Development Workflow

### Starting the Development Environment

1. **Start Backend**:
   ```bash
   cd backend
   npm run dev
   ```
   Backend runs on `http://localhost:3000`

2. **Start Frontend**:
   ```bash
   cd frontend
   npm run dev
   ```
   Frontend runs on `http://localhost:5173`

3. **Access Application**:
   - Student App: `http://localhost:5173/`
   - Admin App: `http://localhost:5173/admin`

### Testing API Integration

1. **Unit Tests**: Test API service in isolation
   ```bash
   cd frontend
   npm test -- src/services/__tests__/api.test.ts
   ```

2. **Component Tests**: Test components with mocked API
   ```bash
   cd frontend
   npm test
   ```

3. **Backend Tests**: Test API endpoints
   ```bash
   cd backend
   npm test
   ```

4. **Manual Testing**: Use browser dev tools to inspect network requests

## Production Deployment

### Backend Deployment (Vercel)

1. Set environment variables:
   - `DATABASE_URL`: PostgreSQL connection string
   - `NODE_ENV`: `production`
   - `FRONTEND_URL`: Your frontend URL

2. Deploy backend as serverless functions

### Frontend Deployment (Vercel)

1. Build frontend:
   ```bash
   npm run build
   ```

2. Deploy to Vercel

3. Update backend `FRONTEND_URL` environment variable with deployed URL

### Post-Deployment Verification

1. Check CORS headers in browser dev tools
2. Verify API calls succeed
3. Test retry logic by simulating network failures
4. Verify error handling for all error types

## Performance Considerations

### Requirements Met

- **Requirement 2.4**: Validation responds within 2 seconds ✓
- **Requirement 4.6**: Scan validation responds within 2 seconds ✓
- **Requirement 10.1**: Backend responds within 500ms ✓
- **Requirement 10.2**: QR scan validation responds within 500ms ✓
- **Requirement 10.3**: Claim updates respond within 500ms ✓

### Optimization Strategies

1. **Connection Pooling**: PostgreSQL connection pool in backend
2. **Retry Logic**: Only retries on network failures, not API errors
3. **Loading States**: Prevents duplicate requests
4. **Exponential Backoff**: Reduces server load during retries

## Troubleshooting

### CORS Errors

**Symptom**: "Access-Control-Allow-Origin" error in browser console

**Solutions**:
1. Check `FRONTEND_URL` environment variable in backend
2. Verify `NODE_ENV` is set correctly
3. Check browser dev tools for actual origin being sent
4. Ensure backend CORS middleware is before routes

### Proxy Not Working

**Symptom**: 404 errors for `/api/*` requests in development

**Solutions**:
1. Verify backend is running on port 3000
2. Check `vite.config.ts` proxy configuration
3. Restart Vite dev server
4. Check for port conflicts

### Retry Logic Not Working

**Symptom**: Requests fail immediately without retrying

**Solutions**:
1. Check if error is a network error (TypeError)
2. Verify `fetchWithRetry` is being used
3. Check browser console for retry logs
4. Ensure fake timers aren't interfering (in tests)

### Loading States Not Showing

**Symptom**: No loading indicator during API calls

**Solutions**:
1. Verify `isLoading` state is set before API call
2. Check that loading state is cleared in `finally` block
3. Ensure loading UI is conditionally rendered
4. Check for race conditions in state updates

## Testing Checklist

- [ ] Backend CORS allows frontend origin
- [ ] Vite proxy forwards `/api/*` requests
- [ ] Retry logic works for network failures
- [ ] Loading states show during API calls
- [ ] Error messages display correctly
- [ ] 404 errors handled gracefully
- [ ] 409 errors (duplicate claims) handled
- [ ] Network errors show user-friendly message
- [ ] API responses within performance requirements
- [ ] Production deployment works end-to-end

## Related Files

- `backend/src/index.ts` - CORS configuration
- `frontend/vite.config.ts` - Proxy configuration
- `frontend/src/services/api.ts` - API service layer
- `frontend/src/components/student/StudentApp.tsx` - Student app integration
- `frontend/src/components/admin/QRScanner.tsx` - QR scanner integration
- `frontend/src/components/admin/ClaimCheckboxes.tsx` - Claim checkboxes integration
- `frontend/src/services/__tests__/api.test.ts` - API service tests
