import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Student } from '../Student';
import StudentDAO from '../../dao/StudentDAO';
import pool from '../../db/config';

/**
 * Unit tests for Student consent field
 * Tests the new consented field added for PDPA consent tracking
 */
describe('Student - Consent Field', () => {
  beforeEach(async () => {
    // Clear test data before each test
    await pool.query('DELETE FROM students WHERE student_id LIKE $1', ['test-consent-%']);
  });

  afterEach(async () => {
    // Clean up test data after each test
    await pool.query('DELETE FROM students WHERE student_id LIKE $1', ['test-consent-%']);
  });

  it('should include consented field in Student interface', () => {
    const student: Student = {
      studentId: 'test-consent-001',
      name: 'Test Student',
      tshirtSize: 'M',
      mealPreference: 'Vegetarian',
      consented: true
    };

    expect(student.consented).toBeDefined();
    expect(student.consented).toBe(true);
  });

  it('should allow consented field to be optional', () => {
    const student: Student = {
      studentId: 'test-consent-002',
      name: 'Test Student 2',
      tshirtSize: 'L',
      mealPreference: 'Non-Vegetarian'
    };

    expect(student.consented).toBeUndefined();
  });

  it('should store and retrieve consented field from database', async () => {
    const student: Student = {
      studentId: 'test-consent-003',
      name: 'Test Student 3',
      tshirtSize: 'S',
      mealPreference: 'Vegetarian',
      consented: true
    };

    // Insert student
    await StudentDAO.upsert(student);

    // Retrieve student
    const retrieved = await StudentDAO.findByStudentId('test-consent-003');

    expect(retrieved).not.toBeNull();
    expect(retrieved?.consented).toBe(true);
  });

  it('should default consented to false when not specified', async () => {
    const student: Student = {
      studentId: 'test-consent-004',
      name: 'Test Student 4',
      tshirtSize: 'M',
      mealPreference: 'Non-Vegetarian'
    };

    // Insert student without consented field
    await StudentDAO.upsert(student);

    // Retrieve student
    const retrieved = await StudentDAO.findByStudentId('test-consent-004');

    expect(retrieved).not.toBeNull();
    expect(retrieved?.consented).toBe(false);
  });

  it('should allow updating consented field', async () => {
    const student: Student = {
      studentId: 'test-consent-005',
      name: 'Test Student 5',
      tshirtSize: 'L',
      mealPreference: 'Vegetarian',
      consented: false
    };

    // Insert student with consented = false
    await StudentDAO.upsert(student);

    // Update to consented = true
    const updatedStudent: Student = {
      ...student,
      consented: true
    };
    await StudentDAO.upsert(updatedStudent);

    // Retrieve and verify
    const retrieved = await StudentDAO.findByStudentId('test-consent-005');

    expect(retrieved).not.toBeNull();
    expect(retrieved?.consented).toBe(true);
  });
});
