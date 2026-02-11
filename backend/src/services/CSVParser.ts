import fs from 'fs';
import { parse } from 'csv-parse/sync';
import { Student } from '../models/Student';

export interface CSVValidationError {
  row: number;
  missingFields: string[];
  record: any;
}

export interface CSVParseResult {
  success: boolean;
  students: Student[];
  errors: CSVValidationError[];
}

export class CSVParser {
  private static readonly REQUIRED_FIELDS = [
    'Student ID',
    'Name'
  ];

  /**
   * Parse and validate a CSV file
   * @param filePath Path to the CSV file
   * @returns Parse result with students or validation errors
   */
  static parseCSV(filePath: string): CSVParseResult {
    try {
      // Read file content
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      
      // Parse CSV with proper handling of quoted fields and newlines
      const records = parse(fileContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
        bom: true, // Handle UTF-8 BOM (Byte Order Mark)
        relax_column_count: true, // Allow rows with different column counts
        relax_quotes: true, // Allow quotes to appear in unquoted fields
        escape: '"', // Use double quote as escape character
        quote: '"' // Use double quote as quote character
      });
      
      // Debug: Log parsing info
      console.log(`✓ Parsed ${records.length} records from CSV`);

      const students: Student[] = [];
      const errors: CSVValidationError[] = [];

      // Validate and transform each record
      records.forEach((record: any, index: number) => {
        const studentId = record['Student ID'];
        const name = record['Name'];
        
        // Skip rows with missing critical fields (Student ID or Name)
        if (!studentId || !name || studentId.trim() === '' || name.trim() === '') {
          errors.push({
            row: index + 2,
            missingFields: [
              ...(!studentId || studentId.trim() === '' ? ['Student ID'] : []),
              ...(!name || name.trim() === '' ? ['Name'] : [])
            ],
            record
          });
          return;
        }

        // For duplicate entries (multiple involvements), shirt size and food may be empty
        // We'll handle this during consolidation
        // Try both "Shirt Size" and "Shirt Size2" column names
        const shirtSize = record['Shirt Size2'] || record['Shirt Size'] || '';
        const food = record['Food'] || '';
        
        // Create student record (duplicates will be handled by StudentDAO)
        students.push({
          studentId,
          name,
          tshirtSize: shirtSize,
          mealPreference: food,
          organizationDetails: this.buildOrganizationDetails(record)
        });
      });
      
      console.log(`✓ Processed ${students.length} student records from CSV`);

      return {
        success: errors.length === 0,
        students,
        errors
      };
    } catch (error) {
      throw new Error(`Failed to parse CSV file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Validate that a record has all required fields
   * @param record CSV record
   * @returns Array of missing field names
   */
  private static validateRecord(record: any): string[] {
    const missingFields: string[] = [];
    
    for (const field of this.REQUIRED_FIELDS) {
      const value = record[field];
      if (!value || (typeof value === 'string' && value.trim() === '')) {
        missingFields.push(field);
      }
    }
    
    return missingFields;
  }

  /**
   * Build organization details string from CSV record
   * @param record CSV record
   * @returns Organization details string
   */
  private static buildOrganizationDetails(record: any): string {
    const details: string[] = [];
    
    if (record['Club']) {
      details.push(`Club: ${record['Club']}`);
    }
    if (record['Involvement']) {
      details.push(`Involvement: ${record['Involvement']}`);
    }
    
    return details.join(', ');
  }

  /**
   * Format validation errors into a readable error message
   * @param errors Array of validation errors
   * @returns Formatted error message
   */
  static formatValidationErrors(errors: CSVValidationError[]): string {
    if (errors.length === 0) {
      return '';
    }

    const errorMessages = errors.map(error => {
      const fields = error.missingFields.join(', ');
      return `Row ${error.row}: Missing required fields: ${fields}`;
    });

    return `CSV validation failed:\n${errorMessages.join('\n')}`;
  }
}

export default CSVParser;
