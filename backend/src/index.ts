import express from 'express';
import cors from 'cors';
import StartupImport from './services/StartupImport';
import validateRouter from './routes/validate';
import scanRouter from './routes/scan';
import claimRouter from './routes/claim';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/logger';

const app = express();
const PORT = process.env.PORT || 3000;

// CORS configuration
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL || 'https://event-checkin-frontend.vercel.app'
    : ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  optionsSuccessStatus: 200,
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(requestLogger);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// API routes
app.use('/api', validateRouter);
app.use('/api', scanRouter);
app.use('/api', claimRouter);

// Error handling middleware (must be last)
app.use(notFoundHandler);
app.use(errorHandler);

/**
 * Start the server with CSV import
 */
async function startServer() {
  try {
    // Import CSV data on startup
    await StartupImport.importCSVOnStartup();

    // Start the server only if import succeeds
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error instanceof Error ? error.message : error);
    process.exit(1); // Exit with error code to prevent startup
  }
}

// Start the server
startServer();

export default app;
