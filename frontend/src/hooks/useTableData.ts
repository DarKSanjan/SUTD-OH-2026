import { useState, useEffect, useCallback } from 'react';
import { StudentRecord } from '../utils/types';
import { parseOrganizationDetails } from '../utils/tableUtils';

/**
 * API response structure from /api/students/all
 */
interface APIStudentRecord {
  studentId: string;
  name: string;
  tshirtSize?: string;
  mealPreference?: string;
  shirtCollected: boolean;
  mealCollected: boolean;
  consented: boolean;
  organizationDetails?: string;
}

interface APIResponse {
  success: boolean;
  students: APIStudentRecord[];
  total?: number;
}

/**
 * Return type for useTableData hook
 */
export interface UseTableDataReturn {
  students: StudentRecord[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Custom hook for fetching and parsing student data
 * 
 * Fetches data from /api/students/all and parses organizationDetails
 * into structured fields (clubs, hasPerformance, hasBooth)
 * 
 * @returns Object containing students array, loading state, error state, and refetch function
 * 
 * @example
 * ```tsx
 * const { students, isLoading, error, refetch } = useTableData();
 * 
 * if (isLoading) return <LoadingSpinner />;
 * if (error) return <ErrorMessage message={error} onRetry={refetch} />;
 * return <Table data={students} />;
 * ```
 */
export function useTableData(): UseTableDataReturn {
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Validate API response structure
   */
  const validateAPIResponse = (data: any): data is APIResponse => {
    if (!data || typeof data !== 'object') return false;
    if (!data.success) return false;
    if (!Array.isArray(data.students)) return false;
    
    // Validate each student record has required fields
    return data.students.every((student: any) => 
      typeof student.studentId === 'string' &&
      typeof student.name === 'string' &&
      typeof student.shirtCollected === 'boolean' &&
      typeof student.mealCollected === 'boolean' &&
      typeof student.consented === 'boolean'
    );
  };

  /**
   * Parse API student record into extended StudentRecord
   */
  const parseStudentRecord = (apiStudent: APIStudentRecord): StudentRecord => {
    const { clubs, hasPerformance, hasBooth } = parseOrganizationDetails(
      apiStudent.organizationDetails
    );

    return {
      studentId: apiStudent.studentId,
      name: apiStudent.name,
      tshirtSize: apiStudent.tshirtSize || '',
      mealPreference: apiStudent.mealPreference || '',
      shirtCollected: apiStudent.shirtCollected,
      mealCollected: apiStudent.mealCollected,
      consented: apiStudent.consented,
      clubs,
      hasPerformance,
      hasBooth
    };
  };

  /**
   * Fetch student data from API
   */
  const fetchStudents = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/students/all');

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Validate response format
      if (!validateAPIResponse(data)) {
        throw new Error('Invalid response format from server');
      }

      // Parse organization details for each student
      const parsedStudents = data.students.map(parseStudentRecord);
      
      setStudents(parsedStudents);
    } catch (err: any) {
      console.error('Error fetching students:', err);
      setError(err.message || 'Failed to load student data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch data on mount
  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  return {
    students,
    isLoading,
    error,
    refetch: fetchStudents
  };
}
