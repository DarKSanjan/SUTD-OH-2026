import { describe, it, expect } from 'vitest';
import { parseOrganizationDetails } from '../Student';

/**
 * Unit tests for organization details parsing
 * Tests the parseOrganizationDetails function with various input formats
 */
describe('parseOrganizationDetails', () => {
  it('should parse single organization involvement', () => {
    const input = 'Club: Tech Club, Involvement: Member';
    const result = parseOrganizationDetails(input);
    
    expect(result).toEqual([
      { club: 'Tech Club', role: 'Member' }
    ]);
  });

  it('should parse multiple organization involvements', () => {
    const input = 'Club: Tech Club, Involvement: Member; Club: Science Club, Involvement: Volunteer';
    const result = parseOrganizationDetails(input);
    
    expect(result).toEqual([
      { club: 'Tech Club', role: 'Member' },
      { club: 'Science Club', role: 'Volunteer' }
    ]);
  });

  it('should handle empty string', () => {
    const result = parseOrganizationDetails('');
    expect(result).toEqual([]);
  });

  it('should handle undefined', () => {
    const result = parseOrganizationDetails(undefined);
    expect(result).toEqual([]);
  });

  it('should handle whitespace-only string', () => {
    const result = parseOrganizationDetails('   ');
    expect(result).toEqual([]);
  });

  it('should trim whitespace from club names and roles', () => {
    const input = 'Club:  Tech Club  , Involvement:  Member  ';
    const result = parseOrganizationDetails(input);
    
    expect(result).toEqual([
      { club: 'Tech Club', role: 'Member' }
    ]);
  });

  it('should handle multiple involvements with extra whitespace', () => {
    const input = 'Club: Tech Club, Involvement: Member  ;  Club: Science Club, Involvement: Volunteer';
    const result = parseOrganizationDetails(input);
    
    expect(result).toEqual([
      { club: 'Tech Club', role: 'Member' },
      { club: 'Science Club', role: 'Volunteer' }
    ]);
  });

  it('should handle case-insensitive field names', () => {
    const input = 'club: Tech Club, involvement: Member';
    const result = parseOrganizationDetails(input);
    
    expect(result).toEqual([
      { club: 'Tech Club', role: 'Member' }
    ]);
  });

  it('should skip malformed entries', () => {
    const input = 'Club: Tech Club, Involvement: Member; Invalid Entry; Club: Science Club, Involvement: Volunteer';
    const result = parseOrganizationDetails(input);
    
    expect(result).toEqual([
      { club: 'Tech Club', role: 'Member' },
      { club: 'Science Club', role: 'Volunteer' }
    ]);
  });

  it('should handle entries with only club name', () => {
    const input = 'Club: Tech Club';
    const result = parseOrganizationDetails(input);
    
    // Should skip entries without both club and role
    expect(result).toEqual([]);
  });

  it('should handle entries with only involvement', () => {
    const input = 'Involvement: Member';
    const result = parseOrganizationDetails(input);
    
    // Should skip entries without both club and role
    expect(result).toEqual([]);
  });

  it('should handle club names with special characters', () => {
    const input = 'Club: Tech & Innovation Club, Involvement: Co-Lead';
    const result = parseOrganizationDetails(input);
    
    expect(result).toEqual([
      { club: 'Tech & Innovation Club', role: 'Co-Lead' }
    ]);
  });

  it('should handle roles with special characters', () => {
    const input = 'Club: Tech Club, Involvement: Member/Volunteer';
    const result = parseOrganizationDetails(input);
    
    expect(result).toEqual([
      { club: 'Tech Club', role: 'Member/Volunteer' }
    ]);
  });
});
