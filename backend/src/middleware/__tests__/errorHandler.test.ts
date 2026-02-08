import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import { errorHandler, notFoundHandler, asyncHandler, AppError } from '../errorHandler';

describe('AppError', () => {
  it('should create an AppError with all properties', () => {
    const error = new AppError('Test error', 400, 'TEST_ERROR', { field: 'test' });
    
    expect(error.message).toBe('Test error');
    expect(error.statusCode).toBe(400);
    expect(error.code).toBe('TEST_ERROR');
    expect(error.details).toEqual({ field: 'test' });
    expect(error.isOperational).toBe(true);
  });

  it('should create an AppError without details', () => {
    const error = new AppError('Test error', 404, 'NOT_FOUND');
    
    expect(error.message).toBe('Test error');
    expect(error.statusCode).toBe(404);
    expect(error.code).toBe('NOT_FOUND');
    expect(error.details).toBeUndefined();
  });
});

describe('errorHandler', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;
  let consoleErrorSpy: any;

  beforeEach(() => {
    mockReq = {
      method: 'POST',
      originalUrl: '/api/test',
      url: '/api/test',
      ip: '127.0.0.1',
      socket: { remoteAddress: '127.0.0.1' } as any
    };

    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis()
    };

    mockNext = vi.fn();

    // Spy on console.error
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('should handle AppError with correct status and response', () => {
    const error = new AppError('Student not found', 404, 'STUDENT_NOT_FOUND');
    
    errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(404);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: false,
      error: 'Student not found',
      code: 'STUDENT_NOT_FOUND'
    });
    expect(consoleErrorSpy).toHaveBeenCalled();
  });

  it('should handle AppError with details', () => {
    const error = new AppError(
      'Validation failed',
      400,
      'VALIDATION_ERROR',
      { errors: ['Field is required'] }
    );
    
    errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: false,
      error: 'Validation failed',
      code: 'VALIDATION_ERROR',
      details: { errors: ['Field is required'] }
    });
  });

  it('should handle generic Error as 500 Internal Server Error', () => {
    const error = new Error('Something went wrong');
    
    errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: false,
      error: 'Internal server error',
      code: 'INTERNAL_ERROR'
    });
  });

  it('should handle ValidationError', () => {
    const error = new Error('Invalid input');
    error.name = 'ValidationError';
    
    errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: false,
      error: 'Invalid input',
      code: 'VALIDATION_ERROR'
    });
  });

  it('should handle JSON SyntaxError', () => {
    const error = new SyntaxError('Unexpected token');
    (error as any).body = '{ invalid json';
    
    errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: false,
      error: 'Invalid JSON in request body',
      code: 'INVALID_JSON'
    });
  });

  it('should log error with timestamp and context', () => {
    const error = new AppError('Test error', 400, 'TEST_ERROR');
    
    errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

    expect(consoleErrorSpy).toHaveBeenCalled();
    const logCall = consoleErrorSpy.mock.calls[0];
    expect(logCall[0]).toMatch(/\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\] ERROR:/);
  });
});

describe('notFoundHandler', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {
      method: 'GET',
      originalUrl: '/api/nonexistent'
    };

    mockRes = {};
    mockNext = vi.fn();
  });

  it('should create AppError for 404 routes', () => {
    notFoundHandler(mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalled();
    const error = mockNext.mock.calls[0][0];
    expect(error).toBeInstanceOf(AppError);
    expect(error.statusCode).toBe(404);
    expect(error.code).toBe('ROUTE_NOT_FOUND');
    expect(error.message).toContain('GET /api/nonexistent not found');
  });
});

describe('asyncHandler', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {};
    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis()
    };
    mockNext = vi.fn();
  });

  it('should handle successful async function', async () => {
    const asyncFn = async (req: Request, res: Response) => {
      res.status(200).json({ success: true });
    };

    const wrappedFn = asyncHandler(asyncFn);
    await wrappedFn(mockReq as Request, mockRes as Response, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith({ success: true });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should catch errors and pass to next', async () => {
    const error = new Error('Async error');
    const asyncFn = async () => {
      throw error;
    };

    const wrappedFn = asyncHandler(asyncFn);
    await wrappedFn(mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalledWith(error);
  });

  it('should catch AppError and pass to next', async () => {
    const error = new AppError('Not found', 404, 'NOT_FOUND');
    const asyncFn = async () => {
      throw error;
    };

    const wrappedFn = asyncHandler(asyncFn);
    await wrappedFn(mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalledWith(error);
  });
});
