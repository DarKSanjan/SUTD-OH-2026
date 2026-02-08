import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { StudentDAO } from '../StudentDAO';
import fs from 'fs';
import path from 'path';
import pool from '../../db/config';

describe('StudentDAO - CSV Import with Duplicate Consolidation', () => {
  let studentDAO: StudentDAO;
  const testDir = path.join(__dirname, 'test-csv-files');

  beforeEach(async () => {
    studentDAO = new StudentDAO();
    
    // Create test directory
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }
    
    // Clear students table
    await pool.query('DELETE FROM students');
  });

  afterEach(() => {
    // Clean up test files
    if (fs.existsSync(testDir)) {
      const files = fs.readdirSync(testDir);
      files.forEach(file => {
        fs.unlinkSync(path.join(testDir, file));
      });
      fs.rmdirSync(testDir);
    }
  });

  it('should consolidate duplicate students with same ID', async () => {
    const csvFile = path.join(testDir, 'duplicates.csv');
    const content = `Student ID,Name,Shirt Size,Food,Club,Involvement
S001,John Doe,S,VEG,Chess Club,Member
S001,John Doe,XL,VEG,Drama Club,Actor
S001,John Doe,M,VEG,Music Club,Singer`;
    
    fs.writeFileSync(csvFile, content);
    
    const count = await studentDAO.importFromCSV(csvFile);
    
    // Should import only 1 unique student
    expect(count).toBe(1);
    
    // Retrieve the student
    const student = await studentDAO.findByStudentId('S001');
    
    expect(student).toBeDefined();
    expect(student?.studentId).toBe('S001');
    expect(student?.name).toBe('John Doe');
    
    // Should have the largest t-shirt size (XL)
    expect(student?.tshirtSize).toBe('XL');
    
    // Should have all organization details
    expect(student?.organizationDetails).toContain('Chess Club');
    expect(student?.organizationDetails).toContain('Drama Club');
    expect(student?.organizationDetails).toContain('Music Club');
    expect(student?.organizationDetails).toContain('Member');
    expect(student?.organizationDetails).toContain('Actor');
    expect(student?.organizationDetails).toContain('Singer');
  });

  it('should select largest t-shirt size when consolidating', async () => {
    const csvFile = path.join(testDir, 'sizes.csv');
    const content = `Student ID,Name,Shirt Size,Food,Club,Involvement
S002,Jane Smith,XS,NON-VEG,Sports Club,Player
S002,Jane Smith,XXL,NON-VEG,Tech Club,Developer
S002,Jane Smith,M,NON-VEG,Art Club,Artist`;
    
    fs.writeFileSync(csvFile, content);
    
    await studentDAO.importFromCSV(csvFile);
    
    const student = await studentDAO.findByStudentId('S002');
    
    // Should have the largest size (XXL)
    expect(student?.tshirtSize).toBe('XXL');
  });

  it('should preserve all organization involvements', async () => {
    const csvFile = path.join(testDir, 'orgs.csv');
    const content = `Student ID,Name,Shirt Size,Food,Club,Involvement
S003,Bob Johnson,L,VEG,Club A,Role A
S003,Bob Johnson,L,VEG,Club B,Role B
S003,Bob Johnson,L,VEG,Club C,Role C
S003,Bob Johnson,L,VEG,Club D,Role D`;
    
    fs.writeFileSync(csvFile, content);
    
    await studentDAO.importFromCSV(csvFile);
    
    const student = await studentDAO.findByStudentId('S003');
    
    // Should have all 4 club involvements
    expect(student?.organizationDetails).toContain('Club A');
    expect(student?.organizationDetails).toContain('Club B');
    expect(student?.organizationDetails).toContain('Club C');
    expect(student?.organizationDetails).toContain('Club D');
    expect(student?.organizationDetails).toContain('Role A');
    expect(student?.organizationDetails).toContain('Role B');
    expect(student?.organizationDetails).toContain('Role C');
    expect(student?.organizationDetails).toContain('Role D');
  });

  it('should handle mix of duplicate and unique students', async () => {
    const csvFile = path.join(testDir, 'mixed.csv');
    const content = `Student ID,Name,Shirt Size,Food,Club,Involvement
S004,Alice Brown,M,VEG,Chess Club,Member
S005,Charlie Davis,L,NON-VEG,Drama Club,Actor
S004,Alice Brown,XL,VEG,Music Club,Singer
S006,Diana Evans,S,VEG,Sports Club,Player`;
    
    fs.writeFileSync(csvFile, content);
    
    const count = await studentDAO.importFromCSV(csvFile);
    
    // Should import 3 unique students (S004, S005, S006)
    expect(count).toBe(3);
    
    // Check S004 was consolidated
    const student004 = await studentDAO.findByStudentId('S004');
    expect(student004?.tshirtSize).toBe('XL');
    expect(student004?.organizationDetails).toContain('Chess Club');
    expect(student004?.organizationDetails).toContain('Music Club');
    
    // Check S005 and S006 are unique
    const student005 = await studentDAO.findByStudentId('S005');
    expect(student005?.name).toBe('Charlie Davis');
    
    const student006 = await studentDAO.findByStudentId('S006');
    expect(student006?.name).toBe('Diana Evans');
  });

  it('should handle case-insensitive duplicate detection', async () => {
    const csvFile = path.join(testDir, 'case.csv');
    const content = `Student ID,Name,Shirt Size,Food,Club,Involvement
s007,Frank Green,M,VEG,Chess Club,Member
S007,Frank Green,L,VEG,Drama Club,Actor
S007,Frank Green,XL,VEG,Music Club,Singer`;
    
    fs.writeFileSync(csvFile, content);
    
    const count = await studentDAO.importFromCSV(csvFile);
    
    // Should import only 1 student (case-insensitive)
    expect(count).toBe(1);
    
    // Should be able to find with any case
    const student1 = await studentDAO.findByStudentId('s007');
    const student2 = await studentDAO.findByStudentId('S007');
    
    expect(student1).toBeDefined();
    expect(student2).toBeDefined();
    expect(student1?.tshirtSize).toBe('XL');
    expect(student2?.tshirtSize).toBe('XL');
  });
});
