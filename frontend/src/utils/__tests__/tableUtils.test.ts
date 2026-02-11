/**
 * Unit tests for table utility functions
 */

import { describe, it, expect } from 'vitest';
import {
  parseOrganizationDetails,
  applyFilters,
  applySearch,
  applySort
} from '../tableUtils';
import { StudentRecord, FilterCriteria } from '../types';

describe('parseOrganizationDetails', () => {
  it('should return empty data for undefined input', () => {
    const result = parseOrganizationDetails(undefined);
    expect(result).toEqual({
      clubs: [],
      hasPerformance: false,
      hasBooth: false
    });
  });

  it('should return empty data for empty string', () => {
    const result = parseOrganizationDetails('');
    expect(result).toEqual({
      clubs: [],
      hasPerformance: false,
      hasBooth: false
    });
  });

  it('should parse single club with performance involvement', () => {
    const input = 'Club: Tech Club, Involvement: Performance';
    const result = parseOrganizationDetails(input);
    expect(result).toEqual({
      clubs: ['Tech Club'],
      hasPerformance: true,
      hasBooth: false
    });
  });

  it('should parse single club with booth involvement', () => {
    const input = 'Club: Science Club, Involvement: Booth';
    const result = parseOrganizationDetails(input);
    expect(result).toEqual({
      clubs: ['Science Club'],
      hasPerformance: false,
      hasBooth: true
    });
  });

  it('should parse multiple clubs', () => {
    const input = 'Club: Tech Club, Involvement: Performance; Club: Art Club, Involvement: Booth';
    const result = parseOrganizationDetails(input);
    expect(result).toEqual({
      clubs: ['Tech Club', 'Art Club'],
      hasPerformance: true,
      hasBooth: true
    });
  });

  it('should be case-insensitive for involvement types', () => {
    const input = 'Club: Music Club, Involvement: PERFORMANCE; Club: Drama Club, Involvement: booth';
    const result = parseOrganizationDetails(input);
    expect(result).toEqual({
      clubs: ['Music Club', 'Drama Club'],
      hasPerformance: true,
      hasBooth: true
    });
  });

  it('should handle involvement with both performance and booth keywords', () => {
    const input = 'Club: Event Club, Involvement: Performance and Booth';
    const result = parseOrganizationDetails(input);
    expect(result).toEqual({
      clubs: ['Event Club'],
      hasPerformance: true,
      hasBooth: true
    });
  });
});

describe('applySearch', () => {
  const students: StudentRecord[] = [
    {
      studentId: 'S001',
      name: 'John Doe',
      tshirtSize: 'M',
      mealPreference: 'Vegetarian',
      shirtCollected: false,
      mealCollected: false,
      consented: true,
      clubs: [],
      hasPerformance: false,
      hasBooth: false
    },
    {
      studentId: 'S002',
      name: 'Jane Smith',
      tshirtSize: 'L',
      mealPreference: 'Non-Vegetarian',
      shirtCollected: true,
      mealCollected: true,
      consented: true,
      clubs: [],
      hasPerformance: false,
      hasBooth: false
    },
    {
      studentId: 'S003',
      name: 'Bob Johnson',
      tshirtSize: 'XL',
      mealPreference: 'Halal',
      shirtCollected: false,
      mealCollected: true,
      consented: false,
      clubs: [],
      hasPerformance: false,
      hasBooth: false
    }
  ];

  it('should return all students for empty query', () => {
    const result = applySearch(students, '');
    expect(result).toEqual(students);
  });

  it('should filter by student ID', () => {
    const result = applySearch(students, 'S001');
    expect(result).toHaveLength(1);
    expect(result[0].studentId).toBe('S001');
  });

  it('should filter by name', () => {
    const result = applySearch(students, 'Jane');
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Jane Smith');
  });

  it('should be case-insensitive', () => {
    const result = applySearch(students, 'john');
    expect(result).toHaveLength(2); // John Doe and Bob Johnson
    expect(result.map(s => s.name)).toContain('John Doe');
    expect(result.map(s => s.name)).toContain('Bob Johnson');
  });

  it('should match partial strings', () => {
    const result = applySearch(students, 'S00');
    expect(result).toHaveLength(3); // All students match
  });
});

describe('applyFilters', () => {
  const students: StudentRecord[] = [
    {
      studentId: 'S001',
      name: 'John Doe',
      tshirtSize: 'M',
      mealPreference: 'Vegetarian',
      shirtCollected: true,
      mealCollected: false,
      consented: true,
      clubs: ['Tech Club'],
      hasPerformance: true,
      hasBooth: false
    },
    {
      studentId: 'S002',
      name: 'Jane Smith',
      tshirtSize: 'L',
      mealPreference: 'Non-Vegetarian',
      shirtCollected: false,
      mealCollected: true,
      consented: true,
      clubs: ['Art Club', 'Music Club'],
      hasPerformance: false,
      hasBooth: true
    },
    {
      studentId: 'S003',
      name: 'Bob Johnson',
      tshirtSize: 'XL',
      mealPreference: 'Halal',
      shirtCollected: true,
      mealCollected: true,
      consented: false,
      clubs: ['Tech Club', 'Science Club'],
      hasPerformance: true,
      hasBooth: true
    }
  ];

  it('should return all students when no filters are active', () => {
    const filters: FilterCriteria = {
      clubs: [],
      hasPerformance: null,
      hasBooth: null,
      shirtCollected: null,
      mealCollected: null
    };
    const result = applyFilters(students, filters);
    expect(result).toEqual(students);
  });

  it('should filter by club', () => {
    const filters: FilterCriteria = {
      clubs: ['Tech Club'],
      hasPerformance: null,
      hasBooth: null,
      shirtCollected: null,
      mealCollected: null
    };
    const result = applyFilters(students, filters);
    expect(result).toHaveLength(2);
    expect(result.map(s => s.studentId)).toContain('S001');
    expect(result.map(s => s.studentId)).toContain('S003');
  });

  it('should filter by performance involvement', () => {
    const filters: FilterCriteria = {
      clubs: [],
      hasPerformance: true,
      hasBooth: null,
      shirtCollected: null,
      mealCollected: null
    };
    const result = applyFilters(students, filters);
    expect(result).toHaveLength(2);
    expect(result.map(s => s.studentId)).toContain('S001');
    expect(result.map(s => s.studentId)).toContain('S003');
  });

  it('should filter by booth involvement', () => {
    const filters: FilterCriteria = {
      clubs: [],
      hasPerformance: null,
      hasBooth: true,
      shirtCollected: null,
      mealCollected: null
    };
    const result = applyFilters(students, filters);
    expect(result).toHaveLength(2);
    expect(result.map(s => s.studentId)).toContain('S002');
    expect(result.map(s => s.studentId)).toContain('S003');
  });

  it('should filter by shirt collection status', () => {
    const filters: FilterCriteria = {
      clubs: [],
      hasPerformance: null,
      hasBooth: null,
      shirtCollected: true,
      mealCollected: null
    };
    const result = applyFilters(students, filters);
    expect(result).toHaveLength(2);
    expect(result.map(s => s.studentId)).toContain('S001');
    expect(result.map(s => s.studentId)).toContain('S003');
  });

  it('should filter by meal collection status', () => {
    const filters: FilterCriteria = {
      clubs: [],
      hasPerformance: null,
      hasBooth: null,
      shirtCollected: null,
      mealCollected: true
    };
    const result = applyFilters(students, filters);
    expect(result).toHaveLength(2);
    expect(result.map(s => s.studentId)).toContain('S002');
    expect(result.map(s => s.studentId)).toContain('S003');
  });

  it('should combine multiple filters with AND logic', () => {
    const filters: FilterCriteria = {
      clubs: ['Tech Club'],
      hasPerformance: true,
      hasBooth: null,
      shirtCollected: true,
      mealCollected: null
    };
    const result = applyFilters(students, filters);
    expect(result).toHaveLength(2); // S001 and S003 match all criteria
  });

  it('should return empty array when no students match all criteria', () => {
    const filters: FilterCriteria = {
      clubs: ['Art Club'],
      hasPerformance: true,
      hasBooth: null,
      shirtCollected: null,
      mealCollected: null
    };
    const result = applyFilters(students, filters);
    expect(result).toHaveLength(0);
  });
});

describe('applySort', () => {
  const students: StudentRecord[] = [
    {
      studentId: 'S003',
      name: 'Charlie',
      tshirtSize: 'L',
      mealPreference: 'Vegetarian',
      shirtCollected: false,
      mealCollected: true,
      consented: true,
      clubs: [],
      hasPerformance: false,
      hasBooth: false
    },
    {
      studentId: 'S001',
      name: 'Alice',
      tshirtSize: 'M',
      mealPreference: 'Non-Vegetarian',
      shirtCollected: true,
      mealCollected: false,
      consented: true,
      clubs: [],
      hasPerformance: false,
      hasBooth: false
    },
    {
      studentId: 'S002',
      name: 'Bob',
      tshirtSize: 'XL',
      mealPreference: 'Halal',
      shirtCollected: true,
      mealCollected: true,
      consented: false,
      clubs: [],
      hasPerformance: false,
      hasBooth: false
    }
  ];

  it('should return original array when no sort is applied', () => {
    const result = applySort(students, null, null);
    expect(result).toEqual(students);
  });

  it('should sort by studentId ascending', () => {
    const result = applySort(students, 'studentId', 'asc');
    expect(result[0].studentId).toBe('S001');
    expect(result[1].studentId).toBe('S002');
    expect(result[2].studentId).toBe('S003');
  });

  it('should sort by studentId descending', () => {
    const result = applySort(students, 'studentId', 'desc');
    expect(result[0].studentId).toBe('S003');
    expect(result[1].studentId).toBe('S002');
    expect(result[2].studentId).toBe('S001');
  });

  it('should sort by name ascending (case-insensitive)', () => {
    const result = applySort(students, 'name', 'asc');
    expect(result[0].name).toBe('Alice');
    expect(result[1].name).toBe('Bob');
    expect(result[2].name).toBe('Charlie');
  });

  it('should sort by name descending', () => {
    const result = applySort(students, 'name', 'desc');
    expect(result[0].name).toBe('Charlie');
    expect(result[1].name).toBe('Bob');
    expect(result[2].name).toBe('Alice');
  });

  it('should sort by shirtCollected ascending (false before true)', () => {
    const result = applySort(students, 'shirtCollected', 'asc');
    expect(result[0].shirtCollected).toBe(false);
    expect(result[1].shirtCollected).toBe(true);
    expect(result[2].shirtCollected).toBe(true);
  });

  it('should sort by mealCollected descending (true before false)', () => {
    const result = applySort(students, 'mealCollected', 'desc');
    expect(result[0].mealCollected).toBe(true);
    expect(result[1].mealCollected).toBe(true);
    expect(result[2].mealCollected).toBe(false);
  });

  it('should sort by tshirtSize ascending', () => {
    const result = applySort(students, 'tshirtSize', 'asc');
    expect(result[0].tshirtSize).toBe('L');
    expect(result[1].tshirtSize).toBe('M');
    expect(result[2].tshirtSize).toBe('XL');
  });

  it('should sort by tshirtSize descending', () => {
    const result = applySort(students, 'tshirtSize', 'desc');
    expect(result[0].tshirtSize).toBe('XL');
    expect(result[1].tshirtSize).toBe('M');
    expect(result[2].tshirtSize).toBe('L');
  });

  it('should sort by mealPreference ascending', () => {
    const result = applySort(students, 'mealPreference', 'asc');
    expect(result[0].mealPreference).toBe('Halal');
    expect(result[1].mealPreference).toBe('Non-Vegetarian');
    expect(result[2].mealPreference).toBe('Vegetarian');
  });

  it('should sort by mealPreference descending', () => {
    const result = applySort(students, 'mealPreference', 'desc');
    expect(result[0].mealPreference).toBe('Vegetarian');
    expect(result[1].mealPreference).toBe('Non-Vegetarian');
    expect(result[2].mealPreference).toBe('Halal');
  });

  it('should sort empty tshirtSize values last in ascending order', () => {
    const studentsWithEmpty: StudentRecord[] = [
      { ...students[0], tshirtSize: 'M' },
      { ...students[1], tshirtSize: '' },
      { ...students[2], tshirtSize: 'L' }
    ];
    const result = applySort(studentsWithEmpty, 'tshirtSize', 'asc');
    expect(result[0].tshirtSize).toBe('L');
    expect(result[1].tshirtSize).toBe('M');
    expect(result[2].tshirtSize).toBe('');
  });

  it('should sort empty tshirtSize values last in descending order', () => {
    const studentsWithEmpty: StudentRecord[] = [
      { ...students[0], tshirtSize: 'M' },
      { ...students[1], tshirtSize: '' },
      { ...students[2], tshirtSize: 'L' }
    ];
    const result = applySort(studentsWithEmpty, 'tshirtSize', 'desc');
    // Empty values should still sort last even in descending order
    expect(result[0].tshirtSize).toBe('M');
    expect(result[1].tshirtSize).toBe('L');
    expect(result[2].tshirtSize).toBe('');
  });

  it('should sort empty mealPreference values last in ascending order', () => {
    const studentsWithEmpty: StudentRecord[] = [
      { ...students[0], mealPreference: 'Vegetarian' },
      { ...students[1], mealPreference: '' },
      { ...students[2], mealPreference: 'Halal' }
    ];
    const result = applySort(studentsWithEmpty, 'mealPreference', 'asc');
    expect(result[0].mealPreference).toBe('Halal');
    expect(result[1].mealPreference).toBe('Vegetarian');
    expect(result[2].mealPreference).toBe('');
  });

  it('should sort empty mealPreference values last in descending order', () => {
    const studentsWithEmpty: StudentRecord[] = [
      { ...students[0], mealPreference: 'Vegetarian' },
      { ...students[1], mealPreference: '' },
      { ...students[2], mealPreference: 'Halal' }
    ];
    const result = applySort(studentsWithEmpty, 'mealPreference', 'desc');
    // Empty values should still sort last even in descending order
    expect(result[0].mealPreference).toBe('Vegetarian');
    expect(result[1].mealPreference).toBe('Halal');
    expect(result[2].mealPreference).toBe('');
  });

  it('should not mutate original array', () => {
    const original = [...students];
    applySort(students, 'name', 'asc');
    expect(students).toEqual(original);
  });
});
