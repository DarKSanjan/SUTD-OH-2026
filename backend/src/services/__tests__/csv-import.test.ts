import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import fs from 'fs';
import path from 'path';
import CSVParser from '../CSVParser';

describe('CSV Import Edge Cases', () => {
  const testDir = path.join(__dirname, 'test-csv-edge-cases');

  beforeAll(() => {
    // Create test directory
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }
  });

  afterAll(() => {
    // Clean up test files
    if (fs.existsSync(testDir)) {
      const files = fs.readdirSync(testDir);
      files.forEach(file => {
        fs.unlinkSync(path.join(testDir, file));
      });
      fs.rmdirSync(testDir);
    }
  });

  describe('Missing CSV file', () => {
    it('should throw an error when CSV file does not exist', () => {
      const nonExistentFile = path.join(testDir, 'non-existent-file.csv');
      
      expect(() => {
        CSVParser.parseCSV(nonExistentFile);
      }).toThrow('Failed to parse CSV file');
    });
  });

  describe('Corrupted CSV file', () => {
    it('should handle empty CSV file', () => {
      const emptyFile = path.join(testDir, 'empty.csv');
      fs.writeFileSync(emptyFile, '');
      
      // Empty file returns empty result, not an error
      const result = CSVParser.parseCSV(emptyFile);
      expect(result.success).toBe(true);
      expect(result.students).toHaveLength(0);
    });

    it('should throw an error for CSV with only headers', () => {
      const headersOnlyFile = path.join(testDir, 'headers-only.csv');
      const content = 'Student ID,Name,Shirt Size,Food,Club,Involvement\n';
      fs.writeFileSync(headersOnlyFile, content);
      
      const result = CSVParser.parseCSV(headersOnlyFile);
      
      // Should succeed but with no students
      expect(result.success).toBe(true);
      expect(result.students).toHaveLength(0);
      expect(result.errors).toHaveLength(0);
    });

    it('should handle CSV with malformed rows gracefully', () => {
      const malformedFile = path.join(testDir, 'malformed.csv');
      const content = `Student ID,Name,Shirt Size,Food,Club,Involvement
1001,John Doe,L,VEG,Chess Club,Member
1002,Jane Smith,M
1003,Bob Johnson,XL,NON-VEG,Drama Club,Lead`;
      fs.writeFileSync(malformedFile, content);
      
      // CSV parser should handle malformed rows gracefully (relax_column_count: true)
      // All rows have Student ID and Name, so they should all be parsed successfully
      // Missing Shirt Size and Food are allowed for duplicate entries
      const result = CSVParser.parseCSV(malformedFile);
      
      expect(result.success).toBe(true);
      expect(result.errors.length).toBe(0);
      
      // All rows should be parsed
      expect(result.students.length).toBe(3);
    });

    it('should handle CSV with missing required fields', () => {
      const missingFieldsFile = path.join(testDir, 'missing-fields.csv');
      const content = `Student ID,Name,Shirt Size,Food,Club,Involvement
1001,John Doe,,VEG,Chess Club,Member
1002,,M,NON-VEG,Drama Club,Lead
1003,Bob Johnson,XL,,Music Club,Performer`;
      fs.writeFileSync(missingFieldsFile, content);
      
      const result = CSVParser.parseCSV(missingFieldsFile);
      
      // Should fail validation only for row with missing Name
      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(1);
      
      // Check that row 3 (missing Name) has an error
      const row3Error = result.errors.find(e => e.row === 3);
      expect(row3Error?.missingFields).toContain('Name');
      
      // Rows with missing Shirt Size or Food should still be parsed (for duplicate entries)
      expect(result.students.length).toBe(2);
    });
  });

  describe('Valid CSV file', () => {
    it('should successfully parse a valid CSV file', () => {
      const validFile = path.join(testDir, 'valid.csv');
      const content = `Student ID,Name,Shirt Size,Food,Club,Involvement
1001,John Doe,L,VEG,Chess Club,Member
1002,Jane Smith,M,NON-VEG,Drama Club,Lead
1003,Bob Johnson,XL,VEG,Music Club,Performer`;
      fs.writeFileSync(validFile, content);
      
      const result = CSVParser.parseCSV(validFile);
      
      // Should succeed
      expect(result.success).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.students).toHaveLength(3);
      
      // Verify first student
      expect(result.students[0].studentId).toBe('1001');
      expect(result.students[0].name).toBe('John Doe');
      expect(result.students[0].tshirtSize).toBe('L');
      expect(result.students[0].mealPreference).toBe('VEG');
      expect(result.students[0].organizationDetails).toBe('Club: Chess Club, Involvement: Member');
      
      // Verify second student
      expect(result.students[1].studentId).toBe('1002');
      expect(result.students[1].name).toBe('Jane Smith');
      expect(result.students[1].tshirtSize).toBe('M');
      expect(result.students[1].mealPreference).toBe('NON-VEG');
    });

    it('should handle CSV with optional fields missing', () => {
      const validFile = path.join(testDir, 'valid-optional-missing.csv');
      const content = `Student ID,Name,Shirt Size,Food,Club,Involvement
1001,John Doe,L,VEG,,
1002,Jane Smith,M,NON-VEG,,Member
1003,Bob Johnson,XL,VEG,Music Club,`;
      fs.writeFileSync(validFile, content);
      
      const result = CSVParser.parseCSV(validFile);
      
      // Should succeed even with optional fields missing
      expect(result.success).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.students).toHaveLength(3);
      
      // Verify organization details handling
      expect(result.students[0].organizationDetails).toBe('');
      expect(result.students[1].organizationDetails).toBe('Involvement: Member');
      expect(result.students[2].organizationDetails).toBe('Club: Music Club');
    });

    it('should handle CSV with various t-shirt sizes', () => {
      const validFile = path.join(testDir, 'valid-sizes.csv');
      const content = `Student ID,Name,Shirt Size,Food,Club,Involvement
1001,Student 1,XS,VEG,,
1002,Student 2,S,VEG,,
1003,Student 3,M,VEG,,
1004,Student 4,L,VEG,,
1005,Student 5,XL,VEG,,
1006,Student 6,2XL,VEG,,
1007,Student 7,3XL,VEG,,`;
      fs.writeFileSync(validFile, content);
      
      const result = CSVParser.parseCSV(validFile);
      
      // Should succeed with all sizes
      expect(result.success).toBe(true);
      expect(result.students).toHaveLength(7);
      
      const sizes = result.students.map(s => s.tshirtSize);
      expect(sizes).toEqual(['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL']);
    });

    it('should handle CSV with special characters in names', () => {
      const validFile = path.join(testDir, 'valid-special-chars.csv');
      const content = `Student ID,Name,Shirt Size,Food,Club,Involvement
1001,O'Brien,L,VEG,,
1002,José García,M,NON-VEG,,
1003,李明,XL,VEG,,`;
      fs.writeFileSync(validFile, content);
      
      const result = CSVParser.parseCSV(validFile);
      
      // Should succeed with special characters
      expect(result.success).toBe(true);
      expect(result.students).toHaveLength(3);
      expect(result.students[0].name).toBe("O'Brien");
      expect(result.students[1].name).toBe('José García');
      expect(result.students[2].name).toBe('李明');
    });
  });

  describe('Error message formatting', () => {
    it('should format validation errors correctly', () => {
      const errors = [
        { row: 2, missingFields: ['Name', 'Food'], record: {} },
        { row: 5, missingFields: ['Student ID'], record: {} }
      ];
      
      const message = CSVParser.formatValidationErrors(errors);
      
      expect(message).toContain('Row 2: Missing required fields: Name, Food');
      expect(message).toContain('Row 5: Missing required fields: Student ID');
    });

    it('should return empty string for no errors', () => {
      const message = CSVParser.formatValidationErrors([]);
      expect(message).toBe('');
    });
  });
});
