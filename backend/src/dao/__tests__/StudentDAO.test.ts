import { describe, it, expect, beforeEach } from 'vitest';
import { StudentDAO } from '../StudentDAO';
import { Student } from '../../models/Student';

describe('StudentDAO - consolidateDuplicates', () => {
  let studentDAO: StudentDAO;

  beforeEach(() => {
    studentDAO = new StudentDAO();
  });

  it('should throw error for empty array', () => {
    expect(() => studentDAO.consolidateDuplicates([])).toThrow('Cannot consolidate empty array of students');
  });

  it('should return single student unchanged', () => {
    const student: Student = {
      studentId: 'S001',
      name: 'John Doe',
      tshirtSize: 'M',
      mealPreference: 'Vegetarian',
      organizationDetails: 'Club: Chess Club, Involvement: Member'
    };

    const result = studentDAO.consolidateDuplicates([student]);
    expect(result).toEqual(student);
  });

  it('should select largest t-shirt size (XS < S < M < L < XL < XXL)', () => {
    const students: Student[] = [
      {
        studentId: 'S001',
        name: 'John Doe',
        tshirtSize: 'S',
        mealPreference: 'Vegetarian',
        organizationDetails: 'Club: Chess Club, Involvement: Member'
      },
      {
        studentId: 'S001',
        name: 'John Doe',
        tshirtSize: 'XL',
        mealPreference: 'Vegetarian',
        organizationDetails: 'Club: Drama Club, Involvement: Actor'
      },
      {
        studentId: 'S001',
        name: 'John Doe',
        tshirtSize: 'M',
        mealPreference: 'Vegetarian',
        organizationDetails: 'Club: Music Club, Involvement: Singer'
      }
    ];

    const result = studentDAO.consolidateDuplicates(students);
    expect(result.tshirtSize).toBe('XL');
  });

  it('should preserve all organization involvement details', () => {
    const students: Student[] = [
      {
        studentId: 'S001',
        name: 'John Doe',
        tshirtSize: 'M',
        mealPreference: 'Vegetarian',
        organizationDetails: 'Club: Chess Club, Involvement: Member'
      },
      {
        studentId: 'S001',
        name: 'John Doe',
        tshirtSize: 'M',
        mealPreference: 'Vegetarian',
        organizationDetails: 'Club: Drama Club, Involvement: Actor'
      },
      {
        studentId: 'S001',
        name: 'John Doe',
        tshirtSize: 'M',
        mealPreference: 'Vegetarian',
        organizationDetails: 'Club: Music Club, Involvement: Singer'
      }
    ];

    const result = studentDAO.consolidateDuplicates(students);
    expect(result.organizationDetails).toBe(
      'Club: Chess Club, Involvement: Member; Club: Drama Club, Involvement: Actor; Club: Music Club, Involvement: Singer'
    );
  });

  it('should handle empty organization details', () => {
    const students: Student[] = [
      {
        studentId: 'S001',
        name: 'John Doe',
        tshirtSize: 'M',
        mealPreference: 'Vegetarian',
        organizationDetails: 'Club: Chess Club, Involvement: Member'
      },
      {
        studentId: 'S001',
        name: 'John Doe',
        tshirtSize: 'L',
        mealPreference: 'Vegetarian',
        organizationDetails: ''
      },
      {
        studentId: 'S001',
        name: 'John Doe',
        tshirtSize: 'S',
        mealPreference: 'Vegetarian',
        organizationDetails: 'Club: Drama Club, Involvement: Actor'
      }
    ];

    const result = studentDAO.consolidateDuplicates(students);
    expect(result.organizationDetails).toBe('Club: Chess Club, Involvement: Member; Club: Drama Club, Involvement: Actor');
    expect(result.tshirtSize).toBe('L');
  });

  it('should use first non-empty meal preference', () => {
    const students: Student[] = [
      {
        studentId: 'S001',
        name: 'John Doe',
        tshirtSize: 'M',
        mealPreference: '',
        organizationDetails: 'Club: Chess Club, Involvement: Member'
      },
      {
        studentId: 'S001',
        name: 'John Doe',
        tshirtSize: 'M',
        mealPreference: 'Vegetarian',
        organizationDetails: 'Club: Drama Club, Involvement: Actor'
      },
      {
        studentId: 'S001',
        name: 'John Doe',
        tshirtSize: 'M',
        mealPreference: 'Non-Vegetarian',
        organizationDetails: 'Club: Music Club, Involvement: Singer'
      }
    ];

    const result = studentDAO.consolidateDuplicates(students);
    expect(result.mealPreference).toBe('Vegetarian');
  });

  it('should handle all t-shirt sizes in correct order', () => {
    const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '2XL', '3XL'];
    
    for (let i = 0; i < sizes.length; i++) {
      for (let j = 0; j < sizes.length; j++) {
        const students: Student[] = [
          {
            studentId: 'S001',
            name: 'John Doe',
            tshirtSize: sizes[i],
            mealPreference: 'Vegetarian',
            organizationDetails: 'Club: Chess Club, Involvement: Member'
          },
          {
            studentId: 'S001',
            name: 'John Doe',
            tshirtSize: sizes[j],
            mealPreference: 'Vegetarian',
            organizationDetails: 'Club: Drama Club, Involvement: Actor'
          }
        ];

        const result = studentDAO.consolidateDuplicates(students);
        const expectedSize = i > j ? sizes[i] : sizes[j];
        expect(result.tshirtSize).toBe(expectedSize);
      }
    }
  });

  it('should handle case-insensitive t-shirt sizes', () => {
    const students: Student[] = [
      {
        studentId: 'S001',
        name: 'John Doe',
        tshirtSize: 's',
        mealPreference: 'Vegetarian',
        organizationDetails: 'Club: Chess Club, Involvement: Member'
      },
      {
        studentId: 'S001',
        name: 'John Doe',
        tshirtSize: 'XL',
        mealPreference: 'Vegetarian',
        organizationDetails: 'Club: Drama Club, Involvement: Actor'
      }
    ];

    const result = studentDAO.consolidateDuplicates(students);
    expect(result.tshirtSize).toBe('XL');
  });

  it('should handle unknown t-shirt sizes gracefully', () => {
    const students: Student[] = [
      {
        studentId: 'S001',
        name: 'John Doe',
        tshirtSize: 'UNKNOWN',
        mealPreference: 'Vegetarian',
        organizationDetails: 'Club: Chess Club, Involvement: Member'
      },
      {
        studentId: 'S001',
        name: 'John Doe',
        tshirtSize: 'M',
        mealPreference: 'Vegetarian',
        organizationDetails: 'Club: Drama Club, Involvement: Actor'
      }
    ];

    const result = studentDAO.consolidateDuplicates(students);
    expect(result.tshirtSize).toBe('M');
  });

  it('should consolidate multiple duplicates correctly', () => {
    const students: Student[] = [
      {
        studentId: 'S001',
        name: 'John Doe',
        tshirtSize: 'S',
        mealPreference: '',
        organizationDetails: 'Club: Chess Club, Involvement: Member'
      },
      {
        studentId: 'S001',
        name: 'John Doe',
        tshirtSize: 'M',
        mealPreference: 'Vegetarian',
        organizationDetails: 'Club: Drama Club, Involvement: Actor'
      },
      {
        studentId: 'S001',
        name: 'John Doe',
        tshirtSize: 'XL',
        mealPreference: '',
        organizationDetails: 'Club: Music Club, Involvement: Singer'
      },
      {
        studentId: 'S001',
        name: 'John Doe',
        tshirtSize: 'L',
        mealPreference: '',
        organizationDetails: 'Club: Sports Club, Involvement: Player'
      }
    ];

    const result = studentDAO.consolidateDuplicates(students);
    expect(result.tshirtSize).toBe('XL');
    expect(result.mealPreference).toBe('Vegetarian');
    expect(result.organizationDetails).toBe(
      'Club: Chess Club, Involvement: Member; Club: Drama Club, Involvement: Actor; Club: Music Club, Involvement: Singer; Club: Sports Club, Involvement: Player'
    );
  });
});
