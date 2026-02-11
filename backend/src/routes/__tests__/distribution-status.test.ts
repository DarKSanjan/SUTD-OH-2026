import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import express, { Express } from 'express';
import distributionStatusRouter from '../distribution-status';
import pool from '../../db/config';
import StudentDAO from '../../dao/StudentDAO';
import ClaimDAO from '../../dao/ClaimDAO';
import { Student } from '../../models/Student';
import { errorHandler, notFoundHandler } from '../../middleware/errorHandler';

/**
 * Unit tests for PATCH /api/distribution-status endpoint
 * Tests bidirectional distribution status updates (checking and unchecking)
 * Tests error responses (400, 404)
 * Tests response formats match specifications
 * 
 * **Validates: Requirements 7.1, 7.2, 7.3**
 */

describe('PATCH /api/distribution-status', () => {
  let app: Express;
  let testStudent: Student;

  beforeAll(async () => {
    // Set up Express app with routes
    app = express();
    app.use(express.json());
    app.use('/api', distributionStatusRouter);
    
    // Add error handling middleware
    app.use(notFoundHandler);
    app.use(errorHandler);

    // Create test database schema
    await pool.query(`
      CREATE TABLE IF NOT EXISTS students (
        id SERIAL PRIMARY KEY,
        student_id TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        tshirt_size TEXT NOT NULL,
        meal_preference TEXT NOT NULL,
        organization_details TEXT,
        consented BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS claims (
        id SERIAL PRIMARY KEY,
        student_id TEXT NOT NULL,
        tshirt_claimed BOOLEAN DEFAULT FALSE,
        meal_claimed BOOLEAN DEFAULT FALSE,
        tshirt_claimed_at TIMESTAMP,
        meal_claimed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES students(student_id),
        UNIQUE(student_id)
      );
    `);

    // Insert test student
    testStudent = {
      studentId: 'TEST001',
      name: 'Test Student',
      tshirtSize: 'M',
      mealPreference: 'VEG',
      organizationDetails: 'Club: Tech Club, Involvement: Member'
    };

    await StudentDAO.upsert(testStudent);
  });

  afterAll(async () => {
    // Clean up test data
    await pool.query('DROP TABLE IF EXISTS claims CASCADE');
    await pool.query('DROP TABLE IF EXISTS students CASCADE');
    await pool.end();
  });

  beforeEach(async () => {
    // Clean up claims before each test
    await pool.query('DELETE FROM claims');
  });

  describe('Valid inputs - Checking status', () => {
    it('should successfully check tshirt status', async () => {
      const response = await request(app)
        .patch('/api/distribution-status')
        .send({ 
          studentId: 'TEST001', 
          itemType: 'tshirt', 
          collected: true 
        })
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        claim: {
          studentId: 'TEST001',
          tshirtClaimed: true,
          mealClaimed: false
        }
      });

      // Verify in database
      const claim = await ClaimDAO.findByStudentId('TEST001');
      expect(claim?.tshirtClaimed).toBe(true);
      expect(claim?.mealClaimed).toBe(false);
    });

    it('should successfully check meal status', async () => {
      const response = await request(app)
        .patch('/api/distribution-status')
        .send({ 
          studentId: 'TEST001', 
          itemType: 'meal', 
          collected: true 
        })
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        claim: {
          studentId: 'TEST001',
          tshirtClaimed: false,
          mealClaimed: true
        }
      });

      // Verify in database
      const claim = await ClaimDAO.findByStudentId('TEST001');
      expect(claim?.tshirtClaimed).toBe(false);
      expect(claim?.mealClaimed).toBe(true);
    });

    it('should initialize claim record if it does not exist', async () => {
      const response = await request(app)
        .patch('/api/distribution-status')
        .send({ 
          studentId: 'TEST001', 
          itemType: 'tshirt', 
          collected: true 
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.claim.tshirtClaimed).toBe(true);

      // Verify claim record was created in database
      const claim = await ClaimDAO.findByStudentId('TEST001');
      expect(claim).toBeDefined();
    });
  });

  describe('Valid inputs - Unchecking status', () => {
    beforeEach(async () => {
      // Initialize claim record with both items claimed
      await ClaimDAO.initializeForStudent('TEST001');
      await ClaimDAO.updateDistributionStatus('TEST001', 'tshirt', true);
      await ClaimDAO.updateDistributionStatus('TEST001', 'meal', true);
    });

    it('should successfully uncheck tshirt status', async () => {
      const response = await request(app)
        .patch('/api/distribution-status')
        .send({ 
          studentId: 'TEST001', 
          itemType: 'tshirt', 
          collected: false 
        })
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        claim: {
          studentId: 'TEST001',
          tshirtClaimed: false,
          mealClaimed: true
        }
      });

      // Verify in database
      const claim = await ClaimDAO.findByStudentId('TEST001');
      expect(claim?.tshirtClaimed).toBe(false);
      expect(claim?.mealClaimed).toBe(true);
    });

    it('should successfully uncheck meal status', async () => {
      const response = await request(app)
        .patch('/api/distribution-status')
        .send({ 
          studentId: 'TEST001', 
          itemType: 'meal', 
          collected: false 
        })
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        claim: {
          studentId: 'TEST001',
          tshirtClaimed: true,
          mealClaimed: false
        }
      });

      // Verify in database
      const claim = await ClaimDAO.findByStudentId('TEST001');
      expect(claim?.tshirtClaimed).toBe(true);
      expect(claim?.mealClaimed).toBe(false);
    });

    it('should successfully uncheck both items', async () => {
      // Uncheck tshirt
      await request(app)
        .patch('/api/distribution-status')
        .send({ 
          studentId: 'TEST001', 
          itemType: 'tshirt', 
          collected: false 
        })
        .expect(200);

      // Uncheck meal
      const response = await request(app)
        .patch('/api/distribution-status')
        .send({ 
          studentId: 'TEST001', 
          itemType: 'meal', 
          collected: false 
        })
        .expect(200);

      expect(response.body.claim).toEqual({
        studentId: 'TEST001',
        tshirtClaimed: false,
        mealClaimed: false
      });

      // Verify in database
      const claim = await ClaimDAO.findByStudentId('TEST001');
      expect(claim?.tshirtClaimed).toBe(false);
      expect(claim?.mealClaimed).toBe(false);
    });
  });

  describe('Bidirectional toggle behavior', () => {
    it('should toggle tshirt status multiple times', async () => {
      // Check
      let response = await request(app)
        .patch('/api/distribution-status')
        .send({ 
          studentId: 'TEST001', 
          itemType: 'tshirt', 
          collected: true 
        })
        .expect(200);

      expect(response.body.claim.tshirtClaimed).toBe(true);

      // Uncheck
      response = await request(app)
        .patch('/api/distribution-status')
        .send({ 
          studentId: 'TEST001', 
          itemType: 'tshirt', 
          collected: false 
        })
        .expect(200);

      expect(response.body.claim.tshirtClaimed).toBe(false);

      // Check again
      response = await request(app)
        .patch('/api/distribution-status')
        .send({ 
          studentId: 'TEST001', 
          itemType: 'tshirt', 
          collected: true 
        })
        .expect(200);

      expect(response.body.claim.tshirtClaimed).toBe(true);
    });

    it('should toggle meal status multiple times', async () => {
      // Check
      let response = await request(app)
        .patch('/api/distribution-status')
        .send({ 
          studentId: 'TEST001', 
          itemType: 'meal', 
          collected: true 
        })
        .expect(200);

      expect(response.body.claim.mealClaimed).toBe(true);

      // Uncheck
      response = await request(app)
        .patch('/api/distribution-status')
        .send({ 
          studentId: 'TEST001', 
          itemType: 'meal', 
          collected: false 
        })
        .expect(200);

      expect(response.body.claim.mealClaimed).toBe(false);

      // Check again
      response = await request(app)
        .patch('/api/distribution-status')
        .send({ 
          studentId: 'TEST001', 
          itemType: 'meal', 
          collected: true 
        })
        .expect(200);

      expect(response.body.claim.mealClaimed).toBe(true);
    });

    it('should handle independent status updates for different items', async () => {
      // Check tshirt
      await request(app)
        .patch('/api/distribution-status')
        .send({ 
          studentId: 'TEST001', 
          itemType: 'tshirt', 
          collected: true 
        })
        .expect(200);

      // Check meal
      await request(app)
        .patch('/api/distribution-status')
        .send({ 
          studentId: 'TEST001', 
          itemType: 'meal', 
          collected: true 
        })
        .expect(200);

      // Uncheck tshirt (meal should remain checked)
      const response = await request(app)
        .patch('/api/distribution-status')
        .send({ 
          studentId: 'TEST001', 
          itemType: 'tshirt', 
          collected: false 
        })
        .expect(200);

      expect(response.body.claim).toEqual({
        studentId: 'TEST001',
        tshirtClaimed: false,
        mealClaimed: true
      });
    });
  });

  describe('Invalid inputs - 400 Bad Request', () => {
    it('should return 400 when studentId is missing', async () => {
      const response = await request(app)
        .patch('/api/distribution-status')
        .send({ itemType: 'tshirt', collected: true })
        .expect(400);

      expect(response.body).toEqual({
        success: false,
        error: 'Student ID is required',
        code: 'MISSING_STUDENT_ID'
      });
    });

    it('should return 400 when itemType is missing', async () => {
      const response = await request(app)
        .patch('/api/distribution-status')
        .send({ studentId: 'TEST001', collected: true })
        .expect(400);

      expect(response.body).toEqual({
        success: false,
        error: 'Item type must be "tshirt" or "meal"',
        code: 'INVALID_ITEM_TYPE'
      });
    });

    it('should return 400 when collected field is missing', async () => {
      const response = await request(app)
        .patch('/api/distribution-status')
        .send({ studentId: 'TEST001', itemType: 'tshirt' })
        .expect(400);

      expect(response.body).toEqual({
        success: false,
        error: 'Collected field is required',
        code: 'MISSING_COLLECTED'
      });
    });

    it('should return 400 when itemType is invalid', async () => {
      const response = await request(app)
        .patch('/api/distribution-status')
        .send({ studentId: 'TEST001', itemType: 'invalid', collected: true })
        .expect(400);

      expect(response.body).toEqual({
        success: false,
        error: 'Item type must be "tshirt" or "meal"',
        code: 'INVALID_ITEM_TYPE'
      });
    });

    it('should return 400 when studentId is not a string', async () => {
      const response = await request(app)
        .patch('/api/distribution-status')
        .send({ studentId: 12345, itemType: 'tshirt', collected: true })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe('MISSING_STUDENT_ID');
    });

    it('should return 400 when itemType is not a string', async () => {
      const response = await request(app)
        .patch('/api/distribution-status')
        .send({ studentId: 'TEST001', itemType: 123, collected: true })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe('INVALID_ITEM_TYPE');
    });

    it('should return 400 when collected is not a boolean', async () => {
      const response = await request(app)
        .patch('/api/distribution-status')
        .send({ studentId: 'TEST001', itemType: 'tshirt', collected: 'yes' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe('MISSING_COLLECTED');
    });

    it('should return 400 when studentId is null', async () => {
      const response = await request(app)
        .patch('/api/distribution-status')
        .send({ studentId: null, itemType: 'tshirt', collected: true })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe('MISSING_STUDENT_ID');
    });

    it('should return 400 when studentId is empty string', async () => {
      const response = await request(app)
        .patch('/api/distribution-status')
        .send({ studentId: '', itemType: 'tshirt', collected: true })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe('MISSING_STUDENT_ID');
    });
  });

  describe('Not found - 404', () => {
    it('should return 404 when student ID does not exist', async () => {
      const response = await request(app)
        .patch('/api/distribution-status')
        .send({ 
          studentId: 'NONEXISTENT', 
          itemType: 'tshirt', 
          collected: true 
        })
        .expect(404);

      expect(response.body).toEqual({
        success: false,
        error: 'Student not found',
        code: 'STUDENT_NOT_FOUND'
      });
    });
  });

  describe('Edge cases', () => {
    it('should handle whitespace in student ID', async () => {
      const response = await request(app)
        .patch('/api/distribution-status')
        .send({ 
          studentId: '  TEST001  ', 
          itemType: 'tshirt', 
          collected: true 
        })
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should perform case-insensitive student ID lookup', async () => {
      const response = await request(app)
        .patch('/api/distribution-status')
        .send({ 
          studentId: 'test001', 
          itemType: 'tshirt', 
          collected: true 
        })
        .expect(200);

      expect(response.body.success).toBe(true);

      // Verify in database
      const claim = await ClaimDAO.findByStudentId('TEST001');
      expect(claim?.tshirtClaimed).toBe(true);
    });

    it('should handle setting status to same value (idempotent)', async () => {
      // Set to true
      await request(app)
        .patch('/api/distribution-status')
        .send({ 
          studentId: 'TEST001', 
          itemType: 'tshirt', 
          collected: true 
        })
        .expect(200);

      // Set to true again
      const response = await request(app)
        .patch('/api/distribution-status')
        .send({ 
          studentId: 'TEST001', 
          itemType: 'tshirt', 
          collected: true 
        })
        .expect(200);

      expect(response.body.claim.tshirtClaimed).toBe(true);

      // Verify in database
      const claim = await ClaimDAO.findByStudentId('TEST001');
      expect(claim?.tshirtClaimed).toBe(true);
    });
  });

  describe('Response format validation', () => {
    it('should return consistent success format', async () => {
      const response = await request(app)
        .patch('/api/distribution-status')
        .send({ 
          studentId: 'TEST001', 
          itemType: 'tshirt', 
          collected: true 
        })
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        claim: {
          studentId: expect.any(String),
          tshirtClaimed: expect.any(Boolean),
          mealClaimed: expect.any(Boolean)
        }
      });
    });

    it('should return consistent error format', async () => {
      const response = await request(app)
        .patch('/api/distribution-status')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
      expect(response.body).toHaveProperty('code');
    });
  });
});
