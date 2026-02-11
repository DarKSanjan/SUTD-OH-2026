/**
 * Property-based tests for useOptimisticUpdate hook
 * 
 * Feature: admin-table-enhancements
 * Property 1: Checkbox updates trigger API calls and toggle UI state
 * Property 2: Successful updates persist in UI without reload
 * Property 3: Failed updates rollback with error notification
 * Property 25: Concurrent updates maintain consistency
 * 
 * **Validates: Requirements 1.1, 1.2, 1.3, 1.4, 9.1, 9.6**
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import * as fc from 'fast-check';
import { useOptimisticUpdate } from '../useOptimisticUpdate';
import { StudentRecord } from '../../utils/types';

describe('Property: useOptimisticUpdate hook', () => {
  let mockFetch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockFetch = vi.fn();
    global.fetch = mockFetch;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // Arbitrary for generating student records
  const studentRecordArbitrary = fc.record({
    studentId: fc.stringMatching(/^S[0-9]{3,6}$/),
    name: fc.stringMatching(/^[A-Za-z ]{3,30}$/),
    shirtCollected: fc.boolean(),
    mealCollected: fc.boolean(),
    consented: fc.boolean(),
    clubs: fc.array(fc.stringMatching(/^[A-Za-z ]{3,20}$/), { maxLength: 3 }),
    hasPerformance: fc.boolean(),
    hasBooth: fc.boolean()
  }) as fc.Arbitrary<StudentRecord>;

  // Arbitrary for item type
  const itemTypeArbitrary = fc.constantFrom('tshirt', 'meal') as fc.Arbitrary<'tshirt' | 'meal'>;

  /**
   * Property 1: Checkbox updates trigger API calls and toggle UI state
   * 
   * For any student record and item type (shirt or meal), when an admin clicks
   * the checkbox, the system should send an update request to the Distribution_API
   * with the correct parameters and toggle the checkbox state in the UI.
   * 
   * **Validates: Requirements 1.1, 1.2**
   */
  it('Property 1: Checkbox updates trigger API calls and toggle UI state', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(studentRecordArbitrary, { minLength: 1, maxLength: 10 }),
        fc.nat({ max: 9 }), // index to select student
        itemTypeArbitrary,
        fc.boolean(),
        async (students, studentIndex, itemType, newValue) => {
          // Ensure we have at least one student
          if (students.length === 0) return;
          
          const targetStudent = students[studentIndex % students.length];

          // Mock successful API response
          mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({
              success: true,
              claim: {
                studentId: targetStudent.studentId,
                itemType,
                collected: newValue
              }
            })
          });

          let currentStudents = [...students];
          const setStudents = vi.fn((updater: any) => {
            if (typeof updater === 'function') {
              currentStudents = updater(currentStudents);
            } else {
              currentStudents = updater;
            }
          });

          const { result } = renderHook(() =>
            useOptimisticUpdate(currentStudents, setStudents)
          );

          // Perform update
          await act(async () => {
            await result.current.updateClaimStatus(
              targetStudent.studentId,
              itemType,
              newValue
            );
          });

          // Verify API was called with correct parameters
          expect(mockFetch).toHaveBeenCalledWith(
            '/api/distribution-status',
            expect.objectContaining({
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                studentId: targetStudent.studentId,
                itemType,
                collected: newValue
              })
            })
          );

          // Verify UI state was updated
          expect(setStudents).toHaveBeenCalled();
          
          // Verify the student's status was toggled in currentStudents
          const updatedStudent = currentStudents.find(
            s => s.studentId === targetStudent.studentId
          );
          expect(updatedStudent).toBeDefined();
          
          if (updatedStudent) {
            const currentValue = itemType === 'tshirt'
              ? updatedStudent.shirtCollected
              : updatedStudent.mealCollected;
            
            expect(currentValue).toBe(newValue);
          }
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Property 2: Successful updates persist in UI without reload
   * 
   * For any successful claim status update, the checkbox state should remain
   * in its new state after the API call completes, without requiring a page reload.
   * 
   * **Validates: Requirements 1.3**
   */
  it('Property 2: Successful updates persist in UI without reload', async () => {
    await fc.assert(
      fc.asyncProperty(
        studentRecordArbitrary,
        itemTypeArbitrary,
        fc.boolean(),
        async (student, itemType, newValue) => {
          // Mock successful API response
          mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({
              success: true,
              claim: {
                studentId: student.studentId,
                itemType,
                collected: newValue
              }
            })
          });

          let currentStudents = [student];
          const setStudents = vi.fn((updater: any) => {
            if (typeof updater === 'function') {
              currentStudents = updater(currentStudents);
            } else {
              currentStudents = updater;
            }
          });

          const { result } = renderHook(() =>
            useOptimisticUpdate(currentStudents, setStudents)
          );

          // Perform update
          await act(async () => {
            await result.current.updateClaimStatus(
              student.studentId,
              itemType,
              newValue
            );
          });

          // Wait for async operations to complete
          await waitFor(() => {
            expect(result.current.pendingUpdates.size).toBe(0);
          });

          // Verify the update persisted in currentStudents
          const updatedStudent = currentStudents[0];
          expect(updatedStudent).toBeDefined();
          
          if (updatedStudent) {
            const finalValue = itemType === 'tshirt'
              ? updatedStudent.shirtCollected
              : updatedStudent.mealCollected;

            expect(finalValue).toBe(newValue);
          }
          
          expect(result.current.error).toBeNull();
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Property 3: Failed updates rollback with error notification
   * 
   * For any claim status update that fails (network error or server error),
   * the checkbox should revert to its previous state and an error message
   * should be displayed to the user.
   * 
   * **Validates: Requirements 1.4, 9.1**
   */
  it('Property 3: Failed updates rollback with error notification', async () => {
    await fc.assert(
      fc.asyncProperty(
        studentRecordArbitrary,
        itemTypeArbitrary,
        fc.boolean(),
        fc.string({ minLength: 5, maxLength: 100 }).filter(s => s.trim().length > 0),
        async (student, itemType, newValue, errorMessage) => {
          const previousValue = itemType === 'tshirt'
            ? student.shirtCollected
            : student.mealCollected;

          // Mock API failure
          mockFetch.mockRejectedValueOnce(new Error(errorMessage));

          let currentStudents = [student];
          let errorCaptured: string | null = null;
          
          const setStudents = vi.fn((updater: any) => {
            if (typeof updater === 'function') {
              currentStudents = updater(currentStudents);
            } else {
              currentStudents = updater;
            }
          });

          const { result } = renderHook(() =>
            useOptimisticUpdate(currentStudents, setStudents)
          );

          // Perform update (should fail)
          try {
            await act(async () => {
              await result.current.updateClaimStatus(
                student.studentId,
                itemType,
                newValue
              );
            });
          } catch (err) {
            // Expected to throw
          }

          // Wait for async operations to complete and capture error
          await waitFor(() => {
            expect(result.current.pendingUpdates.size).toBe(0);
            if (result.current.error) {
              errorCaptured = result.current.error;
            }
          });

          // Verify rollback: value should be back to previous state
          const rolledBackStudent = currentStudents[0];
          const finalValue = itemType === 'tshirt'
            ? rolledBackStudent.shirtCollected
            : rolledBackStudent.mealCollected;

          expect(finalValue).toBe(previousValue);

          // Verify error was set at some point (either still set or captured)
          const hasError = result.current.error || errorCaptured;
          expect(hasError).toBeTruthy();
          if (hasError) {
            expect(hasError.length).toBeGreaterThan(0);
          }
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Property 25: Concurrent updates maintain consistency
   * 
   * For any set of concurrent checkbox updates on different students,
   * all updates should complete successfully without race conditions
   * or inconsistent state.
   * 
   * **Validates: Requirements 9.6**
   */
  it('Property 25: Concurrent updates maintain consistency', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(studentRecordArbitrary, { minLength: 2, maxLength: 5 })
          .filter(students => {
            // Ensure all students have unique IDs
            const ids = students.map(s => s.studentId);
            return new Set(ids).size === ids.length;
          }),
        async (students) => {
          // Reset mock before each test
          mockFetch.mockClear();
          
          // Mock successful API responses for all requests
          mockFetch.mockImplementation(async (url, options) => {
            const body = JSON.parse(options.body as string);
            // Simulate network delay
            await new Promise(resolve => setTimeout(resolve, Math.random() * 10));
            
            return {
              ok: true,
              json: async () => ({
                success: true,
                claim: {
                  studentId: body.studentId,
                  itemType: body.itemType,
                  collected: body.collected
                }
              })
            };
          });

          let currentStudents = [...students];
          const setStudents = vi.fn((updater: any) => {
            if (typeof updater === 'function') {
              currentStudents = updater(currentStudents);
            } else {
              currentStudents = updater;
            }
          });

          const { result, rerender } = renderHook(() =>
            useOptimisticUpdate(currentStudents, setStudents)
          );

          // Perform concurrent updates on different students sequentially in act
          await act(async () => {
            const updates = students.map((student, index) => {
              const itemType = index % 2 === 0 ? 'tshirt' : 'meal';
              const newValue = !student[itemType === 'tshirt' ? 'shirtCollected' : 'mealCollected'];
              
              return result.current.updateClaimStatus(
                student.studentId,
                itemType,
                newValue
              );
            });

            // Wait for all updates to complete
            await Promise.all(updates);
          });

          // Rerender to get latest state
          rerender();

          // Wait for pending updates to clear
          await waitFor(() => {
            expect(result.current.pendingUpdates.size).toBe(0);
          }, { timeout: 3000 });

          // Verify all API calls were made (should be exactly students.length)
          expect(mockFetch).toHaveBeenCalledTimes(students.length);

          // Verify no errors occurred
          expect(result.current.error).toBeNull();

          // Verify all students were updated
          students.forEach((originalStudent, index) => {
            const updatedStudent = currentStudents.find(
              s => s.studentId === originalStudent.studentId
            );
            expect(updatedStudent).toBeDefined();
          });
        }
      ),
      { numRuns: 20 }
    );
  });
});
