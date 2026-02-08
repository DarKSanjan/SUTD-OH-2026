import InvolvementDisplay from './InvolvementDisplay';

// Example 1: Multiple involvements with list variant (Student App)
export function ListVariantExample() {
  const involvements = [
    { club: 'Tech Club', role: 'Member' },
    { club: 'Science Club', role: 'Volunteer' },
    { club: 'Math Society', role: 'President' }
  ];

  return (
    <div style={{ padding: '20px', background: '#f5f5f5' }}>
      <h2>Student App - List Variant</h2>
      <InvolvementDisplay involvements={involvements} variant="list" />
    </div>
  );
}

// Example 2: Multiple involvements with card variant (Admin App)
export function CardVariantExample() {
  const involvements = [
    { club: 'Tech Club', role: 'Member' },
    { club: 'Science Club', role: 'Volunteer' },
    { club: 'Math Society', role: 'President' }
  ];

  return (
    <div style={{ padding: '20px', background: '#f5f5f5' }}>
      <h2>Admin App - Card Variant</h2>
      <InvolvementDisplay involvements={involvements} variant="card" />
    </div>
  );
}

// Example 3: Single involvement
export function SingleInvolvementExample() {
  const involvements = [
    { club: 'Drama Club', role: 'Actor' }
  ];

  return (
    <div style={{ padding: '20px', background: '#f5f5f5' }}>
      <h2>Single Involvement</h2>
      <InvolvementDisplay involvements={involvements} />
    </div>
  );
}

// Example 4: Many involvements
export function ManyInvolvementsExample() {
  const involvements = [
    { club: 'Tech Club', role: 'Member' },
    { club: 'Science Club', role: 'Volunteer' },
    { club: 'Math Society', role: 'President' },
    { club: 'Drama Club', role: 'Actor' },
    { club: 'Music Society', role: 'Performer' },
    { club: 'Art & Design Club', role: 'Co-President' }
  ];

  return (
    <div style={{ padding: '20px', background: '#f5f5f5' }}>
      <h2>Many Involvements</h2>
      <InvolvementDisplay involvements={involvements} variant="list" />
    </div>
  );
}

// Example 5: Empty involvements (renders nothing)
export function EmptyInvolvementsExample() {
  const involvements: Array<{ club: string; role: string }> = [];

  return (
    <div style={{ padding: '20px', background: '#f5f5f5' }}>
      <h2>Empty Involvements (Nothing Rendered)</h2>
      <InvolvementDisplay involvements={involvements} />
      <p style={{ color: '#666', fontStyle: 'italic' }}>
        No involvements to display
      </p>
    </div>
  );
}

// Example 6: Special characters in names
export function SpecialCharactersExample() {
  const involvements = [
    { club: 'Art & Design Club', role: 'Co-President' },
    { club: 'Music Society (Jazz)', role: 'Member/Performer' },
    { club: 'Women\'s Leadership Forum', role: 'Vice-President' }
  ];

  return (
    <div style={{ padding: '20px', background: '#f5f5f5' }}>
      <h2>Special Characters</h2>
      <InvolvementDisplay involvements={involvements} variant="list" />
    </div>
  );
}

// Example 7: Side-by-side comparison
export function ComparisonExample() {
  const involvements = [
    { club: 'Tech Club', role: 'Member' },
    { club: 'Science Club', role: 'Volunteer' }
  ];

  return (
    <div style={{ padding: '20px', background: '#f5f5f5' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div>
          <h3>List Variant</h3>
          <InvolvementDisplay involvements={involvements} variant="list" />
        </div>
        <div>
          <h3>Card Variant</h3>
          <InvolvementDisplay involvements={involvements} variant="card" />
        </div>
      </div>
    </div>
  );
}
