import fs from 'fs';
import path from 'path';
import StudentDAO from '../dao/StudentDAO';

export class StartupImport {
  private static readonly CSV_FILE_PATH = path.join(process.cwd(), 'Open House 2026 Student Organisations Involvement 1.csv');

  /**
   * Import CSV data on system startup (only if database is empty)
   * @throws Error if CSV file is missing or import fails when database is empty
   */
  static async importCSVOnStartup(): Promise<void> {
    console.log('Checking database status...');

    try {
      // Check if database already has student data
      const existingStudentCount = await StudentDAO.getStudentCount();
      
      if (existingStudentCount > 0) {
        console.log(`✓ Database already contains ${existingStudentCount} student records. Skipping CSV import.`);
        return;
      }

      console.log('Database is empty. Starting CSV import process...');

      // Check if CSV file exists
      if (!fs.existsSync(this.CSV_FILE_PATH)) {
        const error = `CSV file not found at path: ${this.CSV_FILE_PATH}`;
        console.error(`[STARTUP ERROR] ${error}`);
        throw new Error(error);
      }

      // Attempt to import CSV
      const importedCount = await StudentDAO.importFromCSV(this.CSV_FILE_PATH);

      console.log(`✓ Successfully imported ${importedCount} student records from CSV`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`[STARTUP ERROR] Failed to import CSV: ${errorMessage}`);
      
      // Re-throw to prevent system startup
      throw new Error(`CSV import failed: ${errorMessage}`);
    }
  }

  /**
   * Validate CSV file exists and is readable
   * @returns true if file exists and is readable
   */
  static validateCSVFile(): boolean {
    try {
      if (!fs.existsSync(this.CSV_FILE_PATH)) {
        return false;
      }

      // Try to read the file to ensure it's accessible
      fs.accessSync(this.CSV_FILE_PATH, fs.constants.R_OK);
      return true;
    } catch (error) {
      return false;
    }
  }
}

export default StartupImport;
