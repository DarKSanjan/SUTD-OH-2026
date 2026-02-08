import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ClaimStatusDisplay from '../ClaimStatusDisplay';

describe('ClaimStatusDisplay', () => {
  it('renders the claim status title', () => {
    const claims = {
      tshirtClaimed: false,
      mealClaimed: false,
    };

    render(<ClaimStatusDisplay claims={claims} />);
    expect(screen.getByText('Claim Status')).toBeInTheDocument();
  });

  it('displays both items as available when nothing is claimed', () => {
    const claims = {
      tshirtClaimed: false,
      mealClaimed: false,
    };

    render(<ClaimStatusDisplay claims={claims} />);
    
    expect(screen.getByText('T-Shirt')).toBeInTheDocument();
    expect(screen.getByText('Meal Coupon')).toBeInTheDocument();
    
    const availableStatuses = screen.getAllByText('Available');
    expect(availableStatuses).toHaveLength(2);
  });

  it('displays t-shirt as claimed when tshirtClaimed is true', () => {
    const claims = {
      tshirtClaimed: true,
      mealClaimed: false,
    };

    render(<ClaimStatusDisplay claims={claims} />);
    
    const claimedStatuses = screen.getAllByText('Claimed');
    expect(claimedStatuses).toHaveLength(1);
    
    const availableStatuses = screen.getAllByText('Available');
    expect(availableStatuses).toHaveLength(1);
  });

  it('displays meal coupon as claimed when mealClaimed is true', () => {
    const claims = {
      tshirtClaimed: false,
      mealClaimed: true,
    };

    render(<ClaimStatusDisplay claims={claims} />);
    
    const claimedStatuses = screen.getAllByText('Claimed');
    expect(claimedStatuses).toHaveLength(1);
    
    const availableStatuses = screen.getAllByText('Available');
    expect(availableStatuses).toHaveLength(1);
  });

  it('displays both items as claimed when both are true', () => {
    const claims = {
      tshirtClaimed: true,
      mealClaimed: true,
    };

    render(<ClaimStatusDisplay claims={claims} />);
    
    const claimedStatuses = screen.getAllByText('Claimed');
    expect(claimedStatuses).toHaveLength(2);
    
    expect(screen.queryByText('Available')).not.toBeInTheDocument();
  });

  it('shows "all items claimed" message when both items are claimed', () => {
    const claims = {
      tshirtClaimed: true,
      mealClaimed: true,
    };

    render(<ClaimStatusDisplay claims={claims} />);
    
    expect(screen.getByText('✓ All items have been claimed')).toBeInTheDocument();
  });

  it('does not show "all items claimed" message when only t-shirt is claimed', () => {
    const claims = {
      tshirtClaimed: true,
      mealClaimed: false,
    };

    render(<ClaimStatusDisplay claims={claims} />);
    
    expect(screen.queryByText('✓ All items have been claimed')).not.toBeInTheDocument();
  });

  it('does not show "all items claimed" message when only meal is claimed', () => {
    const claims = {
      tshirtClaimed: false,
      mealClaimed: true,
    };

    render(<ClaimStatusDisplay claims={claims} />);
    
    expect(screen.queryByText('✓ All items have been claimed')).not.toBeInTheDocument();
  });

  it('does not show "all items claimed" message when nothing is claimed', () => {
    const claims = {
      tshirtClaimed: false,
      mealClaimed: false,
    };

    render(<ClaimStatusDisplay claims={claims} />);
    
    expect(screen.queryByText('✓ All items have been claimed')).not.toBeInTheDocument();
  });

  it('applies correct CSS class for unclaimed items', () => {
    const claims = {
      tshirtClaimed: false,
      mealClaimed: false,
    };

    const { container } = render(<ClaimStatusDisplay claims={claims} />);
    
    const statusItems = container.querySelectorAll('.status-item');
    expect(statusItems).toHaveLength(2);
    
    statusItems.forEach(item => {
      expect(item.classList.contains('unclaimed')).toBe(true);
      expect(item.classList.contains('claimed')).toBe(false);
    });
  });

  it('applies correct CSS class for claimed items', () => {
    const claims = {
      tshirtClaimed: true,
      mealClaimed: true,
    };

    const { container } = render(<ClaimStatusDisplay claims={claims} />);
    
    const statusItems = container.querySelectorAll('.status-item');
    expect(statusItems).toHaveLength(2);
    
    statusItems.forEach(item => {
      expect(item.classList.contains('claimed')).toBe(true);
      expect(item.classList.contains('unclaimed')).toBe(false);
    });
  });

  it('applies mixed CSS classes when one item is claimed', () => {
    const claims = {
      tshirtClaimed: true,
      mealClaimed: false,
    };

    const { container } = render(<ClaimStatusDisplay claims={claims} />);
    
    const statusItems = container.querySelectorAll('.status-item');
    expect(statusItems).toHaveLength(2);
    
    // First item (t-shirt) should be claimed
    expect(statusItems[0].classList.contains('claimed')).toBe(true);
    expect(statusItems[0].classList.contains('unclaimed')).toBe(false);
    
    // Second item (meal) should be unclaimed
    expect(statusItems[1].classList.contains('unclaimed')).toBe(true);
    expect(statusItems[1].classList.contains('claimed')).toBe(false);
  });

  it('renders checkmark icon for claimed items', () => {
    const claims = {
      tshirtClaimed: true,
      mealClaimed: false,
    };

    const { container } = render(<ClaimStatusDisplay claims={claims} />);
    
    const checkmarks = container.querySelectorAll('.checkmark');
    expect(checkmarks).toHaveLength(1);
  });

  it('renders circle icon for unclaimed items', () => {
    const claims = {
      tshirtClaimed: false,
      mealClaimed: false,
    };

    const { container } = render(<ClaimStatusDisplay claims={claims} />);
    
    const circles = container.querySelectorAll('.circle');
    expect(circles).toHaveLength(2);
  });

  it('renders correct number of icons based on claim status', () => {
    const claims = {
      tshirtClaimed: true,
      mealClaimed: false,
    };

    const { container } = render(<ClaimStatusDisplay claims={claims} />);
    
    const checkmarks = container.querySelectorAll('.checkmark');
    const circles = container.querySelectorAll('.circle');
    
    expect(checkmarks).toHaveLength(1);
    expect(circles).toHaveLength(1);
  });

  it('renders all checkmarks when both items are claimed', () => {
    const claims = {
      tshirtClaimed: true,
      mealClaimed: true,
    };

    const { container } = render(<ClaimStatusDisplay claims={claims} />);
    
    const checkmarks = container.querySelectorAll('.checkmark');
    const circles = container.querySelectorAll('.circle');
    
    expect(checkmarks).toHaveLength(2);
    expect(circles).toHaveLength(0);
  });

  it('maintains consistent structure regardless of claim status', () => {
    const testCases = [
      { tshirtClaimed: false, mealClaimed: false },
      { tshirtClaimed: true, mealClaimed: false },
      { tshirtClaimed: false, mealClaimed: true },
      { tshirtClaimed: true, mealClaimed: true },
    ];

    testCases.forEach(claims => {
      const { container, unmount } = render(<ClaimStatusDisplay claims={claims} />);
      
      expect(screen.getByText('Claim Status')).toBeInTheDocument();
      expect(screen.getByText('T-Shirt')).toBeInTheDocument();
      expect(screen.getByText('Meal Coupon')).toBeInTheDocument();
      
      const statusItems = container.querySelectorAll('.status-item');
      expect(statusItems).toHaveLength(2);
      
      unmount();
    });
  });

  it('displays correct labels for both items', () => {
    const claims = {
      tshirtClaimed: false,
      mealClaimed: false,
    };

    render(<ClaimStatusDisplay claims={claims} />);
    
    expect(screen.getByText('T-Shirt')).toBeInTheDocument();
    expect(screen.getByText('Meal Coupon')).toBeInTheDocument();
  });

  it('visually distinguishes between claimed and unclaimed states', () => {
    const claims = {
      tshirtClaimed: true,
      mealClaimed: false,
    };

    const { container } = render(<ClaimStatusDisplay claims={claims} />);
    
    const statusItems = container.querySelectorAll('.status-item');
    
    // First item should have claimed styling
    expect(statusItems[0].classList.contains('claimed')).toBe(true);
    
    // Second item should have unclaimed styling
    expect(statusItems[1].classList.contains('unclaimed')).toBe(true);
    
    // They should have different classes
    expect(statusItems[0].className).not.toBe(statusItems[1].className);
  });
});
