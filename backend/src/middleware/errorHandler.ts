import { Request, Response, NextFunction } from 'express';

/**
 * Custom error class for application errors
 */
export class AppError extends Error {
  statusCode: number;
  code: string;
  details?: any;
  isOperational: boolean;

  constructor(message: string, statusCode: number, code: string, details?: any) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Log error with timestamp and context
 */
function logError(error: Error | AppError, req: Request): void {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.originalUrl || req.url;
  const ip = req.ip || req.socket.remoteAddress;

  console.error(`[${timestamp}] ERROR:`, {
    message: error.message,
    method,
    url,
    ip,
    stack: error.stack,
    ...(error instanceof AppError && {
      statusCode: error.statusCode,
      code: error.code,
      details: error.details
    })
  });
}

/**
 * Global error handler middleware
 * Handles all errors thrown in the application and returns consistent error responses
 */
export function errorHandler(
  error: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Log the error with timestamp
  logError(error, req);

  // Default to 500 Internal Server Error
  let statusCode = 500;
  let errorCode = 'INTERNAL_ERROR';
  let errorMessage = 'Internal server error';
  let details: any = undefined;

  // Handle AppError instances
  if (error instanceof AppError) {
    statusCode = error.statusCode;
    errorCode = error.code;
    errorMessage = error.message;
    details = error.details;
  }
  // Handle specific error types
  else if (error.name === 'ValidationError') {
    statusCode = 400;
    errorCode = 'VALIDATION_ERROR';
    errorMessage = error.message;
  }
  else if (error.name === 'SyntaxError' && 'body' in error) {
    // JSON parsing error
    statusCode = 400;
    errorCode = 'INVALID_JSON';
    errorMessage = 'Invalid JSON in request body';
  }

  // Send error response
  const response: any = {
    success: false,
    error: errorMessage,
    code: errorCode
  };

  if (details) {
    response.details = details;
  }

  // In development, include stack trace
  if (process.env.NODE_ENV === 'development' && error.stack) {
    response.stack = error.stack;
  }

  res.status(statusCode).json(response);
}

/**
 * Handle 404 Not Found errors
 */
export function notFoundHandler(req: Request, res: Response, next: NextFunction): void {
  const error = new AppError(
    `Route ${req.method} ${req.originalUrl} not found`,
    404,
    'ROUTE_NOT_FOUND'
  );
  next(error);
}

/**
 * Async handler wrapper to catch errors in async route handlers
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
