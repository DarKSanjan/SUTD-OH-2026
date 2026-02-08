import StudentInfoCard from './StudentInfoCard';

/**
 * Example usage of the StudentInfoCard component
 * This file demonstrates how to use the component in different scenarios
 */

// Example 1: Basic usage
export function BasicExample() {
  const student = {
    studentId: 'S12345',
    name: 'John Doe',
    tshirtSize: 'L',
    mealPreference: 'Vegetarian',
  };

  return (
    <div style={{ padding: '20px', background: '#f5f5f5' }}>
      <StudentInfoCard student={student} />
    </div>
  );
}

// Example 2: Long name
export function LongNameExample() {
  const student = {
    studentId: 'S67890',
    name: 'Christopher Alexander Montgomery-Wellington III',
    tshirtSize: 'XL',
    mealPreference: 'Non-Vegetarian',
  };

  return (
    <div style={{ padding: '20px', background: '#f5f5f5' }}>
      <StudentInfoCard student={student} />
    </div>
  );
}

// Example 3: Special characters
export function SpecialCharactersExample() {
  const student = {
    studentId: 'S11111',
    name: "O'Brien-Smith, José María",
    tshirtSize: 'M',
    mealPreference: 'Vegan',
  };

  return (
    <div style={{ padding: '20px', background: '#f5f5f5' }}>
      <StudentInfoCard student={student} />
    </div>
  );
}

// Example 4: Different sizes
export function DifferentSizesExample() {
  const students = [
    {
      studentId: 'S001',
      name: 'Alice Johnson',
      tshirtSize: 'XS',
      mealPreference: 'Vegetarian',
    },
    {
      studentId: 'S002',
      name: 'Bob Smith',
      tshirtSize: 'XXL',
      mealPreference: 'Halal',
    },
  ];

  return (
    <div style={{ padding: '20px', background: '#f5f5f5', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {students.map((student) => (
        <StudentInfoCard key={student.studentId} student={student} />
      ))}
    </div>
  );
}

// Example 5: Mobile view simulation
export function MobileViewExample() {
  const student = {
    studentId: 'S99999',
    name: 'Emma Wilson',
    tshirtSize: 'S',
    mealPreference: 'Kosher',
  };

  return (
    <div style={{ maxWidth: '375px', padding: '20px', background: '#f5f5f5' }}>
      <StudentInfoCard student={student} />
    </div>
  );
}
