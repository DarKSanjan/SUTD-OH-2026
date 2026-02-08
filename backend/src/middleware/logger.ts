import { Request, Response, NextFunction } from 'express';

/**
 * Request logging middleware
 * Logs all incoming requests with timestamp
 */
export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.originalUrl || req.url;
  const ip = req.ip || req.socket.remoteAddress;

  console.log(`[${timestamp}] ${method} ${url} - IP: ${ip}`);

  // Log response when it finishes
  const startTime = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const statusCode = res.statusCode;
    console.log(`[${timestamp}] ${method} ${url} - ${statusCode} - ${duration}ms`);
  });

  next();
}

/**
 * Log info message with timestamp
 */
export function logInfo(message: string, data?: any): void {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] INFO: ${message}`, data || '');
}

/**
 * Log warning message with timestamp
 */
export function logWarning(message: string, data?: any): void {
  const timestamp = new Date().toISOString();
  console.warn(`[${timestamp}] WARNING: ${message}`, data || '');
}

/**
 * Log error message with timestamp
 */
export function logError(message: string, error?: Error | any): void {
  const timestamp = new Date().toISOString();
  console.error(`[${timestamp}] ERROR: ${message}`, {
    message: error?.message,
    stack: error?.stack,
    ...error
  });
}
