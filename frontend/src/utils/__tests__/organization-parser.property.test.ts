/**
 * Property-based tests for organization details parser
 * 
 * Feature: admin-table-enhancements
 * Property 21: Organization details parser extracts correct information
 * 
 * **Validates: Requirements 6.5**
 * 
 * For any valid organization details string, the parser should correctly extract
 * all club names, performance involvement status, and booth involvement status.
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { parseOrganizationDetails } from '../tableUtils';

describe('Property: Organization details parser extracts correct information', () => {
  // Arbitrary for generating club names
  const clubNameArbitrary = fc.stringMatching(/^[A-Za-z ]{3,30}$/);
  
  // Arbitrary for generating involvement types
  const involvementArbitrary = fc.oneof(
    fc.constant('Performance'),
    fc.constant('Booth'),
    fc.constant('Member'),
    fc.constant('Volunteer'),
    fc.constant('Performance and Booth')
  );
  
  // Arbitrary for generating a single organization entry
  const organizationEntryArbitrary = fc.record({
    club: clubNameArbitrary,
    involvement: involvementArbitrary
  });
  
  it('should extract all clubs from organization details', () => {
    fc.assert(
      fc.property(
        fc.array(organizationEntryArbitrary, { minLength: 1, maxLength: 5 }),
        (entries) => {
          // Build organization details string
          const orgDetails = entries
            .map(e => `Club: ${e.club}, Involvement: ${e.involvement}`)
            .join('; ');
          
          // Parse the string
          const result = parseOrganizationDetails(orgDetails);
          
          // All clubs should be extracted (trimmed)
          expect(result.clubs).toHaveLength(entries.length);
          entries.forEach(entry => {
            expect(result.clubs).toContain(entry.club.trim());
          });
        }
      ),
      { numRuns: 100 }
    );
  });
  
  it('should correctly identify performance involvement', () => {
    fc.assert(
      fc.property(
        clubNameArbitrary,
        fc.boolean(),
        (clubName, hasPerformance) => {
          const involvement = hasPerformance ? 'Performance' : 'Member';
          const orgDetails = `Club: ${clubName}, Involvement: ${involvement}`;
          
          const result = parseOrganizationDetails(orgDetails);
          
          expect(result.hasPerformance).toBe(hasPerformance);
        }
      ),
      { numRuns: 100 }
    );
  });
  
  it('should correctly identify booth involvement', () => {
    fc.assert(
      fc.property(
        clubNameArbitrary,
        fc.boolean(),
        (clubName, hasBooth) => {
          const involvement = hasBooth ? 'Booth' : 'Member';
          const orgDetails = `Club: ${clubName}, Involvement: ${involvement}`;
          
          const result = parseOrganizationDetails(orgDetails);
          
          expect(result.hasBooth).toBe(hasBooth);
        }
      ),
      { numRuns: 100 }
    );
  });
  
  it('should handle multiple entries with mixed involvement types', () => {
    fc.assert(
      fc.property(
        fc.array(organizationEntryArbitrary, { minLength: 1, maxLength: 5 }),
        (entries) => {
          const orgDetails = entries
            .map(e => `Club: ${e.club}, Involvement: ${e.involvement}`)
            .join('; ');
          
          const result = parseOrganizationDetails(orgDetails);
          
          // Check if any entry has performance
          const expectedPerformance = entries.some(e => 
            e.involvement.toLowerCase().includes('performance')
          );
          expect(result.hasPerformance).toBe(expectedPerformance);
          
          // Check if any entry has booth
          const expectedBooth = entries.some(e => 
            e.involvement.toLowerCase().includes('booth')
          );
          expect(result.hasBooth).toBe(expectedBooth);
        }
      ),
      { numRuns: 100 }
    );
  });
  
  it('should be case-insensitive for involvement keywords', () => {
    fc.assert(
      fc.property(
        clubNameArbitrary,
        fc.constantFrom('performance', 'PERFORMANCE', 'Performance', 'PeRfOrMaNcE'),
        (clubName, involvementCase) => {
          const orgDetails = `Club: ${clubName}, Involvement: ${involvementCase}`;
          
          const result = parseOrganizationDetails(orgDetails);
          
          expect(result.hasPerformance).toBe(true);
        }
      ),
      { numRuns: 50 }
    );
    
    fc.assert(
      fc.property(
        clubNameArbitrary,
        fc.constantFrom('booth', 'BOOTH', 'Booth', 'BoOtH'),
        (clubName, involvementCase) => {
          const orgDetails = `Club: ${clubName}, Involvement: ${involvementCase}`;
          
          const result = parseOrganizationDetails(orgDetails);
          
          expect(result.hasBooth).toBe(true);
        }
      ),
      { numRuns: 50 }
    );
  });
  
  it('should handle empty or undefined input gracefully', () => {
    fc.assert(
      fc.property(
        fc.option(fc.constant(''), { nil: undefined }),
        (input) => {
          const result = parseOrganizationDetails(input);
          
          expect(result.clubs).toEqual([]);
          expect(result.hasPerformance).toBe(false);
          expect(result.hasBooth).toBe(false);
        }
      ),
      { numRuns: 50 }
    );
  });
  
  it('should preserve club name whitespace and formatting', () => {
    fc.assert(
      fc.property(
        fc.stringMatching(/^[A-Za-z ]{3,30}$/),
        involvementArbitrary,
        (clubName, involvement) => {
          const orgDetails = `Club: ${clubName}, Involvement: ${involvement}`;
          
          const result = parseOrganizationDetails(orgDetails);
          
          // Club name should be trimmed but otherwise preserved
          expect(result.clubs[0]).toBe(clubName.trim());
        }
      ),
      { numRuns: 100 }
    );
  });
});
