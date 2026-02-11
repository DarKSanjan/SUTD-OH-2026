import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import FilterPanel from '../FilterPanel';
import { FilterCriteria } from '../../../utils/types';

describe('FilterPanel', () => {
  const mockOnFilterChange = vi.fn();
  const mockOnClearFilters = vi.fn();

  const defaultFilters: FilterCriteria = {
    clubs: [],
    hasPerformance: null,
    hasBooth: null,
    shirtCollected: null,
    mealCollected: null,
  };

  const availableClubs = ['Chess Club', 'Drama Club', 'Robotics Club'];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render filter panel with toggle button', () => {
      render(
        <FilterPanel
          filters={defaultFilters}
          onFilterChange={mockOnFilterChange}
          onClearFilters={mockOnClearFilters}
          availableClubs={availableClubs}
          activeFilterCount={0}
        />
      );

      const toggleButton = screen.getByRole('button', { name: /expand filters/i });
      expect(toggleButton).toBeInTheDocument();
    });

    it('should show filter count when filters are active', () => {
      render(
        <FilterPanel
          filters={defaultFilters}
          onFilterChange={mockOnFilterChange}
          onClearFilters={mockOnClearFilters}
          availableClubs={availableClubs}
          activeFilterCount={3}
        />
      );

      const filterCount = screen.getByText('(3)');
      expect(filterCount).toBeInTheDocument();
    });

    it('should not show filter count when no filters are active', () => {
      render(
        <FilterPanel
          filters={defaultFilters}
          onFilterChange={mockOnFilterChange}
          onClearFilters={mockOnClearFilters}
          availableClubs={availableClubs}
          activeFilterCount={0}
        />
      );

      const filterCount = screen.queryByText(/\(\d+\)/);
      expect(filterCount).toBeNull();
    });

    it('should apply custom className', () => {
      const { container } = render(
        <FilterPanel
          filters={defaultFilters}
          onFilterChange={mockOnFilterChange}
          onClearFilters={mockOnClearFilters}
          availableClubs={availableClubs}
          activeFilterCount={0}
          className="custom-class"
        />
      );

      const filterPanel = container.querySelector('.filter-panel');
      expect(filterPanel).toHaveClass('custom-class');
    });

    it('should show clear all button when filters are active', () => {
      render(
        <FilterPanel
          filters={defaultFilters}
          onFilterChange={mockOnFilterChange}
          onClearFilters={mockOnClearFilters}
          availableClubs={availableClubs}
          activeFilterCount={1}
        />
      );

      const clearButton = screen.getByRole('button', { name: 'Clear all filters' });
      expect(clearButton).toBeInTheDocument();
    });

    it('should not show clear all button when no filters are active', () => {
      render(
        <FilterPanel
          filters={defaultFilters}
          onFilterChange={mockOnFilterChange}
          onClearFilters={mockOnClearFilters}
          availableClubs={availableClubs}
          activeFilterCount={0}
        />
      );

      const clearButton = screen.queryByRole('button', { name: 'Clear all filters' });
      expect(clearButton).toBeNull();
    });
  });

  describe('Filter Controls', () => {
    it('should not show filter controls when collapsed', () => {
      render(
        <FilterPanel
          filters={defaultFilters}
          onFilterChange={mockOnFilterChange}
          onClearFilters={mockOnClearFilters}
          availableClubs={availableClubs}
          activeFilterCount={0}
        />
      );

      const filterControls = screen.queryByRole('group', { name: /club/i });
      expect(filterControls).toBeNull();
    });

    it('should show filter controls when expanded', () => {
      render(
        <FilterPanel
          filters={defaultFilters}
          onFilterChange={mockOnFilterChange}
          onClearFilters={mockOnClearFilters}
          availableClubs={availableClubs}
          activeFilterCount={0}
        />
      );

      const toggleButton = screen.getByRole('button', { name: /expand filters/i });
      fireEvent.click(toggleButton);

      const clubCheckboxes = screen.getAllByRole('checkbox');
      expect(clubCheckboxes.length).toBeGreaterThan(0);
    });

    it('should render all available clubs as checkboxes', () => {
      render(
        <FilterPanel
          filters={defaultFilters}
          onFilterChange={mockOnFilterChange}
          onClearFilters={mockOnClearFilters}
          availableClubs={availableClubs}
          activeFilterCount={0}
        />
      );

      const toggleButton = screen.getByRole('button', { name: /expand filters/i });
      fireEvent.click(toggleButton);

      availableClubs.forEach(club => {
        const checkbox = screen.getByRole('checkbox', { name: `Filter by ${club}` });
        expect(checkbox).toBeInTheDocument();
      });
    });

    it('should render performance filter with radio buttons', () => {
      render(
        <FilterPanel
          filters={defaultFilters}
          onFilterChange={mockOnFilterChange}
          onClearFilters={mockOnClearFilters}
          availableClubs={availableClubs}
          activeFilterCount={0}
        />
      );

      const toggleButton = screen.getByRole('button', { name: /expand filters/i });
      fireEvent.click(toggleButton);

      const allRadio = screen.getByRole('radio', { name: 'Performance: All' });
      const yesRadio = screen.getByRole('radio', { name: 'Performance: Yes' });
      const noRadio = screen.getByRole('radio', { name: 'Performance: No' });

      expect(allRadio).toBeInTheDocument();
      expect(yesRadio).toBeInTheDocument();
      expect(noRadio).toBeInTheDocument();
    });

    it('should render booth filter with radio buttons', () => {
      render(
        <FilterPanel
          filters={defaultFilters}
          onFilterChange={mockOnFilterChange}
          onClearFilters={mockOnClearFilters}
          availableClubs={availableClubs}
          activeFilterCount={0}
        />
      );

      const toggleButton = screen.getByRole('button', { name: /expand filters/i });
      fireEvent.click(toggleButton);

      const allRadio = screen.getByRole('radio', { name: 'Booth: All' });
      const yesRadio = screen.getByRole('radio', { name: 'Booth: Yes' });
      const noRadio = screen.getByRole('radio', { name: 'Booth: No' });

      expect(allRadio).toBeInTheDocument();
      expect(yesRadio).toBeInTheDocument();
      expect(noRadio).toBeInTheDocument();
    });

    it('should render shirt collection filter with radio buttons', () => {
      render(
        <FilterPanel
          filters={defaultFilters}
          onFilterChange={mockOnFilterChange}
          onClearFilters={mockOnClearFilters}
          availableClubs={availableClubs}
          activeFilterCount={0}
        />
      );

      const toggleButton = screen.getByRole('button', { name: /expand filters/i });
      fireEvent.click(toggleButton);

      const allRadio = screen.getByRole('radio', { name: 'Shirt: All' });
      const collectedRadio = screen.getByRole('radio', { name: 'Shirt: Collected' });
      const notCollectedRadio = screen.getByRole('radio', { name: 'Shirt: Not Collected' });

      expect(allRadio).toBeInTheDocument();
      expect(collectedRadio).toBeInTheDocument();
      expect(notCollectedRadio).toBeInTheDocument();
    });

    it('should render meal collection filter with radio buttons', () => {
      render(
        <FilterPanel
          filters={defaultFilters}
          onFilterChange={mockOnFilterChange}
          onClearFilters={mockOnClearFilters}
          availableClubs={availableClubs}
          activeFilterCount={0}
        />
      );

      const toggleButton = screen.getByRole('button', { name: /expand filters/i });
      fireEvent.click(toggleButton);

      const allRadio = screen.getByRole('radio', { name: 'Meal: All' });
      const collectedRadio = screen.getByRole('radio', { name: 'Meal: Collected' });
      const notCollectedRadio = screen.getByRole('radio', { name: 'Meal: Not Collected' });

      expect(allRadio).toBeInTheDocument();
      expect(collectedRadio).toBeInTheDocument();
      expect(notCollectedRadio).toBeInTheDocument();
    });

    it('should show "No clubs available" when availableClubs is empty', () => {
      render(
        <FilterPanel
          filters={defaultFilters}
          onFilterChange={mockOnFilterChange}
          onClearFilters={mockOnClearFilters}
          availableClubs={[]}
          activeFilterCount={0}
        />
      );

      const toggleButton = screen.getByRole('button', { name: /expand filters/i });
      fireEvent.click(toggleButton);

      const noClubsMessage = screen.getByText('No clubs available');
      expect(noClubsMessage).toBeInTheDocument();
    });
  });

  describe('Filter Badge Display', () => {
    it('should not show badges when no filters are active', () => {
      render(
        <FilterPanel
          filters={defaultFilters}
          onFilterChange={mockOnFilterChange}
          onClearFilters={mockOnClearFilters}
          availableClubs={availableClubs}
          activeFilterCount={0}
        />
      );

      const badgesRegion = screen.queryByRole('region', { name: 'Active filters' });
      expect(badgesRegion).toBeNull();
    });

    it('should show badge for club filter', () => {
      const filtersWithClub: FilterCriteria = {
        ...defaultFilters,
        clubs: ['Chess Club'],
      };

      render(
        <FilterPanel
          filters={filtersWithClub}
          onFilterChange={mockOnFilterChange}
          onClearFilters={mockOnClearFilters}
          availableClubs={availableClubs}
          activeFilterCount={1}
        />
      );

      const badge = screen.getByText('Club: Chess Club');
      expect(badge).toBeInTheDocument();
    });

    it('should show badges for multiple clubs', () => {
      const filtersWithClubs: FilterCriteria = {
        ...defaultFilters,
        clubs: ['Chess Club', 'Drama Club'],
      };

      render(
        <FilterPanel
          filters={filtersWithClubs}
          onFilterChange={mockOnFilterChange}
          onClearFilters={mockOnClearFilters}
          availableClubs={availableClubs}
          activeFilterCount={2}
        />
      );

      const chessBadge = screen.getByText('Club: Chess Club');
      const dramaBadge = screen.getByText('Club: Drama Club');

      expect(chessBadge).toBeInTheDocument();
      expect(dramaBadge).toBeInTheDocument();
    });

    it('should show badge for performance filter (Yes)', () => {
      const filtersWithPerformance: FilterCriteria = {
        ...defaultFilters,
        hasPerformance: true,
      };

      render(
        <FilterPanel
          filters={filtersWithPerformance}
          onFilterChange={mockOnFilterChange}
          onClearFilters={mockOnClearFilters}
          availableClubs={availableClubs}
          activeFilterCount={1}
        />
      );

      const badge = screen.getByText('Performance: Yes');
      expect(badge).toBeInTheDocument();
    });

    it('should show badge for performance filter (No)', () => {
      const filtersWithPerformance: FilterCriteria = {
        ...defaultFilters,
        hasPerformance: false,
      };

      render(
        <FilterPanel
          filters={filtersWithPerformance}
          onFilterChange={mockOnFilterChange}
          onClearFilters={mockOnClearFilters}
          availableClubs={availableClubs}
          activeFilterCount={1}
        />
      );

      const badge = screen.getByText('Performance: No');
      expect(badge).toBeInTheDocument();
    });

    it('should show badge for booth filter (Yes)', () => {
      const filtersWithBooth: FilterCriteria = {
        ...defaultFilters,
        hasBooth: true,
      };

      render(
        <FilterPanel
          filters={filtersWithBooth}
          onFilterChange={mockOnFilterChange}
          onClearFilters={mockOnClearFilters}
          availableClubs={availableClubs}
          activeFilterCount={1}
        />
      );

      const badge = screen.getByText('Booth: Yes');
      expect(badge).toBeInTheDocument();
    });

    it('should show badge for booth filter (No)', () => {
      const filtersWithBooth: FilterCriteria = {
        ...defaultFilters,
        hasBooth: false,
      };

      render(
        <FilterPanel
          filters={filtersWithBooth}
          onFilterChange={mockOnFilterChange}
          onClearFilters={mockOnClearFilters}
          availableClubs={availableClubs}
          activeFilterCount={1}
        />
      );

      const badge = screen.getByText('Booth: No');
      expect(badge).toBeInTheDocument();
    });

    it('should show badge for shirt collection filter (Collected)', () => {
      const filtersWithShirt: FilterCriteria = {
        ...defaultFilters,
        shirtCollected: true,
      };

      render(
        <FilterPanel
          filters={filtersWithShirt}
          onFilterChange={mockOnFilterChange}
          onClearFilters={mockOnClearFilters}
          availableClubs={availableClubs}
          activeFilterCount={1}
        />
      );

      const badge = screen.getByText('Shirt: Collected');
      expect(badge).toBeInTheDocument();
    });

    it('should show badge for shirt collection filter (Not Collected)', () => {
      const filtersWithShirt: FilterCriteria = {
        ...defaultFilters,
        shirtCollected: false,
      };

      render(
        <FilterPanel
          filters={filtersWithShirt}
          onFilterChange={mockOnFilterChange}
          onClearFilters={mockOnClearFilters}
          availableClubs={availableClubs}
          activeFilterCount={1}
        />
      );

      const badge = screen.getByText('Shirt: Not Collected');
      expect(badge).toBeInTheDocument();
    });

    it('should show badge for meal collection filter (Collected)', () => {
      const filtersWithMeal: FilterCriteria = {
        ...defaultFilters,
        mealCollected: true,
      };

      render(
        <FilterPanel
          filters={filtersWithMeal}
          onFilterChange={mockOnFilterChange}
          onClearFilters={mockOnClearFilters}
          availableClubs={availableClubs}
          activeFilterCount={1}
        />
      );

      const badge = screen.getByText('Meal: Collected');
      expect(badge).toBeInTheDocument();
    });

    it('should show badge for meal collection filter (Not Collected)', () => {
      const filtersWithMeal: FilterCriteria = {
        ...defaultFilters,
        mealCollected: false,
      };

      render(
        <FilterPanel
          filters={filtersWithMeal}
          onFilterChange={mockOnFilterChange}
          onClearFilters={mockOnClearFilters}
          availableClubs={availableClubs}
          activeFilterCount={1}
        />
      );

      const badge = screen.getByText('Meal: Not Collected');
      expect(badge).toBeInTheDocument();
    });

    it('should show all badges when multiple filters are active', () => {
      const multipleFilters: FilterCriteria = {
        clubs: ['Chess Club', 'Drama Club'],
        hasPerformance: true,
        hasBooth: false,
        shirtCollected: true,
        mealCollected: false,
      };

      render(
        <FilterPanel
          filters={multipleFilters}
          onFilterChange={mockOnFilterChange}
          onClearFilters={mockOnClearFilters}
          availableClubs={availableClubs}
          activeFilterCount={6}
        />
      );

      expect(screen.getByText('Club: Chess Club')).toBeInTheDocument();
      expect(screen.getByText('Club: Drama Club')).toBeInTheDocument();
      expect(screen.getByText('Performance: Yes')).toBeInTheDocument();
      expect(screen.getByText('Booth: No')).toBeInTheDocument();
      expect(screen.getByText('Shirt: Collected')).toBeInTheDocument();
      expect(screen.getByText('Meal: Not Collected')).toBeInTheDocument();
    });

    it('should show remove button on each badge', () => {
      const filtersWithClub: FilterCriteria = {
        ...defaultFilters,
        clubs: ['Chess Club'],
      };

      render(
        <FilterPanel
          filters={filtersWithClub}
          onFilterChange={mockOnFilterChange}
          onClearFilters={mockOnClearFilters}
          availableClubs={availableClubs}
          activeFilterCount={1}
        />
      );

      const removeButton = screen.getByRole('button', { name: 'Remove Club: Chess Club filter' });
      expect(removeButton).toBeInTheDocument();
    });
  });

  describe('Clear All Button', () => {
    it('should call onClearFilters when clear all button is clicked', () => {
      render(
        <FilterPanel
          filters={defaultFilters}
          onFilterChange={mockOnFilterChange}
          onClearFilters={mockOnClearFilters}
          availableClubs={availableClubs}
          activeFilterCount={1}
        />
      );

      const clearButton = screen.getByRole('button', { name: 'Clear all filters' });
      fireEvent.click(clearButton);

      expect(mockOnClearFilters).toHaveBeenCalledTimes(1);
    });

    it('should not call onFilterChange when clear all button is clicked', () => {
      render(
        <FilterPanel
          filters={defaultFilters}
          onFilterChange={mockOnFilterChange}
          onClearFilters={mockOnClearFilters}
          availableClubs={availableClubs}
          activeFilterCount={1}
        />
      );

      const clearButton = screen.getByRole('button', { name: 'Clear all filters' });
      fireEvent.click(clearButton);

      expect(mockOnFilterChange).not.toHaveBeenCalled();
    });
  });

  describe('Toggle Behavior', () => {
    it('should expand panel when toggle button is clicked', () => {
      render(
        <FilterPanel
          filters={defaultFilters}
          onFilterChange={mockOnFilterChange}
          onClearFilters={mockOnClearFilters}
          availableClubs={availableClubs}
          activeFilterCount={0}
        />
      );

      const toggleButton = screen.getByRole('button', { name: /expand filters/i });
      fireEvent.click(toggleButton);

      const filterControls = screen.getByRole('checkbox', { name: `Filter by ${availableClubs[0]}` });
      expect(filterControls).toBeInTheDocument();
    });

    it('should collapse panel when toggle button is clicked again', () => {
      render(
        <FilterPanel
          filters={defaultFilters}
          onFilterChange={mockOnFilterChange}
          onClearFilters={mockOnClearFilters}
          availableClubs={availableClubs}
          activeFilterCount={0}
        />
      );

      const toggleButton = screen.getByRole('button', { name: /expand filters/i });
      
      // Expand
      fireEvent.click(toggleButton);
      expect(screen.getByRole('checkbox', { name: `Filter by ${availableClubs[0]}` })).toBeInTheDocument();

      // Collapse
      fireEvent.click(toggleButton);
      expect(screen.queryByRole('checkbox', { name: `Filter by ${availableClubs[0]}` })).toBeNull();
    });

    it('should update aria-expanded attribute when toggled', () => {
      render(
        <FilterPanel
          filters={defaultFilters}
          onFilterChange={mockOnFilterChange}
          onClearFilters={mockOnClearFilters}
          availableClubs={availableClubs}
          activeFilterCount={0}
        />
      );

      const toggleButton = screen.getByRole('button', { name: /expand filters/i });
      
      // Initially collapsed
      expect(toggleButton).toHaveAttribute('aria-expanded', 'false');

      // Expand
      fireEvent.click(toggleButton);
      expect(toggleButton).toHaveAttribute('aria-expanded', 'true');

      // Collapse
      fireEvent.click(toggleButton);
      expect(toggleButton).toHaveAttribute('aria-expanded', 'false');
    });

    it('should toggle on Enter key press', () => {
      render(
        <FilterPanel
          filters={defaultFilters}
          onFilterChange={mockOnFilterChange}
          onClearFilters={mockOnClearFilters}
          availableClubs={availableClubs}
          activeFilterCount={0}
        />
      );

      const toggleButton = screen.getByRole('button', { name: /expand filters/i });
      
      fireEvent.keyDown(toggleButton, { key: 'Enter', code: 'Enter' });

      const filterControls = screen.getByRole('checkbox', { name: `Filter by ${availableClubs[0]}` });
      expect(filterControls).toBeInTheDocument();
    });

    it('should toggle on Space key press', () => {
      render(
        <FilterPanel
          filters={defaultFilters}
          onFilterChange={mockOnFilterChange}
          onClearFilters={mockOnClearFilters}
          availableClubs={availableClubs}
          activeFilterCount={0}
        />
      );

      const toggleButton = screen.getByRole('button', { name: /expand filters/i });
      
      fireEvent.keyDown(toggleButton, { key: ' ', code: 'Space' });

      const filterControls = screen.getByRole('checkbox', { name: `Filter by ${availableClubs[0]}` });
      expect(filterControls).toBeInTheDocument();
    });

    it('should not toggle on other key presses', () => {
      render(
        <FilterPanel
          filters={defaultFilters}
          onFilterChange={mockOnFilterChange}
          onClearFilters={mockOnClearFilters}
          availableClubs={availableClubs}
          activeFilterCount={0}
        />
      );

      const toggleButton = screen.getByRole('button', { name: /expand filters/i });
      
      fireEvent.keyDown(toggleButton, { key: 'a', code: 'KeyA' });

      const filterControls = screen.queryByRole('checkbox', { name: `Filter by ${availableClubs[0]}` });
      expect(filterControls).toBeNull();
    });
  });

  describe('Filter Interactions', () => {
    it('should call onFilterChange when club checkbox is clicked', () => {
      render(
        <FilterPanel
          filters={defaultFilters}
          onFilterChange={mockOnFilterChange}
          onClearFilters={mockOnClearFilters}
          availableClubs={availableClubs}
          activeFilterCount={0}
        />
      );

      const toggleButton = screen.getByRole('button', { name: /expand filters/i });
      fireEvent.click(toggleButton);

      const clubCheckbox = screen.getByRole('checkbox', { name: 'Filter by Chess Club' });
      fireEvent.click(clubCheckbox);

      expect(mockOnFilterChange).toHaveBeenCalledWith('clubs', ['Chess Club']);
    });

    it('should add club to filters when unchecked club is clicked', () => {
      render(
        <FilterPanel
          filters={defaultFilters}
          onFilterChange={mockOnFilterChange}
          onClearFilters={mockOnClearFilters}
          availableClubs={availableClubs}
          activeFilterCount={0}
        />
      );

      const toggleButton = screen.getByRole('button', { name: /expand filters/i });
      fireEvent.click(toggleButton);

      const clubCheckbox = screen.getByRole('checkbox', { name: 'Filter by Drama Club' });
      fireEvent.click(clubCheckbox);

      expect(mockOnFilterChange).toHaveBeenCalledWith('clubs', ['Drama Club']);
    });

    it('should remove club from filters when checked club is clicked', () => {
      const filtersWithClub: FilterCriteria = {
        ...defaultFilters,
        clubs: ['Chess Club'],
      };

      render(
        <FilterPanel
          filters={filtersWithClub}
          onFilterChange={mockOnFilterChange}
          onClearFilters={mockOnClearFilters}
          availableClubs={availableClubs}
          activeFilterCount={1}
        />
      );

      const toggleButton = screen.getByRole('button', { name: /expand filters/i });
      fireEvent.click(toggleButton);

      const clubCheckbox = screen.getByRole('checkbox', { name: 'Filter by Chess Club' });
      fireEvent.click(clubCheckbox);

      expect(mockOnFilterChange).toHaveBeenCalledWith('clubs', []);
    });

    it('should handle multiple club selections', () => {
      const filtersWithClub: FilterCriteria = {
        ...defaultFilters,
        clubs: ['Chess Club'],
      };

      render(
        <FilterPanel
          filters={filtersWithClub}
          onFilterChange={mockOnFilterChange}
          onClearFilters={mockOnClearFilters}
          availableClubs={availableClubs}
          activeFilterCount={1}
        />
      );

      const toggleButton = screen.getByRole('button', { name: /expand filters/i });
      fireEvent.click(toggleButton);

      const dramaCheckbox = screen.getByRole('checkbox', { name: 'Filter by Drama Club' });
      fireEvent.click(dramaCheckbox);

      expect(mockOnFilterChange).toHaveBeenCalledWith('clubs', ['Chess Club', 'Drama Club']);
    });

    it('should call onFilterChange when performance filter is changed', () => {
      render(
        <FilterPanel
          filters={defaultFilters}
          onFilterChange={mockOnFilterChange}
          onClearFilters={mockOnClearFilters}
          availableClubs={availableClubs}
          activeFilterCount={0}
        />
      );

      const toggleButton = screen.getByRole('button', { name: /expand filters/i });
      fireEvent.click(toggleButton);

      const yesRadio = screen.getByRole('radio', { name: 'Performance: Yes' });
      fireEvent.click(yesRadio);

      expect(mockOnFilterChange).toHaveBeenCalledWith('hasPerformance', true);
    });

    it('should call onFilterChange when booth filter is changed', () => {
      render(
        <FilterPanel
          filters={defaultFilters}
          onFilterChange={mockOnFilterChange}
          onClearFilters={mockOnClearFilters}
          availableClubs={availableClubs}
          activeFilterCount={0}
        />
      );

      const toggleButton = screen.getByRole('button', { name: /expand filters/i });
      fireEvent.click(toggleButton);

      const noRadio = screen.getByRole('radio', { name: 'Booth: No' });
      fireEvent.click(noRadio);

      expect(mockOnFilterChange).toHaveBeenCalledWith('hasBooth', false);
    });

    it('should call onFilterChange when shirt collection filter is changed', () => {
      render(
        <FilterPanel
          filters={defaultFilters}
          onFilterChange={mockOnFilterChange}
          onClearFilters={mockOnClearFilters}
          availableClubs={availableClubs}
          activeFilterCount={0}
        />
      );

      const toggleButton = screen.getByRole('button', { name: /expand filters/i });
      fireEvent.click(toggleButton);

      const collectedRadio = screen.getByRole('radio', { name: 'Shirt: Collected' });
      fireEvent.click(collectedRadio);

      expect(mockOnFilterChange).toHaveBeenCalledWith('shirtCollected', true);
    });

    it('should call onFilterChange when meal collection filter is changed', () => {
      render(
        <FilterPanel
          filters={defaultFilters}
          onFilterChange={mockOnFilterChange}
          onClearFilters={mockOnClearFilters}
          availableClubs={availableClubs}
          activeFilterCount={0}
        />
      );

      const toggleButton = screen.getByRole('button', { name: /expand filters/i });
      fireEvent.click(toggleButton);

      const notCollectedRadio = screen.getByRole('radio', { name: 'Meal: Not Collected' });
      fireEvent.click(notCollectedRadio);

      expect(mockOnFilterChange).toHaveBeenCalledWith('mealCollected', false);
    });

    it('should reset boolean filter to null when "All" is selected', () => {
      const filtersWithPerformance: FilterCriteria = {
        ...defaultFilters,
        hasPerformance: true,
      };

      render(
        <FilterPanel
          filters={filtersWithPerformance}
          onFilterChange={mockOnFilterChange}
          onClearFilters={mockOnClearFilters}
          availableClubs={availableClubs}
          activeFilterCount={1}
        />
      );

      const toggleButton = screen.getByRole('button', { name: /expand filters/i });
      fireEvent.click(toggleButton);

      const allRadio = screen.getByRole('radio', { name: 'Performance: All' });
      fireEvent.click(allRadio);

      expect(mockOnFilterChange).toHaveBeenCalledWith('hasPerformance', null);
    });
  });

  describe('Badge Removal', () => {
    it('should remove club filter when badge remove button is clicked', () => {
      const filtersWithClub: FilterCriteria = {
        ...defaultFilters,
        clubs: ['Chess Club'],
      };

      render(
        <FilterPanel
          filters={filtersWithClub}
          onFilterChange={mockOnFilterChange}
          onClearFilters={mockOnClearFilters}
          availableClubs={availableClubs}
          activeFilterCount={1}
        />
      );

      const removeButton = screen.getByRole('button', { name: 'Remove Club: Chess Club filter' });
      fireEvent.click(removeButton);

      expect(mockOnFilterChange).toHaveBeenCalledWith('clubs', []);
    });

    it('should remove only the clicked club when multiple clubs are selected', () => {
      const filtersWithClubs: FilterCriteria = {
        ...defaultFilters,
        clubs: ['Chess Club', 'Drama Club'],
      };

      render(
        <FilterPanel
          filters={filtersWithClubs}
          onFilterChange={mockOnFilterChange}
          onClearFilters={mockOnClearFilters}
          availableClubs={availableClubs}
          activeFilterCount={2}
        />
      );

      const removeButton = screen.getByRole('button', { name: 'Remove Club: Chess Club filter' });
      fireEvent.click(removeButton);

      expect(mockOnFilterChange).toHaveBeenCalledWith('clubs', ['Drama Club']);
    });

    it('should reset performance filter when badge remove button is clicked', () => {
      const filtersWithPerformance: FilterCriteria = {
        ...defaultFilters,
        hasPerformance: true,
      };

      render(
        <FilterPanel
          filters={filtersWithPerformance}
          onFilterChange={mockOnFilterChange}
          onClearFilters={mockOnClearFilters}
          availableClubs={availableClubs}
          activeFilterCount={1}
        />
      );

      const removeButton = screen.getByRole('button', { name: 'Remove Performance: Yes filter' });
      fireEvent.click(removeButton);

      expect(mockOnFilterChange).toHaveBeenCalledWith('hasPerformance', null);
    });

    it('should reset booth filter when badge remove button is clicked', () => {
      const filtersWithBooth: FilterCriteria = {
        ...defaultFilters,
        hasBooth: false,
      };

      render(
        <FilterPanel
          filters={filtersWithBooth}
          onFilterChange={mockOnFilterChange}
          onClearFilters={mockOnClearFilters}
          availableClubs={availableClubs}
          activeFilterCount={1}
        />
      );

      const removeButton = screen.getByRole('button', { name: 'Remove Booth: No filter' });
      fireEvent.click(removeButton);

      expect(mockOnFilterChange).toHaveBeenCalledWith('hasBooth', null);
    });

    it('should reset shirt collection filter when badge remove button is clicked', () => {
      const filtersWithShirt: FilterCriteria = {
        ...defaultFilters,
        shirtCollected: true,
      };

      render(
        <FilterPanel
          filters={filtersWithShirt}
          onFilterChange={mockOnFilterChange}
          onClearFilters={mockOnClearFilters}
          availableClubs={availableClubs}
          activeFilterCount={1}
        />
      );

      const removeButton = screen.getByRole('button', { name: 'Remove Shirt: Collected filter' });
      fireEvent.click(removeButton);

      expect(mockOnFilterChange).toHaveBeenCalledWith('shirtCollected', null);
    });

    it('should reset meal collection filter when badge remove button is clicked', () => {
      const filtersWithMeal: FilterCriteria = {
        ...defaultFilters,
        mealCollected: false,
      };

      render(
        <FilterPanel
          filters={filtersWithMeal}
          onFilterChange={mockOnFilterChange}
          onClearFilters={mockOnClearFilters}
          availableClubs={availableClubs}
          activeFilterCount={1}
        />
      );

      const removeButton = screen.getByRole('button', { name: 'Remove Meal: Not Collected filter' });
      fireEvent.click(removeButton);

      expect(mockOnFilterChange).toHaveBeenCalledWith('mealCollected', null);
    });
  });

  describe('Accessibility', () => {
    it('should have aria-expanded attribute on toggle button', () => {
      render(
        <FilterPanel
          filters={defaultFilters}
          onFilterChange={mockOnFilterChange}
          onClearFilters={mockOnClearFilters}
          availableClubs={availableClubs}
          activeFilterCount={0}
        />
      );

      const toggleButton = screen.getByRole('button', { name: /expand filters/i });
      expect(toggleButton).toHaveAttribute('aria-expanded');
    });

    it('should have aria-controls attribute on toggle button', () => {
      render(
        <FilterPanel
          filters={defaultFilters}
          onFilterChange={mockOnFilterChange}
          onClearFilters={mockOnClearFilters}
          availableClubs={availableClubs}
          activeFilterCount={0}
        />
      );

      const toggleButton = screen.getByRole('button', { name: /expand filters/i });
      expect(toggleButton).toHaveAttribute('aria-controls', 'filter-controls');
    });

    it('should have aria-label on filter count', () => {
      render(
        <FilterPanel
          filters={defaultFilters}
          onFilterChange={mockOnFilterChange}
          onClearFilters={mockOnClearFilters}
          availableClubs={availableClubs}
          activeFilterCount={3}
        />
      );

      const filterCount = screen.getByLabelText('3 active filters');
      expect(filterCount).toBeInTheDocument();
    });

    it('should have region role on filter badges', () => {
      const filtersWithClub: FilterCriteria = {
        ...defaultFilters,
        clubs: ['Chess Club'],
      };

      render(
        <FilterPanel
          filters={filtersWithClub}
          onFilterChange={mockOnFilterChange}
          onClearFilters={mockOnClearFilters}
          availableClubs={availableClubs}
          activeFilterCount={1}
        />
      );

      const badgesRegion = screen.getByRole('region', { name: 'Active filters' });
      expect(badgesRegion).toBeInTheDocument();
    });

    it('should have aria-label on badge remove buttons', () => {
      const filtersWithClub: FilterCriteria = {
        ...defaultFilters,
        clubs: ['Chess Club'],
      };

      render(
        <FilterPanel
          filters={filtersWithClub}
          onFilterChange={mockOnFilterChange}
          onClearFilters={mockOnClearFilters}
          availableClubs={availableClubs}
          activeFilterCount={1}
        />
      );

      const removeButton = screen.getByRole('button', { name: 'Remove Club: Chess Club filter' });
      expect(removeButton).toHaveAttribute('aria-label');
    });

    it('should have aria-label on club checkboxes', () => {
      render(
        <FilterPanel
          filters={defaultFilters}
          onFilterChange={mockOnFilterChange}
          onClearFilters={mockOnClearFilters}
          availableClubs={availableClubs}
          activeFilterCount={0}
        />
      );

      const toggleButton = screen.getByRole('button', { name: /expand filters/i });
      fireEvent.click(toggleButton);

      const checkbox = screen.getByRole('checkbox', { name: 'Filter by Chess Club' });
      expect(checkbox).toHaveAttribute('aria-label');
    });

    it('should have aria-label on radio buttons', () => {
      render(
        <FilterPanel
          filters={defaultFilters}
          onFilterChange={mockOnFilterChange}
          onClearFilters={mockOnClearFilters}
          availableClubs={availableClubs}
          activeFilterCount={0}
        />
      );

      const toggleButton = screen.getByRole('button', { name: /expand filters/i });
      fireEvent.click(toggleButton);

      const radio = screen.getByRole('radio', { name: 'Performance: Yes' });
      expect(radio).toHaveAttribute('aria-label');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty availableClubs array', () => {
      render(
        <FilterPanel
          filters={defaultFilters}
          onFilterChange={mockOnFilterChange}
          onClearFilters={mockOnClearFilters}
          availableClubs={[]}
          activeFilterCount={0}
        />
      );

      const toggleButton = screen.getByRole('button', { name: /expand filters/i });
      fireEvent.click(toggleButton);

      const noClubsMessage = screen.getByText('No clubs available');
      expect(noClubsMessage).toBeInTheDocument();
    });

    it('should handle very long club names', () => {
      const longClubName = 'A'.repeat(100);

      render(
        <FilterPanel
          filters={defaultFilters}
          onFilterChange={mockOnFilterChange}
          onClearFilters={mockOnClearFilters}
          availableClubs={[longClubName]}
          activeFilterCount={0}
        />
      );

      const toggleButton = screen.getByRole('button', { name: /expand filters/i });
      fireEvent.click(toggleButton);

      const checkbox = screen.getByRole('checkbox', { name: `Filter by ${longClubName}` });
      expect(checkbox).toBeInTheDocument();
    });

    it('should handle rapid filter changes', () => {
      render(
        <FilterPanel
          filters={defaultFilters}
          onFilterChange={mockOnFilterChange}
          onClearFilters={mockOnClearFilters}
          availableClubs={availableClubs}
          activeFilterCount={0}
        />
      );

      const toggleButton = screen.getByRole('button', { name: /expand filters/i });
      fireEvent.click(toggleButton);

      const checkbox1 = screen.getByRole('checkbox', { name: 'Filter by Chess Club' });
      const checkbox2 = screen.getByRole('checkbox', { name: 'Filter by Drama Club' });
      const checkbox3 = screen.getByRole('checkbox', { name: 'Filter by Robotics Club' });

      fireEvent.click(checkbox1);
      fireEvent.click(checkbox2);
      fireEvent.click(checkbox3);

      expect(mockOnFilterChange).toHaveBeenCalledTimes(3);
    });

    it('should maintain state when toggling panel', () => {
      const filtersWithClub: FilterCriteria = {
        ...defaultFilters,
        clubs: ['Chess Club'],
      };

      render(
        <FilterPanel
          filters={filtersWithClub}
          onFilterChange={mockOnFilterChange}
          onClearFilters={mockOnClearFilters}
          availableClubs={availableClubs}
          activeFilterCount={1}
        />
      );

      const toggleButton = screen.getByRole('button', { name: /expand filters/i });
      
      // Expand
      fireEvent.click(toggleButton);
      const checkbox = screen.getByRole('checkbox', { name: 'Filter by Chess Club' }) as HTMLInputElement;
      expect(checkbox.checked).toBe(true);

      // Collapse
      fireEvent.click(toggleButton);

      // Expand again
      fireEvent.click(toggleButton);
      const checkboxAgain = screen.getByRole('checkbox', { name: 'Filter by Chess Club' }) as HTMLInputElement;
      expect(checkboxAgain.checked).toBe(true);
    });

    it('should handle activeFilterCount of 0', () => {
      render(
        <FilterPanel
          filters={defaultFilters}
          onFilterChange={mockOnFilterChange}
          onClearFilters={mockOnClearFilters}
          availableClubs={availableClubs}
          activeFilterCount={0}
        />
      );

      const clearButton = screen.queryByRole('button', { name: 'Clear all filters' });
      expect(clearButton).toBeNull();
    });

    it('should handle very large activeFilterCount', () => {
      render(
        <FilterPanel
          filters={defaultFilters}
          onFilterChange={mockOnFilterChange}
          onClearFilters={mockOnClearFilters}
          availableClubs={availableClubs}
          activeFilterCount={999}
        />
      );

      const filterCount = screen.getByText('(999)');
      expect(filterCount).toBeInTheDocument();
    });
  });
});
