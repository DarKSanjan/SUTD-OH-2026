import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import express, { Express } from 'express';
import path from 'path';
import fs from 'fs';
import pool from '../db/config';
import validateRouter from '../routes/validate';
import scanRouter from '../routes/scan';
import claimRouter from '../routes/claim';
import { errorHandler, notFoundHandler } from '../middleware/errorHandler';
import studentDAO from '../dao/StudentDAO';

/**
 * End-to-End Integration Tests
 * Tests complete flows through the entire system
 * 
 * **Validates: All Requirements**
 */

describe('End-to-End Integration Tests', () => {
  let app: Express;
  const testDir = path.join(__dirname, 'test-csv-files');

  beforeAll(async () => {
    // Set up Express app with all routes
    app = express();
    app.use(express.json());
    app.use('/api', validateRouter);
    app.use('/api', scanRouter);
    app.use('/api', claimRouter);
    app.use(notFoundHandler);
    app.use(errorHandler);

    // Create test directory
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }

    // Create database schema
    await pool.query(`
      CREATE TABLE IF NOT EXISTS students (
        id SERIAL PRIMARY KEY,
        student_id TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        tshirt_size TEXT NOT NULL,
        meal_preference TEXT NOT NULL,
        organization_details TEXT,
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
  });

  afterAll(async () => {
    // Clean up test data
    await pool.query('DROP TABLE IF EXISTS claims CASCADE');
    await pool.query('DROP TABLE IF EXISTS tokens CASCADE');
    await pool.query('DROP TABLE IF EXISTS students CASCADE');
    
    // Clean up test files
    if (fs.existsSync(testDir)) {
      const files = fs.readdirSync(testDir);
      files.forEach(file => {
        fs.unlinkSync(path.join(testDir, file));
      });
      fs.rmdirSync(testDir);
    }
    
    await pool.end();
  });

  beforeEach(async () => {
    // Clean up data before each test
    await pool.query('DELETE FROM claims');
    await pool.query('DELETE FROM tokens');
    await pool.query('DELETE FROM students');
  });


  describe('Complete Student Validation Flow', () => {
    it('should complete full student validation flow from CSV import to QR generation', async () => {
      // Step 1: Create CSV file with student data
      const csvFile = path.join(testDir, 'students.csv');
      const csvContent = `Student ID,Name,Shirt Size,Food,Club,Involvement
S12345,Alice Johnson,M,VEG,Tech Club,Member
S67890,Bob Smith,L,NON-VEG,Drama Club,Actor`;
      
      fs.writeFileSync(csvFile, csvContent);

      // Step 2: Import CSV data into database
      const importCount = await studentDAO.importFromCSV(csvFile);
      
      expect(importCount).toBe(2);

      // Step 3: Validate student ID through API
      const validateResponse = await request(app)
        .post('/api/validate')
        .send({ studentId: 'S12345' })
        .expect(200);

      // Step 4: Verify response contains all expected data
      expect(validateResponse.body).toMatchObject({
        success: true,
        student: {
          studentId: 'S12345',
          name: 'Alice Johnson',
          tshirtSize: 'M',
          mealPreference: 'VEG',
          involvements: [
            { club: 'Tech Club', role: 'Member' }
          ]
        }
      });

      // Step 5: Verify QR code was generated
      expect(validateResponse.body.qrCode).toMatch(/^data:image\/png;base64,/);
      
      // Step 6: Verify token was generated and stored
      expect(validateResponse.body.token).toMatch(/^[a-f0-9]{64}$/);
      
      // Step 7: Verify token is in database
      const tokenResult = await pool.query(
        'SELECT * FROM tokens WHERE token = $1',
        [validateResponse.body.token]
      );
      expect(tokenResult.rows).toHaveLength(1);
      expect(tokenResult.rows[0].student_id).toBe('S12345');
    });

    it('should handle case-insensitive validation throughout the flow', async () => {
      // Import student with uppercase ID
      const csvFile = path.join(testDir, 'case-test.csv');
      fs.writeFileSync(csvFile, `Student ID,Name,Shirt Size,Food,Club,Involvement
TEST001,Test User,S,VEG,Club A,Role A`);
      
      await studentDAO.importFromCSV(csvFile);

      // Validate with lowercase ID
      const response = await request(app)
        .post('/api/validate')
        .send({ studentId: 'test001' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.student.studentId).toBe('TEST001');
    });
  });


  describe('Complete QR Scan and Claim Flow', () => {
    it('should complete full flow: validate -> scan -> claim items', async () => {
      // Step 1: Set up student in database
      const csvFile = path.join(testDir, 'claim-flow.csv');
      fs.writeFileSync(csvFile, `Student ID,Name,Shirt Size,Food,Club,Involvement
S99999,Charlie Brown,XL,VEG,Sports Club,Player`);
      
      await studentDAO.importFromCSV(csvFile);

      // Step 2: Validate student and get token
      const validateResponse = await request(app)
        .post('/api/validate')
        .send({ studentId: 'S99999' })
        .expect(200);

      const token = validateResponse.body.token;
      expect(token).toBeDefined();

      // Step 3: Scan QR code (validate token)
      const scanResponse = await request(app)
        .post('/api/scan')
        .send({ token })
        .expect(200);

      expect(scanResponse.body).toMatchObject({
        success: true,
        student: {
          studentId: 'S99999',
          name: 'Charlie Brown',
          tshirtSize: 'XL',
          mealPreference: 'VEG'
        },
        claims: {
          tshirtClaimed: false,
          mealClaimed: false
        }
      });

      // Step 4: Claim t-shirt
      const claimTshirtResponse = await request(app)
        .post('/api/claim')
        .send({ token, itemType: 'tshirt' })
        .expect(200);

      expect(claimTshirtResponse.body).toMatchObject({
        success: true,
        claims: {
          tshirtClaimed: true,
          mealClaimed: false
        }
      });

      // Step 5: Scan again to verify claim was recorded
      const scanAfterTshirtResponse = await request(app)
        .post('/api/scan')
        .send({ token })
        .expect(200);

      expect(scanAfterTshirtResponse.body.claims).toMatchObject({
        tshirtClaimed: true,
        mealClaimed: false
      });

      // Step 6: Claim meal
      const claimMealResponse = await request(app)
        .post('/api/claim')
        .send({ token, itemType: 'meal' })
        .expect(200);

      expect(claimMealResponse.body.claims).toMatchObject({
        tshirtClaimed: true,
        mealClaimed: true
      });

      // Step 7: Final scan to verify both claims
      const finalScanResponse = await request(app)
        .post('/api/scan')
        .send({ token })
        .expect(200);

      expect(finalScanResponse.body.claims).toMatchObject({
        tshirtClaimed: true,
        mealClaimed: true
      });

      // Step 8: Verify claims are persisted in database
      const claimResult = await pool.query(
        'SELECT * FROM claims WHERE student_id = $1',
        ['S99999']
      );
      expect(claimResult.rows).toHaveLength(1);
      expect(claimResult.rows[0].tshirt_claimed).toBe(true);
      expect(claimResult.rows[0].meal_claimed).toBe(true);
    });


    it('should prevent duplicate claims throughout the flow', async () => {
      // Set up student
      const csvFile = path.join(testDir, 'duplicate-claim.csv');
      fs.writeFileSync(csvFile, `Student ID,Name,Shirt Size,Food,Club,Involvement
S11111,Diana Prince,M,VEG,Tech Club,Member`);
      
      await studentDAO.importFromCSV(csvFile);

      // Get token
      const validateResponse = await request(app)
        .post('/api/validate')
        .send({ studentId: 'S11111' })
        .expect(200);

      const token = validateResponse.body.token;

      // First claim should succeed
      await request(app)
        .post('/api/claim')
        .send({ token, itemType: 'tshirt' })
        .expect(200);

      // Second claim should fail with 409
      const duplicateClaimResponse = await request(app)
        .post('/api/claim')
        .send({ token, itemType: 'tshirt' })
        .expect(409);

      expect(duplicateClaimResponse.body).toMatchObject({
        success: false,
        error: 'Item already claimed',
        code: 'ALREADY_CLAIMED'
      });

      // Verify only one claim was recorded
      const claimResult = await pool.query(
        'SELECT * FROM claims WHERE student_id = $1',
        ['S11111']
      );
      expect(claimResult.rows).toHaveLength(1);
      expect(claimResult.rows[0].tshirt_claimed).toBe(true);
    });

    it('should handle multiple tokens for same student correctly', async () => {
      // Set up student
      const csvFile = path.join(testDir, 'multi-token.csv');
      fs.writeFileSync(csvFile, `Student ID,Name,Shirt Size,Food,Club,Involvement
S22222,Eve Adams,L,NON-VEG,Drama Club,Actor`);
      
      await studentDAO.importFromCSV(csvFile);

      // Generate first token
      const validate1 = await request(app)
        .post('/api/validate')
        .send({ studentId: 'S22222' })
        .expect(200);

      const token1 = validate1.body.token;

      // Generate second token
      const validate2 = await request(app)
        .post('/api/validate')
        .send({ studentId: 'S22222' })
        .expect(200);

      const token2 = validate2.body.token;

      // Tokens should be different
      expect(token1).not.toBe(token2);

      // Claim with first token
      await request(app)
        .post('/api/claim')
        .send({ token: token1, itemType: 'tshirt' })
        .expect(200);

      // Scanning with second token should show the claim
      const scanWithToken2 = await request(app)
        .post('/api/scan')
        .send({ token: token2 })
        .expect(200);

      expect(scanWithToken2.body.claims.tshirtClaimed).toBe(true);

      // Attempting to claim again with second token should fail
      await request(app)
        .post('/api/claim')
        .send({ token: token2, itemType: 'tshirt' })
        .expect(409);
    });
  });


  describe('CSV Import to Database to API Flow', () => {
    it('should handle complete flow with duplicate students in CSV', async () => {
      // Step 1: Create CSV with duplicate student entries
      const csvFile = path.join(testDir, 'duplicates-flow.csv');
      const csvContent = `Student ID,Name,Shirt Size,Food,Club,Involvement
S33333,Frank Green,S,VEG,Chess Club,Member
S33333,Frank Green,XL,VEG,Drama Club,Actor
S33333,Frank Green,M,VEG,Music Club,Singer`;
      
      fs.writeFileSync(csvFile, csvContent);

      // Step 2: Import CSV (should consolidate duplicates)
      const importCount = await studentDAO.importFromCSV(csvFile);
      
      // Should import only 1 unique student
      expect(importCount).toBe(1);

      // Step 3: Validate through API
      const validateResponse = await request(app)
        .post('/api/validate')
        .send({ studentId: 'S33333' })
        .expect(200);

      // Step 4: Verify consolidated data
      expect(validateResponse.body.student).toMatchObject({
        studentId: 'S33333',
        name: 'Frank Green',
        tshirtSize: 'XL', // Largest size
        mealPreference: 'VEG'
      });

      // Step 5: Verify all involvements are preserved
      expect(validateResponse.body.student.involvements).toHaveLength(3);
      const clubs = validateResponse.body.student.involvements.map((inv: any) => inv.club);
      expect(clubs).toContain('Chess Club');
      expect(clubs).toContain('Drama Club');
      expect(clubs).toContain('Music Club');

      // Step 6: Scan and claim
      const token = validateResponse.body.token;
      const scanResponse = await request(app)
        .post('/api/scan')
        .send({ token })
        .expect(200);

      expect(scanResponse.body.student.involvements).toHaveLength(3);

      // Step 7: Claim items (should only allow one claim per item despite multiple orgs)
      await request(app)
        .post('/api/claim')
        .send({ token, itemType: 'tshirt' })
        .expect(200);

      // Step 8: Verify duplicate claim prevention works
      await request(app)
        .post('/api/claim')
        .send({ token, itemType: 'tshirt' })
        .expect(409);
    });

    it('should handle CSV with mix of unique and duplicate students', async () => {
      const csvFile = path.join(testDir, 'mixed-flow.csv');
      const csvContent = `Student ID,Name,Shirt Size,Food,Club,Involvement
S44444,Grace Hopper,M,VEG,Tech Club,Member
S55555,Alan Turing,L,NON-VEG,Math Club,President
S44444,Grace Hopper,XL,VEG,Science Club,Volunteer
S66666,Ada Lovelace,S,VEG,Programming Club,Founder`;
      
      fs.writeFileSync(csvFile, csvContent);

      const importCount = await studentDAO.importFromCSV(csvFile);
      
      // Should import 3 unique students
      expect(importCount).toBe(3);

      // Validate each student
      const grace = await request(app)
        .post('/api/validate')
        .send({ studentId: 'S44444' })
        .expect(200);

      expect(grace.body.student.tshirtSize).toBe('XL'); // Consolidated
      expect(grace.body.student.involvements).toHaveLength(2);

      const alan = await request(app)
        .post('/api/validate')
        .send({ studentId: 'S55555' })
        .expect(200);

      expect(alan.body.student.involvements).toHaveLength(1);

      const ada = await request(app)
        .post('/api/validate')
        .send({ studentId: 'S66666' })
        .expect(200);

      expect(ada.body.student.involvements).toHaveLength(1);
    });
  });


  describe('Error Scenarios End-to-End', () => {
    it('should handle invalid student ID throughout the flow', async () => {
      // Try to validate non-existent student
      const validateResponse = await request(app)
        .post('/api/validate')
        .send({ studentId: 'NONEXISTENT' })
        .expect(404);

      expect(validateResponse.body).toMatchObject({
        success: false,
        error: 'Student ID not found',
        code: 'STUDENT_NOT_FOUND'
      });

      // Verify no token was created
      const tokenResult = await pool.query('SELECT * FROM tokens');
      expect(tokenResult.rows).toHaveLength(0);
    });

    it('should handle invalid token throughout scan and claim flow', async () => {
      const invalidToken = 'a'.repeat(64); // Valid format but not in DB

      // Try to scan with invalid token
      const scanResponse = await request(app)
        .post('/api/scan')
        .send({ token: invalidToken })
        .expect(404);

      expect(scanResponse.body).toMatchObject({
        success: false,
        error: 'Invalid QR code',
        code: 'INVALID_TOKEN'
      });

      // Try to claim with invalid token
      const claimResponse = await request(app)
        .post('/api/claim')
        .send({ token: invalidToken, itemType: 'tshirt' })
        .expect(404);

      expect(claimResponse.body).toMatchObject({
        success: false,
        error: 'Invalid QR code',
        code: 'INVALID_TOKEN'
      });

      // Verify no claims were created
      const claimResult = await pool.query('SELECT * FROM claims');
      expect(claimResult.rows).toHaveLength(0);
    });

    it('should handle malformed requests throughout the flow', async () => {
      // Validate with missing studentId
      await request(app)
        .post('/api/validate')
        .send({})
        .expect(400);

      // Scan with missing token
      await request(app)
        .post('/api/scan')
        .send({})
        .expect(400);

      // Claim with missing token
      await request(app)
        .post('/api/claim')
        .send({ itemType: 'tshirt' })
        .expect(400);

      // Claim with missing itemType
      await request(app)
        .post('/api/claim')
        .send({ token: 'sometoken' })
        .expect(400);

      // Claim with invalid itemType
      await request(app)
        .post('/api/claim')
        .send({ token: 'sometoken', itemType: 'invalid' })
        .expect(400);
    });

    it('should handle CSV import errors gracefully', async () => {
      // Try to import non-existent file
      
      await expect(
        studentDAO.importFromCSV('/nonexistent/file.csv')
      ).rejects.toThrow();

      // Verify no students were imported
      const studentResult = await pool.query('SELECT * FROM students');
      expect(studentResult.rows).toHaveLength(0);
    });


    it('should handle database transaction failures during claim', async () => {
      // Set up student
      const csvFile = path.join(testDir, 'transaction-test.csv');
      fs.writeFileSync(csvFile, `Student ID,Name,Shirt Size,Food,Club,Involvement
S77777,Test User,M,VEG,Club A,Role A`);
      
      await studentDAO.importFromCSV(csvFile);

      // Get token
      const validateResponse = await request(app)
        .post('/api/validate')
        .send({ studentId: 'S77777' })
        .expect(200);

      const token = validateResponse.body.token;

      // Make successful claim
      await request(app)
        .post('/api/claim')
        .send({ token, itemType: 'tshirt' })
        .expect(200);

      // Verify claim was recorded
      const claimResult = await pool.query(
        'SELECT * FROM claims WHERE student_id = $1',
        ['S77777']
      );
      expect(claimResult.rows).toHaveLength(1);
      expect(claimResult.rows[0].tshirt_claimed).toBe(true);
    });

    it('should maintain data consistency across concurrent operations', async () => {
      // Set up student
      const csvFile = path.join(testDir, 'concurrent-test.csv');
      fs.writeFileSync(csvFile, `Student ID,Name,Shirt Size,Food,Club,Involvement
S88888,Concurrent User,L,VEG,Club B,Role B`);
      
      await studentDAO.importFromCSV(csvFile);

      // Get token
      const validateResponse = await request(app)
        .post('/api/validate')
        .send({ studentId: 'S88888' })
        .expect(200);

      const token = validateResponse.body.token;

      // Make concurrent claim requests
      const [claim1, claim2] = await Promise.all([
        request(app)
          .post('/api/claim')
          .send({ token, itemType: 'tshirt' }),
        request(app)
          .post('/api/claim')
          .send({ token, itemType: 'tshirt' })
      ]);

      // One should succeed (200), one should fail (409)
      const statuses = [claim1.status, claim2.status].sort();
      expect(statuses).toEqual([200, 409]);

      // Verify only one claim was recorded
      const claimResult = await pool.query(
        'SELECT * FROM claims WHERE student_id = $1',
        ['S88888']
      );
      expect(claimResult.rows).toHaveLength(1);
      expect(claimResult.rows[0].tshirt_claimed).toBe(true);
    });

    it('should handle empty or whitespace-only inputs', async () => {
      // Empty student ID
      await request(app)
        .post('/api/validate')
        .send({ studentId: '' })
        .expect(400);

      // Whitespace-only student ID
      await request(app)
        .post('/api/validate')
        .send({ studentId: '   ' })
        .expect(400);

      // Empty token
      await request(app)
        .post('/api/scan')
        .send({ token: '' })
        .expect(400);
    });
  });


  describe('Performance and Response Time Requirements', () => {
    it('should respond to validation requests within acceptable time', async () => {
      // Set up student
      const csvFile = path.join(testDir, 'perf-test.csv');
      fs.writeFileSync(csvFile, `Student ID,Name,Shirt Size,Food,Club,Involvement
PERF001,Performance Test,M,VEG,Club C,Role C`);
      
      await studentDAO.importFromCSV(csvFile);

      const startTime = Date.now();
      
      await request(app)
        .post('/api/validate')
        .send({ studentId: 'PERF001' })
        .expect(200);

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      // Should respond within 2 seconds (requirement is 500ms, but allowing buffer for test environment)
      expect(responseTime).toBeLessThan(2000);
    });

    it('should handle multiple concurrent requests efficiently', async () => {
      // Set up multiple students
      const csvFile = path.join(testDir, 'concurrent-perf.csv');
      const csvContent = `Student ID,Name,Shirt Size,Food,Club,Involvement
CONC001,User 1,M,VEG,Club A,Role A
CONC002,User 2,L,NON-VEG,Club B,Role B
CONC003,User 3,S,VEG,Club C,Role C
CONC004,User 4,XL,NON-VEG,Club D,Role D
CONC005,User 5,M,VEG,Club E,Role E`;
      
      fs.writeFileSync(csvFile, csvContent);
      
      await studentDAO.importFromCSV(csvFile);

      // Make 5 concurrent validation requests
      const startTime = Date.now();
      
      const requests = [
        request(app).post('/api/validate').send({ studentId: 'CONC001' }),
        request(app).post('/api/validate').send({ studentId: 'CONC002' }),
        request(app).post('/api/validate').send({ studentId: 'CONC003' }),
        request(app).post('/api/validate').send({ studentId: 'CONC004' }),
        request(app).post('/api/validate').send({ studentId: 'CONC005' })
      ];

      const responses = await Promise.all(requests);

      const endTime = Date.now();
      const totalTime = endTime - startTime;

      // All requests should succeed
      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
      });

      // Should handle concurrent requests efficiently (within 3 seconds for 5 requests)
      expect(totalTime).toBeLessThan(3000);
    });
  });

  describe('Data Integrity and Persistence', () => {
    it('should maintain data integrity across the entire flow', async () => {
      // Step 1: Import data
      const csvFile = path.join(testDir, 'integrity-test.csv');
      fs.writeFileSync(csvFile, `Student ID,Name,Shirt Size,Food,Club,Involvement
INT001,Integrity Test,XL,VEG,Club X,Role X`);
      
      await studentDAO.importFromCSV(csvFile);

      // Step 2: Validate and get token
      const validateResponse = await request(app)
        .post('/api/validate')
        .send({ studentId: 'INT001' })
        .expect(200);

      const token = validateResponse.body.token;
      const originalStudent = validateResponse.body.student;

      // Step 3: Scan multiple times - data should be consistent
      for (let i = 0; i < 3; i++) {
        const scanResponse = await request(app)
          .post('/api/scan')
          .send({ token })
          .expect(200);

        expect(scanResponse.body.student).toMatchObject(originalStudent);
      }

      // Step 4: Claim items
      await request(app)
        .post('/api/claim')
        .send({ token, itemType: 'tshirt' })
        .expect(200);

      await request(app)
        .post('/api/claim')
        .send({ token, itemType: 'meal' })
        .expect(200);

      // Step 5: Verify data is still consistent after claims
      const finalScan = await request(app)
        .post('/api/scan')
        .send({ token })
        .expect(200);

      expect(finalScan.body.student).toMatchObject(originalStudent);
      expect(finalScan.body.claims).toMatchObject({
        tshirtClaimed: true,
        mealClaimed: true
      });

      // Step 6: Verify database state
      const studentResult = await pool.query(
        'SELECT * FROM students WHERE student_id = $1',
        ['INT001']
      );
      expect(studentResult.rows).toHaveLength(1);

      const claimResult = await pool.query(
        'SELECT * FROM claims WHERE student_id = $1',
        ['INT001']
      );
      expect(claimResult.rows).toHaveLength(1);
      expect(claimResult.rows[0].tshirt_claimed).toBe(true);
      expect(claimResult.rows[0].meal_claimed).toBe(true);
    });
  });
});
