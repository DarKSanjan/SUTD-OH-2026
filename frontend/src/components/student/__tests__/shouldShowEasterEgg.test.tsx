import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

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

describe('shouldShowEasterEgg', () => {
  describe('special student ID 1009104', () => {
    it('always returns true for student ID 1009104', () => {
      // Test multiple times to ensure it's always true
      for (let i = 0; i < 100; i++) {
        expect(shouldShowEasterEgg('1009104')).toBe(true);
      }
    });
  });

  describe('other student IDs', () => {
    let originalRandom: () => number;

    beforeEach(() => {
      originalRandom = Math.random;
    });

    afterEach(() => {
      Math.random = originalRandom;
    });

    it('returns true when random value is less than 1/75', () => {
      // Mock Math.random to return a value less than 1/75
      Math.random = vi.fn(() => 0.01); // 0.01 < 1/75 (0.0133...)
      
      expect(shouldShowEasterEgg('ABC123')).toBe(true);
    });

    it('returns false when random value is greater than or equal to 1/75', () => {
      // Mock Math.random to return a value greater than 1/75
      Math.random = vi.fn(() => 0.02); // 0.02 > 1/75 (0.0133...)
      
      expect(shouldShowEasterEgg('ABC123')).toBe(false);
    });

    it('returns false when random value is exactly at the boundary', () => {
      // Mock Math.random to return exactly 1/75
      Math.random = vi.fn(() => 1 / 75);
      
      expect(shouldShowEasterEgg('XYZ789')).toBe(false);
    });

    it('generates different results across multiple calls (session independence)', () => {
      // Use real Math.random to test randomness
      Math.random = originalRandom;
      
      const results = new Set<boolean>();
      
      // Run many trials - with 1/75 probability, we should see both true and false
      // With 1000 trials, probability of seeing at least one true is ~99.99%
      for (let i = 0; i < 1000; i++) {
        results.add(shouldShowEasterEgg('TEST123'));
      }
      
      // We should have seen both true and false results
      expect(results.size).toBe(2);
      expect(results.has(true)).toBe(true);
      expect(results.has(false)).toBe(true);
    });

    it('uses Math.random for randomization', () => {
      const mockRandom = vi.fn(() => 0.005);
      Math.random = mockRandom;
      
      shouldShowEasterEgg('STUDENT456');
      
      expect(mockRandom).toHaveBeenCalled();
    });
  });

  describe('edge cases', () => {
    it('handles empty string student ID', () => {
      // Should not crash and should use random logic
      const result = shouldShowEasterEgg('');
      expect(typeof result).toBe('boolean');
    });

    it('handles student IDs similar to 1009104', () => {
      // These should NOT always return true
      Math.random = vi.fn(() => 0.5); // Always false for non-special IDs
      
      expect(shouldShowEasterEgg('1009103')).toBe(false);
      expect(shouldShowEasterEgg('1009105')).toBe(false);
      expect(shouldShowEasterEgg('10091040')).toBe(false);
      expect(shouldShowEasterEgg('01009104')).toBe(false);
    });
  });
});
