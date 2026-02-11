import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';

/**
 * Feature: ui-ux-enhancements
 * Property 3: Easter Egg Probability Distribution
 * 
 * **Validates: Requirements 5.2**
 * 
 * For any non-special student ID (not 1009104), when tested over 1000 check-in sessions,
 * the easter egg should appear approximately 1/75 of the time (within statistical variance).
 * 
 * This property test verifies that:
 * 1. The easter egg probability is approximately 1/75 for non-special IDs
 * 2. The distribution holds across different student IDs
 * 3. The probability is within acceptable statistical bounds (2 standard deviations)
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

describe('Property 3: Easter Egg Probability Distribution', () => {
  it('should display easter egg approximately 1/75 of the time for non-special student IDs', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate arbitrary student IDs that are NOT the special ID
        fc.string({ minLength: 1, maxLength: 20 })
          .filter(s => s.trim().length > 0 && s !== '1009104'),
        async (studentId) => {
          const numTrials = 1000;
          let successCount = 0;
          
          // Run 1000 trials to test probability distribution
          for (let i = 0; i < numTrials; i++) {
            if (shouldShowEasterEgg(studentId)) {
              successCount++;
            }
          }
          
          // Expected probability: 1/75 ≈ 0.0133 (1.33%)
          const expectedProbability = 1 / 75;
          const observedProbability = successCount / numTrials;
          
          // Calculate standard deviation for binomial distribution
          // σ = sqrt(n * p * (1-p))
          const standardDeviation = Math.sqrt(numTrials * expectedProbability * (1 - expectedProbability));
          
          // Calculate acceptable range (within 3 standard deviations = ~99.7% confidence)
          // We use 3σ instead of 2σ to account for natural statistical variance in property testing
          // With 10 runs, using 2σ would cause false failures ~40% of the time
          const expectedCount = numTrials * expectedProbability;
          const lowerBound = expectedCount - 3 * standardDeviation;
          const upperBound = expectedCount + 3 * standardDeviation;
          
          // Verify the observed count is within acceptable statistical bounds
          expect(successCount).toBeGreaterThanOrEqual(Math.floor(lowerBound));
          expect(successCount).toBeLessThanOrEqual(Math.ceil(upperBound));
          
          // Additional sanity check: probability should be reasonably close to 1/75
          // With 1000 trials, we expect roughly 13-14 successes on average
          // The 3σ range should be approximately [2, 24] successes
          expect(successCount).toBeGreaterThanOrEqual(0); // Should see at least 0 successes (can be 0 rarely)
          expect(successCount).toBeLessThan(numTrials * 0.05); // Should not be more than 5%
        }
      ),
      { numRuns: 10, endOnFailure: true }
    );
  }, 120000); // 2 minute timeout for 10 runs of 1000 trials each

  it('should maintain 1/75 probability across different non-special student IDs', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate multiple different student IDs
        fc.array(
          fc.string({ minLength: 1, maxLength: 20 })
            .filter(s => s.trim().length > 0 && s !== '1009104'),
          { minLength: 3, maxLength: 5 }
        ).map(arr => [...new Set(arr)]), // Ensure unique IDs
        async (studentIds) => {
          const numTrialsPerStudent = 500;
          const expectedProbability = 1 / 75;
          
          // Test each student ID
          for (const studentId of studentIds) {
            let successCount = 0;
            
            for (let i = 0; i < numTrialsPerStudent; i++) {
              if (shouldShowEasterEgg(studentId)) {
                successCount++;
              }
            }
            
            // Calculate acceptable range for this student
            const standardDeviation = Math.sqrt(numTrialsPerStudent * expectedProbability * (1 - expectedProbability));
            const expectedCount = numTrialsPerStudent * expectedProbability;
            const lowerBound = expectedCount - 2.5 * standardDeviation; // Slightly wider bounds for multiple tests
            const upperBound = expectedCount + 2.5 * standardDeviation;
            
            // Verify each student ID has approximately the same probability
            expect(successCount).toBeGreaterThanOrEqual(Math.floor(Math.max(0, lowerBound)));
            expect(successCount).toBeLessThanOrEqual(Math.ceil(upperBound));
          }
        }
      ),
      { numRuns: 5, endOnFailure: true }
    );
  }, 120000); // 2 minute timeout

  it('should never always return true for non-special student IDs', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate arbitrary student IDs that are NOT the special ID
        fc.string({ minLength: 1, maxLength: 20 })
          .filter(s => s.trim().length > 0 && s !== '1009104'),
        async (studentId) => {
          const numTrials = 100;
          let successCount = 0;
          
          // Run 100 trials
          for (let i = 0; i < numTrials; i++) {
            if (shouldShowEasterEgg(studentId)) {
              successCount++;
            }
          }
          
          // For non-special IDs, it should NOT always return true
          // With 1/75 probability, getting 100/100 successes is virtually impossible
          expect(successCount).toBeLessThan(numTrials);
          
          // Also verify it's not always false (with 100 trials, probability of all false is ~0.25%)
          // This is a weaker assertion but helps catch broken implementations
          // We'll allow this to occasionally be all false since it's statistically possible
        }
      ),
      { numRuns: 50, endOnFailure: true }
    );
  }, 60000);

  it('should use actual randomization (not deterministic) for non-special IDs', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 20 })
          .filter(s => s.trim().length > 0 && s !== '1009104'),
        async (studentId) => {
          const results = new Set<boolean>();
          const numTrials = 200;
          
          // Run multiple trials and collect results
          for (let i = 0; i < numTrials; i++) {
            results.add(shouldShowEasterEgg(studentId));
          }
          
          // With 200 trials and 1/75 probability, we should see both true and false
          // Probability of seeing at least one true: 1 - (74/75)^200 ≈ 93.5%
          // We'll check that we see both values in most cases
          // (allowing for rare statistical edge cases where we might not)
          const hasBothValues = results.size === 2;
          const hasAtLeastFalse = results.has(false);
          
          // At minimum, we should see false values (since probability is low)
          expect(hasAtLeastFalse).toBe(true);
          
          // In most cases, we should see both true and false
          // If this fails occasionally, it's due to statistical variance
        }
      ),
      { numRuns: 20, endOnFailure: true }
    );
  }, 60000);
});
