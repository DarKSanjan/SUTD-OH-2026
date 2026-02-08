import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import InvolvementDisplay from '../InvolvementDisplay';

describe('InvolvementDisplay', () => {
  const mockInvolvements = [
    { club: 'Tech Club', role: 'Member' },
    { club: 'Science Club', role: 'Volunteer' },
    { club: 'Math Society', role: 'President' }
  ];

  it('should render all involvements', () => {
    render(<InvolvementDisplay involvements={mockInvolvements} />);
    
    expect(screen.getByText('Organization Involvements')).toBeInTheDocument();
    expect(screen.getByText('Tech Club')).toBeInTheDocument();
    expect(screen.getByText('Member')).toBeInTheDocument();
    expect(screen.getByText('Science Club')).toBeInTheDocument();
    expect(screen.getByText('Volunteer')).toBeInTheDocument();
    expect(screen.getByText('Math Society')).toBeInTheDocument();
    expect(screen.getByText('President')).toBeInTheDocument();
  });

  it('should render with list variant by default', () => {
    const { container } = render(<InvolvementDisplay involvements={mockInvolvements} />);
    
    const displayElement = container.querySelector('.involvement-display');
    expect(displayElement).toHaveClass('list');
  });

  it('should render with card variant when specified', () => {
    const { container } = render(
      <InvolvementDisplay involvements={mockInvolvements} variant="card" />
    );
    
    const displayElement = container.querySelector('.involvement-display');
    expect(displayElement).toHaveClass('card');
  });

  it('should render nothing when involvements array is empty', () => {
    const { container } = render(<InvolvementDisplay involvements={[]} />);
    
    expect(container.firstChild).toBeNull();
  });

  it('should render nothing when involvements is undefined', () => {
    const { container } = render(<InvolvementDisplay involvements={undefined as any} />);
    
    expect(container.firstChild).toBeNull();
  });

  it('should render single involvement correctly', () => {
    const singleInvolvement = [{ club: 'Drama Club', role: 'Actor' }];
    render(<InvolvementDisplay involvements={singleInvolvement} />);
    
    expect(screen.getByText('Drama Club')).toBeInTheDocument();
    expect(screen.getByText('Actor')).toBeInTheDocument();
  });

  it('should render multiple involvement items with correct structure', () => {
    const { container } = render(<InvolvementDisplay involvements={mockInvolvements} />);
    
    const items = container.querySelectorAll('.involvement-item');
    expect(items).toHaveLength(3);
    
    // Check first item structure
    const firstItem = items[0];
    expect(firstItem.querySelector('.involvement-club')?.textContent).toBe('Tech Club');
    expect(firstItem.querySelector('.involvement-role')?.textContent).toBe('Member');
  });

  it('should handle special characters in club names and roles', () => {
    const specialInvolvements = [
      { club: 'Art & Design Club', role: 'Co-President' },
      { club: 'Music Society (Jazz)', role: 'Member/Performer' }
    ];
    
    render(<InvolvementDisplay involvements={specialInvolvements} />);
    
    expect(screen.getByText('Art & Design Club')).toBeInTheDocument();
    expect(screen.getByText('Co-President')).toBeInTheDocument();
    expect(screen.getByText('Music Society (Jazz)')).toBeInTheDocument();
    expect(screen.getByText('Member/Performer')).toBeInTheDocument();
  });
});
