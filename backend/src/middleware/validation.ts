import { Request, Response, NextFunction } from 'express';
import { AppError } from './errorHandler';

/**
 * Validation schema type
 */
type ValidationSchema = {
  [key: string]: {
    type: 'string' | 'number' | 'boolean' | 'object' | 'array';
    required?: boolean;
    enum?: any[];
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    custom?: (value: any) => boolean | string;
    errorCode?: string;
    errorMessage?: string;
  };
};

/**
 * Validate request body against a schema
 */
export function validateBody(schema: ValidationSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const body = req.body || {};

      // Check each field in the schema
      for (const [field, rules] of Object.entries(schema)) {
        const value = body[field];

        // Check if required field is missing
        if (rules.required && (value === undefined || value === null || value === '')) {
          const error = new AppError(
            rules.errorMessage || `${field} is required`,
            400,
            rules.errorCode || 'VALIDATION_ERROR'
          );
          return next(error);
        }

        // Skip validation if field is not required and not provided
        if (!rules.required && (value === undefined || value === null)) {
          continue;
        }

        // Check type
        const actualType = Array.isArray(value) ? 'array' : typeof value;
        if (actualType !== rules.type) {
          const error = new AppError(
            rules.errorMessage || `${field} must be of type ${rules.type}`,
            400,
            rules.errorCode || 'VALIDATION_ERROR'
          );
          return next(error);
        }

        // Check enum values
        if (rules.enum && !rules.enum.includes(value)) {
          const error = new AppError(
            rules.errorMessage || `${field} must be one of: ${rules.enum.join(', ')}`,
            400,
            rules.errorCode || 'VALIDATION_ERROR'
          );
          return next(error);
        }

        // Check string length
        if (rules.type === 'string' && typeof value === 'string') {
          // Check for empty or whitespace-only strings
          if (value.trim() === '') {
            const error = new AppError(
              rules.errorMessage || `${field} cannot be empty or whitespace only`,
              400,
              rules.errorCode || 'VALIDATION_ERROR'
            );
            return next(error);
          }

          if (rules.minLength && value.length < rules.minLength) {
            const error = new AppError(
              `${field} must be at least ${rules.minLength} characters`,
              400,
              'VALIDATION_ERROR'
            );
            return next(error);
          }

          if (rules.maxLength && value.length > rules.maxLength) {
            const error = new AppError(
              `${field} must be at most ${rules.maxLength} characters`,
              400,
              'VALIDATION_ERROR'
            );
            return next(error);
          }

          // Check pattern
          if (rules.pattern && !rules.pattern.test(value)) {
            const error = new AppError(
              `${field} has invalid format`,
              400,
              'VALIDATION_ERROR'
            );
            return next(error);
          }
        }

        // Custom validation
        if (rules.custom) {
          const result = rules.custom(value);
          if (result !== true) {
            const error = new AppError(
              typeof result === 'string' ? result : `${field} is invalid`,
              400,
              'VALIDATION_ERROR'
            );
            return next(error);
          }
        }
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}

/**
 * Sanitize string input by trimming whitespace
 */
export function sanitizeBody(fields: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.body) {
      return next();
    }

    for (const field of fields) {
      if (typeof req.body[field] === 'string') {
        req.body[field] = req.body[field].trim();
      }
    }

    next();
  };
}

/**
 * Validation schemas for common endpoints
 */
export const validationSchemas = {
  validateStudent: {
    studentId: {
      type: 'string' as const,
      required: true,
      minLength: 1,
      errorCode: 'MISSING_STUDENT_ID',
      errorMessage: 'Student ID is required'
    }
  },
  scanToken: {
    token: {
      type: 'string' as const,
      required: true,
      minLength: 1,
      errorCode: 'MISSING_TOKEN',
      errorMessage: 'Token is required'
    }
  },
  recordClaim: {
    token: {
      type: 'string' as const,
      required: true,
      minLength: 1,
      errorCode: 'MISSING_TOKEN',
      errorMessage: 'Token is required'
    },
    itemType: {
      type: 'string' as const,
      required: true,
      enum: ['tshirt', 'meal'],
      errorCode: 'INVALID_ITEM_TYPE',
      errorMessage: 'Item type must be "tshirt" or "meal"'
    }
  },
  recordConsent: {
    studentId: {
      type: 'string' as const,
      required: true,
      minLength: 1,
      errorCode: 'MISSING_STUDENT_ID',
      errorMessage: 'Student ID is required'
    },
    consented: {
      type: 'boolean' as const,
      required: true,
      errorCode: 'MISSING_CONSENTED',
      errorMessage: 'Consented field is required'
    }
  },
  updateDistributionStatus: {
    studentId: {
      type: 'string' as const,
      required: true,
      minLength: 1,
      errorCode: 'MISSING_STUDENT_ID',
      errorMessage: 'Student ID is required'
    },
    itemType: {
      type: 'string' as const,
      required: true,
      enum: ['tshirt', 'meal'],
      errorCode: 'INVALID_ITEM_TYPE',
      errorMessage: 'Item type must be "tshirt" or "meal"'
    },
    collected: {
      type: 'boolean' as const,
      required: true,
      errorCode: 'MISSING_COLLECTED',
      errorMessage: 'Collected field is required'
    }
  }
};
