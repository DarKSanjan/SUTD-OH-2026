import { useState, useCallback, useRef } from 'react';
import { StudentRecord } from '../utils/types';

/**
 * API response structure from /api/distribution-status
 */
interface DistributionStatusResponse {
  success: boolean;
  claim?: {
    studentId: string;
    tshirtClaimed: boolean;
    mealClaimed: boolean;
  };
  error?: string;
}

/**
 * Return type for useOptimisticUpdate hook
 */
export interface UseOptimisticUpdateReturn {
  updateClaimStatus: (
    studentId: string,
    itemType: 'tshirt' | 'meal',
    collected: boolean
  ) => Promise<void>;
  pendingUpdates: Set<string>;
  error: string | null;
  clearError: () => void;
}

/**
 * Custom hook for optimistic UI updates with rollback on failure
 * 
 * Implements the optimistic update pattern for checkbox interactions:
 * 1. Updates UI immediately (optimistic)
 * 2. Calls API in background
 * 3. Confirms update on success
 * 4. Rolls back on failure with error notification
 * 
 * Prevents race conditions by tracking pending updates per checkbox.
 * 
 * @param students - Current array of student records
 * @param setStudents - State setter function to update students
 * @returns Object with updateClaimStatus function, pending updates set, and error state
 * 
 * @example
 * ```tsx
 * const [students, setStudents] = useState<StudentRecord[]>([]);
 * const { updateClaimStatus, pendingUpdates, error } = useOptimisticUpdate(students, setStudents);
 * 
 * const isPending = pendingUpdates.has(`${studentId}-tshirt`);
 * 
 * <input
 *   type="checkbox"
 *   checked={student.shirtCollected}
 *   disabled={isPending}
 *   onChange={() => updateClaimStatus(studentId, 'tshirt', !student.shirtCollected)}
 * />
 * ```
 */
export function useOptimisticUpdate(
  students: StudentRecord[],
  setStudents: React.Dispatch<React.SetStateAction<StudentRecord[]>>
): UseOptimisticUpdateReturn {
  // Track pending updates to prevent race conditions
  const [pendingUpdates, setPendingUpdates] = useState<Set<string>>(new Set());
  
  // Track error state
  const [error, setError] = useState<string | null>(null);
  
  // Store previous state for rollback (using ref to avoid stale closures)
  const previousStateRef = useRef<Map<string, StudentRecord>>(new Map());

  /**
   * Clear error message
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Update a student's claim status in the state
   */
  const updateStudentInState = useCallback((
    studentId: string,
    itemType: 'tshirt' | 'meal',
    collected: boolean
  ) => {
    setStudents(prevStudents => 
      prevStudents.map(student => 
        student.studentId === studentId
          ? {
              ...student,
              [itemType === 'tshirt' ? 'shirtCollected' : 'mealCollected']: collected
            }
          : student
      )
    );
  }, [setStudents]);

  /**
   * Update claim status with optimistic UI and rollback on failure
   */
  const updateClaimStatus = useCallback(async (
    studentId: string,
    itemType: 'tshirt' | 'meal',
    collected: boolean
  ) => {
    const updateKey = `${studentId}-${itemType}`;
    
    // Prevent concurrent updates to the same checkbox
    if (pendingUpdates.has(updateKey)) {
      return; // Silently ignore duplicate clicks
    }

    // Clear previous error
    setError(null);

    // Find and store previous state for rollback
    const previousStudent = students.find(s => s.studentId === studentId);
    if (!previousStudent) {
      setError('Student not found');
      return;
    }
    previousStateRef.current.set(updateKey, previousStudent);

    // Mark update as pending
    setPendingUpdates(prev => new Set(prev).add(updateKey));

    // Optimistic update - update UI immediately
    updateStudentInState(studentId, itemType, collected);

    try {
      // Call API
      const response = await fetch('/api/distribution-status', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentId,
          itemType,
          collected
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data: DistributionStatusResponse = await response.json();

      // Validate response
      if (!data.success || !data.claim) {
        throw new Error('Invalid response format from server');
      }

      // Confirm update with server data (in case server modified the value)
      updateStudentInState(
        studentId,
        itemType,
        itemType === 'tshirt' ? data.claim.tshirtClaimed : data.claim.mealClaimed
      );

    } catch (err: any) {
      console.error('Error updating distribution status:', err);
      
      // Rollback optimistic update on failure
      const previousStudent = previousStateRef.current.get(updateKey);
      if (previousStudent) {
        const previousValue = itemType === 'tshirt' 
          ? previousStudent.shirtCollected 
          : previousStudent.mealCollected;
        updateStudentInState(studentId, itemType, previousValue);
      }

      // Set error message
      if (err.message?.includes('404') || err.message?.includes('not found')) {
        setError('Student not found. Please refresh the page.');
      } else if (err.message?.includes('network') || err.message?.includes('fetch')) {
        setError('Unable to connect to server. Please check your connection and try again.');
      } else {
        setError(err.message || 'Failed to update distribution status');
      }
    } finally {
      // Clear pending state
      setPendingUpdates(prev => {
        const next = new Set(prev);
        next.delete(updateKey);
        return next;
      });
      
      // Clean up previous state
      previousStateRef.current.delete(updateKey);
    }
  }, [students, pendingUpdates, updateStudentInState]);

  return {
    updateClaimStatus,
    pendingUpdates,
    error,
    clearError
  };
}
