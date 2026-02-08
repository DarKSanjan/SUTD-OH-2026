import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import express, { Request, Response, NextFunction } from 'express';
import { errorHandler, notFoundHandler, asyncHandler, AppError } from '../errorHandler';
import { validateBody, sanitizeBody } from '../validation';
import { requestLogger } from '../logger';

describe('Error Handling Integration', () => {
  let app: express.Application;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use(requestLogger);

    // Test route with validation
    app.post(
      '/test/validate',
      sanitizeBody(['field']),
      validateBody({
        field: {
          type: 'string',
          required: true,
          minLength: 3
        }
      }),
      asyncHandler(async (req: Request, res: Response) => {
        res.json({ success: true, data: req.body.field });
      })
    );

    // Test route that throws AppError
    app.get('/test/app-error', asyncHandler(async (req: Request, res: Response) => {
      throw new AppError('Test app error', 404, 'TEST_ERROR', { detail: 'test' });
    }));

    // Test route that throws generic error
    app.get('/test/generic-error', asyncHandler(async (req: Request, res: Response) => {
      throw new Error('Generic error');
    }));

    // Test route that succeeds
    app.get('/test/success', asyncHandler(async (req: Request, res: Response) => {
      res.json({ success: true });
    }));

    // Error handling middleware
    app.use(notFoundHandler);
    app.use(errorHandler);
  });

  describe('Validation Middleware Integration', () => {
    it('should validate and sanitize input successfully', async () => {
      const response = await request(app)
        .post('/test/validate')
        .send({ field: '  test  ' })
        .expect(200);

      expect(response.body).toEqual({ success: true, data: 'test' });
    });

    it('should return validation error for missing field', async () => {
      const response = await request(app)
        .post('/test/validate')
        .send({})
        .expect(400);

      expect(response.body).toMatchObject({
        success: false,
        code: 'VALIDATION_ERROR',
        error: 'field is required'
      });
    });

    it('should return validation error for short field', async () => {
      const response = await request(app)
        .post('/test/validate')
        .send({ field: 'ab' })
        .expect(400);

      expect(response.body).toMatchObject({
        success: false,
        code: 'VALIDATION_ERROR',
        error: 'field must be at least 3 characters'
      });
    });

    it('should return validation error for whitespace-only field', async () => {
      const response = await request(app)
        .post('/test/validate')
        .send({ field: '   ' })
        .expect(400);

      expect(response.body).toMatchObject({
        success: false,
        code: 'VALIDATION_ERROR'
      });
    });
  });

  describe('Error Handler Integration', () => {
    it('should handle AppError correctly', async () => {
      const response = await request(app)
        .get('/test/app-error')
        .expect(404);

      expect(response.body).toEqual({
        success: false,
        error: 'Test app error',
        code: 'TEST_ERROR',
        details: { detail: 'test' }
      });
    });

    it('should handle generic error as 500', async () => {
      const response = await request(app)
        .get('/test/generic-error')
        .expect(500);

      expect(response.body).toEqual({
        success: false,
        error: 'Internal server error',
        code: 'INTERNAL_ERROR'
      });
    });

    it('should handle 404 for non-existent routes', async () => {
      const response = await request(app)
        .get('/non-existent-route')
        .expect(404);

      expect(response.body).toMatchObject({
        success: false,
        code: 'ROUTE_NOT_FOUND'
      });
      expect(response.body.error).toContain('GET /non-existent-route not found');
    });

    it('should handle invalid JSON', async () => {
      const response = await request(app)
        .post('/test/validate')
        .set('Content-Type', 'application/json')
        .send('{ invalid json')
        .expect(400);

      expect(response.body).toMatchObject({
        success: false,
        code: 'INVALID_JSON',
        error: 'Invalid JSON in request body'
      });
    });
  });

  describe('Async Handler Integration', () => {
    it('should handle successful async operations', async () => {
      const response = await request(app)
        .get('/test/success')
        .expect(200);

      expect(response.body).toEqual({ success: true });
    });

    it('should catch async errors and pass to error handler', async () => {
      const response = await request(app)
        .get('/test/generic-error')
        .expect(500);

      expect(response.body.success).toBe(false);
    });
  });

  describe('Request Logger Integration', () => {
    it('should log requests without affecting response', async () => {
      const response = await request(app)
        .get('/test/success')
        .expect(200);

      expect(response.body).toEqual({ success: true });
    });
  });
});
