import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import express, { Express } from 'express';
import studentsRouter from '../students';
import pool from '../../db/config';
import StudentDAO from '../../dao/StudentDAO';
import ClaimDAO from '../../dao/ClaimDAO';
import { Student } from '../../models/Student';
import { errorHandler, notFoundHandler } from '../../middleware/errorHandler';

/**
 * Unit tests for GET /api/students/all endpoint
 * Tests retrieval of all student records with distribution and consent status
 * 
 * **Validates: Requirements 8.2, 8.3**
 */

describe('GET /api/students/all', () => {
  let app: Express;

  beforeAll(async () => {
    // Set up Express app with routes
    app = express();
    app.use(express.json());
    app.use('/api', studentsRouter);
    
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
  });

  afterAll(async () => {
    // Clean up test data
    await pool.query('DROP TABLE IF EXISTS claims CASCADE');
    await pool.query('DROP TABLE IF EXISTS students CASCADE');
    await pool.end();
  });

  beforeEach(async () => {
    // Clean up data before each test
    await pool.query('DELETE FROM claims');
    await pool.query('DELETE FROM students');
  });

  describe('Valid requests', () => {
    it('should return empty array when no students exist', async () => {
      const response = await request(app)
        .get('/api/students/all')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        students: [],
        total: 0
      });
    });

    it('should return all students with their claim and consent status', async () => {
      // Insert test students
      const student1: Student = {
        studentId: 'TEST001',
        name: 'Alice Smith',
        tshirtSize: 'M',
        mealPreference: 'VEG',
        organizationDetails: 'Club: Tech Club',
        consented: true
      };

      const student2: Student = {
        studentId: 'TEST002',
        name: 'Bob Jones',
        tshirtSize: 'L',
        mealPreference: 'NON-VEG',
        organizationDetails: 'Club: Science Club',
        consented: false
      };

      await StudentDAO.upsert(student1);
      await StudentDAO.upsert(student2);

      // Initialize claims for student1 and claim shirt
      await ClaimDAO.initializeForStudent('TEST001');
      await ClaimDAO.updateDistributionStatus('TEST001', 'tshirt', true);

      // Initialize claims for student2 and claim meal
      await ClaimDAO.initializeForStudent('TEST002');
      await ClaimDAO.updateDistributionStatus('TEST002', 'meal', true);

      const response = await request(app)
        .get('/api/students/all')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.total).toBe(2);
      expect(response.body.students).toHaveLength(2);

      // Check student1 data
      const alice = response.body.students.find((s: any) => s.studentId === 'TEST001');
      expect(alice).toEqual({
        studentId: 'TEST001',
        name: 'Alice Smith',
        tshirtSize: 'M',
        mealPreference: 'VEG',
        shirtCollected: true,
        mealCollected: false,
        consented: true,
        organizationDetails: 'Club: Tech Club'
      });

      // Check student2 data
      const bob = response.body.students.find((s: any) => s.studentId === 'TEST002');
      expect(bob).toEqual({
        studentId: 'TEST002',
        name: 'Bob Jones',
        tshirtSize: 'L',
        mealPreference: 'NON-VEG',
        shirtCollected: false,
        mealCollected: true,
        consented: false,
        organizationDetails: 'Club: Science Club'
      });
    });

    it('should return students with false claim status when no claim record exists', async () => {
      // Insert student without claim record
      const student: Student = {
        studentId: 'TEST003',
        name: 'Charlie Brown',
        tshirtSize: 'S',
        mealPreference: 'VEG',
        organizationDetails: '',
        consented: true
      };

      await StudentDAO.upsert(student);

      const response = await request(app)
        .get('/api/students/all')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.total).toBe(1);
      expect(response.body.students[0]).toEqual({
        studentId: 'TEST003',
        name: 'Charlie Brown',
        tshirtSize: 'S',
        mealPreference: 'VEG',
        shirtCollected: false,
        mealCollected: false,
        consented: true,
        organizationDetails: null
      });
    });

    it('should return students ordered by student ID', async () => {
      // Insert students in non-alphabetical order
      const students: Student[] = [
        {
          studentId: 'TEST003',
          name: 'Charlie',
          tshirtSize: 'M',
          mealPreference: 'VEG',
          organizationDetails: '',
          consented: false
        },
        {
          studentId: 'TEST001',
          name: 'Alice',
          tshirtSize: 'S',
          mealPreference: 'VEG',
          organizationDetails: '',
          consented: true
        },
        {
          studentId: 'TEST002',
          name: 'Bob',
          tshirtSize: 'L',
          mealPreference: 'NON-VEG',
          organizationDetails: '',
          consented: false
        }
      ];

      for (const student of students) {
        await StudentDAO.upsert(student);
      }

      const response = await request(app)
        .get('/api/students/all')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.students).toHaveLength(3);

      // Verify ordering
      expect(response.body.students[0].studentId).toBe('TEST001');
      expect(response.body.students[1].studentId).toBe('TEST002');
      expect(response.body.students[2].studentId).toBe('TEST003');
    });

    it('should include all required fields for each student', async () => {
      const student: Student = {
        studentId: 'TEST004',
        name: 'Diana Prince',
        tshirtSize: 'M',
        mealPreference: 'VEG',
        organizationDetails: 'Club: Art Club',
        consented: true
      };

      await StudentDAO.upsert(student);
      await ClaimDAO.initializeForStudent('TEST004');
      await ClaimDAO.updateDistributionStatus('TEST004', 'tshirt', true);
      await ClaimDAO.updateDistributionStatus('TEST004', 'meal', true);

      const response = await request(app)
        .get('/api/students/all')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.students[0]).toHaveProperty('studentId');
      expect(response.body.students[0]).toHaveProperty('name');
      expect(response.body.students[0]).toHaveProperty('tshirtSize');
      expect(response.body.students[0]).toHaveProperty('mealPreference');
      expect(response.body.students[0]).toHaveProperty('shirtCollected');
      expect(response.body.students[0]).toHaveProperty('mealCollected');
      expect(response.body.students[0]).toHaveProperty('consented');
      expect(response.body.students[0]).toHaveProperty('organizationDetails');

      // Verify all fields have correct values
      expect(response.body.students[0]).toEqual({
        studentId: 'TEST004',
        name: 'Diana Prince',
        tshirtSize: 'M',
        mealPreference: 'VEG',
        shirtCollected: true,
        mealCollected: true,
        consented: true,
        organizationDetails: 'Club: Art Club'
      });
    });

    it('should handle large number of students', async () => {
      // Insert 50 students
      const students: Student[] = [];
      for (let i = 1; i <= 50; i++) {
        students.push({
          studentId: `TEST${String(i).padStart(3, '0')}`,
          name: `Student ${i}`,
          tshirtSize: 'M',
          mealPreference: 'VEG',
          organizationDetails: '',
          consented: i % 2 === 0 // Alternate consent status
        });
      }

      for (const student of students) {
        await StudentDAO.upsert(student);
      }

      const response = await request(app)
        .get('/api/students/all')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.total).toBe(50);
      expect(response.body.students).toHaveLength(50);
    });

    it('should handle students with various claim combinations', async () => {
      const students: Student[] = [
        {
          studentId: 'TEST010',
          name: 'No Claims',
          tshirtSize: 'M',
          mealPreference: 'VEG',
          organizationDetails: '',
          consented: false
        },
        {
          studentId: 'TEST011',
          name: 'Shirt Only',
          tshirtSize: 'L',
          mealPreference: 'VEG',
          organizationDetails: '',
          consented: true
        },
        {
          studentId: 'TEST012',
          name: 'Meal Only',
          tshirtSize: 'S',
          mealPreference: 'NON-VEG',
          organizationDetails: '',
          consented: true
        },
        {
          studentId: 'TEST013',
          name: 'Both Claims',
          tshirtSize: 'XL',
          mealPreference: 'VEG',
          organizationDetails: '',
          consented: false
        }
      ];

      for (const student of students) {
        await StudentDAO.upsert(student);
      }

      // Set up different claim combinations
      await ClaimDAO.initializeForStudent('TEST011');
      await ClaimDAO.updateDistributionStatus('TEST011', 'tshirt', true);

      await ClaimDAO.initializeForStudent('TEST012');
      await ClaimDAO.updateDistributionStatus('TEST012', 'meal', true);

      await ClaimDAO.initializeForStudent('TEST013');
      await ClaimDAO.updateDistributionStatus('TEST013', 'tshirt', true);
      await ClaimDAO.updateDistributionStatus('TEST013', 'meal', true);

      const response = await request(app)
        .get('/api/students/all')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.total).toBe(4);

      const noClaims = response.body.students.find((s: any) => s.studentId === 'TEST010');
      expect(noClaims.shirtCollected).toBe(false);
      expect(noClaims.mealCollected).toBe(false);

      const shirtOnly = response.body.students.find((s: any) => s.studentId === 'TEST011');
      expect(shirtOnly.shirtCollected).toBe(true);
      expect(shirtOnly.mealCollected).toBe(false);

      const mealOnly = response.body.students.find((s: any) => s.studentId === 'TEST012');
      expect(mealOnly.shirtCollected).toBe(false);
      expect(mealOnly.mealCollected).toBe(true);

      const bothClaims = response.body.students.find((s: any) => s.studentId === 'TEST013');
      expect(bothClaims.shirtCollected).toBe(true);
      expect(bothClaims.mealCollected).toBe(true);
    });
  });

  describe('Response format validation', () => {
    it('should return consistent response structure', async () => {
      const student: Student = {
        studentId: 'TEST020',
        name: 'Test User',
        tshirtSize: 'M',
        mealPreference: 'VEG',
        organizationDetails: '',
        consented: true
      };

      await StudentDAO.upsert(student);

      const response = await request(app)
        .get('/api/students/all')
        .expect(200);

      // Check response structure
      expect(response.body).toHaveProperty('success');
      expect(response.body).toHaveProperty('students');
      expect(response.body).toHaveProperty('total');

      // Check types
      expect(typeof response.body.success).toBe('boolean');
      expect(Array.isArray(response.body.students)).toBe(true);
      expect(typeof response.body.total).toBe('number');

      // Check student object structure
      expect(response.body.students[0]).toMatchObject({
        studentId: expect.any(String),
        name: expect.any(String),
        tshirtSize: expect.any(String),
        mealPreference: expect.any(String),
        shirtCollected: expect.any(Boolean),
        mealCollected: expect.any(Boolean),
        consented: expect.any(Boolean)
      });
    });
  });
});
