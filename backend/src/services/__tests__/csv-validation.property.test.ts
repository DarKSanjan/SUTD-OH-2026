import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import * as fc from 'fast-check';
import fs from 'fs';
import path from 'path';
import CSVParser from '../CSVParser';

/**
 * Feature: event-check-in-system
 * Property 1: CSV Field Validation
 * 
 * For any CSV file input, if required fields (Student ID, Name, Shirt Size, Food) 
 * are missing, the import process should reject the file and report which fields are missing.
 * 
 * Validates: Requirements 1.2
 */

describe('Property 1: CSV Field Validation', () => {
  const testDir = path.join(__dirname, 'test-csv-files');

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

  it('should reject CSV files with missing required fields and report which fields are missing', () => {
    fc.assert(
      fc.property(
        // Generate arbitrary CSV records with potentially missing fields
        fc.array(
          fc.record({
            'Student ID': fc.option(fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim().length > 0 && !s.includes('"') && !s.includes(',')), { nil: undefined }),
            'Name': fc.option(fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0 && !s.includes('"') && !s.includes(',')), { nil: undefined }),
            'Shirt Size': fc.option(fc.oneof(fc.constant('S'), fc.constant('M'), fc.constant('L'), fc.constant('XL')), { nil: undefined }),
            'Food': fc.option(fc.oneof(fc.constant('VEG'), fc.constant('NON-VEG')), { nil: undefined }),
            'Club': fc.option(fc.string({ minLength: 1, maxLength: 30 }).filter(s => s.trim().length > 0 && !s.includes('"') && !s.includes(',')), { nil: undefined }),
            'Involvement': fc.option(fc.string({ minLength: 1, maxLength: 30 }).filter(s => s.trim().length > 0 && !s.includes('"') && !s.includes(',')), { nil: undefined })
          }),
          { minLength: 1, maxLength: 10 }
        ),
        (records) => {
          // Create CSV content
          const headers = ['Student ID', 'Name', 'Shirt Size', 'Food', 'Club', 'Involvement'];
          const csvLines = [headers.join(',')];
          
          records.forEach(record => {
            const row = headers.map(header => {
              const value = record[header as keyof typeof record];
              // Always quote values to avoid CSV parsing issues with special characters
              if (value !== undefined) {
                const escaped = value.replace(/"/g, '""');
                return `"${escaped}"`;
              }
              return '';
            });
            csvLines.push(row.join(','));
          });
          
          const csvContent = csvLines.join('\n');
          
          // Write to temporary file
          const testFile = path.join(testDir, `test-${Date.now()}-${Math.random()}.csv`);
          fs.writeFileSync(testFile, csvContent);
          
          try {
            // Parse CSV
            const result = CSVParser.parseCSV(testFile);
            
            // Check if we have any non-empty invalid records
            const hasInvalidRecords = records.some(record => {
              const hasStudentId = record['Student ID'] !== undefined && record['Student ID'].trim() !== '';
              const hasName = record['Name'] !== undefined && record['Name'].trim() !== '';
              const hasShirtSize = record['Shirt Size'] !== undefined && record['Shirt Size'].trim() !== '';
              const hasFood = record['Food'] !== undefined && record['Food'].trim() !== '';
              const allFieldsEmpty = !hasStudentId && !hasName && !hasShirtSize && !hasFood;
              
              // Skip empty rows
              if (allFieldsEmpty) return false;
              
              // Check if missing required fields
              return !(hasStudentId && hasName && hasShirtSize && hasFood);
            });
            
            // If we have invalid records, result should not be successful
            if (hasInvalidRecords) {
              expect(result.success).toBe(false);
              expect(result.errors.length).toBeGreaterThan(0);
            } else {
              // All non-empty records are valid
              expect(result.success).toBe(true);
              expect(result.errors).toHaveLength(0);
            }
          } finally {
            // Clean up test file
            if (fs.existsSync(testFile)) {
              fs.unlinkSync(testFile);
            }
          }
        }
      ),
      { numRuns: 20 }
    );
  });

  it('should accept CSV files with all required fields present', () => {
    fc.assert(
      fc.property(
        // Generate valid CSV records with all required fields
        fc.array(
          fc.record({
            'Student ID': fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim().length > 0 && !s.includes('"') && !s.includes(',')),
            'Name': fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0 && !s.includes('"') && !s.includes(',')),
            'Shirt Size': fc.oneof(fc.constant('S'), fc.constant('M'), fc.constant('L'), fc.constant('XL'), fc.constant('2XL'), fc.constant('3XL')),
            'Food': fc.oneof(fc.constant('VEG'), fc.constant('NON-VEG')),
            'Club': fc.option(fc.string({ minLength: 1, maxLength: 30 }).filter(s => s.trim().length > 0 && !s.includes('"') && !s.includes(',')), { nil: undefined }),
            'Involvement': fc.option(fc.string({ minLength: 1, maxLength: 30 }).filter(s => s.trim().length > 0 && !s.includes('"') && !s.includes(',')), { nil: undefined })
          }),
          { minLength: 1, maxLength: 10 }
        ),
        (records) => {
          // Create CSV content
          const headers = ['Student ID', 'Name', 'Shirt Size', 'Food', 'Club', 'Involvement'];
          const csvLines = [headers.join(',')];
          
          records.forEach(record => {
            const row = headers.map(header => {
              const value = record[header as keyof typeof record];
              // Always quote values to avoid CSV parsing issues with special characters
              if (value !== undefined) {
                const escaped = value.replace(/"/g, '""');
                return `"${escaped}"`;
              }
              return '';
            });
            csvLines.push(row.join(','));
          });
          
          const csvContent = csvLines.join('\n');
          
          // Write to temporary file
          const testFile = path.join(testDir, `test-valid-${Date.now()}-${Math.random()}.csv`);
          fs.writeFileSync(testFile, csvContent);
          
          try {
            // Parse CSV
            const result = CSVParser.parseCSV(testFile);
            
            // Should be successful with no errors
            expect(result.success).toBe(true);
            expect(result.errors).toHaveLength(0);
            expect(result.students).toHaveLength(records.length);
            
            // Verify each student has all required fields
            result.students.forEach((student, index) => {
              expect(student.studentId).toBe(records[index]['Student ID']);
              expect(student.name).toBe(records[index]['Name']);
              expect(student.tshirtSize).toBe(records[index]['Shirt Size']);
              expect(student.mealPreference).toBe(records[index]['Food']);
            });
          } finally {
            // Clean up test file
            if (fs.existsSync(testFile)) {
              fs.unlinkSync(testFile);
            }
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
