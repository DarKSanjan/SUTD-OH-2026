import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import express, { Express } from 'express';
import validateRouter from '../validate';
import scanRouter from '../scan';
import claimRouter from '../claim';
import consentRouter from '../consent';
import pool from '../../db/config';
import StudentDAO from '../../dao/StudentDAO';
import TokenService from '../../services/TokenService';
import ClaimDAO from '../../dao/ClaimDAO';
import { Student } from '../../models/Student';
import { errorHandler, notFoundHandler } from '../../middleware/errorHandler';

/**
 * Unit tests for API endpoints
 * Tests each endpoint with valid and invalid inputs
 * Tests error responses (400, 404, 409, 500)
 * Tests response formats match specifications
 * 
 * **Validates: Requirements 2.1, 2.2, 2.3, 4.3, 4.4, 4.5, 4.6, 7.1, 7.2**
 */

describe('API Endpoints', () => {
  let app: Express;
  let testStudent: Student;
  let testToken: string;

  beforeAll(async () => {
    // Set up Express app with routes
    app = express();
    app.use(express.json());
    app.use('/api', validateRouter);
    app.use('/api', scanRouter);
    app.use('/api', claimRouter);
    app.use('/api', consentRouter);
    
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
      CREATE TABLE IF NOT EXISTS tokens (
        id SERIAL PRIMARY KEY,
        token TEXT UNIQUE NOT NULL,
        student_id TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES students(student_id)
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
      organizationDetails: 'Club: Tech Club, Involvement: Member; Club: Science Club, Involvement: Volunteer'
    };

    await StudentDAO.upsert(testStudent);
  });

  afterAll(async () => {
    // Clean up test data
    await pool.query('DROP TABLE IF EXISTS claims CASCADE');
    await pool.query('DROP TABLE IF EXISTS tokens CASCADE');
    await pool.query('DROP TABLE IF EXISTS students CASCADE');
    await pool.end();
  });

  beforeEach(async () => {
    // Clean up tokens and claims before each test
    await pool.query('DELETE FROM claims');
    await pool.query('DELETE FROM tokens');
  });

  describe('POST /api/validate', () => {
    describe('Valid inputs', () => {
      it('should validate a valid student ID and return student info with QR code', async () => {
        const response = await request(app)
          .post('/api/validate')
          .send({ studentId: 'TEST001' })
          .expect(200);

        // Check response structure
        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('student');
        expect(response.body).toHaveProperty('qrCode');
        expect(response.body).toHaveProperty('token');

        // Check student data
        expect(response.body.student).toEqual({
          studentId: 'TEST001',
          name: 'Test Student',
          tshirtSize: 'M',
          mealPreference: 'VEG',
          involvements: [
            { club: 'Tech Club', role: 'Member' },
            { club: 'Science Club', role: 'Volunteer' }
          ]
        });

        // Check QR code format (should be base64 data URL)
        expect(response.body.qrCode).toMatch(/^data:image\/png;base64,/);

        // Check token format (should be 64 character hex string)
        expect(response.body.token).toMatch(/^[a-f0-9]{64}$/);
      });

      it('should perform case-insensitive student ID validation', async () => {
        const response = await request(app)
          .post('/api/validate')
          .send({ studentId: 'test001' })
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.student.studentId).toBe('TEST001');
      });

      it('should generate unique tokens for multiple validations', async () => {
        const response1 = await request(app)
          .post('/api/validate')
          .send({ studentId: 'TEST001' })
          .expect(200);

        const response2 = await request(app)
          .post('/api/validate')
          .send({ studentId: 'TEST001' })
          .expect(200);

        expect(response1.body.token).not.toBe(response2.body.token);
      });
    });

    describe('Invalid inputs - 400 Bad Request', () => {
      it('should return 400 when studentId is missing', async () => {
        const response = await request(app)
          .post('/api/validate')
          .send({})
          .expect(400);

        expect(response.body).toEqual({
          success: false,
          error: 'Student ID is required',
          code: 'MISSING_STUDENT_ID'
        });
      });

      it('should return 400 when studentId is not a string', async () => {
        const response = await request(app)
          .post('/api/validate')
          .send({ studentId: 12345 })
          .expect(400);

        expect(response.body).toEqual({
          success: false,
          error: 'Student ID is required',
          code: 'MISSING_STUDENT_ID'
        });
      });

      it('should return 400 when studentId is null', async () => {
        const response = await request(app)
          .post('/api/validate')
          .send({ studentId: null })
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.code).toBe('MISSING_STUDENT_ID');
      });

      it('should return 400 when studentId is empty string', async () => {
        const response = await request(app)
          .post('/api/validate')
          .send({ studentId: '' })
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.code).toBe('MISSING_STUDENT_ID');
      });
    });

    describe('Not found - 404', () => {
      it('should return 404 when student ID does not exist', async () => {
        const response = await request(app)
          .post('/api/validate')
          .send({ studentId: 'NONEXISTENT' })
          .expect(404);

        expect(response.body).toEqual({
          success: false,
          error: 'Student ID not found',
          code: 'STUDENT_NOT_FOUND'
        });
      });
    });
  });

  describe('POST /api/scan', () => {
    beforeEach(async () => {
      // Create a valid token for testing
      testToken = await TokenService.storeToken('TEST001');
    });

    describe('Valid inputs', () => {
      it('should validate a valid token and return student info with claim status', async () => {
        const response = await request(app)
          .post('/api/scan')
          .send({ token: testToken })
          .expect(200);

        // Check response structure
        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('student');
        expect(response.body).toHaveProperty('claims');

        // Check student data
        expect(response.body.student).toEqual({
          studentId: 'TEST001',
          name: 'Test Student',
          tshirtSize: 'M',
          mealPreference: 'VEG',
          involvements: [
            { club: 'Tech Club', role: 'Member' },
            { club: 'Science Club', role: 'Volunteer' }
          ]
        });

        // Check claims data
        expect(response.body.claims).toEqual({
          tshirtClaimed: false,
          mealClaimed: false
        });
      });

      it('should initialize claim record if it does not exist', async () => {
        const response = await request(app)
          .post('/api/scan')
          .send({ token: testToken })
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.claims).toBeDefined();

        // Verify claim record was created in database
        const claim = await ClaimDAO.findByStudentId('TEST001');
        expect(claim).toBeDefined();
        expect(claim?.tshirtClaimed).toBe(false);
        expect(claim?.mealClaimed).toBe(false);
      });

      it('should return existing claim status when items are claimed', async () => {
        // Initialize and claim t-shirt
        await ClaimDAO.initializeForStudent('TEST001');
        await ClaimDAO.updateClaim('TEST001', 'tshirt');

        const response = await request(app)
          .post('/api/scan')
          .send({ token: testToken })
          .expect(200);

        expect(response.body.claims).toEqual({
          tshirtClaimed: true,
          mealClaimed: false
        });
      });
    });

    describe('Invalid inputs - 400 Bad Request', () => {
      it('should return 400 when token is missing', async () => {
        const response = await request(app)
          .post('/api/scan')
          .send({})
          .expect(400);

        expect(response.body).toEqual({
          success: false,
          error: 'Token is required',
          code: 'MISSING_TOKEN'
        });
      });

      it('should return 400 when token is not a string', async () => {
        const response = await request(app)
          .post('/api/scan')
          .send({ token: 12345 })
          .expect(400);

        expect(response.body).toEqual({
          success: false,
          error: 'Token is required',
          code: 'MISSING_TOKEN'
        });
      });

      it('should return 400 when token is null', async () => {
        const response = await request(app)
          .post('/api/scan')
          .send({ token: null })
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.code).toBe('MISSING_TOKEN');
      });
    });

    describe('Not found - 404', () => {
      it('should return 404 when token does not exist', async () => {
        const response = await request(app)
          .post('/api/scan')
          .send({ token: 'invalid_token_that_does_not_exist_in_database' })
          .expect(404);

        expect(response.body).toEqual({
          success: false,
          error: 'Invalid QR code',
          code: 'INVALID_TOKEN'
        });
      });

      it('should return 404 when token format is valid but not in database', async () => {
        const fakeToken = 'a'.repeat(64); // Valid format but not in DB
        const response = await request(app)
          .post('/api/scan')
          .send({ token: fakeToken })
          .expect(404);

        expect(response.body.success).toBe(false);
        expect(response.body.code).toBe('INVALID_TOKEN');
      });
    });
  });

  describe('POST /api/claim', () => {
    beforeEach(async () => {
      // Create a valid token and initialize claim record for testing
      testToken = await TokenService.storeToken('TEST001');
      await ClaimDAO.initializeForStudent('TEST001');
    });

    describe('Valid inputs', () => {
      it('should successfully claim a t-shirt', async () => {
        const response = await request(app)
          .post('/api/claim')
          .send({ token: testToken, itemType: 'tshirt' })
          .expect(200);

        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('claims');
        expect(response.body.claims).toEqual({
          tshirtClaimed: true,
          mealClaimed: false
        });

        // Verify in database
        const claim = await ClaimDAO.findByStudentId('TEST001');
        expect(claim?.tshirtClaimed).toBe(true);
        expect(claim?.mealClaimed).toBe(false);
      });

      it('should successfully claim a meal coupon', async () => {
        const response = await request(app)
          .post('/api/claim')
          .send({ token: testToken, itemType: 'meal' })
          .expect(200);

        expect(response.body).toHaveProperty('success', true);
        expect(response.body.claims).toEqual({
          tshirtClaimed: false,
          mealClaimed: true
        });

        // Verify in database
        const claim = await ClaimDAO.findByStudentId('TEST001');
        expect(claim?.tshirtClaimed).toBe(false);
        expect(claim?.mealClaimed).toBe(true);
      });

      it('should successfully claim both items separately', async () => {
        // Claim t-shirt
        const response1 = await request(app)
          .post('/api/claim')
          .send({ token: testToken, itemType: 'tshirt' })
          .expect(200);

        expect(response1.body.claims.tshirtClaimed).toBe(true);
        expect(response1.body.claims.mealClaimed).toBe(false);

        // Claim meal
        const response2 = await request(app)
          .post('/api/claim')
          .send({ token: testToken, itemType: 'meal' })
          .expect(200);

        expect(response2.body.claims.tshirtClaimed).toBe(true);
        expect(response2.body.claims.mealClaimed).toBe(true);
      });

      it('should initialize claim record if it does not exist', async () => {
        // Delete the claim record
        await pool.query('DELETE FROM claims WHERE student_id = $1', ['TEST001']);

        const response = await request(app)
          .post('/api/claim')
          .send({ token: testToken, itemType: 'tshirt' })
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.claims.tshirtClaimed).toBe(true);
      });
    });

    describe('Invalid inputs - 400 Bad Request', () => {
      it('should return 400 when token is missing', async () => {
        const response = await request(app)
          .post('/api/claim')
          .send({ itemType: 'tshirt' })
          .expect(400);

        expect(response.body).toEqual({
          success: false,
          error: 'Token is required',
          code: 'MISSING_TOKEN'
        });
      });

      it('should return 400 when itemType is missing', async () => {
        const response = await request(app)
          .post('/api/claim')
          .send({ token: testToken })
          .expect(400);

        expect(response.body).toEqual({
          success: false,
          error: 'Item type must be "tshirt" or "meal"',
          code: 'INVALID_ITEM_TYPE'
        });
      });

      it('should return 400 when itemType is invalid', async () => {
        const response = await request(app)
          .post('/api/claim')
          .send({ token: testToken, itemType: 'invalid' })
          .expect(400);

        expect(response.body).toEqual({
          success: false,
          error: 'Item type must be "tshirt" or "meal"',
          code: 'INVALID_ITEM_TYPE'
        });
      });

      it('should return 400 when token is not a string', async () => {
        const response = await request(app)
          .post('/api/claim')
          .send({ token: 12345, itemType: 'tshirt' })
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.code).toBe('MISSING_TOKEN');
      });

      it('should return 400 when itemType is not a string', async () => {
        const response = await request(app)
          .post('/api/claim')
          .send({ token: testToken, itemType: 123 })
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.code).toBe('INVALID_ITEM_TYPE');
      });
    });

    describe('Not found - 404', () => {
      it('should return 404 when token does not exist', async () => {
        const response = await request(app)
          .post('/api/claim')
          .send({ token: 'invalid_token', itemType: 'tshirt' })
          .expect(404);

        expect(response.body).toEqual({
          success: false,
          error: 'Invalid QR code',
          code: 'INVALID_TOKEN'
        });
      });
    });

    describe('Duplicate claim prevention - 409 Conflict', () => {
      it('should return 409 when attempting to claim t-shirt twice', async () => {
        // First claim should succeed
        await request(app)
          .post('/api/claim')
          .send({ token: testToken, itemType: 'tshirt' })
          .expect(200);

        // Second claim should fail with 409
        const response = await request(app)
          .post('/api/claim')
          .send({ token: testToken, itemType: 'tshirt' })
          .expect(409);

        expect(response.body).toEqual({
          success: false,
          error: 'Item already claimed',
          code: 'ALREADY_CLAIMED'
        });
      });

      it('should return 409 when attempting to claim meal twice', async () => {
        // First claim should succeed
        await request(app)
          .post('/api/claim')
          .send({ token: testToken, itemType: 'meal' })
          .expect(200);

        // Second claim should fail with 409
        const response = await request(app)
          .post('/api/claim')
          .send({ token: testToken, itemType: 'meal' })
          .expect(409);

        expect(response.body).toEqual({
          success: false,
          error: 'Item already claimed',
          code: 'ALREADY_CLAIMED'
        });
      });

      it('should allow claiming different items independently', async () => {
        // Claim t-shirt
        await request(app)
          .post('/api/claim')
          .send({ token: testToken, itemType: 'tshirt' })
          .expect(200);

        // Claiming meal should still work
        const response = await request(app)
          .post('/api/claim')
          .send({ token: testToken, itemType: 'meal' })
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.claims).toEqual({
          tshirtClaimed: true,
          mealClaimed: true
        });
      });
    });
  });

  describe('Response format validation', () => {
    beforeEach(async () => {
      testToken = await TokenService.storeToken('TEST001');
    });

    it('should return consistent error format across all endpoints', async () => {
      // Test validate endpoint error format
      const validateError = await request(app)
        .post('/api/validate')
        .send({})
        .expect(400);

      expect(validateError.body).toHaveProperty('success', false);
      expect(validateError.body).toHaveProperty('error');
      expect(validateError.body).toHaveProperty('code');

      // Test scan endpoint error format
      const scanError = await request(app)
        .post('/api/scan')
        .send({})
        .expect(400);

      expect(scanError.body).toHaveProperty('success', false);
      expect(scanError.body).toHaveProperty('error');
      expect(scanError.body).toHaveProperty('code');

      // Test claim endpoint error format
      const claimError = await request(app)
        .post('/api/claim')
        .send({})
        .expect(400);

      expect(claimError.body).toHaveProperty('success', false);
      expect(claimError.body).toHaveProperty('error');
      expect(claimError.body).toHaveProperty('code');
    });

    it('should return consistent success format for validate endpoint', async () => {
      const response = await request(app)
        .post('/api/validate')
        .send({ studentId: 'TEST001' })
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        student: {
          studentId: expect.any(String),
          name: expect.any(String),
          tshirtSize: expect.any(String),
          mealPreference: expect.any(String),
          involvements: expect.any(Array)
        },
        qrCode: expect.stringMatching(/^data:image\/png;base64,/),
        token: expect.stringMatching(/^[a-f0-9]{64}$/)
      });
    });

    it('should return consistent success format for scan endpoint', async () => {
      const response = await request(app)
        .post('/api/scan')
        .send({ token: testToken })
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        student: {
          studentId: expect.any(String),
          name: expect.any(String),
          tshirtSize: expect.any(String),
          mealPreference: expect.any(String),
          involvements: expect.any(Array)
        },
        claims: {
          tshirtClaimed: expect.any(Boolean),
          mealClaimed: expect.any(Boolean)
        }
      });
    });

    it('should return consistent success format for claim endpoint', async () => {
      await ClaimDAO.initializeForStudent('TEST001');

      const response = await request(app)
        .post('/api/claim')
        .send({ token: testToken, itemType: 'tshirt' })
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        claims: {
          tshirtClaimed: expect.any(Boolean),
          mealClaimed: expect.any(Boolean)
        }
      });
    });
  });

  describe('Edge cases', () => {
    it('should handle whitespace in student ID', async () => {
      const response = await request(app)
        .post('/api/validate')
        .send({ studentId: '  TEST001  ' })
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should handle very long invalid student IDs', async () => {
      const longId = 'A'.repeat(1000);
      const response = await request(app)
        .post('/api/validate')
        .send({ studentId: longId })
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe('STUDENT_NOT_FOUND');
    });

    it('should handle special characters in student ID', async () => {
      const response = await request(app)
        .post('/api/validate')
        .send({ studentId: 'TEST@#$%' })
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should handle concurrent claim attempts gracefully', async () => {
      // Create a fresh token for this test
      const concurrentTestToken = await TokenService.storeToken('TEST001');
      await ClaimDAO.initializeForStudent('TEST001');

      // Make two concurrent claim requests
      const [response1, response2] = await Promise.all([
        request(app)
          .post('/api/claim')
          .send({ token: concurrentTestToken, itemType: 'tshirt' }),
        request(app)
          .post('/api/claim')
          .send({ token: concurrentTestToken, itemType: 'tshirt' })
      ]);

      // One should succeed, one should fail with 409
      const statuses = [response1.status, response2.status].sort();
      expect(statuses).toEqual([200, 409]);

      // Verify only one claim was recorded
      const claim = await ClaimDAO.findByStudentId('TEST001');
      expect(claim?.tshirtClaimed).toBe(true);
    });
  });

  describe('POST /api/consent', () => {
    describe('Valid inputs', () => {
      it('should successfully record consent for a valid student ID', async () => {
        const response = await request(app)
          .post('/api/consent')
          .send({ studentId: 'TEST001', consented: true })
          .expect(200);

        expect(response.body).toEqual({
          success: true,
          message: 'Consent recorded successfully'
        });

        // Verify in database
        const student = await StudentDAO.findByStudentId('TEST001');
        expect(student?.consented).toBe(true);
      });

      it('should successfully record consent as false', async () => {
        const response = await request(app)
          .post('/api/consent')
          .send({ studentId: 'TEST001', consented: false })
          .expect(200);

        expect(response.body).toEqual({
          success: true,
          message: 'Consent recorded successfully'
        });

        // Verify in database
        const student = await StudentDAO.findByStudentId('TEST001');
        expect(student?.consented).toBe(false);
      });

      it('should update consent status when called multiple times', async () => {
        // First set to true
        await request(app)
          .post('/api/consent')
          .send({ studentId: 'TEST001', consented: true })
          .expect(200);

        let student = await StudentDAO.findByStudentId('TEST001');
        expect(student?.consented).toBe(true);

        // Then set to false
        await request(app)
          .post('/api/consent')
          .send({ studentId: 'TEST001', consented: false })
          .expect(200);

        student = await StudentDAO.findByStudentId('TEST001');
        expect(student?.consented).toBe(false);
      });

      it('should perform case-insensitive student ID lookup', async () => {
        const response = await request(app)
          .post('/api/consent')
          .send({ studentId: 'test001', consented: true })
          .expect(200);

        expect(response.body.success).toBe(true);

        // Verify in database
        const student = await StudentDAO.findByStudentId('TEST001');
        expect(student?.consented).toBe(true);
      });

      it('should handle whitespace in student ID', async () => {
        const response = await request(app)
          .post('/api/consent')
          .send({ studentId: '  TEST001  ', consented: true })
          .expect(200);

        expect(response.body.success).toBe(true);
      });
    });

    describe('Invalid inputs - 400 Bad Request', () => {
      it('should return 400 when studentId is missing', async () => {
        const response = await request(app)
          .post('/api/consent')
          .send({ consented: true })
          .expect(400);

        expect(response.body).toEqual({
          success: false,
          error: 'Student ID is required',
          code: 'MISSING_STUDENT_ID'
        });
      });

      it('should return 400 when consented field is missing', async () => {
        const response = await request(app)
          .post('/api/consent')
          .send({ studentId: 'TEST001' })
          .expect(400);

        expect(response.body).toEqual({
          success: false,
          error: 'Consented field is required',
          code: 'MISSING_CONSENTED'
        });
      });

      it('should return 400 when studentId is not a string', async () => {
        const response = await request(app)
          .post('/api/consent')
          .send({ studentId: 12345, consented: true })
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.code).toBe('MISSING_STUDENT_ID');
      });

      it('should return 400 when consented is not a boolean', async () => {
        const response = await request(app)
          .post('/api/consent')
          .send({ studentId: 'TEST001', consented: 'yes' })
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.code).toBe('MISSING_CONSENTED');
      });

      it('should return 400 when studentId is null', async () => {
        const response = await request(app)
          .post('/api/consent')
          .send({ studentId: null, consented: true })
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.code).toBe('MISSING_STUDENT_ID');
      });

      it('should return 400 when consented is null', async () => {
        const response = await request(app)
          .post('/api/consent')
          .send({ studentId: 'TEST001', consented: null })
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.code).toBe('MISSING_CONSENTED');
      });

      it('should return 400 when studentId is empty string', async () => {
        const response = await request(app)
          .post('/api/consent')
          .send({ studentId: '', consented: true })
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.code).toBe('MISSING_STUDENT_ID');
      });
    });

    describe('Not found - 404', () => {
      it('should return 404 when student ID does not exist', async () => {
        const response = await request(app)
          .post('/api/consent')
          .send({ studentId: 'NONEXISTENT', consented: true })
          .expect(404);

        expect(response.body).toEqual({
          success: false,
          error: 'Student ID not found',
          code: 'STUDENT_NOT_FOUND'
        });
      });
    });
  });
});
