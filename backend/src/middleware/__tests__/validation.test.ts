import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import { validateBody, sanitizeBody, validationSchemas } from '../validation';
import { AppError } from '../errorHandler';

describe('validateBody', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {
      body: {}
    };
    mockRes = {};
    mockNext = vi.fn();
  });

  it('should pass validation for valid input', () => {
    mockReq.body = { studentId: 'ABC123' };
    
    const middleware = validateBody(validationSchemas.validateStudent);
    middleware(mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalledWith();
  });

  it('should pass error to next for missing required field', () => {
    mockReq.body = {};
    
    const middleware = validateBody(validationSchemas.validateStudent);
    middleware(mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalled();
    const error = mockNext.mock.calls[0][0];
    expect(error).toBeInstanceOf(AppError);
    expect((error as AppError).statusCode).toBe(400);
    expect((error as AppError).code).toBe('MISSING_STUDENT_ID');
    expect((error as AppError).message).toBe('Student ID is required');
  });

  it('should pass error to next for wrong type', () => {
    mockReq.body = { studentId: 123 };
    
    const middleware = validateBody(validationSchemas.validateStudent);
    middleware(mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalled();
    const error = mockNext.mock.calls[0][0];
    expect(error).toBeInstanceOf(AppError);
    expect((error as AppError).message).toBe('Student ID is required');
  });

  it('should pass error to next for empty string', () => {
    mockReq.body = { studentId: '' };
    
    const middleware = validateBody(validationSchemas.validateStudent);
    middleware(mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalled();
    const error = mockNext.mock.calls[0][0];
    expect(error).toBeInstanceOf(AppError);
  });

  it('should pass error to next for whitespace-only string', () => {
    mockReq.body = { studentId: '   ' };
    
    const middleware = validateBody(validationSchemas.validateStudent);
    middleware(mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalled();
    const error = mockNext.mock.calls[0][0];
    expect(error).toBeInstanceOf(AppError);
    expect((error as AppError).message).toBe('Student ID is required');
  });

  it('should validate enum values', () => {
    mockReq.body = { token: 'abc123', itemType: 'invalid' };
    
    const middleware = validateBody(validationSchemas.recordClaim);
    middleware(mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalled();
    const error = mockNext.mock.calls[0][0];
    expect(error).toBeInstanceOf(AppError);
    expect((error as AppError).message).toBe('Item type must be "tshirt" or "meal"');
  });

  it('should pass validation for valid enum value', () => {
    mockReq.body = { token: 'abc123', itemType: 'tshirt' };
    
    const middleware = validateBody(validationSchemas.recordClaim);
    middleware(mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalledWith();
  });

  it('should validate minLength', () => {
    const schema = {
      field: {
        type: 'string' as const,
        required: true,
        minLength: 5
      }
    };

    mockReq.body = { field: 'abc' };
    
    const middleware = validateBody(schema);
    middleware(mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalled();
    const error = mockNext.mock.calls[0][0];
    expect(error).toBeInstanceOf(AppError);
    expect((error as AppError).message).toBe('field must be at least 5 characters');
  });

  it('should validate maxLength', () => {
    const schema = {
      field: {
        type: 'string' as const,
        required: true,
        maxLength: 5
      }
    };

    mockReq.body = { field: 'abcdefgh' };
    
    const middleware = validateBody(schema);
    middleware(mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalled();
    const error = mockNext.mock.calls[0][0];
    expect(error).toBeInstanceOf(AppError);
    expect((error as AppError).message).toBe('field must be at most 5 characters');
  });

  it('should validate pattern', () => {
    const schema = {
      field: {
        type: 'string' as const,
        required: true,
        pattern: /^[A-Z]+$/
      }
    };

    mockReq.body = { field: 'abc123' };
    
    const middleware = validateBody(schema);
    middleware(mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalled();
    const error = mockNext.mock.calls[0][0];
    expect(error).toBeInstanceOf(AppError);
    expect((error as AppError).message).toBe('field has invalid format');
  });

  it('should skip validation for optional missing fields', () => {
    const schema = {
      optionalField: {
        type: 'string' as const,
        required: false
      }
    };

    mockReq.body = {};
    
    const middleware = validateBody(schema);
    middleware(mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalledWith();
  });

  it('should validate custom function', () => {
    const schema = {
      field: {
        type: 'string' as const,
        required: true,
        custom: (value: string) => value.startsWith('test') || 'Must start with test'
      }
    };

    mockReq.body = { field: 'invalid' };
    
    const middleware = validateBody(schema);
    middleware(mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalled();
    const error = mockNext.mock.calls[0][0];
    expect(error).toBeInstanceOf(AppError);
    expect((error as AppError).message).toBe('Must start with test');
  });

  it('should return first validation error encountered', () => {
    const schema = {
      field1: {
        type: 'string' as const,
        required: true
      },
      field2: {
        type: 'number' as const,
        required: true
      }
    };

    mockReq.body = {};
    
    const middleware = validateBody(schema);
    middleware(mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalled();
    const error = mockNext.mock.calls[0][0];
    expect(error).toBeInstanceOf(AppError);
    // Should return first error encountered
    expect((error as AppError).message).toBe('field1 is required');
  });
});

describe('sanitizeBody', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {
      body: {}
    };
    mockRes = {};
    mockNext = vi.fn();
  });

  it('should trim whitespace from specified fields', () => {
    mockReq.body = { studentId: '  ABC123  ', name: 'John' };
    
    const middleware = sanitizeBody(['studentId']);
    middleware(mockReq as Request, mockRes as Response, mockNext);

    expect(mockReq.body.studentId).toBe('ABC123');
    expect(mockReq.body.name).toBe('John');
    expect(mockNext).toHaveBeenCalledWith();
  });

  it('should handle multiple fields', () => {
    mockReq.body = { field1: '  value1  ', field2: '  value2  ' };
    
    const middleware = sanitizeBody(['field1', 'field2']);
    middleware(mockReq as Request, mockRes as Response, mockNext);

    expect(mockReq.body.field1).toBe('value1');
    expect(mockReq.body.field2).toBe('value2');
  });

  it('should handle missing body', () => {
    mockReq.body = undefined;
    
    const middleware = sanitizeBody(['field']);
    middleware(mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalledWith();
  });

  it('should handle non-string fields', () => {
    mockReq.body = { field1: 123, field2: '  value  ' };
    
    const middleware = sanitizeBody(['field1', 'field2']);
    middleware(mockReq as Request, mockRes as Response, mockNext);

    expect(mockReq.body.field1).toBe(123);
    expect(mockReq.body.field2).toBe('value');
  });

  it('should handle missing fields', () => {
    mockReq.body = { field1: '  value  ' };
    
    const middleware = sanitizeBody(['field1', 'field2']);
    middleware(mockReq as Request, mockRes as Response, mockNext);

    expect(mockReq.body.field1).toBe('value');
    expect(mockReq.body.field2).toBeUndefined();
  });
});

describe('validationSchemas', () => {
  it('should have validateStudent schema', () => {
    expect(validationSchemas.validateStudent).toBeDefined();
    expect(validationSchemas.validateStudent.studentId).toBeDefined();
    expect(validationSchemas.validateStudent.studentId.type).toBe('string');
    expect(validationSchemas.validateStudent.studentId.required).toBe(true);
  });

  it('should have scanToken schema', () => {
    expect(validationSchemas.scanToken).toBeDefined();
    expect(validationSchemas.scanToken.token).toBeDefined();
    expect(validationSchemas.scanToken.token.type).toBe('string');
    expect(validationSchemas.scanToken.token.required).toBe(true);
  });

  it('should have recordClaim schema', () => {
    expect(validationSchemas.recordClaim).toBeDefined();
    expect(validationSchemas.recordClaim.token).toBeDefined();
    expect(validationSchemas.recordClaim.itemType).toBeDefined();
    expect(validationSchemas.recordClaim.itemType.enum).toEqual(['tshirt', 'meal']);
  });
});
