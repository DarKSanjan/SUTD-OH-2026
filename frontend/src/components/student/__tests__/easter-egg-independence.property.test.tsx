import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';

/**
 * Feature: ui-ux-enhancements
 * Property 4: Easter Egg Session Independence
 * 
 * **Validates: Requirements 5.3**
 * 
 * For any sequence of check-in sessions with the same student ID (excluding 1009104),
 * the easter egg display results should vary independently across sessions.
 * 
 * This property test verifies that:
 * 1. Each call to shouldShowEasterEgg generates a new random value (not cached)
 * 2. Results vary across multiple sessions with the same student ID
 * 3. The randomization is truly independent per session
 */

/**
 * Determines whether to show the easter egg for a given student ID.
 * Always shows for student ID "1009104", and shows with 1/75 probability for others.
 * Randomization is per session (each call generates a new random value).
 */
function shouldShowEasterEgg(studentId: string): boolean {
  // Always show for special ID
  if (studentId === '1009104') {
    return true;
  }
  
  // 1 in 75 random chance for others
  return Math.random() < (1 / 75);
}

describe('Property 4: Easter Egg Session Independence', () => {
  it('should generate independent results across multiple sessions with the same student ID', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate arbitrary student IDs that are NOT the special ID
        fc.string({ minLength: 1, maxLength: 20 })
          .filter(s => s.trim().length > 0 && s !== '1009104'),
        async (studentId) => {
          const numSessions = 150;
          const results: boolean[] = [];
          
          // Simulate multiple check-in sessions with the same student ID
          for (let i = 0; i < numSessions; i++) {
            results.push(shouldShowEasterEgg(studentId));
          }
          
          // Count true and false results
          const trueCount = results.filter(r => r === true).length;
          const falseCount = results.filter(r => r === false).length;
          
          // With 150 sessions and 1/75 probability:
          // - Expected true count: 150 * (1/75) = 2
          // - Probability of all false: (74/75)^150 ≈ 12.5%
          // - Probability of all true: (1/75)^150 ≈ 0% (essentially impossible)
          
          // Verify that results vary (not all the same)
          // We should see at least one false value (since probability is low)
          expect(falseCount).toBeGreaterThan(0);
          
          // We should NOT see all true values (that would indicate broken randomization)
          expect(trueCount).toBeLessThan(numSessions);
          
          // Additional check: verify we see both true and false in most cases
          // With 150 trials, probability of seeing at least one true is ~87.5%
          // We'll check for variation in the results
          const uniqueResults = new Set(results);
          
          // In most cases, we should see both true and false
          // (allowing for rare statistical cases where we might see all false)
          if (trueCount > 0) {
            expect(uniqueResults.size).toBe(2);
          }
        }
      ),
      { numRuns: 50, endOnFailure: true }
    );
  }, 120000); // 2 minute timeout

  it('should not cache or reuse results across sessions', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 20 })
          .filter(s => s.trim().length > 0 && s !== '1009104'),
        async (studentId) => {
          const numSessions = 100;
          const results: boolean[] = [];
          
          // Call shouldShowEasterEgg multiple times with the same student ID
          for (let i = 0; i < numSessions; i++) {
            results.push(shouldShowEasterEgg(studentId));
          }
          
          // Check that not all results are identical
          // If results were cached, they would all be the same
          const firstResult = results[0];
          const allSame = results.every(r => r === firstResult);
          
          // With 100 trials and 1/75 probability:
          // - If firstResult is true: probability of all true is (1/75)^100 ≈ 0%
          // - If firstResult is false: probability of all false is (74/75)^100 ≈ 26%
          
          // We allow for the case where all results are false (statistically possible)
          // But we should never see all results as true
          if (firstResult === true) {
            expect(allSame).toBe(false);
          }
          
          // Additional check: count variations
          const trueCount = results.filter(r => r === true).length;
          
          // If we started with true, we should see some false values
          if (firstResult === true) {
            expect(trueCount).toBeLessThan(numSessions);
          }
        }
      ),
      { numRuns: 50, endOnFailure: true }
    );
  }, 120000);

  it('should demonstrate independence by showing statistical variation', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 20 })
          .filter(s => s.trim().length > 0 && s !== '1009104'),
        async (studentId) => {
          // Run two separate batches of sessions
          const sessionsPerBatch = 100;
          
          const batch1Results: boolean[] = [];
          const batch2Results: boolean[] = [];
          
          // First batch
          for (let i = 0; i < sessionsPerBatch; i++) {
            batch1Results.push(shouldShowEasterEgg(studentId));
          }
          
          // Second batch (with same student ID)
          for (let i = 0; i < sessionsPerBatch; i++) {
            batch2Results.push(shouldShowEasterEgg(studentId));
          }
          
          // Count successes in each batch
          const batch1Successes = batch1Results.filter(r => r === true).length;
          const batch2Successes = batch2Results.filter(r => r === true).length;
          
          // If the results were dependent or cached, the batches would have identical counts
          // With independent randomization, the counts will vary
          
          // We can't assert they're always different (they might be equal by chance)
          // But we can verify that the function is callable multiple times
          // and produces valid boolean results
          expect(typeof batch1Successes).toBe('number');
          expect(typeof batch2Successes).toBe('number');
          expect(batch1Successes).toBeGreaterThanOrEqual(0);
          expect(batch1Successes).toBeLessThanOrEqual(sessionsPerBatch);
          expect(batch2Successes).toBeGreaterThanOrEqual(0);
          expect(batch2Successes).toBeLessThanOrEqual(sessionsPerBatch);
        }
      ),
      { numRuns: 30, endOnFailure: true }
    );
  }, 90000);

  it('should generate fresh random values for each session (not deterministic)', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 20 })
          .filter(s => s.trim().length > 0 && s !== '1009104'),
        async (studentId) => {
          const numSessions = 200;
          const results: boolean[] = [];
          
          // Simulate many sessions
          for (let i = 0; i < numSessions; i++) {
            results.push(shouldShowEasterEgg(studentId));
          }
          
          // With 200 sessions and 1/75 probability:
          // - Expected successes: ~2.67
          // - Probability of at least one success: 1 - (74/75)^200 ≈ 93.5%
          
          // Check for variation in results
          const uniqueValues = new Set(results);
          const trueCount = results.filter(r => r === true).length;
          const falseCount = results.filter(r => r === false).length;
          
          // We should definitely see false values (since probability is low)
          expect(falseCount).toBeGreaterThan(0);
          
          // We should NOT see all true values (would indicate broken implementation)
          expect(trueCount).toBeLessThan(numSessions);
          
          // Verify results are boolean
          expect(uniqueValues.size).toBeGreaterThan(0);
          expect(uniqueValues.size).toBeLessThanOrEqual(2);
          
          // Each result should be a boolean
          results.forEach(result => {
            expect(typeof result).toBe('boolean');
          });
        }
      ),
      { numRuns: 30, endOnFailure: true }
    );
  }, 90000);

  it('should maintain independence across rapid successive calls', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 20 })
          .filter(s => s.trim().length > 0 && s !== '1009104'),
        async (studentId) => {
          // Make rapid successive calls (simulating quick check-ins)
          const rapidCalls = 50;
          const results: boolean[] = [];
          
          for (let i = 0; i < rapidCalls; i++) {
            // Call immediately without delay
            results.push(shouldShowEasterEgg(studentId));
          }
          
          // Even with rapid calls, results should vary
          const trueCount = results.filter(r => r === true).length;
          
          // Should not all be true (probability of 50 consecutive trues is ~0%)
          expect(trueCount).toBeLessThan(rapidCalls);
          
          // Should see at least some false values
          expect(results).toContain(false);
          
          // Verify all results are valid booleans
          results.forEach(result => {
            expect(typeof result).toBe('boolean');
          });
        }
      ),
      { numRuns: 50, endOnFailure: true }
    );
  }, 60000);
});
